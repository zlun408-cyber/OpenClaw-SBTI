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
