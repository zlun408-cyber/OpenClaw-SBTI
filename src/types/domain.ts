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

export type QuizResult = {
  resultType: string;
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

export const ROOM_CONTEXTS: Readonly<Record<RoomId, RoomContext>> = {
  office: { id: "office", label: "办公室" },
  meeting: { id: "meeting", label: "会议室" },
  hr: { id: "hr", label: "人事部" },
  training: { id: "training", label: "培训室" },
  rest: { id: "rest", label: "休息区" }
};

export const DEFAULT_CHARACTER_PROFILE: Readonly<CharacterProfile> = {
  title: "数字员工",
  customName: "",
  state: "idle"
};
