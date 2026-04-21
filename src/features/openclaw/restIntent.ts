import type { RestActivityType, RoomId } from '../../types/domain';

const explicitMap: Array<{ pattern: RegExp; activity: RestActivityType }> = [
  { pattern: /(喝茶|泡茶|来杯茶|休息喝茶)/i, activity: 'tea' },
  { pattern: /(睡觉|午睡|眯一会|打盹)/i, activity: 'sleep' },
  { pattern: /(跳舞|尬舞|跳一段)/i, activity: 'dance' }
];

export function parseRestIntent(input: string, roomId: RoomId | null) {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  for (const rule of explicitMap) {
    if (rule.pattern.test(normalized) && (roomId === 'rest' || /休息|放松/.test(normalized))) {
      return { activity: rule.activity };
    }
  }

  return null;
}
