import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { MeetingRoomPanel } from "./MeetingRoomPanel";
import { getPersonalityDefinition } from "../../quiz/personalityCatalog";
import { createInitialAppState, useAppStore } from "../../../state/appStore";

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

test("renders meeting hotspots and grouped tasks", () => {
  useAppStore.getState().createMeetingTask({
    title: "整理客户反馈",
    description: "来自聊天",
    source: "chat"
  });

  render(<MeetingRoomPanel />);

  expect(screen.getByRole("heading", { name: /meeting room/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /会议工位 任务发布台/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /会议工位 执行看板/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /会议工位 提交席/i })).toBeInTheDocument();
  expect(screen.getAllByText(/seed tasks/i).length).toBeGreaterThan(0);
  expect(screen.getByText("整理客户反馈")).toBeInTheDocument();
});

test("aligns the meeting panel surface to the shared office glass theme", () => {
  render(<MeetingRoomPanel />);

  expect(screen.getByLabelText("meeting-room-panel")).toHaveStyle({
    borderColor: "rgba(126, 214, 255, 0.1)"
  });
});

test("switches focus when selecting the submission station", () => {
  render(<MeetingRoomPanel />);

  fireEvent.click(screen.getByRole("button", { name: /会议工位 提交席/i }));

  expect(screen.getByText(/已聚焦会议工位：提交席/i)).toBeInTheDocument();
  const readyLane = screen.getByLabelText(/ready_to_submit-lane/i);
  expect(within(readyLane).getByRole("heading", { name: /ready to submit/i })).toBeInTheDocument();
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
