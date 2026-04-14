import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";

export type HrDocumentKind = "soul" | "memory";

export type LocalMarkdownBinding = {
  fileName: string;
  read: () => Promise<string>;
  write: (content: string) => Promise<void>;
};

export function buildHrSyncInstruction(kind: HrDocumentKind, content: string) {
  const fileName = `${kind}.md`;
  return [
    `请更新本地文件 ${fileName}。`,
    "用下面这份完整 markdown 内容覆盖原文件：",
    "```md",
    content.trim(),
    "```"
  ].join("\n");
}

type SyncHrDocumentInput = {
  kind: HrDocumentKind;
  content: string;
  adapter: OpenClawAdapter;
  fileBinding?: LocalMarkdownBinding | null;
};

export async function syncHrDocument({ kind, content, adapter, fileBinding }: SyncHrDocumentInput) {
  const reply = await adapter.sendMessage(buildHrSyncInstruction(kind, content), {
    roomId: "hr",
    roomLabel: "人事部"
  });

  if (reply.source === "webchat") {
    return {
      channel: "openclaw" as const,
      message: `OpenClaw 已同步 ${kind}.md`
    };
  }

  if (fileBinding) {
    await fileBinding.write(content);
    return {
      channel: "local" as const,
      message: `已回退为本地写入 ${fileBinding.fileName}`
    };
  }

  return {
    channel: "unavailable" as const,
    message: `OpenClaw 当前无法直接同步 ${kind}.md，请先绑定本地文件。`
  };
}

type FileWithWritable = FileSystemFileHandle & {
  createWritable: () => Promise<{
    write: (content: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

declare global {
  interface Window {
    showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>;
  }
}

export async function pickMarkdownBinding(expectedName: string): Promise<LocalMarkdownBinding | null> {
  if (typeof window === "undefined" || typeof window.showOpenFilePicker !== "function") {
    return null;
  }

  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    excludeAcceptAllOption: false,
    types: [
      {
        description: "Markdown Files",
        accept: { "text/markdown": [".md"], "text/plain": [".md"] }
      }
    ]
  });

  if (!handle) {
    return null;
  }

  const fileHandle = handle as FileWithWritable;
  const file = await fileHandle.getFile();

  return {
    fileName: file.name || expectedName,
    read: async () => file.text(),
    write: async (nextContent: string) => {
      const writable = await fileHandle.createWritable();
      await writable.write(nextContent);
      await writable.close();
    }
  };
}
