import { create } from "zustand";

import type {
  AppPhase,
  CharacterProfile,
  QuizResult,
  RoomId
} from "../types/domain";
import { DEFAULT_CHARACTER_PROFILE } from "../types/domain";

export type AppState = {
  phase: AppPhase;
  currentRoomId: RoomId;
  result: QuizResult | null;
  character: CharacterProfile;
  startQuiz: () => void;
  completeQuiz: (result: QuizResult) => void;
  enterAvatarPreview: () => void;
  enterOffice: (customName: string) => void;
};

export const createInitialAppState = (): Omit<AppState, "startQuiz" | "completeQuiz" | "enterAvatarPreview" | "enterOffice"> => ({
  phase: "intro",
  currentRoomId: "office",
  result: null,
  character: { ...DEFAULT_CHARACTER_PROFILE }
});

export const useAppStore = create<AppState>((set) => ({
  ...createInitialAppState(),
  startQuiz() {
    set((state) => ({
      ...state,
      phase: "quiz",
      result: null,
      character: { ...DEFAULT_CHARACTER_PROFILE }
    }));
  },
  completeQuiz(result) {
    set({
      phase: "warp",
      result: { ...result },
      character: {
        ...DEFAULT_CHARACTER_PROFILE,
        title: result.title
      }
    });
  },
  enterAvatarPreview() {
    set((state) => {
      const canEnterPreviewFromWarp =
        state.phase === "warp" &&
        state.result !== null &&
        state.character.title === state.result.title;

      if (!canEnterPreviewFromWarp) {
        return state;
      }

      return {
        ...state,
        phase: "avatarPreview"
      };
    });
  },
  enterOffice(customName) {
    set((state) => {
      const canEnterFromPreview =
        state.phase === "avatarPreview" &&
        state.result !== null &&
        state.character.title === state.result.title;

      if (!canEnterFromPreview) {
        return state;
      }

      return {
        ...state,
        phase: "office",
        character: {
          ...state.character,
          customName: customName.trim()
        }
      };
    });
  }
}));
