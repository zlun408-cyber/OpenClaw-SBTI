import type { OpenClawAdapter } from "./OpenClawAdapter";
import { normalizeOpenClawContext } from "./OpenClawAdapter";

export function createMockAdapter(): OpenClawAdapter {
  return {
    buildRequest(input, context) {
      return {
        session: "main",
        message: input,
        context: normalizeOpenClawContext(context)
      };
    },
    async sendMessage(input, context) {
      const normalizedContext = normalizeOpenClawContext(context);
      const roomFragment = normalizedContext.roomLabel ?? normalizedContext.roomId ?? "office";

      return {
        text: `mock:${roomFragment}:${input}`,
        source: "mock"
      };
    }
  };
}
