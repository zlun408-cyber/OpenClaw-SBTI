import type { QuizResult } from "../../types/domain";
import type { QuizResultType } from "../../types/domain";
import { getPersonalityDefinition } from "./personalityCatalog";
import { QUIZ_DIMENSIONS, questions, type QuizDimension } from "./questions";

export type QuizAnswer = {
  questionId: string;
  value: string;
};

export type QuizScoreResult = QuizResult;

type DimensionProfile = Record<QuizDimension, number>;

const DIMENSION_QUESTION_COUNTS = QUIZ_DIMENSIONS.reduce(
  (counts, dimension) => ({
    ...counts,
    [dimension]: questions.filter((question) => question.dimension === dimension).length
  }),
  {} as Record<QuizDimension, number>
);

const buildProfile = (
  base: number,
  overrides: Partial<Record<QuizDimension, number>> = {}
): DimensionProfile => {
  const profile = Object.fromEntries(QUIZ_DIMENSIONS.map((dimension) => [dimension, base])) as DimensionProfile;

  for (const [dimension, value] of Object.entries(overrides)) {
    profile[dimension as QuizDimension] = value as number;
  }

  return profile;
};

const PERSONA_PROFILES: Record<QuizResultType, DimensionProfile> = {
  CTRL: buildProfile(2, { empathy: 0, attachment: 0, humor: 0 }),
  "ATM-er": buildProfile(1, { boundary: -2, empathy: 2, attachment: 2, selfWorth: -1, ambition: 0 }),
  "Dior-s": buildProfile(1, { selfWorth: -1, ambition: 2, vitality: 1, humor: 1 }),
  BOSS: buildProfile(0, {
    authority: 2,
    boundary: 1,
    recognition: 2,
    ambition: 2,
    empathy: -1,
    attachment: -1,
    humor: -1
  }),
  "THAN-K": buildProfile(1, { empathy: 2, attachment: 2, recognition: 1, boundary: -1 }),
  "OH-NO": buildProfile(-1, { empathy: 1, humor: -1, vitality: -1, risk: -2, stability: -2 }),
  GOGO: buildProfile(1, { action: 2, adaptability: 2, risk: 2, vitality: 2, stability: 0 }),
  SEXY: buildProfile(1, { recognition: 2, expression: 2, attachment: 1, ambition: 1 }),
  "LOVE-R": buildProfile(1, { empathy: 2, attachment: 2, expression: 2, boundary: -1, stability: -1 }),
  MUM: buildProfile(0, { empathy: 2, attachment: 2, boundary: -1, recognition: 0, reality: 1 }),
  FAKE: buildProfile(-1, { expression: -2, selfWorth: -1, attachment: -1, vitality: -1 }),
  OJBK: buildProfile(-1, { authority: -1, expression: -1, ambition: -1, stability: 1, humor: 1 }),
  MALO: buildProfile(0, { action: 1, ambition: -1, stability: -1, selfWorth: -1, vitality: -1 }),
  "JOKE-R": buildProfile(0, { humor: 2, expression: 2, selfWorth: -1, empathy: 1 }),
  "WOC!": buildProfile(1, { expression: 2, risk: 2, humor: 1, stability: -1 }),
  "THIN-K": buildProfile(0, { authority: 1, action: -1, expression: -1, reality: 2, humor: -1 }),
  SHIT: buildProfile(0, { expression: 1, reality: 2, humor: -1, empathy: -1, stability: -1 }),
  ZZZZ: buildProfile(-2),
  POOR: buildProfile(-1, { boundary: 1, ambition: -1, vitality: -1, recognition: -1 }),
  MONK: buildProfile(-1, { humor: 0, reality: 1, expression: -2, ambition: -2, attachment: -1 }),
  IMSB: buildProfile(-1, { humor: 1, selfWorth: -2, recognition: -1, reality: -1 }),
  SOLO: buildProfile(-1, { attachment: -2, empathy: -1, vitality: -1, expression: -1 }),
  FUCK: buildProfile(0, { expression: 2, risk: 1, humor: 0, boundary: 0, stability: -1 }),
  DEAD: buildProfile(-2, { humor: -1, reality: -2, vitality: -2, expression: -2 }),
  IMFW: buildProfile(-2, { selfWorth: -2, ambition: -1, expression: -1, vitality: -1 }),
  HHHH: buildProfile(0, { humor: 2, vitality: 1, stability: 0, ambition: 0 }),
  DRUNK: buildProfile(-1, { vitality: -2, stability: -2, humor: 1, reality: -2, expression: 1 })
};

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

  const dimensionScore = Object.fromEntries(QUIZ_DIMENSIONS.map((dimension) => [dimension, 0])) as DimensionProfile;

  for (const question of questions) {
    const selectedValue = answersByQuestionId.get(question.id);
    if (!selectedValue) {
      throw new Error("Incomplete quiz answers");
    }

    const selectedOption = question.options.find((option) => option.id === selectedValue);
    if (!selectedOption) {
      throw new Error(`Invalid answer option: ${question.id}:${selectedValue}`);
    }

    dimensionScore[question.dimension] += selectedOption.score;
  }

  const normalizedDimensionScore = Object.fromEntries(
    QUIZ_DIMENSIONS.map((dimension) => [
      dimension,
      dimensionScore[dimension] / Math.max(DIMENSION_QUESTION_COUNTS[dimension], 1)
    ])
  ) as DimensionProfile;

  const winningType = (Object.entries(PERSONA_PROFILES) as Array<[QuizResultType, DimensionProfile]>)
    .map(([type, profile]) => ({
      type,
      distance: QUIZ_DIMENSIONS.reduce((sum, dimension) => {
        const diff = normalizedDimensionScore[dimension] - profile[dimension];
        return sum + diff * diff;
      }, 0)
    }))
    .sort((left, right) => left.distance - right.distance)[0]?.type;

  if (!winningType) {
    throw new Error("Unable to resolve quiz result");
  }

  return { ...getPersonalityDefinition(winningType) };
}
