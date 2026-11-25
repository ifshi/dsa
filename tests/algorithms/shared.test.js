import { describe, expect, it } from 'vitest';
import { answerMatches, barSnapshot, parseNumbers, withSorted } from '../../src/algorithms/shared.js';

describe('shared 算法工具', () => {
  it('parseNumbers 解析并校验输入', () => {
    expect(parseNumbers('3 1 2')).toEqual([3, 1, 2]);
    expect(parseNumbers('3,1，2')).toEqual([3, 1, 2]);
    expect(() => parseNumbers('')).toThrow(/不能为空/);
    expect(() => parseNumbers('3 a 2')).toThrow(/不是整数/);
    expect(() => parseNumbers('1 2 3 4 5 6 7 8 9 10 11 12 13')).toThrow(/最多/);
  });

  it('barSnapshot 与 withSorted 生成统一快照', () => {
    const snap = barSnapshot([3, 1], { 0: 'compare' }, { 1: 'j' });
    expect(snap.view).toBe('bars');
    expect(snap.items[0]).toEqual({ value: 3, state: 'compare', tag: '' });
    expect(snap.items[1]).toEqual({ value: 1, state: 'idle', tag: 'j' });

    const sorted = withSorted({ 0: 'compare' }, [1]);
    expect(sorted[1]).toBe('sorted');
    expect(sorted[0]).toBe('compare');
  });

  it('answerMatches 归一化后比较', () => {
    expect(answerMatches('3 5 6', '3 5 6').ok).toBe(true);
    expect(answerMatches('3,5,6', '3 5 6').ok).toBe(true);
    expect(answerMatches('3 6 5', '3 5 6').ok).toBe(false);
  });
});
