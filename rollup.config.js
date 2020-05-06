const pkg = require('./package.json');
const typescriptPlugin = require('rollup-plugin-typescript2');
const jsonPlugin = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { string } = require('rollup-plugin-string');
const css = require('rollup-plugin-css-only');
const visualizer = require('rollup-plugin-visualizer');

module.exports = [
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
        output: 'dist/default-theme.css',
        include: 'src/styles/**/*.css'
      }),
      string({
        include: "**/*.css"
      }),
      // visualizer({
      //   filename: 'reports/bundle-analysis.html'
      // })
    ],
    output: [
      { format: 'cjs', file: pkg.main },
      { format: 'es', file: pkg.module }
    ]
  }
];
