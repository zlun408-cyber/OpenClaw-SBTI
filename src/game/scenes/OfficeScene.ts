import Phaser from "phaser";

import { mapConfig } from "../data/mapConfig";

const ROOM_WIDTH = 128;
const ROOM_HEIGHT = 80;

export class OfficeScene extends Phaser.Scene {
  static readonly KEY = "OfficeScene";

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
  }
}
