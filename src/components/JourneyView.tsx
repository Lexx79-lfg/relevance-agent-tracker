import { useJourney } from "../context/JourneyContext";
import type { GoalJourney } from "../types/journey";

export function JourneyView() {
  const { currentJourney, currentUser, mentorState, markStuck } = useJourney();
  if (!currentJourney || !currentUser) {
    return (
      <div
        className="mentor-side-card"
        style={{
          background: "rgba(9, 20, 44, 0.84)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          borderRadius: "24px",
          padding: "22px",
          boxShadow: "0 16px 44px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ color: "#f8fafc", fontSize: "1.05rem", fontWeight: 800 }}>
          Journey not started yet.
        </div>
      </div>
    );
  }

  const currentStage = getJourneyStage(currentJourney, currentJourney.currentStageIndex);
  const currentDestinationStage = getJourneyStage(currentJourney, currentJourney.currentDestinationIndex);
  const nextMilestone = currentStage?.milestones.find((milestone) => !milestone.completed);
  const missionStateLabel = getJourneyPhaseLabel(currentJourney.journeyPhase);
  const stageProgress = nextMilestone
    ? Math.min((currentJourney.progress / nextMilestone.requiredProgress) * 100, 100)
    : 100;

  return (
    <div
      className="mentor-side-card"
      style={{
        background: "rgba(9, 20, 44, 0.84)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: "24px",
        padding: "22px",
        boxShadow: "0 16px 44px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          fontSize: "0.84rem",
          letterSpacing: "0.18em",
          color: "#cbd5e1",
          fontWeight: 800,
          marginBottom: "12px",
        }}
      >
        JOURNEY
      </div>

      <div style={{ color: "#f8fafc", fontSize: "1.25rem", fontWeight: 800 }}>
        {getJourneyHeadline(currentJourney.journeyPhase, currentDestinationStage, currentStage, currentJourney.destinationName)}
      </div>

      <div style={{ color: "#cbd5e1", fontSize: "0.98rem", lineHeight: 1.55, marginTop: "8px" }}>
        {currentUser.name}'s route: {currentJourney.title}
        <br />
        Mentor state: <strong>{mentorState}</strong>
        <br />
        Journey phase: <strong>{missionStateLabel}</strong>
        <br />
        Current location: <strong>{currentDestinationStage?.planetName ?? "Route start"}</strong>
        {currentStage && currentStage.id !== currentDestinationStage?.id && (
          <>
            <br />
            Next target: <strong>{currentStage.planetName}</strong>
          </>
        )}
        {currentJourney.majorActionAvailable && (
          <>
            <br />
            Command ready:{" "}
            <strong>{currentJourney.majorActionType === "land" ? "Land safely" : "Launch mission"}</strong>
          </>
        )}
      </div>

      <div
        style={{
          height: "14px",
          background: "#020817",
          borderRadius: "999px",
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            width: `${stageProgress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #22c55e 0%, #86efac 58%, #fbbf24 100%)",
            borderRadius: "999px",
            transition: "width 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: "0 0 18px rgba(134, 239, 172, 0.28)",
          }}
        />
      </div>

      <div style={{ color: "#cbd5e1", fontSize: "0.98rem", lineHeight: 1.55, marginTop: "12px" }}>
        Progress: <strong>{currentJourney.progress}</strong>
        <br />
        Next milestone:{" "}
        <strong>{nextMilestone ? nextMilestone.name : "Destination reached"}</strong>
      </div>

      {nextMilestone && (
        <div
          style={{
            background: "#061120",
            border: "1px solid rgba(148, 163, 184, 0.08)",
            borderRadius: "16px",
            color: "#cbd5e1",
            fontSize: "0.95rem",
            lineHeight: 1.45,
            marginTop: "12px",
            padding: "12px 14px",
          }}
        >
          {nextMilestone.description}
        </div>
      )}

      <button
        className="mentor-soft-button"
        onClick={markStuck}
        style={{
          marginTop: "14px",
          background: "transparent",
          color: "#cbd5e1",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          borderRadius: "14px",
          padding: "10px 14px",
          cursor: "pointer",
          transition: "transform 180ms ease, border-color 180ms ease, background 180ms ease",
        }}
      >
        I'm stuck
      </button>
    </div>
  );
}

function getJourneyStage(journey: GoalJourney, index: number | undefined) {
  if (typeof index !== "number") return undefined;

  return journey.stages[index];
}

function getJourneyHeadline(
  phase: string,
  currentDestinationStage: { planetName: string } | undefined,
  currentStage: { planetName: string } | undefined,
  destinationName: string
) {
  if (phase === "arrived") return `Touchdown at ${currentDestinationStage?.planetName ?? destinationName}`;
  if (phase === "inProgress" || phase === "arrivalReady") {
    return `En route to ${currentStage?.planetName ?? destinationName}`;
  }

  return currentStage?.planetName ?? destinationName;
}

function getJourneyPhaseLabel(phase: string) {
  if (phase === "actionReady") return "Launch command ready";
  if (phase === "inProgress") return "In space / transit";
  if (phase === "arrivalReady") return "Landing command ready";
  if (phase === "arrived") return "Landed / route secured";

  return "Grounded / on launch pad";
}
