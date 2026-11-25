import { getCollection } from 'astro:content';

export async function getAllAlgorithms() {
  const entries = await getCollection('algorithms');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getAlgorithmsByModule(moduleId) {
  const entries = await getAllAlgorithms();
  return entries
    .filter((entry) => entry.data.module === moduleId)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getPopularAlgorithms() {
  const entries = await getAllAlgorithms();
  return entries.filter((entry) => entry.data.popular);
}

export async function getAlgorithmCountByModule() {
  const entries = await getAllAlgorithms();
  const counts = {};
  for (const entry of entries) {
    counts[entry.data.module] = (counts[entry.data.module] || 0) + 1;
  }
  return counts;
}
