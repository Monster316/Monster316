export function diffSchemas(before,after) {
  const isObj=o=>o && typeof o==="object" && !Array.isArray(o);
  if(!isObj(before)||!isObj(after)) throw new Error("Provide JSON objects");
  const changes=[];
  function walk(a,b,path="") {
    for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])].sort()) {
      const p=path?path+"."+k:k;
      if(!(k in a)) changes.push({kind:"added",path:p});
      else if(!(k in b)) changes.push({kind:"removed",path:p});
      else if(isObj(a[k])&&isObj(b[k])) walk(a[k],b[k],p);
      else if(JSON.stringify(a[k])!==JSON.stringify(b[k])) changes.push({kind:"changed",path:p,from:a[k],to:b[k]});
    }
  }
  walk(before,after);
  return changes;
}
