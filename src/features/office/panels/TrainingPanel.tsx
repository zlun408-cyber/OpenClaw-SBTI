import { useState } from "react";

import { defaultOpenClawAdapter } from "../../openclaw/defaultAdapter";
import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import { useAppStore } from "../../../state/appStore";
import {
  groupTrainingSkills,
  TRAINING_SKILL_CHANNEL_LABELS,
  TRAINING_SKILL_STATUS_LABELS
} from "../training/trainingSkills";
import { installTrainingSkill } from "./trainingSkillInstall";

const panelStyle = {
  display: "grid",
  gap: "16px",
  width: "min(920px, calc(100vw - 440px))",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(18,33,28,0.94) 0%, rgba(9,18,16,0.96) 100%)",
  color: "#ECF4E7",
  boxShadow: "0 28px 80px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const lanesStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px"
} satisfies React.CSSProperties;

type TrainingPanelProps = {
  adapter?: OpenClawAdapter;
};

export function TrainingPanel({ adapter = defaultOpenClawAdapter }: TrainingPanelProps) {
  const skills = useAppStore((state) => state.trainingSkills);
  const createTrainingSkill = useAppStore((state) => state.createTrainingSkill);
  const beginTrainingSkillInstall = useAppStore((state) => state.beginTrainingSkillInstall);
  const completeTrainingSkillInstall = useAppStore((state) => state.completeTrainingSkillInstall);
  const groupedSkills = groupTrainingSkills(skills);
  const [statusMessage, setStatusMessage] = useState("Training room ready.");

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
          Install and grow hybrid office + technical skills for the digital employee.
        </p>
      </div>

      <div style={{ color: "#DCEBDD" }}>{statusMessage}</div>

      <div style={lanesStyle}>
        <section style={{ display: "grid", gap: "12px" }}>
          <h3 style={{ margin: 0 }}>Available Skills</h3>
          {groupedSkills.available.map((skill) => (
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

        <section style={{ display: "grid", gap: "12px" }}>
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
                {skill.installChannel ? `Installed via ${TRAINING_SKILL_CHANNEL_LABELS[skill.installChannel]}` : TRAINING_SKILL_STATUS_LABELS[skill.status]}
              </span>
            </article>
          ))}
        </section>
      </div>

      <button type="button" onClick={() => void installChatSkill("日志分析助手")}>Quick install chat skill</button>
    </section>
  );
}
