import { useState, useEffect } from "react";
import { User, Target, Medal, TrendUp, Gear, Bell, ShieldCheck, Question, SignOut, CaretRight, Crown, Calendar, PencilSimple, FloppyDisk, X, Plus, Trash } from '@phosphor-icons/react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWeightProgress, deleteWeightProgress} from "../services/progressService";
import ProgressChart from "../components/ProgressChart";
import AddWeightModal from "../components/AddWeightModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const [weightData, setWeightData] = useState([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [chartPeriod, setChartPeriod] = useState(30);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const [showAllWeights, setShowAllWeights] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadProgressData();
    }
  }, [chartPeriod, profile]);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setEditData({
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        date_of_birth: data?.date_of_birth || "",
        height: data?.height || "",
        current_weight: data?.current_weight || "",
        target_weight: data?.target_weight || "",
        fitness_goal: data?.fitness_goal || "",
        activity_level: data?.activity_level || "",
      });
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressData = async () => {
    setLoadingProgress(true);
    try {
      const weights = await getWeightProgress(chartPeriod);
      setWeightData(weights);
    } catch (error) {
      console.error("Erreur chargement progression:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleDeleteWeight = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteWeightProgress(id);
      await loadProgressData();
      await loadProfile();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  // Fonction pour paginer l'historique
  const getPaginatedWeights = () => {
    const reversedData = [...weightData].reverse();
    if (showAllWeights) {
      const startIndex = (historyPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return reversedData.slice(startIndex, endIndex);
    }
    return reversedData.slice(0, 3);
  };

  const totalPages = Math.ceil(weightData.length / ITEMS_PER_PAGE);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (profile) {
      setEditData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth || "",
        height: profile.height || "",
        current_weight: profile.current_weight || "",
        target_weight: profile.target_weight || "",
        fitness_goal: profile.fitness_goal || "",
        activity_level: profile.activity_level || "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(editData);
      await loadProfile();
      setShowModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleWeightSaved = () => {
    loadProgressData();
    loadProfile();
  };

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user?.user_metadata?.full_name || "Utilisateur";
  const email = user?.email || "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const fitnessGoalLabels = {
    lose_weight: "Perte de poids",
    gain_muscle: "Prise de masse",
    maintain: "Maintien",
    get_fit: "Remise en forme",
  };

  const goalLabel = profile?.fitness_goal
    ? fitnessGoalLabels[profile.fitness_goal]
    : "Non défini";

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        className="page-header"
        style={{
          // Fond sombre + halo lime en second plan, au lieu de l'aplat lime.
          background:
            "radial-gradient(120% 90% at 85% -10%, rgba(212,255,63,0.16) 0%, transparent 60%), var(--gradient-surface)",
          color: "var(--text-primary)",
          borderBottom: "1px solid var(--accent-line)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "800",
              color: "var(--ink)",
              flexShrink: 0,
              boxShadow: "var(--glow-accent)",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: "6px" }}>{fullName}</h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {email}
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="icon-btn icon-btn-ghost"
            title="Modifier mon profil"
          >
            <PencilSimple size={20} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            marginTop: "20px",
            padding: "18px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--accent)",
                letterSpacing: "-0.5px",
                marginBottom: "4px",
              }}
            >
              {profile?.height || "-"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Taille (cm)
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
              borderRight: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--accent)",
                letterSpacing: "-0.5px",
                marginBottom: "4px",
              }}
            >
              {profile?.current_weight || "-"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Poids (kg)
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--accent)",
                letterSpacing: "-0.5px",
                marginBottom: "4px",
              }}
            >
              {profile?.target_weight || "-"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Objectif (kg)
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div
          className="card glow-card glow-accent"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <div className="card-body">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Crown size={24} style={{ color: "var(--accent)" }} />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Premium
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    opacity: "0.9",
                    fontWeight: "500",
                    lineHeight: "1.5",
                  }}
                >
                  Accès illimité à tous les programmes et fonctionnalités avancées
                </p>
              </div>
            </div>
            <button
              className="btn"
            >
              Passer à Premium
            </button>
          </div>
        </div>

        <div className="section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "100px",
            }}
          >
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Évolution du poids
            </h2>
            <button
              onClick={() => setShowAddWeight(true)}
              className="btn-weight btn-weight-primary"
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              <Plus weight="bold" size={16} />
              Ajouter
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px",
                  padding: "4px",
                  background: "var(--bg-secondary)",
                  borderRadius: "12px",
                }}
              >
                <button
                  onClick={() => setChartPeriod(7)}
                  className={`seg-btn ${chartPeriod === 7 ? "active" : ""}`}
                >
                  7 jours
                </button>
                <button
                  onClick={() => setChartPeriod(30)}
                  className={`seg-btn ${chartPeriod === 30 ? "active" : ""}`}
                >
                  30 jours
                </button>
                <button
                  onClick={() => setChartPeriod(90)}
                  className={`seg-btn ${chartPeriod === 90 ? "active" : ""}`}
                >
                  3 mois
                </button>
              </div>

              {loadingProgress ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <>
                  <ProgressChart
                    data={weightData}
                    type="weight"
                    targetWeight={profile?.target_weight}
                  />

                  {/* HISTORIQUE AVEC PAGINATION */}
                  {weightData.length > 0 && (
                    <div
                      style={{
                        marginTop: "24px",
                        paddingTop: "24px",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            margin: 0,
                          }}
                        >
                          Historique ({weightData.length})
                        </h3>
                        {weightData.length > 3 && !showAllWeights && (
                          <button
                            onClick={() => {
                              setShowAllWeights(true);
                              setHistoryPage(1);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--primary)",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.background =
                                "var(--bg-secondary)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
                          >
                            Voir tout →
                          </button>
                        )}
                        {showAllWeights && (
                          <button
                            onClick={() => {
                              setShowAllWeights(false);
                              setHistoryPage(1);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-secondary)",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.background =
                                "var(--bg-secondary)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
                          >
                            ← Réduire
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {getPaginatedWeights().map((entry) => (
                          <div
                            key={entry.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "var(--bg-secondary)",
                              borderRadius: "12px",
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "800",
                                  color: "var(--text-primary)",
                                  marginBottom: "4px",
                                }}
                              >
                                {entry.weight} kg
                              </div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "var(--text-secondary)",
                                  fontWeight: "500",
                                }}
                              >
                                {/* FIX: Vérifier que la date est valide avant de formater */}
                                {entry.recorded_at ? (
                                  format(new Date(entry.recorded_at), "d MMMM yyyy", {
                                    locale: fr,
                                  })
                                ) : (
                                  "Date inconnue"
                                )}
                              </div>
                              {entry.notes && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--text-tertiary)",
                                    marginTop: "4px",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {entry.notes}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteWeight(entry.id)}
                              disabled={deletingId === entry.id}
                              style={{
                                padding: "8px",
                                border: "none",
                                background: "transparent",
                                color: "var(--danger)",
                                borderRadius: "8px",
                                cursor:
                                  deletingId === entry.id ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s",
                                opacity: deletingId === entry.id ? 0.5 : 1,
                              }}
                              onMouseOver={(e) => {
                                if (deletingId !== entry.id) {
                                  e.currentTarget.style.background =
                                    "rgba(239, 68, 68, 0.1)";
                                }
                              }}
                              onMouseOut={(e) => {
                                if (deletingId !== entry.id) {
                                  e.currentTarget.style.background = "transparent";
                                }
                              }}
                            >
                              {deletingId === entry.id ? (
                                <div
                                  className="spinner"
                                  style={{ width: "16px", height: "16px" }}
                                ></div>
                              ) : (
                                <Trash size={16} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {showAllWeights && totalPages > 1 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "16px",
                          }}
                        >
                          <button
                            onClick={() =>
                              setHistoryPage((p) => Math.max(1, p - 1))
                            }
                            disabled={historyPage === 1}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              background:
                                historyPage === 1
                                  ? "var(--bg-tertiary)"
                                  : "white",
                              borderRadius: "8px",
                              cursor:
                                historyPage === 1 ? "not-allowed" : "pointer",
                              fontSize: "14px",
                              fontWeight: "700",
                              color:
                                historyPage === 1
                                  ? "var(--text-tertiary)"
                                  : "var(--text-primary)",
                              transition: "all 0.2s",
                            }}
                          >
                            ← Préc.
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((pageNum) => {
                              if (totalPages <= 7) return true;
                              if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                Math.abs(pageNum - historyPage) <= 1
                              ) {
                                return true;
                              }
                              return false;
                            })
                            .map((pageNum, index, array) => {
                              if (
                                index > 0 &&
                                array[index - 1] !== pageNum - 1
                              ) {
                                return (
                                  <>
                                    <span
                                      key={`ellipsis-${pageNum}`}
                                      style={{
                                        padding: "0 4px",
                                        color: "var(--text-tertiary)",
                                      }}
                                    >
                                      ...
                                    </span>
                                    <button
                                      key={pageNum}
                                      onClick={() => setHistoryPage(pageNum)}
                                      style={{
                                        padding: "8px 12px",
                                        border: "none",
                                        background:
                                          pageNum === historyPage
                                            ? "var(--primary)"
                                            : "white",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: "700",
                                        color:
                                          pageNum === historyPage
                                            ? "white"
                                            : "var(--text-primary)",
                                        transition: "all 0.2s",
                                      }}
                                    >
                                      {pageNum}
                                    </button>
                                  </>
                                );
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setHistoryPage(pageNum)}
                                  style={{
                                    padding: "8px 12px",
                                    border: "none",
                                    background:
                                      pageNum === historyPage
                                        ? "var(--primary)"
                                        : "white",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    color:
                                      pageNum === historyPage
                                        ? "white"
                                        : "var(--text-primary)",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                          <button
                            onClick={() =>
                              setHistoryPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={historyPage === totalPages}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              background:
                                historyPage === totalPages
                                  ? "var(--bg-tertiary)"
                                  : "white",
                              borderRadius: "8px",
                              cursor:
                                historyPage === totalPages
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "14px",
                              fontWeight: "700",
                              color:
                                historyPage === totalPages
                                  ? "var(--text-tertiary)"
                                  : "var(--text-primary)",
                              transition: "all 0.2s",
                            }}
                          >
                            Suiv. →
                          </button>
                        </div>
                      )}

                      {showAllWeights && (
                        <div
                          style={{
                            textAlign: "center",
                            marginTop: "12px",
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                            fontWeight: "600",
                          }}
                        >
                          Page {historyPage} sur {totalPages} •{" "}
                          {weightData.length} entrée
                          {weightData.length > 1 ? "s" : ""} au total
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Paramètres</h2>

          <div className="card">
            <div className="card-body" style={{ padding: "0" }}>
              <div 
                className="menu-item"
                onClick={() => navigate('/settings')}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)",
                    }}
                  >
                    <Gear size={20} />
                  </div>
                  <span>Paramètres généraux</span>
                </div>
                <CaretRight weight="bold" size={20} color="var(--text-tertiary)" />
              </div>

              <div className="menu-item">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3B82F6",
                    }}
                  >
                    <Bell size={20} />
                  </div>
                  <span>Notifications</span>
                </div>
                <CaretRight weight="bold" size={20} color="var(--text-tertiary)" />
              </div>

              <div 
                className="menu-item"
                onClick={() => navigate('/privacy')}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10B981",
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <span>Confidentialité & Sécurité</span>
                </div>
                <CaretRight weight="bold" size={20} color="var(--text-tertiary)" />
              </div>

              <div className="menu-item" style={{ borderBottom: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--warning)",
                    }}
                  >
                    <Question size={20} />
                  </div>
                  <span>Aide & Support</span>
                </div>
                <CaretRight weight="bold" size={20} color="var(--text-tertiary)" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{
            color: "var(--danger)",
            borderColor: "var(--danger)",
            marginBottom: "20px",
          }}
        >
          <SignOut size={20} />
          Se déconnecter
        </button>

        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: "13px",
            color: "var(--text-tertiary)",
            fontWeight: "500",
          }}
        >
          Version 2.1.0 • FitTrack © 2025
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Modifier mon profil</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X weight="bold" size={24} />
              </button>
            </div>

            <div className="edit-modal-body">
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={editData.first_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={editData.last_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={editData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Taille (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={editData.height}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poids actuel (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="current_weight"
                  value={editData.current_weight}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Objectif de poids (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="target_weight"
                  value={editData.target_weight}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Objectif fitness</label>
                <select
                  name="fitness_goal"
                  value={editData.fitness_goal}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  <option value="lose_weight">Perte de poids</option>
                  <option value="gain_muscle">Prise de masse</option>
                  <option value="maintain">Maintien</option>
                  <option value="get_fit">Remise en forme</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Niveau d'activité</label>
                <select
                  name="activity_level"
                  value={editData.activity_level}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  <option value="sedentary">Sédentaire</option>
                  <option value="light">Légèrement actif</option>
                  <option value="moderate">Modérément actif</option>
                  <option value="very_active">Très actif</option>
                  <option value="extra_active">Extrêmement actif</option>
                </select>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button
                onClick={handleCloseModal}
                className="btn btn-outline"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div
                      className="spinner"
                      style={{ width: "16px", height: "16px" }}
                    ></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FloppyDisk size={20} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddWeight && (
        <AddWeightModal
          onClose={() => setShowAddWeight(false)}
          onSave={handleWeightSaved}
          currentWeight={profile?.current_weight}
        />
      )}
    </div>
  );
}

export default Profile;
