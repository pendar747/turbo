import { createFsFromVolume, Volume } from 'memfs';
import webpack from 'webpack';
import defaultConfig from './webpack.default';
import joinPath from 'memory-fs/lib/join';
import path from 'path';
import { Assets } from './types';

const fs = createFsFromVolume(new Volume());
const compiler = webpack(defaultConfig);

function ensureWebpackMemoryFs (fs: any) {
  // Return it back, when it has Webpack 'join' method
  if (fs.join) {
    return fs
  }

  // Create FS proxy, adding `join` method to memfs, but not modifying original object
  const nextFs = Object.create(fs)
  nextFs.join = joinPath

  return nextFs
}


compiler.outputFileSystem = ensureWebpackMemoryFs(fs);

const getAssets = (stats: webpack.Stats): Assets => {
  const assetPaths = Object.values(stats.compilation.assets).map((asset: any) => asset.existsAt)
  const assetContents: string = assetPaths
    .map(assetPath => fs.readFileSync(assetPath, { encoding: 'utf-8' })) as unknown as string;
  return assetPaths.map((assetPath, index) => ({
    filename: path.basename(assetPath),
    content: assetContents[index]
  }));
}

const compile = (): Promise<Assets> => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      // Read the output later:
      if (err) {
        console.error(err)
        reject(err);
      }
      const assets = getAssets(stats);
      console.log('compiled:\n   ', assets.map(({ filename }) => filename).join('\n    '));
      resolve(assets);
    });
  });
}

export default compile;