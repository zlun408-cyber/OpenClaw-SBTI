# SBTI 数字员工游戏化前端设计

- 日期：2026-04-10
- 状态：已确认设计，待进入 implementation planning
- 目标平台：PC 网页端
- 设计阶段：Brainstorming / Design Approved

## 1. 项目概述

本项目是一个基于 SBTI 测试结果生成数字员工形象的 PC 端网页应用。它不是普通问卷站点，也不是简单聊天界面，而是一套带强仪式感开场、角色生成、数字办公室漫游和本地 OpenClaw 联动能力的小游戏式前端系统。

用户先通过“穿越之门”进入世界观，再完成 SBTI 问卷，随后经历时空穿梭转场，生成对应的 SBTI 角色，并进入数字办公室。进入办公室后，用户通过控制角色移动，在不同功能房间中触发任务、记忆、技能和休闲状态相关交互。页面右下角始终保留一个小型 OpenClaw 对话框，作为数字员工的即时能力入口。

## 2. 设计目标

### 2.1 主目标

1. 让 SBTI 测试结果从“结果页”升级为“可进入、可控制、可互动”的数字员工体验。
2. 用强游戏化方式承载角色生成、办公室漫游和 AI 助手交互。
3. 在视觉上保持授权 SBTI 角色体系的一致性。
4. 以本地部署的 OpenClaw 作为数字员工的对话与任务能力内核。

### 2.2 非目标

1. 第一版不做移动端适配。
2. 第一版不以飞书、Telegram、Discord 作为主入口。
3. 第一版不要求先打通 OpenClaw 全部底层 Gateway 管理能力。
4. 第一版不做石门区域回访，石门仅作为开场流程的一部分。

## 3. 用户体验主流程

### 3.1 完整主链路

1. 用户进入页面。
2. 页面展示两扇整屏巨大、古老、神秘的石门。
3. 用户点击“穿越之门”。
4. 石门开启。
5. 古老神秘风格的 SBTI 问卷浮现。
6. 用户完成问卷。
7. 系统根据问卷结果生成对应 SBTI 结果。
8. 页面播放时空穿梭动画。
9. 用户进入角色升成/预览界面。
10. 界面展示测试结果对应的角色称号和角色形象。
11. 用户可编辑角色姓名。
12. 用户点击进入数字办公室。
13. 角色出生在办公室场景中。
14. 用户通过键盘或鼠标控制角色移动。
15. 角色进入不同功能区域后触发对应交互。
16. 页面右下角常驻 OpenClaw 小对话框，支持随时输入与接收反馈。

### 3.2 核心体验原则

1. 流程必须有明显仪式感，不可退化为普通网页表单跳转。
2. 问卷、穿梭、角色升成、办公室进入之间要形成完整情绪递进。
3. 办公室阶段必须是“控制角色进入空间触发交互”，而不是纯点击 UI 面板。

## 4. 视觉与世界观方向

### 4.1 视觉关键词

- 神秘
- 古老
- 奇幻
- 游戏化
- 卡牌/冒险感
- 与授权 SBTI 人物风格保持一致

### 4.2 分阶段视觉重点

#### 开场与问卷阶段

- 画面以古老石门、神秘符号、低照度氛围、仪式感为主。
- 问卷不是现代 SaaS 表单，而应像神秘试炼或古卷问答。

#### 角色升成阶段

- 画面重点突出“测试结果已具象化为角色”。
- 角色称号自动生成，姓名允许用户自定义。

#### 数字办公室阶段

- 办公室风格需与 SBTI 角色画风统一。
- 不能出现现代企业后台控制台感。
- 重点是“角色真的生活在这个空间里”，而非角色只是 UI 图标。

## 5. 角色系统设计

## 5.1 角色来源与授权前提

本项目按用户提供的前提推进：用户已获得口头聊天授权，且明确包含“可以从现有公开网页中提取角色图、结果图、页面素材并用于该项目”。

基于此，项目允许整理并使用已授权公开网页中的相关角色资产，但仍需在工程上保留素材来源记录，便于后续维护。

### 5.2 角色生成规则

1. SBTI 测试结果决定角色称号和角色类型。
2. 用户可编辑角色姓名。
3. 称号不可手改，姓名可手改。
4. 进入数字办公室时，场景内角色、HUD、任务提示均使用用户设置后的角色姓名。

### 5.3 角色状态

每个角色在系统层至少支持以下状态：

- idle：待机
- walk：移动
- work：工作
- rest：休闲
- sleep：睡觉
- dance：跳舞
- train：培训
- task-submit：任务提交

### 5.4 全角色支持要求

第一版必须支持全部测试结果角色进入办公室，不能因为某些角色素材不足而出现“测出结果但没有角色”的情况。

### 5.5 角色资产结构

项目需建立统一角色注册表。每个角色至少包含：

- 角色 ID
- SBTI 类型
- 对应称号
- 默认展示图
- 场景内角色图或角色动画资源
- 各状态对应资源
- 缺失资源时的 fallback 动画策略

示例结构：

```ts
type SbtiCharacter = {
  id: string
  type: string
  title: string
  displayName: string
  sourceImage: string
  spriteSheets?: {
    idle?: string
    walkDown?: string
    walkUp?: string
    walkLeft?: string
    walkRight?: string
    work?: string
    rest?: string
    sleep?: string
    dance?: string
    train?: string
    taskSubmit?: string
  }
  fallbackAnimations: {
    idle: string
    walk: string
    work: string
    rest: string
  }
}
```

### 5.6 素材审计机制

实现前必须建立资产审计表，标注每个角色是否具备：

- 高清图
- 透明底
- 待机资源
- 行走资源
- 工作资源
- 休息资源
- 培训资源

建议结构：

```ts
type AssetAuditItem = {
  characterId: string
  title: string
  sourceUrl: string
  sourceType: "web-result-image" | "static-image" | "screenshot" | "manual-export"
  hasTransparentImage: boolean
  hasIdle: boolean
  hasWalk: boolean
  hasWork: boolean
  hasRest: boolean
  hasTrain: boolean
  quality: "ready" | "needs-cleanup" | "needs-redraw" | "missing"
}
```

### 5.7 动画策略

系统架构按“真游戏角色化”设计，但允许部分角色在素材不完整时使用 fallback 动效：

1. 优先使用 sprite sheet / 逐帧动画。
2. 若缺少完整动画，则使用静态角色图配合前端动画与状态特效兜底。
3. fallback 只影响表现精度，不影响角色可用性。

## 6. 数字办公室地图设计

### 6.1 地图表现

- 采用 2.5D 斜视角游戏地图。
- 场景需要支持角色真实移动、路径、碰撞、触发和状态切换。

### 6.2 空间结构

#### 主办公室 / 办公区

- 位于地图中心。
- 作为主工作区和状态观察区。

#### 会议室

- 位于主办公室内部后方。
- 采用“后方玻璃隔间”形式。
- 它属于办公室的一部分，不是额外挂在左右两侧的小房间。

#### 人事部

- 紧邻主办公室。
- 用于更新数字人的 soul 和 memory。

#### 培训室

- 紧邻主办公室。
- 用于增加 skill 或安装 skill。

#### 牛马休息间

- 放在较远位置。
- 需通过走动进入。
- 角色可在其中执行喝茶、睡觉、跳舞等非工作状态。

### 6.3 石门的场景边界

石门只作为 Intro 演出出现，升成角色并进入办公室后不再出现，也不作为办公室中的常驻区域。

## 7. 移动、寻路与交互逻辑

### 7.1 控制方式

第一版同时支持：

1. WASD 移动
2. 方向键移动
3. 鼠标点击地面或房间目标点后自动寻路

### 7.2 控制优先级

- 当角色处于点击自动寻路状态时，用户按下 WASD 或方向键，应立即打断自动寻路，切回手动控制。
- 点击房间时，角色不应瞬移，而应走到房间最近触发点后再进入交互状态。

### 7.3 房间触发规则

#### 办公区

- 显示工作状态、当前任务状态、执行中反馈。

#### 会议室

- 领取任务
- 提交任务结果

#### 人事部

- 更新 soul
- 更新 memory

#### 培训室

- 查看技能
- 增加 skill
- 安装 skill

#### 休息间

- 进入休闲状态
- 触发喝茶 / 睡觉 / 跳舞等待机演出

## 8. OpenClaw 接入设计

### 8.1 当前已知接入前提

用户当前已有本地 OpenClaw Webchat 地址：

`http://127.0.0.1:18789/chat?session=main`

同时根据用户提供的 OpenClaw 回复，可知：

- OpenClaw 支持 Webchat
- 存在本地 Gateway API 概念
- Gateway 暴露管理接口（如 sessions、agents），但需认证

第一版设计不依赖 Gateway 深度接入，而是优先围绕稳定可用的本地 Webchat 能力构建。

### 8.2 常驻对话框

页面右下角必须存在一个常驻小对话框。

#### 定位

- 不遮挡主要角色移动区域
- 在各房间场景中都可保持存在

#### 功能

1. 输入任务或普通对话
2. 接收 OpenClaw 反馈
3. 根据所在房间切换默认上下文和快捷操作

### 8.3 房间上下文联动

#### 办公区

- 侧重显示工作状态和任务执行反馈

#### 会议室

- 侧重任务委托和结果提交

#### 人事部

- 侧重 soul / memory 更新

#### 培训室

- 侧重 skill 安装与查看

#### 休息间

- 侧重低打扰陪伴和休闲状态反馈

### 8.4 接入适配层

前端不得把具体 OpenClaw 地址和协议细节散落在多个组件中，而应统一封装为适配层。

建议接口：

```ts
type OpenClawAdapter = {
  sendMessage(input: string, context?: RoomContext): Promise<Response>
  getSessionStatus(): Promise<Status>
  syncMemory?(payload: MemoryPayload): Promise<void>
  syncSkills?(payload: SkillPayload): Promise<void>
}
```

这样即使未来从 Webchat 切换到 Gateway，也只需替换适配层。

## 9. 前端技术架构

### 9.1 技术选型

- Vite + React + TypeScript：负责工程骨架、路由、页面、表单、HUD、面板、小窗
- Phaser 3：负责游戏地图、角色移动、寻路、碰撞、触发、动画状态
- CSS / 动画层：负责石门开场、问卷浮现、时空穿梭、角色升成等网页演出

### 9.2 分层原则

#### React 负责

- 开场页
- 问卷页
- 角色预览页
- Office HUD
- OpenClaw 小对话框
- 各种功能面板与表单

#### Phaser 负责

- 办公室地图
- 房间布局
- 角色移动
- 自动寻路
- 碰撞与触发区
- 角色动画状态

### 9.3 React 与 Phaser 通信

两层通过明确事件桥通信，不允许相互随意直接操作内部细节。

示例事件：

```ts
type GameEvent =
  | { type: "ROOM_ENTERED"; roomId: RoomId }
  | { type: "ROOM_EXITED"; roomId: RoomId }
  | { type: "CHARACTER_STATE_CHANGED"; state: CharacterState }
  | { type: "TASK_STATE_CHANGED"; taskId: string; status: TaskStatus }
```

### 9.4 建议目录结构

```txt
src/
  app/
    App.tsx
    routes/
      IntroRoute.tsx
      QuizRoute.tsx
      AvatarPreviewRoute.tsx
      OfficeRoute.tsx

  game/
    GameCanvas.tsx
    scenes/
      BootScene.ts
      PreloadScene.ts
      OfficeScene.ts
    systems/
      MovementSystem.ts
      PathfindingSystem.ts
      InteractionSystem.ts
      AnimationSystem.ts
      RoomTriggerSystem.ts
    data/
      mapConfig.ts
      characterRegistry.ts

  features/
    intro/
      StoneGateIntro.tsx
    quiz/
      SbtiQuiz.tsx
      sbtiScoring.ts
    avatar/
      AvatarPreview.tsx
      characterMapping.ts
    office/
      OfficeHUD.tsx
      RoomPanel.tsx
      FloatingChatBox.tsx
    openclaw/
      OpenClawAdapter.ts
      WebchatAdapter.ts
      types.ts

  assets/
    characters/
    maps/
    ui/
    effects/
```

## 10. 分阶段开发与里程碑

### 阶段 1：项目骨架与技术底座

交付：

- Vite + React + TypeScript 初始化
- Phaser 接入
- React / Phaser 事件桥
- 基础路由
- 右下角聊天小窗壳

验收：

- 能本地启动
- 能切换到办公室页
- 办公室页内可渲染 Phaser 场景

### 阶段 2：SBTI 测试与角色生成链路

交付：

- 问卷 UI
- SBTI 评分逻辑
- 结果映射
- 角色称号生成
- 姓名编辑
- 角色预览页

验收：

- 完整测试后可生成对应角色
- 用户可编辑角色姓名
- 可进入数字办公室

### 阶段 3：石门开场与时空穿梭演出

交付：

- 石门开场动画
- 点击开门演出
- 问卷浮现
- 时空穿梭动画
- 升成角色演出页

验收：

- 从进入页面到角色预览的流程连贯且具仪式感

### 阶段 4：数字办公室地图与角色移动

交付：

- 2.5D 办公室地图
- 各房间布局
- 角色出生点
- WASD / 方向键移动
- 点击寻路
- 房间触发点
- 基础碰撞

验收：

- 角色可在地图中移动并进入房间交互

### 阶段 5：房间功能与 OpenClaw 接入

交付：

- 办公区状态面板
- 会议室任务面板
- 人事部 soul / memory 面板
- 培训室 skill 面板
- 休息间状态切换
- OpenClaw Adapter 第一版
- 常驻小对话框

验收：

- 在不同房间可完成对应操作
- 小对话框可发消息并收反馈

### 阶段 6：全角色支持与视觉打磨

交付：

- 全角色资产接入
- 资产审计表
- 缺失素材 fallback
- 动画状态补齐
- 视觉、音效、反馈打磨
- 性能优化

验收：

- 所有测试结果均可对应角色进入办公室
- 项目达到可展示级体验

### 推荐开发顺序

推荐顺序为：

1. 阶段 1
2. 阶段 2
3. 阶段 4
4. 阶段 5
5. 阶段 3
6. 阶段 6

优先保证系统可跑通，再集中打磨演出层和全角色表现。

## 11. 风险与约束

### 11.1 最大风险

1. 全角色素材不完整
2. 缺少原始分层动作素材，真游戏动画制作成本高
3. OpenClaw 深度接口暂未完全明确
4. React 与 Phaser 的状态同步复杂
5. 质量优先、全角色、纯游戏化将显著拉长开发周期

### 11.2 约束处理策略

1. 先做角色资产审计
2. 架构上允许 sprite 与 fallback 动画并存
3. OpenClaw 通过适配层解耦
4. Phaser 只管游戏层，React 只管 UI 层
5. 所有阶段都必须有可运行成果，避免长时间停留在不可见工作状态

## 12. 设计结论

本项目最终定位为：

一个以授权 SBTI 人物体系为核心、以本地 OpenClaw 为能力内核、以 2.5D 游戏化数字办公室为主要承载形式的 PC 网页端数字员工产品。

其关键体验不是“测试一下得到一张图”，而是：

1. 经历仪式化开场和测试
2. 升成为对应人格角色
3. 把角色真正带入一个可以走动和工作的数字办公室
4. 通过空间、状态和对话与 OpenClaw 形成统一体验

该设计已经足够进入 implementation planning 阶段。
