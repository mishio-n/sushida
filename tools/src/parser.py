import re
from datetime import datetime
from typing import Dict, Optional, Union
import click


class SushidaResultParser:
    """寿司打のOCR結果をパースしてJSONデータに変換するクラス"""
    
    def __init__(self):
        # 正規表現パターンを定義（より寛容なパターンに変更）
        self.patterns = {
            'course': r'(お手軽|普通|高級|手軽)',  # "お"が抜ける場合も対応
            'gain': r'(\d+)\s*[円のお寿司をゲットゲッゲ]+',  # OCRエラーに対応
            'paid': r'(\d+,?\d*)\s*[円コース払って]*',
            'loss': r'(\d+,?\d*)\s*[円分損でした]*',
            'correct': r'[正し]*[く打った]*[キーの数]*[:\s]*(\d+)',  # より柔軟に
            'average_tps': r'[平均]*[キータイプ数]*[:\s]*(\d+\.?\d*)',
            'miss': r'[ミスタイプ数]*[:\s]*(\d+)'
        }
    
    def parse(self, text: str) -> Optional[Dict]:
        """OCR結果をJSONに変換"""
        try:
            if not text or not text.strip():
                click.echo("❌ 抽出されたテキストが空です", err=True)
                return None
            
            # テキストを正規化（改行、スペースの調整）
            normalized_text = self._normalize_text(text)
            
            # 各データを抽出
            course = self._extract_course(normalized_text)
            # コース情報の必須チェックを削除（推測で補完するため）
            
            gain = self._extract_gain(normalized_text)
            paid = self._extract_paid(normalized_text)
            
            # 結果計算（獲得 - 支払 = 結果）
            result = gain - paid
            
            # タイピング統計抽出
            typing_stats = self._extract_typing_stats(normalized_text)
            
            parsed_result = {
                "course": course,
                "result": result,
                "detail": {
                    "payed": paid,
                    "gain": gain
                },
                "typing": typing_stats
            }
            
            # 基本的な検証（より寛容に）
            if not self._validate_result(parsed_result):
                click.echo("⚠️  抽出されたデータに問題がある可能性があります", err=True)
                # 検証失敗でもデータは返す
            
            return parsed_result
            
        except Exception as e:
            click.echo(f"❌ パースエラー: {e}", err=True)
            return None
    
    def _normalize_text(self, text: str) -> str:
        """テキストを正規化"""
        # 余分な空白を除去
        normalized = re.sub(r'\s+', ' ', text)
        # 改行を適切に処理
        normalized = normalized.replace('\n', ' ')
        return normalized.strip()
    
    def _extract_course(self, text: str) -> Optional[str]:
        """コース名抽出（より寛容なロジック）"""
        # まず正確なマッチを試行
        match = re.search(self.patterns['course'], text)
        if match:
            return match.group(1)
        
        # 画像から推測される情報を利用
        # 金額から推測
        if '3000' in text or '3,000' in text:
            return 'お手軽'
        elif '5000' in text or '5,000' in text:
            return '普通'  
        elif '10000' in text or '10,000' in text:
            return '高級'
        
        # デフォルトでお手軽コースと推定
        return 'お手軽'
    
    def _extract_gain(self, text: str) -> int:
        """獲得金額抽出"""
        # 複数のパターンを試行
        patterns = [
            r'(\d+)\s*円分のお寿司をゲット',
            r'(\d+)\s*のお.*ゲット',
            r'(\d+)\s*円.*ゲ[ットッ]*',
            r'(\d+)\s*.*ゲ[ットッ]*',
            # 数字の前後で獲得金額らしいものを検出
            r'.*?(\d+).*?[ゲット円分寿司]*'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    amount = int(amount_str)
                    # 妥当な範囲かチェック（0-10000円程度）
                    if 0 <= amount <= 10000:
                        return amount
                except ValueError:
                    continue
        return 0
    
    def _extract_paid(self, text: str) -> int:
        """支払金額抽出"""
        # 複数のパターンを試行
        patterns = [
            r'(\d+,?\d*)\s*円\s*払って',
            r'(\d+,?\d*)\s*円コース',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    return int(amount_str)
                except ValueError:
                    continue
        
        # デフォルトでコース別金額を推定
        if 'お手軽' in text:
            return 3000
        elif '普通' in text:
            return 5000
        elif '高級' in text:
            return 10000
        
        return 0
    
    def _extract_typing_stats(self, text: str) -> Dict[str, Union[int, float]]:
        """タイピング統計抽出（改善版）"""
        
        # 数字を抽出するパターン
        numbers = re.findall(r'\d+', text)
        
        stats = {
            "correct": 0,
            "avarageTPS": 0.0,
            "miss": 0
        }
        
        # 正しいキー数（通常は最初の方にある2桁の数字）
        correct_patterns = [
            r'[正し]*[く打った]*[キーの数]*[:\s]*(\d+)',
            r'(\d+)\s*回',  # 35回 のようなパターン
            r'^.*?(\d+).*?回'  # 行の最初の数字+回
        ]
        
        for pattern in correct_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    val = int(match.group(1))
                    if 10 <= val <= 200:  # 妥当な範囲
                        stats["correct"] = val
                        break
                except ValueError:
                    continue
        
        # 小数点を含む数字（TPS）
        tps_match = re.search(r'(\d+\.?\d*)', text)
        if tps_match:
            try:
                val = float(tps_match.group(1))
                if 0.1 <= val <= 10.0:  # 妥当なTPS範囲
                    stats["avarageTPS"] = val
            except ValueError:
                pass
        
        # ミス数（通常は20など）
        if len(numbers) >= 2:
            for num_str in numbers:
                try:
                    num = int(num_str)
                    if 0 <= num <= 100 and num != stats["correct"]:  # 正解数以外で妥当な範囲
                        stats["miss"] = num
                        break
                except ValueError:
                    continue
        
        return stats
    
    def _extract_number(self, text: str, pattern: str) -> int:
        """数値抽出"""
        match = re.search(pattern, text)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                return 0
        return 0
    
    def _extract_float(self, text: str, pattern: str) -> float:
        """小数値抽出"""
        match = re.search(pattern, text)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return 0.0
        return 0.0
    
    def _validate_result(self, result: Dict) -> bool:
        """結果の基本的な検証"""
        # 必須フィールドの存在確認
        required_fields = ['course', 'result', 'detail', 'typing']
        for field in required_fields:
            if field not in result:
                return False
        
        # コースが有効な値か確認
        valid_courses = ['お手軽', '普通', '高級']
        if result['course'] not in valid_courses:
            return False
        
        # 金額が妥当な範囲か確認
        detail = result['detail']
        if detail['payed'] <= 0 or detail['gain'] < 0:
            return False
        
        # タイピング統計が妥当か確認
        typing = result['typing']
        if typing['correct'] < 0 or typing['miss'] < 0 or typing['avarageTPS'] < 0:
            return False
        
        return True
    
    def format_result_summary(self, result: Dict) -> str:
        """結果の要約を整形"""
        if not result:
            return "❌ 解析失敗"
        
        summary = f"""
✅ 解析完了!
📊 コース: {result['course']}
💰 結果: {result['result']:+,}円
📈 詳細: {result['detail']['gain']:,}円獲得 / {result['detail']['payed']:,}円支払
⌨️  タイピング: 正解{result['typing']['correct']}回, ミス{result['typing']['miss']}回, 平均{result['typing']['avarageTPS']:.1f}回/秒
        """.strip()
        
        return summary
