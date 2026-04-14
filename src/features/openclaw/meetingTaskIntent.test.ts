import { expect, test } from "vitest";

import { parseMeetingTaskIntent } from "./meetingTaskIntent";

test("parses explicit create-task commands in any room", () => {
  expect(parseMeetingTaskIntent("新增任务：整理今天客户反馈", "office")).toEqual({
    title: "整理今天客户反馈"
  });
});

test("parses natural-language task requests inside the meeting room", () => {
  expect(parseMeetingTaskIntent("帮我安排一个竞品分析任务", "meeting")).toEqual({
    title: "帮我安排一个竞品分析任务"
  });
});

test("ignores generic chat outside the meeting room", () => {
  expect(parseMeetingTaskIntent("最近状态怎么样", "office")).toBeNull();
});
