import { join } from "node:path";
import { homedir } from "node:os";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { handlePersonaCommand } from "./commands.js";
import { registerPersonaCli } from "./cli.js";

export default function register(api: OpenClawPluginApi) {
  // Derive workspace dir from config or use default; PluginCommandContext has no workspaceDir
  const workspaceDir =
    (api.config as Record<string, unknown> & { agents?: { defaults?: { workspace?: string } } })
      ?.agents?.defaults?.workspace ?? join(homedir(), ".openclaw", "workspace");

  api.registerCommand({
    name: "persona",
    description: "🎭 人格面具 — 管理和切换 agent 人格",
    acceptsArgs: true,
    handler: (ctx) => {
      const args = ctx.args ?? "";
      return handlePersonaCommand(args, workspaceDir, {
        commandBody: ctx.commandBody,
      });
    },
  });

  api.registerCli(
    (ctx) => {
      registerPersonaCli(ctx);
    },
    { commands: ["persona"] },
  );
}
