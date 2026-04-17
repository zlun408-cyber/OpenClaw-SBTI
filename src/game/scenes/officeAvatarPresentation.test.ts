import { describe, expect, test } from "vitest";

import { PERSONALITY_TYPES } from "../../features/quiz/personalityCatalog";
import type { CharacterState } from "../../types/domain";
import { getCharacterConfig } from "../data/characterRegistry";
import {
  resolveAvatarFacing,
  resolveAvatarNameplate,
  resolveAvatarPresentation
} from "./officeAvatarPresentation";

const EXPECTED_STATE_KEYS: readonly CharacterState[] = [
  "idle",
  "walk",
  "work",
  "rest",
  "sleep",
  "dance",
  "train",
  "task-submit"
];

describe("resolveAvatarPresentation", () => {
  test("prefers explicit character state styling over room idle styling", () => {
    const presentation = resolveAvatarPresentation({
      roomId: "meeting",
      state: "train",
      resultType: null
    });

    expect(presentation.statusLabel).toBe("Training");
    expect(presentation.emoteLabel).toBe("+Skill");
    expect(presentation.auraColor).toBe(0x9fe3c4);
  });

  test("uses room flavor when the employee is idle", () => {
    const presentation = resolveAvatarPresentation({
      roomId: "rest",
      state: "idle",
      resultType: null
    });

    expect(presentation.statusLabel).toBe("At Ease");
    expect(presentation.emoteLabel).toBe("Rest");
    expect(presentation.accentColor).toBe(0xf1c996);
  });

  test("tints the same room-state palette differently for each sbti type", () => {
    const ctrlPresentation = resolveAvatarPresentation({
      roomId: "office",
      state: "idle",
      resultType: "CTRL"
    });
    const execPresentation = resolveAvatarPresentation({
      roomId: "office",
      state: "idle",
      resultType: "GOGO"
    });

    expect(ctrlPresentation.bodyColor).not.toBe(execPresentation.bodyColor);
    expect(ctrlPresentation.mantleColor).not.toBe(execPresentation.mantleColor);
    expect(ctrlPresentation.accentColor).not.toBe(execPresentation.accentColor);
  });

  test("maps all 27 personas to shared office-state asset paths", () => {
    for (const type of PERSONALITY_TYPES) {
      const config = getCharacterConfig(type);

      for (const state of EXPECTED_STATE_KEYS) {
        const presentation = resolveAvatarPresentation({
          roomId: "office",
          state,
          resultType: type
        });

        expect(presentation.personaCode).toBe(type);
        expect(presentation.personaTitle).toBe(config.title);
        expect(presentation.portraitPath).toBe(config.transparent);
        expect(presentation.assetPath).toBe(config.states[state]);
      }
    }
  });
});

describe("resolveAvatarFacing", () => {
  test("maps strong horizontal movement to a facing direction", () => {
    expect(resolveAvatarFacing({ x: -1.4, y: 0.2 })).toBe("left");
    expect(resolveAvatarFacing({ x: 1.2, y: -0.1 })).toBe("right");
    expect(resolveAvatarFacing({ x: 0.05, y: 0.4 })).toBe("center");
  });
});

describe("resolveAvatarNameplate", () => {
  test("combines custom name with title", () => {
    expect(resolveAvatarNameplate("Alex", "拿捏者")).toBe("Alex · 拿捏者");
    expect(resolveAvatarNameplate("", "拿捏者")).toBe("拿捏者");
  });
});
