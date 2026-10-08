import test from "node:test";
import assert from "node:assert/strict";
import {auditRoutes,normalizeRoute} from "./route-contract.mjs";
test("detects duplicate dynamic route",()=>assert.equal(auditRoutes([{method:"GET",path:"/users/:id"},{method:"get",path:"/users/:name"}]).length,1));
test("separates HTTP verbs",()=>assert.deepEqual(auditRoutes([{method:"GET",path:"/users"},{method:"POST",path:"/users"}]),[]));
test("normalizes trailing slash",()=>assert.equal(normalizeRoute("GET","/a/").path,"/a"));
