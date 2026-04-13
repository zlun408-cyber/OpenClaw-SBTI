import Phaser from "phaser";

import { roomTriggers } from "../data/roomTriggers";
import { mapConfig } from "../data/mapConfig";
import { MovementSystem } from "../systems/MovementSystem";
import { RoomTriggerSystem } from "../systems/RoomTriggerSystem";
import type { RoomId } from "../../types/domain";

const ROOM_WIDTH = 128;
const ROOM_HEIGHT = 80;

type RoomEnteredEvent = {
  type: "ROOM_CHANGED";
  roomId: RoomId | null;
};

type Point = {
  x: number;
  y: number;
};

export class OfficeScene extends Phaser.Scene {
  static readonly KEY = "OfficeScene";

  private readonly movement = new MovementSystem();
  private readonly roomTriggerSystem = new RoomTriggerSystem(roomTriggers);

  private player?: Phaser.GameObjects.Arc;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private readonly playableArea = this.createPlayableArea();

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
      this.movement.startAutoMove(
        this.clampWorldPosition({ x: pointer.worldX, y: pointer.worldY })
      );
    });

    this.emitRoomChangedIfNeeded();
  }

  update(_time: number, deltaMs: number) {
    if (!this.player) {
      return;
    }

    this.movement.applyKeyboardInput(this.readKeyboardInput());

    const nextPosition = this.clampWorldPosition(
      this.movement.update(
        { x: this.player.x, y: this.player.y },
        deltaMs / 1000
      )
    );

    this.player.setPosition(nextPosition.x, nextPosition.y);

    this.emitRoomChangedIfNeeded();
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

  private emitRoomChangedIfNeeded() {
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

    this.game.events.emit("ROOM_CHANGED", {
      type: "ROOM_CHANGED",
      roomId: event.roomId
    } satisfies RoomEnteredEvent);
  }

  private createPlayableArea() {
    const roomPositions = Object.values(mapConfig.rooms);
    const minX = Math.min(...roomPositions.map((room) => room.x)) - ROOM_WIDTH / 2 - 48;
    const maxX = Math.max(...roomPositions.map((room) => room.x)) + ROOM_WIDTH / 2 + 48;
    const minY = Math.min(...roomPositions.map((room) => room.y)) - ROOM_HEIGHT / 2 - 48;
    const maxY = Math.max(...roomPositions.map((room) => room.y)) + ROOM_HEIGHT / 2 + 48;

    return { minX, maxX, minY, maxY };
  }

  private clampWorldPosition(position: Point): Point {
    const localX = position.x - this.scale.width / 2;
    const localY = position.y - this.scale.height / 2;

    return {
      x:
        this.scale.width / 2 +
        Phaser.Math.Clamp(localX, this.playableArea.minX, this.playableArea.maxX),
      y:
        this.scale.height / 2 +
        Phaser.Math.Clamp(localY, this.playableArea.minY, this.playableArea.maxY)
    };
  }
}
