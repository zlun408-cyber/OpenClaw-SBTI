import { useAppStore } from "../../state/appStore";
import {
  selectCharacterLabel,
  selectCurrentPersonaAssetKey,
  selectCurrentPersonaConfig,
  selectCurrentRoomContext
} from "../../state/selectors";
import type { CharacterState } from "../../types/domain";
import { createGlassTerminalStyle, getOfficeRoomTheme, OFFICE_THEME } from "./officeTheme";

const TASK_STATUS_LABELS: Record<CharacterState, string> = {
  idle: "Idle",
  walk: "Walking",
  work: "Working",
  rest: "Resting",
  sleep: "Sleeping",
  dance: "Dancing",
  train: "Training",
  "task-submit": "Submitting task"
};

const hudStyle = {
  position: "absolute",
  top: "28px",
  left: "28px",
  width: "min(300px, calc(100vw - 420px))",
  display: "grid",
  gap: "12px",
  padding: "16px 18px",
  borderRadius: "22px",
  border: "1px solid rgba(247,212,139,0.16)",
  background: "linear-gradient(180deg, rgba(16, 20, 32, 0.92) 0%, rgba(10, 14, 22, 0.88) 100%)",
  color: "#F7F0E3",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.34)",
  backdropFilter: "blur(12px)",
  pointerEvents: "auto"
} satisfies React.CSSProperties;

const chipStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(247,212,139,0.14)",
  background: "rgba(247,212,139,0.08)",
  color: "#F3DCB1",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
} satisfies React.CSSProperties;

export function OfficeHUD() {
  const characterName = useAppStore(selectCharacterLabel);
  const roomContext = useAppStore(selectCurrentRoomContext);
  const personaConfig = useAppStore(selectCurrentPersonaConfig);
  const personaAssetKey = useAppStore(selectCurrentPersonaAssetKey);
  const currentRoomId = useAppStore((state) => state.currentRoomId);
  const currentTaskStatus = useAppStore(
    (state) => TASK_STATUS_LABELS[state.character.state]
  );
  const roomTheme = getOfficeRoomTheme(currentRoomId);
  const themedHudStyle = {
    ...createGlassTerminalStyle(currentRoomId, hudStyle),
    border: `1px solid ${roomTheme.accent.rgba}`
  } satisfies React.CSSProperties;

  return (
    <aside
      aria-label="office-hud"
      data-office-theme={OFFICE_THEME.id}
      data-office-room={roomTheme.roomId}
      data-persona-code={personaConfig?.type ?? "none"}
      data-persona-asset-key={personaAssetKey ?? "none"}
      style={themedHudStyle}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          backgroundImage: OFFICE_THEME.effects.scanline,
          opacity: 0.14,
          pointerEvents: "none"
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <div style={{ color: "#F3DCB1", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Digital Employee
          </div>
          <div style={{ marginTop: "4px", fontSize: "24px", fontWeight: 700 }}>{characterName}</div>
          {personaConfig ? (
            <div
              aria-label="active-persona"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
                color: "#AEEFEB",
                fontSize: "12px",
                letterSpacing: "0.08em"
              }}
            >
              {personaConfig.transparent ? (
                <img
                  alt={`${personaConfig.title} 办公室头像`}
                  src={personaConfig.transparent}
                  style={{
                    width: "28px",
                    height: "28px",
                    objectFit: "contain",
                    imageRendering: "pixelated"
                  }}
                />
              ) : null}
              <span style={{ fontWeight: 700 }}>{personaConfig.type}</span>
              <span style={{ color: "#D9FCF7" }}>· {personaConfig.title}</span>
            </div>
          ) : null}
        </div>
        <div style={chipStyle}>{currentTaskStatus}</div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "8px",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <div style={{ color: "#CDB792", fontSize: "12px" }}>当前房间</div>
          <div style={{ marginTop: "4px", fontWeight: 600 }}>{roomContext?.label ?? "办公室"}</div>
        </div>

        <div
          style={{
            padding: "12px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <div style={{ color: "#CDB792", fontSize: "12px" }}>控制方式</div>
          <div style={{ marginTop: "4px", fontWeight: 600 }}>WASD / Click</div>
        </div>
      </div>
    </aside>
  );
}
