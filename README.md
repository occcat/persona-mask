# 人格面具 (Persona Mask)

OpenClaw 插件 — 通过简单的提示词生成丰富的 agent 人格描述，并随时通过命令切换。

## 功能

- **一键生成人格** — 输入简单提示词，自动生成完整的 `AGENTS.md`、`SOUL.md`、`IDENTITY.md`
- **即时切换** — 通过聊天命令或 CLI 随时在不同人格之间切换
- **内置预设** — 5 个精心设计的人格预设，开箱即用
- **自定义人格** — 从提示词创建属于你的独特人格
- **安全备份** — 切换前自动备份原始文件，随时可恢复
- **导入/导出** — 支持人格数据的导入导出

## 内置人格

| ID | 名称 | 描述 |
|---|---|---|
| `pirate` | Captain Blackclaw | 在代码海洋上航行的海盗船长 |
| `professor` | Professor Syntax | 将代码视为学术研究的严谨教授 |
| `zen-monk` | Master Void | 追求极简优雅代码的禅宗大师 |
| `cyberpunk` | Neon | 来自数字地下世界的赛博朋克黑客 |
| `butler` | Reginald | 提供无可挑剔代码服务的维多利亚管家 |

## 安装

将本插件放置到 OpenClaw 的 `extensions/` 目录下：

```bash
cd /path/to/openclaw/extensions
git clone https://github.com/occcat/persona-mask.git
```

## 使用

### 聊天命令

在任何 OpenClaw 支持的消息通道中使用：

```
/persona list                              # 列出所有可用人格
/persona show <id>                         # 查看人格详情
/persona switch <id>                       # 切换到指定人格
/persona generate <id> <name> <prompt>     # 从提示词生成新人格
/persona delete <id>                       # 删除自定义人格
/persona restore                           # 恢复切换前的原始文件
/persona current                           # 查看当前激活的人格
```

### CLI 命令

```bash
openclaw persona list
openclaw persona show pirate
openclaw persona switch zen-monk
openclaw persona generate my-robot Robot "一个友好的机器人助手，说话简洁高效"
openclaw persona delete my-robot
openclaw persona restore
openclaw persona current
openclaw persona export personas.json
openclaw persona import personas.json
```

### 快速上手

```bash
# 查看内置人格
openclaw persona list

# 切换到海盗船长
openclaw persona switch pirate

# 从提示词生成自定义人格
openclaw persona generate cat-girl Neko "一只可爱的猫娘程序员，喜欢用喵语气说话"

# 切换到自定义人格
openclaw persona switch cat-girl

# 恢复原始配置
openclaw persona restore
```

## 工作原理

人格切换的核心机制是更新工作目录下的三个文件：

- **IDENTITY.md** — agent 身份信息（名称、物种、性格、表情）
- **SOUL.md** — agent 灵魂定义（核心信念、边界、语气风格）
- **AGENTS.md** — agent 行为指南（首次运行、每次会话、记忆、安全）

OpenClaw 的系统提示词会自动读取这些文件来塑造 agent 的行为和人格。切换人格时，原始文件会自动备份到 `.persona-backup/` 目录。

## 数据存储

- 自定义人格存储在 `~/.openclaw/persona-mask/personas.json`
- 切换备份存储在工作目录的 `.persona-backup/`

## 许可证

MIT
