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

  expect(screen.getByLabelText(/soul.md editor/i)).toBeInTheDocument();
});

test("shows the meeting panel when the current room is meeting", () => {
  useAppStore.setState({ currentRoomId: "meeting" });

  render(<RoomPanelHost />);

  expect(
    screen.getByRole("heading", { name: /meeting room/i })
  ).toBeInTheDocument();
});

test("wraps active room panels in the shared terminal shell", () => {
  useAppStore.setState({ currentRoomId: "meeting" });

  render(<RoomPanelHost />);

  const shell = screen.getByLabelText("office-room-terminal");
  expect(shell).toHaveAttribute("data-office-room", "meeting");
  expect(
    screen.getByRole("heading", { name: /meeting room/i })
  ).toBeInTheDocument();
});

test("shows the training panel when the current room is training", () => {
  useAppStore.setState({ currentRoomId: "training" });

  render(<RoomPanelHost />);

  expect(
    screen.getByRole("heading", { name: /training room/i })
  ).toBeInTheDocument();
});

test("shows the rest panel when the current room is rest", () => {
  useAppStore.setState({ currentRoomId: "rest" });

  render(<RoomPanelHost />);

  expect(screen.getByRole("heading", { name: /rest area/i })).toBeInTheDocument();
});

test("renders nothing when the current room is office", () => {
  useAppStore.setState({ currentRoomId: "office" });

  const { container } = render(<RoomPanelHost />);

  expect(container).toBeEmptyDOMElement();
});

test("renders nothing when no room is active", () => {
  useAppStore.setState({ currentRoomId: null });

  const { container } = render(<RoomPanelHost />);

  expect(container).toBeEmptyDOMElement();
});
