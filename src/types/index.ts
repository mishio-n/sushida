// タイピングゲームのスコアデータ型定義

export interface TypingDetail {
  correct: number;
  avarageTPS: number;
  miss: number;
}

export interface ScoreDetail {
  payed: number;
  gain: number;
}

export interface GameScore {
  id: string;
  date: string;
  course: string;
  result: number;
  detail: ScoreDetail;
  typing: TypingDetail;
}

// CLIツールで生成されるJSONデータの型定義
export interface CLIScoreData {
  course: string;
  result: number;
  detail: ScoreDetail;
  typing: TypingDetail;
}

// グラフ用のデータ型
export interface ChartDataPoint {
  x: string;
  y: number;
}

export interface LineChartData {
  id: string;
  data: ChartDataPoint[];
}

// 統計情報の型
export interface Statistics {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averageAccuracy: number;
  averageTPS: number;
  totalCorrectTypes: number;
  totalMissTypes: number;
}

// コース別の統計型
export interface CourseStatistics {
  [course: string]: Statistics;
}
