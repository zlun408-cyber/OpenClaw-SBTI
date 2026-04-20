import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";
import { AvatarPreviewCard } from "./AvatarPreviewCard";

export function AvatarPreviewRoute() {
  const navigate = useNavigate();
  const phase = useAppStore((state) => state.phase);
  const result = useAppStore((state) => state.result);
  const character = useAppStore((state) => state.character);
  const enterOffice = useAppStore((state) => state.enterOffice);
  const [customName, setCustomName] = useState(character.customName);
  const customNameRef = useRef(customName);
  const hasCoherentResult = result !== null && character.title === result.title;

  if (phase === "office" && hasCoherentResult) {
    return <Navigate to="/office" replace />;
  }

  const canPreviewAvatar = phase === "avatarPreview" && hasCoherentResult;

  if (!canPreviewAvatar) {
    return <Navigate to="/quiz" replace />;
  }

  const handleEnterOffice = () => {
    enterOffice(customNameRef.current);
    navigate("/office");
  };

  const handleCustomNameChange = (value: string) => {
    customNameRef.current = value;
    setCustomName(value);
  };

  return (
    <main
      data-testid="avatar-preview-route"
      data-avatar-preview-theme="sbti-result"
      style={{
        minHeight: "100vh",
        padding: "32px 24px 48px",
        background:
          "radial-gradient(circle at top, rgba(95,251,241,0.12), transparent 38%), linear-gradient(180deg, #070b16 0%, #05070f 100%)",
        color: "#e9f7ff"
      }}
    >
      <header style={{ maxWidth: "1100px", margin: "0 auto 24px" }}>
        <p
          style={{
            margin: 0,
            color: "#5ffbf1",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontSize: "12px"
          }}
        >
          SBTI RESULT ARCHIVE
        </p>
        <h2 style={{ margin: "10px 0 8px", fontSize: "clamp(32px, 5vw, 52px)" }}>Avatar Preview</h2>
        <p style={{ margin: 0, maxWidth: "720px", color: "rgba(233,247,255,0.74)", lineHeight: 1.6 }}>
          你的数字人格已完成归档。确认结果卡、命名你的分身，然后进入办公室开始第一天。
        </p>
      </header>
      <AvatarPreviewCard
        character={character}
        result={result}
        customName={customName}
        onCustomNameChange={handleCustomNameChange}
        onEnterOffice={handleEnterOffice}
      />
    </main>
  );
}
