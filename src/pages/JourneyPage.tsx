import { type CSSProperties } from "react";
import { JourneyView } from "../components/JourneyView";
import { useJourney } from "../context/JourneyContext";
import { isCommandSoundEnabled } from "../lib/commandSound";
import { playMajorCommandFeedback } from "../lib/uiFeedback";
import { RewardSystemProvider } from "../rewards/RewardSystemProvider";
import { MilestoneCelebrationOverlay } from "../rewards/components/MilestoneCelebrationOverlay";
import { RewardSceneHost } from "../rewards/components/RewardSceneHost";
import { RewardTracker } from "../rewards/components/RewardTracker";
import type { GoalJourney, JourneyPhase, JourneyStage, MissionAction, Milestone, MilestoneRewardHistoryEntry } from "../types/journey";

export function JourneyPage() {
  const {
    completeMilestoneProgress,
    currentJourney,
    markActivity,
    milestoneRewardHistory,
    missionAction,
    triggerMissionAction,
  } = useJourney();

  const nextMajor = findNextMajorMilestone(currentJourney);
  const currentStage = getJourneyStage(currentJourney, currentJourney?.currentStageIndex);
  const currentDestinationStage = getJourneyStage(currentJourney, currentJourney?.currentDestinationIndex);
  const journeyPhase = currentJourney?.journeyPhase ?? "grounded";
  const destination = currentJourney?.destinationName ?? "Mars";
  const cycleProgress = getMajorCycleProgress(currentJourney, nextMajor);

  function handleAddFuel() {
    if (!currentJourney) return;

    markActivity();
    completeMilestoneProgress();
  }

  function handleMissionAction(action: MissionAction) {
    playMajorCommandFeedback(action);
    triggerMissionAction();
  }

  return (
    <section style={pageShellStyle}>
      <MissionControlHero
        currentJourney={currentJourney}
        currentDestinationStage={currentDestinationStage}
        currentStage={currentStage}
        destination={destination}
        journeyPhase={journeyPhase}
        nextMajor={nextMajor}
        missionAction={missionAction}
        cycleProgress={cycleProgress}
        onAddFuel={handleAddFuel}
        onMissionAction={handleMissionAction}
      />
      <section style={lowerGridStyle}>
        <div style={missionPanelStyle}>
          <NextMajorMilestone journey={currentJourney} target={nextMajor} />
          <CurrentStageMilestones journey={currentJourney} stage={currentStage} />
          <JourneyHistory entries={milestoneRewardHistory} />
        </div>

        <JourneyView />
      </section>
    </section>
  );
}

type NextMajorMilestoneTarget = {
  stage: JourneyStage;
  milestone: Milestone;
  stageIndex: number;
};

function getJourneyStage(journey: GoalJourney | null, index: number | undefined) {
  if (!journey || typeof index !== "number") return null;

  return journey.stages[index] ?? null;
}

function MissionControlHero({
  currentJourney,
  currentDestinationStage,
  currentStage,
  destination,
  journeyPhase,
  nextMajor,
  missionAction,
  onAddFuel,
  onMissionAction,
  cycleProgress,
}: {
  currentJourney: GoalJourney | null;
  currentDestinationStage: JourneyStage | null;
  currentStage: JourneyStage | null;
  destination: string;
  journeyPhase: JourneyPhase;
  nextMajor: NextMajorMilestoneTarget | null;
  missionAction: MissionAction | null;
  onAddFuel: () => void;
  onMissionAction: (action: MissionAction) => void;
  cycleProgress: RewardCycleProgress;
}) {
  const remainingSteps = nextMajor && currentJourney
    ? Math.max(nextMajor.milestone.requiredProgress - currentJourney.progress, 0)
    : 0;
  const missionStateCopy = getMissionStateCopy(journeyPhase);
  const locationLabel = getLocationLabel(journeyPhase);
  const locationValue = getLocationValue(journeyPhase, currentDestinationStage, currentStage);
  const targetValue = getTargetValue(journeyPhase, currentDestinationStage, currentStage, destination);

  return (
    <div className="mentor-panel command-panel command-screen" style={heroStyle}>
      <RewardSystemProvider
        currentValue={cycleProgress.currentValue}
        deferMilestoneSequence
        destinationName={destination}
        journeyPhase={journeyPhase}
        onProgressCommit={onAddFuel}
        soundEnabled={isCommandSoundEnabled()}
        stageName={currentStage?.planetName}
        targetName={nextMajor?.milestone.name}
        targetValue={cycleProgress.targetValue}
        themeId="rocket"
      >
        <div style={heroCopyStyle}>
          <div className="command-kicker" style={kickerStyle}>MISSION CONTROL</div>
          <h2 style={heroTitleStyle}>Journey to {destination}</h2>
          <p style={heroTextStyle}>
            {currentStage
              ? `${missionStateCopy.heroLine} Destination lock remains ${destination}.`
              : "Complete onboarding to chart the route and bring the mission online."}
          </p>

          <div style={statusGridStyle}>
            <StatusTile label={locationLabel} value={locationValue} />
            <StatusTile label="Mission phase" value={missionStateCopy.status} />
            <StatusTile label="Route target" value={targetValue} />
            <StatusTile
              label="Next milestone"
              value={nextMajor ? nextMajor.milestone.name : currentJourney ? "Route complete" : "Awaiting route"}
            />
            <StatusTile
              label="Steps needed"
              value={nextMajor ? `${remainingSteps} step${remainingSteps === 1 ? "" : "s"}` : "Awaiting next action"}
            />
          </div>

          {currentJourney ? (
            <>
              <RewardTracker />
              {missionAction && (
                <div style={missionActionWrapStyle}>
                  <div style={missionActionLabelStyle}>
                    {missionAction === "land" ? "Landing command available" : "Launch command available"}
                  </div>
                  <button
                    className="mentor-primary-button mission-action-button"
                    onClick={() => onMissionAction(missionAction)}
                    style={missionActionButtonStyle}
                    type="button"
                  >
                    {getMissionActionLabel(missionAction)}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={taskFuelLinkStyle}>Progress will come online when a route is active.</div>
          )}

          <div style={taskFuelLinkStyle}>
            {missionStateCopy.fuelLine}
          </div>
        </div>

        <div style={{ ...sceneWrapStyle, ...getJourneySceneWrapStyle(journeyPhase) }}>
          <div style={journeySceneLabelStyle}>{getJourneyScenePostureLabel(journeyPhase)}</div>
          <RewardSceneHost />
          <MilestoneCelebrationOverlay />
        </div>
      </RewardSystemProvider>
    </div>
  );
}

type RewardCycleProgress = {
  currentValue: number;
  targetValue: number;
};

function getMajorCycleProgress(
  journey: GoalJourney | null,
  target: NextMajorMilestoneTarget | null
): RewardCycleProgress {
  if (!journey || !target) {
    return { currentValue: 0, targetValue: 1 };
  }

  const previousMajorProgress = journey.stages
    .flatMap((stage) => stage.milestones)
    .filter((milestone) => milestone.isMajor && milestone.requiredProgress < target.milestone.requiredProgress)
    .reduce((largest, milestone) => Math.max(largest, milestone.requiredProgress), 0);

  return {
    currentValue: Math.max(journey.progress - previousMajorProgress, 0),
    targetValue: Math.max(target.milestone.requiredProgress - previousMajorProgress, 1),
  };
}

function getMissionStateCopy(journeyPhase: JourneyPhase) {
  if (journeyPhase === "actionReady") {
    return {
      fuelLine: "Progress has done its job. Launch is now a deliberate command, not another fuel step.",
      heroLine: "Fuel target reached. The rocket is stable and waiting for your launch command.",
      status: "Launch Command Ready",
    };
  }

  if (journeyPhase === "inProgress") {
    return {
      fuelLine: "Progress now fuels the rocket in transit. The route stays alive between major events.",
      heroLine: "The vehicle is in transit beyond the lower atmosphere.",
      status: "In Space",
    };
  }

  if (journeyPhase === "arrivalReady") {
    return {
      fuelLine: "Progress has carried this leg far enough. Land when you are ready to secure the destination.",
      heroLine: "Approach confirmed. The rocket is holding for your landing command.",
      status: "Landing Command Ready",
    };
  }

  if (journeyPhase === "arrived") {
    return {
      fuelLine: "You are landed. New progress prepares the next route, but this arrival stays recorded.",
      heroLine: "Touchdown confirmed. This is your current location, not a passing signal.",
      status: "Landed",
    };
  }

  return {
    fuelLine: "Important tasks completed elsewhere send fuel here. Real movement powers the mission.",
    heroLine: "The vehicle is holding on the pad.",
    status: "On Pad",
  };
}

function getMissionActionLabel(action: MissionAction) {
  return action === "land" ? "Land Safely" : "Launch Mission";
}

function getJourneyScenePostureLabel(phase: JourneyPhase) {
  if (phase === "arrivalReady") return "Approach stable";
  if (phase === "inProgress") return "Traveling through space";
  if (phase === "arrived") return "Landed and settled";
  if (phase === "actionReady") return "On pad, command ready";

  return "On pad, preparing";
}

function getJourneySceneWrapStyle(phase: JourneyPhase) {
  if (phase === "inProgress") {
    return {
      boxShadow: "0 0 0 1px rgba(125, 211, 252, 0.18), 0 22px 54px rgba(14, 116, 144, 0.12)",
    } satisfies CSSProperties;
  }

  if (phase === "arrivalReady") {
    return {
      boxShadow: "0 0 0 1px rgba(251, 191, 36, 0.24), 0 22px 54px rgba(251, 146, 60, 0.13)",
    } satisfies CSSProperties;
  }

  if (phase === "arrived") {
    return {
      boxShadow: "0 0 0 1px rgba(134, 239, 172, 0.2), 0 22px 54px rgba(20, 83, 45, 0.14)",
    } satisfies CSSProperties;
  }

  return {};
}

function getLocationLabel(phase: JourneyPhase) {
  if (phase === "arrived") return "Current location";
  if (phase === "inProgress" || phase === "arrivalReady") return "Departed from";

  return "Current hold";
}

function getLocationValue(
  phase: JourneyPhase,
  currentDestinationStage: JourneyStage | null,
  currentStage: JourneyStage | null
) {
  if (phase === "arrived" || phase === "inProgress" || phase === "arrivalReady") {
    return currentDestinationStage?.planetName ?? "Route marker";
  }

  return currentStage?.planetName ?? "Not started";
}

function getTargetValue(
  phase: JourneyPhase,
  currentDestinationStage: JourneyStage | null,
  currentStage: JourneyStage | null,
  destination: string
) {
  if (phase === "arrived") {
    return currentStage && currentStage.id !== currentDestinationStage?.id
      ? currentStage.planetName
      : "Awaiting next route";
  }

  return currentStage?.planetName ?? destination;
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="command-card" style={statusTileStyle}>
      <div style={statusLabelStyle}>{label}</div>
      <div style={statusValueStyle}>{value}</div>
    </div>
  );
}

function CurrentStageMilestones({
  journey,
  stage,
}: {
  journey: GoalJourney | null;
  stage: JourneyStage | null;
}) {
  if (!journey || !stage) {
    return (
      <div className="command-card" style={milestoneListCardStyle}>
        <div style={labelStyle}>ROUTE MARKERS</div>
        <p style={emptyHistoryStyle}>Route markers will appear after your mission path is initialized.</p>
      </div>
    );
  }

  return (
    <div className="command-card" style={milestoneListCardStyle}>
      <div style={nextMajorHeaderStyle}>
        <div>
          <div style={labelStyle}>CURRENT ROUTE MARKERS</div>
          <div style={nextMajorTitleStyle}>{stage.planetName}</div>
        </div>
        <div style={nextMajorBadgeStyle}>Stage {stage.stageNumber}</div>
      </div>

      <div style={milestoneListStyle}>
        {stage.milestones.map((milestone) => {
          const progressPercent = Math.min((journey.progress / milestone.requiredProgress) * 100, 100);
          const itemStyle = milestone.completed
            ? { ...milestoneItemStyle, ...milestoneItemCompleteStyle }
            : milestone.isMajor
              ? { ...milestoneItemStyle, ...milestoneItemMajorStyle }
              : milestoneItemStyle;
          const pillStyle = milestone.completed
            ? { ...milestonePillStyle, ...milestonePillCompleteStyle }
            : milestone.isMajor
              ? { ...milestonePillStyle, ...milestonePillMajorStyle }
              : milestonePillStyle;

          return (
            <article key={milestone.id} style={itemStyle}>
              <div style={milestoneItemHeaderStyle}>
                <div>
                  <div style={milestoneNameStyle}>{milestone.name}</div>
                  <div style={milestoneDescriptionStyle}>{milestone.description}</div>
                </div>
                <span style={pillStyle}>
                  {milestone.completed ? "✓ Secured" : milestone.isMajor ? getMajorMarkerLabel(journey.journeyPhase) : "Marker"}
                </span>
              </div>

              <div style={miniProgressTrackStyle} aria-label={`Progress toward ${milestone.name}`}>
                <div
                  style={{
                    ...miniProgressFillStyle,
                    ...(milestone.completed ? miniProgressFillCompleteStyle : {}),
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
              <div style={milestoneProgressTextStyle}>
                {milestone.completed ? "Route marker secured" : `${journey.progress} / ${milestone.requiredProgress} signals`}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function NextMajorMilestone({
  journey,
  target,
}: {
  journey: GoalJourney | null;
  target: NextMajorMilestoneTarget | null;
}) {
  const majorActionCopy = getMajorActionCopy(journey?.journeyPhase);

  if (!journey) {
    return (
      <div className="command-card" style={nextMajorCardStyle}>
        <div style={labelStyle}>NEXT MAJOR WINDOW</div>
        <p style={emptyHistoryStyle}>
          Journey data is not available yet. Once onboarding is complete, this area will show the next major action worth building toward.
        </p>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="command-card" style={nextMajorCardStyle}>
        <div style={labelStyle}>{majorActionCopy.windowLabel}</div>
        <div style={nextMajorTitleStyle}>Route complete</div>
        <p style={nextMajorCopyStyle}>
          This route is secure. When you are ready, choose the next meaningful destination.
        </p>
      </div>
    );
  }

  const remainingSteps = Math.max(target.milestone.requiredProgress - journey.progress, 0);
  const progressPercent = getMajorProgressPercent(journey, target.milestone);

  return (
    <div
      className="command-card"
      style={journey.majorActionAvailable ? { ...nextMajorCardStyle, ...nextMajorReadyCardStyle } : nextMajorCardStyle}
    >
      <div style={nextMajorHeaderStyle}>
        <div>
          <div style={labelStyle}>{majorActionCopy.windowLabel}</div>
          <div style={nextMajorTitleStyle}>{target.milestone.name}</div>
        </div>
        <div style={nextMajorBadgeStyle}>
          {journey.majorActionAvailable ? majorActionCopy.badgeLabel : formatTheme(target.stage.theme)}
        </div>
      </div>

      <p style={nextMajorCopyStyle}>
        {journey.majorActionAvailable
          ? majorActionCopy.readyCopy
          : `You are building toward ${target.stage.planetName}. This is the next moment where steady effort becomes visible distance.`}
      </p>

      <div style={launchReadinessStyle}>
        <span>{journey.progress} signals loaded</span>
        <span>{remainingSteps} remaining</span>
      </div>

      <div style={majorProgressTrackStyle} aria-label="Progress toward next major milestone">
        <div style={{ ...majorProgressFillStyle, width: `${progressPercent}%` }} />
      </div>

      <div style={majorProgressTextStyle}>
        {remainingSteps === 0
          ? majorActionCopy.readyLine
          : `Complete meaningful work or send one progress signal to move the ${majorActionCopy.windowName} closer.`}
      </div>
    </div>
  );
}

function getMajorActionCopy(phase: JourneyPhase | undefined) {
  if (phase === "arrivalReady" || phase === "inProgress") {
    return {
      badgeLabel: "Command Ready",
      readyCopy: "Landing is available now. Choose it when you want this leg to become a secured location.",
      readyLine: "Landing command is ready.",
      windowLabel: "LANDING WINDOW",
      windowName: "landing window",
    };
  }

  return {
    badgeLabel: "Command Ready",
    readyCopy: "Launch is available now. Choose it when you want progress to become movement.",
    readyLine: "Launch command is ready.",
    windowLabel: "LAUNCH WINDOW",
    windowName: "launch window",
  };
}

function getMajorMarkerLabel(phase: JourneyPhase) {
  if (phase === "inProgress" || phase === "arrivalReady") return "Landing";

  return "Launch";
}

function findNextMajorMilestone(journey: GoalJourney | null): NextMajorMilestoneTarget | null {
  if (!journey) return null;

  if (journey.majorActionAvailable) {
    const activeStage = journey.stages[journey.currentStageIndex];
    const activeMajor = activeStage?.milestones.find((candidate) => candidate.isMajor && candidate.completed);

    if (activeStage && activeMajor) {
      return { stage: activeStage, milestone: activeMajor, stageIndex: journey.currentStageIndex };
    }
  }

  for (const [stageIndex, stage] of journey.stages.entries()) {
    const milestone = stage.milestones.find((candidate) => candidate.isMajor && !candidate.completed);

    if (milestone) {
      return { stage, milestone, stageIndex };
    }
  }

  return null;
}

function getMajorProgressPercent(journey: GoalJourney | null, milestone: Milestone | null) {
  if (!journey || !milestone) return 0;

  return Math.min(Math.max((journey.progress / milestone.requiredProgress) * 100, 0), 100);
}

function JourneyHistory({ entries }: { entries: MilestoneRewardHistoryEntry[] }) {
  return (
    <div className="command-card" style={historyCardStyle}>
      <div style={labelStyle}>MISSION RECORD</div>

      {entries.length === 0 ? (
        <p style={emptyHistoryStyle}>
          No major launches recorded yet. When one lands, this becomes a quiet record of distance earned.
        </p>
      ) : (
        <div style={historyListStyle}>
          {entries.map((entry) => (
            <article key={`${entry.id}-${entry.completedAt}`} style={historyItemStyle}>
              <div style={historyTitleStyle}>{entry.milestoneName}</div>
              <div style={historyMetaStyle}>
                {entry.stageName} · {formatTheme(entry.theme)} · {formatCompletedAt(entry.completedAt)}
              </div>
              <p style={historyCopyStyle}>Route advanced toward {entry.destinationName}. Signal preserved.</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTheme(theme: string) {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

function formatCompletedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unknown";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const pageShellStyle = {
  display: "grid",
  gap: "clamp(16px, 3vw, 24px)",
} satisfies CSSProperties;

const heroStyle = {
  background:
    "radial-gradient(circle at 82% 58%, rgba(251, 146, 60, 0.24), transparent 28%), radial-gradient(circle at 67% 18%, rgba(125, 211, 252, 0.13), transparent 22%), radial-gradient(circle at 15% 14%, rgba(134, 239, 172, 0.12), transparent 26%), linear-gradient(135deg, rgba(10, 25, 52, 0.98), rgba(4, 9, 24, 0.98) 48%, rgba(1, 3, 12, 1))",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "32px",
  boxShadow: "0 34px 100px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(134, 239, 172, 0.06), inset 0 0 78px rgba(125, 211, 252, 0.06)",
  display: "grid",
  gap: "24px",
  gridTemplateColumns: "minmax(min(100%, 350px), 0.78fr) minmax(min(100%, 430px), 1.22fr)",
  overflow: "hidden",
  padding: "clamp(20px, 4vw, 36px)",
} satisfies CSSProperties;

const heroCopyStyle = {
  alignSelf: "center",
  display: "grid",
  gap: "13px",
  position: "relative",
  zIndex: 2,
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.82rem",
  fontWeight: 900,
  letterSpacing: "0.22em",
} satisfies CSSProperties;

const heroTitleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(2.2rem, 7vw, 4.4rem)",
  letterSpacing: "-0.06em",
  lineHeight: 0.94,
  margin: 0,
} satisfies CSSProperties;

const heroTextStyle = {
  color: "#cbd5e1",
  fontSize: "1.05rem",
  lineHeight: 1.6,
  margin: 0,
} satisfies CSSProperties;

const statusGridStyle = {
  display: "grid",
  gap: "10px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
} satisfies CSSProperties;

const statusTileStyle = {
  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.62), rgba(2, 6, 23, 0.5))",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: "16px",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  padding: "12px",
} satisfies CSSProperties;

const statusLabelStyle = {
  color: "#94a3b8",
  fontSize: "0.7rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const statusValueStyle = {
  color: "#f8fafc",
  fontSize: "0.98rem",
  fontWeight: 850,
  marginTop: "5px",
} satisfies CSSProperties;

const taskFuelLinkStyle = {
  background: "linear-gradient(90deg, rgba(134, 239, 172, 0.1), rgba(125, 211, 252, 0.05))",
  border: "1px solid rgba(134, 239, 172, 0.16)",
  borderRadius: "14px",
  color: "#d9f99d",
  fontSize: "0.9rem",
  lineHeight: 1.45,
  padding: "10px 12px",
} satisfies CSSProperties;

const sceneWrapStyle = {
  borderRadius: "24px",
  position: "relative",
} satisfies CSSProperties;

const journeySceneLabelStyle = {
  background: "rgba(2, 6, 23, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: "999px",
  color: "#e2e8f0",
  fontSize: "0.68rem",
  fontWeight: 900,
  inset: "10px 10px auto auto",
  letterSpacing: "0.12em",
  padding: "7px 9px",
  position: "absolute",
  textTransform: "uppercase",
  zIndex: 4,
} satisfies CSSProperties;

const missionActionButtonStyle = {
  width: "100%",
} satisfies CSSProperties;

const missionActionWrapStyle = {
  background:
    "linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(134, 239, 172, 0.07))",
  border: "1px solid rgba(251, 191, 36, 0.28)",
  borderRadius: "20px",
  boxShadow: "inset 0 0 28px rgba(251, 191, 36, 0.06), 0 16px 38px rgba(0,0,0,0.18)",
  display: "grid",
  gap: "9px",
  justifySelf: "start",
  maxWidth: "360px",
  padding: "10px",
  width: "min(100%, 360px)",
} satisfies CSSProperties;

const missionActionLabelStyle = {
  color: "#fde68a",
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  padding: "0 4px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const lowerGridStyle = {
  display: "grid",
  gap: "clamp(16px, 3vw, 24px)",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
} satisfies CSSProperties;

const missionPanelStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
  display: "grid",
  gap: "14px",
  padding: "clamp(20px, 4vw, 30px)",
} satisfies CSSProperties;

const cardStyle = {
  background: "#061120",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "18px",
  padding: "16px",
} satisfies CSSProperties;

const nextMajorCardStyle = {
  ...cardStyle,
  background:
    "radial-gradient(circle at 88% 12%, rgba(251, 191, 36, 0.16), transparent 28%), radial-gradient(circle at 16% 100%, rgba(134, 239, 172, 0.12), transparent 30%), #061120",
  border: "1px solid rgba(134, 239, 172, 0.28)",
  boxShadow: "inset 0 0 34px rgba(134, 239, 172, 0.07), 0 18px 48px rgba(0,0,0,0.18)",
} satisfies CSSProperties;

const nextMajorReadyCardStyle = {
  border: "1px solid rgba(251, 191, 36, 0.44)",
  boxShadow: "inset 0 0 38px rgba(251, 191, 36, 0.09), 0 20px 54px rgba(0,0,0,0.22)",
} satisfies CSSProperties;

const milestoneListCardStyle = {
  ...cardStyle,
  background: "rgba(6, 17, 32, 0.72)",
} satisfies CSSProperties;

const milestoneListStyle = {
  display: "grid",
  gap: "10px",
  marginTop: "14px",
} satisfies CSSProperties;

const milestoneItemStyle = {
  background: "rgba(2, 6, 23, 0.52)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "16px",
  padding: "13px",
} satisfies CSSProperties;

const milestoneItemCompleteStyle = {
  background: "rgba(20, 83, 45, 0.22)",
  border: "1px solid rgba(134, 239, 172, 0.24)",
} satisfies CSSProperties;

const milestoneItemMajorStyle = {
  background:
    "radial-gradient(circle at 92% 18%, rgba(251, 191, 36, 0.12), transparent 28%), rgba(2, 6, 23, 0.58)",
  border: "1px solid rgba(251, 191, 36, 0.22)",
} satisfies CSSProperties;

const milestoneItemHeaderStyle = {
  alignItems: "flex-start",
  display: "flex",
  gap: "12px",
  justifyContent: "space-between",
} satisfies CSSProperties;

const milestoneNameStyle = {
  color: "#f8fafc",
  fontSize: "0.98rem",
  fontWeight: 900,
  lineHeight: 1.25,
} satisfies CSSProperties;

const milestoneDescriptionStyle = {
  color: "#94a3b8",
  fontSize: "0.86rem",
  lineHeight: 1.45,
  marginTop: "4px",
} satisfies CSSProperties;

const milestonePillStyle = {
  background: "rgba(148, 163, 184, 0.1)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: "999px",
  color: "#cbd5e1",
  flex: "0 0 auto",
  fontSize: "0.7rem",
  fontWeight: 900,
  letterSpacing: "0.08em",
  padding: "5px 8px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const milestonePillCompleteStyle = {
  background: "rgba(134, 239, 172, 0.14)",
  border: "1px solid rgba(134, 239, 172, 0.3)",
  color: "#bbf7d0",
} satisfies CSSProperties;

const milestonePillMajorStyle = {
  background: "rgba(251, 191, 36, 0.14)",
  border: "1px solid rgba(251, 191, 36, 0.28)",
  color: "#fde68a",
} satisfies CSSProperties;

const miniProgressTrackStyle = {
  background: "#020817",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "999px",
  height: "10px",
  marginTop: "11px",
  overflow: "hidden",
} satisfies CSSProperties;

const miniProgressFillStyle = {
  background: "linear-gradient(90deg, #16a34a 0%, #86efac 72%, #fbbf24 100%)",
  borderRadius: "999px",
  boxShadow: "0 0 14px rgba(134, 239, 172, 0.2)",
  height: "100%",
  transition: "width 500ms ease",
} satisfies CSSProperties;

const miniProgressFillCompleteStyle = {
  background: "linear-gradient(90deg, #22c55e 0%, #86efac 100%)",
  boxShadow: "0 0 18px rgba(134, 239, 172, 0.3)",
} satisfies CSSProperties;

const milestoneProgressTextStyle = {
  color: "#94a3b8",
  fontSize: "0.8rem",
  fontWeight: 800,
  marginTop: "7px",
} satisfies CSSProperties;

const historyCardStyle = {
  ...cardStyle,
  background: "rgba(6, 17, 32, 0.58)",
} satisfies CSSProperties;

const labelStyle = {
  color: "#fbbf24",
  fontSize: "0.8rem",
  fontWeight: 900,
  letterSpacing: "0.18em",
  marginBottom: "8px",
} satisfies CSSProperties;

const nextMajorHeaderStyle = {
  alignItems: "flex-start",
  display: "flex",
  gap: "12px",
  justifyContent: "space-between",
} satisfies CSSProperties;

const nextMajorTitleStyle = {
  color: "#f8fafc",
  fontSize: "1.25rem",
  fontWeight: 900,
  lineHeight: 1.15,
} satisfies CSSProperties;

const nextMajorBadgeStyle = {
  background: "rgba(251, 191, 36, 0.12)",
  border: "1px solid rgba(251, 191, 36, 0.24)",
  borderRadius: "999px",
  color: "#fde68a",
  flex: "0 0 auto",
  fontSize: "0.74rem",
  fontWeight: 900,
  letterSpacing: "0.08em",
  padding: "6px 9px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const nextMajorCopyStyle = {
  color: "#cbd5e1",
  fontSize: "0.98rem",
  lineHeight: 1.55,
  margin: "12px 0 14px",
} satisfies CSSProperties;

const launchReadinessStyle = {
  alignItems: "center",
  color: "#fde68a",
  display: "flex",
  flexWrap: "wrap",
  fontSize: "0.86rem",
  fontWeight: 900,
  gap: "8px",
  justifyContent: "space-between",
  letterSpacing: "0.06em",
  marginBottom: "10px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const majorProgressTrackStyle = {
  background: "#020817",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "999px",
  height: "12px",
  overflow: "hidden",
} satisfies CSSProperties;

const majorProgressFillStyle = {
  background: "linear-gradient(90deg, #22c55e 0%, #86efac 70%, #fbbf24 100%)",
  borderRadius: "999px",
  boxShadow: "0 0 18px rgba(134, 239, 172, 0.22)",
  height: "100%",
  transition: "width 500ms ease",
} satisfies CSSProperties;

const majorProgressTextStyle = {
  color: "#94a3b8",
  fontSize: "0.88rem",
  lineHeight: 1.45,
  marginTop: "9px",
} satisfies CSSProperties;

const emptyHistoryStyle = {
  color: "#cbd5e1",
  fontSize: "0.98rem",
  lineHeight: 1.55,
  margin: 0,
} satisfies CSSProperties;

const historyListStyle = {
  display: "grid",
  gap: "10px",
} satisfies CSSProperties;

const historyItemStyle = {
  background: "rgba(2, 6, 23, 0.52)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "16px",
  padding: "14px",
} satisfies CSSProperties;

const historyTitleStyle = {
  color: "#f8fafc",
  fontSize: "1rem",
  fontWeight: 800,
  lineHeight: 1.25,
} satisfies CSSProperties;

const historyMetaStyle = {
  color: "#94a3b8",
  fontSize: "0.85rem",
  lineHeight: 1.45,
  marginTop: "4px",
} satisfies CSSProperties;

const historyCopyStyle = {
  color: "#cbd5e1",
  fontSize: "0.94rem",
  lineHeight: 1.5,
  margin: "10px 0 0",
} satisfies CSSProperties;
