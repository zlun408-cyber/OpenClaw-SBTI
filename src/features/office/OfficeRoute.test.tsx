import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";

import { OfficeRoute } from "./OfficeRoute";
import { getPersonalityDefinition } from "../quiz/personalityCatalog";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import type { CharacterState, RoomId } from "../../types/domain";
import type { OfficeDoorRuntimeState } from "../../game/scenes/officeDoorRuntime";

const bridgeState = vi.hoisted(() => ({
  emittedRoomId: null as RoomId | null,
  doorRuntimeByCharacterState: {} as Partial<Record<CharacterState, OfficeDoorRuntimeState>>
}));
const ctrlResult = getPersonalityDefinition("CTRL");

vi.mock("../../game/GameCanvas", async () => {
  const React = await import("react");
  const { useAppStore } = await import("../../state/appStore");
  return {
    GameCanvas: ({
      onRoomChanged,
      onDoorStateChanged
    }: {
      onRoomChanged?: (roomId: RoomId | null) => void;
      onDoorStateChanged?: (doorState: OfficeDoorRuntimeState) => void;
    }) => {
      const characterState = useAppStore((state) => state.character.state);

      React.useEffect(() => {
        onRoomChanged?.(bridgeState.emittedRoomId);
        const nextDoorRuntime =
          bridgeState.doorRuntimeByCharacterState[characterState] ??
          bridgeState.doorRuntimeByCharacterState.idle;

        if (nextDoorRuntime) {
          onDoorStateChanged?.(nextDoorRuntime);
        }
      }, [characterState, onDoorStateChanged, onRoomChanged]);

      return React.createElement("div", { "data-testid": "mock-canvas" });
    }
  };
});

beforeEach(() => {
  bridgeState.emittedRoomId = "office";
  bridgeState.doorRuntimeByCharacterState = {
    idle: {
      roomId: "office",
      activity: "idle",
      core: "active",
      runes: "online",
      threshold: "glowing",
      accentColor: 0x69d6ff,
      fillColor: 0x182f3a,
      isActive: true
    }
  };

  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    currentRoomId: "office",
    result: ctrlResult,
    character: {
      title: ctrlResult.title,
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
  expect(screen.getByLabelText("office-scene-overlay-layer")).toBeInTheDocument();
});

test("renders the office route with unified digital command center chrome", () => {
  bridgeState.emittedRoomId = "office";

  render(createElement(OfficeRoute));

  const layout = screen.getByTestId("office-scene-layout");
  expect(layout).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(screen.getByLabelText("office-observation-window")).toBeInTheDocument();
  expect(screen.getByText("SBTI Digital Office")).toBeInTheDocument();
  expect(screen.getByTestId("office-route-grid")).toHaveAttribute("aria-hidden", "true");
});

test("renders the main office as a current-room in-room view with minimap and persona slot", () => {
  bridgeState.emittedRoomId = "office";

  render(createElement(OfficeRoute));

  const stage = screen.getByLabelText("office-current-room-stage");
  expect(stage).toHaveAttribute("data-room-id", "office");
  expect(stage).toHaveAttribute("data-view-mode", "in-room");
  expect(within(stage).getByText("Main Office")).toBeInTheDocument();
  expect(screen.getByText("办公室")).toBeInTheDocument();
  expect(screen.getByLabelText("office-entry-door")).toHaveAttribute("data-door-runtime-source", "scene");
  expect(screen.getByLabelText("office-door-core")).toHaveAttribute("data-door-core-state", "active");
  expect(screen.getByLabelText("office-door-threshold")).toHaveAttribute("data-threshold-state", "glowing");
  expect(screen.getByLabelText("office-door-runes")).toHaveAttribute("data-rune-band", "online");
  expect(screen.getByAltText("拿捏者 房间立绘位")).toHaveAttribute(
    "src",
    "/assets/characters/ctrl/transparent.png"
  );

  const minimap = screen.getByLabelText("office-minimap");
  expect(within(minimap).getByLabelText("minimap-room-office")).toHaveAttribute("aria-current", "true");
  expect(within(minimap).getByLabelText("minimap-room-meeting")).toHaveAttribute("aria-current", "false");
});

test("updates the in-room shell and minimap highlight when the active room changes", async () => {
  bridgeState.emittedRoomId = "training";
  bridgeState.doorRuntimeByCharacterState = {
    idle: {
      roomId: "training",
      activity: "idle",
      core: "active",
      runes: "online",
      threshold: "glowing",
      accentColor: 0x9fe3c4,
      fillColor: 0x183934,
      isActive: true
    }
  };

  render(createElement(OfficeRoute));

  await waitFor(() => {
    expect(screen.getByLabelText("office-current-room-stage")).toHaveAttribute("data-room-id", "training");
  });

  const stage = screen.getByLabelText("office-current-room-stage");
  expect(screen.getByText("培训室")).toBeInTheDocument();
  expect(within(stage).getByText("Training Room")).toBeInTheDocument();
  expect(screen.getByLabelText("office-entry-door")).toHaveAttribute("data-room-id", "training");
  expect(screen.getByLabelText("minimap-room-training")).toHaveAttribute("aria-current", "true");
});

test("links office door effects to scene runtime instead of recomputing them in the React shell", async () => {
  bridgeState.emittedRoomId = "training";
  bridgeState.doorRuntimeByCharacterState = {
    idle: {
      roomId: "training",
      activity: "idle",
      core: "active",
      runes: "online",
      threshold: "glowing",
      accentColor: 0x9fe3c4,
      fillColor: 0x183934,
      isActive: true
    },
    train: {
      roomId: "training",
      activity: "train",
      core: "scene-charged",
      runes: "accelerating",
      threshold: "pulsing",
      accentColor: 0x9fe3c4,
      fillColor: 0x183934,
      isActive: true
    }
  };

  render(createElement(OfficeRoute));

  await waitFor(() => {
    expect(screen.getByLabelText("office-entry-door")).toHaveAttribute("data-room-id", "training");
  });

  act(() => {
    useAppStore.setState((state) => ({
      ...state,
      character: {
        ...state.character,
        state: "train"
      }
    }));
  });

  expect(screen.getByLabelText("office-entry-door")).toHaveAttribute("data-door-activity", "train");
  expect(screen.getByLabelText("office-entry-door")).toHaveAttribute("data-door-runtime-source", "scene");
  expect(screen.getByLabelText("office-door-core")).toHaveAttribute("data-door-core-state", "scene-charged");
  expect(screen.getByLabelText("office-door-runes")).toHaveAttribute("data-rune-band", "accelerating");
  expect(screen.getByLabelText("office-door-threshold")).toHaveAttribute("data-threshold-state", "pulsing");
});

test("redirects away when office access requirements are not met", () => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "quiz",
    currentRoomId: null,
    result: null
  });

  render(
    <MemoryRouter initialEntries={["/office"]}>
      <Routes>
        <Route path="/office" element={<OfficeRoute />} />
        <Route path="/quiz" element={<h1>SBTI Quiz</h1>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.queryByTestId("office-scene-layout")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /sbti quiz/i })).toBeInTheDocument();
});
