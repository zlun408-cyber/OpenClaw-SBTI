import { describe, expect, test } from "vitest";

import { scoreQuiz } from "./scoring";

describe("scoreQuiz", () => {
  test("maps a dominant answer profile to CTRL", () => {
    const result = scoreQuiz([
      { questionId: "q1", value: "A" },
      { questionId: "q2", value: "B" },
      { questionId: "q3", value: "C" }
    ]);

    expect(result).toEqual({ resultType: "CTRL", title: "控制者" });
  });

  test("resolves ties with a stable axis priority", () => {
    const result = scoreQuiz([
      { questionId: "q1", value: "B" },
      { questionId: "q2", value: "A" },
      { questionId: "q3", value: "B" }
    ]);

    expect(result.resultType).toBe("CTRL");
  });

  test("rejects incomplete answer sets", () => {
    expect(() =>
      scoreQuiz([
        { questionId: "q1", value: "A" },
        { questionId: "q2", value: "B" }
      ])
    ).toThrow("Incomplete quiz answers");
  });

  test("rejects duplicate answers for the same question", () => {
    expect(() =>
      scoreQuiz([
        { questionId: "q1", value: "A" },
        { questionId: "q1", value: "B" },
        { questionId: "q2", value: "B" },
        { questionId: "q3", value: "C" }
      ])
    ).toThrow("Duplicate quiz answer: q1");
  });

  test("rejects invalid option ids", () => {
    expect(() =>
      scoreQuiz([
        { questionId: "q1", value: "Z" },
        { questionId: "q2", value: "B" },
        { questionId: "q3", value: "C" }
      ])
    ).toThrow("Invalid answer option: q1:Z");
  });
});
