import { useEffect, useState } from "react";

export type GateStage = "closed" | "opening" | "revealed";

const GATE_OPENING_MS = 450;

const stageLabels: Record<GateStage, string> = {
  closed: "封印",
  opening: "开启中",
  revealed: "已开启"
};

const leafMotionStates: Record<GateStage, string> = {
  closed: "sealed",
  opening: "opening",
  revealed: "revealed"
};

const coreEnergyStates: Record<GateStage, string> = {
  closed: "dormant",
  opening: "charging",
  revealed: "open"
};

const thresholdStates: Record<GateStage, string> = {
  closed: "sealed",
  opening: "charging",
  revealed: "open"
};

const STONE_GATE_MOTION_CSS = `
  @keyframes stone-gate-leaf-open-left {
    0% { transform: translateX(0) scaleY(1); }
    35% { transform: translateX(-8%) scaleY(1.01); }
    100% { transform: translateX(-48%) scaleY(1); }
  }

  @keyframes stone-gate-leaf-open-right {
    0% { transform: translateX(0) scaleY(1); }
    35% { transform: translateX(8%) scaleY(1.01); }
    100% { transform: translateX(48%) scaleY(1); }
  }

  @keyframes stone-gate-core-spin {
    0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.96); }
    100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.04); }
  }

  @keyframes stone-gate-rune-flicker {
    0%, 100% { opacity: 0.72; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-3px); }
  }

  @keyframes stone-gate-threshold-pulse {
    0%, 100% { transform: scaleX(1); filter: brightness(1); }
    50% { transform: scaleX(1.04); filter: brightness(1.18); }
  }

  .stone-gate__leaf { transition: transform 180ms ease, filter 180ms ease; }
  .stone-gate__leaf--sealed { transform: translateX(0); }
  .stone-gate__leaf--opening.stone-gate__leaf--left { animation: stone-gate-leaf-open-left 450ms ease forwards; }
  .stone-gate__leaf--opening.stone-gate__leaf--right { animation: stone-gate-leaf-open-right 450ms ease forwards; }
  .stone-gate__leaf--revealed.stone-gate__leaf--left { transform: translateX(-48%); }
  .stone-gate__leaf--revealed.stone-gate__leaf--right { transform: translateX(48%); }

  .stone-gate__core--charging,
  .stone-gate__core--open {
    animation: stone-gate-core-spin 7.5s linear infinite;
  }

  .stone-gate__runes--charging span,
  .stone-gate__runes--open span {
    animation: stone-gate-rune-flicker 1.2s ease-in-out infinite;
  }

  .stone-gate__threshold--charging,
  .stone-gate__threshold--open {
    animation: stone-gate-threshold-pulse 1.8s ease-in-out infinite;
    transform-origin: center;
  }
`;

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

  const leafMotionState = leafMotionStates[stage];
  const coreEnergyState = coreEnergyStates[stage];
  const thresholdState = thresholdStates[stage];
  const runeState = stage === "closed" ? "dormant" : stage === "opening" ? "charging" : "open";

  return (
    <section
      className={`stone-gate stone-gate--${stage}`}
      data-stage={stage}
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        background:
          "radial-gradient(circle at 50% 18%, rgba(239, 209, 147, 0.18), transparent 24%), linear-gradient(180deg, #05070c 0%, #0d111b 48%, #05070b 100%)",
        color: "#F7EEDB"
      }}
    >
      <div style={{ display: "grid", gap: "24px", justifyItems: "center", width: "min(880px, 100%)" }}>
        <style aria-label="stone-gate-motion-styles">{STONE_GATE_MOTION_CSS}</style>
        <div style={{ textAlign: "center", display: "grid", gap: "8px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(36px, 5vw, 62px)", letterSpacing: "0.08em" }}>
            SBTI Digital Employee
          </h1>
          <p style={{ margin: 0, color: "#D9C7A4", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            石门状态：{stageLabels[stage]}
          </p>
        </div>

        <div
          aria-label="stone-gate-portal"
          style={{
            position: "relative",
            width: "min(640px, 100%)",
            aspectRatio: "1.18 / 1",
            borderRadius: "40px",
            overflow: "hidden",
            background:
              "radial-gradient(circle at 50% 24%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(180deg, rgba(22,28,40,0.98) 0%, rgba(6,8,14,0.96) 100%)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(248,226,187,0.08)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "7% 11%",
              borderRadius: "220px 220px 32px 32px",
              background:
                stage === "closed"
                  ? "radial-gradient(circle at 50% 42%, rgba(83, 124, 162, 0.12), rgba(10,14,20,0.92) 66%)"
                  : "radial-gradient(circle at 50% 42%, rgba(117, 233, 255, 0.38), rgba(60, 98, 161, 0.24) 28%, rgba(7, 14, 28, 0.92) 72%)",
              boxShadow:
                stage === "revealed"
                  ? "0 0 48px rgba(117, 233, 255, 0.28), inset 0 0 34px rgba(182, 240, 255, 0.14)"
                  : "inset 0 0 24px rgba(255,255,255,0.06)"
            }}
          />

          <div
            className={`stone-gate__threshold stone-gate__threshold--${thresholdState}`}
            aria-label="stone-gate-threshold"
            data-threshold-state={thresholdState}
            style={{
              position: "absolute",
              left: "16%",
              right: "16%",
              bottom: "12%",
              height: "12%",
              borderRadius: "18px",
              background:
                stage === "closed"
                  ? "linear-gradient(180deg, rgba(73, 55, 37, 0.72) 0%, rgba(22, 16, 11, 0.96) 100%)"
                  : "linear-gradient(180deg, rgba(241, 209, 141, 0.44) 0%, rgba(43, 24, 8, 0.96) 100%)",
              boxShadow:
                stage === "revealed"
                  ? "0 0 26px rgba(241, 209, 141, 0.28), inset 0 0 20px rgba(255,255,255,0.08)"
                  : "inset 0 0 14px rgba(0,0,0,0.32)"
            }}
          />

          <div
            className={`stone-gate__runes stone-gate__runes--${runeState}`}
            aria-label="stone-gate-runes"
            data-rune-state={runeState}
            style={{
              position: "absolute",
              left: "50%",
              top: "12%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "10px"
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                style={{
                  width: "14px",
                  height: "28px",
                  borderRadius: "10px",
                  background:
                    stage === "closed"
                      ? "rgba(129, 150, 170, 0.18)"
                      : stage === "opening"
                        ? "rgba(147, 232, 255, 0.62)"
                        : "rgba(241, 209, 141, 0.84)",
                  boxShadow:
                    stage === "closed"
                      ? "none"
                      : stage === "opening"
                        ? "0 0 16px rgba(147, 232, 255, 0.34)"
                        : "0 0 18px rgba(241, 209, 141, 0.38)"
                }}
              />
            ))}
          </div>

          <div
            className={`stone-gate__core stone-gate__core--${coreEnergyState}`}
            aria-label="stone-gate-core"
            data-energy-state={coreEnergyState}
            style={{
              position: "absolute",
              left: "50%",
              top: "42%",
              width: stage === "revealed" ? "104px" : stage === "opening" ? "82px" : "58px",
              height: stage === "revealed" ? "104px" : stage === "opening" ? "82px" : "58px",
              transform: "translate(-50%, -50%)",
              borderRadius: "999px",
              background:
                stage === "closed"
                  ? "radial-gradient(circle, rgba(113, 134, 154, 0.32) 0%, rgba(17, 21, 29, 0.9) 72%)"
                  : stage === "opening"
                    ? "radial-gradient(circle, rgba(125, 243, 255, 0.92) 0%, rgba(79, 131, 208, 0.42) 52%, rgba(14, 19, 31, 0.18) 100%)"
                    : "radial-gradient(circle, rgba(255, 236, 187, 0.98) 0%, rgba(137, 233, 255, 0.72) 36%, rgba(52, 93, 155, 0.18) 100%)",
              boxShadow:
                stage === "closed"
                  ? "0 0 0 1px rgba(255,255,255,0.04)"
                  : stage === "opening"
                    ? "0 0 28px rgba(125, 243, 255, 0.32)"
                    : "0 0 44px rgba(255, 236, 187, 0.4), 0 0 72px rgba(125, 243, 255, 0.28)"
            }}
          />

          <div
            className={`stone-gate__leaf stone-gate__leaf--left stone-gate__leaf--${leafMotionState}`}
            aria-label="stone-gate-left-leaf"
            data-motion-state={leafMotionState}
            style={{
              position: "absolute",
              left: "10%",
              top: "7%",
              bottom: "8%",
              width: "31%",
              borderRadius: "30px 18px 24px 32px",
              background:
                "linear-gradient(180deg, rgba(116, 103, 81, 0.96) 0%, rgba(68, 54, 39, 0.98) 52%, rgba(35, 28, 22, 1) 100%)",
              boxShadow: "inset -10px 0 20px rgba(0,0,0,0.28), 0 20px 32px rgba(0,0,0,0.26)"
            }}
          />

          <div
            className={`stone-gate__leaf stone-gate__leaf--right stone-gate__leaf--${leafMotionState}`}
            aria-label="stone-gate-right-leaf"
            data-motion-state={leafMotionState}
            style={{
              position: "absolute",
              right: "10%",
              top: "7%",
              bottom: "8%",
              width: "31%",
              borderRadius: "18px 30px 32px 24px",
              background:
                "linear-gradient(180deg, rgba(116, 103, 81, 0.96) 0%, rgba(68, 54, 39, 0.98) 52%, rgba(35, 28, 22, 1) 100%)",
              boxShadow: "inset 10px 0 20px rgba(0,0,0,0.28), 0 20px 32px rgba(0,0,0,0.26)"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={openGate}
            disabled={stage !== "closed"}
            style={{
              minWidth: "148px",
              padding: "12px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(241,209,141,0.28)",
              background: "linear-gradient(180deg, rgba(241,209,141,0.16) 0%, rgba(16,22,33,0.92) 100%)",
              color: "#F7EEDB",
              cursor: stage === "closed" ? "pointer" : "default"
            }}
          >
            穿越之门
          </button>
          {stage === "revealed" && (
            <button
              type="button"
              onClick={onStartTrial}
              style={{
                minWidth: "148px",
                padding: "12px 20px",
                borderRadius: "999px",
                border: "1px solid rgba(125,243,255,0.34)",
                background: "linear-gradient(180deg, rgba(125,243,255,0.2) 0%, rgba(8,14,26,0.96) 100%)",
                color: "#F1F8FF",
                cursor: "pointer"
              }}
            >
              开始试炼
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
