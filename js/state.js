// ==================== ゲーム状態 ====================
let state = {
  countryKey: null,
  year: '01',
  turn: 0,
  budget: 0,
  totalFoodValue: 0,
  envScore: 70,
  techPoints: 0,
  eraIndex: 0,
  baseMapPotential: [],   // 初期NDVI（不変）
  currentMapNdvi: [],     // 現在NDVI（更新）
  avgNdvi: 0,
  soilMoisture: 0,
  precipitation: 0,
  temperature: 0,
  history: [],
  unlocked: {},
  skillUsed: false
};
