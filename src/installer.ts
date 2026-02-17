import fs from "node:fs";
import path from "node:path";
import { getHomeDir, getTemplatesDir } from "./detect.js";

export type Target = "claude-code" | "codex";

export interface InstallOptions {
  target: Target | "both";
  local: boolean;
  overwrite: boolean;
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
 * overwrite=false で既存 skill がある場合はスキップする。
 */
/**
 * 置換処理に使う一時ディレクトリの一意なパスを生成する。
 */
function getUniqueSiblingPath(parentDir: string, skillName: string, marker: string): string {
  for (let i = 0; i < 1000; i += 1) {
    const candidate = path.join(parentDir, `${skillName}.${marker}.${Date.now()}-${process.pid}-${i}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Failed to allocate temporary directory path for ${skillName}`);
}

/**
 * 一時ディレクトリ削除の失敗を警告ログに落として処理継続する。
 */
function removeDirBestEffort(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.warn(
      `  [warn] could not remove temporary directory: ${dirPath} (${(error as Error).message})`,
    );
  }
}

/**
 * 既存 skill ディレクトリを安全に置換する。
 * 1) 新規内容を一時ディレクトリに作成
 * 2) 既存をバックアップへリネーム
 * 3) 新規を本番名へリネーム
 * 4) 失敗時は可能な範囲でロールバック
 */
function replaceSkillDirectory(skillSrc: string, skillDest: string): void {
  const parentDir = path.dirname(skillDest);
  const skillName = path.basename(skillDest);
  const stagingDir = getUniqueSiblingPath(parentDir, skillName, "__new__");
  const backupDir = getUniqueSiblingPath(parentDir, skillName, "__old__");

  fs.mkdirSync(stagingDir, { recursive: true });
  copyDirContents(skillSrc, stagingDir);

  let movedToBackup = false;

  try {
    if (fs.existsSync(skillDest)) {
      fs.renameSync(skillDest, backupDir);
      movedToBackup = true;
    }

    fs.renameSync(stagingDir, skillDest);

    if (movedToBackup) {
      removeDirBestEffort(backupDir);
    }
  } catch (error) {
    removeDirBestEffort(stagingDir);

    if (movedToBackup && !fs.existsSync(skillDest) && fs.existsSync(backupDir)) {
      fs.renameSync(backupDir, skillDest);
    }

    throw error;
  }
}

/**
 * 指定ターゲットの各 skill をコピーする。
 * overwrite=false の場合、既存 skill はスキップする。
 * overwrite=true の場合、対象 skill ディレクトリ単位で安全置換する。
 */
function copySkills(target: Target, local: boolean, overwrite: boolean): void {
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

    if (fs.existsSync(skillDest) && !overwrite) {
      console.log(`  [skip] ${skillDir.name} (already exists, use --overwrite to replace)`);
      continue;
    }

    if (fs.existsSync(skillDest)) {
      replaceSkillDirectory(skillSrc, skillDest);
      console.log(`  [replace] ${skillDir.name}`);
    } else {
      fs.mkdirSync(skillDest, { recursive: true });
      copyDirContents(skillSrc, skillDest);
      console.log(`  [ok]      ${skillDir.name}`);
    }
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
    copySkills(target, options.local, options.overwrite);
  }

  console.log("\nDone!");
}
