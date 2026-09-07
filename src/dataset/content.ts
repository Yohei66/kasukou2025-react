/**
 * 管理画面から編集できるコンテンツ（行事予定表・ドキュメント・リンク）の取得。
 * 公開ページと管理画面の両方から使うので、型と取得処理はここにまとめる。
 */

/** 行事予定表の1行 */
export type ClubEvent = {
  id: number;
  /** YYYY-MM-DD */
  date: string;
  /** 日付から求めた曜日（サーバー側で付与） */
  dow: string;
  title: string;
  place: string;
};

/** ドキュメント（PDF）1件 */
export type ClubDocument = {
  id: number;
  title: string;
  /** API から見た相対パス。表示には documentUrl() を使う */
  path: string;
  /** アップロード時のファイル名。ダウンロード時の名前に使う */
  originalName: string;
};

/** リンク集の1件 */
export type ClubLink = {
  id: number;
  title: string;
  url: string;
};

/** PDF の実体は PHP のドキュメントルート配下にあり、/api 経由で配信される */
export const documentUrl = (doc: Pick<ClubDocument, "path">) =>
  `/api/${doc.path}`;

/** "2026-06-01" → "6月1日" */
export const formatEventDate = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}月${Number(day)}日`;
};

/** 一覧系 API の共通処理。配列以外が返ってきたら失敗として扱う */
const fetchList = async <T>(path: string): Promise<T[]> => {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`${path} の取得に失敗しました`);
  }
  const json: unknown = await res.json();
  if (!Array.isArray(json)) {
    throw new Error(`${path} の応答が不正です`);
  }
  return json as T[];
};

export const fetchEvents = () => fetchList<ClubEvent>("/api/events_list.php");

export const fetchDocuments = () =>
  fetchList<ClubDocument>("/api/documents_list.php");

export const fetchLinks = () => fetchList<ClubLink>("/api/links_list.php");
