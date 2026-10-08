/**
 * Staff leave decision demonstration; pure functions and no private staff data.
 * Production authorization must be enforced server-side, not just in the UI.
 */
export function submitLeave({ requestId, employeeId, startDate, endDate, reason }) {
  if (![requestId, employeeId, reason].every(v => typeof v === "string" && v.trim())) {
    throw new RangeError("Request ID, employee ID and reason are required");
  }
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  function validDate(date) {
    if (typeof date !== "string" || !iso.test(date)) return false;
    const parsed = new Date(date + "T00:00:00.000Z");
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  }
  if (!validDate(startDate) || !validDate(endDate) || startDate > endDate) {
    throw new RangeError("Invalid leave dates");
  }
  return { requestId, employeeId, startDate, endDate, reason, status: "PENDING", reviewedBy: null };
}

export function reviewLeave(request, { reviewerId, role, decision }) {
  if (!request || request.status !== "PENDING") throw new Error("Request is not pending");
  if (!["MANAGER", "ADMIN"].includes(role) || !reviewerId) throw new Error("Not authorized");
  if (request.employeeId === reviewerId) throw new Error("Self approval is not allowed");
  if (!["APPROVED", "REJECTED"].includes(decision)) throw new RangeError("Invalid decision");
  return { ...request, status: decision, reviewedBy: reviewerId };
}
