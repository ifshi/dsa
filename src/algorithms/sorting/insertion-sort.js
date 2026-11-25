import { answerMatches, barSnapshot, codeLine, parseNumbers, withSorted } from '../shared.js';

const code = [
  codeLine('sig', 'void InsertSort(ElemType a[], int n)'),
  codeLine('outer', 'for (i = 1; i < n; i++)            // 待插入第 i 个元素'),
  codeLine('pick', 'tmp = a[i];                         // 暂存待插入元素'),
  codeLine('find', 'while (j >= 0 && a[j] > tmp)        // 找插入位置'),
  codeLine('shift', 'a[j + 1] = a[j];                   // 后移腾位'),
  codeLine('place', 'a[j + 1] = tmp;                    // 插入'),
  codeLine('done', '// 排序完成'),
];

export const algorithm = {
  id: 'insertion-sort',
  mode: 'trace',
  view: 'bars',
  fields: [{ name: 'values', label: '待排序序列', type: 'text', default: '6 3 5 1' }],
  code,

  execute(form, emit) {
    const values = parseNumbers(form.values, { min: 2, max: 12, name: '待排序序列' });
    const n = values.length;
    const current = values.slice();
    let comparisons = 0;
    let moves = 0;

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `读入待排序序列，共 ${n} 个元素。a[0] 视为初始有序区。`,
      snapshot: barSnapshot(current, withSorted({}, [0]), {}, '初始有序区含 a[0]'),
      metrics: { comparisons, moves },
    });

    for (let i = 1; i < n; i += 1) {
      const tmp = current[i];
      emit({
        lineId: 'pick',
        action: 'pick',
        explanation: `暂存 a[${i}] = ${tmp}，准备插入前面有序区。`,
        snapshot: barSnapshot(current, { [i]: 'active' }, { [i]: 'tmp' }, `取出 a[${i}]`),
        metrics: { comparisons, moves },
      });

      let j = i - 1;
      while (j >= 0) {
        comparisons += 1;
        const stop = current[j] <= tmp;
        emit({
          lineId: 'find',
          action: 'compare',
          explanation: stop
            ? `比较 a[${j}] = ${current[j]} 与 tmp = ${tmp}，${current[j]} <= ${tmp}，找到插入位置。`
            : `比较 a[${j}] = ${current[j]} 与 tmp = ${tmp}，${current[j]} > ${tmp}，继续后移。`,
          snapshot: barSnapshot(current, { [j]: 'compare', [j + 1]: 'shift' }, {}, '寻找插入位置'),
          metrics: { comparisons, moves },
        });
        if (stop) break;
        current[j + 1] = current[j];
        moves += 1;
        emit({
          lineId: 'shift',
          action: 'shift',
          explanation: `a[${j + 1}] = a[${j}]，把 ${current[j]} 后移一位。`,
          snapshot: barSnapshot(current, { [j]: 'shift', [j + 1]: 'shift' }, {}, '元素后移'),
          metrics: { comparisons, moves },
        });
        j -= 1;
      }
      current[j + 1] = tmp;
      emit({
        lineId: 'place',
        action: 'insert',
        explanation: `把 tmp = ${tmp} 放入 a[${j + 1}]，有序区扩展到 a[0..${i}]。`,
        snapshot: barSnapshot(
          current,
          withSorted({ [j + 1]: 'insert' }, Array.from({ length: i + 1 }, (_, k) => k)),
          {},
          '插入完成'
        ),
        metrics: { comparisons, moves },
      });
    }

    emit({
      lineId: 'done',
      action: 'done',
      explanation: `排序完成，共比较 ${comparisons} 次、移动 ${moves} 次。`,
      snapshot: barSnapshot(current, withSorted({}, Array.from({ length: n }, (_, k) => k)), {}, '排序完成'),
      metrics: { comparisons, moves },
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
    prompt: '对序列 5 2 8 1 做直接插入排序。排序完成后的关键字序列是什么？',
    placeholder: '1 2 5 8',
  },
};
