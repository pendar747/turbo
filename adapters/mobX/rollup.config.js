const pkg = require('./package.json');
const typescriptPlugin = require('rollup-plugin-typescript2');
const jsonPlugin = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { string } = require('rollup-plugin-string');
const css = require('rollup-plugin-css-only');
const copy = require('rollup-plugin-copy');
const visualizer = require('rollup-plugin-visualizer');

module.exports = [
  {
    input: 'src/index.ts',
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/
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
      copy({
        targets: [
          {
            src: './package.json',
            dest: './dist'
          }
        ]
      })
      // visualizer({
      //   filename: 'reports/bundle-analysis.html'
      // })
    ],
    output: [
      { format: 'cjs', file: './dist/index.js' },
      { format: 'es', file: './dist/index.module.js' }
    ]
  }
];
