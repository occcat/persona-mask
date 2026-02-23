import { join } from "node:path";
import { homedir } from "node:os";
import { readFileSync, writeFileSync } from "node:fs";

import {
  getAllPersonas,
  getPersona,
  savePersona,
  deletePersona,
  setActivePersonaId,
  getActivePersonaId,
  exportStore,
  importStore,
} from "./storage.js";
import { generateFromPrompt } from "./generator.js";
import { switchPersona, restoreBackup } from "./switcher.js";
import type { PersonaStore } from "./types.js";

interface CliContext {
  program: {
    command: (name: string) => CliCommand;
  };
  config: Record<string, unknown>;
  workspaceDir?: string;
  logger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
    warn: (msg: string) => void;
  };
}

interface CliCommand {
  description: (desc: string) => CliCommand;
  argument: (name: string, desc: string) => CliCommand;
  option: (flags: string, desc: string) => CliCommand;
  action: (fn: (...args: unknown[]) => void | Promise<void>) => CliCommand;
  command: (name: string) => CliCommand;
}

export function registerPersonaCli(ctx: CliContext): void {
  const persona = ctx.program.command("persona").description("人格面具 — 管理 agent 人格");

  persona
    .command("list")
    .description("列出所有可用人格")
    .action(() => {
      const all = getAllPersonas();
      const activeId = getActivePersonaId();
      ctx.logger.info("🎭 可用人格:\n");
      for (const [id, stored] of Object.entries(all)) {
        const active = id === activeId ? " ✅" : "";
        const tag = stored.isBuiltIn ? "内置" : "自定义";
        ctx.logger.info(`  ${stored.preset.identity.emoji} ${stored.preset.name} (${id}) [${tag}]${active}`);
        ctx.logger.info(`     ${stored.preset.description}\n`);
      }
    });

  persona
    .command("show")
    .argument("<id>", "人格 ID")
    .description("显示人格详情")
    .action((id: unknown) => {
      const stored = getPersona(id as string);
      if (!stored) {
        ctx.logger.error(`未找到人格: ${id}`);
        return;
      }
      const { preset } = stored;
      ctx.logger.info(`🎭 ${preset.name} (${preset.id})`);
      ctx.logger.info(`  ${preset.description}`);
      ctx.logger.info(`  身份: ${preset.identity.creature} ${preset.identity.emoji}`);
      ctx.logger.info(`  性格: ${preset.identity.vibe}`);
      ctx.logger.info(`  灵魂: ${preset.soul.whoIAm.slice(0, 200)}`);
      ctx.logger.info(`  核心信念: ${preset.soul.coreTruths.length} 条`);
      ctx.logger.info(`  边界: ${preset.soul.boundaries.length} 条`);
      ctx.logger.info(stored.isBuiltIn ? "  📦 内置人格" : `  🔧 自定义 (${stored.createdAt})`);
    });

  persona
    .command("switch")
    .argument("<id>", "人格 ID")
    .description("切换到指定人格")
    .action((id: unknown) => {
      const stored = getPersona(id as string);
      if (!stored) {
        ctx.logger.error(`未找到人格: ${id}`);
        return;
      }
      switchPersona(ctx.workspaceDir ?? join(homedir(), ".openclaw", "workspace"), stored.preset);
      setActivePersonaId(id as string);
      ctx.logger.info(`✅ 已切换到 ${stored.preset.name} ${stored.preset.identity.emoji}`);
      ctx.logger.info("已更新 AGENTS.md、SOUL.md、IDENTITY.md（原文件已备份）");
    });

  persona
    .command("generate")
    .argument("<id>", "人格 ID (kebab-case)")
    .argument("<name>", "人格名称")
    .argument("<prompt>", "描述提示词")
    .description("从提示词生成新人格")
    .action((id: unknown, name: unknown, prompt: unknown) => {
      const preset = generateFromPrompt(id as string, name as string, prompt as string);
      savePersona(preset);
      ctx.logger.info(`✅ 已生成新人格 ${name} (${id})`);
      ctx.logger.info(`使用 'openclaw persona switch ${id}' 来激活`);
    });

  persona
    .command("delete")
    .argument("<id>", "人格 ID")
    .description("删除自定义人格")
    .action((id: unknown) => {
      const success = deletePersona(id as string);
      if (!success) {
        ctx.logger.error(`无法删除: ${id} (内置人格不可删除或不存在)`);
        return;
      }
      ctx.logger.info(`✅ 已删除人格: ${id}`);
    });

  persona
    .command("restore")
    .description("恢复切换前的原始人格文件")
    .action(() => {
      const restored = restoreBackup(ctx.workspaceDir ?? join(homedir(), ".openclaw", "workspace"));
      if (!restored) {
        ctx.logger.error("没有找到备份文件");
        return;
      }
      setActivePersonaId(null);
      ctx.logger.info("✅ 已恢复原始人格文件");
    });

  persona
    .command("current")
    .description("显示当前激活的人格")
    .action(() => {
      const activeId = getActivePersonaId();
      if (!activeId) {
        ctx.logger.info("当前没有激活的人格面具（使用默认配置）");
        return;
      }
      const stored = getPersona(activeId);
      if (!stored) {
        ctx.logger.warn(`当前激活: ${activeId}（但人格数据已丢失）`);
        return;
      }
      ctx.logger.info(`当前人格: ${stored.preset.name} (${activeId}) ${stored.preset.identity.emoji}`);
    });

  persona
    .command("export")
    .argument("<file>", "导出文件路径")
    .description("导出人格数据")
    .action((file: unknown) => {
      const store = exportStore();
      writeFileSync(file as string, JSON.stringify(store, null, 2), "utf-8");
      ctx.logger.info(`✅ 已导出到 ${file}`);
    });

  persona
    .command("import")
    .argument("<file>", "导入文件路径")
    .description("导入人格数据")
    .action((file: unknown) => {
      try {
        const raw = readFileSync(file as string, "utf-8");
        const data = JSON.parse(raw) as PersonaStore;
        importStore(data);
        ctx.logger.info(`✅ 已导入人格数据`);
      } catch (err) {
        ctx.logger.error(`导入失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
}
