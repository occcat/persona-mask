export interface PersonaPreset {
  id: string;
  name: string;
  description: string;
  identity: {
    name: string;
    creature: string;
    vibe: string;
    emoji: string;
    avatar: string;
  };
  soul: {
    whoIAm: string;
    coreTruths: string[];
    boundaries: string[];
    vibe: string;
    continuity: string;
  };
  agent: {
    firstRun: string;
    everySession: string;
    memory: string;
    safety: string;
    groupChats: string;
    customize: string;
  };
}

export interface StoredPersona {
  preset: PersonaPreset;
  createdAt: string;
  isBuiltIn: boolean;
}

export interface PersonaStore {
  personas: Record<string, StoredPersona>;
  activePersona: string | null;
}
