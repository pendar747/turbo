import pkg from './package.json';
import typescriptPlugin from 'rollup-plugin-typescript2';
import jsonPlugin from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import css from 'rollup-plugin-css-only';
import visualizer from 'rollup-plugin-visualizer';

export default [
  {
    input: 'src/index.ts',
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
        namedExports: {
          'node_modules/lodash/lodash.js': [
            'get',
            'isEqual'
          ],
        }
      }),
      typescriptPlugin(),
      jsonPlugin(),
      css({
        output: 'public/dist/default-theme.css',
        include: 'src/styles/**/*.css'
      }),
      string({
        include: "**/*.css"
      }),
      visualizer({
        filename: 'reports/bundle-analysis.html'
      })
    ],
    output: [
      { format: 'cjs', file: pkg.main },
      { format: 'es', file: pkg.module }
    ]
  }
];
