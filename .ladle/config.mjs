import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default {
  vite: {
    plugins: [react()],
  },
};
