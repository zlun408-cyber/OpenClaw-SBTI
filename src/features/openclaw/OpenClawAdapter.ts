import type { RoomId } from "../../types/domain";

export type OpenClawContext = {
  roomId?: RoomId | null;
  roomLabel?: string | null;
  characterName?: string | null;
  characterTitle?: string | null;
};

export type OpenClawRequest = {
  session: string;
  message: string;
  context: {
    roomId: RoomId | null;
    roomLabel: string | null;
    characterName: string | null;
    characterTitle: string | null;
  };
};

export type ChatReply = {
  text: string;
  source: "webchat" | "mock" | "fallback";
  embedUrl?: string;
};

export interface OpenClawAdapter {
  buildRequest(input: string, context?: OpenClawContext): OpenClawRequest;
  sendMessage(input: string, context?: OpenClawContext): Promise<ChatReply>;
  getEmbedUrl?(): string;
}

export const normalizeOpenClawContext = (
  context?: OpenClawContext
): OpenClawRequest["context"] => ({
  roomId: context?.roomId ?? null,
  roomLabel: context?.roomLabel ?? null,
  characterName: context?.characterName ?? null,
  characterTitle: context?.characterTitle ?? null
});
