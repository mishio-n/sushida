import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameScore, Statistics, CourseStatistics } from '../types';
import { generateDemoData } from '../utils/sampleData';

interface ScoreStore {
  scores: GameScore[];
  demoMode: boolean;
  addScore: (score: Omit<GameScore, 'id'>) => void;
  updateScore: (id: string, score: Partial<GameScore>) => void;
  deleteScore: (id: string) => void;
  getScoresByDateRange: (startDate: string, endDate: string) => GameScore[];
  getScoresByCourse: (course: string) => GameScore[];
  getStatistics: () => Statistics;
  getCourseStatistics: () => CourseStatistics;
  clearAll: () => void;
  setDemoMode: (enabled: boolean) => void;
  getScores: () => GameScore[];
}

const calculateStatistics = (scores: GameScore[]): Statistics => {
  if (scores.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      averageAccuracy: 0,
      averageTPS: 0,
      totalCorrectTypes: 0,
      totalMissTypes: 0,
    };
  }

  const totalCorrectTypes = scores.reduce((sum, score) => sum + score.typing.correct, 0);
  const totalMissTypes = scores.reduce((sum, score) => sum + score.typing.miss, 0);
  const totalTypes = totalCorrectTypes + totalMissTypes;

  return {
    totalGames: scores.length,
    averageScore: scores.reduce((sum, score) => sum + score.result, 0) / scores.length,
    bestScore: Math.max(...scores.map(score => score.result)),
    worstScore: Math.min(...scores.map(score => score.result)),
    averageAccuracy: totalTypes > 0 ? (totalCorrectTypes / totalTypes) * 100 : 0,
    averageTPS: scores.reduce((sum, score) => sum + score.typing.avarageTPS, 0) / scores.length,
    totalCorrectTypes,
    totalMissTypes,
  };
};

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      scores: [],
      demoMode: false,

      addScore: (scoreData) => {
        // デモモード時は実データに追加しない
        if (get().demoMode) return;
        
        const newScore: GameScore = {
          ...scoreData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        
        set((state) => ({
          scores: [...state.scores, newScore].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }));
      },

      updateScore: (id, scoreData) => {
        // デモモード時は更新しない
        if (get().demoMode) return;
        
        set((state) => ({
          scores: state.scores.map((score) =>
            score.id === id ? { ...score, ...scoreData } : score
          ),
        }));
      },

      deleteScore: (id) => {
        // デモモード時は削除しない
        if (get().demoMode) return;
        
        set((state) => ({
          scores: state.scores.filter((score) => score.id !== id),
        }));
      },

      getScores: () => {
        const state = get();
        return state.demoMode ? generateDemoData() : state.scores;
      },

      getScoresByDateRange: (startDate, endDate) => {
        const scores = get().getScores();
        return scores.filter((score) => {
          const scoreDate = new Date(score.date);
          return scoreDate >= new Date(startDate) && scoreDate <= new Date(endDate);
        });
      },

      getScoresByCourse: (course) => {
        return get().getScores().filter((score) => score.course === course);
      },

      getStatistics: () => {
        return calculateStatistics(get().getScores());
      },

      getCourseStatistics: () => {
        const scores = get().getScores();
        const courses = [...new Set(scores.map(score => score.course))];
        
        const courseStats: CourseStatistics = {};
        courses.forEach(course => {
          const courseScores = scores.filter(score => score.course === course);
          courseStats[course] = calculateStatistics(courseScores);
        });
        
        return courseStats;
      },

      clearAll: () => {
        set({ scores: [] });
      },

      setDemoMode: (enabled) => {
        set({ demoMode: enabled });
      },
    }),
    {
      name: 'typing-game-scores',
    }
  )
);
