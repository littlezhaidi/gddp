    let levelsData = [];
    
    const tierColors = [
      "rgb(221, 223, 238)", 
      "rgb(213, 211, 233)", 
      "rgb(211, 203, 231)", 
      "rgb(211, 195, 228)", 
      "rgb(212, 187, 226)", 
      "rgb(213, 176, 222)", 
      "rgb(219, 167, 220)", 
      "rgb(219, 159, 209)", 
      "rgb(217, 145, 193)", 
      "rgb(218, 134, 176)",
      "rgb(219, 118, 152)",
      "rgb(220, 106, 125)",
      "rgb(221, 90, 90)",  
      "rgb(220, 81, 76)",  
      "rgb(218, 73, 62)",  
      "rgb(218, 69, 52)",  
      "rgb(217, 62, 38)",  
      "rgb(220, 63, 35)",  
      "rgb(192, 58, 26)",  
      "rgb(178, 52, 21)"   
    ];

    const enjoymentColors = [
      "rgb(230, 124, 115)",
      "rgb(237, 149, 115)",
      "rgb(243, 174, 114)",
      "rgb(248, 198, 111)",
      "rgb(252, 222, 107)",
      "rgb(255, 246, 102)",
      "rgb(224, 234, 113)",
      "rgb(193, 223, 122)",
      "rgb(160, 211, 129)",
      "rgb(126, 199, 134)", 
      "rgb(87, 187, 138)"   
    ];

    function getTierStyle(tier) {
      if (!tier || tier <= 0) return 'color: rgb(148, 163, 184); background-color: rgba(148, 163, 184, 0.15); border-color: rgba(148, 163, 184, 0.3);';
      
      const rgb = tier <= 20 ? tierColors[tier - 1] : "rgb(131, 38, 7)"; // Tier 21+ 顏色
      const rgbaBg = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.18)');
      const rgbaBorder = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.4)');
      
      return `color: ${rgb}; background-color: ${rgbaBg}; border-color: ${rgbaBorder};`;
    }

    function getEnjoymentStyle(score) {
      const rounded = Math.min(Math.max(Math.round(score || 0), 0), 10);
      const rgb = enjoymentColors[rounded];
      return `color: ${rgb};`;
    }

    async function loadLevels() {
      try {
        const response = await fetch('levels.json');
        const rawLevels = await response.json();

        document.getElementById('cards-grid').innerHTML = `
          <div class="col-span-full text-center text-slate-400 py-12">
            <i class="fa-solid fa-spinner fa-spin text-3xl mb-3 text-cyan-400"></i>
            <p>正在同步 GDDL 伺服器資料...</p>
          </div>`;

        levelsData = await Promise.all(rawLevels.map(async (level) => {
          try {
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://gdladder.com/api/level/${level.levelId}`)}`)
            const data = res.ok ? await res.json() : {};

            const meta = data.Meta;
            const demonType = meta.Difficulty ? meta.Difficulty.split(' ')[0].toLowerCase() : 'hard';
            const tier = Math.round(data.Rating);

            let rarity = 'none';
            if (meta.Rarity == 1) rarity = 'feature';
            else if (meta.Rarity == 2) rarity = 'epic';
            else if (meta.Rarity == 3) rarity = 'legendary';
            else if (meta.Rarity == 4) rarity = 'mythic';

            return {
              ...level,
              name: meta.Name || `Level ${level.levelId}`,
              creator: meta.Publisher.name || 'Unknown',
              demonType: demonType,
              rarity: rarity,
              tier: tier
            };
          } catch (err) {
            console.warn(`關卡 ID ${level.levelId} 資料抓取失敗：`, err);
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

        updateStats();
        handleFilterAndSort();
      } catch (err) {
        console.error("無法載入 levels.json：", err);
        document.getElementById('cards-grid').innerHTML = `<p class="col-span-full text-center text-red-400 py-10">載入資料失敗，請確認網路連線或重新整理網頁。</p>`;
      }
    }

    function renderCards(data) {
      const grid = document.getElementById('cards-grid');
      grid.innerHTML = '';

      if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-slate-500 py-10">未找到符合條件的關卡。</p>`;
        return;
      }

      data.forEach(level => {
        const demonLogoUrl = `https://gdladder.com/images/demon_logos/${level.demonType}_128.webp`;
        const hasRarity = level.rarity && level.rarity !== 'none';
        const rarityUrl = hasRarity ? `https://gdladder.com/images/rarity/${level.rarity}_128.webp` : '';
        const thumbnailUrl = `https://levelthumbs.prevter.me/thumbnail/${level.levelId}/high`;

        const hasVideo = level.videoUrl && level.videoUrl.trim() !== '';
        const cardStyleClass = hasVideo ? 'card-has-video group' : 'card-no-video';
        const clickAttr = hasVideo ? `onclick="window.open('${level.videoUrl}', '_blank')"` : '';
        const imgHoverScale = hasVideo ? 'group-hover:scale-105' : '';

        const cardHTML = `
          <div ${clickAttr} class="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between ${cardStyleClass}">
            
            <!-- Top Banner -->
            <div class="relative w-full h-40 bg-slate-950 overflow-hidden">
              <img src="${thumbnailUrl}" 
                   alt="${level.name}" 
                   class="w-full h-full object-cover opacity-80 transition-transform duration-500 ${imgHoverScale}"
                   onerror="this.onerror=null; this.src='https://via.placeholder.com/600x337/0f172a/475569?text=No+Thumbnail';">
              
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50"></div>

              <!-- Level ID Badge -->
              <span class="absolute top-3 left-3 bg-slate-950/70 border border-slate-700/60 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-md">
                ID: ${level.levelId}
              </span>

              <!-- Stacked GD Icon -->
              <div class="absolute top-2 right-2 w-14 h-14 flex items-center justify-center drop-shadow-lg">
                ${hasRarity ? `
                  <img src="${rarityUrl}" alt="${level.rarity}" class="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110">
                ` : ''}
                <img src="${demonLogoUrl}" alt="${level.demonType}" class="absolute inset-0 w-full h-full object-contain scale-110">
              </div>

              <!-- Level Title & Creator -->
              <div class="absolute bottom-2 left-4 right-4">
                <h3 class="text-xl font-bold text-white tracking-wide truncate drop-shadow-md">${level.name}</h3>
                <p class="text-xs text-slate-300 drop-shadow">by ${level.creator}</p>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-4">
              <!-- Description -->
              ${(level.attempts || level.review) ? `
                <details class="mt-3 text-xs border-t border-slate-800/80 pt-2 text-slate-300 group/details" onclick="event.stopPropagation()">
                  <summary class="cursor-pointer select-none flex items-center justify-between text-slate-400 hover:text-violet-300 transition-colors py-1 font-semibold">
                    <span class="flex items-center gap-1.5">
                      description
                    </span>
                    <i class="fa-solid fa-chevron-down text-[10px] transform transition-transform group-open/details:rotate-180"></i>
                  </summary>

                  <div class="mt-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-2">
                    ${level.attempts ? `
                      <div class="flex items-center gap-2 text-slate-300 font-mono">
                        <span>attempts: <strong class="text-white">${level.attempts.toLocaleString()}</strong></span>
                      </div>
                    ` : ''}

                    ${level.review ? `
                      <div class="text-slate-300 leading-relaxed pt-1 border-t border-slate-900 whitespace-pre-line">
                        ${level.review}
                      </div>
                    ` : ''}
                  </div>
                </details>
              ` : ''}
              <div class="grid grid-cols-2 gap-3 my-1">
                <!-- Difficulty Tier Badge -->
                <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Difficulty</span>
                  <span class="text-lg font-black px-2 py-0.5 rounded inline-block mt-0.5 border" style="${getTierStyle(level.tier)}">
                    Tier ${level.tier}
                  </span>
                </div>
                
                <!-- Enjoyment Badge -->
                <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enjoyment</span>
                  <span class="text-lg font-black inline-block mt-0.5" style="${getEnjoymentStyle(level.enjoyment)}">
                    ${Math.round(level.enjoyment)} <span class="text-xs text-slate-500">/ 10</span>
                  </span>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="flex justify-between items-center text-xs text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
                <span class="flex items-center gap-1.5">
                  <i class="fa-regular fa-calendar-check text-slate-500"></i>
                  ${level.date || '未知日期'}
                </span>
                ${hasVideo ? `
                  <span class="text-red-400 flex items-center gap-1 text-[11px] font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    <i class="fa-brands fa-youtube"></i>
                  </span>
                ` : `
                  <span class="text-slate-600 text-[11px]">無影片</span>
                `}
              </div>
            </div>

          </div>
        `;
        grid.innerHTML += cardHTML;
      });
    }

    function updateStats() {
      if (!levelsData.length) return;
      document.getElementById('stat-total').innerText = levelsData.length;

      const maxTier = Math.max(...levelsData.map(l => l.tier));
      document.getElementById('stat-max-tier').innerText = `Tier ${maxTier}`;

      const avgEnjoyment = (levelsData.reduce((acc, l) => acc + l.enjoyment, 0) / levelsData.length).toFixed(1);
      document.getElementById('stat-avg-enjoyment').innerText = `${avgEnjoyment} / 10`;
    }

    function handleFilterAndSort() {
      const searchTerm = document.getElementById('search-input').value.toLowerCase();
      const sortValue = document.getElementById('sort-select').value;

      let filtered = levelsData.filter(level =>
        level.name.toLowerCase().includes(searchTerm) ||
        level.creator.toLowerCase().includes(searchTerm) ||
        String(level.levelId).includes(searchTerm)
      );

      filtered.sort((a, b) => {
        if (sortValue === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
        if (sortValue === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
        if (sortValue === 'tier-desc') return b.tier - a.tier;
        if (sortValue === 'tier-asc') return a.tier - b.tier;
        if (sortValue === 'enjoyment-desc') return b.enjoyment - a.enjoyment;
        if (sortValue === 'enjoyment-asc') return a.enjoyment - b.enjoyment;
      });

      renderCards(filtered);
    }

    document.getElementById('search-input').addEventListener('input', handleFilterAndSort);
    document.getElementById('sort-select').addEventListener('change', handleFilterAndSort);

    loadLevels();