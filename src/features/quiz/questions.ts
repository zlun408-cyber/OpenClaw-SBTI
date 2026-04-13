export type QuizAxis = "control" | "execution" | "harmony";

export type QuizOption = {
  id: string;
  axis: QuizAxis;
  weight: number;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: readonly QuizOption[];
};

export const questions: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "项目目标突然变化时，你通常会怎么做？",
    options: [
      { id: "A", axis: "control", weight: 1 },
      { id: "B", axis: "execution", weight: 1 },
      { id: "C", axis: "harmony", weight: 1 }
    ]
  },
  {
    id: "q2",
    prompt: "面对分歧时，你更习惯的方式是？",
    options: [
      { id: "A", axis: "harmony", weight: 1 },
      { id: "B", axis: "control", weight: 1 },
      { id: "C", axis: "execution", weight: 1 }
    ]
  },
  {
    id: "q3",
    prompt: "在紧迫时间下，你最优先考虑什么？",
    options: [
      { id: "A", axis: "execution", weight: 1 },
      { id: "B", axis: "control", weight: 1 },
      { id: "C", axis: "harmony", weight: 1 }
    ]
  }
];
