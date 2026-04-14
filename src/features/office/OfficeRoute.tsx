import { Navigate } from "react-router-dom";
import { useCallback } from "react";

import { GameCanvas } from "../../game/GameCanvas";
import { useAppStore } from "../../state/appStore";
import { OfficeHUD } from "./OfficeHUD";
import { RoomPanelHost } from "./RoomPanelHost";
import { FloatingChatBox } from "../openclaw/FloatingChatBox";
import type { RoomId } from "../../types/domain";

const layoutStyle = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 20% 18%, rgba(127, 96, 190, 0.18), transparent 24%), radial-gradient(circle at 78% 24%, rgba(72, 139, 198, 0.16), transparent 24%), linear-gradient(180deg, #090E18 0%, #0D1524 42%, #0A0F18 100%)"
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
  border: "1px solid rgba(247, 212, 139, 0.12)",
  background: "linear-gradient(180deg, rgba(20, 27, 43, 0.72) 0%, rgba(10, 14, 24, 0.64) 100%)",
  boxShadow: "0 40px 120px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255,255,255,0.05)"
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
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "inset 0 0 120px rgba(138, 108, 72, 0.08)",
  pointerEvents: "none"
} satisfies React.CSSProperties;

const titleRibbonStyle = {
  position: "absolute",
  left: "50%",
  top: "22px",
  transform: "translateX(-50%)",
  padding: "10px 18px",
  borderRadius: "999px",
  border: "1px solid rgba(247,212,139,0.18)",
  background: "linear-gradient(180deg, rgba(31, 42, 67, 0.88) 0%, rgba(15, 21, 33, 0.82) 100%)",
  color: "#F7E7C1",
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
    <section aria-label="office-scene-layout" data-testid="office-scene-layout" style={layoutStyle}>
      <div aria-label="office-scene-canvas-layer" style={canvasLayerStyle}>
        <div style={canvasFrameStyle}>
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
