# CareOn Operational Guidance Layer v1

Status: **reference layer** for the current UI guidance patterns, not a separate roadmap or help center.

Operationele begeleiding in de flow; geen los helpcentrum. Alle copy is Nederlands, rustig en concreet.

## Componenten

| Component | Doel |
|-----------|------|
| `InlineHelpChip` | Subtiele helper naast labels; popover met 2�4 regels |
| `MicroInstructionBlock` | Korte instructie onder complexe secties (titel + max. 2 regels + optionele impact) |
| `VideoHelpTrigger` | Modal met videoplaceholder, titel, samenvatting/script; geen externe navigatie |
| `GuidanceContextBanner` | Rustige contextbanner voor vertrouwen en procesuitleg |
| `ProgressiveGuidance` | Combineert chip + optionele video-trigger; voorbereid op `guidanceMode` |

Locatie: `client/src/components/guidance/`

## guidanceMode

```ts
type GuidanceMode = "expanded" | "compact";
// default: "expanded"
```

- **expanded**: tekst-trigger (`InlineHelpChip`) + optioneel `VideoHelpTrigger`
- **compact**: alleen icoon; popover bevat chip-inhoud en eventueel video-trigger

Toekomst: koppelen aan gebruikersinstelling in Instellingen.

## Copyregels

- Geen AI-buzzwords, geen fake CTA�s
- Operationeel en concreet
- Geen vervanging van primaire workflow-CTA�s
- Maximaal ��n dominante next-best-action per scherm blijft leidend

## Waar gebruikt (v1)

| Scherm | Guidance |
|--------|----------|
| Nieuwe casus | Minimaal nodig, urgentie, arrangement (zorgvorm), gemeente, betrokken partijen |
| Matching (wachtrij + workspace) | Adviserend karakter, score, geen aanbieders, wachtlijst, video matching |
| Casus / gemeentevalidatie | Intro validatie, afwijzing, doorstroombudget, video |
| Aanbiederbeoordeling | Zichtbaarheid casus, beoordeling, afwijzen |
| Plaatsing | Voorlopig/definitief, overgang intake |
| Werkvoorraad / Regiekamer | Prioriteit, blokkades, wachten |

## Video's (toekomst)

`VideoHelpTrigger` toont nu een placeholder ("Video volgt") en een tekstsamenvatting. Vervang later het placeholder-paneel door embedded video-URL's per onderwerp, zonder de workflow te verlaten.

## Hergebruik

Import via:

```ts
import { InlineHelpChip, GuidanceContextBanner } from "../guidance";
```

Styling volgt bestaande CareOn tokens (`border-border/60`, `bg-muted/10`, `text-muted-foreground`).
