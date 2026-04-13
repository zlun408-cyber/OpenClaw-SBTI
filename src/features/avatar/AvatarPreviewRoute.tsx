import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";
import { AvatarPreviewCard } from "./AvatarPreviewCard";

export function AvatarPreviewRoute() {
  const navigate = useNavigate();
  const character = useAppStore((state) => state.character);
  const [customName, setCustomName] = useState(character.customName);

  const enterOffice = () => {
    useAppStore.setState((state) => ({
      ...state,
      phase: "office",
      character: {
        ...state.character,
        customName: customName.trim()
      }
    }));
    navigate("/office");
  };

  return (
    <>
      <h2>Avatar Preview</h2>
      <AvatarPreviewCard
        character={character}
        customName={customName}
        onCustomNameChange={setCustomName}
        onEnterOffice={enterOffice}
      />
    </>
  );
}
