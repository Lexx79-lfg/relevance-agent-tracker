import { rocketTheme } from "../themes/rocket/rocketTheme";
import type { RewardThemeDefinition, RewardThemeId } from "./types";

export const rewardThemes: Record<RewardThemeId, RewardThemeDefinition> = {
  rocket: rocketTheme,
};

export function getRewardTheme(themeId: RewardThemeId) {
  return rewardThemes[themeId] ?? rewardThemes.rocket;
}
