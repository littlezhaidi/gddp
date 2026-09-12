import { initBackToTop } from './data.js'

async function renderChangelog() {
    const container = document.getElementById('changelog-container');
    try {
        const res = await fetch('data/changelogs.json');
        if (!res.ok) throw new Error();
        const logs = await res.json();

        if (logs.length === 0) {
          container.innerHTML = `<p class="text-slate-500 text-sm">目前尚無通關紀錄。</p>`;
          return;
        }

        container.innerHTML = logs.map((log, index) => {
            const isLatest = index === 0;
            
            let placementText = '';
            const aboveText = `<a href="detail.html?id=${log.aboveId}" class="font-semibold text-violet-200 hover:underline transition-colors">${log.aboveName}</a>`;
            const belowText = `<a href="detail.html?id=${log.belowId}" class="font-semibold text-violet-200 hover:underline transition-colors">${log.belowName}</a>`
            if (log.aboveName && log.belowName) placementText = `, above ${aboveText} and below ${belowText}`;
            else if (log.aboveName) placementText = `, above ${aboveText}`;
            else if (log.belowName) placementText = `, below ${belowText}`;

            const textHtml = `
                <a href="detail.html?id=${log.targetId}" class="font-black text-yellow-500 hover:underline transition-colors">${log.targetName}</a>
                was placed at <span class="font-bold text-violet-400">#${log.rank}</span>` + `${placementText}.`;

            return `
                <div class="relative group">
                    <!-- 時間軸圓點 -->
                    <div class="absolute -left-[31px] md:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full ${isLatest ? 'bg-violet-500 ring-2 ring-violet-500/50 scale-110' : 'bg-slate-700'} border-4 border-slate-900 transition-all"></div>

                <!-- 通關日期與標籤 -->
                <div class="flex items-center gap-2.5 mb-2">
                    <span class="text-xs md:text-sm font-mono font-bold ${isLatest ? 'text-violet-300 bg-violet-500/10 border-violet-500/20' : 'text-slate-400 bg-slate-800 border-slate-700'} border px-2.5 py-0.5 rounded-md">
                          ${log.date}
                    </span>
                </div>

                <!-- 卡片內文 -->
                <div class="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                    <p class="text-base md:text-lg text-slate-200 leading-relaxed">${textHtml}</p>
                </div>
            </div>
        `;
        }).join('');

    } catch (e) {
        container.innerHTML = `<p class="text-slate-500 text-sm">尚未建立更新日誌資料。</p>`;
        console.log(e);
    }
}

renderChangelog();
initBackToTop();