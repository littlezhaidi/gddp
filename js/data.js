let levelsCache = null;

export const tierColors = [
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

export const enjoymentColors = [
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

export const SPECIAL_THUMB_IDS = {
    1: 14, // clubstep
    2: 18, // toe2
    3: 20  // deadlocked
};

export function getTierColor(tier){
    if (!tier || tier <= 0) return 'rgb(148, 163, 184)';

    const rgb = tier <= 20 ? tierColors[Math.round(tier) - 1] : "rgb(131, 38, 7)";
    return rgb;
}

export function getTierStyle(tier) {
    if (!tier || tier <= 0) return 'color: rgb(148, 163, 184); background-color: rgba(148, 163, 184, 0.15); border-color: rgba(148, 163, 184, 0.3);';
    
    const rgb = getTierColor(tier);
    const rgbaBg = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.18)');
    const rgbaBorder = rgb.replace('rgb(', 'rgba(').replace(')', ', 0.4)');
    
    return `color: ${rgb}; background-color: ${rgbaBg}; border-color: ${rgbaBorder};`;
}

export function getEnjoymentStyle(score) {
    const rounded = Math.min(Math.max(Math.round(score || 0), 0), 10);
    const rgb = enjoymentColors[rounded];
    return `color: ${rgb};`;
}

export function getThumbUrl(id) {
    const thumbId = SPECIAL_THUMB_IDS[id] ? SPECIAL_THUMB_IDS[id] : id;
    return `https://levelthumbs.prevter.me/thumbnail/${thumbId}/high`;
}

function enrichLevelData(level) {
  const demonType = level.demonType || 'hard';
  const hasRarity = Boolean(level.rarity && level.rarity !== 'none');

  return {
    ...level,
    demonLogoUrl: `https://gdladder.com/images/demon_logos/${demonType}_128.webp`,
    hasRarity,
    rarityUrl: hasRarity ? `https://gdladder.com/images/rarity/${level.rarity}_128.webp` : ''
  };
}

export async function getLevels() {
    if (levelsCache) return levelsCache;

    try {
        const res = await fetch('data/levels-processed.json');
        if (!res.ok) throw new Error('無法讀取關卡資料');
        const rawData = await res.json();

        levelsCache = rawData.map(enrichLevelData);
        return levelsCache;
    } catch (err) {
        console.error('Data Fetch Error:', err);
        return [];
    }
}

export async function getLevelById(id) {
    const levels = await getLevels();
    return levels.find(l => String(l.id) === String(id)) || null;
}

export function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', '回到頂部');
    
    btn.className = `
        fixed bottom-6 right-6 z-50 p-3.5 md:w-20 md:h-14 rounded-full  
        bg-slate-700 hover:bg-slate-600 shadow-lg shadow-violet-600/15
        transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-none
        focus:outline-none flex items-center justify-center cursor-pointer
    `.replace(/\s+/g, ' ').trim();

    btn.innerHTML = `<i class="fa-solid fa-arrow-up text-lg text-violet-400"></i>`;

    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
            btn.classList.add('opacity-100', 'translate-y-0');
        } else {
            btn.classList.remove('opacity-100', 'translate-y-0');
            btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}