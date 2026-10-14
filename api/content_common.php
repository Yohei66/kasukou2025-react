<?php
/**
 * 行事予定表 / ドキュメント / リンクの API 共通処理。
 * いずれも「公開ページは読むだけ、書き込みは管理者だけ」という同じ形をしている。
 */
require_once 'courts_common.php'; // send_json / clean_text / now_jst_sql を使う

/** アップロードした PDF の置き場所（PHP のドキュメントルート配下なのでそのまま配信される） */
const DOCUMENTS_DIR = __DIR__ . '/public/documents';

/** PDF 1件の上限。スマホで撮ったスキャンでも収まる程度に取ってある */
const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

/** エラーを JSON で返して終了する */
function content_fail(int $status, string $message): void
{
    send_json(['success' => false, 'error' => $message], $status);
}

/**
 * リクエストボディの JSON を配列で取り出す。
 * 解析できなければその場で 400 を返して終了する。
 */
function read_json_body(): array
{
    $raw = (string)file_get_contents('php://input');
    $raw = (string)preg_replace('/^\xEF\xBB\xBF/', '', $raw); // BOM 除去
    if (trim($raw) === '') {
        content_fail(400, 'リクエストが空です');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        content_fail(400, 'JSONを解析できませんでした');
    }
    return $data;
}

/** POST 以外を弾く（書き込み系 API の先頭で呼ぶ） */
function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        content_fail(405, 'POST で送信してください');
    }
}

/** YYYY-MM-DD として妥当なら正規化して返す。だめなら null */
function valid_date_or_null($raw): ?string
{
    $date = clean_text($raw, 10);
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m)) {
        return null;
    }
    return checkdate((int)$m[2], (int)$m[3], (int)$m[1]) ? $date : null;
}

/**
 * 外部リンクとして許可する URL だけを通す。
 * javascript: などを書き込まれると閲覧者に実行されてしまうため、http(s) に限定する。
 */
function valid_url_or_null($raw): ?string
{
    $url = clean_text($raw, 500);
    if ($url === '' || !preg_match('#^https?://#i', $url)) {
        return null;
    }
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
}

/** ドキュメントの保存先を用意する */
function ensure_documents_dir(): void
{
    if (!is_dir(DOCUMENTS_DIR) && !mkdir(DOCUMENTS_DIR, 0775, true) && !is_dir(DOCUMENTS_DIR)) {
        content_fail(500, '保存先フォルダを作成できませんでした');
    }
}

/**
 * DB に入っているファイル名を、保存先フォルダ内の実ファイルパスに変換する。
 * ディレクトリを抜け出す名前（../ など）は受け付けない。
 */
function document_path(string $fileName): ?string
{
    $name = basename(trim($fileName));
    if ($name === '' || $name === '.' || $name === '..' || strpbrk($name, "/\\") !== false) {
        return null;
    }
    return DOCUMENTS_DIR . '/' . $name;
}
