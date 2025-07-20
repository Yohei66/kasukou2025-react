import React, { useState } from "react";
import { HeaderBar } from "./HeaderBar";
import { useNavigate } from "react-router-dom";

// モーダル用コンポーネント
const Modal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <p>{message}</p>
      <button onClick={onConfirm}>はい</button>
      <button onClick={onCancel}>いいえ</button>
    </div>
  </div>
);

const Admin = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [court, setCourt] = useState("Onuma");
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    navigate("/login");
  };

  // 疑似的な既存ファイル確認（実際はAPIで確認する必要あり）
  const checkFileExists = async (court: string, filename: string) => {
    // 実際はサーバーAPIで確認
    // ここでは常にfalse（存在しない）とする
    return false;
  };

  const handleUpload = async () => {
    if (!year || !month || !file) {
      alert("年・月・コート・ファイルをすべて指定してください");
      return;
    }
    const filename = `${year}${month.padStart(2, "0")}.csv`;
    const exists = await checkFileExists(court, filename);
    if (exists) {
      setShowModal(true);
      setPendingUpload(true);
    } else {
      doUpload(filename);
    }
  };

  const doUpload = async (filename: string) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file, filename);
    formData.append("court", court);
    formData.append("filename", filename);

    try {
      const res = await fetch("/api/upload.php", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert(`アップロードしました: assets/courts/${court}/${filename}`);
        setFile(null);
        setPendingUpload(false);
        setShowModal(false);
      } else {
        alert("アップロードに失敗しました");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
  };

  const handleModalConfirm = () => {
    if (file && year && month) {
      const filename = `${year}${month.padStart(2, "0")}.csv`;
      doUpload(filename);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingUpload(false);
  };

  return (
    <>
      <HeaderBar isAdmin onLogout={handleLogout} />
      <div>
        <h2>CSVアップロード</h2>
        <div>
          <label>
            年:
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2020"
              max="2100"
            />
          </label>
          <label>
            月:
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              min="1"
              max="12"
            />
          </label>
          <label>
            コート:
            <select value={court} onChange={(e) => setCourt(e.target.value)}>
              <option value="Onuma">大沼</option>
              <option value="Tatenuma">立沼</option>
            </select>
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button onClick={handleUpload}>アップロード</button>
        </div>
      </div>
      {showModal && (
        <Modal
          message="同じファイルがありますが、実行を続けますか？"
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
    </>
  );
};

export default Admin;
