import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serviceWorkerPlugin } from './build/serviceWorkerPlugin.ts';

export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  build: {
    rolldownOptions: {
      output: {
        // Vendor code changes far less often than app code, so it gets its own long-cached chunk.
        codeSplitting: {
          groups: [{ name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
});
