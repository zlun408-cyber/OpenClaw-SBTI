import type { AppState } from "./appStore";
import { ROOM_CONTEXTS } from "../types/domain";

export const selectCurrentRoomContext = (state: AppState) =>
  ROOM_CONTEXTS[state.currentRoomId];

export const selectCharacterLabel = (state: AppState) =>
  state.character.customName || state.character.title;
