import type { CharacterState, RestActivity, RestActivitySource, RestActivityType } from '../../../types/domain';

let restActivityCounter = 0;
const nextRestActivityId = () => `rest-activity-${String(restActivityCounter++).padStart(3, '0')}`;

export const REST_ACTIVITY_LABELS: Record<RestActivityType, string> = {
  tea: '喝茶',
  sleep: '睡觉',
  dance: '跳舞'
};

export const REST_ACTIVITY_STATE_MAP: Record<RestActivityType, CharacterState> = {
  tea: 'rest',
  sleep: 'sleep',
  dance: 'dance'
};

export const REST_ACTIVITY_SOURCE_LABELS: Record<RestActivitySource, string> = {
  panel: '休息间面板',
  chat: '对话触发'
};

export function createRestActivityRecord(input: {
  type: RestActivityType;
  source: RestActivitySource;
  note?: string;
}): RestActivity {
  const now = new Date().toISOString();
  return {
    id: nextRestActivityId(),
    type: input.type,
    label: REST_ACTIVITY_LABELS[input.type],
    source: input.source,
    note: input.note?.trim() ?? '',
    createdAt: now
  };
}
