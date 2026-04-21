import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  static readonly KEY = "BootScene";

  constructor() {
    super(BootScene.KEY);
  }

  create() {
    this.scene.start("PreloadScene");
  }
}
