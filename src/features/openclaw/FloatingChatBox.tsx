import { useMemo, useState } from "react";

import { parseMeetingTaskIntent } from "./meetingTaskIntent";
import { parseTrainingSkillIntent } from "./trainingSkillIntent";
import { parseRestIntent } from "./restIntent";
import { defaultOpenClawAdapter } from "./defaultAdapter";
import { createGlassTerminalStyle, getOfficeRoomTheme, OFFICE_THEME } from "../office/officeTheme";
import { useAppStore } from "../../state/appStore";
import { selectCharacterLabel, selectCurrentRoomContext } from "../../state/selectors";
import type { OpenClawAdapter } from "./OpenClawAdapter";
import type { RestActivityType, RoomId } from "../../types/domain";

type FloatingChatBoxProps = {
  adapter?: OpenClawAdapter;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const PLACEHOLDERS: Record<RoomId | "default", string> = {
  office: "和 OpenClaw 对话",
  meeting: "给数字员工分配任务",
  hr: "更新 soul 或 memory",
  training: "安装 skill 或查看培训方案",
  rest: "安排休息或轻松聊聊",
  default: "和 OpenClaw 对话"
};

const REST_ACTIVITY_REPLY_LABELS: Record<RestActivityType, string> = {
  tea: "喝茶",
  sleep: "睡觉",
  dance: "跳舞"
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
  backdropFilter: "blur(14px)",
  pointerEvents: "none"
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
  outline: "none",
  pointerEvents: "auto"
} satisfies React.CSSProperties;

const buttonStyle = {
  borderRadius: "14px",
  border: "1px solid rgba(250, 209, 122, 0.45)",
  background: "linear-gradient(180deg, #6E5431 0%, #4A351D 100%)",
  color: "#FFF5DD",
  padding: "10px 14px",
  cursor: "pointer",
  pointerEvents: "auto"
} satisfies React.CSSProperties;

const linkStyle = {
  color: "#F7D48B",
  textDecoration: "none",
  fontSize: "12px",
  pointerEvents: "auto"
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

export function FloatingChatBox({ adapter = defaultOpenClawAdapter }: FloatingChatBoxProps) {
  const roomContext = useAppStore(selectCurrentRoomContext);
  const characterName = useAppStore(selectCharacterLabel);
  const currentRoomId = useAppStore((state) => state.currentRoomId);
  const roomTheme = getOfficeRoomTheme(currentRoomId);
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
  const themedBoxStyle = {
    ...createGlassTerminalStyle(currentRoomId, boxStyle),
    border: `1px solid ${roomTheme.accent.rgba}`,
    pointerEvents: "none"
  } satisfies React.CSSProperties;
  const themedInputStyle = {
    ...inputStyle,
    border: `1px solid ${roomTheme.accent.softRgba}`,
    background: OFFICE_THEME.surface.input,
    color: OFFICE_THEME.text.primary
  } satisfies React.CSSProperties;
  const themedButtonStyle = {
    ...buttonStyle,
    border: `1px solid ${roomTheme.accent.rgba}`,
    background: `linear-gradient(180deg, ${roomTheme.accent.softRgba} 0%, rgba(6, 11, 20, 0.96) 100%)`,
    color: OFFICE_THEME.text.accent
  } satisfies React.CSSProperties;
  const themedLinkStyle = {
    ...linkStyle,
    color: OFFICE_THEME.text.accent
  } satisfies React.CSSProperties;

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

    const restIntent = parseRestIntent(input, currentRoomId);

    if (restIntent) {
      useAppStore.getState().beginRestActivity(restIntent.activity, "chat", "来自休息间对话");
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: `已切换到${REST_ACTIVITY_REPLY_LABELS[restIntent.activity]}状态，数字员工正在休息间放松。`
        }
      ]);
      setIsSending(false);
      return;
    }

    const skillIntent = parseTrainingSkillIntent(input, currentRoomId);

    if (skillIntent) {
      const createdSkill = useAppStore.getState().createTrainingSkill({
        name: skillIntent.skillName,
        description: currentRoomId === "training" ? "来自培训室对话创建" : "来自对话快捷安装",
        source: "chat"
      });
      useAppStore.getState().beginTrainingSkillInstall(createdSkill.id);

      const reply = await adapter.sendMessage(`请安装训练技能：${createdSkill.name}`, {
        roomId: currentRoomId,
        roomLabel: roomContext?.label ?? null,
        characterName,
        characterTitle: useAppStore.getState().character.title
      });

      const installChannel = reply.source === "webchat" ? "openclaw" : "local";
      useAppStore.getState().completeTrainingSkillInstall(createdSkill.id, installChannel);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: `已安装训练技能《${createdSkill.name}》，当前通道：${installChannel === "openclaw" ? "OpenClaw" : "本地回退"}。`
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
    <section
      aria-label="openclaw-chat"
      data-office-theme={OFFICE_THEME.id}
      data-office-room={roomTheme.roomId}
      style={themedBoxStyle}
    >
      <div>
        <div
          style={{
            color: OFFICE_THEME.text.accent,
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}
        >
          OpenClaw Link
        </div>
        <h2 style={{ margin: 0, fontSize: "20px", color: OFFICE_THEME.text.primary }}>右下角常驻对话框</h2>
      </div>

      <div style={{ ...subtleTextStyle, color: OFFICE_THEME.text.secondary }}>
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
                  ? `linear-gradient(180deg, ${roomTheme.accent.softRgba} 0%, rgba(6, 11, 20, 0.94) 100%)`
                  : "rgba(255, 248, 232, 0.08)",
              color: OFFICE_THEME.text.primary,
              border:
                message.role === "user"
                  ? `1px solid ${roomTheme.accent.rgba}`
                  : "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            {message.text}
          </article>
        ))}
      </div>

      <div style={{ ...subtleTextStyle, color: OFFICE_THEME.text.secondary }}>{roomHint}</div>

      <form aria-label="openclaw composer" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px" }}>
          <input
            aria-label="openclaw input"
            disabled={isSending}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            style={themedInputStyle}
            value={draft}
          />
          <button disabled={isSending} style={themedButtonStyle} type="submit">
            {isSending ? "发送中" : "发送"}
          </button>
        </div>
      </form>

      {embedUrl ? (
        <a href={embedUrl} rel="noreferrer" style={themedLinkStyle} target="_blank">
          打开本地 Webchat
        </a>
      ) : null}
    </section>
  );
}
