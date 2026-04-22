import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useJourney } from "../context/JourneyContext";
import { emitTaskProgressFeedback } from "../interaction/taskProgressFeedback";
import { useTaskInteractionFeedback } from "../interaction/useTaskInteractionFeedback";
import { getProgressQuote } from "../quotes/progressQuotes";
import { ProgressQuote } from "../quotes/ProgressQuote";
import { TaskProgressPulse } from "../rewards/components/TaskProgressPulse";
import { getRocketTaskProgressPulseTone } from "../themes/rocket/taskFeedbackAdapter";
import { getRocketMissionStateForPhase } from "../themes/rocket/rocketMissionAdapter";
import { LaunchPadPanel } from "../components/LaunchPadPanel";

type TaskStatus = "open" | "complete";
type TaskLevel = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  importance: TaskLevel;
  urgency: TaskLevel;
  consequenceLevel: TaskLevel;
  effortLevel: TaskLevel;
  notes: string;
};

const TASK_LEVELS: TaskLevel[] = ["low", "medium", "high"];

const LEVEL_LABELS: Record<TaskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const LEVEL_SCORES: Record<TaskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getTaskScore(task: Task) {
  return (
    LEVEL_SCORES[task.consequenceLevel] * 4 +
    LEVEL_SCORES[task.urgency] * 3 +
    LEVEL_SCORES[task.importance] * 2 -
    LEVEL_SCORES[task.effortLevel]
  );
}

function findRecommendedTask(tasks: Task[]) {
  const openTasks = tasks.filter((task) => task.status === "open");

  if (openTasks.length === 0) return null;

  return [...openTasks].sort((first, second) => getTaskScore(second) - getTaskScore(first))[0];
}

function shouldEarnMissionProgress(task: Task) {
  return task.consequenceLevel === "high" || task.importance === "high" || task.urgency === "high";
}

export function TasksPage() {
  const { completeMilestoneProgress, markActivity, currentJourney, currentUser } = useJourney();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState<TaskLevel>("medium");
  const [urgency, setUrgency] = useState<TaskLevel>("medium");
  const [consequenceLevel, setConsequenceLevel] = useState<TaskLevel>("medium");
  const [effortLevel, setEffortLevel] = useState<TaskLevel>("medium");
  const [notes, setNotes] = useState("");
  const [missionMessage, setMissionMessage] = useState("Complete an important task to load mission fuel.");
  const [progressQuote, setProgressQuote] = useState<string | null>(() => getProgressQuote("no_tasks_state", { force: true }));
  const taskFeedback = useTaskInteractionFeedback();
  const recommendedTask = useMemo(() => findRecommendedTask(tasks), [tasks]);
  const canAddTask = title.trim().length >= 3;

  useEffect(() => {
    if (!progressQuote) return;

    const timeoutId = window.setTimeout(() => setProgressQuote(null), 3000);

    return () => window.clearTimeout(timeoutId);
  }, [progressQuote]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!canAddTask) {
      setMissionMessage("Name one real task first. A clear signal starts with a clear action.");
      return;
    }

    const nextTask: Task = {
      id: createTaskId(),
      title: trimmedTitle,
      status: "open",
      importance,
      urgency,
      consequenceLevel,
      effortLevel,
      notes: notes.trim(),
    };

    setTasks((current) => [nextTask, ...current]);
    setTitle("");
    setNotes("");
    setMissionMessage("Task captured. Choose one grounded next move.");
  }

  function completeTask(task: Task) {
    if (task.status === "complete") return;

    const earnsProgress = shouldEarnMissionProgress(task);
    taskFeedback.triggerTaskFeedback(task.id, { rewarded: earnsProgress });
    setTasks((current) =>
      current.map((candidate) =>
        candidate.id === task.id ? { ...candidate, status: "complete" } : candidate
      )
    );
    markActivity();

    if (earnsProgress) {
      completeMilestoneProgress({ suppressReward: true });
      setMissionMessage("Fuel added. Progress stored.");
      setProgressQuote(getProgressQuote("important_task_complete", { force: true }));
    } else {
      setMissionMessage("Progress stored. Mission fuel waits for high-importance, urgent, or high-consequence work.");
      setProgressQuote(getProgressQuote("task_complete", { rare: true }));
    }
    emitTaskProgressFeedback({ rewarded: earnsProgress });
  }

  return (
    <section className="mentor-panel command-panel command-screen" style={pageStyle}>
      <div className="command-kicker" style={kickerStyle}>TASKS / PRIORITIES</div>
      <h2 style={titleStyle}>Capture what matters, then choose what leads.</h2>
      <p style={copyStyle}>
        Keep the list simple. Relevance Agent looks for real consequence, real urgency, and the smallest useful
        task that can move the mission forward.
      </p>

      <div style={topGridStyle}>
        <form className="command-card" onSubmit={handleSubmit} style={formStyle}>
          <div style={labelStyle}>TASK CAPTURE</div>
          <label style={fieldLabelStyle} htmlFor="task-title">Task name</label>
          <input
            id="task-title"
            className="mentor-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs attention?"
            style={inputStyle}
          />

          <div style={selectGridStyle}>
            <TaskSelect label="Importance" value={importance} onChange={setImportance} />
            <TaskSelect label="Urgency" value={urgency} onChange={setUrgency} />
            <TaskSelect label="Consequence" value={consequenceLevel} onChange={setConsequenceLevel} />
            <TaskSelect label="Effort" value={effortLevel} onChange={setEffortLevel} />
          </div>

          <label style={fieldLabelStyle} htmlFor="task-notes">Notes optional</label>
          <textarea
            id="task-notes"
            className="mentor-input"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any context that would make starting easier?"
            rows={3}
            style={textareaStyle}
          />

          <button
            className="mentor-primary-button"
            disabled={!canAddTask}
            type="submit"
            style={{ ...submitButtonStyle, ...(!canAddTask ? disabledButtonStyle : {}) }}
          >
            Add Task
          </button>
        </form>

        <div className="command-card" style={recommendationStyle}>
          <div style={labelStyle}>RECOMMENDED NEXT TASK</div>
          {recommendedTask ? (
            <>
              <h3 style={recommendationTitleStyle}>{recommendedTask.title}</h3>
              <p style={smallCopyStyle}>
                This leads because it has the strongest mix of consequence, urgency, importance, and manageable effort.
              </p>
              <SignalRow task={recommendedTask} />
              <button
                className="mentor-soft-button"
                onClick={() => completeTask(recommendedTask)}
                style={{
                  ...completeButtonStyle,
                  ...getTaskButtonFeedbackStyle(taskFeedback.getTaskFeedbackState(recommendedTask.id)),
                }}
              >
                Complete task
              </button>
            </>
          ) : (
            <p style={smallCopyStyle}>
              Add one task to get a calm recommendation for the next useful move.
            </p>
          )}
          <div style={missionNoteStyle}>
            {missionMessage}
            <TaskProgressPulse
              active={taskFeedback.pulseVisible}
              detail={taskFeedback.pulseRewarded ? "Mission fuel +1" : "Momentum"}
              keyValue={taskFeedback.pulseKey}
              tone={getRocketTaskProgressPulseTone(taskFeedback.pulseRewarded)}
            />
            <ProgressQuote quote={progressQuote} />
          </div>
        </div>
      </div>

      <LaunchPadPanel
        progressValue={0} // Not used for fuel
        tokens={0} // Not used
        toNextMilestone={0} // Not used
        milestone={0} // Not used
        milestoneCount={0} // Not used
        stage={currentJourney?.currentStageIndex ?? 0}
        stageName={currentJourney?.stages[currentJourney.currentStageIndex]?.planetName ?? "Launch Pad"}
        streak={0}
        message={getTaskRocketMessage(currentJourney?.journeyPhase)}
        feedbackMode="idle"
        feedbackKey={0}
        stageTransitionKey={0}
        rocketMissionState={getRocketMissionStateForPhase(currentJourney?.journeyPhase ?? "grounded")}
        journeyPhase={currentJourney?.journeyPhase}
      />

      <div style={taskListStyle}>
        <div style={labelStyle}>TASK LIST</div>
        {tasks.length === 0 ? (
          <p style={smallCopyStyle}>No tasks captured yet. Start with one thing that would reduce pressure.</p>
        ) : (
          <div style={tasksGridStyle}>
            {tasks.map((task) => (
              <article
                className="command-card"
                key={task.id}
                style={{
                  ...taskCardStyle,
                  ...getTaskCardFeedbackStyle(taskFeedback.getTaskFeedbackState(task.id)),
                  opacity: task.status === "complete" ? 0.68 : 1,
                }}
              >
                <TaskTransferPulse
                  active={taskFeedback.getTaskFeedbackState(task.id).isCompleted}
                  rewarded={shouldEarnMissionProgress(task)}
                />
                <div style={taskHeaderStyle}>
                  <div>
                    <h3 style={taskTitleStyle}>{task.title}</h3>
                    {task.notes && <p style={taskNotesStyle}>{task.notes}</p>}
                  </div>
                  <span style={statusPillStyle}>{task.status === "complete" ? "Complete" : "Open"}</span>
                </div>
                <SignalRow task={task} />
                {task.status === "open" && (
                  <button
                    className="mentor-soft-button"
                    onClick={() => completeTask(task)}
                    style={{
                      ...smallCompleteButtonStyle,
                      ...getTaskButtonFeedbackStyle(taskFeedback.getTaskFeedbackState(task.id)),
                    }}
                  >
                    Complete task
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function getTaskRocketMessage(phase: string | undefined) {
  if (phase === "actionReady") return "Launch command ready. Open Journey when you are ready to move.";
  if (phase === "inProgress") return "In space. Important work keeps fuel moving through this leg.";
  if (phase === "arrivalReady") return "Landing command ready. Open Journey when you are ready to secure this destination.";
  if (phase === "arrived") return "Landed. This location is secured while the next route comes online.";

  return "Mission system standing by. Important tasks can load the next signal.";
}

function TaskTransferPulse({ active, rewarded }: { active: boolean; rewarded: boolean }) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        ...taskTransferPulseStyle,
        background: rewarded
          ? "linear-gradient(90deg, rgba(134, 239, 172, 0), rgba(134, 239, 172, 0.58), rgba(251, 191, 36, 0))"
          : "linear-gradient(90deg, rgba(125, 211, 252, 0), rgba(125, 211, 252, 0.38), rgba(148, 163, 184, 0))",
      }}
    />
  );
}

function getTaskCardFeedbackStyle(feedback: { isActivated: boolean; isCompleted: boolean }) {
  if (feedback.isCompleted) {
    return {
      animation: "taskCompletionResolve 720ms ease-out",
      border: "1px solid rgba(134, 239, 172, 0.3)",
      boxShadow: "0 0 28px rgba(134, 239, 172, 0.12)",
    } satisfies CSSProperties;
  }

  if (feedback.isActivated) {
    return {
      border: "1px solid rgba(251, 191, 36, 0.3)",
      boxShadow: "0 0 20px rgba(251, 146, 60, 0.12)",
      transform: "scale(0.992)",
    } satisfies CSSProperties;
  }

  return {};
}

function getTaskButtonFeedbackStyle(feedback: { isActivated: boolean; isCompleted: boolean }) {
  if (feedback.isCompleted) {
    return {
      background: "linear-gradient(180deg, rgba(134, 239, 172, 0.28), rgba(20, 83, 45, 0.2))",
      border: "1px solid rgba(134, 239, 172, 0.34)",
      transform: "scale(1)",
    } satisfies CSSProperties;
  }

  if (feedback.isActivated) {
    return {
      transform: "scale(0.96)",
    } satisfies CSSProperties;
  }

  return {};
}

function TaskSelect({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: TaskLevel) => void;
  value: TaskLevel;
}) {
  return (
    <label style={fieldLabelStyle}>
      {label}
      <select
        className="mentor-input"
        value={value}
        onChange={(event) => onChange(event.target.value as TaskLevel)}
        style={selectStyle}
      >
        {TASK_LEVELS.map((level) => (
          <option key={level} value={level}>
            {LEVEL_LABELS[level]}
          </option>
        ))}
      </select>
    </label>
  );
}

function SignalRow({ task }: { task: Task }) {
  return (
    <div style={signalRowStyle}>
      <Signal label="Consequence" value={task.consequenceLevel} />
      <Signal label="Urgency" value={task.urgency} />
      <Signal label="Importance" value={task.importance} />
      <Signal label="Effort" value={task.effortLevel} />
    </div>
  );
}

function Signal({ label, value }: { label: string; value: TaskLevel }) {
  return (
    <span style={signalPillStyle}>
      {label}: {LEVEL_LABELS[value]}
    </span>
  );
}

const pageStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  padding: "clamp(20px, 4vw, 30px)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.26)",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.84rem",
  fontWeight: 800,
  letterSpacing: "0.2em",
  marginBottom: "12px",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
  lineHeight: 1.1,
  margin: "0 0 12px",
} satisfies CSSProperties;

const copyStyle = {
  color: "#cbd5e1",
  fontSize: "1.05rem",
  lineHeight: 1.65,
  margin: "0 0 22px",
  maxWidth: "780px",
} satisfies CSSProperties;

const topGridStyle = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
} satisfies CSSProperties;

const formStyle = {
  background: "#061120",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "20px",
  display: "grid",
  gap: "12px",
  padding: "18px",
} satisfies CSSProperties;

const recommendationStyle = {
  background:
    "radial-gradient(circle at 85% 18%, rgba(251, 146, 60, 0.16), transparent 24%), #061120",
  border: "1px solid rgba(134, 239, 172, 0.16)",
  borderRadius: "20px",
  display: "grid",
  gap: "12px",
  padding: "18px",
} satisfies CSSProperties;

const labelStyle = {
  color: "#fbbf24",
  fontSize: "0.8rem",
  fontWeight: 800,
  letterSpacing: "0.18em",
  marginBottom: "2px",
} satisfies CSSProperties;

const fieldLabelStyle = {
  color: "#cbd5e1",
  display: "grid",
  fontSize: "0.9rem",
  fontWeight: 800,
  gap: "6px",
} satisfies CSSProperties;

const inputStyle = {
  width: "100%",
} satisfies CSSProperties;

const textareaStyle = {
  resize: "vertical",
  width: "100%",
} satisfies CSSProperties;

const selectGridStyle = {
  display: "grid",
  gap: "10px",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))",
} satisfies CSSProperties;

const selectStyle = {
  width: "100%",
} satisfies CSSProperties;

const submitButtonStyle = {
  justifySelf: "start",
} satisfies CSSProperties;

const disabledButtonStyle = {
  cursor: "not-allowed",
  filter: "saturate(0.76)",
  opacity: 0.58,
} satisfies CSSProperties;

const recommendationTitleStyle = {
  color: "#f8fafc",
  fontSize: "1.35rem",
  lineHeight: 1.18,
  margin: 0,
} satisfies CSSProperties;

const smallCopyStyle = {
  color: "#cbd5e1",
  fontSize: "0.98rem",
  lineHeight: 1.55,
  margin: 0,
} satisfies CSSProperties;

const missionNoteStyle = {
  background: "rgba(134, 239, 172, 0.08)",
  border: "1px solid rgba(134, 239, 172, 0.16)",
  borderRadius: "14px",
  color: "#d9f99d",
  fontSize: "0.92rem",
  lineHeight: 1.45,
  padding: "10px 12px",
} satisfies CSSProperties;

const completeButtonStyle = {
  justifySelf: "start",
} satisfies CSSProperties;

const taskListStyle = {
  background: "rgba(2, 6, 23, 0.32)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "20px",
  marginTop: "16px",
  padding: "18px",
} satisfies CSSProperties;

const tasksGridStyle = {
  display: "grid",
  gap: "12px",
} satisfies CSSProperties;

const taskCardStyle = {
  background: "rgba(2, 6, 23, 0.56)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "16px",
  display: "grid",
  gap: "12px",
  padding: "14px",
  position: "relative",
} satisfies CSSProperties;

const taskTransferPulseStyle = {
  animation: "taskTransferPulse 280ms ease-out both",
  borderRadius: "999px",
  height: "3px",
  left: "12px",
  pointerEvents: "none",
  position: "absolute",
  right: "12px",
  top: "12px",
  transformOrigin: "0% 50%",
} satisfies CSSProperties;

const taskHeaderStyle = {
  alignItems: "flex-start",
  display: "flex",
  gap: "12px",
  justifyContent: "space-between",
} satisfies CSSProperties;

const taskTitleStyle = {
  color: "#f8fafc",
  fontSize: "1.05rem",
  lineHeight: 1.25,
  margin: 0,
} satisfies CSSProperties;

const taskNotesStyle = {
  color: "#94a3b8",
  fontSize: "0.92rem",
  lineHeight: 1.45,
  margin: "6px 0 0",
} satisfies CSSProperties;

const statusPillStyle = {
  background: "rgba(148, 163, 184, 0.1)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "999px",
  color: "#cbd5e1",
  flex: "0 0 auto",
  fontSize: "0.76rem",
  fontWeight: 900,
  padding: "5px 8px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const signalRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
} satisfies CSSProperties;

const signalPillStyle = {
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "999px",
  color: "#cbd5e1",
  fontSize: "0.8rem",
  fontWeight: 750,
  padding: "6px 8px",
} satisfies CSSProperties;

const smallCompleteButtonStyle = {
  justifySelf: "start",
  padding: "9px 12px",
} satisfies CSSProperties;
