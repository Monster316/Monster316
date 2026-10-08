import test from "node:test";
import assert from "node:assert/strict";
import { calculateSavingsPlan, paymentProgress } from "./savings-plan.mjs";

test("12 months plus one bonus month", () => {
  const plan = calculateSavingsPlan({ monthlyPaise: 100000 });
  assert.equal(plan.contributionPaise, 1200000);
  assert.equal(plan.bonusPaise, 100000);
  assert.equal(plan.maturityPaise, 1300000);
  assert.deepEqual(paymentProgress({ paidInstallments: 12, plan }), {
    paidInstallments: 12, remainingInstallments: 0, paidPaise: 1200000, benefitAvailable: true
  });
});

test("benefit is not available early", () => {
  const plan = calculateSavingsPlan({ monthlyPaise: 200000 });
  assert.equal(paymentProgress({ paidInstallments: 11, plan }).benefitAvailable, false);
});

test("invalid input is rejected", () => {
  assert.throws(() => calculateSavingsPlan({ monthlyPaise: -1 }), RangeError);
  assert.throws(() => calculateSavingsPlan({ monthlyPaise: 1.5 }), RangeError);
});
