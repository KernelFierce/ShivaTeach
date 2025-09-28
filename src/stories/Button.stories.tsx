import type { Story } from '@ladle/react';
import { Button } from './Button';

export const Primary: Story = () => (
  <Button primary={true} label='Button' />
);

export const Secondary: Story = () => (
  <Button label='Button' />
);

export const Large: Story = () => (
  <Button size='large' label='Button' />
);

export const Small: Story = () => (
  <Button size='small' label='Button' />
);
