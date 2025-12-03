// ==================== ゲーム状態 ====================
let state = {
  countryKey: null,
  year: '01',
  season: 1,
  seasonTurn: 0,
  challenge: 'free',
  challengeStatus: 'pending',
  challengeProgress: { completed: 0, total: 1, details: [] },
  turn: 0,
  budget: 0,
  initialBudget: 0,
  totalFoodValue: 0,
  envScore: 70,
  techPoints: 0,
  eraIndex: 0,
  skillTier: 1,
  customPreset: null,
  chartData: [],
  baseMapPotential: [],   // 初期NDVI（不変）
  currentMapNdvi: [],     // 現在NDVI（更新）
  avgNdvi: 0,
  soilMoisture: 0,
  precipitation: 0,
  temperature: 0,
  forecast: {
    next: null,
    riskNotes: []
  },
  history: [],
  unlocked: {},
  unlockedTechNodes: {},
  skillUsed: false
};
