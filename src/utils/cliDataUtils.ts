import type { CLIScoreData, GameScore } from '../types';
import { extractDateFromFilename } from './dateUtils';

/**
 * CLIツールで生成されたスコアデータをGameScore形式に変換
 */
export const convertCLIDataToGameScore = (
  cliData: CLIScoreData, 
  filename: string
): GameScore => {
  // ファイル名を除去してIDとして使用
  const fileBaseName = filename.replace('.json', '');
  
  // ファイル名から日付を抽出
  const date = extractDateFromFilename(filename);
  
  return {
    id: `cli-${fileBaseName}`, // CLIデータを識別するためのプレフィックス
    date,
    course: cliData.course,
    result: cliData.result,
    detail: cliData.detail,
    typing: cliData.typing,
  };
};

/**
 * 複数のCLIデータを一括変換
 */
export const convertMultipleCLIData = (
  cliDataWithFilenames: Array<{ data: CLIScoreData; filename: string }>
): GameScore[] => {
  return cliDataWithFilenames.map(({ data, filename }) => 
    convertCLIDataToGameScore(data, filename)
  );
};

/**
 * 重複データをチェック（同じファイル名のデータがあるかどうか）
 */
export const findDuplicateByFileName = (
  existingScores: GameScore[],
  newScore: GameScore
): GameScore | undefined => {
  return existingScores.find(score => 
    score.id.startsWith('cli-') && score.id === newScore.id
  );
};

/**
 * CLIデータと既存データをマージ（重複は上書き）
 */
export const mergeScoreData = (
  existingScores: GameScore[],
  cliDataWithFilenames: Array<{ data: CLIScoreData; filename: string }>
): GameScore[] => {
  const convertedScores = convertMultipleCLIData(cliDataWithFilenames);
  const mergedScores = [...existingScores];
  
  convertedScores.forEach(newScore => {
    const existingIndex = mergedScores.findIndex(score => 
      score.id === newScore.id
    );
    
    if (existingIndex >= 0) {
      // 既存データを更新
      mergedScores[existingIndex] = newScore;
    } else {
      // 新規データを追加
      mergedScores.push(newScore);
    }
  });
  
  // 日付順でソート
  return mergedScores.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
