import type { GameScore } from '../types';

export const sampleData: Omit<GameScore, 'id'>[] = [
  {
    date: '2025-01-15',
    course: 'お手軽',
    result: -1200,
    detail: {
      payed: 3000,
      gain: 1800
    },
    typing: {
      correct: 42,
      avarageTPS: 0.8,
      miss: 15
    }
  },
  {
    date: '2025-01-16',
    course: 'お手軽',
    result: 600,
    detail: {
      payed: 3000,
      gain: 3600
    },
    typing: {
      correct: 58,
      avarageTPS: 1.2,
      miss: 8
    }
  },
  {
    date: '2025-01-17',
    course: 'お勧め',
    result: -2400,
    detail: {
      payed: 5000,
      gain: 2600
    },
    typing: {
      correct: 35,
      avarageTPS: 0.6,
      miss: 20
    }
  },
  {
    date: '2025-01-18',
    course: 'お勧め',
    result: 1000,
    detail: {
      payed: 5000,
      gain: 6000
    },
    typing: {
      correct: 72,
      avarageTPS: 1.5,
      miss: 12
    }
  },
  {
    date: '2025-01-19',
    course: '高級',
    result: -3600,
    detail: {
      payed: 10000,
      gain: 6400
    },
    typing: {
      correct: 28,
      avarageTPS: 0.4,
      miss: 25
    }
  },
  {
    date: '2025-01-20',
    course: '高級',
    result: 2000,
    detail: {
      payed: 10000,
      gain: 12000
    },
    typing: {
      correct: 95,
      avarageTPS: 1.8,
      miss: 10
    }
  }
];

export const addSampleData = (addScore: (score: Omit<GameScore, 'id'>) => void) => {
  sampleData.forEach(score => {
    addScore(score);
  });
};
