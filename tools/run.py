#!/usr/bin/env python3
"""
寿司打OCRツールのエントリーポイント
"""

import sys
from pathlib import Path

# srcディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from src.cli import main

if __name__ == '__main__':
    main()
