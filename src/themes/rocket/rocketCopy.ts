import type { RewardPhase, RewardThemeCopyInput } from "../../rewards/types";

export const rocketLabels = {
  actionButton: "Log completed step",
  checkpoint: "Readiness cue",
  milestoneTarget: "Launch target",
  progress: "Mission fuel",
  remaining: "steps left",
  title: "Rocket progress",
};

export function getRocketCelebrationCopy(input: RewardThemeCopyInput) {
  const name = input.userName ?? "friend";
  const destination = input.destinationName ?? "the next destination";
  const target = input.targetName ?? "milestone";

  return {
    title: "Launch confirmed.",
    body: `${name}, ${target} is complete. The route is moving toward ${destination}.`,
    actionLabel: "Continue mission",
  };
}

export function getRocketStatusLabel(phase: RewardPhase) {
  if (phase === "tokenFeedback") return "Fuel added.";
  if (phase === "checkpointFeedback") return "Systems charging.";
  if (phase === "milestoneCharge") return "Ready for liftoff.";
  if (phase === "milestoneLaunch") return "Liftoff.";
  if (phase === "milestoneCelebrate") return "You hit your launch target.";
  if (phase === "milestoneSettle") return "Next mission cycle ready.";

  return "Ready.";
}
