import { expect, test } from 'vitest';

import { parseRestIntent } from './restIntent';

test('parses a dance request inside the rest room', () => {
  expect(parseRestIntent('跳舞放松一下', 'rest')).toEqual({ activity: 'dance' });
});

test('parses tea request outside rest room only when explicitly mentioning rest', () => {
  expect(parseRestIntent('去休息间喝茶', 'office')).toEqual({ activity: 'tea' });
});

test('ignores unrelated chat', () => {
  expect(parseRestIntent('整理今天任务', 'rest')).toBeNull();
});
