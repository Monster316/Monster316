# Developer Tool Lab

A collection of experimental, dependency-free JavaScript utilities designed to help other developers with everyday repository and application maintenance.

| Project | Developer problem | Source |
| --- | --- | --- |
| [ProofDeck](./proofdeck/README.md) | Check whether documented claims have supporting files and text evidence | [Code](./proofdeck/proofdeck.mjs) |
| [EnvSentinel](./env-sentinel/README.md) | Identify configuration variable names missing from example environments | [Code](./env-sentinel/env-sentinel.mjs) |
| [RouteContract](./route-contract/README.md) | Detect duplicate or ambiguous declared HTTP routes | [Code](./route-contract/route-contract.mjs) |
| [ReceiptLedger](./receipt-ledger/README.md) | Spot gaps and duplicate receipt identifiers | [Code](./receipt-ledger/receipt-ledger.mjs) |
| [SchemaDrift Notes](./schema-drift-notes/README.md) | Compare JSON schema snapshots | [Code](./schema-drift-notes/schema-drift-notes.mjs) |

These prototypes are **not guaranteed globally unique**, and the source code should be reviewed and tested before production adoption. No operational customer data or private application source is published.

## Run tests

From the root of this repository:

```bash
node --test projects/*/*.test.mjs
```

**Maintainer:** [@Monster316](https://github.com/Monster316) · [Design Dropper](https://designdropper.com)
