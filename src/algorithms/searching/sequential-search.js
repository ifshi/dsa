import { answerMatches, barSnapshot, codeLine, parseNumbers } from '../shared.js';

const code = [
  codeLine('sig', 'int SeqSearch(ElemType a[], int n, KeyType k)'),
  codeLine('loop', 'for (i = 0; i < n; i++)               // 从头到尾逐个比较'),
  codeLine('compare', 'if (a[i] == k) return i;            // 命中，返回下标'),
  codeLine('miss', 'return -1;                              // 未找到'),
];

export const algorithm = {
  id: 'sequential-search',
  mode: 'trace',
  view: 'bars',
  fields: [
    { name: 'values', label: '查找序列', type: 'text', default: '12 25 36 48 61 36 25' },
    { name: 'target', label: '查找值 k', type: 'text', default: '48' },
  ],
  code,

  execute(form, emit) {
    const values = parseNumbers(form.values, { min: 1, max: 12, name: '查找序列' });
    const target = parseNumbers(form.target, { min: 1, max: 1, name: '查找值' })[0];
    const n = values.length;
    let probes = 0;

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `在序列中查找 k = ${target}。`,
      snapshot: barSnapshot(values, {}, {}, '待查找序列'),
      metrics: { probes },
    });

    for (let i = 0; i < n; i += 1) {
      probes += 1;
      emit({
        lineId: 'compare',
        action: 'compare',
        explanation: `第 ${probes} 次探测：比较 a[${i}] = ${values[i]} 与 k = ${target}。`,
        snapshot: barSnapshot(values, { [i]: 'compare' }, { [i]: 'i' }, '逐个探测'),
        metrics: { probes },
      });
      if (values[i] === target) {
        emit({
          lineId: 'compare',
          action: 'found',
          explanation: `命中！a[${i}] = ${target}，返回下标 ${i}。`,
          snapshot: { ...barSnapshot(values, { [i]: 'found' }, { [i]: '命中' }, '查找成功'), result: { found: true, index: i } },
          metrics: { probes },
        });
        return;
      }
    }

    emit({
      lineId: 'miss',
      action: 'miss',
      explanation: `遍历完仍未找到 ${target}，返回 -1。`,
      snapshot: { ...barSnapshot(values, {}, {}, '查找失败'), result: { found: false, index: -1 } },
      metrics: { probes },
    });
  },

  grade(answer) {
    let result;
    this.execute(this.exercise.input, (partial) => {
      if (partial.snapshot?.result) result = partial.snapshot.result;
    });
    return answerMatches(answer, String(result.index));
  },

  exercise: {
    input: { values: '12 25 36 48 61', target: '48' },
    prompt: '在序列 12 25 36 48 61 中顺序查找 48。返回的下标是多少？（未找到填 -1）',
    placeholder: '3',
  },
};
