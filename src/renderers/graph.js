export function createGraphRenderer() {
  let cy = null;
  let signature = '';
  const host = document.createElement('div');
  host.className = 'screen-graph';
  const canvas = document.createElement('div');
  canvas.className = 'cy';
  const caption = document.createElement('p');
  caption.className = 'screen-caption';
  const tape = document.createElement('p');
  tape.className = 'screen-tape';
  host.append(canvas, tape, caption);

  return {
    async mount(el) {
      el.replaceChildren(host);
      const cytoscape = (await import('cytoscape')).default;
      cy = cytoscape({
        container: canvas,
        elements: [],
        wheelSensitivity: 0.25,
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              color: '#f4f7fb',
              'font-size': 14,
              'font-family': 'Consolas, "Microsoft YaHei", monospace',
              width: 36,
              height: 36,
              'background-color': '#243140',
              'border-width': 2,
              'border-color': '#7d8b9a',
            },
          },
          { selector: 'node.visit', style: { 'background-color': '#c9841a', 'border-color': '#ffd27a' } },
          { selector: 'node.active', style: { 'background-color': '#0f6e6b', 'border-color': '#9cf0ea' } },
          { selector: 'node.done', style: { 'background-color': '#1d6b3a', 'border-color': '#9be7b4' } },
          { selector: 'node.queued', style: { 'background-color': '#1d4e89', 'border-color': '#9ec4f5' } },
          { selector: 'node.source', style: { 'background-color': '#8c2f2f', 'border-color': '#f3b4b4' } },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#607080',
              'target-arrow-color': '#607080',
              'target-arrow-shape': 'none',
              'curve-style': 'bezier',
              label: 'data(weight)',
              color: '#d5deea',
              'font-size': 12,
              'text-background-color': '#0c1218',
              'text-background-opacity': 0.85,
              'text-background-padding': 2,
            },
          },
          { selector: 'edge.directed', style: { 'target-arrow-shape': 'triangle' } },
          { selector: 'edge.consider', style: { width: 3, 'line-color': '#e3a008', 'target-arrow-color': '#e3a008' } },
          { selector: 'edge.tree', style: { width: 4, 'line-color': '#3dbe8b', 'target-arrow-color': '#3dbe8b' } },
          { selector: 'edge.path', style: { width: 4, 'line-color': '#f0f4ff', 'target-arrow-color': '#f0f4ff' } },
          { selector: 'edge.reject', style: { 'line-style': 'dashed', 'line-color': '#8d4a4a', 'target-arrow-color': '#8d4a4a' } },
        ],
      });
    },
    render(step) {
      if (!cy || !step) return;
      const snap = step.snapshot;
      caption.textContent = snap.caption || step.explanation || '';
      tape.textContent = snap.tape?.length ? snap.tape.join('   ') : '';
      const nextSignature = `${snap.nodes.map((node) => node.id).join(',')}|${snap.edges.map((edge) => edge.id).join(',')}|${snap.directed}`;
      if (nextSignature !== signature) {
        cy.elements().remove();
        cy.add([
          ...snap.nodes.map((node) => ({ data: { id: node.id, label: node.label } })),
          ...snap.edges.map((edge) => ({
            data: { id: edge.id, source: edge.source, target: edge.target, weight: edge.weight ?? '' },
          })),
        ]);
        cy.layout({ name: 'circle', padding: 28 }).run();
        signature = nextSignature;
      }
      cy.nodes().forEach((node) => {
        const found = snap.nodes.find((item) => item.id === node.id());
        node.classes(found?.state && found.state !== 'idle' ? found.state : '');
      });
      cy.edges().forEach((edge) => {
        const found = snap.edges.find((item) => item.id === edge.id());
        const classes = [];
        if (snap.directed) classes.push('directed');
        if (found?.state && found.state !== 'idle') classes.push(found.state);
        edge.classes(classes.join(' '));
      });
    },
    destroy() {
      cy?.destroy();
      cy = null;
      host.remove();
    },
  };
}
