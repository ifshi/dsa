import { answerMatches, codeLine, parseNumbers } from '../shared.js';

const code = [
  codeLine('sig', 'BSTNode* Search(BSTNode* p, KeyType k)'),
  codeLine('null', 'if (p == NULL) return NULL;            // 走到空，没找到'),
  codeLine('compare', 'if (k == p->key) return p;            // 命中'),
  codeLine('left', 'else if (k < p->key) return Search(p->lchild, k);'),
  codeLine('right', 'else return Search(p->rchild, k);'),
];

function insert(root, key) {
  if (!root) return { key, left: null, right: null };
  if (key < root.key) root.left = insert(root.left, key);
  else if (key > root.key) root.right = insert(root.right, key);
  return root;
}

function buildTree(keys) {
  let root = null;
  for (const key of keys) root = insert(root, key);
  return root;
}

function serialize(root) {
  const nodes = [];
  const byKey = new Map();
  let seq = 0;
  function walk(node, parentId) {
    if (!node) return;
    const id = `n${seq++}`;
    nodes.push({ id, label: String(node.key), parent: parentId, key: node.key });
    byKey.set(node.key, id);
    walk(node.left, id);
    walk(node.right, id);
  }
  walk(root, null);
  return { nodes, byKey };
}

function treeSnapshot(nodes, nodeStates, edgeStates, tape, caption) {
  return {
    view: 'tree',
    caption,
    tape,
    nodes: nodes.map((node) => ({
      ...node,
      state: nodeStates[node.id] || 'idle',
      edge: edgeStates[node.id] || 'idle',
    })),
  };
}

export const algorithm = {
  id: 'bst-search',
  mode: 'trace',
  view: 'tree',
  fields: [
    { name: 'keys', label: '插入序列（构建二叉排序树）', type: 'text', default: '50 30 70 20 40 60 80' },
    { name: 'target', label: '查找值 k', type: 'text', default: '40' },
  ],
  code,

  execute(form, emit) {
    const keys = parseNumbers(form.keys, { min: 1, max: 12, name: '插入序列' });
    const target = parseNumbers(form.target, { min: 1, max: 1, name: '查找值' })[0];
    const root = buildTree(keys);
    const { nodes, byKey } = serialize(root);
    let probes = 0;
    const pathKeys = [];

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `按插入序列构建二叉排序树，查找 k = ${target}。`,
      snapshot: treeSnapshot(nodes, {}, {}, [], '二叉排序树（左小右大）'),
      metrics: { probes },
    });

    let cur = root;
    while (cur) {
      probes += 1;
      const curId = byKey.get(cur.key);
      const visitedIds = pathKeys.map((key) => byKey.get(key));
      const nodeStates = {};
      for (const id of visitedIds) nodeStates[id] = 'visit';
      nodeStates[curId] = 'active';
      const edgeStates = {};
      for (const key of pathKeys) edgeStates[byKey.get(key)] = 'path';

      emit({
        lineId: 'compare',
        action: 'visit',
        explanation: `比较当前结点 ${cur.key} 与 k = ${target}。`,
        snapshot: treeSnapshot(nodes, nodeStates, edgeStates, ['路径:', ...pathKeys.map(String), cur.key], `当前结点 ${cur.key}`),
        metrics: { probes },
      });

      if (cur.key === target) {
        nodeStates[curId] = 'found';
        emit({
          lineId: 'compare',
          action: 'found',
          explanation: `命中！结点 ${cur.key} 等于 k = ${target}。`,
          snapshot: {
            ...treeSnapshot(nodes, nodeStates, edgeStates, ['路径:', ...pathKeys.map(String), cur.key], '查找成功'),
            result: { found: true },
          },
          metrics: { probes },
        });
        return;
      }

      const goLeft = target < cur.key;
      pathKeys.push(cur.key);
      const child = goLeft ? cur.left : cur.right;
      if (!child) break;
      const childId = byKey.get(child.key);
      const childStates = {};
      for (const id of pathKeys.map((key) => byKey.get(key))) childStates[id] = 'visit';
      childStates[childId] = 'active';
      const childEdges = {};
      for (const key of pathKeys) childEdges[byKey.get(key)] = 'path';
      childEdges[childId] = 'path';

      emit({
        lineId: goLeft ? 'left' : 'right',
        action: 'move',
        explanation: `${target} ${goLeft ? '<' : '>'} ${cur.key}，进入${goLeft ? '左' : '右'}子树。`,
        snapshot: treeSnapshot(
          nodes,
          childStates,
          childEdges,
          ['路径:', ...pathKeys.map(String), child.key],
          `进入${goLeft ? '左' : '右'}子树`
        ),
        metrics: { probes },
      });
      cur = child;
    }

    const visitedIds = pathKeys.map((key) => byKey.get(key));
    const nodeStates = {};
    for (const id of visitedIds) nodeStates[id] = 'visit';
    const edgeStates = {};
    for (const key of pathKeys) edgeStates[byKey.get(key)] = 'path';
    emit({
      lineId: 'null',
      action: 'miss',
      explanation: `走到空结点仍未找到 ${target}，查找失败。`,
      snapshot: {
        ...treeSnapshot(nodes, nodeStates, edgeStates, ['路径:', ...pathKeys.map(String), '空'], '查找失败'),
        result: { found: false },
      },
      metrics: { probes },
    });
  },

  grade(answer) {
    let result;
    this.execute(this.exercise.input, (partial) => {
      if (partial.snapshot?.result) result = partial.snapshot.result;
    });
    return answerMatches(answer, result.found ? '是' : '否');
  },

  exercise: {
    input: { keys: '50 30 70 20 40', target: '40' },
    prompt: '按 50 30 70 20 40 构建二叉排序树后查找 40。查找是否成功？（填 是 / 否）',
    placeholder: '是',
  },
};
