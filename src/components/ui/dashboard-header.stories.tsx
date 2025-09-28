
import type { Meta, StoryObj } from '@storybook/react';

import { DashboardHeader } from './dashboard-header';

const meta: Meta<typeof DashboardHeader> = {
  component: DashboardHeader,
  title: 'UI/DashboardHeader',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardHeader>;

export const Default: Story = {
  render: (args) => <DashboardHeader {...args} />,
};
