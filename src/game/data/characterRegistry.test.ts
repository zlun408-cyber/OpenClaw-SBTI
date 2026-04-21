import { describe, expect, test } from "vitest";

import { personalityCatalog } from "../../features/quiz/personalityCatalog";
import { PERSONALITY_TYPES } from "../../features/quiz/personalityCatalog";
import { getCharacterConfig } from "./characterRegistry";

const EXPECTED_STATE_KEYS = [
  "idle",
  "walk",
  "work",
  "rest",
  "sleep",
  "dance",
  "train",
  "task-submit"
] as const;

describe("getCharacterConfig", () => {
  test("returns a config for all 27 sbti personas", () => {
    expect(PERSONALITY_TYPES).toHaveLength(27);

    for (const type of PERSONALITY_TYPES) {
      expect(getCharacterConfig(type)).toBeDefined();
    }
  });

  test("exposes a stable state contract for animation states only", () => {
    const config = getCharacterConfig("CTRL");
    expect(Object.keys(config.states).sort()).toEqual([...EXPECTED_STATE_KEYS].sort());
    expect(config.states).not.toHaveProperty("transparent");
  });

  test("maps every animation state to a concrete asset path", () => {
    const config = getCharacterConfig("CTRL");

    for (const state of EXPECTED_STATE_KEYS) {
      expect(state in config.states).toBe(true);
      expect(typeof config.states[state]).toBe("string");
    }
  });

  test("exposes representative late-catalog personas through the registry", () => {
    expect(getCharacterConfig("DRUNK").title).toBe("酒鬼");
    expect(getCharacterConfig("ZZZZ").title).toBe("装死者");
    expect(getCharacterConfig("ATM-er").title).toBe("送钱者");
  });

  test("exposes a stable assetKey aligned with the 27-persona catalog", () => {
    for (const persona of personalityCatalog) {
      const config = getCharacterConfig(persona.code);

      expect(config.assetKey).toBe(persona.assetKey);
      expect(config.transparent).toBe(`/assets/characters/${persona.assetKey}/transparent.png`);

      for (const state of EXPECTED_STATE_KEYS) {
        expect(config.states[state]).toBe(`/assets/characters/${persona.assetKey}/${state}.png`);
      }
    }
  });
});
