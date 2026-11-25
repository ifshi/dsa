function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]);
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
}

export function createSvgRenderer() {
  const host = document.createElement('div');
  host.className = 'screen-svg';
  const svg = svgEl('svg', { viewBox: '0 0 760 360', role: 'img' });
  const caption = document.createElement('p');
  caption.className = 'screen-caption';
  host.append(svg, caption);

  function draw(step) {
    const snap = step.snapshot;
    svg.replaceChildren();
    caption.textContent = snap.caption || step.explanation || '';
    const painters = {
      bars: drawBars,
      sequence: drawSequence,
      linked: drawLinked,
      stack: drawStack,
      queue: drawQueue,
      tree: drawTree,
      calls: drawCalls,
      hanoi: drawHanoi,
      twins: drawTwins,
    };
    (painters[snap.view] || drawUnknown)(svg, snap);
  }

  return {
    mount(el) {
      el.replaceChildren(host);
    },
    render(step) {
      if (step) draw(step);
    },
    destroy() {
      host.remove();
    },
  };
}

function drawUnknown(svg) {
  const text = svgEl('text', { x: 24, y: 40, class: 'svg-label' });
  text.textContent = '这个步骤没有可绘制的视图';
  svg.append(text);
}

function drawBars(svg, snap) {
  const items = snap.items || [];
  const width = 760;
  const height = 320;
  const gap = 14;
  const barWidth = Math.min(72, (width - 48 - gap * items.length) / Math.max(items.length, 1));
  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1);
  items.forEach((item, index) => {
    const barHeight = Math.max(18, (Math.abs(item.value) / max) * 230);
    const x = 32 + index * (barWidth + gap);
    const y = height - 46 - barHeight;
    svg.append(svgEl('rect', {
      x, y, width: barWidth, height: barHeight, rx: 6,
      class: `bar bar-${item.state || 'idle'}`,
    }));
    const value = svgEl('text', { x: x + barWidth / 2, y: y - 8, class: 'svg-value' });
    value.textContent = String(item.value);
    svg.append(value);
    const indexLabel = svgEl('text', { x: x + barWidth / 2, y: height - 22, class: 'svg-index' });
    indexLabel.textContent = String(index);
    svg.append(indexLabel);
    if (item.tag) {
      const tag = svgEl('text', { x: x + barWidth / 2, y: height - 6, class: 'svg-tag' });
      tag.textContent = item.tag;
      svg.append(tag);
    }
  });
}

function drawSequence(svg, snap) {
  const cells = snap.cells || [];
  const size = 58;
  cells.forEach((cell, index) => {
    const x = 28 + index * (size + 8);
    svg.append(svgEl('rect', {
      x, y: 120, width: size, height: size, rx: 6,
      class: `cell cell-${cell.state || 'idle'}`,
    }));
    const value = svgEl('text', { x: x + size / 2, y: 154, class: 'svg-value' });
    value.textContent = cell.value === null || cell.value === undefined ? '' : String(cell.value);
    svg.append(value);
    const indexLabel = svgEl('text', { x: x + size / 2, y: 198, class: 'svg-index' });
    indexLabel.textContent = String(index);
    svg.append(indexLabel);
  });
  const meta = svgEl('text', { x: 28, y: 78, class: 'svg-label' });
  meta.textContent = `length = ${snap.length}    capacity = ${snap.capacity}`;
  svg.append(meta);
  if (snap.pointer) {
    const x = 28 + snap.pointer.index * (size + 8) + size / 2;
    const label = svgEl('text', { x, y: 108, class: 'svg-tag' });
    label.textContent = snap.pointer.label;
    svg.append(label);
  }
}

function drawLinked(svg, snap) {
  const nodes = snap.nodes || [];
  nodes.forEach((node, index) => {
    const x = 36 + index * 108;
    svg.append(svgEl('rect', {
      x, y: 140, width: 72, height: 48, rx: 8,
      class: `cell cell-${node.state || 'idle'}`,
    }));
    const value = svgEl('text', { x: x + 36, y: 170, class: 'svg-value' });
    value.textContent = node.head ? 'head' : String(node.value);
    svg.append(value);
    if (index < nodes.length - 1) {
      svg.append(svgEl('line', {
        x1: x + 72, y1: 164, x2: x + 100, y2: 164,
        class: `edge edge-${node.link || 'idle'}`,
      }));
      svg.append(svgEl('polygon', {
        points: `${x + 100},164 ${x + 92},160 ${x + 92},168`,
        class: `edge-head edge-${node.link || 'idle'}`,
      }));
    } else {
      const nil = svgEl('text', { x: x + 92, y: 170, class: 'svg-index' });
      nil.textContent = '∧';
      svg.append(nil);
    }
  });
  const head = svgEl('text', { x: 36, y: 124, class: 'svg-tag' });
  head.textContent = 'L';
  svg.append(head);
}

function drawStack(svg, snap) {
  const capacity = snap.capacity || 8;
  const items = snap.items || [];
  svg.append(svgEl('line', { x1: 300, y1: 40, x2: 300, y2: 320, class: 'peg' }));
  svg.append(svgEl('line', { x1: 430, y1: 40, x2: 430, y2: 320, class: 'peg' }));
  svg.append(svgEl('line', { x1: 300, y1: 320, x2: 430, y2: 320, class: 'peg' }));
  for (let i = 0; i < capacity; i += 1) {
    const item = items[i];
    const y = 276 - i * 32;
    svg.append(svgEl('rect', {
      x: 308, y, width: 114, height: 28, rx: 4,
      class: item ? `cell cell-${item.state || 'idle'}` : 'cell cell-empty',
    }));
    if (item) {
      const text = svgEl('text', { x: 365, y: y + 19, class: 'svg-value' });
      text.textContent = String(item.value);
      svg.append(text);
    }
  }
  const top = svgEl('text', { x: 450, y: items.length ? 294 - (items.length - 1) * 32 : 300, class: 'svg-tag' });
  top.textContent = `top = ${items.length - 1}`;
  svg.append(top);
}

function drawQueue(svg, snap) {
  const slots = snap.slots || [];
  const size = 64;
  slots.forEach((slot, index) => {
    const x = 36 + index * (size + 10);
    svg.append(svgEl('rect', {
      x, y: 140, width: size, height: size, rx: 6,
      class: `cell cell-${slot.state || 'idle'}`,
    }));
    const value = svgEl('text', { x: x + size / 2, y: 178, class: 'svg-value' });
    value.textContent = slot.value === null || slot.value === undefined ? '' : String(slot.value);
    svg.append(value);
    const indexLabel = svgEl('text', { x: x + size / 2, y: 224, class: 'svg-index' });
    indexLabel.textContent = String(index);
    svg.append(indexLabel);
  });
  pointer(svg, snap.front, 'front', 128, size);
  pointer(svg, snap.rear, 'rear', 248, size);
}

function pointer(svg, index, label, y, size) {
  if (index === undefined || index === null) return;
  const x = 36 + index * (size + 10) + size / 2;
  const text = svgEl('text', { x, y, class: 'svg-tag' });
  text.textContent = label;
  svg.append(text);
}

function drawTree(svg, snap) {
  const nodes = snap.nodes || [];
  const positions = layoutTree(nodes);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    if (!node.parent) continue;
    const from = positions.get(node.parent);
    const to = positions.get(node.id);
    svg.append(svgEl('line', {
      x1: from.x, y1: from.y, x2: to.x, y2: to.y,
      class: `edge edge-${node.edge || 'idle'}`,
    }));
  }
  for (const node of nodes) {
    const pos = positions.get(node.id);
    svg.append(svgEl('circle', {
      cx: pos.x, cy: pos.y, r: 20,
      class: `node node-${byId.get(node.id).state || 'idle'}`,
    }));
    const text = svgEl('text', { x: pos.x, y: pos.y + 5, class: 'svg-value' });
    text.textContent = node.label;
    svg.append(text);
  }
  if (snap.tape?.length) {
    const tape = svgEl('text', { x: 24, y: 344, class: 'svg-label' });
    tape.textContent = snap.tape.join('  ');
    svg.append(tape);
  }
}

function layoutTree(nodes) {
  const children = new Map();
  let root = null;
  for (const node of nodes) {
    if (!node.parent) root = node.id;
    else {
      if (!children.has(node.parent)) children.set(node.parent, []);
      children.get(node.parent).push(node.id);
    }
  }
  const pos = new Map();
  let cursor = 0;
  function walk(id, depth) {
    const kids = children.get(id) || [];
    if (!kids.length) {
      pos.set(id, { x: 48 + cursor * 78, y: 48 + depth * 72 });
      cursor += 1;
      return;
    }
    for (const kid of kids) walk(kid, depth + 1);
    const xs = kids.map((kid) => pos.get(kid).x);
    pos.set(id, { x: (xs[0] + xs[xs.length - 1]) / 2, y: 48 + depth * 72 });
  }
  if (root) walk(root, 0);
  return pos;
}

function drawCalls(svg, snap) {
  const frames = snap.frames || [];
  frames.forEach((frame, index) => {
    const y = 48 + index * 52;
    svg.append(svgEl('rect', {
      x: 180, y, width: 400, height: 42, rx: 8,
      class: `cell cell-${frame.state || 'idle'}`,
    }));
    const text = svgEl('text', { x: 380, y: y + 26, class: 'svg-value' });
    text.textContent = frame.result ? `${frame.name} = ${frame.result}` : frame.name;
    svg.append(text);
  });
}

function drawTwins(svg, snap) {
  drawColumn(svg, 70, snap.leftTitle || '左栈', snap.left || []);
  drawColumn(svg, 390, snap.rightTitle || '右栈', snap.right || []);
  if (snap.focus) {
    const text = svgEl('text', { x: 380, y: 36, class: 'svg-tag' });
    text.textContent = snap.focus;
    svg.append(text);
  }
}

function drawColumn(svg, x, title, items) {
  const heading = svgEl('text', { x: x + 70, y: 58, class: 'svg-label' });
  heading.textContent = title;
  svg.append(heading);
  svg.append(svgEl('line', { x1: x, y1: 70, x2: x, y2: 320, class: 'peg' }));
  svg.append(svgEl('line', { x1: x + 150, y1: 70, x2: x + 150, y2: 320, class: 'peg' }));
  svg.append(svgEl('line', { x1: x, y1: 320, x2: x + 150, y2: 320, class: 'peg' }));
  items.forEach((item, index) => {
    const y = 284 - index * 34;
    svg.append(svgEl('rect', {
      x: x + 12, y, width: 126, height: 28, rx: 4,
      class: `cell cell-${item.state || 'idle'}`,
    }));
    const text = svgEl('text', { x: x + 75, y: y + 19, class: 'svg-value' });
    text.textContent = String(item.value);
    svg.append(text);
  });
}

function drawHanoi(svg, snap) {
  const names = ['X', 'Y', 'Z'];
  snap.pegs.forEach((peg, pegIndex) => {
    const x = 140 + pegIndex * 220;
    svg.append(svgEl('line', { x1: x, y1: 70, x2: x, y2: 280, class: 'peg' }));
    svg.append(svgEl('line', { x1: x - 70, y1: 280, x2: x + 70, y2: 280, class: 'peg' }));
    const label = svgEl('text', { x, y: 308, class: 'svg-label' });
    label.textContent = names[pegIndex];
    svg.append(label);
    peg.forEach((disk, level) => {
      const width = 36 + disk * 22;
      const y = 252 - level * 28;
      svg.append(svgEl('rect', {
        x: x - width / 2, y, width, height: 22, rx: 6,
        class: disk === snap.moving ? 'disk disk-moving' : 'disk',
      }));
      const text = svgEl('text', { x, y: y + 16, class: 'svg-value' });
      text.textContent = String(disk);
      svg.append(text);
    });
  });
}
