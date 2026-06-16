# Regiekamer design system

Reference for the Regiekamer (coordination command center) and the pattern to reuse
for other operational "command" pages. Reflects the redesigned page audited June 2026.

Primary file: `client/src/components/care/SystemAwarenessPage.tsx`
Shell/elevation: `client/src/components/examples/MultiTenantDemo.tsx`, `client/src/styles/globals.css`

---

## 1. Page structure (top → bottom)

1. **Page header** — `h1` (`text-[28px] font-bold tracking-tight`) + one-line subtitle
   (`text-[14px] text-muted-foreground`). Right side: "Laatste update …" + refresh icon.
   No hero card, no `CarePageScaffold` for this page.
2. **KPI cards** — `grid-cols-3 gap-3`. Each: big number (`text-[28px] font-bold tabular-nums`)
   over a label. Clickable → drills the list. Colored per severity (see color rules).
3. **Phase tabs** — `Alle casussen | Aanmelding | Matching | Aanbiederreactie | Plaatsing | Intake | Hoog urgent`.
   Active = dark underline (`border-b-2 border-foreground text-foreground`), inactive muted.
   Count badge per tab, `tabular-nums`.
4. **Toolbar** — inline search input + `Filters` toggle (reveals an inline filter row).
5. **Action-list table** — header row + `RegiekamerWorkRow` per case.
6. **Pagination** — result count + page controls.
7. **Detail drawer** — `CasusdetailsPanel`, opens on row selection.

Row interaction: clicking a row **selects** it (opens the drawer). The "Volgende actie"
button and the drawer CTA **navigate** to the case. Selection ≠ navigation.

---

## 2. Elevation ramp (the visibility model)

Dark mode communicates depth by **lightness, not shadow** — lighter = closer to the user.
Three tiers, all from `globals.css` surface tokens:

| Tier | Token (dark) | Used by |
|------|--------------|---------|
| Chrome / frame | `--bg-base` `#0B1020` | app background, sidebar, topbar |
| Content canvas | `--surface-2` `#151B2E` | `#main-content` (set in MultiTenantDemo) |
| Card / table | `--surface-elevated` `#20283D` | worklist container |

Rules: max 3–4 levels; never pure black; prefer solid tokenized surfaces over stacked
translucency; use a hairline border (`border-border/…`) when two surfaces share a level.

---

## 3. Color rules

Two-layer system, by design:

- **Structural color → semantic CSS-var tokens only.** Text, borders, neutral fills use
  `text-foreground`, `text-foreground/80`, `text-muted-foreground`, `border-border`,
  `bg-muted`, `bg-card`, `bg-background`, `bg-foreground`/`text-background` (inverted button),
  `text-primary`/`bg-primary`. These auto-adapt to light/dark — never hardcode `gray-*` with
  a `dark:` override.
- **Categorical/status color → centralized in helper functions, never inline-scattered.**
  All hue choices live in three pure functions so a hue is defined once:
  - `getPhaseStyleInfo(phase)` — phase badge: Aanmelding=blue, Matching=violet,
    Aanbiederreactie=amber, Plaatsing=emerald, Intake=cyan (`bg-{hue}-50 text-{hue}-700`
    + `dark:bg-{hue}-950/50 dark:text-{hue}-400`).
  - `getPriorityDotClass(item)` — priority dot: critical=red-500, high=orange-400,
    medium=yellow-300, low=neutral.
  - `getSlaCountdown(item)` — wachttijd color: ok=emerald, soon=orange, breached=red.

If you need a new status color, add it to the relevant helper — do not inline a new `bg-*`.

---

## 4. Typography scale

Compact, bespoke scale (arbitrary px values), not the global heading scale:

`text-[28px]` KPI numbers · `text-[13px]` primary body/labels · `text-[12px]` secondary ·
`text-[11px]` column headers / sublabels · `text-[10px]` badges.

Weights — three only: `font-semibold`, `font-medium`, `font-bold`.
Numbers & IDs: `tabular-nums`; case references: `font-mono`.

---

## 5. Radius / spacing / shadow

- Radius convention: `rounded-full` = pills/dots/avatars · `rounded-xl` = cards/panels ·
  `rounded-lg` = buttons · `rounded-md` = badges.
- Spacing: standard Tailwind scale (`px-4/5/6`, `py-2.5/3`, `gap-*`).
- Shadow: minimal — `shadow-sm` plus the occasional very-subtle inline `boxShadow`. Depth
  comes from the elevation ramp, not shadows.

---

## 6. Component inventory

- `RegiekamerWorkRow` — one action-list row: priority dot · Casus (phase badge + mono ref +
  title) · Blokkade (icon + readable title/detail) · Eigenaar (avatar + name) · Wachttijd
  (SLA countdown) · Volgende actie (button).
- `CasusdetailsPanel` — right drawer (`w-[380px]`): phase badge header, case identity,
  blokkade alert, metadata grid, detail tabs, phase timeline, action items, CTA footer.

---

## 7. SLA model (frontend ↔ backend lockstep)

The wachttijd countdown mirrors `DECISION_ENGINE_THRESHOLDS` in
`contracts/decision_engine.py` so the UI countdown and the backend breach fire at the same
moment. Targets: Aanmelding 24h, Aanbiederreactie 72h, urgent (any phase) 48h, Plaatsing/Intake 5d.
`getSlaCountdown` picks the strictest applicable target; the list self-sorts breached-first.

---

## 7a. Shared operational toolkit & convergence status

The reusable pieces of this redesign are extracted so other operational pages can adopt them:

- **Elevation ramp** — applied at the shell (`#main-content` → `--surface-2`), so **every**
  page already inherits it. No per-page work.
- **`--care-*` semantic token layer** — status color across all care pages (urgent / warning /
  success / info / brand). The Regiekamer's SLA + priority helpers use it too (`-solid` variants).
- **`lib/careSla.ts`** — `getSlaCountdown(item)` for coordination items, plus
  `slaCountdownFromHours(elapsedHours, targetHours, contextLabel)` for any other data model.
- **`<CareSlaCountdown>`** (`components/care/CareSlaCountdown.tsx`) — drop-in two-line countdown;
  accepts either `item={…}` or `elapsedHours` + `targetHours`.

**What is intentionally NOT converged:** the *structure* of queue pages (CareWorkRow-based
columnar queues) vs. this command center (bespoke action-list). They are different page types —
share the toolkit (tokens, elevation, SLA primitive) where it fits, don't force the action-list
shape onto every queue. Candidate adoptions worth a UX review: AanbiederreactiePage and
PlacementTrackingPage have real wait/deadline data that could use `<CareSlaCountdown>`.

---

## 8. Anti-patterns (do not)

- Don't hardcode `gray-*`/`red-*` etc. with manual `dark:` pairs for structural elements —
  use semantic tokens.
- Don't add `CarePageScaffold` / hero dominant-action cards to command pages.
- Don't rely on shadows for depth in dark mode — use the surface ramp.
- Don't stack multiple translucent surfaces — they compound into mud.
- Don't scatter status hues inline — extend the three helper functions instead.
