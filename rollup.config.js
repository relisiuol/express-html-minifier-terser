import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const bundlePlugins = [
  commonjs(),
  nodePolyfills(),
  nodeResolve({
    preferBuiltins: false
  }),
  json()
];

const config = defineConfig([
  {
    input: 'minifier.js',
    output: [{
      file: 'dist/htmlminifier.umd.bundle.js',
      format: 'umd',
      exports: 'named',
      name: 'HTMLMinifier'
    }],
    plugins: bundlePlugins
  },
  {
    input: 'minifier.js',
    output: [{
      file: 'dist/htmlminifier.umd.bundle.min.js',
      format: 'umd',
      exports: 'named',
      name: 'HTMLMinifier'
    }],
    plugins: [
      ...bundlePlugins,
      terser()
    ]
  },
  {
    input: 'minifier.js',
    output: {
      file: 'dist/minifier.esm.bundle.js',
      format: 'es'
    },
    plugins: bundlePlugins
  },
  {
    input: 'minifier.js',
    output: {
      file: 'dist/minifier.cjs',
      format: 'cjs',
      exports: 'named'
    },
    external: ['terser']
  }
]);

export default config;
