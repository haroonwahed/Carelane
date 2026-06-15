# CareOn Design Debt Register

**Versie:** 1.0 — 2026-06-15  
**Bijgewerkt na:** Goedgekeurd auditrapport + 8 correcties

Elke schuld is gekoppeld aan een implementatiefase. Schulden in hogere fasen mogen niet worden opgelost vóór de bijbehorende prerequisite-fasen.

---

## Kritiek

### DD-001 — Drie conflicterende tokenbronnen (F0)
**Bestanden:** `tokens.ts`, `globals.css`, `CAREON_UI_CONTRACT.md`  
**Impact:** Elk nieuw component dat een token leest kan een andere waarde produceren dan bestaande components.  
**Oplossing:** Fase 0 — één `tokens.visual` object, alle CSS tokens in `globals.css`, Tailwind aliassen.

### DD-002 — Shell-geometrie wijkt af van tokencontract (F1)
**Bestanden:** `Sidebar.tsx` (`w-64` = 256px ✓), `TopBar.tsx` (`h-16` = 64px ✓)  
**Impact:** Layout berekeningen gaan uit van tokens, maar components gebruiken hardcoded Tailwind classes.  
**Oplossing:** Fase 1 — alle shell-geometrie via CSS custom properties (correctie 4: 256px/64px).

### DD-003 — Concurrerende dominante CTAs op Regiekamer (F4)
**Bestand:** `SystemAwarenessPage.tsx` (~L1616, ~L1633)  
**Impact:** Twee CTAs die dezelfde workflowhandeling aanbieden. Regiekamer is de canonieke referentie.  
**Oplossing:** Fase 4 — één dominant actie per surface scope; header-CTA verwijderen.

### DD-004 — Badge systeem: vijf parallelle implementaties (F3)
**Bestanden:** `CareDesignPrimitives`, `WorkloadPage`, `MatchingQueuePage`, `IntakeListPage`, `AanbiederPortaalPage`  
**Impact:** Dezelfde status wordt op elke pagina anders gerenderd.  
**Oplossing:** Fase 3 — `CareStatusBadge` als enige status-badge-component.

---

## Hoog

### DD-005 — WorkloadPage: raw Button en gebroken CareWorkRow (F4, F6)
**Bestand:** `WorkloadPage.tsx`  
**Impact:** Meest bezochte pagina door operators. CTA-inconsistentie + row-primitief defect.  
**Oplossing:** Fase 4 (CTA), Fase 6 (CareWorkRow-herstel).

### DD-006 — Hardcoded RGBA shadows in shadcn wrappers (F2)
**Bestanden:** `select.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `sheet.tsx`  
**Impact:** Thema-aanpassingen vereisen handmatig zoeken in vier bestanden.  
**Oplossing:** Fase 2 — `--care-shadow-overlay`, `--care-shadow-dialog`.

### DD-007 — Radius: zeven verschillende waarden (F2)
**Bestanden:** Verspreid door `ui/`, `CareDesignPrimitives`, `LoginPage`  
**Impact:** Visueel onsamenhangend; geen logische hiërarchie.  
**Oplossing:** Fase 2 — vereenvoudigde schaal: large/card/control/pill (correctie 5).

### DD-008 — CareWorkRow gebroken in WorkloadPage na refactor (F6)
**Bestand:** `WorkloadPage.tsx`  
**Impact:** `operationalDesignLawsGuard` vuurt; row-primitief niet gebruikt op primaire queue-pagina.  
**Oplossing:** Fase 6.

---

## Medium

### DD-009 — CarePanel en CareSection zijn structureel gedupliseerd (F5)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 5 — `CareSection tone="elevated"` absorbeert `CarePanel`.

### DD-010 — Dode props in meerdere components (F2)
**Bestanden:** `CareSectionHeader` (description*), `CarePageHeader` (subtitle*), `CareInsightBanner` (compact no-op)  
**Oplossing:** Fase 2.

### DD-011 — Domein-copy hardcoded in generieke UI-primitieven (F2+)
**Bestanden:** `CareAttentionBar` ("Operatieve aandacht"), `CareAttentionSurface` (variant-specifieke labels)  
**Oplossing:** Fase 2 — lift naar props met defaults; domein-copy via content dictionaries.

### DD-012 — CareFlowBoard hardcoded 4-koloms grid (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — dynamisch van `stepCount`.

### DD-013 — CareFlowStepCard hardcoded amber-waarden (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — `ring-amber-500/50` → `--care-badge-amber-bg`.

### DD-014 — CareAlertCard: fout critical icon kleur (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — `text-yellow-100` voor critical → `text-red-100`.

### DD-015 — CareContextHint hardcoded `mt-6` (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — verwijder, caller bepaalt margin.

### DD-016 — CareFilterTabButton: accentHex als inline style (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — CSS custom property injection.

### DD-017 — @ts-ignore in CareOperationalQueueHeader (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — gebruik `React.Fragment` key of correcte typing.

### DD-018 — CareMetricCard tracking inconsistentie (F2)
**Bestand:** `CareDesignPrimitives.tsx`  
**Oplossing:** Fase 2 — `tracking-[0.1em]` → `tracking-[0.12em]`.

---

## Laag (toekomstige batches)

### DD-019 — LoginPage volledig buiten design system (auth-batch)
**Bestand:** `LoginPage.tsx`  
**Impact:** Eerste scherm voor elke gebruiker. Indigo (`#6366f1`) ipv brand-paars (`#7C4DFF`).  
**Oplossing:** Auth-surface migratie na fase 7.

### DD-020 — E-commerce dead code aanwezig (latere batch)
**Bestanden:** `lib/ordersData.ts`, `lib/stockData.ts`, `lib/listingsData.ts`, `components/examples/*`  
**Oplossing:** Na verificatie dat geen live route verwijst.

### DD-021 — GemeentenPage: brede rapporttabel ipv CareWorkRow (latere batch)
**Bestand:** `GemeentenPage.tsx`  
**Oplossing:** Na WorkloadPage-herstel als referentie.

### DD-022 — ZorgaanbiedersPage: hardcoded capaciteitsbadges (latere batch)
**Bestand:** `ZorgaanbiedersPage.tsx`  
**Oplossing:** Na badge-consolidatie (F3).

### DD-023 — RapportagesPage: statische mock data zonder API-verbinding (latere batch)
**Bestand:** `RapportagesPage.tsx`  
**Oplossing:** API-integratie of expliciete "In ontwikkeling" state.

---

## Schulden opgelost per fase

| Fase | Schulden |
|---|---|
| F0 | DD-001 |
| F1 | DD-002 |
| F2 | DD-006, DD-007, DD-010, DD-011, DD-012, DD-013, DD-014, DD-015, DD-016, DD-017, DD-018 |
| F3 | DD-004 |
| F4 | DD-003, DD-005 (CTA) |
| F5 | DD-009 |
| F6 | DD-005 (CareWorkRow), DD-008 |
| F7 | Verificatie van alle bovenstaande |
| Auth-batch | DD-019 |
| Later | DD-020, DD-021, DD-022, DD-023 |
