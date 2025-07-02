import { useEffect } from 'react';
import { useScoreStore } from '../stores/scoreStore';

/**
 * アプリ起動時にCLIで生成されたスコアデータを読み込むカスタムフック
 */
export const useLoadCLIData = () => {
  const { loadCLIData, isDataLoaded } = useScoreStore();

  useEffect(() => {
    // データが既に読み込まれている場合はスキップ
    if (isDataLoaded) {
      return;
    }

    try {
      // Viteのdefineで埋め込まれたデータを取得
      const cliData = __SCORE_DATA__;
      
      if (Array.isArray(cliData) && cliData.length > 0) {
        console.log(`CLIで生成されたスコアデータを読み込み中... (${cliData.length}件)`);
        loadCLIData(cliData);
        console.log('CLIスコアデータの読み込みが完了しました');
      } else {
        console.log('CLIで生成されたスコアデータはありません');
        // データがない場合でもisDataLoadedをtrueにして重複実行を防ぐ
        loadCLIData([]);
      }
    } catch (error) {
      console.error('CLIスコアデータの読み込み中にエラーが発生しました:', error);
      // エラーが発生した場合でもisDataLoadedをtrueにして重複実行を防ぐ
      loadCLIData([]);
    }
  }, [loadCLIData, isDataLoaded]);

  return { isDataLoaded };
};
