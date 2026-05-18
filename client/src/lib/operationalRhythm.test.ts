import { describe, expect, it } from "vitest";
import { CARE_RHYTHM } from "./operationalRhythm";
import { tokens } from "../design/tokens";

describe("operationalRhythm", () => {
  it("exposes stable class hooks aligned with CSS variables", () => {
    expect(CARE_RHYTHM.pageStack).toBe("care-page-rhythm");
    expect(CARE_RHYTHM.queueShell).toBe("care-queue-shell");
    expect(CARE_RHYTHM.quietGap).toBe("care-quiet-gap");
  });

  it("mirrors rhythm values in design tokens", () => {
    expect(tokens.spacing.rhythm.page).toBe("24px");
    expect(tokens.spacing.rhythm.section).toBe("20px");
    expect(tokens.spacing.rhythm.queueLead).toBe("10px");
  });
});
