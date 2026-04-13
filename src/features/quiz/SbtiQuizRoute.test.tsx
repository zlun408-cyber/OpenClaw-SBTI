import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { appRoutes } from "../../app/router";
import { createInitialAppState, useAppStore } from "../../state/appStore";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("final answer enters warp overlay, locks inputs, and navigates after delay", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  fireEvent.click(screen.getByRole("button", { name: "先定规则和边界，确保方向可控" }));
  fireEvent.click(screen.getByRole("button", { name: "设定决策原则，快速收敛" }));

  const finalAnswerButton = screen.getByRole("button", { name: "优先排定优先级，避免失控" });
  fireEvent.click(finalAnswerButton);

  expect(screen.getByRole("status")).toHaveTextContent(/跃迁中/i);
  expect(useAppStore.getState().phase).toBe("warp");
  expect(useAppStore.getState().result?.title).toBe("控制者");

  const snapshotResult = useAppStore.getState().result;
  for (const button of screen.getAllByRole("button")) {
    expect(button).toBeDisabled();
  }

  fireEvent.click(finalAnswerButton);
  expect(useAppStore.getState().phase).toBe("warp");
  expect(useAppStore.getState().result).toEqual(snapshotResult);

  await act(async () => {
    vi.advanceTimersByTime(319);
  });
  expect(router.state.location.pathname).toBe("/quiz");

  await act(async () => {
    vi.advanceTimersByTime(1);
  });

  expect(router.state.location.pathname).toBe("/avatar");
  expect(useAppStore.getState().phase).toBe("avatarPreview");
  expect(screen.getByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();
});
