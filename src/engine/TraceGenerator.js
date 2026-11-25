/**
 * 调用算法真实的 execute / apply，把 emit 收集成统一轨迹。
 * 这里不接触 DOM。
 */
export function generateTrace(execute, input) {
  const steps = [];
  const emit = (partial) => {
    if (!partial?.snapshot) throw new Error('步骤缺少 snapshot');
    steps.push({
      id: steps.length,
      lineId: partial.lineId ?? null,
      action: partial.action ?? 'step',
      explanation: partial.explanation ?? '',
      snapshot: partial.snapshot,
      metrics: partial.metrics ?? null,
    });
    if (steps.length > 5000) throw new Error('步骤超过 5000，请缩小输入规模');
  };
  execute(input, emit);
  if (!steps.length) throw new Error('这次执行没有产生步骤');
  return { input, steps };
}
