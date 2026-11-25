import { describe, expect, it } from 'vitest';
import { generateTrace } from '../../src/engine/TraceGenerator.js';

describe('TraceGenerator', () => {
  it('收集 execute 发出的每一步并分配递增 id', () => {
    const execute = (_input, emit) => {
      emit({ snapshot: { view: 'bars', items: [] }, explanation: 'a' });
      emit({ snapshot: { view: 'bars', items: [] }, explanation: 'b' });
      emit({ snapshot: { view: 'bars', items: [] }, explanation: 'c' });
    };
    const trace = generateTrace(execute, { values: 'x' });
    expect(trace.steps).toHaveLength(3);
    expect(trace.steps.map((step) => step.id)).toEqual([0, 1, 2]);
    expect(trace.input).toEqual({ values: 'x' });
  });

  it('为缺失字段补默认值', () => {
    const execute = (_input, emit) => emit({ snapshot: { view: 'bars', items: [] } });
    const [step] = generateTrace(execute, {}).steps;
    expect(step.lineId).toBeNull();
    expect(step.action).toBe('step');
    expect(step.explanation).toBe('');
    expect(step.metrics).toBeNull();
  });

  it('缺少 snapshot 时抛错', () => {
    const execute = (_input, emit) => emit({ explanation: 'no snapshot' });
    expect(() => generateTrace(execute, {})).toThrow(/snapshot/);
  });

  it('没有产生任何步骤时抛错', () => {
    expect(() => generateTrace(() => {}, {})).toThrow(/没有产生步骤/);
  });
});
