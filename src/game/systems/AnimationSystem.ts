import type { CharacterState } from "../../types/domain";

export type AvatarMotionFrame = {
  bobOffset: number;
  auraScale: number;
  bodyScale: number;
  shadowScaleX: number;
  shadowScaleY: number;
};

export class AnimationSystem {
  resolveMotion(state: CharacterState, timeMs: number): AvatarMotionFrame {
    const pulse = 1 + Math.sin(timeMs / 300) * 0.04;
    const dancePulse = state === "dance" ? Math.abs(Math.sin(timeMs / 120)) * 0.1 : 0;
    const bobOffset = Math.sin(timeMs / 240) * (state === "sleep" ? 1.4 : 2.8);

    return {
      bobOffset,
      auraScale: pulse + dancePulse,
      bodyScale: 1 + dancePulse * 0.5,
      shadowScaleX: 1 + dancePulse * 0.35,
      shadowScaleY: 1 - Math.abs(dancePulse) * 0.15
    };
  }
}
