import { PathfindingSystem, type Point } from "./PathfindingSystem";

export type MovementMode = "manual" | "auto";

export type KeyboardInput = {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
};

export class MovementSystem {
  readonly speed: number;
  mode: MovementMode = "manual";

  private velocity: Point = { x: 0, y: 0 };
  private target: Point | null = null;
  private readonly pathfinding = new PathfindingSystem();

  constructor(speed = 220) {
    this.speed = speed;
  }

  startAutoMove(target: Point) {
    this.mode = "auto";
    this.target = { ...target };
  }

  applyKeyboardInput(input: KeyboardInput) {
    const horizontal = Number(Boolean(input.right)) - Number(Boolean(input.left));
    const vertical = Number(Boolean(input.down)) - Number(Boolean(input.up));

    if (horizontal !== 0 || vertical !== 0) {
      const length = Math.hypot(horizontal, vertical);
      this.velocity = {
        x: (horizontal / length) * this.speed,
        y: (vertical / length) * this.speed
      };
      this.mode = "manual";
      this.target = null;
      return;
    }

    if (this.mode === "manual") {
      this.velocity = { x: 0, y: 0 };
    }
  }

  update(position: Point, deltaSeconds: number): Point {
    if (this.mode === "auto" && this.target) {
      const step = this.pathfinding.moveTowards(position, this.target, this.speed, deltaSeconds);
      this.velocity = step.velocity;

      if (step.reachedTarget) {
        this.mode = "manual";
        this.target = null;
      }

      return step.next;
    }

    if (deltaSeconds <= 0) {
      return { ...position };
    }

    return {
      x: position.x + this.velocity.x * deltaSeconds,
      y: position.y + this.velocity.y * deltaSeconds
    };
  }

  getVelocity(): Point {
    return { ...this.velocity };
  }
}
