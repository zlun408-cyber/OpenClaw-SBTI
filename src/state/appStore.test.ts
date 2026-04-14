import { beforeEach, expect, test } from "vitest";

import { createInitialAppState, useAppStore } from "./appStore";
import {
  selectCharacterLabel,
  selectCurrentRoomContext
} from "./selectors";
import type { QuizResult } from "../types/domain";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

test("can complete quiz into warp then enter avatar preview", () => {
  const store = useAppStore.getState();
  store.completeQuiz({ resultType: "CTRL", title: "控制者" });

  expect(useAppStore.getState().phase).toBe("warp");

  store.enterAvatarPreview();
  expect(useAppStore.getState().phase).toBe("avatarPreview");
});

test("can enter office and persist trimmed custom name after preview", () => {
  const store = useAppStore.getState();
  store.completeQuiz({ resultType: "CTRL", title: "控制者" });
  store.enterAvatarPreview();
  store.enterOffice(" 阿控 ");

  expect(useAppStore.getState().phase).toBe("office");
  expect(useAppStore.getState().character.customName).toBe("阿控");
});

test("does not enter office without quiz result", () => {
  useAppStore.getState().enterOffice("阿控");

  expect(useAppStore.getState().phase).toBe("intro");
  expect(useAppStore.getState().character.customName).toBe("");
});

test("startQuiz clears stale result and character state", () => {
  const store = useAppStore.getState();
  store.completeQuiz({ resultType: "CTRL", title: "控制者" });
  store.enterAvatarPreview();
  store.enterOffice("阿控");

  store.startQuiz();

  expect(useAppStore.getState().phase).toBe("quiz");
  expect(useAppStore.getState().result).toBeNull();
  expect(useAppStore.getState().character).toEqual({
    title: "数字员工",
    customName: "",
    state: "idle"
  });
});

test("completeQuiz stores a copied result payload", () => {
  const result: QuizResult = { resultType: "CTRL", title: "控制者" };

  useAppStore.getState().completeQuiz(result);

  const state = useAppStore.getState();
  expect(state.result).toEqual(result);
  expect(state.result).not.toBe(result);
});

test("completeQuiz hydrates preview-ready character data", () => {
  useAppStore.setState((state) => ({
    ...state,
    character: { ...state.character, title: "旧称号", customName: "老名字", state: "dance" }
  }));

  useAppStore.getState().completeQuiz({ resultType: "CTRL", title: "控制者" });

  expect(useAppStore.getState().character).toEqual({
    title: "控制者",
    customName: "",
    state: "idle"
  });
});

test("enterAvatarPreview ignores transitions outside warp", () => {
  useAppStore.getState().enterAvatarPreview();

  expect(useAppStore.getState().phase).toBe("intro");
});

test("selectors expose room context and character label", () => {
  useAppStore.setState((state) => ({
    ...state,
    currentRoomId: "training",
    character: { ...state.character, title: "控制者", customName: "阿控" }
  }));

  const state = useAppStore.getState();

  expect(selectCurrentRoomContext(state)).toEqual({
    id: "training",
    label: "培训室"
  });
  expect(selectCharacterLabel(state)).toBe("阿控");
});

test("character label falls back to title", () => {
  useAppStore.setState((state) => ({
    ...state,
    character: { ...state.character, title: "控制者", customName: "" }
  }));

  expect(selectCharacterLabel(useAppStore.getState())).toBe("控制者");
});



test("current room selector returns null when outside all rooms", () => {
  useAppStore.setState((state) => ({ ...state, currentRoomId: null }));

  expect(selectCurrentRoomContext(useAppStore.getState())).toBeNull();
});
test("room registry is immutable through selector output", () => {
  useAppStore.setState((state) => ({ ...state, currentRoomId: "office" }));
  const room = selectCurrentRoomContext(useAppStore.getState());

  expect(Object.isFrozen(room)).toBe(true);
  expect(() => {
    (room as { label: string }).label = "被改坏";
  }).toThrow(TypeError);
  expect(selectCurrentRoomContext(useAppStore.getState())?.label).toBe("办公室");
});


test("meeting tasks can be claimed, marked ready, and submitted", () => {
  const store = useAppStore.getState();
  const createdTask = store.createMeetingTask({
    title: "整理今天客户反馈",
    description: "来自会议室对话",
    source: "chat"
  });

  store.claimMeetingTask(createdTask.id);
  expect(useAppStore.getState().meetingTasks.find((task) => task.id === createdTask.id)?.status).toBe("in_progress");
  expect(useAppStore.getState().activeMeetingTaskId).toBe(createdTask.id);
  expect(useAppStore.getState().character.state).toBe("work");

  store.markMeetingTaskReady(createdTask.id);
  expect(useAppStore.getState().meetingTasks.find((task) => task.id === createdTask.id)?.status).toBe("ready_to_submit");
  expect(useAppStore.getState().character.state).toBe("task-submit");

  store.submitMeetingTask(createdTask.id, "已输出客户反馈总结");
  const submittedTask = useAppStore.getState().meetingTasks.find((task) => task.id === createdTask.id);
  expect(submittedTask?.status).toBe("submitted");
  expect(submittedTask?.resultText).toBe("已输出客户反馈总结");
  expect(useAppStore.getState().activeMeetingTaskId).toBeNull();
  expect(useAppStore.getState().character.state).toBe("idle");
});


test("training skills can be installed and marked with fallback channel", () => {
  const store = useAppStore.getState();
  const createdSkill = store.createTrainingSkill({
    name: "日志分析",
    description: "来自聊天",
    source: "chat"
  });

  store.beginTrainingSkillInstall(createdSkill.id);
  expect(useAppStore.getState().trainingSkills.find((skill) => skill.id === createdSkill.id)?.status).toBe("installing");
  expect(useAppStore.getState().character.state).toBe("train");

  store.completeTrainingSkillInstall(createdSkill.id, "local");
  const installedSkill = useAppStore.getState().trainingSkills.find((skill) => skill.id === createdSkill.id);
  expect(installedSkill?.status).toBe("installed");
  expect(installedSkill?.installChannel).toBe("local");
  expect(useAppStore.getState().character.state).toBe("idle");
});
