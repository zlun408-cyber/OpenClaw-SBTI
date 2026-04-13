import type { AppState } from "./appStore";

export const selectCurrentRoomContext = (state: AppState) =>
  state.rooms[state.currentRoomId];

export const selectCharacterLabel = (state: AppState) =>
  state.character.customName || state.character.title;
