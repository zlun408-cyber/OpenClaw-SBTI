import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { HRPanel } from "./HRPanel";
import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import type { LocalMarkdownBinding } from "./hrDocumentSync";

const createAdapter = (source: "webchat" | "fallback") : OpenClawAdapter => ({
  buildRequest: (input, context) => ({
    session: "main",
    message: input,
    context: {
      roomId: context?.roomId ?? null,
      roomLabel: context?.roomLabel ?? null,
      characterName: context?.characterName ?? null,
      characterTitle: context?.characterTitle ?? null
    }
  }),
  sendMessage: vi.fn(async () => ({
    text: source === "webchat" ? "已由 OpenClaw 更新" : "fallback",
    source
  }))
});

test("renders dual editors for soul.md and memory.md", () => {
  render(<HRPanel adapter={createAdapter("webchat")} />);

  expect(screen.getByLabelText(/soul.md editor/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/memory.md editor/i)).toBeInTheDocument();
});

test("shows OpenClaw success state when remote sync succeeds", async () => {
  render(<HRPanel adapter={createAdapter("webchat")} />);

  fireEvent.change(screen.getByLabelText(/soul.md editor/i), {
    target: { value: "# Soul\ncalm" }
  });
  fireEvent.click(screen.getByRole("button", { name: /同步 soul.md/i }));

  expect(await screen.findByText(/OpenClaw 已同步 soul.md/i)).toBeInTheDocument();
});

test("writes locally after fallback when a file binding is available", async () => {
  const write = vi.fn(async () => undefined);
  const binding: LocalMarkdownBinding = {
    fileName: "memory.md",
    read: vi.fn(async () => "# Memory\nold"),
    write
  };
  const filePicker = vi.fn(async (expectedName: string) =>
    expectedName === "memory.md" ? binding : null
  );

  render(<HRPanel adapter={createAdapter("fallback")} filePicker={filePicker} />);

  fireEvent.click(screen.getByRole("button", { name: /绑定 memory.md/i }));
  expect(await screen.findByLabelText(/memory.md editor/i)).toHaveValue("# Memory\nold");

  fireEvent.change(screen.getByLabelText(/memory.md editor/i), {
    target: { value: "# Memory\nlikes tea" }
  });
  fireEvent.click(screen.getByRole("button", { name: /同步 memory.md/i }));

  expect(await screen.findByText(/已回退为本地写入 memory.md/i)).toBeInTheDocument();
  expect(write).toHaveBeenCalledWith("# Memory\nlikes tea");
});
