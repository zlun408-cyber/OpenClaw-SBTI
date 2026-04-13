import { questions, type QuizAxis } from "./questions";
import type { QuizResultType } from "../../types/domain";

export type QuizAnswer = {
  questionId: string;
  value: string;
};

export type QuizScoreResult = {
  resultType: QuizResultType;
  title: string;
};

type ResultMeta = QuizScoreResult & { axis: QuizAxis };

const RESULT_META: readonly ResultMeta[] = [
  { axis: "control", resultType: "CTRL", title: "控制者" },
  { axis: "execution", resultType: "EXEC", title: "执行者" },
  { axis: "harmony", resultType: "HARM", title: "协调者" }
] as const;

const TIE_BREAK_PRIORITY: readonly QuizAxis[] = ["control", "execution", "harmony"];

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
  const result = RESULT_META.find((item) => item.axis === winningAxis) ?? RESULT_META[0];

  return {
    resultType: result.resultType,
    title: result.title
  };
}
