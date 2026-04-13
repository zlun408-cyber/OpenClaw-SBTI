import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  static readonly KEY = "PreloadScene";

  constructor() {
    super(PreloadScene.KEY);
  }

  create() {
    this.scene.start("OfficeScene");
  }
}
