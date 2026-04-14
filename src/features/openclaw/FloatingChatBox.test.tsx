import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import { FloatingChatBox } from "./FloatingChatBox";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import type { OpenClawAdapter, OpenClawContext } from "./OpenClawAdapter";

const buildContextSnapshot = (context?: OpenClawContext) => ({
  roomId: context?.roomId ?? null,
  roomLabel: context?.roomLabel ?? null,
  characterName: context?.characterName ?? null,
  characterTitle: context?.characterTitle ?? null
});

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    currentRoomId: "meeting",
    result: { resultType: "CTRL", title: "Architect" },
    character: {
      title: "Architect",
      customName: "Alex",
      state: "idle"
    }
  });
});

test("updates the prompt copy when the active room changes", () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input, context) => ({
      message: input,
      session: "main",
      context: buildContextSnapshot(context)
    }),
    sendMessage: vi.fn(async () => ({ text: "收到", source: "mock" as const }))
  };

  render(<FloatingChatBox adapter={adapter} />);

  expect(screen.getByPlaceholderText("给数字员工分配任务")).toBeInTheDocument();

  act(() => {
    useAppStore.setState({ currentRoomId: "hr" });
  });

  expect(screen.getByPlaceholderText("更新 soul 或 memory")).toBeInTheDocument();
});

test("sends the input through the adapter and renders the reply for non-task chat", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input, context) => ({
      message: input,
      session: "main",
      context: buildContextSnapshot(context)
    }),
    sendMessage: vi.fn(async (input) => ({ text: `mock:${input}`, source: "mock" as const }))
  };

  render(<FloatingChatBox adapter={adapter} />);

  fireEvent.change(screen.getByLabelText(/openclaw input/i), {
    target: { value: "最近状态怎么样" }
  });
  fireEvent.submit(screen.getByLabelText(/openclaw composer/i));

  expect(await screen.findByText("mock:最近状态怎么样")).toBeInTheDocument();
});


test("creates a meeting task from chat-first task requests", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input, context) => ({
      message: input,
      session: "main",
      context: buildContextSnapshot(context)
    }),
    sendMessage: vi.fn(async () => ({ text: "不应该走到这里", source: "mock" as const }))
  };

  render(<FloatingChatBox adapter={adapter} />);

  fireEvent.change(screen.getByLabelText(/openclaw input/i), {
    target: { value: "新增任务：整理今天客户反馈" }
  });
  fireEvent.submit(screen.getByLabelText(/openclaw composer/i));

  expect(await screen.findByText(/已创建会议任务《整理今天客户反馈》/)).toBeInTheDocument();
  expect(useAppStore.getState().meetingTasks.some((task) => task.title === "整理今天客户反馈")).toBe(true);
  expect(adapter.sendMessage).not.toHaveBeenCalled();
});


test("shows a fallback message when the adapter throws", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input, context) => ({
      message: input,
      session: "main",
      context: buildContextSnapshot(context)
    }),
    sendMessage: vi.fn(async () => {
      throw new Error("adapter failed");
    })
  };

  render(<FloatingChatBox adapter={adapter} />);

  fireEvent.change(screen.getByLabelText(/openclaw input/i), {
    target: { value: "更新一下状态" }
  });
  fireEvent.submit(screen.getByLabelText(/openclaw composer/i));

  expect(
    await screen.findByText("OpenClaw 暂时没有返回结果，请稍后重试或打开本地 Webchat。")
  ).toBeInTheDocument();
});
