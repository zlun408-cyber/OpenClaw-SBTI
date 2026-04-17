import { describe, expect, test } from "vitest";

import { questions } from "./questions";

describe("question bank", () => {
  test("contains the full 30-question ritual bank", () => {
    expect(questions).toHaveLength(30);
    expect(questions[0]?.id).toBe("q1");
    expect(questions[29]?.id).toBe("q30");
  });

  test("marks at least one hidden trigger question in the bank", () => {
    expect(questions.some((question) => question.tags?.includes("hidden-trigger"))).toBe(true);
  });
});
