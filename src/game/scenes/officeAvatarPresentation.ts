import type { CharacterState, RoomId } from "../../types/domain";

export type AvatarFacing = "left" | "right" | "center";

type AvatarPresentationInput = {
  roomId: RoomId | null;
  state: CharacterState;
};

type AvatarPalette = {
  auraColor: number;
  accentColor: number;
  bodyColor: number;
  mantleColor: number;
  auraAlpha: number;
  statusLabel: string;
  emoteLabel: string;
};

const ROOM_IDLE_PRESENTATIONS: Record<RoomId, AvatarPalette> = {
  office: {
    auraColor: 0x8cc2b3,
    accentColor: 0x8cc2b3,
    bodyColor: 0x567f8f,
    mantleColor: 0x223345,
    auraAlpha: 0.16,
    statusLabel: "On Watch",
    emoteLabel: "Sync"
  },
  meeting: {
    auraColor: 0xf0ca87,
    accentColor: 0xf0ca87,
    bodyColor: 0x8e6745,
    mantleColor: 0x37251b,
    auraAlpha: 0.17,
    statusLabel: "Briefing",
    emoteLabel: "Plan"
  },
  hr: {
    auraColor: 0xd3b2f3,
    accentColor: 0xd3b2f3,
    bodyColor: 0x7c61a1,
    mantleColor: 0x2f223f,
    auraAlpha: 0.18,
    statusLabel: "Soul Sync",
    emoteLabel: "Memo"
  },
  training: {
    auraColor: 0x9fe3c4,
    accentColor: 0x9fe3c4,
    bodyColor: 0x4f8b79,
    mantleColor: 0x1e3e38,
    auraAlpha: 0.18,
    statusLabel: "Learning",
    emoteLabel: "Skill"
  },
  rest: {
    auraColor: 0xf1c996,
    accentColor: 0xf1c996,
    bodyColor: 0xa36e49,
    mantleColor: 0x43291b,
    auraAlpha: 0.2,
    statusLabel: "At Ease",
    emoteLabel: "Rest"
  }
};

const STATE_PRESENTATIONS: Partial<Record<CharacterState, AvatarPalette>> = {
  walk: {
    auraColor: 0x8fd9ff,
    accentColor: 0xd7f4ff,
    bodyColor: 0x6b9fbc,
    mantleColor: 0x213243,
    auraAlpha: 0.18,
    statusLabel: "Patrolling",
    emoteLabel: "Move"
  },
  work: {
    auraColor: 0x89d2ff,
    accentColor: 0xa5ebff,
    bodyColor: 0x5889b0,
    mantleColor: 0x1d3044,
    auraAlpha: 0.18,
    statusLabel: "Working",
    emoteLabel: "Focus"
  },
  train: {
    auraColor: 0x9fe3c4,
    accentColor: 0x9fe3c4,
    bodyColor: 0x54937e,
    mantleColor: 0x20423b,
    auraAlpha: 0.2,
    statusLabel: "Training",
    emoteLabel: "+Skill"
  },
  "task-submit": {
    auraColor: 0xf4d08f,
    accentColor: 0xf4d08f,
    bodyColor: 0xa98347,
    mantleColor: 0x3a2c16,
    auraAlpha: 0.21,
    statusLabel: "Submitting",
    emoteLabel: "Deliver"
  },
  rest: {
    auraColor: 0x9cd7d1,
    accentColor: 0xbdece7,
    bodyColor: 0x567f8f,
    mantleColor: 0x1f2d38,
    auraAlpha: 0.17,
    statusLabel: "Cooling Down",
    emoteLabel: "Tea"
  },
  sleep: {
    auraColor: 0x8aa6d9,
    accentColor: 0xc1d0ff,
    bodyColor: 0x5d76a5,
    mantleColor: 0x232c4e,
    auraAlpha: 0.15,
    statusLabel: "Sleeping",
    emoteLabel: "Zz"
  },
  dance: {
    auraColor: 0xf39ddb,
    accentColor: 0xffc7e9,
    bodyColor: 0xb46cb0,
    mantleColor: 0x462249,
    auraAlpha: 0.22,
    statusLabel: "Freestyle",
    emoteLabel: "Dance"
  }
};

export const resolveAvatarPresentation = ({
  roomId,
  state
}: AvatarPresentationInput): AvatarPalette => {
  const resolvedRoomId = roomId ?? "office";
  return STATE_PRESENTATIONS[state] ?? ROOM_IDLE_PRESENTATIONS[resolvedRoomId];
};

export const resolveAvatarFacing = (movementDelta: { x: number; y: number }): AvatarFacing => {
  if (Math.abs(movementDelta.x) < 0.25) {
    return "center";
  }

  return movementDelta.x < 0 ? "left" : "right";
};

export const resolveAvatarNameplate = (customName: string, title: string) => {
  const normalizedName = customName.trim();
  return normalizedName ? `${normalizedName} · ${title}` : title;
};
