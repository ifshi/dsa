import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { modules } from '../data/modules.js';

export const GET: APIRoute = async () => {
  const algorithms = await getCollection('algorithms');

  const payload = {
    modules: modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      summary: mod.summary,
    })),
    algorithms: algorithms
      .map((entry) => ({
        slug: entry.id,
        title: entry.data.title,
        summary: entry.data.summary,
        module: entry.data.module,
        tags: entry.data.tags,
        popular: entry.data.popular,
      }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
