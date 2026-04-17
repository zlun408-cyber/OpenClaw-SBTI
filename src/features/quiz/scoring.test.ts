import { describe, expect, test } from "vitest";

import { questions, type QuizAxis } from "./questions";
import { scoreQuiz } from "./scoring";

const answersForAxis = (axis: QuizAxis) =>
  questions.map((question) => {
    const option = question.options.find((item) => item.axis === axis);
    if (!option) {
      throw new Error(`Missing ${axis} option for ${question.id}`);
    }

    return { questionId: question.id, value: option.id };
  });

describe("scoreQuiz", () => {
  test("returns a richer persona payload instead of the old 3-type placeholder", () => {
    const result = scoreQuiz(answersForAxis("control"));

    expect(result).toMatchObject({
      resultType: "CTRL",
      code: "CTRL",
      title: "拿捏者",
      slogan: "怎么样，被我拿捏了吧？"
    });
  });

  test("maps a dominant control answer profile to CTRL", () => {
    const result = scoreQuiz(answersForAxis("control"));

    expect(result.resultType).toBe("CTRL");
    expect(result.title).toBe("拿捏者");
  });

  test("resolves ties with a stable axis priority", () => {
    const result = scoreQuiz(
      questions.map((question, index) => {
        const axis: QuizAxis = index % 3 === 0 ? "control" : index % 3 === 1 ? "execution" : "harmony";
        const option = question.options.find((item) => item.axis === axis);
        if (!option) {
          throw new Error(`Missing ${axis} option for ${question.id}`);
        }

        return { questionId: question.id, value: option.id };
      })
    );

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
    const answers = answersForAxis("control");

    expect(() =>
      scoreQuiz([
        answers[0],
        { ...answers[0], value: "B" },
        ...answers.slice(2)
      ])
    ).toThrow("Duplicate quiz answer: q1");
  });

  test("rejects invalid option ids", () => {
    const answers = answersForAxis("control");

    expect(() =>
      scoreQuiz([
        { questionId: "q1", value: "Z" },
        ...answers.slice(1)
      ])
    ).toThrow("Invalid answer option: q1:Z");
  });
});
