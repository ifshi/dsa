import { createAnimation } from '../engine/AnimationController.js';
import { createStateManager } from '../engine/StateManager.js';
import { generateTrace } from '../engine/TraceGenerator.js';
import { loadAlgorithm } from '../algorithms/registry.js';
import { markFinished, markRan } from './progress.js';
import { createGraphRenderer } from '../renderers/graph.js';
import { createSvgRenderer } from '../renderers/svg.js';

export async function mountLab(root) {
  const algorithmId = root.dataset.algorithm;
  let algorithm;
  try {
    algorithm = await loadAlgorithm(algorithmId);
  } catch (error) {
    root.textContent = error.message;
    return;
  }

  root.innerHTML = template(algorithm);
  const screen = root.querySelector('[data-screen]');
  const errorBox = root.querySelector('[data-error]');
  const explain = root.querySelector('[data-explain]');
  const metrics = root.querySelector('[data-metrics]');
  const code = root.querySelector('[data-code]');
  const log = root.querySelector('[data-log]');
  const counter = root.querySelector('[data-counter]');
  const progress = root.querySelector('[data-progress]');
  const speed = root.querySelector('[data-speed]');
  const speedLabel = root.querySelector('[data-speed-label]');
  const exerciseResult = root.querySelector('[data-exercise-result]');
  const renderer = algorithm.view === 'graph' ? createGraphRenderer() : createSvgRenderer();
  await renderer.mount(screen);

  const state = createStateManager();
  const animation = createAnimation(state);
  let model = null;
  renderCode(code, algorithm.code, null);

  state.subscribe((snap) => {
    const step = snap.step;
    counter.textContent = snap.length ? `第 ${snap.index + 1} / ${snap.length} 步` : '尚未执行';
    progress.max = String(Math.max(snap.length - 1, 0));
    progress.value = String(snap.index || 0);
    progress.disabled = snap.length <= 1;
    if (step) {
      renderer.render(step);
      explain.textContent = step.explanation;
      metrics.textContent = formatMetrics(step.metrics);
      renderCode(code, algorithm.code, step.lineId);
      const active = code.querySelector('.is-active');
      active?.scrollIntoView({ block: 'nearest' });
    }
    renderLog(log, snap);
    root.dataset.status = snap.status;
    if (snap.status === 'done' && snap.length > 1) markFinished(algorithmId);
  });

  function showError(error) {
    errorBox.hidden = false;
    errorBox.textContent = error.message || String(error);
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function readForm(scope) {
    const data = {};
    for (const field of scope.querySelectorAll('[data-field]')) data[field.name] = field.value;
    return data;
  }

  function bootTrace() {
    clearError();
    try {
      const trace = generateTrace(algorithm.execute, readForm(root.querySelector('[data-fields]')));
      state.load(trace.steps);
      markRan(algorithmId);
    } catch (error) {
      showError(error);
    }
  }

  function bootModel() {
    clearError();
    try {
      model = algorithm.createModel(readForm(root.querySelector('[data-fields]')));
      const trace = generateTrace((input, emit) => algorithm.describe(input, emit), model);
      state.load(trace.steps);
      markRan(algorithmId);
    } catch (error) {
      showError(error);
    }
  }

  if (algorithm.mode === 'ops') bootModel();
  else bootTrace();

  root.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-jump]');
    if (jump) {
      animation.seek(Number(jump.dataset.jump));
      return;
    }
    const action = event.target.closest('[data-act]')?.dataset.act;
    if (!action) return;
    if (action === 'generate') bootTrace();
    if (action === 'reset-model') bootModel();
    if (action === 'play') animation.play();
    if (action === 'pause') animation.pause();
    if (action === 'step') animation.step();
    if (action === 'back') animation.back();
    if (action === 'reset') animation.reset();
    if (action === 'operate') {
      clearError();
      const button = event.target.closest('[data-act="operate"]');
      try {
        const applied = algorithm.apply(model, button.dataset.op, readForm(button.closest('[data-op]')));
        model = applied.model;
        state.append(applied.steps.map((step, index) => ({ ...step, id: index })));
        animation.play();
        markRan(algorithmId);
      } catch (error) {
        showError(error);
      }
    }
    if (action === 'grade') {
      const answer = root.querySelector('[data-answer]').value;
      try {
        const result = algorithm.grade(answer);
        exerciseResult.textContent = result.ok ? '正确。可以在推演区把这一结果再走一遍。' : `还不一致。参考结果：${result.expected}`;
        exerciseResult.dataset.ok = String(result.ok);
      } catch (error) {
        exerciseResult.textContent = error.message;
      }
    }
  });

  progress.addEventListener('input', () => animation.seek(Number(progress.value)));
  speed.addEventListener('input', () => {
    const ms = Number(speed.value);
    animation.setSpeed(ms);
    speedLabel.textContent = `${(ms / 1000).toFixed(1)} 秒/步`;
  });

  window.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight') animation.step();
    if (event.key === 'ArrowLeft') animation.back();
    if (event.key === ' ') {
      event.preventDefault();
      if (state.status === 'playing') animation.pause();
      else animation.play();
    }
  });
}

function template(algorithm) {
  const fields = (algorithm.fields || [])
    .map((field) => fieldMarkup(field))
    .join('');
  const ops = (algorithm.operations || [])
    .map((op) => {
      const inputs = (op.fields || []).map((field) => fieldMarkup(field, true)).join('');
      return `<div class="op" data-op>${inputs}<button type="button" data-act="operate" data-op="${op.id}">${op.label}</button></div>`;
    })
    .join('');
  const primary = algorithm.mode === 'ops'
    ? '<button type="button" data-act="reset-model">重设初始数据</button>'
    : '<button type="button" data-act="generate">生成推演</button>';
  const exercise = algorithm.exercise
    ? `<section class="exercise"><h3>练习</h3><p>${algorithm.exercise.prompt}</p><div class="exercise-row"><input data-answer placeholder="${algorithm.exercise.placeholder || ''}" /><button type="button" data-act="grade">检查</button></div><p class="exercise-result" data-exercise-result></p></section>`
    : '';
  return `
    <div class="lab-toolbar">
      <div class="fields" data-fields>${fields}</div>
      <div class="toolbar-actions">${primary}</div>
      <div class="ops">${ops}</div>
    </div>
    <p class="lab-error" data-error hidden></p>
    <div class="lab-stage" data-screen></div>
    <div class="lab-readout">
      <p data-explain>等待执行。</p>
      <p data-metrics></p>
    </div>
    <div class="lab-controls">
      <button type="button" data-act="back">后退</button>
      <button type="button" data-act="play">播放</button>
      <button type="button" data-act="pause">暂停</button>
      <button type="button" data-act="step">单步</button>
      <button type="button" data-act="reset">回到开头</button>
      <label>进度 <input data-progress type="range" min="0" max="0" value="0" /></label>
      <label>速度 <input data-speed type="range" min="180" max="1400" step="20" value="680" /> <span data-speed-label>0.7 秒/步</span></label>
      <span class="counter" data-counter></span>
    </div>
    <div class="lab-split">
      <pre class="lab-code" data-code></pre>
      <div>
        <h3>步骤</h3>
        <ol class="step-log" data-log></ol>
        ${exercise}
        <p class="keyhint">方向键单步，空格播放或暂停。点步骤可跳转。</p>
      </div>
    </div>`;
}

function fieldMarkup(field, compact = false) {
  const common = `data-field name="${field.name}" ${compact ? '' : ''}`;
  if (field.type === 'textarea') {
    return `<label class="field">${field.label}<textarea ${common} rows="5">${field.default ?? ''}</textarea></label>`;
  }
  if (field.type === 'select') {
    const options = field.options.map((option) => `<option value="${option.value}" ${option.value === field.default ? 'selected' : ''}>${option.label}</option>`).join('');
    return `<label class="field">${field.label}<select ${common}>${options}</select></label>`;
  }
  return `<label class="field ${compact ? 'compact' : ''}">${field.label}<input ${common} value="${field.default ?? ''}" /></label>`;
}

function renderCode(pre, lines, lineId) {
  pre.innerHTML = lines
    .map((line) => {
      const active = line.id && line.id === lineId ? ' is-active' : '';
      const pad = '&nbsp;'.repeat(line.indent * 4);
      return `<span class="code-line${active}" data-line="${line.id || ''}">${pad}${escapeHtml(line.text)}</span>`;
    })
    .join('');
}

function renderLog(list, snap) {
  list.innerHTML = snap.steps
    .map((step, index) => `<li class="${index === snap.index ? 'is-current' : ''}" data-jump="${index}"><button type="button">${index + 1}. ${escapeHtml(step.explanation)}</button></li>`)
    .join('');
  const current = list.querySelector('.is-current');
  if (current) list.scrollTop = Math.max(0, current.offsetTop - list.clientHeight / 2);
}

function formatMetrics(metrics) {
  if (!metrics) return '';
  const labels = { comparisons: '比较', swaps: '交换', moves: '移动', probes: '探测' };
  return Object.entries(metrics)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${labels[key] || key} ${value}`)
    .join('    ');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]);
}
