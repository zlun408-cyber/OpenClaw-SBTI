import { Navigate } from "react-router-dom";
import { useCallback } from "react";

import { GameCanvas } from "../../game/GameCanvas";
import { useAppStore } from "../../state/appStore";
import { OfficeHUD } from "./OfficeHUD";
import { RoomPanelHost } from "./RoomPanelHost";
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
    <>
      <GameCanvas onRoomChanged={handleRoomChanged} />
      <OfficeHUD />
      <RoomPanelHost />
    </>
  );
}
