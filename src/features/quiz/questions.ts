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
  tags?: readonly string[];
  options: readonly QuizOption[];
};

const createQuestion = (
  id: string,
  prompt: string,
  options: readonly [
    { label: string; axis: QuizAxis },
    { label: string; axis: QuizAxis },
    { label: string; axis: QuizAxis }
  ],
  tags?: readonly string[]
): QuizQuestion => ({
  id,
  prompt,
  tags,
  options: options.map((option, index) => ({
    id: String.fromCharCode(65 + index),
    label: option.label,
    axis: option.axis,
    weight: 1
  }))
});

export const questions: readonly QuizQuestion[] = [
  createQuestion("q1", "项目目标突然变化时，你通常会怎么做？", [
    { label: "先定规则和边界，确保方向可控", axis: "control" },
    { label: "先拆解执行步骤，马上推进", axis: "execution" },
    { label: "先统一认知与分工，保证团队协同", axis: "harmony" }
  ]),
  createQuestion("q2", "面对分歧时，你更习惯的方式是？", [
    { label: "倾听各方诉求，先求共识", axis: "harmony" },
    { label: "设定决策原则，快速收敛", axis: "control" },
    { label: "聚焦结果，边做边调整", axis: "execution" }
  ]),
  createQuestion("q3", "在紧迫时间下，你最优先考虑什么？", [
    { label: "优先交付，先把关键结果做出来", axis: "execution" },
    { label: "优先排定优先级，避免失控", axis: "control" },
    { label: "优先照顾协作节奏，减少摩擦", axis: "harmony" }
  ]),
  createQuestion("q4", "当团队没人拍板时，你会？", [
    { label: "站出来定方向和标准", axis: "control" },
    { label: "先把能做的部分做起来", axis: "execution" },
    { label: "确认大家的真实顾虑", axis: "harmony" }
  ]),
  createQuestion("q5", "你更讨厌哪种工作状态？", [
    { label: "没人负责、规则混乱", axis: "control" },
    { label: "一直讨论、没有产出", axis: "execution" },
    { label: "互相误解、气氛僵硬", axis: "harmony" }
  ]),
  createQuestion("q6", "一个新任务刚出现时，你第一反应是？", [
    { label: "先看目标和边界", axis: "control" },
    { label: "先列步骤和开始做", axis: "execution" },
    { label: "先问相关人的期待", axis: "harmony" }
  ]),
  createQuestion("q7", "面对不确定风险时，你更像？", [
    { label: "把风险框进可控区间", axis: "control" },
    { label: "边试边改，用行动获取信息", axis: "execution" },
    { label: "先让关系和沟通稳定下来", axis: "harmony" }
  ]),
  createQuestion("q8", "别人请你帮忙时，你通常会？", [
    { label: "先判断边界和优先级", axis: "control" },
    { label: "能顺手做就马上做", axis: "execution" },
    { label: "先照顾对方的情绪和处境", axis: "harmony" }
  ]),
  createQuestion("q9", "你最容易被哪种夸奖打动？", [
    { label: "你判断很准", axis: "control" },
    { label: "你执行力很强", axis: "execution" },
    { label: "和你合作很舒服", axis: "harmony" }
  ]),
  createQuestion("q10", "如果计划失败，你会先复盘什么？", [
    { label: "是不是策略和规则错了", axis: "control" },
    { label: "是不是行动不够快", axis: "execution" },
    { label: "是不是沟通和配合出了问题", axis: "harmony" }
  ]),
  createQuestion("q11", "你在群体里更常扮演什么角色？", [
    { label: "定规则的人", axis: "control" },
    { label: "推进事情的人", axis: "execution" },
    { label: "调和关系的人", axis: "harmony" }
  ]),
  createQuestion("q12", "面对空白页面，你会？", [
    { label: "先搭结构", axis: "control" },
    { label: "先写第一版", axis: "execution" },
    { label: "先找感觉和语气", axis: "harmony" }
  ]),
  createQuestion("q13", "你对“躺平”的真实态度更接近？", [
    { label: "可以休息，但要知道什么时候回来", axis: "control" },
    { label: "躺够了就继续冲", axis: "execution" },
    { label: "躺平有时候是在自救", axis: "harmony" }
  ]),
  createQuestion("q14", "你遇到荒诞事情时，最常见反应是？", [
    { label: "分析它为什么会这样", axis: "control" },
    { label: "先处理掉眼前问题", axis: "execution" },
    { label: "先吐槽或笑出来缓冲", axis: "harmony" }
  ]),
  createQuestion("q15", "你更希望别人如何与你合作？", [
    { label: "说清目标、边界和责任", axis: "control" },
    { label: "少废话，直接推进", axis: "execution" },
    { label: "互相尊重，别制造压力", axis: "harmony" }
  ]),
  createQuestion("q16", "当你状态很差时，你更像？", [
    { label: "强行维持秩序", axis: "control" },
    { label: "硬撑着做完关键动作", axis: "execution" },
    { label: "需要被理解和接住", axis: "harmony" }
  ]),
  createQuestion("q17", "你最受不了别人哪种表现？", [
    { label: "没有判断还乱指挥", axis: "control" },
    { label: "只说不做", axis: "execution" },
    { label: "不顾别人感受", axis: "harmony" }
  ]),
  createQuestion("q18", "如果你突然想从世界上消失一会儿，原因更可能是？", [
    { label: "需要重新拿回控制感", axis: "control" },
    { label: "电量耗尽，先离线回血", axis: "execution" },
    { label: "关系和情绪太满，需要静音", axis: "harmony" }
  ], ["hidden-trigger"]),
  createQuestion("q19", "面对新机会，你会先看什么？", [
    { label: "它是否值得投入", axis: "control" },
    { label: "它能不能马上启动", axis: "execution" },
    { label: "它会不会影响关系和生活", axis: "harmony" }
  ]),
  createQuestion("q20", "你对“成功”的想象更接近？", [
    { label: "局面被我掌控", axis: "control" },
    { label: "目标被我完成", axis: "execution" },
    { label: "关系和自我都没有被牺牲", axis: "harmony" }
  ]),
  createQuestion("q21", "你在压力下最容易变成？", [
    { label: "控制欲上升", axis: "control" },
    { label: "行动加速", axis: "execution" },
    { label: "情绪敏感", axis: "harmony" }
  ]),
  createQuestion("q22", "你更相信哪种改变？", [
    { label: "先改系统和规则", axis: "control" },
    { label: "先改行动和习惯", axis: "execution" },
    { label: "先改关系和环境", axis: "harmony" }
  ]),
  createQuestion("q23", "如果要给自己一个职场动物，你更像？", [
    { label: "会规划地盘的猫头鹰", axis: "control" },
    { label: "一路冲关的猴子", axis: "execution" },
    { label: "会照顾群体的水豚", axis: "harmony" }
  ]),
  createQuestion("q24", "你更容易在哪种时刻破防？", [
    { label: "事情失控且无人负责", axis: "control" },
    { label: "努力没有推进结果", axis: "execution" },
    { label: "真心没有被看见", axis: "harmony" }
  ]),
  createQuestion("q25", "你做选择时最常依赖什么？", [
    { label: "判断原则", axis: "control" },
    { label: "实际反馈", axis: "execution" },
    { label: "内心感受", axis: "harmony" }
  ]),
  createQuestion("q26", "你更适合哪种节奏？", [
    { label: "有框架、有阶段", axis: "control" },
    { label: "高密度、有反馈", axis: "execution" },
    { label: "有弹性、有呼吸感", axis: "harmony" }
  ]),
  createQuestion("q27", "你最想从测试结果里看到什么？", [
    { label: "我到底是哪类策略人", axis: "control" },
    { label: "我适合怎么行动", axis: "execution" },
    { label: "我的情绪和关系模式", axis: "harmony" }
  ]),
  createQuestion("q28", "别人误解你时，你会？", [
    { label: "澄清逻辑和事实", axis: "control" },
    { label: "用结果证明", axis: "execution" },
    { label: "先感到受伤或委屈", axis: "harmony" }
  ]),
  createQuestion("q29", "如果生活是一款游戏，你更关心？", [
    { label: "规则机制和胜利条件", axis: "control" },
    { label: "任务路线和通关效率", axis: "execution" },
    { label: "角色关系和剧情体验", axis: "harmony" }
  ]),
  createQuestion("q30", "最后一题：你希望你的数字员工更像？", [
    { label: "可靠的控场搭子", axis: "control" },
    { label: "能干的执行搭子", axis: "execution" },
    { label: "懂你的陪伴搭子", axis: "harmony" }
  ])
];
