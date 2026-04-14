export type AppPhase = "intro" | "quiz" | "warp" | "avatarPreview" | "office";

export type RoomId = "office" | "meeting" | "hr" | "training" | "rest";

export type CharacterState =
  | "idle"
  | "walk"
  | "work"
  | "rest"
  | "sleep"
  | "dance"
  | "train"
  | "task-submit";

export type QuizResultType = "CTRL" | "EXEC" | "HARM";

export type QuizResult = {
  resultType: QuizResultType;
  title: string;
};

export type CharacterProfile = {
  title: string;
  customName: string;
  state: CharacterState;
};

export type RoomContext = {
  id: RoomId;
  label: string;
};

export type MeetingTaskStatus = "new" | "in_progress" | "ready_to_submit" | "submitted";
export type MeetingTaskSource = "seed" | "chat";

export type MeetingTask = {
  id: string;
  title: string;
  description: string;
  source: MeetingTaskSource;
  status: MeetingTaskStatus;
  createdAt: string;
  updatedAt: string;
  resultText: string;
};

export type TrainingSkillStatus = "available" | "installing" | "installed" | "failed";
export type TrainingSkillSource = "preset" | "chat";
export type TrainingSkillInstallChannel = "openclaw" | "local";

export type TrainingSkill = {
  id: string;
  name: string;
  description: string;
  source: TrainingSkillSource;
  status: TrainingSkillStatus;
  installChannel: TrainingSkillInstallChannel | null;
  createdAt: string;
  updatedAt: string;
};

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

const deepFreeze = <T extends object>(value: T): DeepReadonly<T> => {
  Object.freeze(value);
  Object.values(value).forEach((nested) => {
    if (nested && typeof nested === "object" && !Object.isFrozen(nested)) {
      deepFreeze(nested);
    }
  });
  return value as DeepReadonly<T>;
};

export const ROOM_CONTEXTS = deepFreeze({
  office: { id: "office", label: "办公室" },
  meeting: { id: "meeting", label: "会议室" },
  hr: { id: "hr", label: "人事部" },
  training: { id: "training", label: "培训室" },
  rest: { id: "rest", label: "休息区" }
}) satisfies DeepReadonly<Record<RoomId, RoomContext>>;

export const DEFAULT_CHARACTER_PROFILE: Readonly<CharacterProfile> = {
  title: "数字员工",
  customName: "",
  state: "idle"
};
