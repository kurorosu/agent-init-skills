import os from "node:os";
import path from "node:path";

export function getHomeDir(): string {
  return os.homedir();
}

export type Platform = "windows" | "macos" | "linux";

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

export function getTemplatesDir(): string {
  return path.resolve(__dirname, "..", "templates");
}
