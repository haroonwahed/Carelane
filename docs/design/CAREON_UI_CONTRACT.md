# CareOn UI Contract

> **⚠️ SUPERSEDED — 2026-06-15**
>
> This document is retired. The values below are **stale** and conflict with the live token system.
>
> **Authoritative source:** [`CAREON_DESIGN_SYSTEM_V1.md`](./CAREON_DESIGN_SYSTEM_V1.md) and `client/src/styles/globals.css` (`--care-*` namespace).
>
> Correct current values:
> - Sidebar width: `256px` (`--care-sidebar-width-expanded`)
> - Topbar height: `64px` (`--care-topbar-height`)
> - Card radius: `20px` (`--care-radius-large`), section card: `16px` (`--care-radius-card`)
> - Background: light `#F4F6FA` / dark `#0B1020` (bidirectional theme — this doc was dark-mode-only)
>
> Do not use any value from the sections below for new work.

---

~~This document is the hard visual contract for CareOn UI surfaces.
If a component, page, or layout conflicts with this file, this file wins.
Implementation must follow the contract; do not treat these values as suggestions.~~

## Scope

- Applies to authenticated CareOn application pages.
- Applies to desktop and responsive behavior unless a page-specific exception is documented here.
- Applies to layout, spacing, radii, color, and surface treatment.
- Applies to new work and refactors alike.

## CareOn Page Layout

- Sidebar width: `280px` desktop
- Topbar height: `72px`
- Main content max width: `none`
- Page horizontal padding: `32px`
- Page top padding: `56px`
- Card radius: `24px`
- Section card radius: `22px`

## Color Contract

- Primary CTA color: `#7C4DFF`
- Warning CTA color: `#F5A900`
- Background: `#070B18`
- Surface 1: `#0E1424`
- Surface 2: `#121A2C`
- Border: `rgba(148,163,184,0.12)`

## Visual Rules

- Use compact operational density by default.
- Keep primary actions visually dominant and clearly separated from secondary actions.
- Keep section cards and work rows aligned to the same grid rhythm.
- Avoid oversized decorative spacing in operational views.
- Keep surfaces dark, layered, and legible against the background contract above.
- Do not introduce new page-level colors if an existing token or contract value already covers the need.

## Enforcement Notes

- New UI work must reuse the contract values through tokens or existing theme constants.
- If a value is missing from tokens, extend the token system rather than hardcoding a one-off value in component code.
- Any exception must be explicitly documented in a page-specific design note.

## Canonical References

- [CareOn Operational Constitution v2](../Careon_Operational_Constitution_v2.md)
- [Foundation Lock](../FOUNDATION_LOCK.md)

