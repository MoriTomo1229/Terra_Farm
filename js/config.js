// ==================== ゲーム設定 ====================
const COUNTRIES = {
  usa:    {name:'United States', startingBudget:200e9, climate:'temperate', preferred:'corn',   description:'Large temperate plains — corn and wheat thrive.', flag:'🇺🇸', skill:'AgriBoost'},
  china:  {name:'China',         startingBudget:180e9, climate:'varied',    preferred:'rice',   description:'Diverse climates — rice dominates irrigated regions.', flag:'🇨🇳', skill:'Dragon Plan'},
  india:  {name:'India',         startingBudget:120e9, climate:'tropical',  preferred:'rice',   description:'Monsoon climates favor rice and diverse crops.', flag:'🇮🇳', skill:'Monsoon Mastery'},
  brazil: {name:'Brazil',        startingBudget: 90e9, climate:'tropical',  preferred:'cassava',description:'Large tropics; cassava and soybeans common.', flag:'🇧🇷', skill:'Amazon Shield'},
  egypt:  {name:'Egypt',         startingBudget: 60e9, climate:'arid',      preferred:'barley', description:'Arid river valley — irrigation is crucial.', flag:'🇪🇬', skill:'Nile Blessing'},
  ireland:{name:'Ireland',       startingBudget: 15e9, climate:'cool',      preferred:'potato', description:'Cool wet climate — potatoes historically important.', flag:'🇮🇪', skill:'Emerald Surge'}
};

const CROPS = {
  rice:{name:'Rice',basePrice:400,yieldFactor:1.0},
  wheat:{name:'Wheat',basePrice:300,yieldFactor:0.95},
  potato:{name:'Potato',basePrice:200,yieldFactor:0.85},
  corn:{name:'Corn',basePrice:250,yieldFactor:1.05},
  barley:{name:'Barley',basePrice:180,yieldFactor:0.8},
  cassava:{name:'Cassava',basePrice:150,yieldFactor:0.7}
};

const ERAS = ['石器時代','青銅器時代','鉄器時代','中世','産業革命','近代','宇宙時代'];
const TURN_COUNT = 10;
const MAP_SIZE = 100;
const CHALLENGES = {
  free: {
    key: 'free',
    name: 'フリー',
    description: '自由にプレイ',
    goal: '目標なし'
  },
  env_guard: {
    key: 'env_guard',
    name: '環境キーパー',
    description: '最終環境スコア80以上を目指す',
    goal: '最終環境スコア80以上'
  },
  growth_drive: {
    key: 'growth_drive',
    name: '成長ドライブ',
    description: '総収入を初期予算の1.8倍以上にする',
    goal: '総収入を初期予算の1.8倍以上'
  },
  balance_keeper: {
    key: 'balance_keeper',
    name: 'サステナ平衡',
    description: '環境と技術の両立を図る',
    goal: '環境75以上 & 技術ポイント1200以上',
    difficulty: 'normal',
    conditions: [
      { type: 'env', target: 75, comparator: '>=' },
      { type: 'tech', target: 1200, comparator: '>=' }
    ]
  },
  tech_rush: {
    key: 'tech_rush',
    name: 'テックラッシュ',
    description: '宇宙時代を目指せ',
    goal: '技術ポイント2500以上',
    difficulty: 'hard',
    conditions: [
      { type: 'tech', target: 2500, comparator: '>=' }
    ]
  },
  prosperity: {
    key: 'prosperity',
    name: '豊穣の国',
    description: '収益と環境を両立',
    goal: '総収入2.2倍 & 環境60以上',
    difficulty: 'normal',
    conditions: [
      { type: 'revenue', target: 2.2, comparator: '>=' },
      { type: 'env', target: 60, comparator: '>=' }
    ]
  },
  survivor: {
    key: 'survivor',
    name: 'サバイバー',
    description: '予算を守りつつ災害に耐える',
    goal: '予算マイナス無し & 環境50以上',
    difficulty: 'easy',
    conditions: [
      { type: 'budget', target: 0, comparator: '>=' },
      { type: 'env', target: 50, comparator: '>=' }
    ]
  }
};

// ==================== ゲームバランス設定 ====================
const GAME_CONFIG = {
  investment: {
    normalizerRatio: 0.35,
    minNormalizer: 2e9,
    fertShareCap: 1.4,
    irriShareCap: 1.3,
    techShareCap: 1.5,
    fertEffect: 0.45,
    irriEffect: 0.35,
    techInvestmentBoost: 0.4,
    techInvestmentBoostCap: 0.025,
  },
  map: {
    techLevelBoost: 0.05,
    techLevelBoostDivisor: 20000,
    recoveryFactor: 0.9,
    emeraldRecoveryFactor: 0.88,
    baseCapBonus: 0.12,
    precisionAgBaseCapBonus: 0.15,
    hardCap: 0.94,
    precisionAgHardCap: 0.97,
    fertMomentum: {
      base: 0.55,
      precipitationFactor: 0.3,
      randomFactor: 0.15,
    },
    irriMomentum: {
      base: 0.5,
      drynessFactor: 0.5,
      heatStressFactor: 0.3,
      randomFactor: 0.2,
    },
    envPenaltyDivisor: 850,
    climateDrag: {
      dryness: 0.035,
      heatStress: 0.03,
      precipitation: 0.015,
    },
    erosionFactor: 0.06,
    noiseFactor: 0.008,
    minNdvi: 0.05,
  },
  production: {
    base: 100000,
    ndviMultiplier: 500000,
    eraMultiplier: 0.12,
    techPointFactor: 0.008, // 100 * 0.8 -> 0.8 / 100
    techInvestmentFactor: 0.4,
    agriBoostMultiplier: 1.2,
    dragonPlanMultiplier: 1.05,
    orbitalNetMultiplier: 1.08,
    automationMultiplier: 1.05,
    regenerativeBonus: 0.02,
    climateFactors: {
      arid: 0.9,
      tropical: 1.05,
    },
  },
  events: {
    drought: {
      precipThreshold: 6,
      tempThreshold: 28,
      irriBudgetRatio: 0.2,
      chance: 0.5,
      penalty: 0.55,
    },
    heatwave: {
      tempThreshold: 30,
      chance: 0.3,
      penalty: 0.75,
    },
    rain: {
      precipThreshold: 40,
      chance: 0.18,
      bonus: 1.25,
    },
    random: {
      chance: 0.12,
      sandstorm: { chance: 0.33, penalty: 0.85 },
      commsFailure: { chance: 0.33 }, // up to 0.66
      industrialPollution: { penalty: 3 },
    },
    monsoonMitigation: 0.6,
  },
  environment: {
    fertPenalty: 14,
    techBonus: 5,
    irriBonus: 2,
    ecoFertilizerMultiplier: 0.5,
    amazonShieldMultiplier: 0.5,
    regenerativeMultiplier: 0.7,
  },
  technology: {
    techGainDivisor: 1e7,
    techGainRandomDivisor: 5e7,
    agriBoostMultiplier: 1.2,
    unlocks: {
      ecoFertilizer: 300,
      precisionAg: 1200,
      orbitalNet: 2500,
      automation: 4000,
      regenerative: 6000,
    },
    eraThresholds: [0, 50, 120, 240, 500, 1200, 2500],
  },
  forecast: {
    heatRiskTemp: 30,
    droughtLowPrecip: 8,
    rainHighPrecip: 40
  },
  campaign: {
    seasons: 2,
    turnsPerSeason: TURN_COUNT,
    seasonBonus: 0.04
  },
  scoring: {
    budgetDivisor: 1e6,
    envScoreMultiplier: 100,
    eraMultiplier: 1000,
  },
  fallbackMap: {
    landMask: { dx: 55, dy: 45 },
    noise: {
        base: 0.55,
        waveFactor: 0.25,
        waveR: 0.16,
        waveC: 0.11,
        randomFactor: 0.1,
        min: 0.08,
        max: 0.9,
    }
  }
};
