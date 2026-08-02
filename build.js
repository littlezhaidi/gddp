const fs = require('fs');

async function buildData() {
  console.log('開始打包 GDDL 關卡資料...');
  
  const rawData = fs.readFileSync('./levels.json', 'utf-8');
  const levels = JSON.parse(rawData);

  const processedLevels = await Promise.all(levels.map(async (level) => {
    try {
      const res = await fetch(`https://gdladder.com/api/level/${level.levelId}`);
      const data = res.ok ? await res.json() : {};
      const meta = data.Meta || {};

      const demonType = meta.Difficulty ? meta.Difficulty.split(' ')[0].toLowerCase() : 'hard';
      const tier = Math.round(data.Rating || 0);
      const rawTier = data.Rating;

      let rarity = 'none';
      if (meta.Rarity == 1) rarity = 'feature';
      else if (meta.Rarity == 2) rarity = 'epic';
      else if (meta.Rarity == 3) rarity = 'legendary';
      else if (meta.Rarity == 4) rarity = 'mythic';

      return {
        ...level,
        name: meta.Name || `Level ${level.levelId}`,
        creator: meta.Publisher?.name || 'Unknown',
        demonType,
        rarity,
        tier,
        rawTier
      };
    } catch (err) {
      console.warn(`關卡 ${level.levelId} 抓取失敗：`, err);
      return {
        ...level,
        name: `Level ${level.levelId}`,
        creator: 'Unknown',
        demonType: 'hard',
        rarity: 'none',
        tier: 0
      };
    }
  }));

  const sortedByTier = [...processedLevels].sort((a, b) => {
    if (b.rawTier !== a.rawTier) return b.rawTier - a.rawTier;
    return (b.enjoyment || 0) - (a.enjoyment || 0);
  });

  const rankMap = new Map();
  sortedByTier.forEach((level, index) => {
    rankMap.set(level.levelId, index + 1);
  });

  const finalLevels = processedLevels.map(level => ({
    ...level,
    rank: rankMap.get(level.levelId) || 0
  }));

  fs.writeFileSync('./levels-processed.json', JSON.stringify(finalLevels, null, 2));
  console.log('已成功生成 levels-processed.json！');
}

buildData();