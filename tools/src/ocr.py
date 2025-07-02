import cv2
import pytesseract
import numpy as np
from PIL import Image
from pathlib import Path
import shutil
import sys
from typing import Union
import click


class SushidaOCR:
    """寿司打の結果画面に特化したOCRクラス"""
    
    def __init__(self, debug: bool = False):
        self.debug = debug
        self.tesseract_cmd = self._find_tesseract()
        if self.tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_cmd
        else:
            click.echo("❌ Tesseractが見つかりません。インストールしてください。", err=True)
            sys.exit(1)
    
    def _find_tesseract(self) -> Union[str, None]:
        """Tesseractのパスを自動検出"""
        # 一般的なパスを確認
        possible_paths = [
            shutil.which('tesseract'),
            '/usr/local/bin/tesseract',
            '/opt/homebrew/bin/tesseract',
            '/usr/bin/tesseract',
        ]
        
        for path in possible_paths:
            if path and Path(path).exists():
                return path
        return None
    
    def preprocess_image(self, image_path: Union[str, Path]) -> np.ndarray:
        """寿司打画面に特化した画像前処理"""
        image_path = Path(image_path)
        
        if not image_path.exists():
            raise FileNotFoundError(f"画像ファイルが見つかりません: {image_path}")
        
        # 画像読み込み
        img = cv2.imread(str(image_path))
        if img is None:
            raise ValueError(f"画像を読み込めません: {image_path}")
        
        if self.debug:
            cv2.imwrite('debug_01_original.png', img)
            click.echo("🔍 デバッグ: 元画像を保存 -> debug_01_original.png")
        
        # 1. リサイズ（OCR精度向上のため）
        height, width = img.shape[:2]
        if width < 800:
            scale = 800 / width
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        if self.debug:
            cv2.imwrite('debug_02_resized.png', img)
        
        # 2. グレースケール変換
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        if self.debug:
            cv2.imwrite('debug_03_gray.png', gray)
        
        # 3. ノイズ除去
        denoised = cv2.medianBlur(gray, 3)
        
        # 4. コントラスト強化
        enhanced = cv2.equalizeHist(denoised)
        
        if self.debug:
            cv2.imwrite('debug_04_enhanced.png', enhanced)
        
        # 5. 適応的二値化
        binary = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 15, 8
        )
        
        # 6. モルフォロジー処理（文字を太くして読みやすく）
        kernel = np.ones((2, 2), np.uint8)
        processed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        # 7. 輪郭の強化
        kernel2 = np.ones((1, 1), np.uint8)
        processed = cv2.dilate(processed, kernel2, iterations=1)
        
        if self.debug:
            cv2.imwrite('debug_05_final.png', processed)
            click.echo("🔍 デバッグ: 最終処理画像を保存 -> debug_05_final.png")
        
        return processed
    
    def extract_text(self, image_path: Union[str, Path]) -> str:
        """OCRでテキスト抽出"""
        try:
            processed_img = self.preprocess_image(image_path)
            
            # 寿司打特化のTesseract設定
            custom_config = r'''
                --oem 3 
                --psm 6 
                -l jpn
                -c tessedit_char_whitelist=0123456789お手軽普通高級円コースゲット払って損でした正しく打ったキーの数平均ミスタイプ回秒/×、。・
            '''.strip()
            
            # OCR実行
            text = pytesseract.image_to_string(processed_img, config=custom_config)
            
            if self.debug:
                click.echo(f"🔍 抽出されたテキスト:\n{text}")
                click.echo("-" * 50)
            
            return text.strip()
            
        except Exception as e:
            if self.debug:
                click.echo(f"❌ OCRエラー: {e}", err=True)
            raise
    
    def test_ocr_setup(self) -> bool:
        """OCRセットアップをテスト"""
        try:
            # 簡単なテスト画像でTesseractが動作するか確認
            test_img = np.ones((100, 300, 3), dtype=np.uint8) * 255
            cv2.putText(test_img, 'Test', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
            
            result = pytesseract.image_to_string(test_img, lang='eng')
            return len(result.strip()) > 0
        except Exception:
            return False
