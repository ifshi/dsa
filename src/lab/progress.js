const KEY = 'dsa-lab-progress';

export function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{"ran":{},"finished":{}}');
  } catch {
    return { ran: {}, finished: {} };
  }
}

export function markRan(id) {
  const data = readProgress();
  data.ran[id] = Date.now();
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function markFinished(id) {
  const data = readProgress();
  data.finished[id] = Date.now();
  localStorage.setItem(KEY, JSON.stringify(data));
}
