import React, { useState } from "react";
import { useScoreStore } from "../stores/scoreStore";
import { ScoreForm } from "./ScoreForm";
import type { GameScore } from "../types";

export const ScoreList: React.FC = () => {
  const { getScores, deleteScore, demoMode } = useScoreStore();
  const scores = getScores();
  const [editingScore, setEditingScore] = useState<GameScore | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const handleEdit = (score: GameScore) => {
    setEditingScore(score);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("このスコアデータを削除しますか？")) {
      deleteScore(id);
    }
  };

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

  if (showForm) {
    return (
      <ScoreForm
        editingScore={editingScore}
        onClose={() => {
          setShowForm(false);
          setEditingScore(null);
        }}
      />
    );
  }

  return (
    <div className="score-list-container">
      <div className="list-header">
        <h3>スコア一覧</h3>
        <button 
          className="add-btn" 
          onClick={() => setShowForm(true)}
          disabled={demoMode}
        >
          新規追加
        </button>
      </div>

      {scores.length === 0 ? (
        <div className="no-data">
          <p>データがありません</p>
          <button 
            onClick={() => setShowForm(true)}
            disabled={demoMode}
          >
            最初のスコアを追加
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="score-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("date")}
                  className={`sortable ${sortBy === "date" ? sortOrder : ""}`}
                >
                  日付
                </th>
                <th
                  onClick={() => handleSort("course")}
                  className={`sortable ${sortBy === "course" ? sortOrder : ""}`}
                >
                  コース
                </th>
                <th
                  onClick={() => handleSort("result")}
                  className={`sortable ${sortBy === "result" ? sortOrder : ""}`}
                >
                  結果
                </th>
                <th>支払い/獲得</th>
                <th>正打/誤打</th>
                <th>正確率</th>
                <th>平均TPS</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map((score) => (
                <tr key={score.id}>
                  <td>{formatDate(score.date)}</td>
                  <td>
                    <span className={`course-badge course-${score.course}`}>
                      {score.course}
                    </span>
                  </td>
                  <td
                    className={`result ${
                      score.result > 0 ? "positive" : "negative"
                    }`}
                  >
                    {formatScore(score.result)}
                  </td>
                  <td>
                    <div className="payment-info">
                      <span className="payed">-{score.detail.payed}</span>
                      <span className="gain">+{score.detail.gain}</span>
                    </div>
                  </td>
                  <td>
                    <div className="typing-info">
                      <span className="correct">{score.typing.correct}</span>
                      <span className="miss">{score.typing.miss}</span>
                    </div>
                  </td>
                  <td>
                    {calculateAccuracy(score.typing.correct, score.typing.miss)}
                    %
                  </td>
                  <td>{score.typing.avarageTPS}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(score)}
                        disabled={demoMode}
                      >
                        編集
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(score.id)}
                        disabled={demoMode}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
