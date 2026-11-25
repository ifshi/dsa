import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const algorithms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/algorithms' }),
  schema: z.object({
    title: z.string(),
    module: z.enum(['linear', 'tree', 'graph', 'sorting', 'searching', 'design']),
    order: z.number(),
    algorithm: z.string(),
    summary: z.string(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
    tags: z.array(z.string()).default([]),
    popular: z.boolean().default(false),
  }),
});

const modules = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/modules' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
  }),
});

export const collections = { algorithms, modules };
