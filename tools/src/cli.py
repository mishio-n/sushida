import click
import json
import sys
from pathlib import Path
from typing import List, Optional
from .ocr import SushidaOCR
from .parser import SushidaResultParser
from .utils import (
    OutputFormatter, ensure_directory, get_output_file_path,
    validate_image_file, format_file_size
)


@click.group()
@click.version_option(version="1.0.0")
@click.pass_context
def main(ctx):
    """🍣 寿司打の結果画面からスコアデータを抽出するCLIツール"""
    ctx.ensure_object(dict)


@main.command()
@click.argument('image_path', type=click.Path(exists=True, path_type=Path))
@click.option('--output', '-o', type=click.Path(path_type=Path), 
              help='出力ファイルパス（拡張子は自動で付与）')
@click.option('--format', 'output_format', type=click.Choice(['json', 'csv']), 
              default='json', help='出力フォーマット')
@click.option('--debug', is_flag=True, help='デバッグモード（中間画像を保存）')
@click.option('--quiet', '-q', is_flag=True, help='結果のみ表示（進捗メッセージを非表示）')
def analyze(image_path: Path, output: Optional[Path], output_format: str, debug: bool, quiet: bool):
    """単一の画像ファイルを解析してスコアデータを抽出"""
    
    if not quiet:
        click.echo(f"🍣 画像を解析中: {image_path}")
        click.echo(f"📁 ファイルサイズ: {format_file_size(image_path)}")
    
    # 画像ファイルの検証
    if not validate_image_file(image_path):
        click.echo(f"❌ サポートされていない画像形式です: {image_path}", err=True)
        sys.exit(1)
    
    try:
        # OCR実行
        if not quiet:
            click.echo("🔍 OCR処理中...")
        
        ocr = SushidaOCR(debug=debug)
        
        # OCRセットアップテスト
        if not ocr.test_ocr_setup():
            click.echo("❌ OCRセットアップに問題があります。Tesseractが正しくインストールされているか確認してください。", err=True)
            sys.exit(1)
        
        text = ocr.extract_text(image_path)
        
        if not text.strip():
            click.echo("❌ 画像からテキストを抽出できませんでした", err=True)
            sys.exit(1)
        
        # 結果パース
        if not quiet:
            click.echo("📊 データをパース中...")
        
        parser = SushidaResultParser()
        result = parser.parse(text)
        
        if not result:
            click.echo("❌ スコアデータを抽出できませんでした", err=True)
            if debug:
                click.echo("抽出されたテキスト:")
                click.echo(text)
            sys.exit(1)
        
        # 結果表示
        if not quiet:
            summary = parser.format_result_summary(result)
            click.echo(summary)
        
        # 出力処理
        if output:
            output_path = get_output_file_path(output, output_format)
            ensure_directory(output_path)
            
            if output_format == 'json':
                OutputFormatter.save_json(result, output_path)
            elif output_format == 'csv':
                OutputFormatter.save_csv(result, output_path)
            
            if not quiet:
                click.echo(f"💾 結果を保存: {output_path}")
        else:
            # 出力先が指定されていない場合はscoreディレクトリに保存
            score_dir = Path("../score")  # toolsディレクトリからプロジェクトルートのscoreディレクトリへの相対パス
            score_dir.mkdir(parents=True, exist_ok=True)
            
            # 画像ファイル名からJSONファイル名を生成
            image_stem = image_path.stem  # 拡張子を除いたファイル名
            filename = f"{image_stem}.json"
            output_path = score_dir / filename
            
            if output_format == 'json':
                OutputFormatter.save_json(result, output_path)
                if not quiet:
                    click.echo(f"💾 結果を保存: {output_path}")
            else:
                # 標準出力にJSON表示（CSV形式での標準出力は複雑なので、JSONで出力）
                print(json.dumps(result, indent=2, ensure_ascii=False))
                
    except KeyboardInterrupt:
        click.echo("\n⚠️  処理が中断されました", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"❌ エラーが発生しました: {e}", err=True)
        if debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)


@main.command()
@click.argument('image_paths', nargs=-1, type=click.Path(exists=True, path_type=Path))
@click.option('--output-dir', '-o', type=click.Path(path_type=Path), 
              help='出力ディレクトリ（指定しない場合は標準出力）')
@click.option('--format', 'output_format', type=click.Choice(['json', 'csv']), 
              default='json', help='出力フォーマット')
@click.option('--debug', is_flag=True, help='デバッグモード')
@click.option('--continue-on-error', is_flag=True, help='エラーが発生しても処理を続行')
def batch(image_paths: List[Path], output_dir: Optional[Path], output_format: str, 
          debug: bool, continue_on_error: bool):
    """複数の画像ファイルを一括処理"""
    
    if not image_paths:
        click.echo("❌ 処理する画像ファイルが指定されていません", err=True)
        sys.exit(1)
    
    click.echo(f"🍣 {len(image_paths)}個のファイルを処理中...")
    
    results = []
    failed_files = []
    
    ocr = SushidaOCR(debug=debug)
    parser = SushidaResultParser()
    
    # OCRセットアップテスト
    if not ocr.test_ocr_setup():
        click.echo("❌ OCRセットアップに問題があります", err=True)
        sys.exit(1)
    
    with click.progressbar(image_paths, label="処理中") as bar:
        for image_path in bar:
            try:
                if not validate_image_file(image_path):
                    if continue_on_error:
                        failed_files.append((image_path, "サポートされていない画像形式"))
                        continue
                    else:
                        click.echo(f"❌ サポートされていない画像形式: {image_path}", err=True)
                        sys.exit(1)
                
                text = ocr.extract_text(image_path)
                result = parser.parse(text)
                
                if result:
                    # 画像ファイル名からJSONファイル名を決定
                    result['output_filename'] = f"{image_path.stem}.json"
                    results.append(result)
                else:
                    failed_files.append((image_path, "スコアデータを抽出できませんでした"))
                    if not continue_on_error:
                        sys.exit(1)
                        
            except Exception as e:
                failed_files.append((image_path, str(e)))
                if not continue_on_error:
                    click.echo(f"❌ エラー: {e}", err=True)
                    sys.exit(1)
    
    # 結果表示
    click.echo(f"\n✅ 処理完了: {len(results)}件成功, {len(failed_files)}件失敗")
    
    if failed_files:
        click.echo("\n❌ 失敗したファイル:")
        for file_path, error in failed_files:
            click.echo(f"  {file_path}: {error}")
    
    if not results:
        click.echo("処理可能なファイルがありませんでした", err=True)
        sys.exit(1)
    
    # 出力処理
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        
        if output_format == 'json':
            # 個別のJSONファイルとして保存
            for result in results:
                output_file = output_dir / result['output_filename']
                # 出力用のデータから内部フィールドを除去
                clean_result = {k: v for k, v in result.items() if k not in ['output_filename']}
                OutputFormatter.save_json(clean_result, output_file)
            click.echo(f"💾 {len(results)}個のファイルを保存: {output_dir}")
        elif output_format == 'csv':
            # CSVの場合は一括ファイルとして保存
            output_file = output_dir / f"batch_results.csv"
            # 出力用のデータから内部フィールドを除去
            clean_results = [{k: v for k, v in result.items() if k not in ['output_filename']} for result in results]
            OutputFormatter.save_csv(clean_results, output_file)
            click.echo(f"💾 結果を保存: {output_file}")
    else:
        # 出力先が指定されていない場合はscoreディレクトリに保存
        score_dir = Path("../score")  # toolsディレクトリからプロジェクトルートのscoreディレクトリへの相対パス
        score_dir.mkdir(parents=True, exist_ok=True)
        
        if output_format == 'json':
            # 個別のJSONファイルとして保存
            for result in results:
                output_file = score_dir / result['output_filename']
                # 出力用のデータから内部フィールドを除去
                clean_result = {k: v for k, v in result.items() if k not in ['output_filename']}
                OutputFormatter.save_json(clean_result, output_file)
            click.echo(f"💾 {len(results)}個のファイルを保存: {score_dir}")
        elif output_format == 'csv':
            # CSVの場合はタイムスタンプ付きファイルとして保存
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = score_dir / f"batch_results_{timestamp}.csv"
            # 出力用のデータから内部フィールドを除去
            clean_results = [{k: v for k, v in result.items() if k not in ['output_filename']} for result in results]
            OutputFormatter.save_csv(clean_results, output_file)
            click.echo(f"💾 結果を保存: {output_file}")


@main.command()
@click.argument('image_path', type=click.Path(exists=True, path_type=Path))
def test(image_path: Path):
    """画像に対してOCRテストを実行（デバッグ用）"""
    
    click.echo(f"🔍 OCRテスト: {image_path}")
    
    try:
        ocr = SushidaOCR(debug=True)
        
        if not ocr.test_ocr_setup():
            click.echo("❌ OCRセットアップに問題があります", err=True)
            return
        
        text = ocr.extract_text(image_path)
        
        click.echo("=" * 50)
        click.echo("抽出されたテキスト:")
        click.echo(text)
        click.echo("=" * 50)
        
        parser = SushidaResultParser()
        result = parser.parse(text)
        
        if result:
            click.echo("パース結果:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            click.echo("❌ パースに失敗しました")
            
    except Exception as e:
        click.echo(f"❌ エラー: {e}", err=True)
        import traceback
        traceback.print_exc()


@main.command()
def setup_test():
    """OCR環境のセットアップをテスト"""
    
    click.echo("🔧 OCR環境をテスト中...")
    
    try:
        ocr = SushidaOCR()
        
        if ocr.test_ocr_setup():
            click.echo("✅ OCR環境は正常に動作しています")
            click.echo(f"Tesseractパス: {ocr.tesseract_cmd}")
        else:
            click.echo("❌ OCR環境に問題があります")
            
    except Exception as e:
        click.echo(f"❌ エラー: {e}", err=True)


if __name__ == '__main__':
    main()
