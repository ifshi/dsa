import { answerMatches, barSnapshot, codeLine, parseNumbers } from '../shared.js';

const code = [
  codeLine('sig', 'int BinSearch(ElemType a[], int n, KeyType k)'),
  codeLine('init', 'low = 0, high = n - 1;'),
  codeLine('loop', 'while (low <= high) {'),
  codeLine('mid', 'mid = (low + high) / 2;'),
  codeLine('compare', 'if (a[mid] == k) return mid;        // 命中'),
  codeLine('left', 'else if (k < a[mid]) high = mid - 1; // 去左半'),
  codeLine('right', 'else low = mid + 1;                  // 去右半'),
  codeLine('miss', 'return -1;                              // 未找到'),
];

function pointerTags(low, high, mid) {
  const tags = {};
  if (low === mid) tags[low] = 'low,mid';
  else tags[low] = 'low';
  if (high !== low && high === mid) tags[high] = 'high,mid';
  else if (high !== low) tags[high] = 'high';
  if (mid !== low && mid !== high) tags[mid] = 'mid';
  return tags;
}

export const algorithm = {
  id: 'binary-search',
  mode: 'trace',
  view: 'bars',
  fields: [
    { name: 'values', label: '有序序列（升序）', type: 'text', default: '12 25 36 48 61 73 88' },
    { name: 'target', label: '查找值 k', type: 'text', default: '48' },
  ],
  code,

  execute(form, emit) {
    const values = parseNumbers(form.values, { min: 1, max: 12, name: '有序序列' });
    const target = parseNumbers(form.target, { min: 1, max: 1, name: '查找值' })[0];
    const n = values.length;
    let probes = 0;
    let low = 0;
    let high = n - 1;

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `在升序序列中折半查找 k = ${target}。`,
      snapshot: barSnapshot(values, {}, {}, '待查找的有序序列'),
      metrics: { probes },
    });

    emit({
      lineId: 'init',
      action: 'init',
      explanation: `初始 low = ${low}，high = ${high}。`,
      snapshot: barSnapshot(values, { [low]: 'compare', [high]: 'compare' }, pointerTags(low, high, (low + high) >> 1), '初始化查找区间'),
      metrics: { probes },
    });

    while (low <= high) {
      const mid = (low + high) >> 1;
      probes += 1;
      emit({
        lineId: 'mid',
        action: 'mid',
        explanation: `mid = (${low} + ${high}) / 2 = ${mid}，取中间元素 a[${mid}] = ${values[mid]}。`,
        snapshot: barSnapshot(
          values,
          { [low]: 'visit', [high]: 'visit', [mid]: 'compare' },
          pointerTags(low, high, mid),
          '取中间元素'
        ),
        metrics: { probes },
      });

      if (values[mid] === target) {
        emit({
          lineId: 'compare',
          action: 'found',
          explanation: `命中！a[${mid}] = ${target}，返回下标 ${mid}。`,
          snapshot: { ...barSnapshot(values, { [mid]: 'found' }, { [mid]: '命中' }, '查找成功'), result: { found: true, index: mid } },
          metrics: { probes },
        });
        return;
      }

      if (target < values[mid]) {
        high = mid - 1;
        emit({
          lineId: 'left',
          action: 'shrink',
          explanation: `${target} < a[${mid}] = ${values[mid]}，high 更新为 ${high}，去左半区间。`,
          snapshot: barSnapshot(
            values,
            { [mid]: 'delete', [high + 1]: 'compare', [high]: 'visit' },
            pointerTags(low, high, -1),
            '缩小到左半'
          ),
          metrics: { probes },
        });
      } else {
        low = mid + 1;
        emit({
          lineId: 'right',
          action: 'shrink',
          explanation: `${target} > a[${mid}] = ${values[mid]}，low 更新为 ${low}，去右半区间。`,
          snapshot: barSnapshot(
            values,
            { [mid]: 'delete', [low - 1]: 'compare', [low]: 'visit' },
            pointerTags(low, high, -1),
            '缩小到右半'
          ),
          metrics: { probes },
        });
      }
    }

    emit({
      lineId: 'miss',
      action: 'miss',
      explanation: `low > high，未找到 ${target}，返回 -1。`,
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
    input: { values: '12 25 36 48 61 73 88', target: '48' },
    prompt: '在有序序列 12 25 36 48 61 73 88 中折半查找 48。返回的下标是多少？（未找到填 -1）',
    placeholder: '3',
  },
};
