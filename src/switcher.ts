import { writeFileSync, readFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import type { PersonaPreset } from "./types.js";
import { generateIdentityMd, generateSoulMd, generateAgentsMd } from "./generator.js";

const BACKUP_DIR_NAME = ".persona-backup";

function backupFile(workspaceDir: string, filename: string): void {
  const src = join(workspaceDir, filename);
  if (!existsSync(src)) return;

  const backupDir = join(workspaceDir, BACKUP_DIR_NAME);
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  const dest = join(backupDir, filename);
  copyFileSync(src, dest);
}

export function switchPersona(workspaceDir: string, preset: PersonaPreset): void {
  backupFile(workspaceDir, "AGENTS.md");
  backupFile(workspaceDir, "SOUL.md");
  backupFile(workspaceDir, "IDENTITY.md");

  writeFileSync(join(workspaceDir, "IDENTITY.md"), generateIdentityMd(preset), "utf-8");
  writeFileSync(join(workspaceDir, "SOUL.md"), generateSoulMd(preset), "utf-8");
  writeFileSync(join(workspaceDir, "AGENTS.md"), generateAgentsMd(preset), "utf-8");
}

export function restoreBackup(workspaceDir: string): boolean {
  const backupDir = join(workspaceDir, BACKUP_DIR_NAME);
  if (!existsSync(backupDir)) return false;

  let restored = false;
  for (const filename of ["AGENTS.md", "SOUL.md", "IDENTITY.md"]) {
    const src = join(backupDir, filename);
    if (existsSync(src)) {
      copyFileSync(src, join(workspaceDir, filename));
      restored = true;
    }
  }
  return restored;
}

export function getCurrentPersonaFiles(
  workspaceDir: string,
): { agents: string | null; soul: string | null; identity: string | null } {
  const read = (f: string): string | null => {
    const p = join(workspaceDir, f);
    if (!existsSync(p)) return null;
    try {
      return readFileSync(p, "utf-8");
    } catch {
      return null;
    }
  };

  return {
    agents: read("AGENTS.md"),
    soul: read("SOUL.md"),
    identity: read("IDENTITY.md"),
  };
}
