import type { RoomId } from "../../types/domain";
import type { Point } from "../systems/PathfindingSystem";

export type RoomTrigger = {
  id: RoomId;
  center: Point;
  radius: number;
};

export const roomTriggers: readonly RoomTrigger[] = [
  { id: "office", center: { x: 0, y: 0 }, radius: 60 },
  { id: "meeting", center: { x: 0, y: -120 }, radius: 56 },
  { id: "hr", center: { x: -180, y: -40 }, radius: 56 },
  { id: "training", center: { x: 180, y: -40 }, radius: 56 },
  { id: "rest", center: { x: 260, y: 180 }, radius: 56 }
] as const;
