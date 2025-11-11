import { useState } from 'react';
import { X, Save, Scale } from 'lucide-react';
import { saveWeightProgress } from '../services/progressService';

function AddWeightModal({ onClose, onSave, currentWeight }) {
  const [weight, setWeight] = useState(currentWeight || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await saveWeightProgress(parseFloat(weight), notes);
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Scale size={20} />
            </div>
            <h2>Enregistrer mon poids</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="edit-modal-body">
            <div className="form-group">
              <label className="form-label">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="form-input"
                placeholder="70.5"
                required
                autoFocus
                style={{ fontSize: '18px', fontWeight: '600' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="Comment vous sentez-vous ?"
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="edit-modal-footer">
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={saving || !weight}
            >
              {saving ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWeightModal;
