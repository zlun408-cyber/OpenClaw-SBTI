import "@testing-library/jest-dom";
import { beforeEach, expect, test } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { createInitialAppState, useAppStore } from "../../../state/appStore";
import { TrainingPanel } from "./TrainingPanel";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

test("renders preset skills and install actions", () => {
  render(<TrainingPanel />);

  expect(screen.getByRole("heading", { name: /training room/i })).toBeInTheDocument();
  expect(screen.getByText(/会议纪要整理/)).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: /安装 skill/i }).length).toBeGreaterThan(0);
});

test("allows installing a preset skill from the panel", async () => {
  render(<TrainingPanel />);

  fireEvent.click(screen.getByRole("button", { name: /安装 skill 会议纪要整理/i }));

  expect(await screen.findByText(/Installed via local fallback: 会议纪要整理/i)).toBeInTheDocument();

  const installedSection = screen.getByRole("heading", { name: /installed skills/i }).closest("section");
  expect(installedSection).not.toBeNull();
  expect(within(installedSection as HTMLElement).getByText("会议纪要整理")).toBeInTheDocument();
  expect(within(installedSection as HTMLElement).getByText("Installed via Local Fallback")).toBeInTheDocument();
});
