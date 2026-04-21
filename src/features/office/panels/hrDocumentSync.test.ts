import { expect, test, vi } from "vitest";

import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import { buildHrSyncInstruction, syncHrDocument } from "./hrDocumentSync";

const createAdapter = (source: "webchat" | "fallback"): OpenClawAdapter => ({
  buildRequest: (input) => ({
    session: "main",
    message: input,
    context: {
      roomId: "hr",
      roomLabel: "人事部",
      characterName: null,
      characterTitle: null
    }
  }),
  sendMessage: vi.fn(async () => ({
    text: source === "webchat" ? "soul.md 已更新" : "fallback",
    source
  }))
});

test("builds a structured OpenClaw update instruction for soul.md", () => {
  expect(buildHrSyncInstruction("soul", "# Soul\ncalm")).toContain("soul.md");
  expect(buildHrSyncInstruction("soul", "# Soul\ncalm")).toContain("# Soul");
});

test("prefers OpenClaw sync when the adapter reports success", async () => {
  const adapter = createAdapter("webchat");
  const write = vi.fn();

  const result = await syncHrDocument({
    kind: "soul",
    content: "# Soul\ncalm",
    adapter,
    fileBinding: {
      fileName: "soul.md",
      read: vi.fn(async () => ""),
      write
    }
  });

  expect(result.channel).toBe("openclaw");
  expect(write).not.toHaveBeenCalled();
});

test("falls back to local file write when OpenClaw cannot sync", async () => {
  const adapter = createAdapter("fallback");
  const write = vi.fn(async () => undefined);

  const result = await syncHrDocument({
    kind: "memory",
    content: "# Memory\nlikes tea",
    adapter,
    fileBinding: {
      fileName: "memory.md",
      read: vi.fn(async () => ""),
      write
    }
  });

  expect(result.channel).toBe("local");
  expect(write).toHaveBeenCalledWith("# Memory\nlikes tea");
});
