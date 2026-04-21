import type { RoomId } from "../../types/domain";

const explicitSkillPattern = /^安装\s*skill[:：]\s*(.+)$/i;
const naturalSkillPattern = /(安装|增加|新增).*(skill|能力)/i;

export function parseTrainingSkillIntent(input: string, roomId: RoomId | null) {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  const explicitMatch = normalized.match(explicitSkillPattern);
  if (explicitMatch) {
    return { skillName: explicitMatch[1].trim() };
  }

  if (roomId === "training" && naturalSkillPattern.test(normalized)) {
    return { skillName: normalized };
  }

  return null;
}
