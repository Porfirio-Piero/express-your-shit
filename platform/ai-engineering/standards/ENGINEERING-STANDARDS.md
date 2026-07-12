# Engineering Standards

## General

- strict typing
- explicit domain models
- one source of truth for business rules
- reusable components
- small coherent modules
- schema validation at boundaries
- versioned migrations
- structured logging
- environment-aware configuration
- no secrets in source control
- no silent catch blocks for important operations

## Repository changes

Before mutation:

1. inspect the repository
2. identify existing architecture
3. identify build and deployment conventions
4. identify applicable local agent instructions
5. identify compatibility constraints
6. write a plan

## Front end

- component primitives before page duplication
- responsive behavior in the first implementation
- semantic HTML
- accessible names
- error boundaries where appropriate
- loading skeletons for material waits
- no uncontrolled proliferation of client components

## Data

- do not use localStorage as a file store
- validate imports
- use migrations
- separate domain, persistence, and presentation logic
- make background jobs idempotent
- record durable delivery state for notifications
- preserve audit history where relevant

## Testing

- unit tests for domain boundaries
- integration tests for persistence and external services
- E2E tests for critical workflows
- visual review for UI
- regression tests for bugs
