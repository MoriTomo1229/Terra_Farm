// ==================== ゲーム設定 ====================
const COUNTRIES = {
  usa:    {name:'United States', startingBudget:200e6, climate:'temperate', preferred:'corn',   description:'Large temperate plains — corn and wheat thrive.', flag:'🇺🇸', skill:'AgriBoost'},
  china:  {name:'China',         startingBudget:180e6, climate:'varied',    preferred:'rice',   description:'Diverse climates — rice dominates irrigated regions.', flag:'🇨🇳', skill:'Dragon Plan'},
  india:  {name:'India',         startingBudget:120e6, climate:'tropical',  preferred:'rice',   description:'Monsoon climates favor rice and diverse crops.', flag:'🇮🇳', skill:'Monsoon Mastery'},
  brazil: {name:'Brazil',        startingBudget: 90e6, climate:'tropical',  preferred:'cassava',description:'Large tropics; cassava and soybeans common.', flag:'🇧🇷', skill:'Amazon Shield'},
  egypt:  {name:'Egypt',         startingBudget: 60e6, climate:'arid',      preferred:'barley', description:'Arid river valley — irrigation is crucial.', flag:'🇪🇬', skill:'Nile Blessing'},
  ireland:{name:'Ireland',       startingBudget: 15e6, climate:'cool',      preferred:'potato', description:'Cool wet climate — potatoes historically important.', flag:'🇮🇪', skill:'Emerald Surge'}
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
const PLAY_MODES = {
  solo: {
    key: 'solo',
    name: '通常プレイ',
    description: '国・予算・チャレンジを自由に設定できます。',
    logName: '通常'
  },
  frontier: {
    key: 'frontier',
    name: 'フロンティア・ラボ',
    description: '高リスク気候下で、レジリエンスと再生農業の両立を狙う実験モードです。',
    logName: 'フロンティア'
  },
  competition: {
    key: 'competition',
    name: '競争モード',
    description: '固定シードの大会条件でランキングに挑戦できます。',
    logName: '競争'
  }
};
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
  regen_loop: {
    key: 'regen_loop',
    name: '再生ループ',
    description: '環境・NDVI・レジリエンスを同時に回復させる',
    goal: null  // GAME_CONFIG.frontier から動的解決
  }
};

// CHALLENGES の goal 文字列を解決する（regen_loop は GAME_CONFIG.frontier の実値から生成）
function resolveChallengeGoal(challengeKey) {
  const info = CHALLENGES[challengeKey];
  if (!info) return '';
  if (challengeKey === 'regen_loop') {
    const cfg = GAME_CONFIG.frontier;
    return t('challenge.regen_loop.goalTemplate', { env: cfg.envGoal, ndvi: cfg.ndviGainGoal, res: cfg.resilienceGoal });
  }
  return t('challenge.' + challengeKey + '.goal') || '';
}

// ==================== ゲームバランス設定 ====================
const GAME_CONFIG = {
  investment: {
    normalizerRatio: 0.35,
    minNormalizer: 2e6,
    fertShareCap: 1.4,
    irriShareCap: 1.3,
    techShareCap: 1.5,
    fertEffect: 0.45,
    irriEffect: 0.35,
    techInvestmentBoost: 0.4,
    techInvestmentBoostCap: 0.025,
  },
  map: {
    techLevelBoost: 0.02,
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
    // 生産は国家規模（初期予算）に比例させる。予算比率でスコア評価するため、
    // 国間・ターン間で収益比を比較可能にする。
    rateScale: 0.0003,
    ndviMultiplier: 2.2,
    eraMultiplier: 0.12,
    techPointFactor: 0.0008,
    techEfficiencyCap: 3,
    techInvestmentFactor: 0.4,
    agriBoostMultiplier: 1.2,
    dragonPlanMultiplier: 1.05,
    orbitalNetMultiplier: 1.08,
    // 投入バランス: 肥料と灌漑が無いと生産が伸びない（技術偏重の支配を防ぐ）
    inputBalance: {
      nutrientFloor: 0.55,    // 肥料ゼロ時の生産係数
      nutrientPerShare: 0.6,  // 正規化シェア1.0あたりの加算
      nutrientCap: 1.2,
      waterFloor: 0.72,       // 灌漑ゼロ時の生産係数
      waterPerShare: 0.3,
      waterCap: 1.18,
      drynessWeight: 0.5,     // 乾燥時は灌漑の寄与が増える
    },
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
  frontier: {
    turnLimit: 12,
    initialEnvScore: 58,
    temperatureBonus: 3,
    temperatureRamp: 2,
    precipitationMultiplier: 0.82,
    precipitationPenalty: 3,
    moisturePenalty: 12,
    moistureRamp: 8,
    riskBonus: 10,
    adaptationIrrigationRatio: 0.28,
    adaptationTechRatio: 0.24,
    resilienceGoal: 70,
    envGoal: 78,
    ndviGainGoal: 0.03
  },
  climatePulse: {
    riskLevels: { crisis: 75, warning: 55, caution: 35 }
  },
  environment: {
    // 政策の持続可能性から目標環境スコアを算出し、毎ターン目標へ寄せる。
    // 肥料は減点、灌漑（水管理）は加点、技術はわずかに加点。
    baseTarget: 62,
    irriWeight: 18,
    techWeight: 4,
    fertWeight: 22,
    drift: 0.35,
    ecoFertilizerMultiplier: 0.5,
    amazonShieldMultiplier: 0.5,
  },
  technology: {
    techGainDivisor: 1e4,
    techGainRandomDivisor: 5e4,
    agriBoostMultiplier: 1.2,
    unlocks: {
      ecoFertilizer: 300,
      precisionAg: 1200,
      orbitalNet: 2500,
    },
    eraThresholds: [0, 50, 120, 240, 500, 1200, 2500],
  },
  scoring: {
    budgetRatioMultiplier: 1000,
    revenueRatioMultiplier: 1000,
    maxEconomicRatio: 15,
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
