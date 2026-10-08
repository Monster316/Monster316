import test from "node:test";
import assert from "node:assert/strict";
import { submitLeave, reviewLeave } from "./staff-leave.mjs";

test("manager may approve valid leave", () => {
  const request = submitLeave({ requestId: "DEMO-1", employeeId: "EMP-1", startDate: "2026-10-10", endDate: "2026-10-11", reason: "Personal" });
  assert.equal(reviewLeave(request, { reviewerId: "MGR-1", role: "MANAGER", decision: "APPROVED" }).status, "APPROVED");
});

test("staff cannot approve and manager cannot approve own request", () => {
  const request = submitLeave({ requestId: "DEMO-2", employeeId: "EMP-1", startDate: "2026-10-10", endDate: "2026-10-11", reason: "Personal" });
  assert.throws(() => reviewLeave(request, { reviewerId: "EMP-2", role: "STAFF", decision: "APPROVED" }));
  assert.throws(() => reviewLeave(request, { reviewerId: "EMP-1", role: "MANAGER", decision: "APPROVED" }));
});

test("rejects impossible dates and repeated review", () => {
  assert.throws(() => submitLeave({ requestId: "X", employeeId: "E", startDate: "2026-02-30", endDate: "2026-03-01", reason: "Leave" }));
  assert.throws(() => reviewLeave({ status: "APPROVED" }, { reviewerId: "M", role: "MANAGER", decision: "REJECTED" }));
});
