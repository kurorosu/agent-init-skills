import fs from "node:fs";
import path from "node:path";
import { getHomeDir, getTemplatesDir } from "./detect.js";

export type Target = "claude-code" | "codex";

export interface InstallOptions {
  target: Target | "both";
  local: boolean;
  force: boolean;
}

/**
 * ターゲットごとのインストール先ディレクトリを返す。
 * local=true の場合はカレント配下、false の場合はホーム配下に配置する。
 */
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

/**
 * ターゲットごとのテンプレートソースディレクトリを返す。
 */
function getSourceDir(target: Target): string {
  return path.join(getTemplatesDir(), target, "skills");
}

/**
 * childPath が basePath 配下にあるかを判定する。
 */
function isPathInside(childPath: string, basePath: string): boolean {
  const rel = path.relative(basePath, childPath);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * コピー対象ファイルの内容を読み込む。
 * SKILL.md が相対参照1行のみのファイルだった場合は参照先を解決して本文を返す。
 */
function readFileForCopy(srcPath: string): Buffer {
  const realSrcPath = fs.realpathSync(srcPath);
  const rawContent = fs.readFileSync(realSrcPath);

  // 一部環境では symlink を保持できず、SKILL.md が
  // 相対パス文字列だけの通常ファイル（例: ../../../common/...）として展開される。
  // その場合は参照先を解決し、インストール先に手順本文をコピーする。
  if (path.basename(srcPath) !== "SKILL.md") {
    return rawContent;
  }

  const maybeRef = rawContent.toString("utf8").trim();
  const isSingleLine = !/[\r\n]/.test(maybeRef);
  const looksLikeRelativeMarkdownPath = /^\.{1,2}[\\/].+\.md$/.test(maybeRef);
  if (!isSingleLine || !looksLikeRelativeMarkdownPath) {
    return rawContent;
  }

  const resolvedPath = path.resolve(path.dirname(srcPath), maybeRef);
  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    throw new Error(`Invalid SKILL.md reference: ${srcPath} -> ${maybeRef}`);
  }

  const realResolvedPath = fs.realpathSync(resolvedPath);
  const commonRoot = fs.realpathSync(path.join(getTemplatesDir(), "common"));
  if (!isPathInside(realResolvedPath, commonRoot)) {
    throw new Error(
      `Refusing SKILL.md reference outside templates/common: ${srcPath} -> ${maybeRef}`,
    );
  }

  return fs.readFileSync(realResolvedPath);
}

/**
 * ディレクトリ内容を再帰的にコピーする。
 */
function copyDirContents(src: string, dest: string): void {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirContents(srcPath, destPath);
    } else {
      const content = readFileForCopy(srcPath);
      fs.writeFileSync(destPath, content);
    }
  }
}

/**
 * 指定ターゲットの各 skill をコピーする。
 * force=false で既存 skill がある場合はスキップする。
 */
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

/**
 * インストール処理の公開エントリーポイント。
 * target=both の場合は claude-code / codex の順で処理する。
 */
export function install(options: InstallOptions): void {
  const targets: Target[] =
    options.target === "both"
      ? ["claude-code", "codex"]
      : [options.target];

  for (const target of targets) {
    const destDir = getDestDir(target, options.local);
    console.log(`\nInstalling skills for ${target} -> ${destDir}`);
    copySkills(target, options.local, options.force);
  }

  console.log("\nDone!");
}
