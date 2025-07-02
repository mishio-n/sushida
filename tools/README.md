# 寿司打OCRツール

## 概要
寿司打のタイピングゲーム結果画面からスコアデータを自動抽出するCLIツールです。

## セットアップ

### 1. uvのインストール
まず、uvがインストールされていない場合はインストールしてください：

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# macOS（Homebrew使用）
brew install uv

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. Tesseractのインストール
OCRエンジンであるTesseractをインストールしてください：

```bash
# macOS
brew install tesseract tesseract-lang

# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-jpn

# Windows
# https://github.com/UB-Mannheim/tesseract/wiki からダウンロード
```

### 3. Python環境の構築
```bash
cd tools

# Python環境を作成（Python 3.11を使用）
uv venv --python 3.11

# 仮想環境をアクティベート
# macOS/Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

# 依存関係をインストール
uv pip install -e .
```

### 4. セットアップの確認
```bash
# OCR環境をテスト
python run.py setup-test

# または
python -m src.cli setup-test
```

## 使用方法

### 基本的な使用
```bash
# 仮想環境がアクティベートされていることを確認
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# 単一画像の解析（結果は自動的にscoreディレクトリに保存）
python run.py analyze screenshot.png

# または
python -m src.cli analyze screenshot.png
```

### 出力先を指定した保存
```bash
# 特定のファイルに出力
python run.py analyze screenshot.png -o result.json

# 特定のディレクトリに出力
python run.py analyze screenshot.png -o /path/to/output/result.json
```

### デバッグモード（中間画像を保存）
```bash
python run.py analyze screenshot.png --debug
```

### 複数ファイルを一括処理
```bash
# 複数ファイルを処理（結果は自動的にscoreディレクトリに保存）
python run.py batch screenshot1.png screenshot2.png screenshot3.png

# 特定のディレクトリに出力
python run.py batch screenshot1.png screenshot2.png screenshot3.png -o results/
```

### 出力フォーマット指定
```bash
python run.py analyze screenshot.png --format json
python run.py analyze screenshot.png --format csv
```

### ヘルプの表示
```bash
python run.py --help
python run.py analyze --help
python run.py batch --help
```

## 高度な使用方法

### パッケージとしてインストール後の使用
```bash
# パッケージとしてインストールした場合
sushida-ocr analyze screenshot.png
sushida-ocr batch *.png -o results/
```

### 環境変数での設定
```bash
# Tesseractのパスを手動指定
export TESSERACT_CMD=/usr/local/bin/tesseract
python run.py analyze screenshot.png
```

## 出力例
```json
{
  "timestamp": "2025-06-28T12:34:56.789012",
  "course": "お手軽",
  "result": -2400,
  "detail": {
    "payed": 3000,
    "gain": 600
  },
  "typing": {
    "correct": 35,
    "avarageTPS": 0.6,
    "miss": 20
  }
}
```

## 出力ファイルについて

### 自動保存先
出力先を指定しない場合、結果は自動的に以下のディレクトリに保存されます：
- **scoreディレクトリ**: `../score/` (プロジェクトルートのscoreディレクトリ)
- **ファイル名形式**: 
  - 単一ファイル: `YYYYMMDD.json` (画像ファイル名と同じ)
  - 一括処理（CSV）: `batch_results_YYYYMMDD_HHMMSS.csv`

### ファイル構造
```
sushida/
├── score/                    # OCR結果の保存先
│   ├── 20250407.json        # 20250407.png の解析結果
│   ├── 20250408.json        # 20250408.png の解析結果
│   ├── batch_results_20250628_123500.csv  # 一括処理結果（CSV）
│   └── ...
├── tools/                    # OCRツール
│   ├── src/
│   └── ...
├── 20250407.png             # 寿司打のスクリーンショット
├── 20250408.png
└── ...
```
