// Packs the standalone build into deploy/fly-celesta-hosting.zip for a Linux Node.js host
// (DirectAdmin / cPanel "Setup Node.js App"). Run through `npm run package:hosting`, which builds first.
import { execFileSync, execSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const zip = path.join(root, "deploy", "fly-celesta-hosting.zip");

if (!existsSync(path.join(standalone, "server.js"))) {
  console.error('No .next/standalone/server.js: run `next build` with output: "standalone" first.');
  process.exit(1);
}

// Next.js leaves the static assets (and public/, if any) out of the standalone folder.
cpSync(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), { recursive: true });
if (existsSync(path.join(root, "public"))) cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });

// Local development data must never reach the server (also excluded from tracing in next.config.ts).
rmSync(path.join(standalone, ".data"), { recursive: true, force: true });

// Turbopack loads each serverExternalPackages entry (mysql2, svg-captcha) through a link in .next/node_modules
// named <package>-<hash>. Built on Windows those links point at D:\…\node_modules, and a host's unzip may not
// restore links at all, so replace each one with a real copy of the traced package.
const aliases = path.join(standalone, ".next", "node_modules");
for (const name of existsSync(aliases) ? readdirSync(aliases) : []) {
  const alias = path.join(aliases, name);
  if (!lstatSync(alias).isSymbolicLink()) continue;
  const source = path.join(standalone, "node_modules", name.replace(/-[0-9a-f]{16}$/, ""));
  if (!existsSync(path.join(source, "package.json"))) {
    console.error(`Cannot resolve ${path.relative(root, alias)}: no traced package at ${path.relative(root, source)}`);
    process.exit(1);
  }
  rmSync(alias, { force: true }); // removes the link, not its target
  cpSync(source, alias, { recursive: true });
}

// sharp (image optimisation) ships native binaries for the machine that ran `npm install`. Replace them with
// Linux x64 ones, plus the WebAssembly build that sharp falls back to if the host's Linux is too old for them.
const sharpPkg = JSON.parse(readFileSync(path.join(root, "node_modules", "sharp", "package.json"), "utf8"));
const img = path.join(standalone, "node_modules", "@img");
for (const name of existsSync(img) ? readdirSync(img) : []) {
  if (name.startsWith("sharp-")) rmSync(path.join(img, name), { recursive: true, force: true });
}
const temp = mkdtempSync(path.join(os.tmpdir(), "fly-celesta-sharp-"));
try {
  writeFileSync(path.join(temp, "package.json"), "{}");
  const packages = [
    `@img/sharp-linux-x64@${sharpPkg.version}`,
    `@img/sharp-libvips-linux-x64@${sharpPkg.optionalDependencies["@img/sharp-libvips-linux-x64"]}`,
    `@img/sharp-wasm32@${sharpPkg.version}`,
  ];
  // One command string (npm is npm.cmd on Windows, which needs a shell). npm on Windows/macOS has no libc
  // to compare with, so the platform check needs --force.
  execSync(`npm install --os=linux --cpu=x64 --libc=glibc --force --no-package-lock --no-audit --no-fund ${packages.join(" ")}`, {
    cwd: temp,
    stdio: "inherit",
  });
  cpSync(path.join(temp, "node_modules"), path.join(standalone, "node_modules"), {
    recursive: true,
    filter: (source) => path.basename(source) !== ".package-lock.json",
  });
} finally {
  rmSync(temp, { recursive: true, force: true });
}

// Zip the folder contents (server.js at the top level, ready to extract into the application root).
mkdirSync(path.dirname(zip), { recursive: true });
rmSync(zip, { force: true });
const entries = readdirSync(standalone);
// Windows' own bsdtar writes zip files (Git Bash's GNU tar, earlier on PATH there, cannot).
const windowsTar = path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe");
if (process.platform === "win32") execFileSync(windowsTar, ["-a", "-c", "-f", zip, ...entries], { cwd: standalone });
else execFileSync("zip", ["-qr", zip, ...entries], { cwd: standalone });

console.log(`\nCreated ${path.relative(root, zip)} (${(statSync(zip).size / 1024 / 1024).toFixed(1)} MB): ${entries.join(", ")}`);
