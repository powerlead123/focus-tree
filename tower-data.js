// 学习塔防养成 - 核心数据层 v2
const TOWER_KEY = 'focusTree_towerData_v2';

// ===== 每日奖励项（直接对应积分）=====
const DAILY_REWARDS = [
    { id: 'diary',      label: '完成今日记事',           pts: 10,  icon: '📓' },
    { id: 'diaryStar',  label: '记事获得星号',            pts: 20,  icon: '⭐' },
    { id: 'hwDone',     label: '学校作业全部写完',         pts: 50,  icon: '📚' },
    { id: 'hwPerfect',  label: '作业完成且不用改',         pts: 15,  icon: '✅' },
    { id: 'hwMakeup',   label: '回家主动补写未完成作业',   pts: 20,  icon: '✏️' },
    { id: 'essay',      label: '写一篇达标作文',           pts: 300, icon: '📝' },
    { id: 'chinese',    label: '主动用学习机学语文',       pts: 50,  icon: '🈶' },
    { id: 'wordbook',   label: '百词斩教材打卡',           pts: 10,  icon: '📖' },
    { id: 'ket',        label: '百词斩KET打卡',            pts: 30,  icon: '🔤' },
    { id: 'exam',       label: '主动做一张卷子',           pts: 50,  icon: '📋' },
    { id: 'jumprope',   label: '跳绳500个',               pts: 80,  icon: '🪢' },
    { id: 'stretch',    label: '拉伸5分钟',               pts: 30,  icon: '🤸' },
    { id: 'eyerest',    label: '远眺3分钟',               pts: 15,  icon: '👁️' },
    { id: 'recite',     label: '朗读3篇作文',             pts: 50,  icon: '🗣️' },
    { id: 'dictation',  label: '听写单词5个',             pts: 30,  icon: '✍️' },
    { id: 'chineseDictation', label: '听写生字',           pts: 30,  icon: '📜' },
];

// ===== 每日惩罚项（直接扣积分）=====
const DAILY_PENALTIES = [
    { id: 'noHw',     label: '不交作业',   pts: -5,  icon: '❌' },
    { id: 'noListen', label: '上课不听讲', pts: -3,  icon: '😴' },
    { id: 'noRead',   label: '该读书不读', pts: -2,  icon: '📵' },
];

// ===== 武器升级树 =====
const TOWER_TYPES = {
    arrow: {
        id: 'arrow', name: '弓箭塔', emoji: '🏹',
        unlockCost: 50,
        baseAtk: 10, baseRange: 160, baseSpeed: 1.2,
        color: '#34d399',
        upgrades: [
            // 攻击线
            { id: 'atk1',   label: '攻击力+5',   desc: '箭矢更锋利',       cost: 20,  effect: { atk: 5 } },
            { id: 'atk2',   label: '攻击力+5',   desc: '精准射击训练',     cost: 20,  effect: { atk: 5 },  requires: 'atk1' },
            { id: 'atk3',   label: '攻击力+5',   desc: '强化弓弦',         cost: 20,  effect: { atk: 5 },  requires: 'atk2' },
            { id: 'atk4',   label: '攻击力+5',   desc: '精钢箭头',         cost: 20,  effect: { atk: 5 },  requires: 'atk3' },
            { id: 'atk5',   label: '攻击力+5',   desc: '神射手',           cost: 20,  effect: { atk: 5 },  requires: 'atk4' },
            // 射程线（每级×1.5）
            { id: 'range1', label: '射程×1.5',   desc: '更长的弓',         cost: 30,  effect: { rangeMult: 1.5 } },
            { id: 'range2', label: '射程×1.5',   desc: '鹰眼视野',         cost: 30,  effect: { rangeMult: 1.5 }, requires: 'range1' },
            { id: 'range3', label: '射程×1.5',   desc: '超远程狙击',       cost: 30,  effect: { rangeMult: 1.5 }, requires: 'range2' },
            // 射速线（每级×2）
            { id: 'speed1', label: '射速×2',     desc: '快速搭箭',         cost: 40,  effect: { speedMult: 2 } },
            { id: 'speed2', label: '射速×2',     desc: '连射训练',         cost: 60,  effect: { speedMult: 2 }, requires: 'speed1' },
            { id: 'speed3', label: '射速×2',     desc: '疾风连射',         cost: 100, effect: { speedMult: 2 }, requires: 'speed2' },
            // 多发线
            { id: 'double', label: '双发箭',     desc: '同时射出2支箭',    cost: 100, effect: { multiShot: 2 } },
            { id: 'triple', label: '三发箭',     desc: '同时射出3支箭',    cost: 200, effect: { multiShot: 3 }, requires: 'double' },
            // 特殊能力
            { id: 'poison', label: '毒箭',       desc: '命中后持续掉血3秒', cost: 150, effect: { poison: true } },
            { id: 'track',  label: '追踪箭',     desc: '箭矢自动追踪敌人', cost: 300, effect: { tracking: true }, requires: 'poison' },
            { id: 'pierce', label: '穿透箭',     desc: '箭矢穿透第一个敌人继续飞行', cost: 250, effect: { pierce: true } },
        ],
    },
    cannon: {
        id: 'cannon', name: '炮塔', emoji: '💣',
        unlockCost: 100,
        baseAtk: 25, baseRange: 150, baseSpeed: 0.5,
        color: '#f97316',
        upgrades: [
            // 攻击线
            { id: 'atk1',   label: '攻击力+10',  desc: '更大的炮弹',       cost: 30,  effect: { atk: 10 } },
            { id: 'atk2',   label: '攻击力+10',  desc: '强化火药',         cost: 30,  effect: { atk: 10 }, requires: 'atk1' },
            { id: 'atk3',   label: '攻击力+10',  desc: '穿甲弹',           cost: 30,  effect: { atk: 10 }, requires: 'atk2' },
            { id: 'atk4',   label: '攻击力+10',  desc: '超级炮弹',         cost: 30,  effect: { atk: 10 }, requires: 'atk3' },
            { id: 'atk5',   label: '攻击力+10',  desc: '毁灭炮弹',         cost: 30,  effect: { atk: 10 }, requires: 'atk4' },
            // 射程线（每级×1.5）
            { id: 'range1', label: '射程×1.5',   desc: '加长炮管',         cost: 40,  effect: { rangeMult: 1.5 } },
            { id: 'range2', label: '射程×1.5',   desc: '高精度瞄准',       cost: 40,  effect: { rangeMult: 1.5 }, requires: 'range1' },
            { id: 'range3', label: '射程×1.5',   desc: '远程炮击',         cost: 40,  effect: { rangeMult: 1.5 }, requires: 'range2' },
            // 射速线（每级×2）
            { id: 'speed1', label: '射速×2',     desc: '自动装填系统',     cost: 60,  effect: { speedMult: 2 } },
            { id: 'speed2', label: '射速×2',     desc: '液压装填',         cost: 100, effect: { speedMult: 2 }, requires: 'speed1' },
            // 特殊能力
            { id: 'splash', label: '爆炸范围',   desc: '炮弹爆炸伤害周围敌人', cost: 150, effect: { splash: true } },
            { id: 'double', label: '双炮管',     desc: '同时发射2枚炮弹',  cost: 200, effect: { multiShot: 2 }, requires: 'splash' },
            { id: 'triple', label: '三炮管',     desc: '同时发射3枚炮弹',  cost: 350, effect: { multiShot: 3 }, requires: 'double' },
            { id: 'burn',   label: '燃烧弹',     desc: '命中后持续燃烧3秒', cost: 200, effect: { burn: true }, requires: 'splash' },
        ],
    },
    ice: {
        id: 'ice', name: '冰冻塔', emoji: '❄️',
        unlockCost: 150,
        baseAtk: 10, baseRange: 160, baseSpeed: 0.8,
        color: '#38bdf8',
        slowFactor: 0.5,
        upgrades: [
            // 攻击线
            { id: 'atk1',   label: '攻击力+5',   desc: '更冷的冰晶',       cost: 20,  effect: { atk: 5 } },
            { id: 'atk2',   label: '攻击力+5',   desc: '绝对零度',         cost: 20,  effect: { atk: 5 },  requires: 'atk1' },
            { id: 'atk3',   label: '攻击力+5',   desc: '冰封之力',         cost: 20,  effect: { atk: 5 },  requires: 'atk2' },
            // 减速线
            { id: 'slow1',  label: '减速65%',    desc: '更强的冰冻效果',   cost: 50,  effect: { slow: 0.65 } },
            { id: 'slow2',  label: '减速75%',    desc: '深度冰冻',         cost: 50,  effect: { slow: 0.75 }, requires: 'slow1' },
            { id: 'slow3',  label: '减速85%',    desc: '极寒之地',         cost: 50,  effect: { slow: 0.85 }, requires: 'slow2' },
            // 射程线（每级×1.5）
            { id: 'range1', label: '射程×1.5',   desc: '冰雾扩散',         cost: 80,  effect: { rangeMult: 1.5 } },
            { id: 'range2', label: '射程×1.5',   desc: '极地风暴',         cost: 80,  effect: { rangeMult: 1.5 }, requires: 'range1' },
            { id: 'range3', label: '射程×1.5',   desc: '冰封领域',         cost: 80,  effect: { rangeMult: 1.5 }, requires: 'range2' },
            // 射速线（每级×2）
            { id: 'speed1', label: '射速×2',     desc: '冰晶加速',         cost: 50,  effect: { speedMult: 2 } },
            { id: 'speed2', label: '射速×2',     desc: '极速冰晶',         cost: 80,  effect: { speedMult: 2 }, requires: 'speed1' },
            // 多发线
            { id: 'double', label: '双重冰晶',   desc: '同时射出2枚冰晶',  cost: 150, effect: { multiShot: 2 } },
            { id: 'triple', label: '三重冰晶',   desc: '同时射出3枚冰晶',  cost: 280, effect: { multiShot: 3 }, requires: 'double' },
            // 特殊能力
            { id: 'freeze', label: '完全冻结',   desc: '冻结敌人2秒无法移动', cost: 200, effect: { freeze: true }, requires: 'slow3' },
        ],
    },
    lightning: {
        id: 'lightning', name: '闪电塔', emoji: '⚡',
        unlockCost: 200,
        baseAtk: 40, baseRange: 180, baseSpeed: 0.7,
        color: '#a78bfa',
        chainCount: 3,
        upgrades: [
            // 攻击线
            { id: 'atk1',   label: '攻击力+15',  desc: '更强的电流',       cost: 40,  effect: { atk: 15 } },
            { id: 'atk2',   label: '攻击力+15',  desc: '高压电击',         cost: 40,  effect: { atk: 15 }, requires: 'atk1' },
            { id: 'atk3',   label: '攻击力+15',  desc: '雷霆之力',         cost: 40,  effect: { atk: 15 }, requires: 'atk2' },
            { id: 'atk4',   label: '攻击力+15',  desc: '神之闪电',         cost: 40,  effect: { atk: 15 }, requires: 'atk3' },
            // 链式线
            { id: 'chain1', label: '链式+1目标', desc: '闪电跳跃4个敌人',  cost: 100, effect: { chain: 4 } },
            { id: 'chain2', label: '链式+1目标', desc: '闪电跳跃5个敌人',  cost: 100, effect: { chain: 5 }, requires: 'chain1' },
            { id: 'chain3', label: '链式+1目标', desc: '闪电跳跃6个敌人',  cost: 100, effect: { chain: 6 }, requires: 'chain2' },
            // 射程线（每级×1.5）
            { id: 'range1', label: '射程×1.5',   desc: '电场扩展',         cost: 50,  effect: { rangeMult: 1.5 } },
            { id: 'range2', label: '射程×1.5',   desc: '超远程放电',       cost: 50,  effect: { rangeMult: 1.5 }, requires: 'range1' },
            // 射速线（每级×2）
            { id: 'speed1', label: '射速×2',     desc: '电容充能',         cost: 60,  effect: { speedMult: 2 } },
            { id: 'speed2', label: '射速×2',     desc: '超导体',           cost: 100, effect: { speedMult: 2 }, requires: 'speed1' },
            // 特殊能力（麻痹改为3秒=180帧）
            { id: 'stun',   label: '麻痹效果',   desc: '击中后麻痹3秒',    cost: 200, effect: { stun: true } },
            { id: 'emp',    label: 'EMP脉冲',    desc: '麻痹时间延长到5秒', cost: 250, effect: { empStun: true }, requires: 'stun' },
            { id: 'overload', label: '过载放电', desc: '对满血敌人造成双倍伤害', cost: 300, effect: { overload: true } },
        ],
    },
};

// ===== 特殊炮台（只买，不升级，放置后自动触发效果）=====
const SPECIAL_TOWERS = {
    chain: {
        id: 'chain', name: '铁链塔', emoji: '⛓️',
        unlockCost: 500, color: '#94a3b8',
        desc: '敌人进入范围后血量持续减少',
        baseRange: 130,
        special: 'chain_zone',
    },
    cursed: {
        id: 'cursed', name: '魔域塔', emoji: '🌀',
        unlockCost: 700, color: '#c084fc',
        desc: '范围内敌人血量减少并停止行动3秒',
        baseRange: 120,
        special: 'cursed_zone',
    },
    shockwave: {
        id: 'shockwave', name: '冲击波', emoji: '💥',
        unlockCost: 500, color: '#fb923c',
        desc: '全场覆盖，每15秒触发，所有敌人当前血量减少1/5',
        baseRange: 9999,
        special: 'shockwave',
        cooldownSec: 15,
    },
    groundbomb: {
        id: 'groundbomb', name: '地破弹', emoji: '💣',
        unlockCost: 500, color: '#a3e635',
        desc: '每15秒在路上随机位置爆炸，命中敌人血量减少1/3',
        baseRange: 50,
        special: 'groundbomb',
        cooldownSec: 15,
    },
    teleport: {
        id: 'teleport', name: '瞬移弹', emoji: '🌀',
        unlockCost: 500, color: '#67e8f9',
        desc: '每25秒激活3秒，范围内敌人传送回起点',
        hidden: true,
        baseRange: 120,
        special: 'teleport',
        cooldownSec: 25,
        activeSec: 3,
    },
};
const TOWER_SLOTS = [
    { id: 0,  x: 1,  y: 0, unlockCost: 0  },
    { id: 1,  x: 1,  y: 1, unlockCost: 0  },
    { id: 2,  x: 2,  y: 0, unlockCost: 30 },
    { id: 3,  x: 2,  y: 1, unlockCost: 30 },
    { id: 4,  x: 4,  y: 1, unlockCost: 30 },
    { id: 5,  x: 5,  y: 1, unlockCost: 30 },
    { id: 6,  x: 4,  y: 2, unlockCost: 30 },
    { id: 7,  x: 5,  y: 2, unlockCost: 30 },
    { id: 8,  x: 7,  y: 0, unlockCost: 30 },
    { id: 9,  x: 7,  y: 1, unlockCost: 30 },
    { id: 10, x: 7,  y: 2, unlockCost: 30 },
    { id: 11, x: 7,  y: 3, unlockCost: 30 },
    { id: 12, x: 9,  y: 1, unlockCost: 30 },
    { id: 13, x: 10, y: 1, unlockCost: 30 },
    { id: 14, x: 9,  y: 2, unlockCost: 30 },
    { id: 15, x: 10, y: 2, unlockCost: 30 },
];

// ===== 关卡配置 =====
const LEVELS = [
    { level: 1,  waves: 1, enemyCount: 6,  enemyHp: 60,  enemySpeed: 1.0, reward: 10 },
    { level: 2,  waves: 1, enemyCount: 8,  enemyHp: 80,  enemySpeed: 1.0, reward: 12 },
    { level: 3,  waves: 2, enemyCount: 10, enemyHp: 100, enemySpeed: 1.1, reward: 15 },
    { level: 4,  waves: 2, enemyCount: 12, enemyHp: 130, enemySpeed: 1.1, reward: 18 },
    { level: 5,  waves: 2, enemyCount: 15, enemyHp: 160, enemySpeed: 1.2, reward: 20 },
    { level: 6,  waves: 2, enemyCount: 18, enemyHp: 200, enemySpeed: 1.2, reward: 25 },
    { level: 7,  waves: 2, enemyCount: 20, enemyHp: 250, enemySpeed: 1.3, reward: 28 },
    { level: 8,  waves: 2, enemyCount: 22, enemyHp: 300, enemySpeed: 1.3, reward: 30 },
    { level: 9,  waves: 2, enemyCount: 25, enemyHp: 360, enemySpeed: 1.4, reward: 35 },
    { level: 10, waves: 2, enemyCount: 30, enemyHp: 420, enemySpeed: 1.5, reward: 40 },
    // Boss关卡（第11关起，1波敌人+Boss）
    { level: 11, waves: 1, enemyCount: 20, enemyHp: 300, enemySpeed: 1.3, reward: 50,  boss: { hp: 800,  tier: 1 } },
    { level: 12, waves: 1, enemyCount: 22, enemyHp: 340, enemySpeed: 1.3, reward: 55,  boss: { hp: 900,  tier: 1 } },
    { level: 13, waves: 1, enemyCount: 24, enemyHp: 380, enemySpeed: 1.4, reward: 60,  boss: { hp: 1000, tier: 1 } },
    { level: 14, waves: 1, enemyCount: 26, enemyHp: 420, enemySpeed: 1.4, reward: 65,  boss: { hp: 1100, tier: 1 } },
    { level: 15, waves: 1, enemyCount: 28, enemyHp: 460, enemySpeed: 1.5, reward: 70,  boss: { hp: 1200, tier: 1 } },
    { level: 16, waves: 1, enemyCount: 28, enemyHp: 480, enemySpeed: 1.5, reward: 75,  boss: { hp: 1300, tier: 1 } },
    { level: 17, waves: 1, enemyCount: 30, enemyHp: 500, enemySpeed: 1.5, reward: 80,  boss: { hp: 1400, tier: 1 } },
    { level: 18, waves: 1, enemyCount: 30, enemyHp: 520, enemySpeed: 1.6, reward: 85,  boss: { hp: 1500, tier: 1 } },
    { level: 19, waves: 1, enemyCount: 32, enemyHp: 560, enemySpeed: 1.6, reward: 90,  boss: { hp: 1600, tier: 1 } },
    { level: 20, waves: 1, enemyCount: 35, enemyHp: 600, enemySpeed: 1.7, reward: 100, boss: { hp: 1800, tier: 1 } },
    // 第21关起：Boss可分裂（1波敌人+Boss）
    { level: 21, waves: 1, enemyCount: 35, enemyHp: 620, enemySpeed: 1.7, reward: 110, boss: { hp: 2000, tier: 2 } },
    { level: 22, waves: 1, enemyCount: 38, enemyHp: 660, enemySpeed: 1.7, reward: 115, boss: { hp: 2200, tier: 2 } },
    { level: 23, waves: 1, enemyCount: 40, enemyHp: 700, enemySpeed: 1.8, reward: 120, boss: { hp: 2400, tier: 2 } },
    { level: 24, waves: 1, enemyCount: 40, enemyHp: 740, enemySpeed: 1.8, reward: 125, boss: { hp: 2600, tier: 2 } },
    { level: 25, waves: 1, enemyCount: 42, enemyHp: 780, enemySpeed: 1.8, reward: 130, boss: { hp: 2800, tier: 2 } },
    { level: 26, waves: 1, enemyCount: 44, enemyHp: 820, enemySpeed: 1.9, reward: 135, boss: { hp: 3000, tier: 2 } },
    { level: 27, waves: 1, enemyCount: 46, enemyHp: 860, enemySpeed: 1.9, reward: 140, boss: { hp: 3200, tier: 2 } },
    { level: 28, waves: 1, enemyCount: 48, enemyHp: 900, enemySpeed: 2.0, reward: 145, boss: { hp: 3400, tier: 2 } },
    { level: 29, waves: 1, enemyCount: 50, enemyHp: 940, enemySpeed: 2.0, reward: 150, boss: { hp: 3600, tier: 2 } },
    { level: 30, waves: 1, enemyCount: 50, enemyHp: 980, enemySpeed: 2.0, reward: 160, boss: { hp: 4000, tier: 2 } },
    // 第31-40关：tier3，Boss拥有更多技能组合
    { level: 31, waves: 1, enemyCount: 52, enemyHp: 1020, enemySpeed: 2.1, reward: 170, boss: { hp: 4400, tier: 3, skills: ['bomb','dash'] } },
    { level: 32, waves: 1, enemyCount: 54, enemyHp: 1060, enemySpeed: 2.1, reward: 175, boss: { hp: 4800, tier: 3, skills: ['spawn','shield'] } },
    { level: 33, waves: 1, enemyCount: 56, enemyHp: 1100, enemySpeed: 2.1, reward: 180, boss: { hp: 5200, tier: 3, skills: ['clone','bomb'] } },
    { level: 34, waves: 1, enemyCount: 58, enemyHp: 1140, enemySpeed: 2.2, reward: 185, boss: { hp: 5600, tier: 3, skills: ['dash','poison_cloud'] } },
    { level: 35, waves: 1, enemyCount: 60, enemyHp: 1180, enemySpeed: 2.2, reward: 190, boss: { hp: 6000, tier: 3, skills: ['spawn','dash','bomb'] } },
    { level: 36, waves: 1, enemyCount: 62, enemyHp: 1220, enemySpeed: 2.2, reward: 195, boss: { hp: 6400, tier: 3, skills: ['clone','shield','spawn'] } },
    { level: 37, waves: 1, enemyCount: 64, enemyHp: 1260, enemySpeed: 2.3, reward: 200, boss: { hp: 6800, tier: 3, skills: ['rage','bomb','dash'] } },
    { level: 38, waves: 1, enemyCount: 66, enemyHp: 1300, enemySpeed: 2.3, reward: 205, boss: { hp: 7200, tier: 3, skills: ['teleport','spawn','poison_cloud'] } },
    { level: 39, waves: 1, enemyCount: 68, enemyHp: 1340, enemySpeed: 2.3, reward: 210, boss: { hp: 7600, tier: 3, skills: ['clone','rage','shield'] } },
    { level: 40, waves: 1, enemyCount: 70, enemyHp: 1380, enemySpeed: 2.4, reward: 220, boss: { hp: 8000, tier: 3, skills: ['bomb','spawn','dash','shield'] } },
    // 第41-50关：tier4，Boss技能全开，极限挑战
    { level: 41, waves: 1, enemyCount: 72, enemyHp: 1440, enemySpeed: 2.4, reward: 230, boss: { hp: 8600, tier: 4, skills: ['bomb','clone','rage'] } },
    { level: 42, waves: 1, enemyCount: 74, enemyHp: 1500, enemySpeed: 2.4, reward: 235, boss: { hp: 9200, tier: 4, skills: ['spawn','teleport','shield','bomb'] } },
    { level: 43, waves: 1, enemyCount: 76, enemyHp: 1560, enemySpeed: 2.5, reward: 240, boss: { hp: 9800, tier: 4, skills: ['dash','clone','poison_cloud','rage'] } },
    { level: 44, waves: 1, enemyCount: 78, enemyHp: 1620, enemySpeed: 2.5, reward: 245, boss: { hp: 10400, tier: 4, skills: ['bomb','spawn','shield','teleport'] } },
    { level: 45, waves: 1, enemyCount: 80, enemyHp: 1680, enemySpeed: 2.5, reward: 250, boss: { hp: 11000, tier: 4, skills: ['clone','rage','dash','bomb','spawn'] } },
    { level: 46, waves: 1, enemyCount: 82, enemyHp: 1740, enemySpeed: 2.6, reward: 255, boss: { hp: 11600, tier: 4, skills: ['poison_cloud','shield','teleport','clone'] } },
    { level: 47, waves: 1, enemyCount: 84, enemyHp: 1800, enemySpeed: 2.6, reward: 260, boss: { hp: 12200, tier: 4, skills: ['bomb','rage','spawn','dash','shield'] } },
    { level: 48, waves: 1, enemyCount: 86, enemyHp: 1860, enemySpeed: 2.6, reward: 265, boss: { hp: 12800, tier: 4, skills: ['clone','teleport','poison_cloud','rage','bomb'] } },
    { level: 49, waves: 1, enemyCount: 88, enemyHp: 1920, enemySpeed: 2.7, reward: 270, boss: { hp: 13400, tier: 4, skills: ['spawn','dash','shield','clone','rage','bomb'] } },
    { level: 50, waves: 1, enemyCount: 90, enemyHp: 2000, enemySpeed: 2.7, reward: 300, boss: { hp: 14000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    // 第51-60关：tier5，双Boss技能组合，敌人更快更多
    { level: 51, waves: 1, enemyCount: 92, enemyHp: 2100, enemySpeed: 2.8, reward: 310, boss: { hp: 15000, tier: 4, skills: ['bomb','rage','dash'] } },
    { level: 52, waves: 1, enemyCount: 94, enemyHp: 2200, enemySpeed: 2.8, reward: 315, boss: { hp: 16000, tier: 4, skills: ['spawn','clone','shield'] } },
    { level: 53, waves: 1, enemyCount: 96, enemyHp: 2300, enemySpeed: 2.8, reward: 320, boss: { hp: 17000, tier: 4, skills: ['teleport','poison_cloud','bomb'] } },
    { level: 54, waves: 1, enemyCount: 98, enemyHp: 2400, enemySpeed: 2.9, reward: 325, boss: { hp: 18000, tier: 4, skills: ['rage','clone','dash','spawn'] } },
    { level: 55, waves: 1, enemyCount: 100, enemyHp: 2500, enemySpeed: 2.9, reward: 330, boss: { hp: 19000, tier: 4, skills: ['bomb','shield','teleport','rage'] } },
    { level: 56, waves: 1, enemyCount: 102, enemyHp: 2600, enemySpeed: 2.9, reward: 335, boss: { hp: 20000, tier: 4, skills: ['spawn','poison_cloud','clone','bomb'] } },
    { level: 57, waves: 1, enemyCount: 104, enemyHp: 2700, enemySpeed: 3.0, reward: 340, boss: { hp: 21500, tier: 4, skills: ['dash','rage','shield','teleport'] } },
    { level: 58, waves: 1, enemyCount: 106, enemyHp: 2800, enemySpeed: 3.0, reward: 345, boss: { hp: 23000, tier: 4, skills: ['clone','bomb','spawn','poison_cloud','rage'] } },
    { level: 59, waves: 1, enemyCount: 108, enemyHp: 2900, enemySpeed: 3.0, reward: 350, boss: { hp: 24500, tier: 4, skills: ['shield','dash','teleport','clone','bomb'] } },
    { level: 60, waves: 1, enemyCount: 110, enemyHp: 3000, enemySpeed: 3.1, reward: 380, boss: { hp: 26000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    // 第61-70关：敌人速度继续提升，Boss HP大幅增长
    { level: 61, waves: 1, enemyCount: 112, enemyHp: 3150, enemySpeed: 3.1, reward: 390, boss: { hp: 28000, tier: 4, skills: ['rage','bomb','spawn'] } },
    { level: 62, waves: 1, enemyCount: 114, enemyHp: 3300, enemySpeed: 3.1, reward: 395, boss: { hp: 30000, tier: 4, skills: ['clone','shield','dash','bomb'] } },
    { level: 63, waves: 1, enemyCount: 116, enemyHp: 3450, enemySpeed: 3.2, reward: 400, boss: { hp: 32000, tier: 4, skills: ['teleport','poison_cloud','rage','spawn'] } },
    { level: 64, waves: 1, enemyCount: 118, enemyHp: 3600, enemySpeed: 3.2, reward: 405, boss: { hp: 34000, tier: 4, skills: ['bomb','clone','shield','dash','rage'] } },
    { level: 65, waves: 1, enemyCount: 120, enemyHp: 3750, enemySpeed: 3.2, reward: 410, boss: { hp: 36000, tier: 4, skills: ['spawn','teleport','bomb','poison_cloud'] } },
    { level: 66, waves: 1, enemyCount: 122, enemyHp: 3900, enemySpeed: 3.3, reward: 415, boss: { hp: 38000, tier: 4, skills: ['rage','clone','dash','shield','spawn'] } },
    { level: 67, waves: 1, enemyCount: 124, enemyHp: 4050, enemySpeed: 3.3, reward: 420, boss: { hp: 40000, tier: 4, skills: ['bomb','teleport','poison_cloud','clone'] } },
    { level: 68, waves: 1, enemyCount: 126, enemyHp: 4200, enemySpeed: 3.3, reward: 425, boss: { hp: 43000, tier: 4, skills: ['shield','rage','spawn','dash','bomb'] } },
    { level: 69, waves: 1, enemyCount: 128, enemyHp: 4350, enemySpeed: 3.4, reward: 430, boss: { hp: 46000, tier: 4, skills: ['clone','teleport','poison_cloud','rage','shield'] } },
    { level: 70, waves: 1, enemyCount: 130, enemyHp: 4500, enemySpeed: 3.4, reward: 460, boss: { hp: 50000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    // 第71-80关：极限挑战，敌人数量和速度双提升
    { level: 71, waves: 1, enemyCount: 133, enemyHp: 4700, enemySpeed: 3.4, reward: 470, boss: { hp: 54000, tier: 4, skills: ['bomb','rage','clone','dash'] } },
    { level: 72, waves: 1, enemyCount: 136, enemyHp: 4900, enemySpeed: 3.5, reward: 475, boss: { hp: 58000, tier: 4, skills: ['spawn','shield','teleport','bomb'] } },
    { level: 73, waves: 1, enemyCount: 139, enemyHp: 5100, enemySpeed: 3.5, reward: 480, boss: { hp: 62000, tier: 4, skills: ['poison_cloud','rage','clone','spawn'] } },
    { level: 74, waves: 1, enemyCount: 142, enemyHp: 5300, enemySpeed: 3.5, reward: 485, boss: { hp: 66000, tier: 4, skills: ['dash','bomb','shield','teleport','rage'] } },
    { level: 75, waves: 1, enemyCount: 145, enemyHp: 5500, enemySpeed: 3.6, reward: 490, boss: { hp: 70000, tier: 4, skills: ['clone','spawn','poison_cloud','bomb','dash'] } },
    { level: 76, waves: 1, enemyCount: 148, enemyHp: 5700, enemySpeed: 3.6, reward: 495, boss: { hp: 75000, tier: 4, skills: ['rage','shield','teleport','clone','spawn'] } },
    { level: 77, waves: 1, enemyCount: 151, enemyHp: 5900, enemySpeed: 3.6, reward: 500, boss: { hp: 80000, tier: 4, skills: ['bomb','poison_cloud','dash','rage','shield'] } },
    { level: 78, waves: 1, enemyCount: 154, enemyHp: 6100, enemySpeed: 3.7, reward: 505, boss: { hp: 85000, tier: 4, skills: ['clone','teleport','spawn','bomb','rage','dash'] } },
    { level: 79, waves: 1, enemyCount: 157, enemyHp: 6300, enemySpeed: 3.7, reward: 510, boss: { hp: 90000, tier: 4, skills: ['shield','poison_cloud','clone','rage','teleport','spawn'] } },
    { level: 80, waves: 1, enemyCount: 160, enemyHp: 6500, enemySpeed: 3.7, reward: 550, boss: { hp: 100000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    // 第81-90关：传说级，敌人HP破万
    { level: 81, waves: 1, enemyCount: 163, enemyHp: 6800, enemySpeed: 3.8, reward: 560, boss: { hp: 108000, tier: 4, skills: ['bomb','rage','spawn','dash'] } },
    { level: 82, waves: 1, enemyCount: 166, enemyHp: 7100, enemySpeed: 3.8, reward: 565, boss: { hp: 116000, tier: 4, skills: ['clone','shield','teleport','bomb'] } },
    { level: 83, waves: 1, enemyCount: 169, enemyHp: 7400, enemySpeed: 3.8, reward: 570, boss: { hp: 124000, tier: 4, skills: ['poison_cloud','rage','spawn','clone'] } },
    { level: 84, waves: 1, enemyCount: 172, enemyHp: 7700, enemySpeed: 3.9, reward: 575, boss: { hp: 132000, tier: 4, skills: ['dash','bomb','shield','rage','teleport'] } },
    { level: 85, waves: 1, enemyCount: 175, enemyHp: 8000, enemySpeed: 3.9, reward: 580, boss: { hp: 140000, tier: 4, skills: ['clone','spawn','poison_cloud','bomb','dash','rage'] } },
    { level: 86, waves: 1, enemyCount: 178, enemyHp: 8300, enemySpeed: 3.9, reward: 585, boss: { hp: 150000, tier: 4, skills: ['shield','teleport','clone','spawn','bomb'] } },
    { level: 87, waves: 1, enemyCount: 181, enemyHp: 8600, enemySpeed: 4.0, reward: 590, boss: { hp: 160000, tier: 4, skills: ['rage','poison_cloud','dash','shield','clone'] } },
    { level: 88, waves: 1, enemyCount: 184, enemyHp: 8900, enemySpeed: 4.0, reward: 595, boss: { hp: 170000, tier: 4, skills: ['bomb','spawn','teleport','rage','dash','shield'] } },
    { level: 89, waves: 1, enemyCount: 187, enemyHp: 9200, enemySpeed: 4.0, reward: 600, boss: { hp: 180000, tier: 4, skills: ['clone','poison_cloud','shield','spawn','rage','teleport','bomb'] } },
    { level: 90, waves: 1, enemyCount: 190, enemyHp: 9500, enemySpeed: 4.1, reward: 650, boss: { hp: 200000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    // 第91-100关：神话级终章
    { level: 91, waves: 1, enemyCount: 193, enemyHp: 9900, enemySpeed: 4.1, reward: 660, boss: { hp: 220000, tier: 4, skills: ['bomb','rage','clone','dash','spawn'] } },
    { level: 92, waves: 1, enemyCount: 196, enemyHp: 10300, enemySpeed: 4.1, reward: 665, boss: { hp: 240000, tier: 4, skills: ['shield','teleport','poison_cloud','bomb','rage'] } },
    { level: 93, waves: 1, enemyCount: 199, enemyHp: 10700, enemySpeed: 4.2, reward: 670, boss: { hp: 260000, tier: 4, skills: ['clone','spawn','dash','shield','teleport','bomb'] } },
    { level: 94, waves: 1, enemyCount: 202, enemyHp: 11100, enemySpeed: 4.2, reward: 675, boss: { hp: 280000, tier: 4, skills: ['rage','poison_cloud','clone','spawn','bomb','dash'] } },
    { level: 95, waves: 1, enemyCount: 205, enemyHp: 11500, enemySpeed: 4.2, reward: 680, boss: { hp: 300000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    { level: 96, waves: 1, enemyCount: 208, enemyHp: 12000, enemySpeed: 4.3, reward: 685, boss: { hp: 330000, tier: 4, skills: ['shield','rage','teleport','clone','poison_cloud','bomb'] } },
    { level: 97, waves: 1, enemyCount: 211, enemyHp: 12500, enemySpeed: 4.3, reward: 690, boss: { hp: 360000, tier: 4, skills: ['spawn','dash','bomb','rage','clone','shield','teleport'] } },
    { level: 98, waves: 1, enemyCount: 214, enemyHp: 13000, enemySpeed: 4.3, reward: 695, boss: { hp: 400000, tier: 4, skills: ['poison_cloud','clone','rage','spawn','dash','bomb','shield'] } },
    { level: 99, waves: 1, enemyCount: 217, enemyHp: 13500, enemySpeed: 4.4, reward: 700, boss: { hp: 450000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
    { level: 100, waves: 1, enemyCount: 220, enemyHp: 14000, enemySpeed: 4.5, reward: 800, boss: { hp: 500000, tier: 4, skills: ['bomb','spawn','clone','dash','rage','shield','teleport','poison_cloud'] } },
];

// ===== 每日礼包抽奖池 =====
const LOTTERY_POOL = [
    { id: 'pts5',  label: '积分+5',   prob: 0.35, effect: { pts: 5 } },
    { id: 'pts10', label: '积分+10',  prob: 0.30, effect: { pts: 10 } },
    { id: 'pts20', label: '积分+20',  prob: 0.20, effect: { pts: 20 } },
    { id: 'pts50', label: '积分+50',  prob: 0.10, effect: { pts: 50 } },
    { id: 'pts100',label: '积分+100', prob: 0.05, effect: { pts: 100 } },
];

// ===== 数据存取 =====
function getTowerData() {
    const raw = localStorage.getItem(TOWER_KEY);
    if (raw) return JSON.parse(raw);
    // 默认赠送：200积分 + 弓箭塔/炮塔/冰冻塔各1个 + 3个分散塔位（id 0, 5, 9）
    const id1 = newInstanceId(), id2 = newInstanceId(), id3 = newInstanceId();
    return {
        points: 200,
        towers: {},
        unlockedSlots: [0, 5, 9],   // 分散的3个塔位
        weaponInstances: [
            { id: id1, typeId: 'arrow',   upgrades: [] },
            { id: id2, typeId: 'cannon',  upgrades: [] },
            { id: id3, typeId: 'ice',     upgrades: [] },
        ],
        currentLevel: 1,
        lastGiftDate: null,
        lastGiftDate_hw: null,
        lastGiftDate_essay: null,
        history: [{ date: new Date().toLocaleDateString('zh-CN'), label: '系统赠送初始武器和积分', pts: 200 }],
    };
}

// 生成唯一实例ID
function newInstanceId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function saveTowerData(data) {
    localStorage.setItem(TOWER_KEY, JSON.stringify(data));
}

// ===== 计算塔的实际属性（基础值 + 已购升级）=====
function calcTowerStats(typeId, upgrades) {
    const base = TOWER_TYPES[typeId];
    const stats = {
        atk: base.baseAtk,
        range: base.baseRange,
        speed: base.baseSpeed,
        multiShot: 1,
        tracking: false,
        splash: false,
        bigSplash: false,
        burn: false,
        poison: false,
        pierce: false,
        slow: base.slowFactor || 0,
        freeze: false,
        iceSplash: false,
        shatter: false,
        stun: false,
        empStun: false,
        overload: false,
        chain: base.chainCount || 1,
        superMode: false,
        speedMult: 1,
    };
    (upgrades || []).forEach(uid => {
        const upg = base.upgrades.find(u => u.id === uid);
        if (!upg) return;
        const e = upg.effect;
        if (e.atk)       stats.atk += e.atk;
        if (e.range)     stats.range += e.range;
        if (e.multiShot) stats.multiShot = e.multiShot;
        if (e.tracking)  stats.tracking = true;
        if (e.splash)    stats.splash = true;
        if (e.bigSplash) stats.bigSplash = true;
        if (e.burn)      stats.burn = true;
        if (e.poison)    stats.poison = true;
        if (e.pierce)    stats.pierce = true;
        if (e.slow)      stats.slow = e.slow;
        if (e.freeze)    stats.freeze = true;
        if (e.iceSplash) stats.iceSplash = true;
        if (e.shatter)   stats.shatter = true;
        if (e.stun)      stats.stun = true;
        if (e.empStun)   stats.empStun = true;
        if (e.overload)  stats.overload = true;
        if (e.chain)     stats.chain = e.chain;
        if (e.superMode) { stats.superMode = true; stats.atk *= 2; }
        if (e.speedMult) stats.speed *= e.speedMult;  // 每级×1.5（即+50%）
        if (e.rangeMult) stats.range *= e.rangeMult;  // 每级×2（即+100%）
    });
    return stats;
}
