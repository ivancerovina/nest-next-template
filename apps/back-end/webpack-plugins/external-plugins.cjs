const fs = require("node:fs");
const path = require("node:path");
const VirtualModulesPlugin = require("webpack-virtual-modules");

const LOCAL_PLUGINS_DIR = path.resolve(__dirname, "../../../plugins");
const VIRTUAL_MODULE_PATH = "node_modules/virtual-external-plugins.js";

function discoverPlugins() {
  const projectPkgPath = path.resolve(__dirname, "../package.json");
  const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, "utf-8"));

  const installed = new Set([
    ...Object.keys(projectPkg.dependencies ?? {}),
    ...Object.keys(projectPkg.devDependencies ?? {}),
  ]);

  const plugins = [];

  let folders;
  try {
    folders = fs.readdirSync(LOCAL_PLUGINS_DIR);
  } catch {
    return plugins;
  }

  for (const folder of folders) {
    const pkgPath = path.join(LOCAL_PLUGINS_DIR, folder, "package.json");

    try {
      const pluginPkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      if (pluginPkg.frogstep && installed.has(pluginPkg.name)) {
        plugins.push({
          folder,
          name: pluginPkg.name,
          displayName: pluginPkg.frogstep.displayName,
        });
      }
    } catch {
      // Skip invalid plugins
    }
  }

  return plugins;
}

function generateVirtualModule(plugins) {
  const imports = plugins
    .map((p, i) => `const plugin${i} = require('${p.name}/server').default;`)
    .join("\n");

  const registry = plugins
    .map(
      (p, i) =>
        `{ ...plugin${i}, __name: '${p.name}', __displayName: ${JSON.stringify(p.displayName)} }`,
    )
    .join(",\n  ");

  return `
${imports}

exports.plugins = [
  ${registry}
];
`;
}

class ExternalPluginsPlugin {
  constructor() {
    this.virtualModules = null;
    this.plugins = [];
  }

  apply(compiler) {
    this.plugins = discoverPlugins();
    const moduleContent = generateVirtualModule(this.plugins);

    this.virtualModules = new VirtualModulesPlugin({
      [VIRTUAL_MODULE_PATH]: moduleContent,
    });

    this.virtualModules.apply(compiler);

    // Watch plugin directories for changes
    compiler.hooks.afterCompile.tap("ExternalPluginsPlugin", (compilation) => {
      compilation.contextDependencies.add(LOCAL_PLUGINS_DIR);

      for (const plugin of this.plugins) {
        const pluginDir = path.join(LOCAL_PLUGINS_DIR, plugin.folder);
        compilation.contextDependencies.add(pluginDir);
      }
    });

    // Regenerate virtual module on watch rebuild
    compiler.hooks.watchRun.tap("ExternalPluginsPlugin", () => {
      const newPlugins = discoverPlugins();
      const newContent = generateVirtualModule(newPlugins);

      if (this.virtualModules) {
        this.virtualModules.writeModule(VIRTUAL_MODULE_PATH, newContent);
      }

      this.plugins = newPlugins;
    });

    // Log discovered plugins
    compiler.hooks.afterEnvironment.tap("ExternalPluginsPlugin", () => {
      if (this.plugins.length > 0) {
        console.log(
          `[ExternalPlugins] Discovered ${this.plugins.length} plugin(s):`,
          this.plugins.map((p) => p.name).join(", "),
        );
      } else {
        console.log("[ExternalPlugins] No plugins discovered");
      }
    });
  }
}

module.exports = ExternalPluginsPlugin;
