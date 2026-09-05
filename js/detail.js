import { getLevelById, getThumbUrl, getTierStyle, getEnjoymentStyle } from './data.js';

async function initDetailPage() {

    const container = document.getElementById('detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const level = await getLevelById(id);

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
            <p class="text-slate-400 text-sm mt-1">
              <span class="text-slate-200 font-semibold">#${level.rank}</span>, Created by <span class="text-slate-200 font-semibold">${level.creator}</span>
            </p>
          </div>

          <div class="flex items-center gap-2 px-3 py-1.5 shrink-0">
            <div class="relative w-10 md:w-14 flex items-end justify-end">
              ${level.hasRarity ? `
                <img src="${level.rarityUrl}" alt="${level.rarity}" class="absolute inset-0 w-full h-full object-contain scale-150 pointer-events-none">
              ` : ''}
              <img src="${level.demonLogoUrl}" alt="${level.demonType}" class="w-full h-full object-contain scale-150 relative z-10 drop-shadow">
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
            src="${getThumbUrl(level.id)}"
            alt="${level.name}">
          </img>
          <p class="text-slate-500 text-sm italic">此關卡無通關影片</p>
        `}

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase">Difficulty</span>
            <span class="text-xl font-bold text-slate-200 px-1.5 py-0.5 md:px-3 rounded inline-block border" style="${getTierStyle(level.tier)}">tier ${Math.round(level.tier)}</span>
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
          <h3 class="text-sm font-bold text-slate-400 tracking-wider mb-2">REVIEW / 心得</h3>
          <p class="text-slate-200 leading-relaxed whitespace-pre-line text-base mb-2">${level.review ? `${level.review}` : '（尚未更新）'}</p>
          <a href="https://gdladder.com/level/${level.id}" 
             class="text-sm font-bold text-slate-400 tracking-wider underline hover:text-violet-300"> 
            GDDL link
          </a>
        </div>
      </div>
    `;
}

document.addEventListener('DOMContentLoaded', initDetailPage);