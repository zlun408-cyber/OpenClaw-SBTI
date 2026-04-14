import { expect, test } from "vitest";

import { parseTrainingSkillIntent } from "./trainingSkillIntent";

test("parses explicit install-skill commands", () => {
  expect(parseTrainingSkillIntent("安装 skill：日报总结", "office")).toEqual({
    skillName: "日报总结"
  });
});

test("parses natural install requests inside the training room", () => {
  expect(parseTrainingSkillIntent("给数字员工安装 log 分析能力", "training")).toEqual({
    skillName: "给数字员工安装 log 分析能力"
  });
});

test("ignores unrelated training-room chat", () => {
  expect(parseTrainingSkillIntent("今天心情不错", "training")).toBeNull();
});
