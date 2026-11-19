import { z } from 'zod';
import { Scenario } from '@/models/quest';
import { DocumentCollection } from './documentStore';
import bundledScenarios from './scenarios.json';

const stageSchema = z.object({
  id: z.string(),
  title: z.string(),
  riddle: z.string(),
  hints: z.array(z.string()),
  condition: z.string(),
  answerHash: z.string().regex(/^[0-9a-f]{64}$/),
  points: z.number().int().nonnegative(),
});

const scenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  stages: z.array(stageSchema).min(1),
});

const scenarios = new DocumentCollection<Scenario>('scenario', scenarioSchema);

export const scenarioRepository = {
  async seed() {
    await Promise.all(z.array(scenarioSchema).parse(bundledScenarios).map((s) => scenarios.put(s)));
  },
  getAll: async () => (await scenarios.all()).sort((a, b) => a.title.localeCompare(b.title)),
  get: (id: string) => scenarios.get(id),
};
