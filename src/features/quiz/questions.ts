export type QuizAxis = "control" | "execution" | "harmony";

export type QuizOption = {
  id: string;
  label: string;
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
      { id: "A", label: "先定规则和边界，确保方向可控", axis: "control", weight: 1 },
      { id: "B", label: "先拆解执行步骤，马上推进", axis: "execution", weight: 1 },
      { id: "C", label: "先统一认知与分工，保证团队协同", axis: "harmony", weight: 1 }
    ]
  },
  {
    id: "q2",
    prompt: "面对分歧时，你更习惯的方式是？",
    options: [
      { id: "A", label: "倾听各方诉求，先求共识", axis: "harmony", weight: 1 },
      { id: "B", label: "设定决策原则，快速收敛", axis: "control", weight: 1 },
      { id: "C", label: "聚焦结果，边做边调整", axis: "execution", weight: 1 }
    ]
  },
  {
    id: "q3",
    prompt: "在紧迫时间下，你最优先考虑什么？",
    options: [
      { id: "A", label: "优先交付，先把关键结果做出来", axis: "execution", weight: 1 },
      { id: "B", label: "优先排定优先级，避免失控", axis: "control", weight: 1 },
      { id: "C", label: "优先照顾协作节奏，减少摩擦", axis: "harmony", weight: 1 }
    ]
  }
];
