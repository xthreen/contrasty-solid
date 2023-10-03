import { join } from 'path'
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';
import { partytownVite } from '@builder.io/partytown/utils'

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
    partytownVite({
      debug: false,
      dest: join(__dirname, 'dist', '~partytown')
    })
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
