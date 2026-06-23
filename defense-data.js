// ============================================================
// 御灵守卫战 - 数据层（精简版）
// 单一货币：积分。表现录入得积分 → 买武器 → 摆到战场塔防。
// 独立存档，不影响现有塔防(focusTree_towerData_v2)
// ============================================================

const DEF_KEY = 'focusTree_defenseData_v2';

// ===== 家长录入孩子表现 → 积分 =====
const DEF_REWARDS = [
    { id: 'hwDone',    label: '学校作业全部完成',     pts: 50,  icon: '📚' },
    { id: 'hwPerfect', label: '作业全对不用改',       pts: 30,  icon: '✅' },
    { id: 'essay',     label: '完成一篇作文',         pts: 100, icon: '📝' },
    { id: 'reading',   label: '完成今日阅读',         pts: 20,  icon: '📖' },
    { id: 'words',     label: '背单词打卡',           pts: 20,  icon: '🔤' },
    { id: 'exam',      label: '认真做一张卷子',       pts: 50,  icon: '📋' },
    { id: 'exercise',  label: '运动/跳绳达标',        pts: 30,  icon: '🤸' },
    { id: 'eyecare',   label: '护眼远眺',             pts: 15,  icon: '👁️' },
    { id: 'chores',    label: '主动做家务',           pts: 15,  icon: '🧹' },
    { id: 'manner',    label: '今天表现有礼貌',       pts: 10,  icon: '😊' },
];

const DEF_PENALTIES = [
    { id: 'noHw',    label: '没完成作业',   pts: -20, icon: '❌' },
    { id: 'lazy',    label: '拖拉磨蹭',     pts: -10, icon: '🐢' },
    { id: 'temper',  label: '发脾气',       pts: -10, icon: '😠' },
];

// ===== 武器定义（精简 5 种，用积分购买）=====
// role: dps/sniper/control/aoe/wall   render: 画法标识
const DEF_WEAPONS = {
    dragon: {
        id: 'dragon', name: '小龙', role: 'dps', render: 'dragon',
        price: 100, color: '#34d399',
        hp: 120, atk: 22, cooldown: 45, projSpeed: 9,
        desc: '主力速射，持续向通道喷吐龙息',
    },
    crossbow: {
        id: 'crossbow', name: '连弩', role: 'sniper', render: 'crossbow',
        price: 180, color: '#f59e0b',
        hp: 110, atk: 55, cooldown: 95, projSpeed: 15,
        desc: '锁定最前方敌人，单发高伤、射速快',
    },
    ice: {
        id: 'ice', name: '寒冰塔', role: 'control', render: 'ice',
        price: 150, color: '#38bdf8',
        hp: 100, atk: 12, cooldown: 65, projSpeed: 9,
        slow: 0.5, slowDuration: 150,
        desc: '命中减速，让敌人变慢更好打',
    },
    cannon: {
        id: 'cannon', name: '火炮', role: 'aoe', render: 'cannon',
        price: 220, color: '#f97316',
        hp: 120, atk: 45, cooldown: 125, projSpeed: 7,
        splashRadius: 95,
        desc: '炮弹落地爆炸，一次炸伤一片',
    },
    wall: {
        id: 'wall', name: '石墙', role: 'wall', render: 'wall',
        price: 60, color: '#94a3b8',
        hp: 650, atk: 0, cooldown: 0,
        desc: '高血量肉盾，挡住通道争取时间',
    },
};

// ===== 敌人定义（蜥蜴用像素帧，其余手绘矢量造型）=====
const DEF_ENEMIES = {
    lizard: { id: 'lizard', name: '蜥蜴怪',   render: 'lizard', sprite: 'lizard', tint: null,
              hpMult: 1.0, speedMult: 1.0, atk: 10, scale: 1.05 },
    slime:  { id: 'slime',  name: '毒史莱姆', render: 'slime',  color: '#84cc16',
              hpMult: 1.3, speedMult: 0.8, atk: 9,  scale: 1.05 },
    bat:    { id: 'bat',    name: '急速蝙蝠', render: 'bat',    color: '#a78bfa',
              hpMult: 0.45, speedMult: 2.0, atk: 6, scale: 0.95 },
    golem:  { id: 'golem',  name: '岩石魔像', render: 'golem',  color: '#a8a29e',
              hpMult: 3.2, speedMult: 0.5, atk: 18, scale: 1.4 },
    wraith: { id: 'wraith', name: '幽魂',     render: 'wraith', color: '#c084fc',
              hpMult: 1.4, speedMult: 1.15, atk: 12, scale: 1.15 },
    boss:   { id: 'boss',   name: '魔王',     render: 'demon',  color: '#ef4444',
              hpMult: 14, speedMult: 0.5, atk: 45, scale: 2.3, isBoss: true },
};

// ===== 关卡配置（6 条通道）=====
const DEF_LEVELS = [
    { level: 1,  baseHp: 45,  count: 8,  spawnGap: 135, speed: 0.40, mix: { lizard: 1 },                            reward: 30 },
    { level: 2,  baseHp: 60,  count: 12, spawnGap: 115, speed: 0.45, mix: { lizard: 2, slime: 1 },                  reward: 35 },
    { level: 3,  baseHp: 80,  count: 14, spawnGap: 100, speed: 0.50, mix: { lizard: 2, slime: 1, bat: 1 },          reward: 40 },
    { level: 4,  baseHp: 95,  count: 16, spawnGap: 92,  speed: 0.52, mix: { lizard: 2, bat: 2, slime: 1 },          reward: 45 },
    { level: 5,  baseHp: 120, count: 14, spawnGap: 95,  speed: 0.50, mix: { lizard: 2, golem: 1 },                  reward: 70,  boss: true },
    { level: 6,  baseHp: 130, count: 20, spawnGap: 82,  speed: 0.55, mix: { lizard: 2, bat: 2, golem: 1 },          reward: 55 },
    { level: 7,  baseHp: 150, count: 22, spawnGap: 80,  speed: 0.58, mix: { slime: 2, bat: 2, wraith: 1 },          reward: 60 },
    { level: 8,  baseHp: 175, count: 24, spawnGap: 76,  speed: 0.60, mix: { lizard: 2, golem: 1, wraith: 2 },       reward: 65 },
    { level: 9,  baseHp: 200, count: 26, spawnGap: 73,  speed: 0.62, mix: { bat: 2, wraith: 2, golem: 1 },          reward: 70 },
    { level: 10, baseHp: 240, count: 18, spawnGap: 82,  speed: 0.58, mix: { golem: 2, wraith: 1, bat: 1 },          reward: 120, boss: true },
];

function getLevelConfig(level) {
    if (level <= DEF_LEVELS.length) return DEF_LEVELS[level - 1];
    const over = level - DEF_LEVELS.length;
    return {
        level,
        baseHp: Math.round(240 * Math.pow(1.12, over)),
        count: Math.min(50, 20 + over * 2),
        spawnGap: Math.max(50, 80 - over * 2),
        speed: Math.min(1.1, 0.58 + over * 0.03),
        mix: { lizard: 2, bat: 2, slime: 1, wraith: 2, golem: 1 },
        reward: 80 + over * 5,
        boss: level % 5 === 0,
    };
}

// ===== 网格布局 =====
const DEF_COLS = 6;        // 6 条纵向通道
const DEF_PLACE_ROWS = 4;  // 底部四排，共 24 个格子

// ===== 数据存取 =====
function getDefData() {
    const raw = localStorage.getItem(DEF_KEY);
    if (raw) return JSON.parse(raw);
    // 初始：100 积分 + 赠送 5 小龙 + 2 石墙（够铺满 5 条通道开打）
    const data = {
        points: 100,
        arsenal: { dragon: 6, wall: 3 },
        highestLevel: 1,
        lastGiftDate: null,
        history: [{ date: new Date().toLocaleDateString('zh-CN'), label: '系统赠送初始武器和积分', pts: 100 }],
    };
    localStorage.setItem(DEF_KEY, JSON.stringify(data));
    return data;
}

function saveDefData(data) {
    localStorage.setItem(DEF_KEY, JSON.stringify(data));
}

function addDefPoints(pts, label) {
    const data = getDefData();
    data.points = Math.max(0, data.points + pts);
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label, pts });
    if (data.history.length > 60) data.history.length = 60;
    saveDefData(data);
    return data;
}

// 购买一件武器
function buyWeapon(id) {
    const data = getDefData();
    const w = DEF_WEAPONS[id];
    if (!w || data.points < w.price) return false;
    data.points -= w.price;
    data.arsenal[id] = (data.arsenal[id] || 0) + 1;
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: `购买 ${w.name}`, pts: -w.price });
    saveDefData(data);
    return true;
}
