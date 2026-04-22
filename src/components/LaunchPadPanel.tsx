import { useEffect, useRef, useState } from "react";
import { Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { JourneyPhase } from "../types/journey";

type LaunchPadPanelProps = {
  progressValue: number;
  tokens: number;
  toNextMilestone: number;
  milestone: number;
  milestoneCount: number;
  stage: number;
  stageName: string;
  streak: number;
  message: string;
  feedbackMode: "idle" | "token" | "milestone";
  feedbackKey: number;
  stageTransitionKey: number;
  rocketMissionState: "onPad" | "inSpace" | "landed";
  journeyPhase?: JourneyPhase;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function getPanelTitle({
  isArrivalReady,
  isCommandReady,
  isLanded,
  rocketMissionState,
}: {
  isArrivalReady: boolean;
  isCommandReady: boolean;
  isLanded: boolean;
  rocketMissionState: "onPad" | "inSpace" | "landed";
}) {
  if (isLanded) return "Touchdown Secured";
  if (isArrivalReady) return "Approach Locked";
  if (rocketMissionState === "inSpace") return "In Transit";
  if (isCommandReady) return "Command Ready";

  return "Fuel The Rocket";
}

function getPanelDescription({
  isArrivalReady,
  isCommandReady,
  isLanded,
  rocketMissionState,
}: {
  isArrivalReady: boolean;
  isCommandReady: boolean;
  isLanded: boolean;
  rocketMissionState: "onPad" | "inSpace" | "landed";
}) {
  if (isLanded) {
    return "The rocket is down and stable. This location is secured while the next route comes online.";
  }

  if (isArrivalReady) {
    return "The vehicle is approaching its destination. Hold the route steady, then choose the landing command.";
  }

  if (rocketMissionState === "inSpace") {
    return "The rocket is traveling through space. Each important task keeps the route powered.";
  }

  if (isCommandReady) {
    return "A major action is available. Normal progress can pause until you choose the next command.";
  }

  return "Each token powers the launch sequence. Reach a full reserve and trigger the next celebration cycle.";
}

function FuelBar({
  value,
  feedbackMode,
  feedbackKey,
}: {
  value: number;
  feedbackMode: "idle" | "token" | "milestone";
  feedbackKey: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.34em] text-emerald-200/80">
        <span>Fuel Reserve</span>
        <span>{Math.round(safeValue)}%</span>
      </div>
      <div className="starshooter-fuel-shell">
        <div className="starshooter-fuel-track">
          <motion.div
            className="starshooter-fuel-fill"
            animate={{ width: `${safeValue}%` }}
            transition={{ type: "spring", stiffness: 110, damping: 24 }}
          />
          {feedbackMode !== "idle" ? (
            <motion.div
              key={`fuel-${feedbackMode}-${feedbackKey}`}
              className={cn(
                "starshooter-fuel-feedback",
                feedbackMode === "milestone" && "starshooter-fuel-feedback-milestone"
              )}
              initial={{ opacity: 0, scaleX: 0.82 }}
              animate={{ opacity: [0, 1, 0], scaleX: [0.82, 1.04, 1] }}
              transition={{ duration: feedbackMode === "milestone" ? 0.95 : 0.45, ease: "easeOut" }}
            />
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
        <span>Prep</span>
        <span className="text-emerald-200">Fuel</span>
        <span>Boost</span>
      </div>
    </div>
  );
}

type SceneState =
  | "idle"
  | "tokenPulse"
  | "milestoneIgnition"
  | "milestoneHold"
  | "milestoneRelease"
  | "milestoneSuccessIgnition"
  | "milestoneSuccessBuild"
  | "milestoneSuccessAscent"
  | "milestoneSuccessSettle"
  | "returningDescent"
  | "returningApproach"
  | "futureCatch"
  | "futureRelaunch";

type ScenePosition = "onPad" | "inSpace" | "returning" | "landed";

const TOKEN_PULSE_MS = 220;
const MILESTONE_IGNITION_MS = 180;
const MILESTONE_HOLD_MS = 260;
const MILESTONE_RELEASE_MS = 320;
const MILESTONE_SUCCESS_IGNITION_MS = 220;
const MILESTONE_SUCCESS_BUILD_MS = 420;
const MILESTONE_SUCCESS_ASCENT_MS = 1180;
const MILESTONE_SUCCESS_SETTLE_MS = 520;

function LaunchSceneSvg({
  sceneState,
  scenePosition,
}: {
  sceneState: SceneState;
  scenePosition: ScenePosition;
}) {
  const isInSpace =
    scenePosition === "inSpace" ||
    sceneState === "milestoneSuccessAscent" ||
    sceneState === "milestoneSuccessSettle";
  const isReturning =
    scenePosition === "returning" ||
    sceneState === "returningDescent" ||
    sceneState === "returningApproach";
  const isTrailActive = isInSpace || isReturning;
  const engineState =
    sceneState === "tokenPulse"
      ? {
          coreOpacity: 0.95,
          coreScale: 1,
          plumeOpacity: 0.8,
          plumeScaleX: 0.88,
          plumeScaleY: 0.82,
          reflectionOpacity: 0.42,
          reflectionScaleX: 0.94,
          reflectionScaleY: 0.9,
          washOpacity: 0.3,
          washScale: 0.9,
        }
      : sceneState === "milestoneIgnition"
        ? {
            coreOpacity: 1,
            coreScale: 1.08,
            plumeOpacity: 0.92,
            plumeScaleX: 0.94,
            plumeScaleY: 0.96,
            reflectionOpacity: 0.62,
            reflectionScaleX: 1,
            reflectionScaleY: 0.98,
            washOpacity: 0.42,
            washScale: 1,
          }
        : sceneState === "milestoneHold"
          ? {
              coreOpacity: 0.9,
              coreScale: 1.02,
              plumeOpacity: 0.96,
              plumeScaleX: 1,
              plumeScaleY: 1.16,
              reflectionOpacity: 0.78,
              reflectionScaleX: 1.08,
              reflectionScaleY: 1.06,
              washOpacity: 0.56,
              washScale: 1.12,
            }
          : sceneState === "milestoneRelease"
            ? {
                coreOpacity: 0.42,
                coreScale: 0.84,
                plumeOpacity: 0.48,
                plumeScaleX: 0.88,
                plumeScaleY: 0.72,
                reflectionOpacity: 0.28,
                reflectionScaleX: 0.94,
                reflectionScaleY: 0.9,
                washOpacity: 0.2,
                washScale: 0.9,
              }
            : sceneState === "milestoneSuccessIgnition"
              ? {
                  coreOpacity: 1,
                  coreScale: 1.08,
                  plumeOpacity: 0.92,
                  plumeScaleX: 0.92,
                  plumeScaleY: 0.98,
                  reflectionOpacity: 0.68,
                  reflectionScaleX: 1.04,
                  reflectionScaleY: 1,
                  washOpacity: 0.46,
                  washScale: 1.04,
                }
              : sceneState === "milestoneSuccessBuild"
                ? {
                    coreOpacity: 1,
                    coreScale: 1.16,
                    plumeOpacity: 1,
                    plumeScaleX: 1.08,
                    plumeScaleY: 1.34,
                    reflectionOpacity: 0.82,
                    reflectionScaleX: 1.16,
                    reflectionScaleY: 1.1,
                    washOpacity: 0.62,
                    washScale: 1.22,
                  }
                : sceneState === "milestoneSuccessAscent"
                  ? {
                      coreOpacity: 0.92,
                      coreScale: 1.08,
                      plumeOpacity: 0.9,
                      plumeScaleX: 1,
                      plumeScaleY: 1.48,
                      reflectionOpacity: 0.26,
                      reflectionScaleX: 0.96,
                      reflectionScaleY: 0.88,
                      washOpacity: 0.28,
                      washScale: 1.04,
                    }
                  : sceneState === "milestoneSuccessSettle"
                    ? {
                        coreOpacity: 0.34,
                        coreScale: 0.82,
                        plumeOpacity: 0.16,
                        plumeScaleX: 0.74,
                        plumeScaleY: 0.52,
                        reflectionOpacity: 0.06,
                        reflectionScaleX: 0.82,
                        reflectionScaleY: 0.8,
                        washOpacity: 0.08,
                        washScale: 0.8,
                      }
                    : sceneState === "returningDescent"
                      ? {
                          coreOpacity: 0.22,
                          coreScale: 0.72,
                          plumeOpacity: 0,
                          plumeScaleX: 0.72,
                          plumeScaleY: 0.42,
                          reflectionOpacity: 0.02,
                          reflectionScaleX: 0.8,
                          reflectionScaleY: 0.78,
                          washOpacity: 0.12,
                          washScale: 0.86,
                        }
                      : sceneState === "returningApproach" || scenePosition === "returning"
                        ? {
                            coreOpacity: 0.28,
                            coreScale: 0.76,
                            plumeOpacity: 0.1,
                            plumeScaleX: 0.58,
                            plumeScaleY: 0.36,
                            reflectionOpacity: 0.12,
                            reflectionScaleX: 0.86,
                            reflectionScaleY: 0.82,
                            washOpacity: 0.16,
                            washScale: 0.88,
                          }
            : scenePosition === "inSpace"
              ? {
                  coreOpacity: 0.12,
                  coreScale: 0.68,
                  plumeOpacity: 0,
                  plumeScaleX: 0.72,
                  plumeScaleY: 0.42,
                  reflectionOpacity: 0,
                  reflectionScaleX: 0.86,
                  reflectionScaleY: 0.86,
                  washOpacity: 0.06,
                  washScale: 0.78,
                }
              : scenePosition === "landed"
                ? {
                    coreOpacity: 0.08,
                    coreScale: 0.64,
                    plumeOpacity: 0,
                    plumeScaleX: 0.62,
                    plumeScaleY: 0.34,
                    reflectionOpacity: 0.18,
                    reflectionScaleX: 0.78,
                    reflectionScaleY: 0.72,
                    washOpacity: 0.04,
                    washScale: 0.72,
                  }
              : {
                  coreOpacity: 0.18,
                  coreScale: 0.72,
                  plumeOpacity: 0,
                  plumeScaleX: 0.72,
                  plumeScaleY: 0.42,
                  reflectionOpacity: 0,
                  reflectionScaleX: 0.86,
                  reflectionScaleY: 0.86,
                  washOpacity: 0,
                  washScale: 0.82,
                };

  const engineTransition =
    sceneState === "tokenPulse"
      ? { duration: 0.12, ease: "easeOut" as const }
      : sceneState === "milestoneIgnition"
        ? { duration: 0.14, ease: "easeOut" as const }
        : sceneState === "milestoneHold"
          ? { duration: 0.12, ease: "linear" as const }
          : sceneState === "milestoneRelease"
            ? { duration: 0.18, ease: "easeOut" as const }
            : sceneState === "milestoneSuccessIgnition"
              ? { duration: 0.16, ease: "easeOut" as const }
              : sceneState === "milestoneSuccessBuild"
                ? { duration: 0.28, ease: "easeOut" as const }
                : sceneState === "milestoneSuccessAscent"
                  ? { duration: 0.58, ease: "linear" as const }
                  : sceneState === "milestoneSuccessSettle"
                    ? { duration: 0.36, ease: "easeOut" as const }
                    : sceneState === "returningDescent"
                      ? { duration: 0.9, ease: "easeInOut" as const }
                      : sceneState === "returningApproach"
                        ? { duration: 0.7, ease: "easeOut" as const }
            : { duration: 0.16, ease: "easeOut" as const };
  const travelOffset =
    sceneState === "milestoneHold"
      ? { rocketY: -12, groundY: 8 }
      : sceneState === "milestoneRelease"
        ? { rocketY: -24, groundY: 18 }
        : sceneState === "milestoneSuccessBuild"
          ? { rocketY: -28, groundY: 20 }
          : sceneState === "milestoneSuccessAscent"
            ? { rocketY: -150, groundY: 430 }
            : sceneState === "milestoneSuccessSettle"
              ? { rocketY: -118, groundY: 430 }
              : sceneState === "returningDescent"
                ? { rocketY: -150, groundY: 280 }
              : sceneState === "returningApproach" || scenePosition === "returning"
                  ? { rocketY: -62, groundY: 78 }
                : scenePosition === "landed"
                  ? { rocketY: -8, groundY: 0 }
              : scenePosition === "inSpace"
                ? { rocketY: -118, groundY: 430 }
                : { rocketY: 0, groundY: 0 };
  const travelTransition =
    sceneState === "milestoneHold"
      ? { duration: 0.22, ease: "easeOut" as const }
      : sceneState === "milestoneRelease"
        ? { duration: 0.28, ease: "easeOut" as const }
        : sceneState === "milestoneSuccessBuild"
          ? { duration: 0.36, ease: "easeOut" as const }
          : sceneState === "milestoneSuccessAscent"
            ? { duration: 1.1, ease: "easeInOut" as const }
            : sceneState === "milestoneSuccessSettle"
              ? { duration: 0.46, ease: "easeOut" as const }
              : sceneState === "returningDescent"
                ? { duration: 1, ease: "easeInOut" as const }
                : sceneState === "returningApproach"
                  ? { duration: 0.8, ease: "easeOut" as const }
        : { duration: 0.18, ease: "easeOut" as const };
  const environmentState =
    sceneState === "milestoneSuccessAscent"
      ? { groundOpacity: 0.08, skyOpacity: 0.34, skyY: -22, starsOpacity: 0.3, trailOpacity: 0.18 }
      : sceneState === "milestoneSuccessSettle"
        ? { groundOpacity: 0.02, skyOpacity: 0.28, skyY: -18, starsOpacity: 0.36, trailOpacity: 0.16 }
        : sceneState === "returningDescent"
          ? { groundOpacity: 0.12, skyOpacity: 0.22, skyY: -12, starsOpacity: 0.24, trailOpacity: 0.1 }
          : sceneState === "returningApproach" || scenePosition === "returning"
            ? { groundOpacity: 0.54, skyOpacity: 0.12, skyY: -6, starsOpacity: 0.1, trailOpacity: 0.04 }
        : scenePosition === "landed"
          ? { groundOpacity: 1, skyOpacity: 0.04, skyY: 0, starsOpacity: 0, trailOpacity: 0 }
        : scenePosition === "inSpace"
          ? { groundOpacity: 0, skyOpacity: 0.24, skyY: -18, starsOpacity: 0.34, trailOpacity: 0.14 }
          : { groundOpacity: 1, skyOpacity: 0, skyY: 0, starsOpacity: 0, trailOpacity: 0 };
  const catchZoneOpacity = isReturning ? 0.74 : scenePosition === "onPad" ? 0.28 : 0.12;

  return (
    <svg
      className="starshooter-scene-svg"
      viewBox="0 0 760 420"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sceneRocketBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#edf4ff" />
          <stop offset="62%" stopColor="#cad6ea" />
          <stop offset="100%" stopColor="#73829d" />
        </linearGradient>
        <linearGradient id="sceneRocketShadow" x1="0" x2="1">
          <stop offset="0%" stopColor="#f8fbff" stopOpacity="0" />
          <stop offset="58%" stopColor="#60708d" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#293650" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id="sceneRocketFin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffab74" />
          <stop offset="48%" stopColor="#ff7d36" />
          <stop offset="100%" stopColor="#c44a11" />
        </linearGradient>
        <linearGradient id="sceneEngineBell" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#617089" />
          <stop offset="58%" stopColor="#2a3548" />
          <stop offset="100%" stopColor="#121927" />
        </linearGradient>
        <radialGradient id="sceneRocketWindow" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#effcff" />
          <stop offset="45%" stopColor="#75d6ff" />
          <stop offset="100%" stopColor="#15304f" />
        </radialGradient>
        <linearGradient id="sceneRocketHighlight" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scenePadDeck" x1="0" x2="1">
          <stop offset="0%" stopColor="#324a78" />
          <stop offset="52%" stopColor="#16233d" />
          <stop offset="100%" stopColor="#0a111d" />
        </linearGradient>
        <linearGradient id="sceneTowerFrame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#223b67" />
          <stop offset="100%" stopColor="#0b1322" />
        </linearGradient>
        <linearGradient id="scenePlume" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,247,224,0.98)" />
          <stop offset="18%" stopColor="rgba(255,223,168,0.92)" />
          <stop offset="56%" stopColor="rgba(255,160,72,0.58)" />
          <stop offset="100%" stopColor="rgba(255,118,34,0)" />
        </linearGradient>
        <radialGradient id="sceneReflection" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,240,196,0.78)" />
          <stop offset="36%" stopColor="rgba(255,181,84,0.42)" />
          <stop offset="100%" stopColor="rgba(255,139,61,0)" />
        </radialGradient>
        <radialGradient id="sceneExhaustWash" cx="50%" cy="18%" r="78%">
          <stop offset="0%" stopColor="rgba(255,233,190,0.28)" />
          <stop offset="44%" stopColor="rgba(255,166,84,0.18)" />
          <stop offset="100%" stopColor="rgba(255,139,61,0)" />
        </radialGradient>
      </defs>
      <g id="scene-environment">
        <motion.rect
          x="0"
          y="0"
          width="760"
          height="420"
          fill="rgba(84,145,255,0.16)"
          animate={{ opacity: environmentState.skyOpacity, y: environmentState.skyY }}
          transition={travelTransition}
        />
        <motion.g
          id="scene-space-stars"
          animate={{ opacity: environmentState.starsOpacity, y: environmentState.skyY }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <circle cx="132" cy="70" r="1.2" fill="rgba(255,255,255,0.7)" />
          <circle cx="214" cy="118" r="0.9" fill="rgba(176,211,255,0.68)" />
          <circle cx="302" cy="58" r="1.1" fill="rgba(255,255,255,0.62)" />
          <circle cx="482" cy="86" r="1" fill="rgba(190,255,222,0.54)" />
          <circle cx="598" cy="124" r="1.2" fill="rgba(255,255,255,0.56)" />
          <circle cx="664" cy="62" r="0.8" fill="rgba(176,211,255,0.62)" />
          <circle cx="390" cy="150" r="0.8" fill="rgba(255,255,255,0.48)" />
          <circle cx="704" cy="178" r="0.9" fill="rgba(255,255,255,0.5)" />
        </motion.g>
        <path
          d="M88 322 C172 280 230 286 298 320 C350 344 402 346 456 328 C512 308 566 300 636 318 L636 356 L88 356 Z"
          fill="rgba(255,255,255,0.05)"
          opacity={environmentState.groundOpacity}
        />
      </g>

      <motion.g animate={{ y: travelOffset.groundY }} transition={travelTransition}>
        <g id="scene-pad">
          <path d="M164 336 H596 L620 356 H140 Z" fill="rgba(0,0,0,0.45)" />
          <rect x="176" y="304" width="408" height="28" rx="14" fill="url(#scenePadDeck)" />
          <rect x="198" y="314" width="364" height="8" rx="4" fill="rgba(111,255,167,0.08)" />
          <rect x="220" y="323" width="320" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
          <path d="M334 302 H426 L438 286 H322 Z" fill="rgba(25,36,59,0.96)" />
        </g>
      </motion.g>

      <motion.g animate={{ y: travelOffset.groundY }} transition={travelTransition}>
        <g id="scene-tower" transform="translate(520 100)">
          <g id="tower-frame">
            <path
              d="M0 226 L10 0 H24 L36 226 H48 L60 26 H74 L88 226 H102 V236 H0 Z"
              fill="url(#sceneTowerFrame)"
              stroke="rgba(151,181,242,0.14)"
              strokeWidth="1.5"
            />
            <path d="M26 34 V226" stroke="rgba(158,185,241,0.18)" strokeWidth="3" />
            <path d="M76 34 V226" stroke="rgba(158,185,241,0.18)" strokeWidth="3" />
          </g>
          <g id="tower-crossbars">
            <path d="M18 34 H84" stroke="rgba(140,171,232,0.18)" strokeWidth="4" />
            <path d="M16 72 H86" stroke="rgba(140,171,232,0.16)" strokeWidth="3" />
            <path d="M14 112 H88" stroke="rgba(140,171,232,0.14)" strokeWidth="3" />
            <path d="M12 152 H90" stroke="rgba(140,171,232,0.12)" strokeWidth="3" />
          </g>
          <g id="tower-catch-arms">
            <motion.g
              id="tower-catch-zone"
              animate={{ opacity: catchZoneOpacity }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <rect x="-28" y="45" width="46" height="30" rx="8" fill="rgba(111,255,167,0.08)" />
              <rect x="84" y="45" width="46" height="30" rx="8" fill="rgba(111,255,167,0.08)" />
              <path d="M-22 60 H14" stroke="rgba(158,255,205,0.38)" strokeWidth="2" strokeLinecap="round" />
              <path d="M90 60 H126" stroke="rgba(158,255,205,0.38)" strokeWidth="2" strokeLinecap="round" />
            </motion.g>
            <path
              d="M-42 54 H20 L26 66 H-42 Z M82 54 H144 L138 66 H82 Z"
              fill="rgba(17,30,56,0.96)"
              stroke="rgba(111,255,167,0.22)"
              strokeWidth="1.5"
            />
            <path d="M-8 54 L14 54 L6 34 H0 Z" fill="rgba(70,95,138,0.72)" />
            <path d="M88 54 L110 54 L102 34 H96 Z" fill="rgba(70,95,138,0.72)" />
          </g>
          <g id="tower-lighting">
            <rect x="-10" y="62" width="8" height="54" rx="4" fill="rgba(111,255,167,0.1)" />
            <rect x="104" y="62" width="8" height="54" rx="4" fill="rgba(111,255,167,0.1)" />
          </g>
        </g>
      </motion.g>

      <motion.g animate={{ y: travelOffset.rocketY }} transition={travelTransition}>
      <g id="scene-rocket" transform="translate(320 34)">
        <g id="rocket-fins">
          <path d="M44 226 C26 210 18 188 20 152 L52 166 L58 246 Z" fill="url(#sceneRocketFin)" />
          <path d="M116 226 C134 210 142 188 140 152 L108 166 L102 246 Z" fill="url(#sceneRocketFin)" />
        </g>
        <g id="rocket-body">
          <path
            d="M80 8 C102 38 122 86 122 156 V226 C122 244 104 260 80 260 C56 260 38 244 38 226 V156 C38 86 58 38 80 8 Z"
            fill="url(#sceneRocketBody)"
          />
          <path
            d="M80 8 C102 38 122 86 122 156 V226 C122 244 104 260 80 260 C56 260 38 244 38 226 V156 C38 86 58 38 80 8 Z"
            fill="url(#sceneRocketShadow)"
          />
          <path
            d="M60 32 C66 20 74 16 80 16"
            fill="none"
            stroke="url(#sceneRocketHighlight)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M62 36 C70 26 90 26 98 36" fill="none" stroke="rgba(255,255,255,0.68)" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="80" cy="104" rx="18" ry="18" fill="url(#sceneRocketWindow)" />
          <ellipse cx="80" cy="104" rx="22" ry="22" fill="none" stroke="rgba(45,62,94,0.28)" strokeWidth="6" />
          <path d="M38 162 H122" stroke="rgba(87,102,132,0.24)" strokeWidth="4" />
          <path d="M38 190 H122" stroke="rgba(87,102,132,0.18)" strokeWidth="3" />
          <path d="M42 160 C26 184 24 210 28 238 C42 232 52 224 60 214 L56 168 Z" fill="rgba(255,255,255,0.08)" />
          <path d="M118 160 C134 184 136 210 132 238 C118 232 108 224 100 214 L104 168 Z" fill="rgba(0,0,0,0.16)" />
        </g>
        <g id="rocket-engine-housing">
          <path d="M52 246 H108 V270 C108 282 96 292 80 292 C64 292 52 282 52 270 Z" fill="rgba(24,31,46,0.92)" />
          <path d="M58 250 H102 V268 C102 278 92 286 80 286 C68 286 58 278 58 268 Z" fill="rgba(10,15,25,0.72)" />
        </g>
      </g>
      </motion.g>

      <motion.g animate={{ y: travelOffset.rocketY }} transition={travelTransition}>
      <motion.g id="scene-engine" transform="translate(400 326)">
        <motion.g
          id="engine-space-trail"
          animate={{
            opacity: environmentState.trailOpacity,
            y: isTrailActive ? [0, 8, 0] : 0,
          }}
          transition={{
            opacity: { duration: 0.9, ease: "easeOut" },
            y: { duration: 4.8, ease: "easeInOut", repeat: isTrailActive ? Infinity : 0 },
          }}
        >
          <path
            d="M-30 30 C-46 84 -34 140 -8 196 C6 154 18 96 30 30 Z"
            fill="rgba(226,238,255,0.12)"
          />
          <path
            d="M-12 34 C-22 90 -12 140 4 182 C14 134 18 86 12 34 Z"
            fill="rgba(255,246,228,0.08)"
          />
        </motion.g>
        <g id="engine-reflection">
          <motion.ellipse
            cx="0"
            cy="22"
            rx="126"
            ry="22"
            fill="url(#sceneReflection)"
            animate={{
              opacity: engineState.reflectionOpacity,
              scaleX: engineState.reflectionScaleX,
              scaleY: engineState.reflectionScaleY,
            }}
            transition={engineTransition}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        </g>
        <g id="engine-exhaust-wash">
          <motion.path
            d="M-88 14 C-70 32 -54 44 0 50 C54 44 70 32 88 14 C74 70 48 96 0 108 C-48 96 -74 70 -88 14 Z"
            fill="url(#sceneExhaustWash)"
            animate={{
              opacity: engineState.washOpacity,
              scaleX: engineState.washScale,
              scaleY: engineState.washScale,
            }}
            transition={engineTransition}
            style={{ originX: 0.5, originY: 0 }}
          />
        </g>
        <motion.g
          id="engine-thrust"
          animate={{
            opacity: engineState.plumeOpacity,
            scaleX: engineState.plumeScaleX,
            scaleY: engineState.plumeScaleY,
          }}
          transition={engineTransition}
          style={{ originX: 0.5, originY: 0 }}
        >
          <path
            d="M-12 6 C-26 34 -42 76 -44 124 C-26 138 -14 142 0 144 C14 142 26 138 44 124 C42 76 26 34 12 6 Z"
            fill="url(#scenePlume)"
          />
          <path
            d="M-6 12 C-14 38 -22 74 -22 118 C-12 126 -6 128 0 130 C6 128 12 126 22 118 C22 74 14 38 6 12 Z"
            fill="rgba(255,246,228,0.68)"
          />
        </motion.g>
        <g id="engine-bell">
          <motion.ellipse
            cx="0"
            cy="10"
            rx="14"
            ry="26"
            fill="rgba(255,244,214,0.96)"
            animate={{ opacity: engineState.coreOpacity, scaleX: engineState.coreScale, scaleY: engineState.coreScale }}
            transition={engineTransition}
            style={{ originX: 0.5, originY: 0.2 }}
          />
          <path d="M-20 -10 H20 V16 C20 28 10 34 0 34 C-10 34 -20 28 -20 16 Z" fill="url(#sceneEngineBell)" />
          <path d="M-12 -6 H12 V10 C12 18 6 22 0 22 C-6 22 -12 18 -12 10 Z" fill="rgba(8,12,20,0.72)" />
        </g>
      </motion.g>
      </motion.g>
    </svg>
  );
}

export function LaunchPadPanel({
  progressValue,
  tokens,
  toNextMilestone,
  milestone,
  milestoneCount,
  stage,
  stageName,
  streak,
  message,
  feedbackMode,
  feedbackKey,
  stageTransitionKey,
  rocketMissionState,
  journeyPhase,
}: LaunchPadPanelProps) {
  const [sceneState, setSceneState] = useState<SceneState>("idle");
  const isArrivalReady = journeyPhase === "arrivalReady" || message.toLowerCase().includes("landing command ready");
  const scenePosition: ScenePosition =
    rocketMissionState === "landed"
      ? "landed"
      : isArrivalReady
        ? "returning"
        : rocketMissionState === "inSpace"
          ? "inSpace"
          : "onPad";
  const isLanded = rocketMissionState === "landed";
  const isCommandReady = message.toLowerCase().includes("command ready");
  const sceneTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      sceneTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      sceneTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    sceneTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    sceneTimersRef.current = [];

    if (feedbackMode === "token") {
      setSceneState("tokenPulse");
      sceneTimersRef.current.push(window.setTimeout(() => setSceneState("idle"), TOKEN_PULSE_MS));
      return;
    }

    if (feedbackMode === "milestone") {
      setSceneState("milestoneSuccessIgnition");
      sceneTimersRef.current.push(
        window.setTimeout(() => setSceneState("milestoneSuccessBuild"), MILESTONE_SUCCESS_IGNITION_MS),
        window.setTimeout(
          () => setSceneState("milestoneSuccessAscent"),
          MILESTONE_SUCCESS_IGNITION_MS + MILESTONE_SUCCESS_BUILD_MS
        ),
        window.setTimeout(
          () => setSceneState("milestoneSuccessSettle"),
          MILESTONE_SUCCESS_IGNITION_MS + MILESTONE_SUCCESS_BUILD_MS + MILESTONE_SUCCESS_ASCENT_MS
        ),
        window.setTimeout(
          () => {
            setSceneState("idle");
          },
          MILESTONE_SUCCESS_IGNITION_MS +
            MILESTONE_SUCCESS_BUILD_MS +
            MILESTONE_SUCCESS_ASCENT_MS +
            MILESTONE_SUCCESS_SETTLE_MS
        )
      );
      return;
    }

    setSceneState("idle");
  }, [feedbackKey, feedbackMode]);

  return (
    <section
      className="starshooter-panel starshooter-panel-glow overflow-hidden"
      data-stage={stage}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="starshooter-kicker">Launch Pad</div>
          <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] text-white md:text-3xl">
            {getPanelTitle({ isArrivalReady, isCommandReady, isLanded, rocketMissionState })}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
            {getPanelDescription({ isArrivalReady, isCommandReady, isLanded, rocketMissionState })}
          </p>
        </div>
        <div className="space-y-3 text-right">
          <div className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
            Every {milestone}
          </div>
          <motion.div
            key={`stage-${stage}-${stageTransitionKey}`}
            className="starshooter-stage-chip"
            initial={stageTransitionKey > 0 ? { opacity: 0.7, scale: 0.94, y: 4 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <span>{stageName}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,255,168,0.85)]" />
            <span>{milestoneCount} milestones</span>
          </motion.div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="starshooter-launch-stage">
          <div className="starshooter-stars" />
          <div className="starshooter-aurora" />
          <div className="starshooter-launch-grid" />
          <div className="starshooter-launch-haze" />
          <div className="starshooter-launch-bloom" />
          <div className="starshooter-launch-reflection" />
          {stageTransitionKey > 0 ? (
            <motion.div
              key={`stage-shift-${stage}-${stageTransitionKey}`}
              className="starshooter-stage-shift"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: [0, 0.92, 0], scale: [0.94, 1.04, 1.08] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          ) : null}
          <div className="starshooter-scene-frame">
            <LaunchSceneSvg sceneState={sceneState} scenePosition={scenePosition} />
          </div>
        </div>

        <div className="space-y-5">
          <FuelBar value={progressValue} feedbackMode={feedbackMode} feedbackKey={feedbackKey} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="starshooter-stat-tile">
              <Zap className="h-5 w-5 text-emerald-300" />
              <div className="mt-3 text-[11px] uppercase tracking-[0.28em] text-slate-400">Fuel Cells</div>
              <div className="mt-2 text-4xl font-semibold text-white">{tokens}</div>
            </div>
            <div className="starshooter-stat-tile">
              <Flame className="h-5 w-5 text-orange-300" />
              <div className="mt-3 text-[11px] uppercase tracking-[0.28em] text-slate-400">Ignition Streak</div>
              <div className="mt-2 text-4xl font-semibold text-white">{streak}</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-400/18 bg-emerald-500/8 px-5 py-4 text-sm leading-7 text-emerald-100 shadow-[0_0_34px_rgba(74,222,128,0.08)]">
            {isLanded
              ? "Landed state confirmed. The next tokens prepare a separate route."
              : `${toNextMilestone} token${toNextMilestone === 1 ? "" : "s"} until the next launch celebration.`}
          </div>

          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-[28px] border px-5 py-4 text-sm leading-7 shadow-[0_14px_40px_rgba(0,0,0,0.28)]",
              "border-orange-400/18 bg-orange-500/8 text-orange-50"
            )}
          >
            {message}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
