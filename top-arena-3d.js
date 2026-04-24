// 陀螺竞技场 3D进阶版 核心逻辑

// ===== 密码锁 =====
// 日期密码：取当天星期几的英语全拼，例如 星期一 → "monday"
function lockGetPwd() {
    const now = new Date();
    const day = now.getDay(); // 0 是周日，1-6 是周一到周六
    const englishMap = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
    };
    return englishMap[day];
}

function lockVerify() {
    const inputEl = document.getElementById('realLockInput');
    const lockBuffer = inputEl.value.trim().toLowerCase();
    
    if (lockBuffer === lockGetPwd()) {
        document.getElementById('lockOverlay').classList.add('hidden');
        inputEl.value = ''; // 清空密码框
    } else {
        document.getElementById('lockError').textContent = '密码错误，请重试';
        inputEl.value = '';
        inputEl.focus();
        const box = document.querySelector('.lock-box');
        box.style.animation = 'none';
        box.offsetHeight;
        box.style.animation = 'lockShake 0.4s ease';
    }
}

// 页面加载时自动聚焦到密码框
window.addEventListener('DOMContentLoaded', () => {
    const lockInput = document.getElementById('realLockInput');
    if(lockInput) {
        // 给一点点延迟确保弹窗渲染完成
        setTimeout(() => lockInput.focus(), 100);
    }
});

// ===== 陀螺配置 (LV1 到 LV50) =====
const TOP_TYPES = [
    { id: 1, name: 'LV1', emoji: '⚪', hp: 5, cost: 6, color: '#e5e5e5', tier: 1 },
    { id: 2, name: 'LV2', emoji: '🔵', hp: 10, cost: 6, color: '#60a5fa', tier: 2 },
    { id: 3, name: 'LV3', emoji: '🟢', hp: 15, cost: 6, color: '#4ade80', tier: 3 },
    { id: 4, name: 'LV4', emoji: '🟡', hp: 20, cost: 6, color: '#facc15', tier: 4 },
    { id: 5, name: 'LV5', emoji: '🟠', hp: 25, cost: 6, color: '#fb923c', tier: 5 },
    { id: 6, name: 'LV6', emoji: '🔴', hp: 30, cost: 6, color: '#f87171', tier: 6 },
    { id: 7, name: 'LV7', emoji: '🟣', hp: 35, cost: 6, color: '#c084fc', tier: 7 },
    { id: 8, name: 'LV8', emoji: '⚫', hp: 40, cost: 6, color: '#374151', tier: 8 },
    { id: 9, name: 'LV9', emoji: '💎', hp: 45, cost: 6, color: '#22d3ee', tier: 9 },
    { id: 10, name: 'LV10', emoji: '👑', hp: 50, cost: 6, color: '#fbbf24', tier: 10 },
    { id: 11, name: 'LV11', emoji: '🔥', hp: 55, cost: 6, color: '#ef4444', tier: 11 },
    { id: 12, name: 'LV12', emoji: '❄️', hp: 60, cost: 6, color: '#38bdf8', tier: 12 },
    { id: 13, name: 'LV13', emoji: '⚡', hp: 65, cost: 6, color: '#f59e0b', tier: 13 },
    { id: 14, name: 'LV14', emoji: '🌪️', hp: 70, cost: 6, color: '#a855f7', tier: 14 },
    { id: 15, name: 'LV15', emoji: '🌊', hp: 75, cost: 6, color: '#0ea5e9', tier: 15 },
    { id: 16, name: 'LV16', emoji: '🪨', hp: 80, cost: 6, color: '#78716c', tier: 16 },
    { id: 17, name: 'LV17', emoji: '🌿', hp: 85, cost: 6, color: '#22c55e', tier: 17 },
    { id: 18, name: 'LV18', emoji: '☀️', hp: 90, cost: 6, color: '#fbbf24', tier: 18 },
    { id: 19, name: 'LV19', emoji: '🌙', hp: 95, cost: 6, color: '#818cf8', tier: 19 },
    { id: 20, name: 'LV20', emoji: '⭐', hp: 100, cost: 6, color: '#fbbf24', tier: 20 },
    { id: 21, name: 'LV21', emoji: '💫', hp: 105, cost: 6, color: '#c084fc', tier: 21 },
    { id: 22, name: 'LV22', emoji: '🌈', hp: 110, cost: 6, color: '#f472b6', tier: 22 },
    { id: 23, name: 'LV23', emoji: '🔮', hp: 115, cost: 6, color: '#a855f7', tier: 23 },
    { id: 24, name: 'LV24', emoji: '💠', hp: 120, cost: 6, color: '#22d3ee', tier: 24 },
    { id: 25, name: 'LV25', emoji: '🎯', hp: 125, cost: 6, color: '#f43f5e', tier: 25 },
    { id: 26, name: 'LV26', emoji: '🛡️', hp: 130, cost: 6, color: '#64748b', tier: 26 },
    { id: 27, name: 'LV27', emoji: '⚔️', hp: 135, cost: 6, color: '#94a3b8', tier: 27 },
    { id: 28, name: 'LV28', emoji: '🗡️', hp: 140, cost: 6, color: '#cbd5e1', tier: 28 },
    { id: 29, name: 'LV29', emoji: '🏹', hp: 145, cost: 6, color: '#dc2626', tier: 29 },
    { id: 30, name: 'LV30', emoji: '🦅', hp: 150, cost: 6, color: '#f97316', tier: 30 },
    { id: 31, name: 'LV31', emoji: '🐉', hp: 155, cost: 6, color: '#16a34a', tier: 31 },
    { id: 32, name: 'LV32', emoji: '🦁', hp: 160, cost: 6, color: '#ea580c', tier: 32 },
    { id: 33, name: 'LV33', emoji: '🐯', hp: 165, cost: 6, color: '#f97316', tier: 33 },
    { id: 34, name: 'LV34', emoji: '🐺', hp: 170, cost: 6, color: '#6b7280', tier: 34 },
    { id: 35, name: 'LV35', emoji: '🦊', hp: 175, cost: 6, color: '#f97316', tier: 35 },
    { id: 36, name: 'LV36', emoji: '🦉', hp: 180, cost: 6, color: '#a855f7', tier: 36 },
    { id: 37, name: 'LV37', emoji: '🐍', hp: 185, cost: 6, color: '#16a34a', tier: 37 },
    { id: 38, name: 'LV38', emoji: '🦋', hp: 190, cost: 6, color: '#22d3ee', tier: 38 },
    { id: 39, name: 'LV39', emoji: '🐲', hp: 195, cost: 6, color: '#dc2626', tier: 39 },
    { id: 40, name: 'LV40', emoji: '👹', hp: 200, cost: 6, color: '#7f1d1d', tier: 40 },
    { id: 41, name: 'LV41', emoji: '👺', hp: 210, cost: 6, color: '#991b1b', tier: 41 },
    { id: 42, name: 'LV42', emoji: '🤖', hp: 220, cost: 6, color: '#3b82f6', tier: 42 },
    { id: 43, name: 'LV43', emoji: '👾', hp: 230, cost: 6, color: '#a855f7', tier: 43 },
    { id: 44, name: 'LV44', emoji: '🎃', hp: 240, cost: 6, color: '#f97316', tier: 44 },
    { id: 45, name: 'LV45', emoji: '💀', hp: 250, cost: 6, color: '#475569', tier: 45 },
    { id: 46, name: 'LV46', emoji: '☠️', hp: 260, cost: 6, color: '#1e293b', tier: 46 },
    { id: 47, name: 'LV47', emoji: '🌑', hp: 270, cost: 6, color: '#0f172a', tier: 47 },
    { id: 48, name: 'LV48', emoji: '🌌', hp: 280, cost: 6, color: '#4c1d95', tier: 48 },
    { id: 49, name: 'LV49', emoji: '⚛️', hp: 290, cost: 6, color: '#06b6d4', tier: 49 },
    { id: 50, name: 'LV50', emoji: '🔱', hp: 300, cost: 6, color: '#fbbf24', tier: 50 }
];

const STUDENT_NAMES = [
    '孙博渊', '蔡静轩', '史卓远', '胡殷阳', '雷远', '张睿琪', '黄小易',
    '叶宇辰', '陈佳铭', '李一帆', '孙尚峻', '刘维熙', '郑博文', '魏嘉浩', '陈宏维',
    '焦艾嘉', '马凯北', '赵胤凡', '周进杉', '朱宜萌', '赵家豪', '刘泽琪', '郭潇祺',
    '裴名播', '闫翊晨', '孙玄霆', '秦俊坤', '陈雨桐', '刘思成', '蒋逸宣', '王思承',
    '王可泽', '王梓瑞', '刘桐菲', '路嘉瑶', '武玥', '王梓萌', '闫祥文', '朱昊天'
];

// ===== 状态管理 =====
const ARENA_KEY = 'focusTree_topArenaData_v2';
// TOWER_KEY 已在 tower-data.js 中定义

// ===== 特殊陀螺系统 =====
const SPECIAL_TICKETS_KEY = 'focusTree_specialTickets';
const SPECIAL_TOPS_KEY = 'focusTree_specialTops';
const SPECIAL_TOPS_DATE_KEY = 'focusTree_specialTicketsDate';

// ===== 特殊陀螺配置 =====
const SPECIAL_TOPS = [
    {
        id: 'huluwa1',
        name: '大娃陀螺',
        emoji: '👶',
        hp: 35,
        baseMass: 24,  // 对应LV7的基础质量
        color: '#dc2626',  // 红色，代表大娃
        tier: 7,
        description: '葫芦娃大娃，可变大变小。最大可变大2.2倍，质量同步增加，对敌人造成3倍伤害！',
        ability: 'sizeChange',  // 特殊能力：大小变化
        maxSize: 2.2,  // 最大放大倍数（变大到2.2倍）
        minSize: 0.7,  // 最小缩小倍数
        damageBonus: 3  // 变大时伤害倍数（最大3倍伤害）
    },
    {
        id: 'huluwa2',
        name: '二娃陀螺',
        emoji: '👀',
        hp: 35,
        baseMass: 24,  // 对应LV7的基础质量
        color: '#f97316',  // 橙色，代表二娃
        tier: 7,
        description: '葫芦娃二娃，拥有千里眼和顺风耳！激光眼和声波攻击交替释放，每2秒一次！',
        ability: 'laserAndSonic',  // 特殊能力：激光眼+声波攻击
        laserDamage: 1,   // 激光伤害
        sonicDamage: 1,   // 声波伤害
        attackInterval: 2000,  // 攻击间隔2秒
        laserRange: 300,  // 激光射程
        sonicRange: 150  // 声波范围
    },
    {
        id: 'huluwa3',
        name: '三娃陀螺',
        emoji: '🛡️',
        hp: 35,
        baseMass: 24,  // 对应LV7的基础质量
        color: '#facc15',  // 黄色，代表三娃（铜头铁臂）
        tier: 7,
        description: '葫芦娃三娃，铜头铁臂刀枪不入！拥有铜墙铁壁防护罩，可抵挡5次碰撞伤害！',
        ability: 'shield',  // 特殊能力：防护罩
        shieldMaxHits: 5,  // 防护罩最大抵挡次数
        shieldRadius: 45   // 防护罩半径
    },
    {
        id: 'huluwa4',
        name: '四娃陀螺',
        emoji: '🔥',
        hp: 50,
        baseMass: 30,  // 对应LV10的基础质量
        color: '#22c55e',  // 绿色，代表四娃（火娃）
        tier: 10,
        description: '葫芦娃四娃，火神转世！会向前方喷出烈焰，被火焰烧到的敌人会持续掉血！',
        ability: 'fireBreath',  // 特殊能力：喷火
        fireDamage: 3,        // 每秒火焰伤害
        fireRange: 200,       // 火焰射程
        fireAngle: Math.PI / 3, // 火焰扇形角度（60度）
        fireInterval: 3000,   // 喷火间隔3秒
        fireDuration: 500     // 每次喷火持续时间500ms
    },
    {
        id: 'huluwa5',
        name: '五娃陀螺',
        emoji: '💧',
        hp: 50,
        baseMass: 30,  // 对应LV10的基础质量
        color: '#3b82f6',  // 蓝色，代表五娃（水娃）
        tier: 10,
        description: '葫芦娃五娃，水神转世！每3秒喷出洪水，被水喷到的敌人会降低一级！',
        ability: 'waterBreath',  // 特殊能力：喷水
        waterRange: 250,      // 水柱射程
        waterAngle: Math.PI / 4, // 水柱扇形角度（45度）
        waterInterval: 3000   // 喷水间隔3秒
    },
    {
        id: 'huluwa6',
        name: '六娃陀螺',
        emoji: '👻',
        hp: 50,
        baseMass: 30,  // 对应LV10的基础质量
        color: '#8b5cf6',  // 紫色，代表六娃（隐身娃）
        tier: 10,
        description: '葫芦娃六娃，隐身术！每3秒隐身1秒，隐身期间敌人无法造成伤害！',
        ability: 'invisibility',  // 特殊能力：隐身
        invisibilityInterval: 3000,  // 隐身间隔3秒
        invisibilityDuration: 1000   // 隐身持续时间1秒
    },
    {
        id: 'snakeSpirit',
        name: '蛇精陀螺',
        emoji: '🐍',
        hp: 50,
        baseMass: 30,  // 对应LV10的基础质量
        color: '#10b981',  // 青绿色，代表蛇精
        tier: 10,
        description: '蛇精陀螺，妖风四起！每3秒释放龙卷风，被卷到的敌人会被冰冻3秒！',
        ability: 'tornado',  // 特殊能力：龙卷风
        tornadoInterval: 3000,  // 龙卷风释放间隔3秒
        tornadoSpeed: 5,        // 龙卷风移动速度
        tornadoRadius: 40,      // 龙卷风半径
        freezeDuration: 3000    // 冰冻持续时间3秒
    },
    {
        id: 'scorpion',
        name: '蝎子陀螺',
        emoji: '🦂',
        hp: 55,
        baseMass: 35,  // 对应LV11的基础质量
        color: '#dc2626',  // 深红色，代表蝎子精
        tier: 11,
        description: '蝎子精陀螺，毒钩夺命！用尾巴钩住范围内敌人，被钩住的陀螺会随蝎子移动并持续失血！',
        ability: 'hook',  // 特殊能力：钩子
        hookRange: 150,       // 钩子攻击范围（圆形半径）
        hookDamage: 2,        // 每秒失血伤害
        hookPullSpeed: 0.3    // 被钩住陀螺跟随移动的速度系数
    },
    {
        id: 'dragonGod',
        name: '神龙陀螺',
        emoji: '🐲',
        hp: 90,
        baseMass: 55,  // 对应LV18的基础质量
        color: '#fbbf24',  // 金黄色，代表神龙
        tier: 18,
        description: '神龙降临，万法归一！拥有喷火、喷水、声波攻击和护盾，护盾破碎召唤9个LV10陀螺，碰撞后产生4个分身！',
        ability: 'dragon',  // 特殊能力：神龙综合
        // 喷火配置（四娃）
        fireInterval: 1500,    // 喷火间隔1.5秒
        fireDuration: 3000,    // 火焰持续时间3秒
        fireDamage: 1,         // 每秒燃烧伤害
        fireRange: 200,        // 喷火范围
        // 喷水配置（五娃）
        waterInterval: 4000,   // 喷水间隔4秒
        waterRange: 250,       // 喷水范围
        // 声波配置（二娃）
        sonicInterval: 2000,   // 声波间隔2秒
        sonicRange: 300,       // 声波范围
        // 护盾配置（三娃）
        shieldMaxHits: 5,      // 护盾可抵挡5次攻击
        // 分身配置
        cloneCount: 4,         // 碰撞产生4个分身
        cloneTier: 10,         // 分身等级相当于LV10
        canClone: true,        // 主陀螺可以分身
        // 召唤配置
        summonCount: 9,        // 护盾破碎召唤9个陀螺
        summonTier: 10         // 召唤的陀螺等级为LV10
    }
];

let arenaData = {
    baseTier: 1,            // 当前发放的基准陀螺等级
    fragments: 0,           // 基准碎片 (满3升1)
    gachaTickets: 0,        // 抽奖券
    efficiencyStars: 0,     // 效率之星
    lastCheckedDate: null,  // 记录上次派发每日零星奖励的日期
    inventory: [],          // 当前场下留存
    discoveredTops: [],     // 曾经出现过的陀螺类型ID（用于图鉴高亮）
    currentLevel: 1,        // 关卡进度
    dailyTasks: {           // 每日任务完成情况
        homework: false,
        essay: false,
        perfect: false,
        date: null
    }
};

// 画布渲染控制
const canvas = document.getElementById('arenaCanvas');
const ctx = canvas.getContext('2d');
let w, h;
let topsOnBoard = []; // 存活在网格或场上的所有陀螺
let particles = [];
let floatingTexts = []; // 浮动文字效果（伤害数字等）
let animFrame = null;
let gameState = 'setup'; // setup, playing, ended

// 龙卷风状态管理
let tornadoes = []; // 存储所有活跃的龙卷风

// 玻璃破裂效果状态
let glassCrackState = {
    crackCount: 0,        // 当前裂纹次数（0-5）
    maxCracks: 5,         // 最大裂纹次数
    cracks: [],           // 裂纹路径数组
    isShattered: false,   // 是否已彻底碎裂
    shatterTime: 0        // 碎裂动画开始时间
};

// 布局控制
const GRID_COLS = 6;
const GRID_ROWS = 5;
let cellSize = 120; // 会根据屏幕自适应

// selectedDeployTopId 已废除，改为 autoDeployToGrid 自动落子

let matchTimeoutId = null; 

// ===== 初始化引擎 =====
function initEngine() {
    loadData();
    
    // 修复未放置的特殊陀螺（gridR: -1）
    fixUnplacedSpecialTops();
    
    checkDailyRewards();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化Z键监听（用于解锁家长评定按钮）
    initRatingButtonLock();
    
    updateHUD();
    buildGridOverlay();
    
    // 初始化时生成一波假设的敌人（为了画面有东西）
    spawnEnemies();

    // 绘制循环
    requestAnimationFrame(renderLoop);
}

// 修复未放置的特殊陀螺，自动寻找空位放置
function fixUnplacedSpecialTops() {
    let needsSave = false;
    
    arenaData.inventory.forEach(item => {
        if (item.isSpecial && item.gridR < 0 && item.gridC < 0) {
            // 寻找空位
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const occupied = arenaData.inventory.some(i => 
                        i.gridR >= 0 && i.gridC >= 0 && i.gridR === r && i.gridC === c
                    );
                    if (!occupied) {
                        item.gridR = r;
                        item.gridC = c;
                        needsSave = true;
                        console.log(`Fixed special top ${item.id} to grid (${r}, ${c})`);
                        return; // 只修复一个，避免多个都放到同一个位置
                    }
                }
            }
        }
    });
    
    if (needsSave) {
        saveData();
    }
}

// ===== Z键解锁家长评定按钮 =====
let isZKeyPressed = false;

function initRatingButtonLock() {
    // 监听键盘按下
    document.addEventListener('keydown', (e) => {
        if (e.key === 'z' || e.key === 'Z') {
            isZKeyPressed = true;
            unlockRatingButtons();
        }
    });
    
    // 监听键盘释放
    document.addEventListener('keyup', (e) => {
        if (e.key === 'z' || e.key === 'Z') {
            isZKeyPressed = false;
            lockRatingButtons();
        }
    });
}

function unlockRatingButtons() {
    const buttons = ['btnRate1', 'btnRate2', 'btnRate3'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('rating-locked');
            btn.classList.add('rating-unlocked');
        }
    });
}

function lockRatingButtons() {
    const buttons = ['btnRate1', 'btnRate2', 'btnRate3'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('rating-unlocked');
            btn.classList.add('rating-locked');
        }
    });
}

// 修改awardEfficiencyStar函数，添加Z键验证
const originalAwardEfficiencyStar = awardEfficiencyStar;
awardEfficiencyStar = function(starCount) {
    if (!isZKeyPressed) {
        // Z键未按住，不执行任何操作
        return;
    }
    originalAwardEfficiencyStar(starCount);
}

function loadData() {
    let raw = localStorage.getItem(ARENA_KEY);
    if (raw) {
        arenaData = Object.assign(arenaData, JSON.parse(raw));
    } else {
        saveData();
    }
    
    // 初始化直接利用共用的资产同步函数将缓存写入战场
    reloadAssetsFromInventory();
}
function saveData() {
    localStorage.setItem(ARENA_KEY, JSON.stringify(arenaData));
}

// ===== 核心每日算法 (碎片与券发放) =====
function checkDailyRewards() {
    let tData = getTowerData();
    let today = new Date().toLocaleDateString('zh-CN');
    
    if (arenaData.lastCheckedDate === today) return; // 今天已经结算过了

    // 遍历昨/今积分历史，寻找 `hwDone` 或 `essay`
    // 判断是否有触发条件
    let qualify = false;
    for (let record of tData.history || []) {
        if (record.date === today && (record.label.includes('学校作业全') || record.label.includes('达标作文'))) {
            qualify = true;
            break;
        }
    }

    if (qualify) {
        // 完成作业：给1个碎片 + 1张抽奖券
        arenaData.fragments += 1;
        arenaData.gachaTickets += 1;
        
        // 碎片满 3 片升级
        if (arenaData.fragments >= 3) {
            arenaData.fragments = 0;
            if (arenaData.baseTier < 50) {
                arenaData.baseTier += 1;
            }
        }
        arenaData.lastCheckedDate = today;
        saveData();
    }
}

// ===== 画布与渲染系统 =====
function resizeCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
}

function renderLoop() {
    // 画布清理（带有拖影效果）- 使用淡蓝色背景，不刺眼
    ctx.fillStyle = 'rgba(219, 234, 254, 0.4)';
    ctx.fillRect(0, 0, w, h);
    
    // 如果是游戏状态，更新物理
    if (gameState === 'playing') {
        updatePhysics();
        
        // 处理死掉的陀螺 - 先启动飞出动画，再移除
        for (let i = topsOnBoard.length - 1; i >= 0; i--) {
            if (topsOnBoard[i].hp <= 0 && !topsOnBoard[i].isDying) {
                let deadTop = topsOnBoard[i];
                deadTop.isDying = true; // 标记为正在死亡动画中
                deadTop.deathTime = Date.now();

                // 如果是神龙陀螺主陀螺死亡，清除所有分身
                if (deadTop.isSpecial && deadTop.specialId === 'dragonGod') {
                    if (deadTop.dragonState && !deadTop.dragonState.isClone) {
                        clearDragonClones(deadTop);
                    }
                }
                
                // 计算飞出方向 - 随机角度，主要向屏幕边缘飞
                const centerX = w / 2;
                const centerY = h / 2;
                const dx = deadTop.x - centerX;
                const dy = deadTop.y - centerY;
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5; // 稍微随机偏移
                
                // 设置飞出速度 - 快速飞出
                const flySpeed = 15 + Math.random() * 10;
                deadTop.vx = Math.cos(angle) * flySpeed;
                deadTop.vy = Math.sin(angle) * flySpeed;
                deadTop.rSpeed = (Math.random() - 0.5) * 1.5; // 快速旋转
                
                createParticles(deadTop.x, deadTop.y, deadTop.color);
                createParticles(deadTop.x, deadTop.y, '#ffffff');
                createParticles(deadTop.x, deadTop.y, '#ff0000');
                triggerShake(); // 只有机甲爆破了才震动半秒
                
                // 添加玻璃裂纹效果
                addGlassCrack();
            }
        }
        
        // 移除已经飞出屏幕的死亡陀螺
        for (let i = topsOnBoard.length - 1; i >= 0; i--) {
            let top = topsOnBoard[i];
            if (top.isDying) {
                // 检查是否已飞出屏幕（留一些边距）
                const margin = 100;
                if (top.x < -margin || top.x > w + margin || 
                    top.y < -margin || top.y > h + margin) {
                    topsOnBoard.splice(i, 1);
                }
            }
        }
        
        // 胜负判定引擎
        let enemiesCount = topsOnBoard.filter(t => t.isEnemy).length;
        let playersCount = topsOnBoard.filter(t => !t.isEnemy).length;
        
        if (enemiesCount === 0) {
            if (matchTimeoutId) clearTimeout(matchTimeoutId);
            endMatch(true); // 斩草除根，赢
        } else if (playersCount === 0) {
            if (matchTimeoutId) clearTimeout(matchTimeoutId);
            endMatch(false); // 全军覆没，输
        }
    } else if (gameState === 'setup') {
        // === 极其致命与丝滑的更新：备战区全自动雷达级吸附对齐系统 ===
        // 在这之前由于浏览器渲染或者页面 Transition，getBoundingClientRect 获取到了宽度或坐标为0！
        // 彻底丢弃静态计算，改为引擎级实时逐帧拉取真正的物理排布，并伴随缓动动画
        topsOnBoard.forEach(t => {
            if (!t.isEnemy && t.gridR >= 0 && t.gridC >= 0) {
                let cell = document.querySelector(`.grid-cell[data-r="${t.gridR}"][data-c="${t.gridC}"]`);
                if (cell) {
                    let rect = cell.getBoundingClientRect();
                    // 仅当 DOM 有有效实体且被真正渲染时，更新其锚点坐标
                    if (rect.width > 0 && rect.height > 0) {
                        let targetX = rect.left + rect.width / 2;
                        let targetY = rect.top + rect.height / 2;
                        
                        // 初次登场光速部署，后续平滑过渡（例如浏览器拉升或动画过程）
                        if (t.x === 0 && t.y === 0) {
                            t.x = targetX;
                            t.y = targetY;
                        } else {
                            t.x += (targetX - t.x) * 0.25; 
                            t.y += (targetY - t.y) * 0.25;
                        }
                    }
                }
            }
        });
        
        // --- 敌军战阵怠速呼吸动画 ---
        topsOnBoard.forEach(t => {
            if (t.isEnemy) {
                t.angle += 0.05; // 仅自转光环
            } else {
                t.angle += 0.05;
            }
        });
    }

    // 渲染激光和声波效果
    renderSpecialAttacks();

    // 更新和渲染神龙陀螺攻击效果（声波、喷火、喷水）
    if (gameState === 'playing') {
        renderDragonGodAttacks();
    }

    // 更新和渲染龙卷风
    if (gameState === 'playing') {
        updateAndRenderTornadoes();
    }

    // 渲染玻璃破裂效果
    renderGlassCracks();

    // 渲染粒子与主光影实体
    renderParticles();
    renderFloatingTexts();
    renderTops();
    
    animFrame = requestAnimationFrame(renderLoop);
}

// ===== 渲染玻璃裂纹效果 =====
function renderGlassCracks() {
    if (glassCrackState.crackCount === 0 && !glassCrackState.isShattered) return;
    
    ctx.save();
    
    // 如果已彻底碎裂，显示碎裂动画
    if (glassCrackState.isShattered) {
        const elapsed = Date.now() - glassCrackState.shatterTime;
        const progress = Math.min(elapsed / 1000, 1); // 1秒动画
        
        // 碎裂效果 - 整个屏幕玻璃破碎
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
        ctx.lineWidth = 2;
        ctx.fillStyle = `rgba(200, 220, 255, ${0.3 * (1 - progress)})`;
        ctx.fillRect(0, 0, w, h);
        
        // 绘制大量裂纹
        for (let i = 0; i < 20; i++) {
            const startX = Math.random() * w;
            const startY = Math.random() * h;
            const angle = Math.random() * Math.PI * 2;
            const length = 100 + Math.random() * 200;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        // 动画结束后保持碎裂状态（不再重置，每局只碎裂一次）
        
        ctx.restore();
        return;
    }
    
    // 绘制累积的裂纹 - 使用深色裂纹，更容易看清
    ctx.strokeStyle = 'rgba(30, 50, 80, 0.9)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(100, 150, 200, 0.5)';
    
    glassCrackState.cracks.forEach(crack => {
        ctx.beginPath();
        ctx.moveTo(crack.startX, crack.startY);
        
        // 绘制裂纹路径（带分支）
        let currentX = crack.startX;
        let currentY = crack.startY;
        const segments = 5;
        
        for (let i = 0; i < segments; i++) {
            const angle = crack.angle + (Math.random() - 0.5) * 0.5;
            const length = crack.length / segments;
            currentX += Math.cos(angle) * length;
            currentY += Math.sin(angle) * length;
            ctx.lineTo(currentX, currentY);
            
            // 小分支
            if (Math.random() > 0.5) {
                ctx.moveTo(currentX, currentY);
                ctx.lineTo(
                    currentX + Math.cos(angle + 0.8) * length * 0.5,
                    currentY + Math.sin(angle + 0.8) * length * 0.5
                );
            }
        }
        ctx.stroke();
    });
    
    // 显示剩余次数指示器
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`玻璃: ${glassCrackState.maxCracks - glassCrackState.crackCount}/${glassCrackState.maxCracks}`, w - 20, 30);
    
    ctx.restore();
}

// ===== 添加玻璃裂纹 =====
function addGlassCrack() {
    // 如果已经彻底碎裂，不再增加裂纹
    if (glassCrackState.isShattered) return;
    
    glassCrackState.crackCount++;
    
    // 生成新的裂纹
    const crack = {
        startX: Math.random() * w,
        startY: Math.random() * h,
        angle: Math.random() * Math.PI * 2,
        length: 100 + Math.random() * 150
    };
    glassCrackState.cracks.push(crack);
    
    // 检查是否达到最大裂纹次数 - 达到后触发碎裂动画，但不再重置
    if (glassCrackState.crackCount >= glassCrackState.maxCracks) {
        glassCrackState.isShattered = true;
        glassCrackState.shatterTime = Date.now();
    }
}

// ===== 渲染特殊陀螺攻击效果（激光和声波）=====
function renderSpecialAttacks() {
    // 只有在比赛进行中才渲染攻击效果
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    
    topsOnBoard.forEach(top => {
        if (!top.isSpecial || top.specialId !== 'huluwa2') return;
        
        const specialTop = SPECIAL_TOPS.find(st => st.id === 'huluwa2');
        if (!specialTop) return;
        
        // 计算当前攻击阶段
        if (!top.attackPhase) {
            top.attackPhase = 'laser';
            top.attackStartTime = now;
            // 初始化激光参数
            top.laserAngle = Math.random() * Math.PI * 2;
            top.laserDistance = 0;
        }
        
        const timeSincePhaseStart = now - top.attackStartTime;
        const attackProgress = timeSincePhaseStart / specialTop.attackInterval;
        
        // 检查是否需要切换攻击阶段
        if (attackProgress >= 1) {
            // 切换攻击阶段
            if (top.attackPhase === 'laser') {
                top.attackPhase = 'sonic';
                // 初始化声波参数
                top.sonicRadius = 0;
            } else {
                top.attackPhase = 'laser';
                // 初始化激光参数
                top.laserAngle = Math.random() * Math.PI * 2;
                top.laserDistance = 0;
            }
            top.attackStartTime = now;
        }
        
        if (top.attackPhase === 'laser') {
            // 激光阶段 - 发射射线
            renderLaserBeam(top);
        } else if (top.attackPhase === 'sonic') {
            // 声波阶段 - 扩散圆环
            renderSonicWave(top);
        }
    });
}

// 渲染激光射线（带伤害检测）
function renderLaserBeam(top) {
    const specialTop = SPECIAL_TOPS.find(st => st.id === 'huluwa2');
    if (!specialTop) return;
    
    // 激光移动速度
    const laserSpeed = 10; // 每帧移动10像素
    
    // 计算激光当前位置（从陀螺中心向外移动）
    top.laserDistance += laserSpeed;
    
    // 激光线段长度
    const laserLength = 80;
    
    // 激光起点（已经移动出去的距离）
    const startX = top.x + Math.cos(top.laserAngle) * top.laserDistance;
    const startY = top.y + Math.sin(top.laserAngle) * top.laserDistance;
    
    // 激光终点
    const endX = startX + Math.cos(top.laserAngle) * laserLength;
    const endY = startY + Math.sin(top.laserAngle) * laserLength;
    
    // 检查激光是否完全移出画布（使用canvas的宽高）
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const margin = 200; // 额外边距确保完全离开视野
    
    if (startX < -margin || startX > canvasWidth + margin || 
        startY < -margin || startY > canvasHeight + margin) {
        // 激光已完全移出屏幕，不再渲染
        return;
    }
    
    // ===== 激光伤害检测 =====
    // 每5帧检测一次伤害（避免过于频繁）
    if (!top.lastDamageFrame) top.lastDamageFrame = 0;
    top.lastDamageFrame++;
    
    if (top.lastDamageFrame >= 5) {
        top.lastDamageFrame = 0;
        
        topsOnBoard.forEach(enemy => {
            if (enemy.isEnemy === top.isEnemy) return; // 跳过同阵营
            
            // 计算敌方陀螺到激光线段的距离
            const dist = pointToLineDistance(enemy.x, enemy.y, startX, startY, endX, endY);
            
            // 激光宽度约8像素，加上敌方陀螺半径
            if (dist < enemy.radius + 4) {
                enemy.hp -= specialTop.laserDamage;
                createParticles(enemy.x, enemy.y, '#ef4444'); // 红色粒子效果
            }
        });
    }
    
    // 激光渐变效果
    const laserGrad = ctx.createLinearGradient(startX, startY, endX, endY);
    laserGrad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
    laserGrad.addColorStop(0.5, 'rgba(239, 68, 68, 1)');
    laserGrad.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
    
    // 激光外发光
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ef4444';
    
    // 激光主体
    ctx.strokeStyle = laserGrad;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // 激光核心（更亮）
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}

// 渲染声波圆环（带伤害检测）
function renderSonicWave(top) {
    const specialTop = SPECIAL_TOPS.find(st => st.id === 'huluwa2');
    if (!specialTop) return;
    
    // 扩散速度
    const expandSpeed = 8; // 每帧增加8像素
    top.sonicRadius += expandSpeed;
    
    // 使用canvas尺寸作为边界判断
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // 计算从陀螺到画布角落的最大距离
    const maxDist1 = Math.sqrt(top.x * top.x + top.y * top.y);
    const maxDist2 = Math.sqrt((canvasWidth - top.x) * (canvasWidth - top.x) + top.y * top.y);
    const maxDist3 = Math.sqrt(top.x * top.x + (canvasHeight - top.y) * (canvasHeight - top.y));
    const maxDist4 = Math.sqrt((canvasWidth - top.x) * (canvasWidth - top.x) + (canvasHeight - top.y) * (canvasHeight - top.y));
    const maxScreenRadius = Math.max(maxDist1, maxDist2, maxDist3, maxDist4) + 100;
    
    // 如果圆环已经扩散到屏幕外，不再渲染
    if (top.sonicRadius > maxScreenRadius) {
        return;
    }
    
    // ===== 声波伤害检测 =====
    // 声波是扩散的圆环，只有圆环边缘接触敌人时造成伤害
    // 每3帧检测一次伤害
    if (!top.lastSonicDamageFrame) top.lastSonicDamageFrame = 0;
    top.lastSonicDamageFrame++;
    
    if (top.lastSonicDamageFrame >= 3) {
        top.lastSonicDamageFrame = 0;
        
        topsOnBoard.forEach(enemy => {
            if (enemy.isEnemy === top.isEnemy) return; // 跳过同阵营
            
            const dx = enemy.x - top.x;
            const dy = enemy.y - top.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 声波圆环宽度约10像素，检测圆环边缘是否接触敌人
            const ringWidth = 10;
            if (Math.abs(dist - top.sonicRadius) < enemy.radius + ringWidth / 2) {
                enemy.hp -= specialTop.sonicDamage;
                createParticles(enemy.x, enemy.y, '#22c55e'); // 绿色粒子效果
            }
        });
    }
    
    // 声波透明度随扩散逐渐降低
    const alpha = Math.max(0, 1 - (top.sonicRadius / maxScreenRadius));
    
    // 外圈
    ctx.strokeStyle = `rgba(34, 197, 94, ${alpha * 0.8})`;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#22c55e';
    ctx.beginPath();
    ctx.arc(top.x, top.y, top.sonicRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内圈（更亮）
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(top.x, top.y, top.sonicRadius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}

// ===== 获取动态质量（特殊陀螺会随大小变化）=====
function getDynamicMass(top) {
    if (!top.isSpecial || top.specialId !== 'huluwa1') {
        return top.mass;
    }
    
    const specialTop = SPECIAL_TOPS.find(st => st.id === 'huluwa1');
    if (!specialTop) return top.mass;
    
    // 根据当前大小计算质量
    const time = Date.now() * 0.001;
    const sizeMultiplier = specialTop.minSize + (specialTop.maxSize - specialTop.minSize) * 
                          (0.5 + 0.5 * Math.sin(time));
    
    // 质量随大小线性增加
    return top.mass * sizeMultiplier;
}

// ===== 处理特殊陀螺攻击（二娃的激光和声波）=====
// 注意：伤害检测现在在 renderSpecialAttacks 中同步进行
function processSpecialTopAttacks() {
    // 伤害检测已合并到渲染函数中，确保视觉和伤害同步
    // 这个函数保留用于兼容性
}

// ===== 渲染神龙陀螺攻击效果（声波、喷火、喷水）=====
function renderDragonGodAttacks() {
    const now = Date.now();

    topsOnBoard.forEach(top => {
        if (!top.isSpecial || top.specialId !== 'dragonGod') return;

        const specialTop = SPECIAL_TOPS.find(st => st.id === 'dragonGod');
        if (!specialTop) return;

        if (!top.dragonState) return;
        const state = top.dragonState;

        // 渲染声波效果
        if (top.sonicWaves && top.sonicWaves.length > 0) {
            for (let i = top.sonicWaves.length - 1; i >= 0; i--) {
                const wave = top.sonicWaves[i];
                const age = now - wave.spawnTime;
                const duration = 1000; // 声波持续1秒

                if (age > duration) {
                    top.sonicWaves.splice(i, 1);
                    continue;
                }

                const progress = age / duration;
                const radius = wave.radius + (wave.maxRadius - wave.radius) * progress;
                const alpha = 1 - progress;

                ctx.save();
                ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.8})`;
                ctx.lineWidth = 4;
                ctx.setLineDash([10, 5]);
                ctx.beginPath();
                ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
                ctx.stroke();

                // 内圈
                ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.4})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(wave.x, wave.y, radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // 声波伤害检测
                topsOnBoard.forEach(enemy => {
                    if (enemy.isEnemy === top.isEnemy) return;
                    if (enemy.hp <= 0 || enemy.isDying) return;

                    const dx = enemy.x - wave.x;
                    const dy = enemy.y - wave.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // 声波圆环边缘伤害检测
                    if (Math.abs(dist - radius) < 15) {
                        if (!enemy.sonicHitTime || now - enemy.sonicHitTime > 500) {
                            enemy.hp -= specialTop.sonicDamage || 1;
                            enemy.sonicHitTime = now;
                            createFloatingText(enemy.x, enemy.y - enemy.radius - 5, '-1', '#fbbf24');
                        }
                    }
                });
            }
        }

        // 渲染喷火效果（从神龙到目标的方向）
        if (state.lastFireTime && now - state.lastFireTime < 500) {
            const fireProgress = (now - state.lastFireTime) / 500;

            // 寻找最近的敌方陀螺作为喷火目标
            let target = null;
            let closestDist = specialTop.fireRange;

            topsOnBoard.forEach(enemy => {
                if (enemy.isEnemy === top.isEnemy) return;
                if (enemy.hp <= 0 || enemy.isDying) return;

                const dx = enemy.x - top.x;
                const dy = enemy.y - top.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= closestDist) {
                    closestDist = dist;
                    target = enemy;
                }
            });

            if (target) {
                const angle = Math.atan2(target.y - top.y, target.x - top.x);

                ctx.save();
                ctx.translate(top.x, top.y);
                ctx.rotate(angle);

                // 火焰喷射效果
                for (let i = 0; i < 8; i++) {
                    const flameLength = closestDist * (0.5 + Math.random() * 0.5);
                    const flameWidth = 10 + Math.random() * 15;
                    const flameX = 30 + i * (flameLength / 8);

                    const grad = ctx.createRadialGradient(flameX, 0, 0, flameX, 0, flameWidth);
                    grad.addColorStop(0, `rgba(255, 200, 50, ${1 - fireProgress})`);
                    grad.addColorStop(0.5, `rgba(255, 100, 0, ${0.8 - fireProgress * 0.5})`);
                    grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.ellipse(flameX, 0, flameWidth, flameWidth * 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        // 渲染喷水效果
        if (state.lastWaterTime && now - state.lastWaterTime < 600) {
            const waterProgress = (now - state.lastWaterTime) / 600;

            // 寻找最近的敌方陀螺作为喷水目标
            let target = null;
            let closestDist = specialTop.waterRange;

            topsOnBoard.forEach(enemy => {
                if (enemy.isEnemy === top.isEnemy) return;
                if (enemy.hp <= 0 || enemy.isDying) return;

                const dx = enemy.x - top.x;
                const dy = enemy.y - top.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= closestDist) {
                    closestDist = dist;
                    target = enemy;
                }
            });

            if (target) {
                const angle = Math.atan2(target.y - top.y, target.x - top.x);

                ctx.save();
                ctx.translate(top.x, top.y);
                ctx.rotate(angle);

                // 水流喷射效果
                for (let i = 0; i < 12; i++) {
                    const waterLength = closestDist;
                    const waterX = 25 + i * (waterLength / 12);
                    const waterY = (Math.random() - 0.5) * 20 * (1 - waterProgress);
                    const size = 8 + Math.random() * 6;

                    ctx.fillStyle = `rgba(59, 130, 246, ${0.8 - waterProgress * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(waterX, waterY, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    });
}

// 处理蝎子陀螺的钩子逻辑
function processScorpionHooks() {
    if (gameState !== 'playing') return;

    const now = Date.now();

    // 遍历所有陀螺，找到蝎子陀螺
    topsOnBoard.forEach(scorpion => {
        if (!scorpion.isSpecial) return;

        const specialTop = SPECIAL_TOPS.find(st => st.id === scorpion.specialId);
        if (!specialTop || specialTop.ability !== 'hook') return;

        // 初始化钩子状态
        if (!scorpion.hookState) {
            scorpion.hookState = {
                hookedTarget: null,
                hookStartTime: 0,
                lastDamageTime: 0
            };
        }

        const hookState = scorpion.hookState;

        // 检查当前钩住的目标是否还存在（被消灭或飞出屏幕）
        if (hookState.hookedTarget) {
            const target = hookState.hookedTarget;
            const targetIndex = topsOnBoard.indexOf(target);

            // 如果目标已被消灭，清空钩子
            if (targetIndex === -1 || target.hp <= 0 || target.isDying) {
                hookState.hookedTarget = null;
                hookState.hookStartTime = 0;
            }
        }

        // 如果没有钩住目标，寻找范围内的敌人
        if (!hookState.hookedTarget) {
            let closestEnemy = null;
            let closestDist = Infinity;

            topsOnBoard.forEach(enemy => {
                // 只钩敌方陀螺
                if (enemy.isEnemy === scorpion.isEnemy) return;
                if (enemy.hp <= 0 || enemy.isDying) return;

                const dx = enemy.x - scorpion.x;
                const dy = enemy.y - scorpion.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // 在攻击范围内且最近的敌人
                if (dist <= specialTop.hookRange && dist < closestDist) {
                    closestDist = dist;
                    closestEnemy = enemy;
                }
            });

            // 钩住最近的敌人
            if (closestEnemy) {
                hookState.hookedTarget = closestEnemy;
                hookState.hookStartTime = now;
                hookState.lastDamageTime = now;
            }
        }

        // 处理被钩住的陀螺
        if (hookState.hookedTarget) {
            const target = hookState.hookedTarget;

            // 被钩住的陀螺跟随蝎子陀螺移动
            // 计算目标位置（在蝎子后方一定距离）
            const hookDistance = scorpion.radius + target.radius + 10;
            const angle = Math.atan2(scorpion.vy, scorpion.vx);

            // 目标位置在蝎子的反方向（被拖着走）
            const targetX = scorpion.x - Math.cos(angle) * hookDistance;
            const targetY = scorpion.y - Math.sin(angle) * hookDistance;

            // 平滑移动到目标位置
            const pullSpeed = specialTop.hookPullSpeed || 0.3;
            target.x += (targetX - target.x) * pullSpeed;
            target.y += (targetY - target.y) * pullSpeed;

            // 被钩住的陀螺速度跟随蝎子（减弱版）
            target.vx = scorpion.vx * 0.5;
            target.vy = scorpion.vy * 0.5;

            // 持续失血（每秒一次伤害）
            if (now - hookState.lastDamageTime >= 1000) {
                target.hp -= specialTop.hookDamage;
                hookState.lastDamageTime = now;

                // 显示伤害数字
                createFloatingText(target.x, target.y - target.radius, `-${specialTop.hookDamage}`, '#dc2626');

                // 创建粒子效果
                createParticles(target.x, target.y, '#dc2626', 3);

                // 检查是否被消灭
                if (target.hp <= 0) {
                    hookState.hookedTarget = null;
                    hookState.hookStartTime = 0;
                }
            }
        }
    });
}

// 计算点到线段的距离
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

// 创建激光视觉效果
function createLaserEffect(x1, y1, x2, y2) {
    // 激光效果已经在 renderHuluwa2 中绘制
    // 这里可以添加额外的粒子效果
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    createParticles(midX, midY, 'rgba(239, 68, 68, 0.5)');
}

// 创建声波视觉效果
function createSonicEffect(x, y, range) {
    // 创建环形粒子效果
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const px = x + Math.cos(angle) * range * 0.8;
        const py = y + Math.sin(angle) * range * 0.8;
        createParticles(px, py, 'rgba(34, 197, 94, 0.5)');
    }
}

// ===== 特殊陀螺伤害加成计算 =====
function getSpecialDamageBonus(top, baseDamage) {
    if (!top.isSpecial || top.specialId !== 'huluwa1') {
        return baseDamage;
    }
    
    const specialTop = SPECIAL_TOPS.find(st => st.id === 'huluwa1');
    if (!specialTop) return baseDamage;
    
    // 根据当前大小计算伤害加成
    const time = Date.now() * 0.001;
    const sizeMultiplier = specialTop.minSize + (specialTop.maxSize - specialTop.minSize) * 
                          (0.5 + 0.5 * Math.sin(time));
    
    // 越大伤害越高，最大时伤害3倍
    const damageBonus = 1 + (sizeMultiplier - specialTop.minSize) / 
                      (specialTop.maxSize - specialTop.minSize) * 
                      (specialTop.damageBonus - 1);
    
    return baseDamage * damageBonus;
}

// ===== 防护罩伤害减免 =====
function applyShieldDamage(top, incomingDamage) {
    // 检查是否是三娃陀螺或神龙陀螺
    if (!top.isSpecial || (top.specialId !== 'huluwa3' && top.specialId !== 'dragonGod')) {
        return { actualDamage: incomingDamage, shieldHit: false };
    }

    const specialTop = SPECIAL_TOPS.find(st => st.id === top.specialId);
    if (!specialTop) return { actualDamage: incomingDamage, shieldHit: false };

    // 三娃陀螺护盾处理
    if (top.specialId === 'huluwa3') {
        // 初始化防护罩状态
        if (top.shieldHits === undefined) {
            top.shieldHits = 0;
        }

        // 检查防护罩是否还存在
        if (top.shieldHits >= specialTop.shieldMaxHits) {
            return { actualDamage: incomingDamage, shieldHit: false };
        }

        // 防护罩抵挡伤害
        top.shieldHits++;

        // 创建防护罩受击特效
        createShieldHitEffect(top.x, top.y);

        // 防护罩完全抵挡伤害
        return { actualDamage: 0, shieldHit: true };
    }

    // 神龙陀螺护盾处理
    if (top.specialId === 'dragonGod') {
        // 初始化神龙状态
        if (!top.dragonState) {
            top.dragonState = {
                shieldHits: 0,
                shieldBroken: false,
                summoned: false
            };
        }

        const state = top.dragonState;

        // 检查是否是分身（分身没有护盾）
        if (state.isClone) {
            return { actualDamage: incomingDamage, shieldHit: false };
        }

        // 检查护盾是否已破碎
        if (state.shieldBroken) {
            return { actualDamage: incomingDamage, shieldHit: false };
        }

        // 护盾抵挡伤害
        state.shieldHits++;

        // 创建护盾受击特效
        createShieldHitEffect(top.x, top.y);

        // 检查护盾是否破碎
        if (state.shieldHits >= specialTop.shieldMaxHits) {
            state.shieldBroken = true;
            // 护盾破碎，召唤9个LV10普通陀螺
            if (!state.summoned) {
                summonDragonTroops(top, specialTop);
                state.summoned = true;
            }
        }

        // 护盾完全抵挡伤害
        return { actualDamage: 0, shieldHit: true };
    }

    return { actualDamage: incomingDamage, shieldHit: false };
}

// 清除神龙陀螺的所有分身
function clearDragonClones(parentTop) {
    let clearedCount = 0;

    for (let i = topsOnBoard.length - 1; i >= 0; i--) {
        const top = topsOnBoard[i];
        if (top.isSpecial && top.specialId === 'dragonGod' && top.dragonState) {
            // 检查是否是该主陀螺的分身
            if (top.dragonState.isClone && top.dragonState.cloneParent === parentTop) {
                // 标记分身也死亡
                top.hp = 0;
                top.isDying = true;
                top.deathTime = Date.now();

                // 设置飞出速度
                const angle = Math.random() * Math.PI * 2;
                const flySpeed = 10 + Math.random() * 8;
                top.vx = Math.cos(angle) * flySpeed;
                top.vy = Math.sin(angle) * flySpeed;
                top.rSpeed = (Math.random() - 0.5) * 1.5;

                clearedCount++;
            }
        }
    }

    if (clearedCount > 0) {
        createFloatingText(parentTop.x, parentTop.y - parentTop.radius - 40, `分身消散!`, '#ef4444');
        for (let i = 0; i < 10; i++) {
            createParticles(parentTop.x, parentTop.y, '#fbbf24', 4);
        }
    }
}

// 处理神龙陀螺分身逻辑
function processDragonGodClone(top) {
    // 检查是否是神龙陀螺
    if (!top.isSpecial || top.specialId !== 'dragonGod') return;

    const specialTop = SPECIAL_TOPS.find(st => st.id === 'dragonGod');
    if (!specialTop) return;

    // 初始化神龙状态
    if (!top.dragonState) {
        top.dragonState = {
            shieldHits: 0,
            shieldBroken: false,
            summoned: false,
            isClone: false,
            cloneParent: null,
            hasCloned: false
        };
    }

    const state = top.dragonState;

    // 只有主陀螺可以分身，分身不能再分身
    if (state.isClone) return;
    if (state.hasCloned) return;

    // 创建4个分身
    state.hasCloned = true;
    createDragonClones(top, specialTop);
}

// 创建神龙陀螺分身
function createDragonClones(parentTop, specialTop) {
    const cloneCount = specialTop.cloneCount || 4;
    const cloneTier = specialTop.cloneTier || 10;

    // 显示分身效果
    createFloatingText(parentTop.x, parentTop.y - parentTop.radius - 20, '神龙分身!', '#fbbf24');
    for (let i = 0; i < 15; i++) {
        createParticles(parentTop.x, parentTop.y, '#fbbf24', 4);
    }

    // 创建4个分身
    for (let i = 0; i < cloneCount; i++) {
        const angle = (i * Math.PI * 2 / cloneCount);
        const distance = 60;
        const spawnX = parentTop.x + Math.cos(angle) * distance;
        const spawnY = parentTop.y + Math.sin(angle) * distance;

        // 确保在画布范围内
        const finalX = Math.max(50, Math.min(w - 50, spawnX));
        const finalY = Math.max(50, Math.min(h - 50, spawnY));

        const cloneTop = {
            typeId: parentTop.typeId,
            isEnemy: parentTop.isEnemy,
            tier: cloneTier,  // 分身等级为10
            name: specialTop.name + '(分身)',
            x: finalX,
            y: finalY,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            rSpeed: (Math.random() - 0.5) * 0.3,
            angle: Math.random() * Math.PI * 2,
            radius: 35,
            mass: 10 + cloneTier * 2,  // LV10的质量
            color: specialTop.color,
            hp: 50,  // LV10的血量
            isSpecial: true,
            specialId: 'dragonGod',
            dragonState: {
                shieldHits: 0,
                shieldBroken: true,  // 分身没有护盾
                summoned: true,
                isClone: true,       // 标记为分身
                cloneParent: parentTop,  // 记录主陀螺
                hasCloned: true      // 分身不能再分身
            }
        };

        topsOnBoard.push(cloneTop);
    }
}

// 神龙陀螺召唤9个普通陀螺
function summonDragonTroops(dragonTop, specialTop) {
    const summonCount = specialTop.summonCount || 9;
    const summonTier = specialTop.summonTier || 10;
    const typeObj = TOP_TYPES.find(t => t.tier === summonTier);

    if (!typeObj) return;

    // 在神龙陀螺周围召唤9个陀螺
    for (let i = 0; i < summonCount; i++) {
        const angle = (i * Math.PI * 2 / summonCount);
        const distance = 80 + Math.random() * 40;
        const spawnX = dragonTop.x + Math.cos(angle) * distance;
        const spawnY = dragonTop.y + Math.sin(angle) * distance;

        // 确保在画布范围内
        const finalX = Math.max(50, Math.min(w - 50, spawnX));
        const finalY = Math.max(50, Math.min(h - 50, spawnY));

        topsOnBoard.push({
            typeId: typeObj.id,
            isEnemy: dragonTop.isEnemy,
            tier: typeObj.tier,
            name: typeObj.name,
            x: finalX,
            y: finalY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            rSpeed: (Math.random() - 0.5) * 0.2,
            angle: Math.random() * Math.PI * 2,
            radius: 35,
            mass: 10 + typeObj.tier * 2,
            color: typeObj.color,
            hp: typeObj.hp,
            isSummoned: true,  // 标记为召唤的陀螺
            summonOwner: dragonTop  // 记录召唤者
        });
    }

    // 显示召唤效果
    createFloatingText(dragonTop.x, dragonTop.y - dragonTop.radius - 30, '召唤9个援军!', '#fbbf24');
    for (let i = 0; i < 20; i++) {
        createParticles(dragonTop.x, dragonTop.y, '#fbbf24', 5);
    }
}

// 防护罩受击特效
function createShieldHitEffect(x, y) {
    // 创建金色火花粒子
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
        const speed = 2 + Math.random() * 3;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30,
            color: '#fbbf24',
            size: 3 + Math.random() * 2
        });
    }
}

// ===== 战场上特殊陀螺渲染 =====
function renderSpecialTopOnBoard(top, cx, cy, r) {
    const specialTop = SPECIAL_TOPS.find(st => st.id === top.specialId);
    if (!specialTop) return;
    
    // 根据陀螺类型选择不同的渲染方式
    if (specialTop.id === 'huluwa1') {
        renderHuluwa1(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'huluwa2') {
        renderHuluwa2(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'huluwa3') {
        renderHuluwa3(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'huluwa4') {
        renderHuluwa4(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'huluwa5') {
        renderHuluwa5(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'huluwa6') {
        renderHuluwa6(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'snakeSpirit') {
        renderSnakeSpirit(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'scorpion') {
        renderScorpion(top, cx, cy, r, specialTop);
    } else if (specialTop.id === 'dragonGod') {
        renderDragonGod(top, cx, cy, r, specialTop);
    }
}

// 大娃陀螺渲染
function renderHuluwa1(top, cx, cy, r, specialTop) {
    ctx.save();
    ctx.translate(cx, cy);
    
    const hRatio = 0.55;
    const color = specialTop.color;
    
    // 特殊能力：大小变化动画
    let sizeMultiplier = 1;
    if (specialTop.ability === 'sizeChange') {
        // 根据时间周期性变化大小
        const time = Date.now() * 0.001;
        sizeMultiplier = specialTop.minSize + (specialTop.maxSize - specialTop.minSize) * 
                        (0.5 + 0.5 * Math.sin(time));
        r *= sizeMultiplier;
    }
    
    // 特殊光效 - 葫芦娃大娃的红色光环
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    
    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 特殊陀螺独特的葫芦形状设计
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));
    
    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦上部小圆
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.4);
    
    // 葫芦顶部
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 装饰叶子
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(r * 0.15, -r * 0.75, r * 0.2, r * 0.08, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 旋转的光环效果
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 2);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 特殊标记 - 大娃表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👶', 0, -r * 0.1);
    
    ctx.restore();
    
    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 二娃陀螺渲染
function renderHuluwa2(top, cx, cy, r, specialTop) {
    ctx.save();
    ctx.translate(cx, cy);
    
    const hRatio = 0.55;
    const color = specialTop.color;
    
    // 特殊光效 - 二娃的橙色光环
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    
    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 二娃陀螺外形 - 更流线型，有科技感
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));
    
    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦上部小圆（更扁平）
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.65, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.35, -r * 0.25, r * 0.7, r * 0.5);
    
    // 葫芦顶部 - 眼睛位置
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.6, r * 0.3, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 装饰耳朵（顺风耳）
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(-r * 0.7, -r * 0.3, r * 0.15, r * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.7, -r * 0.3, r * 0.15, r * 0.25, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 旋转的光环效果 - 声波环
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 3);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';  // 绿色声波
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 特殊标记 - 二娃表情（千里眼）
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👀', 0, -r * 0.1);
    
    ctx.restore();
    
    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 三娃陀螺渲染
function renderHuluwa3(top, cx, cy, r, specialTop) {
    ctx.save();
    ctx.translate(cx, cy);
    
    const hRatio = 0.55;
    const color = specialTop.color;
    
    // 初始化防护罩状态
    if (top.shieldHits === undefined) {
        top.shieldHits = 0;
    }
    
    // 特殊光效 - 三娃的金色光环
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    
    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // ===== 防护罩渲染 =====
    if (top.shieldHits < specialTop.shieldMaxHits) {
        const shieldRadius = specialTop.shieldRadius || 45;
        const shieldOpacity = 0.6 - (top.shieldHits * 0.1); // 每次碰撞后透明度降低
        
        // 防护罩外圈 - 金色光晕
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#fbbf24';
        ctx.strokeStyle = `rgba(251, 191, 36, ${shieldOpacity})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 防护罩内圈 - 半透明金色填充
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(251, 191, 36, ${shieldOpacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 防护罩裂纹效果
        if (top.shieldHits > 0) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - top.shieldHits * 0.15})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // 根据碰撞次数绘制裂纹
            for (let i = 0; i < top.shieldHits; i++) {
                const crackAngle = (Math.PI * 2 / specialTop.shieldMaxHits) * i + Math.PI / 6;
                const innerR = shieldRadius * 0.3;
                const outerR = shieldRadius * 0.9;
                
                // 主裂纹线
                ctx.moveTo(Math.cos(crackAngle) * innerR, Math.sin(crackAngle) * innerR);
                ctx.lineTo(Math.cos(crackAngle) * outerR, Math.sin(crackAngle) * outerR);
                
                // 分支裂纹
                const branchAngle1 = crackAngle + 0.3;
                const branchAngle2 = crackAngle - 0.3;
                ctx.moveTo(Math.cos(crackAngle) * outerR * 0.6, Math.sin(crackAngle) * outerR * 0.6);
                ctx.lineTo(Math.cos(branchAngle1) * outerR * 0.8, Math.sin(branchAngle1) * outerR * 0.8);
                ctx.moveTo(Math.cos(crackAngle) * outerR * 0.6, Math.sin(crackAngle) * outerR * 0.6);
                ctx.lineTo(Math.cos(branchAngle2) * outerR * 0.8, Math.sin(branchAngle2) * outerR * 0.8);
            }
            ctx.stroke();
        }
        
        // 防护罩剩余次数显示
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const remainingHits = specialTop.shieldMaxHits - top.shieldHits;
        ctx.fillText(`${remainingHits}`, shieldRadius + 10, -shieldRadius + 5);
    }
    
    // 三娃陀螺外形 - 更坚固的形状
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));
    
    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦上部小圆（更厚实）
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.4);
    
    // 葫芦顶部
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.68, r * 0.25, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 铜头铁臂装饰 - 金属质感环
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // 旋转的光环效果 - 铜色光环
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 2);
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 特殊标记 - 三娃表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡️', 0, -r * 0.1);
    
    ctx.restore();
    
    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 四娃陀螺渲染
function renderHuluwa4(top, cx, cy, r, specialTop) {
    ctx.save();
    ctx.translate(cx, cy);
    
    const hRatio = 0.55;
    const color = specialTop.color;
    
    // 特殊光效 - 四娃的绿色火焰光环
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ef4444';
    
    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 四娃陀螺外形 - 火焰葫芦形状
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));
    
    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦上部小圆
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.4);
    
    // 葫芦顶部 - 喷火口
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 火焰装饰环
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // 旋转的光环效果 - 火焰光环
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 特殊标记 - 四娃表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔥', 0, -r * 0.1);
    
    ctx.restore();

    // ===== 喷火效果渲染（在restore之后，使用绝对坐标）=====
    if (gameState === 'playing') {
        renderFireBreath(top, cx, cy, r, specialTop);
    }

    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 四娃喷火效果渲染
function renderFireBreath(top, cx, cy, r, specialTop) {
    const now = Date.now();

    // 初始化喷火状态
    if (!top.fireState) {
        top.fireState = {
            lastFireTime: 0,
            fireAngle: Math.random() * Math.PI * 2,
            isFiring: false,
            fireStartTime: 0
        };
    }

    // 检查是否应该喷火
    const timeSinceLastFire = now - top.fireState.lastFireTime;

    // 开始新的喷火周期
    if (!top.fireState.isFiring && timeSinceLastFire >= specialTop.fireInterval) {
        top.fireState.isFiring = true;
        top.fireState.fireStartTime = now;
        top.fireState.fireAngle = Math.random() * Math.PI * 2;
        top.fireState.lastFireTime = now;
    }

    // 计算喷火持续时间
    let fireDuration = 0;
    if (top.fireState.isFiring) {
        fireDuration = now - top.fireState.fireStartTime;
        if (fireDuration > specialTop.fireDuration) {
            top.fireState.isFiring = false;
            return;
        }
    }

    // 只有在喷火状态下才渲染和造成伤害
    if (!top.fireState.isFiring) return;

    const fireAngle = top.fireState.fireAngle;
    const fireRange = specialTop.fireRange;
    const fireSpread = specialTop.fireAngle / 2;

    // 火焰渐变 - 使用正确的坐标创建渐变
    const fireGrad = ctx.createRadialGradient(cx, cy, r, cx, cy, fireRange);
    fireGrad.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
    fireGrad.addColorStop(0.3, 'rgba(255, 100, 0, 0.6)');
    fireGrad.addColorStop(0.6, 'rgba(255, 50, 0, 0.3)');
    fireGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

    // 绘制扇形火焰区域
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, fireRange, fireAngle - fireSpread, fireAngle + fireSpread);
    ctx.closePath();
    ctx.fill();

    // 绘制火焰粒子效果
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        const pAngle = fireAngle + (Math.random() - 0.5) * specialTop.fireAngle;
        const pDist = r + Math.random() * fireRange * 0.8;
        const px = cx + Math.cos(pAngle) * pDist;
        const py = cy + Math.sin(pAngle) * pDist;
        const pSize = 4 + Math.random() * 8;

        ctx.fillStyle = `rgba(255, ${80 + Math.random() * 120}, 0, ${0.7 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // 检测火焰伤害（只在喷火期间造成伤害）
    applyFireDamage(top, cx, cy, fireAngle, specialTop);
}

// 四娃火焰伤害检测
function applyFireDamage(fireTop, fireX, fireY, fireAngle, specialTop) {
    const fireRange = specialTop.fireRange;
    const fireSpread = specialTop.fireAngle / 2;
    
    topsOnBoard.forEach(enemy => {
        // 跳过同阵营和已死亡的陀螺
        if (enemy.isEnemy === fireTop.isEnemy || enemy.hp <= 0) return;
        
        // 计算敌人相对于火焰中心的位置
        const dx = enemy.x - fireX;
        const dy = enemy.y - fireY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 检查是否在火焰范围内
        if (dist > fireRange) return;
        
        // 检查是否在火焰角度范围内
        const enemyAngle = Math.atan2(dy, dx);
        let angleDiff = Math.abs(enemyAngle - fireAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        if (angleDiff <= fireSpread) {
            // 敌人被火焰烧到，持续掉血
            if (!enemy.fireDamageTimer) {
                enemy.fireDamageTimer = 0;
            }

            // 标记为正在燃烧（一旦点燃就一直燃烧直到被消灭）
            enemy.isBurning = true;

            // 每10帧（约166ms）造成一次伤害
            enemy.fireDamageTimer++;
            if (enemy.fireDamageTimer >= 10) {
                enemy.hp -= specialTop.fireDamage;
                enemy.fireDamageTimer = 0;

                // 创建火焰粒子效果
                createParticles(enemy.x, enemy.y, '#ff4400');
            }
        }
    });
}

// 五娃陀螺渲染
function renderHuluwa5(top, cx, cy, r, specialTop) {
    ctx.save();
    ctx.translate(cx, cy);

    const hRatio = 0.55;
    const color = specialTop.color;

    // 特殊光效 - 五娃的蓝色水光环
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#3b82f6';

    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 五娃陀螺外形 - 水葫芦形状
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));

    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 葫芦上部小圆
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.4);

    // 葫芦顶部 - 喷水口
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 水波纹装饰环
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 旋转的光环效果 - 水波纹光环
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 特殊标记 - 五娃表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💧', 0, -r * 0.1);

    ctx.restore();

    // ===== 喷水效果渲染（在restore之后，使用绝对坐标）=====
    if (gameState === 'playing') {
        renderWaterBreath(top, cx, cy, r, specialTop);
    }

    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 五娃喷水效果渲染
function renderWaterBreath(top, cx, cy, r, specialTop) {
    const now = Date.now();

    // 初始化喷水状态
    if (!top.waterState) {
        top.waterState = {
            lastWaterTime: 0,
            waterAngle: Math.random() * Math.PI * 2,
            isWatering: false,
            waterStartTime: 0
        };
    }

    // 检查是否应该喷水
    const timeSinceLastWater = now - top.waterState.lastWaterTime;

    // 开始新的喷水周期
    if (!top.waterState.isWatering && timeSinceLastWater >= specialTop.waterInterval) {
        top.waterState.isWatering = true;
        top.waterState.waterStartTime = now;
        top.waterState.waterAngle = Math.random() * Math.PI * 2;
        top.waterState.lastWaterTime = now;
    }

    // 计算喷水持续时间
    let waterDuration = 0;
    if (top.waterState.isWatering) {
        waterDuration = now - top.waterState.waterStartTime;
        if (waterDuration > 500) {
            top.waterState.isWatering = false;
            return;
        }
    }

    // 只有在喷水状态下才渲染和造成伤害
    if (!top.waterState.isWatering) return;

    const waterAngle = top.waterState.waterAngle;
    const waterRange = specialTop.waterRange;
    const waterSpread = specialTop.waterAngle / 2;

    // 水柱渐变
    const waterGrad = ctx.createRadialGradient(cx, cy, r, cx, cy, waterRange);
    waterGrad.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
    waterGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.7)');
    waterGrad.addColorStop(0.6, 'rgba(30, 100, 200, 0.4)');
    waterGrad.addColorStop(1, 'rgba(0, 50, 150, 0)');

    // 绘制扇形水柱区域
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, waterRange, waterAngle - waterSpread, waterAngle + waterSpread);
    ctx.closePath();
    ctx.fill();

    // 绘制水波纹效果
    const waveCount = 3;
    for (let w = 0; w < waveCount; w++) {
        const waveRadius = r + (now % 1000) / 1000 * waterRange * 0.8 + w * 30;
        if (waveRadius < waterRange) {
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 - w * 0.15})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, waveRadius, waterAngle - waterSpread, waterAngle + waterSpread);
            ctx.stroke();
        }
    }

    // 绘制水滴粒子效果
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const pAngle = waterAngle + (Math.random() - 0.5) * specialTop.waterAngle;
        const pDist = r + Math.random() * waterRange * 0.9;
        const px = cx + Math.cos(pAngle) * pDist;
        const py = cy + Math.sin(pAngle) * pDist;
        const pSize = 3 + Math.random() * 5;

        ctx.fillStyle = `rgba(${150 + Math.random() * 100}, ${200 + Math.random() * 55}, 255, ${0.6 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // 检测水柱降级效果（只在水柱刚开始时触发一次）
    if (waterDuration < 100) { // 只在喷水前100ms内触发降级
        applyWaterDowngrade(top, cx, cy, waterAngle, specialTop);
    }
}

// 五娃水柱降级效果
function applyWaterDowngrade(waterTop, waterX, waterY, waterAngle, specialTop) {
    const waterRange = specialTop.waterRange;
    const waterSpread = specialTop.waterAngle / 2;

    topsOnBoard.forEach(enemy => {
        // 跳过同阵营和已死亡的陀螺
        if (enemy.isEnemy === waterTop.isEnemy || enemy.hp <= 0) return;

        // 计算敌人相对于水柱中心的位置
        const dx = enemy.x - waterX;
        const dy = enemy.y - waterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 检查是否在水柱范围内
        if (dist > waterRange) return;

        // 检查是否在水柱角度范围内
        const enemyAngle = Math.atan2(dy, dx);
        let angleDiff = Math.abs(enemyAngle - waterAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        if (angleDiff <= waterSpread) {
            // 敌人被水喷到，降低一级（只在当前比赛中有效）
            if (!enemy.hasBeenDowngraded) {
                enemy.hasBeenDowngraded = true;

                // 保存原始等级（用于比赛结束后恢复）
                if (enemy.originalTier === undefined) {
                    enemy.originalTier = enemy.tier;
                }

                // 降低一级（最低为1级）
                if (enemy.tier > 1) {
                    const oldTier = enemy.tier;
                    enemy.tier--;

                    // 重新获取新等级的陀螺类型
                    const newType = TOP_TYPES.find(t => t.tier === enemy.tier);
                    if (newType) {
                        enemy.typeId = newType.id;
                        enemy.name = newType.name;
                        enemy.hp = Math.min(enemy.hp, newType.hp); // HP不超过新等级上限
                        enemy.mass = 10 + enemy.tier * 2; // 更新质量
                        enemy.color = newType.color; // 更新颜色
                    }

                    // 更新半径 - 低等级陀螺更小
                    enemy.radius = 25 + enemy.tier * 1.5; // L1=26.5, L10=40, 逐渐变大

                    // 创建大量水特效粒子
                    for (let i = 0; i < 30; i++) {
                        createParticles(enemy.x, enemy.y, '#3b82f6');
                        createParticles(enemy.x, enemy.y, '#60a5fa');
                        createParticles(enemy.x, enemy.y, '#ffffff');
                    }

                    // 添加被水击中的动态效果
                    enemy.waterHitEffect = {
                        startTime: Date.now(),
                        duration: 1000
                    };

                    // 添加降级动画效果 - 缩小动画
                    enemy.downgradeAnimation = {
                        startTime: Date.now(),
                        duration: 800,
                        oldRadius: 25 + oldTier * 1.5
                    };

                    // 添加文字提示
                    enemy.showDowngradeText = true;
                }
            }
        }
    });
}

// 显示降级文字提示
function showDowngradeText(x, y, newTier) {
    // 创建一个临时的文字提示
    const text = `降级 → LV${newTier}`;

    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#3b82f6';
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
}

// 通用信息显示（名称和血条）
function renderSpecialTopInfo(top, cx, cy, r, specialTop) {
    
    // 显示名称
    ctx.font = 'bold 14px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#fbbf24';
    ctx.strokeText(specialTop.name, cx, cy + r + 25);
    ctx.fillText(specialTop.name, cx, cy + r + 25);
    
    // 血条
    const maxHp = specialTop.hp;
    const hpRatio = Math.max(0, top.hp / maxHp);
    const barW = r * 1.5;
    const barH = 5;
    const barY = cy + r + 10;
    
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(cx - barW/2, barY, barW, barH);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(cx - barW/2, barY, barW * hpRatio, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - barW/2, barY, barW, barH);
}

// 六娃陀螺渲染
function renderHuluwa6(top, cx, cy, r, specialTop) {
    const now = Date.now();

    // 初始化隐身状态
    if (!top.invisibilityState) {
        top.invisibilityState = {
            lastInvisibilityTime: 0,
            isInvisible: false,
            invisibilityStartTime: 0
        };
    }

    // 检查是否应该进入隐身状态
    const timeSinceLastInvisibility = now - top.invisibilityState.lastInvisibilityTime;

    // 开始新的隐身周期
    if (!top.invisibilityState.isInvisible && timeSinceLastInvisibility >= specialTop.invisibilityInterval) {
        top.invisibilityState.isInvisible = true;
        top.invisibilityState.invisibilityStartTime = now;
        top.invisibilityState.lastInvisibilityTime = now;
    }

    // 计算隐身持续时间
    if (top.invisibilityState.isInvisible) {
        const invisibilityDuration = now - top.invisibilityState.invisibilityStartTime;
        if (invisibilityDuration > specialTop.invisibilityDuration) {
            top.invisibilityState.isInvisible = false;
        }
    }

    // 保存隐身状态到top对象，供碰撞检测使用
    top.isInvisible = top.invisibilityState.isInvisible;

    // 渲染六娃陀螺
    ctx.save();
    ctx.translate(cx, cy);

    const hRatio = 0.55;
    const color = specialTop.color;

    // 隐身期间只显示轮廓
    if (top.isInvisible) {
        // 绘制轮廓外形 - 虚线轮廓
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)'; // 紫色轮廓
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 隐身文字提示
        ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('隐身中', 0, -r * 0.8);

        ctx.restore();

        // 显示名称和血条（也变成半透明）
        ctx.save();
        ctx.globalAlpha = 0.5;
        renderSpecialTopInfo(top, cx, cy, r, specialTop);
        ctx.restore();
        return;
    }

    // 正常状态下的渲染
    // 特殊光效 - 六娃的紫色光环
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#8b5cf6';

    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 六娃陀螺外形 - 隐身葫芦形状
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));

    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 葫芦上部小圆
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.4);

    // 葫芦顶部
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 隐身装饰环
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 旋转的光环效果 - 紫色光环
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 2);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 特殊标记 - 六娃表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👻', 0, -r * 0.1);

    ctx.restore();

    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 蛇精陀螺渲染
function renderSnakeSpirit(top, cx, cy, r, specialTop) {
    const now = Date.now();

    // 初始化龙卷风释放状态
    if (!top.tornadoState) {
        top.tornadoState = {
            lastTornadoTime: 0
        };
    }

    // 检查是否应该释放龙卷风
    const timeSinceLastTornado = now - top.tornadoState.lastTornadoTime;
    if (gameState === 'playing' && timeSinceLastTornado >= specialTop.tornadoInterval) {
        // 释放新的龙卷风
        spawnTornado(top, specialTop);
        top.tornadoState.lastTornadoTime = now;
    }

    ctx.save();
    ctx.translate(cx, cy);

    const hRatio = 0.55;
    const color = specialTop.color;

    // 特殊光效 - 蛇精的青绿色光环
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#10b981';

    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 蛇精陀螺外形 - 蛇形葫芦
    // 底部大圆
    const gradBase = ctx.createLinearGradient(-r, 0, r, 0);
    gradBase.addColorStop(0, shadeColor(color, -30));
    gradBase.addColorStop(0.5, color);
    gradBase.addColorStop(1, shadeColor(color, -40));

    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 葫芦上部小圆
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 葫芦腰部连接
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.4);

    // 葫芦顶部
    ctx.fillStyle = shadeColor(color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 蛇鳞装饰环
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 旋转的妖气光环
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(top.angle * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 特殊标记 - 蛇精表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐍', 0, -r * 0.1);

    ctx.restore();

    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 生成龙卷风
function spawnTornado(top, specialTop) {
    const angle = Math.random() * Math.PI * 2;
    const speed = specialTop.tornadoSpeed;

    tornadoes.push({
        x: top.x,
        y: top.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: specialTop.tornadoRadius,
        owner: top,
        spawnTime: Date.now()
    });
}

// 蝎子陀螺渲染
function renderScorpion(top, cx, cy, r, specialTop) {
    const now = Date.now();

    // 初始化钩子状态
    if (!top.hookState) {
        top.hookState = {
            hookedTarget: null,  // 当前钩住的陀螺
            hookStartTime: 0,    // 开始钩住的时间
            hookAngle: 0         // 钩子角度
        };
    }

    ctx.save();
    ctx.translate(cx, cy);

    const hRatio = 0.55;
    const color = specialTop.color;

    // 绘制攻击范围圈（半透明）
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, specialTop.hookRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 特殊光效 - 蝎子的深红色光环
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#dc2626';

    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = top.isEnemy ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = top.isEnemy ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 蝎子陀螺主体 - 椭圆身形
    const gradBody = ctx.createLinearGradient(-r, 0, r, 0);
    gradBody.addColorStop(0, shadeColor(color, -30));
    gradBody.addColorStop(0.5, color);
    gradBody.addColorStop(1, shadeColor(color, -40));

    ctx.fillStyle = gradBody;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 蝎子尾巴（钩子）- 动态摆动
    const tailAngle = Math.sin(now * 0.003) * 0.3;
    ctx.save();
    ctx.rotate(tailAngle);

    // 尾巴根部
    ctx.fillStyle = shadeColor(color, -20);
    ctx.beginPath();
    ctx.ellipse(-r * 0.7, -r * 0.3, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // 尾巴中段
    ctx.beginPath();
    ctx.ellipse(-r * 0.9, -r * 0.6, r * 0.2, r * 0.12, -0.8, 0, Math.PI * 2);
    ctx.fill();

    // 尾巴尖端（毒钩）
    ctx.fillStyle = '#7f1d1d';  // 深红色毒钩
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, -r * 0.75);
    ctx.lineTo(-r * 1.1, -r * 0.9);
    ctx.lineTo(-r * 0.85, -r * 0.85);
    ctx.closePath();
    ctx.fill();

    // 钩子发光效果
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 蝎子钳子（左右各一个）
    ctx.fillStyle = shadeColor(color, -10);

    // 左钳子
    ctx.save();
    ctx.translate(r * 0.5, -r * 0.2);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.3, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 右钳子
    ctx.save();
    ctx.translate(r * 0.5, r * 0.2);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.3, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 旋转的妖气光环
    ctx.save();
    ctx.rotate(top.angle * 1.5);
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 特殊标记 - 蝎子表情
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦂', 0, 0);

    ctx.restore();

    // 如果有钩住的陀螺，绘制连接线
    if (top.hookState.hookedTarget && topsOnBoard.includes(top.hookState.hookedTarget)) {
        const target = top.hookState.hookedTarget;
        ctx.save();
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.restore();

        // 显示"钩住中"文字
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('毒钩缠绕', cx, cy - r - 15);
    }

    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 神龙陀螺渲染
function renderDragonGod(top, cx, cy, r, specialTop) {
    const now = Date.now();

    // 初始化神龙状态
    if (!top.dragonState) {
        top.dragonState = {
            shieldHits: 0,              // 护盾已受击次数
            shieldBroken: false,        // 护盾是否已破碎
            summoned: false,            // 是否已召唤
            lastFireTime: 0,            // 上次喷火时间
            lastWaterTime: 0,           // 上次喷水时间
            lastSonicTime: 0,           // 上次声波时间
            fireTarget: null,           // 喷火目标
            waterTarget: null,          // 喷水目标
            isClone: false,             // 是否为分身
            cloneParent: null,          // 主陀螺引用（如果是分身）
            hasCloned: false            // 是否已经分过身
        };
    }

    const state = top.dragonState;

    // 只有主陀螺或非分身的陀螺才能进行攻击
    if (!state.isClone && gameState === 'playing') {
        // 喷火攻击
        if (now - state.lastFireTime >= specialTop.fireInterval) {
            performDragonFire(top, specialTop);
            state.lastFireTime = now;
        }

        // 喷水攻击
        if (now - state.lastWaterTime >= specialTop.waterInterval) {
            performDragonWater(top, specialTop);
            state.lastWaterTime = now;
        }

        // 声波攻击
        if (now - state.lastSonicTime >= specialTop.sonicInterval) {
            performDragonSonic(top, specialTop);
            state.lastSonicTime = now;
        }
    }

    ctx.save();
    ctx.translate(cx, cy);

    const hRatio = 0.55;
    const color = specialTop.color;

    // 护盾效果（未破碎时）
    if (!state.shieldBroken && !state.isClone) {
        const shieldOpacity = 1 - (state.shieldHits / specialTop.shieldMaxHits) * 0.5;

        // 护盾外圈
        ctx.strokeStyle = `rgba(56, 189, 248, ${shieldOpacity})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 护盾填充
        ctx.fillStyle = `rgba(56, 189, 248, ${shieldOpacity * 0.2})`;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // 护盾裂纹（根据受击次数）
        if (state.shieldHits > 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            for (let i = 0; i < state.shieldHits; i++) {
                const crackAngle = (i * Math.PI * 2 / specialTop.shieldMaxHits) + (now * 0.001);
                ctx.beginPath();
                ctx.moveTo(Math.cos(crackAngle) * r * 1.2, Math.sin(crackAngle) * r * 1.2);
                ctx.lineTo(Math.cos(crackAngle) * r * 1.5, Math.sin(crackAngle) * r * 1.5);
                ctx.stroke();
            }
        }
    }

    // 分身标识
    if (state.isClone) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 特殊光效 - 神龙的金黄色光环
    ctx.shadowBlur = 30;
    ctx.shadowColor = state.isClone ? '#f59e0b' : '#fbbf24';

    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    // 阵营底圈
    ctx.shadowBlur = 0;
    ctx.fillStyle = top.isEnemy ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = top.isEnemy ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 神龙陀螺主体 - 龙形
    const gradBody = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gradBody.addColorStop(0, shadeColor(color, 30));
    gradBody.addColorStop(0.5, color);
    gradBody.addColorStop(1, shadeColor(color, -30));

    ctx.fillStyle = gradBody;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 龙鳞装饰
    ctx.strokeStyle = shadeColor(color, -40);
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + (now * 0.002);
        ctx.beginPath();
        ctx.arc(0, 0, r * (0.3 + i * 0.1), angle, angle + Math.PI / 6);
        ctx.stroke();
    }

    // 龙角
    ctx.fillStyle = shadeColor(color, -20);
    // 左角
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.5);
    ctx.lineTo(-r * 0.5, -r * 1.2);
    ctx.lineTo(-r * 0.1, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    // 右角
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.5);
    ctx.lineTo(r * 0.5, -r * 1.2);
    ctx.lineTo(r * 0.1, -r * 0.5);
    ctx.closePath();
    ctx.fill();

    // 旋转的神龙光环
    ctx.save();
    ctx.rotate(top.angle * 0.8);
    ctx.strokeStyle = state.isClone ? 'rgba(245, 158, 11, 0.5)' : 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 内部旋转环
    ctx.save();
    ctx.rotate(-top.angle * 1.2);
    ctx.strokeStyle = state.isClone ? 'rgba(245, 158, 11, 0.3)' : 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 特殊标记 - 龙表情或分身标识
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${r * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.isClone ? '🐉' : '🐲', 0, -r * 0.1);

    // 分身标识文字
    if (state.isClone) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('分身', 0, r * 0.7);
    }

    ctx.restore();

    // 显示"护盾破碎"或"召唤完成"状态
    if (state.shieldBroken && !state.isClone) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('护盾已碎', cx, cy - r - 20);
    }

    // 显示名称和血条
    renderSpecialTopInfo(top, cx, cy, r, specialTop);
}

// 神龙陀螺喷火攻击
function performDragonFire(top, specialTop) {
    // 寻找范围内的敌方陀螺
    let target = null;
    let closestDist = specialTop.fireRange;

    topsOnBoard.forEach(enemy => {
        if (enemy.isEnemy === top.isEnemy) return;
        if (enemy.hp <= 0 || enemy.isDying) return;

        const dx = enemy.x - top.x;
        const dy = enemy.y - top.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= closestDist) {
            closestDist = dist;
            target = enemy;
        }
    });

    if (target) {
        // 点燃目标
        target.isBurning = true;
        target.burnEndTime = Date.now() + specialTop.fireDuration;
        target.burnDamage = specialTop.fireDamage;
        target.fireAttacker = top;

        // 创建火焰粒子效果
        for (let i = 0; i < 10; i++) {
            createParticles(target.x, target.y, '#ef4444', 3);
        }
    }
}

// 神龙陀螺喷水攻击
function performDragonWater(top, specialTop) {
    // 寻找范围内的敌方陀螺
    let target = null;
    let closestDist = specialTop.waterRange;

    topsOnBoard.forEach(enemy => {
        if (enemy.isEnemy === top.isEnemy) return;
        if (enemy.hp <= 0 || enemy.isDying) return;

        const dx = enemy.x - top.x;
        const dy = enemy.y - top.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= closestDist) {
            closestDist = dist;
            target = enemy;
        }
    });

    if (target) {
        // 降级效果
        if (target.tier > 1) {
            target.tier -= 1;
            target.typeId = target.tier;
            const newType = TOP_TYPES.find(t => t.id === target.typeId);
            if (newType) {
                target.name = newType.name;
                target.color = newType.color;
            }

            // 创建降级效果
            createFloatingText(target.x, target.y - target.radius - 10, '降级!', '#3b82f6');
            createParticles(target.x, target.y, '#3b82f6', 5);
        }
    }
}

// 神龙陀螺声波攻击
function performDragonSonic(top, specialTop) {
    // 创建声波效果
    if (!top.sonicWaves) top.sonicWaves = [];

    top.sonicWaves.push({
        x: top.x,
        y: top.y,
        radius: 10,
        maxRadius: specialTop.sonicRange,
        spawnTime: Date.now(),
        owner: top
    });
}

// 更新和渲染龙卷风
function updateAndRenderTornadoes() {
    const now = Date.now();

    for (let i = tornadoes.length - 1; i >= 0; i--) {
        const tornado = tornadoes[i];

        // 移动龙卷风
        tornado.x += tornado.vx;
        tornado.y += tornado.vy;

        // 检查是否离开屏幕
        if (tornado.x < -100 || tornado.x > w + 100 ||
            tornado.y < -100 || tornado.y > h + 100) {
            tornadoes.splice(i, 1);
            continue;
        }

        // 渲染龙卷风
        renderTornado(tornado);

        // 检测碰撞并冰冻敌人
        checkTornadoCollision(tornado);
    }
}

// 渲染龙卷风
function renderTornado(tornado) {
    const now = Date.now();
    const age = now - tornado.spawnTime;

    ctx.save();
    ctx.translate(tornado.x, tornado.y);

    // 旋转的龙卷风效果
    ctx.rotate(age * 0.01);

    // 龙卷风主体 - 螺旋形
    for (let i = 0; i < 3; i++) {
        const offset = (age * 0.005 + i * Math.PI * 2 / 3) % (Math.PI * 2);
        const alpha = 0.8 - i * 0.2;

        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.lineWidth = 4 - i;
        ctx.beginPath();

        for (let j = 0; j < 20; j++) {
            const angle = offset + j * 0.3;
            const radius = tornado.radius * (0.3 + j * 0.035);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.6; // 压扁效果

            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // 龙卷风中心
    ctx.fillStyle = 'rgba(150, 220, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, tornado.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// 检测龙卷风碰撞
function checkTornadoCollision(tornado) {
    const specialTop = SPECIAL_TOPS.find(st => st.id === 'snakeSpirit');
    if (!specialTop) return;

    topsOnBoard.forEach(top => {
        // 跳过同阵营和已死亡的陀螺
        if (top.isEnemy === tornado.owner.isEnemy || top.hp <= 0) return;

        // 检测碰撞
        const dx = top.x - tornado.x;
        const dy = top.y - tornado.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tornado.radius + top.radius) {
            // 冰冻敌人
            top.isFrozen = true;
            top.freezeEndTime = Date.now() + specialTop.freezeDuration;

            // 创建冰冻特效
            createParticles(top.x, top.y, '#a5f3fc');
            createParticles(top.x, top.y, '#67e8f9');
        }
    });
}

// 取色微调器 (生成 3D 阴影用)
function shadeColor(color, percent) {
    if (!color) return '#000000';
    // 强制把 #fff 之类的三位简短色值转换为 #ffffff 标准六位色值，以防止越界导致致命的 NaN 渲染崩溃
    if (color.length === 4) {
        color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    R = Math.max(0, Math.min(255, R)) || 0;
    G = Math.max(0, Math.min(255, G)) || 0;
    B = Math.max(0, Math.min(255, B)) || 0;
    let RR = R.toString(16).padStart(2, '0');
    let GG = G.toString(16).padStart(2, '0');
    let BB = B.toString(16).padStart(2, '0');
    return "#"+RR+GG+BB;
}

// ==== 图鉴专用：渲染单个陀螺的3D预览到Canvas ====
function renderTopPreview(type, canvasSize = 120) {
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = canvasSize;
    previewCanvas.height = canvasSize;
    const pCtx = previewCanvas.getContext('2d');
    
    // 透明背景
    pCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    const cx = canvasSize / 2;
    const cy = canvasSize / 2 + 10;
    const r = canvasSize * 0.35;
    const t = type.tier;
    const hRatio = 0.55;
    const angle = Date.now() * 0.001; // 静态旋转角度
    
    pCtx.save();
    pCtx.translate(cx, cy);
    
    // 底部阴影
    pCtx.fillStyle = 'rgba(0,0,0,0.3)';
    pCtx.beginPath();
    pCtx.ellipse(0, r * hRatio + 5, r, r * hRatio, 0, 0, Math.PI * 2);
    pCtx.fill();
    
    // 友方蓝色光环底圈
    pCtx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    pCtx.beginPath();
    pCtx.ellipse(0, 3, r * 1.2, r * 1.2 * hRatio, 0, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.strokeStyle = '#38bdf8';
    pCtx.lineWidth = 1.5;
    pCtx.stroke();
    
    // 中心支撑柱
    let pegR = 2 + t * 0.3;
    let pegH = Math.floor(r * hRatio + 5);
    for (let py = pegH; py >= 0; py--) {
        pCtx.beginPath();
        pCtx.ellipse(0, py, pegR, pegR * hRatio, 0, 0, Math.PI * 2);
        if (py === pegH) {
            pCtx.fillStyle = type.color;
        } else {
            let pegGrad = pCtx.createLinearGradient(-pegR, 0, pegR, 0);
            pegGrad.addColorStop(0, '#111');
            pegGrad.addColorStop(0.3, '#f8fafc');
            pegGrad.addColorStop(0.8, '#475569');
            pegGrad.addColorStop(1, '#0f172a');
            pCtx.fillStyle = pegGrad;
        }
        pCtx.fill();
    }
    
    // 根据等级定义3D切片组
    let parts = [];
    if (t === 1) {
        parts.push({ scale: 1.0, height: 4, color: type.color });
    } else if (t === 2) {
        parts.push({ scale: 1.0, height: 5, color: '#555' });
        parts.push({ scale: 0.8, height: 4, color: type.color, dots: 2 });
    } else if (t === 3) {
        parts.push({ scale: 0.7, height: 4, color: '#333' });
        parts.push({ scale: 1.1, height: 6, color: type.color, dots: 3 });
    } else if (t === 4) {
        parts.push({ scale: 0.6, height: 5, color: '#555' });
        parts.push({ scale: 1.0, height: 6, color: type.color, dots: 4 });
        parts.push({ scale: 0.4, height: 5, color: '#fff' });
    } else if (t === 5) {
        parts.push({ scale: 0.9, height: 3, color: type.color });
        parts.push({ scale: 1.0, height: 7, color: '#2b2b2b', dots: 5 });
        parts.push({ scale: 0.7, height: 6, color: type.color });
    } else if (t === 6) {
        parts.push({ scale: 1.0, height: 8, color: type.color, dots: 3 });
        parts.push({ scale: 0.9, height: 2, color: '#fff' });
        parts.push({ scale: 0.5, height: 8, color: '#111' });
        parts.push({ scale: 0.3, height: 4, color: type.color });
    } else if (t === 7) {
        parts.push({ scale: 0.4, height: 6, color: '#111' });
        parts.push({ scale: 1.2, height: 5, color: type.color, dots: 6 });
        parts.push({ scale: 0.5, height: 7, color: '#ccc', dots: 3, rev: true });
    } else if (t === 8) {
        parts.push({ scale: 0.8, height: 6, color: '#222' });
        parts.push({ scale: 1.1, height: 7, color: type.color, dots: 4 });
        parts.push({ scale: 0.9, height: 5, color: '#fff' });
        parts.push({ scale: 0.5, height: 9, color: type.color, dots: 4, rev: true });
    } else if (t === 9) {
        parts.push({ scale: 0.7, height: 5, color: '#000' });
        parts.push({ scale: 1.0, height: 9, color: type.color, dots: 8 });
        parts.push({ scale: 0.8, height: 3, color: '#333' });
        parts.push({ scale: 0.6, height: 6, color: type.color, dots: 4 });
        parts.push({ scale: 0.2, height: 12, color: '#fff' });
    } else if (t === 10) {
        parts.push({ scale: 0.5, height: 6, color: '#0f172a' });
        parts.push({ scale: 1.2, height: 9, color: type.color, dots: 10 });
        parts.push({ scale: 1.0, height: 5, color: '#fff' });
        parts.push({ scale: 0.7, height: 7, color: type.color, dots: 5, rev: true });
        parts.push({ scale: 0.3, height: 15, color: '#fbbf24' });
    } else if (t === 11) {
        parts.push({ scale: 0.6, height: 8, color: '#1e293b' });
        parts.push({ scale: 1.0, height: 7, color: '#cbd5e1', dots: 6 });
        parts.push({ scale: 1.3, height: 6, color: type.color, dots: 12, rev: true });
        parts.push({ scale: 0.8, height: 5, color: '#fff' });
        parts.push({ scale: 0.4, height: 18, color: type.color });
    } else if (t === 12) {
        parts.push({ scale: 0.5, height: 10, color: '#0f172a' });
        parts.push({ scale: 1.1, height: 8, color: type.color, dots: 8 });
        parts.push({ scale: 1.4, height: 5, color: '#fff', dots: 4 });
        parts.push({ scale: 1.0, height: 6, color: type.color, dots: 6, rev: true });
        parts.push({ scale: 0.3, height: 22, color: '#fbbf24' });
    } else if (t <= 20) {
        // LV13-20: 动物系列风格 - 更流线型
        let intensity = (t - 12) / 8;
        parts.push({ scale: 0.4 + intensity * 0.2, height: 8 + intensity * 4, color: '#1e293b' });
        parts.push({ scale: 1.0 + intensity * 0.3, height: 6 + intensity * 2, color: type.color, dots: Math.floor(8 + intensity * 8) });
        parts.push({ scale: 0.9, height: 4, color: '#fff' });
        parts.push({ scale: 0.6, height: 10 + intensity * 5, color: type.color, dots: Math.floor(6 + intensity * 4), rev: true });
        parts.push({ scale: 0.25, height: 25 + intensity * 10, color: '#fbbf24' });
    } else if (t <= 30) {
        // LV21-30: 神话系列风格 - 更华丽
        let intensity = (t - 20) / 10;
        parts.push({ scale: 0.5, height: 12, color: '#0f172a' });
        parts.push({ scale: 0.8, height: 5, color: '#cbd5e1', dots: 6 });
        parts.push({ scale: 1.2 + intensity * 0.2, height: 8 + intensity * 4, color: type.color, dots: Math.floor(10 + intensity * 10) });
        parts.push({ scale: 1.0, height: 6, color: '#fff', dots: 4 });
        parts.push({ scale: 0.7, height: 12 + intensity * 6, color: type.color, dots: Math.floor(8 + intensity * 6), rev: true });
        parts.push({ scale: 0.3, height: 30 + intensity * 15, color: '#fbbf24' });
    } else if (t <= 40) {
        // LV31-40: 元素系列风格 - 更几何化
        let intensity = (t - 30) / 10;
        parts.push({ scale: 0.6, height: 10, color: '#1e293b' });
        parts.push({ scale: 1.0, height: 4, color: '#94a3b8', dots: 8 });
        parts.push({ scale: 1.3 + intensity * 0.2, height: 10 + intensity * 3, color: type.color, dots: Math.floor(12 + intensity * 8) });
        parts.push({ scale: 1.1, height: 5, color: '#e2e8f0' });
        parts.push({ scale: 0.9, height: 8, color: type.color, dots: 6 });
        parts.push({ scale: 0.5, height: 15 + intensity * 10, color: type.color, dots: Math.floor(6 + intensity * 4), rev: true });
        parts.push({ scale: 0.2, height: 40 + intensity * 20, color: '#fbbf24' });
    } else {
        // LV41-50: 传说系列风格 - 最华丽
        let intensity = (t - 40) / 10;
        parts.push({ scale: 0.7, height: 15, color: '#0f172a' });
        parts.push({ scale: 1.1, height: 6, color: '#64748b', dots: 10 });
        parts.push({ scale: 1.4, height: 8, color: '#fff', dots: 6 });
        parts.push({ scale: 1.5 + intensity * 0.1, height: 12 + intensity * 4, color: type.color, dots: Math.floor(16 + intensity * 8) });
        parts.push({ scale: 1.2, height: 6, color: '#e2e8f0', dots: 8 });
        parts.push({ scale: 0.8, height: 18 + intensity * 8, color: type.color, dots: Math.floor(10 + intensity * 6), rev: true });
        parts.push({ scale: 0.4, height: 50 + intensity * 30, color: '#fbbf24' });
    }
    
    // 从底部向顶部渲染3D实体
    let currentY = 0;
    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
        let part = parts[pIdx];
        let layerR = r * part.scale;
        let layerH = part.height;
        
        // 绘制侧表面
        for (let i = layerH; i > 0; i--) {
            let y = currentY - i;
            pCtx.beginPath();
            pCtx.ellipse(0, y, layerR, layerR * hRatio, 0, 0, Math.PI * 2);
            
            let sideGrad = pCtx.createLinearGradient(-layerR, 0, layerR, 0);
            sideGrad.addColorStop(0, shadeColor(part.color, -50));
            sideGrad.addColorStop(0.3, part.color);
            sideGrad.addColorStop(0.7, shadeColor(part.color, -60));
            sideGrad.addColorStop(1, shadeColor(part.color, -80));
            
            pCtx.fillStyle = sideGrad;
            pCtx.fill();
        }
        
        // 绘制顶面
        currentY -= layerH;
        pCtx.beginPath();
        pCtx.ellipse(0, currentY, layerR, layerR * hRatio, 0, 0, Math.PI * 2);
        
        let topGrad = pCtx.createLinearGradient(-layerR, currentY - layerR, layerR, currentY + layerR);
        topGrad.addColorStop(0, '#ffffff');
        topGrad.addColorStop(0.4, part.color);
        topGrad.addColorStop(1, shadeColor(part.color, -30));
        
        pCtx.fillStyle = topGrad;
        pCtx.fill();
        
        pCtx.lineWidth = Math.max(0.5, layerR * 0.05);
        pCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        pCtx.stroke();
        
        // 科幻光环
        if (part.dots > 0) {
            pCtx.save();
            pCtx.translate(0, currentY);
            pCtx.scale(1, hRatio);
            pCtx.rotate(angle * (part.rev ? -1.5 : 1.0));
            
            pCtx.fillStyle = 'rgba(255,255,255,0.9)';
            let dotR = layerR * 0.75;
            for (let a = 0; a < part.dots; a++) {
                let rad = (a * Math.PI * 2) / part.dots;
                pCtx.beginPath();
                pCtx.arc(Math.cos(rad) * dotR, Math.sin(rad) * dotR, 2, 0, Math.PI * 2);
                pCtx.fill();
            }
            pCtx.restore();
        }
    }
    
    pCtx.restore();
    return previewCanvas.toDataURL('image/png');
}

// ===== 渲染燃烧效果 =====
function renderBurningEffect(cx, cy, r) {
    const now = Date.now();

    // 绘制火焰光环
    ctx.save();

    // 外圈火焰光晕
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4400';
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
    ctx.stroke();

    // 内圈火焰
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制跳动的火焰粒子
    const flameCount = 6;
    for (let i = 0; i < flameCount; i++) {
        const angle = (now * 0.005) + (i * Math.PI * 2 / flameCount);
        const dist = r * (0.8 + Math.sin(now * 0.01 + i) * 0.2);
        const fx = cx + Math.cos(angle) * dist;
        const fy = cy + Math.sin(angle) * dist;
        const fSize = 4 + Math.sin(now * 0.02 + i * 0.5) * 2;

        ctx.fillStyle = `rgba(255, ${100 + Math.sin(now * 0.01) * 50}, 0, 0.9)`;
        ctx.beginPath();
        ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制上升的火星
    for (let i = 0; i < 4; i++) {
        const mx = cx + (Math.random() - 0.5) * r * 2;
        const my = cy - r - Math.random() * 20;
        const mSize = 2 + Math.random() * 2;

        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${0.6 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(mx, my, mSize, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// 渲染冰冻效果 - 方形冰块罩住陀螺
function renderFrozenEffect(cx, cy, r) {
    const now = Date.now();

    ctx.save();

    // 绘制方形冰块外框
    const size = r * 2.2;
    ctx.strokeStyle = 'rgba(165, 243, 252, 0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(cx - size/2, cy - size/2, size, size);
    ctx.setLineDash([]);

    // 绘制冰块填充（半透明冰蓝色）
    ctx.fillStyle = 'rgba(165, 243, 252, 0.3)';
    ctx.fillRect(cx - size/2, cy - size/2, size, size);

    // 绘制冰块内部线条（模拟冰晶）
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)';
    ctx.lineWidth = 1;

    // 对角线
    ctx.beginPath();
    ctx.moveTo(cx - size/2, cy - size/2);
    ctx.lineTo(cx + size/2, cy + size/2);
    ctx.moveTo(cx + size/2, cy - size/2);
    ctx.lineTo(cx - size/2, cy + size/2);
    ctx.stroke();

    // 中心十字
    ctx.beginPath();
    ctx.moveTo(cx, cy - size/2);
    ctx.lineTo(cx, cy + size/2);
    ctx.moveTo(cx - size/2, cy);
    ctx.lineTo(cx + size/2, cy);
    ctx.stroke();

    // 闪烁的冰晶粒子
    for (let i = 0; i < 6; i++) {
        const angle = (now * 0.002) + (i * Math.PI * 2 / 6);
        const dist = r * (0.6 + Math.sin(now * 0.005 + i) * 0.2);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const pSize = 2 + Math.sin(now * 0.01 + i) * 1;

        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(now * 0.01 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // "冰冻中"文字
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('冰冻中', cx, cy - size/2 - 8);

    ctx.restore();
}

// ==== 全新设计：真 3D 圆柱叠加科技渲染引擎 ====
function renderTops() {
    topsOnBoard.forEach(top => {
        let cx = top.x;
        let cy = top.y;
        let r = top.radius;
        let t = top.tier || 1;

        // 处理降级动画
        if (top.downgradeAnimation) {
            const animElapsed = Date.now() - top.downgradeAnimation.startTime;
            if (animElapsed < top.downgradeAnimation.duration) {
                // 动画进行中 - 从旧半径过渡到新半径
                const progress = animElapsed / top.downgradeAnimation.duration;
                r = top.downgradeAnimation.oldRadius + (top.radius - top.downgradeAnimation.oldRadius) * progress;
            } else {
                // 动画结束
                top.downgradeAnimation = null;
            }
        }

        // 渲染被水击中的效果
        if (top.waterHitEffect) {
            const waterElapsed = Date.now() - top.waterHitEffect.startTime;
            if (waterElapsed < top.waterHitEffect.duration) {
                const progress = waterElapsed / top.waterHitEffect.duration;
                // 蓝色水波纹扩散效果
                ctx.save();
                ctx.strokeStyle = `rgba(59, 130, 246, ${1 - progress})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(cx, cy, r + progress * 50, 0, Math.PI * 2);
                ctx.stroke();

                // 水波纹内圈
                ctx.strokeStyle = `rgba(96, 165, 250, ${0.8 - progress * 0.8})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, r + progress * 30, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } else {
                top.waterHitEffect = null;
            }
        }

        // 渲染燃烧效果（一旦点燃就一直燃烧直到被消灭）
        if (top.isBurning) {
            renderBurningEffect(cx, cy, r);
        }

        // 检查并渲染冰冻效果
        if (top.isFrozen) {
            if (Date.now() > top.freezeEndTime) {
                top.isFrozen = false;
            } else {
                renderFrozenEffect(cx, cy, r);
            }
        }

        // 特殊陀螺使用独立渲染
        if (top.isSpecial) {
            renderSpecialTopOnBoard(top, cx, cy, r);
            return;
        }

        ctx.save();
        ctx.translate(cx, cy);

        // --- 1. 拖影与底部阴影层 ---
        let hRatio = 0.55; // 3D 透视角度，0.55 呈现俯视 45 度角的质感
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, r * hRatio + 8, r, r * hRatio, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- 1.2 极度明显的阵营高光底圈识别 ---
        ctx.shadowBlur = 0;
        ctx.fillStyle = top.isEnemy ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 5, r * 1.3, r * 1.3 * hRatio, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = top.isEnemy ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 核心修复：移除全局 ctx.rotate(top.angle)，强制保证 3D 图层严格沿着屏幕 Y 轴(垂直立起)堆叠！
        // 金属高光应与环境光对齐(不随本体旋转)，只有发光点引擎需要自转。
        // 这是隐藏在底层盘下面的“这根棍”，支撑着从引擎重心到落地阴影中心的链接，呈现完美三维结构
        let pegR = 3 + t * 0.4; // 随等级逐渐变得更结实
        let pegH = Math.floor(r * hRatio + 8); // 底部延伸直到恰好与影子的中心点发生物理重合！
        for (let py = pegH; py >= 0; py--) {
            ctx.beginPath();
            ctx.ellipse(0, py, pegR, pegR * hRatio, 0, 0, Math.PI * 2);
            if (py === pegH) {
                // 圆珠笔尖轴承点：映射机甲本身的能量核光泽
                ctx.fillStyle = top.color; 
            } else {
                let pegGrad = ctx.createLinearGradient(-pegR, 0, pegR, 0);
                pegGrad.addColorStop(0, '#111');
                pegGrad.addColorStop(0.3, '#f8fafc'); // 高反光点
                pegGrad.addColorStop(0.8, '#475569');
                pegGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = pegGrad;
            }
            ctx.fill();
        }

        // --- 2. 为每1级量身定制完全不同的 3D 堆叠切片组（从下到上） ---
        let parts = [];
        if (t === 1) { // L1: 简易薄饼
            parts.push({ scale: 1.0, height: 4, color: top.color });
        } else if (t === 2) { // L2: 双层浅盘
            parts.push({ scale: 1.0, height: 5, color: '#555' });
            parts.push({ scale: 0.8, height: 4, color: top.color, dots: 2 });
        } else if (t === 3) { // L3: 宽翼平盘
            parts.push({ scale: 0.7, height: 4, color: '#333' });
            parts.push({ scale: 1.1, height: 6, color: top.color, dots: 3 });
        } else if (t === 4) { // L4: 高跟三塔
            parts.push({ scale: 0.6, height: 5, color: '#555' });
            parts.push({ scale: 1.0, height: 6, color: top.color, dots: 4 });
            parts.push({ scale: 0.4, height: 5, color: '#fff' });
        } else if (t === 5) { // L5: 倒扣铁桶
            parts.push({ scale: 0.9, height: 3, color: top.color });
            parts.push({ scale: 1.0, height: 7, color: '#2b2b2b', dots: 5 });
            parts.push({ scale: 0.7, height: 6, color: top.color });
        } else if (t === 6) { // L6: 凹陷聚能环
            parts.push({ scale: 1.0, height: 8, color: top.color, dots: 3 });
            parts.push({ scale: 0.9, height: 2, color: '#fff' });
            parts.push({ scale: 0.5, height: 8, color: '#111' });
            parts.push({ scale: 0.3, height: 4, color: top.color });
        } else if (t === 7) { // L7: 悬浮飞碟（带逆光环）
            parts.push({ scale: 0.4, height: 6, color: '#111' });
            parts.push({ scale: 1.2, height: 5, color: top.color, dots: 6 });
            parts.push({ scale: 0.5, height: 7, color: '#ccc', dots: 3, rev: true });
        } else if (t === 8) { // L8: 千层重装甲
            parts.push({ scale: 0.8, height: 6, color: '#222' });
            parts.push({ scale: 1.1, height: 7, color: top.color, dots: 4 });
            parts.push({ scale: 0.9, height: 5, color: '#fff' });
            parts.push({ scale: 0.5, height: 9, color: top.color, dots: 4, rev: true });
        } else if (t === 9) { // L9: 深渊黑洞堆芯
            parts.push({ scale: 0.7, height: 5, color: '#000' });
            parts.push({ scale: 1.0, height: 9, color: top.color, dots: 8 });
            parts.push({ scale: 0.8, height: 3, color: '#333' });
            parts.push({ scale: 0.6, height: 6, color: top.color, dots: 4 });
            parts.push({ scale: 0.2, height: 12, color: '#fff' });
        } else if (t === 10) { // L10: 帝王能量塔
            parts.push({ scale: 0.5, height: 6, color: '#0f172a' });
            parts.push({ scale: 1.2, height: 9, color: top.color, dots: 10 });
            parts.push({ scale: 1.0, height: 5, color: '#fff' });
            parts.push({ scale: 0.7, height: 7, color: top.color, dots: 5, rev: true });
            parts.push({ scale: 0.3, height: 15, color: '#fbbf24' }); // 金色尖椎
        } else if (t === 11) { // 钻石：反重力水晶
            parts.push({ scale: 0.6, height: 8, color: '#1e293b' });
            parts.push({ scale: 1.0, height: 7, color: '#cbd5e1', dots: 6 });
            parts.push({ scale: 1.3, height: 6, color: top.color, dots: 12, rev: true });
            parts.push({ scale: 0.8, height: 5, color: '#fff' });
            parts.push({ scale: 0.4, height: 18, color: top.color });
        } else { // 神阶巨钻 (t>=12)
            parts.push({ scale: 0.8, height: 6, color: '#475569' });
            parts.push({ scale: 1.4, height: 11, color: top.color, dots: 16 });
            parts.push({ scale: 1.1, height: 6, color: '#94a3b8' });
            parts.push({ scale: 0.8, height: 9, color: '#e2e8f0', dots: 8, rev: true });
            parts.push({ scale: 0.5, height: 7, color: top.color });
            parts.push({ scale: 0.2, height: 30, color: '#fbbf24' }); // 超长贯穿神枪
        }

        // --- 3. 从底部向顶部，逐像素切片渲染 3D 实体 ---
        let currentY = 0;
        
        for (let pIdx = 0; pIdx < parts.length; pIdx++) {
            let part = parts[pIdx];
            let layerR = r * part.scale;
            let layerH = part.height;
            
            // 绘制侧表面厚度 (Y轴拉伸叠加法)
            for (let i = layerH; i > 0; i--) {
                let y = currentY - i;
                ctx.beginPath();
                ctx.ellipse(0, y, layerR, layerR * hRatio, 0, 0, Math.PI * 2);
                
                // 侧边 3D 球形光照渐变
                let sideGrad = ctx.createLinearGradient(-layerR, 0, layerR, 0);
                sideGrad.addColorStop(0, shadeColor(part.color, -50));
                sideGrad.addColorStop(0.3, part.color);
                sideGrad.addColorStop(0.7, shadeColor(part.color, -60));
                sideGrad.addColorStop(1, shadeColor(part.color, -80));
                
                ctx.fillStyle = sideGrad;
                ctx.fill();
            }
            
            // 绘制当前部件的光滑顶面
            currentY -= layerH;
            ctx.beginPath();
            ctx.ellipse(0, currentY, layerR, layerR * hRatio, 0, 0, Math.PI * 2);
            
            let topGrad = ctx.createLinearGradient(-layerR, currentY - layerR, layerR, currentY + layerR);
            topGrad.addColorStop(0, '#ffffff'); // 顶部高光
            topGrad.addColorStop(0.4, part.color);
            topGrad.addColorStop(1, shadeColor(part.color, -30));
            
            ctx.fillStyle = topGrad;
            ctx.fill();
            
            // 顶面加入细微硬切角高光描边
            ctx.lineWidth = Math.max(0.5, layerR * 0.05);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();
            
            // --- 4. 追加科幻光环自转动画 (根据每层的明确定义) ---
            if (part.dots > 0) {
                ctx.save();
                ctx.translate(0, currentY);
                ctx.scale(1, hRatio); // 模拟俯视
                
                ctx.rotate(top.angle * (part.rev ? -1.5 : 1.0)); // 差速正反转轮毂
                
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                let dotR = layerR * 0.75;
                for (let a = 0; a < part.dots; a++) {
                    let rad = (a * Math.PI * 2) / part.dots;
                    ctx.beginPath();
                    ctx.arc(Math.cos(rad) * dotR, Math.sin(rad) * dotR, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        ctx.restore();
        
        // --- 5. 画外标语 (重新对焦高科技极简文字) ---
        // 收到命令：移除全部敌方的“目标：XXX”名称标语，让画面更干净。我军保留 LV 级别。
        // 显示陀螺等级：敌方显示在头顶上方（血条上方），我方显示在底座下方
        let displayName = top.name;
        ctx.font = 'bold 14px "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        
        if (top.isEnemy) {
            // 敌方：等级显示在头顶上方（血条上方）
            ctx.fillStyle = '#f87171'; // 红色调
            ctx.strokeText(displayName, top.x, top.y - top.radius - 25);
            ctx.fillText(displayName, top.x, top.y - top.radius - 25);
        } else {
            // 我方：等级显示在底座下方
            ctx.fillStyle = '#67e8f9';
            ctx.strokeText(displayName, top.x, top.y + top.radius + 25);
            ctx.fillText(displayName, top.x, top.y + top.radius + 25);
        }

        // 显示降级提示文字
        if (top.showDowngradeText) {
            ctx.save();
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#3b82f6';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            const textY = top.y - top.radius - 45;
            ctx.strokeText('被水喷到！降级！', top.x, textY);
            ctx.fillText('被水喷到！降级！', top.x, textY);
            ctx.restore();

            // 1秒后隐藏提示
            setTimeout(() => {
                top.showDowngradeText = false;
            }, 1500);
        }

        // --- 6. 核心血条显示 (HP Bar) ---
        let maxHp = top.isEnemy ? 20 : TOP_TYPES.find(x => x.id === top.typeId).hp;
        let hpRatio = Math.max(0, top.hp / maxHp);
        let barW = r * 1.5;
        let barH = 5;
        // 敌人在头顶上面，我们在底座下面
        let barY = top.isEnemy ? top.y - top.radius - 12 : top.y + top.radius + 10;
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(top.x - barW/2, barY, barW, barH);
        ctx.fillStyle = top.isEnemy ? '#ef4444' : '#10b981';
        ctx.fillRect(top.x - barW/2, barY, barW * hpRatio, barH);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(top.x - barW/2, barY, barW, barH);
    });
}

// ===== 物理引擎与碰撞机制 =====
function updatePhysics() {
    // 处理特殊陀螺攻击（二娃的激光和声波）
    processSpecialTopAttacks();

    // 处理蝎子陀螺的钩子逻辑
    processScorpionHooks();

    for (let i = 0; i < topsOnBoard.length; i++) {
        let t1 = topsOnBoard[i];

        // 如果被冰冻，陀螺不能移动，只能旋转
        if (t1.isFrozen) {
            t1.angle += t1.rSpeed;
            continue;
        }

        // 移动
        t1.x += t1.vx;
        t1.y += t1.vy;
        t1.angle += t1.rSpeed;
        
        // 正在死亡的陀螺不受边界限制，可以飞出屏幕
        if (t1.isDying) {
            continue;
        }
        
        // 全屏边界反弹逻辑 & 孤狼索敌制导
        let hitWall = false;
        if (t1.x - t1.radius < 0) { t1.x = t1.radius; t1.vx *= -1; hitWall = true; }
        if (t1.x + t1.radius > w) { t1.x = w - t1.radius; t1.vx *= -1; hitWall = true; }
        if (t1.y - t1.radius < 0) { t1.y = t1.radius; t1.vy *= -1; hitWall = true; }
        if (t1.y + t1.radius > h) { t1.y = h - t1.radius; t1.vy *= -1; hitWall = true; }
        
        if (hitWall) {
            createParticles(t1.x, t1.y, t1.color);
            
            // 扫描场上同阵营与敌对阵营数量
            let myTeam = topsOnBoard.filter(t => t.isEnemy === t1.isEnemy);
            let oppTeam = topsOnBoard.filter(t => t.isEnemy !== t1.isEnemy);
            
            // 触发全军雷达索敌巡航系统：由于场地极大，改为所有机甲每次碰撞物理墙壁后，
            // 都会利用反弹力强行修正轨道，通过雷达锁定距离自己最近的死敌发动冲锋！
            if (oppTeam.length > 0) {
                // 找出距离最近的死敌
                let target = oppTeam.reduce((prev, curr) => {
                    let d1 = Math.pow(prev.x - t1.x, 2) + Math.pow(prev.y - t1.y, 2);
                    let d2 = Math.pow(curr.x - t1.x, 2) + Math.pow(curr.y - t1.y, 2);
                    return d1 < d2 ? prev : curr;
                });
                
                let dx = target.x - t1.x;
                let dy = target.y - t1.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let speed = Math.sqrt(t1.vx*t1.vx + t1.vy*t1.vy);
                // 强制将动能速度矢量重指向最近的敌人，但速度降低为60%，让战斗更持久
                // 设置最低速度保护，避免陀螺停下来
                let newSpeed = Math.max(speed * 0.6, 3);
                t1.vx = (dx / dist) * newSpeed;
                t1.vy = (dy / dist) * newSpeed;
            }
        }
        
        // 圆级碰撞检测
        for (let j = i + 1; j < topsOnBoard.length; j++) {
            let t2 = topsOnBoard[j];
            let dx = t2.x - t1.x;
            let dy = t2.y - t1.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < t1.radius + t2.radius) {
                // 碰撞响应 (弹性碰撞)
                let nx = dx / dist;
                let ny = dy / dist;
                let kx = (t1.vx - t2.vx);
                let ky = (t1.vy - t2.vy);
                
                // 获取动态质量（特殊陀螺会随大小变化）
                let m1 = getDynamicMass(t1);
                let m2 = getDynamicMass(t2);
                
                let p = 2 * (nx * kx + ny * ky) / (m1 + m2);

                t1.vx -= p * m2 * nx;
                t1.vy -= p * m2 * ny;
                t2.vx += p * m1 * nx;
                t2.vy += p * m1 * ny;

                // 防重叠修正
                let overlap = 0.5 * (t1.radius + t2.radius - dist + 1);
                t1.x -= overlap * nx;
                t1.y -= overlap * ny;
                t2.x += overlap * nx;
                t2.y += overlap * ny;

                // 屏幕震动 & 粒子
                // 收到长官指令：取消轻微摩擦的烦人震屏，保留火花粒子
                createParticles(t1.x + dx/2, t1.y + dy/2, t1.isEnemy !== t2.isEnemy ? '#ff0000' : '#ffffff');

                // 播放碰撞音效（敌我碰撞时）
                if (t1.isEnemy !== t2.isEnemy) {
                    playCollisionSound();
                }

                // 实际硬核动能伤害计算
                if (t1.isEnemy !== t2.isEnemy) {
                    let relVel = Math.sqrt(kx*kx + ky*ky);
                    if (relVel > 2) {
                        // 相对速度越大，自身质量越大，给对方造成的粉碎力越强
                        // 伤害系数30，让碰撞伤害更温和
                        let dmgToT2 = (relVel * m1) / 30;
                        let dmgToT1 = (relVel * m2) / 30;

                        // 特殊陀螺能力：大娃变大时伤害加倍
                        dmgToT2 = getSpecialDamageBonus(t1, dmgToT2);
                        dmgToT1 = getSpecialDamageBonus(t2, dmgToT1);

                        // 特殊陀螺能力：三娃防护罩减伤
                        const shieldResult1 = applyShieldDamage(t1, dmgToT1);
                        const shieldResult2 = applyShieldDamage(t2, dmgToT2);

                        // 特殊陀螺能力：六娃隐身期间免疫伤害
                        if (!t1.isInvisible) {
                            t1.hp -= shieldResult1.actualDamage;
                        }
                        if (!t2.isInvisible) {
                            t2.hp -= shieldResult2.actualDamage;
                        }

                        // 特殊陀螺能力：神龙陀螺碰撞后产生分身
                        processDragonGodClone(t1);
                        processDragonGodClone(t2);
                    }
                }
            }
        }
    }
}

// ===== 音效系统 =====
let audioContext = null;

// 初始化音频上下文（需要用户交互后才能使用）
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 播放碰撞音效
function playCollisionSound() {
    if (!audioContext) {
        initAudio();
    }
    if (!audioContext) return; // 如果浏览器不支持，直接返回

    // 创建振荡器
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 设置音效参数 - 低沉的撞击声
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);

    // 设置音量包络
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    // 播放
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// ===== 视觉特效：屏幕震动与粒子系统 =====
function triggerShake() {
    const canvasWrap = document.getElementById('arenaCanvas');
    canvasWrap.classList.remove('shake');
    void canvasWrap.offsetWidth; // 触发重绘
    canvasWrap.classList.add('shake');
    
    // 轻微闪屏
    const flash = document.getElementById('screenFlash');
    flash.style.opacity = '0.1';
    setTimeout(() => { flash.style.opacity = '0'; }, 50);
}

function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color
        });
    }
}

// 创建浮动文字效果（伤害数字等）
function createFloatingText(x, y, text, color = '#ffffff') {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1.0,
        vy: -1.5,  // 向上飘动
        scale: 1.0
    });
}

// 渲染浮动文字
function renderFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.life -= 0.02;
        ft.y += ft.vy;
        ft.scale = 1.0 + (1.0 - ft.life) * 0.5;  // 逐渐变大

        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${Math.floor(16 * ft.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
}

function renderParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.life -= 0.05;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// ===== 网格与交互 =====
function buildGridOverlay() {
    const grid = document.getElementById('gridOverlay');
    grid.innerHTML = '';
    
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            let cell = document.createElement('div');
            cell.className = 'grid-cell';
            // 添加坐标标识给后期的自动派兵寻找空位
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            // 检查这个格子是否有资产占据
            let occupant = topsOnBoard.find(t => !t.isEnemy && t.gridR === r && t.gridC === c);
            if (occupant) {
                cell.classList.add('occupied');
                
                // 核心视觉修复：把原先挡在格子正中央导致玩家看不清 3D 模型的巨大文字改成左上角科技感标牌
                cell.innerHTML = `<div style="position: absolute; top: 4px; left: 6px; font-size: 14px; color: ${occupant.color}; font-weight: 900; text-shadow: 0 0 5px #000, 0 0 10px ${occupant.color};">${occupant.name}</div>`;
                
                // 增加用户互动：点击同类资产进行升星合成！
                // 特殊陀螺不能合成
                if (!occupant.isSpecial) {
                    cell.onclick = () => tryMergeTop(occupant.typeId, r, c, cell);
                }
                
                // 去掉原来极不稳定的 setTimeout 劫持坐标，全权交由 renderLoop 实时吸附
            }
            
            grid.appendChild(cell);
        }
    }
}

// 核心资产同步映射：将本机的 inventory 数据转化到场上 topsOnBoard，并刷新网格 UI
function reloadAssetsFromInventory() {
    // 剔除己方老兵，仅保留原有的敌兵资产
    topsOnBoard = topsOnBoard.filter(t => t.isEnemy);
    
    // 把清单里的资产一一挂载回 3D 渲染器里
    if (arenaData.inventory && arenaData.inventory.length > 0) {
        arenaData.inventory.forEach(inv => {
            // 处理特殊陀螺
            if (inv.isSpecial) {
                let specialTop = SPECIAL_TOPS.find(t => t.id === inv.id);
                if (specialTop) {
                    topsOnBoard.push({
                        typeId: inv.id,
                        specialId: inv.id,
                        isSpecial: true,
                        tier: specialTop.tier,
                        isEnemy: false,
                        x: 0, y: 0, 
                        vx: 0, vy: 0, rSpeed: 0, angle: 0,
                        radius: 35, mass: specialTop.baseMass,
                        color: specialTop.color, name: specialTop.name, hp: specialTop.hp,
                        gridR: inv.gridR, gridC: inv.gridC
                    });
                }
            } else {
                // 处理普通陀螺
                let targetTop = TOP_TYPES.find(t => t.id === inv.id);
                if (targetTop) {
                    topsOnBoard.push({
                        typeId: targetTop.id,
                        tier: targetTop.tier,
                        isEnemy: false,
                        x: 0, y: 0, 
                        vx: 0, vy: 0, rSpeed: 0, angle: 0,
                        radius: 35, mass: 10 + targetTop.tier * 2,
                        color: targetTop.color, name: targetTop.name, hp: targetTop.hp,
                        gridR: inv.gridR, gridC: inv.gridC
                    });
                }
            }
        });
    }
    
    // 同步把 UI 上的 5x6 全铺满
    buildGridOverlay();
    updateHUD();
}

// 合成升级机制 (核心玩法的最后拼图)
function tryMergeTop(typeId, r, c, cellElement) {
    if (gameState !== 'setup') return;

    let targetTopType = TOP_TYPES.find(t => t.id === typeId);
    if (!targetTopType || targetTopType.tier >= 50) {
        // 如果是最高级，不可合成
        cellElement.style.boxShadow = 'inset 0 0 15px #f43f5e';
        setTimeout(() => cellElement.style.boxShadow = '', 400);
        return;
    }

    // 寻找库存里是否有相同 typeId（等级）但属于另一个位置的材料
    let pairIndex = arenaData.inventory.findIndex(inv => 
        inv.id === typeId && !(inv.gridR === r && inv.gridC === c)
    );

    if (pairIndex !== -1) {
        let nextTypeId = typeId + 1; // 刚好晋升1级
        let nextTypeObj = TOP_TYPES.find(t => t.id === nextTypeId);
        
        // 销毁材料 A（远端的兄弟）
        arenaData.inventory.splice(pairIndex, 1);
        
        // 销毁材料 B（当前点击的自己）
        let clickedIndex = arenaData.inventory.findIndex(inv => inv.gridR === r && inv.gridC === c);
        if (clickedIndex !== -1) {
            arenaData.inventory.splice(clickedIndex, 1);
        }

        // 把强大的结合体种在此网格
        arenaData.inventory.push({ id: nextTypeId, gridR: r, gridC: c });
        saveData();

        // 直接用热重载刷上全界面，不留残留！
        reloadAssetsFromInventory();
        triggerShake();
        
        // 我们给刚刚合成出来的新格子上点临时魔法特效
        let newCell = document.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
        if (newCell) {
            newCell.style.transform = 'scale(1.2)';
            newCell.style.boxShadow = '0 0 30px ' + nextTypeObj.color;
            newCell.style.zIndex = "10";
            setTimeout(() => {
                newCell.style.transform = 'scale(1)';
                newCell.style.boxShadow = '';
                newCell.style.zIndex = "";
            }, 600);
        }
    } else {
        // 合成失败：落单了兄弟！
        cellElement.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 0, 0.8)';
        setTimeout(() => { cellElement.style.boxShadow = ''; }, 300);
    }
}

// 自动随机找空格子降落
function autoDeployToGrid(topId) {
    let emptyCells = Array.from(document.querySelectorAll('.grid-cell:not(.occupied)'));
    if (emptyCells.length === 0) {
        alert("长官，战场网格已满，无法再容纳新陀螺了！");
        return false;
    }

    let targetTop = TOP_TYPES.find(t => t.id === topId);
    if (!targetTop) return false;

    // 随机选一个空格子
    let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let rect = randomCell.getBoundingClientRect();
    let absX = rect.left + rect.width / 2;
    let absY = rect.top + rect.height / 2;
    
    let rPos = parseInt(randomCell.dataset.r);
    let cPos = parseInt(randomCell.dataset.c);

    topsOnBoard.push({
        typeId: targetTop.id,
        tier: targetTop.tier,
        isEnemy: false,
        x: absX, y: absY,
        vx: 0, vy: 0, rSpeed: 0, angle: 0,
        radius: 35, mass: 10 + targetTop.tier * 2,
        color: targetTop.color, name: targetTop.name, hp: targetTop.hp,
        gridR: rPos, gridC: cPos
    });
    
    // 写入永久资产库
    arenaData.inventory.push({ id: topId, gridR: rPos, gridC: cPos });
    
    // 记录到图鉴（如果还没有记录过）
    if (!arenaData.discoveredTops.includes(topId)) {
        arenaData.discoveredTops.push(topId);
    }
    
    saveData();
    
    // 直接用渲染通道重新分配所有的样式与事件，这样我们就不必手动操作 DOM 了
    reloadAssetsFromInventory();
    
    triggerShake(); 
    return true;
}

function spawnEnemies() {
    // 1. 核心商业化机制：情报战力刺探 (DDA)
    // 系统首先秘密计算我军库存资产的总破坏力
    let myPower = 0;
    arenaData.inventory.forEach(item => {
        let t = TOP_TYPES.find(x => x.id === item.id);
        if (t) {
            let mass = 10 + t.tier * 2;
            myPower += mass * t.hp; // 最直接暴力的动能与耐久度乘积为战力基准
        }
    });

    // 给予新兵一个保底战力（避免网格全空时游戏直接白给）
    if (myPower < 60) myPower = 60;

    // 2. 情绪调节系统 - "过山车式挑战曲线"
    // 越往后关卡压力越大，但初始更友好
    let difficultyFactor = 0.4 + (arenaData.currentLevel * 0.06); 
    
    // 挫败感护城河：如果在当前关卡惨遭滑铁卢，每失败 1 次，下次派来的敌军总体削弱 30%
    // 让孩子更容易在连败后获得胜利，建立信心
    let fails = arenaData.fails || 0;
    difficultyFactor -= (fails * 0.30);
    
    // 给军部情报增加不确定性，有时是软柿子，有时是硬骨头（防止玩家摸透规律）
    difficultyFactor *= (0.75 + Math.random() * 0.25); 

    // 设置心理学极值：再弱也不能低于 25% 的数值，再强不能超过常规 1.5倍 的绝望压制
    difficultyFactor = Math.max(0.25, Math.min(difficultyFactor, 1.5));
    let targetEnemyPower = myPower * difficultyFactor;
    
    // 3. 构建匹配战力的反派机甲军团
    let spawnedPower = 0;
    // 计算我方最高等级陀螺
    let myMaxTier = 1;
    arenaData.inventory.forEach(item => {
        let t = TOP_TYPES.find(x => x.id === item.id);
        if (t && t.tier > myMaxTier) {
            myMaxTier = t.tier;
        }
    });
    // 敌方最高等级只比我方高1级（限制公平性）
    let maxEnemyTier = Math.min(50, myMaxTier + 1); 
    
    let safeLoops = 0;
    // 不断招募机神填满目标战力池
    while (spawnedPower < targetEnemyPower && safeLoops < 15) {
        safeLoops++;
        
        // 允许随机刷出下水道杂兵或者罕见的高阶主力
        let tier = Math.max(1, Math.floor(Math.random() * maxEnemyTier) + 1);
        let typeObj = TOP_TYPES.find(t => t.tier === tier);
        if(!typeObj) continue;
        
        let mass = 10 + tier * 2;
        let pwr = mass * typeObj.hp;
        spawnedPower += pwr;
        
        // 赋予反派极致危险的光源色调
        let enemyColors = ['#f43f5e', '#a855f7', '#111111', '#b91c1c', '#ea580c'];
        
        // 敌方陀螺生成在红色边框安全区域内
        // 安全区域：top: 80px, left: 140px, right: 140px, height: calc(100vh - 80px - 45vh - 70px)
        let minX = 140 + 40;  // 左侧边界 + 边距
        let maxX = w - 140 - 40;  // 右侧边界 - 边距
        let minY = 80 + 40;  // 顶部边界 + 边距
        let maxY = h - (h * 0.45) - 70 - 40;  // 底部边界（留出放置区域和按钮）- 边距
        
        let enemyX = Math.random() * (maxX - minX) + minX;
        let enemyY = Math.random() * (maxY - minY) + minY;

        // 敌方陀螺使用标准血量
        let enemyHp = typeObj.hp;

        topsOnBoard.push({
            typeId: typeObj.id,
            isEnemy: true,
            tier: typeObj.tier,
            name: typeObj.name,
            x: enemyX,
            y: enemyY,
            vx: 0, vy: 0, rSpeed: 0, angle: 0,
            radius: 35,
            mass: mass,
            color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
            hp: enemyHp
        });
    }
}

// 回收全场功能已删除

// ===== 游戏阶段控制 =====
function startMatch() {
    if (topsOnBoard.filter(t => !t.isEnemy).length === 0) {
        alert("长官，请先布置我方陀螺！");
        return;
    }

    // 初始化音频上下文（需要用户交互）
    initAudio();

    // 重置玻璃裂纹状态
    glassCrackState.crackCount = 0;
    glassCrackState.cracks = [];
    glassCrackState.isShattered = false;
    glassCrackState.shatterTime = 0;

    gameState = 'playing';

    // UI 淡出
    document.getElementById('uiOverlay').classList.add('fade-out');
    document.getElementById('gridOverlay').classList.add('hidden');

    // 隐藏战场红框
    const battleZone = document.getElementById('battleZone');
    if (battleZone) battleZone.classList.add('hidden');
    
    // 赋予全员初始速度，并修复坐标异常的陀螺
    topsOnBoard.forEach(t => {
        // 关键修复：如果我方陀螺坐标还停留在初始 (0,0) 或超出画布，
        // 则将其随机部署到画布下半区的有效区域
        if (t.x <= 0 || t.y <= 0 || t.x >= w || t.y >= h) {
            if (!t.isEnemy) {
                t.x = Math.random() * (w - 150) + 75;
                t.y = h / 2 + Math.random() * (h / 2 - 100) + 50;
            } else {
                t.x = Math.random() * (w - 150) + 75;
                t.y = Math.random() * (h / 2 - 100) + 50;
            }
        }
        t.vx = (Math.random() - 0.5) * 15;
        t.vy = (Math.random() - 0.5) * 15;
        t.rSpeed = (Math.random() - 0.5) * 0.5;
    });
    
    // 真正的死斗模式！取消超时系统，必须战死一方才会结束
    if (matchTimeoutId) {
        clearTimeout(matchTimeoutId);
        matchTimeoutId = null;
    }
}

function endMatch(isWin) {
    if (gameState === 'ended') return; // 防止重复触发
    gameState = 'ended';
    topsOnBoard.forEach(t => { t.vx = 0; t.vy = 0; t.rSpeed = 0; });
    
    // 定制结果文案
    document.getElementById('resultTitle').textContent = isWin ? "🔥 大获全胜！" : "💥 战斗落败";
    document.getElementById('resultTitle').style.color = isWin ? "#10b981" : "#ef4444";
    document.getElementById('resultDesc').textContent = isWin 
        ? "敌军已被全部撕碎！您的数字资产完好无损，关卡等级成功提升！" 
        : "我方军团全军覆没... 别灰心，已经使用时空序列将您的陀螺资产安全传送回老巢！";
        
    if (isWin) {
        arenaData.currentLevel++;
        arenaData.fails = 0; // 高歌猛进，重置连败包袱
        saveData(); // 保存最新的关卡数据
    } else {
        arenaData.fails = (arenaData.fails || 0) + 1; // 不屈不挠，增加失败补偿系数
        saveData();
    }
    
    let resultOverlay = document.getElementById('resultOverlay');
    resultOverlay.classList.remove('hidden');
}

function closeResult() {
    document.getElementById('resultOverlay').classList.add('hidden');
    document.getElementById('uiOverlay').classList.remove('fade-out');
    document.getElementById('gridOverlay').classList.remove('hidden');
    
    gameState = 'setup';
    
    setTimeout(() => {
        // 清理并更新局势
        topsOnBoard = [];
        spawnEnemies();
        // 直接从我的数字资产库倒回场上并刷新
        reloadAssetsFromInventory();
    }, 500);
}

// ===== UI 数据绑定与弹窗控制 =====
function updateHUD() {
    let tData = getTowerData();
    document.getElementById('hudLevel').textContent = '关卡 ' + arenaData.currentLevel;
    document.getElementById('hudPts').textContent = '积分: ' + tData.points;
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    
    if (id === 'modalBaseInfo') {
        let baseObj = TOP_TYPES.find(t => t.tier === arenaData.baseTier);
        // 如果找不到对应的陀螺类型，使用默认的LV1
        if (!baseObj) {
            baseObj = TOP_TYPES.find(t => t.tier === 1);
            arenaData.baseTier = 1;
            saveData();
        }

        // 更新当前等级和下一等级的名称
        const currentLevelName = document.getElementById('currentLevelName');
        const nextLevelName = document.getElementById('nextLevelName');
        if (currentLevelName) currentLevelName.textContent = baseObj.name;
        if (nextLevelName) nextLevelName.textContent = 'LV' + Math.min(baseObj.tier + 1, 50);

        // 更新碎片进度
        const currentFragments = document.getElementById('currentFragments');
        const requiredFragments = document.getElementById('requiredFragments');
        if (currentFragments) currentFragments.textContent = arenaData.fragments;
        if (requiredFragments) requiredFragments.textContent = '3';

        // 渲染陀螺预览
        renderUpgradeVisual();
    }
    else if (id === 'modalGacha') {
        document.getElementById('gachaTickets').textContent = arenaData.gachaTickets;
        wheelRotation = 0;
        const canvas = document.getElementById('gachaWheel');
        if (canvas) {
            canvas.style.transform = 'rotate(0deg)';
        }
        // 绘制转盘 - 延迟500ms确保modal已完全显示
        setTimeout(() => {
            console.log('Modal should be visible now, drawing wheel...');
            drawWheel();
        }, 500);
    }
    else if (id === 'modalEfficiency') {
        document.getElementById('efficiencyStars').textContent = arenaData.efficiencyStars;
    }
    else if (id === 'modalDex') {
        let dexGrid = document.getElementById('dexGrid');
        dexGrid.innerHTML = '';
        
        TOP_TYPES.forEach(type => {
            // 检查是否曾经在棋盘里出现过（图鉴高亮条件）
            let isDiscovered = arenaData.discoveredTops && arenaData.discoveredTops.includes(type.id);
            // 检查当前是否拥有
            let ownedCount = arenaData.inventory.filter(item => item.id === type.id).length;
            let isOwned = ownedCount > 0;
            
            let itemDiv = document.createElement('div');
            itemDiv.className = 'dex-item';
            
            // 样式区分：曾经出现过则点亮，未出现则灰暗锁定
            if (isDiscovered) {
                itemDiv.style.border = `2px solid ${type.color}`;
                itemDiv.style.boxShadow = `inset 0 0 15px ${type.color}, 0 0 10px ${type.color}`;
                itemDiv.style.background = 'rgba(255,255,255,0.1)';
            } else {
                itemDiv.style.border = '2px solid #333';
                itemDiv.style.filter = 'grayscale(100%) opacity(0.5)';
                itemDiv.style.background = 'rgba(0,0,0,0.3)';
            }
            
            // 生成3D预览图
            let previewDataUrl = renderTopPreview(type, 140);
            
            let html = `
                <div class="dex-preview-container" style="position: relative; width: 100%; height: 100px; display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                    <img src="${previewDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; ${isDiscovered ? '' : 'filter: grayscale(100%);'}">
                </div>
                <div class="dex-name" style="color: ${isDiscovered ? type.color : '#666'}; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px ${isDiscovered ? type.color : 'transparent'};">${type.name}</div>
                <div class="dex-tier" style="margin-top: 8px; font-size: 12px;">
                    <div style="color: ${isDiscovered ? '#94a3b8' : '#555'};">碰撞质量: ${10 + type.tier * 2}</div>
                    <div style="color: ${isDiscovered ? '#94a3b8' : '#555'}; margin-top:3px;">护盾血量: ${type.hp}</div>
                </div>
                <div style="font-size: 13px; margin-top: 10px; font-weight: bold; color: ${isOwned ? '#38bdf8' : (isDiscovered ? '#fbbf24' : '#555')}">
                    ${isOwned ? `现役数量: ${ownedCount} 阵列` : (isDiscovered ? '已收录' : '未解锁')}
                </div>
            `;
            itemDiv.innerHTML = html;
            dexGrid.appendChild(itemDiv);
        });
    }
    else if (id === 'modalSpecialTops') {
        renderSpecialTopsModal();
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// --- 部署基准陀螺逻辑 ---
function deployBaseTop() {
    let tData = getTowerData();
    let baseObj = TOP_TYPES.find(t => t.tier === arenaData.baseTier);
    if (!baseObj) return;

    if (tData.points >= baseObj.cost) {
        if (autoDeployToGrid(baseObj.id)) { // 尝试扣费并真正发兵
            tData.points -= baseObj.cost;
            localStorage.setItem(TOWER_KEY, JSON.stringify(tData));
            updateHUD();
        }
    } else {
        alert("长官，积分别不够用啦，快去写作业！");
    }
}

// --- 转盘抽奖逻辑 ---
let wheelRotation = 0;
let isSpinning = false;

// 绘制转盘
function drawWheel() {
    const canvas = document.getElementById('gachaWheel');
    if (!canvas) {
        console.log('Canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Context not available');
        return;
    }
    
    console.log('Drawing wheel...');
    
    // 设置canvas尺寸
    canvas.width = 350;
    canvas.height = 350;
    
    const centerX = 175;
    const centerY = 175;
    const radius = 150;
    
    // 填充背景色
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, 350, 350);
    
    // 获取当前基准陀螺等级
    const baseTier = arenaData.baseTier || 1;
    const rewardTiers = [
        Math.min(baseTier + 3, 50),
        Math.min(baseTier + 4, 50),
        Math.min(baseTier + 5, 50),
        Math.min(baseTier + 6, 50)
    ];
    
    // 扇形配置
    const segments = [
        { tier: rewardTiers[0], angle: 144, color: '#0ea5e9', prob: 40 },
        { tier: rewardTiers[1], angle: 108, color: '#8b5cf6', prob: 30 },
        { tier: rewardTiers[2], angle: 72, color: '#f59e0b', prob: 20 },
        { tier: rewardTiers[3], angle: 36, color: '#ef4444', prob: 10 }
    ];
    
    let currentAngle = -90;
    
    segments.forEach((seg) => {
        const startAngle = (currentAngle * Math.PI) / 180;
        const endAngle = ((currentAngle + seg.angle) * Math.PI) / 180;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // 填充颜色
        ctx.fillStyle = seg.color;
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 文字
        const textAngle = (currentAngle + seg.angle / 2) * Math.PI / 180;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.6);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.6);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LV' + seg.tier, 0, -8);
        ctx.font = '12px Arial';
        ctx.fillText(seg.prob + '%', 0, 10);
        ctx.restore();
        
        currentAngle += seg.angle;
    });
    
    // 外圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // 内圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    console.log('Wheel drawn');
}

// 转动转盘
function spinWheel() {
    if (isSpinning) return;
    
    if (arenaData.gachaTickets <= 0) {
        alert("🎫 抽奖券余额不足！去完成作业或作文来获取券吧！");
        return;
    }
    
    isSpinning = true;
    const btn = document.getElementById('btnDoGacha');
    btn.disabled = true;
    btn.textContent = '🎰 转盘中...';
    
    // 扣除抽奖券
    arenaData.gachaTickets -= 1;
    saveData();
    document.getElementById('gachaTickets').textContent = arenaData.gachaTickets;
    
    const canvas = document.getElementById('gachaWheel');
    
    // 确定奖励（根据概率）
    const baseTier = arenaData.baseTier;
    const rand = Math.random() * 100;
    let targetTier;
    let targetAngle;
    
    // 概率：+3级 40%, +4级 30%, +5级 20%, +6级 10%
    // 注意：转盘从-90度（顶部）开始绘制，所以角度需要调整
    let targetSectorStart, targetSectorEnd;
    if (rand < 40) {
        targetTier = Math.min(baseTier + 3, 50);
        targetSectorStart = 0;    // 0-144度
        targetSectorEnd = 144;
    } else if (rand < 70) {
        targetTier = Math.min(baseTier + 4, 50);
        targetSectorStart = 144;  // 144-252度
        targetSectorEnd = 252;
    } else if (rand < 90) {
        targetTier = Math.min(baseTier + 5, 50);
        targetSectorStart = 252;  // 252-324度
        targetSectorEnd = 324;
    } else {
        targetTier = Math.min(baseTier + 6, 50);
        targetSectorStart = 324;  // 324-360度
        targetSectorEnd = 360;
    }
    
    // 在目标扇区内随机选择一个角度
    targetAngle = targetSectorStart + Math.random() * (targetSectorEnd - targetSectorStart);
    
    // 计算最终角度（加上多圈旋转）
    // 指针在顶部（0度位置），所以要让目标扇区停在顶部，需要旋转到 -targetAngle
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7圈
    const finalRotation = wheelRotation + spins * 360 - targetAngle;
    
    // 动画参数
    const duration = 4000; // 4秒
    const startTime = Date.now();
    const startRotation = wheelRotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数（先快后慢）
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        wheelRotation = startRotation + (finalRotation - startRotation) * easeOut;
        canvas.style.transform = `rotate(${wheelRotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画结束
            isSpinning = false;
            btn.disabled = false;
            btn.textContent = '🎲 转动转盘';
            
            // 显示结果
            showGachaResult(targetTier);
        }
    }
    
    animate();
}

// 显示抽奖结果
function showGachaResult(tier) {
    const topType = TOP_TYPES.find(t => t.tier === tier);
    
    // 创建结果弹窗
    const resultDiv = document.createElement('div');
    resultDiv.className = 'gacha-result';
    
    // 生成陀螺预览图
    const previewDataUrl = renderTopPreview(topType, 150);
    
    resultDiv.innerHTML = `
        <h3>🎉 恭喜获得！</h3>
        <div class="top-preview-large">
            <img src="${previewDataUrl}" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        <div style="font-size: 24px; font-weight: bold; color: ${topType.color}; margin-bottom: 10px;">${topType.name}</div>
        <div style="color: #94a3b8; margin-bottom: 20px;">血量: ${topType.hp} | 等级: ${topType.tier}</div>
        <button class="btn-action" onclick="this.parentElement.remove(); deployGachaResult(${topType.id})" style="padding: 12px 30px; font-size: 16px;">🚀 部署到战场</button>
    `;
    
    document.body.appendChild(resultDiv);
}

// 部署抽奖结果到战场
function deployGachaResult(topId) {
    if (autoDeployToGrid(topId)) {
        const topType = TOP_TYPES.find(t => t.id === topId);
        closeModal('modalGacha');
    } else {
        alert('⚠️ 战场已满，无法部署更多陀螺！');
    }
}

// --- 作业效率评定与陀螺兑换逻辑 ---

// 评定奖励钻石（1-3颗）
function awardEfficiencyStar(starCount) {
    arenaData.efficiencyStars += starCount;
    saveData();
    document.getElementById('efficiencyStars').textContent = arenaData.efficiencyStars;
    
    // 刷新兑换卡片状态
    renderExchangeCards();
    
    alert(`⭐️ 已成功发放 ${starCount} 颗钻石！`);
}

// 渲染兑换卡片网格
function renderExchangeCards() {
    const grid = document.getElementById('exchangeGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // 定义每个等级陀螺所需的钻石数 (LV1-LV50)
    // 价格设计：让孩子能够通过努力逐步兑换，每天最多3颗钻石
    const diamondCosts = {
        1: 1, 2: 2, 3: 3, 4: 5, 5: 7,      // 1-2天可兑换
        6: 9, 7: 12, 8: 15, 9: 18, 10: 22,   // 3-7天可兑换
        11: 27, 12: 33, 13: 40, 14: 48, 15: 57,   // 9-19天可兑换
        16: 67, 17: 78, 18: 90, 19: 103, 20: 117,  // 22-39天可兑换
        21: 132, 22: 148, 23: 165, 24: 183, 25: 202,  // 44-67天可兑换
        26: 222, 27: 243, 28: 265, 29: 288, 30: 312,  // 74-104天可兑换
        31: 337, 32: 363, 33: 390, 34: 418, 35: 447,  // 112-149天可兑换
        36: 477, 37: 508, 38: 540, 39: 573, 40: 607,  // 159-202天可兑换
        41: 642, 42: 678, 43: 715, 44: 753, 45: 792,  // 214-264天可兑换
        46: 832, 47: 873, 48: 915, 49: 958, 50: 1002  // 277-334天可兑换
    };

    // 计算当前能支付的最高等级
    let maxAffordableTier = 0;
    for (let tier = 1; tier <= 50; tier++) {
        if (arenaData.efficiencyStars >= diamondCosts[tier]) {
            maxAffordableTier = tier;
        }
    }

    // 显示范围：能支付的最高等级 + 5，但至少显示到LV5
    let maxDisplayTier = Math.max(5, maxAffordableTier + 5);
    maxDisplayTier = Math.min(maxDisplayTier, 50); // 不超过50

    TOP_TYPES.forEach(type => {
        // 如果超过显示范围，跳过
        if (type.tier > maxDisplayTier) return;

        const cost = diamondCosts[type.tier];
        const canAfford = arenaData.efficiencyStars >= cost;

        const card = document.createElement('div');
        card.className = `exchange-card ${canAfford ? 'available' : 'locked'}`;

        // 生成3D预览图
        const previewDataUrl = renderTopPreview(type, 100);

        card.innerHTML = `
            <div class="exchange-preview">
                <img src="${previewDataUrl}" alt="${type.name}">
            </div>
            <div class="exchange-info">
                <div class="exchange-name">${type.name}</div>
                <div class="exchange-stats">血量: ${type.hp}</div>
                <div class="exchange-cost">
                    <span class="cost-value">${cost}</span> 💎
                </div>
            </div>
            <button class="btn-exchange" ${canAfford ? '' : 'disabled'} onclick="exchangeForTop(${type.id}, ${cost})">
                ${canAfford ? '立即兑换' : '钻石不足'}
            </button>
        `;

        grid.appendChild(card);
    });
}

// 兑换陀螺并部署到战场
function exchangeForTop(topId, cost) {
    if (arenaData.efficiencyStars < cost) {
        alert("💎 钻石不足！");
        return;
    }
    
    // 尝试自动部署到网格
    if (autoDeployToGrid(topId)) {
        // 扣除钻石
        arenaData.efficiencyStars -= cost;
        saveData();
        
        // 更新显示
        document.getElementById('efficiencyStars').textContent = arenaData.efficiencyStars;
        
        // 刷新兑换卡片
        renderExchangeCards();
        
        // 获取陀螺信息
        const topType = TOP_TYPES.find(t => t.id === topId);
        alert(`🎉 成功兑换 ${topType.name}！已自动部署到战场！`);
        
        // 关闭弹窗
        closeModal('modalEfficiency');
    } else {
        alert("⚠️ 战场已满，无法部署更多陀螺！");
    }
}

// 修改openModal函数，在打开效率弹窗时渲染卡片
const originalOpenModal = openModal;
openModal = function(id) {
    // 调用原来的openModal函数
    originalOpenModal(id);
    
    if (id === 'modalEfficiency') {
        document.getElementById('efficiencyStars').textContent = arenaData.efficiencyStars;
        renderExchangeCards();
    }
    else if (id === 'modalGacha') {
        // 已在originalOpenModal中处理
    }
    else if (id === 'modalDex') {
        let dexGrid = document.getElementById('dexGrid');
        dexGrid.innerHTML = '';
        
        TOP_TYPES.forEach(type => {
            let isDiscovered = arenaData.discoveredTops && arenaData.discoveredTops.includes(type.id);
            let ownedCount = arenaData.inventory.filter(item => item.id === type.id).length;
            let isOwned = ownedCount > 0;
            
            let itemDiv = document.createElement('div');
            itemDiv.className = 'dex-item';
            
            if (isDiscovered) {
                itemDiv.style.border = `2px solid ${type.color}`;
                itemDiv.style.boxShadow = `inset 0 0 15px ${type.color}, 0 0 10px ${type.color}`;
                itemDiv.style.background = 'rgba(255,255,255,0.1)';
            } else {
                itemDiv.style.border = '2px solid #333';
                itemDiv.style.filter = 'grayscale(100%) opacity(0.5)';
                itemDiv.style.background = 'rgba(0,0,0,0.3)';
            }
            
            let previewDataUrl = renderTopPreview(type, 140);
            
            let html = `
                <div class="dex-preview-container" style="position: relative; width: 100%; height: 100px; display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                    <img src="${previewDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; ${isDiscovered ? '' : 'filter: grayscale(100%);'}">
                </div>
                <div class="dex-name" style="color: ${isDiscovered ? type.color : '#666'}; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px ${isDiscovered ? type.color : 'transparent'};">${type.name}</div>
                <div class="dex-tier" style="margin-top: 8px; font-size: 12px;">
                    <div style="color: ${isDiscovered ? '#94a3b8' : '#555'};">碰撞质量: ${10 + type.tier * 2}</div>
                    <div style="color: ${isDiscovered ? '#94a3b8' : '#555'}; margin-top:3px;">护盾血量: ${type.hp}</div>
                </div>
                <div style="font-size: 13px; margin-top: 10px; font-weight: bold; color: ${isOwned ? '#38bdf8' : (isDiscovered ? '#fbbf24' : '#555')}">
                    ${isOwned ? `现役数量: ${ownedCount} 阵列` : (isDiscovered ? '已收录' : '未解锁')}
                </div>
            `;
            itemDiv.innerHTML = html;
            dexGrid.appendChild(itemDiv);
        });
    }
}


// ===== 基准陀螺升级系统 =====

// 每个等级需要的碎片数量
const FRAGMENT_REQUIREMENTS = {
    1: 3,  // LV1->LV2 需要3个碎片
    2: 4,  // LV2->LV3 需要4个碎片
    3: 5,  // LV3->LV4 需要5个碎片
    4: 6,  // LV4->LV5 需要6个碎片
    5: 7,  // LV5->LV6 需要7个碎片
    6: 8,  // LV6->LV7 需要8个碎片
    7: 10, // LV7->LV8 需要10个碎片
    8: 12, // LV8->LV9 需要12个碎片
    9: 15, // LV9->LV10 需要15个碎片
    10: 20 // LV10->LV11 需要20个碎片
};

// 获取当前等级需要的碎片数
function getRequiredFragments(tier) {
    return FRAGMENT_REQUIREMENTS[tier] || 3;
}

// 切换任务完成状态并领取碎片
function toggleFragment(taskType) {
    // Z键验证
    if (!isZKeyPressed) {
        const checkbox = document.getElementById(`check${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`);
        checkbox.checked = false;
        return;
    }
    
    const today = new Date().toLocaleDateString('zh-CN');
    
    // 检查是否是新的一天
    if (arenaData.dailyTasks.date !== today) {
        arenaData.dailyTasks = {
            homework: false,
            essay: false,
            perfect: false,
            date: today
        };
    }
    
    const checkbox = document.getElementById(`check${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`);
    const label = document.getElementById(`label${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`);
    const status = document.getElementById(`status${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`);
    
    if (checkbox.checked && !arenaData.dailyTasks[taskType]) {
        // 领取碎片
        arenaData.dailyTasks[taskType] = true;
        arenaData.fragments++;
        
        // 如果是"作业全对"，额外奖励1张抽奖券
        if (taskType === 'perfect') {
            arenaData.gachaTickets++;
            showTicketToast();
        }
        
        // 检查是否升级
        checkUpgrade();
        
        // 检查是否三项任务都完成，奖励特殊陀螺券
        checkAndAwardSpecialTicket();
        
        saveData();
        
        // 更新UI
        label.classList.add('completed');
        status.textContent = '已领取';
        
        // 播放气泡动画
        playBubbleAnimation();
        
        // 刷新升级示意图
        renderUpgradeVisual();
        
        // 显示获得碎片提示
        showFragmentToast();
    } else if (!checkbox.checked) {
        checkbox.checked = true;
    }
}

// 检查是否升级
function checkUpgrade() {
    const required = getRequiredFragments(arenaData.baseTier);
    
    if (arenaData.fragments >= required) {
        // 升级
        arenaData.fragments -= required;
        if (arenaData.baseTier < 50) {
            arenaData.baseTier++;
        }

        // 显示升级成功动画
        setTimeout(() => {
            alert(`🎉 恭喜！基准陀螺升级到 LV${arenaData.baseTier}！`);
            renderUpgradeVisual();
        }, 500);
    }
}

// 播放气泡动画
function playBubbleAnimation() {
    const container = document.getElementById('bubbleContainer');
    if (!container) return;
    
    // 创建多个气泡
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.left = `${45 + Math.random() * 10}%`;
            bubble.style.animationDelay = `${Math.random() * 0.5}s`;
            bubble.style.animationDuration = `${1.5 + Math.random()}s`;
            container.appendChild(bubble);
            
            // 动画结束后移除
            setTimeout(() => {
                bubble.remove();
            }, 2500);
        }, i * 100);
    }
}

// 显示获得碎片提示
function showFragmentToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: #000;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(251, 191, 36, 0.5);
        animation: toastPop 0.5s ease;
    `;
    toast.textContent = '🧩 +1 碎片！';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastFade 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// 显示获得抽奖券提示
function showTicketToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #a855f7, #7c3aed);
        color: #fff;
        padding: 15px 30px;
        border-radius: 15px;
        font-size: 20px;
        font-weight: bold;
        z-index: 10001;
        box-shadow: 0 10px 40px rgba(168, 85, 247, 0.5);
        animation: toastPop 0.5s ease;
    `;
    toast.textContent = '🎫 +1 抽奖券！';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastFade 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// 渲染升级示意图
function renderUpgradeVisual() {
    const currentTier = arenaData.baseTier;
    const nextTier = Math.min(currentTier + 1, 50);
    const fragments = arenaData.fragments;
    const required = getRequiredFragments(currentTier);
    
    // 更新文字
    document.getElementById('currentLevelName').textContent = `LV${currentTier}`;
    document.getElementById('nextLevelName').textContent = `LV${nextTier}`;
    document.getElementById('currentFragments').textContent = fragments;
    document.getElementById('requiredFragments').textContent = required;
    
    // 渲染当前等级陀螺
    const currentCanvas = document.getElementById('currentLevelCanvas');
    if (currentCanvas) {
        const currentType = TOP_TYPES.find(t => t.tier === currentTier);
        renderTopToCanvas(currentType, currentCanvas);
    }
    
    // 渲染下一等级陀螺（带碎片遮罩）
    const nextCanvas = document.getElementById('nextLevelCanvas');
    if (nextCanvas) {
        const nextType = TOP_TYPES.find(t => t.tier === nextTier);
        renderTopToCanvas(nextType, nextCanvas);
        
        // 添加碎片进度遮罩
        updateFragmentOverlay(fragments, required);
    }
}

// 渲染陀螺到指定canvas
function renderTopToCanvas(type, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 检查type是否有效
    if (!type || !type.tier) {
        // 显示错误提示
        ctx.fillStyle = '#ef4444';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('陀螺数据错误', canvas.width / 2, canvas.height / 2);
        return;
    }

    // 使用现有的renderTopPreview逻辑，但直接绘制到canvas
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;
    const r = 35;
    const t = type.tier;
    const hRatio = 0.55;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, r * hRatio + 5, r, r * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 光环底圈
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 3, r * 1.2, r * 1.2 * hRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 中心支撑柱
    let pegR = 2 + t * 0.3;
    let pegH = Math.floor(r * hRatio + 5);
    for (let py = pegH; py >= 0; py--) {
        ctx.beginPath();
        ctx.ellipse(0, py, pegR, pegR * hRatio, 0, 0, Math.PI * 2);
        if (py === pegH) {
            ctx.fillStyle = type.color;
        } else {
            let pegGrad = ctx.createLinearGradient(-pegR, 0, pegR, 0);
            pegGrad.addColorStop(0, '#111');
            pegGrad.addColorStop(0.3, '#f8fafc');
            pegGrad.addColorStop(0.8, '#475569');
            pegGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = pegGrad;
        }
        ctx.fill();
    }
    
    // 根据等级定义3D切片组
    let parts = [];
    if (t === 1) {
        parts.push({ scale: 1.0, height: 4, color: type.color });
    } else if (t === 2) {
        parts.push({ scale: 1.0, height: 5, color: '#555' });
        parts.push({ scale: 0.8, height: 4, color: type.color, dots: 2 });
    } else if (t === 3) {
        parts.push({ scale: 0.7, height: 4, color: '#333' });
        parts.push({ scale: 1.1, height: 6, color: type.color, dots: 3 });
    } else if (t === 4) {
        parts.push({ scale: 0.6, height: 5, color: '#555' });
        parts.push({ scale: 1.0, height: 6, color: type.color, dots: 4 });
        parts.push({ scale: 0.4, height: 5, color: '#fff' });
    } else if (t === 5) {
        parts.push({ scale: 0.9, height: 3, color: type.color });
        parts.push({ scale: 1.0, height: 7, color: '#2b2b2b', dots: 5 });
        parts.push({ scale: 0.7, height: 6, color: type.color });
    } else if (t === 6) {
        parts.push({ scale: 1.0, height: 8, color: type.color, dots: 3 });
        parts.push({ scale: 0.9, height: 2, color: '#fff' });
        parts.push({ scale: 0.5, height: 8, color: '#111' });
        parts.push({ scale: 0.3, height: 4, color: type.color });
    } else if (t === 7) {
        parts.push({ scale: 0.4, height: 6, color: '#111' });
        parts.push({ scale: 1.2, height: 5, color: type.color, dots: 6 });
        parts.push({ scale: 0.5, height: 7, color: '#ccc', dots: 3, rev: true });
    } else if (t === 8) {
        parts.push({ scale: 0.8, height: 6, color: '#222' });
        parts.push({ scale: 1.1, height: 7, color: type.color, dots: 4 });
        parts.push({ scale: 0.9, height: 5, color: '#fff' });
        parts.push({ scale: 0.5, height: 9, color: type.color, dots: 4, rev: true });
    } else if (t === 9) {
        parts.push({ scale: 0.7, height: 5, color: '#000' });
        parts.push({ scale: 1.0, height: 9, color: type.color, dots: 8 });
        parts.push({ scale: 0.8, height: 3, color: '#333' });
        parts.push({ scale: 0.6, height: 6, color: type.color, dots: 4 });
        parts.push({ scale: 0.2, height: 12, color: '#fff' });
    } else if (t === 10) {
        parts.push({ scale: 0.5, height: 6, color: '#0f172a' });
        parts.push({ scale: 1.2, height: 9, color: type.color, dots: 10 });
        parts.push({ scale: 1.0, height: 5, color: '#fff' });
        parts.push({ scale: 0.7, height: 7, color: type.color, dots: 5, rev: true });
        parts.push({ scale: 0.3, height: 15, color: '#fbbf24' });
    } else if (t === 11) {
        parts.push({ scale: 0.6, height: 8, color: '#1e293b' });
        parts.push({ scale: 1.0, height: 7, color: '#cbd5e1', dots: 6 });
        parts.push({ scale: 1.3, height: 6, color: type.color, dots: 12, rev: true });
        parts.push({ scale: 0.8, height: 5, color: '#fff' });
        parts.push({ scale: 0.4, height: 18, color: type.color });
    } else if (t === 12) {
        parts.push({ scale: 0.5, height: 10, color: '#0f172a' });
        parts.push({ scale: 1.1, height: 8, color: type.color, dots: 8 });
        parts.push({ scale: 1.4, height: 5, color: '#fff', dots: 4 });
        parts.push({ scale: 1.0, height: 6, color: type.color, dots: 6, rev: true });
        parts.push({ scale: 0.3, height: 22, color: '#fbbf24' });
    } else if (t <= 20) {
        // LV13-20: 动物系列风格 - 更流线型
        let intensity = (t - 12) / 8;
        parts.push({ scale: 0.4 + intensity * 0.2, height: 8 + intensity * 4, color: '#1e293b' });
        parts.push({ scale: 1.0 + intensity * 0.3, height: 6 + intensity * 2, color: type.color, dots: Math.floor(8 + intensity * 8) });
        parts.push({ scale: 0.9, height: 4, color: '#fff' });
        parts.push({ scale: 0.6, height: 10 + intensity * 5, color: type.color, dots: Math.floor(6 + intensity * 4), rev: true });
        parts.push({ scale: 0.25, height: 25 + intensity * 10, color: '#fbbf24' });
    } else if (t <= 30) {
        // LV21-30: 神话系列风格 - 更华丽
        let intensity = (t - 20) / 10;
        parts.push({ scale: 0.5, height: 12, color: '#0f172a' });
        parts.push({ scale: 0.8, height: 5, color: '#cbd5e1', dots: 6 });
        parts.push({ scale: 1.2 + intensity * 0.2, height: 8 + intensity * 4, color: type.color, dots: Math.floor(10 + intensity * 10) });
        parts.push({ scale: 1.0, height: 6, color: '#fff', dots: 4 });
        parts.push({ scale: 0.7, height: 12 + intensity * 6, color: type.color, dots: Math.floor(8 + intensity * 6), rev: true });
        parts.push({ scale: 0.3, height: 30 + intensity * 15, color: '#fbbf24' });
    } else if (t <= 40) {
        // LV31-40: 元素系列风格 - 更几何化
        let intensity = (t - 30) / 10;
        parts.push({ scale: 0.6, height: 10, color: '#1e293b' });
        parts.push({ scale: 1.0, height: 4, color: '#94a3b8', dots: 8 });
        parts.push({ scale: 1.3 + intensity * 0.2, height: 10 + intensity * 3, color: type.color, dots: Math.floor(12 + intensity * 8) });
        parts.push({ scale: 1.1, height: 5, color: '#e2e8f0' });
        parts.push({ scale: 0.9, height: 8, color: type.color, dots: 6 });
        parts.push({ scale: 0.5, height: 15 + intensity * 10, color: type.color, dots: Math.floor(6 + intensity * 4), rev: true });
        parts.push({ scale: 0.2, height: 40 + intensity * 20, color: '#fbbf24' });
    } else {
        // LV41-50: 传说系列风格 - 最华丽
        let intensity = (t - 40) / 10;
        parts.push({ scale: 0.7, height: 15, color: '#0f172a' });
        parts.push({ scale: 1.1, height: 6, color: '#64748b', dots: 10 });
        parts.push({ scale: 1.4, height: 8, color: '#fff', dots: 6 });
        parts.push({ scale: 1.5 + intensity * 0.1, height: 12 + intensity * 4, color: type.color, dots: Math.floor(16 + intensity * 8) });
        parts.push({ scale: 1.2, height: 6, color: '#e2e8f0', dots: 8 });
        parts.push({ scale: 0.8, height: 18 + intensity * 8, color: type.color, dots: Math.floor(10 + intensity * 6), rev: true });
        parts.push({ scale: 0.4, height: 50 + intensity * 30, color: '#fbbf24' });
    }

    // 从底部向顶部渲染3D实体
    let currentY = 0;
    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
        let part = parts[pIdx];
        let layerR = r * part.scale;
        let layerH = part.height;
        
        // 绘制侧表面
        for (let i = layerH; i > 0; i--) {
            let y = currentY - i;
            ctx.beginPath();
            ctx.ellipse(0, y, layerR, layerR * hRatio, 0, 0, Math.PI * 2);
            
            let sideGrad = ctx.createLinearGradient(-layerR, 0, layerR, 0);
            sideGrad.addColorStop(0, shadeColor(part.color, -50));
            sideGrad.addColorStop(0.3, part.color);
            sideGrad.addColorStop(0.7, shadeColor(part.color, -60));
            sideGrad.addColorStop(1, shadeColor(part.color, -80));
            
            ctx.fillStyle = sideGrad;
            ctx.fill();
        }
        
        // 绘制顶面
        currentY -= layerH;
        ctx.beginPath();
        ctx.ellipse(0, currentY, layerR, layerR * hRatio, 0, 0, Math.PI * 2);
        
        let topGrad = ctx.createLinearGradient(-layerR, currentY - layerR, layerR, currentY + layerR);
        topGrad.addColorStop(0, '#ffffff');
        topGrad.addColorStop(0.4, part.color);
        topGrad.addColorStop(1, shadeColor(part.color, -30));
        
        ctx.fillStyle = topGrad;
        ctx.fill();
        
        ctx.lineWidth = Math.max(0.5, layerR * 0.05);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
        
        // 科幻光环
        if (part.dots > 0) {
            ctx.save();
            ctx.translate(0, currentY);
            ctx.scale(1, hRatio);
            ctx.rotate(Date.now() * 0.001 * (part.rev ? -1.5 : 1.0));
            
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            let dotR = layerR * 0.75;
            for (let a = 0; a < part.dots; a++) {
                let rad = (a * Math.PI * 2) / part.dots;
                ctx.beginPath();
                ctx.arc(Math.cos(rad) * dotR, Math.sin(rad) * dotR, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
    
    ctx.restore();
}

// 更新碎片进度遮罩
function updateFragmentOverlay(fragments, required) {
    const overlay = document.getElementById('fragmentOverlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';
    
    const percentage = fragments / required;
    
    // 创建扇形表示进度
    if (percentage > 0) {
        const sector = document.createElement('div');
        sector.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            transform-origin: 0 0;
            background: conic-gradient(from 0deg, rgba(251, 191, 36, 0.7) 0deg, rgba(251, 191, 36, 0.7) ${percentage * 360}deg, transparent ${percentage * 360}deg);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            clip-path: circle(50%);
        `;
        overlay.appendChild(sector);
    }
}

// 初始化基准陀螺弹窗
function initBaseTopModal() {
    const today = new Date().toLocaleDateString('zh-CN');
    
    // 检查是否是新的一天
    if (arenaData.dailyTasks.date !== today) {
        arenaData.dailyTasks = {
            homework: false,
            essay: false,
            perfect: false,
            date: today
        };
        saveData();
    }
    
    // 设置复选框状态
    const tasks = ['homework', 'essay', 'perfect'];
    tasks.forEach(task => {
        const checkbox = document.getElementById(`check${task.charAt(0).toUpperCase() + task.slice(1)}`);
        const label = document.getElementById(`label${task.charAt(0).toUpperCase() + task.slice(1)}`);
        const status = document.getElementById(`status${task.charAt(0).toUpperCase() + task.slice(1)}`);
        
        if (checkbox && arenaData.dailyTasks[task]) {
            checkbox.checked = true;
            label.classList.add('completed');
            status.textContent = '已领取';
        }
    });
    
    // 渲染升级示意图
    renderUpgradeVisual();
    
    // 启动持续气泡动画
    startContinuousBubbles();
}

// 持续气泡动画
let bubbleInterval = null;
function startContinuousBubbles() {
    // 清除之前的定时器
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
    }
    
    const container = document.getElementById('bubbleContainer');
    if (!container) return;
    
    // 立即创建一些气泡
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createBubble(container), i * 300);
    }
    
    // 持续创建气泡
    bubbleInterval = setInterval(() => {
        createBubble(container);
    }, 400);
}

// ===== 特殊陀螺奖励券系统 =====
// 获取奖励券数量
function getSpecialTickets() {
    const data = localStorage.getItem(SPECIAL_TICKETS_KEY);
    return data ? parseInt(data) : 0;
}

// 获取已拥有的特殊陀螺列表
function getOwnedSpecialTops() {
    const data = localStorage.getItem(SPECIAL_TOPS_KEY);
    return data ? JSON.parse(data) : [];
}

// 检查并奖励特殊陀螺券
function checkAndAwardSpecialTicket() {
    const tasks = arenaData.dailyTasks;
    // 检查三项任务是否都已完成
    const allCompleted = tasks.homework && tasks.essay && tasks.perfect;
    
    if (allCompleted) {
        // 检查今天是否已经领取过奖励券
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem(SPECIAL_TOPS_DATE_KEY);
        
        if (lastDate !== today) {
            // 奖励一张特殊陀螺券
            const currentTickets = getSpecialTickets();
            localStorage.setItem(SPECIAL_TICKETS_KEY, currentTickets + 1);
            localStorage.setItem(SPECIAL_TOPS_DATE_KEY, today);
            
            // 显示奖励提示
            setTimeout(() => {
                showSpecialTicketToast();
            }, 800);
        }
    }
}

// 显示特殊陀螺券奖励提示
function showSpecialTicketToast() {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 20px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(239, 68, 68, 0.5);
        text-align: center;
    `;
    toast.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">🎴</div>
        <div>恭喜完成今日三项任务！</div>
        <div style="margin-top: 10px; font-size: 16px;">获得特殊陀螺奖励券 × 1</div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ===== 特殊陀螺奖励页面渲染 =====
function renderSpecialTopsModal() {
    const tickets = getSpecialTickets();
    document.getElementById('specialTickets').textContent = tickets;
    
    const grid = document.getElementById('specialTopsGrid');
    grid.innerHTML = '';
    
    const ownedSpecialTops = getOwnedSpecialTops();
    
    // 渲染每个特殊陀螺
    SPECIAL_TOPS.forEach(top => {
        const isOwned = ownedSpecialTops.includes(top.id);
        const card = document.createElement('div');
        card.className = `special-top-card ${isOwned ? 'owned' : ''}`;
        card.dataset.topId = top.id;
        
        card.innerHTML = `
            <div class="special-top-preview">${top.emoji}</div>
            <div class="special-top-name">${top.name}</div>
            <div class="special-top-desc">${top.description}</div>
            <div class="special-top-stats">
                <span>血量: ${top.hp}</span>
                <span>质量: ${top.baseMass}</span>
            </div>
            <button class="btn-claim-special ${isOwned ? 'owned' : ''}" 
                    onclick="claimSpecialTop('${top.id}', this)" 
                    ${isOwned || tickets < 1 ? 'disabled' : ''}>
                ${isOwned ? '已拥有' : '兑换 (1张券)'}
            </button>
        `;
        
        grid.appendChild(card);
    });
}

// 领取特殊陀螺
function claimSpecialTop(topId, btnEl) {
    if (!useSpecialTicket()) {
        alert('奖励券不足！');
        return;
    }
    
    const owned = getOwnedSpecialTops();
    if (owned.includes(topId)) {
        alert('您已经拥有这个特殊陀螺了！');
        return;
    }
    
    // 添加到拥有列表
    owned.push(topId);
    localStorage.setItem(SPECIAL_TOPS_KEY, JSON.stringify(owned));
    
    // 将特殊陀螺添加到战场库存
    const top = SPECIAL_TOPS.find(t => t.id === topId);
    if (top) {
        // 寻找棋盘上的空位
        let placed = false;
        for (let r = 0; r < GRID_ROWS && !placed; r++) {
            for (let c = 0; c < GRID_COLS && !placed; c++) {
                // 检查这个位置是否已被占用（只检查已放置在棋盘上的陀螺）
                const occupied = arenaData.inventory.some(item => 
                    item.gridR >= 0 && item.gridC >= 0 && item.gridR === r && item.gridC === c
                );
                if (!occupied) {
                    // 找到空位，放置特殊陀螺
                    arenaData.inventory.push({
                        id: topId,
                        isSpecial: true,
                        gridR: r,
                        gridC: c
                    });
                    placed = true;
                }
            }
        }
        
        if (!placed) {
            // 棋盘满了，放入库存但不放置
            arenaData.inventory.push({
                id: topId,
                isSpecial: true,
                gridR: -1,
                gridC: -1
            });
            alert(`恭喜获得 ${top.name}！棋盘已满，已放入库存。`);
        } else {
            alert(`恭喜获得 ${top.name}！已自动部署到棋盘。`);
        }
        
        saveData();
        
        // 刷新棋盘显示
        reloadAssetsFromInventory();
        
        // 更新按钮状态
        btnEl.textContent = '已拥有';
        btnEl.classList.add('owned');
        btnEl.disabled = true;
        
        // 更新卡片样式
        const card = btnEl.closest('.special-top-card');
        card.classList.add('owned');
        
        // 更新券数量显示
        document.getElementById('specialTickets').textContent = getSpecialTickets();
    }
}

// 使用奖励券
function useSpecialTicket() {
    const tickets = getSpecialTickets();
    if (tickets > 0) {
        localStorage.setItem(SPECIAL_TICKETS_KEY, tickets - 1);
        return true;
    }
    return false;
}

function createBubble(container) {
    if (!container) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${40 + Math.random() * 20}%`;
    bubble.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
    container.appendChild(bubble);
    
    // 动画结束后移除
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.remove();
        }
    }, 4000);
}

// 修改openModal函数，添加基准陀螺弹窗初始化
const originalOpenModalBase = openModal;
openModal = function(id) {
    // 调用之前的openModal函数（它会调用最原始的openModal）
    originalOpenModalBase(id);
    
    if (id === 'modalBaseInfo') {
        initBaseTopModal();
    }
    else if (id === 'modalEfficiency') {
        document.getElementById('efficiencyStars').textContent = arenaData.efficiencyStars;
        renderExchangeCards();
    }
    else if (id === 'modalGacha') {
        // 已在originalOpenModal中处理
    }
    else if (id === 'modalDex') {
        let dexGrid = document.getElementById('dexGrid');
        dexGrid.innerHTML = '';

        // 计算最高已发现的陀螺等级
        let maxDiscoveredTier = 0;
        if (arenaData.discoveredTops && arenaData.discoveredTops.length > 0) {
            arenaData.discoveredTops.forEach(topId => {
                const topType = TOP_TYPES.find(t => t.id === topId);
                if (topType && topType.tier > maxDiscoveredTier) {
                    maxDiscoveredTier = topType.tier;
                }
            });
        }

        // 显示范围：最高已发现等级 + 6，但至少显示到LV6
        let maxDisplayTier = Math.max(6, maxDiscoveredTier + 6);
        maxDisplayTier = Math.min(maxDisplayTier, 50); // 不超过50

        // 只显示到maxDisplayTier的陀螺
        TOP_TYPES.forEach(type => {
            // 如果超过显示范围，跳过
            if (type.tier > maxDisplayTier) return;

            let isDiscovered = arenaData.discoveredTops && arenaData.discoveredTops.includes(type.id);
            let ownedCount = arenaData.inventory.filter(item => item.id === type.id).length;
            let isOwned = ownedCount > 0;

            let itemDiv = document.createElement('div');
            itemDiv.className = 'dex-item';

            if (isDiscovered) {
                itemDiv.style.border = `2px solid ${type.color}`;
                itemDiv.style.boxShadow = `inset 0 0 15px ${type.color}, 0 0 10px ${type.color}`;
                itemDiv.style.background = 'rgba(255,255,255,0.1)';
            } else {
                itemDiv.style.border = '2px solid #333';
                itemDiv.style.filter = 'grayscale(100%) opacity(0.5)';
                itemDiv.style.background = 'rgba(0,0,0,0.3)';
            }

            let previewDataUrl = renderTopPreview(type, 140);

            let html = `
                <div class="dex-preview-container" style="position: relative; width: 100%; height: 100px; display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                    <img src="${previewDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; ${isDiscovered ? '' : 'filter: grayscale(100%;'}">
                </div>
                <div class="dex-name" style="color: ${isDiscovered ? type.color : '#666'}; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px ${isDiscovered ? type.color : 'transparent'};">${type.name}</div>
                <div class="dex-tier" style="margin-top: 8px; font-size: 12px;">
                    <div style="color: ${isDiscovered ? '#94a3b8' : '#555'};">碰撞质量: ${10 + type.tier * 2}</div>
                    <div style="color: ${isDiscovered ? '#94a3b8' : '#555'}; margin-top:3px;">护盾血量: ${type.hp}</div>
                </div>
                <div style="font-size: 13px; margin-top: 10px; font-weight: bold; color: ${isOwned ? '#38bdf8' : (isDiscovered ? '#fbbf24' : '#555')}">
                    ${isOwned ? `现役数量: ${ownedCount} 阵列` : (isDiscovered ? '已收录' : '未解锁')}
                </div>
            `;
            itemDiv.innerHTML = html;
            dexGrid.appendChild(itemDiv);
        });
    }
}

// 唤起执行
window.onload = initEngine;
