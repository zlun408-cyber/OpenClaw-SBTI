import Phaser from "phaser";

import { roomTriggers } from "../data/roomTriggers";
import { mapConfig } from "../data/mapConfig";
import { MovementSystem } from "../systems/MovementSystem";
import { RoomTriggerSystem } from "../systems/RoomTriggerSystem";
import { useAppStore } from "../../state/appStore";
import type { RoomId } from "../../types/domain";

const ROOM_WIDTH = 128;
const ROOM_HEIGHT = 80;

type RoomEnteredEvent = {
  type: "ROOM_ENTERED";
  roomId: RoomId;
};

export class OfficeScene extends Phaser.Scene {
  static readonly KEY = "OfficeScene";

  private readonly movement = new MovementSystem();
  private readonly roomTriggerSystem = new RoomTriggerSystem(roomTriggers);
  private readonly eventBus = new Phaser.Events.EventEmitter();

  private player?: Phaser.GameObjects.Arc;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;

  constructor() {
    super(OfficeScene.KEY);
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.cameras.main.setBackgroundColor(0x111827);

    Object.entries(mapConfig.rooms).forEach(([roomId, room]) => {
      const x = centerX + room.x;
      const y = centerY + room.y;

      this.add
        .rectangle(x, y, ROOM_WIDTH, ROOM_HEIGHT, 0x2e394a)
        .setStrokeStyle(2, 0x475569, 1);

      this.add
        .text(x, y, roomId.toUpperCase(), {
          color: "#e2e8f0",
          fontFamily: "sans-serif",
          fontSize: "14px"
        })
        .setOrigin(0.5);
    });

    this.player = this.add.circle(
      centerX + mapConfig.rooms.office.x,
      centerY + mapConfig.rooms.office.y,
      14,
      0x93c5fd
    );

    this.add.text(16, 16, "WASD / Arrow Keys Move • Click to Move", {
      color: "#cbd5e1",
      fontFamily: "sans-serif",
      fontSize: "14px"
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D") as
      | Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>
      | undefined;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.movement.startAutoMove({ x: pointer.worldX, y: pointer.worldY });
    });

    this.eventBus.on("ROOM_ENTERED", (event: RoomEnteredEvent) => {
      useAppStore.setState((state) =>
        state.currentRoomId === event.roomId
          ? state
          : {
              ...state,
              currentRoomId: event.roomId
            }
      );
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.eventBus.removeAllListeners();
    });

    this.emitRoomEnteredIfNeeded();
  }

  update(_time: number, deltaMs: number) {
    if (!this.player) {
      return;
    }

    this.movement.applyKeyboardInput(this.readKeyboardInput());

    const nextPosition = this.movement.update(
      { x: this.player.x, y: this.player.y },
      deltaMs / 1000
    );

    this.player.setPosition(nextPosition.x, nextPosition.y);

    this.emitRoomEnteredIfNeeded();
  }

  private readKeyboardInput() {
    return {
      left:
        Boolean(this.cursors?.left.isDown) ||
        Boolean(this.wasd?.A.isDown),
      right:
        Boolean(this.cursors?.right.isDown) ||
        Boolean(this.wasd?.D.isDown),
      up:
        Boolean(this.cursors?.up.isDown) ||
        Boolean(this.wasd?.W.isDown),
      down:
        Boolean(this.cursors?.down.isDown) ||
        Boolean(this.wasd?.S.isDown)
    };
  }

  private emitRoomEnteredIfNeeded() {
    if (!this.player) {
      return;
    }

    const localPosition = {
      x: this.player.x - this.scale.width / 2,
      y: this.player.y - this.scale.height / 2
    };

    const event = this.roomTriggerSystem.update(localPosition);
    if (!event) {
      return;
    }

    this.eventBus.emit("ROOM_ENTERED", {
      type: "ROOM_ENTERED",
      roomId: event.enteredRoomId
    } satisfies RoomEnteredEvent);
  }
}
