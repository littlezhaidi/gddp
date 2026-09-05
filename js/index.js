import { getLevels, getThumbUrl, getTierStyle, getEnjoymentStyle, initBackToTop } from './data.js';

let currentSortOrder = true;
let levels = [];

async function initIndexPage() {
    levels = await getLevels();
    try {
        updateRecentLevel();
        handleFilterAndSort();
        initBackToTop();
    } catch (err) {
        console.error("無法載入資料：", err);
        document.getElementById('cards-grid').innerHTML = 
            `<p class="col-span-full text-center text-slate-500 py-10">未找到符合條件的關卡。</p>`;
    }

}

function updateRecentLevel() {
    const recentLevel = levels.reduce((max, level) => {
        const dateA = new Date(max.date || 0);
        const dateB = new Date(level.date || 0);
        return (dateA - dateB) ? level : max;
    }, levels[0]);

    const recentElem = document.getElementById('recent-level');
    if (recentLevel) {
        recentElem.href = `/detail.html?id=${recentLevel.id}`
        recentElem.innerHTML = `<i class="fa-regular fa-calendar-check"></i> 最近通關: ${recentLevel.name}`
    }
}

function handleFilterAndSort() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortValue = document.getElementById('sort-key-select').value;

    let filtered = levels.filter(level =>
        level.name.toLowerCase().includes(searchTerm) ||
        level.creator.toLowerCase().includes(searchTerm) ||
        String(level.id).includes(searchTerm)
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
            primaryDiff = currentSortOrder ? (b.tier - a.tier) : (a.tier - b.tier);
        }

        if (primaryDiff === 0 && sortValue !== 'tier') {
            return (b.tier - a.tier);
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
        const cardHTML = `
            <div onclick="location.href='detail.html?id=${level.id}'" class="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between card group">

                <!-- Top Banner -->
                <div class="relative w-full h-40 bg-slate-950 overflow-hidden">
                    <img src="${getThumbUrl(level.id)}" 
                         alt="${level.name}" 
                         class="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50"></div>

                    <span class="absolute top-3 left-3 bg-slate-950/70 border border-slate-700/60 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-md">
                        #${level.rank}
                    </span>

                    <!-- Demon Icon -->
                    <div class="absolute top-2 right-2 w-14 h-14 flex items-center justify-center drop-shadow-lg">
                        ${level.hasRarity ? `
                          <img src="${level.rarityUrl}" alt="${level.rarity}" class="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110">
                        ` : ''}
                        <img src="${level.demonLogoUrl}" alt="${level.demonType}" class="absolute inset-0 w-full h-full object-contain scale-110">
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
                            <span class="text-lg font-black px-2 py-0.5 rounded inline-block mt-0.5 border" style="${getTierStyle(Math.round(level.tier))}">
                                tier ${Math.round(level.tier)}
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
                        ${(level.videoUrl && level.videoUrl.trim() !== '') ? `
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
document.addEventListener('DOMContentLoaded', initIndexPage);
