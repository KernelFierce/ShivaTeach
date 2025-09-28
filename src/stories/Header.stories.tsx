import type { Story } from '@ladle/react';
import { Header } from './Header';

export const LoggedIn: Story = () => (
  <Header user={{ name: 'Jane Doe' }} onLogin={() => {}} onLogout={() => {}} onCreateAccount={() => {}} />
);

export const LoggedOut: Story = () => (
  <Header onLogin={() => {}} onLogout={() => {}} onCreateAccount={() => {}} />
);
