import type { QuizResult } from "../../types/domain";
import { getPersonalityDefinition } from "./personalityCatalog";
import { questions, type QuizAxis } from "./questions";

export type QuizAnswer = {
  questionId: string;
  value: string;
};

export type QuizScoreResult = QuizResult;

const TIE_BREAK_PRIORITY: readonly QuizAxis[] = ["control", "execution", "harmony"];

const AXIS_RESULT_MAP = {
  control: "CTRL",
  execution: "GOGO",
  harmony: "MUM"
} as const;

export function scoreQuiz(answers: QuizAnswer[]): QuizScoreResult {
  const answersByQuestionId = new Map<string, string>();
  for (const answer of answers) {
    if (answersByQuestionId.has(answer.questionId)) {
      throw new Error(`Duplicate quiz answer: ${answer.questionId}`);
    }
    answersByQuestionId.set(answer.questionId, answer.value);
  }

  if (answersByQuestionId.size !== questions.length) {
    throw new Error("Incomplete quiz answers");
  }

  const axisScore: Record<QuizAxis, number> = {
    control: 0,
    execution: 0,
    harmony: 0
  };

  for (const question of questions) {
    const selectedValue = answersByQuestionId.get(question.id);
    if (!selectedValue) {
      throw new Error("Incomplete quiz answers");
    }

    const selectedOption = question.options.find((option) => option.id === selectedValue);
    if (!selectedOption) {
      throw new Error(`Invalid answer option: ${question.id}:${selectedValue}`);
    }

    axisScore[selectedOption.axis] += selectedOption.weight;
  }

  const topScore = Math.max(...TIE_BREAK_PRIORITY.map((axis) => axisScore[axis]));
  const winningAxis =
    TIE_BREAK_PRIORITY.find((axis) => axisScore[axis] === topScore) ?? TIE_BREAK_PRIORITY[0];

  return { ...getPersonalityDefinition(AXIS_RESULT_MAP[winningAxis]) };
}
