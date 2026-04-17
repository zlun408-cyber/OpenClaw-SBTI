import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, expect, test, vi } from "vitest";

import { OfficeRoute } from "./OfficeRoute";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import type { RoomId } from "../../types/domain";

const bridgeState = vi.hoisted(() => ({
  emittedRoomId: null as RoomId | null
}));

vi.mock("../../game/GameCanvas", async () => {
  const React = await import("react");
  return {
    GameCanvas: ({ onRoomChanged }: { onRoomChanged?: (roomId: RoomId | null) => void }) => {
      React.useEffect(() => {
        onRoomChanged?.(bridgeState.emittedRoomId);
      }, [onRoomChanged]);

      return React.createElement("div", { "data-testid": "mock-canvas" });
    }
  };
});

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    currentRoomId: "office",
    result: { resultType: "CTRL", title: "Architect" },
    character: {
      title: "Architect",
      customName: "Alex",
      state: "idle"
    }
  });
});

test("updates store with room exit events from game bridge", async () => {
  bridgeState.emittedRoomId = null;

  render(createElement(OfficeRoute));

  await waitFor(() => {
    expect(useAppStore.getState().currentRoomId).toBeNull();
  });
});

test("updates store with room enter events from game bridge", async () => {
  bridgeState.emittedRoomId = "meeting";

  render(createElement(OfficeRoute));

  await waitFor(() => {
    expect(useAppStore.getState().currentRoomId).toBe("meeting");
  });
});

test("mounts the office scene canvas and overlay UI together", async () => {
  bridgeState.emittedRoomId = "hr";

  render(createElement(OfficeRoute));

  expect(screen.getByTestId("office-scene-layout")).toBeInTheDocument();
  expect(screen.getByTestId("mock-canvas")).toBeInTheDocument();
  expect(screen.getByLabelText("office-hud")).toBeInTheDocument();
  expect(screen.getByLabelText("openclaw-chat")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /hr office/i })).toBeInTheDocument();
  });
});

test("renders the office route with unified digital command center chrome", () => {
  bridgeState.emittedRoomId = "office";

  render(createElement(OfficeRoute));

  const layout = screen.getByTestId("office-scene-layout");
  expect(layout).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(screen.getByLabelText("office-observation-window")).toBeInTheDocument();
  expect(screen.getByText("SBTI Digital Office")).toBeInTheDocument();
});
