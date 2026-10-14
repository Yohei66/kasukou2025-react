<?php
/**
 * ドキュメント（PDF）の追加・差し替え（管理者のみ）。
 *
 * multipart/form-data で受け取る:
 *   title … 画面に出す名前
 *   file  … PDF ファイル
 *   id    … 省略可。指定するとその行のファイルを差し替える（並び順は保たれる）
 *
 * ファイル名はこちらで付け直す。日本語や空白を含む名前をそのまま置くと
 * URL でつまずくし、同名アップロードで上書き事故も起きるため。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';
require_once 'admin_guard.php';

admin_require_login();
require_post();

$title = clean_text($_POST['title'] ?? '', 100);
if ($title === '') {
    content_fail(400, '名前を入力してください');
}

$upload = $_FILES['file'] ?? null;
if (!is_array($upload) || ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    // php.ini の上限を超えた場合もここに来る
    content_fail(400, 'PDFファイルを選択してください（アップロードに失敗しました）');
}
if (!is_uploaded_file($upload['tmp_name'])) {
    content_fail(400, 'アップロードされたファイルを読み取れませんでした');
}
if ((int)$upload['size'] <= 0 || (int)$upload['size'] > DOCUMENT_MAX_BYTES) {
    content_fail(400, 'ファイルサイズは ' . (DOCUMENT_MAX_BYTES / 1024 / 1024) . 'MB までです');
}

$originalName = clean_text($upload['name'] ?? '', 255);
if (strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) !== 'pdf') {
    content_fail(400, 'PDFファイルだけ登録できます');
}
// 拡張子だけでは中身を保証できないので、先頭の署名も確かめる
if (strncmp((string)file_get_contents($upload['tmp_name'], false, null, 0, 5), '%PDF-', 5) !== 0) {
    content_fail(400, 'PDFとして読み取れないファイルです');
}

// 差し替え対象の確認（id 指定時）
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$oldFileName = null;
if ($id > 0) {
    $stmt = $pdo->prepare('SELECT `file_name` FROM documents WHERE `id` = ?');
    $stmt->execute([$id]);
    $oldFileName = $stmt->fetchColumn();
    if ($oldFileName === false) {
        content_fail(404, '差し替え対象が見つかりません');
    }
}

ensure_documents_dir();
$fileName = date('Ymd') . '_' . bin2hex(random_bytes(6)) . '.pdf';
$destination = document_path($fileName);
if ($destination === null || !move_uploaded_file($upload['tmp_name'], $destination)) {
    content_fail(500, 'ファイルの保存に失敗しました');
}

try {
    if ($id > 0) {
        $stmt = $pdo->prepare('UPDATE documents SET `title` = ?, `file_name` = ?, `original_name` = ? WHERE `id` = ?');
        $stmt->execute([$title, $fileName, $originalName, $id]);
    } else {
        // 新規は末尾に置く
        $next = (int)$pdo->query('SELECT COALESCE(MAX(`sort_order`), 0) + 10 FROM documents')->fetchColumn();
        $stmt = $pdo->prepare('
            INSERT INTO documents (`title`, `file_name`, `original_name`, `sort_order`, `created_at`)
            VALUES (?, ?, ?, ?, ?)
        ');
        $stmt->execute([$title, $fileName, $originalName, $next, now_jst_sql()]);
        $id = (int)$pdo->lastInsertId();
    }
} catch (Throwable $e) {
    @unlink($destination); // DB に残らないファイルを置き去りにしない
    content_fail(500, '登録に失敗しました: ' . $e->getMessage());
}

// 差し替えが終わってから古いファイルを消す（DB 更新に失敗したら消さない）
if ($oldFileName) {
    $oldPath = document_path((string)$oldFileName);
    if ($oldPath !== null && is_file($oldPath)) {
        @unlink($oldPath);
    }
}

send_json(['success' => true, 'id' => $id, 'title' => $title]);
