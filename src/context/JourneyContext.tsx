import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSpaceDestinationByIndex, getSpaceDestinationLabel } from "../themes/rocket/spaceDestinations";
import type {
  GoalJourney,
  JourneyStage,
  JourneyPhase,
  MajorActionType,
  MentorState,
  MissionAction,
  Milestone,
  MilestoneRewardEvent,
  MilestoneRewardHistoryEntry,
  OnboardingAnswers,
  RewardStyle,
  UserProfile,
} from "../types/journey";

type JourneyContextValue = {
  currentUser: UserProfile | null;
  currentJourney: GoalJourney | null;
  mentorState: MentorState;
  activeMilestoneReward: MilestoneRewardEvent | null;
  milestoneRewardHistory: MilestoneRewardHistoryEntry[];
  isEditingProfile: boolean;
  isOnboarded: boolean;
  missionAction: MissionAction | null;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  startProfileEdit: () => void;
  cancelProfileEdit: () => void;
  resetJourney: () => void;
  markActivity: () => void;
  markStuck: () => void;
  dismissMilestoneReward: () => void;
  completeMilestoneProgress: (options?: { suppressReward?: boolean }) => void;
  triggerMissionAction: () => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);
const JOURNEY_STORAGE_KEY = "relevance-agent-journey-state";
const JOURNEY_STORAGE_VERSION = 1;
const DEFAULT_ROCKET_NAME = "KARINA-23";
const DEFAULT_ROCKET_DEDICATION = "Inspired by Karina, for her unwavering support.";

type StoredJourneyState = {
  version: typeof JOURNEY_STORAGE_VERSION;
  currentUser: UserProfile | null;
  currentJourney: GoalJourney | null;
  mentorState: MentorState;
  milestoneRewardHistory: MilestoneRewardHistoryEntry[];
};

const STRUGGLE_STAGE_NAMES: Record<string, string> = {
  overwhelm: "Stability Orbit",
  avoidance: "Momentum Station",
  indecision: "Clarity Moon",
  relationships: "Repair Harbor",
};

function cleanText(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function chooseFirstStageName(struggle: string) {
  const lowered = struggle.toLowerCase();
  const match = Object.keys(STRUGGLE_STAGE_NAMES).find((keyword) => lowered.includes(keyword));
  return match ? STRUGGLE_STAGE_NAMES[match] : getSpaceDestinationLabel("earth-orbit", "Earth Orbit");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMentorState(value: unknown): value is MentorState {
  return value === "avoiding" || value === "momentum" || value === "setback";
}

function isRewardStyle(value: unknown): value is RewardStyle {
  return value === "rocket" || value === "celebration" || value === "quiet" || value === "adventure";
}

function isJourneyPhase(value: unknown): value is JourneyPhase {
  return (
    value === "grounded" ||
    value === "actionReady" ||
    value === "inProgress" ||
    value === "arrivalReady" ||
    value === "arrived"
  );
}

function getMajorActionForPhase(phase: JourneyPhase): MajorActionType | null {
  if (phase === "actionReady") return "launch";
  if (phase === "arrivalReady") return "land";

  return null;
}

function getJourneyPhaseFromLegacyState(journey: GoalJourney): JourneyPhase {
  if (isJourneyPhase(journey.journeyPhase)) return journey.journeyPhase;

  if (journey.majorActionType === "launch") return "actionReady";
  if (journey.majorActionType === "land") return "arrivalReady";

  return "grounded";
}

function getActiveMajorMilestone(
  journey: GoalJourney
): { stage: JourneyStage; stageIndex: number; milestone: Milestone } | null {
  const stageIndex = journey.currentStageIndex;
  const currentStage = journey.stages[stageIndex];

  if (!currentStage) return null;

  const milestone = currentStage.milestones.find((candidate) => candidate.isMajor && candidate.completed);

  return milestone ? { stage: currentStage, stageIndex, milestone } : null;
}

function getDestinationLabelForIndex(index: number) {
  return getSpaceDestinationByIndex(index)?.label ?? getSpaceDestinationLabel("mars", "Mars");
}

function normalizeJourney(journey: GoalJourney, forcedPhase?: JourneyPhase): GoalJourney {
  const maxStageIndex = Math.max(journey.stages.length - 1, 0);
  const currentDestinationIndex =
    typeof journey.currentDestinationIndex === "number"
      ? journey.currentDestinationIndex
      : typeof journey.currentStageIndex === "number"
        ? journey.currentStageIndex
        : 0;
  const currentStageIndex =
    typeof journey.currentStageIndex === "number"
      ? Math.max(0, Math.min(journey.currentStageIndex, maxStageIndex))
      : Math.max(0, Math.min(currentDestinationIndex, maxStageIndex));
  const journeyPhase = forcedPhase ?? getJourneyPhaseFromLegacyState(journey);
  const action = getMajorActionForPhase(journeyPhase);

  return {
    ...journey,
    currentDestinationIndex: Math.max(0, Math.min(currentDestinationIndex, maxStageIndex)),
    currentStageIndex,
    destinationName: journey.destinationName || getDestinationLabelForIndex(journey.stages.length - 1),
    journeyPhase,
    majorActionAvailable: Boolean(action),
    majorActionType: action,
  };
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.currentFocus === "string" &&
    typeof value.primaryLifeGoal === "string" &&
    typeof value.biggestStruggle === "string" &&
    (value.preferredTone === "calm" ||
      value.preferredTone === "direct" ||
      value.preferredTone === "encouraging") &&
    (value.motivationStyle === "gentle" ||
      value.motivationStyle === "structured" ||
      value.motivationStyle === "challenge" ||
      value.motivationStyle === "reflective") &&
    isRewardStyle(value.desiredRewardStyle) &&
    (value.rocketName === undefined || typeof value.rocketName === "string") &&
    (value.rocketDedication === undefined || typeof value.rocketDedication === "string")
  );
}

function isMilestone(value: unknown): value is Milestone {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.requiredProgress === "number" &&
    typeof value.completed === "boolean" &&
    typeof value.isMajor === "boolean"
  );
}

function isJourneyStage(value: unknown): value is JourneyStage {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.destinationId === undefined || typeof value.destinationId === "string") &&
    typeof value.planetName === "string" &&
    isRewardStyle(value.theme) &&
    typeof value.stageNumber === "number" &&
    typeof value.estimatedMilestones === "number" &&
    Array.isArray(value.milestones) &&
    value.milestones.every(isMilestone)
  );
}

function isGoalJourney(value: unknown): value is GoalJourney {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.destinationName === undefined || typeof value.destinationName === "string") &&
    (value.currentStageIndex === undefined || typeof value.currentStageIndex === "number") &&
    (value.currentDestinationIndex === undefined || typeof value.currentDestinationIndex === "number") &&
    (value.journeyPhase === undefined ||
      value.journeyPhase === "grounded" ||
      value.journeyPhase === "actionReady" ||
      value.journeyPhase === "inProgress" ||
      value.journeyPhase === "arrivalReady" ||
      value.journeyPhase === "arrived") &&
    (value.majorActionAvailable === undefined || typeof value.majorActionAvailable === "boolean") &&
    (value.majorActionType === undefined ||
      value.majorActionType === null ||
      value.majorActionType === "launch" ||
      value.majorActionType === "land") &&
    typeof value.progress === "number" &&
    Array.isArray(value.stages) &&
    value.stages.length > 0 &&
    value.stages.every(isJourneyStage)
  );
}

function isMilestoneRewardHistoryEntry(value: unknown): value is MilestoneRewardHistoryEntry {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    isRewardStyle(value.theme) &&
    (value.rewardKind === undefined || value.rewardKind === "launch" || value.rewardKind === "arrival") &&
    typeof value.userName === "string" &&
    (value.preferredTone === "calm" ||
      value.preferredTone === "direct" ||
      value.preferredTone === "encouraging") &&
    (value.rocketName === undefined || typeof value.rocketName === "string") &&
    (value.rocketDedication === undefined || typeof value.rocketDedication === "string") &&
    typeof value.stageName === "string" &&
    typeof value.destinationName === "string" &&
    typeof value.milestoneName === "string" &&
    typeof value.milestoneDescription === "string" &&
    typeof value.completedAt === "string"
  );
}

function loadStoredJourneyState(): StoredJourneyState | null {
  try {
    const saved = localStorage.getItem(JOURNEY_STORAGE_KEY);

    if (!saved) return null;

    const parsed = JSON.parse(saved) as unknown;

    if (!isObject(parsed) || parsed.version !== JOURNEY_STORAGE_VERSION) return null;

    const currentUser = parsed.currentUser === null ? null : parsed.currentUser;
    const currentJourney = parsed.currentJourney === null ? null : parsed.currentJourney;

    if (currentUser !== null && !isUserProfile(currentUser)) return null;
    if (currentJourney !== null && !isGoalJourney(currentJourney)) return null;
    if (!isMentorState(parsed.mentorState)) return null;

    return {
      version: JOURNEY_STORAGE_VERSION,
      currentUser,
      currentJourney: currentJourney ? normalizeJourney(currentJourney) : null,
      mentorState: parsed.mentorState,
      milestoneRewardHistory: Array.isArray(parsed.milestoneRewardHistory)
        ? parsed.milestoneRewardHistory.filter(isMilestoneRewardHistoryEntry)
        : [],
    };
  } catch {
    return null;
  }
}

function saveStoredJourneyState(state: StoredJourneyState) {
  localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(state));
}

function createUserProfile(answers: OnboardingAnswers, previousProfile?: UserProfile | null): UserProfile {
  const name = cleanText(answers.name, "Friend");
  const primaryLifeGoal = cleanText(answers.primaryLifeGoal, "Build a steadier life");
  const biggestStruggle = cleanText(answers.biggestStruggle, "staying consistent");

  return {
    id: "local-user",
    name,
    preferredTone: answers.preferredTone,
    currentFocus: primaryLifeGoal,
    primaryLifeGoal,
    biggestStruggle,
    motivationStyle: answers.motivationStyle,
    desiredRewardStyle: answers.desiredRewardStyle,
    rocketName: previousProfile?.rocketName ?? DEFAULT_ROCKET_NAME,
    rocketDedication: previousProfile?.rocketDedication ?? DEFAULT_ROCKET_DEDICATION,
  };
}

function createInitialJourney(answers: OnboardingAnswers): GoalJourney {
  const goal = cleanText(answers.primaryLifeGoal, "Build a steadier life");
  const struggle = cleanText(answers.biggestStruggle, "staying consistent");
  const firstStageName = chooseFirstStageName(struggle);
  const firstDestination = getSpaceDestinationByIndex(0);
  const moonDestination = getSpaceDestinationByIndex(1);
  const marsDestination = getSpaceDestinationByIndex(2);
  const europaDestination = getSpaceDestinationByIndex(3);
  const titanDestination = getSpaceDestinationByIndex(4);

  return {
    id: "personal-journey",
    title: goal,
    destinationName: titanDestination.label,
    currentStageIndex: 0,
    currentDestinationIndex: 0,
    journeyPhase: "grounded",
    majorActionAvailable: false,
    majorActionType: null,
    progress: 0,
    stages: [
      {
        id: "stage-1",
        destinationId: firstDestination.id,
        planetName: firstStageName,
        theme: answers.desiredRewardStyle,
        stageNumber: 1,
        estimatedMilestones: 3,
        milestones: [
          {
            id: "first-signal",
            name: "First Signal",
            description: `Send the first clear signal toward ${goal}.`,
            requiredProgress: 1,
            completed: false,
            isMajor: false,
          },
          {
            id: "steady-pattern",
            name: "Steady Pattern",
            description: `Keep moving even while ${struggle} is present.`,
            requiredProgress: 3,
            completed: false,
            isMajor: false,
          },
          {
            id: "launch-window",
            name: "Launch Window",
            description: "Reach the first major checkpoint and open the next part of the route.",
            requiredProgress: 5,
            completed: false,
            isMajor: true,
          },
        ],
      },
      {
        id: "stage-2",
        destinationId: moonDestination.id,
        planetName: moonDestination.label,
        theme: answers.desiredRewardStyle,
        stageNumber: 2,
        estimatedMilestones: 4,
        milestones: [
          {
            id: "route-adjustment",
            name: "Route Adjustment",
            description: "Adjust the route without treating a setback as the end of the mission.",
            requiredProgress: 8,
            completed: false,
            isMajor: false,
          },
          {
            id: "deep-space-burn",
            name: "Deep Space Burn",
            description: "Sustain momentum long enough to leave the old pattern behind.",
            requiredProgress: 12,
            completed: false,
            isMajor: true,
          },
        ],
      },
      {
        id: "stage-3",
        destinationId: marsDestination.id,
        planetName: marsDestination.label,
        theme: answers.desiredRewardStyle,
        stageNumber: 3,
        estimatedMilestones: 5,
        milestones: [
          {
            id: "vision-lock",
            name: "Vision Lock",
            description: `Reconnect daily action to the larger reason: ${goal}.`,
            requiredProgress: 16,
            completed: false,
            isMajor: false,
          },
          {
            id: "arrival-sequence",
            name: "Arrival Sequence",
            description: "Complete a major transformation checkpoint and prepare for arrival.",
            requiredProgress: 20,
            completed: false,
            isMajor: true,
          },
        ],
      },
      {
        id: "stage-4",
        destinationId: europaDestination.id,
        planetName: europaDestination.label,
        theme: answers.desiredRewardStyle,
        stageNumber: 4,
        estimatedMilestones: 5,
        milestones: [
          {
            id: "surface-signal",
            name: "Surface Signal",
            description: "Keep the route alive after a major arrival.",
            requiredProgress: 24,
            completed: false,
            isMajor: false,
          },
          {
            id: "outer-leg-arrival",
            name: "Outer Leg Arrival",
            description: "Complete another major travel leg and prove the mission can repeat.",
            requiredProgress: 28,
            completed: false,
            isMajor: true,
          },
        ],
      },
      {
        id: "stage-5",
        destinationId: titanDestination.id,
        planetName: titanDestination.label,
        theme: answers.desiredRewardStyle,
        stageNumber: 5,
        estimatedMilestones: 5,
        milestones: [
          {
            id: "final-approach",
            name: "Final Approach",
            description: `Reconnect the daily signal to the full destination: ${goal}.`,
            requiredProgress: 32,
            completed: false,
            isMajor: false,
          },
          {
            id: "mission-arrival",
            name: "Mission Arrival",
            description: "Land the larger journey and mark a meaningful transformation point.",
            requiredProgress: 36,
            completed: false,
            isMajor: true,
          },
        ],
      },
    ],
  };
}

function completeReachedMilestones(journey: GoalJourney, nextProgress: number): GoalJourney {
  const stages = journey.stages.map((stage) => ({
    ...stage,
    milestones: stage.milestones.map((milestone) => ({
      ...milestone,
      completed: milestone.completed || nextProgress >= milestone.requiredProgress,
    })),
  }));
  const nextJourney = {
    ...journey,
    progress: nextProgress,
    stages,
  };
  const currentStage = stages[journey.currentStageIndex];
  const majorMilestoneComplete = Boolean(
    currentStage?.milestones.some((milestone) => milestone.isMajor && milestone.completed)
  );
  const basePhase = journey.journeyPhase === "arrived" ? "grounded" : journey.journeyPhase;
  const nextPhase =
    majorMilestoneComplete && basePhase === "grounded"
      ? "actionReady"
      : majorMilestoneComplete && basePhase === "inProgress"
        ? "arrivalReady"
        : basePhase;

  return normalizeJourney(nextJourney, nextPhase);
}

function findNewMajorMilestone(previous: GoalJourney, next: GoalJourney): { stage: JourneyStage; milestone: Milestone } | null {
  const activeStageIndex = next.currentStageIndex;
  const stage = next.stages[activeStageIndex];

  if (!stage) return null;

  for (const [milestoneIndex, milestone] of stage.milestones.entries()) {
    const previousMilestone = previous.stages[activeStageIndex]?.milestones[milestoneIndex];

    if (milestone.isMajor && milestone.completed && !previousMilestone?.completed) {
      return { stage, milestone };
    }
  }

  return null;
}

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [storedState] = useState<StoredJourneyState | null>(() => loadStoredJourneyState());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storedState?.currentUser ?? null);
  const [currentJourney, setCurrentJourney] = useState<GoalJourney | null>(storedState?.currentJourney ?? null);
  const [mentorState, setMentorState] = useState<MentorState>(storedState?.mentorState ?? "avoiding");
  const [activeMilestoneReward, setActiveMilestoneReward] = useState<MilestoneRewardEvent | null>(null);
  const [milestoneRewardHistory, setMilestoneRewardHistory] = useState<MilestoneRewardHistoryEntry[]>(
    storedState?.milestoneRewardHistory ?? []
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const missionAction = currentJourney?.majorActionAvailable ? currentJourney.majorActionType : null;

  useEffect(() => {
    saveStoredJourneyState({
      version: JOURNEY_STORAGE_VERSION,
      currentUser,
      currentJourney,
      mentorState,
      milestoneRewardHistory,
    });
  }, [currentJourney, currentUser, mentorState, milestoneRewardHistory]);

  function completeOnboarding(answers: OnboardingAnswers) {
    setCurrentUser(createUserProfile(answers, currentUser));
    setCurrentJourney(createInitialJourney(answers));
    setMentorState("avoiding");
    setActiveMilestoneReward(null);
    setMilestoneRewardHistory((current) => (currentUser ? current : []));
    setIsEditingProfile(false);
  }

  function startProfileEdit() {
    setIsEditingProfile(true);
  }

  function cancelProfileEdit() {
    setIsEditingProfile(false);
  }

  function resetJourney() {
    setCurrentUser(null);
    setCurrentJourney(null);
    setMentorState("avoiding");
    setActiveMilestoneReward(null);
    setMilestoneRewardHistory([]);
    setIsEditingProfile(false);
  }

  function markActivity() {
    setMentorState("momentum");
  }

  function markStuck() {
    setMentorState("setback");
  }

  function dismissMilestoneReward() {
    setActiveMilestoneReward(null);
  }

  function completeMilestoneProgress(options: { suppressReward?: boolean } = {}) {
    setCurrentJourney((previousJourney) => {
      if (!previousJourney) return previousJourney;

      const nextJourney = completeReachedMilestones(previousJourney, previousJourney.progress + 1);
      const newMajorMilestone = findNewMajorMilestone(previousJourney, nextJourney);
      if (nextJourney.progress > previousJourney.progress || newMajorMilestone) {
        setMentorState("momentum");
      }

      return nextJourney;
    });
  }

  function triggerMissionAction() {
    setCurrentJourney((previousJourney) => {
      if (!previousJourney) return previousJourney;

      const action = previousJourney.majorActionAvailable ? previousJourney.majorActionType : null;
      const completedMajor = getActiveMajorMilestone(previousJourney);

      if (!action || !completedMajor || !currentUser) return previousJourney;

      const landedDestinationIndex = previousJourney.currentStageIndex;
      const nextDestinationIndex =
        action === "land"
          ? Math.min(landedDestinationIndex, previousJourney.stages.length - 1)
          : previousJourney.currentDestinationIndex;
      const nextStageIndex =
        action === "launch"
          ? Math.min(previousJourney.currentStageIndex + 1, previousJourney.stages.length - 1)
          : Math.min(previousJourney.currentStageIndex + 1, previousJourney.stages.length - 1);
      const safeNextStageIndex =
        action === "land"
          ? Math.max(nextDestinationIndex, nextStageIndex)
          : nextStageIndex;
      const nextPhase: JourneyPhase = action === "land" ? "arrived" : "inProgress";
      const updatedJourney: GoalJourney = normalizeJourney({
        ...previousJourney,
        currentDestinationIndex: nextDestinationIndex,
        currentStageIndex: safeNextStageIndex,
      }, nextPhase);
      const rewardEvent: MilestoneRewardEvent = {
        id: `${completedMajor.milestone.id}-${previousJourney.progress}-${Date.now()}`,
        theme: completedMajor.stage.theme,
        rewardKind: action === "land" ? "arrival" : "launch",
        userName: currentUser.name,
        preferredTone: currentUser.preferredTone,
        rocketName: currentUser.rocketName ?? DEFAULT_ROCKET_NAME,
        rocketDedication: currentUser.rocketDedication ?? DEFAULT_ROCKET_DEDICATION,
        stageName: completedMajor.stage.planetName,
        destinationName: previousJourney.destinationName,
        milestoneName: completedMajor.milestone.name,
        milestoneDescription: completedMajor.milestone.description,
      };

      setMentorState("momentum");
      setMilestoneRewardHistory((current) => [
        { ...rewardEvent, completedAt: new Date().toISOString() },
        ...current,
      ]);
      setActiveMilestoneReward(rewardEvent);

      return updatedJourney;
    });
  }

  const value = useMemo(
    () => ({
      currentUser,
      currentJourney,
      mentorState,
      activeMilestoneReward,
      milestoneRewardHistory,
      isEditingProfile,
      isOnboarded: Boolean(currentUser && currentJourney),
      missionAction,
      completeOnboarding,
      startProfileEdit,
      cancelProfileEdit,
      resetJourney,
      markActivity,
      markStuck,
      dismissMilestoneReward,
      completeMilestoneProgress,
      triggerMissionAction,
    }),
    [
      activeMilestoneReward,
      currentJourney,
      currentUser,
      isEditingProfile,
      missionAction,
      mentorState,
      milestoneRewardHistory,
    ]
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const context = useContext(JourneyContext);

  if (!context) {
    throw new Error("useJourney must be used inside JourneyProvider");
  }

  return context;
}
