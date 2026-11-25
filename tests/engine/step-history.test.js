import { describe, expect, it } from 'vitest';
import { createHistory } from '../../src/engine/StepHistory.js';

const raw = [
  { id: 99, explanation: 'a' },
  { id: 99, explanation: 'b' },
  { id: 99, explanation: 'c' },
];

describe('StepHistory', () => {
  it('重新编号并从 0 开始', () => {
    const history = createHistory(raw);
    expect(history.length).toBe(3);
    expect(history.index).toBe(0);
    expect(history.steps.map((step) => step.id)).toEqual([0, 1, 2]);
  });

  it('forward/back 移动下标并在边界 clamp', () => {
    const history = createHistory(raw);
    expect(history.forward().explanation).toBe('b');
    expect(history.forward().explanation).toBe('c');
    expect(history.forward().explanation).toBe('c'); // 末尾 clamp
    expect(history.back().explanation).toBe('b');
    expect(history.back().explanation).toBe('a');
    expect(history.back().explanation).toBe('a'); // 开头 clamp
  });

  it('jump 到指定下标', () => {
    const history = createHistory(raw);
    expect(history.jump(2).explanation).toBe('c');
    expect(history.jump(10).explanation).toBe('c');
    expect(history.jump(-5).explanation).toBe('a');
  });

  it('replace 重置轨迹，append 追加步骤', () => {
    const history = createHistory(raw);
    history.jump(2);

    const first = history.replace([{ explanation: 'x' }]);
    expect(first.explanation).toBe('x');
    expect(history.length).toBe(1);
    expect(history.index).toBe(0);

    const start = history.append([{ explanation: 'y' }, { explanation: 'z' }]);
    expect(start).toBe(1);
    expect(history.length).toBe(3);
    expect(history.steps.map((step) => step.id)).toEqual([0, 1, 2]);
  });
});
