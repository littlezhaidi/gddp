const fs = require('fs');;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { createClient } = require('@supabase/supabase-js')
const SUPABASE_URL = 'https://bmddhyrnqdnymridndrq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fGtcV00ZRGnDkk2a7jVGiA_RGHAf1zm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function buildData() {
    console.log('開始打包 GDDL 關卡資料...');
    
    const { data, error } = await supabase
        .from('levels')
        .select()
        .order('date', { ascending: true });
  
  
    const processedLevels = [];
  
    for (let i = 0; i < data.length; i++) {
      	const level = data[i];
      	console.log(`[${i + 1}/${data.length}] processing ${level.id}...`);
		
      	try {
    		const res = await fetch(`https://gdladder.com/api/levels/${level.id}`);
    		const data = res.ok ? await res.json() : {};
    		const meta = data.Meta || {};

    		const demonType = (meta.Difficulty && meta.Difficulty !== 'Official') ? meta.Difficulty.split(' ')[0].toLowerCase() : 'hard';
    		const tier = data.Rating || 0;

    		let rarity = 'none';
    		if (meta.Rarity == 1) rarity = 'feature';
    		else if (meta.Rarity == 2) rarity = 'epic';
    		else if (meta.Rarity == 3) rarity = 'legendary';
    		else if (meta.Rarity == 4) rarity = 'mythic';

    		processedLevels.push({
    		  	...level,
    		  	name: meta.Name || `Level ${level.id}`,
    		  	creator: meta.Publisher?.name || 'Unknown',
    		  	demonType,
    		  	rarity,
    		  	tier,
    		});
      	} catch (err) {
      	  	console.warn(`關卡 ${level.id} 抓取失敗：`, err);
      	  	processedLevels.push({
      	  	  	...level,
      	  	  	name: `Level ${level.id}`,
      	  	  	creator: 'Unknown',
      	  	  	demonType: 'hard',
      	  	  	rarity: 'none',
      	  	  	tier: 0,
      	  	});
      	}
      	await sleep(600); //gddl rate limit
    }
  
    const sortedByTier = [...processedLevels].sort((a, b) => {
      	if (b.tier !== a.tier) return (b.tier || 0) - (a.tier || 0);
      	return (b.enjoyment || 0) - (a.enjoyment || 0);
    });
  
    const rankMap = new Map();
    sortedByTier.forEach((level, index) => {
      	rankMap.set(level.id, index + 1);
    });
  
    const finalLevels = processedLevels.map(level => ({
      	...level,
      	rank: rankMap.get(level.id) || 0
    }));
  
    if (finalLevels.length > 0) {
        const parseDate = (dateStr) => {
          	if (!dateStr || dateStr === '未知日期') return 0;
          	const t = new Date(dateStr).getTime();
          	return isNaN(t) ? 0 : t;
        };
      
        finalLevels.sort((a, b) => {
          	const timeA = parseDate(a.date);
          	const timeB = parseDate(b.date);
			
          	if (timeA !== timeB) {
          	  	return timeA - timeB;
          	}
          	return a.id - b.id;
        });
      
      
      	let currentBoard = [];
      	const generatedLogs = [];
		
      	for (const level of finalLevels) {
		
      	  	currentBoard.push(level);
			
      	  	currentBoard.sort((a, b) => {
      	  	  	if (b.tier !== a.tier) return (b.tier || 0) - (a.tier || 0);
      	  	  	return (b.enjoyment || 0) - (a.enjoyment || 0);
      	  	});
		  
      	  	const index = currentBoard.findIndex(l => l.id === level.id);
      	  	const rank = index + 1;
		  
      	  	const belowLevel = currentBoard[index - 1]; 
      	  	const aboveLevel = currentBoard[index + 1]; 
		  
      	  	generatedLogs.push({
      	  	  	date: level.date || '未知日期',
      	  	  	targetId: level.id,
      	  	  	targetName: level.name,
      	  	  	rank: rank,
      	  	  	aboveId: aboveLevel ? aboveLevel.id : null,
      	  	  	aboveName: aboveLevel ? aboveLevel.name : null,
      	  	  	belowId: belowLevel ? belowLevel.id : null,
      	  	  	belowName: belowLevel ? belowLevel.name : null
      	  	});
      	}
    
      	const finalLogs = [...generatedLogs.reverse()];
		
      	fs.writeFileSync('data/changelogs.json', JSON.stringify(finalLogs, null, 2));
      	console.log(`已生成 ${generatedLogs.length} 筆更新日誌`);
    }
  
    fs.writeFileSync('data/levels-processed.json', JSON.stringify(finalLevels, null, 2));
    console.log('已生成 levels-processed.json');
}

buildData();