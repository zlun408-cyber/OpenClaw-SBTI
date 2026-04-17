import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { OfficeHUD } from "./OfficeHUD";
import { createInitialAppState, useAppStore } from "../../state/appStore";

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    result: { resultType: "CTRL", title: "Architect" },
    character: {
      title: "Architect",
      customName: "Alex",
      state: "idle"
    }
  });
});

test("reacts to store updates for name and task status", () => {
  render(<OfficeHUD />);

  expect(screen.getByText("Alex")).toBeInTheDocument();
  expect(screen.getByText("Idle")).toBeInTheDocument();

  act(() => {
    useAppStore.setState((state) => ({
      ...state,
      character: {
        ...state.character,
        customName: "",
        state: "train"
      }
    }));
  });

  expect(screen.getByText("Architect")).toBeInTheDocument();
  expect(screen.getByText("Training")).toBeInTheDocument();
});

test("renders as a room-aware digital employee terminal", () => {
  useAppStore.setState((state) => ({
    ...state,
    currentRoomId: "training"
  }));

  render(<OfficeHUD />);

  const hud = screen.getByLabelText("office-hud");
  expect(hud).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(hud).toHaveAttribute("data-office-room", "training");
  expect(screen.getByText(/digital employee/i)).toBeInTheDocument();
});
