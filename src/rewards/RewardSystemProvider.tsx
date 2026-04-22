import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TASK_PROGRESS_FEEDBACK_EVENT } from "../interaction/taskProgressFeedback";
import { getRewardTheme } from "./rewardThemes";
import { createRewardInitialState, rewardReducer } from "./rewardReducer";
import type { RewardEngineState, RewardThemeCopyInput, RewardThemeDefinition, RewardThemeId } from "./types";

type RewardSystemContextValue = {
  copy: RewardThemeCopyInput;
  dismissCelebration: () => void;
  earnProgress: () => void;
  state: RewardEngineState;
  theme: RewardThemeDefinition;
};

type RewardSystemProviderProps = {
  children: ReactNode;
  currentValue: number;
  deferMilestoneSequence?: boolean;
  destinationName?: string;
  journeyPhase?: string;
  onProgressCommit: () => void;
  soundEnabled: boolean;
  stageName?: string;
  targetName?: string;
  targetValue: number;
  themeId: RewardThemeId;
  userName?: string;
};

const RewardSystemContext = createContext<RewardSystemContextValue | null>(null);

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReducedMotion(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
    }

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

export function RewardSystemProvider({
  children,
  currentValue,
  deferMilestoneSequence = false,
  destinationName,
  journeyPhase,
  onProgressCommit,
  soundEnabled,
  stageName,
  targetName,
  targetValue,
  themeId,
  userName,
}: RewardSystemProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const theme = getRewardTheme(themeId);
  const timersRef = useRef<number[]>([]);
  const latestProgressRef = useRef({ currentValue, targetValue });
  const currentCopy = useMemo<RewardThemeCopyInput>(
    () => ({
      destinationName,
      journeyPhase,
      stageName,
      targetName,
      userName,
    }),
    [destinationName, journeyPhase, stageName, targetName, userName]
  );
  const [celebrationCopy, setCelebrationCopy] = useState<RewardThemeCopyInput | null>(null);
  const [state, dispatch] = useReducer(
    rewardReducer,
    createRewardInitialState({
      currentValue,
      reducedMotion,
      selectedThemeId: themeId,
      soundEnabled,
      targetValue,
    })
  );

  useEffect(() => {
    latestProgressRef.current = { currentValue, targetValue };
    dispatch({ type: "syncProgress", currentValue, targetValue });
  }, [currentValue, targetValue]);

  useEffect(() => {
    dispatch({ type: "setReducedMotion", reducedMotion });
  }, [reducedMotion]);

  useEffect(() => {
    dispatch({ type: "setSoundEnabled", soundEnabled });
  }, [soundEnabled]);

  useEffect(() => {
    dispatch({ type: "setTheme", selectedThemeId: themeId });
  }, [themeId]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    function handleTaskProgressFeedback() {
      clearTimers();

      const current = latestProgressRef.current;
      dispatch({ type: "tokenFeedback", currentValue: current.currentValue, targetValue: current.targetValue });
      theme.playSound?.("token", soundEnabled);
      schedule(() => dispatch({ type: "setPhase", phase: "idle" }), reducedMotion ? 260 : theme.timing.tokenFeedbackMs);
    }

    window.addEventListener(TASK_PROGRESS_FEEDBACK_EVENT, handleTaskProgressFeedback);

    return () => window.removeEventListener(TASK_PROGRESS_FEEDBACK_EVENT, handleTaskProgressFeedback);
  }, [reducedMotion, soundEnabled, theme]);

  function clearTimers() {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }

  const earnProgress = useCallback(() => {
    clearTimers();

    const previous = latestProgressRef.current;
    const nextValue = previous.currentValue + 1;
    const milestoneReached = nextValue >= previous.targetValue;
    const previousPercent = previous.currentValue / Math.max(previous.targetValue, 1);
    const nextPercent = nextValue / Math.max(previous.targetValue, 1);
    const checkpointReached = !milestoneReached && previousPercent < 0.5 && nextPercent >= 0.5;

    onProgressCommit();

    if (milestoneReached) {
      dispatch({ type: "milestoneCharge", currentValue: nextValue, targetValue: previous.targetValue });
      theme.playSound?.("milestoneCharge", soundEnabled);

      if (deferMilestoneSequence) {
        schedule(
          () => dispatch({ type: "setPhase", phase: "idle" }),
          reducedMotion ? 420 : theme.timing.milestoneChargeMs
        );
        return;
      }

      setCelebrationCopy(currentCopy);

      if (reducedMotion) {
        schedule(() => {
          dispatch({ type: "milestoneCelebrate" });
          theme.playSound?.("milestoneCelebrate", soundEnabled);
        }, 180);
        schedule(() => dispatch({ type: "setPhase", phase: "milestoneSettle" }), 1500);
        schedule(() => {
          dispatch({ type: "setPhase", phase: "idle" });
          setCelebrationCopy(null);
        }, 2200);
        return;
      }

      schedule(() => {
        dispatch({ type: "setPhase", phase: "milestoneLaunch" });
        theme.playSound?.("milestoneLaunch", soundEnabled);
      }, theme.timing.milestoneChargeMs);
      schedule(() => {
        dispatch({ type: "milestoneCelebrate" });
        theme.playSound?.("milestoneCelebrate", soundEnabled);
      }, theme.timing.milestoneChargeMs + theme.timing.milestoneLaunchMs);
      schedule(
        () => dispatch({ type: "setPhase", phase: "milestoneSettle" }),
        theme.timing.milestoneChargeMs + theme.timing.milestoneLaunchMs + theme.timing.milestoneCelebrateMs
      );
      schedule(
        () => {
          dispatch({ type: "setPhase", phase: "idle" });
          setCelebrationCopy(null);
        },
        theme.timing.milestoneChargeMs +
          theme.timing.milestoneLaunchMs +
          theme.timing.milestoneCelebrateMs +
          theme.timing.milestoneSettleMs
      );
      return;
    }

    if (checkpointReached) {
      dispatch({ type: "checkpointFeedback", currentValue: nextValue, targetValue: previous.targetValue });
      theme.playSound?.("checkpoint", soundEnabled);
      schedule(() => dispatch({ type: "setPhase", phase: "idle" }), reducedMotion ? 500 : theme.timing.checkpointFeedbackMs);
      return;
    }

    dispatch({ type: "tokenFeedback", currentValue: nextValue, targetValue: previous.targetValue });
    theme.playSound?.("token", soundEnabled);
    schedule(() => dispatch({ type: "setPhase", phase: "idle" }), reducedMotion ? 420 : theme.timing.tokenFeedbackMs);
  }, [currentCopy, deferMilestoneSequence, onProgressCommit, reducedMotion, soundEnabled, theme]);

  const value = useMemo<RewardSystemContextValue>(
    () => ({
      copy:
        state.phase === "milestoneCelebrate" || state.phase === "milestoneSettle"
          ? celebrationCopy ?? currentCopy
          : currentCopy,
      dismissCelebration: () => dispatch({ type: "setPhase", phase: "milestoneSettle" }),
      earnProgress,
      state,
      theme,
    }),
    [celebrationCopy, currentCopy, earnProgress, state, theme]
  );

  return <RewardSystemContext.Provider value={value}>{children}</RewardSystemContext.Provider>;
}

export function useRewardSystem() {
  const context = useContext(RewardSystemContext);

  if (!context) {
    throw new Error("useRewardSystem must be used inside RewardSystemProvider");
  }

  return context;
}
