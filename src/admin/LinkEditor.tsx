import { useEffect, useState } from "react";
import { fetchLinks, type ClubLink } from "../dataset/content";
import {
  addBar,
  controls,
  delBtn,
  dirtyMark,
  moveBtn,
  moveItem,
  note,
  saveBtn,
  tableStyle,
  td,
  textInput,
  th,
} from "./adminStyles";

/** 編集中の1行 */
type Row = {
  key: string;
  title: string;
  url: string;
};

let keySeq = 0;
const newKey = () => `link-${++keySeq}`;

const toRows = (links: ClubLink[]): Row[] =>
  links.map((l) => ({ key: newKey(), title: l.title, url: l.url }));

/** 閲覧者がそのまま開くので、http(s) 以外は受け付けない */
const isValidUrl = (url: string) => /^https?:\/\/.+/i.test(url.trim());

const validate = (rows: Row[]) => {
  for (const [i, row] of rows.entries()) {
    if (!row.title.trim()) return `${i + 1}行目: 表示名を入力してください。`;
    if (!isValidUrl(row.url))
      return `${i + 1}行目: URL は https:// から始まる形式で入力してください。`;
  }
  return "";
};

const LinkEditor = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setRows(null);
    setDirty(false);
    setMessage("");
    fetchLinks()
      .then((links) => setRows(toRows(links)))
      .catch(() => setMessage("読み込みに失敗しました。"));
  };

  useEffect(load, []);

  const update = (index: number, patch: Partial<Row>) => {
    setDirty(true);
    setRows((prev) =>
      prev ? prev.map((r, i) => (i === index ? { ...r, ...patch } : r)) : prev
    );
  };

  const move = (index: number, delta: number) => {
    setDirty(true);
    setRows((prev) => (prev ? moveItem(prev, index, index + delta) : prev));
  };

  const addRow = () => {
    setDirty(true);
    setMessage("");
    setRows((prev) => [...(prev ?? []), { key: newKey(), title: "", url: "" }]);
  };

  const removeRow = (index: number) => {
    setDirty(true);
    setRows((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
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
    try {
      const res = await fetch("/api/links_save.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 配列の順番がそのまま公開ページの並び順になる
        body: JSON.stringify({
          links: rows.map((r) => ({
            title: r.title.trim(),
            url: r.url.trim(),
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
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
        <button onClick={addRow}>＋ リンクを追加</button>
        {dirty && <span style={dirtyMark}>● 未保存の変更あり</span>}
        <button onClick={save} disabled={saving || !dirty} style={saveBtn}>
          保存（公開ページに反映）
        </button>
      </div>

      {message && <p style={{ fontSize: 14, color: "#444" }}>{message}</p>}

      <div style={addBar}>
        上下ボタンで並べ替えられます。この順番がそのまま公開ページの並び順になります。
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...th, width: 70 }}>並び</th>
              <th style={{ ...th, width: 240 }}>表示名</th>
              <th style={th}>URL</th>
              <th style={{ ...th, width: 110 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key}>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    style={moveBtn}
                    aria-label="上へ"
                  >
                    ↑
                  </button>{" "}
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    style={moveBtn}
                    aria-label="下へ"
                  >
                    ↓
                  </button>
                </td>
                <td style={td}>
                  <input
                    value={row.title}
                    maxLength={100}
                    placeholder="例：埼玉県テニス協会"
                    onChange={(e) => update(i, { title: e.target.value })}
                    style={textInput}
                  />
                </td>
                <td style={td}>
                  <input
                    value={row.url}
                    maxLength={500}
                    placeholder="https://example.com/"
                    onChange={(e) => update(i, { url: e.target.value })}
                    style={{
                      ...textInput,
                      color: !row.url || isValidUrl(row.url) ? undefined : "#c0392b",
                    }}
                  />
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  {isValidUrl(row.url) && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, marginRight: 8 }}
                    >
                      確認
                    </a>
                  )}
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
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...td, color: "#888" }}>
                  リンクがありません。「＋ リンクを追加」から作成してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LinkEditor;
