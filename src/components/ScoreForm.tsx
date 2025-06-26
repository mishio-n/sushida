import React, { useState } from "react";
import { useScoreStore } from "../stores/scoreStore";
import type { GameScore } from "../types";

interface ScoreFormProps {
  onClose?: () => void;
  editingScore?: GameScore | null;
}

export const ScoreForm: React.FC<ScoreFormProps> = ({
  onClose,
  editingScore,
}) => {
  const { addScore, updateScore } = useScoreStore();

  const [formData, setFormData] = useState({
    date: editingScore?.date || new Date().toISOString().split("T")[0],
    course: editingScore?.course || "",
    result: editingScore?.result || 0,
    payed: editingScore?.detail.payed || 0,
    gain: editingScore?.detail.gain || 0,
    correct: editingScore?.typing.correct || 0,
    avarageTPS: editingScore?.typing.avarageTPS || 0,
    miss: editingScore?.typing.miss || 0,
  });

  const [jsonInput, setJsonInput] = useState("");
  const [inputMode, setInputMode] = useState<"form" | "json">("form");

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scoreData = {
      date: formData.date,
      course: formData.course,
      result: Number(formData.result),
      detail: {
        payed: Number(formData.payed),
        gain: Number(formData.gain),
      },
      typing: {
        correct: Number(formData.correct),
        avarageTPS: Number(formData.avarageTPS),
        miss: Number(formData.miss),
      },
    };

    if (editingScore) {
      updateScore(editingScore.id, scoreData);
    } else {
      addScore(scoreData);
    }

    onClose?.();
  };

  const handleJsonSubmit = () => {
    try {
      const data = JSON.parse(jsonInput);

      const scoreData = {
        date: new Date().toISOString().split("T")[0],
        course: data.course,
        result: data.result,
        detail: data.detail,
        typing: data.typing,
      };

      addScore(scoreData);
      setJsonInput("");
      onClose?.();
    } catch {
      alert("JSONの形式が正しくありません。");
    }
  };

  return (
    <div className="score-form">
      <div className="form-header">
        <h2>{editingScore ? "スコア編集" : "スコア追加"}</h2>
        <div className="mode-selector">
          <button
            type="button"
            className={inputMode === "form" ? "active" : ""}
            onClick={() => setInputMode("form")}
          >
            フォーム入力
          </button>
          <button
            type="button"
            className={inputMode === "json" ? "active" : ""}
            onClick={() => setInputMode("json")}
          >
            JSON入力
          </button>
        </div>
      </div>

      {inputMode === "form" ? (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="date">日付</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">コース</label>
            <select
              id="course"
              value={formData.course}
              onChange={(e) => handleInputChange("course", e.target.value)}
              required
            >
              <option value="">選択してください</option>
              <option value="お手軽">お手軽</option>
              <option value="お勧め">お勧め</option>
              <option value="高級">高級</option>
              <option value="激辛">激辛</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="result">結果スコア</label>
            <input
              type="number"
              id="result"
              value={formData.result}
              onChange={(e) =>
                handleInputChange("result", Number(e.target.value))
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="payed">支払い金額</label>
              <input
                type="number"
                id="payed"
                value={formData.payed}
                onChange={(e) =>
                  handleInputChange("payed", Number(e.target.value))
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gain">獲得金額</label>
              <input
                type="number"
                id="gain"
                value={formData.gain}
                onChange={(e) =>
                  handleInputChange("gain", Number(e.target.value))
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="correct">正打数</label>
              <input
                type="number"
                id="correct"
                value={formData.correct}
                onChange={(e) =>
                  handleInputChange("correct", Number(e.target.value))
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="miss">誤打数</label>
              <input
                type="number"
                id="miss"
                value={formData.miss}
                onChange={(e) =>
                  handleInputChange("miss", Number(e.target.value))
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="avarageTPS">平均TPS</label>
            <input
              type="number"
              step="0.1"
              id="avarageTPS"
              value={formData.avarageTPS}
              onChange={(e) =>
                handleInputChange("avarageTPS", Number(e.target.value))
              }
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              キャンセル
            </button>
            <button type="submit" className="submit-btn">
              {editingScore ? "更新" : "追加"}
            </button>
          </div>
        </form>
      ) : (
        <div className="json-input-container">
          <label htmlFor="jsonInput">JSONデータ</label>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{
  "course": "お手軽",
  "result": -2400,
  "detail": {
    "payed": 3000,
    "gain": 600
  },
  "typing": {
    "correct": 35,
    "avarageTPS": 0.6,
    "miss": 20
  }
}`}
            rows={15}
          />
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleJsonSubmit}
              className="submit-btn"
            >
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
