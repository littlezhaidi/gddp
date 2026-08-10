import { getLevels, getThumbUrl, getTierColor, getEnjoymentStyle } from './data.js';

async function loadStats() {
    try {
        const levels = await getLevels();
        
        renderEnjoymentSpread(levels);
        renderDifficultySpread(levels);
        renderOverview(levels);
    } catch (err) {
        console.error(err);
    }
}

function renderEnjoymentSpread(levels) {
    const counts = Array(11).fill(0);

    levels.forEach(l => {
        const score = Math.round(l.enjoyment || 0);
        if (score >= 0 && score <= 10) {
            counts[score]++;
        }
    });

    const maxCount = Math.max(...counts, 1);
    const tbody = document.getElementById('enjoyment-table-body');
    tbody.innerHTML = '';

    for (let i = 0; i <= 10; i++) {
        const count = counts[i];

        const widthPct = count > 0 ? Math.max((count / maxCount) * 100, 2) : 0;
        const color = getEnjoymentStyle(i);

        const tr = document.createElement('tr');
        tr.className = "h-6";
        tr.innerHTML = `
            <!-- Y軸 標籤 -->
            <td class="w-8 text-right pr-3 font-mono text-slate-300 border-r border-slate-600/80 select-none">
                ${i}
            </td>
            <!-- 數量 -->
            <td class="w-12 text-right pr-3 pl-3 font-mono text-xs font-bold text-slate-200 select-none">
                ${count}
            </td>
            <!-- 長條圖 -->
            <td class="py-1 pl-1 w-full">
                <div class="h-5 rounded-md transition-all duration-500 ease-out" 
                     style="width: ${widthPct}%; background-${color};">
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    }
}


function renderDifficultySpread(levels) {
    let maxTier = 0;
    levels.forEach(l => {
        const t = Math.round(l.tier || 0);
        if (t > maxTier) maxTier = t;
    });
    
    if (maxTier === 0) return; 
    
    const counts = Array(maxTier + 1).fill(0);
    levels.forEach(l => {
        const tier = Math.round(l.tier || 0);
        if (tier >= 1) {
            counts[tier]++;
        }
    });
    
    const maxCount = Math.max(...counts, 1);
    const tbody = document.getElementById('difficulty-table-body');
    tbody.innerHTML = '';
    
    for (let i = 1; i <= maxTier; i++) {
        const count = counts[i];
        if (count === 0) continue;
      
    const widthPct = Math.max((count / maxCount) * 100, 2);
      
    const color = getTierColor(i);
      
    const tr = document.createElement('tr');
    tr.className = "h-6";
    tr.innerHTML = `
        <!-- Y軸 標籤 -->
        <td class="w-8 text-right pr-3 font-mono text-slate-300 border-r border-slate-600/80 select-none">
              ${i}
        </td>
        <!-- 數量 -->
        <td class="w-12 text-right pr-3 pl-3 font-mono text-xs font-bold text-slate-200 select-none">
            ${count}
        </td>
        <!-- 長條圖 -->
        <td class="py-1 pl-1 w-full">
            <div class="h-5 rounded-md transition-all duration-500 ease-out" 
                 style="width: ${widthPct}%; background-color: ${color};">
            </div>
        </td>
    `;
        tbody.appendChild(tr);
    }
}

function renderOverview(levels) {
    const totalLevels = levels.length;

    const totalAttempts = levels.reduce((sum, l) => {
        const att = Number(l.attempts) || 0;
        return sum + att;
    }, 0);

    const avgEnjoyment = (levels.reduce((acc, l) => acc + l.enjoyment, 0) / levels.length).toFixed(1);

    const hardestLevel = levels.reduce((max, level) => {
        return (level.tier > max.tier) ? level : max;
    }, levels[0]);
    
    const hardestElem = document.getElementById('stat-hardest');
    if (hardestLevel) {
        hardestElem.innerHTML = `<a href="/detail.html?id=${hardestLevel.levelId}">${hardestLevel.name}</a>`
    }

    document.getElementById('total-attempts').textContent = totalAttempts.toLocaleString();
    document.getElementById('stat-avg-enjoyment').innerText = `${avgEnjoyment}`;
    document.getElementById('stat-total').innerText = levels.length;
}

document.addEventListener('DOMContentLoaded', loadStats);