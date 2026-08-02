let levelsData = [];
//let currentSortKey = 'date';
let currentSortOrder = true;

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
  
  const rgb = tier <= 20 ? tierColors[tier - 1] : "rgb(131, 38, 7)";
  const rgbaBg = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.18)');
  const rgbaBorder = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.4)');
  
  return `color: ${rgb}; background-color: ${rgbaBg}; border-color: ${rgbaBorder};`;
}

function getEnjoymentStyle(score) {
  const rounded = Math.min(Math.max(Math.round(score || 0), 0), 10);
  const rgb = enjoymentColors[rounded];
  return `color: ${rgb};`;
}


document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = urlParams.get('id');

  if (levelId) {
    initDetailPage(levelId);
  } else if (document.getElementById('cards-grid')) {
    initIndexPage();
  }
});

async function initIndexPage() {
  try {
    const response = await fetch('levels-processed.json');
    levelsData = await response.json();

    updateStats();
    handleFilterAndSort();
  } catch (err) {
    console.error("無法載入資料：", err);
    document.getElementById('cards-grid').innerHTML = 
      `<p class="col-span-full text-center text-red-400 py-10">載入資料失敗，請重新整理網頁。</p>`;
  }
}

function updateStats() {
  if (!levelsData.length) return;
  document.getElementById('stat-total').innerText = levelsData.length;

  const hardestLevel = levelsData.reduce((max, level) => {
    return (level.rawTier > max.rawTier) ? level : max;
  }, levelsData[0]);

  const maxTierElem = document.getElementById('stat-hardest');
  if (hardestLevel) maxTierElem.innerText = hardestLevel.name;
      

  const avgEnjoyment = (levelsData.reduce((acc, l) => acc + l.enjoyment, 0) / levelsData.length).toFixed(1);
  document.getElementById('stat-avg-enjoyment').innerText = `${avgEnjoyment}`;
}

function handleFilterAndSort() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const sortValue = document.getElementById('sort-key-select').value;

  let filtered = levelsData.filter(level =>
    level.name.toLowerCase().includes(searchTerm) ||
    level.creator.toLowerCase().includes(searchTerm) ||
    String(level.levelId).includes(searchTerm)
  );

  filtered.sort((a, b) => {
      let primaryDiff = 0;

      if (sortValue === 'date') {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        primaryDiff = currentSortOrder ? dateB - dateA : dateA - dateB;
      } 
      else if (sortValue === 'enjoyment') {
        primaryDiff = currentSortOrder ? (b.enjoyment - a.enjoyment) : (a.enjoyment - b.enjoyment);
      } 
      else if (sortValue === 'tier') {
        primaryDiff = currentSortOrder ? (b.rawTier - a.rawTier) : (a.rawTier - b.rawTier);
      }

      if (primaryDiff === 0 && sortValue !== 'tier') {
        return (b.rawTier - a.rawTier);
      }

      return primaryDiff;
    });

  renderCards(filtered);
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
    
    const cardHTML = `
      <div onclick="location.href='detail.html?id=${level.levelId}'" class="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between card group">
        
        <!-- Top Banner -->
        <div class="relative w-full h-40 bg-slate-950 overflow-hidden">
          <img src="${thumbnailUrl}" 
               alt="${level.name}" 
               class="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50"></div>
          
          <span class="absolute top-3 left-3 bg-slate-950/70 border border-slate-700/60 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-md">
            #${level.rank}
          </span>

          <!-- Demon Icon -->
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
          <div class="grid grid-cols-2 gap-3 my-1">
            <!-- Difficulty Tier Badge -->
            <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
              <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Difficulty</span>
              <span class="text-lg font-black px-2 py-0.5 rounded inline-block mt-0.5 border" style="${getTierStyle(level.tier)}">
                tier ${level.tier}
              </span>
            </div>
            
            <!-- Enjoyment Badge -->
            <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center">
              <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enjoyment</span>
              <span class="text-lg font-black inline-block mt-0.5" style="${getEnjoymentStyle(level.enjoyment)}">
                ${Math.round(level.enjoyment)}
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

async function initDetailPage(levelId) {
  const container = document.getElementById('detail-container');
  if (!container) return;

  try {
    const response = await fetch('levels-processed.json');
    levelsData = await response.json();

    const level = levelsData.find(l => String(l.levelId) === String(levelId));
    const hasRarity = level.rarity && level.rarity !== 'none';
    const rarityUrl = hasRarity ? `https://gdladder.com/images/rarity/${level.rarity}_128.webp` : '';
    const demonLogoUrl = `https://gdladder.com/images/demon_logos/${level.demonType}_128.webp`;

    if (!level) {
      container.innerHTML = `<p class="text-center text-red-400">找不到此關卡資料</p>`;
      return;
    }

    document.title = `${level.name} - littlezhaidi demonlist`;

    let embedUrl = '';
    if (level.videoUrl) {
      const videoId = level.videoUrl.split('/').pop().replace('watch?v=', '');
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    document.getElementById('detail-container').innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        
        <!-- Title -->
        <div class="flex justify-between items-start gap-4">
          <div>
            <h1 class="text-3xl md:text-4xl font-extrabold text-white">${level.name}</h1>
            <p class="text-slate-400 text-sm mt-1">Created by <span class="text-slate-200 font-semibold">${level.creator}</span></p>
          </div>

          <div class="flex items-center gap-2 px-3 py-1.5 shrink-0">
            <div class="relative w-10 md:w-14 flex items-end justify-end">
              ${hasRarity ? `
                <img src="${rarityUrl}" alt="${level.rarity}" class="absolute inset-0 w-full h-full object-contain scale-150 pointer-events-none">
              ` : ''}
              <img src="${demonLogoUrl}" alt="${level.demonType}" class="w-full h-full object-contain scale-150 relative z-10 drop-shadow">
            </div>
          </div>
        </div>

        <!-- YT Embed -->
        ${embedUrl ? `
          <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            <iframe src="${embedUrl}" class="w-full h-full border-0" allowfullscreen></iframe>
          </div>
        ` : `
          <img 
            src="${`https://levelthumbs.prevter.me/thumbnail/${level.levelId}/high`}"
            alt="${level.name}">
          </img>
          <p class="text-slate-500 text-sm italic">此關卡無通關影片</p>
        `}

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase">Difficulty</span>
            <span class="text-xl font-bold text-slate-200 px-1.5 py-0.5 md:px-3 rounded inline-block border" style="${getTierStyle(level.tier)}">tier ${level.tier}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase">Enjoyment</span>
            <span class="text-xl font-bold" style="${getEnjoymentStyle(level.enjoyment)}">${level.enjoyment}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase">Attempts</span>
            <span class="text-xl font-bold text-slate-200">${level.attempts ? level.attempts.toLocaleString() : '-'}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase">Clear Date</span>
            <span class="text:lg md:text-xl font-bold text-slate-200">${level.date || '未知'}</span>
          </div>
        </div>

        <!-- Comment -->
        <div class="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Review / 心得</h3>
          <p class="text-slate-200 leading-relaxed whitespace-pre-line text-sm">${level.review ? `${level.review}` : '（尚未更新）'}</p>
          <a href="https://gdladder.com/level/${level.levelId}" 
             class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2 underline hover:text-violet-300"> 
            GDDL link
          </a>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-center text-red-400">載入失敗</p>`;
  }
}

document.getElementById('search-input').addEventListener('input', handleFilterAndSort);
document.getElementById('sort-key-select').addEventListener('change', handleFilterAndSort);

const sortOrderBtn = document.getElementById('sort-order-btn');
if (sortOrderBtn) {
  sortOrderBtn.addEventListener('click', () => {
    currentSortOrder = !currentSortOrder;

    const icon = document.getElementById('sort-order-icon');
    const text = document.getElementById('sort-order-text');

    if (icon && text) {
      if (currentSortOrder) {
        icon.className = 'fa-solid fa-arrow-down-wide-short';
        text.innerText = '降序';
      } else {
        icon.className = 'fa-solid fa-arrow-up-wide-short';
        text.innerText = '升序';
      }
    }

    handleFilterAndSort();
  });
}