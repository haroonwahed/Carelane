import { within, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import { expectNoA11yViolations, renderWithA11y } from "../../test/utils/a11y";

function navLabels(): string[] {
  const nav = screen.getByRole("navigation", { name: "Hoofdnavigatie" });
  return within(nav)
    .getAllByRole("button")
    .map((button) => button.textContent?.replace(/\s+/g, " ").trim() ?? "");
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Sidebar demo navigation", () => {
  it("prioritizes the canonical happy flow for gemeente shells", async () => {
    const { container } = renderWithA11y(<Sidebar role="gemeente" onNavigate={vi.fn()} />);

    expect(navLabels()).toEqual([
      "Regiekamer",
      "Aanmeldingen",
      "Matching",
      "Reacties",
      "Plaatsingen",
      "Acties",
      "Zorgaanbieders",
      "Gemeenten",
      "Regio's",
      "Documenten",
      "Audittrail",
      "Instellingen",
    ]);

    await expectNoA11yViolations(container, "Sidebar gemeente");
  });

  it("keeps the same happy-flow prefix for admin shells", async () => {
    const { container } = renderWithA11y(<Sidebar role="admin" onNavigate={vi.fn()} />);

    expect(navLabels()).toEqual([
      "Regiekamer",
      "Aanmeldingen",
      "Matching",
      "Reacties",
      "Plaatsingen",
      "Acties",
      "Zorgaanbieders",
      "Gemeenten",
      "Regio's",
      "Signalen",
      "Rapportages",
      "Documenten",
      "Gebruikers",
      "Audittrail",
      "Instellingen",
    ]);

    await expectNoA11yViolations(container, "Sidebar admin");
  });

  it("keeps intake and reacties ahead of support entry points for zorgaanbieder shells", async () => {
    const { container } = renderWithA11y(<Sidebar role="zorgaanbieder" onNavigate={vi.fn()} />);

    expect(navLabels()).toEqual([
      "Intake",
      "Reacties",
      "Mijn aanvragen",
      "Nieuwe aanvraag",
      "Documenten",
    ]);

    await expectNoA11yViolations(container, "Sidebar zorgaanbieder");
  });
});
