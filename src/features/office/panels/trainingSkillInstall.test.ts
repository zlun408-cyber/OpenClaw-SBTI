import { expect, test, vi } from "vitest";

import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import { installTrainingSkill } from "./trainingSkillInstall";

test("prefers OpenClaw install when adapter responds with webchat success", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input) => ({
      session: "main",
      message: input,
      context: {
        roomId: "training",
        roomLabel: "培训室",
        characterName: null,
        characterTitle: null
      }
    }),
    sendMessage: vi.fn(async () => ({ text: "已安装 skill", source: "webchat" as const }))
  };

  const result = await installTrainingSkill({ adapter, skillName: "会议纪要整理" });

  expect(result.channel).toBe("openclaw");
});

test("falls back to local install record when OpenClaw cannot install", async () => {
  const adapter: OpenClawAdapter = {
    buildRequest: (input) => ({
      session: "main",
      message: input,
      context: {
        roomId: "training",
        roomLabel: "培训室",
        characterName: null,
        characterTitle: null
      }
    }),
    sendMessage: vi.fn(async () => ({ text: "fallback", source: "fallback" as const }))
  };

  const result = await installTrainingSkill({ adapter, skillName: "日志分析" });

  expect(result.channel).toBe("local");
});
