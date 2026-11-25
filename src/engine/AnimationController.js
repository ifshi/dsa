/** 只按速度移动步骤下标，不计算算法，也不改 SVG。 */
export function createAnimation(state) {
  let timer = 0;
  let speed = 680;

  function clear() {
    if (timer) clearTimeout(timer);
    timer = 0;
  }

  function tick() {
    const snap = state.snapshot();
    if (!snap.length || snap.index >= snap.length - 1) {
      clear();
      state.setStatus('done');
      return;
    }
    state.move(snap.index + 1, { keepStatus: true });
    timer = setTimeout(tick, speed);
  }

  return {
    setSpeed(ms) {
      speed = ms;
    },
    play() {
      const snap = state.snapshot();
      if (!snap.length) return;
      if (snap.index >= snap.length - 1) state.move(0, { keepStatus: true });
      clear();
      state.setStatus('playing');
      timer = setTimeout(tick, speed);
    },
    pause() {
      clear();
      const snap = state.snapshot();
      if (state.status !== 'playing') return;
      state.setStatus(snap.length && snap.index >= snap.length - 1 ? 'done' : 'paused');
    },
    step() {
      this.pause();
      state.move(state.snapshot().index + 1);
    },
    back() {
      this.pause();
      state.move(state.snapshot().index - 1);
    },
    reset() {
      this.pause();
      state.move(0);
    },
    seek(index) {
      this.pause();
      state.move(index);
    },
  };
}
