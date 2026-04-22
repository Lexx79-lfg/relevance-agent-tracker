import type { SpaceDestination } from "../../types/journey";

export const spaceDestinations: SpaceDestination[] = [
  { id: "earth-orbit", label: "Earth Orbit" },
  { id: "moon", label: "Moon" },
  { id: "mars", label: "Mars" },
  { id: "europa", label: "Europa" },
  { id: "titan", label: "Titan" },
  { id: "asteroid-belt", label: "Asteroid Belt" },
  { id: "station-echo", label: "Station Echo" },
  { id: "meteor-ridge", label: "Meteor Ridge" },
];

export function getSpaceDestinationLabel(id: string, fallback: string) {
  return spaceDestinations.find((destination) => destination.id === id)?.label ?? fallback;
}

export function getSpaceDestinationByIndex(index: number) {
  const safeIndex = Math.max(0, Math.min(index, spaceDestinations.length - 1));

  return spaceDestinations[safeIndex];
}
