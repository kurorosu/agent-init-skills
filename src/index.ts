#!/usr/bin/env node

import { install } from "./installer.js";
import type { Target } from "./installer.js";

const args = process.argv.slice(2);
const command = args[0];

function showHelp(): void {
  console.log(`
agent-init-skills - Opinionated dev-environment setup skills for AI coding agents

Usage:
  agent-init-skills install [options]

Options:
  --target <agent>   Target agent: claude-code, codex, or both (default: both)
  --local            Install to current directory instead of home directory
  --force            Overwrite existing skills
  --help             Show this help message
`);
}

if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

if (command !== "install") {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

const local = args.includes("--local");
const force = args.includes("--force");

let target: Target | "both" = "both";
const targetIdx = args.indexOf("--target");
if (targetIdx !== -1) {
  const val = args[targetIdx + 1];
  if (val === "claude-code" || val === "codex" || val === "both") {
    target = val;
  } else {
    console.error(`Invalid target: ${val}. Must be claude-code, codex, or both.`);
    process.exit(1);
  }
}

install({ target, local, force });
