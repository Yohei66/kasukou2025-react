import { useEffect, useRef, useState } from "react";
import {
  documentUrl,
  fetchDocuments,
  type ClubDocument,
} from "../dataset/content";
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

/** 編集中の1行。ファイルの実体は既にサーバーにあるので path はそのまま持ち回る */
type Row = {
  id: number;
  title: string;
  path: string;
  originalName: string;
};

const toRows = (documents: ClubDocument[]): Row[] =>
  documents.map((d) => ({
    id: d.id,
    title: d.title,
    path: d.path,
    originalName: d.originalName,
  }));

const DocumentEditor = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  // 新規追加フォーム
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);

  const load = (keepMessage = false) => {
    setRows(null);
    setDirty(false);
    if (!keepMessage) setMessage("");
    fetchDocuments()
      .then((documents) => setRows(toRows(documents)))
      .catch(() => setMessage("読み込みに失敗しました。"));
  };

  useEffect(() => load(), []);

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

  const removeRow = (index: number) => {
    setDirty(true);
    setRows((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  };

  /** ファイルを伴う操作は一覧を作り直すので、未保存の変更があるうちは実行しない */
  const blockedByDirty = () => {
    if (!dirty) return false;
    setMessage(
      "先に「保存」を押してください。ファイルの追加・差し替えは、名前や並び順を保存してから行えます。"
    );
    return true;
  };

  /** アップロード（追加・差し替え共通）。成功したかどうかを返す */
  const upload = async (form: FormData, successMessage: string) => {
    setBusy(true);
    setMessage("送信中…");
    let ok = false;
    try {
      const res = await fetch("/api/documents_upload.php", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        ok = true;
        setMessage(successMessage);
        load(true); // 採番されたファイル名を取り直す
      } else {
        setMessage("失敗しました: " + (json.error ?? ""));
      }
    } catch {
      setMessage("通信エラーが発生しました。");
    }
    setBusy(false);
    return ok;
  };

  const addDocument = async () => {
    if (blockedByDirty()) return;
    const title = newTitle.trim();
    if (!title) {
      setMessage("名前を入力してください。");
      return;
    }
    if (!newFile) {
      setMessage("PDFファイルを選択してください。");
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("file", newFile, newFile.name);
    // 失敗したときは選び直さずに済むよう、成功したときだけ入力を空にする
    if (await upload(form, `「${title}」を追加しました。`)) {
      setNewTitle("");
      setNewFile(null);
      if (newFileRef.current) newFileRef.current.value = "";
    }
  };

  const replaceFile = (row: Row, file: File | null, input: HTMLInputElement) => {
    input.value = ""; // 同じファイルを選び直せるようにする
    if (!file) return;
    if (blockedByDirty()) return;
    if (!confirm(`「${row.title}」のPDFを差し替えますか？（元のPDFは消えます）`))
      return;
    const form = new FormData();
    form.append("id", String(row.id));
    form.append("title", row.title);
    form.append("file", file, file.name);
    void upload(form, `「${row.title}」のPDFを差し替えました。`);
  };

  const save = async () => {
    if (!rows) return;
    const blank = rows.findIndex((r) => !r.title.trim());
    if (blank >= 0) {
      setMessage(`${blank + 1}行目: 名前を入力してください。`);
      return;
    }
    setBusy(true);
    setMessage("保存中…");
    try {
      const res = await fetch("/api/documents_save.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 配列の順番がそのまま公開ページの並び順。ここに無い id は削除される
        body: JSON.stringify({
          documents: rows.map((r) => ({ id: r.id, title: r.title.trim() })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setDirty(false);
        setMessage(
          `保存しました（${json.count}件` +
            (json.deleted ? ` / ${json.deleted}件削除` : "") +
            "）。"
        );
      } else {
        setMessage("保存に失敗しました: " + (json.error ?? ""));
      }
    } catch {
      setMessage("通信エラーが発生しました。");
    }
    setBusy(false);
  };

  if (!rows) {
    return <p style={note}>{message || "読み込み中…"}</p>;
  }

  return (
    <div>
      <div style={controls}>
        {dirty && <span style={dirtyMark}>● 未保存の変更あり</span>}
        <button onClick={save} disabled={busy || !dirty} style={saveBtn}>
          保存（公開ページに反映）
        </button>
      </div>

      {message && <p style={{ fontSize: 14, color: "#444" }}>{message}</p>}

      <div style={addBar}>
        <strong>PDFを追加：</strong>
        <input
          value={newTitle}
          maxLength={100}
          placeholder="名前（例：クラブ規約）"
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ padding: 4, width: 220 }}
        />
        <input
          ref={newFileRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={() => void addDocument()} disabled={busy}>
          ＋ 追加
        </button>
      </div>

      <p style={note}>
        追加と差し替えは押した時点でサーバーに反映されます。名前の変更・並べ替え・削除は
        「保存」を押したときに反映されます（削除するとPDFの実体も消えます）。
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...th, width: 70 }}>並び</th>
              <th style={{ ...th, width: 260 }}>名前</th>
              <th style={th}>PDF</th>
              <th style={{ ...th, width: 230 }}>差し替え</th>
              <th style={{ ...th, width: 70 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}>
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
                    onChange={(e) => update(i, { title: e.target.value })}
                    style={textInput}
                  />
                </td>
                <td style={{ ...td, textAlign: "left" }}>
                  <a
                    href={documentUrl(row)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13 }}
                  >
                    {row.originalName}
                  </a>
                </td>
                <td style={td}>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={busy}
                    onChange={(e) =>
                      replaceFile(row, e.target.files?.[0] ?? null, e.target)
                    }
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </td>
                <td style={td}>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `「${row.title}」を削除しますか？（保存時にPDFも消えます）`
                        )
                      )
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
                <td colSpan={5} style={{ ...td, color: "#888" }}>
                  ドキュメントがありません。上の「PDFを追加」から登録してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentEditor;
