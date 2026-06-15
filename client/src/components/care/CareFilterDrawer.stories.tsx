import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CareFilterDrawer, CareFilterDrawerTrigger, type CareFilterValues } from "./CareFilterDrawer";

const meta: Meta<typeof CareFilterDrawer> = {
  title: "CareOn/Domain/CareFilterDrawer",
  component: CareFilterDrawer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

const FILTER_GROUPS = [
  {
    id: "urgency",
    label: "Urgentie",
    type: "multi" as const,
    options: [
      { value: "spoed", label: "Spoed", tone: "critical" as const, count: 3 },
      { value: "hoog", label: "Hoog", tone: "warning" as const, count: 8 },
      { value: "normaal", label: "Normaal", count: 21 },
    ],
  },
  {
    id: "phase",
    label: "Fase",
    type: "multi" as const,
    options: [
      { value: "aanmelding", label: "Aanmelding", count: 14 },
      { value: "matching", label: "Matching", count: 7 },
      { value: "aanbiederreactie", label: "Aanbiederreactie", count: 4 },
      { value: "plaatsing", label: "Plaatsing", count: 5 },
      { value: "intake", label: "Intake", count: 2 },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "single" as const,
    options: [
      { value: "blocked", label: "Geblokkeerd", tone: "critical" as const, count: 5 },
      { value: "active", label: "Actief" },
      { value: "waiting", label: "Wachtend" },
    ],
  },
];

const SAVED_VIEWS = [
  { id: "mine", label: "Mijn casussen", filters: { owner: "me" }, isDefault: true },
  { id: "urgent", label: "Urgent", filters: { urgency: ["spoed", "hoog"] } },
  { id: "blocked", label: "Geblokkeerd", filters: { status: "blocked" } },
];

export const Interactive: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<CareFilterValues>({});
    const activeCount = Object.values(values).filter((v) => Array.isArray(v) ? v.length > 0 : Boolean(v)).length;

    return (
      <div className="p-4">
        <CareFilterDrawerTrigger onClick={() => setOpen(true)} activeCount={activeCount} />
        <CareFilterDrawer
          open={open}
          onOpenChange={setOpen}
          filterGroups={FILTER_GROUPS}
          values={values}
          onApply={setValues}
          onReset={() => setValues({})}
          savedViews={SAVED_VIEWS}
        />
        <pre className="mt-4 rounded bg-muted p-3 text-xs">{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  },
};

export const WithActiveFilters: StoryObj = {
  render: () => {
    const initial: CareFilterValues = { urgency: ["spoed", "hoog"], status: "blocked" };
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<CareFilterValues>(initial);
    const activeCount = Object.values(values).filter((v) => Array.isArray(v) ? v.length > 0 : Boolean(v)).length;

    return (
      <div className="p-4">
        <CareFilterDrawerTrigger onClick={() => setOpen(true)} activeCount={activeCount} />
        <CareFilterDrawer
          open={open}
          onOpenChange={setOpen}
          filterGroups={FILTER_GROUPS}
          values={values}
          onApply={setValues}
          onReset={() => setValues({})}
          savedViews={SAVED_VIEWS}
        />
      </div>
    );
  },
};
