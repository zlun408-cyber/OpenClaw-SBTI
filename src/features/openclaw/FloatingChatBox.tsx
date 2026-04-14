import { useMemo, useState } from "react";

import { parseMeetingTaskIntent } from "./meetingTaskIntent";
import { createWebchatAdapter } from "./WebchatAdapter";
import { useAppStore } from "../../state/appStore";
import { selectCharacterLabel, selectCurrentRoomContext } from "../../state/selectors";
import type { OpenClawAdapter } from "./OpenClawAdapter";
import type { RoomId } from "../../types/domain";

type FloatingChatBoxProps = {
  adapter?: OpenClawAdapter;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const DEFAULT_ADAPTER = createWebchatAdapter({
  baseUrl: import.meta.env.VITE_OPENCLAW_BASE_URL ?? "http://127.0.0.1:18789",
  session: import.meta.env.VITE_OPENCLAW_SESSION ?? "main"
});

const PLACEHOLDERS: Record<RoomId | "default", string> = {
  office: "和 OpenClaw 对话",
  meeting: "给数字员工分配任务",
  hr: "更新 soul 或 memory",
  training: "安装 skill 或查看培训方案",
  rest: "安排休息或轻松聊聊",
  default: "和 OpenClaw 对话"
};

const ROOM_HINTS: Record<RoomId | "default", string> = {
  office: "工作状态、指令反馈、日常协同都在这里进行。",
  meeting: "会议室适合布置任务、领取任务、提交任务结果。",
  hr: "人事部可以聚焦 soul、memory 等数字人格维护。",
  training: "培训室适合安装 skill、查看培训安排与能力成长。",
  rest: "休息间适合低打扰陪伴、喝茶、睡觉或跳舞放松。",
  default: "你可以直接和本地 OpenClaw 对话。"
};

const boxStyle = {
  position: "fixed",
  right: "24px",
  bottom: "24px",
  width: "360px",
  minHeight: "340px",
  display: "grid",
  gridTemplateRows: "auto auto 1fr auto auto",
  gap: "12px",
  padding: "16px",
  borderRadius: "22px",
  border: "1px solid rgba(240, 213, 150, 0.28)",
  background:
    "linear-gradient(180deg, rgba(12, 18, 31, 0.96) 0%, rgba(8, 12, 22, 0.92) 100%)",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.42)",
  color: "#F8F2E8",
  zIndex: 40,
  backdropFilter: "blur(14px)"
} satisfies React.CSSProperties;

const subtleTextStyle = {
  color: "#D8C9A3",
  fontSize: "12px",
  lineHeight: 1.5
} satisfies React.CSSProperties;

const messageListStyle = {
  display: "grid",
  gap: "10px",
  maxHeight: "180px",
  overflowY: "auto",
  paddingRight: "4px"
} satisfies React.CSSProperties;

const inputStyle = {
  width: "100%",
  borderRadius: "14px",
  border: "1px solid rgba(240, 213, 150, 0.2)",
  background: "rgba(17, 24, 39, 0.9)",
  color: "#FFF8E8",
  padding: "12px 14px",
  outline: "none"
} satisfies React.CSSProperties;

const buttonStyle = {
  borderRadius: "14px",
  border: "1px solid rgba(250, 209, 122, 0.45)",
  background: "linear-gradient(180deg, #6E5431 0%, #4A351D 100%)",
  color: "#FFF5DD",
  padding: "10px 14px",
  cursor: "pointer"
} satisfies React.CSSProperties;

const linkStyle = {
  color: "#F7D48B",
  textDecoration: "none",
  fontSize: "12px"
} satisfies React.CSSProperties;

const createInitialMessage = (roomLabel: string | null, characterName: string): ChatMessage => ({
  id: "assistant-welcome",
  role: "assistant",
  text: `已连接本地 OpenClaw。当前关注区域：${roomLabel ?? "办公室"}。${characterName} 可以随时接收指令。`
});

const resolvePlaceholder = (roomId: RoomId | null) =>
  (roomId ? PLACEHOLDERS[roomId] : PLACEHOLDERS.default) ?? PLACEHOLDERS.default;

const resolveRoomHint = (roomId: RoomId | null) =>
  (roomId ? ROOM_HINTS[roomId] : ROOM_HINTS.default) ?? ROOM_HINTS.default;

export function FloatingChatBox({ adapter = DEFAULT_ADAPTER }: FloatingChatBoxProps) {
  const roomContext = useAppStore(selectCurrentRoomContext);
  const characterName = useAppStore(selectCharacterLabel);
  const currentRoomId = useAppStore((state) => state.currentRoomId);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createInitialMessage(roomContext?.label ?? null, characterName)
  ]);

  const placeholder = useMemo(
    () => resolvePlaceholder(currentRoomId),
    [currentRoomId]
  );
  const roomHint = useMemo(() => resolveRoomHint(currentRoomId), [currentRoomId]);
  const embedUrl = adapter.getEmbedUrl?.();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = draft.trim();
    if (!input || isSending) {
      return;
    }

    setDraft("");
    setIsSending(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: input
      }
    ]);

    const taskIntent = parseMeetingTaskIntent(input, currentRoomId);

    if (taskIntent) {
      const createdTask = useAppStore.getState().createMeetingTask({
        title: taskIntent.title,
        description: currentRoomId === "meeting" ? "来自会议室对话创建" : "来自对话快捷创建",
        source: "chat"
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: `已创建会议任务《${createdTask.title}》，已同步到会议室任务板。`
        }
      ]);
      setIsSending(false);
      return;
    }

    try {
      const reply = await adapter.sendMessage(input, {
        roomId: currentRoomId,
        roomLabel: roomContext?.label ?? null,
        characterName,
        characterTitle: useAppStore.getState().character.title
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: reply.text
        }
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "OpenClaw 暂时没有返回结果，请稍后重试或打开本地 Webchat。"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section aria-label="openclaw-chat" style={boxStyle}>
      <div>
        <div
          style={{
            color: "#F7D48B",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}
        >
          OpenClaw Link
        </div>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#FFF8E8" }}>右下角常驻对话框</h2>
      </div>

      <div style={subtleTextStyle}>
        <div>当前房间：{roomContext?.label ?? "办公室"}</div>
        <div>默认对象：{characterName}</div>
      </div>

      <div style={messageListStyle}>
        {messages.map((message) => (
          <article
            key={message.id}
            style={{
              justifySelf: message.role === "user" ? "end" : "stretch",
              maxWidth: "100%",
              borderRadius: "16px",
              padding: "10px 12px",
              background:
                message.role === "user"
                  ? "linear-gradient(180deg, rgba(95, 59, 26, 0.92) 0%, rgba(67, 38, 17, 0.92) 100%)"
                  : "rgba(255, 248, 232, 0.08)",
              color: "#FFF8E8",
              border:
                message.role === "user"
                  ? "1px solid rgba(247, 212, 139, 0.35)"
                  : "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            {message.text}
          </article>
        ))}
      </div>

      <div style={subtleTextStyle}>{roomHint}</div>

      <form aria-label="openclaw composer" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px" }}>
          <input
            aria-label="openclaw input"
            disabled={isSending}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            style={inputStyle}
            value={draft}
          />
          <button disabled={isSending} style={buttonStyle} type="submit">
            {isSending ? "发送中" : "发送"}
          </button>
        </div>
      </form>

      {embedUrl ? (
        <a href={embedUrl} rel="noreferrer" style={linkStyle} target="_blank">
          打开本地 Webchat
        </a>
      ) : null}
    </section>
  );
}
