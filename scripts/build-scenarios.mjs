import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

const root = new URL('../', import.meta.url);
const source = JSON.parse(readFileSync(new URL('scripts/scenarios.source.json', root), 'utf8'));
const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

const scenarios = source.map(({ stages, ...scenario }) => ({
  ...scenario,
  stages: stages.map(({ code, ...stage }) => ({ ...stage, answerHash: sha256(code) })),
}));
writeFileSync(new URL('src/data/scenarios.json', root), JSON.stringify(scenarios, null, 2) + '\n');

const cards = [];
const mockTags = [];
mkdirSync(new URL('assets/mock-tags/', root), { recursive: true });
const addMockTag = async (file, label, code) => {
  await QRCode.toFile(fileURLToPath(new URL(`assets/mock-tags/${file}.png`, root)), code, { margin: 2, width: 300 });
  mockTags.push(`  { label: '${label}', image: require('../../assets/mock-tags/${file}.png') },`);
};

for (const scenario of source) {
  for (const [index, stage] of scenario.stages.entries()) {
    const svg = await QRCode.toString(stage.code, { type: 'svg', margin: 1 });
    cards.push(`<figure>${svg}<figcaption><b>${scenario.title}</b><br>Этап ${index + 1}: ${stage.title}</figcaption></figure>`);
    await addMockTag(stage.id, `${scenario.title} · этап ${index + 1}`, stage.code);
  }
}
await addMockTag('foreign', 'Посторонний QR-код', 'https://example.com/poster');

writeFileSync(
  new URL('src/data/mockTags.ts', root),
  `export type MockTag = { label: string; image: number };\n\nexport const mockTags: MockTag[] = [\n${mockTags.join('\n')}\n];\n`,
);

mkdirSync(new URL('tags/', root), { recursive: true });
writeFileSync(
  new URL('tags/tags.html', root),
  `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>QR-метки квестов</title>
<style>
  body { font-family: system-ui, sans-serif; display: flex; flex-wrap: wrap; gap: 24px; padding: 24px; }
  figure { width: 220px; margin: 0; text-align: center; break-inside: avoid; }
  svg { width: 200px; height: 200px; }
  figcaption { font-size: 14px; }
</style></head>
<body>
${cards.join('\n')}
</body></html>
`,
);

console.log(`Сценариев: ${scenarios.length}, меток: ${cards.length}`);
