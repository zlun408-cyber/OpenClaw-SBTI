import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";
import { AvatarPreviewCard } from "./AvatarPreviewCard";

export function AvatarPreviewRoute() {
  const navigate = useNavigate();
  const result = useAppStore((state) => state.result);
  const character = useAppStore((state) => state.character);
  const enterOffice = useAppStore((state) => state.enterOffice);
  const [customName, setCustomName] = useState(character.customName);

  if (result === null) {
    return <Navigate to="/quiz" replace />;
  }

  const handleEnterOffice = () => {
    enterOffice(customName);
    navigate("/office");
  };

  return (
    <>
      <h2>Avatar Preview</h2>
      <AvatarPreviewCard
        character={character}
        customName={customName}
        onCustomNameChange={setCustomName}
        onEnterOffice={handleEnterOffice}
      />
    </>
  );
}
