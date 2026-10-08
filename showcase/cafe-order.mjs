/**
 * Standalone café order demonstration.
 * Prices and tax rates are integers; tax is rounded to nearest paise.
 * A real POS requires persistent storage, payment reconciliation and authorized edits.
 */
const validSection = new Set(["AC", "NON_AC"]);
export function priceOrder({ items, section, taxBasisPoints = 0 }) {
  if (!validSection.has(section)) throw new RangeError("Invalid seating section");
  if (!Array.isArray(items) || items.length === 0) throw new RangeError("Order needs items");
  if (!Number.isSafeInteger(taxBasisPoints) || taxBasisPoints < 0 || taxBasisPoints > 10000) {
    throw new RangeError("Invalid tax rate");
  }
  const lines = items.map(({ name, quantity, pricesPaise }) => {
    if (typeof name !== "string" || !name.trim()) throw new RangeError("Item name required");
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new RangeError("Invalid quantity");
    const unitPaise = pricesPaise?.[section];
    if (!Number.isSafeInteger(unitPaise) || unitPaise < 0) throw new RangeError("Invalid price");
    const subtotalPaise = unitPaise * quantity;
    if (!Number.isSafeInteger(subtotalPaise)) throw new RangeError("Amount overflow");
    return { name, quantity, unitPaise, subtotalPaise };
  });
  const subtotalPaise = lines.reduce((sum, line) => sum + line.subtotalPaise, 0);
  const taxPaise = Math.round((subtotalPaise * taxBasisPoints) / 10000);
  const totalPaise = subtotalPaise + taxPaise;
  if (![subtotalPaise, taxPaise, totalPaise].every(Number.isSafeInteger)) {
    throw new RangeError("Amount overflow");
  }
  return { section, lines, subtotalPaise, taxPaise, totalPaise };
}

export function advanceOrder(order, action) {
  const transitions = { DRAFT: { sendToKitchen: "PENDING" }, PENDING: { finalize: "PAID" } };
  const next = transitions[order.status]?.[action];
  if (!next) throw new Error("Invalid order transition");
  return { ...order, status: next };
}
