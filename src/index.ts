#!/usr/bin/env node

import { install } from "./installer.js";
import type { Target } from "./installer.js";

/**
 * CLIのエントリーポイント。
 * package.json の `bin` 設定からこのファイル（ビルド後は dist/index.js）が起動される。
 */
const args = process.argv.slice(2);
const command = args[0];

/**
 * CLIの使い方を表示する。
 */
function showHelp(): void {
  console.log(`
agent-init-skills - Opinionated dev-environment setup skills for AI coding agents

Usage:
  agent-init-skills install [options]

Options:
  --target <agent>   Target agent: claude-code, codex, or both (default: both)
  --local            Install to current directory instead of home directory
  --overwrite        Overwrite existing skills
  --help             Show this help message
`);
}

// コマンド未指定またはヘルプ指定時は、説明を表示して終了する。
if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

// 現在対応しているサブコマンドは install のみ。
if (command !== "install") {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

const local = args.includes("--local");
const overwrite = args.includes("--overwrite");

if (args.includes("--force")) {
  console.error("`--force` has been removed. Use `--overwrite` instead.");
  process.exit(1);
}

let target: Target | "both" = "both";
const targetIdx = args.indexOf("--target");
// --target が指定された場合のみ、対象エージェントを上書きする。
if (targetIdx !== -1) {
  const val = args[targetIdx + 1];
  if (val === "claude-code" || val === "codex" || val === "both") {
    target = val;
  } else {
    console.error(`Invalid target: ${val}. Must be claude-code, codex, or both.`);
    process.exit(1);
  }
}

install({ target, local, overwrite });
