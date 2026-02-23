import pirate from "./pirate.js";
import professor from "./professor.js";
import zenMonk from "./zen-monk.js";
import cyberpunk from "./cyberpunk.js";
import butler from "./butler.js";
import type { PersonaPreset } from "../types.js";

export const builtInPresets: Record<string, PersonaPreset> = {
  pirate,
  professor,
  "zen-monk": zenMonk,
  cyberpunk,
  butler,
};

export function getBuiltInPreset(id: string): PersonaPreset | undefined {
  return builtInPresets[id];
}

export function listBuiltInPresets(): PersonaPreset[] {
  return Object.values(builtInPresets);
}
