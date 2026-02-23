import type { PersonaPreset } from "./types.js";

export type PersonaLanguage = "zh" | "en";

const CJK_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/u;
const LATIN_RE = /[A-Za-z]/;
const COMMAND_WORDS = new Set([
  "persona",
  "list",
  "ls",
  "show",
  "info",
  "switch",
  "use",
  "generate",
  "gen",
  "create",
  "random",
  "rand",
  "keywords",
  "kw",
  "delete",
  "rm",
  "restore",
  "reset",
  "current",
  "help",
]);

const ZH_PRESET_DESCRIPTIONS: Record<string, string> = {
  arsene: "「愚者」— 反叛的幻影怪盗，用优雅与胆识偷走坏代码",
  zorro: "「魔術師」— 机敏的蒙面策士，总能变出恰到好处的解法",
  johanna: "「女教皇」— 镀铬战术先知，以严密分析构建系统",
  carmen: "「恋愛」— 热烈的体验主义者，让功能与美感并存",
  goemon: "「皇帝」— 审美至上的工艺武士，把代码雕成作品",
  necronomicon: "「隠者」— 终端隐者与数据奇才，善于洞察全局信号",
  milady: "「正義」— 优雅而锋利的审查者，礼貌中带着精确判断",
  orpheus: "「愚者」— 忧郁的乐师，将复杂模块调和成有序协奏",
  izanagi: "「愚者」— 雷霆般的真相猎手，专注追查问题根因",
  thanatos: "「死神」— 终结腐朽架构并推动重生的重构执行者",
  pirate: "战車风格的海盗船长，在代码海域劈波斩浪",
  professor: "法王风格的学院派导师，把工程实践当成严谨研究",
  "zen-monk": "節制风格的禅修大师，偏爱克制而优雅的实现",
  cyberpunk: "塔风格的地下黑客，擅长在混沌中迅速破局",
  butler: "星风格的维多利亚管家，追求体面、稳健与高质量交付",
};

const ZH_KEYWORD_DESCRIPTIONS: Record<string, string> = {
  rebel: "愚者 — 反叛者、挑战者、打破常规",
  sage: "女教皇 — 智者、导师、洞察一切",
  shadow: "月 — 暗影、探秘者、揭示隐藏真相",
  knight: "正義 — 骑士、守护者、捍卫代码质量",
  trickster: "魔術師 — 魔术师、万能手、灵活多变",
  oracle: "隠者 — 预言者、数据驱动、洞察趋势",
  phantom: "死神 — 幽灵、重构者、消灭死代码",
};

const EN_KEYWORD_DESCRIPTIONS: Record<string, string> = {
  rebel: "The Fool - rebel, challenger, convention breaker",
  sage: "The Priestess - mentor, analyst, deep insight",
  shadow: "The Moon - explorer of hidden truths",
  knight: "Justice - guardian, quality defender",
  trickster: "The Magician - versatile problem solver",
  oracle: "The Hermit - data-driven strategist",
  phantom: "Death - refactorer, legacy slayer",
};

export function languageFromLocaleHint(hint?: string): PersonaLanguage | undefined {
  if (!hint) return undefined;
  const normalized = hint.toLowerCase();

  if (normalized === "zh" || normalized.startsWith("zh-") || normalized.startsWith("zh_")) {
    return "zh";
  }
  if (normalized === "en" || normalized.startsWith("en-") || normalized.startsWith("en_")) {
    return "en";
  }
  return undefined;
}

export function detectUserLanguage(
  inputs: Array<string | undefined>,
  fallback: PersonaLanguage = "zh",
): PersonaLanguage {
  for (const input of inputs) {
    const locale = languageFromLocaleHint(input);
    if (locale) return locale;
  }

  for (const input of inputs) {
    if (!input) continue;
    if (CJK_RE.test(input)) return "zh";
  }

  for (const input of inputs) {
    if (!input) continue;
    if (isLikelyCommandText(input)) continue;
    if (LATIN_RE.test(input)) return "en";
  }

  return fallback;
}

function isLikelyCommandText(input: string): boolean {
  const tokens = input
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^\/+/, "").toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0 || tokens.length > 3) return false;

  const hasCommandWord = tokens.some((token) => COMMAND_WORDS.has(token));
  if (!hasCommandWord) return false;

  return tokens.every((token) => COMMAND_WORDS.has(token) || /^[a-z0-9-]+$/.test(token));
}

export function getLocalizedDescription(preset: PersonaPreset, language: PersonaLanguage): string {
  if (language === "zh") {
    return ZH_PRESET_DESCRIPTIONS[preset.id] ?? preset.description;
  }
  return preset.description;
}

export function getKeywordDescription(keyword: string, language: PersonaLanguage): string {
  const key = keyword.toLowerCase();
  if (language === "zh") {
    return ZH_KEYWORD_DESCRIPTIONS[key] ?? `自定义关键字：${keyword}`;
  }
  return EN_KEYWORD_DESCRIPTIONS[key] ?? `Custom keyword: ${keyword}`;
}

export function localizeRandomDescription(
  keyword: string,
  arcana: string,
  vibe: string,
  language: PersonaLanguage,
): string {
  if (language === "zh") {
    return `「${arcana}」— 由关键字「${keyword}」唤醒的人格`;
  }
  return `「${arcana}」— ${vibe}`;
}
