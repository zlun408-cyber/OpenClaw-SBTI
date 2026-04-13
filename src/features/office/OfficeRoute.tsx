import { Navigate } from "react-router-dom";
import { useCallback } from "react";

import { GameCanvas } from "../../game/GameCanvas";
import { useAppStore } from "../../state/appStore";
import { OfficeHUD } from "./OfficeHUD";
import { RoomPanelHost } from "./RoomPanelHost";
import { FloatingChatBox } from "../openclaw/FloatingChatBox";
import type { RoomId } from "../../types/domain";

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
    <section aria-label="office-scene-layout" data-testid="office-scene-layout">
      <div aria-label="office-scene-canvas-layer">
        <GameCanvas onRoomChanged={handleRoomChanged} />
      </div>
      <div aria-label="office-scene-overlay-layer">
        <OfficeHUD />
        <RoomPanelHost />
        <FloatingChatBox />
      </div>
    </section>
  );
}
