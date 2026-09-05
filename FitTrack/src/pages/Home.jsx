import { Plus, Pulse, TrendUp, Flame, Target, Medal } from '@phosphor-icons/react';
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";
import PersonalNote from "../components/PersonalNote";
import StreakIndicator from "../components/StreakIndicator";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

function Home() {
  const {
    dailyNutrition,
    loading,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    calculateProgress,
    getRemainingCalories,
  } = useNutrition();

  const navigate = useNavigate();

  // État pour stocker le nom et l'ID de l'utilisateur
  const [fullName, setFullName] = useState("utilisateur");
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Récupérer l'utilisateur connecté et son nom
  useEffect(() => {
    async function fetchUser() {
      try {
        // Récupérer l'utilisateur authentifié
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user) {
          setUserId(user.id);

          // Récupérer le profil de l'utilisateur
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (data?.full_name) {
            setFullName(data.full_name.split(" ")[0]);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, []);

  // Helper d'affichage : pourcentage borné pour les anneaux de progression
  const ringPct = (value, goal) =>
    goal > 0 ? Math.min((value / goal) * 100, 100) : 0;

  if (loading || loadingUser) {
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
            minHeight: "60vh",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "3px solid rgba(255,255,255,0.08)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div
            style={{
              color: "var(--text-tertiary)",
              fontWeight: "700",
              fontSize: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Bonjour, {fullName} 👋</h1>
          <p className="subtitle">
            Prêt à atteindre tes objectifs aujourd'hui ?
          </p>
        </div>
      </div>

      <div className="page-content bento">
        {/* Actions principales */}
        <div className="cta-row span-6">
          <button
            type="button"
            className="cta cta-primary"
            onClick={() => navigate("/nutrition")}
          >
            <Plus weight="bold" size={17} />
            Ajouter un repas
          </button>
          <button
            type="button"
            className="cta cta-ghost"
            onClick={() => navigate("/exercise")}
          >
            <Pulse size={17} />
            Entraînement
          </button>
        </div>

        {/* Streak Indicator */}
        {userId && (
          <div className="span-6">
            <StreakIndicator userId={userId} />
          </div>
        )}

        {/* Calories du jour — anneau de progression + reste a consommer */}
        <div className="hero-card glow-card glow-cal span-6">
          <div className="hero-layout">
            <div
              className="ring ring-glow hero-ring"
              style={{ "--ring-pct": calculateProgress() }}
            >
              <div className="ring-content">
                <span className="ring-value">
                  {Math.round(calculateProgress())}
                </span>
                <span className="ring-unit">%</span>
              </div>
            </div>

            <div className="hero-meta">
              <div className="label">
                <Flame
                  size={12}
                  style={{ verticalAlign: "-2px", marginRight: "5px" }}
                />
                Calories
              </div>
              <div className="value">
                {Math.round(getRemainingCalories())}
              </div>
              <div
                className={`unit ${
                  dailyNutrition.calories >= calorieGoal ? "is-done" : ""
                }`}
              >
                {dailyNutrition.calories >= calorieGoal
                  ? "Objectif atteint 🎉"
                  : "kcal restantes"}
              </div>
            </div>
          </div>
        </div>

        {/* Macronutriments — bento d'anneaux */}
        <div className="section span-6">
          <div className="section-header">
            <h2 className="section-title">Macronutriments</h2>
          </div>
          <div className="macros-grid">
            <div className="macro-item macro-protein glow-card glow-pro">
              <div
                className="ring macro-circle"
                style={{
                  "--ring-pct": ringPct(dailyNutrition.proteins, proteinGoal),
                }}
              >
                <div className="ring-content">
                  <span className="ring-value">
                    {Math.round(dailyNutrition.proteins)}
                  </span>
                  <span className="ring-unit">g</span>
                </div>
              </div>
              <div className="macro-value">/ {proteinGoal} g</div>
              <div className="macro-label">Protéines</div>
            </div>

            <div className="macro-item macro-carbs glow-card glow-car">
              <div
                className="ring macro-circle"
                style={{
                  "--ring-pct": ringPct(dailyNutrition.carbs, carbsGoal),
                }}
              >
                <div className="ring-content">
                  <span className="ring-value">
                    {Math.round(dailyNutrition.carbs)}
                  </span>
                  <span className="ring-unit">g</span>
                </div>
              </div>
              <div className="macro-value">/ {carbsGoal} g</div>
              <div className="macro-label">Glucides</div>
            </div>

            <div className="macro-item macro-fats glow-card glow-fat">
              <div
                className="ring macro-circle"
                style={{
                  "--ring-pct": ringPct(dailyNutrition.fats, fatsGoal),
                }}
              >
                <div className="ring-content">
                  <span className="ring-value">
                    {Math.round(dailyNutrition.fats)}
                  </span>
                  <span className="ring-unit">g</span>
                </div>
              </div>
              <div className="macro-value">/ {fatsGoal} g</div>
              <div className="macro-label">Lipides</div>
            </div>
          </div>
        </div>

        {userId && (
          <div className="span-6">
            <PersonalNote userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
