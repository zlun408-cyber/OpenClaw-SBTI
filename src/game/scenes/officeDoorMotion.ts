import type { OfficeDoorRuntimeState } from "./officeDoorRuntime";

type MotionFrameInput = {
  runtime: OfficeDoorRuntimeState;
  timeMs: number;
  proximity: number;
};

export type OfficeDoorMotionFrame = {
  label: "ACTIVE" | "ENTER" | "STANDBY";
  auraAlpha: number;
  auraScale: number;
  archFillAlpha: number;
  archScaleY: number;
  archStrokeAlpha: number;
  coreAlpha: number;
  coreScale: number;
  runeAlpha: number;
  runeOffsets: number[];
  thresholdAlpha: number;
  thresholdScaleX: number;
};

const animatedCoreStates = new Set(["routing", "syncing", "resonating", "release"]);
const animatedRuneStates = new Set(["streaming", "accelerating", "resonant", "confirming"]);
const animatedThresholdStates = new Set(["tracking", "pulsing", "vibrating", "opening"]);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function resolveOfficeDoorMotionFrame({
  runtime,
  timeMs,
  proximity
}: MotionFrameInput): OfficeDoorMotionFrame {
  const clampedProximity = clamp01(proximity);
  const pulse = (Math.sin(timeMs / 220) + 1) / 2;

  if (!runtime.isActive) {
    return {
      label: "STANDBY",
      auraAlpha: 0.04,
      auraScale: 0.92,
      archFillAlpha: 0.78,
      archScaleY: 0.98,
      archStrokeAlpha: 0.18,
      coreAlpha: 0.12,
      coreScale: 0.94,
      runeAlpha: 0.12,
      runeOffsets: [0, 0, 0, 0],
      thresholdAlpha: 0.14,
      thresholdScaleX: 0.88
    };
  }

  const coreMotion = animatedCoreStates.has(runtime.core) ? pulse * 0.14 : 0.04;
  const runeMotion = animatedRuneStates.has(runtime.runes) ? 1 : 0.45;
  const thresholdMotion = animatedThresholdStates.has(runtime.threshold) ? pulse * 0.1 : 0.02;
  const proximityBoost = clampedProximity * 0.16;

  return {
    label: clampedProximity >= 0.55 ? "ENTER" : "ACTIVE",
    auraAlpha: 0.1 + pulse * 0.16 + clampedProximity * 0.1,
    auraScale: 1.05 + pulse * 0.12 + clampedProximity * 0.14,
    archFillAlpha: 0.9,
    archScaleY: 1 + pulse * 0.02 + clampedProximity * 0.08,
    archStrokeAlpha: 0.48 + clampedProximity * 0.22,
    coreAlpha: 0.28 + pulse * 0.28 + clampedProximity * 0.12,
    coreScale: 1.08 + coreMotion + proximityBoost,
    runeAlpha: 0.42 + pulse * 0.34 + clampedProximity * 0.18,
    runeOffsets: [0, 1, 2, 3].map((index) => {
      const phase = pulse + index * 0.12;
      return Math.max(0, Math.sin(phase * Math.PI * 2) * runeMotion) * (1.8 + clampedProximity * 2);
    }),
    thresholdAlpha: 0.32 + pulse * 0.26 + clampedProximity * 0.12,
    thresholdScaleX: 1 + thresholdMotion + clampedProximity * 0.12
  };
}
