import type { QuizResult, QuizResultType } from "../../types/domain";

export type PersonalityDefinition = QuizResult & {
  assetKey: string;
};

export const personalityCatalog = [
  {
    resultType: "CTRL",
    code: "CTRL",
    title: "拿捏者",
    subtitle: "控场与边界感很强的主导型人格",
    slogan: "怎么样，被我拿捏了吧？",
    description: "习惯先建立秩序、标准与控制面，再推进整体局势。",
    summary: { model: "秩序主导", keywords: ["掌控", "边界", "决策"] },
    assetKey: "ctrl"
  },
  {
    resultType: "ATM-er",
    code: "ATM-er",
    title: "送钱者",
    subtitle: "愿意付出但容易被索取的奉献型人格",
    slogan: "你以为我很有钱吗？",
    description: "经常先把资源和照顾给出去，之后才想起自己的消耗。",
    summary: { model: "资源付出", keywords: ["供给", "体面", "消耗"] },
    assetKey: "atm-er"
  },
  {
    resultType: "Dior-s",
    code: "Dior-s",
    title: "屌丝",
    subtitle: "逆袭叙事驱动的倔强型人格",
    slogan: "等着我屌丝逆袭。",
    description: "会在现实落差里积蓄能量，相信自己终有翻盘机会。",
    summary: { model: "逆袭叙事", keywords: ["忍耐", "反弹", "野心"] },
    assetKey: "dior-s"
  },
  {
    resultType: "BOSS",
    code: "BOSS",
    title: "领导者",
    subtitle: "习惯掌舵与调度全局的领航型人格",
    slogan: "方向盘给我，我来开。",
    description: "天然会接过方向感与判断权，习惯成为队伍的总调度。",
    summary: { model: "全局领航", keywords: ["掌舵", "调度", "权威"] },
    assetKey: "boss"
  },
  {
    resultType: "THAN-K",
    code: "THAN-K",
    title: "感恩者",
    subtitle: "容易被善意打动的温暖型人格",
    slogan: "我感谢苍天！我感谢大地！",
    description: "会对他人的帮助与命运馈赠保持高敏感度和回馈冲动。",
    summary: { model: "温暖回应", keywords: ["感恩", "回馈", "善意"] },
    assetKey: "than-k"
  },
  {
    resultType: "OH-NO",
    code: "OH-NO",
    title: "哦不人",
    subtitle: "先受惊再处理现实的反应型人格",
    slogan: "哦不！我怎么会是这个人格？！",
    description: "对突发状况的第一反应通常是惊讶、否认或短暂崩溃。",
    summary: { model: "惊愕反应", keywords: ["受惊", "否认", "缓冲"] },
    assetKey: "oh-no"
  },
  {
    resultType: "GOGO",
    code: "GOGO",
    title: "行者",
    subtitle: "凭行动感寻找存在感的冲锋型人格",
    slogan: "gogogo~出发咯",
    description: "静下来会难受，必须靠移动、尝试与推进来确认自己还活着。",
    summary: { model: "行动驱动", keywords: ["推进", "出发", "冲锋"] },
    assetKey: "gogo"
  },
  {
    resultType: "SEXY",
    code: "SEXY",
    title: "尤物",
    subtitle: "自带存在感与魅力投射的吸引型人格",
    slogan: "您就是天生的尤物！",
    description: "不一定刻意表现，但就是会让人注意到气场、姿态与审美张力。",
    summary: { model: "魅力投射", keywords: ["吸引", "气场", "审美"] },
    assetKey: "sexy"
  },
  {
    resultType: "LOVE-R",
    code: "LOVE-R",
    title: "多情者",
    subtitle: "感受丰沛、情绪浓度高的情感型人格",
    slogan: "爱意太满，现实显得有点贫瘠。",
    description: "会把很多关系都体验成带有深度情感意味的连接。",
    summary: { model: "情绪丰沛", keywords: ["爱意", "浪漫", "投射"] },
    assetKey: "love-r"
  },
  {
    resultType: "MUM",
    code: "MUM",
    title: "妈妈",
    subtitle: "照顾型本能过强的包裹型人格",
    slogan: "或许...我可以叫你妈妈吗....?",
    description: "会自动进入照顾、提醒、兜底和情绪接纳的位置。",
    summary: { model: "照顾本能", keywords: ["兜底", "照顾", "包裹"] },
    assetKey: "mum"
  },
  {
    resultType: "FAKE",
    code: "FAKE",
    title: "伪人",
    subtitle: "对自我真实性持续存疑的游离型人格",
    slogan: "已经，没有人类了。",
    description: "会时常怀疑自己的反应是否真实，像在模仿人类生活。",
    summary: { model: "真实性怀疑", keywords: ["伪装", "游离", "异化"] },
    assetKey: "fake"
  },
  {
    resultType: "OJBK",
    code: "OJBK",
    title: "无所谓人",
    subtitle: "习惯淡化冲突与存在感的松弛型人格",
    slogan: "我说随便，是真的随便。",
    description: "不爱争夺定义权，很多时候更愿意把选择权让出去。",
    summary: { model: "低冲突", keywords: ["随便", "淡化", "松弛"] },
    assetKey: "ojbk"
  },
  {
    resultType: "MALO",
    code: "MALO",
    title: "吗喽",
    subtitle: "打工副本感很强的生存型人格",
    slogan: "人生是个副本，而我只是一只吗喽。",
    description: "对系统、任务和生存压力极其敏感，容易以“混关卡”的心态生活。",
    summary: { model: "副本生存", keywords: ["打工", "副本", "过关"] },
    assetKey: "malo"
  },
  {
    resultType: "JOKE-R",
    code: "JOKE-R",
    title: "小丑",
    subtitle: "擅长把自己变成气氛材料的戏谑型人格",
    slogan: "原来我们都是小丑。",
    description: "会用幽默、自嘲和演绎来缓解局面，也常把伤感包在玩笑里。",
    summary: { model: "戏谑防御", keywords: ["自嘲", "演绎", "气氛"] },
    assetKey: "joke-r"
  },
  {
    resultType: "WOC!",
    code: "WOC!",
    title: "握草人",
    subtitle: "反应浓烈、吐槽先行的爆发型人格",
    slogan: "卧槽，我怎么是这个人格？",
    description: "情绪出口很快，容易用夸张反应表达震惊、困惑与不服。",
    summary: { model: "高反应", keywords: ["吐槽", "爆发", "直给"] },
    assetKey: "woc"
  },
  {
    resultType: "THIN-K",
    code: "THIN-K",
    title: "思考者",
    subtitle: "容易陷入分析与推演的脑内型人格",
    slogan: "已深度思考100s。",
    description: "会本能地反复拆解、推演和建立认知结构，再决定是否行动。",
    summary: { model: "脑内推演", keywords: ["分析", "推演", "结构"] },
    assetKey: "thin-k"
  },
  {
    resultType: "SHIT",
    code: "SHIT",
    title: "愤世者",
    subtitle: "对环境失望值较高的批判型人格",
    slogan: "这个世界，构石一坨。",
    description: "对系统缺陷、虚伪与荒诞格外敏感，习惯先看见问题。",
    summary: { model: "系统批判", keywords: ["失望", "批判", "看穿"] },
    assetKey: "shit"
  },
  {
    resultType: "ZZZZ",
    code: "ZZZZ",
    title: "装死者",
    subtitle: "通过暂时失联自保的低功耗人格",
    slogan: "我没死，我只是在睡觉。",
    description: "面对过载时优先静音、休眠、撤离，而不是直接硬抗。",
    summary: { model: "低功耗自保", keywords: ["静音", "撤离", "休眠"] },
    assetKey: "zzzz"
  },
  {
    resultType: "POOR",
    code: "POOR",
    title: "贫困者",
    subtitle: "资源焦虑感很强的节制型人格",
    slogan: "我穷，但我很专。",
    description: "会天然优先考虑资源投入产出，对浪费和失控格外警觉。",
    summary: { model: "资源节制", keywords: ["贫瘠", "算计", "节制"] },
    assetKey: "poor"
  },
  {
    resultType: "MONK",
    code: "MONK",
    title: "僧人",
    subtitle: "欲望阈值偏低的抽离型人格",
    slogan: "没有那种世俗的欲望。",
    description: "天然偏向克制、淡欲与观察者视角，不爱卷入俗世竞争。",
    summary: { model: "抽离克制", keywords: ["淡欲", "超然", "克制"] },
    assetKey: "monk"
  },
  {
    resultType: "IMSB",
    code: "IMSB",
    title: "傻者",
    subtitle: "会把自己当成笑柄来确认现实的自嘲型人格",
    slogan: "认真的么？我真的是傻逼么？",
    description: "常以自我怀疑与自我吐槽作为认知现实和缓冲情绪的方式。",
    summary: { model: "自嘲怀疑", keywords: ["怀疑", "自嘲", "迟疑"] },
    assetKey: "imsb"
  },
  {
    resultType: "SOLO",
    code: "SOLO",
    title: "孤儿",
    subtitle: "强烈感知孤立与落单的分离型人格",
    slogan: "我哭了，我怎么会是孤儿？",
    description: "容易在关系中先感知到缺位、落空与无人兜底的部分。",
    summary: { model: "分离感", keywords: ["孤立", "缺位", "无助"] },
    assetKey: "solo"
  },
  {
    resultType: "FUCK",
    code: "FUCK",
    title: "草者",
    subtitle: "情绪表达极度直接的野生型人格",
    slogan: "操！这是什么人格？",
    description: "会把最原始的反应直接喷出来，少有过度修饰或过滤。",
    summary: { model: "直喷表达", keywords: ["直接", "野生", "爆口"] },
    assetKey: "fuck"
  },
  {
    resultType: "DEAD",
    code: "DEAD",
    title: "死者",
    subtitle: "生命感偏低、对活着这件事感到抽离的人格",
    slogan: "我，还活着吗？",
    description: "容易感到麻木、失焦、像被从现实里抽走了一层电量。",
    summary: { model: "生命低电量", keywords: ["麻木", "失焦", "低电量"] },
    assetKey: "dead"
  },
  {
    resultType: "IMFW",
    code: "IMFW",
    title: "废物",
    subtitle: "对自我价值极度苛刻的挫败型人格",
    slogan: "我真的...是废物吗？",
    description: "会把失误、拖延和停滞快速归因为自我能力不足。",
    summary: { model: "挫败自责", keywords: ["自责", "无力", "失败"] },
    assetKey: "imfw"
  },
  {
    resultType: "HHHH",
    code: "HHHH",
    title: "傻乐者",
    subtitle: "先笑再说的欢乐缓冲型人格",
    slogan: "哈哈哈哈哈哈。",
    description: "对很多荒诞现实的反应不是对抗，而是先笑出声来化解。",
    summary: { model: "欢乐缓冲", keywords: ["傻乐", "化解", "轻盈"] },
    assetKey: "hhhh"
  },
  {
    resultType: "DRUNK",
    code: "DRUNK",
    title: "酒鬼",
    subtitle: "情绪与麻痹感交替驱动的沉醉型人格",
    slogan: "烈酒烧喉，不得不醉。",
    description: "在强烈情绪和自我麻痹之间摇摆，容易被沉浸状态包裹。",
    summary: { model: "沉醉麻痹", keywords: ["沉醉", "逃避", "烈度"] },
    assetKey: "drunk"
  }
] as const satisfies readonly PersonalityDefinition[];

export const PERSONALITY_TYPES = personalityCatalog.map(
  (item) => item.code
) as readonly QuizResultType[];

const personalityMap = new Map<QuizResultType, PersonalityDefinition>(
  personalityCatalog.map((item) => [item.code, item])
);

export function getPersonalityDefinition(type: QuizResultType): PersonalityDefinition {
  const definition = personalityMap.get(type);
  if (!definition) {
    throw new Error(`Unknown personality type: ${type}`);
  }

  return definition;
}
