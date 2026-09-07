import React, { useState } from "react";
import { HeaderBar } from "./HeaderBar";
import { useNavigate } from "react-router-dom";

type RowData = {
  id: number;
  日付: string;
  曜日: string;
  コート: string;
  "9-11": string;
  "11-13": string;
  "13-15": string;
  "15-17": string;
  備考: string;
};

const TIME_SLOTS = ["9-11", "11-13", "13-15", "15-17"] as const;

const ConfirmModal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div style={overlayStyle}>
    <div style={dialogStyle}>
      <p>{message}</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onConfirm}>はい</button>
        <button onClick={onCancel}>いいえ</button>
      </div>
    </div>
  </div>
);

const EditModal = ({
  row,
  onSave,
  onCancel,
}: {
  row: RowData;
  onSave: (updated: RowData) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<RowData>({ ...row });

  const set = (key: keyof RowData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={overlayStyle}>
      <div style={{ ...dialogStyle, minWidth: 360 }}>
        <h3 style={{ margin: "0 0 12px" }}>
          {form["日付"]} {form["曜日"]} — {form["コート"]}
        </h3>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot}>
                <td style={tdLabelStyle}>{slot}</td>
                <td>
                  <input
                    style={{ width: "100%" }}
                    value={form[slot]}
                    onChange={(e) => set(slot, e.target.value)}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td style={tdLabelStyle}>備考</td>
              <td>
                <input
                  style={{ width: "100%" }}
                  value={form["備考"]}
                  onChange={(e) => set("備考", e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={() => onSave(form)}>保存</button>
          <button onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};

/** 取り込む JSON から読み取った概要（確認表示用） */
type JsonInfo = {
  year: number;
  month: number;
  location: string;
  courtLabel: string;
  days: number;
};

const COURT_LABELS: Record<string, string> = {
  onuma: "大沼",
  tatenuma: "立沼",
};

/** アップロード前に JSON を検証し、概要を取り出す */
const readJsonInfo = (text: string): JsonInfo => {
  const data = JSON.parse(text);
  const location = String(data?.location ?? "").toLowerCase();
  const courtLabel = COURT_LABELS[location];
  if (!courtLabel) {
    throw new Error("location は onuma または tatenuma である必要があります");
  }
  const year = Number(data?.year);
  const month = Number(data?.month);
  if (!year || !month) {
    throw new Error("year / month がありません");
  }
  if (!Array.isArray(data?.days)) {
    throw new Error("days がありません");
  }
  return { year, month, location, courtLabel, days: data.days.length };
};

const Admin = () => {
  const navigate = useNavigate();

  // --- JSONアップロード ---
  // 年・月・コートは JSON 自身が持っているので、読み込んだ内容から表示する
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<JsonInfo | null>(null);
  const [fileError, setFileError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // --- データ編集 ---
  const [viewYear, setViewYear] = useState("");
  const [viewMonth, setViewMonth] = useState("");
  const [viewCourt, setViewCourt] = useState("Onuma");
  const [records, setRecords] = useState<RowData[]>([]);
  const [editRow, setEditRow] = useState<RowData | null>(null);
  const [loadError, setLoadError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    navigate("/login");
  };

  const handleFileChange = async (selected: File | null) => {
    setFile(null);
    setFileInfo(null);
    setFileError("");
    if (!selected) return;
    try {
      setFileInfo(readJsonInfo(await selected.text()));
      setFile(selected);
    } catch (e) {
      setFileError(
        "JSONを読み込めませんでした: " +
          (e instanceof Error ? e.message : String(e))
      );
    }
  };

  const handleUpload = () => {
    if (!file || !fileInfo) {
      alert("取り込むJSONファイルを選択してください");
      return;
    }
    setShowConfirm(true);
  };

  const doUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const res = await fetch("/api/courts_import.php", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok && json.success) {
        alert(`登録しました（${json.days}日分 / ${json.count}件）`);
        setFile(null);
        setFileInfo(null);
        setShowConfirm(false);
      } else {
        alert("登録に失敗しました: " + (json.error ?? ""));
      }
    } catch {
      alert("通信エラーが発生しました");
    }
  };

  const loadRecords = async () => {
    if (!viewYear || !viewMonth) {
      setLoadError("年と月を指定してください");
      return;
    }
    setLoadError("");
    const ym = `${viewYear}${viewMonth.padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/courts_list.php?court_type=${viewCourt}&year_month=${ym}`);
      const data: RowData[] = await res.json();
      setRecords(data);
      if (data.length === 0) setLoadError("データがありません");
    } catch {
      setLoadError("通信エラーが発生しました");
    }
  };

  const saveEdit = async (updated: RowData) => {
    try {
      const res = await fetch("/api/courts_update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setEditRow(null);
      } else {
        alert("保存に失敗しました");
      }
    } catch {
      alert("通信エラーが発生しました");
    }
  };

  return (
    <>
      <HeaderBar isAdmin onLogout={handleLogout} />

      {/* JSONアップロード */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h2>コート予約状況の取り込み（JSON）</h2>
        <p style={{ fontSize: 13, color: "#555", margin: "4px 0 12px" }}>
          <code>202611_onuma.json</code> の形式のファイルを選んでください。年・月・コートはファイルの中身から判定します。
          同じ年月・コートの既存データは洗い替えされます。
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => void handleFileChange(e.target.files?.[0] || null)}
          />
          <button onClick={handleUpload} disabled={!fileInfo}>
            アップロード
          </button>
        </div>
        {fileError && (
          <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>{fileError}</p>
        )}
        {fileInfo && (
          <p style={{ fontSize: 14, marginTop: 10 }}>
            読み込み内容: <strong>{fileInfo.year}年{fileInfo.month}月</strong> /{" "}
            <strong>{fileInfo.courtLabel}コート</strong> / {fileInfo.days}日分
          </p>
        )}
      </div>

      {/* データ編集 */}
      <div style={{ padding: "16px 24px" }}>
        <h2>データ編集</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <label>
            年:&nbsp;
            <input
              type="number"
              value={viewYear}
              onChange={(e) => setViewYear(e.target.value)}
              min="2020"
              max="2100"
              style={{ width: 80 }}
            />
          </label>
          <label>
            月:&nbsp;
            <input
              type="number"
              value={viewMonth}
              onChange={(e) => setViewMonth(e.target.value)}
              min="1"
              max="12"
              style={{ width: 60 }}
            />
          </label>
          <label>
            コート:&nbsp;
            <select value={viewCourt} onChange={(e) => setViewCourt(e.target.value)}>
              <option value="Onuma">大沼</option>
              <option value="Tatenuma">立沼</option>
            </select>
          </label>
          <button onClick={loadRecords}>読み込む</button>
        </div>

        {loadError && <p style={{ color: "red" }}>{loadError}</p>}

        {records.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#1976d2", color: "#fff" }}>
                  {["日付", "曜日", "コート", "9-11", "11-13", "13-15", "15-17", "備考", "操作"].map(
                    (h) => (
                      <th key={h} style={thStyle}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>{r["日付"]}</td>
                    <td style={{ ...tdStyle, color: r["曜日"] === "日" ? "red" : r["曜日"] === "土" ? "blue" : undefined }}>
                      {r["曜日"]}
                    </td>
                    <td style={tdStyle}>{r["コート"]}</td>
                    <td style={tdStyle}>{r["9-11"]}</td>
                    <td style={tdStyle}>{r["11-13"]}</td>
                    <td style={tdStyle}>{r["13-15"]}</td>
                    <td style={tdStyle}>{r["15-17"]}</td>
                    <td style={tdStyle}>{r["備考"]}</td>
                    <td style={tdStyle}>
                      <button onClick={() => setEditRow(r)}>編集</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showConfirm && fileInfo && (
        <ConfirmModal
          message={`${fileInfo.year}年${fileInfo.month}月 / ${fileInfo.courtLabel}コート のデータ（${fileInfo.days}日分）をDBに登録します。同じ年月・コートの既存データは削除されます。続けますか？`}
          onConfirm={doUpload}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {editRow && (
        <EditModal
          row={editRow}
          onSave={saveEdit}
          onCancel={() => setEditRow(null)}
        />
      )}
    </>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  borderRadius: 8,
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
};

const thStyle: React.CSSProperties = {
  padding: "8px 12px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 12px",
  whiteSpace: "nowrap",
};

const tdLabelStyle: React.CSSProperties = {
  padding: "4px 12px 4px 0",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

export default Admin;
