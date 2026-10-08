import test from "node:test";
import assert from "node:assert/strict";
import {diffSchemas} from "./schema-drift-notes.mjs";
test("reports nested differences",()=>assert.deepEqual(diffSchemas({user:{name:"string",age:"number"}},{user:{name:"text",active:"bool"}}),[{kind:"added",path:"user.active"},{kind:"removed",path:"user.age"},{kind:"changed",path:"user.name",from:"string",to:"text"}]));
test("identical snapshots match",()=>assert.deepEqual(diffSchemas({a:1},{a:1}),[]));
