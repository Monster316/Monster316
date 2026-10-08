export function normalizeRoute(method, path) {
  if (!/^(GET|POST|PUT|PATCH|DELETE)$/i.test(method)) throw new Error("Unsupported method");
  if (typeof path!=="string" || !path.startsWith("/") || path.includes("?")) throw new Error("Invalid path");
  const normalized=path.replace(/\/+$/,"") || "/";
  const segments=normalized.split("/").filter(Boolean).map(s=>s.startsWith(":") ? ":" : s);
  return { method:method.toUpperCase(), path:normalized, signature:"/"+segments.join("/") };
}
export function auditRoutes(routes) {
  const seen=new Map(), issues=[];
  for (const route of routes) {
    const r=normalizeRoute(route.method,route.path);
    const key=r.method+" "+r.signature;
    if (seen.has(key)) issues.push({first:seen.get(key),second:r.path,method:r.method,reason:"duplicate-or-ambiguous-pattern"});
    else seen.set(key,r.path);
  }
  return issues;
}
export function main() {
  const input=JSON.parse(process.argv[2] || "[]");
  const issues=auditRoutes(input);
  console.log(JSON.stringify({issues},null,2));
  return issues.length?1:0;
}
if (process.argv[1] && import.meta.url===new URL("file://"+process.argv[1]).href) process.exitCode=main();
