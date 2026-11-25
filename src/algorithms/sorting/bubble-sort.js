import { answerMatches, barSnapshot, codeLine, parseNumbers, withSorted } from '../shared.js';

const code = [
  codeLine('sig', 'void BubbleSort(ElemType a[], int n)'),
  codeLine('outer', 'for (i = 0; i < n - 1; i++)            // 第 i 趟'),
  codeLine('inner', 'for (j = 0; j < n - 1 - i; j++)        // 相邻两两比较'),
  codeLine('compare', 'if (a[j] > a[j + 1])'),
  codeLine('swap', 'swap(a[j], a[j + 1]);'),
  codeLine('pass', '// 本趟结束，最大值 a[n-1-i] 已“沉”到末尾'),
  codeLine('done', '// 排序完成'),
];

export const algorithm = {
  id: 'bubble-sort',
  mode: 'trace',
  view: 'bars',
  fields: [
    { name: 'values', label: '待排序序列', type: 'text', default: '6 3 5' },
  ],
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
      emit({
        lineId: 'outer',
        action: 'pass',
        explanation: `第 ${i + 1} 趟开始：把未排序区里最大的元素“冒泡”到末尾。`,
        snapshot: barSnapshot(current, withSorted({}, sorted), {}, `第 ${i + 1} 趟`),
        metrics: { comparisons, swaps },
      });

      for (let j = 0; j < n - 1 - i; j += 1) {
        const left = current[j];
        const right = current[j + 1];
        emit({
          lineId: 'compare',
          action: 'compare',
          explanation: `比较相邻元素 a[${j}] = ${left} 和 a[${j + 1}] = ${right}。`,
          snapshot: barSnapshot(
            current,
            { ...withSorted({}, sorted), [j]: 'compare', [j + 1]: 'compare' },
            {},
            '比较相邻元素'
          ),
          metrics: { comparisons, swaps },
        });
        comparisons += 1;

        if (left > right) {
          current[j] = right;
          current[j + 1] = left;
          swaps += 1;
          emit({
            lineId: 'swap',
            action: 'swap',
            explanation: `${left} > ${right}，交换 a[${j}] 和 a[${j + 1}]。`,
            snapshot: barSnapshot(
              current,
              { ...withSorted({}, sorted), [j]: 'swap', [j + 1]: 'swap' },
              {},
              '交换相邻元素'
            ),
            metrics: { comparisons, swaps },
          });
        }
      }

      sorted.push(n - 1 - i);
      emit({
        lineId: 'pass',
        action: 'sorted',
        explanation: `第 ${i + 1} 趟结束，a[${n - 1 - i}] = ${current[n - 1 - i]} 已归位。`,
        snapshot: barSnapshot(current, withSorted({}, sorted), {}, '最大值已归位'),
        metrics: { comparisons, swaps },
      });
    }

    emit({
      lineId: 'done',
      action: 'done',
      explanation: `排序完成，共比较 ${comparisons} 次、交换 ${swaps} 次。`,
      snapshot: barSnapshot(
        current,
        withSorted({}, Array.from({ length: n }, (_, k) => k)),
        {},
        '排序完成'
      ),
      metrics: { comparisons, swaps },
    });
  },

  grade(answer) {
    const result = [];
    this.execute({ values: '6 3 5' }, (partial) => {
      if (partial.action === 'done') result.push(partial);
    });
    const expected = result[result.length - 1].snapshot.items.map((item) => item.value).join(' ');
    return answerMatches(answer, expected);
  },

  exercise: {
    prompt: '对序列 6 3 5 执行冒泡排序。排序完成后的关键字序列是什么？',
    placeholder: '3 5 6',
  },
};
