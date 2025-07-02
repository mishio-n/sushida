import React, { useState } from "react";
import { useScoreStore } from "../stores/scoreStore";

export const ScoreList: React.FC = () => {
  const { scores } = useScoreStore();
  const [sortBy, setSortBy] = useState<"date" | "course" | "result">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedScores = [...scores].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case "course":
        aValue = a.course;
        bValue = b.course;
        break;
      case "result":
        aValue = a.result;
        bValue = b.result;
        break;
      default:
        aValue = a.date;
        bValue = b.date;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (column: "date" | "course" | "result") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const formatScore = (score: number): string => {
    return score > 0 ? `+${score}` : score.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const calculateAccuracy = (correct: number, miss: number): number => {
    const total = correct + miss;
    return total > 0 ? Math.round((correct / total) * 100 * 100) / 100 : 0;
  };

  return (
    <div className="score-list-container">
      <div className="list-header">
        <h3>スコア一覧</h3>
      </div>

      {scores.length === 0 ? (
        <div className="no-data">
          <p>スコアデータがありません</p>
          <p>
            CLIツールを使用してスクリーンショットからスコアを抽出してください
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="score-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("date")}
                  className="sortable"
                  title="日付でソート"
                >
                  日付
                  {sortBy === "date" && (sortOrder === "asc" ? " ↑" : " ↓")}
                </th>
                <th
                  onClick={() => handleSort("course")}
                  className="sortable"
                  title="コースでソート"
                >
                  コース
                  {sortBy === "course" && (sortOrder === "asc" ? " ↑" : " ↓")}
                </th>
                <th
                  onClick={() => handleSort("result")}
                  className="sortable"
                  title="結果でソート"
                >
                  結果
                  {sortBy === "result" && (sortOrder === "asc" ? " ↑" : " ↓")}
                </th>
                <th>支払い/獲得</th>
                <th>正打/誤打</th>
                <th>正確率</th>
                <th>平均TPS</th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map((score) => (
                <tr key={score.id}>
                  <td>{formatDate(score.date)}</td>
                  <td>
                    <div className="course-info">
                      <span className={`course-badge course-${score.course}`}>
                        {score.course}
                      </span>
                      {score.id.startsWith("cli-") && (
                        <span
                          className="cli-badge"
                          title="CLIツールで生成されたデータ"
                        >
                          🤖 OCR
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`result ${
                        score.result >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {formatScore(score.result)}円
                    </span>
                  </td>
                  <td>
                    <div className="detail-info">
                      <span className="payed">
                        支払い: {score.detail.payed}円
                      </span>
                      <span className="gain">獲得: {score.detail.gain}円</span>
                    </div>
                  </td>
                  <td>
                    <div className="typing-info">
                      <span className="correct">{score.typing.correct}</span>
                      <span className="separator">/</span>
                      <span className="miss">{score.typing.miss}</span>
                    </div>
                  </td>
                  <td>
                    {calculateAccuracy(score.typing.correct, score.typing.miss)}
                    %
                  </td>
                  <td>{score.typing.avarageTPS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
