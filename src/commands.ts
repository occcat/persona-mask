import {
  getAllPersonas,
  getPersona,
  savePersona,
  deletePersona,
  setActivePersonaId,
  getActivePersonaId,
} from "./storage.js";
import {
  generateFromPrompt,
  generateFromKeyword,
  getAvailableKeywords,
} from "./generator.js";
import {
  detectUserLanguage,
  getKeywordDescription,
  getLocalizedDescription,
} from "./language.js";
import type { PersonaLanguage } from "./language.js";
import { switchPersona, restoreBackup } from "./switcher.js";

const HELP_TEXT = `🎭 **Persona Mask** — 人格面具

可用命令:
- \`/persona list\` — 列出所有可用人格
- \`/persona show <id>\` — 显示人格详情
- \`/persona switch <id>\` — 切换到指定人格
- \`/persona generate <id> <name> <prompt>\` — 从提示词生成新人格
- \`/persona random <keyword>\` — 从关键字随机生成人格
- \`/persona keywords\` — 列出所有可用关键字
- \`/persona delete <id>\` — 删除自定义人格
- \`/persona restore\` — 恢复切换前的原始文件
- \`/persona current\` — 显示当前激活的人格`;

function formatPersonaList(language: PersonaLanguage): string {
  const all = getAllPersonas();
  const activeId = getActivePersonaId();
  const title = language === "zh" ? "🎭 **可用人格:**\n" : "🎭 **Available Personas:**\n";
  const lines: string[] = [title];

  for (const [id, stored] of Object.entries(all)) {
    const active = id === activeId ? " ✅" : "";
    const tag = stored.isBuiltIn ? (language === "zh" ? "内置" : "Built-in") : language === "zh" ? "自定义" : "Custom";
    const arcana = stored.preset.arcana ? ` 「${stored.preset.arcana}」` : "";
    lines.push(`- **${stored.preset.name}** (\`${id}\`) [${tag}]${arcana}${active}`);
    lines.push(`  ${getLocalizedDescription(stored.preset, language)}`);
  }

  return lines.join("\n");
}

function formatKeywordList(language: PersonaLanguage): string {
  const keywords = getAvailableKeywords();
  const lines: string[] =
    language === "zh"
      ? [
          "🎭 **可用关键字（示例）:**\n",
          "`/persona random <keyword>` 支持任意关键字；下面是推荐主题关键字：\n",
        ]
      : [
          "🎭 **Example Keywords:**\n",
          "`/persona random <keyword>` accepts any keyword; below are recommended themed seeds:\n",
        ];

  for (const kw of keywords) {
    const desc = getKeywordDescription(kw, language);
    lines.push(`- **${kw}** — ${desc}`);
  }

  return lines.join("\n");
}

function formatPersonaDetail(id: string, language: PersonaLanguage): string {
  const stored = getPersona(id);
  if (!stored) return language === "zh" ? `❌ 未找到人格: \`${id}\`` : `❌ Persona not found: \`${id}\``;

  const { preset } = stored;
  const arcanaLine = preset.arcana
    ? language === "zh"
      ? `\n**阿尔卡纳:** ${preset.arcana}`
      : `\n**Arcana:** ${preset.arcana}`
    : "";
  const keywordsLine =
    preset.keywords && preset.keywords.length > 0
      ? language === "zh"
        ? `\n**关键字:** ${preset.keywords.join(", ")}`
        : `\n**Keywords:** ${preset.keywords.join(", ")}`
      : "";
  const description = getLocalizedDescription(preset, language);
  const soulSnippet = preset.soul.whoIAm.slice(0, 150);

  const lines =
    language === "zh"
      ? [
          `🎭 **${preset.name}** (\`${preset.id}\`)`,
          `> ${description}`,
          "",
          `**身份:** ${preset.identity.creature} ${preset.identity.emoji}`,
          `**性格:** ${preset.identity.vibe}`,
          arcanaLine,
          keywordsLine,
          "",
          `**灵魂:** ${soulSnippet}...`,
          "",
          `**核心信念:** ${preset.soul.coreTruths.length} 条`,
          `**边界:** ${preset.soul.boundaries.length} 条`,
          "",
          stored.isBuiltIn ? "📦 内置人格" : `🔧 自定义 (${stored.createdAt})`,
        ]
      : [
          `🎭 **${preset.name}** (\`${preset.id}\`)`,
          `> ${description}`,
          "",
          `**Identity:** ${preset.identity.creature} ${preset.identity.emoji}`,
          `**Vibe:** ${preset.identity.vibe}`,
          arcanaLine,
          keywordsLine,
          "",
          `**Soul:** ${soulSnippet}...`,
          "",
          `**Core Truths:** ${preset.soul.coreTruths.length}`,
          `**Boundaries:** ${preset.soul.boundaries.length}`,
          "",
          stored.isBuiltIn ? "📦 Built-in persona" : `🔧 Custom (${stored.createdAt})`,
        ];

  return lines.filter(Boolean).join("\n");
}

interface PersonaCommandRuntime {
  commandBody?: string;
  languageHint?: string;
}

export function handlePersonaCommand(
  args: string,
  workspaceDir: string,
  runtime: PersonaCommandRuntime = {},
): { text: string } {
  const parts = args.trim().split(/\s+/);
  const subcommand = parts[0]?.toLowerCase();
  const language = detectUserLanguage([runtime.languageHint, runtime.commandBody, args], "zh");

  if (!subcommand) return { text: HELP_TEXT };

  switch (subcommand) {
    case "list":
    case "ls": {
      return { text: formatPersonaList(language) };
    }

    case "show":
    case "info": {
      const id = parts[1];
      if (!id) return { text: "用法: `/persona show <id>`" };
      return { text: formatPersonaDetail(id, language) };
    }

    case "switch":
    case "use": {
      const id = parts[1];
      if (!id) return { text: "用法: `/persona switch <id>`" };

      const stored = getPersona(id);
      if (!stored) return { text: `❌ 未找到人格: \`${id}\`` };

      switchPersona(workspaceDir, {
        ...stored.preset,
        description: getLocalizedDescription(stored.preset, language),
      });
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

    case "random":
    case "rand": {
      const keyword = parts.slice(1).join(" ").trim().toLowerCase();
      if (!keyword) {
        return {
          text:
            language === "zh"
              ? "用法: `/persona random <keyword>`\n\n支持任意关键字；使用 `/persona keywords` 查看推荐关键字"
              : "Usage: `/persona random <keyword>`\n\nAny keyword is supported; use `/persona keywords` for themed examples",
        };
      }

      const preset = generateFromKeyword(keyword, language);

      savePersona(preset);
      const description = getLocalizedDescription(preset, language);
      return {
        text:
          language === "zh"
            ? `✅ 已随机生成人格 **${preset.name}** (\`${preset.id}\`) 「${preset.arcana}」\n${preset.identity.emoji} ${preset.identity.creature}\n> ${description}\n\n使用 \`/persona switch ${preset.id}\` 来激活`
            : `✅ Random persona created **${preset.name}** (\`${preset.id}\`) 「${preset.arcana}」\n${preset.identity.emoji} ${preset.identity.creature}\n> ${description}\n\nUse \`/persona switch ${preset.id}\` to activate`,
      };
    }

    case "keywords":
    case "kw": {
      return { text: formatKeywordList(language) };
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
