// uno.config.ts
import {defineConfig} from 'unocss';

export default defineConfig({
  rules: [
    [/^text-(\w+)$/, ([n, w]) => ({ margin: `var(--${n}: ${w}px` })],
  ]
});
