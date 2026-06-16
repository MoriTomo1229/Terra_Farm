// ==================== マップ読み込み & フォールバック ====================
async function loadOrGenerateMap(countryKey, year, options = {}) {
  const { allowFallback = true } = options;
  const filePath = `./data/maps/ndvi_${countryKey}${year}.json`;
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error('not found');
    const raw = await res.json();
    return raw.map(row => row.map(v => (v <= -3000 ? null : v * 0.0001)));
  } catch (error) {
    if (!allowFallback) {
      throw new Error(t('map.fallbackError', { path: filePath }));
    }
    // --- Procedural fallback: パーリン風ノイズ（簡易）
    const base = [];
    const rnd = (x,y) => (Math.sin(x*12.9898+y*78.233)*43758.5453)%1;
    const cfg = GAME_CONFIG.fallbackMap;
    for (let r=0;r<MAP_SIZE;r++){
      const row=[];
      for(let c=0;c<MAP_SIZE;c++){
        // 海/国境外をnullにするマスクっぽいもの（中央楕円を陸地とみなす）
        const dx=(c-50)/cfg.landMask.dx, dy=(r-50)/cfg.landMask.dy;
        const land = (dx*dx+dy*dy) < 1 ? 1 : 0;
        if (!land) { row.push(null); continue; }
        const n = cfg.noise.base + cfg.noise.waveFactor*Math.sin((r*cfg.noise.waveR)+(c*cfg.noise.waveC)) + cfg.noise.randomFactor*(rnd(r,c)-0.5);
        row.push(Math.max(cfg.noise.min, Math.min(cfg.noise.max, n)));
      }
      base.push(row);
    }
    return base;
  }
}
