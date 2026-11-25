import { describe, expect, it } from 'vitest';
import { generateTrace } from '../../src/engine/TraceGenerator.js';
import { algorithm as sequentialSearch } from '../../src/algorithms/searching/sequential-search.js';
import { algorithm as binarySearch } from '../../src/algorithms/searching/binary-search.js';
import { algorithm as bstSearch } from '../../src/algorithms/searching/bst-search.js';

describe('sequential-search', () => {
  it('命中返回正确下标', () => {
    const trace = generateTrace(sequentialSearch.execute, { values: '12 25 36 48 61', target: '48' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('found');
    expect(last.snapshot.result).toEqual({ found: true, index: 3 });
  });

  it('未命中返回 -1，探测次数等于表长', () => {
    const trace = generateTrace(sequentialSearch.execute, { values: '12 25 36', target: '99' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('miss');
    expect(last.snapshot.result.found).toBe(false);
    expect(last.metrics.probes).toBe(3);
  });

  it('每个 lineId 都在代码模型里', () => {
    const trace = generateTrace(sequentialSearch.execute, { values: '12 25 36', target: '99' });
    const codeIds = new Set(sequentialSearch.code.map((line) => line.id));
    for (const step of trace.steps) expect(codeIds.has(step.lineId)).toBe(true);
  });

  it('练习判题正确', () => {
    expect(sequentialSearch.grade('3').ok).toBe(true);
    expect(sequentialSearch.grade('4').ok).toBe(false);
  });
});

describe('binary-search', () => {
  it('命中返回正确下标', () => {
    const trace = generateTrace(binarySearch.execute, { values: '12 25 36 48 61 73 88', target: '48' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('found');
    expect(last.snapshot.result).toEqual({ found: true, index: 3 });
  });

  it('未命中返回 -1', () => {
    const trace = generateTrace(binarySearch.execute, { values: '12 25 36 48 61', target: '40' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('miss');
    expect(last.snapshot.result.found).toBe(false);
  });

  it('每个 lineId 都在代码模型里', () => {
    const trace = generateTrace(binarySearch.execute, { values: '12 25 36 48 61', target: '40' });
    const codeIds = new Set(binarySearch.code.map((line) => line.id));
    for (const step of trace.steps) expect(codeIds.has(step.lineId)).toBe(true);
  });

  it('练习判题正确', () => {
    expect(binarySearch.grade('3').ok).toBe(true);
    expect(binarySearch.grade('2').ok).toBe(false);
  });
});

describe('bst-search', () => {
  it('命中返回 found 且视图为 tree', () => {
    const trace = generateTrace(bstSearch.execute, { keys: '50 30 70 20 40', target: '40' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('found');
    expect(last.snapshot.result.found).toBe(true);
    expect(last.snapshot.view).toBe('tree');
  });

  it('未命中返回 miss', () => {
    const trace = generateTrace(bstSearch.execute, { keys: '50 30 70 20 40', target: '35' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('miss');
    expect(last.snapshot.result.found).toBe(false);
  });

  it('每个 lineId 都在代码模型里', () => {
    const trace = generateTrace(bstSearch.execute, { keys: '50 30 70', target: '70' });
    const codeIds = new Set(bstSearch.code.map((line) => line.id));
    for (const step of trace.steps) expect(codeIds.has(step.lineId)).toBe(true);
  });

  it('练习判题正确', () => {
    expect(bstSearch.grade('是').ok).toBe(true);
    expect(bstSearch.grade('否').ok).toBe(false);
  });
});
