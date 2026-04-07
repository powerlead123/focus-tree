// 阅读探险记 - 飞机射击游戏

// ========== 数据配置 ==========

// 武器配置（20种，从低到高）- 每个武器有独特的性能特点
const WEAPONS = [
    // 1-5级：基础武器
    { id: 1, name: '🔫 生锈手枪', icon: '🔫', attack: 1, fireRate: 500, bulletCount: 1, bulletSpeed: 4, special: 'none', pierce: false, spread: false, homing: false, explosive: false, minScore: 0, maxScore: 29, description: '单发慢速，威力最弱' },
    { id: 2, name: '🏹 木制弓箭', icon: '🏹', attack: 2, fireRate: 450, bulletCount: 1, bulletSpeed: 6, special: 'none', pierce: false, spread: false, homing: false, explosive: false, minScore: 30, maxScore: 34, description: '单发快速，穿透力强' },
    { id: 3, name: '🔧 扳手投掷器', icon: '🔧', attack: 3, fireRate: 400, bulletCount: 1, bulletSpeed: 5, special: 'none', pierce: false, spread: false, homing: false, explosive: false, minScore: 35, maxScore: 39, description: '单发重击，伤害提升' },
    { id: 4, name: '💙 冰霜枪', icon: '💙', attack: 2, fireRate: 380, bulletCount: 2, bulletSpeed: 5, special: 'ice', pierce: false, spread: true, homing: false, explosive: false, minScore: 40, maxScore: 44, description: '双发散射，减速敌人' },
    { id: 5, name: '🔥 火焰炮', icon: '🔥', attack: 3, fireRate: 350, bulletCount: 2, bulletSpeed: 5, special: 'fire', pierce: false, spread: true, homing: false, explosive: false, minScore: 45, maxScore: 49, description: '双发散射，持续灼烧' },
    
    // 6-10级：进阶武器 - 开始有特殊能力
    { id: 6, name: '⚡ 闪电链', icon: '⚡', attack: 3, fireRate: 320, bulletCount: 1, bulletSpeed: 8, special: 'lightning', pierce: true, spread: false, homing: false, explosive: false, minScore: 50, maxScore: 54, description: '穿透攻击，可击中多个敌人' },
    { id: 7, name: '💚 毒液喷射器', icon: '💚', attack: 2, fireRate: 250, bulletCount: 3, bulletSpeed: 4, special: 'poison', pierce: false, spread: true, homing: false, explosive: false, minScore: 55, maxScore: 59, description: '三发散射，持续中毒伤害' },
    { id: 8, name: '💜 追踪水晶', icon: '💜', attack: 4, fireRate: 400, bulletCount: 1, bulletSpeed: 5, special: 'crystal', pierce: false, spread: false, homing: true, explosive: false, minScore: 60, maxScore: 64, description: '自动追踪最近的敌人' },
    { id: 9, name: '🌪️ 旋风刃', icon: '🌪️', attack: 3, fireRate: 280, bulletCount: 3, bulletSpeed: 6, special: 'wind', pierce: true, spread: true, homing: false, explosive: false, minScore: 65, maxScore: 69, description: '三发散射穿透，横扫全场' },
    { id: 10, name: '🌈 彩虹炮', icon: '🌈', attack: 4, fireRate: 300, bulletCount: 2, bulletSpeed: 7, special: 'rainbow', pierce: false, spread: false, homing: true, explosive: false, minScore: 70, maxScore: 74, description: '双发追踪，伤害递增' },
    
    // 11-15级：高级武器 - 多重特殊能力
    { id: 11, name: '🌟 星爆', icon: '🌟', attack: 5, fireRate: 350, bulletCount: 1, bulletSpeed: 6, special: 'star', pierce: false, spread: false, homing: false, explosive: true, minScore: 75, maxScore: 79, description: '爆炸攻击，范围伤害' },
    { id: 12, name: '⚔️ 圣光剑', icon: '⚔️', attack: 6, fireRate: 300, bulletCount: 2, bulletSpeed: 8, special: 'holy', pierce: true, spread: false, homing: false, explosive: false, minScore: 80, maxScore: 84, description: '双发穿透，伤害极高' },
    { id: 13, name: '🔱 海神三叉戟', icon: '🔱', attack: 4, fireRate: 250, bulletCount: 3, bulletSpeed: 7, special: 'water', pierce: true, spread: true, homing: false, explosive: false, minScore: 85, maxScore: 89, description: '三发散射穿透，波浪攻击' },
    { id: 14, name: '👑 黄金风暴', icon: '👑', attack: 5, fireRate: 280, bulletCount: 2, bulletSpeed: 6, special: 'gold', pierce: false, spread: false, homing: true, explosive: true, minScore: 90, maxScore: 94, description: '双发追踪爆炸，王者之威' },
    { id: 15, name: '🎆 烟花连爆', icon: '🎆', attack: 4, fireRate: 200, bulletCount: 4, bulletSpeed: 5, special: 'firework', pierce: false, spread: true, homing: false, explosive: true, minScore: 95, maxScore: 99, description: '四发散射爆炸，连环轰炸' },
    
    // 16-20级：终极武器 - 全能力组合
    { id: 16, name: '🌌 星云湮灭', icon: '🌌', attack: 6, fireRate: 250, bulletCount: 3, bulletSpeed: 8, special: 'nebula', pierce: true, spread: false, homing: true, explosive: false, minScore: 100, maxScore: 104, description: '三发追踪穿透，星云之力' },
    { id: 17, name: '🎯 量子激光', icon: '🎯', attack: 7, fireRate: 200, bulletCount: 2, bulletSpeed: 10, special: 'laser', pierce: true, spread: false, homing: false, explosive: false, minScore: 105, maxScore: 109, description: '双发超高速穿透，瞬间击杀' },
    { id: 18, name: '💥 核弹发射器', icon: '💥', attack: 8, fireRate: 400, bulletCount: 1, bulletSpeed: 5, special: 'nuclear', pierce: false, spread: false, homing: false, explosive: true, minScore: 110, maxScore: 114, description: '单发超大范围爆炸，毁天灭地' },
    { id: 19, name: '🌠 流星雨', icon: '🌠', attack: 5, fireRate: 180, bulletCount: 5, bulletSpeed: 9, special: 'meteor', pierce: false, spread: true, homing: true, explosive: true, minScore: 115, maxScore: 119, description: '五发追踪爆炸散射，天降正义' },
    { id: 20, name: '💎 创世神器', icon: '💎', attack: 10, fireRate: 250, bulletCount: 3, bulletSpeed: 8, special: 'ultimate', pierce: true, spread: false, homing: true, explosive: true, minScore: 120, maxScore: 999, description: '三发追踪穿透爆炸，至高神力' }
];

// 章节配置
const CHAPTERS = [
    { id: 1, name: '新手星域', icon: '🌌', levels: [1, 2, 3, 4, 5], theme: 'space' },
    { id: 2, name: '火焰星球', icon: '🔥', levels: [6, 7, 8, 9, 10], theme: 'fire' },
    { id: 3, name: '冰封世界', icon: '❄️', levels: [11, 12, 13, 14, 15], theme: 'ice' },
    { id: 4, name: '森林迷境', icon: '🌳', levels: [16, 17, 18, 19, 20], theme: 'forest' },
    { id: 5, name: '海底深渊', icon: '🌊', levels: [21, 22, 23, 24, 25], theme: 'ocean' },
    { id: 6, name: '终极决战', icon: '👾', levels: [26, 27, 28, 29, 30], theme: 'final' }
];

// 敌人配置 - 增加多样性
const ENEMY_TYPES = {
    space: [
        { emoji: '👾', type: 'normal', hp: 3, speed: 1.5, size: 1, skill: null, canShoot: true, shootInterval: 120, bulletType: 'normal', bulletColor: '#ff00ff' },
        { emoji: '🛸', type: 'fast', hp: 2, speed: 3, size: 0.8, skill: null, canShoot: false },
        { emoji: '☄️', type: 'tank', hp: 8, speed: 0.8, size: 1.5, skill: null, canShoot: true, shootInterval: 90, bulletType: 'heavy', bulletColor: '#ff6600' },
        { emoji: '🌀', type: 'debuff', hp: 3, speed: 2, size: 1, skill: 'slow', canShoot: true, shootInterval: 150, bulletType: 'slow', bulletColor: '#00ffff' },
        { emoji: '❄️', type: 'debuff', hp: 3, speed: 1.5, size: 1, skill: 'freeze', canShoot: true, shootInterval: 150, bulletType: 'freeze', bulletColor: '#00ffff' }
    ],
    fire: [
        { emoji: '🔥', type: 'normal', hp: 4, speed: 1.8, size: 1, skill: null, canShoot: true, shootInterval: 110, bulletType: 'fire', bulletColor: '#ff6600' },
        { emoji: '💥', type: 'fast', hp: 2, speed: 3.5, size: 0.8, skill: null, canShoot: false },
        { emoji: '🌋', type: 'tank', hp: 10, speed: 0.7, size: 1.8, skill: null, canShoot: true, shootInterval: 80, bulletType: 'heavy', bulletColor: '#ff0000' },
        { emoji: '🌪️', type: 'debuff', hp: 4, speed: 2, size: 1, skill: 'reverse', canShoot: true, shootInterval: 140, bulletType: 'reverse', bulletColor: '#87ceeb' },
        { emoji: '💨', type: 'swarm', hp: 2, speed: 2.5, size: 0.7, skill: null, canShoot: false }
    ],
    ice: [
        { emoji: '❄️', type: 'normal', hp: 4, speed: 1.5, size: 1, skill: null, canShoot: true, shootInterval: 120, bulletType: 'freeze', bulletColor: '#00ffff' },
        { emoji: '⛄', type: 'tank', hp: 12, speed: 0.6, size: 2, skill: null, canShoot: true, shootInterval: 70, bulletType: 'heavy', bulletColor: '#ffffff' },
        { emoji: '🧊', type: 'debuff', hp: 3, speed: 1.8, size: 1, skill: 'freeze', canShoot: true, shootInterval: 130, bulletType: 'freeze', bulletColor: '#00ffff' },
        { emoji: '🌨️', type: 'swarm', hp: 2, speed: 2, size: 0.8, skill: null, canShoot: false },
        { emoji: '💎', type: 'fast', hp: 3, speed: 3.2, size: 0.9, skill: null, canShoot: false }
    ],
    forest: [
        { emoji: '🌿', type: 'normal', hp: 3, speed: 1.5, size: 1, skill: null, canShoot: true, shootInterval: 120, bulletType: 'normal', bulletColor: '#00ff00' },
        { emoji: '🐛', type: 'swarm', hp: 2, speed: 2.2, size: 0.7, skill: null, canShoot: false },
        { emoji: '🦋', type: 'fast', hp: 2, speed: 3.8, size: 0.8, skill: null, canShoot: false },
        { emoji: '🌳', type: 'tank', hp: 15, speed: 0.5, size: 2.2, skill: null, canShoot: true, shootInterval: 60, bulletType: 'heavy', bulletColor: '#8b4513' },
        { emoji: '🍄', type: 'debuff', hp: 3, speed: 1.5, size: 1, skill: 'confuse', canShoot: true, shootInterval: 140, bulletType: 'confuse', bulletColor: '#ff00ff' }
    ],
    ocean: [
        { emoji: '🐙', type: 'normal', hp: 5, speed: 1.8, size: 1.2, skill: null, canShoot: true, shootInterval: 100, bulletType: 'normal', bulletColor: '#1e90ff' },
        { emoji: '🦈', type: 'fast', hp: 4, speed: 3.5, size: 1.1, skill: null, canShoot: false },
        { emoji: '🐠', type: 'swarm', hp: 2, speed: 2.5, size: 0.7, skill: null, canShoot: false },
        { emoji: '🐋', type: 'tank', hp: 20, speed: 0.5, size: 2.5, skill: null, canShoot: true, shootInterval: 50, bulletType: 'heavy', bulletColor: '#4169e1' },
        { emoji: '🦑', type: 'debuff', hp: 5, speed: 2, size: 1.3, skill: 'slow', canShoot: true, shootInterval: 110, bulletType: 'slow', bulletColor: '#9370db' }
    ],
    final: [
        { emoji: '👽', type: 'normal', hp: 6, speed: 2, size: 1.2, skill: null, canShoot: true, shootInterval: 90, bulletType: 'normal', bulletColor: '#00ff00' },
        { emoji: '🤖', type: 'tank', hp: 25, speed: 0.6, size: 2.8, skill: null, canShoot: true, shootInterval: 40, bulletType: 'heavy', bulletColor: '#ff0000' },
        { emoji: '💀', type: 'debuff', hp: 5, speed: 2.5, size: 1.1, skill: 'reverse', canShoot: true, shootInterval: 100, bulletType: 'reverse', bulletColor: '#ffffff' },
        { emoji: '👾', type: 'fast', hp: 4, speed: 4, size: 0.9, skill: null, canShoot: false },
        { emoji: '🛸', type: 'swarm', hp: 3, speed: 3, size: 0.8, skill: null, canShoot: false },
        { emoji: '☠️', type: 'debuff', hp: 5, speed: 2, size: 1.2, skill: 'freeze', canShoot: true, shootInterval: 100, bulletType: 'freeze', bulletColor: '#00ffff' }
    ]
};

// 本地存储键
const STORAGE_KEY = 'focusTree_readingData';

// ========== 数据管理 ==========

function getReadingData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return {
        levels: {}, // { levelId: { completed: true, stars: 3, score: 1500, weapon: 'SSR' } }
        totalScore: 0,
        completedCount: 0,
        lastPlayDate: null,
        streakDays: 0
    };
}

function saveReadingData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ========== 界面初始化 ==========

window.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，初始化地图');
    renderMap();
    updateMapInfo();
    initStarRatings();
    console.log('初始化完成');
});

function renderMap() {
    const container = document.getElementById('chaptersContainer');
    const data = getReadingData();
    
    container.innerHTML = '';
    
    CHAPTERS.forEach(chapter => {
        const chapterDiv = document.createElement('div');
        chapterDiv.className = 'chapter';
        
        const completedInChapter = chapter.levels.filter(l => data.levels[l]?.completed).length;
        
        chapterDiv.innerHTML = `
            <div class="chapter-header">
                <div class="chapter-icon">${chapter.icon}</div>
                <div class="chapter-title">${chapter.name}</div>
                <div class="chapter-progress">${completedInChapter}/${chapter.levels.length}</div>
            </div>
            <div class="levels-grid" id="chapter${chapter.id}"></div>
        `;
        
        container.appendChild(chapterDiv);
        
        const levelsGrid = document.getElementById(`chapter${chapter.id}`);
        chapter.levels.forEach(levelNum => {
            const levelData = data.levels[levelNum];
            const isCompleted = levelData?.completed;
            const isUnlocked = levelNum === 1 || data.levels[levelNum - 1]?.completed;
            
            const levelDiv = document.createElement('div');
            levelDiv.className = `level-item ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}`;
            
            if (isCompleted) {
                levelDiv.innerHTML = `
                    <div class="level-number">${levelNum}</div>
                    <div class="level-stars">${'⭐'.repeat(levelData.stars || 1)}</div>
                `;
                levelDiv.onclick = null; // 已完成的关卡不能再玩
            } else if (isUnlocked) {
                levelDiv.innerHTML = `
                    <div class="level-number">${levelNum}</div>
                    <div>🎮</div>
                `;
                // 点击关卡先弹出录入界面
                levelDiv.onclick = () => showInputForLevel(levelNum, chapter.theme);
            } else {
                levelDiv.innerHTML = `
                    <div class="level-number">${levelNum}</div>
                    <div>🔒</div>
                `;
            }
            
            levelsGrid.appendChild(levelDiv);
        });
    });
}

function updateMapInfo() {
    const data = getReadingData();
    document.getElementById('totalProgress').textContent = data.completedCount;
    document.getElementById('totalScore').textContent = data.totalScore;
    document.getElementById('streakDays').textContent = data.streakDays;
}

// ========== 家长录入 ==========

let currentSets = 2;
let currentEfficiency = 3;
let currentDifficulty = 3;
let currentScore = 3;
let pendingLevelNum = null;
let pendingTheme = null;

// 点击关卡时，先显示录入界面
function showInputForLevel(levelNum, theme) {
    pendingLevelNum = levelNum;
    pendingTheme = theme;
    showParentPanel();
}

function initStarRatings() {
    initRating('efficiencyRating', (value) => { currentEfficiency = value; updateWeaponPreview(); });
    initRating('difficultyRating', (value) => { currentDifficulty = value; updateWeaponPreview(); });
    initRating('scoreRating', (value) => { currentScore = value; updateWeaponPreview(); });
    
    // 监听套数变化
    document.querySelectorAll('input[name="sets"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentSets = parseInt(e.target.value);
            updateWeaponPreview();
        });
    });
}

function initRating(id, callback) {
    const container = document.getElementById(id);
    const stars = container.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const value = index + 1;
            stars.forEach((s, i) => {
                s.classList.toggle('active', i < value);
            });
            callback(value);
        });
    });
    
    // 默认选中3星
    stars.forEach((s, i) => {
        s.classList.toggle('active', i < 3);
    });
}

function showParentPanel() {
    document.getElementById('parentScreen').classList.remove('hidden');
    document.getElementById('parentScreen').classList.add('active');
    updateWeaponPreview();
}

function closeParentPanel() {
    document.getElementById('parentScreen').classList.remove('active');
    document.getElementById('parentScreen').classList.add('hidden');
}

function updateWeaponPreview() {
    // 计算综合得分
    // 套数：1套=10分，2套=30分，3套=50分（提高套数权重）
    const setsScore = currentSets === 1 ? 10 : currentSets === 2 ? 30 : 50;
    // 效率：1-5星，每星5分（提高权重）
    const efficiencyScore = currentEfficiency * 5;
    // 难度：1-5星，每星7分（提高权重）
    const difficultyScore = currentDifficulty * 7;
    // 评分：1-5星，每星8分（提高权重）
    const scoreScore = currentScore * 8;
    
    const totalScore = setsScore + efficiencyScore + difficultyScore + scoreScore;
    
    // 根据得分找到对应的武器
    const weapon = WEAPONS.find(w => totalScore >= w.minScore && totalScore <= w.maxScore) || WEAPONS[0];
    
    // 显示武器预览
    const stars = '★'.repeat(weapon.attack) + '☆'.repeat(8 - weapon.attack);
    const speedLevel = Math.min(8, Math.ceil((450 - weapon.fireRate) / 50));
    const speedStars = '★'.repeat(speedLevel) + '☆'.repeat(8 - speedLevel);
    
    document.getElementById('weaponCard').innerHTML = `
        <div class="weapon-icon">${weapon.icon}</div>
        <div class="weapon-name">${weapon.name}</div>
        <div class="weapon-level">等级 ${weapon.id}/20</div>
        <div class="weapon-stats">
            <div class="stat">攻击力：${stars}</div>
            <div class="stat">射速：${speedStars}</div>
            <div class="stat">子弹数：${weapon.bulletCount}发/次</div>
            <div class="stat">特效：${weapon.special === 'none' ? '无' : weapon.special}</div>
        </div>
        <div class="weapon-desc">${weapon.description}</div>
        <div class="weapon-score">综合得分：${totalScore}分 (可用武器1-${weapon.id}级)</div>
    `;
    
    window.pendingWeapon = weapon;
}

function confirmInput() {
    if (!pendingLevelNum || !pendingTheme) {
        alert('请先选择关卡！');
        return;
    }
    
    const data = getReadingData();
    
    // 检查是否已完成
    if (data.levels[pendingLevelNum]?.completed) {
        alert('该关卡已完成，每关只能玩一次！');
        closeParentPanel();
        return;
    }
    
    // 保存武器类型 - 获得的武器及以下所有武器都可用
    const earnedWeapon = window.pendingWeapon || WEAPONS[0];
    availableWeapons = WEAPONS.filter(w => w.id <= earnedWeapon.id);
    
    closeParentPanel();
    
    // 显示武器选择界面
    showWeaponSelection();
}

// ========== 武器选择 ==========

function showWeaponSelection() {
    document.getElementById('weaponSelectScreen').classList.remove('hidden');
    document.getElementById('weaponSelectScreen').classList.add('active');
    
    const grid = document.getElementById('weaponsGrid');
    grid.innerHTML = '';
    
    availableWeapons.forEach((weapon, index) => {
        const weaponDiv = document.createElement('div');
        weaponDiv.className = `weapon-option ${index === availableWeapons.length - 1 ? 'selected' : ''}`;
        
        const attackStars = '★'.repeat(weapon.attack) + '☆'.repeat(8 - weapon.attack);
        
        weaponDiv.innerHTML = `
            <div class="weapon-icon">${weapon.icon}</div>
            <div class="weapon-name">${weapon.name.split(' ')[1]}</div>
            <div class="weapon-level">Lv.${weapon.id}</div>
            <div class="weapon-stats">
                <div class="stat">攻击: ${attackStars}</div>
                <div class="stat">子弹: ${weapon.bulletCount}发</div>
            </div>
        `;
        
        weaponDiv.onclick = () => selectWeapon(index);
        grid.appendChild(weaponDiv);
    });
    
    // 默认选择最高级的武器
    selectedWeaponIndex = availableWeapons.length - 1;
}

function selectWeapon(index) {
    selectedWeaponIndex = index;
    
    const options = document.querySelectorAll('.weapon-option');
    options.forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
}

function startGameWithSelectedWeapon() {
    currentWeapon = availableWeapons[selectedWeaponIndex];
    
    document.getElementById('weaponSelectScreen').classList.remove('active');
    document.getElementById('weaponSelectScreen').classList.add('hidden');
    
    startLevel(pendingLevelNum, pendingTheme);
}

function backToMapFromWeaponSelect() {
    document.getElementById('weaponSelectScreen').classList.remove('active');
    document.getElementById('weaponSelectScreen').classList.add('hidden');
    document.getElementById('mapScreen').classList.remove('hidden');
    document.getElementById('mapScreen').classList.add('active');
}

// ========== 游戏中切换武器 ==========

function showWeaponChangeInGame() {
    const panel = document.getElementById('weaponChangePanel');
    panel.classList.remove('hidden');
    
    const grid = document.getElementById('weaponsQuickGrid');
    grid.innerHTML = '';
    
    availableWeapons.forEach((weapon, index) => {
        const weaponDiv = document.createElement('div');
        weaponDiv.className = `weapon-quick-option ${weapon.id === currentWeapon.id ? 'active' : ''}`;
        
        weaponDiv.innerHTML = `
            <div class="weapon-icon">${weapon.icon}</div>
            <div class="weapon-name">${weapon.name.split(' ')[1]}</div>
        `;
        
        weaponDiv.onclick = () => changeWeaponInGame(index);
        grid.appendChild(weaponDiv);
    });
}

function changeWeaponInGame(index) {
    currentWeapon = availableWeapons[index];
    selectedWeaponIndex = index;
    
    // 更新HUD显示
    document.getElementById('weaponInfo').textContent = currentWeapon.name;
    
    // 重启自动射击
    clearInterval(fireInterval);
    startAutoFire();
    
    // 更新选中状态
    const options = document.querySelectorAll('.weapon-quick-option');
    options.forEach((opt, i) => {
        opt.classList.toggle('active', i === index);
    });
}

function closeWeaponChangePanel() {
    document.getElementById('weaponChangePanel').classList.add('hidden');
}

// ========== 游戏逻辑 ==========

let canvas, ctx;
let gameRunning = false;
let currentLevelNum = 1;
let currentTheme = 'space';
let currentWeapon = WEAPONS.C;

// 游戏对象
let player = {};
let bullets = [];
let enemyBullets = []; // 敌人子弹
let enemies = [];
let explosions = [];
let powerups = []; // 道具列表
let activePowerups = []; // 激活的道具效果
let gameScore = 0;
let gameTime = 0;
let enemiesKilled = 0;
let comboCount = 0; // 连击数
let lastKillTime = 0; // 上次击杀时间
let playerDebuffs = []; // 玩家身上的debuff效果
let availableWeapons = []; // 可用的武器列表
let selectedWeaponIndex = 0; // 当前选中的武器索引

// Boss系统
let boss = null;
let bossSpawned = false;
let bossDefeated = false;

// 鼓励语系统
let encouragementText = '';
let encouragementTimer = 0;
const ENCOURAGEMENTS = {
    start: ['阅读理解不可怕，你能行！', '准备好了吗？让我们征服阅读！', '相信自己，你一定可以的！'],
    kill: ['太棒了！', '干得好！', '继续加油！', '你真厉害！'],
    combo: ['连击！你越来越强了！', '太强了！阅读理解就是纸老虎！', '无敌了！继续保持！'],
    powerup: ['获得强化！做得好！', '太棒了！继续努力！', '你真棒！'],
    victory: ['你真棒！阅读理解被你征服了！', '完美通关！你是阅读高手！', '太厉害了！你战胜了所有困难！'],
    boss: ['Boss来了！全力以赴！', '最终挑战！你能行的！', '阅读理解的终极考验！']
};

function showEncouragement(type) {
    const messages = ENCOURAGEMENTS[type];
    encouragementText = messages[Math.floor(Math.random() * messages.length)];
    encouragementTimer = 120; // 显示2秒
}

function drawEncouragement() {
    if (encouragementTimer > 0) {
        encouragementTimer--;
        const alpha = encouragementTimer > 90 ? 1 : encouragementTimer / 90;
        
        ctx.save();
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 背景
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
        const textWidth = ctx.measureText(encouragementText).width;
        ctx.fillRect(canvas.width/2 - textWidth/2 - 20, 100, textWidth + 40, 50);
        
        // 文字
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeText(encouragementText, canvas.width/2, 125);
        ctx.fillText(encouragementText, canvas.width/2, 125);
        
        ctx.restore();
    }
}

// 道具配置
const POWERUP_TYPES = [
    { id: 'speed', icon: '⚡', name: '极速', duration: 300, effect: 'speed', color: '#fbbf24' },
    { id: 'bigbullet', icon: '💥', name: '巨弹', duration: 300, effect: 'bigbullet', color: '#ef4444' },
    { id: 'fullscreen', icon: '🌟', name: '全屏', duration: 300, effect: 'fullscreen', color: '#8b5cf6' },
    { id: 'shield', icon: '🛡️', name: '护盾', duration: 360, effect: 'shield', color: '#3b82f6' },
    { id: 'multishot', icon: '🎯', name: '多重', duration: 300, effect: 'multishot', color: '#10b981' },
    { id: 'pierce', icon: '🔥', name: '穿透', duration: 300, effect: 'pierce', color: '#f97316' },
    { id: 'invincible', icon: '✨', name: '无敌', duration: 180, effect: 'invincible', color: '#ffd700' },
    { id: 'slowtime', icon: '⏰', name: '时停', duration: 240, effect: 'slowtime', color: '#00ffff' },
    { id: 'magnet', icon: '🧲', name: '磁铁', duration: 360, effect: 'magnet', color: '#ff69b4' },
    { id: 'rapidfire', icon: '🚀', name: '狂射', duration: 240, effect: 'rapidfire', color: '#ff4500' },
    { id: 'laser', icon: '🔆', name: '激光', duration: 300, effect: 'laser', color: '#ffff00' },
    { id: 'bomb', icon: '💣', name: '炸弹', duration: 1, effect: 'bomb', color: '#ff0000' },
    { id: 'heal', icon: '💚', name: '治疗', duration: 1, effect: 'heal', color: '#00ff00' },
    { id: 'freeze', icon: '❄️', name: '冰冻', duration: 180, effect: 'freeze', color: '#00bfff' },
    { id: 'double', icon: '💰', name: '双倍', duration: 300, effect: 'double', color: '#ffa500' },
    { id: 'healthpack_small', icon: '💊', name: '小血包', duration: 1, effect: 'healthpack', healAmount: 30, color: '#ff69b4' },
    { id: 'healthpack_medium', icon: '💉', name: '中血包', duration: 1, effect: 'healthpack', healAmount: 60, color: '#ff1493' },
    { id: 'healthpack_large', icon: '🏥', name: '大血包', duration: 1, effect: 'healthpack', healAmount: 100, color: '#dc143c' }
];

// 游戏区域配置
const GAME_AREA = {
    leftMargin: 0.2,  // 左边距占屏幕20%
    rightMargin: 0.2, // 右边距占屏幕20%
    get playWidth() { return canvas ? canvas.width * (1 - this.leftMargin - this.rightMargin) : 0; },
    get playLeft() { return canvas ? canvas.width * this.leftMargin : 0; },
    get playRight() { return canvas ? canvas.width * (1 - this.rightMargin) : 0; }
};

function startLevel(levelNum, theme) {
    const data = getReadingData();
    
    // 检查是否已完成
    if (data.levels[levelNum]?.completed) {
        alert('该关卡已完成，每关只能玩一次！');
        return;
    }
    
    currentLevelNum = levelNum;
    currentTheme = theme;
    
    // 使用刚才录入分配的武器
    if (window.pendingWeapon) {
        currentWeapon = window.pendingWeapon;
    } else {
        currentWeapon = WEAPONS[0];
    }
    
    document.getElementById('mapScreen').classList.remove('active');
    document.getElementById('mapScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('active');
    
    initGame();
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 设置canvas大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 初始化玩家 - 在游戏区域中间
    player = {
        x: GAME_AREA.playLeft + GAME_AREA.playWidth / 2,
        y: canvas.height - 100,
        width: 50,
        height: 50,
        hp: 300,
        maxHp: 300,
        speed: 5,
        baseSpeed: 5
    };
    
    // 重置游戏状态
    bullets = [];
    enemies = [];
    explosions = [];
    powerups = [];
    activePowerups = [];
    playerDebuffs = [];
    enemyBullets = [];
    gameScore = 0;
    gameTime = 0;
    enemiesKilled = 0;
    comboCount = 0;
    lastKillTime = 0;
    gameRunning = true;
    encouragementText = '';
    encouragementTimer = 0;
    boss = null;
    bossSpawned = false;
    bossDefeated = false;
    
    // 显示开始鼓励语
    showEncouragement('start');
    
    // 更新HUD
    document.getElementById('currentLevel').textContent = currentLevelNum;
    document.getElementById('gameScore').textContent = gameScore;
    document.getElementById('weaponInfo').textContent = currentWeapon.name;
    updateHP();
    updatePowerupDisplay();
    
    // 开始游戏循环
    gameLoop();
    
    // 开始生成敌人
    startEnemySpawn();
    
    // 开始生成道具
    startPowerupSpawn();
    
    // 开始自动射击
    startAutoFire();
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // 触摸控制
    document.getElementById('leftBtn').addEventListener('touchstart', () => player.moveLeft = true);
    document.getElementById('leftBtn').addEventListener('touchend', () => player.moveLeft = false);
    document.getElementById('rightBtn').addEventListener('touchstart', () => player.moveRight = true);
    document.getElementById('rightBtn').addEventListener('touchend', () => player.moveRight = false);
    
    // 3分钟后自动通关
    setTimeout(() => {
        if (gameRunning) {
            endGame(true);
        }
    }, 180000); // 3分钟
}

let keys = {};
function handleKeyDown(e) {
    keys[e.key] = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function gameLoop() {
    if (!gameRunning) return;
    
    // 清空画布
    ctx.fillStyle = getThemeColor(currentTheme);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制游戏区域边界
    drawGameArea();
    
    // 检查是否生成Boss（1分30秒 = 5400帧）
    if (!bossSpawned && gameTime >= 5400) {
        spawnBoss();
    }
    
    // 更新和绘制
    updatePlayer();
    updateBullets();
    updateEnemyBullets(); // 更新敌人子弹
    updateEnemies();
    if (boss) updateBoss(); // 更新Boss
    updateExplosions();
    updatePowerups();
    updateActivePowerups();
    
    drawPlayer();
    drawLaser(); // 绘制激光效果
    drawBullets();
    drawEnemyBullets(); // 绘制敌人子弹
    drawEnemies();
    if (boss) drawBoss(); // 绘制Boss
    drawExplosions();
    drawPowerups();
    
    // 绘制鼓励语
    drawEncouragement();
    
    // 碰撞检测
    checkCollisions();
    if (boss) checkBossCollisions(); // Boss碰撞检测
    checkPowerupCollisions();
    checkBulletCollisions(); // 检测玩家子弹和敌人子弹碰撞
    checkEnemyBulletCollisions(); // 检测敌人子弹碰撞
    
    gameTime++;
    
    requestAnimationFrame(gameLoop);
}

function drawGameArea() {
    // 绘制左右边界的暗色区域
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, GAME_AREA.playLeft, canvas.height);
    ctx.fillRect(GAME_AREA.playRight, 0, canvas.width - GAME_AREA.playRight, canvas.height);
    
    // 绘制边界线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GAME_AREA.playLeft, 0);
    ctx.lineTo(GAME_AREA.playLeft, canvas.height);
    ctx.moveTo(GAME_AREA.playRight, 0);
    ctx.lineTo(GAME_AREA.playRight, canvas.height);
    ctx.stroke();
}

function getThemeColor(theme) {
    const colors = {
        space: '#000033',
        fire: '#330000',
        ice: '#003333',
        forest: '#003300',
        ocean: '#000033',
        final: '#1a0033'
    };
    return colors[theme] || '#000000';
}

function updatePlayer() {
    // 处理debuff效果
    playerDebuffs = playerDebuffs.filter(debuff => {
        debuff.duration--;
        return debuff.duration > 0;
    });
    
    // 检查是否被冻结
    const frozen = playerDebuffs.find(d => d.type === 'freeze');
    if (frozen) {
        return; // 冻结时不能移动
    }
    
    // 检查是否反向
    const reversed = playerDebuffs.find(d => d.type === 'reverse');
    const moveMultiplier = reversed ? -1 : 1;
    
    // 检查是否减速
    const slowed = playerDebuffs.find(d => d.type === 'slow');
    let speedMultiplier = slowed ? 0.5 : 1;
    
    // 检查是否有加速道具
    const speedPowerup = activePowerups.find(p => p.effect === 'speed');
    if (speedPowerup) {
        speedMultiplier *= 2;
    }
    
    // 检查是否有全屏移动道具
    const fullscreenPowerup = activePowerups.find(p => p.effect === 'fullscreen');
    
    // 键盘控制
    if (keys['ArrowLeft'] || player.moveLeft) {
        player.x -= player.baseSpeed * moveMultiplier * speedMultiplier;
    }
    if (keys['ArrowRight'] || player.moveRight) {
        player.x += player.baseSpeed * moveMultiplier * speedMultiplier;
    }
    
    // 边界限制 - 根据是否有全屏道具决定范围
    if (fullscreenPowerup) {
        player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    } else {
        player.x = Math.max(GAME_AREA.playLeft + player.width / 2, 
                           Math.min(GAME_AREA.playRight - player.width / 2, player.x));
    }
}

function drawPlayer() {
    // 如果有无敌，显示金色光环效果
    const invinciblePowerup = activePowerups.find(p => p.effect === 'invincible');
    if (invinciblePowerup) {
        // 旋转的金色光环
        const rotation = gameTime * 0.1;
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(rotation);
        
        // 外层光环
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内层光环
        ctx.strokeStyle = '#ffed4e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        // 闪烁的星星
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x = Math.cos(angle) * 55;
            const y = Math.sin(angle) * 55;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffd700';
            ctx.fillText('✨', x, y);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    // 如果有时停，显示青色时间波纹效果
    const slowtimePowerup = activePowerups.find(p => p.effect === 'slowtime');
    if (slowtimePowerup) {
        // 脉动的时间波纹
        const pulse = Math.sin(gameTime * 0.15) * 10 + 45;
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(player.x, player.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#00cccc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, pulse - 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // 时钟符号
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('⏰', player.x, player.y - 50);
        
        ctx.globalAlpha = 1;
    }
    
    // 如果有护盾，显示护盾效果
    const shieldPowerup = activePowerups.find(p => p.effect === 'shield');
    if (shieldPowerup) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // 如果被冻结，显示冰冻效果
    const frozen = playerDebuffs.find(d => d.type === 'freeze');
    if (frozen) {
        ctx.globalAlpha = 0.5;
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄️', player.x, player.y);
        ctx.globalAlpha = 1;
    }
    
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✈️', player.x, player.y);
    
    // 显示debuff图标
    if (playerDebuffs.length > 0) {
        ctx.font = '20px Arial';
        playerDebuffs.forEach((debuff, index) => {
            const icon = debuff.type === 'freeze' ? '❄️' : 
                        debuff.type === 'slow' ? '🐌' : 
                        debuff.type === 'reverse' ? '🔄' : '⚠️';
            ctx.fillText(icon, player.x + (index - playerDebuffs.length / 2) * 25, player.y - 40);
        });
    }
    
    // 显示连击数
    if (comboCount >= 3) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${comboCount} COMBO!`, player.x, player.y + 50);
        ctx.fillText(`${comboCount} COMBO!`, player.x, player.y + 50);
    }
}

function drawLaser() {
    // 如果有激光道具，绘制激光效果
    const laserPowerup = activePowerups.find(p => p.effect === 'laser');
    if (laserPowerup) {
        const pulse = Math.sin(gameTime * 0.3) * 5 + 15; // 脉动宽度
        
        // 绘制激光束
        const gradient = ctx.createLinearGradient(player.x, player.y, player.x, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x - pulse, 0, pulse * 2, player.y);
        
        // 外层光晕
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(player.x - pulse - 5, 0);
        ctx.lineTo(player.x - pulse - 5, player.y);
        ctx.moveTo(player.x + pulse + 5, 0);
        ctx.lineTo(player.x + pulse + 5, player.y);
        ctx.stroke();
        
        // 激光发射点光效
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(player.x, player.y - 30, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 自动射击
let fireInterval;
function startAutoFire() {
    // 检查是否有狂射道具
    const rapidfirePowerup = activePowerups.find(p => p.effect === 'rapidfire');
    const fireRate = rapidfirePowerup ? currentWeapon.fireRate / 2 : currentWeapon.fireRate;
    
    fireInterval = setInterval(() => {
        if (gameRunning) {
            fire();
        }
    }, fireRate);
}

function fire() {
    // 检查是否有激光道具
    const laserPowerup = activePowerups.find(p => p.effect === 'laser');
    if (laserPowerup) {
        // 激光：从玩家位置到屏幕顶部的直线伤害
        enemies.forEach(enemy => {
            // 检查敌人是否在激光路径上（玩家x坐标左右20像素范围内）
            if (Math.abs(enemy.x - player.x) < 20) {
                enemy.hp -= currentWeapon.attack * 2; // 激光伤害是武器攻击力的2倍
                if (enemy.hp <= 0) {
                    createExplosion(enemy.x, enemy.y, enemy.size);
                    gameScore += 10;
                    enemiesKilled++;
                    comboCount++;
                    lastKillTime = gameTime;
                    
                    if (comboCount >= 3) {
                        showEncouragement('combo');
                    } else {
                        showEncouragement('kill');
                    }
                }
            }
        });
        enemies = enemies.filter(e => e.hp > 0);
        return; // 激光不发射普通子弹
    }
    
    let count = currentWeapon.bulletCount;
    const baseSpread = 30;
    
    // 检查是否有多重射击道具
    const multishotPowerup = activePowerups.find(p => p.effect === 'multishot');
    if (multishotPowerup) {
        count *= 2;
    }
    
    // 检查是否有巨弹道具
    const bigbulletPowerup = activePowerups.find(p => p.effect === 'bigbullet');
    
    // 子弹大小根据武器等级增加：基础8 + 等级/2
    // 1级=8, 5级=10, 10级=13, 15级=15, 20级=18
    const baseBulletSize = 8 + Math.floor(currentWeapon.id / 2);
    const bulletSize = bigbulletPowerup ? baseBulletSize * 1.5 : baseBulletSize;
    
    // 检查是否有穿透道具（道具穿透 或 武器自带穿透）
    const piercePowerup = activePowerups.find(p => p.effect === 'pierce');
    const hasPierce = piercePowerup || currentWeapon.pierce;
    
    // 是否散射
    const hasSpread = currentWeapon.spread;
    const spread = hasSpread ? baseSpread : 0;
    
    for (let i = 0; i < count; i++) {
        const offsetX = (i - (count - 1) / 2) * spread;
        
        bullets.push({
            x: player.x + offsetX,
            y: player.y - 30,
            speed: currentWeapon.bulletSpeed,
            damage: currentWeapon.attack,
            type: currentWeapon.special,
            size: bulletSize,
            pierce: hasPierce,
            homing: currentWeapon.homing,  // 追踪能力
            explosive: currentWeapon.explosive,  // 爆炸能力
            explosionRadius: currentWeapon.explosive ? 50 : 0,  // 爆炸半径
            age: 0,
            angle: 0,
            hue: Math.random() * 360,
            target: null  // 追踪目标
        });
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        // 追踪功能
        if (bullet.homing && enemies.length > 0) {
            // 如果没有目标或目标已死，寻找新目标
            if (!bullet.target || !enemies.includes(bullet.target)) {
                // 找最近的敌人
                let minDist = Infinity;
                let nearestEnemy = null;
                enemies.forEach(enemy => {
                    const dx = enemy.x - bullet.x;
                    const dy = enemy.y - bullet.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestEnemy = enemy;
                    }
                });
                bullet.target = nearestEnemy;
            }
            
            // 追踪目标
            if (bullet.target) {
                const dx = bullet.target.x - bullet.x;
                const dy = bullet.target.y - bullet.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    // 转向目标，但保持速度
                    const turnSpeed = 0.1; // 转向速度
                    bullet.x += (dx / dist) * bullet.speed * turnSpeed + (dx / dist) * bullet.speed * (1 - turnSpeed);
                    bullet.y += (dy / dist) * bullet.speed * turnSpeed - bullet.speed * (1 - turnSpeed);
                } else {
                    bullet.y -= bullet.speed;
                }
            } else {
                bullet.y -= bullet.speed;
            }
        } else {
            // 普通子弹直线飞行
            bullet.y -= bullet.speed;
        }
        
        bullet.age++;
        bullet.angle += 0.1;
        
        // 只更新必要的属性
        if (bullet.type === 'rainbow' || bullet.type === 'ultimate') {
            bullet.hue = (bullet.hue + 5) % 360;
        }
        
        return bullet.y > -50 && bullet.y < canvas.height + 50 && 
               bullet.x > -50 && bullet.x < canvas.width + 50;
    });
}


// 优化后的子弹绘制函数 - 性能提升版
// 将此函数替换reading.js中的drawBullets函数（785-1174行）

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        
        const size = bullet.size || 8;
        const x = bullet.x;
        const y = bullet.y;
        
        // 高级武器添加光晕效果（等级越高光晕越大）
        const weaponLevel = Math.floor(size - 8) * 2 + 1; // 反推武器等级
        if (weaponLevel >= 10) {
            const glowSize = size * 1.8;
            const glowAlpha = 0.3;
            ctx.fillStyle = `rgba(255, 255, 100, ${glowAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 根据类型绘制（简化版，无粒子系统）
        switch(bullet.type) {
            case 'fire':
                // 火焰：简单渐变
                const fireGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                fireGrad.addColorStop(0, '#ffff00');
                fireGrad.addColorStop(0.6, '#ff6600');
                fireGrad.addColorStop(1, '#ff0000');
                ctx.fillStyle = fireGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ice':
                // 冰晶：渐变+边缘
                const iceGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                iceGrad.addColorStop(0, '#ffffff');
                iceGrad.addColorStop(0.5, '#00ffff');
                iceGrad.addColorStop(1, '#0088ff');
                ctx.fillStyle = iceGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                break;
                
            case 'lightning':
                // 闪电：锯齿线
                const zigzag = Math.sin(bullet.age * 0.3) * 3;
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = size * 0.8;
                ctx.beginPath();
                ctx.moveTo(x + zigzag, y - 8);
                ctx.lineTo(x - zigzag, y + 8);
                ctx.stroke();
                break;
                
            case 'poison':
                // 毒液：脉动
                const pulse = Math.sin(bullet.age * 0.2) * 2;
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, size + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'crystal':
                // 水晶：六边形
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.fillStyle = '#ff00ff';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 / 6) * i;
                    const px = Math.cos(a) * size;
                    const py = Math.sin(a) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'wind':
                // 风：波浪
                const wave = Math.sin(bullet.age * 0.2) * 4;
                ctx.strokeStyle = '#87ceeb';
                ctx.lineWidth = size * 0.8;
                ctx.beginPath();
                ctx.moveTo(x + wave, y - 6);
                ctx.quadraticCurveTo(x, y, x - wave, y + 6);
                ctx.stroke();
                break;
                
            case 'rainbow':
                // 彩虹：色相变化
                ctx.fillStyle = `hsl(${bullet.hue}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'star':
                // 星星：五角星
                ctx.fillStyle = '#ffd700';
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const px = Math.cos(a) * size;
                    const py = Math.sin(a) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                    const ia = a + Math.PI / 5;
                    const ipx = Math.cos(ia) * size * 0.4;
                    const ipy = Math.sin(ia) * size * 0.4;
                    ctx.lineTo(ipx, ipy);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'holy':
                // 圣光：十字+圆
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - size * 1.2, y);
                ctx.lineTo(x + size * 1.2, y);
                ctx.moveTo(x, y - size * 1.2);
                ctx.lineTo(x, y + size * 1.2);
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'water':
                // 水：波纹
                const ripple = (bullet.age * 2) % 12;
                ctx.strokeStyle = `rgba(30, 144, 255, ${1 - ripple / 12})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, ripple, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = '#1e90ff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'gold':
                // 金色：菱形
                ctx.fillStyle = '#ffd700';
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size, 0);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'firework':
                // 烟花：渐变
                const fwGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                fwGrad.addColorStop(0, '#ffffff');
                fwGrad.addColorStop(0.5, '#ff1493');
                fwGrad.addColorStop(1, '#ff69b4');
                ctx.fillStyle = fwGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'nebula':
                // 星云：大光晕
                const nebGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.3);
                nebGrad.addColorStop(0, '#ffffff');
                nebGrad.addColorStop(0.4, '#9370db');
                nebGrad.addColorStop(1, 'rgba(147, 112, 219, 0)');
                ctx.fillStyle = nebGrad;
                ctx.beginPath();
                ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'laser':
                // 激光：线条
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = size * 0.8;
                ctx.beginPath();
                ctx.moveTo(x, y + 15);
                ctx.lineTo(x, y - 15);
                ctx.stroke();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = size * 0.3;
                ctx.stroke();
                break;
                
            case 'nuclear':
                // 核能：辐射
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 / 6) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a) * size * 1.3, Math.sin(a) * size * 1.3);
                    ctx.stroke();
                }
                break;
                
            case 'meteor':
                // 流星：拖尾
                ctx.fillStyle = 'rgba(255, 140, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(x, y + 8, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ultimate':
                // 终极：彩虹旋转
                const hue = (bullet.age * 10) % 360;
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                for (let i = 0; i < 8; i++) {
                    const a = (Math.PI * 2 / 8) * i;
                    ctx.fillStyle = `hsl(${(hue + i * 45) % 360}, 100%, 50%)`;
                    ctx.beginPath();
                    ctx.arc(0, 0, size, a, a + Math.PI / 4);
                    ctx.lineTo(0, 0);
                    ctx.fill();
                }
                break;
                
            default:
                // 默认
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
        }
        
        ctx.restore();
        
        // 巨弹光晕
        if (bullet.size > 5) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, bullet.size + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 穿透标记
        if (bullet.pierce) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', x, y + 3);
        }
    });
}


function getBulletColor(type) {
    const colors = {
        rainbow: '#ff00ff',
        lightning: '#ffff00',
        fire: '#ff6600',
        ice: '#00ffff',
        none: '#ffffff'
    };
    return colors[type] || '#ffffff';
}

// 敌人生成
let enemySpawnInterval;
function startEnemySpawn() {
    enemySpawnInterval = setInterval(() => {
        if (gameRunning && enemies.length < 15) {
            // 随机决定是单个还是成批出现
            const spawnType = Math.random();
            if (spawnType < 0.7) {
                // 70% 单个敌人
                spawnEnemy();
            } else if (spawnType < 0.9) {
                // 20% 成批出现（3-5个）
                const count = 3 + Math.floor(Math.random() * 3);
                spawnEnemyWave(count);
            } else {
                // 10% 大型敌人
                spawnBossEnemy();
            }
        }
    }, 1200);
}

function spawnEnemy() {
    const enemyConfigs = ENEMY_TYPES[currentTheme];
    const config = enemyConfigs[Math.floor(Math.random() * enemyConfigs.length)];
    
    enemies.push({
        x: GAME_AREA.playLeft + Math.random() * GAME_AREA.playWidth,
        y: -50,
        width: 40 * config.size,
        height: 40 * config.size,
        speed: config.speed,
        hp: config.hp,
        maxHp: config.hp,
        emoji: config.emoji,
        type: config.type,
        skill: config.skill,
        size: config.size,
        canShoot: config.canShoot,
        shootInterval: config.shootInterval,
        shootTimer: Math.floor(Math.random() * config.shootInterval), // 随机初始计时
        bulletType: config.bulletType,
        bulletColor: config.bulletColor
    });
}

function spawnEnemyWave(count) {
    const enemyConfigs = ENEMY_TYPES[currentTheme];
    const config = enemyConfigs.find(e => e.type === 'swarm') || enemyConfigs[0];
    
    const startX = GAME_AREA.playLeft + Math.random() * (GAME_AREA.playWidth - count * 60);
    for (let i = 0; i < count; i++) {
        enemies.push({
            x: startX + i * 60,
            y: -50 - i * 40,
            width: 40 * config.size,
            height: 40 * config.size,
            speed: config.speed,
            hp: config.hp,
            maxHp: config.hp,
            emoji: config.emoji,
            type: config.type,
            skill: config.skill,
            size: config.size,
            canShoot: config.canShoot,
            shootInterval: config.shootInterval,
            shootTimer: Math.floor(Math.random() * (config.shootInterval || 120)),
            bulletType: config.bulletType,
            bulletColor: config.bulletColor
        });
    }
}

function spawnBossEnemy() {
    const enemyConfigs = ENEMY_TYPES[currentTheme];
    const config = enemyConfigs.find(e => e.type === 'tank') || enemyConfigs[0];
    
    enemies.push({
        x: GAME_AREA.playLeft + GAME_AREA.playWidth / 2,
        y: -80,
        width: 40 * config.size,
        height: 40 * config.size,
        speed: config.speed,
        hp: config.hp,
        maxHp: config.hp,
        emoji: config.emoji,
        type: config.type,
        skill: config.skill,
        size: config.size,
        isBoss: true,
        canShoot: config.canShoot,
        shootInterval: config.shootInterval,
        shootTimer: Math.floor(Math.random() * (config.shootInterval || 120)),
        bulletType: config.bulletType,
        bulletColor: config.bulletColor
    });
}

// ========== Boss系统 ==========

function spawnBoss() {
    bossSpawned = true;
    
    // 清除所有普通敌人，为Boss腾出空间
    enemies = [];
    
    // 停止普通敌人生成
    clearInterval(enemySpawnInterval);
    
    // 显示Boss警告
    showEncouragement('boss');
    
    // 根据主题选择Boss
    const bossConfigs = {
        space: { emoji: '👾', name: '阅读理解终极Boss', color: '#ff00ff' },
        fire: { emoji: '🔥', name: '火焰阅读魔王', color: '#ff6600' },
        ice: { emoji: '❄️', name: '冰封阅读巨兽', color: '#00ffff' },
        forest: { emoji: '🌳', name: '森林阅读守护者', color: '#00ff00' },
        ocean: { emoji: '🐋', name: '深海阅读霸主', color: '#1e90ff' },
        final: { emoji: '👽', name: '终极阅读挑战', color: '#ff0000' }
    };
    
    const bossConfig = bossConfigs[currentTheme] || bossConfigs.space;
    
    boss = {
        x: canvas.width / 2,
        y: -150,
        targetY: 150, // 目标Y位置
        width: 150,
        height: 150,
        speed: 1,
        hp: 500, // Boss血量
        maxHp: 500,
        emoji: bossConfig.emoji,
        name: bossConfig.name,
        color: bossConfig.color,
        size: 3,
        phase: 1, // Boss阶段（1-3）
        shootTimer: 0,
        shootInterval: 60, // 1秒射击一次
        moveTimer: 0,
        movePattern: 0, // 移动模式
        specialAttackTimer: 0,
        specialAttackInterval: 300 // 5秒一次特殊攻击
    };
}

function updateBoss() {
    if (!boss) return;
    
    // Boss入场动画
    if (boss.y < boss.targetY) {
        boss.y += boss.speed;
        return;
    }
    
    // 根据血量改变阶段
    const hpPercent = boss.hp / boss.maxHp;
    if (hpPercent > 0.66) {
        boss.phase = 1;
        boss.shootInterval = 60;
    } else if (hpPercent > 0.33) {
        boss.phase = 2;
        boss.shootInterval = 40; // 第二阶段射击更快
    } else {
        boss.phase = 3;
        boss.shootInterval = 30; // 第三阶段射击最快
    }
    
    // 移动模式
    boss.moveTimer++;
    if (boss.moveTimer > 180) { // 每3秒换一个移动模式
        boss.moveTimer = 0;
        boss.movePattern = Math.floor(Math.random() * 3);
    }
    
    // 执行移动
    switch(boss.movePattern) {
        case 0: // 左右移动
            boss.x += Math.sin(gameTime * 0.02) * 3;
            break;
        case 1: // 圆形移动
            boss.x = canvas.width / 2 + Math.cos(gameTime * 0.03) * 100;
            boss.y = boss.targetY + Math.sin(gameTime * 0.03) * 30;
            break;
        case 2: // 追踪玩家X坐标
            if (boss.x < player.x) boss.x += 2;
            if (boss.x > player.x) boss.x -= 2;
            break;
    }
    
    // 限制Boss在游戏区域内
    boss.x = Math.max(GAME_AREA.playLeft + boss.width / 2, 
                     Math.min(GAME_AREA.playRight - boss.width / 2, boss.x));
    
    // 普通射击
    boss.shootTimer++;
    if (boss.shootTimer >= boss.shootInterval) {
        boss.shootTimer = 0;
        bossShoot();
    }
    
    // 特殊攻击
    boss.specialAttackTimer++;
    if (boss.specialAttackTimer >= boss.specialAttackInterval) {
        boss.specialAttackTimer = 0;
        bossSpecialAttack();
    }
    
    // Boss死亡
    if (boss.hp <= 0) {
        bossDefeated = true;
        createExplosion(boss.x, boss.y, 3);
        
        // 大爆炸效果
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                createExplosion(
                    boss.x + (Math.random() - 0.5) * 100,
                    boss.y + (Math.random() - 0.5) * 100,
                    2
                );
            }, i * 100);
        }
        
        gameScore += 1000; // Boss奖励分数
        document.getElementById('gameScore').textContent = gameScore;
        
        // 掉落大量道具
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                powerups.push({
                    x: boss.x + (Math.random() - 0.5) * 150,
                    y: boss.y,
                    width: 40,
                    height: 40,
                    speed: 2,
                    type: powerupType,
                    rotation: 0
                });
            }, i * 200);
        }
        
        boss = null;
        
        // 重启普通敌人生成
        startEnemySpawn();
        
        showEncouragement('victory');
    }
}

function bossShoot() {
    if (!boss) return;
    
    const bulletCount = boss.phase; // 阶段越高，子弹越多
    
    for (let i = 0; i < bulletCount; i++) {
        const angle = (Math.PI * 2 / bulletCount) * i;
        const speed = 4;
        
        enemyBullets.push({
            x: boss.x,
            y: boss.y + boss.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            speed: speed,
            size: 12,
            type: 'heavy',
            color: boss.color,
            skill: null,
            age: 0,
            isBoss: true
        });
    }
}

function bossSpecialAttack() {
    if (!boss) return;
    
    switch(boss.phase) {
        case 1:
            // 第一阶段：向玩家发射3发追踪弹
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const dx = player.x - boss.x;
                    const dy = player.y - boss.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    enemyBullets.push({
                        x: boss.x,
                        y: boss.y + boss.height / 2,
                        vx: (dx / dist) * 5,
                        vy: (dy / dist) * 5,
                        speed: 5,
                        size: 15,
                        type: 'fire',
                        color: '#ff6600',
                        skill: null,
                        age: 0,
                        isBoss: true
                    });
                }, i * 300);
            }
            break;
            
        case 2:
            // 第二阶段：扇形弹幕
            for (let i = 0; i < 8; i++) {
                const angle = -Math.PI / 2 + (Math.PI / 4) * (i / 7 - 0.5);
                enemyBullets.push({
                    x: boss.x,
                    y: boss.y + boss.height / 2,
                    vx: Math.cos(angle) * 6,
                    vy: Math.sin(angle) * 6,
                    speed: 6,
                    size: 10,
                    type: 'normal',
                    color: boss.color,
                    skill: null,
                    age: 0,
                    isBoss: true
                });
            }
            break;
            
        case 3:
            // 第三阶段：螺旋弹幕
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const angle = (Math.PI * 2 / 12) * i + gameTime * 0.1;
                    enemyBullets.push({
                        x: boss.x,
                        y: boss.y + boss.height / 2,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4,
                        speed: 4,
                        size: 12,
                        type: 'confuse',
                        color: '#ff00ff',
                        skill: 'confuse',
                        age: 0,
                        isBoss: true
                    });
                }, i * 50);
            }
            break;
    }
}

function drawBoss() {
    if (!boss) return;
    
    // Boss光环效果
    const pulse = Math.sin(gameTime * 0.1) * 10 + 70;
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Boss本体
    ctx.font = `${120}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(boss.emoji, boss.x, boss.y);
    
    // Boss名称
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = boss.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(boss.name, boss.x, boss.y - 100);
    ctx.fillText(boss.name, boss.x, boss.y - 100);
    
    // Boss血条（大号）
    const barWidth = 300;
    const barHeight = 20;
    const hpPercent = boss.hp / boss.maxHp;
    
    // 血条背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(boss.x - barWidth / 2, boss.y - 80, barWidth, barHeight);
    
    // 血条
    const barColor = hpPercent > 0.66 ? '#48bb78' : hpPercent > 0.33 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = barColor;
    ctx.fillRect(boss.x - barWidth / 2, boss.y - 80, barWidth * hpPercent, barHeight);
    
    // 血条边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(boss.x - barWidth / 2, boss.y - 80, barWidth, barHeight);
    
    // 血量数字
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const hpText = `${Math.max(0, boss.hp)} / ${boss.maxHp}`;
    ctx.strokeText(hpText, boss.x, boss.y - 70);
    ctx.fillText(hpText, boss.x, boss.y - 70);
    
    // 阶段指示
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffd700';
    const phaseText = `阶段 ${boss.phase}/3`;
    ctx.strokeText(phaseText, boss.x, boss.y + 90);
    ctx.fillText(phaseText, boss.x, boss.y + 90);
}

function checkBossCollisions() {
    if (!boss) return;
    
    // 子弹击中Boss
    bullets.forEach((bullet, bIndex) => {
        const dx = bullet.x - boss.x;
        const dy = bullet.y - boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 60) {
            boss.hp -= bullet.damage;
            
            // 爆炸效果
            if (bullet.explosive) {
                createExplosion(bullet.x, bullet.y, 1.5);
            }
            
            // 如果不是穿透弹，删除子弹
            if (!bullet.pierce) {
                bullets.splice(bIndex, 1);
            }
        }
    });
    
    // Boss撞到玩家
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 80) {
        // 检查是否有护盾或无敌
        const shieldPowerup = activePowerups.find(p => p.effect === 'shield');
        const invinciblePowerup = activePowerups.find(p => p.effect === 'invincible');
        
        if (!shieldPowerup && !invinciblePowerup) {
            player.hp = Math.max(0, player.hp - 20); // Boss撞击伤害很高
            updateHP();
        }
    }
}

// ========== 道具系统 ==========

let powerupSpawnInterval;
function startPowerupSpawn() {
    powerupSpawnInterval = setInterval(() => {
        if (gameRunning && powerups.length < 3 && comboCount >= 5) {
            spawnPowerup();
        }
    }, 8000); // 每8秒检查一次
}

function spawnPowerup() {
    let powerupType;
    
    // 30%概率掉落血包（如果血量低于50%，概率提高到50%）
    const healthPercent = player.hp / player.maxHp;
    const healthPackChance = healthPercent < 0.5 ? 0.5 : 0.3;
    
    if (Math.random() < healthPackChance) {
        // 随机选择血包类型
        const healthPacks = POWERUP_TYPES.filter(p => p.effect === 'healthpack');
        powerupType = healthPacks[Math.floor(Math.random() * healthPacks.length)];
    } else {
        // 选择其他道具（排除血包）
        const otherPowerups = POWERUP_TYPES.filter(p => p.effect !== 'healthpack');
        powerupType = otherPowerups[Math.floor(Math.random() * otherPowerups.length)];
    }
    
    powerups.push({
        x: GAME_AREA.playLeft + Math.random() * GAME_AREA.playWidth,
        y: -30,
        width: 40,
        height: 40,
        speed: 2,
        type: powerupType,
        rotation: 0
    });
}

function updatePowerups() {
    // 检查是否有磁铁道具
    const magnetPowerup = activePowerups.find(p => p.effect === 'magnet');
    
    powerups = powerups.filter(powerup => {
        // 磁铁效果：道具被吸引向玩家
        if (magnetPowerup) {
            const dx = player.x - powerup.x;
            const dy = player.y - powerup.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) { // 磁铁范围200像素
                const attractSpeed = 5;
                powerup.x += (dx / distance) * attractSpeed;
                powerup.y += (dy / distance) * attractSpeed;
            } else {
                powerup.y += powerup.speed;
            }
        } else {
            powerup.y += powerup.speed;
        }
        
        powerup.rotation += 0.1;
        return powerup.y < canvas.height + 50;
    });
}

function drawPowerups() {
    powerups.forEach(powerup => {
        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        ctx.rotate(powerup.rotation);
        
        // 绘制光晕
        ctx.fillStyle = powerup.type.color + '40';
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制道具图标
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.type.icon, 0, 0);
        
        ctx.restore();
        
        // 绘制道具名称标签（不旋转）
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = ctx.measureText(powerup.type.name).width;
        ctx.fillRect(powerup.x - textWidth/2 - 4, powerup.y + 25, textWidth + 8, 20);
        
        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.fillText(powerup.type.name, powerup.x, powerup.y + 28);
        ctx.restore();
    });
}

function checkPowerupCollisions() {
    powerups.forEach((powerup, index) => {
        const dx = player.x - powerup.x;
        const dy = player.y - powerup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40) {
            activatePowerup(powerup.type);
            powerups.splice(index, 1);
            createExplosion(powerup.x, powerup.y, 0.8);
        }
    });
}

function activatePowerup(powerupType) {
    // 即时效果道具（不需要持续时间）
    if (powerupType.effect === 'bomb') {
        // 炸弹：清除屏幕上所有敌人
        enemies.forEach(enemy => {
            createExplosion(enemy.x, enemy.y, enemy.size);
            gameScore += 10;
            enemiesKilled++;
        });
        enemies = [];
        showEncouragement('powerup');
        return;
    }
    
    if (powerupType.effect === 'heal') {
        // 治疗：恢复50点HP（血量增加后相应提高）
        player.hp = Math.min(player.hp + 50, player.maxHp);
        updateHP();
        showEncouragement('powerup');
        return;
    }
    
    if (powerupType.effect === 'healthpack') {
        // 血包：根据类型恢复不同HP
        player.hp = Math.min(player.hp + powerupType.healAmount, player.maxHp);
        updateHP();
        showEncouragement('powerup');
        return;
    }
    
    // 检查是否已有相同道具
    const existing = activePowerups.find(p => p.effect === powerupType.effect);
    if (existing) {
        existing.duration = powerupType.duration;
        existing.maxDuration = powerupType.duration;
        updatePowerupDisplay();
        return;
    }
    
    activePowerups.push({
        ...powerupType,
        maxDuration: powerupType.duration
    });
    
    // 如果是狂射道具，重启射击以立即生效
    if (powerupType.effect === 'rapidfire') {
        clearInterval(fireInterval);
        startAutoFire();
    }
    
    // 显示鼓励语
    showEncouragement('powerup');
    
    updatePowerupDisplay();
}

function updateActivePowerups() {
    activePowerups = activePowerups.filter(powerup => {
        powerup.duration--;
        if (powerup.duration <= 0) {
            // 如果狂射道具结束，需要重启射击以恢复正常射速
            if (powerup.effect === 'rapidfire') {
                clearInterval(fireInterval);
                startAutoFire();
            }
            updatePowerupDisplay(); // 只在道具结束时更新
            return false;
        }
        return true;
    });
    
    // 移除每10帧更新，改为每60帧（1秒）更新一次倒计时
    if (gameTime % 60 === 0 && activePowerups.length > 0) {
        updatePowerupDisplay();
    }
}

function updatePowerupDisplay() {
    const display = document.getElementById('powerupDisplay');
    display.innerHTML = '';
    
    activePowerups.forEach(powerup => {
        const percent = (powerup.duration / powerup.maxDuration) * 100;
        const seconds = Math.ceil(powerup.duration / 60);
        
        const item = document.createElement('div');
        item.className = 'powerup-item';
        item.innerHTML = `
            <div class="powerup-icon">${powerup.icon}</div>
            <div class="powerup-info">
                <div class="powerup-name">${powerup.name}</div>
                <div class="powerup-timer">${seconds}秒</div>
                <div class="powerup-bar">
                    <div class="powerup-bar-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
        display.appendChild(item);
    });
}

// ========== 敌人更新 ==========

function updateEnemies() {
    // 检查是否有时停道具
    const slowtimePowerup = activePowerups.find(p => p.effect === 'slowtime');
    const timeScale = slowtimePowerup ? 0.3 : 1; // 时停时敌人速度变为30%
    
    // 检查是否有冰冻道具
    const freezePowerup = activePowerups.find(p => p.effect === 'freeze');
    const isFrozen = freezePowerup ? true : false;
    
    enemies = enemies.filter(enemy => {
        // 冰冻时敌人完全不动
        if (!isFrozen) {
            enemy.y += enemy.speed * timeScale;
        }
        
        // 敌人射击逻辑（冰冻时不射击）
        if (!isFrozen && enemy.canShoot && enemy.y > 0 && enemy.y < canvas.height - 100) {
            enemy.shootTimer--;
            if (enemy.shootTimer <= 0) {
                enemyShoot(enemy);
                enemy.shootTimer = enemy.shootInterval * (slowtimePowerup ? 3 : 1); // 时停时射击间隔变为3倍
            }
        }
        
        return enemy.y < canvas.height + 50 && enemy.hp > 0;
    });
}

// 敌人射击函数
function enemyShoot(enemy) {
    const bulletSize = enemy.size * 6; // 根据敌人大小决定子弹大小
    
    enemyBullets.push({
        x: enemy.x,
        y: enemy.y + enemy.height / 2,
        speed: 3 + enemy.size, // 大敌人子弹更快
        size: bulletSize,
        type: enemy.bulletType,
        color: enemy.bulletColor,
        skill: enemy.skill,
        age: 0
    });
}

function drawEnemies() {
    // 检查是否有冰冻道具
    const freezePowerup = activePowerups.find(p => p.effect === 'freeze');
    
    enemies.forEach(enemy => {
        // 如果冰冻，先绘制冰块效果
        if (freezePowerup) {
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#00bfff';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 30 * enemy.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 冰晶效果
            ctx.font = `${35 * enemy.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❄️', enemy.x, enemy.y);
            ctx.restore();
        }
        
        // 绘制敌人
        const fontSize = 40 * enemy.size;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.emoji, enemy.x, enemy.y);
        
        // Boss敌人显示血条
        if (enemy.isBoss || enemy.hp > 5) {
            const barWidth = enemy.width;
            const barHeight = 5;
            const hpPercent = enemy.hp / enemy.maxHp;
            
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.height / 2 - 10, barWidth, barHeight);
            
            ctx.fillStyle = hpPercent > 0.5 ? '#48bb78' : hpPercent > 0.2 ? '#f59e0b' : '#ef4444';
            ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.height / 2 - 10, barWidth * hpPercent, barHeight);
        }
    });
}

// ========== 敌人子弹系统 ==========

function updateEnemyBullets() {
    // 检查是否有时停道具
    const slowtimePowerup = activePowerups.find(p => p.effect === 'slowtime');
    const timeScale = slowtimePowerup ? 0.3 : 1; // 时停时子弹速度变为30%
    
    // 检查是否有冰冻道具
    const freezePowerup = activePowerups.find(p => p.effect === 'freeze');
    const isFrozen = freezePowerup ? true : false;
    
    enemyBullets = enemyBullets.filter(bullet => {
        // 冰冻时子弹不动
        if (!isFrozen) {
            // Boss子弹使用自定义速度向量
            if (bullet.isBoss && bullet.vx !== undefined && bullet.vy !== undefined) {
                bullet.x += bullet.vx * timeScale;
                bullet.y += bullet.vy * timeScale;
            } else {
                // 普通敌人子弹垂直下落
                bullet.y += bullet.speed * timeScale;
            }
        }
        
        bullet.age++;
        return bullet.y < canvas.height + 50 && bullet.y > -50 && 
               bullet.x > -50 && bullet.x < canvas.width + 50;
    });
}

function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        ctx.save();
        
        const size = bullet.size;
        const x = bullet.x;
        const y = bullet.y;
        
        // 根据子弹类型绘制不同效果
        switch(bullet.type) {
            case 'normal':
                // 普通子弹：圆形
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'heavy':
                // 重型子弹：大圆+外圈
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'freeze':
                // 冰冻子弹：雪花形状
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                // 画雪花线条
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
                    ctx.stroke();
                }
                break;
                
            case 'slow':
                // 减速子弹：脉动圆
                const pulse = Math.sin(bullet.age * 0.2) * 2;
                ctx.fillStyle = bullet.color + '80';
                ctx.beginPath();
                ctx.arc(x, y, size + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'reverse':
                // 反向子弹：旋转箭头
                ctx.fillStyle = bullet.color;
                ctx.translate(x, y);
                ctx.rotate(bullet.age * 0.1);
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.7, size * 0.5);
                ctx.lineTo(-size * 0.7, size * 0.5);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'confuse':
                // 混乱子弹：螺旋
                ctx.fillStyle = bullet.color;
                const spiral = Math.sin(bullet.age * 0.3) * size * 0.5;
                ctx.beginPath();
                ctx.arc(x + spiral, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'fire':
                // 火焰子弹：渐变
                const fireGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                fireGrad.addColorStop(0, '#ffff00');
                fireGrad.addColorStop(0.5, '#ff6600');
                fireGrad.addColorStop(1, '#ff0000');
                ctx.fillStyle = fireGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            default:
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
        }
        
        ctx.restore();
    });
}

// 检测玩家子弹和敌人子弹的碰撞
function checkBulletCollisions() {
    bullets.forEach((playerBullet, pIndex) => {
        enemyBullets.forEach((enemyBullet, eIndex) => {
            const dx = playerBullet.x - enemyBullet.x;
            const dy = playerBullet.y - enemyBullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 如果两个子弹碰撞（距离小于两个子弹大小之和）
            if (distance < playerBullet.size + enemyBullet.size) {
                // 创建小爆炸效果
                createExplosion(enemyBullet.x, enemyBullet.y, 0.5);
                
                // 删除敌人子弹
                enemyBullets.splice(eIndex, 1);
                
                // 如果玩家子弹不是穿透弹，也删除
                if (!playerBullet.pierce) {
                    bullets.splice(pIndex, 1);
                }
            }
        });
    });
}

function checkEnemyBulletCollisions() {
    // 如果无敌，直接返回
    const invinciblePowerup = activePowerups.find(p => p.effect === 'invincible');
    if (invinciblePowerup) {
        // 无敌时子弹直接消失
        enemyBullets.forEach((bullet, index) => {
            const dx = player.x - bullet.x;
            const dy = player.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 30) {
                enemyBullets.splice(index, 1);
                createExplosion(bullet.x, bullet.y, 0.5);
            }
        });
        return;
    }
    
    enemyBullets.forEach((bullet, index) => {
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
            // 检查是否有护盾
            const shieldPowerup = activePowerups.find(p => p.effect === 'shield');
            if (!shieldPowerup) {
                // 扣血
                player.hp = Math.max(0, player.hp - 5);
                updateHP();
            }
            
            // 应用debuff（护盾不能防debuff）
            if (bullet.skill) {
                applyDebuff(bullet.skill);
            }
            
            enemyBullets.splice(index, 1);
            createExplosion(bullet.x, bullet.y, 0.5);
        }
    });
}

function checkCollisions() {
    // 子弹击中敌人
    bullets.forEach((bullet, bIndex) => {
        let bulletHit = false;
        
        enemies.forEach((enemy, eIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 25 * enemy.size) {
                enemy.hp -= bullet.damage;
                bulletHit = true;
                
                // 爆炸子弹：范围伤害
                if (bullet.explosive) {
                    createExplosion(bullet.x, bullet.y, 1.5);
                    // 对范围内所有敌人造成伤害
                    enemies.forEach(e => {
                        const edx = bullet.x - e.x;
                        const edy = bullet.y - e.y;
                        const edist = Math.sqrt(edx * edx + edy * edy);
                        if (edist < bullet.explosionRadius) {
                            e.hp -= Math.floor(bullet.damage * 0.5); // 范围伤害减半
                        }
                    });
                }
                
                // 如果不是穿透弹，删除子弹
                if (!bullet.pierce) {
                    bullets.splice(bIndex, 1);
                }
                
                if (enemy.hp <= 0) {
                    createExplosion(enemy.x, enemy.y, enemy.size);
                    enemies.splice(eIndex, 1);
                    
                    // 检查是否有双倍道具
                    const doublePowerup = activePowerups.find(p => p.effect === 'double');
                    const scoreMultiplier = doublePowerup ? 2 : 1;
                    gameScore += Math.floor(10 * enemy.size * scoreMultiplier);
                    enemiesKilled++;
                    
                    // 更新连击
                    const now = gameTime;
                    if (now - lastKillTime < 120) { // 2秒内连击
                        comboCount++;
                        if (comboCount >= 5) {
                            showEncouragement('combo'); // 连击鼓励
                        }
                    } else {
                        comboCount = 1;
                        if (Math.random() < 0.3) { // 30%概率显示击杀鼓励
                            showEncouragement('kill');
                        }
                    }
                    lastKillTime = now;
                    
                    document.getElementById('gameScore').textContent = gameScore;
                }
            }
        });
        
        // 清理已经击中且不穿透的子弹
        if (bulletHit && !bullet.pierce && bullets[bIndex]) {
            bullets.splice(bIndex, 1);
        }
    });
    
    // 敌人撞到玩家
    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40 * enemy.size) {
            // 检查是否有护盾
            const shieldPowerup = activePowerups.find(p => p.effect === 'shield');
            if (!shieldPowerup) {
                // 扣血
                player.hp = Math.max(0, player.hp - Math.floor(3 * enemy.size));
                updateHP();
            }
            
            // 应用debuff技能（护盾不能防debuff）
            if (enemy.skill) {
                applyDebuff(enemy.skill);
            }
            
            enemies.splice(index, 1);
            createExplosion(enemy.x, enemy.y, enemy.size);
        }
    });
}

function applyDebuff(skillType) {
    // 检查是否已有相同debuff
    const existing = playerDebuffs.find(d => d.type === skillType);
    if (existing) {
        existing.duration = 180; // 重置持续时间
        return;
    }
    
    let duration = 180; // 3秒 (60帧/秒)
    
    switch(skillType) {
        case 'freeze':
            duration = 180; // 3秒冻结
            break;
        case 'slow':
            duration = 240; // 4秒减速
            break;
        case 'reverse':
            duration = 180; // 3秒反向
            break;
        case 'confuse':
            duration = 150; // 2.5秒混乱
            break;
    }
    
    playerDebuffs.push({
        type: skillType,
        duration: duration
    });
    
    // 显示debuff提示
    showDebuffNotification(skillType);
}

function showDebuffNotification(skillType) {
    const messages = {
        freeze: '❄️ 被冻结了！',
        slow: '🐌 移动减速！',
        reverse: '🔄 方向反转！',
        confuse: '😵 混乱状态！'
    };
    
    // 可以在这里添加屏幕提示动画
    console.log(messages[skillType] || '⚠️ 受到影响！');
}

function updateHP() {
    const percent = (player.hp / player.maxHp) * 100;
    document.getElementById('hpBar').style.width = percent + '%';
    document.getElementById('hpText').textContent = `${player.hp}/${player.maxHp}`;
}

function createExplosion(x, y, size = 1) {
    explosions.push({
        x: x,
        y: y,
        radius: 5 * size,
        maxRadius: 30 * size,
        alpha: 1,
        size: size
    });
}

function updateExplosions() {
    explosions = explosions.filter(exp => {
        exp.radius += 2 * exp.size;
        exp.alpha -= 0.05;
        return exp.alpha > 0;
    });
}

function drawExplosions() {
    explosions.forEach(exp => {
        ctx.fillStyle = `rgba(255, 100, 0, ${exp.alpha})`;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加外圈效果
        ctx.strokeStyle = `rgba(255, 200, 0, ${exp.alpha * 0.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

function endGame(victory) {
    gameRunning = false;
    clearInterval(fireInterval);
    clearInterval(enemySpawnInterval);
    clearInterval(powerupSpawnInterval);
    
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    
    if (victory) {
        showVictory();
    }
}

function showVictory() {
    console.log('显示通关界面');
    
    // 显示通关鼓励语
    showEncouragement('victory');
    
    // 延迟显示通关界面，让鼓励语先显示
    setTimeout(() => {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('victoryScreen').classList.remove('hidden');
        document.getElementById('victoryScreen').classList.add('active');
    }, 2000);
    
    // 计算星级
    let stars = 1;
    if (gameScore >= 300) stars = 3;
    else if (gameScore >= 200) stars = 2;
    
    // 保存数据
    const data = getReadingData();
    data.levels[currentLevelNum] = {
        completed: true,
        stars: stars,
        score: gameScore,
        weapon: currentWeapon.name
    };
    data.totalScore += gameScore;
    data.completedCount++;
    
    // 更新连续天数
    const today = new Date().toISOString().split('T')[0];
    if (data.lastPlayDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (data.lastPlayDate === yesterday) {
            data.streakDays++;
        } else {
            data.streakDays = 1;
        }
        data.lastPlayDate = today;
    }
    
    saveReadingData(data);
    
    // 显示结果
    document.getElementById('victoryStars').textContent = '⭐'.repeat(stars);
    document.getElementById('finalScore').textContent = gameScore;
    document.getElementById('enemiesKilled').textContent = enemiesKilled;
    document.getElementById('completionTime').textContent = Math.floor(gameTime / 60);
    
    // 显示奖励
    const rewards = [
        `💰 获得 ${gameScore} 积分`,
        `⭐ 获得 ${stars} 星评价`,
        `🏆 消灭 ${enemiesKilled} 个敌人`
    ];
    
    if (currentLevelNum % 5 === 0) {
        rewards.push('🎁 章节完成奖励');
    }
    
    document.getElementById('rewardList').innerHTML = rewards.map(r => 
        `<div class="reward-item">${r}</div>`
    ).join('');
}

function backToMap() {
    document.getElementById('victoryScreen').classList.remove('active');
    document.getElementById('victoryScreen').classList.add('hidden');
    document.getElementById('mapScreen').classList.remove('hidden');
    document.getElementById('mapScreen').classList.add('active');
    renderMap();
    updateMapInfo();
}

function goHome() {
    window.location.href = 'home.html';
}

// 调试：清除数据（在浏览器控制台调用 clearReadingData()）
function clearReadingData() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('阅读数据已清除');
    location.reload();
}

