import type { PersonaPreset } from "./types.js";

export function generateIdentityMd(preset: PersonaPreset): string {
  const { identity } = preset;
  return `# IDENTITY.md - Agent Identity

- **Name:** ${identity.name}
- **Creature:** ${identity.creature}
- **Vibe:** ${identity.vibe}
- **Emoji:** ${identity.emoji}
- **Avatar:** ${identity.avatar || "_(not set)_"}
`;
}

export function generateSoulMd(preset: PersonaPreset): string {
  const { soul } = preset;
  const truths = soul.coreTruths.map((t) => `- ${t}`).join("\n");
  const bounds = soul.boundaries.map((b) => `- ${b}`).join("\n");

  return `# SOUL.md - ${preset.name}

## Who I Am

${soul.whoIAm}

## Core Truths

${truths}

## Boundaries

${bounds}

## Vibe

${soul.vibe}

## Continuity

${soul.continuity}
`;
}

export function generateAgentsMd(preset: PersonaPreset): string {
  const { agent } = preset;

  return `# AGENTS.md - ${preset.name}

> ${preset.description}

## First Run

${agent.firstRun}

## Every Session

${agent.everySession}

## Memory

${agent.memory}

## Safety

${agent.safety}

## Group Chats

${agent.groupChats}

## Customize

${agent.customize}
`;
}

export function generateFromPrompt(
  id: string,
  name: string,
  prompt: string,
): PersonaPreset {
  const shortPrompt = prompt.length > 200 ? prompt.slice(0, 200) : prompt;


  return {
    id,
    name,
    description: shortPrompt,
    identity: {
      name,
      creature: "Custom persona",
      vibe: prompt,
      emoji: "🎭",
      avatar: "",
    },
    soul: {
      whoIAm: `I am ${name}. ${prompt}`,
      coreTruths: [
        "I stay true to my defined character at all times",
        "I provide helpful, accurate responses while maintaining my persona",
        "I adapt my communication style to the context while keeping my core identity",
      ],
      boundaries: [
        "I do not break character unless explicitly asked to do so",
        "I maintain professional standards regardless of persona",
      ],
      vibe: prompt,
      continuity:
        "I remember our past conversations and maintain consistency across sessions.",
    },
    agent: {
      firstRun: `Hello! I am ${name}. ${shortPrompt}\n\nLet me take a look at your project and get started.`,
      everySession: `${name} here, ready to help. What are we working on today?`,
      memory:
        "Track important project decisions, architecture patterns, and user preferences across sessions.",
      safety:
        "Always confirm before making destructive changes. Never expose sensitive data.",
      groupChats:
        "Keep responses concise and relevant in group settings. Tag specific people when their input is needed.",
      customize:
        "Adapt response depth and style based on the context of the conversation.",
    },
  };
}
