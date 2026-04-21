import { useAppStore } from "../../state/appStore";

import { HRPanel } from "./panels/HRPanel";
import { MeetingRoomPanel } from "./panels/MeetingRoomPanel";
import { RestPanel } from "./panels/RestPanel";
import { TrainingPanel } from "./panels/TrainingPanel";
import { RoomPanelShell } from "./RoomPanelShell";

export function RoomPanelHost() {
  const currentRoom = useAppStore((state) => state.currentRoomId);

  switch (currentRoom) {
    case "meeting":
      return (
        <RoomPanelShell roomId="meeting">
          <MeetingRoomPanel />
        </RoomPanelShell>
      );
    case "hr":
      return (
        <RoomPanelShell roomId="hr">
          <HRPanel />
        </RoomPanelShell>
      );
    case "training":
      return (
        <RoomPanelShell roomId="training">
          <TrainingPanel />
        </RoomPanelShell>
      );
    case "rest":
      return (
        <RoomPanelShell roomId="rest">
          <RestPanel />
        </RoomPanelShell>
      );
    default:
      return null;
  }
}
