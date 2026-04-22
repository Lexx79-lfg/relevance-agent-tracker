export type TaskProgressFeedbackDetail = {
  rewarded: boolean;
};

export const TASK_PROGRESS_FEEDBACK_EVENT = "relevance-agent:task-progress-feedback";

export function emitTaskProgressFeedback(detail: TaskProgressFeedbackDetail) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent<TaskProgressFeedbackDetail>(TASK_PROGRESS_FEEDBACK_EVENT, { detail }));
}

