# Carelane Design System — Migration Plan

Generated: 2026-06-15. Per master brief Phase 9 specification.

Tracks every current page family from current component state to target design-system state.

---

## Legend

| Status | Meaning |
|---|---|
| ✅ Migrated | Using canonical components, tokens, and patterns |
| 🔶 In Progress | Partial migration; some debt remains |
| ❌ Not Started | Still on legacy or ad-hoc components |
| ⛔ Blocked | Dependency on backend change or external decision |

---

## Page Migration Table

| Page | Route | Current Family | Target Family | Design Debt | Functional Debt | Priority | Dependencies | Risk | Status |
|---|---|---|---|---|---|---|---|---|---|
| Regiekamer | `/coordination` | `SystemAwarenessPage` + `CoordinationControlCenter` | `CarePageScaffold` + `CareSection` + `CareBadge` + `CareFilterDrawer` | Inline red/amber Tailwind badges (partially fixed 2026-06-15); no saved views; no CareFilterDrawer | No saved views; no filter persistence | P1 | CareFilterDrawer component | Medium | 🔶 |
| Aanmeldingen | `/casussen` | `WorkloadPage` | `CarePageScaffold` + `CareWorkRow` + `CareFilterDrawer` | `slice(0,1)` pagination bug fixed; `text-amber-300` fixed | No CareFilterDrawer | P2 | CareFilterDrawer | Low | 🔶 |
| Casuswerkruimte | `/cases/:id` | `CaseExecutionPage` + `CasusWorkspaceLayout` | Same + `CareContextRail` (right rail) | Sticky context bar added; duplicate CTA risk; no context rail | CareContextRail missing | P1 | CareContextRail component | Medium | 🔶 |
| Matchingwerkruimte | `/matching/:id` | `MatchingPageWithMap` | Same + `CareTradeoffList` + override dialog | No CareTradeoffList component; no audited override reason | Override audit path missing; no `override_reason` to backend | P1 | Backend accepts `override_reason`; CareTradeoffList | High | 🔶 |
| Aanbiederportaal | `/aanbieder` | `AanbiederPortaalPage` | `CarePageScaffold` + domain components | Unknown — needs audit | Unknown | P3 | — | Low | ❌ |
| Documenten | `/documenten` | `DocumentenPage` | `CarePageScaffold` + `CareDocumentRow` | Unknown — needs audit | — | P3 | — | Low | ❌ |
| Intake | `/intake` | `IntakeListPage` | `CarePageScaffold` + `CareWorkRow` | Unknown | — | P3 | — | Low | ❌ |
| Plaatsing | `/plaatsing` | `PlacementPage` + `PlacementTrackingPage` | `CarePageScaffold` + `CareSection` | Unknown | — | P2 | — | Low | ❌ |
| Aanbiederreactie | `/aanbiederreactie` | `AanbiederreactiePage` | `CarePageScaffold` + `CareSection` | Unknown | — | P2 | — | Low | ❌ |
| Signalen | `/signalen` | `SignalenPage` | `CarePageScaffold` + `CareWorkRow` | Unknown | — | P3 | — | Low | ❌ |
| Acties | `/acties` | `ActiesPage` | `CarePageScaffold` + `CareWorkRow` | Unknown | — | P3 | — | Low | ❌ |
| Zorgaanbieders | `/zorgaanbieders` | `ZorgaanbiedersPage` | `CarePageScaffold` + `CareSection` | Unknown | — | P3 | — | Low | ❌ |
| Regios | `/regios` | `RegiosPage` | `CarePageScaffold` | Unknown | — | P3 | — | Low | ❌ |
| Instellingen | `/instellingen` | `InstellingenPage` | `CarePageScaffold` + settings pattern | Unknown | — | P3 | — | Low | ❌ |
| Login | `/login` | `LoginPage` | No change needed | — | — | — | — | None | — |
| Assessment | `/assessment` | `AssessmentQueuePage` | `CarePageScaffold` + `CareWorkRow` | Unknown | — | P3 | — | Low | ❌ |
| Audittrail | `/audit` | `AudittrailPage` | `CarePageScaffold` + `CareAuditEvent` | Unknown | — | P3 | — | Low | ❌ |

---

## Component Migration Table

| Component | Current State | Target State | Migration Path | Status |
|---|---|---|---|---|
| `UrgencyBadge.tsx` | Standalone file, 3 implementations | Deprecated → routes to `CareBadge` from CareDesignPrimitives | Alias exports; update all import sites | ❌ |
| `RiskBadge.tsx` | Standalone file | Deprecated → routes to `CareBadge` | Alias exports; update all import sites | ❌ |
| `CaseStatusBadge.tsx` | Re-exported as `CareStatusBadge` from CareDesignPrimitives | Already canonical | No action | ✅ |
| `CarePanel` | Alias to `CareSection tone="elevated"` | All 35 usages migrated to `CareSection` | Per-callsite migration | 🔶 |
| `CareSection` | Canonical | Keep | — | ✅ |
| `CareBadge` | In CareDesignPrimitives, uses `--care-badge-*` tokens | Canonical | — | ✅ |
| `PriorityBadge` | In CareDesignPrimitives | Canonical | — | ✅ |
| `CareContextRail` | Does not exist | Create new | Phase B | ❌ |
| `CareFilterDrawer` | Does not exist | Create new | Phase B | ❌ |
| `CareTradeoffList` | Does not exist | Create new in CareDesignPrimitives | Phase B | ❌ |
| `CareWorkQueue` | Does not exist (rows rendered inline) | Create new in CareDesignPrimitives | Phase B | ❌ |
| `CareMatchExplanation` | Does not exist (inline in MatchingPageWithMap) | Extract as component | Phase E | ❌ |

---

## Token Migration Table

| Category | Current State | Target State | Status |
|---|---|---|---|
| Colour — primitives | `--red-base`, `--yellow-base`, etc. in `:root` | Keep as primitives | ✅ |
| Colour — semantics | `--care-badge-{tone}-{bg|text}` | Canonical; enforce in badge consolidation | ✅ |
| Motion | Not defined | `--care-motion-{fast|standard|slow}` added 2026-06-15 | ✅ |
| Z-index | Hardcoded `z-40`, `z-20` | `--care-z-{sticky|topbar|overlay|dialog|toast}` added; TopBar + CasusWorkspaceLayout updated 2026-06-15 | ✅ |
| Shadow | `shadow-md` in PrimaryActionButton | `shadow-[var(--care-shadow-control)]` — fixed 2026-06-15 | ✅ |
| Typography scale | No `--care-text-*` tokens; sizes hardcoded as `text-[12px]` etc. | Defer to Phase B | ❌ |
| Surface states | Not defined | `--care-state-selected-bg`, `--care-state-active-bg` added 2026-06-15 | ✅ |
| Layout widths | Not defined | `--care-context-rail-width`, `--care-queue-width` added 2026-06-15 | ✅ |

---

## Completion Checklist

- [x] Motion tokens added to globals.css and tokens.ts
- [x] Z-index scale added to globals.css and tokens.ts; TopBar.tsx and CasusWorkspaceLayout.tsx updated
- [x] Shadow-md replaced with --care-shadow-control in PrimaryActionButton
- [x] Surface state tokens added
- [x] Layout width tokens added (context rail, queue, panel detail)
- [x] SystemAwarenessPage: priorityBadgeClasses + severityBadgeClasses now use --care-badge-* tokens
- [x] SystemAwarenessPage: inline priority badge spans replaced with PriorityBadge component
- [x] SystemAwarenessPage: slaRiskTotal colour and AlertCircle colour use --care-badge-red-text token
- [x] Governance doc updated with 10 master-brief enforcement rules
- [ ] UrgencyBadge.tsx and RiskBadge.tsx deprecated (Phase B)
- [ ] CarePanel → CareSection migration (Phase B)
- [ ] Typography scale tokens (Phase B)
- [ ] CareContextRail (Phase B)
- [ ] CareFilterDrawer (Phase B)
- [ ] CareTradeoffList (Phase B)
- [ ] Storybook (Phase B)
- [ ] Regiekamer saved views (Phase C)
- [ ] Casuswerkruimte context rail wired (Phase D)
- [ ] Matching audited override (Phase E)
