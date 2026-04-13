import { useNavigate } from "react-router-dom";

import { StoneGateScene } from "./StoneGateScene";

export function StoneGateRoute() {
  const navigate = useNavigate();

  return <StoneGateScene onStartTrial={() => navigate("/quiz")} />;
}
