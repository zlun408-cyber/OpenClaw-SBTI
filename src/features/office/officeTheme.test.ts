import { describe, expect, test } from "vitest";

import {
  createGlassTerminalStyle,
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

  test("defines room accents for every office room and falls back to office", () => {
    expect(Object.keys(OFFICE_ROOM_ACCENTS).sort()).toEqual([...roomIds].sort());

    roomIds.forEach((roomId) => {
      expect(getOfficeRoomAccent(roomId).hex).toMatch(/^#/);
      expect(getOfficeRoomAccent(roomId).rgba).toContain("rgba");
    });

    expect(getOfficeRoomAccent(null)).toEqual(OFFICE_ROOM_ACCENTS.office);
  });

  test("resolves room themes with a shared theme id and accent payload", () => {
    expect(getOfficeRoomTheme(null)).toEqual({
      themeId: OFFICE_THEME.id,
      roomId: "office",
      accent: OFFICE_ROOM_ACCENTS.office
    });

    expect(getOfficeRoomTheme("training")).toEqual({
      themeId: OFFICE_THEME.id,
      roomId: "training",
      accent: OFFICE_ROOM_ACCENTS.training
    });
  });

  test("creates shared glass terminal styles and applies overrides", () => {
    expect(createGlassTerminalStyle("meeting")).toEqual({
      border: OFFICE_THEME.border.glass,
      background: OFFICE_THEME.surface.panel,
      color: OFFICE_THEME.text.primary,
      boxShadow: `${OFFICE_THEME.shadow.panel}, 0 0 48px ${OFFICE_ROOM_ACCENTS.meeting.softRgba}`,
      backdropFilter: "blur(16px)"
    });

    expect(
      createGlassTerminalStyle("meeting", {
        border: OFFICE_THEME.border.active,
        padding: "12px"
      })
    ).toEqual({
      border: OFFICE_THEME.border.active,
      background: OFFICE_THEME.surface.panel,
      color: OFFICE_THEME.text.primary,
      boxShadow: `${OFFICE_THEME.shadow.panel}, 0 0 48px ${OFFICE_ROOM_ACCENTS.meeting.softRgba}`,
      backdropFilter: "blur(16px)",
      padding: "12px"
    });
  });
});
