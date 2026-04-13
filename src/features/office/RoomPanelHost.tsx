import { useAppStore } from "../../state/appStore";

import { HRPanel } from "./panels/HRPanel";
import { MeetingRoomPanel } from "./panels/MeetingRoomPanel";
import { RestPanel } from "./panels/RestPanel";
import { TrainingPanel } from "./panels/TrainingPanel";

export function RoomPanelHost() {
  const currentRoom = useAppStore((state) => state.currentRoomId);

  switch (currentRoom) {
    case "meeting":
      return <MeetingRoomPanel />;
    case "hr":
      return <HRPanel />;
    case "training":
      return <TrainingPanel />;
    case "rest":
      return <RestPanel />;
    default:
      return null;
  }
}
