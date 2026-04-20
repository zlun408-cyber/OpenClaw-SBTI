import type { CharacterState, RoomId } from "../../types/domain";

import { getOfficeRoomVisual } from "./officeEnvironmentVisuals";

export const OFFICE_DOOR_CHANGED_EVENT = "OFFICE_DOOR_CHANGED";

type OfficeDoorDescriptor = {
  activity: string;
  core: string;
  runes: string;
  threshold: string;
};

const ACTIVE_DOOR_RUNTIME_STATES: Record<CharacterState, OfficeDoorDescriptor> = {
  idle: { activity: "idle", core: "active", runes: "online", threshold: "glowing" },
  walk: { activity: "walk", core: "routing", runes: "streaming", threshold: "tracking" },
  work: { activity: "work", core: "focused", runes: "targeting", threshold: "steady" },
  rest: { activity: "rest", core: "calm", runes: "slow", threshold: "soft" },
  sleep: { activity: "sleep", core: "dimmed", runes: "quiet", threshold: "dim" },
  dance: { activity: "dance", core: "resonating", runes: "resonant", threshold: "vibrating" },
  train: { activity: "train", core: "syncing", runes: "accelerating", threshold: "pulsing" },
  "task-submit": { activity: "task-submit", core: "release", runes: "confirming", threshold: "opening" }
};

const INACTIVE_DOOR_RUNTIME_STATE: OfficeDoorDescriptor = {
  activity: "idle",
  core: "standby",
  runes: "offline",
  threshold: "sealed"
};

export type OfficeDoorRuntimeState = OfficeDoorDescriptor & {
  roomId: RoomId;
  accentColor: number;
  fillColor: number;
  isActive: boolean;
};

export type OfficeDoorChangedEvent = {
  type: typeof OFFICE_DOOR_CHANGED_EVENT;
  doorState: OfficeDoorRuntimeState;
};

export function resolveOfficeDoorRuntime({
  roomId,
  activeRoomId,
  characterState
}: {
  roomId: RoomId;
  activeRoomId: RoomId | null;
  characterState: CharacterState;
}): OfficeDoorRuntimeState {
  const visual = getOfficeRoomVisual(roomId);
  const isActive = roomId === activeRoomId;
  const runtime = isActive ? ACTIVE_DOOR_RUNTIME_STATES[characterState] : INACTIVE_DOOR_RUNTIME_STATE;

  return {
    roomId,
    ...runtime,
    accentColor: visual.accent,
    fillColor: visual.fill,
    isActive
  };
}
