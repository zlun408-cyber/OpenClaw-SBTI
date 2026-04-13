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
  completeQuiz: (result: QuizResult) => void;
};

export const createInitialAppState = (): Omit<AppState, "completeQuiz"> => ({
  phase: "intro",
  currentRoomId: "office",
  result: null,
  character: { ...DEFAULT_CHARACTER_PROFILE }
});

export const useAppStore = create<AppState>((set) => ({
  ...createInitialAppState(),
  completeQuiz(result) {
    set({
      phase: "avatarPreview",
      result: { ...result },
      character: {
        title: result.title,
        customName: "",
        state: "idle"
      }
    });
  }
}));
