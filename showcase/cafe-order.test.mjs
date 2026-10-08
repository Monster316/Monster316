import test from "node:test";
import assert from "node:assert/strict";
import { priceOrder, advanceOrder } from "./cafe-order.mjs";

test("different section pricing", () => {
  const items = [{ name: "Coffee", quantity: 2, pricesPaise: { AC: 12000, NON_AC: 10000 } }];
  assert.equal(priceOrder({ items, section: "AC" }).totalPaise, 24000);
  assert.equal(priceOrder({ items, section: "NON_AC" }).totalPaise, 20000);
});

test("kitchen ticket remains pending until finalization", () => {
  const pending = advanceOrder({ status: "DRAFT" }, "sendToKitchen");
  assert.equal(pending.status, "PENDING");
  assert.equal(advanceOrder(pending, "finalize").status, "PAID");
  assert.throws(() => advanceOrder({ status: "DRAFT" }, "finalize"));
});

test("rejects invalid price", () => {
  assert.throws(() => priceOrder({ section: "AC", items: [{ name: "Tea", quantity: 1, pricesPaise: {} }] }));
});
