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
        """寿司打画面に特化した画像前処理（改善版）"""
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
        
        # 1. より積極的なリサイズ（OCR精度向上のため）
        height, width = img.shape[:2]
        target_width = 1200  # より大きなサイズにリサイズ
        if width < target_width:
            scale = target_width / width
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        if self.debug:
            cv2.imwrite('debug_02_resized.png', img)
        
        # 2. グレースケール変換
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        if self.debug:
            cv2.imwrite('debug_03_gray.png', gray)
        
        # 3. より強力なノイズ除去
        denoised = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # 4. ガンマ補正でコントラストを改善
        gamma = 1.2
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        enhanced = cv2.LUT(denoised, table)
        
        if self.debug:
            cv2.imwrite('debug_04_enhanced.png', enhanced)
        
        # 5. シャープニング（文字の境界を強調）
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        
        # 6. 適応的二値化（パラメータ調整）
        binary = cv2.adaptiveThreshold(
            sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # 7. モルフォロジー処理（改善）
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        processed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        # 8. 文字の太さを適度に調整
        kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
        processed = cv2.dilate(processed, kernel2, iterations=1)
        
        if self.debug:
            cv2.imwrite('debug_05_final.png', processed)
            click.echo("🔍 デバッグ: 最終処理画像を保存 -> debug_05_final.png")
        
        return processed
    
    def extract_text(self, image_path: Union[str, Path]) -> str:
        """OCRでテキスト抽出（改善版）"""
        try:
            processed_img = self.preprocess_image(image_path)
            
            # より精密なTesseract設定
            custom_config = r'''
                --oem 1 
                --psm 6 
                -l jpn
                -c tessedit_char_whitelist=0123456789お手軽普通高級円コースゲット払って損でした正しく打ったキーの数平均ミスタイプ回秒/×、。・-+,
                -c tessedit_char_blacklist=|Il
                -c load_system_dawg=0
                -c load_freq_dawg=0
            '''.strip()
            
            # 複数回OCRを実行して最も確実な結果を取得
            results = []
            
            # 1回目: 標準設定
            text1 = pytesseract.image_to_string(processed_img, config=custom_config)
            results.append(text1)
            
            # 2回目: より保守的な設定
            conservative_config = r'''
                --oem 1
                --psm 8
                -l jpn
                -c tessedit_char_whitelist=0123456789お手軽普通高級円コースゲット払って損でした正しく打ったキーの数平均ミスタイプ回秒/×、。・-+,
            '''.strip()
            text2 = pytesseract.image_to_string(processed_img, config=conservative_config)
            results.append(text2)
            
            # 最も長いテキストを選択（通常はより多くの情報を含む）
            text = max(results, key=len)
            
            if self.debug:
                click.echo(f"🔍 抽出されたテキスト (設定1):\n{text1}")
                click.echo(f"🔍 抽出されたテキスト (設定2):\n{text2}")
                click.echo(f"🔍 選択されたテキスト:\n{text}")
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
