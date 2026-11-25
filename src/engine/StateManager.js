import { createHistory } from './StepHistory.js';

/** 播放状态与当前步。订阅者只拿快照，不直接改历史。 */
export function createStateManager() {
  const listeners = new Set();
  let history = createHistory([]);
  let status = 'idle';

  function publish() {
    const snap = snapshot();
    for (const listener of listeners) listener(snap);
  }

  function snapshot() {
    return {
      status,
      index: history.index,
      length: history.length,
      step: history.current,
      steps: history.steps,
    };
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
    get status() {
      return status;
    },
    snapshot,
    setStatus(next) {
      status = next;
      publish();
    },
    load(steps) {
      history = createHistory(steps);
      status = steps.length ? 'paused' : 'idle';
      publish();
    },
    append(steps) {
      const start = history.append(steps);
      status = 'paused';
      publish();
      return start;
    },
    move(index, { keepStatus = false } = {}) {
      history.jump(index);
      if (!keepStatus) {
        status = history.length && history.index >= history.length - 1 ? 'done' : 'paused';
      }
      publish();
    },
  };
}
