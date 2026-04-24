import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useJourney } from "../context/JourneyContext";
import {
  addTask,
  completeMeaningfulMove,
  deleteTask,
  loadAppState,
  resetTestDataState,
  updateTaskTitle,
} from "../lib/appState";
import type { AppTask } from "../types/app";

export function TasksPage() {
  const { completeMilestoneProgress, resetMissionProgress } = useJourney();
  const [appState, setAppState] = useState(() => loadAppState());
  const [title, setTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [message, setMessage] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const tasks = appState.tasks;

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status === "active"),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks]
  );

  useEffect(() => {
    setAppState(loadAppState());
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = addTask(title);
    if (!result.ok) {
      setMessage("Add a task title first.");
      return;
    }

    setAppState(result.state);
    setTitle("");
    setMessage("Task added.");
  }

  function handleCompleteTask(task: AppTask) {
    const result = completeMeaningfulMove({
      title: task.title,
      source: "task",
      taskId: task.id,
    });

    if (!result.ok) {
      setMessage("This task needs a title before it can count.");
      return;
    }

    completeMilestoneProgress({ suppressReward: true });
    setAppState(result.state);
    setMessage("+1 Mission Fuel");
  }

  function handleStartEdit(task: AppTask) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  }

  function handleSaveEdit(taskId: string) {
    const trimmedTitle = editingTitle.trim();

    if (!trimmedTitle) {
      setMessage("Task title cannot be empty.");
      return;
    }

    const result = updateTaskTitle(taskId, trimmedTitle);
    if (!result.ok) {
      setMessage("Task title cannot be empty.");
      return;
    }

    setAppState(result.state);
    setEditingTaskId(null);
    setEditingTitle("");
    setMessage("Task updated.");
  }

  function handleDeleteTask(taskId: string) {
    setAppState(deleteTask(taskId));
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      setEditingTitle("");
    }
    setMessage("Task deleted.");
  }

  function handleResetTestData() {
    resetMissionProgress();
    setAppState(resetTestDataState());
    setTitle("");
    setEditingTaskId(null);
    setEditingTitle("");
    setShowCompleted(false);
    setMessage("Test data reset.");
  }

  return (
    <section className="mentor-panel command-panel command-screen" style={pageStyle}>
      <div className="command-kicker" style={kickerStyle}>TASKS</div>
      <h2 style={titleStyle}>Tasks</h2>
      <p style={copyStyle}>
        Complete meaningful moves to earn Mission Fuel.
      </p>

      <div style={debugCardStyle}>
        <div>
          <div style={debugLabelStyle}>Mission Fuel</div>
          <div style={debugValueStyle}>
            {appState.missionFuel} / {appState.launchFuelRequired}
          </div>
        </div>
        <div>
          <div style={debugLabelStyle}>Completed Moves</div>
          <div style={debugValueStyle}>{appState.completedActions}</div>
        </div>
      </div>

      <button
        className="mentor-soft-button"
        onClick={handleResetTestData}
        style={resetButtonStyle}
        type="button"
      >
        Reset test data
      </button>

      <form className="command-card" onSubmit={handleSubmit} style={formStyle}>
        <div style={sectionLabelStyle}>Add a task</div>
        <label style={fieldLabelStyle} htmlFor="task-title">Task title</label>
        <div style={formRowStyle}>
          <input
            id="task-title"
            className="mentor-input"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you need to do?"
            style={inputStyle}
            value={title}
          />
          <button className="mentor-primary-button" style={buttonStyle} type="submit">
            Add task
          </button>
        </div>
        {message ? <div style={messageStyle}>{message}</div> : null}
      </form>

      <section className="command-card" style={listCardStyle}>
        <div style={sectionLabelStyle}>Active tasks</div>
        {activeTasks.length === 0 ? (
          <p style={emptyStyle}>No active tasks yet.</p>
        ) : (
          <div style={taskListStyle}>
            {activeTasks.map((task) => (
              <TaskRow
                editing={editingTaskId === task.id}
                editingTitle={editingTitle}
                key={task.id}
                onChangeEditingTitle={setEditingTitle}
                onComplete={() => handleCompleteTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onEdit={() => handleStartEdit(task)}
                onSave={() => handleSaveEdit(task.id)}
                onCancel={() => {
                  setEditingTaskId(null);
                  setEditingTitle("");
                }}
                task={task}
              />
            ))}
          </div>
        )}
      </section>

      <details
        className="command-card"
        onToggle={(event) => setShowCompleted((event.currentTarget as HTMLDetailsElement).open)}
        style={listCardStyle}
      >
        <summary style={completedSummaryStyle}>Completed tasks ({completedTasks.length})</summary>
        {completedTasks.length === 0 ? (
          <p style={emptyStyle}>Nothing completed yet.</p>
        ) : (
          <div style={{ ...taskListStyle, marginTop: showCompleted ? "12px" : 0 }}>
            {completedTasks.map((task) => (
              <TaskRow
                editing={editingTaskId === task.id}
                editingTitle={editingTitle}
                key={task.id}
                onChangeEditingTitle={setEditingTitle}
                onDelete={() => handleDeleteTask(task.id)}
                onEdit={() => handleStartEdit(task)}
                onSave={() => handleSaveEdit(task.id)}
                onCancel={() => {
                  setEditingTaskId(null);
                  setEditingTitle("");
                }}
                task={task}
              />
            ))}
          </div>
        )}
      </details>
    </section>
  );
}

function TaskRow({
  task,
  editing,
  editingTitle,
  onChangeEditingTitle,
  onComplete,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  task: AppTask;
  editing: boolean;
  editingTitle: string;
  onChangeEditingTitle: (value: string) => void;
  onComplete?: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <article style={{ ...taskRowStyle, ...(task.status === "completed" ? completedTaskRowStyle : {}) }}>
      <div style={taskHeaderStyle}>
        <div style={statusWrapStyle}>
          <span style={{ ...statusDotStyle, ...(task.status === "completed" ? completedDotStyle : activeDotStyle) }} />
          <span style={statusTextStyle}>{task.status === "completed" ? "Completed" : "Active"}</span>
        </div>
      </div>

      {editing ? (
        <div style={editRowStyle}>
          <input
            className="mentor-input"
            onChange={(event) => onChangeEditingTitle(event.target.value)}
            style={inputStyle}
            value={editingTitle}
          />
          <div style={actionRowStyle}>
            <button className="mentor-soft-button" onClick={onSave} style={smallButtonStyle} type="button">
              Save
            </button>
            <button className="mentor-soft-button" onClick={onCancel} style={smallButtonStyle} type="button">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 style={taskTitleStyle}>{task.title}</h3>
          <div style={actionRowStyle}>
            {onComplete ? (
              <button className="mentor-primary-button" onClick={onComplete} style={smallButtonStyle} type="button">
                Complete
              </button>
            ) : null}
            <button className="mentor-soft-button" onClick={onEdit} style={smallButtonStyle} type="button">
              Edit
            </button>
            <button className="mentor-soft-button" onClick={onDelete} style={smallButtonStyle} type="button">
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

const pageStyle = {
  background: "rgba(9, 20, 44, 0.84)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  boxShadow: "0 22px 70px rgba(0,0,0,0.26)",
  display: "grid",
  gap: "16px",
  padding: "clamp(18px, 4vw, 28px)",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.84rem",
  fontWeight: 800,
  letterSpacing: "0.2em",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
  lineHeight: 1.08,
  margin: 0,
} satisfies CSSProperties;

const copyStyle = {
  color: "#cbd5e1",
  fontSize: "1rem",
  lineHeight: 1.55,
  margin: 0,
} satisfies CSSProperties;

const debugCardStyle = {
  background: "rgba(15, 23, 42, 0.74)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "18px",
  display: "grid",
  gap: "8px",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  padding: "14px",
} satisfies CSSProperties;

const debugLabelStyle = {
  color: "#94a3b8",
  fontSize: "0.76rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const debugValueStyle = {
  color: "#f8fafc",
  fontSize: "1.2rem",
  fontWeight: 900,
  marginTop: "4px",
} satisfies CSSProperties;

const resetButtonStyle = {
  justifySelf: "start",
  minHeight: "40px",
  padding: "9px 12px",
} satisfies CSSProperties;

const formStyle = {
  display: "grid",
  gap: "10px",
  padding: "16px",
} satisfies CSSProperties;

const fieldLabelStyle = {
  color: "#cbd5e1",
  display: "grid",
  fontSize: "0.9rem",
  fontWeight: 800,
  gap: "6px",
} satisfies CSSProperties;

const formRowStyle = {
  display: "grid",
  gap: "8px",
  gridTemplateColumns: "1fr",
} satisfies CSSProperties;

const inputStyle = {
  width: "100%",
} satisfies CSSProperties;

const buttonStyle = {
  minHeight: "44px",
  padding: "10px 14px",
} satisfies CSSProperties;

const messageStyle = {
  color: "#d9f99d",
  fontSize: "0.92rem",
  lineHeight: 1.45,
} satisfies CSSProperties;

const listCardStyle = {
  display: "grid",
  gap: "12px",
  padding: "16px",
} satisfies CSSProperties;

const sectionLabelStyle = {
  color: "#fbbf24",
  fontSize: "0.8rem",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
} satisfies CSSProperties;

const emptyStyle = {
  color: "#94a3b8",
  fontSize: "0.95rem",
  lineHeight: 1.5,
  margin: 0,
} satisfies CSSProperties;

const taskListStyle = {
  display: "grid",
  gap: "10px",
} satisfies CSSProperties;

const completedSummaryStyle = {
  color: "#fbbf24",
  cursor: "pointer",
  fontSize: "0.98rem",
  fontWeight: 800,
  listStyle: "none",
} satisfies CSSProperties;

const taskRowStyle = {
  background: "rgba(2, 6, 23, 0.56)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "16px",
  display: "grid",
  gap: "10px",
  padding: "14px",
} satisfies CSSProperties;

const completedTaskRowStyle = {
  opacity: 0.76,
} satisfies CSSProperties;

const taskHeaderStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
} satisfies CSSProperties;

const statusWrapStyle = {
  alignItems: "center",
  display: "flex",
  gap: "8px",
} satisfies CSSProperties;

const statusDotStyle = {
  borderRadius: "999px",
  height: "10px",
  width: "10px",
} satisfies CSSProperties;

const activeDotStyle = {
  background: "#fbbf24",
} satisfies CSSProperties;

const completedDotStyle = {
  background: "#86efac",
} satisfies CSSProperties;

const statusTextStyle = {
  color: "#cbd5e1",
  fontSize: "0.8rem",
  fontWeight: 800,
  textTransform: "uppercase",
} satisfies CSSProperties;

const taskTitleStyle = {
  color: "#f8fafc",
  fontSize: "1rem",
  lineHeight: 1.35,
  margin: 0,
} satisfies CSSProperties;

const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
} satisfies CSSProperties;

const editRowStyle = {
  display: "grid",
  gap: "8px",
} satisfies CSSProperties;

const smallButtonStyle = {
  minHeight: "40px",
  padding: "9px 12px",
} satisfies CSSProperties;
