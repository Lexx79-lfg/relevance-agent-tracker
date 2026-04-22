import type { CSSProperties } from "react";
import type { RewardThemeSceneProps } from "../../rewards/types";

export function RocketRewardScene({ copy, state }: RewardThemeSceneProps) {
  const journeyPhase = copy.journeyPhase;
  const isJourneyInSpace = journeyPhase === "inProgress";
  const isJourneyApproach = journeyPhase === "arrivalReady";
  const isJourneyLanded = journeyPhase === "arrived";
  const durableSpace = isJourneyInSpace || isJourneyApproach;
  const isToken = state.phase === "tokenFeedback";
  const isCheckpoint = state.phase === "checkpointFeedback";
  const isCharge = state.phase === "milestoneCharge";
  const isLaunch = state.phase === "milestoneLaunch";
  const isCelebrate = state.phase === "milestoneCelebrate";
  const isSettle = state.phase === "milestoneSettle";
  const active = isToken || isCheckpoint || isCharge || isLaunch || isCelebrate || isSettle;
  const milestoneActive = isCharge || isLaunch || isCelebrate || isSettle;
  const rocketLift = state.reducedMotion
    ? 0
    : isLaunch
      ? -118
      : isCelebrate || isSettle
        ? -88
        : isJourneyInSpace
          ? -82
        : isJourneyApproach
          ? -34
        : isJourneyLanded
          ? 4
        : isCharge
          ? -4
          : isCheckpoint
            ? -5
          : isToken
            ? -2
            : 0;
  const padDrop = state.reducedMotion
    ? 0
    : isLaunch
      ? 30
      : isCelebrate || isJourneyInSpace
        ? 42
        : isSettle
          ? 18
        : isJourneyApproach
          ? 18
        : 0;
  const padOpacity = isJourneyInSpace ? 0.14 : isJourneyApproach ? 0.48 : isLaunch ? 0.22 : isCelebrate ? 0.18 : isSettle ? 0.42 : 1;
  const starsOpacity = isCelebrate
    ? 0.92
    : isJourneyInSpace
      ? 0.72
    : isJourneyApproach
      ? 0.42
    : isLaunch || isSettle
      ? 0.72
      : isCharge
        ? 0.2
        : isCheckpoint
          ? 0.15
          : 0.08;
  const flameScale = state.reducedMotion
    ? milestoneActive ? 1.38 : active ? 1.08 : 0.54
    : isLaunch
      ? 3.25
      : isCharge
        ? 1.72
        : isCheckpoint
          ? 1.35
          : isToken
            ? 1.08
            : durableSpace
              ? 0.72
              : 0.54;
  const rocketMotion = state.reducedMotion
    ? "rocketRewardReducedPulse 520ms ease-out"
    : isToken
      ? "rocketRewardTokenPulse 420ms ease-out"
      : isCheckpoint
        ? "rocketRewardCheckpointPulse 620ms ease-out"
        : isCharge
          ? "rocketRewardCharge 680ms ease-in-out"
          : "rocketRewardIdle 5.8s ease-in-out infinite";

  const destinationVisual = getDestinationVisual(copy.stageName ?? copy.destinationName ?? "Destination");

  return (
    <div style={{ ...sceneStyle, ...getScenePhaseStyle(state.phase, journeyPhase) }}>
      <div style={{ ...starStyle, opacity: starsOpacity }} />
      <div style={{ ...skyGlowStyle, opacity: durableSpace ? 0.26 : isLaunch || isCelebrate || isSettle ? 0.8 : 0.45 }} />
      <div style={statusStyle}>
        <span>{copy.targetName ? `Target: ${copy.targetName}` : copy.stageName ?? "Mission progress"}</span>
        <strong>{getRocketPhaseLabel(state.phase, journeyPhase)}</strong>
      </div>

      <svg viewBox="0 0 420 280" role="img" aria-label="Rocket reward scene" style={svgStyle}>
        <defs>
          <linearGradient id="rewardRocketBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="52%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <radialGradient id="rewardEngineGlow" cx="50%" cy="0%" r="72%">
            <stop offset="0%" stopColor="#fff7cc" stopOpacity="1" />
            <stop offset="42%" stopColor="#fb923c" stopOpacity="0.76" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rewardPadGlow" cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.44" />
            <stop offset="62%" stopColor="#fb923c" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          style={{
            opacity: journeyPhase ? 1 : 0.62,
            transform: `translate(${isJourneyLanded ? 90 : isJourneyApproach ? 278 : 304}px, ${isJourneyLanded ? 212 : isJourneyApproach ? 102 : 72}px)`,
            transition: "opacity 520ms ease, transform 760ms ease",
          }}
        >
          <circle r={isJourneyApproach ? 34 : isJourneyLanded ? 42 : 26} fill={destinationVisual.fill} opacity={isJourneyInSpace ? 0.92 : 0.78} />
          <circle r={isJourneyApproach ? 45 : isJourneyLanded ? 54 : 34} fill="none" stroke={destinationVisual.stroke} strokeOpacity="0.28" strokeWidth="2" />
          <path d="M-24 2 C-8 -8 10 12 28 0" fill="none" stroke="rgba(248,250,252,0.28)" strokeWidth="4" strokeLinecap="round" />
          <text y={isJourneyLanded ? 70 : 58} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="900" letterSpacing="1.1">
            {isJourneyLanded ? "LANDED" : isJourneyApproach ? "APPROACH" : "DESTINATION"}
          </text>
        </g>

        <g
          opacity={padOpacity}
          style={{
            transform: `translateY(${padDrop}px)`,
            transition: "opacity 420ms ease, transform 720ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <path d="M82 232h256l26 30H56z" fill="rgba(15, 23, 42, 0.94)" stroke="rgba(148,163,184,0.35)" />
          <path d="M118 232h184" stroke="#86efac" strokeOpacity={isCheckpoint || isCharge ? 0.9 : 0.55} strokeWidth="6" strokeLinecap="round" />
          <path d="M302 80h38v154" stroke="rgba(148,163,184,0.56)" strokeWidth="7" />
          <path d="M312 98h48M312 132h48M312 166h48" stroke="rgba(203,213,225,0.35)" strokeWidth="4" />
          <path d="M302 98l38 34-38 34 38 34" fill="none" stroke="rgba(134,239,172,0.22)" strokeWidth="4" />
          <circle cx="104" cy="234" r="3" fill="#86efac" opacity={isCheckpoint || isCharge ? 0.95 : 0.36} />
          <circle cx="316" cy="234" r="3" fill="#fbbf24" opacity={isCharge ? 0.95 : 0.28} />
        </g>

        <ellipse
          cx="210"
          cy="239"
          rx={isCharge || isLaunch ? 92 : isCheckpoint ? 78 : 68}
          ry={isCharge || isLaunch ? 22 : isCheckpoint ? 18 : 16}
          fill="url(#rewardPadGlow)"
          opacity={milestoneActive ? 0.92 : active ? 0.66 : 0.28}
          style={{ transition: "all 260ms ease" }}
        />

        <g
          style={{
            transform: `translateY(${rocketLift}px)`,
            transformOrigin: "210px 170px",
            transition: state.reducedMotion ? "opacity 220ms ease" : "transform 920ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <g style={{ animation: rocketMotion, transformOrigin: "210px 152px" }}>
            <path
              d="M210 36c27 27 41 64 41 108v62h-82v-62c0-44 14-81 41-108z"
              fill="url(#rewardRocketBody)"
              stroke="rgba(248,250,252,0.62)"
              strokeWidth="2"
            />
            <path d="M210 36c-11 24-17 58-17 104v66h-24v-62c0-44 14-81 41-108z" fill="rgba(255,255,255,0.15)" />
            <path d="M185 154h50v42h-50z" fill="rgba(134,239,172,0.14)" stroke="rgba(134,239,172,0.24)" strokeWidth="1.5" />
            <path d="M190 184h40" stroke="#86efac" strokeOpacity={isToken || isCheckpoint ? 0.95 : 0.46} strokeWidth="5" strokeLinecap="round" />
            <circle cx="210" cy="108" r="18" fill="#38bdf8" stroke="rgba(248,250,252,0.72)" strokeWidth="5" />
            <path d="M169 166l-34 48h37z" fill="#fb923c" stroke="rgba(248,250,252,0.28)" />
            <path d="M251 166l34 48h-37z" fill="#fb923c" stroke="rgba(248,250,252,0.28)" />
            <path d="M183 206h54l-11 24h-32z" fill="#334155" stroke="rgba(248,250,252,0.34)" />
            <ellipse cx="210" cy="232" rx="24" ry="9" fill="#0f172a" stroke="rgba(248,250,252,0.34)" />
            <g
              style={{
                opacity: active || durableSpace ? 1 : 0.42,
                transform: `scaleY(${flameScale})`,
                transformOrigin: "210px 238px",
                transition: "opacity 180ms ease, transform 260ms ease",
              }}
            >
              <path d="M187 238c8 25 15 44 23 58 8-14 15-33 23-58z" fill="url(#rewardEngineGlow)" />
              <path d="M199 240c3 9 7 18 11 27 4-9 8-18 11-27z" fill="#fff7cc" opacity="0.76" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

function getDestinationVisual(name: string) {
  const palette = [
    { fill: "#60a5fa", stroke: "#bfdbfe" },
    { fill: "#cbd5e1", stroke: "#f8fafc" },
    { fill: "#fb923c", stroke: "#fed7aa" },
    { fill: "#67e8f9", stroke: "#cffafe" },
    { fill: "#fbbf24", stroke: "#fef3c7" },
    { fill: "#a78bfa", stroke: "#ddd6fe" },
  ];
  const index = Array.from(name).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % palette.length;

  return palette[index];
}

function getRocketPhaseLabel(phase: RewardThemeSceneProps["state"]["phase"], journeyPhase?: string) {
  if (journeyPhase === "arrivalReady") return "Approach stable";
  if (journeyPhase === "inProgress") return "In transit";
  if (journeyPhase === "arrived") return "Landed";
  if (journeyPhase === "actionReady") return "Launch command ready";
  if (phase === "tokenFeedback") return "Fuel added";
  if (phase === "checkpointFeedback") return "Readiness rising";
  if (phase === "milestoneCharge") return "Ready for liftoff";
  if (phase === "milestoneLaunch") return "Liftoff";
  if (phase === "milestoneCelebrate") return "Milestone reached";
  if (phase === "milestoneSettle") return "Cycle settling";

  return "On pad";
}

function getScenePhaseStyle(phase: RewardThemeSceneProps["state"]["phase"], journeyPhase?: string) {
  if (journeyPhase === "inProgress") {
    return {
      background:
        "radial-gradient(circle at 72% 24%, rgba(96, 165, 250, 0.16), transparent 20%), linear-gradient(180deg, rgba(1, 6, 24, 0.98), rgba(2, 6, 23, 0.99) 54%, rgba(0, 1, 8, 1))",
    } satisfies CSSProperties;
  }

  if (journeyPhase === "arrivalReady") {
    return {
      background:
        "radial-gradient(circle at 74% 28%, rgba(251, 191, 36, 0.2), transparent 22%), linear-gradient(180deg, rgba(5, 18, 44, 0.98), rgba(3, 9, 25, 0.99) 58%, rgba(2, 6, 16, 1))",
    } satisfies CSSProperties;
  }

  if (journeyPhase === "arrived") {
    return {
      background:
        "radial-gradient(circle at 28% 78%, rgba(134, 239, 172, 0.22), transparent 24%), linear-gradient(180deg, rgba(16, 34, 64, 0.96), rgba(4, 14, 28, 0.98) 58%, rgba(2, 8, 16, 1))",
    } satisfies CSSProperties;
  }

  if (phase === "milestoneLaunch" || phase === "milestoneCelebrate") {
    return {
      background:
        "radial-gradient(circle at 50% 82%, rgba(251, 146, 60, 0.34), transparent 24%), linear-gradient(180deg, rgba(14, 28, 66, 0.94), rgba(3, 7, 24, 0.99) 52%, rgba(0, 1, 8, 1))",
    } satisfies CSSProperties;
  }

  if (phase === "milestoneCharge" || phase === "checkpointFeedback") {
    return {
      background:
        "radial-gradient(circle at 50% 82%, rgba(251, 146, 60, 0.45), transparent 25%), linear-gradient(180deg, rgba(32, 58, 103, 0.94), rgba(5, 12, 31, 0.98) 62%, rgba(1, 3, 12, 1))",
    } satisfies CSSProperties;
  }

  return {};
}

const sceneStyle = {
  background:
    "radial-gradient(circle at 50% 82%, rgba(251, 146, 60, 0.4), transparent 26%), linear-gradient(180deg, rgba(28, 54, 105, 0.92), rgba(4, 9, 24, 0.98) 62%, rgba(1, 3, 12, 1))",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "24px",
  boxShadow: "inset 0 0 44px rgba(125, 211, 252, 0.08), 0 18px 48px rgba(0,0,0,0.24)",
  minHeight: "clamp(230px, 52vw, 360px)",
  overflow: "hidden",
  position: "relative",
} satisfies CSSProperties;

const statusStyle = {
  alignItems: "center",
  background: "linear-gradient(90deg, rgba(2, 6, 23, 0.76), rgba(15, 23, 42, 0.34))",
  color: "#cbd5e1",
  display: "flex",
  fontSize: "0.72rem",
  fontWeight: 900,
  inset: "0 0 auto 0",
  justifyContent: "space-between",
  letterSpacing: "0.12em",
  padding: "10px 12px",
  position: "absolute",
  textTransform: "uppercase",
  zIndex: 3,
} satisfies CSSProperties;

const starStyle = {
  background:
    "radial-gradient(circle at 16% 24%, rgba(248,250,252,0.8) 0 1px, transparent 2px), radial-gradient(circle at 72% 18%, rgba(248,250,252,0.7) 0 1px, transparent 2px), radial-gradient(circle at 84% 58%, rgba(134,239,172,0.5) 0 1px, transparent 2px), radial-gradient(circle at 42% 12%, rgba(248,250,252,0.54) 0 1px, transparent 2px), radial-gradient(circle at 28% 54%, rgba(125,211,252,0.45) 0 1px, transparent 2px)",
  inset: 0,
  position: "absolute",
  transition: "opacity 420ms ease",
} satisfies CSSProperties;

const skyGlowStyle = {
  background: "radial-gradient(circle at 50% 78%, rgba(251,146,60,0.3), transparent 28%)",
  inset: 0,
  position: "absolute",
  transition: "opacity 420ms ease",
} satisfies CSSProperties;

const svgStyle = {
  display: "block",
  minHeight: "clamp(230px, 52vw, 360px)",
  position: "relative",
  width: "100%",
  zIndex: 2,
} satisfies CSSProperties;
