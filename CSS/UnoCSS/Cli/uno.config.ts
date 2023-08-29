// uno.config.ts
import {defineConfig} from 'unocss';

export default defineConfig({
  cli: {
    entry: {
      patterns: ['src/styles.scss src/app/**/*.{scss,html,js,ts}'],
      outFile: 'src/unocss.css'
    }, // CliEntryItem | CliEntryItem[]
  rules: [
    [/^text-(\w+)$/, ([n, w]) => ({ margin: `var(--${n}: ${w}px` })],
  ]
});
