import type { CSSProperties } from "react";

import type { RoomId } from "../../types/domain";

export type OfficeRoomAccent = {
  hex: string;
  rgba: string;
  softRgba: string;
};

export const OFFICE_THEME = {
  id: "digital-command-center",
  surface: {
    page: "radial-gradient(circle at 18% 16%, rgba(46, 146, 255, 0.18), transparent 24%), radial-gradient(circle at 78% 20%, rgba(105, 214, 255, 0.12), transparent 24%), linear-gradient(180deg, #07101A 0%, #0A1422 48%, #070B12 100%)",
    frame: "linear-gradient(180deg, rgba(14, 30, 47, 0.82) 0%, rgba(7, 12, 22, 0.76) 100%)",
    panel: "linear-gradient(180deg, rgba(10, 24, 38, 0.94) 0%, rgba(6, 11, 20, 0.92) 100%)",
    panelSoft: "rgba(105, 214, 255, 0.06)",
    input: "rgba(4, 12, 22, 0.9)"
  },
  border: {
    glass: "1px solid rgba(126, 218, 255, 0.18)",
    active: "1px solid rgba(240, 202, 135, 0.34)"
  },
  text: {
    primary: "#F3FAFF",
    secondary: "#9FC7D8",
    accent: "#F0CA87"
  },
  shadow: {
    panel: "0 30px 90px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
    glow: "0 0 36px rgba(105, 214, 255, 0.12)"
  },
  effects: {
    scanline: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 18%, transparent 100%), repeating-linear-gradient(90deg, rgba(105,214,255,0.045) 0 1px, transparent 1px 10px)",
    dataGrid: "linear-gradient(rgba(105,214,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(105,214,255,0.04) 1px, transparent 1px)"
  }
} as const;

export const OFFICE_ROOM_ACCENTS: Record<RoomId, OfficeRoomAccent> = {
  office: { hex: "#69D6FF", rgba: "rgba(105,214,255,0.58)", softRgba: "rgba(105,214,255,0.12)" },
  meeting: { hex: "#F0CA87", rgba: "rgba(240,202,135,0.58)", softRgba: "rgba(240,202,135,0.12)" },
  hr: { hex: "#D3B2F3", rgba: "rgba(211,178,243,0.58)", softRgba: "rgba(211,178,243,0.12)" },
  training: { hex: "#9FE3C4", rgba: "rgba(159,227,196,0.58)", softRgba: "rgba(159,227,196,0.12)" },
  rest: { hex: "#88C8FF", rgba: "rgba(136,200,255,0.52)", softRgba: "rgba(136,200,255,0.1)" }
};

export const getOfficeRoomAccent = (roomId: RoomId | null): OfficeRoomAccent =>
  OFFICE_ROOM_ACCENTS[roomId ?? "office"];

export const getOfficeRoomTheme = (roomId: RoomId | null) => ({
  themeId: OFFICE_THEME.id,
  roomId: roomId ?? "office",
  accent: getOfficeRoomAccent(roomId)
});

export const createGlassTerminalStyle = (
  roomId: RoomId | null,
  overrides: CSSProperties = {}
): CSSProperties => {
  const roomTheme = getOfficeRoomTheme(roomId);

  return {
    border: OFFICE_THEME.border.glass,
    background: OFFICE_THEME.surface.panel,
    color: OFFICE_THEME.text.primary,
    boxShadow: `${OFFICE_THEME.shadow.panel}, 0 0 48px ${roomTheme.accent.softRgba}`,
    backdropFilter: "blur(16px)",
    ...overrides
  };
};
