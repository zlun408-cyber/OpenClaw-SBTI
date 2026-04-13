import type { CharacterProfile } from "../../types/domain";

type AvatarPreviewCardProps = {
  character: CharacterProfile;
  customName: string;
  onCustomNameChange: (value: string) => void;
  onEnterOffice: () => void;
};

export function AvatarPreviewCard({
  character,
  customName,
  onCustomNameChange,
  onEnterOffice
}: AvatarPreviewCardProps) {
  return (
    <section>
      <h1>{character.title}</h1>
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
