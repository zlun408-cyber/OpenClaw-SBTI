import { describe, expect, test } from "vitest";

import { getCharacterConfig } from "./characterRegistry";

const SUPPORTED_TYPES = ["CTRL", "GOGO", "MUM"] as const;
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
  test("returns a config for every supported SBTI result", () => {
    for (const type of SUPPORTED_TYPES) {
      expect(getCharacterConfig(type)).toBeDefined();
    }
  });

  test("exposes a stable state contract for animation states only", () => {
    const config = getCharacterConfig("CTRL");
    expect(Object.keys(config.states).sort()).toEqual([...EXPECTED_STATE_KEYS].sort());
    expect(config.states).not.toHaveProperty("transparent");
  });

  test("represents unavailable assets explicitly with null", () => {
    const config = getCharacterConfig("CTRL");

    for (const state of EXPECTED_STATE_KEYS) {
      expect(state in config.states).toBe(true);
      expect(["string", "object"]).toContain(typeof config.states[state]);
    }

    expect(Object.values(config.states).some((value) => value === null)).toBe(true);
  });
});
