import manifest from "../../assets/characters/manifest.json";
import type { QuizResultType } from "../../types/domain";

export type CharacterConfig = {
  type: QuizResultType;
  title: string;
  sourceUrl: string;
  quality: string;
  states: {
    transparent: string;
    idle: string;
    walk: string;
    work: string;
    rest: string;
    train: string;
  };
};

const characterManifest = manifest as CharacterConfig[];

export function getCharacterConfig(type: string): CharacterConfig | undefined {
  return characterManifest.find((item) => item.type === type);
}
