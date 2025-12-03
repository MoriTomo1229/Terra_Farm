// ==================== ゲーム状態 ====================
let state = {
  countryKey: null,
  year: '01',
  challenge: 'free',
  challengeStatus: 'pending',
  challengeProgress: null,
  turn: 0,
  turnInSeason: 0,
  season: 1,
  maxSeasons: 2,
  turnsPerSeason: TURN_COUNT,
  budget: 0,
  initialBudget: 0,
  totalFoodValue: 0,
  envScore: 70,
  techPoints: 0,
  eraIndex: 0,
  forecast: null,
  customPreset: null,
  chartData: [],
  baseMapPotential: [],   // 初期NDVI（不変）
  currentMapNdvi: [],     // 現在NDVI（更新）
  avgNdvi: 0,
  soilMoisture: 0,
  precipitation: 0,
  temperature: 0,
  history: [],
  unlocked: {},
  skillUsed: false,
  skillTiers: {},
  tutorialCompleted: false
};
