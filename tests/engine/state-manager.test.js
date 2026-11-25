import { describe, expect, it, vi } from 'vitest';
import { createStateManager } from '../../src/engine/StateManager.js';

describe('StateManager', () => {
  it('load 后状态为 paused 并发布快照', () => {
    const state = createStateManager();
    const listener = vi.fn();
    state.subscribe(listener);
    state.load([{ explanation: 'a' }, { explanation: 'b' }]);
    expect(state.status).toBe('paused');
    expect(listener).toHaveBeenCalled();
    const snap = state.snapshot();
    expect(snap.length).toBe(2);
    expect(snap.index).toBe(0);
  });

  it('空轨迹 load 后状态为 idle', () => {
    const state = createStateManager();
    state.load([]);
    expect(state.status).toBe('idle');
  });

  it('move 到末尾后状态为 done', () => {
    const state = createStateManager();
    state.load([{ explanation: 'a' }, { explanation: 'b' }]);
    state.move(1);
    expect(state.status).toBe('done');
    expect(state.snapshot().step.explanation).toBe('b');
  });

  it('append 追加步骤并回到 paused', () => {
    const state = createStateManager();
    state.load([{ explanation: 'a' }]);
    state.append([{ explanation: 'b' }, { explanation: 'c' }]);
    expect(state.snapshot().length).toBe(3);
    expect(state.status).toBe('paused');
  });

  it('subscribe 返回取消订阅函数', () => {
    const state = createStateManager();
    const listener = vi.fn();
    const unsubscribe = state.subscribe(listener);
    const calls = listener.mock.calls.length;
    unsubscribe();
    state.setStatus('playing');
    expect(listener.mock.calls.length).toBe(calls);
  });
});
