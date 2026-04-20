import type { CharacterProfile, QuizResult } from "../../types/domain";
import { getCharacterConfig } from "../../game/data/characterRegistry";

type AvatarPreviewCardProps = {
  character: CharacterProfile;
  result: QuizResult;
  customName: string;
  onCustomNameChange: (value: string) => void;
  onEnterOffice: () => void;
};

const PREVIEW_PALETTES = [
  { aura: "#5ffbf1", primary: "#8ea7ff", secondary: "#1d2848", accent: "#f8d29c" },
  { aura: "#ffbd7a", primary: "#ff8f66", secondary: "#341f2f", accent: "#ffe0a6" },
  { aura: "#d3b2f3", primary: "#8f7cff", secondary: "#251f48", accent: "#f4d9ff" },
  { aura: "#9fe3c4", primary: "#6fce97", secondary: "#16372d", accent: "#dffde8" },
  { aura: "#88c8ff", primary: "#6ea7ff", secondary: "#142845", accent: "#d3ebff" }
] as const;

function hashString(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function PersonaPreviewStandee({
  assetKey,
  title,
  code
}: {
  assetKey: string;
  title: string;
  code: string;
}) {
  const palette = PREVIEW_PALETTES[hashString(assetKey) % PREVIEW_PALETTES.length] ?? PREVIEW_PALETTES[0];

  return (
    <div
      aria-label="persona-preview-standee"
      data-persona-asset-key={assetKey}
      style={{
        position: "relative",
        width: "min(78%, 250px)",
        aspectRatio: "0.76 / 1",
        display: "grid",
        placeItems: "center",
        filter: `drop-shadow(0 24px 34px ${palette.secondary}aa)`
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "6% 12% 0",
          borderRadius: "36px 36px 22px 22px",
          background: `radial-gradient(circle at 50% 18%, ${palette.accent}aa 0%, ${palette.aura}36 26%, transparent 68%)`
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "12% 18% 22%",
          display: "grid",
          gridTemplateRows: "26% 18% 1fr 18%",
          justifyItems: "center"
        }}
      >
        <div
          style={{
            width: "30%",
            aspectRatio: "1 / 1",
            background: palette.accent,
            borderRadius: "8px",
            boxShadow: `0 0 0 4px ${palette.secondary}, 0 0 0 10px ${palette.primary}55`,
            imageRendering: "pixelated"
          }}
        />
        <div
          style={{
            width: "44%",
            height: "18%",
            background: palette.primary,
            clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)"
          }}
        />
        <div
          style={{
            width: "64%",
            height: "100%",
            borderRadius: "18px 18px 14px 14px",
            background: `linear-gradient(180deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
            boxShadow: `inset 0 0 0 4px ${palette.aura}55`
          }}
        />
        <div
          style={{
            width: "82%",
            height: "32%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14%"
          }}
        >
          <span style={{ display: "block", background: palette.secondary, borderRadius: "10px" }} />
          <span style={{ display: "block", background: palette.secondary, borderRadius: "10px" }} />
        </div>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "4%",
          transform: "translateX(-50%)",
          padding: "8px 12px",
          borderRadius: "999px",
          border: `1px solid ${palette.aura}66`,
          background: "rgba(4,10,20,0.82)",
          color: "#f6fbff",
          fontSize: "12px",
          letterSpacing: "0.12em",
          textTransform: "uppercase"
        }}
      >
        {code} · {title}
      </div>
    </div>
  );
}

export function AvatarPreviewCard({
  character,
  result,
  customName,
  onCustomNameChange,
  onEnterOffice
}: AvatarPreviewCardProps) {
  const personaConfig = getCharacterConfig(result.code);
  const usesGeneratedStandee = personaConfig.quality === "placeholder";

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
          data-preview-mode={usesGeneratedStandee ? "generated-standee" : "asset-portrait"}
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
          {usesGeneratedStandee ? (
            <PersonaPreviewStandee
              assetKey={personaConfig.assetKey}
              title={result.title}
              code={result.code}
            />
          ) : null}
          {personaConfig.transparent ? (
            <img
              alt={`${result.title} 人格立绘`}
              src={personaConfig.transparent}
              style={{
                width: "min(82%, 280px)",
                maxHeight: "280px",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 20px 28px rgba(0,0,0,0.42))",
                opacity: usesGeneratedStandee ? 0.001 : 1,
                position: usesGeneratedStandee ? "absolute" : "relative"
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
