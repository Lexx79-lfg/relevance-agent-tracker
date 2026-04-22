import { getModeQuote } from "./mentor";
import type { AppState, DailyCheckIn, LogEntry, MentorMode, MentorProfile } from "../types/app";

export const APP_STORAGE_KEY = "relevance-agent-state";

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

export function getDefaultAppState(): AppState {
  return {
    mission: "Make the app work",
    mode: DEFAULT_MENTOR_PROFILE.defaultMode,
    userText:
      "This is the first real test of the app that CPT and I made. Is it really going to be able to help improve people's lives.",
    response: null,
    quote: getModeQuote(DEFAULT_MENTOR_PROFILE.defaultMode),
    tokens: 2,
    milestone: 10,
    completedSteps: 0,
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

    return {
      ...defaults,
      mission: typeof parsed.mission === "string" ? parsed.mission : defaults.mission,
      mode,
      userText: typeof parsed.userText === "string" ? parsed.userText : defaults.userText,
      response: parsed.response ?? defaults.response,
      quote: typeof parsed.quote === "string" ? parsed.quote : defaults.quote,
      tokens: typeof parsed.tokens === "number" ? parsed.tokens : defaults.tokens,
      milestone: typeof parsed.milestone === "number" ? parsed.milestone : defaults.milestone,
      completedSteps:
        typeof parsed.completedSteps === "number"
          ? parsed.completedSteps
          : defaults.completedSteps,
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
