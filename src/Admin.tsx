import React, { useState } from "react";
import { HeaderBar } from "./HeaderBar";
import { useNavigate } from "react-router-dom";
import CourtEditor from "./admin/CourtEditor";
import ScheduleEditor from "./admin/ScheduleEditor";
import DocumentEditor from "./admin/DocumentEditor";
import LinkEditor from "./admin/LinkEditor";

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

/** 管理画面のタブ */
const TABS = [
  { key: "court", label: "コート予約" },
  { key: "schedule", label: "行事予定表" },
  { key: "documents", label: "ドキュメント" },
  { key: "links", label: "リンク" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

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
  const [tab, setTab] = useState<TabKey>("court");

  // --- JSONアップロード ---
  // 年・月・コートは JSON 自身が持っているので、読み込んだ内容から表示する
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<JsonInfo | null>(null);
  const [fileError, setFileError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout.php", { method: "POST" });
    } catch {
      /* 通信に失敗してもログイン画面へ戻す */
    }
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
      const res = await fetch("/api/courts_import.php", {
        method: "POST",
        body: formData,
      });
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

  /**
   * タブの中身。
   * 表示中でないタブも DOM には残す（display:none）。
   * こうしておくと、タブを切り替えても各エディタの未保存の編集内容が消えない。
   */
  const panel = (key: TabKey, children: React.ReactNode) => (
    <div style={{ display: tab === key ? "block" : "none" }}>{children}</div>
  );

  return (
    <>
      <HeaderBar isAdmin onLogout={handleLogout} />

      <div style={tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={tab === t.key ? { ...tabBtn, ...tabBtnActive } : tabBtn}
          >
            {t.label}
          </button>
        ))}
      </div>

      {panel(
        "court",
        <>
          {/* JSONアップロード（スプレッドシートから出力したファイルの一括登録） */}
          <div style={section}>
            <h2>コート予約状況の取り込み（JSON）</h2>
            <p style={note}>
              <code>202611_onuma.json</code>{" "}
              の形式のファイルを選んでください。年・月・コートはファイルの中身から判定します。
              同じ年月・コートの既存データは洗い替えされます。
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) =>
                  void handleFileChange(e.target.files?.[0] || null)
                }
              />
              <button onClick={handleUpload} disabled={!fileInfo}>
                アップロード
              </button>
            </div>
            {fileError && (
              <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>
                {fileError}
              </p>
            )}
            {fileInfo && (
              <p style={{ fontSize: 14, marginTop: 10 }}>
                読み込み内容:{" "}
                <strong>
                  {fileInfo.year}年{fileInfo.month}月
                </strong>{" "}
                / <strong>{fileInfo.courtLabel}コート</strong> / {fileInfo.days}
                日分
              </p>
            )}
          </div>

          {/* グリッド編集（JSONがうまく作れないときの手入力の逃げ道も兼ねる） */}
          <div style={section}>
            <h2>コート予約状況の編集</h2>
            <p style={note}>
              月・コートを選んで読み込み、各マスをクリックして状態を切り替えます。
              データがない月でも、日付を追加して手入力で作成できます。
            </p>
            <CourtEditor />
          </div>
        </>
      )}

      {panel(
        "schedule",
        <div style={section}>
          <h2>行事予定表の編集</h2>
          <p style={note}>
            公開ページ「行事予定表」に出る予定を追加・編集します。
            保存するまでDBには反映されません。
          </p>
          <ScheduleEditor />
        </div>
      )}

      {panel(
        "documents",
        <div style={section}>
          <h2>ドキュメントの編集</h2>
          <p style={note}>
            公開ページ「ドキュメント」に出るPDFを追加・差し替え・削除します。
          </p>
          <DocumentEditor />
        </div>
      )}

      {panel(
        "links",
        <div style={section}>
          <h2>リンクの編集</h2>
          <p style={note}>
            公開ページ「リンク」に出る外部サイトを追加・編集します。
          </p>
          <LinkEditor />
        </div>
      )}

      {showConfirm && fileInfo && (
        <ConfirmModal
          message={`${fileInfo.year}年${fileInfo.month}月 / ${fileInfo.courtLabel}コート のデータ（${fileInfo.days}日分）をDBに登録します。同じ年月・コートの既存データは削除されます。続けますか？`}
          onConfirm={doUpload}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

const section: React.CSSProperties = {
  padding: "16px 24px",
  borderBottom: "1px solid #ddd",
};

const note: React.CSSProperties = {
  fontSize: 13,
  color: "#555",
  margin: "4px 0 12px",
};

const tabBar: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
  padding: "12px 24px 0",
  borderBottom: "1px solid #ddd",
};

const tabBtn: React.CSSProperties = {
  border: "1px solid #ddd",
  borderBottom: "none",
  background: "#f4f6f4",
  color: "#555",
  padding: "8px 16px",
  borderRadius: "8px 8px 0 0",
  cursor: "pointer",
  fontSize: 14,
};

const tabBtnActive: React.CSSProperties = {
  background: "#fff",
  color: "#0e995a",
  fontWeight: "bold",
  boxShadow: "inset 0 3px 0 #0e995a",
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
  maxWidth: 420,
};

export default Admin;
