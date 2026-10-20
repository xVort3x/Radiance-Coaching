import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base: './'` keeps asset paths relative, so the built site works on
// GitHub Pages project sites (user.github.io/repo/), custom domains, and
// any static host without extra configuration.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  plugins: [react(), tailwindcss()],
});
