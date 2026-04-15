import { describe, expect, test } from "vitest";

import {
  getOfficeRoomVisual,
  OFFICE_ENVIRONMENT_LAYERS,
  OFFICE_ROOM_VISUALS,
  OFFICE_VISUAL_DEPTHS
} from "./officeEnvironmentVisuals";
import type { RoomId } from "../../types/domain";

const roomIds: RoomId[] = ["office", "meeting", "hr", "training", "rest"];

describe("office environment visuals", () => {
  test("defines a complete high-end digital visual for every room", () => {
    roomIds.forEach((roomId) => {
      const visual = getOfficeRoomVisual(roomId);

      expect(visual.label).toBeTruthy();
      expect(visual.subtitle).toBeTruthy();
      expect(visual.fill).toBeGreaterThan(0);
      expect(visual.accent).toBeGreaterThan(0);
      expect(visual.equipment.length).toBeGreaterThanOrEqual(3);
      expect(visual.signalNodes.length).toBeGreaterThanOrEqual(2);
    });

    expect(Object.keys(OFFICE_ROOM_VISUALS).sort()).toEqual([...roomIds].sort());
  });

  test("defines parseable layered environment effects", () => {
    expect(OFFICE_ENVIRONMENT_LAYERS.ambientGlows.length).toBeGreaterThanOrEqual(3);
    expect(OFFICE_ENVIRONMENT_LAYERS.grid.spacing).toBeGreaterThan(0);
    expect(OFFICE_ENVIRONMENT_LAYERS.signalPaths.length).toBeGreaterThanOrEqual(4);
    expect(OFFICE_ENVIRONMENT_LAYERS.particles.length).toBeGreaterThanOrEqual(8);
    expect(OFFICE_ENVIRONMENT_LAYERS.foregroundOverlays.length).toBeGreaterThanOrEqual(3);
  });

  test("keeps environment depths behind the avatar and labels", () => {
    expect(OFFICE_VISUAL_DEPTHS.backdrop).toBeLessThan(OFFICE_VISUAL_DEPTHS.rooms);
    expect(OFFICE_VISUAL_DEPTHS.rooms).toBeLessThan(OFFICE_VISUAL_DEPTHS.avatarShadow);
    expect(OFFICE_VISUAL_DEPTHS.foreground).toBeGreaterThan(OFFICE_VISUAL_DEPTHS.avatarLabels);
  });
});
