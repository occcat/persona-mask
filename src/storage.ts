import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { PersonaPreset, PersonaStore, StoredPersona } from "./types.js";
import { builtInPresets } from "./presets/index.js";

const STORE_DIR = join(homedir(), ".openclaw", "persona-mask");
const STORE_FILE = join(STORE_DIR, "personas.json");

function ensureStoreDir(): void {
  if (!existsSync(STORE_DIR)) {
    mkdirSync(STORE_DIR, { recursive: true });
  }
}

function readStore(): PersonaStore {
  ensureStoreDir();
  if (!existsSync(STORE_FILE)) {
    return { personas: {}, activePersona: null };
  }
  try {
    const raw = readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw) as PersonaStore;
  } catch {
    return { personas: {}, activePersona: null };
  }
}

function writeStore(store: PersonaStore): void {
  ensureStoreDir();
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function getAllPersonas(): Record<string, StoredPersona> {
  const store = readStore();
  const all: Record<string, StoredPersona> = {};

  for (const [id, preset] of Object.entries(builtInPresets)) {
    all[id] = {
      preset,
      createdAt: "built-in",
      isBuiltIn: true,
    };
  }

  for (const [id, persona] of Object.entries(store.personas)) {
    all[id] = persona;
  }

  return all;
}

export function getPersona(id: string): StoredPersona | undefined {
  const builtIn = builtInPresets[id];
  if (builtIn) {
    return { preset: builtIn, createdAt: "built-in", isBuiltIn: true };
  }
  const store = readStore();
  return store.personas[id];
}

export function savePersona(preset: PersonaPreset): void {
  const store = readStore();
  store.personas[preset.id] = {
    preset,
    createdAt: new Date().toISOString(),
    isBuiltIn: false,
  };
  writeStore(store);
}

export function deletePersona(id: string): boolean {
  if (builtInPresets[id]) {
    return false;
  }
  const store = readStore();
  if (!store.personas[id]) {
    return false;
  }
  delete store.personas[id];
  if (store.activePersona === id) {
    store.activePersona = null;
  }
  writeStore(store);
  return true;
}

export function getActivePersonaId(): string | null {
  return readStore().activePersona;
}

export function setActivePersonaId(id: string | null): void {
  const store = readStore();
  store.activePersona = id;
  writeStore(store);
}

export function exportStore(): PersonaStore {
  const store = readStore();
  return store;
}

export function importStore(data: PersonaStore): void {
  ensureStoreDir();
  writeStore(data);
}
