import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import { FloatingChatBox } from "./FloatingChatBox";
import { getPersonalityDefinition } from "../quiz/personalityCatalog";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import type { OpenClawAdapter, OpenClawContext } from "./OpenClawAdapter";

const buildContextSnapshot = (context?: OpenClawContext) => ({
  roomId: context?.roomId ?? null,
  roomLabel: context?.roomLabel ?? null,
  characterName: context?.characterName ?? null,
  characterTitle: context?.characterTitle ?? null
});
const ctrlResult = getPersonalityDefinition("CTRL");

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    currentRoomId: "meeting",
    result: ctrlResult,
    character: {
      title: ctrlResult.title,
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

test("renders as an office communication terminal", () => {
  render(<FloatingChatBox />);

  const chat = screen.getByLabelText("openclaw-chat");
  expect(chat).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(chat).toHaveAttribute("data-office-room", "meeting");
  expect(screen.getByText("OpenClaw Link")).toBeInTheDocument();
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


test("creates and installs a training skill from chat inside the training room", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input, context) => ({
      message: input,
      session: "main",
      context: buildContextSnapshot(context)
    }),
    sendMessage: vi.fn(async () => ({ text: "已安装 skill", source: "webchat" as const }))
  };

  useAppStore.setState((state) => ({ ...state, currentRoomId: "training" }));
  render(<FloatingChatBox adapter={adapter} />);

  fireEvent.change(screen.getByLabelText(/openclaw input/i), {
    target: { value: "安装 skill：日报总结" }
  });
  fireEvent.submit(screen.getByLabelText(/openclaw composer/i));

  expect(await screen.findByText(/已安装训练技能《日报总结》/)).toBeInTheDocument();
  expect(useAppStore.getState().trainingSkills.some((skill) => skill.name === "日报总结")).toBe(true);
});


test("switches rest activity from chat inside the rest area", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input, context) => ({
      message: input,
      session: "main",
      context: buildContextSnapshot(context)
    }),
    sendMessage: vi.fn(async () => ({ text: "不应该走到这里", source: "mock" as const }))
  };

  useAppStore.setState((state) => ({ ...state, currentRoomId: "rest" }));
  render(<FloatingChatBox adapter={adapter} />);

  fireEvent.change(screen.getByLabelText(/openclaw input/i), {
    target: { value: "跳舞放松一下" }
  });
  fireEvent.submit(screen.getByLabelText(/openclaw composer/i));

  expect(await screen.findByText(/已切换到跳舞状态/)).toBeInTheDocument();
  expect(useAppStore.getState().character.state).toBe("dance");
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
