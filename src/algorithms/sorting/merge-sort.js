import { answerMatches, barSnapshot, codeLine, parseNumbers, withSorted } from '../shared.js';

const code = [
  codeLine('sig', 'void MergeSort(ElemType a[], int s, int t)'),
  codeLine('check', 'if (s < t) {'),
  codeLine('mid', 'mid = (s + t) / 2;                    // 分成两半'),
  codeLine('left', 'MergeSort(a, s, mid);                 // 递归左半'),
  codeLine('right', 'MergeSort(a, mid + 1, t);             // 递归右半'),
  codeLine('merge', 'Merge(a, s, mid, t);                  // 归并两段'),
  codeLine('mcmp', 'while 两段都有剩余: 取较小者写入 tmp'),
  codeLine('mcopy', '把 tmp 回写到 a[s..t]'),
  codeLine('done', '// 排序完成'),
];

function rangeStates(range, states) {
  const next = { ...states };
  for (let k = range[0]; k <= range[1]; k += 1) next[k] = 'visit';
  return next;
}

export const algorithm = {
  id: 'merge-sort',
  mode: 'trace',
  view: 'bars',
  fields: [{ name: 'values', label: '待排序序列', type: 'text', default: '6 3 5 1 8 2' }],
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
      explanation: `读入待排序序列，共 ${n} 个元素。`,
      snapshot: barSnapshot(current, {}, {}, '待排序序列'),
      metrics: { comparisons, moves },
    });

    function ms(s, t) {
      if (s >= t) return;
      const mid = (s + t) >> 1;
      emit({
        lineId: 'mid',
        action: 'split',
        explanation: `把区间 [${s}, ${t}] 分成 [${s}, ${mid}] 和 [${mid + 1}, ${t}] 两半。`,
        snapshot: barSnapshot(current, rangeStates([s, t], {}), {}, `划分区间 [${s}, ${t}]`),
        metrics: { comparisons, moves },
      });
      ms(s, mid);
      ms(mid + 1, t);

      emit({
        lineId: 'merge',
        action: 'merge',
        explanation: `归并有序段 [${s}, ${mid}] 与 [${mid + 1}, ${t}]。`,
        snapshot: barSnapshot(current, rangeStates([s, t], {}), {}, '开始归并'),
        metrics: { comparisons, moves },
      });

      const tmp = current.slice(s, t + 1);
      const leftLen = mid - s + 1;
      const merged = [];
      let li = 0;
      let rj = leftLen;
      while (li < leftLen && rj < tmp.length) {
        comparisons += 1;
        const leftIdx = s + li;
        const rightIdx = s + rj;
        const pickLeft = tmp[li] <= tmp[rj];
        emit({
          lineId: 'mcmp',
          action: 'compare',
          explanation: `比较 a[${leftIdx}] = ${current[leftIdx]} 与 a[${rightIdx}] = ${current[rightIdx]}，取较小者 ${pickLeft ? tmp[li] : tmp[rj]}。`,
          snapshot: barSnapshot(
            current,
            { ...rangeStates([s, t], {}), [leftIdx]: 'compare', [rightIdx]: 'compare' },
            {},
            '比较两段队首'
          ),
          metrics: { comparisons, moves },
        });
        merged.push(pickLeft ? tmp[li++] : tmp[rj++]);
      }
      while (li < leftLen) merged.push(tmp[li++]);
      while (rj < tmp.length) merged.push(tmp[rj++]);

      for (let p = 0; p < merged.length; p += 1) {
        current[s + p] = merged[p];
        moves += 1;
      }

      emit({
        lineId: 'mcopy',
        action: 'merged',
        explanation: `把归并结果写回 a[${s}..${t}]，该区间已有序。`,
        snapshot: barSnapshot(current, rangeStates([s, t], {}), {}, '本段归并完成'),
        metrics: { comparisons, moves },
      });
    }

    ms(0, n - 1);

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
    prompt: '对序列 5 2 8 1 做二路归并排序。排序完成后的关键字序列是什么？',
    placeholder: '1 2 5 8',
  },
};
