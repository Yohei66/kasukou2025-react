<?php
/**
 * 設定値の読み込み。
 *
 * 開発環境（Docker Compose）は docker-compose.yml の environment で値を渡すが、
 * レンタルサーバーには環境変数を設定する手段がないことが多い。
 * そこで「設定ファイルがあればそれを使い、無ければ環境変数を見る」という順にする。
 *
 * 探す順番:
 *   1. api/../../config.php   … 公開ディレクトリの外。レンタルサーバーではここが最も安全
 *   2. api/config.php         … 1 が置けないときの代替
 *   3. getenv()               … Docker Compose の environment（開発環境）
 *
 * 設定ファイルは連想配列を return する PHP ファイル。書き方は config.php.example を参照。
 */

/**
 * 設定ファイルの中身を1度だけ読み込んで返す。
 * ファイルが無い場合は空配列（＝環境変数だけを見る）。
 */
function config_all(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $config = [];
    $candidates = [
        __DIR__ . '/../../config.php',
        __DIR__ . '/config.php',
    ];
    foreach ($candidates as $path) {
        if (!is_file($path)) {
            continue;
        }
        $loaded = require $path;
        if (is_array($loaded)) {
            $config = $loaded;
            break;
        }
    }
    return $config;
}

/**
 * 設定値を1つ取り出す。
 * 設定ファイル → 環境変数 → 既定値 の順に探す。
 */
function config_value(string $key, string $default = ''): string
{
    $config = config_all();
    if (isset($config[$key]) && is_scalar($config[$key]) && (string)$config[$key] !== '') {
        return (string)$config[$key];
    }
    $env = getenv($key);
    if (is_string($env) && $env !== '') {
        return $env;
    }
    return $default;
}
