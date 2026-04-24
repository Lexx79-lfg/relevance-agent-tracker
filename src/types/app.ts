export type MentorMode = "regulation" | "execution" | "strategy" | "partner";

export type MentorResponse = {
  title: string;
  summary: string;
  helpfulPhrase: string;
  nextStep: string;
};

export type LogEntry = {
  id: number;
  time: string;
  mode: MentorMode;
  mission: string;
  note: string;
};

export type DailyCheckIn = {
  feeling: "steady" | "stressed" | "stuck" | "tender";
  need: "calm" | "action" | "clarity" | "connection";
  note: string;
};

export type MentorProfile = {
  name: string;
  preferredTone: "calm" | "direct" | "encouraging";
  defaultMode: MentorMode;
  theme: "starshooter";
  soundProfile: "default";
  milestoneEffect: "rocket-progress";
};

export type AppTask = {
  id: string;
  title: string;
  status: "active" | "completed";
  updatedAt: string;
};

export type AppState = {
  mission: string;
  currentMission: string;
  mode: MentorMode;
  userText: string;
  response: MentorResponse | null;
  quote: string;
  missionFuel: number;
  launchFuelRequired: number;
  journeyProgress: number;
  tasks: AppTask[];
  tokens: number;
  milestone: number;
  completedSteps: number;
  completedActions: number;
  log: LogEntry[];
  dailyCheckIn: DailyCheckIn;
  mentorProfile: MentorProfile;
};
