// ============================================================
// 御灵守卫战 - 数据层
// 单一货币：积分。只能家长录入孩子表现获得；战斗不产生积分。
// 积分 → 买武器 → 摆到战场塔防。
// ============================================================

const DEF_KEY = 'focusTree_defenseData_v3';

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

// ===== 武器定义（用积分购买）=====
// render: 画法标识  proj: 子弹行为 normal/splash/slow/chain/bounce/split
const DEF_WEAPONS = {
    wall: {
        id: 'wall', name: '石墙', role: 'wall', render: 'wall',
        price: 60, color: '#94a3b8', hp: 650, atk: 0, cooldown: 0,
        desc: '基础肉盾，挡住通道争取时间',
    },
    steelwall: {
        id: 'steelwall', name: '钢铁砖墙', role: 'wall', render: 'steelwall',
        price: 150, color: '#64748b', hp: 2800, atk: 0, cooldown: 0,
        desc: '超高血量，能扛敌人好一阵子',
    },
    dragon: {
        id: 'dragon', name: '小龙', role: 'dps', render: 'dragon',
        price: 100, color: '#34d399', hp: 120, atk: 22, cooldown: 45, projSpeed: 9, proj: 'normal',
        desc: '主力速射，持续喷吐龙息',
    },
    crossbow: {
        id: 'crossbow', name: '连弩', role: 'sniper', render: 'crossbow',
        price: 160, color: '#f59e0b', hp: 110, atk: 55, cooldown: 95, projSpeed: 15, proj: 'normal',
        desc: '锁定最前方敌人，单发高伤',
    },
    cannon: {
        id: 'cannon', name: '火炮', role: 'aoe', render: 'cannon',
        price: 220, color: '#f97316', hp: 120, atk: 45, cooldown: 125, projSpeed: 7, proj: 'splash',
        splashRadius: 100, desc: '炮弹落地爆炸，炸伤一片',
    },
    ice: {
        id: 'ice', name: '寒冰塔', role: 'control', render: 'ice',
        price: 150, color: '#38bdf8', hp: 100, atk: 12, cooldown: 65, projSpeed: 9, proj: 'slow',
        slow: 0.5, slowDuration: 150, desc: '命中减速 50%',
    },
    hail: {
        id: 'hail', name: '冰雹', role: 'control', render: 'hail',
        price: 200, color: '#7dd3fc', hp: 100, atk: 18, cooldown: 80, projSpeed: 8, proj: 'slow',
        slow: 0.8, slowDuration: 180, splashRadius: 70, desc: '命中减速 80%，范围冰冻',
    },
    lightning: {
        id: 'lightning', name: '闪电', role: 'chain', render: 'lightning',
        price: 280, color: '#a78bfa', hp: 100, atk: 35, cooldown: 90, projSpeed: 16, proj: 'chain',
        chain: 4, chainRadius: 170, desc: '命中后裂变电击附近多个敌人',
    },
    bouncer: {
        id: 'bouncer', name: '弹跳球', role: 'aoe', render: 'bouncer',
        price: 240, color: '#22d3ee', hp: 100, atk: 28, cooldown: 85, projSpeed: 8, proj: 'bounce',
        bounces: 7, desc: '打出后满屏弹跳，反复命中敌人',
    },
    splitter: {
        id: 'splitter', name: '分裂弹', role: 'dps', render: 'splitter',
        price: 260, color: '#f472b6', hp: 100, atk: 64, cooldown: 100, projSpeed: 10, proj: 'split',
        splits: 3, desc: '命中后分裂成两发，伤害减半再分裂',
    },
    barracks: {
        id: 'barracks', name: '军营', role: 'army', render: 'barracks',
        price: 300, color: '#eab308', hp: 220, atk: 0, cooldown: 0,
        spawnInterval: 260, maxUnits: 3, warriorHp: 140, warriorAtk: 20, warriorSpeed: 0.8,
        desc: '不断派出勇士上前线，近身砍杀敌人',
    },
    tripeater: {
        id: 'tripeater', name: '三线炮', role: 'dps', render: 'tripeater',
        price: 320, color: '#22c55e', hp: 110, atk: 20, cooldown: 55, projSpeed: 10, proj: 'normal',
        multiLane: true, desc: '同时攻击本通道和左右相邻通道',
    },
    starfruit: {
        id: 'starfruit', name: '杨桃', role: 'aoe', render: 'starfruit',
        price: 240, color: '#facc15', hp: 100, atk: 24, cooldown: 70, projSpeed: 9, proj: 'normal',
        multiDir: true, desc: '向多个方向同时发射星弹',
    },
    spike: {
        id: 'spike', name: '地刺', role: 'trap', render: 'spike',
        price: 120, color: '#a16207', hp: 240, atk: 9, cooldown: 12, special: 'spike',
        desc: '平铺地面不挡路，持续扎伤路过的敌人',
    },
    mine: {
        id: 'mine', name: '地雷', role: 'trap', render: 'mine',
        price: 130, color: '#f59e0b', hp: 100, atk: 0, special: 'mine',
        armTime: 60, explodeDmg: 280, explodeRadius: 120, desc: '敌人靠近即引爆，一次性大范围爆炸',
    },
    cherry: {
        id: 'cherry', name: '樱桃炸弹', role: 'bomb', render: 'cherry',
        price: 200, color: '#ef4444', hp: 100, atk: 0, special: 'cherry',
        fuse: 55, explodeDmg: 320, explodeRadius: 160, desc: '引线点燃后炸翻一大片，一次性',
    },
    chomper: {
        id: 'chomper', name: '大嘴花', role: 'melee', render: 'chomper',
        price: 180, color: '#7c3aed', hp: 160, atk: 0, special: 'chomper',
        biteDmg: 350, chewTime: 220, desc: '一口吞掉普通敌人；重型敌人只能咬伤。咀嚼时有空窗',
    },
    jalapeno: {
        id: 'jalapeno', name: '火爆辣椒', role: 'bomb', render: 'jalapeno',
        price: 160, color: '#dc2626', hp: 100, atk: 0, special: 'jalapeno',
        fuse: 40, laneDmg: 600, desc: '瞬间用烈焰清空整条通道，一次性',
    },
};

// ===== 敌人定义（蜥蜴用像素帧，其余手绘矢量）=====
const DEF_ENEMIES = {
    lizard:   { id: 'lizard',   name: '蜥蜴怪',   render: 'lizard', sprite: 'lizard', tint: null, hpMult: 1.0,  speedMult: 1.0,  atk: 10, scale: 1.15 },
    slime:    { id: 'slime',    name: '毒史莱姆', render: 'slime',  color: '#84cc16', hpMult: 1.3,  speedMult: 0.8,  atk: 9,  scale: 1.05 },
    bat:      { id: 'bat',      name: '急速蝙蝠', render: 'bat',    color: '#a78bfa', hpMult: 0.45, speedMult: 2.0,  atk: 6,  scale: 0.9 },
    skeleton: { id: 'skeleton', name: '骷髅兵',   render: 'skeleton', color: '#e2e8f0', hpMult: 1.1, speedMult: 1.0, atk: 12, scale: 1.1 },
    goblin:   { id: 'goblin',   name: '哥布林',   render: 'goblin', color: '#16a34a', hpMult: 0.8,  speedMult: 1.4,  atk: 10, scale: 0.95 },
    mushroom: { id: 'mushroom', name: '毒蘑菇',   render: 'mushroom', color: '#dc2626', hpMult: 1.6, speedMult: 0.7, atk: 11, scale: 1.05 },
    eye:      { id: 'eye',      name: '飞眼',     render: 'eye',    color: '#f43f5e', hpMult: 0.7,  speedMult: 1.3,  atk: 8,  scale: 0.95 },
    golem:    { id: 'golem',    name: '岩石魔像', render: 'golem',  color: '#a8a29e', hpMult: 3.2,  speedMult: 0.5,  atk: 18, scale: 1.45 },
    wraith:   { id: 'wraith',   name: '幽魂',     render: 'wraith', color: '#c084fc', hpMult: 1.4,  speedMult: 1.15, atk: 12, scale: 1.2 },
    demon:    { id: 'demon',    name: '魔王',     render: 'demon',  color: '#ef4444', hpMult: 14,   speedMult: 0.5,  atk: 45, scale: 2.4, isBoss: true },
};

// ===== 关卡配置（3 条通道）=====
const DEF_LEVELS = [
    { level: 1,  baseHp: 45,  count: 8,  spawnGap: 130, speed: 0.40, mix: { lizard: 1 },                              reward: 0 },
    { level: 2,  baseHp: 60,  count: 12, spawnGap: 115, speed: 0.45, mix: { lizard: 2, slime: 1 },                    reward: 0 },
    { level: 3,  baseHp: 80,  count: 14, spawnGap: 100, speed: 0.50, mix: { lizard: 2, slime: 1, bat: 1 },            reward: 0 },
    { level: 4,  baseHp: 95,  count: 16, spawnGap: 92,  speed: 0.52, mix: { lizard: 2, goblin: 2, slime: 1 },         reward: 0 },
    { level: 5,  baseHp: 120, count: 14, spawnGap: 95,  speed: 0.50, mix: { lizard: 2, skeleton: 2, golem: 1 },       reward: 0, boss: true },
    { level: 6,  baseHp: 130, count: 20, spawnGap: 82,  speed: 0.55, mix: { goblin: 2, bat: 2, skeleton: 1 },         reward: 0 },
    { level: 7,  baseHp: 150, count: 22, spawnGap: 80,  speed: 0.58, mix: { slime: 2, mushroom: 2, wraith: 1 },       reward: 0 },
    { level: 8,  baseHp: 175, count: 24, spawnGap: 76,  speed: 0.60, mix: { skeleton: 2, eye: 2, golem: 1, wraith: 1 }, reward: 0 },
    { level: 9,  baseHp: 200, count: 26, spawnGap: 73,  speed: 0.62, mix: { bat: 2, eye: 2, wraith: 2, golem: 1 },    reward: 0 },
    { level: 10, baseHp: 240, count: 18, spawnGap: 82,  speed: 0.58, mix: { golem: 2, mushroom: 2, skeleton: 1 },     reward: 0, boss: true },
];

function getLevelConfig(level) {
    if (level <= DEF_LEVELS.length) return DEF_LEVELS[level - 1];
    const over = level - DEF_LEVELS.length;
    return {
        level,
        baseHp: Math.round(240 * Math.pow(1.12, over)),
        count: Math.min(55, 20 + over * 2),
        spawnGap: Math.max(48, 80 - over * 2),
        speed: Math.min(1.1, 0.58 + over * 0.03),
        mix: { lizard: 1, goblin: 2, skeleton: 2, bat: 1, wraith: 2, mushroom: 1, golem: 1, eye: 1 },
        reward: 0,
        boss: level % 5 === 0,
    };
}

// ===== 网格布局 =====
const DEF_LANES = 6;                  // 6 条均匀通道（每列即一条通道）
const DEF_COLS = 6;                   // 6 列均匀分布
const DEF_PLACE_ROWS = 7;             // 每列 7 排 → 共 42 格
function laneOfCol(col) { return col; }

// ===== 数据存取 =====
function getDefData() {
    const raw = localStorage.getItem(DEF_KEY);
    if (raw) return JSON.parse(raw);
    const data = {
        points: 100,
        arsenal: { dragon: 8, wall: 4 },   // 够铺开新的大网格
        highestLevel: 1,
        lastGiftDate: null,
        history: [{ date: new Date().toLocaleDateString('zh-CN'), label: '系统赠送初始武器和积分', pts: 100 }],
    };
    localStorage.setItem(DEF_KEY, JSON.stringify(data));
    return data;
}
function saveDefData(data) { localStorage.setItem(DEF_KEY, JSON.stringify(data)); }

function addDefPoints(pts, label) {
    const data = getDefData();
    data.points = Math.max(0, data.points + pts);
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label, pts });
    if (data.history.length > 60) data.history.length = 60;
    saveDefData(data);
    return data;
}
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
