import { useEffect, useState, type CSSProperties } from "react";
import { playCommandSound } from "../lib/commandSound";
import type { MilestoneRewardEvent } from "../types/journey";

type RocketPhase =
  | "fueling"
  | "countdown3"
  | "countdown2"
  | "countdown1"
  | "launchHold"
  | "liftoff"
  | "space"
  | "arrival";

const PHASES: RocketPhase[] = [
  "fueling",
  "countdown3",
  "countdown2",
  "countdown1",
  "launchHold",
  "liftoff",
  "space",
  "arrival",
];

const PHASE_DURATIONS: Record<RocketPhase, number> = {
  fueling: 1100,
  countdown3: 760,
  countdown2: 760,
  countdown1: 760,
  launchHold: 760,
  liftoff: 1450,
  space: 1700,
  arrival: 0,
};

const COUNTDOWN_LABELS: Partial<Record<RocketPhase, string>> = {
  countdown3: "3",
  countdown2: "2",
  countdown1: "1",
};

export function RocketMilestoneExperience({ event }: { event: MilestoneRewardEvent }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];
  const isFlightPhase = phase === "liftoff" || phase === "space" || phase === "arrival";
  const isArrivalEvent = event.rewardKind === "arrival";
  const phaseCue = getPhaseCue(phase, isArrivalEvent);
  const rocketName = event.rocketName ?? "KARINA-23";
  const rocketY = getRocketY(phase, isArrivalEvent);
  const groundY = getGroundY(phase, isArrivalEvent);
  const engineIntensity =
    phase === "liftoff"
      ? { opacity: 1, scaleY: 3.45, core: 1, reflection: 0.92 }
      : phase === "space"
        ? { opacity: 0.72, scaleY: 1.36, core: 0.46, reflection: 0.04 }
        : phase === "arrival"
          ? { opacity: 0.24, scaleY: 0.62, core: 0.16, reflection: 0 }
          : phase === "launchHold"
            ? { opacity: 0.88, scaleY: 1.02, core: 0.58, reflection: 0.28 }
          : phase.startsWith("countdown")
            ? { opacity: 0.78, scaleY: 0.92, core: 0.46, reflection: 0.2 }
            : { opacity: 0.52, scaleY: 0.7, core: 0.26, reflection: 0.12 };

  useEffect(() => {
    setPhaseIndex(0);
  }, [event.id]);

  useEffect(() => {
    if (phase === "liftoff" && !isArrivalEvent) {
      playCommandSound("ignition");
    }

    const duration = getPhaseDuration(phase, isArrivalEvent);

    if (!duration) return;

    // Future sound hook: trigger phase-specific rocket audio here.
    const timeout = window.setTimeout(() => {
      setPhaseIndex((current) => Math.min(current + 1, PHASES.length - 1));
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [isArrivalEvent, phase]);

  return (
    <section className="command-screen" style={experienceStyle} aria-live="polite">
      <div style={copyWrapStyle}>
        <div className="command-kicker" style={kickerStyle}>MAJOR MILESTONE EVENT</div>
        <div style={rocketNameStyle}>{getRocketStatus(phase, event)}</div>
        <h2 style={titleStyle}>{getTitle(phase, event)}</h2>
        <p style={summaryStyle}>{getSummary(phase, event)}</p>
      </div>

      <div className="command-card" style={sceneStyle}>
        <div
          style={{
            ...atmosphereShiftStyle,
            opacity: phase === "liftoff" ? 0.26 : phase === "space" || phase === "arrival" ? 0.02 : 0.9,
          }}
        />
        <div
          style={{
            ...spaceDepthStyle,
            opacity: phase === "space" || phase === "arrival" ? 0.98 : phase === "liftoff" ? 0.78 : 0.18,
          }}
        />
        <div
          style={{
            ...starFieldStyle,
            opacity: phase === "space" || phase === "arrival" ? 1 : phase === "liftoff" ? 0.72 : 0.2,
          }}
        />

        {phaseCue && (
          <div style={{ ...countdownStyle, ...(isArrivalEvent ? landingCueStyle : {}) }}>
            {phaseCue}
          </div>
        )}

        <svg viewBox="0 0 520 360" role="img" aria-label="Rocket milestone launch" style={svgStyle}>
          <defs>
            <linearGradient id="rocketBody" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="46%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="rocketWindow" x1="0" x2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <radialGradient id="engineGlow" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="45%" stopColor="#fb923c" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g
            style={{
              opacity: phase === "fueling" || phase.startsWith("countdown") ? 0.28 : 0.95,
              transform: `translate(${isArrivalEvent ? 116 : 410}px, ${isArrivalEvent ? 282 : phase === "space" || phase === "arrival" ? 82 : 118}px)`,
              transition: "opacity 820ms ease, transform 1300ms cubic-bezier(0.18, 0.84, 0.24, 1)",
            }}
          >
            <circle r={isArrivalEvent ? 42 : 30} fill={isArrivalEvent ? "#fbbf24" : "#60a5fa"} opacity="0.9" />
            <circle r={isArrivalEvent ? 54 : 40} fill="none" stroke="rgba(248,250,252,0.26)" strokeWidth="2" />
            <path d="M-26 2 C-10 -8 8 12 30 0" fill="none" stroke="rgba(248,250,252,0.28)" strokeWidth="4" strokeLinecap="round" />
          </g>

          <g
            style={{
              transform: `translateY(${groundY}px)`,
              opacity: isArrivalEvent
                ? phase === "arrival"
                  ? 1
                  : phase === "space"
                    ? 0.72
                    : 0.36
                : phase === "arrival"
                  ? 0.18
                  : phase === "space"
                    ? 0.32
                    : 1,
              transition:
                phase === "liftoff"
                  ? "transform 1200ms cubic-bezier(0.08, 0.92, 0.08, 1), opacity 900ms ease"
                  : "transform 1500ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 1100ms ease",
            }}
          >
            <g>
              <path d="M142 246h236l32 36H110z" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(148,163,184,0.42)" />
              <path d="M158 245h204" stroke="#86efac" strokeOpacity="0.58" strokeWidth="5" strokeLinecap="round" />
              <path d="M106 282h308" stroke="rgba(251,146,60,0.35)" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="208" cy="290" rx="58" ry="18" fill="rgba(226,232,240,0.18)" />
              <ellipse cx="278" cy="290" rx="58" ry="18" fill="rgba(148,163,184,0.15)" />
              <ellipse
                cx="260"
                cy="281"
                rx="84"
                ry="20"
                fill="#fb923c"
                opacity={engineIntensity.reflection}
                style={{
                  transform: `scaleX(${phase === "liftoff" ? 1.46 : phase === "launchHold" ? 1.12 : 1})`,
                  transformOrigin: "260px 281px",
                  transition: "opacity 320ms ease, transform 320ms ease",
                }}
              />
            </g>

            <g>
              <path d="M356 92h48v184" fill="none" stroke="rgba(148,163,184,0.55)" strokeWidth="7" />
              <path d="M366 110h64M366 146h64M366 182h64" stroke="rgba(203,213,225,0.42)" strokeWidth="4" />
              <path d="M356 108l48 38-48 38 48 38" fill="none" stroke="rgba(134,239,172,0.24)" strokeWidth="4" />
              <path d="M330 134h60v24h-60z" fill="rgba(15,23,42,0.78)" stroke="rgba(251,146,60,0.48)" />
            </g>
          </g>

          <g
            style={{
              transform: `translateY(${rocketY}px)`,
              transition: phase === "liftoff"
                ? "transform 1350ms cubic-bezier(0.08, 0.92, 0.08, 1)"
                : isFlightPhase
                  ? "transform 1700ms cubic-bezier(0.18, 0.84, 0.24, 1)"
                : "transform 620ms ease-out",
            }}
          >
            <g>
              <path
                d="M260 54c30 28 45 68 45 119v67h-90v-67c0-51 15-91 45-119z"
                fill="url(#rocketBody)"
                stroke="rgba(248,250,252,0.64)"
                strokeWidth="2"
              />
              <path d="M260 54c-12 24-18 61-18 112v74h-27v-67c0-51 15-91 45-119z" fill="rgba(255,255,255,0.18)" />
              <path d="M236 164h48v50h-48z" fill="rgba(134,239,172,0.14)" stroke="rgba(134,239,172,0.28)" strokeWidth="1.5" />
              <path d="M242 201h36" stroke="#86efac" strokeOpacity="0.68" strokeWidth="5" strokeLinecap="round" />
              <circle cx="260" cy="134" r="21" fill="url(#rocketWindow)" stroke="rgba(248,250,252,0.72)" strokeWidth="5" />
              <text
                x="260"
                y="190"
                fill="rgba(2,6,23,0.82)"
                fontSize="8"
                fontWeight="900"
                letterSpacing="0.8"
                paintOrder="stroke"
                stroke="rgba(248,250,252,0.5)"
                strokeWidth="0.35"
                textAnchor="middle"
              >
                {rocketName}
              </text>
              <path d="M214 198l-38 52h42z" fill="#fb923c" stroke="rgba(248,250,252,0.28)" />
              <path d="M306 198l38 52h-42z" fill="#fb923c" stroke="rgba(248,250,252,0.28)" />
              <path d="M230 240h60l-13 27h-34z" fill="#334155" stroke="rgba(248,250,252,0.32)" />
              <ellipse cx="260" cy="270" rx="27" ry="10" fill="#0f172a" stroke="rgba(248,250,252,0.34)" />
              <g
                opacity={engineIntensity.opacity}
                style={{
                  transformOrigin: "260px 278px",
                  transform: `scaleY(${engineIntensity.scaleY})`,
                  transition: phase === "liftoff"
                    ? "transform 260ms cubic-bezier(0.08, 0.92, 0.08, 1), opacity 180ms ease"
                    : "transform 520ms ease, opacity 520ms ease",
                }}
              >
                <path
                  d="M232 278c10 28 19 50 28 66 9-16 18-38 28-66z"
                  fill="url(#engineGlow)"
                />
                <path d="M220 282c13 48 26 84 40 108 14-24 27-60 40-108z" fill="url(#engineGlow)" opacity={phase === "liftoff" ? 0.62 : 0.12} />
                <path d="M202 292c19 58 38 100 58 126 20-26 39-68 58-126z" fill="url(#engineGlow)" opacity={phase === "liftoff" ? 0.28 : 0.04} />
                <path d="M246 278c5 17 10 31 14 42 4-11 9-25 14-42z" fill="#fff7cc" opacity={engineIntensity.core} />
                <ellipse cx="260" cy="300" rx="58" ry="18" fill="#fb923c" opacity="0.14" />
              </g>
            </g>
          </g>
        </svg>
      </div>

      <div className="command-card" style={arrivalStyle}>
        <strong>{event.milestoneName}</strong>
        <span>{event.milestoneDescription}</span>
        {event.rocketDedication && <span style={dedicationStyle}>{event.rocketDedication}</span>}
      </div>
    </section>
  );
}

function getPhaseCue(phase: RocketPhase, isArrivalEvent: boolean) {
  if (!isArrivalEvent) return COUNTDOWN_LABELS[phase];

  if (phase === "countdown3") return "APPROACH";
  if (phase === "countdown2") return "ALIGN";
  if (phase === "countdown1") return "LAND";

  return undefined;
}

function getPhaseDuration(phase: RocketPhase, isArrivalEvent: boolean) {
  if (!isArrivalEvent) return PHASE_DURATIONS[phase];

  if (phase === "fueling") return 760;
  if (phase === "countdown3" || phase === "countdown2" || phase === "countdown1") return 520;
  if (phase === "launchHold") return 680;
  if (phase === "liftoff") return 1350;
  if (phase === "space") return 1200;

  return PHASE_DURATIONS[phase];
}

function getRocketY(phase: RocketPhase, isArrivalEvent: boolean) {
  if (isArrivalEvent) {
    if (phase === "arrival") return 0;
    if (phase === "space") return -44;
    if (phase === "liftoff") return -132;
    if (phase === "launchHold") return -236;
    return -356;
  }

  return phase === "liftoff" ? -312 : phase === "space" || phase === "arrival" ? -356 : 0;
}

function getGroundY(phase: RocketPhase, isArrivalEvent: boolean) {
  if (isArrivalEvent) {
    if (phase === "arrival") return 0;
    if (phase === "space") return 70;
    if (phase === "liftoff") return 150;
    if (phase === "launchHold") return 300;
    return 430;
  }

  return phase === "liftoff" ? 286 : phase === "space" || phase === "arrival" ? 430 : 0;
}

function getRocketStatus(phase: RocketPhase, event: MilestoneRewardEvent) {
  if (event.rewardKind === "arrival") {
    if (phase === "arrival") return "landing signal confirmed";
    if (phase === "space") return "destination approach";
    if (phase === "liftoff") return "controlled descent";
    if (phase === "launchHold") return "landing corridor locked";
    if (phase.startsWith("countdown")) return "arrival channel armed";
    return "transit burn complete";
  }

  if (phase === "arrival") return "arrival signal confirmed";
  if (phase === "space") return "quiet transit";
  if (phase === "liftoff") return "clean ignition";
  if (phase === "launchHold") return "final hold";
  if (phase.startsWith("countdown")) return "countdown channel armed";
  return "fuel systems steady";
}

function getTitle(phase: RocketPhase, event: MilestoneRewardEvent) {
  if (event.rewardKind === "arrival") {
    if (phase === "arrival") return `Landing confirmed, ${event.userName}.`;
    if (phase === "space") return `Approaching ${event.stageName}.`;
    if (phase === "liftoff") return "Descent burn holding.";
    if (phase === "launchHold") return "Landing corridor is clean.";
    if (phase.startsWith("countdown")) return "Arrival window open.";
    return `Transit fuel secured, ${event.userName}.`;
  }

  if (phase === "arrival") return `Route marker secured, ${event.userName}.`;
  if (phase === "space") return `Crossing the dark toward ${event.destinationName}.`;
  if (phase === "liftoff") return "Ignition confirmed.";
  if (phase === "launchHold") return "Hold the line.";
  if (phase.startsWith("countdown")) return "Launch window open.";
  return `Fuel systems are ready, ${event.userName}.`;
}

function getSummary(phase: RocketPhase, event: MilestoneRewardEvent) {
  if (event.rewardKind === "arrival") {
    if (phase === "arrival") {
      return `${toneLead(event)} You reached ${event.stageName}. The next leg can begin from firmer ground.`;
    }

    if (phase === "space") {
      return "The destination is no longer abstract. The mission is becoming a place you can stand on.";
    }

    if (phase === "liftoff") {
      return "Descent is controlled. The work is settling into a new position.";
    }

    if (phase === "launchHold") {
      return "Hold steady. The landing corridor is aligned.";
    }

    if (phase.startsWith("countdown")) {
      return "Three quiet counts. One soft approach. This arrival was earned.";
    }

    return "The transit leg is complete. The vehicle is ready to come down cleanly.";
  }

  if (phase === "arrival") {
    return `${toneLead(event)} You reached ${event.stageName}. The route is closer to ${event.destinationName}; no rush, just proof of movement.`;
  }

  if (phase === "space") {
    return "The old ground is falling away. Small signals have become real distance.";
  }

  if (phase === "liftoff") {
    return "Thrust is clean. This checkpoint is no longer effort on the pad; it is motion.";
  }

  if (phase === "launchHold") {
    return "Systems are aligned. Let the pause do its work before release.";
  }

  if (phase.startsWith("countdown")) {
    return "Three quiet counts. One clear direction. This launch was earned.";
  }

  return "The major checkpoint is secure. The vehicle is fueled; the moment can carry forward.";
}

function toneLead(event: MilestoneRewardEvent) {
  if (event.preferredTone === "direct") return "Checkpoint secured.";
  if (event.preferredTone === "encouraging") return "This progress is real.";
  return "Steady progress, held without strain.";
}

const experienceStyle = {
  display: "grid",
  gap: "18px",
} satisfies CSSProperties;

const copyWrapStyle = {
  textAlign: "center",
} satisfies CSSProperties;

const kickerStyle = {
  color: "#86efac",
  fontSize: "0.78rem",
  fontWeight: 900,
  letterSpacing: "0.24em",
  marginBottom: "8px",
} satisfies CSSProperties;

const rocketNameStyle = {
  color: "#fbbf24",
  fontSize: "0.82rem",
  fontWeight: 900,
  letterSpacing: "0.18em",
  marginBottom: "10px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const titleStyle = {
  color: "#f8fafc",
  fontSize: "clamp(2rem, 7vw, 4.2rem)",
  letterSpacing: "-0.05em",
  lineHeight: 0.96,
  margin: 0,
} satisfies CSSProperties;

const summaryStyle = {
  color: "#cbd5e1",
  fontSize: "1rem",
  lineHeight: 1.6,
  margin: "14px auto 0",
  maxWidth: "620px",
} satisfies CSSProperties;

const sceneStyle = {
  background:
    "radial-gradient(circle at 50% 76%, rgba(251, 146, 60, 0.22), transparent 22%), linear-gradient(180deg, rgba(32, 68, 130, 0.94) 0%, rgba(10, 24, 58, 0.96) 34%, rgba(1, 4, 15, 0.99) 76%, rgba(0, 1, 8, 1) 100%)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "26px",
  boxShadow: "inset 0 0 50px rgba(134, 239, 172, 0.08), 0 22px 70px rgba(0, 0, 0, 0.28)",
  minHeight: "300px",
  overflow: "hidden",
  position: "relative",
} satisfies CSSProperties;

const atmosphereShiftStyle = {
  background:
    "linear-gradient(180deg, rgba(125,211,252,0.26), rgba(56,189,248,0.1) 28%, rgba(251,146,60,0.14) 72%, transparent 100%)",
  inset: 0,
  position: "absolute",
  transition: "opacity 760ms ease",
} satisfies CSSProperties;

const spaceDepthStyle = {
  background:
    "radial-gradient(circle at 50% 18%, rgba(56,189,248,0.1), transparent 24%), radial-gradient(circle at 74% 22%, rgba(138,255,183,0.06), transparent 18%), linear-gradient(180deg, rgba(0,1,9,1), rgba(2,6,23,0.86))",
  inset: 0,
  position: "absolute",
  transition: "opacity 760ms ease",
} satisfies CSSProperties;

const starFieldStyle = {
  background:
    "radial-gradient(circle at 18% 24%, rgba(248,250,252,0.95) 0 1px, transparent 2px), radial-gradient(circle at 68% 18%, rgba(248,250,252,0.8) 0 1px, transparent 2px), radial-gradient(circle at 82% 58%, rgba(134,239,172,0.56) 0 1px, transparent 2px), radial-gradient(circle at 34% 68%, rgba(248,250,252,0.62) 0 1px, transparent 2px), radial-gradient(circle at 50% 42%, rgba(248,250,252,0.58) 0 1px, transparent 2px), radial-gradient(circle at 12% 72%, rgba(125,211,252,0.5) 0 1px, transparent 2px), radial-gradient(circle at 88% 32%, rgba(248,250,252,0.52) 0 1px, transparent 2px), radial-gradient(circle at 44% 14%, rgba(248,250,252,0.5) 0 1px, transparent 2px)",
  inset: 0,
  position: "absolute",
  transition: "opacity 900ms ease",
} satisfies CSSProperties;

const countdownStyle = {
  color: "#fbbf24",
  alignItems: "center",
  background: "radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.18), transparent 30%)",
  display: "flex",
  fontSize: "clamp(6rem, 22vw, 13rem)",
  fontWeight: 900,
  inset: 0,
  justifyContent: "center",
  lineHeight: 1,
  pointerEvents: "none",
  position: "absolute",
  textAlign: "center",
  textShadow: "0 0 22px rgba(251, 146, 60, 0.92), 0 0 70px rgba(251, 191, 36, 0.42)",
  zIndex: 4,
} satisfies CSSProperties;

const landingCueStyle = {
  fontSize: "clamp(2.7rem, 10vw, 6.4rem)",
  letterSpacing: "0.14em",
} satisfies CSSProperties;

const svgStyle = {
  display: "block",
  height: "100%",
  minHeight: "300px",
  position: "relative",
  width: "100%",
  zIndex: 1,
} satisfies CSSProperties;

const arrivalStyle = {
  background: "rgba(2, 6, 23, 0.58)",
  border: "1px solid rgba(134, 239, 172, 0.18)",
  borderRadius: "18px",
  color: "#cbd5e1",
  display: "grid",
  gap: "6px",
  lineHeight: 1.5,
  padding: "14px 16px",
} satisfies CSSProperties;

const dedicationStyle = {
  borderTop: "1px solid rgba(148, 163, 184, 0.12)",
  color: "#94a3b8",
  fontSize: "0.9rem",
  fontStyle: "italic",
  marginTop: "4px",
  paddingTop: "10px",
} satisfies CSSProperties;
