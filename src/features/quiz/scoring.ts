import { questions, type QuizAxis } from "./questions";

export type QuizAnswer = {
  questionId: string;
  value: string;
};

export type QuizScoreResult = {
  resultType: "CTRL" | "EXEC" | "HARM";
  title: string;
};

type ResultMeta = QuizScoreResult & { axis: QuizAxis };

const RESULT_META: readonly ResultMeta[] = [
  { axis: "control", resultType: "CTRL", title: "控制者" },
  { axis: "execution", resultType: "EXEC", title: "执行者" },
  { axis: "harmony", resultType: "HARM", title: "协调者" }
] as const;

const AXIS_PRIORITY: readonly QuizAxis[] = RESULT_META.map((item) => item.axis);

export function scoreQuiz(answers: QuizAnswer[]): QuizScoreResult {
  const answersByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.value]));
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

  const topScore = Math.max(...AXIS_PRIORITY.map((axis) => axisScore[axis]));
  const winningAxis =
    AXIS_PRIORITY.find((axis) => axisScore[axis] === topScore) ?? AXIS_PRIORITY[0];
  const result = RESULT_META.find((item) => item.axis === winningAxis) ?? RESULT_META[0];

  return {
    resultType: result.resultType,
    title: result.title
  };
}
