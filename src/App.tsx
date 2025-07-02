import { useState } from "react";
import { ScoreChart } from "./components/ScoreChart";
import { Statistics } from "./components/Statistics";
import { ScoreList } from "./components/ScoreList";
import { useScoreStore } from "./stores/scoreStore";
import { useLoadCLIData } from "./hooks/useLoadCLIData";
import "./App.css";

function App() {
  const { scores } = useScoreStore();
  const { isDataLoaded } = useLoadCLIData(); // CLIデータの読み込み
  const [activeTab, setActiveTab] = useState<"chart" | "list" | "stats">(
    "chart"
  );
  const [courseFilter, setCourseFilter] = useState<string>("");

  const courses = [...new Set(scores.map((score) => score.course))];

  // データ読み込み中は読み込み画面を表示
  if (!isDataLoaded) {
    return (
      <div className="app loading-screen">
        <div className="loading-container">
          <h2>🍣 データを読み込み中...</h2>
          <p>CLIで生成されたスコアデータを読み込んでいます</p>
        </div>
      </div>
    );
  }

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
