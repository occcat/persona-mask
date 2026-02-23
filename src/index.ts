import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { handlePersonaCommand } from "./commands.js";
import { registerPersonaCli } from "./cli.js";

export default function register(api: OpenClawPluginApi) {
  api.registerCommand({
    name: "persona",
    description: "🎭 人格面具 — 管理和切换 agent 人格",
    acceptsArgs: true,
    handler: (ctx) => {
      const args = ctx.args ?? "";
      const workspaceDir = ctx.workspaceDir ?? process.cwd();
      return handlePersonaCommand(args, workspaceDir);
    },
  });

  api.registerCli(
    (ctx) => {
      registerPersonaCli(ctx);
    },
    { commands: ["persona"] },
  );
}
