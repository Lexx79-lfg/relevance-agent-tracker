export type MentorState = "avoiding" | "momentum" | "setback";

export type MentorTone = "calm" | "direct" | "encouraging";

export type MotivationStyle = "gentle" | "structured" | "challenge" | "reflective";

export type RewardStyle = "rocket" | "celebration" | "quiet" | "adventure";

export type JourneyPhase = "grounded" | "actionReady" | "inProgress" | "arrivalReady" | "arrived";

export type MajorActionType = "launch" | "land";

export type MissionAction = MajorActionType;

export type MilestoneRewardKind = "launch" | "arrival";

export type SpaceDestination = {
  id: string;
  label: string;
};

export type OnboardingAnswers = {
  name: string;
  preferredTone: MentorTone;
  primaryLifeGoal: string;
  biggestStruggle: string;
  motivationStyle: MotivationStyle;
  desiredRewardStyle: RewardStyle;
};

export type UserProfile = {
  id: string;
  name: string;
  preferredTone: MentorTone;
  currentFocus: string;
  primaryLifeGoal: string;
  biggestStruggle: string;
  motivationStyle: MotivationStyle;
  desiredRewardStyle: RewardStyle;
  rocketName?: string;
  rocketDedication?: string;
};

export type Milestone = {
  id: string;
  name: string;
  description: string;
  requiredProgress: number;
  completed: boolean;
  isMajor: boolean;
};

export type JourneyStage = {
  id: string;
  destinationId?: string;
  planetName: string;
  theme: RewardStyle;
  stageNumber: number;
  estimatedMilestones: number;
  milestones: Milestone[];
};

export type GoalJourney = {
  id: string;
  title: string;
  destinationName: string;
  currentStageIndex: number;
  currentDestinationIndex: number;
  journeyPhase: JourneyPhase;
  majorActionAvailable: boolean;
  majorActionType: MajorActionType | null;
  progress: number;
  stages: JourneyStage[];
};

export type MilestoneRewardEvent = {
  id: string;
  theme: RewardStyle;
  rewardKind: MilestoneRewardKind;
  userName: string;
  preferredTone: MentorTone;
  rocketName?: string;
  rocketDedication?: string;
  stageName: string;
  destinationName: string;
  milestoneName: string;
  milestoneDescription: string;
};

export type MilestoneRewardHistoryEntry = MilestoneRewardEvent & {
  completedAt: string;
};
