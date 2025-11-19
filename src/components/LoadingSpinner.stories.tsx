import type { Meta, StoryObj } from "@storybook/react";
import LoadingSpinner from "./common/LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithText: Story = {
  render: () => (
    <div>
      <LoadingSpinner />
      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Loading your data...
      </p>
    </div>
  ),
};

export const DarkBackground: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
};
