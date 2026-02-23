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
  arsene: "「愚者」— 不走寻常路的自由灵魂，用优雅和胆识活出自己的精彩",
  zorro: "「魔術師」— 万能型选手，无论聊什么话题都能接得住还能给你惊喜",
  johanna: "「女教皇」— 冷静的策划者，是你身边最靠谱的那个朋友",
  carmen: "「恋愛」— 热情如火的美学家，相信生活的每个角落都值得被用心对待",
  goemon: "「皇帝」— 为美而生的完美主义者，连摆盘都能花两小时的艺术家",
  necronomicon: "「隠者」— 宅家达人和冷知识百科，凌晨三点还在研究UFO的那种人",
  milady: "「正義」— 温柔又通透的知心姐姐，说话好听但句句戳到点上",
  orpheus: "「愚者」— 忧郁的文艺青年，凌晨两点会给你发一首歌的那个人",
  izanagi: "「愚者」— 直来直去的真相守护者，永远说你需要听的而不是你想听的",
  thanatos: "「死神」— 帮你断舍离的狠角色，推你走出舒适区拥抱新生活",
  pirate: "战車风格的豪爽冒险家，把每天都活成一场探险",
  professor: "法王风格的百科全书型朋友，能把任何知识讲得有趣",
  "zen-monk": "節制风格的佛系达人，帮你在忙碌中找到内心的平静",
  cyberpunk: "塔风格的夜行动物，永远知道最酷的地下音乐和隐藏酒吧",
  butler: "星风格的英伦绅士管家，记得你咖啡怎么喝、围巾怎么搭",
};

const ZH_KEYWORD_DESCRIPTIONS: Record<string, string> = {
  rebel: "愚者 — 自由灵魂、冒险家、不走寻常路",
  sage: "女教皇 — 智者、人生导师、看透一切",
  shadow: "月 — 神秘人、深度思考者、洞察人心",
  knight: "正義 — 守护者、靠谱朋友、正义感爆棚",
  trickster: "魔術師 — 开心果、百变达人、什么都懂一点",
  oracle: "隠者 — 观察者、直觉型、看人很准",
  phantom: "死神 — 蜕变者、断舍离达人、推你向前",
};

const EN_KEYWORD_DESCRIPTIONS: Record<string, string> = {
  rebel: "The Fool — free spirit, adventurer, unconventional",
  sage: "The Priestess — wise friend, life advisor, sees the big picture",
  shadow: "The Moon — mysterious, deep thinker, reads between the lines",
  knight: "Justice — loyal protector, reliable, stands for what's right",
  trickster: "The Magician — life of the party, versatile, knows a bit of everything",
  oracle: "The Hermit — observant, intuitive, reads people well",
  phantom: "Death — agent of change, helps you let go and move forward",
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
