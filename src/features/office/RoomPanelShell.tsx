import type { PropsWithChildren } from "react";

import type { RoomId } from "../../types/domain";
import { createGlassTerminalStyle, getOfficeRoomTheme, OFFICE_THEME } from "./officeTheme";

type RoomPanelShellProps = PropsWithChildren<{
  roomId: Exclude<RoomId, "office">;
}>;

const shellStyle = {
  position: "relative",
  padding: "10px",
  borderRadius: "30px",
  overflow: "hidden"
} satisfies React.CSSProperties;

const scanlineStyle = {
  position: "absolute",
  inset: 0,
  opacity: 0.36,
  pointerEvents: "none",
  mixBlendMode: "screen"
} satisfies React.CSSProperties;

const contentStyle = {
  position: "relative",
  zIndex: 1
} satisfies React.CSSProperties;

export function RoomPanelShell({ roomId, children }: RoomPanelShellProps) {
  const roomTheme = getOfficeRoomTheme(roomId);

  return (
    <div
      aria-label="office-room-terminal"
      data-office-theme={OFFICE_THEME.id}
      data-office-room={roomTheme.roomId}
      style={createGlassTerminalStyle(roomId, shellStyle)}
    >
      <div
        aria-hidden="true"
        style={{ ...scanlineStyle, background: OFFICE_THEME.effects.scanline }}
      />
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
