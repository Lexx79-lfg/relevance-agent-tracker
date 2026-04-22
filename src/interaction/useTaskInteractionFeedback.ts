import { useCallback, useEffect, useRef, useState } from "react";
import type { TaskFeedbackOptions, TaskInteractionState } from "./feedbackTypes";

const EMPTY_STATE: TaskInteractionState = {
  isActivated: false,
  isCompleted: false,
};

export function useTaskInteractionFeedback() {
  const timersRef = useRef<number[]>([]);
  const [activatedTaskId, setActivatedTaskId] = useState<string | null>(null);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [pulseRewarded, setPulseRewarded] = useState(false);
  const [pulseVisible, setPulseVisible] = useState(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }, []);

  const triggerTaskFeedback = useCallback(
    (taskId: string, options: TaskFeedbackOptions = {}) => {
      clearTimers();
      setActivatedTaskId(taskId);
      setCompletedTaskId(null);
      setPulseRewarded(Boolean(options.rewarded));

      timersRef.current.push(
        window.setTimeout(() => {
          setCompletedTaskId(taskId);
          setPulseKey((current) => current + 1);
          setPulseVisible(true);
        }, 120)
      );

      timersRef.current.push(
        window.setTimeout(() => {
          setActivatedTaskId(null);
          setCompletedTaskId(null);
        }, 360)
      );

      timersRef.current.push(
        window.setTimeout(() => {
          setPulseVisible(false);
        }, 440)
      );
    },
    [clearTimers]
  );

  useEffect(() => clearTimers, [clearTimers]);

  const getTaskFeedbackState = useCallback(
    (taskId: string): TaskInteractionState => ({
      isActivated: activatedTaskId === taskId,
      isCompleted: completedTaskId === taskId,
    }),
    [activatedTaskId, completedTaskId]
  );

  return {
    getTaskFeedbackState,
    pulseKey,
    pulseRewarded,
    pulseVisible,
    triggerTaskFeedback,
  };
}
