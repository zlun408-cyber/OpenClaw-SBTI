import Phaser from "phaser";

import { roomTriggers } from "../data/roomTriggers";
import { mapConfig } from "../data/mapConfig";
import { MovementSystem } from "../systems/MovementSystem";
import { RoomTriggerSystem } from "../systems/RoomTriggerSystem";
import { useAppStore } from "../../state/appStore";
import type { RoomId } from "../../types/domain";
import {
  resolveAvatarFacing,
  resolveAvatarNameplate,
  resolveAvatarPresentation,
  type AvatarFacing
} from "./officeAvatarPresentation";

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
  private playerAura?: Phaser.GameObjects.Arc;
  private playerGlow?: Phaser.GameObjects.Arc;
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private playerContainer?: Phaser.GameObjects.Container;
  private playerMantle?: Phaser.GameObjects.Ellipse;
  private playerCore?: Phaser.GameObjects.Ellipse;
  private playerHead?: Phaser.GameObjects.Arc;
  private playerVisor?: Phaser.GameObjects.Rectangle;
  private playerSigil?: Phaser.GameObjects.Arc;
  private playerStatusBadge?: Phaser.GameObjects.Text;
  private playerEmoteText?: Phaser.GameObjects.Text;
  private playerNameplate?: Phaser.GameObjects.Text;
  private destinationMarker?: Phaser.GameObjects.Arc;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private readonly playableArea = this.createPlayableArea();
  private activeRoomId: RoomId | null = "office";
  private avatarFacing: AvatarFacing = "center";

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

    const startX = centerX + mapConfig.rooms.office.x;
    const startY = centerY + mapConfig.rooms.office.y;

    this.playerShadow = this.add.ellipse(startX, startY + 22, 36, 16, 0x000000, 0.26);
    this.playerShadow.setDepth(10);

    this.playerGlow = this.add.circle(
      startX,
      startY,
      26,
      0xf4d08f,
      0.14
    );
    this.playerGlow.setDepth(11);

    this.playerAura = this.add.circle(startX, startY, 20, 0x8fd9ff, 0.14);
    this.playerAura.setStrokeStyle(2, 0xd7f4ff, 0.38).setDepth(12);

    this.player = this.add.circle(
      startX,
      startY,
      10,
      0x8fd9ff,
      0
    );
    this.player.setDepth(13);

    this.playerMantle = this.add.ellipse(0, 12, 30, 38, 0x223345, 1);
    this.playerCore = this.add.ellipse(0, 10, 18, 24, 0x567f8f, 1);
    this.playerHead = this.add.circle(0, -8, 10, 0xf2ddbf, 1);
    this.playerVisor = this.add.rectangle(0, -8, 12, 4, 0xdaf6ff, 0.92);
    this.playerSigil = this.add.circle(0, 8, 4, 0xf4d08f, 0.95);

    this.playerContainer = this.add.container(startX, startY, [
      this.playerMantle,
      this.playerCore,
      this.playerHead,
      this.playerVisor,
      this.playerSigil
    ]);
    this.playerContainer.setDepth(14);

    this.playerStatusBadge = this.add
      .text(startX, startY - 56, "On Watch", {
        color: "#f7ebcf",
        fontFamily: "sans-serif",
        fontSize: "11px",
        backgroundColor: "rgba(10,16,28,0.78)",
        padding: { x: 10, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(15);

    this.playerEmoteText = this.add
      .text(startX, startY - 34, "Sync", {
        color: "#d7f4ff",
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(15);

    this.playerNameplate = this.add
      .text(startX, startY + 42, "Digital Employee", {
        color: "#e7dbc1",
        fontFamily: "sans-serif",
        fontSize: "12px"
      })
      .setOrigin(0.5)
      .setDepth(15);

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

    this.syncAvatarPresentation(0, { x: 0, y: 0 });
    this.emitRoomChangedIfNeeded();
  }

  update(time: number, deltaMs: number) {
    if (!this.player) {
      return;
    }

    this.movement.applyKeyboardInput(this.readKeyboardInput());

    const previousPosition = { x: this.player.x, y: this.player.y };
    const nextPosition = this.clampWorldPosition(
      this.movement.update(previousPosition, deltaMs / 1000)
    );

    this.player.setPosition(nextPosition.x, nextPosition.y);
    const movementDelta = {
      x: nextPosition.x - previousPosition.x,
      y: nextPosition.y - previousPosition.y
    };
    const movedDistance = Phaser.Math.Distance.Between(
      previousPosition.x,
      previousPosition.y,
      nextPosition.x,
      nextPosition.y
    );

    if (movedDistance >= 0.2) {
      this.avatarFacing = resolveAvatarFacing(movementDelta);
    }

    this.syncAvatarPresentation(time, movementDelta);

    if (movedDistance < 0.2) {
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

  private syncAvatarPresentation(time: number, movementDelta: Point) {
    if (
      !this.player ||
      !this.playerGlow ||
      !this.playerAura ||
      !this.playerShadow ||
      !this.playerContainer ||
      !this.playerMantle ||
      !this.playerCore ||
      !this.playerVisor ||
      !this.playerSigil ||
      !this.playerStatusBadge ||
      !this.playerEmoteText ||
      !this.playerNameplate
    ) {
      return;
    }

    const appState = useAppStore.getState();
    const isMoving = Math.abs(movementDelta.x) > 0.2 || Math.abs(movementDelta.y) > 0.2;
    const effectiveState = isMoving ? "walk" : appState.character.state;
    const presentation = resolveAvatarPresentation({
      roomId: this.activeRoomId,
      state: effectiveState
    });
    const bobOffset = Math.sin(time / 240) * (effectiveState === "sleep" ? 1.4 : 2.8);
    const pulse = 1 + Math.sin(time / 300) * 0.04;
    const dancePulse = effectiveState === "dance" ? Math.sin(time / 120) * 0.1 : 0;
    const auraScale = pulse + dancePulse;
    const bodyScale = 1 + dancePulse * 0.5;
    const visorOffsetX = this.avatarFacing === "left" ? -4 : this.avatarFacing === "right" ? 4 : 0;
    const bodyRotation = this.avatarFacing === "left" ? -0.08 : this.avatarFacing === "right" ? 0.08 : 0;
    const anchorX = this.player.x;
    const anchorY = this.player.y;

    this.playerShadow
      .setPosition(anchorX, anchorY + 24)
      .setScale(1 + dancePulse * 0.35, 1 - Math.abs(dancePulse) * 0.15);

    this.playerGlow
      .setPosition(anchorX, anchorY + bobOffset * 0.2)
      .setFillStyle(presentation.auraColor, presentation.auraAlpha)
      .setScale(auraScale * 1.1);

    this.playerAura
      .setPosition(anchorX, anchorY + bobOffset * 0.15)
      .setFillStyle(presentation.accentColor, 0.12)
      .setStrokeStyle(2, presentation.accentColor, 0.42)
      .setScale(auraScale);

    this.playerContainer
      .setPosition(anchorX, anchorY + bobOffset)
      .setScale(bodyScale)
      .setRotation(bodyRotation);

    this.playerMantle.setFillStyle(presentation.mantleColor, 1);
    this.playerCore.setFillStyle(presentation.bodyColor, 1);
    this.playerVisor.setFillStyle(presentation.accentColor, 0.92).setPosition(visorOffsetX, -8);
    this.playerSigil.setFillStyle(presentation.accentColor, 0.95);

    this.playerStatusBadge
      .setPosition(anchorX, anchorY - 58 + bobOffset * 0.2)
      .setText(presentation.statusLabel)
      .setColor("#f7ebcf");

    this.playerEmoteText
      .setPosition(anchorX, anchorY - 36 + bobOffset * 0.15)
      .setText(presentation.emoteLabel)
      .setColor(Phaser.Display.Color.IntegerToColor(presentation.accentColor).rgba);

    this.playerNameplate
      .setPosition(anchorX, anchorY + 42 + bobOffset * 0.1)
      .setText(resolveAvatarNameplate(appState.character.customName, appState.character.title));
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

    this.activeRoomId = event.roomId;
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
