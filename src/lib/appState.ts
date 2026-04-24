import { getModeQuote } from "./mentor";
import type { AppState, AppTask, DailyCheckIn, LogEntry, MentorMode, MentorProfile } from "../types/app";

export const APP_STORAGE_KEY = "relevance-agent-state";
export const LAUNCH_FUEL_REQUIRED = 7;

const DEFAULT_DAILY_CHECK_IN: DailyCheckIn = {
  feeling: "steady",
  need: "action",
  note: "",
};

const DEFAULT_MENTOR_PROFILE: MentorProfile = {
  name: "Alex",
  preferredTone: "calm",
  defaultMode: "execution",
  theme: "starshooter",
  soundProfile: "default",
  milestoneEffect: "rocket-progress",
};

const MENTOR_MODES: MentorMode[] = ["regulation", "execution", "strategy", "partner"];

function isMentorMode(value: unknown): value is MentorMode {
  return typeof value === "string" && MENTOR_MODES.includes(value as MentorMode);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAppTask(value: unknown): value is AppTask {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.status === "active" || value.status === "completed") &&
    typeof value.updatedAt === "string"
  );
}

export function getDefaultAppState(): AppState {
  return {
    mission: "Make the app work",
    currentMission: "Make the app work",
    mode: DEFAULT_MENTOR_PROFILE.defaultMode,
    userText:
      "This is the first real test of the app that CPT and I made. Is it really going to be able to help improve people's lives.",
    response: null,
    quote: getModeQuote(DEFAULT_MENTOR_PROFILE.defaultMode),
    missionFuel: 0,
    launchFuelRequired: LAUNCH_FUEL_REQUIRED,
    journeyProgress: 0,
    tasks: [],
    tokens: 0,
    milestone: LAUNCH_FUEL_REQUIRED,
    completedSteps: 0,
    completedActions: 0,
    log: [],
    dailyCheckIn: DEFAULT_DAILY_CHECK_IN,
    mentorProfile: DEFAULT_MENTOR_PROFILE,
  };
}

export function loadAppState(): AppState {
  const defaults = getDefaultAppState();
  const saved = localStorage.getItem(APP_STORAGE_KEY);

  if (!saved) return defaults;

  try {
    const parsed = JSON.parse(saved) as Partial<AppState>;
    const savedProfile = isObject(parsed.mentorProfile) ? parsed.mentorProfile : {};
    const savedCheckIn = isObject(parsed.dailyCheckIn) ? parsed.dailyCheckIn : {};
    const mode = isMentorMode(parsed.mode) ? parsed.mode : defaults.mode;
    const launchFuelRequired =
      typeof parsed.launchFuelRequired === "number" ? parsed.launchFuelRequired : defaults.launchFuelRequired;
    const missionFuel =
      typeof parsed.missionFuel === "number"
        ? parsed.missionFuel
        : typeof parsed.tokens === "number"
          ? parsed.tokens
          : defaults.missionFuel;
    const normalizedFuel = Math.max(0, Math.min(missionFuel, launchFuelRequired));

    return {
      ...defaults,
      mission: typeof parsed.mission === "string" ? parsed.mission : defaults.mission,
      currentMission:
        typeof parsed.currentMission === "string"
          ? parsed.currentMission
          : typeof parsed.mission === "string"
            ? parsed.mission
            : defaults.currentMission,
      mode,
      userText: typeof parsed.userText === "string" ? parsed.userText : defaults.userText,
      response: parsed.response ?? defaults.response,
      quote: typeof parsed.quote === "string" ? parsed.quote : defaults.quote,
      missionFuel: normalizedFuel,
      launchFuelRequired,
      journeyProgress:
        typeof parsed.journeyProgress === "number" ? parsed.journeyProgress : defaults.journeyProgress,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks.filter(isAppTask) : defaults.tasks,
      tokens: normalizedFuel,
      milestone: launchFuelRequired,
      completedSteps:
        typeof parsed.completedSteps === "number" ? parsed.completedSteps : defaults.completedSteps,
      completedActions:
        typeof parsed.completedActions === "number" ? parsed.completedActions : defaults.completedActions,
      log: Array.isArray(parsed.log) ? (parsed.log as LogEntry[]) : defaults.log,
      dailyCheckIn: {
        ...defaults.dailyCheckIn,
        ...savedCheckIn,
      },
      mentorProfile: {
        ...defaults.mentorProfile,
        ...savedProfile,
      },
    };
  } catch {
    return defaults;
  }
}

export function saveAppState(state: AppState) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}

export function getMissionFuelCount(state: AppState) {
  return state.missionFuel;
}

type CompleteMeaningfulMoveInput = {
  title: string;
  source: "task" | "quick_move" | "guidance";
  taskId?: string;
};

function toLogEntry(state: AppState, note: string): LogEntry {
  return {
    id: Date.now(),
    time: new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    mode: state.mode,
    mission: state.currentMission || state.mission || "Unnamed mission",
    note,
  };
}

export function completeMeaningfulMove(input: CompleteMeaningfulMoveInput) {
  const trimmedTitle = input.title.trim();

  if (!trimmedTitle) {
    return { ok: false as const };
  }

  const current = loadAppState();
  const nextFuel = Math.min(current.missionFuel + 1, current.launchFuelRequired);
  const nextState: AppState = {
    ...current,
    missionFuel: nextFuel,
    tokens: nextFuel,
    completedActions: current.completedActions + 1,
    completedSteps: current.completedSteps + 1,
    tasks: current.tasks.map((task) =>
      input.taskId && task.id === input.taskId
        ? {
            ...task,
            status: "completed",
            updatedAt: new Date().toISOString(),
          }
        : task
    ),
    log: [toLogEntry(current, trimmedTitle), ...current.log].slice(0, 8),
  };

  saveAppState(nextState);

  return {
    ok: true as const,
    state: nextState,
  };
}

export function addTask(title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { ok: false as const };
  }

  const current = loadAppState();
  const nextTask: AppTask = {
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: trimmedTitle,
    status: "active",
    updatedAt: new Date().toISOString(),
  };
  const nextState: AppState = {
    ...current,
    tasks: [nextTask, ...current.tasks],
  };

  saveAppState(nextState);

  return {
    ok: true as const,
    state: nextState,
  };
}

export function updateTaskTitle(taskId: string, title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { ok: false as const };
  }

  const current = loadAppState();
  const nextState: AppState = {
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            title: trimmedTitle,
            updatedAt: new Date().toISOString(),
          }
        : task
    ),
  };

  saveAppState(nextState);

  return {
    ok: true as const,
    state: nextState,
  };
}

export function deleteTask(taskId: string) {
  const current = loadAppState();
  const nextState: AppState = {
    ...current,
    tasks: current.tasks.filter((task) => task.id !== taskId),
  };

  saveAppState(nextState);

  return nextState;
}

export function recordMissionLaunch() {
  const current = loadAppState();
  const nextState: AppState = {
    ...current,
    journeyProgress: current.journeyProgress + 1,
    missionFuel: 0,
    tokens: 0,
  };

  saveAppState(nextState);

  return nextState;
}

export function resetTestDataState() {
  const current = loadAppState();
  const nextState: AppState = {
    ...getDefaultAppState(),
    mission: current.mission,
    currentMission: current.currentMission || current.mission,
    mode: current.mode,
    userText: current.userText,
    dailyCheckIn: current.dailyCheckIn,
    mentorProfile: current.mentorProfile,
    response: null,
    quote: getModeQuote(current.mode),
  };

  saveAppState(nextState);

  return nextState;
}
