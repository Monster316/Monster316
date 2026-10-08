export function auditLedger(entries,{prefix="RC",start=1}={}) {
  if (!Array.isArray(entries) || !Number.isSafeInteger(start) || start<0 || typeof prefix!=="string") throw new Error("Invalid input");
  const numbers=[],invalid=[],seen=new Set(),duplicates=[];
  for (const entry of entries) {
    const id=entry?.receipt;
    if (typeof id!=="string" || !id.startsWith(prefix) || !/^\d+$/.test(id.slice(prefix.length))) {invalid.push(id ?? null);continue;}
    const n=Number(id.slice(prefix.length));
    if (!Number.isSafeInteger(n)||n<start) { invalid.push(id); continue; }
    if (seen.has(n)) duplicates.push(id);
    seen.add(n);numbers.push(n);
  }
  const max=numbers.length?Math.max(...numbers):start-1;
  const gaps=[];
  // Cap output to avoid accidental millions of allocations on corrupted data.
  for(let n=start;n<=max && gaps.length<1000;n++) if(!seen.has(n))gaps.push(prefix+String(n).padStart(3,"0"));
  return {total:entries.length,duplicates,invalid,gaps,gapsTruncated:max-start+1>seen.size+gaps.length};
}
