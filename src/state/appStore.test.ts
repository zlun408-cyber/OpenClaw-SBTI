import { beforeEach, expect, test } from "vitest";

import { createInitialAppState, useAppStore } from "./appStore";
import {
  selectCharacterLabel,
  selectCurrentRoomContext
} from "./selectors";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

test("can complete quiz and enter avatar preview", () => {
  const store = useAppStore.getState();
  store.completeQuiz({ resultType: "CTRL", title: "控制者" });

  expect(useAppStore.getState().phase).toBe("avatarPreview");
});

test("completeQuiz stores a copied result payload", () => {
  const result = { resultType: "CTRL", title: "控制者" };

  useAppStore.getState().completeQuiz(result);

  const state = useAppStore.getState();
  expect(state.result).toEqual(result);
  expect(state.result).not.toBe(result);
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
