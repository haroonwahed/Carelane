import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CasePrimaryActionPanel } from "./CaseExecutionWorkspaceSections";

describe("CasePrimaryActionPanel", () => {
  it("shows blocked-action guidance as a visible alert", () => {
    render(
      <CasePrimaryActionPanel
        statusLabel="Wacht op besluit"
        actionHolderLabel="Gemeente"
        waitingOnLabel="Aanvulling nodig"
        nextStepLabel="Controleer persoonsbeeld"
        primaryCtaLabel="Volgende"
        onPrimaryAction={vi.fn()}
        primaryDisabled
        disabledReason="Vul het persoonsbeeld in om door te gaan."
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Actie geblokkeerd");
    expect(alert).toHaveTextContent("Vul het persoonsbeeld in om door te gaan.");
  });
});
