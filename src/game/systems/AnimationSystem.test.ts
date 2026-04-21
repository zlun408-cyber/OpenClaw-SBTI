import { describe, expect, test } from "vitest";

import { AnimationSystem } from "./AnimationSystem";

describe("AnimationSystem", () => {
  test("keeps sleep motion calmer than dance motion", () => {
    const animationSystem = new AnimationSystem();

    const sleepFrame = animationSystem.resolveMotion("sleep", 480);
    const danceFrame = animationSystem.resolveMotion("dance", 480);

    expect(Math.abs(sleepFrame.bobOffset)).toBeLessThan(Math.abs(danceFrame.bobOffset));
    expect(danceFrame.bodyScale).toBeGreaterThan(1);
    expect(danceFrame.auraScale).toBeGreaterThan(sleepFrame.auraScale);
  });
});
