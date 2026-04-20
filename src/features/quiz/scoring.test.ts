import { describe, expect, test } from "vitest";

import { questions } from "./questions";
import { scoreQuiz } from "./scoring";

const answersForOptionIndex = (index: number) =>
  questions.map((question) => ({
    questionId: question.id,
    value: question.options[index]!.id
  }));

describe("scoreQuiz", () => {
  test("returns a richer persona payload instead of the old 3-result placeholder", () => {
    const result = scoreQuiz(answersForOptionIndex(0));

    expect(result).toMatchObject({
      resultType: "CTRL",
      code: "CTRL",
      title: "拿捏者",
      slogan: "怎么样，被我拿捏了吧？"
    });
  });

  test("maps a command-heavy answer profile to CTRL", () => {
    const result = scoreQuiz(answersForOptionIndex(0));

    expect(result.resultType).toBe("CTRL");
    expect(result.title).toBe("拿捏者");
  });

  test("maps a low-energy withdrawal answer profile to ZZZZ", () => {
    const result = scoreQuiz(answersForOptionIndex(3));

    expect(result.resultType).toBe("ZZZZ");
    expect(result.title).toBe("装死者");
  });

  test("uses more than the legacy 3-result bucket model", () => {
    const results = [0, 1, 2, 3].map((index) => scoreQuiz(answersForOptionIndex(index)).resultType);

    expect(new Set(results).size).toBeGreaterThan(3);
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
    const answers = answersForOptionIndex(0);

    expect(() =>
      scoreQuiz([
        answers[0],
        { ...answers[0], value: "B" },
        ...answers.slice(2)
      ])
    ).toThrow("Duplicate quiz answer: q1");
  });

  test("rejects invalid option ids", () => {
    const answers = answersForOptionIndex(0);

    expect(() =>
      scoreQuiz([
        { questionId: "q1", value: "Z" },
        ...answers.slice(1)
      ])
    ).toThrow("Invalid answer option: q1:Z");
  });
});
