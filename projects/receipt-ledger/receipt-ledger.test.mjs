import test from "node:test";
import assert from "node:assert/strict";
import {auditLedger} from "./receipt-ledger.mjs";
test("finds duplicate and gaps",()=>assert.deepEqual(auditLedger([{receipt:"RC001"},{receipt:"RC003"},{receipt:"RC003"}]),{total:3,duplicates:["RC003"],invalid:[],gaps:["RC002"],gapsTruncated:false}));
test("rejects unsafe receipt numbers",()=>assert.deepEqual(auditLedger([{receipt:"RCabc"}]).invalid,["RCabc"]));
