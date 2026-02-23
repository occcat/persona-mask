import pirate from "./pirate.js";
import professor from "./professor.js";
import zenMonk from "./zen-monk.js";
import cyberpunk from "./cyberpunk.js";
import butler from "./butler.js";
import arsene from "./arsene.js";
import zorro from "./zorro.js";
import johanna from "./johanna.js";
import carmen from "./carmen.js";
import goemon from "./goemon.js";
import necronomicon from "./necronomicon.js";
import milady from "./milady.js";
import orpheus from "./orpheus.js";
import izanagi from "./izanagi.js";
import thanatos from "./thanatos.js";
import type { PersonaPreset } from "../types.js";

export const builtInPresets: Record<string, PersonaPreset> = {
  pirate,
  professor,
  "zen-monk": zenMonk,
  cyberpunk,
  butler,
  arsene,
  zorro,
  johanna,
  carmen,
  goemon,
  necronomicon,
  milady,
  orpheus,
  izanagi,
  thanatos,
};

export function getBuiltInPreset(id: string): PersonaPreset | undefined {
  return builtInPresets[id];
}

export function listBuiltInPresets(): PersonaPreset[] {
  return Object.values(builtInPresets);
}
