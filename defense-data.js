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
        price: 100, color: '#34d399', hp: 140, atk: 30, cooldown: 38, projSpeed: 10, proj: 'normal',
        desc: '主力速射，持续喷吐龙息',
    },
    crossbow: {
        id: 'crossbow', name: '连弩', role: 'sniper', render: 'crossbow',
        price: 160, color: '#f59e0b', hp: 120, atk: 90, cooldown: 85, projSpeed: 16, proj: 'normal',
        desc: '锁定最前方敌人，单发高伤',
    },
    cannon: {
        id: 'cannon', name: '火炮', role: 'aoe', render: 'cannon',
        price: 220, color: '#f97316', hp: 130, atk: 90, cooldown: 115, projSpeed: 8, proj: 'splash',
        splashRadius: 140, desc: '炮弹落地爆炸，炸伤一大片',
    },
    gatling: {
        id: 'gatling', name: '机枪塔', role: 'dps', render: 'gatling',
        price: 280, color: '#94a3b8', hp: 130, atk: 18, cooldown: 12, projSpeed: 14, proj: 'normal',
        desc: '超高射速，子弹倾泻而出',
    },
    laser: {
        id: 'laser', name: '激光塔', role: 'beam', render: 'laser',
        price: 360, color: '#f43f5e', hp: 120, atk: 9, cooldown: 3, special: 'laser',
        desc: '持续激光贯穿整条通道，伤害极高',
    },
    ice: {
        id: 'ice', name: '寒冰塔', role: 'control', render: 'ice',
        price: 150, color: '#38bdf8', hp: 110, atk: 26, cooldown: 60, projSpeed: 9, proj: 'slow',
        slow: 0.6, slowDuration: 210, splashRadius: 120, desc: '命中减速 60%，大范围冰冻',
    },
    hail: {
        id: 'hail', name: '冰雹', role: 'control', render: 'hail',
        price: 200, color: '#7dd3fc', hp: 110, atk: 40, cooldown: 78, projSpeed: 8, proj: 'slow',
        slow: 0.85, slowDuration: 260, splashRadius: 180, desc: '命中减速 85%，超大范围冰冻',
    },
    lightning: {
        id: 'lightning', name: '闪电', role: 'chain', render: 'lightning',
        price: 280, color: '#a78bfa', hp: 110, atk: 65, cooldown: 78, projSpeed: 16, proj: 'chain',
        chain: 6, chainRadius: 220, desc: '命中后裂变电击附近多个敌人',
    },
    poison: {
        id: 'poison', name: '毒气罐', role: 'aoe', render: 'poison',
        price: 230, color: '#65a30d', hp: 110, atk: 30, cooldown: 105, projSpeed: 7, proj: 'poison',
        cloudRadius: 120, cloudDmg: 16, cloudLife: 260, desc: '落地形成毒云，持续腐蚀一片敌人',
    },
    bouncer: {
        id: 'bouncer', name: '弹跳球', role: 'aoe', render: 'bouncer',
        price: 240, color: '#22d3ee', hp: 110, atk: 46, cooldown: 80, projSpeed: 8, proj: 'bounce',
        bounces: 9, desc: '打出后满屏弹跳，反复命中敌人',
    },
    boomerang: {
        id: 'boomerang', name: '回旋镖', role: 'dps', render: 'boomerang',
        price: 250, color: '#fbbf24', hp: 110, atk: 55, cooldown: 75, projSpeed: 11, proj: 'boomerang',
        desc: '飞出再飞回，去程回程各打一次',
    },
    splitter: {
        id: 'splitter', name: '分裂弹', role: 'dps', render: 'splitter',
        price: 260, color: '#f472b6', hp: 110, atk: 110, cooldown: 95, projSpeed: 10, proj: 'split',
        splits: 3, desc: '命中后分裂成两发，伤害减半再分裂',
    },
    wind: {
        id: 'wind', name: '狂风扇', role: 'control', render: 'wind',
        price: 210, color: '#a5f3fc', hp: 120, atk: 6, cooldown: 95, special: 'wind',
        pushDist: 140, desc: '定时刮起狂风，把本通道敌人吹回上方',
    },
    barracks: {
        id: 'barracks', name: '军营', role: 'army', render: 'barracks',
        price: 300, color: '#eab308', hp: 240, atk: 0, cooldown: 0,
        spawnInterval: 220, maxUnits: 3, warriorHp: 180, warriorAtk: 34, warriorSpeed: 0.85,
        desc: '不断派出勇士上前线，近身砍杀敌人',
    },
    tripeater: {
        id: 'tripeater', name: '三线炮', role: 'dps', render: 'tripeater',
        price: 320, color: '#22c55e', hp: 120, atk: 34, cooldown: 48, projSpeed: 10, proj: 'normal',
        multiLane: true, desc: '同时攻击本通道和左右相邻通道',
    },
    starfruit: {
        id: 'starfruit', name: '杨桃', role: 'aoe', render: 'starfruit',
        price: 240, color: '#facc15', hp: 110, atk: 42, cooldown: 58, projSpeed: 9, proj: 'normal',
        multiDir: true, desc: '向多个方向同时发射星弹',
    },
    spike: {
        id: 'spike', name: '地刺', role: 'trap', render: 'spike',
        price: 120, color: '#a16207', hp: 260, atk: 20, cooldown: 10, special: 'spike',
        desc: '平铺地面不挡路，持续扎伤路过的敌人',
    },
    mine: {
        id: 'mine', name: '地雷', role: 'trap', render: 'mine',
        price: 130, color: '#f59e0b', hp: 100, atk: 0, special: 'mine',
        armTime: 50, explodeDmg: 700, explodeRadius: 170, desc: '敌人靠近即引爆，超大范围爆炸，一次性',
    },
    cherry: {
        id: 'cherry', name: '樱桃炸弹', role: 'bomb', render: 'cherry',
        price: 200, color: '#ef4444', hp: 100, atk: 0, special: 'cherry',
        fuse: 50, explodeDmg: 1400, explodeRadius: 240, desc: '引线点燃后炸翻一大片，威力巨大，一次性',
    },
    chomper: {
        id: 'chomper', name: '大嘴花', role: 'melee', render: 'chomper',
        price: 180, color: '#7c3aed', hp: 180, atk: 0, special: 'chomper',
        biteDmg: 700, chewTime: 200, desc: '一口吞掉普通敌人；重型敌人只能咬伤。咀嚼时有空窗',
    },
    jalapeno: {
        id: 'jalapeno', name: '火爆辣椒', role: 'bomb', render: 'jalapeno',
        price: 160, color: '#dc2626', hp: 100, atk: 0, special: 'jalapeno',
        fuse: 35, laneDmg: 2500, desc: '瞬间用烈焰烧穿整条通道，一次性',
    },
    taichi: {
        id: 'taichi', name: '太极阵', role: 'control', render: 'taichi',
        price: 280, color: '#e2e8f0', hp: 200, atk: 0, special: 'vortex',
        drainPct: 0.5, desc: '路过的敌人被吸走当前一半血量，每个敌人限一次',
    },
    fissure: {
        id: 'fissure', name: '地裂陷阱', role: 'trap', render: 'fissure',
        price: 240, color: '#1c1917', hp: 220, atk: 0, special: 'fissure',
        openTime: 60, closeTime: 80, desc: '间歇开合，开启时上方敌人直接坠毁，不会被阻挡',
    },
    doublegun: {
        id: 'doublegun', name: '双头炮', role: 'dps', render: 'doublegun',
        price: 260, color: '#6366f1', hp: 130, atk: 55, cooldown: 52, projSpeed: 10, proj: 'normal',
        doubleDir: true, desc: '同时向前后两个方向发射炮弹',
    },
    flamer: {
        id: 'flamer', name: '烈焰炮', role: 'aoe', render: 'flamer',
        price: 260, color: '#f97316', hp: 120, atk: 55, cooldown: 82, projSpeed: 9, proj: 'fire',
        burnDmg: 8, burnDuration: 90, splashRadius: 100, desc: '喷射火球，命中后产生火海持续灼烧',
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
    zombie:   { id: 'zombie',   name: '僵尸',     render: 'zombie', color: '#65a30d', hpMult: 1.2,  speedMult: 0.7,  atk: 12, scale: 1.15 },
    orc:      { id: 'orc',      name: '兽人',     render: 'orc',    color: '#15803d', hpMult: 2.2,  speedMult: 0.7,  atk: 18, scale: 1.35 },
    spider:   { id: 'spider',   name: '毒蜘蛛',   render: 'spider', color: '#1f2937', hpMult: 0.6,  speedMult: 1.7,  atk: 9,  scale: 1.0 },
    ghost:    { id: 'ghost',    name: '鬼火',     render: 'ghost',  color: '#22d3ee', hpMult: 0.85, speedMult: 1.35, atk: 10, scale: 1.1 },
    snail:    { id: 'snail',    name: '铁壳蜗牛', render: 'snail',  color: '#f59e0b', hpMult: 2.4,  speedMult: 0.32, atk: 8,  scale: 1.05 },
    imp:      { id: 'imp',      name: '小恶魔',   render: 'imp',    color: '#ef4444', hpMult: 0.5,  speedMult: 1.9,  atk: 8,  scale: 0.85 },
    wolf:     { id: 'wolf',     name: '恶狼',     render: 'wolf',   color: '#9ca3af', hpMult: 0.9,  speedMult: 1.8,  atk: 14, scale: 1.1 },
    knight:   { id: 'knight',   name: '骷髅骑士', render: 'knight', color: '#cbd5e1', hpMult: 3.0,  speedMult: 0.5,  atk: 22, scale: 1.3 },
    crab:     { id: 'crab',     name: '钳子蟹',   render: 'crab',   color: '#fb7185', hpMult: 1.9,  speedMult: 0.85, atk: 13, scale: 1.1 },
    slimeking:{ id: 'slimeking',name: '史莱姆王', render: 'slimeking', color: '#a3e635', hpMult: 2.6, speedMult: 0.7, atk: 14, scale: 1.3 },
    bee:      { id: 'bee',      name: '毒针蜂',   render: 'bee',    color: '#fbbf24', hpMult: 0.4,  speedMult: 2.2,  atk: 7,  scale: 0.8 },
    demon:    { id: 'demon',    name: '魔王',     render: 'demon',  color: '#ef4444', hpMult: 14,   speedMult: 0.5,  atk: 45, scale: 2.4, isBoss: true },
    lich:     { id: 'lich',     name: '巫妖王',   render: 'lich',   color: '#a78bfa', hpMult: 18,   speedMult: 0.45, atk: 55, scale: 2.5, isBoss: true },
};

// ===== 关卡配置（6 条通道）=====
const DEF_LEVELS = [
    { level: 1,  baseHp: 45,  count: 8,  spawnGap: 130, speed: 0.40, mix: { lizard: 1 },                                       reward: 0 },
    { level: 2,  baseHp: 60,  count: 12, spawnGap: 115, speed: 0.45, mix: { lizard: 2, slime: 1 },                             reward: 0 },
    { level: 3,  baseHp: 80,  count: 14, spawnGap: 100, speed: 0.50, mix: { lizard: 2, zombie: 1, bat: 1 },                    reward: 0 },
    { level: 4,  baseHp: 95,  count: 16, spawnGap: 92,  speed: 0.52, mix: { lizard: 2, goblin: 2, spider: 1 },                 reward: 0 },
    { level: 5,  baseHp: 120, count: 14, spawnGap: 95,  speed: 0.50, mix: { lizard: 2, skeleton: 2, golem: 1 },                reward: 0, boss: true, bossType: 'demon' },
    { level: 6,  baseHp: 130, count: 20, spawnGap: 82,  speed: 0.55, mix: { goblin: 2, bat: 2, zombie: 2, imp: 1 },            reward: 0 },
    { level: 7,  baseHp: 150, count: 22, spawnGap: 80,  speed: 0.58, mix: { slime: 2, mushroom: 2, wolf: 2, ghost: 1 },        reward: 0 },
    { level: 8,  baseHp: 175, count: 24, spawnGap: 76,  speed: 0.60, mix: { skeleton: 2, eye: 2, orc: 1, crab: 1 },            reward: 0 },
    { level: 9,  baseHp: 200, count: 26, spawnGap: 73,  speed: 0.62, mix: { spider: 2, ghost: 2, wraith: 2, snail: 1 },        reward: 0 },
    { level: 10, baseHp: 240, count: 18, spawnGap: 82,  speed: 0.58, mix: { golem: 2, orc: 2, knight: 1 },                     reward: 0, boss: true, bossType: 'demon' },
    { level: 11, baseHp: 270, count: 24, spawnGap: 72,  speed: 0.62, mix: { wolf: 2, imp: 2, bee: 2, zombie: 1 },              reward: 0 },
    { level: 12, baseHp: 300, count: 26, spawnGap: 70,  speed: 0.64, mix: { knight: 2, crab: 2, wraith: 1, orc: 1 },           reward: 0 },
    { level: 13, baseHp: 340, count: 28, spawnGap: 68,  speed: 0.66, mix: { ghost: 2, spider: 2, slimeking: 1, bee: 2 },       reward: 0 },
    { level: 14, baseHp: 380, count: 30, spawnGap: 65,  speed: 0.68, mix: { orc: 2, snail: 2, knight: 1, golem: 1, wolf: 1 },  reward: 0 },
    { level: 15, baseHp: 420, count: 22, spawnGap: 70,  speed: 0.62, mix: { knight: 2, slimeking: 1, golem: 1, wraith: 2 },    reward: 0, boss: true, bossType: 'lich' },
];

function getLevelConfig(level) {
    if (level <= DEF_LEVELS.length) return DEF_LEVELS[level - 1];
    const over = level - DEF_LEVELS.length;
    return {
        level,
        baseHp: Math.round(420 * Math.pow(1.1, over)),
        count: Math.min(60, 24 + over * 2),
        spawnGap: Math.max(45, 70 - over * 2),
        speed: Math.min(1.2, 0.62 + over * 0.03),
        mix: { goblin: 2, skeleton: 1, wolf: 2, imp: 1, ghost: 1, knight: 1, crab: 1, orc: 1, spider: 1, snail: 1 },
        reward: 0,
        boss: level % 5 === 0,
        bossType: (level % 10 === 0) ? 'lich' : 'demon',
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
