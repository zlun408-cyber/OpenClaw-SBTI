import { describe, expect, test } from "vitest";

import {
  resolveAvatarFacing,
  resolveAvatarNameplate,
  resolveAvatarPresentation
} from "./officeAvatarPresentation";

describe("resolveAvatarPresentation", () => {
  test("prefers explicit character state styling over room idle styling", () => {
    const presentation = resolveAvatarPresentation({
      roomId: "meeting",
      state: "train"
    });

    expect(presentation.statusLabel).toBe("Training");
    expect(presentation.emoteLabel).toBe("+Skill");
    expect(presentation.auraColor).toBe(0x9fe3c4);
  });

  test("uses room flavor when the employee is idle", () => {
    const presentation = resolveAvatarPresentation({
      roomId: "rest",
      state: "idle"
    });

    expect(presentation.statusLabel).toBe("At Ease");
    expect(presentation.emoteLabel).toBe("Rest");
    expect(presentation.accentColor).toBe(0xf1c996);
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
    expect(resolveAvatarNameplate("Alex", "Architect")).toBe("Alex · Architect");
    expect(resolveAvatarNameplate("", "Architect")).toBe("Architect");
  });
});
