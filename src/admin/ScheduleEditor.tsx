import { useEffect, useState } from "react";
import { fetchEvents, type ClubEvent } from "../dataset/content";
import {
  addBar,
  controls,
  delBtn,
  dirtyMark,
  note,
  saveBtn,
  tableStyle,
  td,
  textInput,
  th,
} from "./adminStyles";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

/** 編集中の1行。保存前の行はまだ id を持たない */
type Row = {
  key: string;
  date: string;
  title: string;
  place: string;
};

let keySeq = 0;
const newKey = () => `row-${++keySeq}`;

const toRows = (events: ClubEvent[]): Row[] =>
  events.map((e) => ({
    key: newKey(),
    date: e.date,
    title: e.title,
    place: e.place,
  }));

/** "2026-06-01" の曜日。日付が未入力・不正なら空文字 */
const dowOf = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : DOW[d.getDay()];
};

const byDate = (a: Row, b: Row) => a.date.localeCompare(b.date);

/** 保存前の入力チェック。問題があればメッセージを返す */
const validate = (rows: Row[]) => {
  for (const [i, row] of rows.entries()) {
    if (!dowOf(row.date)) return `${i + 1}行目: 日付を入力してください。`;
    if (!row.title.trim()) return `${i + 1}行目: 行事名を入力してください。`;
  }
  return "";
};

const ScheduleEditor = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setRows(null);
    setDirty(false);
    setMessage("");
    fetchEvents()
      .then((events) => setRows(toRows(events)))
      .catch(() => setMessage("読み込みに失敗しました。"));
  };

  useEffect(load, []);

  const update = (index: number, patch: Partial<Row>) => {
    setDirty(true);
    setRows((prev) =>
      prev ? prev.map((r, i) => (i === index ? { ...r, ...patch } : r)) : prev
    );
  };

  const addRow = () => {
    setDirty(true);
    setMessage("");
    // 直前の行の日付を引き継ぐと、続けて入力するときに打ち直しが減る
    setRows((prev) => [
      ...(prev ?? []),
      { key: newKey(), date: prev?.at(-1)?.date ?? "", title: "", place: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setDirty(true);
    setRows((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  };

  const sortByDate = () => {
    setDirty(true);
    setRows((prev) => (prev ? [...prev].sort(byDate) : prev));
  };

  const save = async () => {
    if (!rows) return;
    const error = validate(rows);
    if (error) {
      setMessage(error);
      return;
    }
    setSaving(true);
    setMessage("保存中…");
    // 公開ページは日付順に出るので、保存時も並べ替えて画面と揃えておく
    const sorted = [...rows].sort(byDate);
    try {
      const res = await fetch("/api/events_save.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: sorted.map((r) => ({
            date: r.date,
            title: r.title.trim(),
            place: r.place.trim(),
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setRows(sorted);
        setDirty(false);
        setMessage(`保存しました（${json.count}件）。`);
      } else {
        setMessage("保存に失敗しました: " + (json.error ?? ""));
      }
    } catch {
      setMessage("通信エラーが発生しました。");
    }
    setSaving(false);
  };

  if (!rows) {
    return <p style={note}>{message || "読み込み中…"}</p>;
  }

  return (
    <div>
      <div style={controls}>
        <button onClick={addRow}>＋ 行事を追加</button>
        <button onClick={sortByDate} disabled={rows.length < 2}>
          日付順に並べ替え
        </button>
        {dirty && <span style={dirtyMark}>● 未保存の変更あり</span>}
        <button onClick={save} disabled={saving || !dirty} style={saveBtn}>
          保存（公開ページに反映）
        </button>
      </div>

      {message && <p style={{ fontSize: 14, color: "#444" }}>{message}</p>}

      <div style={addBar}>
        曜日は日付から自動で決まります。保存すると日付順に並び替えられます。
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...th, width: 170 }}>日付</th>
              <th style={{ ...th, width: 50 }}>曜日</th>
              <th style={th}>行事</th>
              <th style={{ ...th, width: 160 }}>場所</th>
              <th style={{ ...th, width: 70 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const dow = dowOf(row.date);
              return (
                <tr key={row.key}>
                  <td style={td}>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => update(i, { date: e.target.value })}
                      style={textInput}
                    />
                  </td>
                  <td
                    style={{
                      ...td,
                      color:
                        dow === "日"
                          ? "#c0392b"
                          : dow === "土"
                            ? "#1565c0"
                            : undefined,
                    }}
                  >
                    {dow || "－"}
                  </td>
                  <td style={td}>
                    <input
                      value={row.title}
                      maxLength={100}
                      placeholder="例：クラブ対抗戦"
                      onChange={(e) => update(i, { title: e.target.value })}
                      style={textInput}
                    />
                  </td>
                  <td style={td}>
                    <input
                      value={row.place}
                      maxLength={50}
                      placeholder="例：大沼"
                      onChange={(e) => update(i, { place: e.target.value })}
                      style={textInput}
                    />
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => {
                        if (confirm(`${row.title || "この行"} を削除しますか？`))
                          removeRow(i);
                      }}
                      style={delBtn}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...td, color: "#888" }}>
                  行事がありません。「＋ 行事を追加」から作成してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleEditor;
