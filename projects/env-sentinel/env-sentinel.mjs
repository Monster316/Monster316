import { readFile } from "node:fs/promises";
export function parseKeys(text) {
  const keys = new Set();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) keys.add(match[1]);
  }
  return [...keys].sort();
}
export function compareKeys(required, example) {
  const expected = new Set(parseKeys(required));
  const actual = new Set(parseKeys(example));
  return { missing: [...expected].filter(k => !actual.has(k)).sort(), extra: [...actual].filter(k => !expected.has(k)).sort() };
}
export async function main(args, out=console) {
  if (args.length !== 2) { out.error("Usage: node env-sentinel.mjs required.env.example project.env.example"); return 2; }
  try {
    const [a,b] = await Promise.all(args.map(x => readFile(x,"utf8")));
    const report=compareKeys(a,b);
    out.log(JSON.stringify(report,null,2));
    return report.missing.length ? 1 : 0;
  } catch (e) { out.error(e.message); return 2; }
}
if (process.argv[1] && import.meta.url===new URL("file://"+process.argv[1]).href) process.exitCode=await main(process.argv.slice(2));
