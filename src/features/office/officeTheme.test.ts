import { describe, expect, test } from "vitest";

import {
  getOfficeRoomAccent,
  getOfficeRoomTheme,
  OFFICE_THEME,
  OFFICE_ROOM_ACCENTS
} from "./officeTheme";
import type { RoomId } from "../../types/domain";

const roomIds: RoomId[] = ["office", "meeting", "hr", "training", "rest"];

describe("office theme", () => {
  test("exposes a stable digital command center theme identity", () => {
    expect(OFFICE_THEME.id).toBe("digital-command-center");
    expect(OFFICE_THEME.surface.panel).toContain("linear-gradient");
    expect(OFFICE_THEME.effects.scanline).toContain("linear-gradient");
    expect(OFFICE_THEME.border.glass).toContain("rgba");
  });

  test("defines room accents for every office room", () => {
    expect(Object.keys(OFFICE_ROOM_ACCENTS).sort()).toEqual([...roomIds].sort());

    roomIds.forEach((roomId) => {
      expect(getOfficeRoomAccent(roomId).hex).toMatch(/^#/);
      expect(getOfficeRoomAccent(roomId).rgba).toContain("rgba");
    });
  });

  test("falls back to office theme when there is no active room", () => {
    expect(getOfficeRoomTheme(null).roomId).toBe("office");
    expect(getOfficeRoomTheme("training").roomId).toBe("training");
  });
});
