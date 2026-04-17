import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { OfficeHUD } from "./OfficeHUD";
import { getPersonalityDefinition } from "../quiz/personalityCatalog";
import { createInitialAppState, useAppStore } from "../../state/appStore";

const ctrlResult = getPersonalityDefinition("CTRL");

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    result: ctrlResult,
    character: {
      title: ctrlResult.title,
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

  expect(screen.getByText("拿捏者")).toBeInTheDocument();
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
