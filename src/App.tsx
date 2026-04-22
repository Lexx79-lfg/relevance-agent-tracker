import { useState, type CSSProperties } from "react";
import { MilestoneOverlay } from "./components/MilestoneOverlay";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { useJourney } from "./context/JourneyContext";
import { isCommandSoundEnabled, playCommandSound, setCommandSoundEnabled } from "./lib/commandSound";
import { CalendarPage } from "./pages/CalendarPage";
import { JourneyPage } from "./pages/JourneyPage";
import { MentorHomePage } from "./pages/MentorHomePage";
import { RegulationPage } from "./pages/RegulationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TasksPage } from "./pages/TasksPage";

type AppPage = "home" | "tasks" | "calendar" | "support" | "journey" | "settings";

const APP_PAGES: Array<{ id: AppPage; label: string; subtitle: string }> = [
  { id: "home", label: "Home", subtitle: "Guide" },
  { id: "tasks", label: "Tasks", subtitle: "Focus" },
  { id: "calendar", label: "Calendar", subtitle: "Time" },
  { id: "support", label: "Support", subtitle: "Steady" },
  { id: "journey", label: "Journey", subtitle: "Progress" },
  { id: "settings", label: "Settings", subtitle: "Setup" },
];

function App() {
  const [activePage, setActivePage] = useState<AppPage>("home");
  const [soundEnabled, setSoundEnabled] = useState(() => isCommandSoundEnabled());
  const { isEditingProfile, isOnboarded } = useJourney();
  const homeActive = activePage === "home";

  function handleToggleSound() {
    const nextSoundEnabled = !soundEnabled;

    if (nextSoundEnabled) {
      setCommandSoundEnabled(true);
      setSoundEnabled(true);
      playCommandSound("confirm");
      return;
    }

    playCommandSound("confirm");
    setCommandSoundEnabled(false);
    setSoundEnabled(false);
  }

  const navigation = (
    <nav
      className="command-tabs"
      aria-label="Relevance Agent pages"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: homeActive ? "7px" : "10px",
        marginBottom: homeActive ? 0 : "clamp(18px, 3vw, 24px)",
        marginTop: homeActive ? "clamp(16px, 3vw, 22px)" : 0,
        opacity: homeActive ? 0.58 : 1,
      }}
    >
      {APP_PAGES.map((page) => {
        const active = activePage === page.id;

        return (
          <button
            className={`mentor-soft-button command-tab ${active ? "command-tab-active" : ""}`}
            key={page.id}
            onClick={() => {
              playCommandSound("tab");
              setActivePage(page.id);
            }}
            style={{
              background: active ? "rgba(134, 239, 172, 0.12)" : "rgba(15, 23, 42, 0.5)",
              border: active
                ? "1px solid rgba(134, 239, 172, 0.42)"
                : "1px solid rgba(148, 163, 184, 0.12)",
              borderRadius: "999px",
              color: "#f8fafc",
              cursor: "pointer",
              fontSize: homeActive ? "0.84rem" : "0.95rem",
              minHeight: homeActive ? "40px" : "48px",
              padding: homeActive ? "7px 10px" : "10px 14px",
              transition: "transform 180ms ease, border-color 180ms ease, background 180ms ease",
            }}
          >
            <span className={`status-light ${active ? "" : "status-light-amber"}`} />
            <span style={{ fontWeight: 800 }}>{page.label}</span>
            {!homeActive && <span style={{ color: "#94a3b8", marginLeft: "8px" }}>{page.subtitle}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <main
      className="mentor-shell command-deck"
      style={{
        minHeight: "100vh",
        padding: "clamp(24px, 4vw, 44px) clamp(16px, 3vw, 28px) clamp(44px, 7vw, 72px)",
        background:
          "radial-gradient(circle at 15% 18%, rgba(32, 201, 151, 0.1), transparent 20%), radial-gradient(circle at 82% 42%, rgba(251, 146, 60, 0.1), transparent 18%), linear-gradient(135deg, #081226 0%, #020617 58%, #02030a 100%)",
        color: "#e5e7eb",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.5,
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <div
          className="mentor-entrance"
          style={{ marginBottom: homeActive ? "12px" : "clamp(22px, 4vw, 32px)" }}
        >
          <div style={headerControlRowStyle}>
            <div>
              <div
                className="command-kicker"
                style={{
                  fontSize: "0.9rem",
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                  color: "#cbd5e1",
                }}
              >
                RELEVANCE AGENT
              </div>
              <div style={temporaryVersionBadgeStyle}>TEMP TEST: CODEX WORKSPACE VERSION</div>
            </div>

            {isOnboarded && !isEditingProfile && (
              <button
                className="mentor-soft-button command-sound-toggle"
                onClick={handleToggleSound}
                type="button"
                aria-pressed={soundEnabled}
                aria-label={soundEnabled ? "Turn command sounds off" : "Turn command sounds on"}
              >
                <span className={`status-light ${soundEnabled ? "" : "status-light-red"}`} />
                <span>SND {soundEnabled ? "ON" : "OFF"}</span>
              </button>
            )}
          </div>

          {!homeActive && (
            <>
              <h1
                style={{
                  fontSize: "clamp(2.3rem, 7vw, 4.2rem)",
                  lineHeight: 0.95,
                  margin: 0,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  maxWidth: "850px",
                  textWrap: "balance",
                }}
              >
                Mission Control
              </h1>

              <p
                style={{
                  marginTop: "18px",
                  color: "#cbd5e1",
                  fontSize: "1.15rem",
                  maxWidth: "740px",
                  lineHeight: 1.65,
                }}
              >
                Regulate, choose the next useful move, and keep the rocket fueled.
              </p>
            </>
          )}
        </div>

        {!isOnboarded || isEditingProfile ? (
          <OnboardingFlow />
        ) : (
          <>
            {!homeActive && navigation}
            {activePage === "home" && <MentorHomePage onNavigate={setActivePage} />}
            {activePage === "tasks" && <TasksPage />}
            {activePage === "calendar" && <CalendarPage />}
            {activePage === "support" && <RegulationPage />}
            {activePage === "journey" && <JourneyPage />}
            {activePage === "settings" && <SettingsPage />}
            {homeActive && navigation}
          </>
        )}
      </div>
      {isOnboarded && !isEditingProfile && <MilestoneOverlay />}
    </main>
  );
}

const headerControlRowStyle = {
  alignItems: "center",
  display: "flex",
  gap: "14px",
  justifyContent: "space-between",
  marginBottom: "14px",
} satisfies CSSProperties;

const temporaryVersionBadgeStyle = {
  background: "rgba(251, 191, 36, 0.14)",
  border: "1px solid rgba(251, 191, 36, 0.34)",
  borderRadius: "999px",
  color: "#fde68a",
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.12em",
  marginTop: "8px",
  padding: "5px 9px",
  textTransform: "uppercase",
} satisfies CSSProperties;

export default App;
