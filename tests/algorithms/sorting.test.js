import { describe, expect, it } from 'vitest';
import { generateTrace } from '../../src/engine/TraceGenerator.js';
import { algorithm as insertionSort } from '../../src/algorithms/sorting/insertion-sort.js';
import { algorithm as selectionSort } from '../../src/algorithms/sorting/selection-sort.js';
import { algorithm as quickSort } from '../../src/algorithms/sorting/quick-sort.js';
import { algorithm as mergeSort } from '../../src/algorithms/sorting/merge-sort.js';

const cases = [
  ['insertion-sort', insertionSort, '3 1 2', [1, 2, 3]],
  ['selection-sort', selectionSort, '3 1 2', [1, 2, 3]],
  ['quick-sort', quickSort, '6 3 8 5 1', [1, 3, 5, 6, 8]],
  ['merge-sort', mergeSort, '3 1 4 2', [1, 2, 3, 4]],
];

describe.each(cases)('%s', (_name, algorithm, input, sorted) => {
  const trace = generateTrace(algorithm.execute, { values: input });

  it('最终结果为升序', () => {
    const last = trace.steps[trace.steps.length - 1];
    expect(last.snapshot.items.map((item) => item.value)).toEqual(sorted);
  });

  it('每个发出的 lineId 都在代码模型里', () => {
    const codeIds = new Set(algorithm.code.map((line) => line.id));
    for (const step of trace.steps) {
      expect(codeIds.has(step.lineId)).toBe(true);
    }
  });

  it('记录比较次数且含 done 动作', () => {
    const last = trace.steps[trace.steps.length - 1];
    expect(last.metrics.comparisons).toBeGreaterThan(0);
    expect(trace.steps.some((step) => step.action === 'done')).toBe(true);
  });

  it('练习判题与 execute 结果一致', () => {
    const expectedTrace = generateTrace(algorithm.execute, algorithm.exercise.input);
    const expected = expectedTrace.steps[expectedTrace.steps.length - 1].snapshot.items
      .map((item) => item.value)
      .join(' ');
    expect(algorithm.grade(expected).ok).toBe(true);
    expect(algorithm.grade('999').ok).toBe(false);
  });
});
