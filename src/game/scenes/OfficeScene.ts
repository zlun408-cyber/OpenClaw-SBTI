import Phaser from "phaser";

import { roomTriggers } from "../data/roomTriggers";
import { mapConfig } from "../data/mapConfig";
import { MovementSystem } from "../systems/MovementSystem";
import { AnimationSystem } from "../systems/AnimationSystem";
import { RoomTriggerSystem } from "../systems/RoomTriggerSystem";
import { useAppStore } from "../../state/appStore";
import type { CharacterState, RoomId } from "../../types/domain";
import {
  resolveAvatarFacing,
  resolveAvatarNameplate,
  resolveAvatarPresentation,
  type AvatarFacing
} from "./officeAvatarPresentation";
import {
  OFFICE_DOOR_CHANGED_EVENT,
  resolveOfficeDoorRuntime,
  type OfficeDoorChangedEvent,
  type OfficeDoorRuntimeState
} from "./officeDoorRuntime";
import {
  getOfficeRoomVisual,
  OFFICE_ENVIRONMENT_LAYERS,
  OFFICE_VISUAL_DEPTHS
} from "./officeEnvironmentVisuals";

const ROOM_WIDTH = 158;
const ROOM_HEIGHT = 96;

type RoomEnteredEvent = {
  type: "ROOM_CHANGED";
  roomId: RoomId | null;
};

type Point = {
  x: number;
  y: number;
};

type AmbientSignal = {
  baseX: number;
  baseY: number;
  baseAlpha: number;
  driftRadius: number;
  driftSpeed: number;
  phaseOffset: number;
  sprite: Phaser.GameObjects.Arc;
};

type PathPulse = {
  baseAlpha: number;
  pulseOffset: number;
  pulseSpeed: number;
  points: Array<{ x: number; y: number }>;
  sprite: Phaser.GameObjects.Arc;
};

type RoomDoorVisual = {
  arch: Phaser.GameObjects.Ellipse;
  core: Phaser.GameObjects.Ellipse;
  threshold: Phaser.GameObjects.Ellipse;
  aura: Phaser.GameObjects.Ellipse;
  runes: Phaser.GameObjects.Rectangle[];
  label: Phaser.GameObjects.Text;
};

export class OfficeScene extends Phaser.Scene {
  static readonly KEY = "OfficeScene";

  private readonly animationSystem = new AnimationSystem();
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
  private ambientSignals: AmbientSignal[] = [];
  private pathPulses: PathPulse[] = [];
  private roomDoors: Partial<Record<RoomId, RoomDoorVisual>> = {};
  private readonly playableArea = this.createPlayableArea();
  private activeRoomId: RoomId | null = "office";
  private avatarFacing: AvatarFacing = "center";
  private lastDoorRuntimeSignature = "";

  constructor() {
    super(OfficeScene.KEY);
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.ambientSignals = [];
    this.pathPulses = [];
    this.roomDoors = {};
    this.lastDoorRuntimeSignature = "";

    this.cameras.main.setBackgroundColor(0x09111a);

    this.renderBackdrop(centerX, centerY);
    this.renderConnectionPaths(centerX, centerY);
    this.renderRooms(centerX, centerY);
    this.renderAmbientSignals(centerX, centerY);
    this.renderForegroundOverlays(centerX, centerY);

    const startX = centerX + mapConfig.rooms.office.x;
    const startY = centerY + mapConfig.rooms.office.y;

    this.playerShadow = this.add.ellipse(startX, startY + 22, 36, 16, 0x000000, 0.26);
    this.playerShadow.setDepth(OFFICE_VISUAL_DEPTHS.avatarShadow);

    this.playerGlow = this.add.circle(
      startX,
      startY,
      26,
      0xf4d08f,
      0.14
    );
    this.playerGlow.setDepth(OFFICE_VISUAL_DEPTHS.avatarGlow);

    this.playerAura = this.add.circle(startX, startY, 20, 0x8fd9ff, 0.14);
    this.playerAura.setStrokeStyle(2, 0xd7f4ff, 0.38).setDepth(OFFICE_VISUAL_DEPTHS.avatarAura);

    this.player = this.add.circle(
      startX,
      startY,
      10,
      0x8fd9ff,
      0
    );
    this.player.setDepth(OFFICE_VISUAL_DEPTHS.avatarBody - 1);

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
    this.playerContainer.setDepth(OFFICE_VISUAL_DEPTHS.avatarBody);

    this.playerStatusBadge = this.add
      .text(startX, startY - 56, "On Watch", {
        color: "#f7ebcf",
        fontFamily: "sans-serif",
        fontSize: "11px",
        backgroundColor: "rgba(10,16,28,0.78)",
        padding: { x: 10, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(OFFICE_VISUAL_DEPTHS.avatarLabels);

    this.playerEmoteText = this.add
      .text(startX, startY - 34, "Sync", {
        color: "#d7f4ff",
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(OFFICE_VISUAL_DEPTHS.avatarLabels);

    this.playerNameplate = this.add
      .text(startX, startY + 42, "Digital Employee", {
        color: "#e7dbc1",
        fontFamily: "sans-serif",
        fontSize: "12px"
      })
      .setOrigin(0.5)
      .setDepth(OFFICE_VISUAL_DEPTHS.avatarLabels);

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
    this.syncRoomDoors(0, "idle");
    this.emitDoorChangedIfNeeded(resolveOfficeDoorRuntime({
      roomId: this.activeRoomId ?? "office",
      activeRoomId: this.activeRoomId,
      characterState: "idle"
    }));
    this.emitRoomChangedIfNeeded();
  }

  update(time: number, deltaMs: number) {
    if (!this.player) {
      return;
    }

    this.syncEnvironmentAnimation(time, deltaMs);

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

    const effectiveState = this.resolveEffectiveCharacterState(movementDelta);

    this.syncAvatarPresentation(time, movementDelta, effectiveState);
    this.syncRoomDoors(time, effectiveState);
    this.emitDoorChangedIfNeeded(
      resolveOfficeDoorRuntime({
        roomId: this.activeRoomId ?? "office",
        activeRoomId: this.activeRoomId,
        characterState: effectiveState
      })
    );

    if (movedDistance < 0.2) {
      this.destinationMarker?.setVisible(false);
    }

    this.emitRoomChangedIfNeeded();
  }

  private renderBackdrop(centerX: number, centerY: number) {
    this.add
      .rectangle(centerX, centerY, this.scale.width + 120, this.scale.height + 120, 0x0d1622)
      .setDepth(OFFICE_VISUAL_DEPTHS.backdrop);

    const grid = this.add.graphics();
    grid.setDepth(OFFICE_VISUAL_DEPTHS.backdrop);
    grid.lineStyle(1, OFFICE_ENVIRONMENT_LAYERS.grid.color, OFFICE_ENVIRONMENT_LAYERS.grid.alpha);
    for (let x = -40; x <= this.scale.width + 40; x += OFFICE_ENVIRONMENT_LAYERS.grid.spacing) {
      grid.lineBetween(x, -20, x, this.scale.height + 20);
    }
    for (let y = -20; y <= this.scale.height + 20; y += OFFICE_ENVIRONMENT_LAYERS.grid.spacing) {
      grid.lineBetween(-40, y, this.scale.width + 40, y);
    }

    OFFICE_ENVIRONMENT_LAYERS.ambientGlows.forEach((glow) => {
      const position = this.resolveEnvironmentPoint(centerX, centerY, glow);

      this.add
        .circle(position.x, position.y, glow.radius, glow.color, glow.alpha)
        .setDepth(OFFICE_VISUAL_DEPTHS.backdrop);
    });
  }

  private renderConnectionPaths(centerX: number, centerY: number) {
    const railGraphics = this.add.graphics().setDepth(OFFICE_VISUAL_DEPTHS.signalPaths);
    const accentGraphics = this.add.graphics().setDepth(OFFICE_VISUAL_DEPTHS.signalPaths + 0.1);

    OFFICE_ENVIRONMENT_LAYERS.signalPaths.forEach((path) => {
      railGraphics.lineStyle(10, 0x13202d, 0.82);
      accentGraphics.lineStyle(3, path.color, path.alpha);

      for (let index = 0; index < path.points.length - 1; index += 1) {
        const start = this.resolveEnvironmentPoint(centerX, centerY, path.points[index]);
        const end = this.resolveEnvironmentPoint(centerX, centerY, path.points[index + 1]);

        railGraphics.strokeLineShape(new Phaser.Geom.Line(start.x, start.y, end.x, end.y));
        accentGraphics.strokeLineShape(new Phaser.Geom.Line(start.x, start.y, end.x, end.y));
      }

      const origin = this.resolveEnvironmentPoint(centerX, centerY, path.points[0]);
      const pulse = this.add.circle(origin.x, origin.y, 5, path.color, 0.42);
      pulse.setDepth(OFFICE_VISUAL_DEPTHS.dynamicSignals);
      pulse.setBlendMode(Phaser.BlendModes.ADD);

      this.pathPulses.push({
        baseAlpha: 0.42,
        pulseOffset: path.pulseOffset,
        pulseSpeed: path.pulseSpeed,
        points: path.points.map((point) => this.resolveEnvironmentPoint(centerX, centerY, point)),
        sprite: pulse
      });
    });
  }

  private renderRooms(centerX: number, centerY: number) {
    (Object.entries(mapConfig.rooms) as Array<[RoomId, { x: number; y: number }]>).forEach(([roomId, room]) => {
      const visual = getOfficeRoomVisual(roomId);
      const x = centerX + room.x;
      const y = centerY + room.y;

      this.add
        .rectangle(x, y + 12, ROOM_WIDTH + 12, ROOM_HEIGHT + 18, visual.shadow, 0.3)
        .setDepth(OFFICE_VISUAL_DEPTHS.rooms);

      const frame = this.add.graphics();
      frame.setDepth(OFFICE_VISUAL_DEPTHS.rooms);
      frame.fillStyle(visual.fill, 0.78);
      frame.fillRoundedRect(x - ROOM_WIDTH / 2, y - ROOM_HEIGHT / 2, ROOM_WIDTH, ROOM_HEIGHT, 20);
      frame.lineStyle(2, visual.accent, 0.42);
      frame.strokeRoundedRect(x - ROOM_WIDTH / 2, y - ROOM_HEIGHT / 2, ROOM_WIDTH, ROOM_HEIGHT, 20);

      this.add
        .rectangle(x, y - ROOM_HEIGHT / 2 + 18, ROOM_WIDTH - 24, 16, visual.accent, 0.18)
        .setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment);
      this.add
        .circle(x - ROOM_WIDTH / 2 + 18, y - ROOM_HEIGHT / 2 + 18, 6, visual.accent, 0.35)
        .setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment);

      this.add
        .text(x, y - 10, visual.label, {
          color: "#f4efe7",
          fontFamily: "sans-serif",
          fontSize: "18px",
          fontStyle: "700"
        })
        .setOrigin(0.5)
        .setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment);

      this.add
        .text(x, y + 16, visual.subtitle, {
          color: Phaser.Display.Color.IntegerToColor(visual.accent).rgba,
          fontFamily: "sans-serif",
          fontSize: "11px"
        })
        .setOrigin(0.5)
        .setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment);

      visual.equipment.forEach((equipment) => {
        const equipmentX = x + equipment.offsetX;
        const equipmentY = y + equipment.offsetY;
        const isRound = equipment.kind === "beacon" || equipment.kind === "pod";

        const shape = isRound
          ? this.add.ellipse(
              equipmentX,
              equipmentY,
              equipment.width,
              equipment.height,
              visual.accent,
              equipment.alpha
            )
          : this.add.rectangle(
              equipmentX,
              equipmentY,
              equipment.width,
              equipment.height,
              visual.accent,
              equipment.alpha
            );

        shape.setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment);

        if (equipment.kind === "screen" || equipment.kind === "terminal") {
          shape.setStrokeStyle(1, 0xd7f4ff, 0.3);
        }
      });

      visual.signalNodes.forEach((signalNode, index) => {
        const node = this.add.circle(
          x + signalNode.offsetX,
          y + signalNode.offsetY,
          signalNode.radius,
          visual.accent,
          signalNode.alpha
        );
        node.setDepth(OFFICE_VISUAL_DEPTHS.dynamicSignals);
        node.setBlendMode(Phaser.BlendModes.ADD);

        this.ambientSignals.push({
          baseX: x + signalNode.offsetX,
          baseY: y + signalNode.offsetY,
          baseAlpha: signalNode.alpha,
          driftRadius: 2 + index,
          driftSpeed: 0.45 + index * 0.08,
          phaseOffset: index * 0.2 + room.x * 0.001,
          sprite: node
        });
      });

      this.roomDoors[roomId] = this.renderRoomDoor(roomId, x, y + 18, visual.accent);
    });
  }

  private renderRoomDoor(roomId: RoomId, x: number, y: number, accentColor: number): RoomDoorVisual {
    const aura = this.add.ellipse(x, y - 2, 56, 72, accentColor, 0.08);
    aura.setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment);
    aura.setBlendMode(Phaser.BlendModes.ADD);

    const arch = this.add.ellipse(x, y + 2, 36, 46, 0x0f1824, 0.88);
    arch.setStrokeStyle(2, accentColor, 0.22).setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment + 0.1);

    const core = this.add.ellipse(x, y - 4, 18, 22, accentColor, 0.16);
    core.setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment + 0.2);

    const threshold = this.add.ellipse(x, y + 20, 26, 6, accentColor, 0.18);
    threshold.setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment + 0.2);

    const runes = [-12, -4, 4, 12].map((offsetX) => {
      const rune = this.add.rectangle(x + offsetX, y - 18, 4, 10, accentColor, 0.22);
      rune.setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment + 0.25);
      return rune;
    });

    const label = this.add
      .text(x, y + 30, roomId === "office" ? "ENTRY" : "PORTAL", {
        color: "#f3dcb1",
        fontFamily: "sans-serif",
        fontSize: "9px",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(OFFICE_VISUAL_DEPTHS.roomEquipment + 0.25);

    return { arch, aura, core, threshold, runes, label };
  }

  private renderAmbientSignals(centerX: number, centerY: number) {
    OFFICE_ENVIRONMENT_LAYERS.particles.forEach((particle, index) => {
      const position = this.resolveEnvironmentPoint(centerX, centerY, particle);
      const sprite = this.add.circle(position.x, position.y, particle.radius, particle.color, particle.alpha);
      sprite.setDepth(OFFICE_VISUAL_DEPTHS.dynamicSignals);
      sprite.setBlendMode(Phaser.BlendModes.ADD);

      this.ambientSignals.push({
        baseX: position.x,
        baseY: position.y,
        baseAlpha: particle.alpha,
        driftRadius: 4 + (index % 3),
        driftSpeed: 0.2 + index * 0.03,
        phaseOffset: index * 0.17,
        sprite
      });
    });
  }

  private renderForegroundOverlays(centerX: number, centerY: number) {
    OFFICE_ENVIRONMENT_LAYERS.foregroundOverlays.forEach((overlay) => {
      const position = this.resolveEnvironmentPoint(centerX, centerY, overlay);

      this.add
        .rectangle(
          position.x + overlay.width / 2,
          position.y + overlay.height / 2,
          overlay.width,
          overlay.height,
          overlay.color,
          overlay.alpha
        )
        .setDepth(OFFICE_VISUAL_DEPTHS.foreground);
    });
  }

  private syncEnvironmentAnimation(time: number, _deltaMs: number) {
    const seconds = time / 1000;

    this.ambientSignals.forEach((signal) => {
      const phase = seconds * signal.driftSpeed + signal.phaseOffset;
      signal.sprite
        .setPosition(
          signal.baseX + Math.cos(phase) * signal.driftRadius,
          signal.baseY + Math.sin(phase * 1.4) * signal.driftRadius * 0.6
        )
        .setAlpha(signal.baseAlpha + (Math.sin(phase * 2) + 1) * 0.08);
    });

    this.pathPulses.forEach((pulse) => {
      const progress = (seconds * pulse.pulseSpeed + pulse.pulseOffset) % 1;
      const point = this.resolvePathPoint(pulse.points, progress);
      const shimmer = 0.28 + (Math.sin(seconds * 5 + pulse.pulseOffset * Math.PI * 2) + 1) * 0.1;

      pulse.sprite
        .setPosition(point.x, point.y)
        .setScale(0.85 + shimmer)
        .setAlpha(pulse.baseAlpha + shimmer * 0.35);
    });
  }

  private resolveEnvironmentPoint(centerX: number, centerY: number, point: Point): Point {
    return {
      x: centerX + point.x,
      y: centerY + point.y
    };
  }

  private resolvePathPoint(points: Array<{ x: number; y: number }>, progress: number): Point {
    if (points.length <= 1) {
      return points[0] ?? { x: 0, y: 0 };
    }

    const segments = points.slice(0, -1).map((start, index) => ({
      start,
      end: points[index + 1],
      length: Phaser.Math.Distance.Between(start.x, start.y, points[index + 1].x, points[index + 1].y)
    }));
    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
    let remaining = progress * totalLength;

    for (const segment of segments) {
      if (remaining <= segment.length) {
        const t = segment.length === 0 ? 0 : remaining / segment.length;
        return {
          x: Phaser.Math.Linear(segment.start.x, segment.end.x, t),
          y: Phaser.Math.Linear(segment.start.y, segment.end.y, t)
        };
      }

      remaining -= segment.length;
    }

    return points[points.length - 1];
  }

  private resolveEffectiveCharacterState(movementDelta: Point): CharacterState {
    const isMoving = Math.abs(movementDelta.x) > 0.2 || Math.abs(movementDelta.y) > 0.2;
    return isMoving ? "walk" : useAppStore.getState().character.state;
  }

  private syncRoomDoors(time: number, characterState: CharacterState) {
    const activeRoomId = this.activeRoomId ?? "office";
    const pulse = (Math.sin(time / 220) + 1) / 2;

    (Object.keys(mapConfig.rooms) as RoomId[]).forEach((roomId) => {
      const runtime = resolveOfficeDoorRuntime({
        roomId,
        activeRoomId,
        characterState
      });
      const door = this.roomDoors[roomId];

      if (!door) {
        return;
      }

      const accent = runtime.accentColor;
      const isAnimatedCore = ["routing", "syncing", "resonating", "release"].includes(runtime.core);
      const isAnimatedRunes = ["streaming", "accelerating", "resonant", "confirming"].includes(runtime.runes);
      const isAnimatedThreshold = ["tracking", "pulsing", "vibrating", "opening"].includes(runtime.threshold);
      const auraAlpha = runtime.isActive ? 0.1 + pulse * 0.16 : 0.04;
      const runeAlpha = runtime.isActive ? (isAnimatedRunes ? 0.42 + pulse * 0.5 : 0.42) : 0.12;
      const coreScale = runtime.isActive ? (isAnimatedCore ? 1 + pulse * 0.18 : 1.08) : 0.94;
      const thresholdScale = runtime.isActive ? (isAnimatedThreshold ? 1 + pulse * 0.1 : 1) : 0.88;

      door.aura.setFillStyle(accent, auraAlpha).setScale(runtime.isActive ? 1.05 + pulse * 0.12 : 0.92);
      door.arch
        .setStrokeStyle(2, accent, runtime.isActive ? 0.48 : 0.18)
        .setFillStyle(runtime.fillColor, runtime.isActive ? 0.92 : 0.78);
      door.core.setFillStyle(accent, runtime.isActive ? 0.28 + pulse * 0.28 : 0.12).setScale(coreScale);
      door.threshold
        .setFillStyle(accent, runtime.isActive ? 0.32 + pulse * 0.26 : 0.14)
        .setScale(thresholdScale, 1);
      door.label
        .setText(runtime.isActive ? "ENTRY" : "STANDBY")
        .setColor(runtime.isActive ? "#f3dcb1" : "#8fa4b7");

      door.runes.forEach((rune, index) => {
        const phase = pulse + index * 0.12;
        rune
          .setFillStyle(accent, runeAlpha)
          .setScale(1, runtime.isActive ? 1 + Math.sin(phase * Math.PI * 2) * 0.18 : 0.82)
          .setY(door.arch.y - 20 + (runtime.isActive ? Math.sin(phase * Math.PI * 2) * 1.8 : 0));
      });
    });
  }

  private emitDoorChangedIfNeeded(doorState: OfficeDoorRuntimeState) {
    const signature = [
      doorState.roomId,
      doorState.activity,
      doorState.core,
      doorState.runes,
      doorState.threshold,
      doorState.isActive
    ].join(":");

    if (signature === this.lastDoorRuntimeSignature) {
      return;
    }

    this.lastDoorRuntimeSignature = signature;
    this.game.events.emit(OFFICE_DOOR_CHANGED_EVENT, {
      type: OFFICE_DOOR_CHANGED_EVENT,
      doorState
    } satisfies OfficeDoorChangedEvent);
  }

  private syncAvatarPresentation(time: number, movementDelta: Point, effectiveState: CharacterState) {
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
    const presentation = resolveAvatarPresentation({
      roomId: this.activeRoomId,
      state: effectiveState,
      resultType: appState.result?.resultType ?? null
    });
    const motion = this.animationSystem.resolveMotion(effectiveState, time);
    const visorOffsetX = this.avatarFacing === "left" ? -4 : this.avatarFacing === "right" ? 4 : 0;
    const bodyRotation = this.avatarFacing === "left" ? -0.08 : this.avatarFacing === "right" ? 0.08 : 0;
    const anchorX = this.player.x;
    const anchorY = this.player.y;

    this.playerShadow
      .setPosition(anchorX, anchorY + 24)
      .setScale(motion.shadowScaleX, motion.shadowScaleY);

    this.playerGlow
      .setPosition(anchorX, anchorY + motion.bobOffset * 0.2)
      .setFillStyle(presentation.auraColor, presentation.auraAlpha)
      .setScale(motion.auraScale * 1.1);

    this.playerAura
      .setPosition(anchorX, anchorY + motion.bobOffset * 0.15)
      .setFillStyle(presentation.accentColor, 0.12)
      .setStrokeStyle(2, presentation.accentColor, 0.42)
      .setScale(motion.auraScale);

    this.playerContainer
      .setPosition(anchorX, anchorY + motion.bobOffset)
      .setScale(motion.bodyScale)
      .setRotation(bodyRotation);

    this.playerMantle.setFillStyle(presentation.mantleColor, 1);
    this.playerCore.setFillStyle(presentation.bodyColor, 1);
    this.playerVisor.setFillStyle(presentation.accentColor, 0.92).setPosition(visorOffsetX, -8);
    this.playerSigil.setFillStyle(presentation.accentColor, 0.95);

    this.playerStatusBadge
      .setPosition(anchorX, anchorY - 58 + motion.bobOffset * 0.2)
      .setText(presentation.statusLabel)
      .setColor("#f7ebcf");

    this.playerEmoteText
      .setPosition(anchorX, anchorY - 36 + motion.bobOffset * 0.15)
      .setText(presentation.emoteLabel)
      .setColor(Phaser.Display.Color.IntegerToColor(presentation.accentColor).rgba);

    this.playerNameplate
      .setPosition(anchorX, anchorY + 42 + motion.bobOffset * 0.1)
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
