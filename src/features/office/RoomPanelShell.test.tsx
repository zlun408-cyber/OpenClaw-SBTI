import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { RoomPanelShell } from "./RoomPanelShell";

test("wraps room panel content in the shared office terminal shell", () => {
  render(
    <RoomPanelShell roomId="meeting">
      <div>Panel body</div>
    </RoomPanelShell>
  );

  const shell = screen.getByLabelText("office-room-terminal");
  expect(shell).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(shell).toHaveAttribute("data-office-room", "meeting");
  expect(screen.getByText("Panel body")).toBeInTheDocument();
});
