# Open Code Showcase

Small, standalone **demonstration modules** inspired by business workflows in the [case-study portfolio](../case-studies/README.md).

These are **new educational samples**, not extracts from any production software, and are not intended as deployable applications. They contain no private APIs, passwords, company data, or proprietary customer records.

| Sample | What it demonstrates | Source |
| --- | --- | --- |
| Savings plan calculator | Installments, total contributions and configurable maturity bonus | [savings-plan.mjs](./savings-plan.mjs) |
| Café order engine | Section-based pricing, tax calculation and pending/finalized order states | [cafe-order.mjs](./cafe-order.mjs) |
| Staff leave workflow | Leave submission, approval decisions and permission checks | [staff-leave.mjs](./staff-leave.mjs) |

## Run locally

Requires **Node.js 20+**. No packages or API keys are required.

```bash
node --test showcase/*.test.mjs
```

Run from the repository root.

## Limitations

These examples use in-memory data only. They do not implement authentication, databases, device synchronization, receipt generation, payment processing or secure multi-tenant deployment. Production use requires authorization controls, persistent storage, input validation, audit logging, concurrency handling and end-to-end tests.

**Developer portfolio:** [@Monster316](https://github.com/Monster316) · [Design Dropper](https://designdropper.com)
