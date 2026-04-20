import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { appRoutes } from "../../app/router";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import { questions } from "./questions";

const answerEveryQuestionForOptionIndex = (index: number) => {
  for (const question of questions) {
    const option = question.options[index];
    if (!option) {
      throw new Error(`Missing option ${index} for ${question.id}`);
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

test("renders the quiz as a full sbti ritual console instead of plain text buttons", () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  expect(screen.getByTestId("sbti-quiz-shell")).toHaveAttribute("data-quiz-theme", "sbti-ritual");
  expect(screen.getByText("第 1 / 31 题")).toBeInTheDocument();
  expect(screen.getByText(/人格维度校准/i)).toBeInTheDocument();
  expect(screen.getByLabelText("sbti-question-card")).toBeInTheDocument();
  expect(screen.getAllByRole("button")).toHaveLength(4);
  expect(screen.getByRole("progressbar", { name: /quiz progress/i })).toHaveAttribute(
    "aria-valuenow",
    "3"
  );
});

test("final answer enters warp overlay, locks inputs, and navigates after delay", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  answerEveryQuestionForOptionIndex(0);

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
