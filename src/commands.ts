import {
  getAllPersonas,
  getPersona,
  savePersona,
  deletePersona,
  setActivePersonaId,
  getActivePersonaId,
} from "./storage.js";
import { generateFromPrompt } from "./generator.js";
import { switchPersona, restoreBackup } from "./switcher.js";

const HELP_TEXT = `🎭 **Persona Mask** — 人格面具

可用命令:
- \`/persona list\` — 列出所有可用人格
- \`/persona show <id>\` — 显示人格详情
- \`/persona switch <id>\` — 切换到指定人格
- \`/persona generate <id> <name> <prompt>\` — 从提示词生成新人格
- \`/persona delete <id>\` — 删除自定义人格
- \`/persona restore\` — 恢复切换前的原始文件
- \`/persona current\` — 显示当前激活的人格`;

function formatPersonaList(): string {
  const all = getAllPersonas();
  const activeId = getActivePersonaId();
  const lines: string[] = ["🎭 **可用人格:**\n"];

  for (const [id, stored] of Object.entries(all)) {
    const active = id === activeId ? " ✅" : "";
    const tag = stored.isBuiltIn ? "内置" : "自定义";
    lines.push(`- **${stored.preset.name}** (\`${id}\`) [${tag}]${active}`);
    lines.push(`  ${stored.preset.description}`);
  }

  return lines.join("\n");
}

function formatPersonaDetail(id: string): string {
  const stored = getPersona(id);
  if (!stored) return `❌ 未找到人格: \`${id}\``;

  const { preset } = stored;
  const lines = [
    `🎭 **${preset.name}** (\`${preset.id}\`)`,
    `> ${preset.description}`,
    "",
    `**身份:** ${preset.identity.creature} ${preset.identity.emoji}`,
    `**性格:** ${preset.identity.vibe}`,
    "",
    `**灵魂:** ${preset.soul.whoIAm.slice(0, 150)}...`,
    "",
    `**核心信念:** ${preset.soul.coreTruths.length} 条`,
    `**边界:** ${preset.soul.boundaries.length} 条`,
    "",
    stored.isBuiltIn ? "📦 内置人格" : `🔧 自定义 (${stored.createdAt})`,
  ];

  return lines.join("\n");
}

export function handlePersonaCommand(
  args: string,
  workspaceDir: string,
): { text: string } {
  const parts = args.trim().split(/\s+/);
  const subcommand = parts[0]?.toLowerCase();

  if (!subcommand) return { text: HELP_TEXT };

  switch (subcommand) {
    case "list":
    case "ls": {
      return { text: formatPersonaList() };
    }

    case "show":
    case "info": {
      const id = parts[1];
      if (!id) return { text: "用法: `/persona show <id>`" };
      return { text: formatPersonaDetail(id) };
    }

    case "switch":
    case "use": {
      const id = parts[1];
      if (!id) return { text: "用法: `/persona switch <id>`" };

      const stored = getPersona(id);
      if (!stored) return { text: `❌ 未找到人格: \`${id}\`` };

      switchPersona(workspaceDir, stored.preset);
      setActivePersonaId(id);
      return {
        text: `✅ 已切换到 **${stored.preset.name}** ${stored.preset.identity.emoji}\n\n已更新 AGENTS.md、SOUL.md、IDENTITY.md（原文件已备份到 .persona-backup/）`,
      };
    }

    case "generate":
    case "gen":
    case "create": {
      const id = parts[1];
      const name = parts[2];
      const prompt = parts.slice(3).join(" ");
      if (!id || !name || !prompt) {
        return { text: "用法: `/persona generate <id> <name> <描述提示词>`" };
      }

      const preset = generateFromPrompt(id, name, prompt);
      savePersona(preset);
      return {
        text: `✅ 已生成新人格 **${name}** (\`${id}\`)\n\n使用 \`/persona switch ${id}\` 来激活`,
      };
    }

    case "delete":
    case "rm": {
      const id = parts[1];
      if (!id) return { text: "用法: `/persona delete <id>`" };

      const success = deletePersona(id);
      if (!success) {
        return { text: `❌ 无法删除: \`${id}\` (内置人格不可删除或不存在)` };
      }
      return { text: `✅ 已删除人格: \`${id}\`` };
    }

    case "restore":
    case "reset": {
      const restored = restoreBackup(workspaceDir);
      if (!restored) {
        return { text: "❌ 没有找到备份文件" };
      }
      setActivePersonaId(null);
      return { text: "✅ 已恢复原始人格文件" };
    }

    case "current": {
      const activeId = getActivePersonaId();
      if (!activeId) {
        return { text: "当前没有激活的人格面具（使用默认配置）" };
      }
      const stored = getPersona(activeId);
      if (!stored) {
        return { text: `当前激活: \`${activeId}\`（但人格数据已丢失）` };
      }
      return {
        text: `当前人格: **${stored.preset.name}** (\`${activeId}\`) ${stored.preset.identity.emoji}`,
      };
    }

    default:
      return { text: HELP_TEXT };
  }
}
