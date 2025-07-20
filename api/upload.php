<?php
// filepath: /api/upload.php
$court = $_POST['court'] ?? '';
$filename = $_POST['filename'] ?? '';
$uploadDir = __DIR__ . "/../public/courts/{$court}/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['file']) && $filename) {
    $target = $uploadDir . basename($filename);
    var_dump('target:', $target);
    var_dump('is_uploaded_file:', is_uploaded_file($_FILES['file']['tmp_name']));
    var_dump('file_exists_before:', file_exists($target));
    $result = move_uploaded_file($_FILES['file']['tmp_name'], $target);
    var_dump('move_uploaded_file:', $result);
    var_dump('file_exists_after:', file_exists($target));
    if ($result) {
        http_response_code(200);
        echo "OK";
        echo "アップロード成功: {$target}";
        var_dump($_FILES);
        var_dump($target);
    } else {
        http_response_code(500);
        echo "アップロード失敗: ";
        var_dump(error_get_last());
        var_dump($_FILES);
        var_dump($target);
    }
} else {
    http_response_code(400);
    echo "パラメータ不足";
}
