<?php
require_once __DIR__ . '/config_load.php';

// 既定値は開発環境（Docker Compose）のもの。
// 本番・試験サーバーでは config.php に実際の値を書いて上書きする。
$host = config_value('DB_HOST', 'db');
$db   = config_value('DB_NAME', 'devdb');
$user = config_value('DB_USER', 'devuser');
$pass = config_value('DB_PASSWORD', 'devpass');
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
