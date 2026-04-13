import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
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
