# 人格面具 (Persona Mask)

OpenClaw 插件 — 通过简单的提示词生成丰富的 agent 人格描述，并随时通过命令切换。灵感来自女神异闻录 (Persona) 的面具与阿尔卡纳系统。

## 功能

- **一键生成人格** — 输入简单提示词，自动生成完整的 `AGENTS.md`、`SOUL.md`、`IDENTITY.md`
- **即时切换** — 通过聊天命令或 CLI 随时在不同人格之间切换
- **15 个内置预设** — 灵感来自女神异闻录的阿尔卡纳面具系统，开箱即用
- **关键字随机生成** — 输入一个单词（如 `rebel`、`sage`）即可随机生成主题人格
- **自定义人格** — 从提示词创建属于你的独特人格
- **安全备份** — 切换前自动备份原始文件，随时可恢复
- **导入/导出** — 支持人格数据的导入导出

## 内置人格

### Persona 面具系列

| ID | 名称 | 阿尔卡纳 | 描述 |
|---|---|---|---|
| `arsene` | Arsene | 愚者 | 优雅的幻影窃贼，以戏剧性的方式揭露代码中的真相 |
| `zorro` | Zorro | 魔術師 | 正义的蒙面剑客，用敏捷的技术斩断代码中的不公 |
| `johanna` | Johanna | 女教皇 | 高速疾驰的知识骑士，以分析力穿透复杂问题 |
| `carmen` | Carmen | 恋愛 | 热情奔放的火焰舞者，以创造力点燃代码的生命力 |
| `goemon` | Goemon | 皇帝 | 优雅的歌舞伎武士，以绝对的秩序统治代码架构 |
| `necronomicon` | Necronomicon | 隠者 | 全知全能的数据触手体，以无穷的分析力解读代码奥秘 |
| `milady` | Milady | 女帝 | 冰冷优雅的贵族间谍，以精密的策略掌控代码全局 |
| `orpheus` | Orpheus | 愚者 | 永恒的诗人乐师，以音乐般的节奏编织优雅代码 |
| `izanagi` | Izanagi | 愚者 | 创世之神的化身，以雷霆之力开辟全新的代码世界 |
| `thanatos` | Thanatos | 死神 | 终结与重生的化身，以绝对的力量清除一切腐朽代码 |

### 经典系列

| ID | 名称 | 阿尔卡纳 | 描述 |
|---|---|---|---|
| `pirate` | Captain Blackclaw | 戦車 | 在代码海洋上航行的海盗船长 |
| `professor` | Professor Syntax | 法王 | 将代码视为学术研究的严谨教授 |
| `zen-monk` | Master Void | 節制 | 追求极简优雅代码的禅宗大师 |
| `cyberpunk` | Neon | 塔 | 来自数字地下世界的赛博朋克黑客 |
| `butler` | Reginald | 星 | 提供无可挑剔代码服务的维多利亚管家 |

## 关键字快速生成

输入一个关键字即可随机生成主题人格，每次生成的名称、外观、性格都不同:

| 关键字 | 阿尔卡纳 | 主题风格 |
|---|---|---|
| `rebel` | 愚者 (The Fool) | 反叛者、挑战者、打破常规 |
| `sage` | 女教皇 (The Priestess) | 智者、导师、洞察一切 |
| `shadow` | 月 (The Moon) | 暗影、探秘者、揭示隐藏真相 |
| `knight` | 正義 (Justice) | 骑士、守护者、捍卫代码质量 |
| `trickster` | 魔術師 (The Magician) | 魔术师、万能手、灵活多变 |
| `oracle` | 隠者 (The Hermit) | 预言者、数据驱动、洞察趋势 |
| `phantom` | 死神 (Death) | 幽灵、重构者、消灭死代码 |

## 安装

```bash
# 从 npm 安装
openclaw plugins install persona-mask

# 或从 GitHub 安装
openclaw plugins install https://github.com/occcat/persona-mask

# 本地开发安装
openclaw plugins install -l ./path/to/persona-mask
```

## 使用

### 聊天命令

在任何 OpenClaw 支持的消息通道中使用:

```
/persona list                              # 列出所有可用人格（含阿尔卡纳标识）
/persona show <id>                         # 查看人格详情
/persona switch <id>                       # 切换到指定人格
/persona generate <id> <name> <prompt>     # 从提示词生成新人格
/persona random <keyword>                  # 从关键字随机生成人格
/persona keywords                          # 列出所有可用关键字
/persona delete <id>                       # 删除自定义人格
/persona restore                           # 恢复切换前的原始文件
/persona current                           # 查看当前激活的人格
```

### CLI 命令

```bash
openclaw persona list
openclaw persona show arsene
openclaw persona switch thanatos
openclaw persona generate my-robot Robot "一个友好的机器人助手，说话简洁高效"
openclaw persona random rebel            # 随机生成一个「愚者」主题人格
openclaw persona random sage             # 随机生成一个「女教皇」主题人格
openclaw persona keywords                # 列出所有可用关键字
openclaw persona delete my-robot
openclaw persona restore
openclaw persona current
openclaw persona export personas.json
openclaw persona import personas.json
```

### 快速上手

```bash
# 查看所有 15 个内置人格
openclaw persona list

# 切换到 Arsene（愚者面具）
openclaw persona switch arsene

# 用关键字随机生成人格
openclaw persona random rebel
# ✅ 已随机生成人格 Phantom (rebel-a3f2k9) 「愚者 (The Fool)」

# 切换到随机生成的人格
openclaw persona switch rebel-a3f2k9

# 从提示词生成自定义人格
openclaw persona generate cat-girl Neko "一只可爱的猫娘程序员，喜欢用喵语气说话"

# 恢复原始配置
openclaw persona restore
```

## 工作原理

人格切换的核心机制是更新工作目录下的三个文件:

- **IDENTITY.md** — agent 身份信息（名称、物种、性格、表情、阿尔卡纳）
- **SOUL.md** — agent 灵魂定义（核心信念、边界、语气风格）
- **AGENTS.md** — agent 行为指南（首次运行、每次会话、记忆、安全）

OpenClaw 的系统提示词会自动读取这些文件来塑造 agent 的行为和人格。切换人格时，原始文件会自动备份到 `.persona-backup/` 目录。

### 阿尔卡纳系统

每个内置人格和关键字生成的人格都对应一个女神异闻录中的阿尔卡纳（塔罗牌大阿尔卡纳），这不仅是装饰性的标识，更反映了人格的核心特质和行为模式。

## 数据存储

- 自定义人格存储在 `~/.openclaw/persona-mask/personas.json`
- 切换备份存储在工作目录的 `.persona-backup/`

## 许可证

MIT
