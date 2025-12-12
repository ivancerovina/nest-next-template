import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

const LOCAL_PLUGINS_DIR = path.resolve("../../plugins");
const NORMALIZED_LOCAL_PLUGINS_DIR = LOCAL_PLUGINS_DIR.replace(/\\/g, "/");

interface DiscoveredPlugin {
  folder: string;
  name: string;
  displayName?: string;
}

async function discoverPlugins(): Promise<DiscoveredPlugin[]> {
  const projectPkg = JSON.parse(
    await fs.readFile(path.resolve("./package.json"), "utf-8"),
  );
  const installed = new Set([
    ...Object.keys(projectPkg.dependencies ?? {}),
    ...Object.keys(projectPkg.devDependencies ?? {}),
  ]);

  const folders = await fs.readdir(LOCAL_PLUGINS_DIR);
  const plugins: DiscoveredPlugin[] = [];

  for (const folder of folders) {
    const pkgPath = path.join(LOCAL_PLUGINS_DIR, folder, "package.json");

    try {
      const pluginPkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));

      if (pluginPkg.frogstep && installed.has(pluginPkg.name)) {
        plugins.push({
          folder,
          name: pluginPkg.name,
          displayName: pluginPkg.frogstep.displayName,
        });
      }
    } catch (_) {}
  }

  return plugins;
}

export default function (): Plugin {
  const virtualId = `virtual:external-plugins`;
  const resolvedId = `\0${virtualId}`;

  return {
    name: "external-plugins",
    resolveId(id) {
      if (id === virtualId) {
        return resolvedId;
      }
    },
    async load(id) {
      if (id !== resolvedId) return;

      const plugins = await discoverPlugins();

      const imports = plugins
        .map((p, i) => `import plugin${i} from '${p.name}/client';`)
        .join("\n");

      const registry = plugins
        .map(
          (p, i) =>
            `{ ...plugin${i}, __name: '${p.name}', __displayName: ${JSON.stringify(p.displayName)} }`,
        )
        .join(",\n  ");

      return `
      ${imports}

      export const plugins = [
        ${registry}
      ];

      if (import.meta.hot) {
        import.meta.hot.accept();
      }
    `;
    },
    configureServer(server) {
      server.watcher.add(LOCAL_PLUGINS_DIR);

      server.watcher.on("change", (file) => {
        if (file.replace(/\\/g, "/").startsWith(NORMALIZED_LOCAL_PLUGINS_DIR)) {
          const mod = server.moduleGraph.getModuleById(resolvedId);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.hot.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}
