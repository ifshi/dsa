import { answerMatches, codeLine, parseNumbers } from '../shared.js';

const capacity = 10;

function snapshot(model, pointer, states, explanation) {
  return {
    view: 'sequence',
    caption: explanation,
    length: model.values.filter((_, index) => index < model.length).length,
    capacity,
    pointer,
    cells: Array.from({ length: capacity }, (_, index) => ({
      value: index < model.length ? model.values[index] : null,
      state: states[index] || (index < model.length ? 'filled' : 'empty'),
    })),
  };
}

function emitStep(steps, partial) {
  steps.push({
    id: steps.length,
    lineId: partial.lineId,
    action: partial.action,
    explanation: partial.explanation,
    snapshot: partial.snapshot,
    metrics: null,
  });
}

export const algorithm = {
  id: 'sequence-list',
  mode: 'ops',
  view: 'sequence',
  fields: [{ name: 'values', label: '初始顺序表', type: 'text', default: '12 25 36 48' }],
  operations: [
    {
      id: 'insert',
      label: '插入',
      fields: [
        { name: 'index', label: '位序 i', default: '2' },
        { name: 'value', label: '元素 e', default: '20' },
      ],
    },
    {
      id: 'remove',
      label: '删除',
      fields: [{ name: 'index', label: '位序 i', default: '1' }],
    },
  ],
  code: [
    codeLine('sig', 'int ListInsert(SqList *&L, int i, ElemType e)'),
    codeLine('check', 'if (i < 1 || i > L->length + 1) return 0;', 1),
    codeLine('full', 'if (L->length >= MaxSize) return 0;', 1),
    codeLine('shift', 'for (j = L->length; j >= i; j--)', 1),
    codeLine('move', 'L->data[j] = L->data[j - 1];', 2),
    codeLine('place', 'L->data[i - 1] = e;', 1),
    codeLine('len', 'L->length++;', 1),
    codeLine('del', 'int ListDelete(SqList *&L, int i, ElemType &e)'),
    codeLine('dshift', 'for (j = i; j < L->length; j++)', 1),
    codeLine('dmove', 'L->data[j - 1] = L->data[j];', 2),
    codeLine('dlen', 'L->length--;', 1),
  ],
  createModel(form) {
    const text = String(form.values ?? '').trim();
    const values = text ? parseNumbers(text, { min: 1, max: 8, name: '顺序表' }) : [];
    const stored = Array(capacity).fill(null);
    values.forEach((value, index) => {
      stored[index] = value;
    });
    return { values: stored, length: values.length };
  },
  describe(model, emit) {
    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `顺序表已就绪，length = ${model.length}。元素在物理上连续存放。`,
      snapshot: snapshot(model, null, {}, '逻辑顺序与物理顺序一致'),
    });
  },
  apply(model, op, form) {
    const next = { values: model.values.slice(), length: model.length };
    const steps = [];
    const index = Number(String(form.index ?? '').trim());
    if (!Number.isInteger(index)) throw new Error('位序 i 需要整数');
    if (op === 'insert') {
      const element = parseNumbers(form.value, { min: 1, max: 1, name: '元素' })[0];
      if (index < 1 || index > next.length + 1) throw new Error('插入位序必须在 1 到 length+1 之间');
      if (next.length >= capacity) throw new Error('顺序表已满');
      emitStep(steps, {
        lineId: 'check',
        action: 'check',
        explanation: `i = ${index}，length = ${next.length}，位序合法。`,
        snapshot: snapshot(next, { index: index - 1, label: 'i' }, { [index - 1]: 'compare' }, '检查插入位序'),
      });
      for (let j = next.length; j >= index; j -= 1) {
        next.values[j] = next.values[j - 1];
        next.length = Math.max(next.length, j + 1);
        const states = { [j]: 'shift', [j - 1]: 'shift' };
        emitStep(steps, {
          lineId: 'move',
          action: 'shift',
          explanation: `后移：data[${j}] = data[${j - 1}]，把 ${next.values[j]} 挪到下标 ${j}。`,
          snapshot: snapshot(next, { index: j, label: 'j' }, states, '为插入腾出位置'),
        });
      }
      next.values[index - 1] = element;
      if (index > next.length) next.length = index;
      emitStep(steps, {
        lineId: 'place',
        action: 'insert',
        explanation: `data[${index - 1}] = ${element}，length 变为 ${next.length}。`,
        snapshot: snapshot(next, { index: index - 1, label: 'e' }, { [index - 1]: 'insert' }, '写入新元素'),
      });
      return { model: next, steps };
    }
    if (index < 1 || index > next.length) throw new Error('删除位序必须在 1 到 length 之间');
    const removed = next.values[index - 1];
    emitStep(steps, {
      lineId: 'del',
      action: 'check',
      explanation: `删除位序 ${index} 上的元素 ${removed}。`,
      snapshot: snapshot(next, { index: index - 1, label: 'i' }, { [index - 1]: 'compare' }, '定位被删元素'),
    });
    for (let j = index; j < next.length; j += 1) {
      next.values[j - 1] = next.values[j];
      emitStep(steps, {
        lineId: 'dmove',
        action: 'shift',
        explanation: `前移：data[${j - 1}] = data[${j}]。`,
        snapshot: snapshot(next, { index: j - 1, label: 'j' }, { [j - 1]: 'shift', [j]: 'shift' }, '后续元素前移'),
      });
    }
    next.values[next.length - 1] = null;
    next.length -= 1;
    emitStep(steps, {
      lineId: 'dlen',
      action: 'delete',
      explanation: `删除完成，length = ${next.length}。`,
      snapshot: snapshot(next, null, {}, '顺序表重新连续存放'),
    });
    return { model: next, steps };
  },
  grade(answer) {
    const model = this.createModel({ values: '12 25 36 48' });
    const applied = this.apply(model, 'insert', { index: '2', value: '20' });
    const expected = applied.model.values.slice(0, applied.model.length).join(' ');
    return answerMatches(answer, expected);
  },
  exercise: {
    prompt: '在顺序表 (12, 25, 36, 48) 的位序 2 插入 20。插入后的关键字序列是什么？',
    placeholder: '12 20 25 36 48',
  },
};
