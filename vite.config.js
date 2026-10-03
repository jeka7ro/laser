import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3300,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        widget: resolve(__dirname, 'widget.html'),
        embed: resolve(__dirname, 'embed-preview.html'),
        confirm: resolve(__dirname, 'confirm.html'),
        order: resolve(__dirname, 'order.html')
      }
    }
  }
});
