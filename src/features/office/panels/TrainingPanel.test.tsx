import "@testing-library/jest-dom";
import { beforeEach, expect, test } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { createInitialAppState, useAppStore } from "../../../state/appStore";
import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import { TrainingPanel } from "./TrainingPanel";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

const fallbackAdapter: OpenClawAdapter = {
  buildRequest: (input, context) => ({
    session: "main",
    message: input,
    context: {
      roomId: context?.roomId ?? null,
      roomLabel: context?.roomLabel ?? null,
      characterName: context?.characterName ?? null,
      characterTitle: context?.characterTitle ?? null
    }
  }),
  sendMessage: async () => ({
    text: "fallback install",
    source: "fallback"
  })
};

test("renders training workstations and install actions", () => {
  render(<TrainingPanel />);

  expect(screen.getByRole("heading", { name: /training room/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /训练工位 文书工坊/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /训练工位 执行终端/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /训练工位 洞察档案台/i })).toBeInTheDocument();
});

test("switches available skills when selecting a workstation", () => {
  render(<TrainingPanel />);

  fireEvent.click(screen.getByRole("button", { name: /训练工位 执行终端/i }));

  const availableSection = screen.getByRole("heading", { name: /available skills/i }).closest("section");
  expect(availableSection).not.toBeNull();

  expect(within(availableSection as HTMLElement).getByText("读文件")).toBeInTheDocument();
  expect(within(availableSection as HTMLElement).getByText("跑测试")).toBeInTheDocument();
  expect(within(availableSection as HTMLElement).getByText("查日志")).toBeInTheDocument();
  expect(within(availableSection as HTMLElement).queryByText("会议纪要整理")).not.toBeInTheDocument();
});

test("allows installing a preset skill from the selected workstation", async () => {
  render(<TrainingPanel adapter={fallbackAdapter} />);

  fireEvent.click(screen.getByRole("button", { name: /训练工位 文书工坊/i }));
  fireEvent.click(screen.getByRole("button", { name: /安装 skill 会议纪要整理/i }));

  expect(await screen.findByText(/Installed via local fallback: 会议纪要整理/i)).toBeInTheDocument();

  const installedSection = screen.getByRole("heading", { name: /installed skills/i }).closest("section");
  expect(installedSection).not.toBeNull();
  expect(within(installedSection as HTMLElement).getByText("会议纪要整理")).toBeInTheDocument();
  expect(within(installedSection as HTMLElement).getByText("Installed via Local Fallback")).toBeInTheDocument();
});
