import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import { RoomPanelHost } from "./RoomPanelHost";
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

test("shows the HR panel when the current room is hr", () => {
  useAppStore.setState({ currentRoomId: "hr" });

  render(<RoomPanelHost />);

  expect(screen.getByText(/soul/i)).toBeInTheDocument();
});
