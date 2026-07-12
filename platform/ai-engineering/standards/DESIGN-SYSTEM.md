# Modern Product Design Standard

## Personality

Professional, calm, precise, contemporary, trustworthy, and intentional.

## Foundations

- 8-point spacing system
- semantic design tokens
- consistent typography scale
- clear hierarchy
- restrained color
- professional iconography
- responsive by default
- accessible interactions
- no arbitrary one-off styles

## Required tools and patterns

Preferred:
- Tailwind design tokens
- Radix or shadcn/ui primitives
- Lucide icons
- React Hook Form
- Zod
- Sonner
- TanStack Table
- date-fns

Equivalent libraries are acceptable when already established in a project.

## Prohibited defaults

- emoji as product UI icons
- giant gradients without product purpose
- excessive glassmorphism
- every section rendered as an equal white card
- hard-coded colors repeated through components
- desktop-only fixed navigation
- native browser confirm or alert for product workflows
- icon-only buttons without accessible names
- decorative charts that do not aid a decision
- placeholder dashboards full of fake metrics
- random animation
- inconsistent radii and shadows

## Layout

Desktop:
- max content width: 1440px
- page padding: 24–32px
- navigation: 216–240px or compact rail
- 12-column conceptual grid

Tablet:
- compact rail or drawer
- 20–24px page padding

Mobile:
- 16px page padding
- single-column forms
- 44px minimum touch targets
- top bar, drawer, or bottom navigation
- tables become cards or intentionally scroll
- primary action remains reachable

## Visual hierarchy

Each page should normally have:

1. clear page title
2. one primary action
3. one dominant information region
4. supporting regions
5. secondary details

Avoid four equal KPI cards unless each drives a distinct action.

## States

Every reusable component must define:

- default
- hover
- focus
- active
- disabled
- loading
- error
- empty when applicable

## Review requirement

No UI task is complete until screenshots are reviewed at:

- 390×844
- 768×1024
- 1440×1000
