import { useMemo, useState } from "react";

import { defaultOpenClawAdapter } from "../../openclaw/defaultAdapter";
import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import { useAppStore } from "../../../state/appStore";
import {
  filterTrainingSkillsByWorkstation,
  groupTrainingSkills,
  TRAINING_SKILL_CHANNEL_LABELS,
  TRAINING_SKILL_STATUS_LABELS,
  TRAINING_WORKSTATIONS,
  type TrainingWorkstationId
} from "../training/trainingSkills";
import { installTrainingSkill } from "./trainingSkillInstall";

const panelStyle = {
  display: "grid",
  gap: "16px",
  width: "min(960px, calc(100vw - 440px))",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(159,227,196,0.14)",
  background: "linear-gradient(180deg, rgba(8,18,30,0.78) 0%, rgba(5,10,18,0.74) 100%)",
  color: "#ECF4E7",
  boxShadow: "0 28px 80px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const cardStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)"
} satisfies React.CSSProperties;

type TrainingPanelProps = {
  adapter?: OpenClawAdapter;
};

const workstationDecor: Record<TrainingWorkstationId, { top: string; left: string; width: string; height: string; tint: string }> = {
  scribe: { top: "18%", left: "8%", width: "26%", height: "38%", tint: "rgba(94, 117, 72, 0.42)" },
  terminal: { top: "42%", left: "36%", width: "28%", height: "34%", tint: "rgba(42, 109, 103, 0.42)" },
  archive: { top: "16%", left: "70%", width: "18%", height: "46%", tint: "rgba(74, 94, 140, 0.42)" }
};

export function TrainingPanel({ adapter = defaultOpenClawAdapter }: TrainingPanelProps) {
  const skills = useAppStore((state) => state.trainingSkills);
  const createTrainingSkill = useAppStore((state) => state.createTrainingSkill);
  const beginTrainingSkillInstall = useAppStore((state) => state.beginTrainingSkillInstall);
  const completeTrainingSkillInstall = useAppStore((state) => state.completeTrainingSkillInstall);
  const groupedSkills = groupTrainingSkills(skills);
  const [statusMessage, setStatusMessage] = useState("Training room ready.");
  const [activeWorkstationId, setActiveWorkstationId] = useState<TrainingWorkstationId>("scribe");

  const activeWorkstation = useMemo(
    () => TRAINING_WORKSTATIONS.find((item) => item.id === activeWorkstationId) ?? TRAINING_WORKSTATIONS[0],
    [activeWorkstationId]
  );
  const filteredAvailableSkills = useMemo(
    () => filterTrainingSkillsByWorkstation(groupedSkills.available, activeWorkstationId),
    [groupedSkills.available, activeWorkstationId]
  );

  const installSkill = async (skillId: string) => {
    const skill = useAppStore.getState().trainingSkills.find((item) => item.id === skillId);
    if (!skill) {
      return;
    }

    beginTrainingSkillInstall(skillId);
    const result = await installTrainingSkill({ adapter, skillName: skill.name });
    completeTrainingSkillInstall(skillId, result.channel);
    setStatusMessage(result.message);
  };

  const installChatSkill = async (skillName: string) => {
    const createdSkill = createTrainingSkill({
      name: skillName,
      description: "来自培训室对话创建",
      source: "chat"
    });
    await installSkill(createdSkill.id);
  };

  return (
    <section aria-label="training-panel" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0 }}>Training Room</h2>
        <p style={{ margin: "6px 0 0", color: "#BFD6C8" }}>
          Training has been upgraded to workstation hotspots: click a station first, then install the matching skills.
        </p>
      </div>

      <div style={{ color: "#DCEBDD" }}>{statusMessage}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px" }}>
        <section style={{ ...cardStyle, display: "grid", gap: "14px" }}>
          <div>
            <h3 style={{ margin: 0 }}>Training Floor</h3>
            <p style={{ margin: "4px 0 0", color: "#BFD6C8", fontSize: "13px" }}>
              文书工坊、执行终端、洞察档案台分别对应不同的训练方向。
            </p>
          </div>

          <div
            aria-label="training-scene"
            style={{
              position: "relative",
              minHeight: "320px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(158,210,181,0.12)",
              background:
                "radial-gradient(circle at 30% 20%, rgba(112, 173, 146, 0.18), transparent 24%), linear-gradient(180deg, rgba(16,31,27,0.96) 0%, rgba(11,20,18,0.98) 62%, rgba(10,14,13,0.99) 100%)"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 18%, transparent 100%), linear-gradient(0deg, rgba(0,0,0,0.24) 0%, transparent 34%)"
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                bottom: "10%",
                height: "18%",
                borderRadius: "18px",
                background: "linear-gradient(180deg, rgba(29,61,53,0.8) 0%, rgba(17,36,31,0.92) 100%)"
              }}
            />

            {TRAINING_WORKSTATIONS.map((workstation) => {
              const decor = workstationDecor[workstation.id];
              const isActive = workstation.id === activeWorkstationId;

              return (
                <button
                  key={workstation.id}
                  type="button"
                  aria-label={`训练工位 ${workstation.name}`}
                  onClick={() => {
                    setActiveWorkstationId(workstation.id);
                    setStatusMessage(`已聚焦训练工位：${workstation.name}`);
                  }}
                  style={{
                    position: "absolute",
                    top: decor.top,
                    left: decor.left,
                    width: decor.width,
                    height: decor.height,
                    borderRadius: "18px",
                    border: isActive ? "1px solid rgba(236,244,231,0.42)" : "1px solid rgba(255,255,255,0.12)",
                    background: `linear-gradient(180deg, ${decor.tint} 0%, rgba(11,18,16,0.44) 100%)`,
                    color: "#F3FBF3",
                    display: "grid",
                    alignContent: "space-between",
                    textAlign: "left",
                    padding: "14px",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 0 0 1px rgba(158,210,181,0.2), 0 12px 30px rgba(0,0,0,0.24)" : "0 12px 30px rgba(0,0,0,0.2)"
                  }}
                >
                  <strong style={{ fontSize: "16px" }}>{workstation.name}</strong>
                  <div style={{ display: "grid", gap: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#CFE6D9" }}>{workstation.summary}</span>
                    <span style={{ fontSize: "12px", color: "#9ED2B5" }}>{workstation.skillNames.join(" / ")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ display: "grid", gap: "16px", alignContent: "start" }}>
          <section style={{ ...cardStyle, display: "grid", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Available Skills</h3>
              <p style={{ margin: "4px 0 0", color: "#BFD6C8", fontSize: "13px" }}>
                当前工位：{activeWorkstation.name}
              </p>
            </div>

            {filteredAvailableSkills.map((skill) => (
              <article
                key={skill.id}
                style={{
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: "8px"
                }}
              >
                <strong>{skill.name}</strong>
                <p style={{ margin: 0, color: "#BFD6C8", fontSize: "13px" }}>{skill.description}</p>
                <span style={{ fontSize: "12px", color: "#9ED2B5" }}>{TRAINING_SKILL_STATUS_LABELS[skill.status]}</span>
                <button type="button" aria-label={`安装 skill ${skill.name}`} onClick={() => void installSkill(skill.id)}>
                  安装 skill
                </button>
              </article>
            ))}
          </section>

          <section style={{ ...cardStyle, display: "grid", gap: "12px" }}>
            <h3 style={{ margin: 0 }}>Installed Skills</h3>
            {groupedSkills.installed.map((skill) => (
              <article
                key={skill.id}
                style={{
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(110,169,131,0.12)",
                  border: "1px solid rgba(158,210,181,0.18)",
                  display: "grid",
                  gap: "8px"
                }}
              >
                <strong>{skill.name}</strong>
                <p style={{ margin: 0, color: "#BFD6C8", fontSize: "13px" }}>{skill.description}</p>
                <span style={{ fontSize: "12px", color: "#D8F1DE" }}>
                  {skill.installChannel
                    ? `Installed via ${TRAINING_SKILL_CHANNEL_LABELS[skill.installChannel]}`
                    : TRAINING_SKILL_STATUS_LABELS[skill.status]}
                </span>
              </article>
            ))}
          </section>
        </section>
      </div>

      <button type="button" onClick={() => void installChatSkill("日志分析助手")}>Quick install chat skill</button>
    </section>
  );
}
