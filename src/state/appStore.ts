import { create } from "zustand";

import type {
  AppPhase,
  CharacterProfile,
  MeetingTask,
  MeetingTaskSource,
  QuizResult,
  RoomId
} from "../types/domain";
import { DEFAULT_CHARACTER_PROFILE } from "../types/domain";
import {
  createDefaultMeetingTasks,
  createMeetingTaskRecord
} from "../features/office/tasks/meetingTasks";

export type AppState = {
  phase: AppPhase;
  currentRoomId: RoomId | null;
  result: QuizResult | null;
  character: CharacterProfile;
  meetingTasks: MeetingTask[];
  activeMeetingTaskId: string | null;
  startQuiz: () => void;
  completeQuiz: (result: QuizResult) => void;
  enterAvatarPreview: () => void;
  enterOffice: (customName: string) => void;
  createMeetingTask: (input: {
    title: string;
    description: string;
    source: MeetingTaskSource;
  }) => MeetingTask;
  claimMeetingTask: (taskId: string) => void;
  markMeetingTaskReady: (taskId: string) => void;
  submitMeetingTask: (taskId: string, resultText: string) => void;
};

export const createInitialAppState = (): Omit<
  AppState,
  | "startQuiz"
  | "completeQuiz"
  | "enterAvatarPreview"
  | "enterOffice"
  | "createMeetingTask"
  | "claimMeetingTask"
  | "markMeetingTaskReady"
  | "submitMeetingTask"
> => ({
  phase: "intro",
  currentRoomId: null,
  result: null,
  character: { ...DEFAULT_CHARACTER_PROFILE },
  meetingTasks: createDefaultMeetingTasks(),
  activeMeetingTaskId: null
});

export const useAppStore = create<AppState>((set) => ({
  ...createInitialAppState(),
  startQuiz() {
    set((state) => ({
      ...state,
      phase: "quiz",
      result: null,
      character: { ...DEFAULT_CHARACTER_PROFILE },
      meetingTasks: createDefaultMeetingTasks(),
      activeMeetingTaskId: null
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
        currentRoomId: "office",
        character: {
          ...state.character,
          customName: customName.trim()
        }
      };
    });
  },
  createMeetingTask(input) {
    const nextTask = createMeetingTaskRecord(input);
    set((state) => ({
      ...state,
      meetingTasks: [nextTask, ...state.meetingTasks]
    }));
    return nextTask;
  },
  claimMeetingTask(taskId) {
    set((state) => ({
      ...state,
      activeMeetingTaskId: taskId,
      character: {
        ...state.character,
        state: "work"
      },
      meetingTasks: state.meetingTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "in_progress", updatedAt: new Date().toISOString() }
          : task
      )
    }));
  },
  markMeetingTaskReady(taskId) {
    set((state) => ({
      ...state,
      character: {
        ...state.character,
        state: "task-submit"
      },
      meetingTasks: state.meetingTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "ready_to_submit", updatedAt: new Date().toISOString() }
          : task
      )
    }));
  },
  submitMeetingTask(taskId, resultText) {
    set((state) => ({
      ...state,
      activeMeetingTaskId: state.activeMeetingTaskId === taskId ? null : state.activeMeetingTaskId,
      character: {
        ...state.character,
        state: "idle"
      },
      meetingTasks: state.meetingTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "submitted",
              resultText: resultText.trim(),
              updatedAt: new Date().toISOString()
            }
          : task
      )
    }));
  }
}));
