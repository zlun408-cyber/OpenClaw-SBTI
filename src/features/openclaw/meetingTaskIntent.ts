import type { RoomId } from "../../types/domain";

const explicitCommandPattern = /^(新增任务|安排任务)[:：]\s*(.+)$/;
const naturalTaskSignalPattern = /(任务|安排|整理|汇总|分析|输出|撰写|准备|跟进|复盘|总结)/;

export function parseMeetingTaskIntent(input: string, roomId: RoomId | null) {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  const explicitMatch = normalized.match(explicitCommandPattern);
  if (explicitMatch) {
    return { title: explicitMatch[2].trim() };
  }

  if (roomId === "meeting" && (normalized.startsWith("帮我") || naturalTaskSignalPattern.test(normalized))) {
    return { title: normalized };
  }

  return null;
}
