import type { RoomId } from "../../types/domain";
import type { RoomTrigger } from "../data/roomTriggers";
import type { Point } from "./PathfindingSystem";

export type RoomTriggerEvent = {
  roomId: RoomId | null;
};

export class RoomTriggerSystem {
  private currentRoomId: RoomId | null = null;

  constructor(private readonly triggers: readonly RoomTrigger[]) {}

  update(position: Point): RoomTriggerEvent | null {
    const activeTrigger = this.triggers.find((trigger) => {
      const dx = position.x - trigger.center.x;
      const dy = position.y - trigger.center.y;
      return Math.hypot(dx, dy) <= trigger.radius;
    });

    const nextRoomId = activeTrigger?.id ?? null;
    if (nextRoomId === this.currentRoomId) {
      return null;
    }

    this.currentRoomId = nextRoomId;
    return { roomId: nextRoomId };
  }

  getCurrentRoomId() {
    return this.currentRoomId;
  }
}
