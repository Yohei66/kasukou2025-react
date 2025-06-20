<?php
header('Content-Type: application/json');
require 'db.php';

try {
    $stmt = $pdo->query("SELECT username FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['success' => true, 'users' => $users]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
