import { answerMatches, barSnapshot, codeLine, parseNumbers, withSorted } from '../shared.js';

const code = [
  codeLine('sig', 'void QuickSort(ElemType a[], int s, int t)'),
  codeLine('check', 'if (s < t) {'),
  codeLine('part', 'i = Partition(a, s, t);             // 一趟划分'),
  codeLine('left', 'QuickSort(a, s, i - 1);              // 左区间'),
  codeLine('right', 'QuickSort(a, i + 1, t);              // 右区间'),
  codeLine('pivot', 'pivot = a[s];                        // Partition：取枢轴'),
  codeLine('scanj', 'while (i < j && a[j] >= pivot) j--;  // 从右找小的'),
  codeLine('movej', 'a[i] = a[j];                         // 移到左边'),
  codeLine('scani', 'while (i < j && a[i] <= pivot) i++;  // 从左找大的'),
  codeLine('movei', 'a[j] = a[i];                         // 移到右边'),
  codeLine('place', 'a[i] = pivot;                        // 枢轴归位'),
  codeLine('done', '// 排序完成'),
];

export const algorithm = {
  id: 'quick-sort',
  mode: 'trace',
  view: 'bars',
  fields: [{ name: 'values', label: '待排序序列', type: 'text', default: '6 3 8 5 1' }],
  code,

  execute(form, emit) {
    const values = parseNumbers(form.values, { min: 2, max: 12, name: '待排序序列' });
    const n = values.length;
    const current = values.slice();
    const sorted = [];
    let comparisons = 0;
    let moves = 0;

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `读入待排序序列，共 ${n} 个元素。`,
      snapshot: barSnapshot(current, {}, {}, '待排序序列'),
      metrics: { comparisons, moves },
    });

    function partition(s, t) {
      const pivot = current[s];
      emit({
        lineId: 'pivot',
        action: 'pivot',
        explanation: `取枢轴 pivot = a[${s}] = ${pivot}。`,
        snapshot: barSnapshot(
          current,
          { ...withSorted({}, sorted), [s]: 'pivot' },
          { [s]: 'pivot' },
          '选取枢轴'
        ),
        metrics: { comparisons, moves },
      });

      let i = s;
      let j = t;
      while (i < j) {
        while (i < j && current[j] >= pivot) {
          comparisons += 1;
          emit({
            lineId: 'scanj',
            action: 'compare',
            explanation: `比较 a[${j}] = ${current[j]} 与枢轴 ${pivot}，${current[j]} >= ${pivot}，j 左移。`,
            snapshot: barSnapshot(
              current,
              { ...withSorted({}, sorted), [j]: 'compare', [s]: 'pivot' },
              { [j]: 'j', [s]: 'pivot' },
              '从右向左找小于枢轴的'
            ),
            metrics: { comparisons, moves },
          });
          j -= 1;
        }
        if (i < j) {
          current[i] = current[j];
          moves += 1;
          emit({
            lineId: 'movej',
            action: 'move',
            explanation: `a[${i}] = a[${j}] = ${current[i]}，把较小元素移到左边。`,
            snapshot: barSnapshot(current, { ...withSorted({}, sorted), [i]: 'shift' }, { [i]: 'i' }, '移动'),
            metrics: { comparisons, moves },
          });
        }
        while (i < j && current[i] <= pivot) {
          comparisons += 1;
          emit({
            lineId: 'scani',
            action: 'compare',
            explanation: `比较 a[${i}] = ${current[i]} 与枢轴 ${pivot}，${current[i]} <= ${pivot}，i 右移。`,
            snapshot: barSnapshot(
              current,
              { ...withSorted({}, sorted), [i]: 'compare', [s]: 'pivot' },
              { [i]: 'i', [s]: 'pivot' },
              '从左向右找大于枢轴的'
            ),
            metrics: { comparisons, moves },
          });
          i += 1;
        }
        if (i < j) {
          current[j] = current[i];
          moves += 1;
          emit({
            lineId: 'movei',
            action: 'move',
            explanation: `a[${j}] = a[${i}] = ${current[j]}，把较大元素移到右边。`,
            snapshot: barSnapshot(current, { ...withSorted({}, sorted), [j]: 'shift' }, { [j]: 'j' }, '移动'),
            metrics: { comparisons, moves },
          });
        }
      }

      current[i] = pivot;
      moves += 1;
      sorted.push(i);
      emit({
        lineId: 'place',
        action: 'place',
        explanation: `枢轴 ${pivot} 归位到 a[${i}]，左侧都比它小、右侧都比它大。`,
        snapshot: barSnapshot(current, withSorted({}, sorted), { [i]: 'pivot' }, '枢轴归位'),
        metrics: { comparisons, moves },
      });
      return i;
    }

    function qs(s, t) {
      if (s >= t) {
        if (s === t && !sorted.includes(s)) sorted.push(s);
        return;
      }
      emit({
        lineId: 'check',
        action: 'check',
        explanation: `对区间 [${s}, ${t}] 做一趟划分。`,
        snapshot: barSnapshot(current, withSorted({}, sorted), {}, `划分区间 [${s}, ${t}]`),
        metrics: { comparisons, moves },
      });
      const i = partition(s, t);
      qs(s, i - 1);
      qs(i + 1, t);
    }

    qs(0, n - 1);

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
    input: { values: '6 3 8 5 1' },
    prompt: '对序列 6 3 8 5 1 做快速排序。排序完成后的关键字序列是什么？',
    placeholder: '1 3 5 6 8',
  },
};
