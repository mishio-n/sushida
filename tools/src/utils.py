import json
import csv
from pathlib import Path
from typing import Dict, List, Union
from datetime import datetime
import click


class OutputFormatter:
    """出力フォーマッターユーティリティ"""
    
    @staticmethod
    def save_json(data: Union[Dict, List[Dict]], output_path: Path, indent: int = 2):
        """JSON形式で保存"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=indent, ensure_ascii=False)
    
    @staticmethod
    def save_csv(data: Union[Dict, List[Dict]], output_path: Path):
        """CSV形式で保存"""
        # 単一の結果の場合はリストに変換
        if isinstance(data, dict):
            data = [data]
        
        if not data:
            return
        
        # CSVのヘッダーを定義
        fieldnames = [
            'timestamp', 'course', 'result', 'payed', 'gain',
            'correct', 'avarageTPS', 'miss'
        ]
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for item in data:
                # フラットな辞書に変換
                flat_item = {
                    'timestamp': item.get('timestamp', ''),
                    'course': item.get('course', ''),
                    'result': item.get('result', 0),
                    'payed': item.get('detail', {}).get('payed', 0),
                    'gain': item.get('detail', {}).get('gain', 0),
                    'correct': item.get('typing', {}).get('correct', 0),
                    'avarageTPS': item.get('typing', {}).get('avarageTPS', 0.0),
                    'miss': item.get('typing', {}).get('miss', 0)
                }
                writer.writerow(flat_item)
    
    @staticmethod
    def save_yaml(data: Union[Dict, List[Dict]], output_path: Path):
        """YAML形式で保存（yamlライブラリが利用可能な場合）"""
        try:
            import yaml
            with open(output_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True, indent=2)
        except ImportError:
            click.echo("⚠️  yamlライブラリがインストールされていません。pip install pyyamlでインストールしてください。", err=True)
            raise


def ensure_directory(file_path: Path) -> Path:
    """ディレクトリが存在しない場合は作成"""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    return file_path


def load_json_results(file_path: Path) -> List[Dict]:
    """JSONファイルから結果を読み込み"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                return [data]
            elif isinstance(data, list):
                return data
            else:
                return []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def append_to_json_file(result: Dict, file_path: Path):
    """JSONファイルに結果を追加（既存のファイルがある場合は配列として追加）"""
    existing_results = load_json_results(file_path)
    existing_results.append(result)
    
    ensure_directory(file_path)
    OutputFormatter.save_json(existing_results, file_path)


def get_output_file_path(output_path: Union[str, Path], format_type: str) -> Path:
    """出力ファイルパスを決定（拡張子を自動で付与）"""
    output_path = Path(output_path)
    
    # 拡張子がない場合は自動で追加
    if not output_path.suffix:
        if format_type == 'json':
            output_path = output_path.with_suffix('.json')
        elif format_type == 'csv':
            output_path = output_path.with_suffix('.csv')
        elif format_type == 'yaml':
            output_path = output_path.with_suffix('.yaml')
    
    return output_path


def format_file_size(file_path: Path) -> str:
    """ファイルサイズを人間が読みやすい形式で表示"""
    try:
        size = file_path.stat().st_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    except FileNotFoundError:
        return "0 B"


def create_backup_filename(original_path: Path) -> Path:
    """バックアップファイル名を生成"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name = original_path.stem
    suffix = original_path.suffix
    backup_name = f"{name}_backup_{timestamp}{suffix}"
    return original_path.parent / backup_name


def validate_image_file(file_path: Path) -> bool:
    """画像ファイルが有効かチェック"""
    if not file_path.exists():
        return False
    
    # 一般的な画像拡張子をチェック
    valid_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif'}
    return file_path.suffix.lower() in valid_extensions
