import { describe, expect, it } from "vitest";
import { tokens } from "../design/tokens";

/**
 * CareOn Design System V1 — contract test
 *
 * Pins the canonical visual values from CAREON_DESIGN_SYSTEM_V1.md.
 * Updated 2026-06-15: migrated from tokens.visualContract (deprecated) to tokens.visual.
 * Shell geometry corrected: sidebar 256px, topbar 64px, padding 24/32px, 4 radius values.
 */
describe("CareOn Design System V1 — token contract", () => {
  it("shell geometry matches CAREON_DESIGN_SYSTEM_V1.md spec", () => {
    expect(tokens.visual.sidebarWidthExpanded).toBe("256px");
    expect(tokens.visual.sidebarWidthCollapsed).toBe("72px");
    expect(tokens.visual.topbarHeight).toBe("64px");
    expect(tokens.visual.pageHPadding).toBe("24px");
    expect(tokens.visual.pageHPaddingWide).toBe("32px");
    expect(tokens.visual.pageMaxWidth).toBe("1536px");
  });

  it("radius scale has exactly 4 semantic values", () => {
    expect(tokens.visual.radiusLarge).toBe("20px");
    expect(tokens.visual.radiusCard).toBe("16px");
    expect(tokens.visual.radiusControl).toBe("10px");
    expect(tokens.visual.radiusPill).toBe("9999px");
  });

  it("brand and CTA colors are canonical", () => {
    expect(tokens.visual.primaryCta).toBe("#7C4DFF");
    expect(tokens.visual.warningCta).toBe("#F5A900");
    expect(tokens.visual.accent).toBe("#7C4DFF");
  });

  it("layout maximums are stable", () => {
    expect(tokens.layout.pageMaxWidth).toBe("1536px");
  });
});
