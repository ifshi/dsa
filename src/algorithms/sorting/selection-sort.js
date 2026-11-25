import { answerMatches, barSnapshot, codeLine, parseNumbers, withSorted } from '../shared.js';

const code = [
  codeLine('sig', 'void SelectSort(ElemType a[], int n)'),
  codeLine('outer', 'for (i = 0; i < n - 1; i++)          // 第 i 趟'),
  codeLine('init', 'min = i;                              // 假设 a[i] 最小'),
  codeLine('inner', 'for (j = i + 1; j < n; j++)          // 在无序区找最小'),
  codeLine('compare', 'if (a[j] < a[min]) min = j;         // 更新最小下标'),
  codeLine('swap', 'swap(a[i], a[min]);                   // 最小值放到 i'),
  codeLine('done', '// 排序完成'),
];

export const algorithm = {
  id: 'selection-sort',
  mode: 'trace',
  view: 'bars',
  fields: [{ name: 'values', label: '待排序序列', type: 'text', default: '6 3 5 1' }],
  code,

  execute(form, emit) {
    const values = parseNumbers(form.values, { min: 2, max: 12, name: '待排序序列' });
    const n = values.length;
    const current = values.slice();
    const sorted = [];
    let comparisons = 0;
    let swaps = 0;

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `读入待排序序列，共 ${n} 个元素。`,
      snapshot: barSnapshot(current, {}, {}, '待排序序列'),
      metrics: { comparisons, swaps },
    });

    for (let i = 0; i < n - 1; i += 1) {
      let min = i;
      emit({
        lineId: 'init',
        action: 'select',
        explanation: `第 ${i + 1} 趟：先假设 a[${i}] = ${current[i]} 最小。`,
        snapshot: barSnapshot(current, { ...withSorted({}, sorted), [i]: 'active' }, { [i]: 'min' }, `第 ${i + 1} 趟开始`),
        metrics: { comparisons, swaps },
      });

      for (let j = i + 1; j < n; j += 1) {
        comparisons += 1;
        emit({
          lineId: 'compare',
          action: 'compare',
          explanation: `比较 a[${j}] = ${current[j]} 与当前最小 a[${min}] = ${current[min]}。`,
          snapshot: barSnapshot(
            current,
            { ...withSorted({}, sorted), [j]: 'compare', [min]: 'active' },
            { [min]: 'min', [j]: 'j' },
            '在无序区找最小'
          ),
          metrics: { comparisons, swaps },
        });
        if (current[j] < current[min]) min = j;
      }

      if (min !== i) {
        const t = current[i];
        current[i] = current[min];
        current[min] = t;
        swaps += 1;
        emit({
          lineId: 'swap',
          action: 'swap',
          explanation: `把最小值 ${current[i]} 交换到 a[${i}]。`,
          snapshot: barSnapshot(current, { ...withSorted({}, sorted), [i]: 'swap', [min]: 'swap' }, {}, '交换'),
          metrics: { comparisons, swaps },
        });
      }

      sorted.push(i);
      emit({
        lineId: 'outer',
        action: 'sorted',
        explanation: `第 ${i + 1} 趟结束，a[${i}] = ${current[i]} 已归位。`,
        snapshot: barSnapshot(current, withSorted({}, sorted), {}, '最小元素已归位'),
        metrics: { comparisons, swaps },
      });
    }

    sorted.push(n - 1);
    emit({
      lineId: 'done',
      action: 'done',
      explanation: `排序完成，共比较 ${comparisons} 次、交换 ${swaps} 次。`,
      snapshot: barSnapshot(current, withSorted({}, Array.from({ length: n }, (_, k) => k)), {}, '排序完成'),
      metrics: { comparisons, swaps },
    });
  },

  grade(answer) {
    const result = [];
    this.execute(this.exercise.input, (partial) => {
      if (partial.action === 'done') result.push(partial);
    });
    const expected = result[result.length - 1].snapshot.items.map((item) => item.value).join(' ');
    return answerMatches(answer, expected);
  },

  exercise: {
    input: { values: '5 2 8 1' },
    prompt: '对序列 5 2 8 1 做简单选择排序。排序完成后的关键字序列是什么？',
    placeholder: '1 2 5 8',
  },
};
