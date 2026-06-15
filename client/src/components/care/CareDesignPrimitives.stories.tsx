import type { Meta, StoryObj } from "@storybook/react";
import {
  CareBadge,
  CareFlowBoard,
  CareFlowStepCard,
  CareMatchScore,
  CareSection,
  CareTradeoffList,
  PriorityBadge,
  PrimaryActionButton,
  LoadingState,
  ErrorState,
  BlockingNotice,
} from "./CareDesignPrimitives";

/* ─── CareBadge ─── */

const badgeMeta: Meta<typeof CareBadge> = {
  title: "CareOn/Primitives/CareBadge",
  component: CareBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default badgeMeta;

export const AllTones: StoryObj<typeof CareBadge> = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(["red", "amber", "blue", "purple", "emerald", "cyan", "muted"] as const).map((tone) => (
        <CareBadge key={tone} tone={tone}>{tone}</CareBadge>
      ))}
    </div>
  ),
};

export const CriticalTone: StoryObj<typeof CareBadge> = {
  args: { tone: "red", children: "Geblokkeerd" },
};

export const WarningTone: StoryObj<typeof CareBadge> = {
  args: { tone: "amber", children: "Wachten op reactie" },
};

export const MutedTone: StoryObj<typeof CareBadge> = {
  args: { tone: "muted", children: "Geen blokkade" },
};

/* ─── PriorityBadge ─── */

export const PriorityBadges: StoryObj = {
  name: "PriorityBadge — all tones",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <PriorityBadge tone="spoed" />
      <PriorityBadge tone="hoog" />
      <PriorityBadge tone="normaal" />
    </div>
  ),
};

/* ─── PrimaryActionButton ─── */

export const PrimaryButton: StoryObj<typeof PrimaryActionButton> = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <PrimaryActionButton>Start matching</PrimaryActionButton>
      <PrimaryActionButton disabled>Niet beschikbaar</PrimaryActionButton>
      <PrimaryActionButton className="h-8 px-3 text-[12px]">Compact</PrimaryActionButton>
    </div>
  ),
};

/* ─── CareSection ─── */

export const CareSectionTones: StoryObj<typeof CareSection> = {
  render: () => (
    <div className="max-w-lg space-y-4 p-4">
      {(["default", "elevated", "workspace", "alert"] as const).map((tone) => (
        <CareSection key={tone} tone={tone}>
          <p className="text-[14px] text-foreground">CareSection tone=&quot;{tone}&quot;</p>
        </CareSection>
      ))}
    </div>
  ),
};

/* ─── BlockingNotice ─── */

export const BlockingNoticeStory: StoryObj<typeof BlockingNotice> = {
  name: "BlockingNotice",
  render: () => (
    <div className="max-w-lg space-y-4 p-4">
      <BlockingNotice
        title="Matching is geblokkeerd"
        description="De aanmelding is niet compleet. Vul de ontbrekende gegevens aan om matching te starten."
        actionLabel="Aanmelding aanvullen"
        onAction={() => alert("action")}
      />
    </div>
  ),
};

/* ─── LoadingState / ErrorState ─── */

export const LoadingAndError: StoryObj = {
  render: () => (
    <div className="max-w-lg space-y-4 p-4">
      <LoadingState title="Casussen laden…" />
      <ErrorState
        title="Casussen konden niet worden geladen"
        retry={() => alert("retry")}
      />
    </div>
  ),
};

/* ─── CareTradeoffList ─── */

export const TradeoffList: StoryObj<typeof CareTradeoffList> = {
  name: "CareTradeoffList",
  render: () => (
    <div className="max-w-sm p-4">
      <CareTradeoffList
        heading="Afwegingen"
        items={[
          { label: "Specialisatie past bij zorgvraag", tone: "positive" },
          { label: "Regio dekt het gevraagde gebied", tone: "positive" },
          { label: "Beperkte capaciteit — maximaal 1 plek beschikbaar", tone: "negative" },
          { label: "Reactietijd gemiddeld 5 werkdagen", tone: "negative", detail: "boven SLA" },
          { label: "Geen recente plaatsingshistorie beschikbaar", tone: "neutral" },
        ]}
      />
    </div>
  ),
};

/* ─── CareMatchScore ─── */

export const MatchScore: StoryObj<typeof CareMatchScore> = {
  name: "CareMatchScore",
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <CareMatchScore score={82} advisoryLabel="Sterke aanbeveling" />
      <CareMatchScore score={55} advisoryLabel="Matige aanbeveling" />
      <CareMatchScore score={30} advisoryLabel="Lage geschiktheid" />
    </div>
  ),
};

/* ─── CareFlowBoard ─── */

export const FlowBoard: StoryObj<typeof CareFlowBoard> = {
  name: "CareFlowBoard — 5-fase workflow",
  render: () => (
    <div className="max-w-3xl p-4">
      <CareFlowBoard stepCount={5}>
        {(["Aanmelding", "Matching", "Aanbiederreactie", "Plaatsing", "Intake"] as const).map((phase, i) => (
          <CareFlowStepCard
            key={phase}
            stepId={`phase-${i}`}
            label={phase}
            count={i === 1 ? 3 : i === 0 ? 12 : 0}
            isActive={i === 1}
            isBottleneck={i === 1}
          />
        ))}
      </CareFlowBoard>
    </div>
  ),
};
