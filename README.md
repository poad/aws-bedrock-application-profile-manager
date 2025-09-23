# aws-bedrock-application-profile-manager

---

## プロジェクト概要

このリポジトリは、AWS Bedrock のアプリケーションプロファイル管理を目的とした Web アプリケーションです。
主な特徴は以下の通りです。

### 主な機能

- AWS Bedrock の推論プロファイル管理
- 利用可能リージョンの表示
- UIコンポーネントによる操作性の向上
- プロファイル・リージョン情報のリソース管理

### ディレクトリ構成

- `src/`
  - `features/inference-profiles/` : 推論プロファイルのリソース管理
  - `features/regions/` : 利用可能リージョンのリソース管理
  - `features/ui/loading/` : ローディングUIコンポーネント
  - `App.tsx` : アプリケーションのエントリーポイント
  - `utils.ts` : ユーティリティ関数
- `public/` : 公開用アセット
- `.github/` : CI/CD、セキュリティ、Dependabot等のGitHub管理ファイル
- `README.md` : プロジェクト説明
- `LICENSE` : ライセンス情報
- `package.json` : 依存パッケージ管理

---

## Security policy

See [.github/SECURITY.md](.github/SECURITY.md).
