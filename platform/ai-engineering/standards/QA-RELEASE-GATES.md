# QA and Release Gates

A feature is not complete because it compiles.

## Required gates

- typecheck
- lint
- unit tests
- integration tests where applicable
- critical E2E tests
- accessibility review
- responsive screenshots
- console and network error check
- security review for sensitive changes
- performance review for material workflows
- migration and rollback plan
- deployment verification

## UI rejection criteria

Reject when:

- mobile overflows
- long content breaks layout
- empty states are unhelpful
- loading or error states are absent
- native alert/confirm is used
- emoji UI icons are used
- arbitrary spacing or colors remain
- realistic data looks worse than demo data
- destructive actions lack confirmation or undo
- the interface appears template-generated rather than product-designed

## Scoring

Score 1–10:

- product clarity
- UX
- visual design
- accessibility
- engineering quality
- reliability
- performance
- security
- maintainability
- release readiness

No production release with any critical category below 8.
Target 9+ for visual and UX polish.
