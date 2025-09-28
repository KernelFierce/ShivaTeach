
import type { Meta, StoryObj } from '@storybook/react';
import { Home, Users } from 'lucide-react';

import { DashboardSidebar } from './dashboard-sidebar';

const meta: Meta<typeof DashboardSidebar> = {
  component: DashboardSidebar,
  title: 'UI/DashboardSidebar',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardSidebar>;

const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        role: 'Admin',
    },
    {
        label: 'Users',
        href: '/dashboard/users',
        icon: Users,
        role: 'Admin',
    },
];

export const Default: Story = {
  render: (args) => <DashboardSidebar {...args} navItems={navItems} />,
};
