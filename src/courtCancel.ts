import Papa from "papaparse";

/** 予約表CSVの1行（日付 × コート面） */
export type RowData = {
  日付: string;
  曜日: string;
  コート: string;
  "9-11": string;
  "11-13": string;
  "13-15": string;
  "15-17": string;
  備考: string;
};

/** DBに登録された1件のキャンセル（日付 × コート面 × 時間帯） */
export type Cancellation = {
  court_type: string;
  year_month: string;
  date_label: string;
  court: string;
  time_slot: string;
  reason: string;
  canceller: string;
  cancelled_at: string;
};

/** 予約表の時間帯。api/slots.php と一致させること */
export const TIME_SLOTS = ["9-11", "11-13", "13-15", "15-17"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const COURT_TYPES = [
  { label: "大沼", value: "Onuma" },
  { label: "立沼", value: "Tatenuma" },
] as const;
export type CourtType = (typeof COURT_TYPES)[number]["value"];

export function courtTypeLabel(courtType: string) {
  return COURT_TYPES.find((c) => c.value === courtType)?.label ?? courtType;
}

/** キャンセル対象の1枠 */
export type CancelTarget = {
  courtType: CourtType;
  month: string;
  dateLabel: string;
  dayOfWeek: string;
  court: string;
  timeSlot: TimeSlot;
};

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getPrevMonth(yyyymm: string) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const prev = m === 1 ? [y - 1, 12] : [y, m - 1];
  return `${prev[0]}${String(prev[1]).padStart(2, "0")}`;
}

export function getNextMonth(yyyymm: string) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  return `${next[0]}${String(next[1]).padStart(2, "0")}`;
}

/** 本日の日付ラベル。CSVの「日付」列（例: 6月7日）と同じ形式 */
export function getTodayLabel(now: Date = new Date()) {
  return `${now.getMonth() + 1}月${now.getDate()}日`;
}

/** キャンセルを一意に識別するキー */
export function cancelKey(
  courtType: string,
  dateLabel: string,
  court: string,
  timeSlot: string
) {
  return `${courtType}|${dateLabel}|${court}|${timeSlot}`;
}

/** その枠がクラブで使える（＝キャンセルしうる）かどうか */
export function isUsableSlot(mark: string | undefined) {
  const value = (mark ?? "").trim();
  return value !== "" && value !== "×" && value !== "x" && value !== "X";
}

/** 月別の予約表CSVを読み込む。存在しない月は空配列 */
export async function fetchCourtRows(
  courtType: CourtType,
  month: string
): Promise<RowData[]> {
  const response = await fetch(`/courts/${courtType}/${month}.csv`);
  if (!response.ok) return [];
  const csvText = await response.text();
  return new Promise((resolve) => {
    Papa.parse<RowData>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => resolve(data),
    });
  });
}

/** キャンセル一覧を取得し、cancelKey をキーにしたマップで返す */
export async function fetchCancellations(params: {
  courtType?: CourtType;
  month?: string;
  dateLabel?: string;
}): Promise<Record<string, Cancellation>> {
  const query = new URLSearchParams();
  if (params.courtType) query.set("court_type", params.courtType);
  if (params.month) query.set("year_month", params.month);
  if (params.dateLabel) query.set("date_label", params.dateLabel);

  try {
    const res = await fetch(`/api/cancellations.php?${query.toString()}`);
    if (!res.ok) return {};
    const data = await res.json();
    if (!data?.success) return {};
    const map: Record<string, Cancellation> = {};
    (data.cancellations as Cancellation[]).forEach((c) => {
      map[cancelKey(c.court_type, c.date_label, c.court, c.time_slot)] = c;
    });
    return map;
  } catch {
    return {};
  }
}

type ApiResult = { success: boolean; message?: string };

async function postJson(url: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) return { success: true };
    return { success: false, message: data?.message ?? "処理に失敗しました" };
  } catch {
    return { success: false, message: "通信エラーが発生しました" };
  }
}

/** 1枠をキャンセルする */
export function postCancel(input: {
  target: CancelTarget;
  password: string;
  canceller: string;
  reason: string;
}) {
  const { target } = input;
  return postJson("/api/cancel.php", {
    password: input.password,
    court_type: target.courtType,
    year_month: target.month,
    date_label: target.dateLabel,
    court: target.court,
    time_slot: target.timeSlot,
    reason: input.reason,
    canceller: input.canceller,
  });
}

/** キャンセルを取り消して予約を復活させる */
export function postUncancel(input: {
  target: CancelTarget;
  password: string;
}) {
  const { target } = input;
  return postJson("/api/uncancel.php", {
    password: input.password,
    court_type: target.courtType,
    year_month: target.month,
    date_label: target.dateLabel,
    court: target.court,
    time_slot: target.timeSlot,
  });
}
