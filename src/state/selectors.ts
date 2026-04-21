import type { AppState } from "./appStore";
import { ROOM_CONTEXTS } from "../types/domain";
import { getCharacterConfig } from "../game/data/characterRegistry";

export const selectCurrentRoomContext = (state: AppState) =>
  state.currentRoomId ? ROOM_CONTEXTS[state.currentRoomId] : null;

export const selectCharacterLabel = (state: AppState) =>
  state.character.customName || state.character.title;

export const selectCurrentPersonaConfig = (state: AppState) =>
  state.result ? getCharacterConfig(state.result.code) : null;

export const selectCurrentPersonaAssetKey = (state: AppState) =>
  selectCurrentPersonaConfig(state)?.assetKey ?? null;
