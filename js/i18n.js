// ==================== i18n: 国際化 ====================
const I18N_STORAGE_KEY = 'terra_farm_locale';
const SUPPORTED_LOCALES = ['ja', 'en'];
let currentLocale = 'en';

// ---- Dictionary ----
const DICT = {
  ja: {
    // ==== HTML: start screen ====
    'start.eyebrow': '農業政策シミュレーション',
    'start.subtitle': '複雑な農業政策を整理し、限られた予算で生産性と持続可能性の両立を目指すシミュレーションです。',
    'start.lead': '国、予算、年代、チャレンジ条件を決めてミッションを開始します。競争モードでは大会条件が固定されます。',
    'start.playerLabel': 'プレイヤー名:',
    'start.playerPlaceholder': '例: TerraPlayer',
    'start.playerAria': 'プレイヤー名入力',
    'start.modeLabel': 'プレイモード:',
    'start.modeAria': 'プレイモード選択',
    'start.themeLabel': '表示テーマ:',
    'start.themeAria': '表示テーマ選択',
    'start.langLabel': '言語 / Language:',
    'start.langAria': '言語選択',
    'start.countryHeading': '国を選択',
    'start.countryHeadingAria': '国を選択',
    'start.budgetLabel': '初期予算:',
    'start.budgetPlaceholder': '例: 200B or 500M',
    'start.budgetAria': '初期予算入力',
    'start.yearLabel': 'ミッション年:',
    'start.yearAria': 'ミッション年選択',
    'start.challengeLabel': 'チャレンジ:',
    'start.challengeAria': 'チャレンジ選択',
    'start.leaderboardTitle': 'ランキング Top 10',
    'start.leaderboardEmpty': 'まだスコアが登録されていません。',
    'start.leaderboardPlayerBest': '自分の記録: 未登録',
    'start.leaderboardRefresh': '更新',
    'start.startButton': 'ミッション開始',
    'start.loadingButton': '衛星データを読み込み中...',
    'start.competitionHeader': '競争モード',
    'start.competitionDesc': '固定シードの大会条件でランキングに挑戦できます。',
    'start.competitionLoading': '大会情報を読み込み中です...',

    // ==== HTML: mode feature cards ====
    'feature.frontier.title': 'フロンティア・ラボ',
    'feature.frontier.desc': '高温・乾燥化が進む条件で、短期収益だけでなく再生力を伸ばすモードです。',
    'feature.preview.title': '影響プレビュー',
    'feature.preview.desc': 'スライダー調整に応じて、配分ミックス、気候リスク、政策の狙いを即時表示します。',
    'feature.signal.title': 'シグナルテーマ',
    'feature.signal.desc': 'ミッション管制のような高コントラスト表示で、重要指標を素早く確認できます。',

    // ==== HTML: game header ====
    'game.header': '運営パネル',
    'game.headerTheme': '表示テーマ',
    'game.headerThemeAria': 'ゲーム画面の表示テーマ選択',

    // ==== HTML: mission pulse ====
    'pulse.heading': '気候パルス',
    'pulse.risk': 'リスク',
    'pulse.resilience': 'レジリエンス',
    'pulse.focus': '次の焦点',
    'pulse.placeholder': 'ミッション開始後に気候リスクと再生力を表示します。',

    // ==== HTML: status panel ====
    'status.heading': '現在の状況',
    'status.turn': 'ターン:',
    'status.budget': '予算:',
    'status.revenue': '総収入:',
    'status.env': '環境スコア:',
    'status.resilience': 'レジリエンス:',
    'status.climateRisk': '気候リスク:',
    'status.era': '時代:',
    'status.tech': '技術ポイント:',
    'status.challengeProgress': 'チャレンジ進行度:',
    'status.crop': '作物:',
    'status.ndvi': '平均NDVI:',
    'status.moisture': '土壌水分:',
    'status.precipitation': '降水量:',
    'status.temperature': '気温:',
    'status.legendPoor': '貧弱',
    'status.legendLow': 'やや低',
    'status.legendMid': '中',
    'status.legendMedHigh': 'やや高',
    'status.legendHigh': '高',
    'status.legendVeryHigh': '非常に高',
    'status.mapAria': 'NDVIマップ',

    // ==== HTML: trend chart ====
    'trend.heading': 'ターンごとのトレンド',
    'trend.revenue': '収入',
    'trend.revenueAria': '収入の推移',
    'trend.revenueLineAria': '収入の折れ線',
    'trend.ndvi': '平均NDVI',
    'trend.ndviAria': '平均NDVIの推移',
    'trend.ndviLineAria': '平均NDVIの折れ線',
    'trend.env': '環境',
    'trend.envAria': '環境スコアの推移',
    'trend.envLineAria': '環境スコアの折れ線',
    'trend.tech': '技術Pt',
    'trend.techAria': '技術ポイントの推移',
    'trend.techLineAria': '技術ポイントの折れ線',
    'trend.hint': '直近のターンを表示（最大12件）',
    'trend.noData': 'データなし',

    // ==== HTML: controls ====
    'control.heading': '政策と投資',
    'control.cropLabel': '作物選択:',
    'control.presetLabel': 'プリセット:',
    'control.presetEnv': '環境重視',
    'control.presetRevenue': '収益重視',
    'control.presetTech': '技術重視',
    'control.presetCustomApply': 'カスタム適用',
    'control.presetCustomSave': '現在値を保存',
    'control.presetCustomUnset': 'カスタム未設定',
    'control.fertilizer': '肥料:',
    'control.fertilizerAria': '肥料の投資額を調整',
    'control.irrigation': '灌漑:',
    'control.irrigationAria': '灌漑の投資額を調整',
    'control.tech': '技術:',
    'control.techAria': '技術の投資額を調整',
    'control.remainingBudget': '残り予算:',
    'control.execute': 'ターンを実行',
    'control.autoAllocate': '自動配分',
    'control.specialSkill': '国家スキル',
    'control.unlockHeading': 'アンロック',

    // ==== HTML: report ====
    'report.heading': 'レポート',
    'report.noTurn': '未実行',
    'report.noEvent': '-',
    'report.climatePulseHeading': '気候パルス解析',
    'report.climatePulsePlaceholder': 'ミッション開始後に表示されます。',
    'report.climatePulseTagsAria': '気候パルスタグ',
    'report.historyHeading': 'ターン履歴',
    'report.historyTableAria': 'ターン履歴の表',
    'report.historyTurn': 'ターン',
    'report.historyAlloc': '配分',
    'report.historyNdvi': 'NDVI',
    'report.historyRevenue': '収入',
    'report.historyEnv': '環境',
    'report.historyRiskRegen': 'リスク/再生',
    'report.historyEmpty': 'まだ履歴がありません。',

    // ==== HTML: game over ====
    'gameover.heading': 'ミッション完了',
    'gameover.totalRevenue': '総収入:',
    'gameover.finalEnv': '最終環境スコア:',
    'gameover.finalTech': '最終技術レベル:',
    'gameover.finalScore': '最終スコア:',
    'gameover.retrySubmit': 'スコアを再送信',
    'gameover.replay': 'もう一度プレイ',
    'gameover.downloadLog': 'ログをダウンロード',

    // ==== HTML: theme options ====
    'theme.dark': 'ダーク',
    'theme.light': 'ライト',
    'theme.signal': 'シグナル',

    // ==== Option translations (auto-resolved by select id + value) ====
    'option.mode-select.solo': '通常プレイ',
    'option.mode-select.frontier': 'フロンティア・ラボ',
    'option.mode-select.competition': '競争モード',
    'option.challenge-select.free': 'フリー（目標なし）',
    'option.challenge-select.env_guard': '環境キーパー（最終環境スコア80以上）',
    'option.challenge-select.growth_drive': '成長ドライブ（総収入を初期予算の1.8倍以上）',
    'option.challenge-select.regen_loop': '再生ループ（環境・NDVI・レジリエンス回復）',
    'option.theme-select.dark': 'ダーク',
    'option.theme-select.light': 'ライト',
    'option.theme-select.signal': 'シグナル',
    'option.theme-select-header.dark': 'ダーク',
    'option.theme-select-header.light': 'ライト',
    'option.theme-select-header.signal': 'シグナル',
    'option.lang-select.ja': '日本語',
    'option.lang-select.en': 'English',

    // ==== Config: PLAY_MODES ====
    'mode.solo.name': '通常プレイ',
    'mode.solo.description': '国・予算・チャレンジを自由に設定できます。',
    'mode.solo.logName': '通常',
    'mode.frontier.name': 'フロンティア・ラボ',
    'mode.frontier.description': '高リスク気候下で、レジリエンスと再生農業の両立を狙う実験モードです。',
    'mode.frontier.logName': 'フロンティア',
    'mode.competition.name': '競争モード',
    'mode.competition.description': '固定シードの大会条件でランキングに挑戦できます。',
    'mode.competition.logName': '競争',

    // ==== Config: CHALLENGES ====
    'challenge.free.name': 'フリー',
    'challenge.free.description': '自由にプレイ',
    'challenge.free.goal': '目標なし',
    'challenge.free.short': 'フリー',
    'challenge.env_guard.name': '環境キーパー',
    'challenge.env_guard.description': '最終環境スコア80以上を目指す',
    'challenge.env_guard.goal': '最終環境スコア80以上',
    'challenge.growth_drive.name': '成長ドライブ',
    'challenge.growth_drive.description': '総収入を初期予算の1.8倍以上にする',
    'challenge.growth_drive.goal': '総収入を初期予算の1.8倍以上',
    'challenge.regen_loop.name': '再生ループ',
    'challenge.regen_loop.description': '環境・NDVI・レジリエンスを同時に回復させる',
    'challenge.regen_loop.goalTemplate': '環境{env}以上 / 初期NDVI+{ndvi} / レジリエンス{res}以上',

    // ==== Config: ERAS ====
    'era.0': '石器時代',
    'era.1': '青銅器時代',
    'era.2': '鉄器時代',
    'era.3': '中世',
    'era.4': '産業革命',
    'era.5': '近代',
    'era.6': '宇宙時代',

    // ==== JS: News ticker ====
    'news.1': '🌍 世界の平均気温が0.3°C上昇したと報告されました。',
    'news.2': '🧪 新しい環境配慮型肥料が国際特許を取得。',
    'news.3': '🚀 地球観測衛星の運用が拡張。NDVIの精度が向上。',
    'news.4': '💹 穀物先物が上昇。世界的な需要増が背景。',
    'news.5': '🌋 火山活動が活発化。日射が一時的に低下の見込み。',
    'news.6': '🌧️ 大気循環の変化でモンスーンの到来が早まる可能性。',

    // ==== JS: UN Report ====
    'un.baseStable': '📊 国連レポート: おおむね安定していますが、長期的な気候リスクに注意が必要です。',
    'un.envCritical': '🌍 国連レポート: 環境悪化が深刻です。持続可能性の再考を推奨します。',
    'un.techInnovation': '🚀 国連レポート: 技術革新が農業の効率化に顕著な効果。',
    'un.ndviGood': '🌱 国連レポート: 植生指数は良好。安定的な食料供給が見込めます。',
    'un.frontierResilienceLow': '…フロンティア地域の再生力が不足しています。灌漑と技術投資の下支えが必要です。',
    'un.frontierResilienceHigh': '…高リスク気候下でも農地の回復力が定着しつつあります。',

    // ==== JS: Risk labels ====
    'risk.crisis': '危機',
    'risk.warning': '警戒',
    'risk.caution': '注意',
    'risk.stable': '安定',

    // ==== JS: Impact Preview ====
    'preview.mixNotSet': '未設定',
    'preview.mixUnallocated': '未配分',
    'preview.mixAllocated': '肥{fert}% / 灌{irri}% / 技{tech}%',
    'preview.outcomeBalanced': 'バランス',
    'preview.outcomeWaiting': '待機',
    'preview.outcomeShortTerm': '短期収益',
    'preview.outcomeTech': '技術蓄積',
    'preview.outcomeAdaptation': '気候適応',
    'preview.outcomeRegen': '再生バランス',
    'preview.outcomeReserve': '温存',
    'preview.guidanceOverBudget': '予算を超過しています。自動配分かプリセットで比率を調整してください。',
    'preview.guidanceFrontierUnderPrepared': 'フロンティアでは灌漑と技術の合計比率が低く、次ターンの気候ショックに弱くなります。',
    'preview.guidanceFrontierRegen': '再生ループ向きの配分です。収益を確保しながら環境とレジリエンスを戻しやすい構成です。',
    'preview.guidanceGeneral': '投資予定は現在予算の{spendPct}%です。{outcome}寄りの政策として進行します。',
    'preview.guidanceInit': 'ミッション開始後、スライダー操作に合わせて政策の狙いを表示します。',

    // ==== JS: Climate Pulse ====
    'pulse.analyzeWaiting': 'ターン開始後、気候条件を解析します。',
    'pulse.observe': '観測',
    'pulse.tagDryness': '乾燥圧',
    'pulse.tagHeat': '高温',
    'pulse.tagRainDeficit': '降水不足',
    'pulse.tagEnvDecline': '環境低下',
    'pulse.tagRegenInsufficient': '再生力不足',
    'pulse.tagStable': '安定観測',
    'pulse.msgStable': '気候条件は管理可能です。収益と環境のバランスを維持してください。',
    'pulse.msgCrisis': '気候リスクが高い状態です。灌漑と技術投資で損失を抑え、肥料偏重を避けてください。',
    'pulse.msgWarning': '気候ショックの兆候があります。灌漑比率を上げるとレジリエンスを維持しやすくなります。',
    'pulse.msgCaution': '一部の気候条件に負荷があります。技術投資で次ターン以降の対応力を高められます。',

    // ==== JS: Events ====
    'event.drought': '🚨 干ばつにより生産量が大幅に減少。',
    'event.heatwave': '🦠 熱波による害虫発生で生産量が減少。',
    'event.rain': '☔ 恵みの雨により生産量が増加。',
    'event.sandstorm': '🌪️ 砂嵐が発生し、植生が損傷。',
    'event.commsFailure': '🛰️ 衛星通信障害 — 一部データが欠落。',
    'event.industrialPollution': '🏭 近隣の工業活動により環境スコア低下。',
    'event.none': '特に大きなイベントはありませんでした。',
    'event.frontierShock': 'フロンティア気候ショックで水ストレスが拡大。',

    // ==== JS: Skills ====
    'skill.egypt': '💧 ナイルの恵み: 次のターンの灌漑効果が2倍！',
    'skill.usa': '🧬 AgriBoost: 技術開発効率が20%向上！',
    'skill.india': '🌧️ Monsoon Mastery: 降水のブレを抑制！',
    'skill.brazil': '🌳 Amazon Shield: 環境ダメージを半減！',
    'skill.china': '🐉 Dragon Plan: 生産性に恒久+5%ボーナス！',
    'skill.ireland': '🍀 Emerald Surge: 植生の自然回復が強化！',

    // ==== JS: Unlocks ====
    'unlock.ecoFertilizer': '🌱 エコ肥料: 肥料による環境悪化が半減',
    'unlock.precisionAg': '📡 精密農業: NDVIの上限がわずかに上昇（0.98）',
    'unlock.orbitalNet': '🛰️ 軌道ネット: 収量に+8%の補正',

    // ==== JS: Turn execution / log ====
    'turn.result': '{crop}を{production}トン生産、収入: {revenue}',
    'turn.log': 'ターン {turn}: 収入 +{revenue}. {event}',
    'turn.logSeparator': '--- ターン {turn} ---',
    'turn.logNoEvent': 'イベントなし',

    // ==== JS: Challenge status ====
    'challenge.statusInProgress': '進行中',
    'challenge.statusSuccess': '達成',
    'challenge.statusFailed': '未達成',
    'challenge.statusAchieved': '達成！',
    'challenge.statusNotAchieved': '未達成',
    'challenge.badge': 'チャレンジ: {name} — {goal}',
    'challenge.badgePlaceholder': 'チャレンジ',
    'challenge.finalResult': 'チャレンジ「{name}」: {status} ({goal})',
    'challenge.regenProgress': '環{env} / NDVI {ndvi} / 再{res}',

    // ==== JS: main.js messages ====
    'main.competitionNotReady': '競争モードの大会情報をまだ取得できていません。少し待ってから再試行してください。',
    'main.competitionNameRequired': '競争モードではプレイヤー名の入力が必要です。',
    'main.invalidBudget': '無効な予算です。例: 200B or 500M',
    'main.loadError': 'データ読み込みエラー: {message}',
    'main.missionStart': 'ミッション開始: {country} ({year}年). 初期予算 {budget}. チャレンジ: {challenge}. モード: {mode}. {player}',
    'main.missionComplete': 'ミッション完了。',
    'main.budgetOver': '予算オーバーです！',
    'main.turnProcessing': 'ターン処理中です...',

    // ==== JS: Session summary ====
    'session.player': 'プレイヤー: {name}',
    'session.mode': 'モード: {name}',
    'session.tournament': '大会: {name}',

    // ==== JS: competition.js ====
    'comp.modeHelperCompetition': '競争モードでは「{name}」の条件で固定されます。プレイヤー名を入力して開始してください。',
    'comp.modeHelperCompetitionPreparing': '競争モードを準備中です。大会情報の取得を待ってから開始してください。',
    'comp.modeHelperFrontier': 'フロンティア・ラボ: 高リスク気候下で、レジリエンスと再生農業の両立を狙う実験モードです。 チャレンジは「再生ループ」に固定されます。',
    'comp.modeHelperSolo': '通常プレイでは国・予算・チャレンジを自由に設定できます。',
    'comp.loadingStatus': '大会情報を読み込み中です...',
    'comp.loadError': '競争モードを読み込めません: {error}',
    'comp.noEvent': '利用可能な大会がまだありません。',
    'comp.currentEvent': '現在の大会条件です。競争モードではこの設定で固定されます。',
    'comp.summaryEventName': '大会条件',
    'comp.summaryCountry': '国 / 年',
    'comp.summaryBudget': '初期予算',
    'comp.summaryChallenge': 'チャレンジ',
    'comp.summaryTurns': '{count} ターン',
    'comp.summaryTurnsLabel': 'ターン数',
    'comp.summaryRuleset': 'ルール版',
    'comp.leaderboardLoadError': 'ランキングを取得できませんでした。',
    'comp.leaderboardPlayerBest': '自分の記録: {rank}位 / {score} 点',
    'comp.leaderboardPlayerBestNone': '自分の記録: 未登録',
    'comp.leaderboardRank': '{rank}位',
    'comp.leaderboardScore': '{score} 点',
    'comp.leaderboardMeta': '{year}年 / 環境 {env} / 技術 {era}',
    'comp.submitting': 'ランキングへ送信中です...',
    'comp.submitSuccessImproved': 'ランキング登録完了。現在 {rank} 位で自己ベスト更新です。',
    'comp.submitSuccessNoImprove': '送信完了。今回のスコアでは自己ベストを更新せず、現在順位は {rank} 位です。',
    'comp.submitError': 'ランキング送信に失敗しました: {error}',

    // ==== JS: Presets ====
    'preset.applied': 'プリセット適用: {label}',
    'preset.customSaved': 'カスタムプリセットを保存しました。',
    'preset.customNotSet': 'カスタムプリセットが未設定です。',
    'preset.customSaveFailZero': 'カスタム保存失敗: スライダーがゼロのため保存できません。',
    'preset.custom': 'カスタム',
    'preset.customLabel': 'カスタム: 肥{fert}% / 灌{irri}% / 技{tech}%',

    // ==== JS: History ====
    'history.alloc': '肥:{fert} / 灌:{irri} / 技:{tech}',

    // ==== Map ====
    'map.fallbackError': '競争モード用のマップデータを読み込めませんでした: {path}',
  },

  en: {
    // ==== HTML: start screen ====
    'start.eyebrow': 'Agricultural Policy Simulation',
    'start.subtitle': 'A simulation that organizes complex agricultural policies and aims to balance productivity and sustainability with limited budgets.',
    'start.lead': 'Set your country, budget, era, and challenge conditions to begin your mission. Competition mode locks in tournament conditions.',
    'start.playerLabel': 'Player Name:',
    'start.playerPlaceholder': 'e.g. TerraPlayer',
    'start.playerAria': 'Player name input',
    'start.modeLabel': 'Play Mode:',
    'start.modeAria': 'Play mode selection',
    'start.themeLabel': 'Display Theme:',
    'start.themeAria': 'Display theme selection',
    'start.langLabel': '言語 / Language:',
    'start.langAria': 'Language selection',
    'start.countryHeading': 'Select Country',
    'start.countryHeadingAria': 'Select country',
    'start.budgetLabel': 'Initial Budget:',
    'start.budgetPlaceholder': 'e.g. 200B or 500M',
    'start.budgetAria': 'Initial budget input',
    'start.yearLabel': 'Mission Year:',
    'start.yearAria': 'Mission year selection',
    'start.challengeLabel': 'Challenge:',
    'start.challengeAria': 'Challenge selection',
    'start.leaderboardTitle': 'Leaderboard Top 10',
    'start.leaderboardEmpty': 'No scores registered yet.',
    'start.leaderboardPlayerBest': 'My Record: Not registered',
    'start.leaderboardRefresh': 'Refresh',
    'start.startButton': 'Start Mission',
    'start.loadingButton': 'Loading satellite data...',
    'start.competitionHeader': 'Competition Mode',
    'start.competitionDesc': 'Compete on the leaderboard under fixed-seed tournament conditions.',
    'start.competitionLoading': 'Loading tournament information...',

    // ==== HTML: mode feature cards ====
    'feature.frontier.title': 'Frontier Lab',
    'feature.frontier.desc': 'Boost regenerative capacity under high-heat, aridifying conditions beyond short-term profit.',
    'feature.preview.title': 'Impact Preview',
    'feature.preview.desc': 'Real-time display of allocation mix, climate risk, and policy intent as you adjust sliders.',
    'feature.signal.title': 'Signal Theme',
    'feature.signal.desc': 'Mission-control-inspired high-contrast display for rapid monitoring of key indicators.',

    // ==== HTML: game header ====
    'game.header': 'Operations Panel',
    'game.headerTheme': 'Display Theme',
    'game.headerThemeAria': 'Game screen display theme selection',

    // ==== HTML: mission pulse ====
    'pulse.heading': 'Climate Pulse',
    'pulse.risk': 'Risk',
    'pulse.resilience': 'Resilience',
    'pulse.focus': 'Next Focus',
    'pulse.placeholder': 'Climate risk and resilience will display after mission start.',

    // ==== HTML: status panel ====
    'status.heading': 'Current State',
    'status.turn': 'Turn:',
    'status.budget': 'Budget:',
    'status.revenue': 'Total Revenue:',
    'status.env': 'Env Score:',
    'status.resilience': 'Resilience:',
    'status.climateRisk': 'Climate Risk:',
    'status.era': 'Era:',
    'status.tech': 'Tech Points:',
    'status.challengeProgress': 'Challenge Progress:',
    'status.crop': 'Crop:',
    'status.ndvi': 'Avg NDVI:',
    'status.moisture': 'Soil Moisture:',
    'status.precipitation': 'Precipitation:',
    'status.temperature': 'Temperature:',
    'status.legendPoor': 'Poor',
    'status.legendLow': 'Low',
    'status.legendMid': 'Medium',
    'status.legendMedHigh': 'Med-High',
    'status.legendHigh': 'High',
    'status.legendVeryHigh': 'Very High',
    'status.mapAria': 'NDVI map',

    // ==== HTML: trend chart ====
    'trend.heading': 'Trend by Turn',
    'trend.revenue': 'Revenue',
    'trend.revenueAria': 'Revenue trend',
    'trend.revenueLineAria': 'Revenue line chart',
    'trend.ndvi': 'Avg NDVI',
    'trend.ndviAria': 'Average NDVI trend',
    'trend.ndviLineAria': 'Average NDVI line chart',
    'trend.env': 'Env',
    'trend.envAria': 'Environment score trend',
    'trend.envLineAria': 'Environment score line chart',
    'trend.tech': 'Tech Pt',
    'trend.techAria': 'Tech points trend',
    'trend.techLineAria': 'Tech points line chart',
    'trend.hint': 'Showing recent turns (max 12)',
    'trend.noData': 'No data',

    // ==== HTML: controls ====
    'control.heading': 'Policy & Investment',
    'control.cropLabel': 'Crop:',
    'control.presetLabel': 'Presets:',
    'control.presetEnv': 'Eco Focus',
    'control.presetRevenue': 'Revenue Focus',
    'control.presetTech': 'Tech Focus',
    'control.presetCustomApply': 'Apply Custom',
    'control.presetCustomSave': 'Save Current',
    'control.presetCustomUnset': 'Custom not set',
    'control.fertilizer': 'Fertilizer:',
    'control.fertilizerAria': 'Adjust fertilizer investment',
    'control.irrigation': 'Irrigation:',
    'control.irrigationAria': 'Adjust irrigation investment',
    'control.tech': 'Technology:',
    'control.techAria': 'Adjust technology investment',
    'control.remainingBudget': 'Remaining Budget:',
    'control.execute': 'Execute Turn',
    'control.autoAllocate': 'Auto Allocate',
    'control.specialSkill': 'National Skill',
    'control.unlockHeading': 'Unlocks',

    // ==== HTML: report ====
    'report.heading': 'Report',
    'report.noTurn': 'Not executed',
    'report.noEvent': '-',
    'report.climatePulseHeading': 'Climate Pulse Analysis',
    'report.climatePulsePlaceholder': 'Displayed after mission start.',
    'report.climatePulseTagsAria': 'Climate pulse tags',
    'report.historyHeading': 'Turn History',
    'report.historyTableAria': 'Turn history table',
    'report.historyTurn': 'Turn',
    'report.historyAlloc': 'Allocation',
    'report.historyNdvi': 'NDVI',
    'report.historyRevenue': 'Revenue',
    'report.historyEnv': 'Env',
    'report.historyRiskRegen': 'Risk/Regen',
    'report.historyEmpty': 'No history yet.',

    // ==== HTML: game over ====
    'gameover.heading': 'Mission Complete',
    'gameover.totalRevenue': 'Total Revenue:',
    'gameover.finalEnv': 'Final Env Score:',
    'gameover.finalTech': 'Final Tech Level:',
    'gameover.finalScore': 'Final Score:',
    'gameover.retrySubmit': 'Resubmit Score',
    'gameover.replay': 'Play Again',
    'gameover.downloadLog': 'Download Log',

    // ==== HTML: theme options ====
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'theme.signal': 'Signal',

    // ==== Option translations (auto-resolved by select id + value) ====
    'option.mode-select.solo': 'Standard Play',
    'option.mode-select.frontier': 'Frontier Lab',
    'option.mode-select.competition': 'Competition Mode',
    'option.challenge-select.free': 'Free Play (no goal)',
    'option.challenge-select.env_guard': 'Environmental Keeper (final env score ≥ 80)',
    'option.challenge-select.growth_drive': 'Growth Drive (total revenue ≥ 1.8× initial budget)',
    'option.challenge-select.regen_loop': 'Regen Loop (restore env, NDVI, resilience)',
    'option.theme-select.dark': 'Dark',
    'option.theme-select.light': 'Light',
    'option.theme-select.signal': 'Signal',
    'option.theme-select-header.dark': 'Dark',
    'option.theme-select-header.light': 'Light',
    'option.theme-select-header.signal': 'Signal',
    'option.lang-select.ja': '日本語',
    'option.lang-select.en': 'English',

    // ==== Config: PLAY_MODES ====
    'mode.solo.name': 'Standard Play',
    'mode.solo.description': 'Freely configure country, budget, and challenge.',
    'mode.solo.logName': 'Standard',
    'mode.frontier.name': 'Frontier Lab',
    'mode.frontier.description': 'Experimental mode balancing resilience and regenerative agriculture under high-risk climate.',
    'mode.frontier.logName': 'Frontier',
    'mode.competition.name': 'Competition',
    'mode.competition.description': 'Compete on the leaderboard under fixed-seed tournament conditions.',
    'mode.competition.logName': 'Competition',

    // ==== Config: CHALLENGES ====
    'challenge.free.name': 'Free Play',
    'challenge.free.description': 'Play freely',
    'challenge.free.goal': 'No goal',
    'challenge.free.short': 'Free',
    'challenge.env_guard.name': 'Environmental Keeper',
    'challenge.env_guard.description': 'Aim for final env score ≥ 80',
    'challenge.env_guard.goal': 'Final env score ≥ 80',
    'challenge.growth_drive.name': 'Growth Drive',
    'challenge.growth_drive.description': 'Achieve total revenue ≥ 1.8× initial budget',
    'challenge.growth_drive.goal': 'Total revenue ≥ 1.8× initial budget',
    'challenge.regen_loop.name': 'Regeneration Loop',
    'challenge.regen_loop.description': 'Simultaneously restore environment, NDVI, and resilience',
    'challenge.regen_loop.goalTemplate': 'Env ≥ {env} / Initial NDVI + {ndvi} / Resilience ≥ {res}',

    // ==== Config: ERAS ====
    'era.0': 'Stone Age',
    'era.1': 'Bronze Age',
    'era.2': 'Iron Age',
    'era.3': 'Middle Ages',
    'era.4': 'Industrial Revolution',
    'era.5': 'Modern Age',
    'era.6': 'Space Age',

    // ==== JS: News ticker ====
    'news.1': '\u{1F30D} Global average temperature reported to have risen by 0.3°C.',
    'news.2': '\u{1F9EA} New eco-friendly fertilizer receives international patent.',
    'news.3': '\u{1F680} Earth observation satellite operations expanded. NDVI precision improved.',
    'news.4': '\u{1F4B9} Grain futures rise amid growing global demand.',
    'news.5': '\u{1F30B} Volcanic activity intensifies. Temporary reduction in solar radiation expected.',
    'news.6': '\u{1F327}️ Atmospheric circulation shifts may bring early monsoon arrival.',

    // ==== JS: UN Report ====
    'un.baseStable': '\u{1F4CA} UN Report: Conditions are broadly stable, but long-term climate risks warrant attention.',
    'un.envCritical': '\u{1F30D} UN Report: Environmental degradation is severe. Reconsider sustainability measures.',
    'un.techInnovation': '\u{1F680} UN Report: Technological innovation is having a notable impact on agricultural efficiency.',
    'un.ndviGood': '\u{1F331} UN Report: Vegetation index is favorable. Stable food supply outlook.',
    'un.frontierResilienceLow': ' Regenerative capacity in frontier regions is insufficient. Additional irrigation and tech investment needed.',
    'un.frontierResilienceHigh': ' Farmland recovery capacity is taking hold, even under high-risk climate conditions.',

    // ==== JS: Risk labels ====
    'risk.crisis': 'Crisis',
    'risk.warning': 'Warning',
    'risk.caution': 'Caution',
    'risk.stable': 'Stable',

    // ==== JS: Impact Preview ====
    'preview.mixNotSet': 'Not set',
    'preview.mixUnallocated': 'Unallocated',
    'preview.mixAllocated': 'F{fert}% / I{irri}% / T{tech}%',
    'preview.outcomeBalanced': 'Balanced',
    'preview.outcomeWaiting': 'Idle',
    'preview.outcomeShortTerm': 'Short-Term Revenue',
    'preview.outcomeTech': 'Tech Accumulation',
    'preview.outcomeAdaptation': 'Climate Adaptation',
    'preview.outcomeRegen': 'Regenerative Balance',
    'preview.outcomeReserve': 'Conservative',
    'preview.guidanceOverBudget': 'Budget exceeded. Adjust ratios using auto-allocate or presets.',
    'preview.guidanceFrontierUnderPrepared': 'In Frontier mode, the combined irrigation and tech ratio is low, increasing vulnerability to next-turn climate shocks.',
    'preview.guidanceFrontierRegen': 'Allocation suited for Regeneration Loop. Balances revenue while restoring environment and resilience.',
    'preview.guidanceGeneral': 'Planned investment is {spendPct}% of current budget. Proceeding with a {outcome}-oriented policy.',
    'preview.guidanceInit': 'After mission start, policy intent will display here as you adjust sliders.',

    // ==== JS: Climate Pulse ====
    'pulse.analyzeWaiting': 'Climate conditions will be analyzed after turn start.',
    'pulse.observe': 'Observing',
    'pulse.tagDryness': 'Dryness Stress',
    'pulse.tagHeat': 'Heat Stress',
    'pulse.tagRainDeficit': 'Rain Deficit',
    'pulse.tagEnvDecline': 'Env Decline',
    'pulse.tagRegenInsufficient': 'Low Regeneration',
    'pulse.tagStable': 'Stable',
    'pulse.msgStable': 'Climate conditions are manageable. Maintain balance between revenue and environment.',
    'pulse.msgCrisis': 'Climate risk is elevated. Mitigate losses with irrigation and tech investment, and avoid fertilizer bias.',
    'pulse.msgWarning': 'Signs of climate shock emerging. Raising the irrigation ratio helps sustain resilience.',
    'pulse.msgCaution': 'Some climate stressors are active. Tech investment can improve adaptive capacity for subsequent turns.',

    // ==== JS: Events ====
    'event.drought': '\u{1F6A8} Drought has sharply reduced production.',
    'event.heatwave': '\u{1F9A0} Heatwave-driven pest outbreak reduced production.',
    'event.rain': '☔ Beneficial rains increased production.',
    'event.sandstorm': '\u{1F32A}️ Sandstorm damaged vegetation.',
    'event.commsFailure': '\u{1F6F0}️ Satellite communication disruption — partial data loss.',
    'event.industrialPollution': '\u{1F3ED} Nearby industrial activity reduced environment score.',
    'event.none': 'No significant events occurred this turn.',
    'event.frontierShock': 'Frontier climate shock has amplified water stress.',

    // ==== JS: Skills ====
    'skill.egypt': '\u{1F4A7} Nile Blessing: Irrigation effect doubled for the next turn!',
    'skill.usa': '\u{1F9EC} AgriBoost: Tech development efficiency +20%!',
    'skill.india': '\u{1F327}️ Monsoon Mastery: Precipitation variability suppressed!',
    'skill.brazil': '\u{1F333} Amazon Shield: Environmental damage halved!',
    'skill.china': '\u{1F409} Dragon Plan: Permanent +5% production bonus!',
    'skill.ireland': '\u{1F340} Emerald Surge: Enhanced natural vegetation recovery!',

    // ==== JS: Unlocks ====
    'unlock.ecoFertilizer': '\u{1F331} Eco-Fertilizer: Environmental penalty from fertilizer halved',
    'unlock.precisionAg': '\u{1F4E1} Precision Agriculture: NDVI ceiling slightly increased (0.98)',
    'unlock.orbitalNet': '\u{1F6F0}️ Orbital Network: +8% yield bonus',

    // ==== JS: Turn execution / log ====
    'turn.result': '{crop}: {production} tons produced, Revenue: {revenue}',
    'turn.log': 'Turn {turn}: Revenue +{revenue}. {event}',
    'turn.logSeparator': '--- Turn {turn} ---',
    'turn.logNoEvent': 'No events',

    // ==== JS: Challenge status ====
    'challenge.statusInProgress': 'In Progress',
    'challenge.statusSuccess': 'Achieved',
    'challenge.statusFailed': 'Not Achieved',
    'challenge.statusAchieved': 'Achieved!',
    'challenge.statusNotAchieved': 'Not Achieved',
    'challenge.badge': 'Challenge: {name} — {goal}',
    'challenge.badgePlaceholder': 'Challenge: -',
    'challenge.finalResult': 'Challenge "{name}": {status} ({goal})',
    'challenge.regenProgress': 'Env {env} / NDVI {ndvi} / Res {res}',

    // ==== JS: main.js messages ====
    'main.competitionNotReady': 'Tournament information not yet available. Please wait briefly and try again.',
    'main.competitionNameRequired': 'Player name is required for competition mode.',
    'main.invalidBudget': 'Invalid budget. Example: 200B or 500M',
    'main.loadError': 'Data load error: {message}',
    'main.missionStart': 'Mission start: {country} ({year}). Initial budget {budget}. Challenge: {challenge}. Mode: {mode}. {player}',
    'main.missionComplete': 'Mission complete.',
    'main.budgetOver': 'Budget exceeded!',
    'main.turnProcessing': 'Turn processing...',

    // ==== JS: Session summary ====
    'session.player': 'Player: {name}',
    'session.mode': 'Mode: {name}',
    'session.tournament': 'Tournament: {name}',

    // ==== JS: competition.js ====
    'comp.modeHelperCompetition': 'Competition mode locks conditions to "{name}". Enter your player name and start.',
    'comp.modeHelperCompetitionPreparing': 'Competition mode is initializing. Please wait for tournament data before starting.',
    'comp.modeHelperFrontier': 'Frontier Lab: Experimental mode balancing resilience and regenerative agriculture under high-risk climate. Challenge is locked to "Regeneration Loop".',
    'comp.modeHelperSolo': 'In Standard Play, you can freely configure country, budget, and challenge.',
    'comp.loadingStatus': 'Loading tournament information...',
    'comp.loadError': 'Could not load competition: {error}',
    'comp.noEvent': 'No tournaments available yet.',
    'comp.currentEvent': 'Current tournament conditions. Competition mode locks to these settings.',
    'comp.summaryEventName': 'Event',
    'comp.summaryCountry': 'Country / Year',
    'comp.summaryBudget': 'Initial Budget',
    'comp.summaryChallenge': 'Challenge',
    'comp.summaryTurns': '{count} turns',
    'comp.summaryTurnsLabel': 'Turns',
    'comp.summaryRuleset': 'Ruleset Version',
    'comp.leaderboardLoadError': 'Could not load leaderboard.',
    'comp.leaderboardPlayerBest': 'My Record: #{rank} / {score} pts',
    'comp.leaderboardPlayerBestNone': 'My Record: Not registered',
    'comp.leaderboardRank': '#{rank}',
    'comp.leaderboardScore': '{score} pts',
    'comp.leaderboardMeta': '{year} / Env {env} / Tech {era}',
    'comp.submitting': 'Submitting to leaderboard...',
    'comp.submitSuccessImproved': 'Leaderboard submission complete. Currently #{rank}, new personal best!',
    'comp.submitSuccessNoImprove': 'Submission complete. This score did not improve your personal best. Current rank: #{rank}.',
    'comp.submitError': 'Leaderboard submission failed: {error}',

    // ==== JS: Presets ====
    'preset.applied': 'Preset applied: {label}',
    'preset.customSaved': 'Custom preset saved.',
    'preset.customNotSet': 'Custom preset not configured.',
    'preset.customSaveFailZero': 'Custom save failed: Sliders are at zero, cannot save.',
    'preset.custom': 'Custom',
    'preset.customLabel': 'Custom: F{fert}% / I{irri}% / T{tech}%',

    // ==== JS: History ====
    'history.alloc': 'F:{fert} / I:{irri} / T:{tech}',

    // ==== Map ====
    'map.fallbackError': 'Could not load competition map data: {path}',
  }
};

// ---- Core Functions ----

/**
 * 翻訳キーから現在ロケールの文字列を取得し、パラメータを補完する
 * @param {string} key - ドット区切りキー
 * @param {Object|string|number} [params] - 置換パラメータ
 * @returns {string}
 */
function t(key, params) {
  const dict = DICT[currentLocale] || DICT.ja;
  let template = dict[key];

  // Fallback to Japanese if key missing in current locale
  if (template === undefined && currentLocale !== 'ja') {
    template = DICT.ja[key];
  }

  // If still missing, return the key itself (development hint)
  if (template === undefined) {
    console.warn('[i18n] Missing key: "' + key + '" for locale "' + currentLocale + '"');
    return key;
  }

  // Substitute {placeholder} with values from params
  if (params !== undefined && params !== null) {
    if (typeof params === 'object' && !Array.isArray(params)) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) {
          template = template.replace(new RegExp('\\{' + k + '\\}', 'g'), String(params[k] != null ? params[k] : ''));
        }
      }
    } else {
      template = template.replace(/\{0\}/g, String(params));
    }
  }

  return template;
}

/**
 * ロケールを切り替え、DOM と動的 UI を再描画する
 * @param {string} locale - 'ja' | 'en'
 */
function setLocale(locale) {
  if (SUPPORTED_LOCALES.indexOf(locale) === -1) return;
  currentLocale = locale;
  try {
    localStorage.setItem(I18N_STORAGE_KEY, locale);
  } catch (_) { /* ignore */ }
  document.documentElement.lang = locale;
  applyI18nToDOM();

  // Sync language selectors
  syncLangControls(locale);

  // Re-render dynamic UI
  if (typeof renderUI === 'function' && typeof state !== 'undefined' && state.countryKey) {
    renderUI();
  }
  if (typeof renderCompetitionCard === 'function') {
    renderCompetitionCard();
  }
  if (typeof renderSessionSummary === 'function') {
    renderSessionSummary();
  }
}

/**
 * 現在のロケールを返す
 * @returns {string}
 */
function getLocale() {
  return currentLocale;
}

/**
 * localStorage からロケールを復元し、DOM に適用する
 */
function initLocale() {
  try {
    var stored = localStorage.getItem(I18N_STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.indexOf(stored) !== -1) {
      currentLocale = stored;
    }
  } catch (_) { /* use default */ }
  document.documentElement.lang = currentLocale;
  applyI18nToDOM();
  syncLangControls(currentLocale);
}

/**
 * data-i18n 属性を走査して DOM テキストを現在のロケールで置換する
 * @param {Document|Element} [root] - 走査ルート（デフォルト: document）
 */
function applyI18nToDOM(root) {
  root = root || document;

  // 1. textContent replacement: <element data-i18n="key">
  var elements = root.querySelectorAll('[data-i18n]');
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  }

  // 2. Placeholder: <input data-i18n-placeholder="key">
  var placeholders = root.querySelectorAll('[data-i18n-placeholder]');
  for (var j = 0; j < placeholders.length; j++) {
    var pel = placeholders[j];
    var pkey = pel.getAttribute('data-i18n-placeholder');
    if (pkey) {
      pel.placeholder = t(pkey);
    }
  }

  // 3. aria-label: <element data-i18n-aria="key">
  var ariaEls = root.querySelectorAll('[data-i18n-aria]');
  for (var k = 0; k < ariaEls.length; k++) {
    var ael = ariaEls[k];
    var akey = ael.getAttribute('data-i18n-aria');
    if (akey) {
      ael.setAttribute('aria-label', t(akey));
    }
  }

  // 4. title attribute: <element data-i18n-title="key">
  var titleEls = root.querySelectorAll('[data-i18n-title]');
  for (var m = 0; m < titleEls.length; m++) {
    var tel = titleEls[m];
    var tkey = tel.getAttribute('data-i18n-title');
    if (tkey) {
      tel.setAttribute('title', t(tkey));
    }
  }

  // 5. <option> text via select-id + value auto-resolution
  var selects = root.querySelectorAll('select');
  for (var n = 0; n < selects.length; n++) {
    var select = selects[n];
    var selectId = select.id;
    if (!selectId) continue;
    var options = select.options;
    for (var p = 0; p < options.length; p++) {
      var opt = options[p];
      // Skip if option has its own data-i18n (already handled above)
      if (opt.hasAttribute('data-i18n')) continue;
      var lookupKey = 'option.' + selectId + '.' + opt.value;
      var translated = t(lookupKey);
      if (translated !== lookupKey) {
        opt.textContent = translated;
      }
    }
  }
}

/**
 * 言語セレクタの選択値を現在のロケールに同期する
 * （main.js の syncLangControls で上書きされるプレースホルダー）
 */
function syncLangControls(locale) {
  // Implemented in main.js after DOM elements are cached
}
