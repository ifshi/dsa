export const modules = [
  {
    id: 'linear',
    title: '线性结构',
    chapter: '第2–3章',
    summary: '顺序表、单链表、栈、循环队列，以及栈在表达式求值中的用法。',
    accent: '#0f6e6b',
  },
  {
    id: 'tree',
    title: '树形结构',
    chapter: '第7章',
    summary: '按课件中的二叉树演示先序、中序和后序遍历。',
    accent: '#1d6b3a',
  },
  {
    id: 'graph',
    title: '图结构',
    chapter: '第8章',
    summary: '邻接表上的 DFS、BFS、Prim 与 Dijkstra，用 Cytoscape 画图。',
    accent: '#1d4e89',
  },
  {
    id: 'sorting',
    title: '排序算法',
    chapter: '第10章',
    summary: '直接插入、冒泡、快速、简单选择和二路归并，按课件代码逐步执行。',
    accent: '#8a4b08',
  },
  {
    id: 'searching',
    title: '查找算法',
    chapter: '第9章',
    summary: '顺序查找、折半查找，以及二叉排序树的插入与查找。',
    accent: '#6b2d5b',
  },
  {
    id: 'design',
    title: '算法设计思想',
    chapter: '第5章',
    summary: '用阶乘看递归调用栈，用汉诺塔看分治如何把问题拆开。',
    accent: '#8c2f2f',
  },
];

export function moduleById(id) {
  return modules.find((item) => item.id === id);
}
