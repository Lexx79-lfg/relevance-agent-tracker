import { useRewardSystem } from "../RewardSystemProvider";

export function RewardSceneHost() {
  const { copy, state, theme } = useRewardSystem();
  const Scene = theme.Scene;

  return <Scene copy={copy} state={state} />;
}
