import { expect, test } from "vitest";

import { resolveOfficeDoorMotionFrame } from "./officeDoorMotion";
import { resolveOfficeDoorRuntime } from "./officeDoorRuntime";

test("opens the active door wider and relabels it when the player is nearby", () => {
  const runtime = resolveOfficeDoorRuntime({
    roomId: "training",
    activeRoomId: "training",
    characterState: "train"
  });

  const farFrame = resolveOfficeDoorMotionFrame({
    runtime,
    timeMs: 440,
    proximity: 0
  });
  const nearFrame = resolveOfficeDoorMotionFrame({
    runtime,
    timeMs: 440,
    proximity: 1
  });

  expect(farFrame.label).toBe("ACTIVE");
  expect(nearFrame.label).toBe("ENTER");
  expect(nearFrame.archScaleY).toBeGreaterThan(farFrame.archScaleY);
  expect(nearFrame.coreScale).toBeGreaterThan(farFrame.coreScale);
  expect(nearFrame.thresholdScaleX).toBeGreaterThan(farFrame.thresholdScaleX);
  expect(nearFrame.runeOffsets).toHaveLength(4);
  expect(Math.max(...nearFrame.runeOffsets)).toBeGreaterThan(Math.max(...farFrame.runeOffsets));
});

test("keeps inactive doors visibly dormant even when the player is nearby", () => {
  const runtime = resolveOfficeDoorRuntime({
    roomId: "meeting",
    activeRoomId: "training",
    characterState: "train"
  });

  const frame = resolveOfficeDoorMotionFrame({
    runtime,
    timeMs: 440,
    proximity: 1
  });

  expect(frame.label).toBe("STANDBY");
  expect(frame.auraAlpha).toBeLessThan(0.1);
  expect(frame.coreScale).toBeLessThan(1);
  expect(frame.thresholdAlpha).toBeLessThan(0.2);
});
