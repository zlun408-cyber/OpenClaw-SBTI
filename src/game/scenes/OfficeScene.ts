import Phaser from "phaser";

import { roomTriggers } from "../data/roomTriggers";
import { mapConfig } from "../data/mapConfig";
import { MovementSystem } from "../systems/MovementSystem";
import { RoomTriggerSystem } from "../systems/RoomTriggerSystem";
import type { RoomId } from "../../types/domain";

const ROOM_WIDTH = 158;
const ROOM_HEIGHT = 96;

const ROOM_VISUALS: Record<RoomId, { label: string; fill: number; accent: number; subtitle: string }> = {
  office: { label: "主办公室", fill: 0x27404a, accent: 0x8cc2b3, subtitle: "观察 / 协同 / 控制台" },
  meeting: { label: "会议室", fill: 0x43342a, accent: 0xf0ca87, subtitle: "发布 / 推进 / 提交" },
  hr: { label: "人事部", fill: 0x3e2d4f, accent: 0xd3b2f3, subtitle: "Soul / Memory" },
  training: { label: "培训室", fill: 0x214841, accent: 0x9fe3c4, subtitle: "Skill / Growth" },
  rest: { label: "休息间", fill: 0x4b3221, accent: 0xf1c996, subtitle: "喝茶 / 睡觉 / 跳舞" }
};

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
  private playerGlow?: Phaser.GameObjects.Arc;
  private destinationMarker?: Phaser.GameObjects.Arc;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private readonly playableArea = this.createPlayableArea();

  constructor() {
    super(OfficeScene.KEY);
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.cameras.main.setBackgroundColor(0x09111a);

    this.renderBackdrop(centerX, centerY);
    this.renderConnectionPaths(centerX, centerY);
    this.renderRooms(centerX, centerY);

    this.playerGlow = this.add.circle(
      centerX + mapConfig.rooms.office.x,
      centerY + mapConfig.rooms.office.y,
      26,
      0xf4d08f,
      0.14
    );

    this.player = this.add.circle(
      centerX + mapConfig.rooms.office.x,
      centerY + mapConfig.rooms.office.y,
      14,
      0x8fd9ff
    );
    this.player.setStrokeStyle(3, 0xeaf6ff, 0.85);

    this.destinationMarker = this.add.circle(centerX, centerY, 10, 0xf4d08f, 0.12);
    this.destinationMarker.setStrokeStyle(2, 0xf4d08f, 0.42).setVisible(false);

    this.add.text(22, 18, "WASD / Arrow Keys Move • Click to Move", {
      color: "#e7dbc1",
      fontFamily: "sans-serif",
      fontSize: "14px"
    });
    this.add.text(22, 40, "Walk into rooms to trigger the in-world workstations.", {
      color: "#a8b6c9",
      fontFamily: "sans-serif",
      fontSize: "12px"
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys("W,A,S,D") as
      | Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>
      | undefined;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const next = this.clampWorldPosition({ x: pointer.worldX, y: pointer.worldY });
      this.destinationMarker?.setPosition(next.x, next.y).setVisible(true);
      this.movement.startAutoMove(next);
    });

    this.emitRoomChangedIfNeeded();
  }

  update(_time: number, deltaMs: number) {
    if (!this.player) {
      return;
    }

    this.movement.applyKeyboardInput(this.readKeyboardInput());

    const previousPosition = { x: this.player.x, y: this.player.y };
    const nextPosition = this.clampWorldPosition(
      this.movement.update(previousPosition, deltaMs / 1000)
    );

    this.player.setPosition(nextPosition.x, nextPosition.y);
    this.playerGlow?.setPosition(nextPosition.x, nextPosition.y);

    if (Phaser.Math.Distance.Between(previousPosition.x, previousPosition.y, nextPosition.x, nextPosition.y) < 0.2) {
      this.destinationMarker?.setVisible(false);
    }

    this.emitRoomChangedIfNeeded();
  }

  private renderBackdrop(centerX: number, centerY: number) {
    this.add.rectangle(centerX, centerY, this.scale.width + 120, this.scale.height + 120, 0x0d1622);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0xffffff, 0.04);
    for (let x = -40; x <= this.scale.width + 40; x += 48) {
      grid.lineBetween(x, -20, x, this.scale.height + 20);
    }
    for (let y = -20; y <= this.scale.height + 20; y += 48) {
      grid.lineBetween(-40, y, this.scale.width + 40, y);
    }

    this.add.circle(centerX, centerY - 120, 220, 0x6b4da8, 0.06);
    this.add.circle(centerX + 180, centerY - 80, 180, 0x2c88c7, 0.06);
    this.add.circle(centerX - 220, centerY + 120, 200, 0xc98948, 0.05);
  }

  private renderConnectionPaths(centerX: number, centerY: number) {
    const graphics = this.add.graphics();
    graphics.lineStyle(10, 0x13202d, 0.8);
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX - 180, centerY - 40, centerX, centerY));
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX + 180, centerY - 40, centerX, centerY));
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX, centerY, centerX, centerY - 120));
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX + 120, centerY + 80, centerX + 260, centerY + 180));

    graphics.lineStyle(3, 0xf4d08f, 0.18);
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX - 180, centerY - 40, centerX, centerY));
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX + 180, centerY - 40, centerX, centerY));
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX, centerY, centerX, centerY - 120));
    graphics.strokeLineShape(new Phaser.Geom.Line(centerX + 120, centerY + 80, centerX + 260, centerY + 180));
  }

  private renderRooms(centerX: number, centerY: number) {
    (Object.entries(mapConfig.rooms) as Array<[RoomId, { x: number; y: number }]>).forEach(([roomId, room]) => {
      const visual = ROOM_VISUALS[roomId];
      const x = centerX + room.x;
      const y = centerY + room.y;

      this.add.rectangle(x, y + 12, ROOM_WIDTH + 12, ROOM_HEIGHT + 18, 0x000000, 0.18);

      const frame = this.add.graphics();
      frame.fillStyle(visual.fill, 0.78);
      frame.fillRoundedRect(x - ROOM_WIDTH / 2, y - ROOM_HEIGHT / 2, ROOM_WIDTH, ROOM_HEIGHT, 20);
      frame.lineStyle(2, visual.accent, 0.42);
      frame.strokeRoundedRect(x - ROOM_WIDTH / 2, y - ROOM_HEIGHT / 2, ROOM_WIDTH, ROOM_HEIGHT, 20);

      this.add.rectangle(x, y - ROOM_HEIGHT / 2 + 18, ROOM_WIDTH - 24, 16, visual.accent, 0.18);
      this.add.circle(x - ROOM_WIDTH / 2 + 18, y - ROOM_HEIGHT / 2 + 18, 6, visual.accent, 0.35);

      this.add
        .text(x, y - 10, visual.label, {
          color: "#f4efe7",
          fontFamily: "sans-serif",
          fontSize: "18px",
          fontStyle: "700"
        })
        .setOrigin(0.5);

      this.add
        .text(x, y + 16, visual.subtitle, {
          color: Phaser.Display.Color.IntegerToColor(visual.accent).rgba,
          fontFamily: "sans-serif",
          fontSize: "11px"
        })
        .setOrigin(0.5);
    });
  }

  private readKeyboardInput() {
    return {
      left: Boolean(this.cursors?.left.isDown) || Boolean(this.wasd?.A.isDown),
      right: Boolean(this.cursors?.right.isDown) || Boolean(this.wasd?.D.isDown),
      up: Boolean(this.cursors?.up.isDown) || Boolean(this.wasd?.W.isDown),
      down: Boolean(this.cursors?.down.isDown) || Boolean(this.wasd?.S.isDown)
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
