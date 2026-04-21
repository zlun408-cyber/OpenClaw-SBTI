export type Point = {
  x: number;
  y: number;
};

export type PathStep = {
  next: Point;
  velocity: Point;
  reachedTarget: boolean;
};

export class PathfindingSystem {
  moveTowards(current: Point, target: Point, speed: number, deltaSeconds: number): PathStep {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0 || deltaSeconds <= 0 || speed <= 0) {
      return {
        next: { ...current },
        velocity: { x: 0, y: 0 },
        reachedTarget: distance === 0
      };
    }

    const nx = dx / distance;
    const ny = dy / distance;
    const travelDistance = speed * deltaSeconds;

    if (travelDistance >= distance) {
      return {
        next: { ...target },
        velocity: { x: 0, y: 0 },
        reachedTarget: true
      };
    }

    return {
      next: {
        x: current.x + nx * travelDistance,
        y: current.y + ny * travelDistance
      },
      velocity: {
        x: nx * speed,
        y: ny * speed
      },
      reachedTarget: false
    };
  }
}
