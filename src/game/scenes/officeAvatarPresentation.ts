import type { CharacterState, QuizResultType, RoomId } from "../../types/domain";
import { getCharacterConfig } from "../data/characterRegistry";

export type AvatarFacing = "left" | "right" | "center";

type AvatarPresentationInput = {
  roomId: RoomId | null;
  state: CharacterState;
  resultType: QuizResultType | null;
};

type AvatarBasePalette = {
  auraColor: number;
  accentColor: number;
  bodyColor: number;
  mantleColor: number;
  auraAlpha: number;
  statusLabel: string;
  emoteLabel: string;
};

type AvatarPresentation = AvatarBasePalette & {
  personaCode: QuizResultType | null;
  personaAssetKey: string | null;
  personaTitle: string | null;
  portraitPath: string | null;
  assetPath: string | null;
};

const ROOM_IDLE_PRESENTATIONS: Record<RoomId, AvatarBasePalette> = {
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

const STATE_PRESENTATIONS: Partial<Record<CharacterState, AvatarBasePalette>> = {
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
  state,
  resultType
}: AvatarPresentationInput): AvatarPresentation => {
  const resolvedRoomId = roomId ?? "office";
  const basePresentation = STATE_PRESENTATIONS[state] ?? ROOM_IDLE_PRESENTATIONS[resolvedRoomId];

  if (!resultType) {
    return {
      ...basePresentation,
      personaCode: null,
      personaAssetKey: null,
      personaTitle: null,
      portraitPath: null,
      assetPath: null
    };
  }

  const characterConfig = getCharacterConfig(resultType);
  const assetPath = characterConfig.states[state];
  const tintKey =
    assetPath ??
    characterConfig.transparent ??
    characterConfig.sourceUrl ??
    `${characterConfig.type}:${characterConfig.title}`;
  const tintSeed = hashString(tintKey);
  const hasSpecificStateAsset = Boolean(assetPath);
  const tintWeight = hasSpecificStateAsset ? 0.36 : 0.22;

  return {
    ...basePresentation,
    personaCode: characterConfig.type,
    personaAssetKey: characterConfig.assetKey,
    personaTitle: characterConfig.title,
    portraitPath: characterConfig.transparent,
    assetPath,
    auraColor: mixColor(basePresentation.auraColor, createColorFromSeed(tintSeed ^ 0x11aa33, 118, 224), tintWeight),
    accentColor: mixColor(
      basePresentation.accentColor,
      createColorFromSeed(tintSeed ^ 0x3355aa, 126, 235),
      tintWeight
    ),
    bodyColor: mixColor(basePresentation.bodyColor, createColorFromSeed(tintSeed ^ 0xaa5511, 82, 184), tintWeight),
    mantleColor: mixColor(
      basePresentation.mantleColor,
      createColorFromSeed(tintSeed ^ 0x552244, 34, 116),
      tintWeight
    ),
    auraAlpha: Math.min(basePresentation.auraAlpha + (hasSpecificStateAsset ? 0.02 : 0), 0.26)
  };
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

function hashString(value: string): number {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function createColorFromSeed(seed: number, min: number, max: number): number {
  const span = max - min;
  const createChannel = (shift: number) => min + (((seed >> shift) & 0xff) % (span + 1));

  const red = createChannel(0);
  const green = createChannel(8);
  const blue = createChannel(16);

  return (red << 16) | (green << 8) | blue;
}

function mixColor(baseColor: number, tintColor: number, weight: number): number {
  const clampedWeight = Math.min(Math.max(weight, 0), 1);
  const mixChannel = (baseChannel: number, tintChannel: number) =>
    Math.round(baseChannel + (tintChannel - baseChannel) * clampedWeight);

  const baseRed = (baseColor >> 16) & 0xff;
  const baseGreen = (baseColor >> 8) & 0xff;
  const baseBlue = baseColor & 0xff;

  const tintRed = (tintColor >> 16) & 0xff;
  const tintGreen = (tintColor >> 8) & 0xff;
  const tintBlue = tintColor & 0xff;

  return (
    (mixChannel(baseRed, tintRed) << 16) |
    (mixChannel(baseGreen, tintGreen) << 8) |
    mixChannel(baseBlue, tintBlue)
  );
}
