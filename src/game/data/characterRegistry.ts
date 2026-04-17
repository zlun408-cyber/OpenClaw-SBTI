import manifest from "../../assets/characters/manifest.json";
import { PERSONALITY_TYPES } from "../../features/quiz/personalityCatalog";
import type { CharacterState, QuizResultType } from "../../types/domain";

const SUPPORTED_TYPES: readonly QuizResultType[] = PERSONALITY_TYPES;
const REQUIRED_STATES: readonly CharacterState[] = [
  "idle",
  "walk",
  "work",
  "rest",
  "sleep",
  "dance",
  "train",
  "task-submit"
];

type CharacterAssetPath = string | null;

type CharacterStateAssets = Record<CharacterState, CharacterAssetPath>;

export type CharacterConfig = {
  type: QuizResultType;
  title: string;
  sourceUrl: string | null;
  quality: string | null;
  transparent: CharacterAssetPath;
  states: CharacterStateAssets;
};

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateManifest(rawManifest: unknown): CharacterConfig[] {
  if (!Array.isArray(rawManifest)) {
    throw new Error("Character manifest must be an array.");
  }

  const entries = rawManifest as unknown[];
  const seenTypes = new Set<QuizResultType>();

  for (const entry of entries) {
    if (!isRecord(entry)) {
      throw new Error("Character manifest entry must be an object.");
    }

    const { type, title, sourceUrl, quality, transparent, states } = entry;

    if (!SUPPORTED_TYPES.includes(type as QuizResultType)) {
      throw new Error(`Character manifest has unsupported type '${String(type)}'.`);
    }

    if (seenTypes.has(type as QuizResultType)) {
      throw new Error(`Character manifest has duplicate type '${String(type)}'.`);
    }

    seenTypes.add(type as QuizResultType);

    if (typeof title !== "string" || title.trim() === "") {
      throw new Error(`Character manifest title is invalid for type '${String(type)}'.`);
    }

    if (!isNullableString(sourceUrl)) {
      throw new Error(`Character manifest sourceUrl is invalid for type '${String(type)}'.`);
    }

    if (!isNullableString(quality)) {
      throw new Error(`Character manifest quality is invalid for type '${String(type)}'.`);
    }

    if (!isNullableString(transparent)) {
      throw new Error(`Character manifest transparent asset is invalid for type '${String(type)}'.`);
    }

    if (!isRecord(states)) {
      throw new Error(`Character manifest states are missing for type '${String(type)}'.`);
    }

    const stateKeys = Object.keys(states);
    const missingStates = REQUIRED_STATES.filter((state) => !(state in states));
    if (missingStates.length > 0) {
      throw new Error(
        `Character manifest missing state(s) for type '${String(type)}': ${missingStates.join(", ")}.`
      );
    }

    const unsupportedStates = stateKeys.filter(
      (state) => !REQUIRED_STATES.includes(state as CharacterState)
    );
    if (unsupportedStates.length > 0) {
      throw new Error(
        `Character manifest has unsupported state(s) for type '${String(type)}': ${unsupportedStates.join(", ")}.`
      );
    }

    for (const state of REQUIRED_STATES) {
      if (!isNullableString(states[state])) {
        throw new Error(
          `Character manifest state '${state}' must be string|null for type '${String(type)}'.`
        );
      }
    }
  }

  const missingTypes = SUPPORTED_TYPES.filter((type) => !seenTypes.has(type));
  if (missingTypes.length > 0) {
    throw new Error(`Character manifest missing required type(s): ${missingTypes.join(", ")}.`);
  }

  if (entries.length !== SUPPORTED_TYPES.length) {
    throw new Error("Character manifest contains extra entries beyond supported SBTI types.");
  }

  return rawManifest as CharacterConfig[];
}

const characterManifest = validateManifest(manifest);
const characterMap = new Map<QuizResultType, CharacterConfig>(
  characterManifest.map((item) => [item.type, item])
);

export function getCharacterConfig(type: QuizResultType): CharacterConfig {
  const config = characterMap.get(type);
  if (!config) {
    throw new Error(`Character config missing for type '${type}'.`);
  }

  return config;
}
