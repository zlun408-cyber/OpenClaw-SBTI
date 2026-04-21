import { expect, test } from "vitest";

import { resolveOfficeDoorRuntime } from "./officeDoorRuntime";

test("keeps inactive room doors dormant while energizing the active room door", () => {
  expect(
    resolveOfficeDoorRuntime({
      roomId: "training",
      activeRoomId: "training",
      characterState: "train"
    })
  ).toMatchObject({
    roomId: "training",
    activity: "train",
    core: "syncing",
    runes: "accelerating",
    threshold: "pulsing",
    isActive: true
  });

  expect(
    resolveOfficeDoorRuntime({
      roomId: "meeting",
      activeRoomId: "training",
      characterState: "train"
    })
  ).toMatchObject({
    roomId: "meeting",
    activity: "idle",
    core: "standby",
    runes: "offline",
    threshold: "sealed",
    isActive: false
  });
});
