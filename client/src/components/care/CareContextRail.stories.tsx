import type { Meta, StoryObj } from "@storybook/react";
import { CareContextRail } from "./CareContextRail";

const meta: Meta<typeof CareContextRail> = {
  title: "Carelane/Domain/CareContextRail",
  component: CareContextRail,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof CareContextRail>;

export const WithBlocker: Story = {
  args: {
    blocker: "Aanmelding onvolledig — matching kan niet starten",
    owner: "Gemeente Rotterdam",
    requiredDecision: "Casusgegevens aanvullen",
    deadline: "20 jun 2026",
    recentAuditEvent: {
      label: "Casus aangemaakt",
      source: "Aanmelder",
      timestamp: "3 jun 2026, 14:20",
    },
  },
};

export const WithProvider: Story = {
  args: {
    owner: "Gemeente Amsterdam",
    linkedProvider: "Zorgorganisatie De Hoop",
    linkedProviderHref: "#",
    contact: "J. de Vries — 06-12345678",
    recentAuditEvent: {
      label: "Aanbieder geselecteerd",
      source: "Coördinator",
      timestamp: "12 jun 2026, 09:45",
    },
  },
};

export const Empty: Story = {
  args: {},
};

export const BlockedWithDecision: Story = {
  name: "Blocked — requires decision",
  args: {
    blocker: "Wacht op gemeentelijke goedkeuring — plaatsing is uitgesteld",
    requiredDecision: "Plaatsing bevestigen of afwijzen",
    owner: "Gemeente Utrecht",
    deadline: "18 jun 2026",
  },
};
