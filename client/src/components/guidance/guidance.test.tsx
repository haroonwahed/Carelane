import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InlineHelpChip } from "./InlineHelpChip";
import { VideoHelpTrigger } from "./VideoHelpTrigger";
import { GuidanceContextBanner } from "./GuidanceContextBanner";

describe("Operational guidance components", () => {
  it("opens and closes InlineHelpChip popover", async () => {
    const user = userEvent.setup();
    render(
      <InlineHelpChip title="Titel" testId="help-chip" triggerLabel="Uitleg">
        <p>Body</p>
      </InlineHelpChip>,
    );

    expect(screen.queryByText("Body")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Uitleg" }));
    expect(screen.getByText("Titel")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("opens and closes VideoHelpTrigger dialog with escape", async () => {
    const user = userEvent.setup();
    render(
      <VideoHelpTrigger
        title="Video titel"
        script="Korte samenvatting."
        testId="video-help"
        triggerLabel="Bekijk uitleg"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Bekijk uitleg" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Video volgt")).toBeInTheDocument();
    expect(screen.getByText("Korte samenvatting.")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders GuidanceContextBanner as status", () => {
    render(<GuidanceContextBanner testId="banner">Contexttekst</GuidanceContextBanner>);
    expect(screen.getByRole("status")).toHaveTextContent("Contexttekst");
  });
});
