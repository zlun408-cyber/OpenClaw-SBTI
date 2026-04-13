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
