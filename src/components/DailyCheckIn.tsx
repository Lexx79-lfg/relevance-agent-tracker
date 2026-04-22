import type { DailyCheckIn as DailyCheckInValue } from "../types/app";

type DailyCheckInProps = {
  value: DailyCheckInValue;
  onChange: (value: DailyCheckInValue) => void;
};

const FEELING_OPTIONS: Array<{
  value: DailyCheckInValue["feeling"];
  label: string;
}> = [
  { value: "steady", label: "Steady" },
  { value: "stressed", label: "Stressed" },
  { value: "stuck", label: "Stuck" },
  { value: "tender", label: "Tender" },
];

const NEED_OPTIONS: Array<{
  value: DailyCheckInValue["need"];
  label: string;
}> = [
  { value: "calm", label: "Calm" },
  { value: "action", label: "Action" },
  { value: "clarity", label: "Clarity" },
  { value: "connection", label: "Connection" },
];

export function DailyCheckIn({ value, onChange }: DailyCheckInProps) {
  return (
    <section
      style={{
        marginTop: "22px",
        background: "rgba(2, 8, 23, 0.48)",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: "22px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            color: "#d1d5db",
            fontSize: "0.8rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
          }}
        >
          DAILY CHECK-IN
        </div>
        <div style={{ color: "#94a3b8", fontSize: "0.92rem" }}>
          One quick read on today.
        </div>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <div style={{ color: "#cbd5e1", fontSize: "0.92rem", marginBottom: "8px" }}>
            How are you arriving?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {FEELING_OPTIONS.map((option) => {
              const active = value.feeling === option.value;

              return (
                <button
                  className="mentor-soft-button"
                  key={option.value}
                  onClick={() => onChange({ ...value, feeling: option.value })}
                  style={{
                    background: active ? "rgba(134, 239, 172, 0.16)" : "rgba(15, 23, 42, 0.72)",
                    border: active
                      ? "1px solid rgba(134, 239, 172, 0.58)"
                      : "1px solid rgba(148, 163, 184, 0.14)",
                    borderRadius: "999px",
                    color: "#f8fafc",
                    cursor: "pointer",
                    padding: "8px 12px",
                    transition: "transform 180ms ease, border-color 180ms ease, background 180ms ease",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ color: "#cbd5e1", fontSize: "0.92rem", marginBottom: "8px" }}>
            What would help most?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {NEED_OPTIONS.map((option) => {
              const active = value.need === option.value;

              return (
                <button
                  className="mentor-soft-button"
                  key={option.value}
                  onClick={() => onChange({ ...value, need: option.value })}
                  style={{
                    background: active ? "rgba(125, 211, 252, 0.16)" : "rgba(15, 23, 42, 0.72)",
                    border: active
                      ? "1px solid rgba(125, 211, 252, 0.58)"
                      : "1px solid rgba(148, 163, 184, 0.14)",
                    borderRadius: "999px",
                    color: "#f8fafc",
                    cursor: "pointer",
                    padding: "8px 12px",
                    transition: "transform 180ms ease, border-color 180ms ease, background 180ms ease",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <input
          value={value.note}
          onChange={(event) => onChange({ ...value, note: event.target.value })}
          placeholder="Optional note for today..."
          style={{
            width: "100%",
            background: "#020817",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: "16px",
            boxSizing: "border-box",
            color: "#f8fafc",
            fontSize: "0.98rem",
            outline: "none",
            padding: "12px 14px",
          }}
        />
      </div>
    </section>
  );
}
