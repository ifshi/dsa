import { describe, expect, it } from 'vitest';
import { generateTrace } from '../../src/engine/TraceGenerator.js';
import { algorithm } from '../../src/algorithms/sorting/bubble-sort.js';

function run(values) {
  return generateTrace(algorithm.execute, { values });
}

describe('bubble-sort', () => {
  it('最终快照为升序', () => {
    const trace = run('3 1 2');
    const last = trace.steps[trace.steps.length - 1];
    expect(last.snapshot.items.map((item) => item.value)).toEqual([1, 2, 3]);
  });

  it('每个发出的 lineId 都能在代码模型里找到', () => {
    const trace = run('6 3 5');
    const codeIds = new Set(algorithm.code.map((line) => line.id));
    for (const step of trace.steps) {
      expect(codeIds.has(step.lineId)).toBe(true);
    }
  });

  it('n=3 逆序的比较与交换次数正确', () => {
    const trace = run('3 2 1');
    const last = trace.steps[trace.steps.length - 1];
    expect(last.metrics.comparisons).toBe(3);
    expect(last.metrics.swaps).toBe(3);
  });

  it('已有序序列不做任何交换', () => {
    const trace = run('1 2 3');
    const last = trace.steps[trace.steps.length - 1];
    expect(last.metrics.swaps).toBe(0);
    expect(last.snapshot.items.map((item) => item.value)).toEqual([1, 2, 3]);
  });

  it('包含比较、交换与完成动作', () => {
    const actions = run('3 1 2').steps.map((step) => step.action);
    expect(actions).toContain('compare');
    expect(actions).toContain('swap');
    expect(actions).toContain('done');
  });

  it('练习判题返回正确结果', () => {
    expect(algorithm.grade('3 5 6').ok).toBe(true);
    expect(algorithm.grade('3 6 5').ok).toBe(false);
  });

  it('非法输入被拒绝', () => {
    expect(() => run('')).toThrow(/不能为空/);
    expect(() => run('3 a 2')).toThrow(/不是整数/);
  });
});
