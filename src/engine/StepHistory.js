/** 步骤历史：教学规模下保存完整快照，前进和回退只移动下标。 */
export function createHistory(rawSteps = []) {
  let steps = renumber(rawSteps);
  let index = 0;

  return {
    get steps() {
      return steps;
    },
    get index() {
      return index;
    },
    get length() {
      return steps.length;
    },
    get current() {
      return steps[index] ?? null;
    },
    jump(next) {
      if (!steps.length) return null;
      index = clamp(next, 0, steps.length - 1);
      return steps[index];
    },
    back() {
      return this.jump(index - 1);
    },
    forward() {
      return this.jump(index + 1);
    },
    replace(raw) {
      steps = renumber(raw);
      index = 0;
      return steps[0] ?? null;
    },
    append(raw) {
      const start = steps.length;
      for (const step of raw) steps.push({ ...step, id: steps.length });
      index = steps.length ? Math.min(start, steps.length - 1) : 0;
      return start;
    },
  };
}

function renumber(rawSteps) {
  return rawSteps.map((step, id) => ({ ...step, id }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
