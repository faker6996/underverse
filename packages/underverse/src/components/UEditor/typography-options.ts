import type {
  UEditorFontFamilyOption,
  UEditorFontSizeOption,
  UEditorLetterSpacingOption,
  UEditorLineHeightOption,
} from "./types";

export function normalizeStyleValue(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "") : "";
}

export function getDefaultFontFamilies(t: (key: string) => string): UEditorFontFamilyOption[] {
  return [
    { label: "Inter", value: '"Inter", "Noto Sans", "Noto Sans CJK KR", "Noto Sans CJK JP", "Segoe UI", sans-serif' },
    { label: "굴림", value: '"Gulim", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif' },
    { label: "굴림체", value: '"GulimChe", "Gulim", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif' },
    { label: "궁서", value: '"Gungsuh", "Nanum Myeongjo", serif' },
    { label: "궁서체", value: '"GungsuhChe", "Gungsuh", "Nanum Myeongjo", serif' },
    { label: "돋움", value: '"Dotum", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif' },
    { label: "돋움체", value: '"DotumChe", "Dotum", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif' },
    { label: "바탕", value: '"Batang", "Nanum Myeongjo", serif' },
    { label: "바탕체", value: '"BatangChe", "Batang", "Nanum Myeongjo", serif' },
    { label: "맑은고딕", value: '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif' },
    { label: "나눔명조", value: '"Nanum Myeongjo", "Batang", serif' },
    { label: "System UI", value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { label: "Roboto", value: '"Roboto", "Noto Sans", "Apple SD Gothic Neo", "Hiragino Kaku Gothic ProN", sans-serif' },
    { label: "Lexend", value: '"Lexend", "Be Vietnam Pro", "Segoe UI", sans-serif' },
    { label: "Montserrat", value: '"Montserrat", "Segoe UI", sans-serif' },
    { label: "Lora", value: '"Lora", "Georgia", "Times New Roman", "Nanum Myeongjo", "BIZ UDPMincho", serif' },
    { label: "Playfair Display", value: '"Playfair Display", "Times New Roman", "Nanum Myeongjo", serif' },
    { label: "Georgia", value: 'Georgia, "Nanum Myeongjo", "Batang", "Times New Roman", serif' },
    { label: "Times New Roman", value: '"Times New Roman", Times, "BIZ UDPMincho", serif' },
    { label: "Meiryo (JA)", value: '"Meiryo", "Hiragino Sans", "Noto Sans JP", sans-serif' },
    { label: "Apple SD Gothic Neo (KO)", value: '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif' },
    { label: "JetBrains Mono", value: '"JetBrains Mono", "Fira Code", "SFMono-Regular", Consolas, "Noto Sans Mono CJK KR", "Noto Sans Mono CJK JP", monospace' },
  ];
}

export function getDefaultFontSizes(): UEditorFontSizeOption[] {
  return [
    { label: "8", value: "8px" },
    { label: "9", value: "9px" },
    { label: "10", value: "10px" },
    { label: "11", value: "11px" },
    { label: "12", value: "12px" },
    { label: "13", value: "13px" },
    { label: "14", value: "14px" },
    { label: "15", value: "15px" },
    { label: "16", value: "16px" },
    { label: "17", value: "17px" },
    { label: "18", value: "18px" },
    { label: "19", value: "19px" },
    { label: "20", value: "20px" },
    { label: "21", value: "21px" },
    { label: "22", value: "22px" },
    { label: "23", value: "23px" },
    { label: "24", value: "24px" },
    { label: "25", value: "25px" },
    { label: "26", value: "26px" },
    { label: "27", value: "27px" },
    { label: "28", value: "28px" },
    { label: "36", value: "36px" },
    { label: "48", value: "48px" },
    { label: "72", value: "72px" },
    { label: "96", value: "96px" },
  ];
}

export function getDefaultLineHeights(): UEditorLineHeightOption[] {
  return [
    { label: "1.2", value: "1.2" },
    { label: "1.5", value: "1.5" },
    { label: "1.75", value: "1.75" },
    { label: "2", value: "2" },
  ];
}

export function getDefaultLetterSpacings(): UEditorLetterSpacingOption[] {
  return [
    { label: "-0.02em", value: "-0.02em" },
    { label: "0", value: "0" },
    { label: "0.02em", value: "0.02em" },
    { label: "0.05em", value: "0.05em" },
    { label: "0.08em", value: "0.08em" },
  ];
}
