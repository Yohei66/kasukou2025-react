import { useCallback, useEffect, useState } from "react";

const SLOTS = ["9-11", "11-13", "13-15", "15-17"];
const DOW = ["日", "月", "火", "水", "木", "金", "土"];
// クリックでこの順に切り替える。〇=確保 / ×=未確保 / D=Dコート確保
const STATES = ["〇", "×", "D"];

const COURTS = [
  { value: "Onuma", label: "大沼", location: "onuma" },
  { value: "Tatenuma", label: "立沼", location: "tatenuma" },
];

/** courts_list.php の1行（A面 or B面） */
type ApiRow = {
  日付: string;
  曜日: string;
  コート: string;
  "9-11": string;
  "11-13": string;
  "13-15": string;
  "15-17": string;
  備考: string;
};

/** 編集用の1日ぶん（A面・B面をまとめて持つ） */
type DayModel = {
  day: number;
  dow: string;
  a: string[];
  b: string[];
  memo: string;
};

const isHeld = (v: string) => v === "〇" || v === "○";
const isNone = (v: string) => v === "×" || v === "x" || v === "X";

/** 日ごとの基準値を day 番号で引ける Map にする */
const toBaseline = (days: DayModel[]) =>
  new Map(days.map((d) => [d.day, structuredClone(d)]));

const slotColor = (v: string) =>
  isHeld(v) ? "#1a7f1a" : isNone(v) ? "#c0392b" : "#8a6d00";

const dayOfWeek = (year: number, month: number, day: number) =>
  DOW[new Date(year, month - 1, day).getDay()];

const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

/** "YYYY-MM-DD" または旧形式から日を取り出す */
const dayNumber = (dateStr: string) => {
  const m = /(\d{1,2})$/.exec(dateStr.replace(/日$/, ""));
  return m ? Number(m[1]) : 0;
};

/** courts_list.php の行（A/B別）を、1日1件の編集モデルにまとめる */
const rowsToModel = (rows: ApiRow[]): DayModel[] => {
  const byDate = new Map<string, DayModel>();
  for (const r of rows) {
    const key = r["日付"];
    if (!byDate.has(key)) {
      byDate.set(key, {
        day: dayNumber(r["日付"]),
        dow: r["曜日"],
        a: ["×", "×", "×", "×"],
        b: ["×", "×", "×", "×"],
        memo: r["備考"] ?? "",
      });
    }
    const model = byDate.get(key)!;
    const slots = SLOTS.map((s) => r[s as keyof ApiRow] as string);
    if (r["コート"] === "A") model.a = slots;
    else if (r["コート"] === "B") model.b = slots;
    if (r["備考"]) model.memo = r["備考"];
  }
  return [...byDate.values()].sort((x, y) => x.day - y.day);
};

type Props = {
  /** 保存が成功したら呼ばれる（一覧の再読込などに使う） */
  onSaved?: () => void;
};

const now = new Date();

const CourtEditor = ({ onSaved }: Props) => {
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [court, setCourt] = useState("Onuma");

  const [model, setModel] = useState<DayModel[] | null>(null);
  // 読み込み（または保存）した時点の基準値。編集済みセルの判定に使う
  const [baseline, setBaseline] = useState<Map<number, DayModel>>(new Map());
  const [loadedLabel, setLoadedLabel] = useState("");
  const [newDay, setNewDay] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  // 読み込み後に編集されたか。未保存のまま切り替えようとしたら警告する
  const [dirty, setDirty] = useState(false);

  const y = Number(year);
  const m = Number(month);
  const courtInfo = COURTS.find((c) => c.value === court)!;

  const load = useCallback(async () => {
    setMessage("");
    setModel(null);
    setDirty(false);
    if (!y || !m) {
      setMessage("年と月を入力してください。");
      return;
    }
    const ym = `${y}${String(m).padStart(2, "0")}`;
    try {
      const res = await fetch(
        `/api/courts_list.php?court_type=${court}&year_month=${ym}`
      );
      const rows: ApiRow[] = await res.json();
      const loaded = rowsToModel(rows);
      setModel(loaded);
      setBaseline(toBaseline(loaded));
      setLoadedLabel(`${y}年${m}月 / ${courtInfo.label}コート`);
      if (rows.length === 0) {
        setMessage("この月のデータはありません。日付を追加して作成できます。");
      }
    } catch {
      setMessage("読み込みに失敗しました。");
    }
  }, [y, m, court, courtInfo.label]);

  // 年・月・コートが変わったら自動で読み込む。「読み込む」ボタンは不要。
  useEffect(() => {
    void load();
  }, [load]);

  /**
   * セレクタ変更の前に、未保存の変更を確認する。
   * 破棄が選ばれたら dirty を下ろしてから値を変える（表とセレクタがずれないように）。
   * OKなら変更しない（戻り値で呼び出し側が中断する）。
   */
  const guardChange = () => {
    if (!dirty) return true;
    if (
      window.confirm("保存していない変更があります。破棄して切り替えますか？")
    ) {
      setDirty(false);
      return true;
    }
    return false;
  };

  const cycleSlot = (dayIndex: number, side: "a" | "b", slot: number) => {
    setDirty(true);
    setModel((prev) => {
      if (!prev) return prev;
      return prev.map((d, i) => {
        if (i !== dayIndex) return d;
        const arr = [...d[side]];
        const cur = STATES.indexOf(arr[slot]); // 未知の値は -1 → 次は STATES[0]
        arr[slot] = STATES[(cur + 1) % STATES.length];
        return { ...d, [side]: arr };
      });
    });
  };

  const setMemo = (dayIndex: number, memo: string) => {
    setDirty(true);
    setModel((prev) =>
      prev ? prev.map((d, i) => (i === dayIndex ? { ...d, memo } : d)) : prev
    );
  };

  const addDay = () => {
    const day = Number(newDay);
    if (!model) return;
    if (!day || day < 1 || day > daysInMonth(y, m)) {
      setMessage(`1〜${daysInMonth(y, m)}の日付を入力してください。`);
      return;
    }
    if (model.some((d) => d.day === day)) {
      setMessage(`${day}日はすでにあります。`);
      return;
    }
    setMessage("");
    setDirty(true);
    setModel(
      [
        ...model,
        {
          day,
          dow: dayOfWeek(y, m, day),
          a: ["×", "×", "×", "×"],
          b: ["×", "×", "×", "×"],
          memo: "",
        },
      ].sort((x, z) => x.day - z.day)
    );
    setNewDay("");
  };

  const removeDay = (dayIndex: number) => {
    setDirty(true);
    setModel((prev) => (prev ? prev.filter((_, i) => i !== dayIndex) : prev));
  };

  const save = async () => {
    if (!model) return;
    setSaving(true);
    setMessage("保存中…");
    try {
      const res = await fetch("/api/courts_import.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // courts_import.php と同じ形式（月まるごと洗い替え）
        body: JSON.stringify({
          year: y,
          month: m,
          location: courtInfo.location,
          days: model.map((d) => ({
            day: d.day,
            dow: d.dow,
            a: d.a,
            b: d.b,
            memo: d.memo,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setMessage(`保存しました（${json.days}日分）。`);
        setDirty(false);
        // 保存後は現在値を新しい基準にする → ハイライトが消える
        setBaseline(toBaseline(model));
        onSaved?.();
      } else {
        setMessage("保存に失敗しました: " + (json.error ?? ""));
      }
    } catch {
      setMessage("通信エラーが発生しました。");
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={controls}>
        <label>
          年:&nbsp;
          <input
            type="number"
            value={year}
            onChange={(e) => guardChange() && setYear(e.target.value)}
            style={{ width: 80 }}
          />
        </label>
        <label>
          月:&nbsp;
          <select
            value={month}
            onChange={(e) => guardChange() && setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((mm) => (
              <option key={mm} value={mm}>
                {mm}月
              </option>
            ))}
          </select>
        </label>
        <label>
          コート:&nbsp;
          <select
            value={court}
            onChange={(e) => guardChange() && setCourt(e.target.value)}
          >
            {COURTS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        {dirty && (
          <span style={{ fontSize: 13, color: "#c0392b", fontWeight: "bold" }}>
            ● 未保存の変更あり
          </span>
        )}
        {model && (
          <button onClick={save} disabled={saving || !dirty} style={saveBtn}>
            保存（公開ページに反映）
          </button>
        )}
      </div>

      {message && <p style={{ fontSize: 14, color: "#444" }}>{message}</p>}

      {model && (
        <>
          <p style={{ fontSize: 13, color: "#666", margin: "4px 0 12px" }}>
            {loadedLabel} を編集中。各マスをクリックで{" "}
            <span style={{ color: "#1a7f1a", fontWeight: "bold" }}>〇</span> →{" "}
            <span style={{ color: "#c0392b" }}>×</span> →{" "}
            <span style={{ color: "#8a6d00", fontWeight: "bold" }}>D</span>{" "}
            の順に切り替わります。
            <span style={{ background: "#fff6d6", boxShadow: "inset 0 0 0 2px #f1c40f", padding: "0 6px", margin: "0 2px" }}>
              変更したセル
            </span>
            は色が付きます。保存するまでDBには反映されません。
          </p>

          <div style={addBar}>
            <strong>日付を追加：</strong>
            <label>
              {m}月&nbsp;
              <input
                type="number"
                min="1"
                max="31"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                style={{ width: 60 }}
              />
              &nbsp;日
            </label>
            <button onClick={addDay}>＋ 追加</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th rowSpan={2} style={th}>
                    日付
                  </th>
                  <th rowSpan={2} style={th}>
                    曜日
                  </th>
                  <th colSpan={4} style={{ ...th, background: "#eef4ff" }}>
                    A面
                  </th>
                  <th colSpan={4} style={{ ...th, background: "#fff3ea" }}>
                    B面
                  </th>
                  <th rowSpan={2} style={th}>
                    備考
                  </th>
                  <th rowSpan={2} style={th}>
                    操作
                  </th>
                </tr>
                <tr>
                  {SLOTS.map((s) => (
                    <th key={`a-${s}`} style={{ ...th, background: "#eef4ff" }}>
                      {s}
                    </th>
                  ))}
                  {SLOTS.map((s) => (
                    <th key={`b-${s}`} style={{ ...th, background: "#fff3ea" }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {model.map((d, i) => {
                  const dowStyle =
                    d.dow === "日"
                      ? { color: "#c0392b" }
                      : d.dow === "土"
                        ? { color: "#1565c0" }
                        : undefined;
                  // 読み込み時点の同じ日。無い（＝新規追加した日）なら全マス変更扱い
                  const base = baseline.get(d.day);
                  const isNewDay = !base;
                  const changed = (side: "a" | "b", slot: number) =>
                    isNewDay || base![side][slot] !== d[side][slot];
                  const memoChanged = isNewDay || base!.memo !== d.memo;
                  return (
                    <tr key={d.day}>
                      <td style={{ ...td, whiteSpace: "nowrap", ...dowStyle }}>
                        {m}月{d.day}日
                        {isNewDay && (
                          <span style={{ color: "#e67e22", marginLeft: 4 }}>＋</span>
                        )}
                      </td>
                      <td style={{ ...td, ...dowStyle }}>{d.dow}</td>
                      {(["a", "b"] as const).map((side) =>
                        d[side].map((v, slot) => (
                          <td
                            key={`${side}-${slot}`}
                            style={{
                              ...td,
                              ...(changed(side, slot) ? editedCell : null),
                            }}
                          >
                            <button
                              onClick={() => cycleSlot(i, side, slot)}
                              style={{
                                ...slotBtn,
                                color: slotColor(v),
                                fontWeight: isNone(v) ? 400 : 700,
                              }}
                            >
                              {v}
                            </button>
                          </td>
                        ))
                      )}
                      <td style={{ ...td, ...(memoChanged ? editedCell : null) }}>
                        <input
                          value={d.memo}
                          maxLength={100}
                          onChange={(e) => setMemo(i, e.target.value)}
                          style={{ width: 150, padding: 4 }}
                        />
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => {
                            if (confirm(`${m}月${d.day}日 を削除しますか？`))
                              removeDay(i);
                          }}
                          style={delBtn}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {model.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ ...td, color: "#888" }}>
                      日付がありません。上の「日付を追加」から作成してください。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const controls: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  marginBottom: 12,
};
const saveBtn: React.CSSProperties = {
  marginLeft: "auto",
  padding: "8px 16px",
  border: "none",
  borderRadius: 8,
  background: "#0e995a",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};
const addBar: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
  background: "#f7f9f7",
  padding: "10px 14px",
  borderRadius: 8,
  marginBottom: 12,
  fontSize: 14,
};
const tableStyle: React.CSSProperties = {
  borderCollapse: "collapse",
  background: "#fff",
  fontSize: 14,
};
const th: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "4px 8px",
  textAlign: "center",
  background: "#e8efe0",
};
const td: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "3px 6px",
  textAlign: "center",
};
// 読み込み時点から変更されたセルの背景。保存すると基準が更新されて消える
const editedCell: React.CSSProperties = {
  background: "#fff6d6",
  boxShadow: "inset 0 0 0 2px #f1c40f",
};
const slotBtn: React.CSSProperties = {
  width: 36,
  height: 32,
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 16,
};
const delBtn: React.CSSProperties = {
  border: "1px solid #e0b4b4",
  background: "#fff",
  color: "#c0392b",
  borderRadius: 6,
  padding: "3px 8px",
  cursor: "pointer",
};

export default CourtEditor;
