import { Navigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";

export function OfficeRoute() {
  const canEnterOffice = useAppStore(
    (state) =>
      state.result !== null &&
      state.character.title === state.result.title &&
      (state.phase === "avatarPreview" || state.phase === "office")
  );

  if (!canEnterOffice) {
    return <Navigate to="/quiz" replace />;
  }

  return <h1>Office</h1>;
}
