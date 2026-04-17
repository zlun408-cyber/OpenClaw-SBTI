import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { appRoutes } from "../../app/router";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import { questions } from "./questions";

const answerEveryQuestionForAxis = (axis: "control" | "execution" | "harmony") => {
  for (const question of questions) {
    const option = question.options.find((item) => item.axis === axis);
    if (!option) {
      throw new Error(`Missing ${axis} answer for ${question.id}`);
    }

    fireEvent.click(screen.getByRole("button", { name: option.label }));
  }
};

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("shows longer ritual progress metadata for the 30-question quiz", () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  expect(screen.getByText("第 1 / 30 题")).toBeInTheDocument();
  expect(screen.getByRole("progressbar", { name: /quiz progress/i })).toHaveAttribute(
    "aria-valuenow",
    "3"
  );
});

test("final answer enters warp overlay, locks inputs, and navigates after delay", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  answerEveryQuestionForAxis("control");

  expect(screen.getByRole("status")).toHaveTextContent(/跃迁中/i);
  expect(useAppStore.getState().phase).toBe("warp");
  expect(useAppStore.getState().result?.title).toBe("拿捏者");
  expect(useAppStore.getState().result?.code).toBe("CTRL");

  const snapshotResult = useAppStore.getState().result;
  for (const button of screen.getAllByRole("button")) {
    expect(button).toBeDisabled();
  }
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
