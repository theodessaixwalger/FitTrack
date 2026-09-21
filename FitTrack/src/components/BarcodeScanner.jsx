import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Scanner, setZXingModuleOverrides } from '@yudiel/react-qr-scanner'
import zxingWasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'
import { X, Flashlight, Keyboard, ArrowClockwise, WarningCircle, CameraSlash } from '@phosphor-icons/react'

// Le décodeur (zxing en WebAssembly) est servi par l'app au lieu de jsDelivr,
// son emplacement par défaut. zxing-wasm est épinglé dans package.json : sa
// version doit rester celle qu'exige barcode-detector (npm ls zxing-wasm).
setZXingModuleOverrides({
  locateFile: (path, prefix) => (path.endsWith('.wasm') ? zxingWasmUrl : prefix + path),
})

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e']
const CONSTRAINTS = { facingMode: 'environment' }
const SCANNER_STYLES = {
  container: { width: '100%', height: '100%', aspectRatio: 'auto' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
}
// Viseur et lampe sont dessinés ici, aux couleurs de l'app
const SCANNER_COMPONENTS = { finder: false, torch: false, onOff: false, zoom: false }

const CAMERA_ERRORS = {
  'permission-denied': "Accès à la caméra refusé. Autorise-le dans Réglages › Safari › Caméra, ou saisis le code à la main.",
  'insecure-context': 'La caméra nécessite une connexion HTTPS.',
  'no-camera': 'Aucune caméra détectée sur cet appareil.',
  'in-use': 'La caméra est déjà utilisée par une autre app.',
}

const getVideoTrack = (scanner) => scanner?.getStream()?.getVideoTracks()[0] ?? null
const hasTorch = (scanner) => Boolean(getVideoTrack(scanner)?.getCapabilities?.().torch)

// Écran plein écran de scan. `onResult(code)` est appelé une fois par code
// détecté ou saisi ; le parent démonte le scanner en cas de succès, et une
// erreur levée par `onResult` est affichée avec un bouton « Réessayer ».
// La caméra est libérée au démontage et quand l'app passe en arrière-plan.
function BarcodeScanner({ onClose, onResult }) {
  const scannerRef = useRef(null)
  const busyRef = useRef(false)
  const onResultRef = useRef(onResult)
  const [status, setStatus] = useState('scanning') // 'scanning' | 'loading' | 'error'
  const [message, setMessage] = useState('')
  const [detectedCode, setDetectedCode] = useState('')
  const [cameraError, setCameraError] = useState(null)
  const [scannerKey, setScannerKey] = useState(0) // remonte <Scanner> pour repartir de zéro
  const [hidden, setHidden] = useState(() => document.hidden)
  const [torch, setTorch] = useState({ supported: false, on: false })
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    onResultRef.current = onResult
  })

  // iOS garde la caméra allumée en arrière-plan tant que le flux tourne
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // La lampe n'est exposée que par certains navigateurs (Chrome Android) :
  // Safari iOS ne la propose pas, le bouton reste alors masqué.
  useEffect(() => {
    const video = scannerRef.current?.getVideoElement()
    if (!video) return
    let timer
    const onPlaying = () => {
      // Nouveau flux (démarrage ou reprise après pause) : la lampe est éteinte
      setTorch({ supported: hasTorch(scannerRef.current), on: false })
      // Certaines caméras n'annoncent leurs capacités qu'après quelques centaines de ms
      clearTimeout(timer)
      timer = setTimeout(() => setTorch((t) => ({ ...t, supported: hasTorch(scannerRef.current) })), 600)
    }
    video.addEventListener('playing', onPlaying)
    return () => {
      video.removeEventListener('playing', onPlaying)
      clearTimeout(timer)
    }
  }, [scannerKey])

  const submit = useCallback(async (raw) => {
    if (busyRef.current) return
    busyRef.current = true
    setDetectedCode(String(raw).replace(/\D/g, ''))
    setStatus('loading')
    setMessage('')
    try {
      await onResultRef.current(raw)
    } catch (err) {
      setStatus('error')
      setMessage(err?.message || 'Erreur inattendue. Réessaie.')
    }
  }, [])

  const handleScan = useCallback((codes) => {
    const raw = codes?.[0]?.rawValue
    if (raw) submit(raw)
  }, [submit])

  const handleCameraError = useCallback((error) => {
    // Lecture vidéo interrompue par une pause ou un démontage : pas une vraie erreur
    if (error.kind === 'aborted') return
    setCameraError(CAMERA_ERRORS[error.kind] ?? 'Impossible de démarrer la caméra. Réessaie ou saisis le code à la main.')
    if (error.kind in CAMERA_ERRORS) setManualOpen(true)
  }, [])

  const retry = () => {
    busyRef.current = false
    setStatus('scanning')
    setMessage('')
    setDetectedCode('')
    setCameraError(null)
    setScannerKey((k) => k + 1)
  }

  const toggleTorch = async () => {
    const track = getVideoTrack(scannerRef.current)
    if (!track) return
    const next = !torch.on
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] })
      setTorch((t) => ({ ...t, on: next }))
    } catch {
      setTorch({ supported: false, on: false })
    }
  }

  const manualDigits = manualCode.replace(/\D/g, '')
  const manualValid = manualDigits.length >= 6 && manualDigits.length <= 14

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualValid || status === 'loading') return
    busyRef.current = false // une saisie manuelle remplace un éventuel échec précédent
    submit(manualDigits)
  }

  const paused = status !== 'scanning' || hidden || Boolean(cameraError)
  const frameState = cameraError || status === 'error' ? 'is-error' : status === 'loading' ? 'is-detected' : ''

  return createPortal(
    <div className="scanner-screen" role="dialog" aria-modal="true" aria-label="Scanner un code-barres">
      <div className="scanner-video">
        <Scanner
          key={scannerKey}
          ref={scannerRef}
          onScan={handleScan}
          onError={handleCameraError}
          formats={FORMATS}
          constraints={CONSTRAINTS}
          paused={paused}
          sound={false}
          components={SCANNER_COMPONENTS}
          styles={SCANNER_STYLES}
        />
      </div>

      <div className="scanner-overlay">
        <div className="scanner-topbar">
          <button type="button" className="icon-btn icon-btn-ghost scanner-icon-btn" onClick={onClose} aria-label="Fermer le scanner">
            <X weight="bold" size={20} />
          </button>
          <span className="scanner-title">Scanner un produit</span>
          {torch.supported && !paused ? (
            <button
              type="button"
              className={`icon-btn icon-btn-ghost scanner-icon-btn${torch.on ? ' is-accent' : ''}`}
              onClick={toggleTorch}
              aria-label={torch.on ? 'Éteindre la lampe' : 'Allumer la lampe'}
              aria-pressed={torch.on}
            >
              <Flashlight size={20} weight={torch.on ? 'fill' : 'duotone'} />
            </button>
          ) : (
            <span className="scanner-icon-spacer" />
          )}
        </div>

        <div className="scanner-stage">
          <div className={`scanner-frame ${frameState}`}>
            <span className="scanner-corner tl" />
            <span className="scanner-corner tr" />
            <span className="scanner-corner bl" />
            <span className="scanner-corner br" />
            {status === 'scanning' && !cameraError && <span className="scanner-line" />}
            {status === 'loading' && <span className="scanner-flash" />}
          </div>
          <p className="scanner-hint" aria-live="polite">
            {status === 'loading'
              ? <span className="scanner-code">{detectedCode}</span>
              : 'Centre le code-barres dans le cadre'}
          </p>
        </div>

        <div className="scanner-bottom">
          {status === 'loading' && (
            <div className="scanner-panel scanner-panel-row">
              <div className="spinner" />
              <span>Recherche du produit…</span>
            </div>
          )}

          {(status === 'error' || cameraError) && (
            <div className="scanner-panel">
              <div className="scanner-panel-message">
                {cameraError ? <CameraSlash size={20} /> : <WarningCircle size={20} />}
                <span>{cameraError || message}</span>
              </div>
              <button type="button" className="btn scanner-btn" onClick={retry}>
                <ArrowClockwise weight="bold" size={18} />
                Réessayer
              </button>
            </div>
          )}

          {status !== 'loading' && (manualOpen ? (
            <form className="scanner-panel" onSubmit={handleManualSubmit}>
              <label htmlFor="manual-barcode" className="scanner-label">Code-barres</label>
              <div className="scanner-manual-row">
                <input
                  id="manual-barcode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  autoComplete="off"
                  maxLength={18}
                  placeholder="3274080005003"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.replace(/[^\d ]/g, ''))}
                  className="search-field scanner-input"
                  autoFocus
                />
                <button type="submit" className="btn scanner-btn scanner-submit" disabled={!manualValid}>
                  Valider
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn btn-secondary scanner-btn" onClick={() => setManualOpen(true)}>
              <Keyboard size={18} />
              Saisir le code à la main
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default BarcodeScanner
