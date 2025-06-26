import React from "react";
import { useScoreStore } from "../stores/scoreStore";

interface StatisticsProps {
  courseFilter?: string;
}

export const Statistics: React.FC<StatisticsProps> = ({ courseFilter }) => {
  const { getStatistics, getCourseStatistics } = useScoreStore();

  const stats = courseFilter
    ? getCourseStatistics()[courseFilter] || getStatistics()
    : getStatistics();

  if (stats.totalGames === 0) {
    return (
      <div className="statistics-container">
        <h3>統計情報</h3>
        <p>データがありません</p>
      </div>
    );
  }

  const formatNumber = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const formatScore = (score: number): string => {
    return score > 0 ? `+${score}` : score.toString();
  };

  return (
    <div className="statistics-container">
      <h3>統計情報{courseFilter && ` - ${courseFilter}`}</h3>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">総ゲーム数</div>
          <div className="stat-value">{stats.totalGames}回</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">平均スコア</div>
          <div className="stat-value">
            {formatScore(formatNumber(stats.averageScore))}
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">最高スコア</div>
          <div className="stat-value best-score">
            {formatScore(stats.bestScore)}
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">最低スコア</div>
          <div className="stat-value worst-score">
            {formatScore(stats.worstScore)}
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">平均正確率</div>
          <div className="stat-value">
            {formatNumber(stats.averageAccuracy)}%
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">平均TPS</div>
          <div className="stat-value">{formatNumber(stats.averageTPS)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">総正打数</div>
          <div className="stat-value">{stats.totalCorrectTypes}文字</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">総誤打数</div>
          <div className="stat-value">{stats.totalMissTypes}文字</div>
        </div>
      </div>
    </div>
  );
};
