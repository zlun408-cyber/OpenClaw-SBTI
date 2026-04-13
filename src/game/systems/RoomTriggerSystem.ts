import type { RoomId } from "../../types/domain";
import type { RoomTrigger } from "../data/roomTriggers";
import type { Point } from "./PathfindingSystem";

export type RoomTriggerEvent = {
  enteredRoomId: RoomId;
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

    if (!activeTrigger) {
      return null;
    }

    if (activeTrigger.id === this.currentRoomId) {
      return null;
    }

    this.currentRoomId = activeTrigger.id;
    return { enteredRoomId: activeTrigger.id };
  }

  getCurrentRoomId() {
    return this.currentRoomId;
  }
}
