import { describe, expect, test } from "vitest";

import { scoreQuiz } from "./scoring";

describe("scoreQuiz", () => {
  test("maps a dominant answer profile to CTRL", () => {
    const result = scoreQuiz([
      { questionId: "q1", value: "A" },
      { questionId: "q2", value: "B" },
      { questionId: "q3", value: "C" }
    ]);

    expect(result).toEqual({ type: "CTRL", title: "控制者" });
  });

  test("resolves ties with a stable axis priority", () => {
    const result = scoreQuiz([
      { questionId: "q1", value: "B" },
      { questionId: "q2", value: "A" },
      { questionId: "q3", value: "B" }
    ]);

    expect(result.type).toBe("CTRL");
  });

  test("rejects incomplete answer sets", () => {
    expect(() =>
      scoreQuiz([
        { questionId: "q1", value: "A" },
        { questionId: "q2", value: "B" }
      ])
    ).toThrow("Incomplete quiz answers");
  });
});
