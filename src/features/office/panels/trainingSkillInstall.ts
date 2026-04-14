import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";

export async function installTrainingSkill({
  adapter,
  skillName
}: {
  adapter: OpenClawAdapter;
  skillName: string;
}) {
  const reply = await adapter.sendMessage(`请安装训练技能：${skillName}`, {
    roomId: "training",
    roomLabel: "培训室"
  });

  if (reply.source === "webchat") {
    return {
      channel: "openclaw" as const,
      message: `Installed via OpenClaw: ${skillName}`
    };
  }

  return {
    channel: "local" as const,
    message: `Installed via local fallback: ${skillName}`
  };
}
