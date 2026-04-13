import { useEffect, useState } from "react";

export type GateStage = "closed" | "opening" | "revealed";

const GATE_OPENING_MS = 450;

type StoneGateSceneProps = {
  onStartTrial: () => void;
};

export function StoneGateScene({ onStartTrial }: StoneGateSceneProps) {
  const [stage, setStage] = useState<GateStage>("closed");

  useEffect(() => {
    if (stage !== "opening") {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setStage("revealed");
    }, GATE_OPENING_MS);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [stage]);

  const openGate = () => {
    if (stage !== "closed") {
      return;
    }

    setStage("opening");
  };

  return (
    <section className={`stone-gate stone-gate--${stage}`} data-stage={stage}>
      <h1>SBTI Digital Employee</h1>
      <p>石门状态：{stage === "closed" ? "封印" : stage === "opening" ? "开启中" : "已开启"}</p>
      <button type="button" onClick={openGate} disabled={stage !== "closed"}>
        穿越之门
      </button>
      {stage === "revealed" && (
        <button type="button" onClick={onStartTrial}>
          开始试炼
        </button>
      )}
    </section>
  );
}
