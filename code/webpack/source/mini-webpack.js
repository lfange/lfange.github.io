const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

class MiniWebpack {
  constructor(options = {}) {
    this.options = options;
    this.entry = options.entry || "./src/index.js";
    this.output = options.output || {
      filename: "bundle.js",
      path: path.resolve(process.cwd(), "dist")
    };
    this.plugins = options.plugins || [];
    this.modules = [];
    this.hooks = {
      run: new Hook(),
      compile: new Hook(),
      emit: new Hook(),
      done: new Hook()
    };
    this.context = process.cwd();
    this.entryPath = path.resolve(this.context, this.entry);
  }

  run() {
    this.hooks.run.call(this);
    this.hooks.compile.call(this);

    const entryModule = this.buildModule(this.entryPath, true);

    this.modules.forEach(module => {
      if (module.dependencies) {
        module.dependencies.forEach(dep => {
          const depPath = path.resolve(path.dirname(module.file), dep);
          this.buildModule(depPath);
        });
      }
    });

    this.hooks.emit.call(this);

    const bundle = this.generateBundle();

    this.hooks.done.call(this);

    return bundle;
  }

  buildModule(filePath, isEntry = false) {
    const body = fs.readFileSync(filePath, "utf-8");

    const ast = parser.parse(body, {
      sourceType: "module"
    });

    const deps = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filePath);
        const absPath = path.resolve(dirname, node.source.value);
        deps[node.source.value] = "./" + path.relative(path.dirname(filePath), absPath);
      }
    });

    const { code } = babel.transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    });

    const moduleInfo = {
      file: filePath,
      deps,
      code,
      isEntry
    };

    if (!this.modules.find(m => m.file === filePath)) {
      this.modules.push(moduleInfo);
    }

    return moduleInfo;
  }

  generateBundle() {
    const modules = this.modules.map(m => {
      const deps = JSON.stringify(m.deps);
      const code = m.code;
      return `
        "${m.file}": {
          deps: ${deps},
          code: function(module, exports, require) {
            ${code}
          }
        }
      `;
    }).join(",\n");

    const entryFile = this.modules.find(m => m.isEntry)?.file;

    const bundle = `
      (function(modules) {
        var installedModules = {};

        function __webpack_require__(moduleId) {
          if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }

          var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
          };

          modules[moduleId].code.call(module.exports, module, module.exports, __webpack_require__);

          module.l = true;
          return module.exports;
        }

        return __webpack_require__("${entryFile}");
      })({
        ${modules}
      })
    `;

    return bundle;
  }

  applyPlugins(plugins) {
    plugins.forEach(plugin => {
      if (typeof plugin === "function") {
        plugin(this);
      } else if (plugin.apply) {
        plugin.apply(this);
      }
    });
  }
}

class Hook {
  constructor() {
    this.callbacks = [];
  }

  tap(name, callback) {
    this.callbacks.push({ name, callback });
  }

  call(...args) {
    this.callbacks.forEach(({ name, callback }) => {
      try {
        callback(...args);
      } catch (err) {
        console.error(`Hook "${name}" error:`, err);
      }
    });
  }
}

class Plugin {
  constructor(name) {
    this.name = name;
  }

  apply(compiler) {}
}

class BannerPlugin extends Plugin {
  constructor(options = {}) {
    super("BannerPlugin");
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tap("BannerPlugin", () => {
      console.log(`[BannerPlugin] Building with banner: ${this.options.banner || "default"}`);
    });
  }
}

class LogPlugin extends Plugin {
  constructor(options = {}) {
    super("LogPlugin");
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.run.tap("LogPlugin", () => {
      console.log("[LogPlugin] Build started!");
    });

    compiler.hooks.done.tap("LogPlugin", () => {
      console.log("[LogPlugin] Build completed!");
    });

    compiler.hooks.compile.tap("LogPlugin", () => {
      console.log("[LogPlugin] Compiling...");
    });
  }
}

MiniWebpack.prototype.applyPlugins = function(plugins) {
  plugins.forEach(plugin => {
    if (typeof plugin === "function") {
      plugin(this);
    } else if (plugin && typeof plugin.apply === "function") {
      plugin.apply(this);
    }
  });
};

module.exports = MiniWebpack;
module.exports.MiniWebpack = MiniWebpack;
module.exports.Plugin = Plugin;
module.exports.BannerPlugin = BannerPlugin;
module.exports.LogPlugin = LogPlugin;
module.exports.Hook = Hook;