import os from "node:os";
import path from "node:path";

/**
 * ユーザーのホームディレクトリを返す。
 */
export function getHomeDir(): string {
  return os.homedir();
}

export type Platform = "windows" | "macos" | "linux";

/**
 * 実行中OSをツール内の3値（windows/macos/linux）に正規化して返す。
 */
export function getPlatform(): Platform {
  switch (os.platform()) {
    case "win32":
      return "windows";
    case "darwin":
      return "macos";
    default:
      return "linux";
  }
}

/**
 * テンプレート配置ディレクトリ（templates）の絶対パスを返す。
 */
export function getTemplatesDir(): string {
  return path.resolve(__dirname, "..", "templates");
}
