import { Navigate } from "react-router-dom";
import { useCallback } from "react";

import { GameCanvas } from "../../game/GameCanvas";
import { useAppStore } from "../../state/appStore";
import { OfficeHUD } from "./OfficeHUD";
import { RoomPanelHost } from "./RoomPanelHost";
import { FloatingChatBox } from "../openclaw/FloatingChatBox";
import type { RoomId } from "../../types/domain";
import { OFFICE_THEME } from "./officeTheme";

const layoutStyle = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  background: OFFICE_THEME.surface.page
} satisfies React.CSSProperties;

const routeDataGridStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage: OFFICE_THEME.effects.dataGrid,
  backgroundSize: "44px 44px",
  opacity: 0.42,
  maskImage: "radial-gradient(circle at 50% 28%, rgba(0,0,0,0.85), transparent 72%)"
} satisfies React.CSSProperties;

const canvasLayerStyle = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  placeItems: "center",
  padding: "28px 24px 80px"
} satisfies React.CSSProperties;

const canvasFrameStyle = {
  position: "relative",
  width: "fit-content",
  padding: "18px",
  borderRadius: "32px",
  border: OFFICE_THEME.border.glass,
  background: OFFICE_THEME.surface.frame,
  boxShadow: OFFICE_THEME.shadow.panel
} satisfies React.CSSProperties;

const overlayLayerStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none"
} satisfies React.CSSProperties;

const panelHostStyle = {
  position: "absolute",
  top: "92px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 3,
  pointerEvents: "auto"
} satisfies React.CSSProperties;

const ambientFrameStyle = {
  position: "absolute",
  inset: "18px",
  borderRadius: "30px",
  border: OFFICE_THEME.border.glass,
  boxShadow: OFFICE_THEME.shadow.glow,
  pointerEvents: "none"
} satisfies React.CSSProperties;

const titleRibbonStyle = {
  position: "absolute",
  left: "50%",
  top: "22px",
  transform: "translateX(-50%)",
  padding: "10px 18px",
  borderRadius: "999px",
  border: OFFICE_THEME.border.glass,
  background: OFFICE_THEME.surface.frame,
  color: OFFICE_THEME.text.accent,
  fontSize: "12px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  pointerEvents: "none"
} satisfies React.CSSProperties;

export function OfficeRoute() {
  const canEnterOffice = useAppStore(
    (state) =>
      state.result !== null &&
      state.character.title === state.result.title &&
      state.phase === "office"
  );
  const handleRoomChanged = useCallback((roomId: RoomId | null) => {
    useAppStore.setState((state) =>
      state.currentRoomId === roomId
        ? state
        : {
            ...state,
            currentRoomId: roomId
          }
    );
  }, []);

  if (!canEnterOffice) {
    return <Navigate to="/quiz" replace />;
  }

  return (
    <section
      aria-label="office-scene-layout"
      data-testid="office-scene-layout"
      data-office-theme={OFFICE_THEME.id}
      style={layoutStyle}
    >
      <div aria-hidden="true" data-testid="office-route-grid" style={routeDataGridStyle} />
      <div aria-label="office-scene-canvas-layer" style={canvasLayerStyle}>
        <div aria-label="office-observation-window" style={canvasFrameStyle}>
          <div style={ambientFrameStyle} />
          <div style={titleRibbonStyle}>SBTI Digital Office</div>
          <GameCanvas onRoomChanged={handleRoomChanged} />
        </div>
      </div>
      <div aria-label="office-scene-overlay-layer" style={overlayLayerStyle}>
        <OfficeHUD />
        <div style={panelHostStyle}>
          <RoomPanelHost />
        </div>
        <FloatingChatBox />
      </div>
    </section>
  );
}
