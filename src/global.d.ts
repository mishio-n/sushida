// Viteの定義拡張
declare global {
  const __SCORE_DATA__: Array<{ 
    data: import('./types').CLIScoreData; 
    filename: string; 
  }>;
}

export {};
