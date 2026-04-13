import { expect, test, vi } from "vitest";

import { createWebchatAdapter } from "./WebchatAdapter";

test("includes room context in outgoing requests", () => {
  const adapter = createWebchatAdapter({ baseUrl: "http://127.0.0.1:18789" });

  const request = adapter.buildRequest("测试", { roomId: "meeting" });

  expect(request.context.roomId).toBe("meeting");
  expect(request.session).toBe("main");
});

test("uses the transport response text when sending messages", async () => {
  const transport = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ text: "已记录任务" })
  }));
  const adapter = createWebchatAdapter({
    baseUrl: "http://127.0.0.1:18789",
    transport
  });

  const reply = await adapter.sendMessage("安排一下会议纪要", { roomId: "meeting" });

  expect(transport).toHaveBeenCalledOnce();
  expect(reply.text).toBe("已记录任务");
});
