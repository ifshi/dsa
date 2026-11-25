const loaders = {
  'sequence-list': () => import('./linear/sequence-list.js'),
  'singly-linked-list': () => import('./linear/singly-linked-list.js'),
  stack: () => import('./linear/stack.js'),
  'circular-queue': () => import('./linear/circular-queue.js'),
  'expression-eval': () => import('./linear/expression-eval.js'),
  'tree-traversal': () => import('./tree/tree-traversal.js'),
  dfs: () => import('./graph/dfs.js'),
  bfs: () => import('./graph/bfs.js'),
  prim: () => import('./graph/prim.js'),
  dijkstra: () => import('./graph/dijkstra.js'),
  'insertion-sort': () => import('./sorting/insertion-sort.js'),
  'bubble-sort': () => import('./sorting/bubble-sort.js'),
  'quick-sort': () => import('./sorting/quick-sort.js'),
  'selection-sort': () => import('./sorting/selection-sort.js'),
  'merge-sort': () => import('./sorting/merge-sort.js'),
  'sequential-search': () => import('./searching/sequential-search.js'),
  'binary-search': () => import('./searching/binary-search.js'),
  'bst-search': () => import('./searching/bst-search.js'),
  factorial: () => import('./design/factorial.js'),
  hanoi: () => import('./design/hanoi.js'),
};

export function loadAlgorithm(id) {
  const load = loaders[id];
  if (!load) return Promise.reject(new Error(`未登记的算法：${id}`));
  return load().then((mod) => mod.algorithm);
}

export const algorithmIds = Object.keys(loaders);
