import { Navigate } from "react-router-dom";
import { useCallback, useState } from "react";

import { GameCanvas } from "../../game/GameCanvas";
import { useAppStore } from "../../state/appStore";
import { OfficeHUD } from "./OfficeHUD";
import { RoomPanelHost } from "./RoomPanelHost";
import { FloatingChatBox } from "../openclaw/FloatingChatBox";
import type { RoomId } from "../../types/domain";
import { ROOM_CONTEXTS } from "../../types/domain";
import { selectCurrentPersonaConfig } from "../../state/selectors";
import { getOfficeRoomVisual } from "../../game/scenes/officeEnvironmentVisuals";
import type { OfficeDoorRuntimeState } from "../../game/scenes/officeDoorRuntime";
import { OFFICE_THEME, getOfficeRoomTheme } from "./officeTheme";

const layoutStyle = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  background: OFFICE_THEME.surface.page
} satisfies React.CSSProperties;

const routeDataGridStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage: OFFICE_THEME.effects.dataGrid,
  backgroundSize: "44px 44px",
  opacity: 0.42,
  maskImage: "radial-gradient(circle at 50% 28%, rgba(0,0,0,0.85), transparent 72%)"
} satisfies React.CSSProperties;

const canvasLayerStyle = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  placeItems: "center",
  padding: "28px 24px 80px"
} satisfies React.CSSProperties;

const canvasFrameStyle = {
  position: "relative",
  width: "fit-content",
  padding: "18px",
  borderRadius: "32px",
  border: OFFICE_THEME.border.glass,
  background: OFFICE_THEME.surface.frame,
  boxShadow: OFFICE_THEME.shadow.panel,
  overflow: "hidden"
} satisfies React.CSSProperties;

const currentRoomStageStyle = {
  position: "absolute",
  inset: "18px",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "180px 1fr 190px",
  alignItems: "stretch",
  gap: "18px",
  padding: "24px",
  borderRadius: "30px",
  pointerEvents: "none"
} satisfies React.CSSProperties;

const roomTitleCardStyle = {
  alignSelf: "end",
  justifySelf: "center",
  minWidth: "320px",
  padding: "18px 22px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(8,14,24,0.52) 0%, rgba(7,12,20,0.76) 100%)",
  boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
  textAlign: "center"
} satisfies React.CSSProperties;

const minimapStyle = {
  alignSelf: "start",
  display: "grid",
  gap: "8px",
  padding: "14px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(5, 12, 22, 0.72)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.28)"
} satisfies React.CSSProperties;

const minimapGridStyle = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(3, 34px)",
  gridTemplateRows: "repeat(3, 26px)",
  gap: "6px",
  justifyContent: "center"
} satisfies React.CSSProperties;

const roomDoorStyle = {
  alignSelf: "end",
  justifySelf: "start",
  width: "88px",
  height: "132px",
  position: "relative",
  display: "block",
  borderRadius: "44px 44px 18px 18px",
  border: "2px solid rgba(247,212,139,0.42)",
  background:
    "linear-gradient(180deg, rgba(247,212,139,0.24) 0%, rgba(13,22,34,0.72) 46%, rgba(5,9,16,0.92) 100%)",
  boxShadow: "inset 0 0 24px rgba(247,212,139,0.14), 0 20px 50px rgba(0,0,0,0.36)",
  color: "#F3DCB1",
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase"
} satisfies React.CSSProperties;

const personaSlotStyle = {
  alignSelf: "end",
  justifySelf: "end",
  width: "144px",
  minHeight: "184px",
  display: "grid",
  placeItems: "center",
  padding: "14px",
  borderRadius: "26px",
  border: "1px solid rgba(95,251,241,0.28)",
  background: "linear-gradient(180deg, rgba(95,251,241,0.12) 0%, rgba(7,12,20,0.72) 100%)",
  boxShadow: "0 22px 54px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const overlayLayerStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none"
} satisfies React.CSSProperties;

const panelHostStyle = {
  position: "absolute",
  top: "92px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 3,
  pointerEvents: "auto"
} satisfies React.CSSProperties;

const ambientFrameStyle = {
  position: "absolute",
  inset: "18px",
  borderRadius: "30px",
  border: OFFICE_THEME.border.glass,
  boxShadow: OFFICE_THEME.shadow.glow,
  pointerEvents: "none"
} satisfies React.CSSProperties;

const titleRibbonStyle = {
  position: "absolute",
  left: "50%",
  top: "22px",
  transform: "translateX(-50%)",
  padding: "10px 18px",
  borderRadius: "999px",
  border: OFFICE_THEME.border.glass,
  background: OFFICE_THEME.surface.frame,
  color: OFFICE_THEME.text.accent,
  fontSize: "12px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  pointerEvents: "none"
} satisfies React.CSSProperties;

const minimapPositions: Record<RoomId, React.CSSProperties> = {
  meeting: { gridColumn: "2", gridRow: "1" },
  hr: { gridColumn: "1", gridRow: "2" },
  office: { gridColumn: "2", gridRow: "2" },
  training: { gridColumn: "3", gridRow: "2" },
  rest: { gridColumn: "3", gridRow: "3" }
};

const roomIds = Object.keys(ROOM_CONTEXTS) as RoomId[];

const toHexColor = (value: number) => `#${value.toString(16).padStart(6, "0")}`;

const OFFICE_DOOR_MOTION_CSS = `
  @keyframes office-door-core-hum {
    0%, 100% { transform: translateX(-50%) scale(1); filter: brightness(1); }
    50% { transform: translateX(-50%) scale(1.04); filter: brightness(1.14); }
  }

  @keyframes office-door-rune-cascade {
    0% { opacity: 0.42; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
    100% { opacity: 0.42; transform: translateY(0); }
  }

  @keyframes office-door-threshold-wave {
    0%, 100% { transform: scaleX(1); opacity: 0.8; }
    50% { transform: scaleX(1.06); opacity: 1; }
  }

  .office-door__core--syncing,
  .office-door__core--routing,
  .office-door__core--resonating,
  .office-door__core--release {
    animation: office-door-core-hum 1.8s ease-in-out infinite;
  }

  .office-door__runes--accelerating span,
  .office-door__runes--streaming span,
  .office-door__runes--resonant span,
  .office-door__runes--confirming span {
    animation: office-door-rune-cascade 0.95s ease-in-out infinite;
  }

  .office-door__threshold--pulsing,
  .office-door__threshold--tracking,
  .office-door__threshold--vibrating,
  .office-door__threshold--opening {
    animation: office-door-threshold-wave 1.35s ease-in-out infinite;
    transform-origin: center;
  }
`;

function OfficeCurrentRoomStage({
  roomId,
  persona,
  doorRuntime
}: {
  roomId: RoomId;
  persona: ReturnType<typeof selectCurrentPersonaConfig>;
  doorRuntime: OfficeDoorRuntimeState | null;
}) {
  const visual = getOfficeRoomVisual(roomId);
  const roomTheme = getOfficeRoomTheme(roomId);
  const roomContext = ROOM_CONTEXTS[roomId];
  const accentColor = toHexColor(visual.accent);
  const fillColor = toHexColor(visual.fill);
  const activeDoorRuntime = doorRuntime?.roomId === roomId ? doorRuntime : null;
  const doorAccentColor = toHexColor(activeDoorRuntime?.accentColor ?? visual.accent);
  const doorFillColor = toHexColor(activeDoorRuntime?.fillColor ?? visual.fill);

  const themedStageStyle = {
    ...currentRoomStageStyle,
    background: [
      `radial-gradient(circle at 18% 72%, ${accentColor}33 0%, transparent 26%)`,
      `radial-gradient(circle at 76% 22%, ${accentColor}2e 0%, transparent 24%)`,
      `linear-gradient(180deg, ${fillColor}a8 0%, rgba(7, 12, 22, 0.34) 58%, rgba(4, 8, 14, 0.7) 100%)`
    ].join(", ")
  } satisfies React.CSSProperties;

  return (
    <section
      aria-label="office-current-room-stage"
      data-room-id={roomId}
      data-view-mode="in-room"
      style={themedStageStyle}
    >
      <style aria-label="office-door-motion-styles">{OFFICE_DOOR_MOTION_CSS}</style>
      <aside aria-label="office-minimap" style={minimapStyle}>
        <div style={{ color: "#F3DCB1", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          minimap
        </div>
        <div style={minimapGridStyle}>
          {roomIds.map((id) => {
            const isActive = id === roomId;
            return (
              <span
                aria-current={isActive ? "true" : "false"}
                aria-label={`minimap-room-${id}`}
                key={id}
                style={{
                  ...minimapPositions[id],
                  width: "34px",
                  height: "26px",
                  borderRadius: "10px",
                  border: `1px solid ${isActive ? roomTheme.accent.hex : "rgba(255,255,255,0.14)"}`,
                  background: isActive ? `${roomTheme.accent.hex}33` : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? `0 0 18px ${roomTheme.accent.rgba}` : "none"
                }}
                title={ROOM_CONTEXTS[id].label}
              />
            );
          })}
        </div>
      </aside>

      <div style={roomTitleCardStyle}>
        <div style={{ color: "#CDB792", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          当前室内：{roomContext.label}
        </div>
        <div style={{ marginTop: "8px", color: "#F7F0E3", fontSize: "34px", fontWeight: 800 }}>
          {visual.label}
        </div>
        <div style={{ marginTop: "6px", color: accentColor, fontSize: "12px", letterSpacing: "0.18em" }}>
          {visual.subtitle}
        </div>
      </div>

      <div style={{ display: "grid", alignItems: "end", gap: "18px" }}>
        <div aria-label="persona-room-sprite-slot" style={personaSlotStyle}>
          {persona?.transparent ? (
            <img
              alt={`${persona.title} 房间立绘位`}
              src={persona.transparent}
              style={{
                width: "108px",
                height: "108px",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.42))"
              }}
            />
          ) : null}
        </div>
        <div
          className={`office-door office-door--room-${roomId} office-door--activity-${activeDoorRuntime?.activity ?? "standby"}`}
          aria-label="office-entry-door"
          data-door-activity={activeDoorRuntime?.activity ?? "standby"}
          data-door-runtime-source={activeDoorRuntime ? "scene" : "scene-pending"}
          data-room-id={activeDoorRuntime?.roomId ?? roomId}
          style={{
            ...roomDoorStyle,
            borderColor: `${doorAccentColor}88`,
            background: `linear-gradient(180deg, ${doorAccentColor}24 0%, ${doorFillColor}c4 36%, rgba(5,9,16,0.92) 100%)`,
            boxShadow: `inset 0 0 24px ${doorAccentColor}20, 0 20px 50px rgba(0,0,0,0.36)`
          }}
        >
          <div
            className={`office-door__core office-door__core--${activeDoorRuntime?.core ?? "standby"}`}
            aria-label="office-door-core"
            data-door-core-state={activeDoorRuntime?.core ?? "standby"}
            style={{
              position: "absolute",
              left: "50%",
              top: "18%",
              width: "58%",
              height: "56%",
              transform: "translateX(-50%)",
              borderRadius: "28px 28px 18px 18px",
              background: `radial-gradient(circle at 50% 38%, ${doorAccentColor}cc 0%, ${doorAccentColor}33 38%, rgba(9,13,22,0.96) 100%)`,
              boxShadow: `0 0 18px ${doorAccentColor}55, inset 0 0 14px rgba(255,255,255,0.08)`
            }}
          />
          <div
            className={`office-door__runes office-door__runes--${activeDoorRuntime?.runes ?? "offline"}`}
            aria-label="office-door-runes"
            data-rune-band={activeDoorRuntime?.runes ?? "offline"}
            style={{
              position: "absolute",
              left: "50%",
              top: "12%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "4px"
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                style={{
                  width: "8px",
                  height: "14px",
                  borderRadius: "999px",
                  background: doorAccentColor,
                  boxShadow: `0 0 10px ${doorAccentColor}88`
                }}
              />
            ))}
          </div>
          <div
            className={`office-door__threshold office-door__threshold--${activeDoorRuntime?.threshold ?? "sealed"}`}
            aria-label="office-door-threshold"
            data-threshold-state={activeDoorRuntime?.threshold ?? "sealed"}
            style={{
              position: "absolute",
              left: "14%",
              right: "14%",
              bottom: "10%",
              height: "12%",
              borderRadius: "999px",
              background: `linear-gradient(180deg, ${doorAccentColor}cc 0%, rgba(32,18,8,0.94) 100%)`,
              boxShadow: `0 0 14px ${doorAccentColor}66`
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "16%",
              transform: "translateX(-50%)",
              color: "#F3DCB1",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase"
            }}
          >
            ENTRY
          </div>
        </div>
      </div>
    </section>
  );
}

export function OfficeRoute() {
  const currentRoomId = useAppStore((state) => state.currentRoomId ?? "office");
  const personaConfig = useAppStore(selectCurrentPersonaConfig);
  const [sceneDoorRuntime, setSceneDoorRuntime] = useState<OfficeDoorRuntimeState | null>(null);
  const canEnterOffice = useAppStore(
    (state) =>
      state.result !== null &&
      state.character.title === state.result.title &&
      state.phase === "office"
  );
  const handleRoomChanged = useCallback((roomId: RoomId | null) => {
    useAppStore.setState((state) =>
      state.currentRoomId === roomId
        ? state
        : {
            ...state,
            currentRoomId: roomId
          }
    );
  }, []);

  if (!canEnterOffice) {
    return <Navigate to="/quiz" replace />;
  }

  return (
    <section
      aria-label="office-scene-layout"
      data-testid="office-scene-layout"
      data-office-theme={OFFICE_THEME.id}
      style={layoutStyle}
    >
      <div aria-hidden="true" data-testid="office-route-grid" style={routeDataGridStyle} />
      <div aria-label="office-scene-canvas-layer" style={canvasLayerStyle}>
        <div aria-label="office-observation-window" style={canvasFrameStyle}>
          <div style={ambientFrameStyle} />
          <div style={titleRibbonStyle}>SBTI Digital Office</div>
          <OfficeCurrentRoomStage roomId={currentRoomId} persona={personaConfig} doorRuntime={sceneDoorRuntime} />
          <GameCanvas onRoomChanged={handleRoomChanged} onDoorStateChanged={setSceneDoorRuntime} />
        </div>
      </div>
      <div aria-label="office-scene-overlay-layer" style={overlayLayerStyle}>
        <OfficeHUD />
        <div style={panelHostStyle}>
          <RoomPanelHost />
        </div>
        <FloatingChatBox />
      </div>
    </section>
  );
}
