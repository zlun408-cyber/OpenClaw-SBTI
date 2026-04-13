import { useAppStore } from "../../state/appStore";
import { selectCharacterLabel } from "../../state/selectors";
import type { CharacterState } from "../../types/domain";

const TASK_STATUS_LABELS: Record<CharacterState, string> = {
  idle: "Idle",
  walk: "Walking",
  work: "Working",
  rest: "Resting",
  sleep: "Sleeping",
  dance: "Dancing",
  train: "Training",
  "task-submit": "Submitting task"
};

export function OfficeHUD() {
  const characterName = useAppStore(selectCharacterLabel);
  const currentTaskStatus = useAppStore(
    (state) => TASK_STATUS_LABELS[state.character.state]
  );

  return (
    <aside aria-label="office-hud">
      <div>{characterName}</div>
      <div>{currentTaskStatus}</div>
    </aside>
  );
}
