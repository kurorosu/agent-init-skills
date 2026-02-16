import fs from "node:fs";
import path from "node:path";
import { getHomeDir, getTemplatesDir } from "./detect.js";

export type Target = "claude-code" | "codex";

export interface InstallOptions {
  target: Target | "both";
  local: boolean;
  force: boolean;
}

function getDestDir(target: Target, local: boolean): string {
  if (target === "claude-code") {
    return local
      ? path.resolve(process.cwd(), ".claude", "skills")
      : path.join(getHomeDir(), ".claude", "skills");
  }
  // codex
  return local
    ? path.resolve(process.cwd(), ".codex", "skills")
    : path.join(getHomeDir(), ".codex", "skills");
}

function getSourceDir(target: Target): string {
  return path.join(getTemplatesDir(), target, "skills");
}

function copyDirContents(src: string, dest: string): void {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirContents(srcPath, destPath);
    } else {
      const content = fs.readFileSync(fs.realpathSync(srcPath));
      fs.writeFileSync(destPath, content);
    }
  }
}

function copySkills(target: Target, local: boolean, force: boolean): void {
  const srcDir = getSourceDir(target);
  const destDir = getDestDir(target, local);

  if (!fs.existsSync(srcDir)) {
    console.error(`  Source directory not found: ${srcDir}`);
    return;
  }

  const skillDirs = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  if (skillDirs.length === 0) {
    console.log(`  No skills found in ${srcDir}`);
    return;
  }

  for (const skillDir of skillDirs) {
    const skillSrc = path.join(srcDir, skillDir.name);
    const skillDest = path.join(destDir, skillDir.name);

    if (fs.existsSync(skillDest) && !force) {
      console.log(`  [skip] ${skillDir.name} (already exists, use --force to overwrite)`);
      continue;
    }

    fs.mkdirSync(skillDest, { recursive: true });
    copyDirContents(skillSrc, skillDest);
    console.log(`  [ok]   ${skillDir.name}`);
  }
}

export function install(options: InstallOptions): void {
  const targets: Target[] =
    options.target === "both"
      ? ["claude-code", "codex"]
      : [options.target];

  for (const target of targets) {
    const destDir = getDestDir(target, options.local);
    console.log(`\nInstalling skills for ${target} → ${destDir}`);
    copySkills(target, options.local, options.force);
  }

  console.log("\nDone!");
}
