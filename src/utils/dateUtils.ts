/**
 * ファイル名から日付を抽出するユーティリティ関数
 */

/**
 * ファイル名から日付文字列を抽出
 * 対応フォーマット: YYYYMMDD, YYYY-MM-DD, sushida_result_YYYYMMDD_HHMMSS
 */
export const extractDateFromFilename = (filename: string): string => {
  // 拡張子を除去
  const name = filename.replace(/\.[^/.]+$/, '');
  
  // パターン1: YYYYMMDD (8桁の数字)
  const yyyymmddMatch = name.match(/(\d{8})/);
  if (yyyymmddMatch) {
    const dateStr = yyyymmddMatch[1];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  // パターン2: YYYY-MM-DD
  const dashedDateMatch = name.match(/(\d{4}-\d{2}-\d{2})/);
  if (dashedDateMatch) {
    return dashedDateMatch[1];
  }
  
  // パターン3: sushida_result_YYYYMMDD_HHMMSS のようなフォーマット
  const prefixedMatch = name.match(/sushida_result_(\d{8})_\d{6}/);
  if (prefixedMatch) {
    const dateStr = prefixedMatch[1];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  // どのパターンにもマッチしない場合は今日の日付を返す
  return new Date().toISOString().split('T')[0];
};

/**
 * ファイル名が日付フォーマットとして有効かチェック
 */
export const isValidDateFilename = (filename: string): boolean => {
  const name = filename.replace(/\.[^/.]+$/, '');
  
  // YYYYMMDD パターン
  if (/^\d{8}$/.test(name)) {
    const year = parseInt(name.substring(0, 4));
    const month = parseInt(name.substring(4, 6));
    const day = parseInt(name.substring(6, 8));
    
    return year >= 2000 && year <= 9999 && 
           month >= 1 && month <= 12 && 
           day >= 1 && day <= 31;
  }
  
  // YYYY-MM-DD パターン
  if (/^\d{4}-\d{2}-\d{2}$/.test(name)) {
    const date = new Date(name);
    return !isNaN(date.getTime());
  }
  
  // sushida_result_YYYYMMDD_HHMMSS パターン
  if (/^sushida_result_\d{8}_\d{6}$/.test(name)) {
    return true;
  }
  
  return false;
};
