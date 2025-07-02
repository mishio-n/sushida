import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'vite';

// CLIスコアデータの型定義
interface CLIScoreData {
  course: string;
  result: number;
  detail: {
    payed: number;
    gain: number;
  };
  typing: {
    correct: number;
    avarageTPS: number;
    miss: number;
  };
}

interface ScoreFileData {
  data: CLIScoreData;
  filename: string;
}

// ビルド時にscoreディレクトリからJSONファイルを読み込む
const loadScoreData = (): ScoreFileData[] => {
  const scoreDir = join(__dirname, 'score');
  try {
    if (!existsSync(scoreDir)) {
      console.warn('Score directory not found, using empty array');
      return [];
    }
    
    const files = readdirSync(scoreDir).filter((file: string) => file.endsWith('.json'));
    const scores = files.map((file: string) => {
      const content = readFileSync(join(scoreDir, file), 'utf-8');
      return {
        data: JSON.parse(content) as CLIScoreData,
        filename: file
      };
    });
    
    console.log(`Loaded ${scores.length} score files for build`);
    return scores.sort((a: ScoreFileData, b: ScoreFileData) => 
      a.filename.localeCompare(b.filename)
    );
  } catch (error) {
    console.warn('Error loading score data:', error);
    return [];
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // ビルド時にスコアデータを定数として埋め込む
    __SCORE_DATA__: JSON.stringify(loadScoreData()),
  },
})
