// 陀螺竞技场逻辑

// 陀螺配置
const TOP_TYPES = [
    // 商店可购买的基础陀螺 (Tier 1-4)
    { id: 1, name: '铁皮陀螺', emoji: '⚙️', hp: 5, cost: 6, color: '#94a3b8', tier: 1 },
    { id: 2, name: '合金陀螺', emoji: '🛡️', hp: 10, cost: 12, color: '#38bdf8', tier: 2 },
    { id: 3, name: '烈焰陀螺', emoji: '🔥', hp: 15, cost: 24, color: '#ef4444', tier: 3 },
    { id: 4, name: '圣光陀螺', emoji: '🌟', hp: 20, cost: 48, color: '#fbbf24', tier: 4 },
    
    // 只能通过合成获得的高级陀螺 (Tier 5-10)
    { id: 5, name: '虚空陀螺', emoji: '🔮', hp: 25, cost: 0, color: '#a855f7', tier: 5 }, // 两个圣光合成
    { id: 6, name: '混沌陀螺', emoji: '⚡', hp: 30, cost: 0, color: '#10b981', tier: 6 }, // 两个虚空合成
    { id: 7, name: '创世陀螺', emoji: '👑', hp: 35, cost: 0, color: '#f43f5e', tier: 7 }, // 两个混沌合成
    
    // 终极陀螺 (Tier 8-10)
    { id: 8, name: '星辰陀螺', emoji: '🌌', hp: 40, cost: 0, color: '#6366f1', tier: 8 }, // 两个创世合成
    { id: 9, name: '黑洞陀螺', emoji: '🕳️', hp: 45, cost: 0, color: '#1e1b4b', tier: 9 }, // 两个星辰合成
    { id: 10, name: '宇宙陀螺', emoji: '🌠', hp: 50, cost: 0, color: '#fbbf24', tier: 10 } // 两个黑洞合成
];

const ENEMY_EMOJI = '😈';
const ENEMY_COLOR = '#3b82f6'; // 蓝色
const BOSS_EMOJI = '💀'; // BOSS陀螺
const BOSS_COLOR = '#dc2626'; // BOSS红色
const BOSS_MAX_HP = 9999; // BOSS血量由系统分配，不会真实死亡（但显示用）

// 同学名单（从口算竞速模块导入，已去掉王柏皓）
const STUDENT_NAMES = [
    '孙博渊', '蔡静轩', '史卓远', '胡殷阳', '雷远', '张睿琪', '黄小易',
    '叶宇辰', '陈佳铭', '李一帆', '孙尚峻', '刘维熙', '郑博文', '魏嘉浩', '陈宏维',
    '焦艾嘉', '马凯北', '赵胤凡', '周进杉', '朱宜萌', '赵家豪', '刘泽琪', '郭潇祺',
    '裴名播', '闫翊晨', '孙玄霆', '秦俊坤', '陈雨桐', '刘思成', '蒋逸宣', '王思承',
    '王可泽', '王梓瑞', '刘桐菲', '路嘉瑶', '武玥', '王梓萌', '闫祥文', '朱昊天'
];

// 状态变量
const TOP_GAME_KEY = 'focusTree_topGameData';
// lastPlayerHp: 记录上一次比赛时我方的总血量，用于判断是否升级
let topData = { inventory: [], currentLevel: 1, lastPlayerHp: 0 };
let selectedInventoryIndex = -1;

let totalEnemyMaxHp = 0;
let totalPlayerMaxHp = 0;

// 游戏核心变量

// 游戏核心变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_COLS = 5;
const GRID_ROWS = 6;
const CELL_SIZE = 80;
const RADIUS = 30;

let gameState = 'setup'; // setup, playing, ended
let topsOnBoard = []; // { id, typeId, x, y, vx, vy, hp, maxHp, isEnemy, color, emoji, angle, rSpeed, bounceTimer, isDeadAnimating }
let particles = []; // 用于存储碰撞产生的火花粒子
let damageNumbers = []; // 用于存储碰撞时显示的掉血数字 { x, y, damage, isEnemy, life, vy }
let defeatedNameAnimations = []; // 用于存储被击败时飞出的名字动画 { x, y, name, life, scale, vx, vy }
let initialPlayerTops = []; // 记录开局时我方放上的陀螺，用于比赛结束后全部收回
let animFrame = null;
let speedUpPhase1Applied = false; // 标记是否应用了"一方只剩1个"的一阶加速
let speedUpPhase2Applied = false; // 标记是否应用了"最后1v1"的二阶加速
let showHpValues = false; // 是否显示具体血量数值 (按 'h' 键切换)
let gameSpeed = 1; // 玩家可调节的速度倍率
let mergeJustHappened = false; // 标记刚刚完成合成，用于防止 beforeunload 重复添加陀螺到背包
let bossAppearances = 0; // BOSS出现次数（用于显示不同造型）
let bossesDefeated = 0; // 已被击败的BOSS数量（触发特别台词）

// 调试信息：本局预设结果和理由
let currentMatchPrediction = {
    result: '—',      // 'win', 'lose', 'random'
    resultText: '—',  // 显示文本
    reason: '—',      // 判定理由
    enemyHp: 0,       // 敌方目标血量
    playerHp: 0       // 我方血量
};

// 本局循环状态（用于比赛结束后更新计数）
let currentMatchCycleState = {
    shouldIncrementWins: false,  // 是否应该增加nonUpgradeWins
    shouldEnterBossCycle: false, // 是否应该进入BOSS循环
    shouldResetBossCycle: false  // 是否应该重置BOSS循环
};

// 本局敌方名称（每局只有一个同学）
let currentMatchEnemyName = '';
// 下局要来的同学名称
let nextMatchEnemyName = '';

// PK开始动画状态
let pkAnimation = {
    active: false,
    progress: 0,      // 0 到 1
    duration: 2000,   // 动画持续时间（毫秒）
    startTime: 0
};

// 敌方幕布状态
let enemyCurtain = {
    visible: true,    // 是否显示幕布
    opacity: 1,       // 透明度
    offsetY: 0,       // Y轴偏移量（用于滑动动画）
    text: '',         // 动态设置：XXX陀螺正在派兵中...
    dots: 0           // 动态省略号
};

// ===== 密码锁逻辑 =====
function lockGetPwd() {
    const now = new Date();
    const day = now.getDay();
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
        // 密码正确，开始初始化游戏
        initGame();
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

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    // 页面加载时自动聚焦到密码框
    const lockInput = document.getElementById('realLockInput');
    if(lockInput) {
        setTimeout(() => lockInput.focus(), 100);
    }
});

function initGame() {
    loadTopData();
    updateHUD();
    renderShop();
    renderInventory();
    buildGridOverlay();
    
    // 生成敌方阵型
    spawnStaticEnemies();
    updateEnemyHpAllocation();
    drawBoard();
    
    // 监听键盘事件 'h' 切换血量数值显示
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h') {
            showHpValues = !showHpValues;
            updateTotalHpDisplay(false);
            const debugPanel = document.getElementById('debugPanel');
            debugPanel.style.display = showHpValues ? 'block' : 'none';
            if (showHpValues) updateDebugPanel();
            if (gameState !== 'playing') {
                drawBoard();
            }
        }
    });
    
    // 速度滑块事件
    const slider = document.getElementById('speedSlider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            gameSpeed = parseInt(e.target.value);
            const speedVal = document.getElementById('speedValue');
            if (speedVal) speedVal.textContent = gameSpeed + 'x';
        });
    }
}

// 在页面即将刷新或关闭时，检查是否处于准备阶段，如果是，将棋盘上的陀螺还给背包并保存
// 注意：为了避免与合成时的单独保存冲突，这里仅在非合成后状态下保存
window.addEventListener('beforeunload', () => {
    if (gameState === 'setup') {
        // 准备阶段：把棋盘上的我方陀螺还回背包
        const myTops = topsOnBoard.filter(t => !t.isEnemy);
        if (myTops.length > 0) {
            myTops.forEach(t => {
                topData.inventory.push({ typeId: t.typeId });
            });
            // 清理棋盘上的我方陀螺，避免重复
            topsOnBoard = topsOnBoard.filter(t => t.isEnemy);
            topData.interruptedMatchTops = null;
            saveTopData();
        }
    } else if (gameState === 'playing') {
        // 比赛进行中：把参赛的原始陀螺还回背包
        if (initialPlayerTops && initialPlayerTops.length > 0) {
            initialPlayerTops.forEach(t => {
                topData.inventory.push({ typeId: t.typeId });
            });
            topData.interruptedMatchTops = null;
            saveTopData();
        }
    }
});

// 加载/保存数据
function loadTopData() {
    const raw = localStorage.getItem(TOP_GAME_KEY);
    if (raw) {
        topData = JSON.parse(raw);
        if (typeof topData.lastPlayerHp === 'undefined') topData.lastPlayerHp = 0;
        if (typeof topData.consecutiveLosses === 'undefined') topData.consecutiveLosses = 0;
        if (typeof topData.nonUpgradeWins === 'undefined') topData.nonUpgradeWins = 0;
        if (typeof topData.inForcedLossCycle === 'undefined') topData.inForcedLossCycle = false;
    } else {
        // 初始赠送一个1级陀螺
        topData = { inventory: [{ typeId: 1 }], currentLevel: 1, lastPlayerHp: 0, consecutiveLosses: 0, nonUpgradeWins: 0, inForcedLossCycle: false };
        saveTopData();
    }
}
function saveTopData() {
    localStorage.setItem(TOP_GAME_KEY, JSON.stringify(topData));
}

// HUD
// HUD 更新调试信息面板（按住 H 时显示）
function updateDebugPanel() {
    const phaseEl = document.getElementById('debugPhase');
    const winsEl = document.getElementById('debugWins');
    const forcedEl = document.getElementById('debugForced');
    const bossAppearancesEl = document.getElementById('debugBossAppearances');
    const bossDefeatedEl = document.getElementById('debugBossDefeated');
    const enemyTypeEl = document.getElementById('debugEnemyType');
    const playerTierEl = document.getElementById('debugPlayerTier');
    const predictedResultEl = document.getElementById('debugPredictedResult');
    const reasonEl = document.getElementById('debugReason');

    // 计算当前状态
    let phaseText = '—';
    let phaseClass = 'info';

    if (topData.inForcedLossCycle) {
        phaseText = '强制输循环中';
        phaseClass = 'lose';
    } else if (topData.nonUpgradeWins >= 2) {
        phaseText = '第3局(50%概率)';
        phaseClass = 'info';
    } else if (topData.nonUpgradeWins >= 1) {
        phaseText = '第2局(强制赢)';
        phaseClass = 'win';
    } else {
        phaseText = '第1局(强制赢)';
        phaseClass = 'win';
    }

    phaseEl.textContent = phaseText;
    phaseEl.className = 'debug-val ' + phaseClass;

    winsEl.textContent = `${topData.nonUpgradeWins} / 2`;
    forcedEl.textContent = topData.inForcedLossCycle ? '是 ❌' : '否 ✅';
    forcedEl.className = 'debug-val ' + (topData.inForcedLossCycle ? 'lose' : 'win');
    bossAppearancesEl.textContent = bossAppearances;
    bossDefeatedEl.textContent = bossesDefeated;

    // 检测场上有没有 BOSS
    const hasBoss = topsOnBoard.some(t => t.isEnemy && t.isBoss);
    enemyTypeEl.textContent = hasBoss ? `BOSS (Tier ${topsOnBoard.find(t => t.isBoss)?.bossTier || '?'})` : '普通';
    enemyTypeEl.className = 'debug-val ' + (hasBoss ? 'lose' : 'win');

    // 我方最高等级
    let maxTier = 0;
    let maxTierName = '—';
    topsOnBoard.forEach(t => {
        if (!t.isEnemy) {
            const def = TOP_TYPES.find(x => x.id === t.typeId);
            if (def && def.tier > maxTier) {
                maxTier = def.tier;
                maxTierName = def.name;
            }
        }
    });
    playerTierEl.textContent = maxTier > 0 ? `Tier ${maxTier} ${maxTierName}` : '—';

    // 更新本局预测结果和理由
    if (predictedResultEl && reasonEl) {
        predictedResultEl.textContent = currentMatchPrediction.resultText;
        predictedResultEl.className = 'debug-val ' + (currentMatchPrediction.result === 'win' ? 'win' : currentMatchPrediction.result === 'lose' ? 'lose' : 'info');
        reasonEl.textContent = currentMatchPrediction.reason;
    }
}

function updateHUD() {
    const tData = getTowerData();
    document.getElementById('hudPts').textContent = `积分: ${tData.points}`;
    document.getElementById('hudLevel').textContent = `第 ${topData.currentLevel} 关`;
}

// 渲染商店
function renderShop() {
    const shopList = document.getElementById('shopList');
    shopList.innerHTML = '';
    const tData = getTowerData();
    
    // 只显示前四个可购买的陀螺 (Tier 1-4)
    const purchasableTops = TOP_TYPES.filter(t => t.tier <= 4);
    
    purchasableTops.forEach(type => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        
        const canAfford = tData.points >= type.cost;
        
        item.innerHTML = `
            <div class="shop-item-icon">${type.emoji}</div>
            <div class="shop-item-info">
                <div class="shop-item-name" style="color:${type.color}">${type.name}</div>
                <div class="shop-item-stats">血量: ${type.hp} | 售价: ${type.cost} 积分</div>
            </div>
            <button class="btn-buy" ${canAfford ? '' : 'disabled'} onclick="buyTop(${type.id})">
                ${canAfford ? '购买' : '积分不足'}
            </button>
        `;
        shopList.appendChild(item);
    });
}

function buyTop(typeId) {
    const type = TOP_TYPES.find(t => t.id === typeId);
    const tData = getTowerData();
    if (tData.points >= type.cost) {
        tData.points -= type.cost;
        saveTowerData(tData);
        
        topData.inventory.push({ typeId: typeId });
        saveTopData();
        
        updateHUD();
        renderShop();
        renderInventory();
    }
}

// 渲染背包
function renderInventory() {
    const invList = document.getElementById('inventoryList');
    const tooltip = document.getElementById('inventoryTooltip');
    invList.innerHTML = '';
    
    topData.inventory.forEach((item, index) => {
        const type = TOP_TYPES.find(t => t.id === item.typeId);
        const div = document.createElement('div');
        div.className = 'top-item' + (selectedInventoryIndex === index ? ' dragging' : '');
        div.style.borderColor = type.color;
        div.draggable = true;
        div.dataset.index = index;
        div.innerHTML = `
            ${type.emoji}
            <div class="hp-badge">${type.hp}</div>
        `;
        div.onclick = () => selectInventoryItem(index);
        
        // 鼠标悬停显示详情提示
        div.addEventListener('mouseenter', (e) => {
            tooltip.innerHTML = `
                <div class="tooltip-name" style="color:${type.color}">${type.name}</div>
                <div class="tooltip-stat">血量: ${type.hp}</div>
                <div class="tooltip-tier">Tier ${type.tier}</div>
            `;
            const rect = div.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.top = (rect.bottom + 10) + 'px';
            tooltip.style.display = 'block';
        });
        div.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        // Drag events
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            div.classList.add('dragging');
            selectedInventoryIndex = index;
            tooltip.style.display = 'none';
        });
        div.addEventListener('dragend', (e) => {
            div.classList.remove('dragging');
            selectedInventoryIndex = -1;
            renderInventory(); // Refresh selection visual state
        });
        
        invList.appendChild(div);
    });
}

function selectInventoryItem(index) {
    if (gameState !== 'setup') return;
    if (selectedInventoryIndex === index) {
        selectedInventoryIndex = -1; // 取消选择
    } else {
        selectedInventoryIndex = index;
    }
    renderInventory();
}

// 网格层（仅在 setup 阶段用于点击放置）
function buildGridOverlay() {
    const overlay = document.getElementById('gridOverlay');
    overlay.innerHTML = '';
    
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell ' + (r >= 3 ? 'player-area' : 'enemy-area');
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.onclick = (e) => onGridClick(r, c);
            
            // Drop events
            cell.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessary to allow dropping
                if (r >= 3) {
                    cell.classList.add('highlight');
                }
            });
            cell.addEventListener('dragleave', (e) => {
                cell.classList.remove('highlight');
            });
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('highlight');
                const indexStr = e.dataTransfer.getData('text/plain');
                if (indexStr !== '') {
                    selectedInventoryIndex = parseInt(indexStr);
                    onGridClick(r, c);
                }
            });
            
            overlay.appendChild(cell);
        }
    }
}

function onGridClick(r, c) {
    if (gameState !== 'setup') return;
    
    // 只能放在下半区 (r >= 3)
    if (r < 3) {
        alert("只能将陀螺放置在下方的绿色区域内！");
        return;
    }
    
    // 检查是否已有我方陀螺在这个格子
    const existingIdx = topsOnBoard.findIndex(t => !t.isEnemy && t.gridR === r && t.gridC === c);
    
    // 如果有选中的背包物品，放置或合成
    if (selectedInventoryIndex !== -1) {
        const item = topData.inventory[selectedInventoryIndex];
        const type = TOP_TYPES.find(t => t.id === item.typeId);

        if (existingIdx !== -1) {
            const oldTop = topsOnBoard[existingIdx];
            
            // 检查是否可以合成（同等级陀螺，且不是最高级）
            if (oldTop.typeId === item.typeId) {
                const nextTierTop = TOP_TYPES.find(t => t.tier === type.tier + 1);
                if (nextTierTop) {
                    // 弹出合成确认框
                    showConfirmMergeModal(existingIdx, selectedInventoryIndex, type, nextTierTop, r, c);
                    return; // 等待用户确认，暂不执行后续操作
                }
            }
            
            // 如果不能合成，则替换：把原来的放回背包
            topData.inventory.push({ typeId: oldTop.typeId });
            topsOnBoard.splice(existingIdx, 1);
        }
        
        // 放置新的
        topsOnBoard.push({
            id: Date.now() + Math.random(),
            typeId: type.id,
            gridR: r, gridC: c,
            x: c * CELL_SIZE + CELL_SIZE / 2,
            y: r * CELL_SIZE + CELL_SIZE / 2,
            vx: 0, vy: 0,
            hp: type.hp, maxHp: type.hp,
            isEnemy: false,
            color: type.color, emoji: type.emoji,
            angle: 0, rSpeed: 0,
            bounceTimer: 0,
            isDeadAnimating: false
        });
        
        // 从背包移除
        topData.inventory.splice(selectedInventoryIndex, 1);
        selectedInventoryIndex = -1;
        // 立即保存，防止页面刷新丢失
        saveTopData();
        renderInventory();
        updateEnemyHpAllocation(); // Recalculate enemies HP based on new player HP
        drawBoard();
    } else {
        // 没有选中背包物品，如果点击了已有陀螺，则收回
        if (existingIdx !== -1) {
            const oldTop = topsOnBoard[existingIdx];
            topData.inventory.push({ typeId: oldTop.typeId });
            topsOnBoard.splice(existingIdx, 1);
            // 立即保存，防止页面刷新丢失
            saveTopData();
            renderInventory();
            updateEnemyHpAllocation(); // Recalculate enemies HP based on new player HP
            drawBoard();
        }
    }
}

function clearBoard() {
    if (gameState !== 'setup') return;
    // 将所有我方陀螺放回背包
    const myTops = topsOnBoard.filter(t => !t.isEnemy);
    myTops.forEach(t => {
        topData.inventory.push({ typeId: t.typeId });
    });
    topsOnBoard = topsOnBoard.filter(t => t.isEnemy);
    selectedInventoryIndex = -1;
    // 立即保存，防止页面刷新丢失
    saveTopData();
    renderInventory();
    updateEnemyHpAllocation(); // Recalculate enemies HP based on new player HP
    drawBoard();
}

// 从同学名单中随机选择一个名字
function getRandomStudentName() {
    return STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
}

// 敌方生成与更新逻辑
// 首次进入准备阶段时，生成固定的敌人占位（不分配具体血量）
function spawnStaticEnemies() {
    // 如果已经有敌方占位，不再重复生成
    if (topsOnBoard.some(t => t.isEnemy)) return;

    const lvl = topData.currentLevel;
    
    // 随机占用上半区的格子 (r: 0, 1, 2)
    let availableCells = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            availableCells.push({r, c});
        }
    }
    
    // 简单决定敌方数量 (至少1个，最多6个)
    const enemyCount = Math.min(6, 1 + Math.floor(lvl / 3) + Math.floor(Math.random() * 2));
    
    // 确定本局使用的同学名字（优先使用上局预告的下个同学，否则随机选择）
    if (!currentMatchEnemyName) {
        currentMatchEnemyName = nextMatchEnemyName || getRandomStudentName();
    }
    // 为下局随机选择一个新的同学名字
    nextMatchEnemyName = getRandomStudentName();
    
    for (let i = 0; i < enemyCount; i++) {
        if (availableCells.length === 0) break;
        
        // 随机取一个格子
        const cellIdx = Math.floor(Math.random() * availableCells.length);
        const cell = availableCells.splice(cellIdx, 1)[0];
        
        // 随机分配敌方陀螺等级 (1-4)
        const enemyTier = Math.floor(Math.random() * 4) + 1;
        
        topsOnBoard.push({
            id: 'enemy_' + i,
            typeId: 'enemy',
            gridR: cell.r, gridC: cell.c,
            x: cell.c * CELL_SIZE + CELL_SIZE / 2,
            y: cell.r * CELL_SIZE + CELL_SIZE / 2,
            vx: 0, vy: 0,
            hp: 1, maxHp: 1, // 占位血量，稍后会根据我方血量重新分配
            isEnemy: true,
            color: ENEMY_COLOR, emoji: '', // 不显示emoji，只显示样式
            angle: 0, rSpeed: 0,
            bounceTimer: 0,
            isDeadAnimating: false,
            name: currentMatchEnemyName, // 本局所有敌方陀螺使用同一个同学名字
            enemyTier: enemyTier // 敌方陀螺等级 (1-4)
        });
    }
}

// 碾压陀螺等级（Tier 5/6/7 的 id）
const CRUSH_TIER_IDS = [5, 6, 7];

// 判断我方场上是否有碾压陀螺
function playerHasCrushTop() {
    return topsOnBoard.some(t => {
        if (t.isEnemy) return false;
        const def = TOP_TYPES.find(x => x.id === t.typeId);
        return def && def.tier >= 5;
    });
}

// 获取我方场上最高碾压等级
function getMaxCrushTier() {
    let max = 0;
    topsOnBoard.forEach(t => {
        if (!t.isEnemy) {
            const def = TOP_TYPES.find(x => x.id === t.typeId);
            if (def && def.tier >= 5 && def.tier > max) max = def.tier;
        }
    });
    return max;
}

// 动态调整敌人的血量分配（不改变位置和数量）
function updateEnemyHpAllocation() {
    let currentPlayerHp = 0;
    topsOnBoard.forEach(t => {
        if (!t.isEnemy) currentPlayerHp += t.maxHp;
    });

    // 如果我方还没放陀螺，给敌人随便分配点血量用于展示
    if (currentPlayerHp === 0) {
        const enemyTops = topsOnBoard.filter(t => t.isEnemy);
        if (enemyTops.length > 0) {
            enemyTops.forEach(e => { e.isBoss = false; e.bossTier = 0; });
            distributeHpToEnemies(enemyTops, 10);
        }
        updateTotalHpDisplay(true);
        // 重置预测信息
        currentMatchPrediction = { result: '—', resultText: '—', reason: '请先放置陀螺', enemyHp: 0, playerHp: 0 };
        return;
    }

    // 核心胜负控制逻辑
    // 流程：升级赢2局 → 50%判定 → 输了出BOSS → 必须升级才能打败BOSS → 回到升级赢2局
    let mustLose = false;
    let wasInBossState = false; // 标记这回合是否要生成BOSS让玩家"打败"
    let predictionResult = '—';
    let predictionText = '—';
    let predictionReason = '—';

    // 重置本局循环状态
    currentMatchCycleState = {
        shouldIncrementWins: false,
        shouldEnterBossCycle: false,
        shouldResetBossCycle: false
    };

    if (currentPlayerHp > topData.lastPlayerHp) {
        // 孩子升级了 → 必赢，打败BOSS（如有），重置循环
        targetEnemyHp = Math.max(1, currentPlayerHp - 1);
        wasInBossState = topData.inForcedLossCycle; // 如果之前困在BOSS里，这回合仍要出BOSS让玩家打败
        mustLose = false;
        predictionResult = 'win';
        predictionText = '必赢 ✅';
        predictionReason = '陀螺升级了！敌方血量' + targetEnemyHp + ' < 我方' + currentPlayerHp;
        // 记录状态：升级后重置循环
        currentMatchCycleState.shouldResetBossCycle = true;
    } else if (topData.inForcedLossCycle) {
        // 已在BOSS状态：没升级就必须输，继续困在BOSS里
        mustLose = true;
        targetEnemyHp = currentPlayerHp + 1;
        predictionResult = 'lose';
        predictionText = '必输 ❌';
        predictionReason = '困在BOSS循环中，未升级无法逃脱。敌方血量' + targetEnemyHp + ' > 我方' + currentPlayerHp;
        // BOSS循环中不更新计数，保持现状
    } else if (topData.nonUpgradeWins < 2) {
        // 未升级且还没赢够2局 → 强制赢
        targetEnemyHp = Math.max(1, currentPlayerHp - 1);
        predictionResult = 'win';
        predictionText = '必赢 ✅';
        const winCount = topData.nonUpgradeWins + 1; // 显示下一局的计数
        predictionReason = '第' + winCount + '局强制赢。敌方血量' + targetEnemyHp + ' < 我方' + currentPlayerHp;
        // 记录状态：本局结束后增加胜利计数
        currentMatchCycleState.shouldIncrementWins = true;
    } else {
        // 未升级且已赢够2局 → 50%概率
        const randomVal = Math.random();
        if (randomVal > 0.5) {
            // 赢了 → 下一局出BOSS
            targetEnemyHp = Math.max(1, currentPlayerHp - 1);
            predictionResult = 'win';
            predictionText = '必赢 ✅';
            predictionReason = '随机判定(>' + randomVal.toFixed(2) + '>0.5)本局赢，下局进BOSS循环';
            // 记录状态：本局结束后进入BOSS循环
            currentMatchCycleState.shouldEnterBossCycle = true;
        } else {
            // 输了 → 本局直接出BOSS
            mustLose = true;
            predictionResult = 'lose';
            predictionText = '必输 ❌';
            predictionReason = '随机判定(' + randomVal.toFixed(2) + '<=0.5)本局输，进入BOSS循环';
            // 记录状态：本局结束后进入BOSS循环
            currentMatchCycleState.shouldEnterBossCycle = true;
        }
    }
    
    // 保存预测信息
    currentMatchPrediction = {
        result: predictionResult,
        resultText: predictionText,
        reason: predictionReason,
        enemyHp: targetEnemyHp,
        playerHp: currentPlayerHp
    };

    const hasCrush = playerHasCrushTop();
    const maxCrushTier = getMaxCrushTier();

    // 生成BOSS的条件：有碾压陀螺 + (必须输 或者 刚从BOSS状态升级逃出来)
    if ((mustLose || wasInBossState) && hasCrush) {
        const extra = Math.max(10, Math.floor(currentPlayerHp * 0.1));
        if (wasInBossState) {
            // 升级逃出BOSS：玩家必赢，BOSS血量设为比玩家低1点
            targetEnemyHp = Math.max(1, currentPlayerHp - 1);
            // 更新预测信息为BOSS战胜利
            currentMatchPrediction.result = 'win';
            currentMatchPrediction.resultText = '必赢(BOSS战) ✅';
            currentMatchPrediction.reason = '升级逃出BOSS循环！BOSS血量' + targetEnemyHp + ' < 我方' + currentPlayerHp;
            currentMatchPrediction.enemyHp = targetEnemyHp;
        } else {
            // 必须输：敌人血量比我方高1点
            targetEnemyHp = currentPlayerHp + 1;
            // 更新预测信息为BOSS战失败
            currentMatchPrediction.result = 'lose';
            currentMatchPrediction.resultText = '必输(BOSS战) ❌';
            currentMatchPrediction.reason = 'BOSS出现！血量' + targetEnemyHp + ' > 我方' + currentPlayerHp + '，需升级才能击败';
            currentMatchPrediction.enemyHp = targetEnemyHp;
        }

        // 把场上普通敌人全部换成 1 个 BOSS
        topsOnBoard = topsOnBoard.filter(t => !t.isEnemy);

        const lvl = topData.currentLevel;
        let availableCells = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                availableCells.push({r, c});
            }
        }
        const cellIdx = Math.floor(Math.random() * availableCells.length);
        const cell = availableCells[cellIdx];

        const bossHp = targetEnemyHp;
        const appearance = bossAppearances; // 出现次数越多，造型越恐怖
        const bossEmojis = ['💀', '☠️', '👿', '😈', '🤡'];
        const bossColors = ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'];
        const bossEmoji = bossEmojis[Math.min(appearance, bossEmojis.length - 1)];
        const bossColor = bossColors[Math.min(appearance, bossColors.length - 1)];
        bossAppearances++;

        topsOnBoard.push({
            id: 'enemy_boss',
            typeId: 'enemy',
            gridR: cell.r, gridC: cell.c,
            x: cell.c * CELL_SIZE + CELL_SIZE / 2,
            y: cell.r * CELL_SIZE + CELL_SIZE / 2,
            vx: 0, vy: 0,
            hp: bossHp, maxHp: bossHp,
            isEnemy: true,
            isBoss: true,
            bossTier: maxCrushTier + 1, // 比碾压陀螺高一级，反转碾压
            color: bossColor, emoji: bossEmoji,
            angle: 0, rSpeed: 0,
            bounceTimer: 0,
            isDeadAnimating: false
        });
        updateTotalHpDisplay(true);
        if (showHpValues) updateDebugPanel();
        return;
    }

    // 普通模式：移除 BOSS，重新生成普通敌人
    topsOnBoard = topsOnBoard.filter(t => !t.isEnemy); // 先清除所有敌人（包括BOSS）
    spawnStaticEnemies(); // 重新在随机位置生成普通敌人
    const enemyTops = topsOnBoard.filter(t => t.isEnemy);
    enemyTops.forEach(e => { e.isBoss = false; e.bossTier = 0; });
    distributeHpToEnemies(enemyTops, targetEnemyHp);
    updateTotalHpDisplay(true);
    if (showHpValues) updateDebugPanel();
}

// 将总血量分配给场上已有的敌方陀螺
function distributeHpToEnemies(enemyTops, targetHp) {
    const count = enemyTops.length;
    if (count === 0) return;
    
    // 简化分配：每个敌人平均分配，确保总血量严格等于targetHp
    const baseHp = Math.floor(targetHp / count);
    let remainder = targetHp % count;
    
    for (let i = 0; i < count; i++) {
        // 基础血量 + 余数分配（前remainder个敌人多1点）
        const hp = baseHp + (i < remainder ? 1 : 0);
        
        enemyTops[i].hp = hp;
        enemyTops[i].maxHp = hp;
    }
}

// 更新总血量显示
function updateTotalHpDisplay(updateMax = false) {
    let currentEnemyHp = 0;
    let currentPlayerHp = 0;
    
    topsOnBoard.forEach(t => {
        if (t.isEnemy) {
            currentEnemyHp += Math.max(0, t.hp);
        } else {
            currentPlayerHp += Math.max(0, t.hp);
        }
    });

    if (updateMax) {
        totalEnemyMaxHp = currentEnemyHp;
        totalPlayerMaxHp = currentPlayerHp;
    }

    const enemyBar = document.getElementById('enemyHpBar');
    const enemyText = document.getElementById('enemyHpText');
    const playerBar = document.getElementById('playerHpBar');
    const playerText = document.getElementById('playerHpText');

    if (totalEnemyMaxHp > 0) {
        enemyBar.style.width = `${(currentEnemyHp / totalEnemyMaxHp) * 100}%`;
        enemyText.textContent = showHpValues ? `${currentEnemyHp} / ${totalEnemyMaxHp}` : '';
    } else {
        enemyBar.style.width = '0%';
        enemyText.textContent = showHpValues ? `0 / 0` : '';
    }

    if (totalPlayerMaxHp > 0) {
        playerBar.style.width = `${(currentPlayerHp / totalPlayerMaxHp) * 100}%`;
        playerText.textContent = showHpValues ? `${currentPlayerHp} / ${totalPlayerMaxHp}` : '';
    } else {
        playerBar.style.width = '0%';
        playerText.textContent = showHpValues ? `0 / 0` : '';
    }
}

// 粒子系统逻辑
function createParticles(x, y, typeId, isEnemy) {
    let color = '#ffffff';
    let particleCount = 10;
    let speedMultiplier = 1;
    let sizeMultiplier = 1;

    if (isEnemy) {
        // 敌方特效：暗色火花
        color = '#a855f7'; // 紫色火花
        particleCount = 12;
    } else {
        // 我方特效：根据等级区分
        const topDef = TOP_TYPES.find(t => t.id === typeId) || TOP_TYPES[0];
        const tier = topDef.tier || 1;
        
        if (tier === 1) {
            color = '#cbd5e1'; // 铁皮：银白火花
            particleCount = 8;
        } else if (tier === 2) {
            color = '#38bdf8'; // 合金：亮蓝电火花
            particleCount = 15;
            speedMultiplier = 1.5;
        } else if (tier === 3) {
            color = '#ef4444'; // 烈焰：红黄色爆炸
            particleCount = 20;
            speedMultiplier = 2;
            sizeMultiplier = 1.5;
        } else if (tier === 4) {
            color = '#fbbf24'; // 圣光：金色星芒
            particleCount = 30;
            speedMultiplier = 2.5;
            sizeMultiplier = 2;
        } else if (tier === 5) {
            color = '#a855f7'; // 虚空：深紫黑洞
            particleCount = 40;
            speedMultiplier = 3;
            sizeMultiplier = 2.5;
        } else if (tier === 6) {
            color = '#10b981'; // 混沌：幽绿旋涡
            particleCount = 50;
            speedMultiplier = 3.5;
            sizeMultiplier = 3;
        } else if (tier >= 7) {
            color = '#f43f5e'; // 创世：猩红爆裂
            particleCount = 80;
            speedMultiplier = 4;
            sizeMultiplier = 4;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 3 + 1) * speedMultiplier;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0, // 寿命从1到0
            decay: Math.random() * 0.05 + 0.02, // 衰减速度
            color: color,
            size: (Math.random() * 3 + 1) * sizeMultiplier,
            tier: isEnemy ? 0 : (TOP_TYPES.find(t => t.id === typeId)?.tier || 1)
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        
        // 高级陀螺有特殊形状的粒子
        if (p.tier >= 7) {
            // 创世：十字星芒+内圆
            ctx.translate(p.x, p.y);
            ctx.rotate(p.life * Math.PI * 4); // 随寿命疯狂旋转
            ctx.beginPath();
            ctx.moveTo(-p.size*2.5, 0); ctx.lineTo(p.size*2.5, 0);
            ctx.moveTo(0, -p.size*2.5); ctx.lineTo(0, p.size*2.5);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI*2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        } else if (p.tier === 6) {
            // 混沌：旋风形
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 1.5, 0, Math.PI);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.stroke();
        } else if (p.tier === 5) {
            // 虚空：菱形
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.random() * Math.PI);
            ctx.beginPath();
            ctx.moveTo(0, -p.size*1.5);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(0, p.size*1.5);
            ctx.lineTo(-p.size, 0);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
        } else if (p.tier === 4) {
            // 圣光：十字星芒
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.random() * Math.PI); // 随机旋转
            ctx.beginPath();
            ctx.moveTo(-p.size*2, 0); ctx.lineTo(p.size*2, 0);
            ctx.moveTo(0, -p.size*2); ctx.lineTo(0, p.size*2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size / 2;
            ctx.stroke();
        } else if (p.tier === 3) {
            // 烈焰：小火团
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life + 0.5), 0, Math.PI * 2);
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 5;
            ctx.fill();
        } else {
            // 普通圆形火花
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// 创建掉血数字
function createDamageNumber(x, y, damage, isEnemy) {
    damageNumbers.push({
        x: x,
        y: y,
        damage: damage,
        isEnemy: isEnemy,
        life: 1.0,           // 生命值从1到0
        vy: -2,              // 向上飘动
        scale: 1.0,          // 初始缩放
        maxScale: 1.5        // 最大缩放
    });
}

// 绘制PK开始动画
function drawPKAnimation() {
    if (!pkAnimation.active) return;
    
    const now = performance.now();
    const elapsed = now - pkAnimation.startTime;
    const progress = Math.min(1, elapsed / pkAnimation.duration);
    pkAnimation.progress = progress;
    
    // 边界线位置（第3行和第4行之间）
    const boundaryY = 3 * CELL_SIZE;
    const centerX = canvas.width / 2;
    
    // 动画分为三个阶段
    // 阶段1 (0-30%): 双方能量聚集
    // 阶段2 (30-70%): PK字样出现并放大
    // 阶段3 (70-100%): 能量爆发，战斗开始
    
    if (progress < 0.3) {
        // 阶段1: 能量聚集
        const phase1Progress = progress / 0.3;
        
        // 绘制双方能量球
        const ballSize = 20 + phase1Progress * 30;
        const ballOffset = 100 - phase1Progress * 50;
        
        // 我方能量球（蓝色）
        ctx.save();
        ctx.translate(centerX - ballOffset, boundaryY);
        ctx.beginPath();
        ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
        const playerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ballSize);
        playerGradient.addColorStop(0, '#60a5fa');
        playerGradient.addColorStop(0.5, '#3b82f6');
        playerGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = playerGradient;
        ctx.fill();
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 20 * phase1Progress;
        ctx.stroke();
        ctx.restore();
        
        // 敌方能量球（红色）
        ctx.save();
        ctx.translate(centerX + ballOffset, boundaryY);
        ctx.beginPath();
        ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
        const enemyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ballSize);
        enemyGradient.addColorStop(0, '#f87171');
        enemyGradient.addColorStop(0.5, '#ef4444');
        enemyGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = enemyGradient;
        ctx.fill();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20 * phase1Progress;
        ctx.stroke();
        ctx.restore();
        
    } else if (progress < 0.7) {
        // 阶段2: PK字样出现
        const phase2Progress = (progress - 0.3) / 0.4;
        
        // 背景闪光
        const flashIntensity = Math.sin(phase2Progress * Math.PI) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        ctx.fillRect(0, boundaryY - 50, canvas.width, 100);
        
        // PK文字
        ctx.save();
        ctx.translate(centerX, boundaryY);
        
        // 文字缩放效果
        const scale = 0.5 + phase2Progress * 1.5;
        const rotation = (1 - phase2Progress) * 0.5;
        ctx.scale(scale, scale);
        ctx.rotate(rotation);
        
        // PK文字阴影
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 30 * phase2Progress;
        
        // 绘制PK
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 渐变文字
        const textGradient = ctx.createLinearGradient(-50, -40, 50, 40);
        textGradient.addColorStop(0, '#fbbf24');
        textGradient.addColorStop(0.5, '#f59e0b');
        textGradient.addColorStop(1, '#dc2626');
        ctx.fillStyle = textGradient;
        ctx.fillText('PK', 0, 0);
        
        // 文字描边
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeText('PK', 0, 0);
        
        ctx.restore();
        
        // 绘制VS小字
        ctx.save();
        ctx.translate(centerX, boundaryY + 60);
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${phase2Progress})`;
        ctx.fillText('VS', 0, 0);
        ctx.restore();
        
    } else {
        // 阶段3: 能量爆发
        const phase3Progress = (progress - 0.7) / 0.3;
        
        // 冲击波效果
        const waveRadius = phase3Progress * 200;
        ctx.save();
        ctx.translate(centerX, boundaryY);
        ctx.beginPath();
        ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${1 - phase3Progress})`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();
        
        // 分界线闪光
        const lineGradient = ctx.createLinearGradient(0, boundaryY - 5, 0, boundaryY + 5);
        lineGradient.addColorStop(0, 'rgba(251, 191, 36, 0)');
        lineGradient.addColorStop(0.5, `rgba(251, 191, 36, ${1 - phase3Progress})`);
        lineGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(0, boundaryY - 5, canvas.width, 10);
        
        // 绘制战斗开始文字
        if (phase3Progress > 0.5) {
            ctx.save();
            ctx.translate(centerX, boundaryY);
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(255, 255, 255, ${(phase3Progress - 0.5) * 2})`;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            ctx.fillText('战斗开始！', 0, 0);
            ctx.restore();
        }
    }
    
    // 绘制能量粒子
    if (progress < 0.8) {
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            const angle = (progress * 10 + i / particleCount) * Math.PI * 2;
            const distance = 50 + progress * 100;
            const x = centerX + Math.cos(angle) * distance;
            const y = boundaryY + Math.sin(angle) * 20;
            const size = 3 + Math.random() * 4;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(251, 191, 36, ${1 - progress})`;
            ctx.fill();
        }
    }
    
    // 动画结束
    if (progress >= 1) {
        pkAnimation.active = false;
    }
}

// 绘制敌方幕布
function drawEnemyCurtain() {
    // 如果幕布完全滑出屏幕且不可见，则不绘制
    if (!enemyCurtain.visible && enemyCurtain.offsetY <= -3 * CELL_SIZE) return;
    
    // 如果幕布完全透明且不在动画中，也不绘制
    if (enemyCurtain.opacity <= 0 && enemyCurtain.offsetY === 0) return;
    
    // 敌方区域：第1-3行 (r=0,1,2) - 上方区域
    const enemyAreaY = 0 + enemyCurtain.offsetY;
    const enemyAreaHeight = 3 * CELL_SIZE;
    
    // 绘制幕布背景
    ctx.save();
    ctx.globalAlpha = enemyCurtain.opacity;
    
    // 幕布渐变背景
    const gradient = ctx.createLinearGradient(0, enemyAreaY, 0, enemyAreaY + enemyAreaHeight);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(0.5, '#0f172a');
    gradient.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, enemyAreaY, canvas.width, enemyAreaHeight);
    
    // 幕布边框
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, enemyAreaY, canvas.width, enemyAreaHeight);
    
    // 幕布顶部装饰线
    ctx.beginPath();
    ctx.moveTo(0, enemyAreaY + 10);
    ctx.lineTo(canvas.width, enemyAreaY + 10);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 幕布底部装饰线
    ctx.beginPath();
    ctx.moveTo(0, enemyAreaY + enemyAreaHeight - 10);
    ctx.lineTo(canvas.width, enemyAreaY + enemyAreaHeight - 10);
    ctx.stroke();
    
    // 动态省略号
    const now = Date.now();
    enemyCurtain.dots = Math.floor(now / 500) % 4; // 每500ms变化一次
    const dotsStr = '.'.repeat(enemyCurtain.dots);
    
    // 动态设置幕布文字（使用当前同学名字）
    const displayName = currentMatchEnemyName || '敌方';
    const curtainText = displayName + '陀螺正在派兵中';
    
    // 绘制文字
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 文字阴影
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 主文字
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(curtainText + dotsStr, canvas.width / 2, enemyAreaY + enemyAreaHeight / 2 - 20);
    
    // 副标题
    ctx.font = '18px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('（点击开始比赛查看）', canvas.width / 2, enemyAreaY + enemyAreaHeight / 2 + 20);
    
    ctx.restore();
}

// 更新和绘制掉血数字
function updateAndDrawDamageNumbers() {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const dn = damageNumbers[i];
        
        // 更新位置
        dn.y += dn.vy * gameSpeed;
        dn.life -= 0.02 * gameSpeed;
        
        // 缩放动画：先放大后缩小
        if (dn.life > 0.8) {
            dn.scale = 1.0 + (1.0 - dn.life) * 5 * (dn.maxScale - 1.0);
        } else {
            dn.scale = dn.maxScale * dn.life / 0.8;
        }
        
        // 移除消失的数字
        if (dn.life <= 0) {
            damageNumbers.splice(i, 1);
            continue;
        }
        
        // 绘制掉血数字
        ctx.save();
        ctx.globalAlpha = dn.life;
        ctx.translate(dn.x, dn.y);
        ctx.scale(dn.scale, dn.scale);
        
        // 敌我使用不同的显示样式
        if (dn.isEnemy) {
            // 敌方掉血：红色，带向下箭头
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 绘制向下箭头表示敌方受伤
            ctx.beginPath();
            ctx.moveTo(-8, -12);
            ctx.lineTo(0, -4);
            ctx.lineTo(8, -12);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制数字
            ctx.fillText('-' + dn.damage, 0, 8);
            
            // 红色发光效果
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
        } else {
            // 我方掉血：黄色/橙色，带向上箭头
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 绘制向上箭头表示我方受伤
            ctx.beginPath();
            ctx.moveTo(-8, 20);
            ctx.lineTo(0, 12);
            ctx.lineTo(8, 20);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制数字
            ctx.fillText('-' + dn.damage, 0, 0);
            
            // 黄色发光效果
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
        }
        
        ctx.restore();
    }
}

// 创建被击败名字飞出动画
function createDefeatedNameAnimation(x, y, name) {
    defeatedNameAnimations.push({
        x: x,
        y: y,
        name: name,
        life: 1.0,        // 生命值从1到0
        scale: 1.0,       // 初始缩放
        maxScale: 2.5,    // 最大缩放
        vx: (Math.random() - 0.5) * 2, // 随机水平速度
        vy: -3 - Math.random() * 2,    // 向上速度
        phase: 'fly'      // 阶段：fly(飞出) -> stay(停留) -> fade(消失)
    });
}

// 更新和绘制被击败名字动画
function updateAndDrawDefeatedNames() {
    for (let i = defeatedNameAnimations.length - 1; i >= 0; i--) {
        const anim = defeatedNameAnimations[i];
        
        // 更新位置
        anim.x += anim.vx * gameSpeed;
        anim.y += anim.vy * gameSpeed;
        
        // 阶段控制
        if (anim.phase === 'fly') {
            // 飞出阶段：放大
            anim.scale += 0.05 * gameSpeed;
            if (anim.scale >= anim.maxScale) {
                anim.scale = anim.maxScale;
                anim.phase = 'stay';
                anim.stayTimer = 30; // 停留30帧
            }
        } else if (anim.phase === 'stay') {
            // 停留阶段：保持
            anim.stayTimer -= gameSpeed;
            if (anim.stayTimer <= 0) {
                anim.phase = 'fade';
            }
        } else if (anim.phase === 'fade') {
            // 消失阶段：透明度降低
            anim.life -= 0.02 * gameSpeed;
        }
        
        // 移除消失的名字
        if (anim.life <= 0) {
            defeatedNameAnimations.splice(i, 1);
            continue;
        }
        
        // 绘制名字
        ctx.save();
        ctx.globalAlpha = anim.life;
        ctx.translate(anim.x, anim.y);
        ctx.scale(anim.scale, anim.scale);
        
        // 文字样式
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 发光效果
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        
        // 绘制文字
        ctx.fillStyle = '#ffffff';
        ctx.fillText(anim.name, 0, 0);
        
        // 绘制"被击败"字样
        if (anim.phase === 'stay' || anim.phase === 'fade') {
            ctx.font = '12px Arial';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#fca5a5';
            ctx.fillText('被击败！', 0, 25);
        }
        
        ctx.restore();
    }
}

// 根据等级绘制陀螺样式（我方和敌方共用）
function drawTopByTier(ctx, tier, color) {
    // 基础底盘光晕 (等级越高光晕越强)
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + tier * 5;
    ctx.beginPath();
    ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0; // 关闭阴影避免影响后续绘制
    
    if (tier === 1) {
        // 铁皮陀螺：基础款式，简单实用
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#94a3b8'; // 铁皮色
        ctx.stroke();
        
        // 内圈
        ctx.beginPath();
        ctx.arc(0, 0, RADIUS * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();
        
        // 简单的一字纹
        ctx.beginPath();
        ctx.moveTo(-RADIUS * 0.7, 0); ctx.lineTo(RADIUS * 0.7, 0);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.stroke();
    } 
    else if (tier === 2) {
        // 合金陀螺：更加坚固，多层装甲
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#e2e8f0'; // 亮银色
        ctx.stroke();
        
        // 八边形内层装甲
        ctx.beginPath();
        for(let i=0; i<8; i++) {
            const angle = i * Math.PI / 4;
            ctx.lineTo(Math.cos(angle) * RADIUS * 0.8, Math.sin(angle) * RADIUS * 0.8);
        }
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 十字星旋刃
        ctx.beginPath();
        for(let i=0; i<4; i++) {
            ctx.moveTo(0, 0);
            const angle = i * Math.PI / 2;
            ctx.lineTo(Math.cos(angle) * RADIUS * 0.8, Math.sin(angle) * RADIUS * 0.8);
        }
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 5;
        ctx.stroke();
    }
    else if (tier === 3) {
        // 烈焰陀螺：带刺，火纹，危险
        // 锯齿外圈
        ctx.beginPath();
        for(let i=0; i<12; i++) {
            const angle = i * Math.PI / 6;
            const r = i % 2 === 0 ? RADIUS : RADIUS * 0.8;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 渐变火红内圈
        ctx.beginPath();
        ctx.arc(0, 0, RADIUS * 0.7, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(0,0,0, 0,0,RADIUS*0.7);
        grad.addColorStop(0, '#7f1d1d');
        grad.addColorStop(1, '#dc2626');
        ctx.fillStyle = grad;
        ctx.fill();
        
        // 三叉旋刃
        ctx.beginPath();
        for(let i=0; i<3; i++) {
            ctx.moveTo(0, 0);
            const angle = i * Math.PI * 2 / 3;
            // 弯曲的刀刃感
            ctx.quadraticCurveTo(
                Math.cos(angle - 0.5) * RADIUS * 0.5, Math.sin(angle - 0.5) * RADIUS * 0.5,
                Math.cos(angle) * RADIUS * 0.9, Math.sin(angle) * RADIUS * 0.9
            );
        }
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 4;
        ctx.stroke();
    }
    else if (tier >= 4) {
        // 圣光陀螺：极度华丽，多重光环，星芒
        // 闪耀光环边框
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#fef08a'; // 金色
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, RADIUS * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 六芒星底纹
        ctx.beginPath();
        for(let i=0; i<12; i++) {
            const angle = i * Math.PI / 6;
            const r = i % 2 === 0 ? RADIUS * 0.8 : RADIUS * 0.4;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#b45309';
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 核心圣耀十字
        ctx.beginPath();
        for(let i=0; i<4; i++) {
            ctx.moveTo(0, 0);
            const angle = i * Math.PI / 2;
            ctx.lineTo(Math.cos(angle) * RADIUS * 0.95, Math.sin(angle) * RADIUS * 0.95);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // 增加悬浮粒子感 (四个小点)
        ctx.fillStyle = '#ffffff';
        for(let i=0; i<4; i++) {
            const angle = i * Math.PI / 2 + Math.PI / 4;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * RADIUS * 0.6, Math.sin(angle) * RADIUS * 0.6, 3, 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    // 通用核心能量眼 (等级越高，眼睛越大越亮)
    ctx.beginPath();
    const eyeSize = RADIUS * (0.2 + tier * 0.05);
    ctx.arc(0, 0, eyeSize, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(0,0,0, 0,0,eyeSize);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fill();
}

// 绘制静态/动态画面
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制所有陀螺
    topsOnBoard.forEach(top => {
        ctx.save();
        ctx.translate(top.x, top.y);
        ctx.rotate(top.angle);
        
        // 闪烁效果 (受击)
        if (top.bounceTimer > 0) {
            ctx.shadowColor = top.isEnemy ? '#ff0000' : '#ffffff';
            ctx.shadowBlur = 20;
            top.bounceTimer--;
        }
        
        // --- 重新设计我方与敌方的外观差异 ---
        
        if (!top.isEnemy) {
            // 获取陀螺配置
            const topDef = TOP_TYPES.find(t => t.id === top.typeId) || TOP_TYPES[0];
            const tier = topDef.tier || 1;

            // 【我方陀螺】：使用统一函数绘制
            drawTopByTier(ctx, tier, top.color);

        } else {
            // 【敌方陀螺】：使用和我方一样的样式，但外面加红色圆框
            
            // 根据敌方等级决定样式（默认等级1）
            const enemyTier = top.enemyTier || 1;
            
            // 先绘制和我方一样的样式（使用敌方颜色）
            drawTopByTier(ctx, enemyTier, ENEMY_COLOR);
            
            // 外面加红色圆框来标识是敌方
            ctx.beginPath();
            ctx.arc(0, 0, RADIUS + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#dc2626'; // 红色边框
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // BOSS特殊外观（比普通敌方更恐怖）
        if (top.isBoss) {
            // 血红光晕
            ctx.shadowColor = '#dc2626';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(0, 0, RADIUS + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // 骷髅符文
            ctx.beginPath();
            for(let i=0; i<6; i++) {
                const angle = i * Math.PI / 3;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * RADIUS * 1.1, Math.sin(angle) * RADIUS * 1.1);
            }
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 中心 emoji (保持正向不随陀螺旋转，方便看清)
        ctx.rotate(-top.angle); 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (top.isEnemy && top.name) {
            // 敌方陀螺显示同学名字
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 3;
            ctx.fillText(top.name, 0, -8);
            
            // 名字下方显示emoji
            ctx.font = '16px Arial';
            ctx.shadowBlur = 0;
            ctx.fillText(top.emoji, 0, 8);
        } else {
            // 我方陀螺只显示emoji
            ctx.font = '22px Arial';
            ctx.fillText(top.emoji, 0, -2);
        }
        
        // 血条 (如果还在场上并且没死透)
        if (top.hp > 0 || top.isDeadAnimating) {
            const hpRatio = Math.max(0, top.hp / top.maxHp);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(-20, -RADIUS - 14, 40, 6);
            ctx.fillStyle = top.isEnemy ? (top.isBoss ? '#dc2626' : '#3b82f6') : '#ef4444'; // BOSS血条红色
            ctx.fillRect(-20, -RADIUS - 14, 40 * hpRatio, 6);
            
            // 只有按了 H 键才显示具体数字
            if (showHpValues) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.fillText(Math.max(0, top.hp), 0, -RADIUS - 11);
            }
        }
        
        ctx.restore();
    });
    
    // 绘制粒子特效
    updateAndDrawParticles();
    
    // 绘制掉血数字
    updateAndDrawDamageNumbers();
    
    // 绘制被击败名字飞出动画
    updateAndDrawDefeatedNames();
    
    // 绘制PK开始动画
    drawPKAnimation();
    
    // 绘制敌方幕布（在比赛开始前显示）
    drawEnemyCurtain();
}

// 比赛逻辑
function startMatch() {
    if (gameState !== 'setup') return;
    
    const myTops = topsOnBoard.filter(t => !t.isEnemy);
    if (myTops.length === 0) {
        alert("请先从左侧背包中选择陀螺放置到棋盘上！");
        return;
    }
    
    // 本局敌方名称已在spawnStaticEnemies中设置
    
    // 记录本次比赛我方的总血量，作为下一次的判断基准
    let currentPlayerHp = 0;
    myTops.forEach(t => currentPlayerHp += t.maxHp);
    // 保存当前血量用于后续计算
    const previousPlayerHp = topData.lastPlayerHp;
    // 只有在比赛结束后才更新lastPlayerHp，避免在本次比赛中影响判断
    // topData.lastPlayerHp = currentPlayerHp;
    
    // 记录开局时的我方陀螺，无论输赢、死活，赛后都要还给背包
    initialPlayerTops = myTops.map(t => ({ typeId: t.typeId }));
    
    // 把当前出战的陀螺记录到本地存储，防止比赛中断导致丢失
    topData.interruptedMatchTops = [...initialPlayerTops];
    
    saveTopData();
    
    gameState = 'playing';
    speedUpPhase1Applied = false; // 重置一阶加速标记
    speedUpPhase2Applied = false; // 重置二阶加速标记
    
    const gridOverlay = document.getElementById('gridOverlay');
    document.getElementById('btnStartMatch').disabled = true;
    document.getElementById('btnClearBoard').disabled = true;
    
    // 重置速度滑块
    gameSpeed = 1;
    const slider = document.getElementById('speedSlider');
    if (slider) slider.value = 1;
    const speedVal = document.getElementById('speedValue');
    if (speedVal) speedVal.textContent = '1x';
    
    // 显示速度控制条
    const speedControl = document.getElementById('speedControl');
    if (speedControl) speedControl.style.display = 'flex';
    
    // 触发PK开始动画
    pkAnimation.active = true;
    pkAnimation.startTime = performance.now();
    pkAnimation.progress = 0;
    
    // 幕布拉开动画
    animateCurtainOpen();
    
    // 添加网格下拉动画，动画结束后隐藏并开始游戏循环
    gridOverlay.classList.add('pull-down');
    setTimeout(() => {
        gridOverlay.style.display = 'none';
        gridOverlay.classList.remove('pull-down');
        
        // 初始化速度和旋转
        topsOnBoard.forEach(top => {
            const speed = 4 + Math.random() * 2;
            const dir = Math.random() * Math.PI * 2;
            top.vx = Math.cos(dir) * speed;
            top.vy = Math.sin(dir) * speed;
            // 增加基础自转速度：之前是 0.1~0.2，现在提高到 0.3~0.5 左右，看起来转得更快
            top.rSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.2);
        });
        
        lastTime = performance.now();
        animFrame = requestAnimationFrame(gameLoop);
    }, 1000); // 1秒动画时间，与CSS中保持一致
}

// 幕布拉开动画（向上滑动）
function animateCurtainOpen() {
    const duration = 800; // 800ms拉开时间
    const startTime = performance.now();
    const startY = 0;
    const endY = -3 * CELL_SIZE; // 向上滑动3行的高度
    
    function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // 使用缓动函数让动画更自然
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        // 向上滑动
        enemyCurtain.offsetY = startY + (endY - startY) * easeProgress;
        
        // 透明度也逐渐降低
        enemyCurtain.opacity = 1 - easeProgress;
        
        // 重绘画面以显示动画
        drawBoard();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            enemyCurtain.visible = false;
            // 动画完成，保持最终状态，不重置，下次resetToSetup会重置
        }
    }
    
    requestAnimationFrame(animate);
}

let lastTime = 0;
function gameLoop(time) {
    if (gameState !== 'playing') return;
    
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    
    updatePhysics();
    updateTotalHpDisplay(false); // Update HP bars during gameplay
    drawBoard();
    
    checkWinCondition();
    
    if (gameState === 'playing') {
        animFrame = requestAnimationFrame(gameLoop);
    }
}

function updatePhysics() {
    // 确定是否开启追踪模式
    const aliveTops = topsOnBoard.filter(t => !t.isDeadAnimating);
    const alivePlayerCount = aliveTops.filter(t => !t.isEnemy).length;
    const aliveEnemyCount = aliveTops.filter(t => t.isEnemy).length;
    const trackingMode = (alivePlayerCount === 1 || aliveEnemyCount === 1) && alivePlayerCount > 0 && aliveEnemyCount > 0;

    // 移动与墙壁碰撞处理
    topsOnBoard.forEach(top => {
        if (top.hp <= 0 && !top.isDeadAnimating) {
            // 刚死掉，设置飞出动画参数
            top.isDeadAnimating = true;
            // 随机一个向外的速度，或者沿着原本速度的方向加速
            const speed = Math.hypot(top.vx, top.vy);
            const dir = Math.atan2(top.vy, top.vx);
            top.vx = Math.cos(dir) * (speed + 15); // 突然加速飞出
            top.vy = Math.sin(dir) * (speed + 15);
            top.rSpeed *= 3; // 疯狂旋转
            
            // 如果是敌方陀螺且有人名，创建名字飞出动画
            if (top.isEnemy && top.name) {
                createDefeatedNameAnimation(top.x, top.y, top.name);
            }
        }

        top.x += top.vx * gameSpeed;
        top.y += top.vy * gameSpeed;
        top.angle += top.rSpeed * gameSpeed;
        
        if (!top.isDeadAnimating) {
            // 存活状态：墙壁碰撞
            let bounced = false;
            if (top.x < RADIUS) { top.x = RADIUS; top.vx *= -1; bounced = true; }
            if (top.x > canvas.width - RADIUS) { top.x = canvas.width - RADIUS; top.vx *= -1; bounced = true; }
            if (top.y < RADIUS) { top.y = RADIUS; top.vy *= -1; bounced = true; }
            if (top.y > canvas.height - RADIUS) { top.y = canvas.height - RADIUS; top.vy *= -1; bounced = true; }
            
            // 追踪模式：当有一方只剩1个时，如果发生撞墙，则修正速度方向，使其主动瞄准最近的敌人
            if (trackingMode && bounced) {
                let target = null;
                let minDist = Infinity;
                // 寻找敌对阵营的最近陀螺
                aliveTops.forEach(other => {
                    if (other.isEnemy !== top.isEnemy) {
                        const dist = Math.hypot(other.x - top.x, other.y - top.y);
                        if (dist < minDist) {
                            minDist = dist;
                            target = other;
                        }
                    }
                });
                
                if (target) {
                    const currentSpeed = Math.hypot(top.vx, top.vy);
                    // 计算指向目标的方向
                    const dx = target.x - top.x;
                    const dy = target.y - top.y;
                    const angleToTarget = Math.atan2(dy, dx);
                    
                    // 将速度方向调整为指向目标，保持原速度大小
                    top.vx = Math.cos(angleToTarget) * currentSpeed;
                    top.vy = Math.sin(angleToTarget) * currentSpeed;
                }
            }
        }
        // 死亡飞出也要加速
        if (top.isDeadAnimating) {
            top.x += top.vx * gameSpeed;
            top.y += top.vy * gameSpeed;
            top.angle += top.rSpeed * gameSpeed;
        }
    });
    
    // 陀螺间碰撞 (只计算存活的)
    for (let i = 0; i < topsOnBoard.length; i++) {
        for (let j = i + 1; j < topsOnBoard.length; j++) {
            const t1 = topsOnBoard[i];
            const t2 = topsOnBoard[j];
            
            if (t1.isDeadAnimating || t2.isDeadAnimating) continue; // 死亡的陀螺不再参与碰撞
            
            const dx = t2.x - t1.x;
            const dy = t2.y - t1.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < RADIUS * 2) {
                // 发生碰撞
                // 1. 分开位置，防止粘连
                const overlap = RADIUS * 2 - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                t1.x -= nx * overlap / 2;
                t1.y -= ny * overlap / 2;
                t2.x += nx * overlap / 2;
                t2.y += ny * overlap / 2;
                
                // 2. 动量交换 (简单弹性碰撞)
                const p = 2 * (t1.vx * nx + t1.vy * ny - t2.vx * nx - t2.vy * ny) / 2;
                t1.vx -= p * nx;
                t1.vy -= p * ny;
                t2.vx += p * nx;
                t2.vy += p * ny;
                
                // 3. 扣血逻辑
                if (t1.isEnemy !== t2.isEnemy) {
                    // 双方每次碰撞固定减少1滴血
                    const damage = 1;

                    t1.hp -= damage;
                    t2.hp -= damage;
                    
                    t1.bounceTimer = 10;
                    t2.bounceTimer = 10;
                    
                    // 碰撞时增加一些随机散射，避免死循环
                    const scatterAngle = (Math.random() - 0.5) * 0.5;
                    const cos = Math.cos(scatterAngle), sin = Math.sin(scatterAngle);
                    let vx1 = t1.vx * cos - t1.vy * sin;
                    let vy1 = t1.vx * sin + t1.vy * cos;
                    t1.vx = vx1; t1.vy = vy1;

                    // 生成碰撞火花特效（在碰撞点产生）
                    const collisionX = t1.x + nx * RADIUS;
                    const collisionY = t1.y + ny * RADIUS;
                    
                    // 为参与碰撞的双方各自生成符合其身份/等级的粒子
                    createParticles(collisionX, collisionY, t1.typeId, t1.isEnemy);
                    createParticles(collisionX, collisionY, t2.typeId, t2.isEnemy);
                    
                    // 创建掉血数字显示
                    // t1受到的伤害显示在t1位置，t2受到的伤害显示在t2位置
                    createDamageNumber(t1.x, t1.y - RADIUS - 10, damage, t1.isEnemy);
                    createDamageNumber(t2.x, t2.y - RADIUS - 10, damage, t2.isEnemy);
                }
            }
        }
    }
    
    // 移除彻底飞出屏幕的死掉的陀螺
    topsOnBoard = topsOnBoard.filter(t => {
        if (t.isDeadAnimating) {
            return t.x > -RADIUS*2 && t.x < canvas.width + RADIUS*2 && 
                   t.y > -RADIUS*2 && t.y < canvas.height + RADIUS*2;
        }
        return true;
    });
}

function checkWinCondition() {
    const myCount = topsOnBoard.filter(t => !t.isEnemy && !t.isDeadAnimating).length;
    const enemyCount = topsOnBoard.filter(t => t.isEnemy && !t.isDeadAnimating).length;
    
    if (myCount === 0 || enemyCount === 0) {
        gameState = 'ended';
        const bossWasDefeated = topsOnBoard.some(t => t.isEnemy && t.isBoss);
        const isWin = myCount > 0;
        setTimeout(() => {
            if (bossWasDefeated && isWin) {
                bossesDefeated++;
                showBossDefeat();
            } else {
                showResult(isWin);
            }
        }, 1000); // 稍微多等一会儿，让飞出动画播完
    }
}

function showBossDefeat() {
    const overlay = document.getElementById('bossDefeatOverlay');
    const title = document.getElementById('bossDefeatTitle');
    const speech = document.getElementById('bossDefeatSpeech');
    const icon = document.getElementById('bossDefeatIcon');

    // 根据击败次数显示不同称号和台词
    const titles = ['BOSS 败北！', 'BOSS再次败北！', 'BOSS心服口服！'];
    const speeches = [
        '"哼，等我回去修炼，升级完再来找你算账！"',
        '"这次是我大意了，下次不会再输！"',
        '"好吧，我承认你有点东西...下次见！"'
    ];
    const icons = ['💀', '☠️', '👿'];

    title.textContent = titles[Math.min(bossesDefeated - 1, titles.length - 1)];
    speech.textContent = speeches[Math.min(bossesDefeated - 1, speeches.length - 1)];
    icon.textContent = icons[Math.min(bossesDefeated - 1, icons.length - 1)];

    // 恢复我方陀螺到背包（不消耗）
    initialPlayerTops.forEach(t => {
        topData.inventory.push({ typeId: t.typeId });
    });
    initialPlayerTops = [];
    topData.interruptedMatchTops = null;
    topData.nonUpgradeWins = 0;
    topData.inForcedLossCycle = false; // BOSS被打败后，重置循环，下次孩子可以继续赢
    saveTopData();

    overlay.classList.add('show');
}

function closeBossDefeat() {
    document.getElementById('bossDefeatOverlay').classList.remove('show');
    resetToSetup();
}

function showResult(isWin) {
    const overlay = document.getElementById('resultOverlay');
    const title = document.getElementById('resultTitle');
    const desc = document.getElementById('resultDesc');
    const icon = document.getElementById('resultIcon');
    const dialog = document.getElementById('resultDialog');
    
    // 无论输赢，我方陀螺都不会被消耗，直接从本次初始记录里恢复或者收回
    // 这里使用 initialPlayerTops 来恢复，因为有些陀螺可能已经被打飞移除了
    initialPlayerTops.forEach(t => {
        topData.inventory.push({ typeId: t.typeId });
    });
    
    // 计算本次比赛的总血量，用于更新lastPlayerHp
    let currentPlayerHp = 0;
    initialPlayerTops.forEach(t => {
        const topDef = TOP_TYPES.find(def => def.id === t.typeId);
        if (topDef) currentPlayerHp += topDef.hp;
    });
    
    // 更新lastPlayerHp，作为下一次的判断基准
    topData.lastPlayerHp = currentPlayerHp;
    
    initialPlayerTops = []; // 清空记录
    topData.interruptedMatchTops = null; // 比赛正常结束，清理中断保护记录
    
    // 收集本局敌方名单（从initialPlayerTops记录的对战信息中获取）
    // 注意：这里需要从比赛记录中获取敌方信息
    const enemyNames = [];
    // 从topsOnBoard中查找已经死亡的敌方陀螺（但topsOnBoard可能已经被清空）
    // 所以我们需要在比赛过程中记录敌方名单
    
    if (isWin) {
        icon.textContent = '🏆';
        title.textContent = '胜利！';
        desc.textContent = '敌方陀螺全军覆没！你的陀螺已经全部回到背包。';
        // 我方赢了，A同学输了不服气，A同学说"哼，气死了，我去叫B同学来"，下一局换成B同学
        if (currentMatchEnemyName && nextMatchEnemyName) {
            dialog.innerHTML = `<span class="speaker">${currentMatchEnemyName}</span>：哼，气死了，我去叫<span class="next-enemy">${nextMatchEnemyName}</span>同学来！`;
        } else {
            dialog.innerHTML = '';
        }
        // 下一局换成B同学（已经在spawnStaticEnemies中设置了nextMatchEnemyName）
        topData.currentLevel += 1;
        
        // 根据本局循环状态更新计数
        if (currentMatchCycleState.shouldResetBossCycle) {
            // 升级了：重置所有计数
            topData.nonUpgradeWins = 0;
            topData.inForcedLossCycle = false;
        } else if (currentMatchCycleState.shouldIncrementWins) {
            // 强制赢局：增加计数
            topData.nonUpgradeWins += 1;
        } else if (currentMatchCycleState.shouldEnterBossCycle) {
            // 第3局（50%概率）：进入BOSS循环
            topData.inForcedLossCycle = true;
        }
    } else {
        icon.textContent = '💀';
        title.textContent = '失败...';

        const consolationPoints = 5;
        const tData = getTowerData();
        tData.points += consolationPoints;
        saveTowerData(tData);

        desc.textContent = `你的陀螺被打飞了... 没关系，它们已经被捡回了背包。获得安慰奖 ${consolationPoints} 积分，升级再战吧！`;
        // 我方输了，A同学赢了很得意，A同学说"哈哈，再来一局"，下一局还是A同学
        if (currentMatchEnemyName) {
            dialog.innerHTML = `<span class="speaker">${currentMatchEnemyName}</span>：哈哈，再来一局！`;
        } else {
            dialog.innerHTML = '';
        }
        // 下一局还是A同学，所以把nextMatchEnemyName设为currentMatchEnemyName
        nextMatchEnemyName = currentMatchEnemyName;
        
        // 可视化提示增加积分
        const ptsEl = document.getElementById('hudPts');
        ptsEl.style.transition = 'all 0.3s';
        ptsEl.style.transform = 'scale(1.5)';
        ptsEl.style.color = '#fbbf24';
        setTimeout(() => {
            ptsEl.style.transform = 'scale(1)';
            ptsEl.style.color = '';
            updateHUD(); // 更新显示的数字
        }, 500);
        
        // 失败时也根据本局循环状态更新
        if (currentMatchCycleState.shouldEnterBossCycle) {
            // 第3局失败：进入BOSS循环
            topData.inForcedLossCycle = true;
        }
        // BOSS循环中失败：保持在BOSS循环中（不需要额外处理）
    }
    
    saveTopData();
    overlay.classList.add('show');
}

function resetToSetup() {
    gameState = 'setup';
    document.getElementById('gridOverlay').style.display = 'grid';
    document.getElementById('btnStartMatch').disabled = false;
    document.getElementById('btnClearBoard').disabled = false;

    topsOnBoard = [];
    particles = [];
    defeatedNameAnimations = []; // 清空被击败名字动画
    currentMatchEnemyName = ''; // 清空本局敌方名称
    
    // 重置幕布状态
    enemyCurtain.visible = true;
    enemyCurtain.opacity = 1;
    enemyCurtain.offsetY = 0;
    
    spawnStaticEnemies();
    updateEnemyHpAllocation();
    updateHUD();
    renderInventory();
    drawBoard();

    const speedControl = document.getElementById('speedControl');
    if (speedControl) speedControl.style.display = 'none';
}

function closeResult() {
    document.getElementById('resultOverlay').classList.remove('show');
    resetToSetup();
}

// 合成确认及执行逻辑
let pendingMergeParams = null;

function showConfirmMergeModal(boardIdx, invIdx, currentType, nextTierType, r, c) {
    const overlay = document.getElementById('confirmOverlay');
    const desc = document.getElementById('confirmDesc');
    
    desc.innerHTML = `要将两个 <span style="color:${currentType.color};font-weight:bold;">${currentType.name}</span> 合成为更强大的 <span style="color:${nextTierType.color};font-weight:bold;">${nextTierType.name}</span> 吗？`;
    
    pendingMergeParams = { boardIdx, invIdx, nextTierType, r, c };
    overlay.classList.add('show');
}

function cancelMerge() {
    const overlay = document.getElementById('confirmOverlay');
    overlay.classList.remove('show');
    
    // 如果取消，说明是放错位置了，取消选中状态，啥也不做
    selectedInventoryIndex = -1;
    pendingMergeParams = null;
    renderInventory();
}

function confirmMerge() {
    if (!pendingMergeParams) return;
    
    const { boardIdx, invIdx, nextTierType, r, c } = pendingMergeParams;
    
    // 移除旧的陀螺（棋盘上的那个）
    topsOnBoard.splice(boardIdx, 1);
    
    // 放置新的高级陀螺
    const newTop = {
        id: Date.now() + Math.random(),
        typeId: nextTierType.id,
        gridR: r, gridC: c,
        x: c * CELL_SIZE + CELL_SIZE / 2,
        y: r * CELL_SIZE + CELL_SIZE / 2,
        vx: 0, vy: 0,
        hp: nextTierType.hp, maxHp: nextTierType.hp,
        isEnemy: false,
        color: nextTierType.color, emoji: nextTierType.emoji,
        angle: 0, rSpeed: 0,
        bounceTimer: 0,
        isDeadAnimating: false
    };
    topsOnBoard.push(newTop);
    
    // 从背包移除消耗掉的材料
    topData.inventory.splice(invIdx, 1);
    pendingMergeParams = null;
    selectedInventoryIndex = -1;
    
    // 立即保存，不依赖 beforeunload
    saveTopData();
    mergeJustHappened = true;
    
    // 关闭确认弹窗，立即显示合成成功动画（不要加 setTimeout）
    document.getElementById('confirmOverlay').classList.remove('show');
    showMergeModal(nextTierType);
}

// 合成结果弹窗逻辑
function showMergeModal(topDef) {
    const overlay = document.getElementById('mergeOverlay');
    const icon = document.getElementById('mergeIcon');
    const name = document.getElementById('mergeName');
    const stats = document.getElementById('mergeStats');
    const box = document.getElementById('mergeResultBox');
    const glow = document.getElementById('mergeGlow');
    const particlesContainer = document.getElementById('mergeParticles');
    const stage = document.getElementById('mergeStage');
    const orbLeft = document.getElementById('orbLeft');
    const orbRight = document.getElementById('orbRight');
    const burst = document.getElementById('mergeBurst');

    // 1. 显示弹窗背景
    overlay.classList.add('show');

    // 2. 获取材料陀螺的emoji（用当前已知的旧等级作为近似）
    const matType = TOP_TYPES.find(t => t.tier === topDef.tier - 1) || topDef;
    orbLeft.textContent = matType.emoji;
    orbRight.textContent = matType.emoji;
    orbLeft.style.color = matType.color;
    orbRight.style.color = matType.color;

    // 3. 设置中心爆发颜色
    burst.style.background = `radial-gradient(circle, #ffffff 0%, ${topDef.color} 40%, transparent 70%)`;

    // 4. 重置所有动画元素
    box.style.opacity = '0';
    box.style.transform = 'scale(0.5)';
    particlesContainer.innerHTML = '';
    stage.classList.remove('active');
    burst.classList.remove('burst');

    // 强行reflow，让浏览器重新解析动画
    void burst.offsetWidth;
    void stage.offsetWidth;

    // 5. 启动合成动画序列
    stage.classList.add('active');

    // 6. 动画结束后触发爆炸和显示结果
    setTimeout(() => {
        // 中心爆发
        burst.classList.add('burst');

        // 生成大量粒子
        const particleCount = 60 + topDef.tier * 15;
        for(let i=0; i<particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 12 + 6;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 400 + 150;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.background = Math.random() > 0.2 ? topDef.color : '#ffffff';
            p.style.boxShadow = `0 0 10px ${topDef.color}`;
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);
            particlesContainer.appendChild(p);
        }

        // 隐藏动画舞台
        stage.classList.remove('active');

        // 7. 显示最终结果卡片
        icon.textContent = topDef.emoji;
        name.textContent = topDef.name;
        name.style.color = topDef.color;
        stats.textContent = `血量: ${topDef.hp} | 等级: Tier ${topDef.tier}`;

        box.style.borderColor = topDef.color;
        box.style.boxShadow = `0 0 60px ${topDef.color}aa`;
        glow.style.background = `radial-gradient(circle, ${topDef.color}60 0%, transparent 70%)`;

        // 弹出结果卡片
        box.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        box.style.opacity = '1';
        box.style.transform = 'scale(1) translateY(0)';
    }, 1500); // 等旋转动画完成
}

function closeMergeModal() {
    const overlay = document.getElementById('mergeOverlay');
    const stage = document.getElementById('mergeStage');
    const burst = document.getElementById('mergeBurst');
    const box = document.getElementById('mergeResultBox');
    
    overlay.classList.remove('show');
    stage.classList.remove('active');
    burst.classList.remove('burst');
    box.style.opacity = '0';
    box.style.transform = 'scale(0.5)';
    
    // 关闭弹窗后立即重置合并标记，允许后续 beforeunload 正常保存
    mergeJustHappened = false;
    
    // 等动画完全结束后再刷新界面
    setTimeout(() => {
        renderInventory();
        updateEnemyHpAllocation();
        drawBoard();
    }, 300);
}
