import type { CSSProperties } from "react";

/**
 * 管理画面の編集フォームで共通に使う見た目。
 * 公開ページと違い MUI を使わず素の要素で組んでいるので、スタイルはここに集約する。
 */

export const controls: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  marginBottom: 12,
};

export const saveBtn: CSSProperties = {
  marginLeft: "auto",
  padding: "8px 16px",
  border: "none",
  borderRadius: 8,
  background: "#0e995a",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export const addBar: CSSProperties = {
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

export const tableStyle: CSSProperties = {
  borderCollapse: "collapse",
  background: "#fff",
  fontSize: 14,
  width: "100%",
};

export const th: CSSProperties = {
  border: "1px solid #ccc",
  padding: "4px 8px",
  textAlign: "center",
  background: "#e8efe0",
  whiteSpace: "nowrap",
};

export const td: CSSProperties = {
  border: "1px solid #ccc",
  padding: "3px 6px",
  textAlign: "center",
};

export const textInput: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 4,
};

export const delBtn: CSSProperties = {
  border: "1px solid #e0b4b4",
  background: "#fff",
  color: "#c0392b",
  borderRadius: 6,
  padding: "3px 8px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export const moveBtn: CSSProperties = {
  border: "1px solid #ccc",
  background: "#fff",
  borderRadius: 6,
  padding: "2px 7px",
  cursor: "pointer",
  lineHeight: 1.4,
};

export const dirtyMark: CSSProperties = {
  fontSize: 13,
  color: "#c0392b",
  fontWeight: "bold",
};

export const note: CSSProperties = {
  fontSize: 13,
  color: "#666",
  margin: "4px 0 12px",
};

/** 配列の要素を1つ動かした新しい配列を返す（並び替えボタン用） */
export const moveItem = <T,>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
