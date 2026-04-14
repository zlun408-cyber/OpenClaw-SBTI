import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test } from 'vitest';

import { createInitialAppState, useAppStore } from '../../../state/appStore';
import { RestPanel } from './RestPanel';

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: 'office',
    currentRoomId: 'rest',
    result: { resultType: 'CTRL', title: '控制者' },
    character: {
      title: '控制者',
      customName: '阿控',
      state: 'idle'
    }
  });
});

test('renders rest actions and can trigger dance from the panel', () => {
  render(<RestPanel />);

  expect(screen.getByRole('heading', { name: /rest area/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /休息动作 跳舞/i }));

  expect(screen.getByText(/已切换到跳舞状态/)).toBeInTheDocument();
  expect(screen.getByText(/当前状态：/)).toBeInTheDocument();
  expect(screen.getByText(/跳舞 \/ dance/)).toBeInTheDocument();
  expect(useAppStore.getState().character.state).toBe('dance');
});

test('can return to idle after resting', () => {
  render(<RestPanel />);

  fireEvent.click(screen.getByRole('button', { name: /休息动作 睡觉/i }));
  fireEvent.click(screen.getByRole('button', { name: /结束休息/i }));

  expect(screen.getByText(/已结束休息，返回待命/)).toBeInTheDocument();
  expect(useAppStore.getState().character.state).toBe('idle');
});
