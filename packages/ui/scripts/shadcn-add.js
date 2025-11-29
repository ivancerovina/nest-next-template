const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function validateFile(fullPath) {
  const fileName = path.basename(fullPath);

  if (fs.statSync(fullPath).isDirectory()) {
    return true;
  }

  if (!fullPath.endsWith(".ts") && !fullPath.endsWith(".tsx")) {
    return false;
  }

  if (fileName === "index.ts" || fileName === "index.tsx") {
    return false;
  }

  return true;
}

function runPnpmCommand(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", [cmd, ...args], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      code === 0 ? resolve() : reject();
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

function generateExports() {
  const baseDir = path.join(__dirname, "../src");

  const dirsToCheck = [
    "components",
    "components/ui",
    "lib",
    "lib/utils",
    "hooks",
  ];

  for (const dir of dirsToCheck) {
    const files = fs.readdirSync(path.join(baseDir, dir));
    const indexFile = path.join(baseDir, dir, "index.ts");

    let exports = "";

    for (const file of files) {
      if (!validateFile(path.join(baseDir, dir, file))) {
        continue;
      }

      const fileName = file.includes(".")
        ? file.slice(0, file.lastIndexOf("."))
        : file;

      exports += `export * from "./${fileName}";\n`;
    }

    fs.writeFileSync(indexFile, exports);
  }

  console.info(`[i] Exports generated`);
}

const componentsToInstall =
  process.argv.length > 2 ? process.argv.slice(2) : [];

async function main() {
  if (componentsToInstall.length > 0) {
    await runPnpmCommand("shadcn", ["add", ...componentsToInstall]);
  }

  generateExports();
}

void main();
