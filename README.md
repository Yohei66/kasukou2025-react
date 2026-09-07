# kasukou2025-react

React (Vite) + PHP + MariaDB の開発環境です。Docker Compose で一括起動します。

## 起動方法

### 1. 前提
- Docker Desktop がインストール済みで、**起動している**こと
  （`docker info` がエラーになる場合は Docker Desktop を先に立ち上げてください）

### 2. 起動コマンド
プロジェクトルート（このREADMEがある場所）で以下を実行します。

```bash
# 既存コンテナを停止・削除（初回は不要）
docker compose down

# 各種サーバーを起動（バックグラウンド）
docker compose up -d

# React 開発サーバーのログを確認（Ctrl+C で抜けてもコンテナは動き続けます）
docker compose logs -f node
```

`node` コンテナ内で `npm install && npm run dev` が自動実行されます。
ログに以下が出れば起動完了です。

```
VITE v6.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 3. アクセス先

| URL | 内容 |
| --- | --- |
| http://localhost:3000 | Webサイト本体（React / Vite 開発サーバー） |
| http://localhost:9000 | PHP APIサーバー（Reactからは `/api/*` 経由でプロキシされます） |
| localhost:3309 | MariaDB（user: `devuser` / pass: `devpass` / db: `devdb`） |

ブラウザで **http://localhost:3000** を開いてください。

### 4. DBテーブルの初期化（初回のみ）
`courts` テーブルを作成します。

```bash
curl http://localhost:9000/migrate.php
```

`{"success":true,"message":"マイグレーション完了"}` が返れば成功です。

### 5. 停止

```bash
docker compose down
```

DBのデータは `db_data` ボリュームに残ります。完全に消す場合は `docker compose down -v` を実行してください。

## 構成

| サービス | コンテナ名 | ポート | 役割 |
| --- | --- | --- | --- |
| node | dev-node | 3000 | React (Vite) 開発サーバー |
| php | dev-php | 9000 | PHP 8.2 ビルトインサーバー（`api/` 配下） |
| db | dev-db | 3309 → 3306 | MariaDB 10.5 |
| nginx | dev-nginx | 8080 | 通常は無効（`docker-compose.override.yml` で `scale: 0`） |

Vite の `server.proxy` 設定により、フロントの `/api/xxx.php` へのリクエストは
`http://dev-php:9000/xxx.php` に転送されます（`vite.config.ts` 参照）。

## Docker を使わない場合

ローカルに Node.js があれば React 単体でも起動できます（PHP API は別途必要）。

```bash
npm install
npm run dev
```

## その他のコマンド

```bash
npm run build    # Lint + 型チェック + 本番ビルド
npm run lint     # ESLint（--fix 付き）
npm run preview  # ビルド結果をローカルで確認
npm run deploy   # GitHub Pages へデプロイ
```

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `failed to connect to the docker API` | Docker Desktop が起動していません。起動後に再実行してください |
| ポートが使用中エラー | 3000 / 9000 / 3309 を使っている他プロセスを停止してください |
| 依存関係を更新したのに反映されない | `docker compose down` 後に再度 `docker compose up -d`（`node_modules` はボリューム管理のため、必要なら `docker compose down -v`） |

# Notion

https://www.notion.so/210be2fea8a380dd9fd4cc8bb127904b?v=210be2fea8a381f5aee3000c988ea8b4&source=copy_link

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
