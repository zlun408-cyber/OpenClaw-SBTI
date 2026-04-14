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

test('renders furniture hotspots for the rest area scene', () => {
  render(<RestPanel />);

  expect(screen.getByRole('heading', { name: /rest area/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /家具 茶案/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /家具 沙发床/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /家具 音乐角/i })).toBeInTheDocument();
});

test('can trigger dance by clicking the music corner hotspot', () => {
  render(<RestPanel />);

  fireEvent.click(screen.getByRole('button', { name: /家具 音乐角/i }));

  expect(screen.getByText(/已在音乐角切换到跳舞状态/)).toBeInTheDocument();
  expect(screen.getByText('dance')).toBeInTheDocument();
  expect(useAppStore.getState().character.state).toBe('dance');
});

test('can return to idle after resting', () => {
  render(<RestPanel />);

  fireEvent.click(screen.getByRole('button', { name: /家具 沙发床/i }));
  fireEvent.click(screen.getByRole('button', { name: /结束休息/i }));

  expect(screen.getByText(/已结束休息，返回待命/)).toBeInTheDocument();
  expect(useAppStore.getState().character.state).toBe('idle');
});
