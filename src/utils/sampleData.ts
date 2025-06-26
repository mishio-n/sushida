import type { GameScore } from '../types';

export const sampleData: Omit<GameScore, 'id'>[] = [
  {
    date: '2024-12-01',
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
    date: '2024-12-02',
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
    date: '2024-12-03',
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
    date: '2024-12-04',
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
    date: '2024-12-05',
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
    date: '2024-12-06',
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
  },
  {
    date: '2024-12-07',
    course: 'お手軽',
    result: 300,
    detail: {
      payed: 3000,
      gain: 3300
    },
    typing: {
      correct: 52,
      avarageTPS: 1.0,
      miss: 12
    }
  },
  {
    date: '2024-12-08',
    course: 'お手軽',
    result: -800,
    detail: {
      payed: 3000,
      gain: 2200
    },
    typing: {
      correct: 38,
      avarageTPS: 0.7,
      miss: 18
    }
  },
  {
    date: '2024-12-09',
    course: 'お勧め',
    result: 1500,
    detail: {
      payed: 5000,
      gain: 6500
    },
    typing: {
      correct: 78,
      avarageTPS: 1.6,
      miss: 10
    }
  },
  {
    date: '2024-12-10',
    course: 'お勧め',
    result: -1800,
    detail: {
      payed: 5000,
      gain: 3200
    },
    typing: {
      correct: 40,
      avarageTPS: 0.8,
      miss: 22
    }
  },
  {
    date: '2024-12-11',
    course: '高級',
    result: 3200,
    detail: {
      payed: 10000,
      gain: 13200
    },
    typing: {
      correct: 102,
      avarageTPS: 2.0,
      miss: 8
    }
  },
  {
    date: '2024-12-12',
    course: '高級',
    result: -4500,
    detail: {
      payed: 10000,
      gain: 5500
    },
    typing: {
      correct: 25,
      avarageTPS: 0.5,
      miss: 30
    }
  },
  {
    date: '2024-12-13',
    course: 'お手軽',
    result: 900,
    detail: {
      payed: 3000,
      gain: 3900
    },
    typing: {
      correct: 60,
      avarageTPS: 1.3,
      miss: 6
    }
  },
  {
    date: '2024-12-14',
    course: 'お手軽',
    result: -500,
    detail: {
      payed: 3000,
      gain: 2500
    },
    typing: {
      correct: 45,
      avarageTPS: 0.9,
      miss: 16
    }
  },
  {
    date: '2024-12-15',
    course: 'お勧め',
    result: 2100,
    detail: {
      payed: 5000,
      gain: 7100
    },
    typing: {
      correct: 85,
      avarageTPS: 1.7,
      miss: 9
    }
  },
  {
    date: '2024-12-16',
    course: 'お勧め',
    result: -1200,
    detail: {
      payed: 5000,
      gain: 3800
    },
    typing: {
      correct: 48,
      avarageTPS: 1.0,
      miss: 19
    }
  },
  {
    date: '2024-12-17',
    course: '高級',
    result: 4800,
    detail: {
      payed: 10000,
      gain: 14800
    },
    typing: {
      correct: 115,
      avarageTPS: 2.3,
      miss: 5
    }
  },
  {
    date: '2024-12-18',
    course: '高級',
    result: -2800,
    detail: {
      payed: 10000,
      gain: 7200
    },
    typing: {
      correct: 35,
      avarageTPS: 0.7,
      miss: 28
    }
  },
  {
    date: '2024-12-19',
    course: 'お手軽',
    result: 1200,
    detail: {
      payed: 3000,
      gain: 4200
    },
    typing: {
      correct: 65,
      avarageTPS: 1.4,
      miss: 5
    }
  },
  {
    date: '2024-12-20',
    course: 'お手軽',
    result: -300,
    detail: {
      payed: 3000,
      gain: 2700
    },
    typing: {
      correct: 48,
      avarageTPS: 1.0,
      miss: 14
    }
  },
  {
    date: '2024-12-21',
    course: 'お勧め',
    result: 2800,
    detail: {
      payed: 5000,
      gain: 7800
    },
    typing: {
      correct: 90,
      avarageTPS: 1.8,
      miss: 7
    }
  },
  {
    date: '2024-12-22',
    course: 'お勧め',
    result: -900,
    detail: {
      payed: 5000,
      gain: 4100
    },
    typing: {
      correct: 52,
      avarageTPS: 1.1,
      miss: 17
    }
  },
  {
    date: '2024-12-23',
    course: '高級',
    result: 5500,
    detail: {
      payed: 10000,
      gain: 15500
    },
    typing: {
      correct: 125,
      avarageTPS: 2.5,
      miss: 4
    }
  },
  {
    date: '2024-12-24',
    course: '高級',
    result: -1500,
    detail: {
      payed: 10000,
      gain: 8500
    },
    typing: {
      correct: 42,
      avarageTPS: 0.8,
      miss: 25
    }
  },
  {
    date: '2024-12-25',
    course: 'お手軽',
    result: 800,
    detail: {
      payed: 3000,
      gain: 3800
    },
    typing: {
      correct: 58,
      avarageTPS: 1.2,
      miss: 9
    }
  },
  {
    date: '2024-12-26',
    course: 'お手軽',
    result: -600,
    detail: {
      payed: 3000,
      gain: 2400
    },
    typing: {
      correct: 40,
      avarageTPS: 0.8,
      miss: 18
    }
  },
  {
    date: '2024-12-27',
    course: 'お勧め',
    result: 1800,
    detail: {
      payed: 5000,
      gain: 6800
    },
    typing: {
      correct: 82,
      avarageTPS: 1.6,
      miss: 11
    }
  },
  {
    date: '2024-12-28',
    course: 'お勧め',
    result: -1600,
    detail: {
      payed: 5000,
      gain: 3400
    },
    typing: {
      correct: 45,
      avarageTPS: 0.9,
      miss: 21
    }
  },
  {
    date: '2024-12-29',
    course: '高級',
    result: 6200,
    detail: {
      payed: 10000,
      gain: 16200
    },
    typing: {
      correct: 130,
      avarageTPS: 2.6,
      miss: 3
    }
  },
  {
    date: '2024-12-30',
    course: '高級',
    result: -3200,
    detail: {
      payed: 10000,
      gain: 6800
    },
    typing: {
      correct: 32,
      avarageTPS: 0.6,
      miss: 27
    }
  }
];

export const addSampleData = (addScore: (score: Omit<GameScore, 'id'>) => void) => {
  sampleData.forEach(score => {
    addScore(score);
  });
};

// デモモード用のサンプルデータをIDつきで生成
export const generateDemoData = (): GameScore[] => {
  return sampleData.map((score, index) => ({
    ...score,
    id: `demo-${index + 1}`,
  }));
};
