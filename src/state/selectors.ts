import type { AppState } from "./appStore";
import { ROOM_CONTEXTS } from "../types/domain";

export const selectCurrentRoomContext = (state: AppState) =>
  state.currentRoomId ? ROOM_CONTEXTS[state.currentRoomId] : null;

export const selectCharacterLabel = (state: AppState) =>
  state.character.customName || state.character.title;
