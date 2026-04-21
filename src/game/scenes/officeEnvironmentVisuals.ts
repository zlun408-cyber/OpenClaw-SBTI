import type { RoomId } from "../../types/domain";

export type OfficeRoomEquipment = {
  id: string;
  kind: "console" | "screen" | "pillar" | "terminal" | "pod" | "beacon";
  label: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  alpha: number;
};

export type OfficeSignalNode = {
  offsetX: number;
  offsetY: number;
  radius: number;
  alpha: number;
};

export type OfficeRoomVisual = {
  label: string;
  subtitle: string;
  fill: number;
  accent: number;
  shadow: number;
  equipment: OfficeRoomEquipment[];
  signalNodes: OfficeSignalNode[];
};

type OfficeAmbientGlow = {
  // Scene-center-relative offsets resolved by OfficeScene at runtime.
  x: number;
  y: number;
  radius: number;
  color: number;
  alpha: number;
};

type OfficeGridLayer = {
  spacing: number;
  alpha: number;
  color: number;
};

type OfficeSignalPath = {
  id: string;
  color: number;
  alpha: number;
  pulseOffset: number;
  pulseSpeed: number;
  // Scene-center-relative offsets resolved by OfficeScene at runtime.
  points: Array<{ x: number; y: number }>;
};

type OfficeParticle = {
  id: string;
  // Scene-center-relative offsets resolved by OfficeScene at runtime.
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: number;
};

type OfficeForegroundOverlay = {
  id: string;
  // Scene-center-relative top-left offsets resolved by OfficeScene at runtime.
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
  color: number;
};

export const OFFICE_VISUAL_DEPTHS = {
  backdrop: 0,
  signalPaths: 2,
  rooms: 4,
  roomEquipment: 6,
  dynamicSignals: 8,
  avatarShadow: 10,
  avatarGlow: 11,
  avatarAura: 12,
  avatarBody: 14,
  avatarLabels: 15,
  foreground: 18
} as const;

export const OFFICE_ROOM_VISUALS: Record<RoomId, OfficeRoomVisual> = {
  office: {
    label: "Main Office",
    subtitle: "Command / Observe / Sync",
    fill: 0x182f3a,
    accent: 0x69d6ff,
    shadow: 0x06131c,
    equipment: [
      { id: "office-control-ring", kind: "console", label: "Control Ring", offsetX: 0, offsetY: 16, width: 54, height: 22, alpha: 0.36 },
      { id: "office-status-wall", kind: "screen", label: "Status Wall", offsetX: -44, offsetY: -24, width: 42, height: 12, alpha: 0.32 },
      { id: "office-sync-beacon", kind: "beacon", label: "Sync Beacon", offsetX: 46, offsetY: -18, width: 18, height: 18, alpha: 0.42 }
    ],
    signalNodes: [
      { offsetX: -54, offsetY: 32, radius: 3, alpha: 0.44 },
      { offsetX: 58, offsetY: -28, radius: 4, alpha: 0.34 }
    ]
  },
  meeting: {
    label: "Meeting Room",
    subtitle: "Brief / Dispatch / Submit",
    fill: 0x243246,
    accent: 0xf0ca87,
    shadow: 0x0b111c,
    equipment: [
      { id: "meeting-board", kind: "screen", label: "Mission Board", offsetX: 0, offsetY: -30, width: 92, height: 16, alpha: 0.34 },
      { id: "meeting-table", kind: "console", label: "Dispatch Table", offsetX: 0, offsetY: 18, width: 76, height: 20, alpha: 0.34 },
      { id: "meeting-submit-light", kind: "beacon", label: "Submit Light", offsetX: 56, offsetY: -2, width: 12, height: 28, alpha: 0.38 }
    ],
    signalNodes: [
      { offsetX: -56, offsetY: -26, radius: 3, alpha: 0.36 },
      { offsetX: 54, offsetY: 30, radius: 4, alpha: 0.42 }
    ]
  },
  hr: {
    label: "HR",
    subtitle: "Soul / Memory / Identity",
    fill: 0x302846,
    accent: 0xd3b2f3,
    shadow: 0x100c1b,
    equipment: [
      { id: "hr-soul-pillar", kind: "pillar", label: "Soul Pillar", offsetX: -48, offsetY: 4, width: 16, height: 54, alpha: 0.34 },
      { id: "hr-memory-vault", kind: "pillar", label: "Memory Vault", offsetX: 44, offsetY: 2, width: 20, height: 58, alpha: 0.32 },
      { id: "hr-scan-line", kind: "screen", label: "Identity Scan", offsetX: 0, offsetY: -30, width: 84, height: 10, alpha: 0.3 }
    ],
    signalNodes: [
      { offsetX: -48, offsetY: -26, radius: 3, alpha: 0.4 },
      { offsetX: 50, offsetY: 28, radius: 3, alpha: 0.38 }
    ]
  },
  training: {
    label: "Training Room",
    subtitle: "Skill / Module / Growth",
    fill: 0x183934,
    accent: 0x9fe3c4,
    shadow: 0x081713,
    equipment: [
      { id: "training-skill-terminal", kind: "terminal", label: "Skill Terminal", offsetX: -42, offsetY: 12, width: 24, height: 36, alpha: 0.36 },
      { id: "training-course-screen", kind: "screen", label: "Course Screen", offsetX: 0, offsetY: -28, width: 88, height: 14, alpha: 0.3 },
      { id: "training-growth-pillar", kind: "pillar", label: "Growth Pillar", offsetX: 48, offsetY: 4, width: 18, height: 52, alpha: 0.34 }
    ],
    signalNodes: [
      { offsetX: -58, offsetY: 24, radius: 3, alpha: 0.38 },
      { offsetX: 56, offsetY: -22, radius: 4, alpha: 0.36 }
    ]
  },
  rest: {
    label: "Rest Area",
    subtitle: "Restore / Stabilize / Return",
    fill: 0x2a3440,
    accent: 0x8ed0ff,
    shadow: 0x0c1218,
    equipment: [
      { id: "rest-recovery-pod", kind: "pod", label: "Recovery Pod", offsetX: 0, offsetY: 16, width: 46, height: 24, alpha: 0.36 },
      { id: "rest-ambient-screen", kind: "screen", label: "Ambient Screen", offsetX: -46, offsetY: -20, width: 34, height: 12, alpha: 0.28 },
      { id: "rest-breathing-beacon", kind: "beacon", label: "Breathing Beacon", offsetX: 48, offsetY: -12, width: 16, height: 16, alpha: 0.4 }
    ],
    signalNodes: [
      { offsetX: -52, offsetY: 28, radius: 3, alpha: 0.32 },
      { offsetX: 54, offsetY: -24, radius: 4, alpha: 0.3 }
    ]
  }
};

export const OFFICE_ENVIRONMENT_LAYERS: {
  grid: OfficeGridLayer;
  ambientGlows: OfficeAmbientGlow[];
  signalPaths: OfficeSignalPath[];
  particles: OfficeParticle[];
  foregroundOverlays: OfficeForegroundOverlay[];
} = {
  grid: {
    spacing: 24,
    alpha: 0.16,
    color: 0x28485a
  },
  ambientGlows: [
    { x: -82, y: -48, radius: 120, color: 0x69d6ff, alpha: 0.12 },
    { x: 122, y: 4, radius: 96, color: 0xf0ca87, alpha: 0.1 },
    { x: 26, y: 108, radius: 132, color: 0x9fe3c4, alpha: 0.08 }
  ],
  signalPaths: [
    {
      id: "north-link",
      color: 0x69d6ff,
      alpha: 0.24,
      pulseOffset: 0.08,
      pulseSpeed: 0.42,
      points: [{ x: -122, y: -24 }, { x: -22, y: -24 }, { x: 26, y: -56 }]
    },
    {
      id: "west-link",
      color: 0xd3b2f3,
      alpha: 0.2,
      pulseOffset: 0.36,
      pulseSpeed: 0.34,
      points: [{ x: -126, y: 40 }, { x: -48, y: 40 }, { x: -22, y: 0 }]
    },
    {
      id: "east-link",
      color: 0xf0ca87,
      alpha: 0.22,
      pulseOffset: 0.62,
      pulseSpeed: 0.48,
      points: [{ x: 26, y: -56 }, { x: 98, y: -56 }, { x: 126, y: 8 }]
    },
    {
      id: "south-link",
      color: 0x9fe3c4,
      alpha: 0.22,
      pulseOffset: 0.84,
      pulseSpeed: 0.38,
      points: [{ x: -22, y: 0 }, { x: -22, y: 88 }, { x: 50, y: 88 }]
    }
  ],
  particles: [
    { id: "ambient-particle-1", x: -144, y: -80, radius: 1, alpha: 0.3, color: 0x69d6ff },
    { id: "ambient-particle-2", x: -90, y: -52, radius: 2, alpha: 0.24, color: 0xf0ca87 },
    { id: "ambient-particle-3", x: -30, y: -98, radius: 1, alpha: 0.28, color: 0xd3b2f3 },
    { id: "ambient-particle-4", x: 38, y: -66, radius: 2, alpha: 0.26, color: 0x9fe3c4 },
    { id: "ambient-particle-5", x: 94, y: -42, radius: 1, alpha: 0.22, color: 0x69d6ff },
    { id: "ambient-particle-6", x: 138, y: -4, radius: 2, alpha: 0.25, color: 0xf0ca87 },
    { id: "ambient-particle-7", x: 12, y: 58, radius: 1, alpha: 0.24, color: 0x9fe3c4 },
    { id: "ambient-particle-8", x: -82, y: 104, radius: 2, alpha: 0.2, color: 0xd3b2f3 }
  ],
  foregroundOverlays: [
    { id: "top-glass", x: -210, y: -140, width: 420, height: 28, alpha: 0.08, color: 0xd7f1ff },
    { id: "left-frame", x: -210, y: -140, width: 18, height: 280, alpha: 0.1, color: 0x89c8ff },
    { id: "right-frame", x: 192, y: -140, width: 18, height: 280, alpha: 0.1, color: 0x89c8ff }
  ]
};

export const getOfficeRoomVisual = (roomId: RoomId): OfficeRoomVisual => {
  return OFFICE_ROOM_VISUALS[roomId];
};
