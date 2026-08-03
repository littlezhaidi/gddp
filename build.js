const fs = require('fs');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function buildData() {
  console.log('開始打包 GDDL 關卡資料...');

  let oldLevelsMap = new Map();
  if (fs.existsSync('./levels-processed.json')) {
    try {
      const oldData = JSON.parse(fs.readFileSync('./levels-processed.json', 'utf-8'));
      oldData.forEach(l => oldLevelsMap.set(l.levelId, l));
    } catch (e) {
      console.warn('無法讀取舊資料，將視為首次建置。');
    }
  }
  
  const rawData = fs.readFileSync('assets/levels.json', 'utf-8');
  const levels = JSON.parse(rawData);

  const processedLevels = [];

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    console.log(`[${i + 1}/${levels.length}] processing ${level.levelId}...`);

    try {
      const res = await fetch(`https://gdladder.com/api/level/${level.levelId}`);
      const data = res.ok ? await res.json() : {};
      const meta = data.Meta || {};

      const demonType = meta.Difficulty ? meta.Difficulty.split(' ')[0].toLowerCase() : 'hard';
      const tier = Math.round(data.Rating || 0);
      const rawTier = data.Rating || 0;

      let rarity = 'none';
      if (meta.Rarity == 1) rarity = 'feature';
      else if (meta.Rarity == 2) rarity = 'epic';
      else if (meta.Rarity == 3) rarity = 'legendary';
      else if (meta.Rarity == 4) rarity = 'mythic';

      processedLevels.push({
        ...level,
        name: meta.Name || `Level ${level.levelId}`,
        creator: meta.Publisher?.name || 'Unknown',
        demonType,
        rarity,
        tier,
        rawTier
      });
    } catch (err) {
      console.warn(`關卡 ${level.levelId} 抓取失敗：`, err);
      processedLevels.push({
        ...level,
        name: `Level ${level.levelId}`,
        creator: 'Unknown',
        demonType: 'hard',
        rarity: 'none',
        tier: 0,
        rawTier: 0
      });
    }

    await sleep(200);
  }

  const sortedByTier = [...processedLevels].sort((a, b) => {
    if (b.rawTier !== a.rawTier) return (b.rawTier || 0) - (a.rawTier || 0);
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

  let existingLogs = [];
  if (fs.existsSync('./changelogs.json')) {
    try { existingLogs = JSON.parse(fs.readFileSync('./changelogs.json', 'utf-8')); } catch (e) {}
  }

  const loggedLevelIds = new Set(existingLogs.map(log => log.targetId));
  const newLevels = finalLevels.filter(l => !loggedLevelIds.has(l.levelId));

  if (newLevels.length > 0) {
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === '未知日期') return 0;
        const t = new Date(dateStr).getTime();
        return isNaN(t) ? 0 : t;
      };
    
      newLevels.sort((a, b) => {
        const timeA = parseDate(a.date);
        const timeB = parseDate(b.date);
      
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return a.levelId - b.levelId;
      });


    let currentBoard = finalLevels.filter(l => loggedLevelIds.has(l.levelId));
    const generatedLogs = [];

    for (const level of newLevels) {

      currentBoard.push(level);

      currentBoard.sort((a, b) => {
        if (b.rawTier !== a.rawTier) return (b.rawTier || 0) - (a.rawTier || 0);
        return (b.enjoyment || 0) - (a.enjoyment || 0);
      });

      const index = currentBoard.findIndex(l => l.levelId === level.levelId);
      const rank = index + 1;

      const belowLevel = currentBoard[index - 1]; 
      const aboveLevel = currentBoard[index + 1]; 

      generatedLogs.push({
        date: level.date || '未知日期',
        targetId: level.levelId,
        targetName: level.name,
        rank: rank,
        aboveId: aboveLevel ? aboveLevel.levelId : null,
        aboveName: aboveLevel ? aboveLevel.name : null,
        belowId: belowLevel ? belowLevel.levelId : null,
        belowName: belowLevel ? belowLevel.name : null
      });
    }

    const finalLogs = [...generatedLogs.reverse(), ...existingLogs];

    fs.writeFileSync('./changelogs.json', JSON.stringify(finalLogs, null, 2));
    console.log(`已生成 ${generatedLogs.length} 筆更新日誌`);
  }

  fs.writeFileSync('./levels-processed.json', JSON.stringify(finalLevels, null, 2));
  console.log('已生成 levels-processed.json');
}

buildData();