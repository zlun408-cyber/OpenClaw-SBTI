import type { CharacterProfile, QuizResult } from "../../types/domain";
import { getCharacterConfig } from "../../game/data/characterRegistry";

type AvatarPreviewCardProps = {
  character: CharacterProfile;
  result: QuizResult;
  customName: string;
  onCustomNameChange: (value: string) => void;
  onEnterOffice: () => void;
};

export function AvatarPreviewCard({
  character,
  result,
  customName,
  onCustomNameChange,
  onEnterOffice
}: AvatarPreviewCardProps) {
  const personaConfig = getCharacterConfig(result.code);

  return (
    <section
      aria-label="sbti-result-card"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)",
        gap: "24px",
        alignItems: "stretch",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
        border: "1px solid rgba(95, 251, 241, 0.22)",
        borderRadius: "28px",
        background: "linear-gradient(180deg, rgba(10,17,35,0.94) 0%, rgba(6,10,20,0.98) 100%)",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.38)"
      }}
    >
      <div style={{ display: "grid", gap: "16px" }}>
        <figure
          aria-label="persona-preview-sprite"
          style={{
            display: "grid",
            placeItems: "center",
            minHeight: "360px",
            margin: 0,
            border: "2px solid #5ffbf1",
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            background:
              "radial-gradient(circle at center, rgba(95,251,241,0.24) 0%, rgba(95,251,241,0.06) 36%, rgba(8,15,34,0.94) 100%)",
            boxShadow: "inset 0 0 28px rgba(95,251,241,0.18), 0 0 28px rgba(95,251,241,0.14)"
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "12px",
              border: "1px solid rgba(95,251,241,0.18)",
              borderRadius: "18px"
            }}
          />
          {personaConfig.transparent ? (
            <img
              alt={`${result.title} 人格立绘`}
              src={personaConfig.transparent}
              style={{
                width: "min(82%, 280px)",
                maxHeight: "280px",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 20px 28px rgba(0,0,0,0.42))"
              }}
            />
          ) : null}
          <figcaption
            style={{
              position: "absolute",
              left: "18px",
              right: "18px",
              bottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <strong style={{ fontSize: "32px", letterSpacing: "0.14em" }}>{result.code}</strong>
            <span
              style={{
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(233,247,255,0.68)"
              }}
            >
              pixel persona preview
            </span>
          </figcaption>
        </figure>
        <div
          aria-label="persona-dimension-summary"
          style={{
            display: "grid",
            gap: "12px",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(10, 17, 35, 0.9)",
            border: "1px solid rgba(95, 251, 241, 0.18)"
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#5ffbf1"
              }}
            >
              Dimension Summary
            </p>
            <strong style={{ display: "block", marginTop: "6px", fontSize: "22px" }}>
              {result.summary.model}
            </strong>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {result.summary.keywords.map((keyword) => (
              <span
                key={keyword}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid rgba(95, 251, 241, 0.22)",
                  background: "rgba(95, 251, 241, 0.08)",
                  fontSize: "13px"
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: "18px", alignContent: "start" }}>
        <div>
          <p
            style={{
              margin: 0,
              color: "#5ffbf1",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "12px"
            }}
          >
            Persona Result
          </p>
          <h1 style={{ margin: "10px 0 10px", fontSize: "clamp(34px, 5vw, 64px)", lineHeight: 1 }}>
            {character.title}
          </h1>
          <p style={{ margin: 0, fontSize: "18px", color: "rgba(233,247,255,0.82)" }}>{result.subtitle}</p>
        </div>
        <blockquote
          aria-label="persona-slogan"
          style={{
            margin: 0,
            padding: "20px 22px",
            borderLeft: "4px solid #5ffbf1",
            borderRadius: "0 18px 18px 0",
            background: "rgba(95, 251, 241, 0.08)",
            fontSize: "22px",
            lineHeight: 1.5,
            color: "#f6fbff"
          }}
        >
          “{result.slogan}”
        </blockquote>
        <section
          aria-label="persona-result-narrative"
          style={{
            display: "grid",
            gap: "10px",
            padding: "20px 22px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <strong style={{ fontSize: "16px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Result Narrative
          </strong>
          <p style={{ margin: 0, color: "rgba(233,247,255,0.8)", lineHeight: 1.75 }}>{result.description}</p>
        </section>
        <div
          style={{
            display: "grid",
            gap: "14px",
            padding: "20px 22px",
            borderRadius: "20px",
            background: "linear-gradient(180deg, rgba(8,15,34,0.92) 0%, rgba(11,20,40,0.82) 100%)",
            border: "1px solid rgba(95, 251, 241, 0.16)"
          }}
        >
          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "rgba(233,247,255,0.76)" }}>角色姓名</span>
            <input
              value={customName}
              onChange={(event) => onCustomNameChange(event.target.value)}
              style={{
                height: "48px",
                padding: "0 14px",
                borderRadius: "14px",
                border: "1px solid rgba(95, 251, 241, 0.24)",
                background: "rgba(5, 9, 18, 0.96)",
                color: "#f4fbff",
                fontSize: "16px"
              }}
            />
          </label>
          <button
            type="button"
            onClick={onEnterOffice}
            style={{
              height: "52px",
              border: "none",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #5ffbf1 0%, #8ea7ff 100%)",
              color: "#06101e",
              fontWeight: 800,
              fontSize: "15px",
              cursor: "pointer"
            }}
          >
            进入数字办公室
          </button>
        </div>
      </div>
    </section>
  );
}
