import type {
  TrainingSkill,
  TrainingSkillInstallChannel,
  TrainingSkillSource,
  TrainingSkillStatus
} from "../../../types/domain";

let trainingSkillCounter = 0;
const nextTrainingSkillId = () => `training-skill-${String(trainingSkillCounter++).padStart(3, "0")}`;

const presetSkillBlueprints: Array<{
  name: string;
  description: string;
  status?: TrainingSkillStatus;
}> = [
  { name: "会议纪要整理", description: "自动整理会议要点与行动项。" },
  { name: "周报生成", description: "按结构输出一周工作总结。" },
  { name: "竞品分析", description: "汇总竞品动态并生成摘要。" },
  { name: "任务清单生成", description: "把目标拆分成可执行任务。" },
  { name: "读文件", description: "读取并总结本地文档内容。" },
  { name: "跑测试", description: "触发测试并整理结果。" },
  { name: "查日志", description: "从日志中提取异常与线索。" }
];

export type TrainingWorkstationId = "scribe" | "terminal" | "archive";

export const TRAINING_WORKSTATIONS: Array<{
  id: TrainingWorkstationId;
  name: string;
  summary: string;
  skillNames: string[];
}> = [
  {
    id: "scribe",
    name: "文书工坊",
    summary: "偏文档整理、总结输出与结构化表达。",
    skillNames: ["会议纪要整理", "周报生成", "任务清单生成"]
  },
  {
    id: "terminal",
    name: "执行终端",
    summary: "偏本地执行、调试与工程动作。",
    skillNames: ["读文件", "跑测试", "查日志"]
  },
  {
    id: "archive",
    name: "洞察档案台",
    summary: "偏研究、分析与外部信息提炼。",
    skillNames: ["竞品分析"]
  }
];

export const TRAINING_SKILL_STATUS_LABELS: Record<TrainingSkillStatus, string> = {
  available: "Available",
  installing: "Installing",
  installed: "Installed",
  failed: "Failed"
};

export const TRAINING_SKILL_CHANNEL_LABELS: Record<TrainingSkillInstallChannel, string> = {
  openclaw: "OpenClaw",
  local: "Local Fallback"
};

export function createTrainingSkillRecord(input: {
  name: string;
  description: string;
  source: TrainingSkillSource;
  status?: TrainingSkillStatus;
  installChannel?: TrainingSkillInstallChannel | null;
}): TrainingSkill {
  const now = new Date().toISOString();

  return {
    id: nextTrainingSkillId(),
    name: input.name.trim(),
    description: input.description.trim(),
    source: input.source,
    status: input.status ?? "available",
    installChannel: input.installChannel ?? null,
    createdAt: now,
    updatedAt: now
  };
}

export function createDefaultTrainingSkills() {
  return presetSkillBlueprints.map((skill) =>
    createTrainingSkillRecord({
      name: skill.name,
      description: skill.description,
      source: "preset",
      status: skill.status
    })
  );
}

export function groupTrainingSkills(skills: readonly TrainingSkill[]) {
  return {
    available: skills.filter((skill) => skill.status === "available" || skill.status === "failed"),
    installed: skills.filter((skill) => skill.status === "installed" || skill.status === "installing")
  };
}

export function filterTrainingSkillsByWorkstation(
  skills: readonly TrainingSkill[],
  workstationId: TrainingWorkstationId
) {
  const workstation = TRAINING_WORKSTATIONS.find((item) => item.id === workstationId);
  if (!workstation) {
    return skills;
  }

  return skills.filter((skill) => workstation.skillNames.includes(skill.name));
}
