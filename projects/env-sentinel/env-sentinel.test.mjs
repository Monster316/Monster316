import test from "node:test";
import assert from "node:assert/strict";
import {parseKeys,compareKeys} from "./env-sentinel.mjs";
test("parses names, not secret values",()=>assert.deepEqual(parseKeys("# note\nAPI_KEY=secret\nexport PORT=3000"),["API_KEY","PORT"]));
test("reports missing and extra config names",()=>assert.deepEqual(compareKeys("API_KEY=x\nPORT=1","PORT=2\nDEBUG=y"),{missing:["API_KEY"],extra:["DEBUG"]}));
