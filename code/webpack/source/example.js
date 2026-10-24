const path = require('path');
const { MiniWebpack, BannerPlugin, LogPlugin } = require('./mini-webpack.js');

class MyCustomPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tap('MyCustomPlugin', () => {
      console.log('[MyCustomPlugin] Emit phase - bundle is being generated!');
    });

    compiler.hooks.done.tap('MyCustomPlugin', () => {
      console.log('[MyCustomPlugin] Build done! Time to celebrate! 🎉');
    });
  }
}

class FileListPlugin {
  constructor(options = {}) {
    this.options = options;
    this.outputFilename = options.outputFilename || 'filelist.txt';
  }

  apply(compiler) {
    compiler.hooks.emit.tap('FileListPlugin', (compilation) => {
      let filelist = 'Build files:\n';
      for (const filename in compilation) {
        filelist += `- ${filename}\n`;
      }
      console.log('[FileListPlugin] Generated file list');
    });
  }
}

const configuration = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new LogPlugin(),
    new BannerPlugin({ banner: 'Built with MiniWebpack!' }),
    new MyCustomPlugin({ verbose: true }),
    new FileListPlugin()
  ]
};

const webpack = new MiniWebpack(configuration);

webpack.applyPlugins(webpack.options.plugins);

const bundle = webpack.run();

const outputPath = path.resolve(configuration.output.path, configuration.output.filename);
const fs = require('fs');

if (!fs.existsSync(configuration.output.path)) {
  fs.mkdirSync(configuration.output.path, { recursive: true });
}

fs.writeFileSync(outputPath, bundle);

console.log('\n✅ Build completed successfully!');
console.log(`📦 Bundle saved to: ${outputPath}`);
console.log(`📊 Bundle size: ${(bundle.length / 1024).toFixed(2)} KB');