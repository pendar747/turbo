import path from 'path';
import webpack from 'webpack';
import { DEFAULT_STATE_ENTRY } from '../constants';

const config: webpack.Configuration = {
  entry: DEFAULT_STATE_ENTRY,
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: '/dist',
    publicPath: '/scripts/'
  }
};

export default config;