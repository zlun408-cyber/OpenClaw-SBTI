import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { MeetingRoomPanel } from "./MeetingRoomPanel";
import { createInitialAppState, useAppStore } from "../../../state/appStore";

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

test("renders seed and chat tasks in grouped lanes", () => {
  useAppStore.getState().createMeetingTask({
    title: "整理客户反馈",
    description: "来自聊天",
    source: "chat"
  });

  render(<MeetingRoomPanel />);

  expect(screen.getByRole("heading", { name: /meeting room/i })).toBeInTheDocument();
  expect(screen.getAllByText(/seed tasks/i).length).toBeGreaterThan(0);
  expect(screen.getByText("整理客户反馈")).toBeInTheDocument();
});

test("allows claiming and submitting a task result", () => {
  const task = useAppStore.getState().createMeetingTask({
    title: "输出竞品分析",
    description: "来自聊天",
    source: "chat"
  });

  render(<MeetingRoomPanel />);

  fireEvent.click(screen.getByRole("button", { name: `领取任务 输出竞品分析` }));
  expect(useAppStore.getState().meetingTasks.find((item) => item.id === task.id)?.status).toBe("in_progress");

  fireEvent.click(screen.getByRole("button", { name: `标记待提交 输出竞品分析` }));
  fireEvent.change(screen.getByLabelText(`任务结果 ${task.id}`), {
    target: { value: "已完成竞品分析初稿" }
  });
  fireEvent.click(screen.getByRole("button", { name: `提交结果 输出竞品分析` }));

  expect(useAppStore.getState().meetingTasks.find((item) => item.id === task.id)?.status).toBe("submitted");
  expect(screen.getByText("已完成竞品分析初稿")).toBeInTheDocument();
});
