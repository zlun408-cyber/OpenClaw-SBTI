import { expect, test } from "vitest";

import { roomTriggers } from "../data/roomTriggers";
import { RoomTriggerSystem } from "./RoomTriggerSystem";

test("emits room changes for entry, exit, and re-entry", () => {
  const triggers = new RoomTriggerSystem(roomTriggers);

  expect(triggers.update({ x: 0, y: 0 })).toEqual({ roomId: "office" });
  expect(triggers.update({ x: 0, y: 0 })).toBeNull();

  expect(triggers.update({ x: 999, y: 999 })).toEqual({ roomId: null });
  expect(triggers.update({ x: 0, y: -120 })).toEqual({ roomId: "meeting" });
});
