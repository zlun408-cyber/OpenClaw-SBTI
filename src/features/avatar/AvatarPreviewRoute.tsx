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
  const canPreviewAvatar =
    (phase === "avatarPreview" || phase === "office") &&
    result !== null &&
    character.title === result.title;

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
    <>
      <h2>Avatar Preview</h2>
      <AvatarPreviewCard
        character={character}
        customName={customName}
        onCustomNameChange={handleCustomNameChange}
        onEnterOffice={handleEnterOffice}
      />
    </>
  );
}
