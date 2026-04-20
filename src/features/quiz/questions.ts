export const QUIZ_DIMENSIONS = [
  "authority",
  "boundary",
  "action",
  "adaptability",
  "empathy",
  "recognition",
  "risk",
  "stability",
  "attachment",
  "expression",
  "selfWorth",
  "reality",
  "humor",
  "ambition",
  "vitality"
] as const;

export type QuizDimension = (typeof QUIZ_DIMENSIONS)[number];

export const QUIZ_DIMENSION_LABELS: Record<QuizDimension, string> = {
  authority: "决断姿态",
  boundary: "边界控制",
  action: "执行冲劲",
  adaptability: "变动适配",
  empathy: "情绪接收",
  recognition: "存在感诉求",
  risk: "风险迎面",
  stability: "抗压续航",
  attachment: "连结需要",
  expression: "表达烈度",
  selfWorth: "自我评价",
  reality: "现实直面",
  humor: "荒诞转化",
  ambition: "欲望密度",
  vitality: "生命电量"
};

export type QuizChapter = "秩序层" | "关系层" | "压力层" | "驱动力层";

export type QuizOption = {
  id: string;
  label: string;
  tone: string;
  score: number;
};

export type QuizQuestion = {
  id: string;
  chapter: QuizChapter;
  dimension: QuizDimension;
  prompt: string;
  options: readonly QuizOption[];
};

const optionIds = ["A", "B", "C", "D"] as const;
const optionScores = [2, 1, -1, -2] as const;

const createQuestion = (
  id: string,
  chapter: QuizChapter,
  dimension: QuizDimension,
  prompt: string,
  options: readonly [
    { label: string; tone: string },
    { label: string; tone: string },
    { label: string; tone: string },
    { label: string; tone: string }
  ]
): QuizQuestion => ({
  id,
  chapter,
  dimension,
  prompt,
  options: options.map((option, index) => ({
    id: optionIds[index]!,
    label: option.label,
    tone: option.tone,
    score: optionScores[index]!
  }))
});

export const questions: readonly QuizQuestion[] = [
  createQuestion("q1", "秩序层", "authority", "会议里一直没人拍板时，你更像谁？", [
    { label: "直接接过方向盘，先把判断说出来", tone: "强势掌舵" },
    { label: "先给一个临时方案，稳住大家节奏", tone: "稳定主导" },
    { label: "再看看别人要不要先说，我先不抢", tone: "谨慎退后" },
    { label: "最好别点我，我现在只想隐身", tone: "完全撤离" }
  ]),
  createQuestion("q2", "秩序层", "boundary", "别人把不属于你的烂摊子推过来时，你通常会？", [
    { label: "当场划清边界，谁的事谁负责", tone: "边界清晰" },
    { label: "先帮一点，但会把责任说清楚", tone: "有限接住" },
    { label: "怕场面难看，最后还是接了", tone: "勉强吞下" },
    { label: "表面说好，心里直接死机", tone: "被动过载" }
  ]),
  createQuestion("q3", "秩序层", "action", "任务刚落下来，你的第一反应更接近？", [
    { label: "马上拆任务、定顺序、启动推进", tone: "立刻开工" },
    { label: "先列个粗清单，再动手", tone: "温启动" },
    { label: "再等等，我想先感受一下难度", tone: "迟缓进入" },
    { label: "想到要开始就已经很累了", tone: "启动困难" }
  ]),
  createQuestion("q4", "秩序层", "adaptability", "计划突然被改时，你的反应通常是？", [
    { label: "立刻重排路径，边改边推进", tone: "快切轨道" },
    { label: "会不爽，但能很快重新适配", tone: "可调整" },
    { label: "需要一点时间消化，节奏会被打断", tone: "短暂停摆" },
    { label: "一旦被改，我整个人都不想动了", tone: "结构崩塌" }
  ]),
  createQuestion("q5", "关系层", "empathy", "朋友情绪很满地找你倾诉时，你更像？", [
    { label: "我会整个人进去接住对方的情绪", tone: "高共感" },
    { label: "能接，但会努力保持一点距离", tone: "有限共感" },
    { label: "我知道该安慰，但很难真同步", tone: "理性旁观" },
    { label: "对不起，我现在连自己都接不住", tone: "情绪断电" }
  ]),
  createQuestion("q6", "关系层", "recognition", "你被人忽视时，真实感受更接近？", [
    { label: "会很不爽，我本来就应该被看见", tone: "存在感强" },
    { label: "会介意，但还能自己调回来", tone: "轻度在意" },
    { label: "我会先装无所谓，回头慢慢消化", tone: "暗自受伤" },
    { label: "算了，我可能本来就不重要", tone: "存在坍缩" }
  ]),
  createQuestion("q7", "压力层", "risk", "明知道可能翻车但机会很大时，你会？", [
    { label: "冲，先拿到机会再说", tone: "迎风险" },
    { label: "会冲，但得留一条退路", tone: "谨慎冒险" },
    { label: "再观察一下，我不想先当炮灰", tone: "回避试探" },
    { label: "不行，我第一反应就是撤", tone: "直接逃离" }
  ]),
  createQuestion("q8", "压力层", "stability", "连续高压一周后，你通常还能维持到什么程度？", [
    { label: "还能顶住，而且会越压越清醒", tone: "高续航" },
    { label: "会累，但不至于崩，能慢慢收住", tone: "尚可维持" },
    { label: "外表还在运转，里面已经裂开了", tone: "内耗维持" },
    { label: "基本就是死机、消失、谁也别找我", tone: "彻底断线" }
  ]),
  createQuestion("q9", "关系层", "attachment", "你和人熟起来后，通常会？", [
    { label: "会主动靠近、组织、维系关系", tone: "高连结" },
    { label: "喜欢稳定熟人圈，但不过度绑定", tone: "温和靠近" },
    { label: "我需要距离，太近会让我有压力", tone: "保留空间" },
    { label: "别靠近我，我会先想逃", tone: "本能抽离" }
  ]),
  createQuestion("q10", "关系层", "expression", "你表达不满时更像哪种人？", [
    { label: "我会直接说，甚至说得很猛", tone: "直给输出" },
    { label: "我会尽量说清，但控制一下力度", tone: "克制表达" },
    { label: "我多数时候憋着，等过后再想", tone: "延迟表达" },
    { label: "我通常不说，直接失联或冷掉", tone: "静默撤退" }
  ]),
  createQuestion("q11", "压力层", "selfWorth", "做砸一件事后，你内心最常见的声音是？", [
    { label: "失误而已，我下次会做得更狠", tone: "自我稳固" },
    { label: "会复盘，但不会因此全盘否定自己", tone: "可恢复" },
    { label: "我会怀疑自己是不是又不行了", tone: "摇晃自责" },
    { label: "果然，我就是不配把事做好", tone: "价值崩塌" }
  ]),
  createQuestion("q12", "压力层", "reality", "想逃离现实的时候，你更可能怎么做？", [
    { label: "先把眼前事处理完，再谈崩溃", tone: "强行面对" },
    { label: "会短暂放空，但最后还是回来收拾", tone: "有限逃逸" },
    { label: "能拖就拖，我想先把自己藏起来", tone: "低频回避" },
    { label: "我会彻底断联，希望世界别来找我", tone: "深度失踪" }
  ]),
  createQuestion("q13", "压力层", "humor", "遇到很荒诞的局面时，你通常会？", [
    { label: "先笑、先玩梗、先把场子转起来", tone: "高频化解" },
    { label: "会吐槽两句，缓一缓再处理", tone: "轻度调侃" },
    { label: "笑不出来，我会先僵一下", tone: "冷感停顿" },
    { label: "只会觉得更绝望，一点也不好笑", tone: "荒诞吞没" }
  ]),
  createQuestion("q14", "驱动力层", "ambition", "如果有一条更大的上升通道摆在你面前，你会？", [
    { label: "我要，而且我要拿得漂亮", tone: "高欲望" },
    { label: "想争取，但不想把自己卷烂", tone: "有限上冲" },
    { label: "机会是好，但我未必真想要", tone: "欲望偏低" },
    { label: "谢谢，我现在连想都懒得想", tone: "低欲关闭" }
  ]),
  createQuestion("q15", "驱动力层", "vitality", "最近的你，生命电量更像哪种状态？", [
    { label: "很满，想做事，也想搞点大的", tone: "高电量" },
    { label: "一般，但还能维持正常输出", tone: "可运转" },
    { label: "经常低电，需要很多恢复时间", tone: "持续亏电" },
    { label: "几乎靠本能活着，像在待机", tone: "深度省电" }
  ]),
  createQuestion("q16", "秩序层", "authority", "项目方向吵成一团时，你最自然的动作是？", [
    { label: "直接给框架，让大家照着收敛", tone: "强控场" },
    { label: "把问题分块，再逐个做决定", tone: "结构接管" },
    { label: "我会等一个更合适的人先发话", tone: "低位等待" },
    { label: "我只想退出这场混战", tone: "彻底退场" }
  ]),
  createQuestion("q17", "秩序层", "boundary", "同事半夜来找你救火时，你更可能？", [
    { label: "先判断值不值得，再决定帮不帮", tone: "边界先行" },
    { label: "会帮，但会留下规则提醒", tone: "有条件接入" },
    { label: "我很难拒绝，最后又累又烦", tone: "边界发虚" },
    { label: "我会装没看见，因为我真的扛不住", tone: "被动失联" }
  ]),
  createQuestion("q18", "秩序层", "action", "面对一个巨大但模糊的任务，你更像？", [
    { label: "先做第一刀，边干边逼出答案", tone: "行动取证" },
    { label: "先做一个粗版本，再逐步修", tone: "试作推进" },
    { label: "我要再想想，现在还不想开始", tone: "拖延酝酿" },
    { label: "我脑子里已经先把它判成灾难了", tone: "开始前崩" }
  ]),
  createQuestion("q19", "秩序层", "adaptability", "临场出现意外变量时，你通常怎么反应？", [
    { label: "切换很快，我甚至会兴奋起来", tone: "高弹性" },
    { label: "会愣一下，但很快就能补位", tone: "中等弹性" },
    { label: "我会明显卡住，需要时间恢复", tone: "适配迟缓" },
    { label: "一下子全乱了，我只想放弃", tone: "适配坍塌" }
  ]),
  createQuestion("q20", "关系层", "empathy", "当别人说“你懂我”时，你的真实状态更像？", [
    { label: "是的，我通常真的能感觉到别人", tone: "深度进入" },
    { label: "我能理解，但不会完全代入", tone: "可控理解" },
    { label: "我其实更多是在判断，不是在共感", tone: "理性观看" },
    { label: "很多时候我连自己都感受不到", tone: "情绪麻木" }
  ]),
  createQuestion("q21", "关系层", "recognition", "你做成一件事后，最想得到什么？", [
    { label: "明确的认可和响亮的反馈", tone: "被看见需求高" },
    { label: "有人知道我做成了，就够了", tone: "适度被看见" },
    { label: "最好低调一点，我不想太显眼", tone: "存在感回避" },
    { label: "有没有人看到都无所谓了", tone: "存在感熄火" }
  ]),
  createQuestion("q22", "压力层", "risk", "面对可能得罪人的真话，你更可能？", [
    { label: "说，我宁愿真实一点", tone: "正面开火" },
    { label: "会说，但会选时机和方式", tone: "控制出手" },
    { label: "大概率忍住，我不想惹麻烦", tone: "规避冲突" },
    { label: "我会直接消失，不参与任何爆炸现场", tone: "断线避战" }
  ]),
  createQuestion("q23", "压力层", "stability", "当多件事一起压过来时，你通常会？", [
    { label: "越压越像进入战斗模式", tone: "高压唤醒" },
    { label: "先稳住一两件关键的", tone: "有序承压" },
    { label: "会明显变钝，开始遗漏细节", tone: "迟滞承压" },
    { label: "直接脑雾，什么都处理不了", tone: "崩压断电" }
  ]),
  createQuestion("q24", "关系层", "attachment", "如果喜欢的人突然冷下来，你更像？", [
    { label: "我会主动追问、确认、挽回", tone: "追连结" },
    { label: "会试着沟通，但不会太卑微", tone: "稳态靠近" },
    { label: "我会先后退一点，保护自己", tone: "自保抽离" },
    { label: "好，那我就彻底消失好了", tone: "切断连接" }
  ]),
  createQuestion("q25", "关系层", "expression", "你表达喜欢、愤怒或委屈时，更像哪种人？", [
    { label: "都很直接，我不想猜来猜去", tone: "高烈表达" },
    { label: "会说，但会留一点分寸", tone: "稳态表达" },
    { label: "我通常要酝酿很久才说出口", tone: "迟缓外放" },
    { label: "我更擅长沉默，不擅长表达", tone: "关闭输出" }
  ]),
  createQuestion("q26", "压力层", "selfWorth", "别人否定你时，你内心最容易冒出来的是？", [
    { label: "那我就做给你看", tone: "受挫反打" },
    { label: "我会难受，但还能把自己拉住", tone: "受挫可收" },
    { label: "我会开始反复想自己哪都不对", tone: "否定内化" },
    { label: "我会迅速认定自己就是废物", tone: "彻底自毁" }
  ]),
  createQuestion("q27", "压力层", "reality", "想从现实里消失几小时的时候，你更常做什么？", [
    { label: "先把该回的消息和事处理掉", tone: "面对后撤" },
    { label: "找个角落缓一下，再回来", tone: "短暂离线" },
    { label: "能不面对就不面对，先拖着", tone: "慢性逃逸" },
    { label: "我希望世界先把我忘掉", tone: "深度蒸发" }
  ]),
  createQuestion("q28", "压力层", "humor", "你会不会用玩笑处理自己的狼狈？", [
    { label: "会，而且经常先把自己说成段子", tone: "自嘲化解" },
    { label: "偶尔会，主要是让气氛别太重", tone: "轻幽默" },
    { label: "很少，我更容易先僵住", tone: "幽默低频" },
    { label: "我连笑都笑不出来", tone: "幽默停摆" }
  ]),
  createQuestion("q29", "驱动力层", "ambition", "如果未来有机会完全翻盘，你会怎么想？", [
    { label: "我要翻，而且我要翻得漂亮", tone: "逆袭执念" },
    { label: "挺想，但我会评估代价", tone: "理性向上" },
    { label: "我不确定自己有没有那个欲望", tone: "低欲审视" },
    { label: "说实话，连想象都嫌累", tone: "欲望关闭" }
  ]),
  createQuestion("q30", "驱动力层", "vitality", "最近的生活如果拍成像素动画，你会是哪一帧？", [
    { label: "冲刺、发光、持续往前", tone: "高频燃烧" },
    { label: "正常运转，偶尔闪一下光", tone: "平稳供电" },
    { label: "经常低电量，需要慢慢回蓝", tone: "回能缓慢" },
    { label: "待机、灰掉、只剩呼吸条", tone: "深度低耗" }
  ]),
  createQuestion("q31", "驱动力层", "authority", "最后一题：你希望你的数字员工更像哪种同伴？", [
    { label: "能定方向、能扛局面的主心骨", tone: "控场搭档" },
    { label: "能稳步推进、不掉链子的执行搭子", tone: "推进搭档" },
    { label: "能理解我节奏、别太逼我的陪跑者", tone: "低压同行" },
    { label: "最好安静一点，让我先缓口气", tone: "低刺激陪伴" }
  ])
] as const;
