/**
 * Demonstration-only savings-scheme arithmetic.
 * Monetary values are in minor units (paise), avoiding floating-point rupee math.
 */
export function calculateSavingsPlan({ monthlyPaise, months = 12, bonusMonths = 1 }) {
  for (const [name, value] of Object.entries({ monthlyPaise, months, bonusMonths })) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError(name + " must be a non-negative safe integer");
    }
  }
  if (monthlyPaise === 0 || months === 0) {
    throw new RangeError("monthlyPaise and months must be positive");
  }
  const contributionPaise = monthlyPaise * months;
  const bonusPaise = monthlyPaise * bonusMonths;
  const maturityPaise = contributionPaise + bonusPaise;
  if (![contributionPaise, bonusPaise, maturityPaise].every(Number.isSafeInteger)) {
    throw new RangeError("calculated amount exceeds safe integer range");
  }
  return { monthlyPaise, months, bonusMonths, contributionPaise, bonusPaise, maturityPaise };
}

export function paymentProgress({ paidInstallments, plan }) {
  if (!Number.isSafeInteger(paidInstallments) || paidInstallments < 0 || paidInstallments > plan.months) {
    throw new RangeError("invalid paidInstallments");
  }
  return {
    paidInstallments,
    remainingInstallments: plan.months - paidInstallments,
    paidPaise: paidInstallments * plan.monthlyPaise,
    benefitAvailable: paidInstallments === plan.months,
  };
}
