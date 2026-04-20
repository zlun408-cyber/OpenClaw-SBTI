import { useEffect, useState } from "react";

export type GateStage = "closed" | "opening" | "revealed";

const GATE_OPENING_MS = 650;

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

const seamStates: Record<GateStage, string> = {
  closed: "sealed",
  opening: "glowing",
  revealed: "open"
};

const fireStates: Record<GateStage, string> = {
  closed: "ember",
  opening: "blazing",
  revealed: "revealed"
};

const thresholdStates: Record<GateStage, string> = {
  closed: "sealed",
  opening: "charging",
  revealed: "open"
};

const STONE_GATE_MOTION_CSS = `
  @keyframes stone-gate-door-open-left {
    0% { transform: translateX(0); }
    18% { transform: translateX(-3%); }
    100% { transform: translateX(-52%); }
  }

  @keyframes stone-gate-door-open-right {
    0% { transform: translateX(0); }
    18% { transform: translateX(3%); }
    100% { transform: translateX(52%); }
  }

  @keyframes stone-gate-fire-flicker {
    0%, 100% { transform: scale(0.96, 1); opacity: 0.88; filter: brightness(0.94); }
    50% { transform: scale(1.08, 1.14); opacity: 1; filter: brightness(1.16); }
  }

  @keyframes stone-gate-seam-glow {
    0%, 100% { opacity: 0.38; filter: blur(2px) brightness(0.82); }
    50% { opacity: 1; filter: blur(5px) brightness(1.2); }
  }

  @keyframes stone-gate-threshold-pulse {
    0%, 100% { opacity: 0.75; filter: brightness(0.9); }
    50% { opacity: 1; filter: brightness(1.18); }
  }

  .stone-gate__door-leaf { transition: transform 180ms ease; }
  .stone-gate__door-leaf--sealed { transform: translateX(0); }
  .stone-gate__door-leaf--opening.stone-gate__door-leaf--left { animation: stone-gate-door-open-left 650ms cubic-bezier(0.24, 0.84, 0.24, 1) forwards; }
  .stone-gate__door-leaf--opening.stone-gate__door-leaf--right { animation: stone-gate-door-open-right 650ms cubic-bezier(0.24, 0.84, 0.24, 1) forwards; }
  .stone-gate__door-leaf--revealed.stone-gate__door-leaf--left { transform: translateX(-52%); }
  .stone-gate__door-leaf--revealed.stone-gate__door-leaf--right { transform: translateX(52%); }

  .stone-gate__fire--ember .stone-gate__flame {
    animation: stone-gate-fire-flicker 2.6s ease-in-out infinite;
  }

  .stone-gate__fire--blazing .stone-gate__flame,
  .stone-gate__fire--revealed .stone-gate__flame {
    animation: stone-gate-fire-flicker 1.3s ease-in-out infinite;
  }

  .stone-gate__seam--glowing,
  .stone-gate__seam--open {
    animation: stone-gate-seam-glow 1.8s ease-in-out infinite;
  }

  .stone-gate__threshold--charging,
  .stone-gate__threshold--open {
    animation: stone-gate-threshold-pulse 2.1s ease-in-out infinite;
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
  const seamState = seamStates[stage];
  const fireState = fireStates[stage];
  const thresholdState = thresholdStates[stage];

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
          "radial-gradient(circle at 50% 12%, rgba(77, 104, 150, 0.18), transparent 20%), linear-gradient(180deg, #06090f 0%, #0b1220 46%, #05070b 100%)",
        color: "#F0E6D4"
      }}
    >
      <div style={{ display: "grid", gap: "30px", justifyItems: "center", width: "min(1380px, 100%)" }}>
        <style aria-label="stone-gate-motion-styles">{STONE_GATE_MOTION_CSS}</style>
        <div style={{ textAlign: "center", display: "grid", gap: "8px" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(36px, 5vw, 62px)", letterSpacing: "0.08em" }}>
            SBTI Digital Employee
          </h1>
          <p style={{ margin: 0, color: "#B8B3A8", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            石门状态：{stageLabels[stage]}
          </p>
        </div>

        <div
          aria-label="stone-gate-portal"
          data-gate-scale="colossal"
          data-gate-style="legendary-stone"
          style={{
            position: "relative",
            width: "min(1180px, 100%)",
            aspectRatio: "1.34 / 1",
            overflow: "visible",
            borderRadius: "24px",
            background:
              "linear-gradient(180deg, rgba(29,34,44,0.98) 0%, rgba(12,14,18,0.99) 100%)",
            boxShadow: "0 46px 120px rgba(0,0,0,0.7)"
          }}
        >
          <div
            aria-label="stone-gate-torch-left"
            className={`stone-gate__fire stone-gate__fire--${fireState}`}
            data-fire-state={fireState}
            data-torch-placement="edge"
            style={{
              position: "absolute",
              left: "-11.5%",
              top: "18%",
              width: "8%",
              height: "34%",
              display: "grid",
              justifyItems: "center",
              alignContent: "start",
              gap: "8px"
            }}
          >
            <span
              className="stone-gate__flame"
              aria-hidden="true"
              style={{
                width: "48%",
                height: "18%",
                borderRadius: "999px 999px 38px 38px",
                background:
                  "radial-gradient(circle at 50% 34%, rgba(255,237,184,1) 0%, rgba(255,176,82,0.96) 36%, rgba(163,56,14,0.78) 70%, rgba(100,31,7,0.14) 100%)",
                boxShadow: stage === "closed"
                  ? "0 0 18px rgba(255,147,69,0.34)"
                  : "0 0 30px rgba(255,156,80,0.5), 0 0 64px rgba(255,205,126,0.28)"
              }}
            />
            <span
              aria-hidden="true"
              style={{
                width: "28%",
                height: "24%",
                borderRadius: "14px",
                background: "linear-gradient(180deg, rgba(76,62,51,0.96) 0%, rgba(30,22,17,0.98) 100%)"
              }}
            />
          </div>

          <div
            aria-label="stone-gate-torch-right"
            className={`stone-gate__fire stone-gate__fire--${fireState}`}
            data-fire-state={fireState}
            data-torch-placement="edge"
            style={{
              position: "absolute",
              right: "-11.5%",
              top: "18%",
              width: "8%",
              height: "34%",
              display: "grid",
              justifyItems: "center",
              alignContent: "start",
              gap: "8px"
            }}
          >
            <span
              className="stone-gate__flame"
              aria-hidden="true"
              style={{
                width: "48%",
                height: "18%",
                borderRadius: "999px 999px 38px 38px",
                background:
                  "radial-gradient(circle at 50% 34%, rgba(255,237,184,1) 0%, rgba(255,176,82,0.96) 36%, rgba(163,56,14,0.78) 70%, rgba(100,31,7,0.14) 100%)",
                boxShadow: stage === "closed"
                  ? "0 0 18px rgba(255,147,69,0.34)"
                  : "0 0 30px rgba(255,156,80,0.5), 0 0 64px rgba(255,205,126,0.28)"
              }}
            />
            <span
              aria-hidden="true"
              style={{
                width: "28%",
                height: "24%",
                borderRadius: "14px",
                background: "linear-gradient(180deg, rgba(76,62,51,0.96) 0%, rgba(30,22,17,0.98) 100%)"
              }}
            />
          </div>

          <div
            aria-label="stone-gate-doorframe"
            data-stone-finish="weathered"
            style={{
              position: "absolute",
              inset: "4% 8%",
              borderRadius: "2px",
              background:
                "linear-gradient(180deg, rgba(80,82,86,0.98) 0%, rgba(51,51,54,0.99) 54%, rgba(24,24,26,1) 100%)",
              boxShadow:
                "inset 0 0 0 10px rgba(110,106,98,0.68), inset 0 0 0 22px rgba(28,28,30,0.98), inset 0 1px 0 rgba(181,177,168,0.12), 0 18px 44px rgba(0,0,0,0.34)"
            }}
          />

          <div
            aria-label="stone-gate-monolith-left"
            style={{
              position: "absolute",
              left: "2%",
              top: "1%",
              bottom: "0%",
              width: "9%",
              borderRadius: "8px",
              background:
                "linear-gradient(180deg, rgba(62,64,68,1) 0%, rgba(38,39,42,1) 56%, rgba(18,18,20,1) 100%)",
              boxShadow: "inset -10px 0 18px rgba(0,0,0,0.28)"
            }}
          />
          <div
            aria-label="stone-gate-monolith-right"
            style={{
              position: "absolute",
              right: "2%",
              top: "1%",
              bottom: "0%",
              width: "9%",
              borderRadius: "8px",
              background:
                "linear-gradient(180deg, rgba(62,64,68,1) 0%, rgba(38,39,42,1) 56%, rgba(18,18,20,1) 100%)",
              boxShadow: "inset 10px 0 18px rgba(0,0,0,0.28)"
            }}
          />

          <div
            aria-label="stone-gate-inner-glow"
            data-glow-strength="faint"
            style={{
              position: "absolute",
              left: "49.35%",
              top: "9%",
              bottom: "15%",
              width: "1.1%",
              opacity: stage === "closed" ? 0.03 : stage === "opening" ? 0.16 : 0.28,
              background:
                "linear-gradient(180deg, rgba(255,231,177,0) 0%, rgba(255,205,120,0.18) 24%, rgba(255,170,84,0.28) 50%, rgba(255,225,172,0.12) 82%, rgba(255,231,177,0) 100%)",
              filter: stage === "closed" ? "blur(0.5px)" : "blur(1.6px)",
              pointerEvents: "none"
            }}
          />

          <div
            aria-label="stone-gate-center-seam"
            className={`stone-gate__seam stone-gate__seam--${seamState}`}
            data-seam-state={seamState}
            style={{
              position: "absolute",
              left: "50%",
              top: "8.5%",
              bottom: "14%",
              width: "1%",
              transform: "translateX(-50%)",
              borderRadius: "999px",
              background:
                stage === "closed"
                  ? "linear-gradient(180deg, rgba(13,13,14,0.98) 0%, rgba(52,44,37,0.86) 50%, rgba(10,10,10,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(61,45,30,0.42) 0%, rgba(255,205,120,0.56) 50%, rgba(61,45,30,0.42) 100%)",
              boxShadow:
                stage === "closed"
                  ? "0 0 8px rgba(0,0,0,0.36)"
                  : "0 0 18px rgba(255,193,94,0.18), 0 0 34px rgba(255,142,63,0.12)"
            }}
          />

          <div
            aria-label="stone-gate-relief-band"
            data-relief-weight="heavy"
            style={{
              position: "absolute",
              left: "16%",
              right: "16%",
              bottom: "12%",
              height: "13%",
              borderRadius: "2px",
              background:
                "linear-gradient(180deg, rgba(96,95,98,0.98) 0%, rgba(61,60,61,0.98) 42%, rgba(29,28,28,1) 100%)",
              boxShadow: "inset 0 2px 0 rgba(188,180,166,0.14), inset 0 -5px 0 rgba(0,0,0,0.42)"
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "18% 3%",
                background:
                  "repeating-linear-gradient(90deg, rgba(145,138,126,0.16) 0 16px, rgba(64,60,57,0.22) 16px 32px, rgba(0,0,0,0.08) 32px 48px)"
              }}
            />
          </div>

          <div
            aria-label="stone-gate-threshold"
            className={`stone-gate__threshold stone-gate__threshold--${thresholdState}`}
            data-threshold-state={thresholdState}
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              bottom: "4%",
              height: "8%",
              borderRadius: "6px",
              background:
                stage === "closed"
                  ? "linear-gradient(180deg, rgba(86,78,66,0.88) 0%, rgba(38,32,26,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(127,96,56,0.96) 0%, rgba(51,35,18,0.98) 100%)",
              boxShadow:
                stage === "closed"
                  ? "inset 0 0 14px rgba(0,0,0,0.34)"
                  : "0 0 24px rgba(255,185,92,0.18), inset 0 0 14px rgba(255,220,168,0.12)"
            }}
          />

          <div
            className={`stone-gate__door-leaf stone-gate__door-leaf--left stone-gate__door-leaf--${leafMotionState}`}
            aria-label="stone-gate-left-leaf"
            data-motion-state={leafMotionState}
            data-door-shape="flat-slab"
            style={{
              position: "absolute",
              left: "14%",
              top: "8%",
              bottom: "14%",
              width: "35%",
              background:
                "linear-gradient(180deg, rgba(132,133,136,0.98) 0%, rgba(92,90,91,0.98) 42%, rgba(44,42,42,1) 100%)",
              borderRadius: "1px",
              boxShadow: "inset -10px 0 20px rgba(0,0,0,0.26), inset 0 0 0 2px rgba(182,174,160,0.08), inset 0 1px 0 rgba(205,201,192,0.06)"
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "6%",
                border: "1px solid rgba(23,22,23,0.8)",
                boxShadow: "inset 0 0 0 1px rgba(133,127,118,0.08)"
              }}
            />
            <div
              aria-label="stone-gate-beast-left"
              style={{
                position: "absolute",
                top: "18%",
                left: "18%",
                width: "36%",
                aspectRatio: "1 / 1",
                borderRadius: "52% 48% 56% 44%",
                background:
                  "radial-gradient(circle at 50% 40%, rgba(176,177,181,0.28) 0%, rgba(82,80,84,0.62) 52%, rgba(37,35,38,0.94) 80%, transparent 82%)",
                boxShadow: "inset 0 0 18px rgba(0,0,0,0.34), 0 0 0 1px rgba(20,18,18,0.32)"
              }}
            />
          </div>

          <div
            className={`stone-gate__door-leaf stone-gate__door-leaf--right stone-gate__door-leaf--${leafMotionState}`}
            aria-label="stone-gate-right-leaf"
            data-motion-state={leafMotionState}
            data-door-shape="flat-slab"
            style={{
              position: "absolute",
              right: "14%",
              top: "8%",
              bottom: "14%",
              width: "35%",
              background:
                "linear-gradient(180deg, rgba(132,133,136,0.98) 0%, rgba(92,90,91,0.98) 42%, rgba(44,42,42,1) 100%)",
              borderRadius: "1px",
              boxShadow: "inset 10px 0 20px rgba(0,0,0,0.26), inset 0 0 0 2px rgba(182,174,160,0.08), inset 0 1px 0 rgba(205,201,192,0.06)"
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "6%",
                border: "1px solid rgba(23,22,23,0.8)",
                boxShadow: "inset 0 0 0 1px rgba(133,127,118,0.08)"
              }}
            />
            <div
              aria-label="stone-gate-beast-right"
              style={{
                position: "absolute",
                top: "18%",
                right: "18%",
                width: "36%",
                aspectRatio: "1 / 1",
                borderRadius: "48% 52% 44% 56%",
                background:
                  "radial-gradient(circle at 50% 40%, rgba(176,177,181,0.28) 0%, rgba(82,80,84,0.62) 52%, rgba(37,35,38,0.94) 80%, transparent 82%)",
                boxShadow: "inset 0 0 18px rgba(0,0,0,0.34), 0 0 0 1px rgba(20,18,18,0.32)"
              }}
            />
          </div>
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
              border: "1px solid rgba(183, 154, 101, 0.28)",
              background: "linear-gradient(180deg, rgba(95, 87, 72, 0.5) 0%, rgba(18,20,26,0.96) 100%)",
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
                border: "1px solid rgba(255, 193, 113, 0.34)",
                background: "linear-gradient(180deg, rgba(174,122,61,0.28) 0%, rgba(20,14,10,0.96) 100%)",
                color: "#FFF2DC",
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
