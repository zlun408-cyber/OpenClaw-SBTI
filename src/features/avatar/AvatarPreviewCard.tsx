import type { CharacterProfile, QuizResult } from "../../types/domain";

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
  return (
    <section>
      <div
        aria-label="人格立绘预览"
        role="img"
        style={{
          display: "grid",
          placeItems: "center",
          width: "160px",
          height: "160px",
          marginBottom: "16px",
          border: "2px solid #5ffbf1",
          borderRadius: "12px",
          background:
            "linear-gradient(180deg, rgba(95,251,241,0.16) 0%, rgba(8,15,34,0.92) 100%)",
          boxShadow: "0 0 18px rgba(95,251,241,0.18)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: "28px", letterSpacing: "0.12em" }}>
            {result.code}
          </strong>
          <span style={{ fontSize: "13px", opacity: 0.8 }}>pixel persona preview</span>
        </div>
      </div>
      <h1>{character.title}</h1>
      <p>{result.subtitle}</p>
      <p>{result.slogan}</p>
      <p>{result.description}</p>
      <dl>
        <div>
          <dt>人格模型</dt>
          <dd>{result.summary.model}</dd>
        </div>
        <div>
          <dt>核心关键词</dt>
          <dd>{result.summary.keywords.join(" / ")}</dd>
        </div>
      </dl>
      <label>
        角色姓名
        <input
          value={customName}
          onChange={(event) => onCustomNameChange(event.target.value)}
        />
      </label>
      <button type="button" onClick={onEnterOffice}>
        进入数字办公室
      </button>
    </section>
  );
}
