import { create } from "zustand";

import type { AppPhase, CharacterState, RoomId } from "../types/domain";

export type QuizResult = {
  resultType: string;
  title: string;
};

export type CharacterProfile = {
  title: string;
  customName: string;
  state: CharacterState;
};

export type RoomContext = {
  id: RoomId;
  label: string;
};

export type AppState = {
  phase: AppPhase;
  currentRoomId: RoomId;
  result: QuizResult | null;
  character: CharacterProfile;
  rooms: Record<RoomId, RoomContext>;
  completeQuiz: (result: QuizResult) => void;
};

const defaultRooms: Record<RoomId, RoomContext> = {
  office: { id: "office", label: "办公室" },
  meeting: { id: "meeting", label: "会议室" },
  hr: { id: "hr", label: "人事部" },
  training: { id: "training", label: "培训室" },
  rest: { id: "rest", label: "休息区" }
};

const initialCharacter: CharacterProfile = {
  title: "数字员工",
  customName: "",
  state: "idle"
};

export const createInitialAppState = (): Omit<AppState, "completeQuiz"> => ({
  phase: "intro",
  currentRoomId: "office",
  result: null,
  character: { ...initialCharacter },
  rooms: defaultRooms
});

export const useAppStore = create<AppState>((set) => ({
  ...createInitialAppState(),
  completeQuiz(result) {
    set({ phase: "avatarPreview", result: { ...result } });
  }
}));
