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
  enterOffice: (customName: string) => void;
};

export const createInitialAppState = (): Omit<AppState, "startQuiz" | "completeQuiz" | "enterOffice"> => ({
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
      phase: "avatarPreview",
      result: { ...result },
      character: {
        ...DEFAULT_CHARACTER_PROFILE,
        title: result.title
      }
    });
  },
  enterOffice(customName) {
    set((state) => {
      if (state.result === null) {
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
