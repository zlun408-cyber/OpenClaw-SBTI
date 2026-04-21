import { describe, expect, test } from "vitest";

import { QUIZ_DIMENSIONS, questions } from "./questions";

describe("question bank", () => {
  test("contains the full 31-question sbti ritual bank", () => {
    expect(questions).toHaveLength(31);
    expect(questions[0]?.id).toBe("q1");
    expect(questions[30]?.id).toBe("q31");
  });

  test("uses a 15-dimension sbti-style structure instead of the old 3-axis placeholder", () => {
    expect(QUIZ_DIMENSIONS).toHaveLength(15);
    expect(new Set(questions.map((question) => question.dimension)).size).toBe(15);
    expect(questions.every((question) => question.options)).toBe(true);
    expect(questions.every((question) => question.options.length === 4)).toBe(true);
    expect(questions.every((question) => question.options.every((option) => typeof option.tone === "string"))).toBe(
      true
    );
    expect(questions.every((question) => question.options.every((option) => Math.abs(option.score) >= 1))).toBe(
      true
    );
  });
});
