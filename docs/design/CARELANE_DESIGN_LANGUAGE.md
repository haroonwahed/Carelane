# Carelane Design Language — v1 (Calm Operational)

> The single source of truth for how Carelane looks and feels. Derived from the
> Regiekamer / Matching / Casuswerkruimte north-star mockups. Everything visual
> in the product must trace back to a rule here. When code and this document
> disagree, this document wins — fix the code.

Status: **binding**. Supersedes the dark-first values in
`CARELANE_UI_CONTRACT.md` (now retired).

---

## 1. The one idea

**Calm operational.** Carelane is used all day by coordinators making high-stakes
decisions about vulnerable people under SLA pressure. Premium here means
**craft, confidence, warmth and trust** — never decoration. The job of the UI is
to answer *"what needs me now, and what do I do about it?"* in under one second,
then get out of the way.

Five rules that follow from this:

1. **Type and space do the work.** No gradients, glows, neon, or heavy shadows.
   Hierarchy comes from the type scale and rhythm, not effects.
2. **One accent.** A single brand purple carries identity *and* the one dominant
   action per surface. Everything else is neutral.
3. **Colour is signal, not paint.** A colour only appears when it *means*
   something (urgency, risk, success). Decorative colour is a bug.
4. **Light and dark are peers.** Both themes are authored from one set of token
   roles. There is no "dark-first then patch light" layer.
5. **The quiet moments count.** Loading, empty and error states are designed to
   the same standard as the populated screen.

---

## 2. Brand & accent

- **Accent (canonical):** `--primary` = `#7C4DFF` (Zorg OS purple). One accent,
  used for identity, the single primary action, focus surfaces, and selection.
  *(The north-star mockups used a placeholder `#5B4FE0`; the canonical value
  stays `#7C4DFF` until a brand designer signs off a final hue.)*
- **Never** use the accent for decoration, large fills, or more than one primary
  action on a surface.
- Logomark sits top-left of the shell; brand purple square, white glyph.

---

## 3. Typography scale (closed)

Two weights only: **400 (regular)** and **500 (medium)**. No 600/700 — they read
heavy against operational density. Font: Inter. Sentence case everywhere
(Dutch, B1 level). **No arbitrary `text-[Npx]` in product code** — use a class.

| Role             | Class                      | Size            | Weight | Line-height | Use                                   |
|------------------|----------------------------|-----------------|--------|-------------|---------------------------------------|
| Display          | `.care-text-display`       | 1.625rem / 26px | 500    | 1.25        | KPI numbers, the one big page number  |
| Title            | `.care-text-title`         | 1.3125rem / 21px| 500    | 1.25        | Page / workspace title                |
| Heading          | `.care-text-heading`       | 1.0625rem / 17px| 500    | 1.35        | Card titles, focus-card title         |
| Subheading       | `.care-text-subheading`    | 0.9375rem / 15px| 500    | 1.4         | Row titles, section labels            |
| Body             | `.care-text-body`          | 0.9375rem / 15px| 400    | 1.6         | Default paragraph text                |
| Body compact     | `.care-text-body-compact`  | 0.8125rem / 13px| 400    | 1.5         | Row subtitles, meta lines             |
| Meta             | `.care-text-meta`          | 0.75rem / 12px  | 400    | 1.4         | Stat labels, faint hints              |
| Eyebrow          | `.care-text-eyebrow`       | 0.6875rem / 11px| 500    | 1.3         | UPPERCASE 0.05em — "Jouw focus nu"    |

Tokens live as `--care-text-*-size` / `-weight` / `-leading` in `globals.css`
and mirror in `tokens.ts → typography`. The legacy `@layer base` `h1`–`p` rules
remain as a fallback only; migrate headings to these classes.

---

## 4. Colour semantics (meaning, not chroma)

Components reference **meaning**, never a raw colour. Each intent maps onto an
existing per-mode primitive, so it peers light/dark automatically.

| Intent    | Token family               | Maps to | Means                                    |
|-----------|----------------------------|---------|------------------------------------------|
| `urgent`  | `--care-semantic-urgent-*` | red     | SLA breaching / spoed — act now          |
| `warning` | `--care-semantic-warning-*`| amber   | at risk / attention soon                 |
| `info`    | `--care-semantic-info-*`   | blue    | informational, neutral signal            |
| `success` | `--care-semantic-success-*`| green   | done / on-track                          |
| `neutral` | `--care-semantic-neutral-*`| muted   | default, no signal                       |
| `brand`   | `--care-semantic-brand-*`  | purple  | the focus / primary action               |

Each family has `-bg`, `-text`, `-border`, `-solid`. **Rule:** "red" is never
written in product code — write `urgent`. This kills the old "red = error or
blocked or urgent?" ambiguity.

Colour is **never the only signal**: pair every semantic colour with an icon or
label (WCAG 1.4.1).

---

## 5. Surfaces & elevation (one system)

One card primitive: **`CareSection`** with a `tone`. Retire the parallel
`.surface-*`, `.premium-card`, `.kpi-card` CSS classes — fold them into tones.

| Tone        | Background        | Border        | Use                          |
|-------------|-------------------|---------------|------------------------------|
| `default`   | `--surface-1`     | hairline      | standard card                |
| `muted`     | `--surface-2`     | hairline      | secondary / metric tiles     |
| `context`   | `--surface-2`     | hairline      | context-rail cards           |
| `focus`     | `--care-focus-bg` | accent-tinted | the "Volgende stap" hero     |

- Borders: hairline by default (`--border-default`), `--border-strong` for
  emphasis. Featured/recommended items get a **2px accent border** — the only
  exception to hairline.
- Radius: `--care-radius-card` (16px) for cards, `--care-radius-control` (10px)
  for controls, `--care-radius-pill` for badges/avatars.

---

## 6. Signature patterns

These three are the soul of the product — reuse them everywhere, identically.

### a. "Volgende stap" / "Jouw focus nu" — the focus card
The single most important action on any surface gets a `tone="focus"` card:
eyebrow + heading + one-line why + **one** primary button (+ optional ghost
secondary). Appears on Regiekamer (hero), and at the top of every case
workspace. This is the core user-friendliness lever.

### b. SLA countdown
Time-remaining is the hero metric. Monospace, coloured by threshold:

| Remaining        | Intent    |
|------------------|-----------|
| `< 4h`           | `urgent`  |
| `4h – 12h`       | `warning` |
| `> 12h`          | `neutral` |

Thresholds live in `tokens.ts → sla.thresholdHours`. Render as a chip in lists,
as a ring (SVG progress) in focus/hero contexts.

### c. Worklist row
Scan order, left → right: **SLA → tag (eyebrow) → title (subheading) →
subtitle (body-compact) → owner avatar → chevron**. Owner-less rows show a
`warning` "Niet toegewezen" pill, never a blank. Primary row action appears on
hover/focus only; whole row is the click target (`role="button"`, focusable).

---

## 7. States (designed, not default)

- **Loading:** skeleton that **mirrors the real row layout** (same column widths)
  so nothing reflows on load. Gentle opacity pulse, no spinners in lists.
- **Empty:** reassurance, not a dead end — "Alles is bijgewerkt", success icon,
  one optional secondary action. Never an error tone.
- **Error:** human + recoverable — name what happened in plain Dutch, reassure
  data is safe, offer one retry. `role="alert"`.

---

## 8. Motion

- Tiers: `--care-motion-fast` (120ms) hovers, `--care-motion-standard` (200ms)
  transitions, `--care-motion-slow` (350ms) entrances.
- **Never scale/translate as decoration.** Subtle opacity/background only.
- Everything must respect `prefers-reduced-motion`.

---

## 9. Accessibility (table stakes for the NL market)

Target **WCAG 2.2 AA** — legally expected for Dutch (semi-)public software, and
a procurement checkbox for gemeenten.

- Visible focus ring on every interactive element (`--ring`).
- Colour never the sole carrier of meaning (§4).
- Contrast: AA (4.5:1 text / 3:1 large) verified on **both** themes.
  *(Open item: audit light-mode badge tones, e.g. amber text on amber bg.)*
- Hit targets ≥ 36px. Keyboard-operable lists and tabs.
- Trust cues surfaced in-product: AVG, WCAG 2.2 AA, ISO 27001.

---

## 10. What we are deliberately NOT doing

- No gradients, glows, or glassmorphism (undermines trust in care work).
- No second accent colour.
- No Title Case, no ALL CAPS (except the eyebrow class), no emoji.
- No `text-[Npx]` / one-off card classes / raw colour hex in components.

---

## 11. Migration order (the work this unlocks)

1. ✅ Add typography + semantic + focus/SLA tokens (this change — additive).
2. Sweep `text-[Npx]` → `.care-text-*` across `components/care/`.
3. Replace raw `badge-red/amber/...` usage with `--care-semantic-*` intents.
4. Fold `.surface-*` / `.premium-card` / `.kpi-card` into `CareSection` tones;
   delete the orphan classes.
5. Retire the light-mode "remap" block once components are semantic.
6. Run the WCAG AA contrast audit on both themes; fix failing tones.
7. Delete `CARELANE_UI_CONTRACT.md` and `legacyVisualContract` once callsites move.
