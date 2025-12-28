import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "../config/supabase";
import {
  getActiveProgram,
  createProgram,
  getProgramDays,
  addDay,
  addExercise,
  deleteExercise,
  deleteDay,
  updateDay,
  getAllExercises,
  addExerciseHistory,
  getExerciseSets,
  updateExerciseSets
} from "../services/exerciceService";
import AddExerciseModal from "../components/AddExerciseModal";
import EditExerciseModal from "../components/EditExerciseModal";
import ExerciseHistoryModal from "../components/ExerciseHistoryModal";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function Training() {
  const [program, setProgram] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingExercise, setDeletingExercise] = useState(null);

  // Modals
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [showNewDay, setShowNewDay] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // États pour l'historique
  const [showHistory, setShowHistory] = useState(false);
  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  
  // États pour le modal d'édition
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  // Forms
  const [programName, setProgramName] = useState("");
  const [dayName, setDayName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("10-12");

  const [editingDay, setEditingDay] = useState(null);
  const [editDayName, setEditDayName] = useState("");
  const [editDayOfWeek, setEditDayOfWeek] = useState(1);
  const [deletingDay, setDeletingDay] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else {
      setLoading(false);
    }
  }

  async function loadData() {
    setLoading(true);
    const prog = await getActiveProgram(userId);
    setProgram(prog);
    if (prog) {
      const programDays = await getProgramDays(prog.id);
      
      // Charger les sets pour chaque exercice
      for (const day of programDays) {
        if (day.exercises && day.exercises.length > 0) {
          for (const exercise of day.exercises) {
            const sets = await getExerciseSets(exercise.id);
            exercise.sets = sets;
          }
        }
      }
      
      setDays(programDays);
    }
    setLoading(false);
  }

  async function handleCreateProgram(e) {
    e.preventDefault();
    await createProgram(userId, programName);
    setProgramName("");
    setShowNewProgram(false);
    loadData();
  }

  async function handleAddDay(e) {
    e.preventDefault();
    await addDay(program.id, dayOfWeek, dayName);
    setDayName("");
    setDayOfWeek(1);
    setShowNewDay(false);
    loadData();
  }

  async function handleAddExercise(exerciseId, setsArray, restSeconds, notes) {
    // Récupérer le nom de l'exercice depuis la bibliothèque
    const exercises = await getAllExercises(userId);
    const exercise = exercises.find(ex => ex.id === exerciseId);
    
    if (exercise) {
      // Ajouter l'exercice avec les sets individuels
      await addExercise(selectedDayId, exercise.name, setsArray);
      
      // Enregistrer dans l'historique chaque set avec un poids
      if (userId && setsArray.length > 0) {
        for (const set of setsArray) {
          if (set.weight && set.weight > 0) {
            await addExerciseHistory(
              userId,
              exercise.name,
              set.weight,
              set.weight_unit,
              1, // 1 série à la fois
              set.reps,
              notes
            );
          }
        }
      }
      
      setShowNewExercise(false);
      setSelectedDayId(null);
      loadData();
    }
  }

  async function handleUpdateExercise(exerciseId, sets, deletedSetIds) {
    try {
      await updateExerciseSets(exerciseId, sets, deletedSetIds);
      setShowEditModal(false);
      setEditingExercise(null);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de l\'exercice');
    }
  }

  async function handleDeleteExercise(exerciseId) {
    if (confirm("Supprimer cet exercice ?")) {
      setDeletingExercise(exerciseId);
      await deleteExercise(exerciseId);
      await loadData();
      setDeletingExercise(null);
    }
  }

  async function handleUpdateDay(e) {
    e.preventDefault();
    await updateDay(editingDay.id, editDayName, editDayOfWeek);
    setEditingDay(null);
    setEditDayName("");
    setEditDayOfWeek(1);
    loadData();
  }

  async function handleDeleteDay(dayId) {
    if (confirm("Supprimer ce jour et tous ses exercices ?")) {
      setDeletingDay(dayId);
      await deleteDay(dayId);
      await loadData();
      setDeletingDay(null);
    }
  }

  function openEditDay(day) {
    setEditingDay(day);
    setEditDayName(day.name);
    setEditDayOfWeek(day.day_of_week);
  }

  // Retourne le jour de la semaine (0 = Lundi, 6 = Dimanche)
  const getTodayDayOfWeek = () => {
    const day = new Date().getDay();
    // Convertir de 0=Dimanche à 0=Lundi
    return day === 0 ? 6 : day - 1;
  };

  const getTotalExercises = () => {
    return days.reduce((total, day) => total + (day.exercises?.length || 0), 0);
  };

  const DaySection = ({ day }) => {
    const hasExercises = day.exercises && day.exercises.length > 0;
    const isToday = day.day_of_week === getTodayDayOfWeek();

    return (
      <div
        className="section"
        style={{
          opacity: deletingDay === day.id ? 0.5 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Bouton chevron pour dérouler/cacher */}
            <button
              onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease",
                transform: expandedDay === day.id ? "rotate(90deg)" : "rotate(0deg)",
              }}
              title={expandedDay === day.id ? "Cacher les exercices" : "Afficher les exercices"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <h2 className="section-title">
              {isToday && <span style={{ marginRight: "8px" }}>⭐</span>}
              {DAYS[day.day_of_week]} - {day.name}
            </h2>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {/* Bouton Modifier */}
            <button
              onClick={() => openEditDay(day)}
              disabled={deletingDay === day.id}
              style={{
                background: "var(--surface-elevated)",
                color: "var(--text-secondary)",
                border: "none",
                borderRadius: "12px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--surface-elevated)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            {/* Bouton Supprimer */}
            <button
              onClick={() => handleDeleteDay(day.id)}
              disabled={deletingDay === day.id}
              style={{
                background: "transparent",
                color: "#EF4444",
                border: "none",
                borderRadius: "12px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                if (deletingDay !== day.id) {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                }
              }}
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {deletingDay === day.id ? (
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid currentColor",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              ) : (
                <Trash2 size={18} />
              )}
            </button>

            {/* Bouton Ajouter exercice */}
            <button
              onClick={() => {
                setSelectedDayId(day.id);
                setShowNewExercise(true);
              }}
              disabled={deletingDay === day.id}
              style={{
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Exercices - Affichés seulement si le jour est déplié */}
        {expandedDay === day.id && (
          <>
            {hasExercises ? (
              <div className="card">
                <div className="card-body" style={{ padding: "0" }}>
                  {day.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="list-item"
                  style={{
                    position: "relative",
                    transition: "all 0.2s ease",
                    opacity: deletingExercise === exercise.id ? 0.5 : 1,
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    {/* Gauche : Numéro + Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                      {/* Numéro */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "var(--primary)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Info exercice */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: "16px", 
                          fontWeight: "700",
                          marginBottom: "8px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {exercise.exercise_name}
                        </h3>
                        
                        {/* Afficher les sets individuels si disponibles */}
                        {Array.isArray(exercise.sets) && exercise.sets.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {exercise.sets.map((set, setIndex) => (
                              <div key={set.id} style={{
                                fontSize: "13px",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}>
                                <span style={{ 
                                  fontWeight: "600",
                                  color: "var(--text-primary)",
                                  minWidth: "50px"
                                }}>
                                  Set {set.set_number}:
                                </span>
                                <span style={{ fontWeight: "600" }}>
                                  {set.reps} reps
                                </span>
                                {set.weight && (
                                  <>
                                    <span style={{ opacity: 0.5 }}>×</span>
                                    <span style={{ 
                                      color: "var(--primary)", 
                                      fontWeight: "700"
                                    }}>
                                      {parseFloat(set.weight) % 1 === 0 
                                        ? parseFloat(set.weight) 
                                        : parseFloat(set.weight).toFixed(2)
                                      } {set.weight_unit}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Pas de sets enregistrés
                          <div style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            fontStyle: "italic"
                          }}>
                            Aucune série enregistrée
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Droite : Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {/* Bouton Historique */}
                      <button
                        onClick={() => {
                          setSelectedExerciseForHistory(exercise.exercise_name);
                          setShowHistory(true);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--primary)",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "var(--primary-bg)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                        title="Voir l'historique"
                      >
                        <BarChart3 size={18} />
                      </button>

                      {/* Bouton Modifier */}
                      <button
                        onClick={() => {
                          setEditingExercise(exercise);
                          setShowEditModal(true);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "var(--surface-elevated)";
                          e.currentTarget.style.color = "var(--text-primary)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                        title="Modifier l'exercice"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        disabled={deletingExercise === exercise.id}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                          opacity: deletingExercise === exercise.id ? 0.5 : 1,
                        }}
                        onMouseOver={(e) => {
                          if (deletingExercise !== exercise.id) {
                            e.currentTarget.style.background =
                              "rgba(239, 68, 68, 0.1)";
                          }
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                        title="Supprimer"
                      >
                        {deletingExercise === exercise.id ? (
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "2px solid currentColor",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "spin 0.6s linear infinite",
                            }}
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: "600",
              background: "var(--surface)",
              borderRadius: "16px",
              border: "2px dashed var(--border-light)",
            }}
          >
            Aucun exercice ajouté
          </div>
        )}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page">
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--border-light)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ color: "var(--text-secondary)", fontWeight: "600" }}>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Entraînements</h1>
          <p className="subtitle">Créez votre programme personnalisé</p>
        </div>

        <div className="page-content">
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "var(--surface)",
              borderRadius: "20px",
              border: "2px dashed var(--border-light)",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>💪</div>
            <h2
              style={{
                marginBottom: "12px",
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--text-primary)",
              }}
            >
              Aucun programme actif
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "32px",
                fontWeight: "600",
              }}
            >
              Commencez par créer votre premier programme d'entraînement
            </p>
            <button className="btn" onClick={() => setShowNewProgram(true)}>
              <Plus size={20} />
              Créer un programme
            </button>
          </div>
        </div>

        {/* Modal Nouveau Programme */}
        {showNewProgram && (
          <div
            className="modal-overlay"
            onClick={() => setShowNewProgram(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginBottom: "20px" }}>Nouveau programme</h2>
              <form onSubmit={handleCreateProgram}>
                <input
                  type="text"
                  placeholder="Nom du programme (ex: Split 5 jours)"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  required
                  autoFocus
                  style={{ marginBottom: "20px" }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowNewProgram(false)}
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Entraînements</h1>
        <p className="subtitle">Suivez votre programme d'entraînement</p>
      </div>

      <div className="page-content">
        {/* Hero Card - Programme actif */}
        <div
          className="hero-card"
          style={{
            background: "var(--gradient-primary)",
          }}
        >
          <div className="label">Programme actif</div>
          <div
            className="value"
            style={{ fontSize: "32px", marginBottom: "8px" }}
          >
            {program.name}
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  marginBottom: "4px",
                }}
              >
                {days.length}
              </div>
              <div
                style={{ fontSize: "13px", opacity: 0.9, fontWeight: "600" }}
              >
                Jours
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  marginBottom: "4px",
                }}
              >
                {getTotalExercises()}
              </div>
              <div
                style={{ fontSize: "13px", opacity: 0.9, fontWeight: "600" }}
              >
                Exercices
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Ajouter un jour */}
        <div className="section">
          <button
            className="btn"
            onClick={() => setShowNewDay(true)}
            style={{
              width: "100%",
              background: "var(--gradient-primary-light)",
            }}
          >
            <Plus size={20} />
            Ajouter un jour d'entraînement
          </button>
        </div>

        {/* Liste des jours */}
        {days.length > 0 ? (
          days.map((day) => <DaySection key={day.id} day={day} />)
        ) : (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: "600",
              background: "var(--surface)",
              borderRadius: "16px",
              border: "2px dashed var(--border-light)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
            <div
              style={{
                fontSize: "16px",
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Aucun jour d'entraînement
            </div>
            Ajoutez votre premier jour pour commencer
          </div>
        )}
      </div>

      {/* Modal Nouveau Jour */}
      {showNewDay && (
        <div className="modal-overlay" onClick={() => setShowNewDay(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>Nouveau jour</h2>
            <form onSubmit={handleAddDay}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                >
                  Jour de la semaine
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  style={{ marginBottom: "16px" }}
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                >
                  Nom du jour
                </label>
                <input
                  type="text"
                  placeholder="ex: Pectoraux / Triceps"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowNewDay(false)}
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Jour */}
      {editingDay && (
        <div className="modal-overlay" onClick={() => setEditingDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>Modifier le jour</h2>
            <form onSubmit={handleUpdateDay}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                >
                  Jour de la semaine
                </label>
                <select
                  value={editDayOfWeek}
                  onChange={(e) => setEditDayOfWeek(Number(e.target.value))}
                  style={{ marginBottom: "16px" }}
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                >
                  Nom du jour
                </label>
                <input
                  type="text"
                  placeholder="ex: Pectoraux / Triceps"
                  value={editDayName}
                  onChange={(e) => setEditDayName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingDay(null)}
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout d'exercice */}
      <AddExerciseModal
        isOpen={showNewExercise}
        onClose={() => {
          setShowNewExercise(false);
          setSelectedDayId(null);
        }}
        onAddExercise={handleAddExercise}
        userId={userId}
      />

      {/* Modal d'édition d'exercice */}
      <EditExerciseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingExercise(null);
        }}
        exercise={editingExercise}
        onSave={handleUpdateExercise}
      />

      {/* Modal d'historique */}
      <ExerciseHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        userId={userId}
        exerciseName={selectedExerciseForHistory}
      />
    </div>
  );
}

export default Training;
