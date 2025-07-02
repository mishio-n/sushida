# 🍣 寿司打スコア管理システム

寿司打タイピングゲームのスコアを画像からOCRで自動抽出し、Webアプリで可視化・分析するシステムです。

## 🎯 機能

- **OCR自動スコア抽出**: スクリーンショットから自動でスコアデータを抽出
- **Webアプリでの可視化**: React + Nivoを使用した美しいグラフ表示
- **詳細統計分析**: コース別統計、正確率、平均TPS等の詳細分析
- **スコア一覧表示**: 日付・コース・結果でソート可能な読み取り専用リスト

## 🛠️ システム構成

- **CLIツール**: Python (OpenCV + pytesseract) でOCR処理
- **Webアプリ**: React 19 + TypeScript + Vite + Zustand (読み取り専用)
- **グラフライブラリ**: Nivo
- **データ連携**: Viteビルド時にJSONデータを静的埋め込み

## 📦 セットアップ

### 1. uvのインストール

このプロジェクトのPython環境管理には**uv**を使用します。

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# または pipx経由
pipx install uv
```

詳細: https://docs.astral.sh/uv/getting-started/installation/

### 2. Tesseract OCRのインストール

#### macOS (Homebrew)
```bash
# Homebrewがない場合はインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tesseract OCRをインストール
brew install tesseract tesseract-lang
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-jpn
```

#### CentOS/RHEL
```bash
sudo yum install -y tesseract tesseract-langpack-jpn
```

#### Fedora
```bash
sudo dnf install -y tesseract tesseract-langpack-jpn
```

#### Windows
1. [Tesseract公式GitHub](https://github.com/UB-Mannheim/tesseract/wiki)からインストーラーをダウンロード
2. インストール時に「Additional language data」で日本語を選択
3. 環境変数PATHにTesseractのインストールパスを追加
4. コマンドプロンプトで`tesseract --version`で動作確認

### 3. プロジェクトの依存関係インストール

```bash
# Node.js依存関係
npm install

# Python依存関係（uvで管理）
cd tools
uv sync
```

**システム要件:**
- Node.js 18以上
- Python 3.8以上 (uvが自動管理)
- Tesseract OCR（上記手順でインストール）

### 4. 環境テスト

```bash
# OCR環境が正常にセットアップされているかテスト
cd tools
uv run python -m src.cli setup-test

# 成功すると以下のような出力が表示されます：
# ✅ uv: 0.x.x
# ✅ Python: 3.x.x
# ✅ Tesseract OCR: tesseract 5.x.x
# ✅ 必要なPythonパッケージ: すべてインストール済み
# 🎉 OCR環境のセットアップが完了しています！
```

### 5. 使用方法

#### CLIツールでスコア抽出

```bash
cd tools

# 単一画像を処理（analyze コマンド）
uv run python -m src.cli analyze path/to/screenshot.png

# 複数画像を一括処理（batch コマンド）
uv run python -m src.cli batch path/to/image1.png path/to/image2.png

# ディレクトリ内の全画像を処理
uv run python -m src.cli batch ../20*.png

# OCRテスト（デバッグ用）
uv run python -m src.cli test path/to/screenshot.png

# オプション例
uv run python -m src.cli analyze screenshot.png --debug --quiet
uv run python -m src.cli batch *.png --continue-on-error
```

**CLIオプション:**
- `--debug`: デバッグモード（中間画像を保存）
- `--quiet`: 進捗メッセージを非表示
- `--continue-on-error`: エラーが発生しても処理を続行
- `--output`, `-o`: 出力先を指定
- `--format`: 出力形式（json/csv）

#### 出力ファイルについて

CLIツールは以下のルールでファイルを出力します：

1. **デフォルト出力先**: `../score/` ディレクトリ
2. **ファイル名**: 元画像ファイル名.json（例：`20250407.png` → `20250407.json`）
3. **形式**: 簡潔なJSON形式（timestamp、source_fileなし）

#### Webアプリの起動

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
npm run preview
```

## 📁 プロジェクト構造

```
├── tools/                  # Python OCRツール
│   ├── src/
│   │   ├── cli.py         # CLIメインコマンド
│   │   ├── ocr.py         # OCR処理
│   │   ├── parser.py      # スコア解析
│   │   └── utils.py       # ユーティリティ
│   └── pyproject.toml     # uv/PEP 621設定ファイル
├── score/                  # OCR結果JSONファイル
├── src/                    # Reactアプリソース
│   ├── components/        # UIコンポーネント
│   ├── stores/           # Zustand状態管理
│   ├── types/            # TypeScript型定義
│   ├── utils/            # ユーティリティ
│   └── hooks/            # カスタムフック
└── vite.config.ts         # Viteビルド設定（データ埋め込み）
```

## 🤖 CLIツール詳細

### 利用可能コマンド

| コマンド | 説明 | 例 |
|---------|------|-----|
| `analyze` | 単一画像を解析 | `uv run python -m src.cli analyze image.png` |
| `batch` | 複数画像を一括処理 | `uv run python -m src.cli batch *.png` |
| `test` | OCRテスト（デバッグ用） | `uv run python -m src.cli test image.png` |
| `setup-test` | OCR環境テスト | `uv run python -m src.cli setup-test` |

### 対応画像形式

- PNG (.png)
- JPEG (.jpg, .jpeg)
- その他OpenCVでサポートされる形式

### OCR処理プロセス

1. **画像前処理**: OpenCVでグレースケール変換、ノイズ除去
2. **Tesseract OCR**: 日本語対応でテキスト抽出
3. **正規表現パース**: 寿司打特有のフォーマットを解析
4. **JSON変換**: 構造化データに変換
5. **ファイル出力**: score/ディレクトリに保存

### エラーハンドリング

- 画像読み込み失敗時の適切なエラーメッセージ
- OCR失敗時のデバッグ情報表示
- バッチ処理時の`--continue-on-error`オプション
- セットアップ問題の自動診断

### パフォーマンス

- 単一画像: 通常1-3秒で処理完了
- バッチ処理: プログレスバー表示で進捗確認可能
- デバッグモード: 中間画像を保存して問題分析

## 🔧 データフロー

1. **スクリーンショット撮影**: 寿司打結果画面をキャプチャ
2. **OCR処理**: `tools/src/cli.py`でスコアデータを抽出
3. **JSON出力**: `score/`ディレクトリにファイル名.jsonで保存
4. **ビルド時統合**: Viteが`score/`の全JSONを読み込み、アプリに埋め込み
5. **アプリ表示**: React + Nivoでグラフィカルに表示

## 📊 対応スコア形式

CLIツールは以下の簡潔なJSON形式でスコアデータを出力します：

```json
{
  "course": "お手軽",
  "result": 600,
  "detail": {
    "payed": 0,
    "gain": 600
  },
  "typing": {
    "correct": 35,
    "avarageTPS": 0.6,
    "miss": 1
  }
}
```

日付情報はファイル名から自動的に抽出されます（例：`20250407.json` → `2025-04-07`）。

## 💡 実際の使用例

### 基本的なワークフロー

```bash
# 1. 寿司打でゲームプレイ後、結果画面をスクリーンショット
# 例：20250702.png として保存

# 2. CLIツールでスコア抽出
cd tools
uv run python -m src.cli analyze ../20250702.png

# 3. 結果確認（score/20250702.json が生成される）
cat ../score/20250702.json

# 4. Webアプリでグラフ表示
cd ..
npm run dev
# http://localhost:5173/ でアクセス
```

### バッチ処理例

```bash
# 複数日分のスクリーンショットを一括処理
cd tools
uv run python -m src.cli batch ../20250701.png ../20250702.png ../20250703.png

# ワイルドカードで全てのPNGファイルを処理
uv run python -m src.cli batch ../202507*.png --continue-on-error

# 処理結果の確認
ls -la ../score/
```

### トラブルシューティング

```bash
# OCR環境の確認
python -m src.cli setup-test

# デバッグモードでOCRテスト
python -m src.cli test image.png --debug

# エラーログの確認（中間画像も保存される）
python -m src.cli analyze problematic.png --debug
```

## 🎮 寿司打について

[寿司打](http://typingx0.net/sushida/) は人気の無料タイピングゲームです。  
このツールはゲームの練習成果を記録・分析するためのものです。

## ⚙️ システム要件

### 必要な環境

- **Node.js**: v16以上
- **Python**: 3.8以上
- **OS**: macOS, Linux, Windows（macOSで主にテスト済み）

### Pythonパッケージ（自動インストール）

```
click>=8.0.0
opencv-python>=4.5.0
pytesseract>=0.3.8
Pillow>=8.0.0
numpy>=1.20.0
```

### システム依存関係

- **Tesseract OCR**: 上記セットアップ手順に従って手動インストール
- **macOS**: Homebrewが推奨
- **Linux**: apt/yum/dnf等のパッケージマネージャー
- **Windows**: 公式サイトからバイナリをダウンロード

## 🚨 トラブルシューティング

### よくある問題

#### 1. uvが見つからない
```bash
# エラー: command not found: uv
# 解決: uvをインストール
curl -LsSf https://astral.sh/uv/install.sh | sh
# 新しいシェルを開くか、パスを更新
source ~/.bashrc  # または ~/.zshrc
```

#### 2. Tesseract OCRのエラー
```bash
# エラー: tesseract is not installed
# 解決: 上記のセットアップ手順に従ってTesseract OCRをインストール

# macOS
brew install tesseract tesseract-lang

# Ubuntu/Debian  
sudo apt-get install -y tesseract-ocr tesseract-ocr-jpn

# バージョン確認
tesseract --version
```

#### 3. OCR認識精度が低い
```bash
# デバッグモードで中間画像を確認
cd tools
uv run python -m src.cli analyze image.png --debug
# debug_output/ ディレクトリで前処理結果を確認
```

#### 4. 環境テストの実行
```bash
cd tools
uv run python -m src.cli setup-test
# 環境の問題を自動診断
```

## 🔄 開発・カスタマイズ

- **新しいコース追加**: `src/types/index.ts`で型定義を拡張
- **OCR精度改善**: `tools/src/ocr.py`の画像前処理を調整
- **UI改善**: `src/components/`のReactコンポーネントを編集
- **グラフ追加**: Nivoの他のチャートタイプを`src/components/ScoreChart.tsx`に追加

## 📝 注意事項

- macOS環境でのテスト済み（Windowsでは一部調整が必要な場合があります）
- OCRの精度は画像品質に依存します
- このツールは個人使用を想定しており、寿司打ゲームの公式ツールではありません
