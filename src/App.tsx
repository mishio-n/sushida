import { useState } from "react";
import { ScoreChart } from "./components/ScoreChart";
import { Statistics } from "./components/Statistics";
import { ScoreList } from "./components/ScoreList";
import { useScoreStore } from "./stores/scoreStore";
import { addSampleData } from "./utils/sampleData";
import "./App.css";

function App() {
  const { scores, addScore } = useScoreStore();
  const [activeTab, setActiveTab] = useState<"chart" | "list" | "stats">(
    "chart"
  );
  const [courseFilter, setCourseFilter] = useState<string>("");

  const courses = [...new Set(scores.map((score) => score.course))];

  const handleAddSampleData = () => {
    if (window.confirm("サンプルデータを追加しますか？")) {
      addSampleData(addScore);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍣 寿司打スコア管理システム</h1>
        <div className="header-controls">
          <div className="course-filter">
            <label htmlFor="courseFilter">コースフィルタ:</label>
            <select
              id="courseFilter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">全てのコース</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          {scores.length === 0 && (
            <button className="sample-data-btn" onClick={handleAddSampleData}>
              📊 サンプルデータを追加
            </button>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === "chart" ? "active" : ""}`}
          onClick={() => setActiveTab("chart")}
        >
          📈 グラフ
        </button>
        <button
          className={`nav-button ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          📋 スコア一覧
        </button>
        <button
          className={`nav-button ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📊 統計情報
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "chart" && (
          <ScoreChart courseFilter={courseFilter || undefined} />
        )}
        {activeTab === "list" && <ScoreList />}
        {activeTab === "stats" && (
          <Statistics courseFilter={courseFilter || undefined} />
        )}
      </main>

      <footer className="app-footer">
        <p>Total Games: {scores.length}</p>
      </footer>
    </div>
  );
}

export default App;
