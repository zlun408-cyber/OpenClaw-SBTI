import type {
  ChatReply,
  OpenClawAdapter,
  OpenClawContext,
  OpenClawRequest
} from "./OpenClawAdapter";
import { normalizeOpenClawContext } from "./OpenClawAdapter";

type TransportResponse = {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type Transport = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  }
) => Promise<TransportResponse>;

type CreateWebchatAdapterConfig = {
  baseUrl: string;
  session?: string;
  endpoint?: string;
  transport?: Transport;
};

const DEFAULT_SESSION = "main";
const DEFAULT_ENDPOINT = "/api/chat";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const createFallbackReply = (
  request: OpenClawRequest,
  embedUrl: string,
  reason?: string
): ChatReply => {
  const roomFragment = request.context.roomLabel ?? request.context.roomId ?? "当前场景";
  const reasonFragment = reason ? `（${reason}）` : "";

  return {
    text: `OpenClaw 本地 Webchat 已定位到 ${roomFragment}${reasonFragment}。当前壳层已记录你的输入，但未拿到可直连的聊天 API；可先点击“打开本地 Webchat”继续在 session ${request.session} 中对话。`,
    source: "fallback",
    embedUrl
  };
};

const extractReplyText = (payload: unknown): string | null => {
  if (typeof payload === "string") {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "text" in payload &&
    typeof payload.text === "string"
  ) {
    return payload.text;
  }

  return null;
};

const createFetchTransport = (): Transport | null => {
  if (typeof fetch !== "function") {
    return null;
  }

  return async (url, init) => {
    const response = await fetch(url, {
      method: init.method,
      headers: init.headers,
      body: init.body
    });

    return {
      ok: response.ok,
      status: response.status,
      json: async () => response.json(),
      text: async () => response.text()
    };
  };
};

export function createWebchatAdapter({
  baseUrl,
  session = DEFAULT_SESSION,
  endpoint = DEFAULT_ENDPOINT,
  transport = createFetchTransport() ?? undefined
}: CreateWebchatAdapterConfig): OpenClawAdapter {
  const normalizedBaseUrl = stripTrailingSlash(baseUrl);
  const buildRequest = (input: string, context?: OpenClawContext): OpenClawRequest => ({
    session,
    message: input,
    context: normalizeOpenClawContext(context)
  });
  const getEmbedUrl = () =>
    `${normalizedBaseUrl}/chat?session=${encodeURIComponent(session)}`;

  return {
    buildRequest,
    getEmbedUrl,
    async sendMessage(input, context) {
      const request = buildRequest(input, context);
      const embedUrl = getEmbedUrl();

      if (!transport) {
        return createFallbackReply(request, embedUrl);
      }

      try {
        const response = await transport(`${normalizedBaseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          return createFallbackReply(request, embedUrl, `HTTP ${response.status}`);
        }

        const payload = response.json
          ? await response.json()
          : response.text
            ? await response.text()
            : null;
        const text = extractReplyText(payload);

        if (!text) {
          return createFallbackReply(request, embedUrl, "empty response");
        }

        return {
          text,
          source: "webchat",
          embedUrl
        };
      } catch {
        return createFallbackReply(request, embedUrl, "network unavailable");
      }
    }
  };
}
