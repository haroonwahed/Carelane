import type { Meta, StoryObj } from "@storybook/react";
import { ApiErrorMessage } from "./ApiErrorMessage";

const meta: Meta<typeof ApiErrorMessage> = {
  title: "UI/ApiErrorMessage",
  component: ApiErrorMessage,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ApiErrorMessage>;

export const Default: Story = {
  args: {
    message: "Kon casussen niet laden. Controleer je verbinding.",
  },
};

export const WithRetry: Story = {
  args: {
    message: "Kon casussen niet laden. Controleer je verbinding.",
    onRetry: () => alert("Retrying..."),
  },
};

export const Compact: Story = {
  args: {
    message: "Laden mislukt",
    onRetry: () => alert("Retrying..."),
    compact: true,
  },
};
