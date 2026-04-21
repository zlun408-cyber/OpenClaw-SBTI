import { expect, test } from "vitest";

import { MovementSystem } from "./MovementSystem";

test("keyboard input interrupts click-to-move navigation", () => {
  const movement = new MovementSystem();
  movement.startAutoMove({ x: 100, y: 100 });

  movement.applyKeyboardInput({ left: true });

  expect(movement.mode).toBe("manual");
});

test("manual input moves the character using configured speed", () => {
  const movement = new MovementSystem(100);
  movement.applyKeyboardInput({ right: true });

  const next = movement.update({ x: 0, y: 0 }, 0.5);

  expect(next).toEqual({ x: 50, y: 0 });
});

test("auto movement reaches target and returns to manual mode", () => {
  const movement = new MovementSystem(200);
  movement.startAutoMove({ x: 100, y: 0 });

  const nearTarget = movement.update({ x: 0, y: 0 }, 0.25);
  const reached = movement.update(nearTarget, 0.25);

  expect(reached).toEqual({ x: 100, y: 0 });
  expect(movement.mode).toBe("manual");
});
