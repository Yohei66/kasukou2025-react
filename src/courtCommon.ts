/** コート予約状況（本日／月別）で共有する型と定数 */

export const SLOT_LABELS = ["9-11", "11-13", "13-15", "15-17"] as const;

export type SlotKey = (typeof SLOT_LABELS)[number];

export const CANCEL_REASONS = [
  { key: "rain", label: "☔ 雨" },
  { key: "heat", label: "🥵 熱中症警戒" },
  { key: "thunder", label: "⚡ 雷" },
  { key: "wind", label: "💨 強風" },
  { key: "other", label: "✏️ その他" },
];

export const reasonLabel = (key: string) =>
  CANCEL_REASONS.find((r) => r.key === key)?.label ?? key;

export type CancelEntry = {
  reason: string;
  name: string;
  comment: string;
  at: string;
};

/** cancel.php?month= の戻り値。日付 → 場所 → 面 → 時間帯 の順に引ける */
export type CancelMap = Record<
  string,
  Record<string, Record<string, Record<string, CancelEntry>>>
>;

export type CourtRow = {
  name: string;
  slots: string[];
  cancels: (CancelEntry | null)[];
};

export type Location = {
  key: string;
  label: string;
  found: boolean;
  note: string;
  courts: CourtRow[];
};

export type TodayResponse = {
  ok: boolean;
  date: string;
  day_of_week: string;
  locations: Location[];
};

/** クリックされた1マスを指す情報 */
export type SlotTarget = {
  date: string;
  locationKey: string;
  locationLabel: string;
  courtName: string;
  slot: number;
};

/** 〇 と D は確保済み。× や空欄は未確保 */
export const isHeld = (value: string) => {
  const v = value.trim();
  return v === "〇" || v === "○" || v === "D" || v === "Ｄ";
};

/** 中止の内容をひとことで説明する（ツールチップ用） */
export const cancelSummary = (entry: CancelEntry) =>
  [
    `中止（${reasonLabel(entry.reason)}）`,
    `キャンセル者: ${entry.name}`,
    entry.comment && `ひとこと: ${entry.comment}`,
    `登録: ${entry.at}`,
  ]
    .filter(Boolean)
    .join(" / ");
