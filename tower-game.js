// 战场核心逻辑
const TILE = 72;

// Z键授权（按住Z才能触发礼包）
let _zKeyActive = false;
// H键切换调试模式（显示敌人HP标记和右上角目标信息）
let _debugMode = false;
document.addEventListener('keydown', e => {
    if (e.key === 'z' || e.key === 'Z') _zKeyActive = true;
    if (e.key === 'h' || e.key === 'H') _debugMode = !_debugMode;
});
document.addEventListener('keyup',   e => { if (e.key === 'z' || e.key === 'Z') _zKeyActive = false; });

// 地图路径
const MAP_PATH = [
    {x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},
    {x:3,y:1},{x:3,y:0},
    {x:4,y:0},{x:5,y:0},{x:6,y:0},
    {x:6,y:1},{x:6,y:2},{x:6,y:3},{x:6,y:4},
    {x:7,y:4},{x:8,y:4},
    {x:8,y:3},{x:8,y:2},{x:8,y:1},{x:8,y:0},
    {x:9,y:0},{x:10,y:0},{x:11,y:0}
];
const MAP_COLS = 12, MAP_ROWS = 5;

// ===== 离屏缓存绘图 =====
function makeOffscreen(w, h, fn) {
    const oc = document.createElement('canvas');
    oc.width = w; oc.height = h;
    fn(oc.getContext('2d'), w, h);
    return oc;
}

// ===== 草地tile =====
function buildGrassTile() {
    return makeOffscreen(TILE, TILE, (g, w, h) => {
        g.fillStyle = '#4a7c3f';
        g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(0,0,0,0.12)';
        g.lineWidth = 1;
        g.strokeRect(0.5, 0.5, w-1, h-1);
        g.fillStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i < 5; i++)
            g.fillRect(Math.random()*w, Math.random()*h, 6+Math.random()*10, 2);
    });
}

// ===== 路面tile =====
function buildRoadTile() {
    return makeOffscreen(TILE, TILE, (g, w, h) => {
        g.fillStyle = '#c8a96e';
        g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(0,0,0,0.05)';
        for (let i = 0; i < 3; i++)
            g.fillRect(Math.random()*w, Math.random()*h, 10+Math.random()*14, 3);
        g.strokeStyle = '#b8996e';
        g.lineWidth = 1.5;
        g.strokeRect(1, 1, w-2, h-2);
    });
}

// ===== 塔底座 =====
function buildTowerBase(color) {
    return makeOffscreen(TILE, TILE, (g, w, h) => {
        const cx = w/2, cy = h/2, r = w*0.38;
        // 阴影
        g.fillStyle = 'rgba(0,0,0,0.35)';
        g.beginPath();
        g.ellipse(cx, cy+5, r*0.9, r*0.28, 0, 0, Math.PI*2);
        g.fill();
        // 底座主体：用武器颜色做渐变
        const grad = g.createRadialGradient(cx-r*0.3, cy-r*0.3, 0, cx, cy, r);
        grad.addColorStop(0, color + 'cc');   // 亮色中心
        grad.addColorStop(0.55, color + '88');
        grad.addColorStop(1, color + '33');   // 边缘淡出
        g.fillStyle = grad;
        g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.fill();
        // 外圈描边
        g.strokeStyle = color + 'aa';
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.stroke();
        // 高光弧
        g.strokeStyle = 'rgba(255,255,255,0.3)';
        g.lineWidth = 2;
        g.beginPath(); g.arc(cx, cy, r-2, Math.PI*1.1, Math.PI*1.9); g.stroke();
    });
}

// ===== 炮管图形 =====
function buildCannon(color, shape) {
    return makeOffscreen(TILE, TILE, (g, w, h) => {
        const cx = w/2, cy = h/2;
        if (shape === 'arrow') {
            // 弓身（横向弧形，左右弯曲）与箭成90度
            g.strokeStyle = '#8B5E3C'; g.lineWidth = 3.5;
            g.beginPath();
            g.moveTo(cx - w*0.38, cy - h*0.05);
            g.quadraticCurveTo(cx, cy + h*0.38, cx + w*0.38, cy - h*0.05);
            g.stroke();
            // 弓弦（横向）
            g.strokeStyle = '#e2c97e'; g.lineWidth = 1.5;
            g.beginPath();
            g.moveTo(cx - w*0.38, cy - h*0.05);
            g.lineTo(cx + w*0.38, cy - h*0.05);
            g.stroke();
            // 箭杆（竖向朝上，与弓成90度）
            g.strokeStyle = '#c8a96e'; g.lineWidth = 2;
            g.beginPath();
            g.moveTo(cx, cy + h*0.28);
            g.lineTo(cx, cy - h*0.3);
            g.stroke();
            // 箭头（朝上）
            g.fillStyle = color;
            g.beginPath();
            g.moveTo(cx, cy - h*0.38);
            g.lineTo(cx + w*0.08, cy - h*0.22);
            g.lineTo(cx - w*0.08, cy - h*0.22);
            g.closePath(); g.fill();
            // 尾羽
            g.fillStyle = '#f87171';
            g.beginPath();
            g.moveTo(cx, cy + h*0.28);
            g.lineTo(cx + w*0.09, cy + h*0.38);
            g.lineTo(cx, cy + h*0.2);
            g.closePath(); g.fill();
            g.beginPath();
            g.moveTo(cx, cy + h*0.28);
            g.lineTo(cx - w*0.09, cy + h*0.38);
            g.lineTo(cx, cy + h*0.2);
            g.closePath(); g.fill();
        } else if (shape === 'cannon') {
            g.fillStyle = color;
            g.beginPath(); g.roundRect(cx-w*0.1, cy-w*0.38, w*0.2, w*0.42, 4); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 1.5; g.stroke();
            g.fillStyle = '#1f2937';
            g.beginPath(); g.arc(cx, cy-w*0.38, w*0.1, 0, Math.PI*2); g.fill();
        } else if (shape === 'ice') {
            g.strokeStyle = color; g.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const a = (i/6)*Math.PI*2;
                g.beginPath(); g.moveTo(cx, cy);
                g.lineTo(cx+Math.cos(a)*w*0.32, cy+Math.sin(a)*w*0.32); g.stroke();
            }
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy, w*0.1, 0, Math.PI*2); g.fill();
        } else if (shape === 'lightning') {
            g.fillStyle = color;
            g.beginPath();
            g.moveTo(cx+w*0.08, cy-w*0.35); g.lineTo(cx-w*0.08, cy-w*0.02);
            g.lineTo(cx+w*0.06, cy-w*0.02); g.lineTo(cx-w*0.1, cy+w*0.35);
            g.lineTo(cx+w*0.12, cy+w*0.02); g.lineTo(cx-w*0.04, cy+w*0.02);
            g.closePath(); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; g.stroke();
        } else if (shape === 'special_chain') {
            // 铁链：两个圆圈+链条
            g.strokeStyle = color; g.lineWidth = 3;
            g.beginPath(); g.arc(cx-w*0.2, cy, w*0.14, 0, Math.PI*2); g.stroke();
            g.beginPath(); g.arc(cx+w*0.2, cy, w*0.14, 0, Math.PI*2); g.stroke();
            g.beginPath(); g.moveTo(cx-w*0.06, cy); g.lineTo(cx+w*0.06, cy); g.stroke();
        } else if (shape === 'special_cursed') {
            // 魔域：旋涡
            g.strokeStyle = color; g.lineWidth = 2.5;
            for (let i = 0; i < 3; i++) {
                g.beginPath();
                g.arc(cx, cy, w*(0.12+i*0.08), 0, Math.PI*1.6);
                g.stroke();
            }
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy, w*0.08, 0, Math.PI*2); g.fill();
        } else if (shape === 'special_shockwave') {
            // 冲击波：同心圆
            g.strokeStyle = color; g.lineWidth = 2;
            [0.1, 0.2, 0.32].forEach(r => {
                g.beginPath(); g.arc(cx, cy, w*r, 0, Math.PI*2); g.stroke();
            });
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy, w*0.07, 0, Math.PI*2); g.fill();
        } else if (shape === 'special_groundbomb') {
            // 地破弹：炸弹形状
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy+h*0.05, w*0.28, 0, Math.PI*2); g.fill();
            g.strokeStyle = '#1f2937'; g.lineWidth = 2;
            g.beginPath(); g.moveTo(cx, cy-h*0.23); g.lineTo(cx+w*0.12, cy-h*0.1); g.stroke();
            g.fillStyle = '#fbbf24';
            g.beginPath(); g.arc(cx+w*0.14, cy-h*0.26, w*0.07, 0, Math.PI*2); g.fill();
        } else if (shape === 'special_teleport') {
            // 瞬移弹：传送门
            g.strokeStyle = color; g.lineWidth = 3;
            g.beginPath(); g.ellipse(cx, cy, w*0.32, w*0.18, 0, 0, Math.PI*2); g.stroke();
            g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5;
            g.beginPath(); g.ellipse(cx, cy, w*0.2, w*0.1, 0, 0, Math.PI*2); g.stroke();
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy, w*0.06, 0, Math.PI*2); g.fill();
        }
    });
}

// ===== 敌人图形 =====
function buildEnemy(color, type) {
    return makeOffscreen(TILE*0.7, TILE*0.7, (g, w, h) => {
        const cx = w/2, cy = h/2;
        if (type === 'tank') {
            // 坦克：矩形车身+炮管
            g.fillStyle = color;
            g.beginPath(); g.roundRect(cx-w*0.38, cy-h*0.22, w*0.76, h*0.44, 6); g.fill();
            g.fillStyle = '#1f2937';
            g.beginPath(); g.arc(cx, cy, w*0.2, 0, Math.PI*2); g.fill();
            g.strokeStyle = '#374151'; g.lineWidth = 4;
            g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx+w*0.35, cy); g.stroke();
            g.fillStyle = '#374151';
            g.fillRect(cx-w*0.38, cy-h*0.3, w*0.76, h*0.1);
            g.fillRect(cx-w*0.38, cy+h*0.2, w*0.76, h*0.1);
        } else if (type === 'soldier') {
            // 士兵：身体+头
            g.fillStyle = color;
            g.beginPath(); g.roundRect(cx-w*0.18, cy-h*0.1, w*0.36, h*0.38, 4); g.fill();
            g.fillStyle = '#fde68a';
            g.beginPath(); g.arc(cx, cy-h*0.2, w*0.18, 0, Math.PI*2); g.fill();
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy-h*0.22, w*0.18, Math.PI, 0); g.fill();
        } else if (type === 'ufo') {
            // UFO：飞碟
            const grad = g.createRadialGradient(cx, cy, 0, cx, cy, w*0.38);
            grad.addColorStop(0, '#a78bfa'); grad.addColorStop(1, color);
            g.fillStyle = grad;
            g.beginPath(); g.ellipse(cx, cy, w*0.42, h*0.18, 0, 0, Math.PI*2); g.fill();
            g.fillStyle = 'rgba(196,181,253,0.6)';
            g.beginPath(); g.ellipse(cx, cy-h*0.1, w*0.2, h*0.18, 0, 0, Math.PI*2); g.fill();
            g.fillStyle = '#fbbf24';
            for (let i = 0; i < 4; i++) {
                const a = (i/4)*Math.PI*2;
                g.beginPath(); g.arc(cx+Math.cos(a)*w*0.28, cy+Math.sin(a)*h*0.1, 3, 0, Math.PI*2); g.fill();
            }
        } else if (type === 'robot') {
            // 机器人：方形头+天线+眼睛
            g.fillStyle = color;
            g.beginPath(); g.roundRect(cx-w*0.28, cy-h*0.28, w*0.56, h*0.56, 8); g.fill();
            g.fillStyle = '#0f172a';
            g.beginPath(); g.roundRect(cx-w*0.18, cy-h*0.12, w*0.14, h*0.14, 3); g.fill();
            g.beginPath(); g.roundRect(cx+w*0.04, cy-h*0.12, w*0.14, h*0.14, 3); g.fill();
            g.strokeStyle = '#0f172a'; g.lineWidth = 2;
            g.beginPath(); g.moveTo(cx-w*0.08, cy+h*0.06); g.lineTo(cx+w*0.08, cy+h*0.06); g.stroke();
            // 天线
            g.strokeStyle = color; g.lineWidth = 2;
            g.beginPath(); g.moveTo(cx, cy-h*0.28); g.lineTo(cx, cy-h*0.42); g.stroke();
            g.fillStyle = '#fbbf24';
            g.beginPath(); g.arc(cx, cy-h*0.44, 3, 0, Math.PI*2); g.fill();
        } else if (type === 'ghost') {
            // 幽灵：圆头+波浪裙摆
            g.fillStyle = color;
            g.beginPath();
            g.arc(cx, cy-h*0.1, w*0.3, Math.PI, 0);
            g.lineTo(cx+w*0.3, cy+h*0.22);
            // 波浪底部
            const waves = 4;
            for (let i = waves; i >= 0; i--) {
                const wx = cx - w*0.3 + (i/waves)*w*0.6;
                const wy = cy+h*0.22 + (i%2===0 ? h*0.1 : 0);
                g.lineTo(wx, wy);
            }
            g.closePath(); g.fill();
            // 眼睛
            g.fillStyle = '#0f172a';
            g.beginPath(); g.ellipse(cx-w*0.1, cy-h*0.12, w*0.07, h*0.09, 0, 0, Math.PI*2); g.fill();
            g.beginPath(); g.ellipse(cx+w*0.1, cy-h*0.12, w*0.07, h*0.09, 0, 0, Math.PI*2); g.fill();
        } else if (type === 'spider') {
            // 蜘蛛：圆身+8条腿
            g.fillStyle = color;
            g.beginPath(); g.arc(cx, cy, w*0.22, 0, Math.PI*2); g.fill();
            g.fillStyle = '#0f172a';
            g.beginPath(); g.arc(cx-w*0.07, cy-h*0.06, w*0.05, 0, Math.PI*2); g.fill();
            g.beginPath(); g.arc(cx+w*0.07, cy-h*0.06, w*0.05, 0, Math.PI*2); g.fill();
            g.strokeStyle = color; g.lineWidth = 2.5;
            const legAngles = [-0.8, -0.4, 0.4, 0.8];
            legAngles.forEach(a => {
                g.beginPath(); g.moveTo(cx-w*0.2, cy); g.lineTo(cx-w*0.44, cy+Math.sin(a)*h*0.3); g.stroke();
                g.beginPath(); g.moveTo(cx+w*0.2, cy); g.lineTo(cx+w*0.44, cy+Math.sin(a)*h*0.3); g.stroke();
            });
        } else if (type === 'wizard') {
            // 法师：三角帽+长袍
            g.fillStyle = color;
            // 长袍
            g.beginPath();
            g.moveTo(cx, cy-h*0.1);
            g.lineTo(cx+w*0.28, cy+h*0.32);
            g.lineTo(cx-w*0.28, cy+h*0.32);
            g.closePath(); g.fill();
            // 脸
            g.fillStyle = '#fde68a';
            g.beginPath(); g.arc(cx, cy-h*0.12, w*0.16, 0, Math.PI*2); g.fill();
            // 帽子
            g.fillStyle = color;
            g.beginPath();
            g.moveTo(cx, cy-h*0.44);
            g.lineTo(cx+w*0.2, cy-h*0.12);
            g.lineTo(cx-w*0.2, cy-h*0.12);
            g.closePath(); g.fill();
            // 帽檐
            g.beginPath(); g.ellipse(cx, cy-h*0.12, w*0.24, h*0.06, 0, 0, Math.PI*2); g.fill();
            // 魔法星星
            g.fillStyle = '#fbbf24';
            g.beginPath(); g.arc(cx+w*0.3, cy-h*0.1, 3, 0, Math.PI*2); g.fill();
        } else if (type === 'slime') {
            // 史莱姆：水滴形+眼睛
            g.fillStyle = color;
            g.beginPath();
            g.arc(cx, cy+h*0.05, w*0.3, 0, Math.PI*2); g.fill();
            // 顶部水滴尖
            g.beginPath();
            g.moveTo(cx-w*0.15, cy-h*0.05);
            g.quadraticCurveTo(cx, cy-h*0.42, cx+w*0.15, cy-h*0.05);
            g.fill();
            // 高光
            g.fillStyle = 'rgba(255,255,255,0.35)';
            g.beginPath(); g.ellipse(cx-w*0.08, cy-h*0.04, w*0.1, h*0.07, -0.5, 0, Math.PI*2); g.fill();
            // 眼睛
            g.fillStyle = '#0f172a';
            g.beginPath(); g.arc(cx-w*0.1, cy+h*0.06, w*0.06, 0, Math.PI*2); g.fill();
            g.beginPath(); g.arc(cx+w*0.1, cy+h*0.06, w*0.06, 0, Math.PI*2); g.fill();
        }
    });
}

// ===== 资源缓存（初始化后填充）=====
let RES = {};
function buildAssets() {
    RES.grass = buildGrassTile();
    RES.road  = buildRoadTile();
    RES.bases = {
        arrow:     buildTowerBase('#34d399'),
        cannon:    buildTowerBase('#f97316'),
        ice:       buildTowerBase('#38bdf8'),
        lightning: buildTowerBase('#a78bfa'),
        chain:     buildTowerBase('#94a3b8'),
        cursed:    buildTowerBase('#c084fc'),
        shockwave: buildTowerBase('#fb923c'),
        groundbomb:buildTowerBase('#a3e635'),
        teleport:  buildTowerBase('#67e8f9'),
    };
    RES.cannons = {
        arrow:     buildCannon('#34d399', 'arrow'),
        cannon:    buildCannon('#f97316', 'cannon'),
        ice:       buildCannon('#38bdf8', 'ice'),
        lightning: buildCannon('#a78bfa', 'lightning'),
        chain:     buildCannon('#94a3b8', 'special_chain'),
        cursed:    buildCannon('#c084fc', 'special_cursed'),
        shockwave: buildCannon('#fb923c', 'special_shockwave'),
        groundbomb:buildCannon('#a3e635', 'special_groundbomb'),
        teleport:  buildCannon('#67e8f9', 'special_teleport'),
    };
    RES.enemies = [
        buildEnemy('#4ade80', 'tank'),      // 0 绿坦克
        buildEnemy('#f87171', 'soldier'),   // 1 红士兵
        buildEnemy('#818cf8', 'ufo'),       // 2 紫UFO
        buildEnemy('#60a5fa', 'robot'),     // 3 蓝机器人
        buildEnemy('#c084fc', 'ghost'),     // 4 紫幽灵
        buildEnemy('#fb923c', 'spider'),    // 5 橙蜘蛛
        buildEnemy('#34d399', 'wizard'),    // 6 绿法师
        buildEnemy('#fbbf24', 'slime'),     // 7 黄史莱姆
    ];
}

// ===== 游戏状态 =====
let canvas, ctx;
let gameState = 'idle';
let lives = 20;
let currentWave = 0;
let totalWaves = 0;
let enemies = [];
let bullets = [];
let towers = [];
let particles = [];
let lightningArcs = []; // 链式闪电弧线 [{x1,y1,x2,y2,life}]
let _pendingEnemyCount = 0;  // 待动态生成的敌人数量
let _pendingLvlCfg = null;   // 待动态生成时用的关卡配置
let animFrame = null;
let waveTimer = 0;
let spawnQueue = [];
let spawnTimer = 0;
// 动态难度追踪：记录本关最后死亡的普通敌人和Boss的剩余HP比例
let _lastNormalHpRatio = 0;
let _lastBossHpRatio   = 0;
let levelEnemyTypes    = [0, 1, 2]; // 本关使用的3种敌人外观索引

// ===== 密码锁 =====
const LOCK_KEY = 'focusTree_gamePassword';
let lockBuffer = '';

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

// ===== 初始化 =====
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    buildAssets();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', onCanvasClick);
    // 从家长页跳转过来，跳过密码
    const fromParent = document.referrer.includes('tower-parent.html')
        || sessionStorage.getItem('fromParent') === '1';
    if (fromParent) {
        document.getElementById('lockOverlay').classList.add('hidden');
        sessionStorage.removeItem('fromParent');
    }
    loadGameState();
    drawStatic();
    checkGiftButton();
});

function resizeCanvas() {
    const wrap = canvas.parentElement;
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight - 90;
    if (gameState === 'idle') drawStatic();
}

function getTransform() {
    const scale = Math.min(canvas.width / (MAP_COLS * TILE), canvas.height / (MAP_ROWS * TILE));
    const offX = (canvas.width  - MAP_COLS * TILE * scale) / 2;
    const offY = (canvas.height - MAP_ROWS * TILE * scale) / 2;
    return { scale, offX, offY };
}

// ===== 选中的塔类型（用于放置）=====
let selectedTypeId = null;
let pendingSlotId = null; // 等待放塔的槽位

function loadGameState() {
    const data = getTowerData();
    document.getElementById('hudPts').textContent = `积分: ${data.points}`;
    const lvl = LEVELS[Math.min(data.currentLevel - 1, LEVELS.length - 1)];
    document.getElementById('hudLevel').textContent = `第${lvl.level}关`;
    document.getElementById('hudWave').textContent = `波次 0/${lvl.waves}`;
    buildTowerList(data);
}

function buildTowerList(data) {
    towers = [];
    Object.entries(data.towers || {}).forEach(([slotId, instanceId]) => {
        const slot = TOWER_SLOTS[parseInt(slotId)];
        if (!slot) return;
        const inst = (data.weaponInstances || []).find(i => i.id === instanceId);
        if (!inst) return;
        const isSpecial = !!SPECIAL_TOWERS[inst.typeId];
        if (isSpecial) {
            const stype = SPECIAL_TOWERS[inst.typeId];
            towers.push({
                slotId: parseInt(slotId),
                x: slot.x, y: slot.y,
                typeId: inst.typeId,
                instanceId: inst.id,
                isSpecial: true,
                special: stype.special,
                range: stype.baseRange,
                cooldownSec: stype.cooldownSec || 5,
                activeSec: stype.activeSec || 0,
                cooldownTimer: 0,   // frames until next trigger
                activeTimer: 0,     // frames remaining active (teleport)
                angle: -Math.PI/2,
            });
        } else {
            const type = TOWER_TYPES[inst.typeId];
            if (!type) return;
            const stats = calcTowerStats(inst.typeId, inst.upgrades || []);
            towers.push({
                slotId: parseInt(slotId),
                x: slot.x, y: slot.y,
                typeId: inst.typeId,
                instanceId: inst.id,
                atk: stats.atk,
                range: stats.range,
                speed: stats.speed * stats.speedMult,
                multiShot: stats.multiShot,
                tracking: stats.tracking,
                splash: stats.splash,
                bigSplash: stats.bigSplash,
                burn: stats.burn,
                poison: stats.poison,
                pierce: stats.pierce,
                slow: stats.slow,
                freeze: stats.freeze,
                iceSplash: stats.iceSplash,
                shatter: stats.shatter,
                stun: stats.stun,
                empStun: stats.empStun,
                overload: stats.overload,
                chain: stats.chain,
                superMode: stats.superMode,
                cooldown: 0,
                angle: -Math.PI/2,
            });
        }
    });
}

// ===== 射程预览 =====
let rangePreviewSlot = null;
let rangePreviewType = null;
let rangePreviewRange = 0;

function showRangePreview(slotId, typeId, range) {
    rangePreviewSlot = slotId;
    rangePreviewType = typeId;
    rangePreviewRange = range || TOWER_TYPES[typeId]?.baseRange || 160;
    drawStatic();
}

function clearRangePreview() {
    rangePreviewSlot = null;
    rangePreviewType = null;
    drawStatic();
}

// ===== 选塔浮层（选具体武器实例）=====
function openSlotPopup(slotId, canvasX, canvasY) {
    pendingSlotId = slotId;
    const data = getTowerData();
    const list = document.getElementById('slotPopupList');
    list.innerHTML = '';

    const instances = data.weaponInstances || [];
    if (instances.length === 0) {
        list.innerHTML = '<div style="color:#64748b;font-size:13px;padding:8px">还没有武器，请先在家长端购买</div>';
    } else {
        instances.forEach((inst, idx) => {
            const isSpecial = !!SPECIAL_TOWERS[inst.typeId];
            const type = isSpecial ? SPECIAL_TOWERS[inst.typeId] : TOWER_TYPES[inst.typeId];
            if (!type) return;
            if (type.hidden) return; // 隐藏的武器不显示
            const stats = isSpecial ? null : calcTowerStats(inst.typeId, inst.upgrades || []);
            // 已部署在其他塔位的不能重复放
            const alreadyPlaced = Object.entries(data.towers || {}).some(([sid, iid]) => iid === inst.id && parseInt(sid) !== slotId);
            // 特殊炮台：同类型在地图上只能有一个
            const specialDuplicate = isSpecial && Object.entries(data.towers || {}).some(([sid, iid]) => {
                if (parseInt(sid) === slotId) return false;
                const other = (data.weaponInstances || []).find(i => i.id === iid);
                return other && other.typeId === inst.typeId;
            });
            const blocked = alreadyPlaced || specialDuplicate;
            const item = document.createElement('div');
            item.className = 'slot-popup-item' + (blocked ? ' disabled' : '');
            item.innerHTML = `
                <div class="spi-emoji">${type.emoji}</div>
                <div class="spi-info">
                    <div class="spi-name">${type.name} #${idx+1}${isSpecial ? ' <span style="font-size:10px;color:#94a3b8">特殊</span>' : ''}</div>
                    <div class="spi-cost">${isSpecial ? type.desc : `攻${stats.atk} 程${stats.range}`} ${alreadyPlaced ? '(已部署)' : specialDuplicate ? '(已在地图上)' : '可放置'}</div>
                </div>`;
            if (!isSpecial) {
                item.addEventListener('mouseenter', () => showRangePreview(slotId, type.id, stats.range));
                item.addEventListener('mouseleave', () => clearRangePreview());
            }
            if (!blocked) {
                item.onclick = () => { placeOnSlot(inst.id, slotId); closeSlotPopup(); };
            }
            list.appendChild(item);
        });
    }

    const popup = document.getElementById('slotPopup');
    // 先显示再计算高度，确保能拿到实际尺寸
    popup.classList.add('show');
    document.getElementById('slotPopupMask').classList.add('show');
    const popupH = popup.offsetHeight;
    const popupW = popup.offsetWidth;
    const margin = 8;
    // 水平：优先在点击右侧，不够就放左侧
    let left = canvasX + 10;
    if (left + popupW + margin > window.innerWidth) left = canvasX - popupW - 10;
    left = Math.max(margin, left);
    // 垂直：优先在点击位置上方居中，确保不超出底部和顶部
    let top = canvasY - popupH / 2;
    if (top + popupH + margin > window.innerHeight) top = window.innerHeight - popupH - margin;
    if (top < margin) top = margin;
    popup.style.left = left + 'px';
    popup.style.top  = top + 'px';
}

function closeSlotPopup() {
    document.getElementById('slotPopup').classList.remove('show');
    document.getElementById('slotPopupMask').classList.remove('show');
    pendingSlotId = null;
    clearRangePreview();
}

function placeOnSlot(instanceId, slotId) {
    const data = getTowerData();
    data.towers = data.towers || {};
    data.towers[slotId] = instanceId;
    saveTowerData(data);
    document.getElementById('hudPts').textContent = `积分: ${data.points}`;
    buildTowerList(data);
    drawStatic();
}

// ===== Canvas 点击：点"+"弹出选塔，点已有塔可移除 =====
function onCanvasClick(e) {
    if (gameState !== 'idle') return;
    const data = getTowerData();
    const { scale, offX, offY } = getTransform();
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - offX) / scale;
    const my = (e.clientY - rect.top  - offY) / scale;
    const gc = Math.floor(mx / TILE);
    const gr = Math.floor(my / TILE);

    const slot = TOWER_SLOTS.find(s =>
        s.x === gc && s.y === gr && data.unlockedSlots.includes(s.id)
    );
    if (!slot) return;

    const instanceId = (data.towers || {})[slot.id];
    if (instanceId) {
        // 点击已有武器的塔位：直接移除并弹出选塔弹窗（换武器）
        delete data.towers[slot.id];
        saveTowerData(data);
        buildTowerList(data);
        drawStatic();
        openSlotPopup(slot.id, e.clientX, e.clientY);
    } else {
        openSlotPopup(slot.id, e.clientX, e.clientY);
    }
}
const PATH_SET = new Set(MAP_PATH.map(p => `${p.x},${p.y}`));

// ===== 绘制静态地图 =====
function drawStatic() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { scale, offX, offY } = getTransform();
    ctx.save();
    ctx.translate(offX, offY);
    ctx.scale(scale, scale);
    drawMapBase();
    const data = getTowerData();
    TOWER_SLOTS.forEach((slot, i) => {
        if (!data.unlockedSlots.includes(i)) return;
        const instanceId = (data.towers || {})[i];
        if (instanceId) {
            const inst = (data.weaponInstances || []).find(w => w.id === instanceId);
            if (inst) drawTowerAt(slot.x, slot.y, inst, -Math.PI/2);
            else drawEmptySlot(slot.x * TILE, slot.y * TILE);
        } else {
            drawEmptySlot(slot.x * TILE, slot.y * TILE);
        }
    });
    // 射程预览圆
    if (rangePreviewSlot !== null && rangePreviewType) {
        const slot = TOWER_SLOTS[rangePreviewSlot];
        const type = TOWER_TYPES[rangePreviewType];
        if (slot && type) {
            const cx = slot.x * TILE + TILE/2, cy = slot.y * TILE + TILE/2;
            ctx.beginPath();
            ctx.arc(cx, cy, rangePreviewRange, 0, Math.PI*2);
            ctx.fillStyle = `${type.color}30`;
            ctx.fill();
            ctx.strokeStyle = type.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    ctx.restore();
}

function drawMapBase() {
    for (let r = 0; r < MAP_ROWS; r++)
        for (let c = 0; c < MAP_COLS; c++)
            ctx.drawImage(PATH_SET.has(`${c},${r}`) ? RES.road : RES.grass, c*TILE, r*TILE);
    // 入口/出口标记
    const s = MAP_PATH[0], e = MAP_PATH[MAP_PATH.length-1];
    ctx.fillStyle = 'rgba(74,222,128,0.45)';
    ctx.fillRect(s.x*TILE, s.y*TILE, TILE, TILE);
    ctx.fillStyle = 'rgba(248,113,113,0.45)';
    ctx.fillRect(e.x*TILE, e.y*TILE, TILE, TILE);
    ctx.fillStyle = '#fff'; ctx.font = `bold ${TILE*0.28}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('入', s.x*TILE+TILE/2, s.y*TILE+TILE/2);
    ctx.fillText('出', e.x*TILE+TILE/2, e.y*TILE+TILE/2);
}

function drawEmptySlot(px, py) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2; ctx.setLineDash([6,4]);
    ctx.fillRect(px+4, py+4, TILE-8, TILE-8);
    ctx.strokeRect(px+4, py+4, TILE-8, TILE-8);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = `${TILE*0.4}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('+', px+TILE/2, py+TILE/2);
}

function drawTowerAt(gx, gy, tData, angle) {
    const px = gx*TILE, py = gy*TILE;
    const isSpecial = tData.isSpecial || !!SPECIAL_TOWERS[tData.typeId];
    const base = RES.bases[tData.typeId] || RES.bases.arrow;
    ctx.drawImage(base, px, py);
    ctx.save();
    ctx.translate(px+TILE/2, py+TILE/2);
    if (!isSpecial) ctx.rotate(angle + Math.PI/2);
    ctx.drawImage(RES.cannons[tData.typeId] || RES.cannons.arrow, -TILE/2, -TILE/2);
    ctx.restore();
    const type = isSpecial ? SPECIAL_TOWERS[tData.typeId] : TOWER_TYPES[tData.typeId];
    const label = type ? type.name.slice(0, 2) : '??';
    ctx.fillStyle = type ? type.color : '#fff';
    ctx.font = `bold ${TILE*0.19}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, px+TILE/2, py+TILE*0.82);
    // 显示实例编号（同类武器区分用）
    // tData 可能是 inst（有 .id）或 tower 对象（有 .instanceId）
    const instId = tData.instanceId || tData.id;
    if (instId) {
        const data = getTowerData();
        const idx = (data.weaponInstances || []).findIndex(i => i.id === instId);
        if (idx >= 0) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${TILE*0.17}px sans-serif`;
            ctx.fillText(`#${idx + 1}`, px+TILE/2, py+TILE*0.95);
        }
    }
}

// ===== 战斗逻辑 =====
function startBattle() {
    const data = getTowerData();
    if (Object.keys(data.towers).length === 0) {
        alert('还没有放置任何塔！请在下方选择塔，点击地图空位放置。');
        return;
    }
    const lvlCfg = LEVELS[Math.min(data.currentLevel - 1, LEVELS.length - 1)];

    // 敌人类型分布
    const typeNames = { tank: '🛡️ 坦克', soldier: '🪖 士兵', ufo: '🛸 UFO' };
    const totalEnemies = lvlCfg.waves * lvlCfg.enemyCount;
    const speedLabel = lvlCfg.enemySpeed <= 1.0 ? ['普通', 'good']
                     : lvlCfg.enemySpeed <= 1.2 ? ['较快', 'warn']
                     : ['极快', 'danger'];
    const hpLabel = lvlCfg.enemyHp <= 100 ? ['较低', 'good']
                  : lvlCfg.enemyHp <= 250 ? ['中等', 'warn']
                  : ['很高', 'danger'];

    document.getElementById('previewLevelTitle').textContent = `第 ${data.currentLevel} 关`;
    document.getElementById('previewStats').innerHTML = `
        <div class="lps-row"><span class="lps-label">波次</span><span class="lps-value">${lvlCfg.waves} 波</span></div>
        <div class="lps-row"><span class="lps-label">每波敌人</span><span class="lps-value">${lvlCfg.enemyCount} 个</span></div>
        <div class="lps-row"><span class="lps-label">总敌人数</span><span class="lps-value warn">${totalEnemies} 个</span></div>
        <hr class="lps-divider">
        <div class="lps-row"><span class="lps-label">敌人血量</span><span class="lps-value ${hpLabel[1]}">${lvlCfg.enemyHp} HP（${hpLabel[0]}）</span></div>
        <div class="lps-row"><span class="lps-label">移动速度</span><span class="lps-value ${speedLabel[1]}">${lvlCfg.enemySpeed}x（${speedLabel[0]}）</span></div>
        <div class="lps-row"><span class="lps-label">敌人类型</span><span class="lps-value">坦克 / 士兵 / UFO</span></div>
        <hr class="lps-divider">
        <div class="lps-row"><span class="lps-label">通关奖励</span><span class="lps-value good">+${lvlCfg.reward} 积分</span></div>
    `;
    document.getElementById('levelPreviewOverlay').classList.add('show');
}

function confirmStartBattle() {
    document.getElementById('levelPreviewOverlay').classList.remove('show');
    const data = getTowerData();
    const lvlCfg = LEVELS[Math.min(data.currentLevel - 1, LEVELS.length - 1)];

    // ===== 动态难度：根据上局实际结果决定本局目标 =====
    const targetWin = getDifficultyTarget(data);
    const power = calcTowerPower();

    // 赢局：基础HP = 战力×0.6；输局：基础HP = 战力×1.2
    const baseHp = Math.max(Math.round(power * (targetWin ? 0.6 : 1.2)), 20);

    data._battleTarget = targetWin ? 'win' : 'lose';
    data._baseEnemyHp = baseHp;
    data._dynEnemyHp = baseHp;   // 当前动态HP，随战况调整
    data._deadCount = 0;         // 已死敌人数
    data._deadHpSum = 0;         // 已死敌人死亡时剩余HP比例之和（用于算平均）
    data._totalEnemyCount = lvlCfg.enemyCount; // 本局总敌人数
    saveTowerData(data);

    currentWave = 0; totalWaves = lvlCfg.waves;
    enemies = []; bullets = []; particles = []; lightningArcs = [];
    spawnQueue = []; spawnTimer = 0; waveTimer = 0;
    _lastNormalHpRatio = 0; _lastBossHpRatio = 0;
    const allIdx = [0,1,2,3,4,5,6,7,8,9,10];
    for (let i = allIdx.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [allIdx[i], allIdx[j]] = [allIdx[j], allIdx[i]];
    }
    levelEnemyTypes = allIdx.slice(0, 5);
    gameState = 'running';
    document.getElementById('btnStart').disabled = true;
    document.getElementById('hudLives').textContent = `🛡️ 守住出口`;
    document.getElementById('hudWave').textContent = `波次 0/${totalWaves}`;
    buildTowerList(data);
    spawnWave(Object.assign({}, lvlCfg, { enemyHp: baseHp }));
    gameLoop();
}

function cancelPreview() {
    document.getElementById('levelPreviewOverlay').classList.remove('show');
}

function spawnWave(lvlCfg) {
    currentWave++;
    document.getElementById('hudWave').textContent = `波次 ${currentWave}/${totalWaves}`;

    // 前6个是侦察兵（isScout标记），用基础HP出场
    const scoutCount = Math.min(6, lvlCfg.enemyCount);
    for (let i = 0; i < scoutCount; i++) {
        spawnQueue.push({
            hp: lvlCfg.enemyHp, maxHp: lvlCfg.enemyHp,
            speed: lvlCfg.enemySpeed,
            imgIdx: levelEnemyTypes[Math.floor(Math.random() * levelEnemyTypes.length)],
            isScout: true,
        });
    }
    // 剩余敌人数量存起来，由update动态生成
    _pendingEnemyCount = Math.max(0, lvlCfg.enemyCount - scoutCount);
    _pendingLvlCfg = lvlCfg;

    // Boss在最后一波末尾，由update在所有普通敌人出完后追加
}

function gameLoop() {
    if (gameState !== 'running') return;
    update();
    render();
    animFrame = requestAnimationFrame(gameLoop);
}

function pathToPx(p) {
    return { x: p.x * TILE + TILE/2, y: p.y * TILE + TILE/2 };
}

function update() {
    const data = getTowerData();
    const lvlCfg = LEVELS[Math.min(data.currentLevel - 1, LEVELS.length - 1)];

    // 生成敌人
    spawnTimer++;
    if (spawnTimer >= 60 && spawnQueue.length > 0) {
        spawnTimer = 0;
        const e = spawnQueue.shift();
        const sp = pathToPx(MAP_PATH[0]);
        enemies.push({ ...e, px: sp.x, py: sp.y, pathIdx: 0, progress: 0, dead: false });

        // 侦察兵出完后，动态生成后续敌人（每放出1个前根据战况算HP）
        if (_pendingEnemyCount > 0 && spawnQueue.filter(q => !q.isBoss).length === 0) {
            _pendingEnemyCount--;
            const dynHp = calcAndStoreNextEnemyHp();
            const data2 = getTowerData();
            const baseHp2 = data2._baseEnemyHp || dynHp;
            const hpDiff = dynHp - baseHp2;
            const hpMark = hpDiff > baseHp2 * 0.05 ? `+${Math.round(hpDiff)}` : hpDiff < -baseHp2 * 0.05 ? `${Math.round(hpDiff)}` : '=';
            spawnQueue.push({
                hp: dynHp, maxHp: dynHp,
                speed: _pendingLvlCfg.enemySpeed,
                imgIdx: levelEnemyTypes[Math.floor(Math.random() * levelEnemyTypes.length)],
                isScout: false,
                hpMark,
            });
            // 所有普通敌人都入队完了，追加Boss
            if (_pendingEnemyCount === 0 && currentWave === totalWaves && _pendingLvlCfg.boss) {
                const data2 = getTowerData();
                const targetWin = data2._battleTarget === 'win';
                const baseBossHp = _pendingLvlCfg.boss.hp;
                // 输局：Boss HP大幅提升，速度加快；赢局：Boss HP适中，速度正常
                const bossHp = targetWin ? Math.round(baseBossHp * 0.8) : Math.round(baseBossHp * 2.5);
                const bossSpeed = targetWin ? 0.3 : 0.55;
                spawnQueue.push({
                    hp: bossHp, maxHp: bossHp,
                    speed: bossSpeed, _baseSpeed: bossSpeed, imgIdx: 0,
                    isBoss: true,
                    bossTier: _pendingLvlCfg.boss.tier,
                    bossStyle: Math.floor(Math.random() * 5),
                    skills: _pendingLvlCfg.boss.skills || [],
                    shootTimer: 0, hasSplit: false,
                });
            }
        }
        // 没有待生成敌人时，侦察兵全出完后追加Boss（敌人数≤6的关卡）
        if (_pendingEnemyCount === 0 && spawnQueue.length === 0 &&
            currentWave === totalWaves && _pendingLvlCfg && _pendingLvlCfg.boss &&
            !enemies.some(e2 => e2.isBoss) && !spawnQueue.some(q => q.isBoss)) {
            const data2 = getTowerData();
            const targetWin = data2._battleTarget === 'win';
            const baseBossHp = _pendingLvlCfg.boss.hp;
            const bossHp = targetWin ? Math.round(baseBossHp * 0.8) : Math.round(baseBossHp * 2.5);
            const bossSpeed = targetWin ? 0.3 : 0.55;
            spawnQueue.push({
                hp: bossHp, maxHp: bossHp,
                speed: bossSpeed, _baseSpeed: bossSpeed, imgIdx: 0,
                isBoss: true,
                bossTier: _pendingLvlCfg.boss.tier,
                bossStyle: Math.floor(Math.random() * 5),
                skills: _pendingLvlCfg.boss.skills || [],
                shootTimer: 0, hasSplit: false,
            });
        }
    }

    // 下一波
    if (spawnQueue.length === 0 && enemies.length === 0 && currentWave < totalWaves) {
        waveTimer++;
        if (waveTimer >= 120) { waveTimer = 0; spawnWave(lvlCfg); }
    }

    // 移动敌人
    enemies.forEach(e => {
        if (e.dead) return;
        // Boss对麻痹/冻结有抗性：最多减速到50%，且持续时间减半
        if (e.isBoss && e.slowTimer > 0) {
            e.slowFactor = Math.max(e.slowFactor ?? 0.4, 0.5);
            if (e.slowTimer % 2 === 0) e.slowTimer--; // 减速时间减半（每帧消耗2帧）
        }
        // 冰冻减速：slowTimer > 0 时速度乘以 slowFactor
        if (e.slowTimer > 0) e.slowTimer--;
        if (e.slowTimer === 0) e._frozenByIce = false; // 冻结结束清除标记
        const spd = e.slowTimer > 0 ? e.speed * (e.slowFactor ?? 0.4) : e.speed;
        e.progress += spd;
        if (e.progress >= TILE) {
            e.progress -= TILE; e.pathIdx++;
            if (e.pathIdx >= MAP_PATH.length) {
                e.dead = true;
                endBattle(false); // 任意1个敌人到达出口即失败
                return;
            }
        }
        const cur = MAP_PATH[e.pathIdx];
        const nxt = MAP_PATH[Math.min(e.pathIdx+1, MAP_PATH.length-1)];
        const t = e.progress / TILE;
        e.px = (cur.x + (nxt.x-cur.x)*t) * TILE + TILE/2;
        e.py = (cur.y + (nxt.y-cur.y)*t) * TILE + TILE/2;
    });
    enemies = enemies.filter(e => !e.dead);

    // 塔攻击
    towers.forEach(tower => {
        if (tower.isSpecial) return; // 特殊炮台在下方单独处理
        tower.cooldown = Math.max(0, tower.cooldown - 1);
        if (tower.cooldown > 0) return;
        const tx = tower.x*TILE+TILE/2, ty = tower.y*TILE+TILE/2;
        const colors = { arrow:'#34d399', cannon:'#f97316', ice:'#38bdf8', lightning:'#a78bfa' };
        const bColor = colors[tower.typeId] || '#fbbf24';
        const bSize = tower.typeId === 'cannon' ? 7 : 4;

        // 找射程内所有敌人，按路径进度排序（优先打最靠近出口的）
        const inRange = enemies
            .filter(e => Math.hypot(e.px-tx, e.py-ty) < tower.range)
            .sort((a, b) => (b.pathIdx*TILE + b.progress) - (a.pathIdx*TILE + a.progress));

        if (inRange.length === 0) return;

        const shots = tower.multiShot || 1;
        tower.angle = Math.atan2(inRange[0].py-ty, inRange[0].px-tx);
        tower.cooldown = Math.max(1, Math.round(60 / tower.speed));

        for (let s = 0; s < shots; s++) {
            // 多发时依次选不同目标，没有更多目标就打同一个（略微偏移）
            const target = inRange[s] || inRange[0];
            const spread = shots > 1 ? (s - (shots-1)/2) * 8 : 0; // 多发时横向偏移出发点
            bullets.push({
                x: tx + Math.cos(tower.angle + Math.PI/2) * spread,
                y: ty + Math.sin(tower.angle + Math.PI/2) * spread,
                target,
                atk: tower.atk, speed: 6,
                color: bColor,
                type: tower.typeId,
                size: bSize,
                dead: false,
                // carry tower special effects
                slow: tower.slow,
                freeze: tower.freeze,
                iceSplash: tower.iceSplash,
                shatter: tower.shatter,
                splash: tower.splash,
                bigSplash: tower.bigSplash,
                burn: tower.burn,
                poison: tower.poison,
                pierce: tower.pierce,
                stun: tower.stun,
                empStun: tower.empStun,
                overload: tower.overload,
                chain: tower.chain,
                superMode: tower.superMode,
                range: tower.range,
            });
        }
    });

    // 移动子弹
    bullets.forEach(b => {
        if (b.dead) return;
        if (b.isBossBullet) return; // Boss炮弹在Boss逻辑里单独处理
        if (b.isEnemyBullet) return; // 敌人炮弹在敌人攻击逻辑里单独处理
        const dx = b.target.px-b.x, dy = b.target.py-b.y;
        const d = Math.hypot(dx, dy);
        if (d < b.speed) {
            b.dead = true;
            // overload: double damage on enemies with >80% hp (easier to trigger than full-hp only)
            const isOverload = b.overload && b.target.hp >= b.target.maxHp * 0.8;
            const dmg = isOverload ? b.atk * 2 : b.atk;
            // shatter: double damage on frozen enemies
            const finalDmg = dmg;
            if (!b.target.invincible) b.target.hp -= finalDmg;

            // 过载放电视觉：黄色电弧爆发
            if (isOverload) {
                for (let i = 0; i < 16; i++) {
                    const a = (i / 16) * Math.PI * 2;
                    const spd = 3 + Math.random() * 4;
                    particles.push({ x: b.target.px, y: b.target.py,
                        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                        life: 1.2, color: i % 2 === 0 ? '#fde047' : '#a78bfa', size: 5 + Math.random() * 3 });
                }
                // 过载标记（在render里显示"×2"文字）
                b.target._overloadFlash = 30;
            }

            // 冰冻减速效果（读取升级后的 slow 值）
            if (b.type === 'ice') {
                const slowAmt = b.slow > 0 ? b.slow : 0.5;
                const slowFactor = 1 - slowAmt;
                if (b.freeze) {
                    // 完全冻结2秒，标记为冰冻（区别于闪电麻痹）
                    b.target.slowTimer = Math.max(b.target.slowTimer || 0, 120);
                    b.target.slowFactor = 0.0;
                    b.target._frozenByIce = true;
                    // 冻结爆发粒子（更多更大）
                    for (let i = 0; i < 16; i++) {
                        const a = (i/16)*Math.PI*2;
                        particles.push({ x:b.target.px, y:b.target.py,
                            vx:Math.cos(a)*3.5, vy:Math.sin(a)*3.5,
                            life:1.2, color: i%2===0 ? '#bae6fd' : '#ffffff', size:5 });
                    }
                } else {
                    b.target.slowTimer = Math.max(b.target.slowTimer || 0, 120);
                    b.target.slowFactor = Math.min(b.target.slowFactor || 1, slowFactor);
                    // 普通冰冻粒子
                    for (let i = 0; i < 8; i++) {
                        const a = (i/8)*Math.PI*2;
                        particles.push({ x:b.target.px, y:b.target.py,
                            vx:Math.cos(a)*2.5, vy:Math.sin(a)*2.5,
                            life:1, color:'#38bdf8', size:3 });
                    }
                }
                // 暴风雪：已移除

            }

            // 炮塔爆炸范围
            if (b.type === 'cannon' && b.splash) {
                const splashR = 55;
                enemies.forEach(e => {
                    if (e === b.target || e.dead) return;
                    if (Math.hypot(e.px-b.target.px, e.py-b.target.py) < splashR) {
                        e.hp -= finalDmg * 0.6;
                        if (e.hp <= 0) e.dead = true;
                    }
                });
                // 爆炸粒子
                for (let i = 0; i < 14; i++) {
                    const a = Math.random()*Math.PI*2, spd = 2+Math.random()*4;
                    particles.push({ x:b.target.px, y:b.target.py,
                        vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
                        life:1, color:'#f97316', size:5 });
                }
            }

            // 燃烧效果
            if (b.burn) {
                b.target.burnTimer = Math.max(b.target.burnTimer || 0, 180); // 3秒
                b.target.burnDmg = b.atk * 0.15; // 每帧伤害
            }

            // 毒箭效果
            if (b.poison) {
                b.target.poisonTimer = Math.max(b.target.poisonTimer || 0, 180); // 3秒
                b.target.poisonDmg = b.atk * 0.1;
            }

            // 闪电麻痹
            if (b.type === 'lightning' && b.stun) {
                const stunDur = b.empStun ? 300 : 180; // EMP: 5秒, 普通: 3秒
                const now = Date.now();
                // 麻痹免疫：上次麻痹结束后3秒内不能再被麻痹
                if (!(b.target._stunImmune && now < b.target._stunImmune)) {
                    if ((b.target.slowTimer || 0) < stunDur) {
                        b.target.slowTimer = stunDur;
                        b.target.slowFactor = 0.0;
                        b.target._stunImmune = now + stunDur / 60 * 1000 + 3000; // 麻痹时间+3秒免疫
                    }
                    // 麻痹粒子
                    for (let i = 0; i < 6; i++) {
                        const a = (i/6)*Math.PI*2;
                        particles.push({ x:b.target.px, y:b.target.py,
                            vx:Math.cos(a)*1.5, vy:Math.sin(a)*1.5,
                            life:1, color:'#a78bfa', size:3 });
                    }
                }
            }

            // 闪电链式跳跃
            if (b.type === 'lightning' && b.chain > 1) {
                let lastTarget = b.target;
                const chained = new Set([b.target]);
                // superMode：全屏；普通链式：200px（扩大范围确保能找到下一目标）
                const chainRange = 200;
                const chainCount = b.chain;
                for (let c = 1; c < chainCount; c++) {
                    const next = enemies
                        .filter(e => !e.dead && !chained.has(e) && Math.hypot(e.px-lastTarget.px, e.py-lastTarget.py) < chainRange)
                        .sort((a, e2) => Math.hypot(a.px-lastTarget.px, a.py-lastTarget.py) - Math.hypot(e2.px-lastTarget.px, e2.py-lastTarget.py))[0];
                    if (!next) break;
                    chained.add(next);
                    // 链式跳跃：普通伤害×0.7
                    const chainDmg = finalDmg * 0.7;
                    next.hp -= chainDmg;
                    if (next.hp <= 0) next.dead = true;
                    // 链式闪电弧线
                    lightningArcs.push({
                        x1: lastTarget.px, y1: lastTarget.py,
                        x2: next.px,       y2: next.py,
                        life: 12,
                    });
                    // 命中闪光粒子
                    for (let i = 0; i < 8; i++) {
                        const a = Math.random()*Math.PI*2;
                        particles.push({ x: next.px, y: next.py,
                            vx: Math.cos(a)*3, vy: Math.sin(a)*3,
                            life: 1.0, color: '#ffffff', size: 5 });
                    }
                    lastTarget = next;
                }
            }

            // 穿透箭：子弹继续飞向下一个敌人
            if (b.pierce && !b.pierced) {
                const nextTarget = enemies
                    .filter(e => !e.dead && e !== b.target)
                    .sort((a, e2) => Math.hypot(a.px-b.x, a.py-b.y) - Math.hypot(e2.px-b.x, e2.py-b.y))[0];
                if (nextTarget) {
                    bullets.push({ ...b, dead: false, target: nextTarget, pierced: true });
                }
            }

            // 爆炸粒子（通用）
            if (b.type !== 'cannon' || !b.splash) {
                const count = b.type === 'cannon' ? 10 : 4;
                for (let i = 0; i < count; i++) {
                    const a = Math.random()*Math.PI*2, spd = 1+Math.random()*3;
                    particles.push({ x:b.target.px, y:b.target.py,
                        vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
                        life:1, color:b.color, size: b.type==='cannon'?4:2 });
                }
            }
            if (b.target.hp <= 0) {
                // 记录死亡时的HP比例（用于动态难度）
                if (b.target.isBoss) _lastBossHpRatio = Math.max(_lastBossHpRatio, 0);
                else {
                    _lastNormalHpRatio = 0;
                    // 动态难度：侦察兵和普通敌人都计入战果统计
                    {
                        const data = getTowerData();
                        const survivedRatio = Math.max(0, b.target.pathIdx / Math.max(MAP_PATH.length - 1, 1));
                        data._deadCount = (data._deadCount || 0) + 1;
                        data._deadHpSum = (data._deadHpSum || 0) + survivedRatio;
                        saveTowerData(data);
                    }
                }
                b.target.dead = true;
            }
        } else {
            b.x += dx/d*b.speed; b.y += dy/d*b.speed;
        }
    });
    bullets = bullets.filter(b => !b.dead);
    enemies = enemies.filter(e => !e.dead);

    // 持续效果（燃烧/毒）
    enemies.forEach(e => {
        if (e.burnTimer > 0) {
            e.burnTimer--;
            e.hp -= e.burnDmg || 0;
            if (e.burnTimer % 8 === 0) {
                particles.push({ x:e.px+(Math.random()-0.5)*20, y:e.py-10,
                    vx:(Math.random()-0.5)*1.5, vy:-1.5,
                    life:0.8, color:'#f97316', size:3 });
            }
            if (e.hp <= 0) e.dead = true;
        }
        if (e.poisonTimer > 0) {
            e.poisonTimer--;
            e.hp -= e.poisonDmg || 0;
            if (e.poisonTimer % 10 === 0) {
                particles.push({ x:e.px+(Math.random()-0.5)*16, y:e.py,
                    vx:(Math.random()-0.5)*1, vy:-1,
                    life:0.7, color:'#4ade80', size:2 });
            }
            if (e.hp <= 0) e.dead = true;
        }
    });
    enemies = enemies.filter(e => !e.dead);

    // 粒子
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.9; p.vy *= 0.9; p.life -= 0.04;
    });
    particles = particles.filter(p => p.life > 0);

    // 链式闪电弧线衰减
    lightningArcs.forEach(a => a.life--);
    lightningArcs = lightningArcs.filter(a => a.life > 0);

    // ===== 普通敌人攻击炮台 =====
    // 每种敌人有不同的攻击风格，伤害很小（0.03~0.08），顺带打击路径旁的炮台
    const ENEMY_ATTACK = [
        { interval: 180, range: 2.5*TILE, dmg: 0.006, speed: 2.5, color: '#94a3b8', size: 4  }, // 0 僵尸士兵：石块
        { interval: 120, range: 1.8*TILE, dmg: 0.008, speed: 3.0, color: '#ef4444', size: 5  }, // 1 血腥僵尸：喷血
        { interval: 150, range: 3.0*TILE, dmg: 0.006, speed: 3.5, color: '#a855f7', size: 3  }, // 2 巫毒僵尸：毒针
        { interval: 140, range: 2.8*TILE, dmg: 0.008, speed: 3.0, color: '#4ade80', size: 5  }, // 3 沼泽怪：酸液
        { interval: 200, range: 2.0*TILE, dmg: 0.006, speed: 2.0, color: '#fef3c7', size: 5  }, // 4 木乃伊：绷带
        { interval: 100, range: 4.0*TILE, dmg: 0.010, speed: 4.5, color: '#818cf8', size: 4  }, // 5 骷髅法师：魔法弹
        { interval: 130, range: 2.5*TILE, dmg: 0.008, speed: 3.5, color: '#f1f5f9', size: 4  }, // 6 蜘蛛女王：蛛网
        { interval: 110, range: 1.5*TILE, dmg: 0.006, speed: 2.5, color: '#86efac', size: 6  }, // 7 史莱姆：分裂弹
        { interval: 240, range: 3.0*TILE, dmg: 0.016, speed: 2.0, color: '#fb923c', size: 7  }, // 8 坦克僵尸：重炮弹
        { interval:  90, range: 3.5*TILE, dmg: 0.008, speed: 5.0, color: '#fbbf24', size: 3  }, // 9 士兵僵尸：子弹
        { interval: 160, range: 4.5*TILE, dmg: 0.012, speed: 5.5, color: '#22d3ee', size: 4  }, // 10 UFO：激光
    ];
    const enemyBullets = [];
    enemies.filter(e => !e.dead && !e.isBoss).forEach(e => {
        const atk = ENEMY_ATTACK[e.imgIdx] || ENEMY_ATTACK[0];
        e._atkTimer = (e._atkTimer || Math.floor(Math.random() * atk.interval)) + 1;
        if (e._atkTimer < atk.interval) return;
        e._atkTimer = 0;
        // 找射程内最近的炮台
        let best = null, bestDist = Infinity;
        towers.forEach(t => {
            const tx = t.x*TILE+TILE/2, ty = t.y*TILE+TILE/2;
            const d = Math.hypot(tx - e.px, ty - e.py);
            if (d < atk.range && d < bestDist) { bestDist = d; best = t; }
        });
        if (!best) return;
        enemyBullets.push({
            x: e.px, y: e.py,
            targetTower: best,
            speed: atk.speed, dmg: atk.dmg,
            color: atk.color, size: atk.size,
            dead: false, isEnemyBullet: true,
        });
    });
    bullets.push(...enemyBullets);

    // 敌人炮弹移动与命中
    bullets.forEach(b => {
        if (!b.isEnemyBullet || b.dead) return;
        const tt = b.targetTower;
        const tx = tt.x*TILE+TILE/2, ty = tt.y*TILE+TILE/2;
        const dx = tx-b.x, dy = ty-b.y;
        const d = Math.hypot(dx, dy);
        if (d < b.speed + 4) {
            b.dead = true;
            tt.hp = (tt.hp !== undefined ? tt.hp : 1) - b.dmg;
            if (tt.hp < 0) tt.hp = 0;
            // 小粒子
            for (let i = 0; i < 4; i++) {
                const a = Math.random()*Math.PI*2;
                particles.push({ x:tx, y:ty, vx:Math.cos(a)*2, vy:Math.sin(a)*2,
                    life:0.6, color: b.color, size: b.size * 0.6 });
            }
        } else {
            b.x += dx/d*b.speed;
            b.y += dy/d*b.speed;
        }
    });

    // ===== Boss 行为逻辑 =====
    const bossBullets = []; // Boss发射的炮弹（临时收集，加入bullets）
    enemies.filter(e => e.isBoss && !e.dead).forEach(boss => {
        const bossSkills = boss.skills || [];
        const hasSk = sk => bossSkills.includes(sk) || boss.bossTier >= 4;

        // ── 动态速度调整：Boss优先走路径，根据输赢目标和当前血量调整速度 ──
        {
            const data = getTowerData();
            const targetWin = data._battleTarget === 'win';
            const hpRatio = boss.hp / boss.maxHp;
            const baseSpd = boss._baseSpeed || 0.4;
            if (!targetWin) {
                // 输局：Boss要走出去，血量越低越加速（越危险越拼命冲）
                boss.speed = baseSpd * (1 + (1 - hpRatio) * 1.2);
            } else {
                // 赢局：Boss正常速度，血量低时略微减速（让炮台能打死它）
                boss.speed = baseSpd * (0.8 + hpRatio * 0.4);
            }
            // 被减速时不覆盖slowTimer效果（slowTimer里会乘slowFactor）
        }

        // ── 基础技能：向最近炮台射炮弹（所有Boss都有）──
        boss.shootTimer = (boss.shootTimer || 0) + 1;
        if (boss.shootTimer >= 300) {
            boss.shootTimer = 0;
            const target = towers.reduce((best, t) => {
                const d = Math.hypot(t.x*TILE+TILE/2 - boss.px, t.y*TILE+TILE/2 - boss.py);
                return (!best || d < best.dist) ? { tower: t, dist: d } : best;
            }, null);
            if (target) {
                bossBullets.push({ x: boss.px, y: boss.py, targetTower: target.tower,
                    speed: 4, dead: false, isBossBullet: true });
            }
        }

        // ── 技能1: bomb - 投掷炸弹，路径上随机位置爆炸 ──
        if (hasSk('bomb')) {
            boss.bombTimer = (boss.bombTimer || 0) + 1;
            if (boss.bombTimer >= 240) { // 4秒
                boss.bombTimer = 0;
                const pt = MAP_PATH[Math.floor(Math.random() * MAP_PATH.length)];
                const bx = pt.x*TILE+TILE/2, by = pt.y*TILE+TILE/2;
                // 延迟爆炸（1.5秒后）
                boss._pendingBombs = boss._pendingBombs || [];
                boss._pendingBombs.push({ x: bx, y: by, fuse: 90 });
            }
            boss._pendingBombs = (boss._pendingBombs || []).filter(bomb => {
                bomb.fuse--;
                if (bomb.fuse <= 0) {
                    enemies.forEach(e => {
                        if (e.dead || e.isBoss) return;
                        if (Math.hypot(e.px-bomb.x, e.py-bomb.y) < 55) {
                            e.hp -= e.maxHp * 0.25;
                            if (e.hp <= 0) e.dead = true;
                        }
                    });
                    for (let i = 0; i < 24; i++) {
                        const a = (i/24)*Math.PI*2, spd = 3+Math.random()*4;
                        particles.push({ x:bomb.x, y:bomb.y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
                            life:1.2, color: i%2===0?'#f97316':'#fbbf24', size:6+Math.random()*4 });
                    }
                    boss._bombFlash = { x:bomb.x, y:bomb.y, life:40 };
                    return false;
                }
                return true;
            });
        }

        // ── 技能2: spawn - 吐出普通敌人 ──
        if (hasSk('spawn')) {
            boss.spawnTimer = (boss.spawnTimer || 0) + 1;
            if (boss.spawnTimer >= 360) { // 6秒
                boss.spawnTimer = 0;
                const count = 2 + Math.floor(boss.bossTier / 2);
                for (let i = 0; i < count; i++) {
                    enemies.push({
                        hp: boss.maxHp * 0.08, maxHp: boss.maxHp * 0.08,
                        speed: 1.5 + Math.random()*0.5,
                        imgIdx: Math.floor(Math.random() * 11),
                        px: boss.px + (Math.random()-0.5)*30,
                        py: boss.py + (Math.random()-0.5)*30,
                        pathIdx: boss.pathIdx, progress: boss.progress,
                        dead: false,
                    });
                }
                for (let i = 0; i < 12; i++) {
                    const a = Math.random()*Math.PI*2;
                    particles.push({ x:boss.px, y:boss.py, vx:Math.cos(a)*3, vy:Math.sin(a)*3,
                        life:0.8, color:'#c084fc', size:4 });
                }
            }
        }

        // ── 技能3: dash - 突然向前冲2格 ──
        if (hasSk('dash')) {
            boss.dashTimer = (boss.dashTimer || 0) + 1;
            if (boss.dashTimer >= 420 && !boss.isDashing) { // 7秒
                boss.dashTimer = 0;
                boss.isDashing = true;
                boss.dashFrames = 20;
                // 向前跳2个路径节点
                const newIdx = Math.min(boss.pathIdx + 2, MAP_PATH.length - 1);
                boss.pathIdx = newIdx;
                boss.progress = 0;
                const pt = pathToPx(MAP_PATH[newIdx]);
                boss.px = pt.x; boss.py = pt.y;
                for (let i = 0; i < 16; i++) {
                    const a = Math.random()*Math.PI*2;
                    particles.push({ x:boss.px, y:boss.py, vx:Math.cos(a)*5, vy:Math.sin(a)*5,
                        life:0.6, color:'#fbbf24', size:5 });
                }
            }
            if (boss.isDashing) {
                boss.dashFrames--;
                if (boss.dashFrames <= 0) boss.isDashing = false;
            }
        }

        // ── 技能4: clone - 复制出一个小Boss ──
        if (hasSk('clone')) {
            boss.cloneTimer = (boss.cloneTimer || 0) + 1;
            if (boss.cloneTimer >= 600 && !boss.hasCloned) { // 10秒，只触发一次
                boss.cloneTimer = 0;
                boss.hasCloned = true;
                enemies.push({
                    hp: boss.maxHp * 0.35, maxHp: boss.maxHp * 0.35,
                    speed: boss.speed * 1.2,
                    imgIdx: boss.imgIdx,
                    px: boss.px + 30, py: boss.py + 30,
                    pathIdx: Math.max(0, boss.pathIdx - 1),
                    progress: 0, dead: false,
                    isBoss: true, isMiniClone: true,
                    bossStyle: (boss.bossStyle + 1) % 5,
                    bossTier: 1, skills: [],
                    shootTimer: 0,
                });
                for (let i = 0; i < 20; i++) {
                    const a = (i/20)*Math.PI*2;
                    particles.push({ x:boss.px, y:boss.py, vx:Math.cos(a)*4, vy:Math.sin(a)*4,
                        life:1, color:'#a78bfa', size:5 });
                }
            }
        }

        // ── 技能5: shield - 短暂无敌护盾 ──
        if (hasSk('shield')) {
            boss.shieldTimer = (boss.shieldTimer || 0) + 1;
            if (boss.shieldTimer >= 480) { // 8秒
                boss.shieldTimer = 0;
                boss.shieldActive = 120; // 护盾持续2秒
            }
            if (boss.shieldActive > 0) {
                boss.shieldActive--;
                boss.invincible = true;
                if (Math.random() < 0.3) {
                    const a = Math.random()*Math.PI*2, r = 30+Math.random()*10;
                    particles.push({ x:boss.px+Math.cos(a)*r, y:boss.py+Math.sin(a)*r,
                        vx:Math.cos(a)*0.5, vy:Math.sin(a)*0.5,
                        life:0.6, color:'#67e8f9', size:4 });
                }
            } else {
                boss.invincible = false;
            }
        }

        // ── 技能6: rage - 血量低于30%时狂暴，速度翻倍 ──
        if (hasSk('rage')) {
            if (boss.hp <= boss.maxHp * 0.3 && !boss.isRaging) {
                boss.isRaging = true;
                boss.speed *= 2;
                for (let i = 0; i < 20; i++) {
                    const a = Math.random()*Math.PI*2;
                    particles.push({ x:boss.px, y:boss.py, vx:Math.cos(a)*4, vy:Math.sin(a)*4,
                        life:1, color:'#ef4444', size:6 });
                }
            }
        }

        // ── 技能7: teleport - 随机传送到路径后方某处 ──
        if (hasSk('teleport')) {
            boss.teleportTimer = (boss.teleportTimer || 0) + 1;
            if (boss.teleportTimer >= 540) { // 9秒
                boss.teleportTimer = 0;
                const newIdx = Math.min(boss.pathIdx + 3 + Math.floor(Math.random()*3), MAP_PATH.length-1);
                boss.pathIdx = newIdx;
                boss.progress = 0;
                const pt = pathToPx(MAP_PATH[newIdx]);
                boss.px = pt.x; boss.py = pt.y;
                for (let i = 0; i < 16; i++) {
                    const a = (i/16)*Math.PI*2;
                    particles.push({ x:boss.px, y:boss.py, vx:Math.cos(a)*3, vy:Math.sin(a)*3,
                        life:0.8, color:'#38bdf8', size:4 });
                }
            }
        }

        // ── 技能8: poison_cloud - 释放毒云，范围内敌人（炮台）持续掉血 ──
        if (hasSk('poison_cloud')) {
            boss.poisonTimer2 = (boss.poisonTimer2 || 0) + 1;
            if (boss.poisonTimer2 >= 300) { // 5秒
                boss.poisonTimer2 = 0;
                boss._poisonCloud = { x: boss.px, y: boss.py, life: 180, radius: 70 };
            }
            if (boss._poisonCloud) {
                boss._poisonCloud.life--;
                const cloud = boss._poisonCloud;
                // 毒云伤害周围炮台
                towers.forEach(t => {
                    const tx2 = t.x*TILE+TILE/2, ty2 = t.y*TILE+TILE/2;
                    if (Math.hypot(tx2-cloud.x, ty2-cloud.y) < cloud.radius) {
                        t.hp = (t.hp !== undefined ? t.hp : 1) - 0.001;
                        if (t.hp < 0) t.hp = 0;
                    }
                });
                if (Math.random() < 0.2) {
                    const a = Math.random()*Math.PI*2, r = Math.random()*cloud.radius;
                    particles.push({ x:cloud.x+Math.cos(a)*r, y:cloud.y+Math.sin(a)*r,
                        vx:(Math.random()-0.5)*0.5, vy:-0.5,
                        life:1, color:'rgba(74,222,128,0.6)', size:8 });
                }
                if (boss._poisonCloud.life <= 0) boss._poisonCloud = null;
            }
        }

        // ── tier2 原有分裂逻辑 ──
        if (boss.bossTier >= 2 && !boss.hasSplit && boss.hp <= boss.maxHp * 0.5) {
            boss.hasSplit = true;
            const sp = pathToPx(MAP_PATH[Math.max(0, boss.pathIdx - 1)]);
            enemies.push({
                hp: boss.maxHp * 0.3, maxHp: boss.maxHp * 0.3,
                speed: 0.5, imgIdx: 1,
                px: boss.px + 20, py: boss.py + 20,
                pathIdx: boss.pathIdx, progress: boss.progress,
                dead: false, isBossChild: true, explodeTimer: 180,
            });
        }
    });

    // Boss子体：倒计时自爆
    enemies.filter(e => e.isBossChild && !e.dead).forEach(child => {
        child.explodeTimer--;
        if (child.explodeTimer <= 0) {
            child.dead = true;
            // 自爆：周边所有炮台减血1/5
            towers.forEach(t => {
                t.hp = (t.hp || 1) - 0.05; // 自爆减血1/20
                if (t.hp < 0) t.hp = 0;
            });
            // 自爆粒子
            for (let i = 0; i < 20; i++) {
                const a = Math.random()*Math.PI*2, spd = 3+Math.random()*5;
                particles.push({ x:child.px, y:child.py,
                    vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
                    life:1, color:'#f97316', size:6 });
            }
        }
    });

    // Boss炮弹移动
    bullets.push(...bossBullets);
    bullets.forEach(b => {
        if (!b.isBossBullet || b.dead) return;
        const tt = b.targetTower;
        const tx = tt.x*TILE+TILE/2, ty = tt.y*TILE+TILE/2;
        const dx = tx-b.x, dy = ty-b.y;
        const d = Math.hypot(dx, dy);
        if (d < b.speed) {
            b.dead = true;
            // 命中炮台：减血1/20
            tt.hp = (tt.hp !== undefined ? tt.hp : 1) - 0.05;
            if (tt.hp < 0) tt.hp = 0;
            // 命中粒子
            for (let i = 0; i < 10; i++) {
                const a = Math.random()*Math.PI*2, spd = 2+Math.random()*3;
                particles.push({ x:tx, y:ty,
                    vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
                    life:1, color:'#ef4444', size:4 });
            }
        } else {
            b.x += dx/d*b.speed;
            b.y += dy/d*b.speed;
        }
    });

    // ===== 特殊炮台逻辑 =====
    towers.filter(t => t.isSpecial).forEach(t => {
        const stype = SPECIAL_TOWERS[t.typeId];
        if (!stype) return;
        const cooldownFrames = (t.cooldownSec || 5) * 60;
        const activeFrames   = (t.activeSec  || 0) * 60;
        const tx = t.x*TILE+TILE/2, ty = t.y*TILE+TILE/2;

        switch (t.special) {
            case 'chain_zone': {
                // 铁链塔：范围内敌人每帧持续掉血（每帧0.5，约2秒杀死60HP敌人）
                enemies.forEach(e => {
                    if (e.dead) return;
                    if (Math.hypot(e.px-tx, e.py-ty) < t.range) {
                        e.hp -= 0.5;
                        if (Math.random() < 0.15) {
                            particles.push({ x:e.px+(Math.random()-0.5)*16, y:e.py,
                                vx:(Math.random()-0.5)*1.5, vy:-1.5,
                                life:0.8, color:'#94a3b8', size:2.5 });
                        }
                    }
                    if (e.hp <= 0) e.dead = true;
                });
                break;
            }
            case 'cursed_zone': {
                // 魔域塔：范围内敌人持续掉血，不减速
                enemies.forEach(e => {
                    if (e.dead) return;
                    if (Math.hypot(e.px-tx, e.py-ty) < t.range) {
                        e.hp -= 0.4;
                        if (Math.random() < 0.06) {
                            particles.push({ x:e.px+(Math.random()-0.5)*20, y:e.py,
                                vx:(Math.random()-0.5)*1.5, vy:-1,
                                life:0.8, color:'#c084fc', size:2.5 });
                        }
                    }
                    if (e.hp <= 0) e.dead = true;
                });
                break;
            }
            case 'shockwave': {
                // 冲击波：每15秒触发，从塔身发出扩散光圈，每秒扩大一圈
                // 光圈碰到敌人点火3秒，着火期间每帧掉当前血量的1/3÷180
                t.cooldownTimer = (t.cooldownTimer || 0) + 1;
                if (t.cooldownTimer >= cooldownFrames) {
                    t.cooldownTimer = 0;
                    // 发出5个光圈，每隔60帧（1秒）扩散一圈
                    t._rings = t._rings || [];
                    for (let i = 0; i < 5; i++) {
                        t._rings.push({ delay: i * 60, radius: 0, active: false, hit: new Set() });
                    }
                }
                // 更新光圈
                t._rings = (t._rings || []).filter(ring => {
                    ring.delay--;
                    if (ring.delay > 0) return true; // 还没到时间
                    ring.active = true;
                    ring.radius += 4; // 每帧扩大4px
                    // 检测光圈上的敌人（环形碰撞，厚度12px）
                    enemies.forEach(e => {
                        if (e.dead || ring.hit.has(e)) return;
                        const dist = Math.hypot(e.px - tx, e.py - ty);
                        if (Math.abs(dist - ring.radius) < 12) {
                            ring.hit.add(e);
                            e.fireTimer = 180; // 着火3秒
                            e.fireHp = e.hp;   // 记录点火时血量，用于计算总伤害
                        }
                    });
                    return ring.radius < 800; // 超出地图范围后消失
                });
                // 着火敌人持续掉血（3秒内总共掉点火时血量的1/3）
                enemies.forEach(e => {
                    if (e.dead || !e.fireTimer) return;
                    e.fireTimer--;
                    const dmgPerFrame = (e.fireHp || e.hp) / 3 / 180;
                    e.hp -= dmgPerFrame;
                    if (e.hp <= 0) e.dead = true;
                });
                break;
            }
            case 'groundbomb': {
                // 地破弹：每15秒在路上随机位置爆炸，命中敌人血量-1/3
                t.cooldownTimer = (t.cooldownTimer || 0) + 1;
                if (t.cooldownTimer >= cooldownFrames) {
                    t.cooldownTimer = 0;
                    const pathPt = MAP_PATH[Math.floor(Math.random() * MAP_PATH.length)];
                    const bx = pathPt.x*TILE+TILE/2, by = pathPt.y*TILE+TILE/2;
                    const bombR = t.range || 50;
                    enemies.forEach(e => {
                        if (e.dead) return;
                        if (Math.hypot(e.px-bx, e.py-by) < bombR) {
                            e.hp -= e.hp / 3;  // 当前血量的1/3
                            if (e.hp <= 0) e.dead = true;
                        }
                    });
                    // 爆炸粒子（更多更大）
                    for (let i = 0; i < 36; i++) {
                        const a = (i / 36) * Math.PI * 2;
                        const spd = 3 + Math.random() * 5;
                        particles.push({ x: bx, y: by,
                            vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
                            life: 1.2, color: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#a3e635' : '#f97316', size: 6 + Math.random()*5 });
                    }
                    // 记录爆炸位置，持续更长时间
                    t._bombFlash = { x: bx, y: by, life: 60 };
                }
                if (t._bombFlash) {
                    t._bombFlash.life--;
                    if (t._bombFlash.life <= 0) t._bombFlash = null;
                }
                break;
            }
            case 'teleport': break; // 已移除
        }
    });
    enemies = enemies.filter(e => !e.dead);

    // 动态难度：记录场上存活敌人的最大HP比例（越高说明当前配置越轻松）
    enemies.forEach(e => {
        if (e.dead || e.hp <= 0) return;
        const ratio = e.hp / e.maxHp;
        if (e.isBoss) _lastBossHpRatio = Math.max(_lastBossHpRatio, ratio);
        else _lastNormalHpRatio = Math.max(_lastNormalHpRatio, ratio);
    });

    if (spawnQueue.length === 0 && enemies.length === 0 && currentWave >= totalWaves)
        endBattle(true);
}

// ===== Boss实时动画绘制（5种）=====
function drawBossAnimated(g, e) {
    const t = Date.now() / 1000;
    const r = TILE * 0.7;
    g.save();
    g.translate(e.px, e.py);
    switch (e.bossStyle || 0) {
        case 0: drawBossDeathKing(g, r, t, e); break;
        case 1: drawBossDragon(g, r, t, e); break;
        case 2: drawBossGiantSpider(g, r, t, e); break;
        case 3: drawBossDemonLord(g, r, t, e); break;
        case 4: drawBossNecromancer(g, r, t, e); break;
    }
    g.restore();
    // 血条（所有Boss共用）
    const bw = TILE*1.4, bh = 9;
    const bx = e.px-bw/2, by = e.py-r-16;
    g.fillStyle = 'rgba(0,0,0,0.8)';
    g.fillRect(bx-1, by-1, bw+2, bh+2);
    const hpRatio = Math.max(0, e.hp/e.maxHp);
    g.fillStyle = hpRatio > 0.6 ? '#ef4444' : hpRatio > 0.3 ? '#f97316' : '#fbbf24';
    g.fillRect(bx, by, bw*hpRatio, bh);
    g.fillStyle = '#fff';
    g.font = 'bold 10px sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(`BOSS  ${Math.ceil(e.hp)}/${e.maxHp}`, e.px, by-7);

    // 护盾效果
    if (e.shieldActive > 0) {
        const sa = e.shieldActive / 120;
        g.save();
        g.globalAlpha = 0.5 + Math.sin(Date.now()/80)*0.2;
        g.strokeStyle = '#67e8f9'; g.lineWidth = 5;
        g.shadowColor = '#67e8f9'; g.shadowBlur = 20;
        g.beginPath(); g.arc(e.px, e.py, r*1.15, 0, Math.PI*2); g.stroke();
        g.globalAlpha = 0.15;
        g.fillStyle = '#67e8f9';
        g.beginPath(); g.arc(e.px, e.py, r*1.15, 0, Math.PI*2); g.fill();
        g.restore();
    }
    // 狂暴效果
    if (e.isRaging) {
        g.save();
        g.globalAlpha = 0.25 + Math.sin(Date.now()/60)*0.1;
        g.fillStyle = '#ef4444';
        g.beginPath(); g.arc(e.px, e.py, r*1.2, 0, Math.PI*2); g.fill();
        g.restore();
        g.fillStyle = '#ef4444';
        g.font = `bold ${TILE*0.28}px sans-serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('😡狂暴！', e.px, e.py - r - 28);
    }
    // 毒云效果
    if (e._poisonCloud) {
        const cloud = e._poisonCloud;
        const alpha = cloud.life / 180;
        g.save();
        g.globalAlpha = alpha * 0.35;
        g.fillStyle = '#4ade80';
        g.beginPath(); g.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI*2); g.fill();
        g.globalAlpha = alpha * 0.7;
        g.strokeStyle = '#16a34a'; g.lineWidth = 2;
        g.beginPath(); g.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI*2); g.stroke();
        g.restore();
    }
    // 待爆炸弹标记
    if (e._pendingBombs) {
        e._pendingBombs.forEach(bomb => {
            const prog = bomb.fuse / 90;
            g.save();
            g.globalAlpha = 0.8;
            g.fillStyle = prog > 0.5 ? '#fbbf24' : '#ef4444';
            g.shadowColor = '#f97316'; g.shadowBlur = 10 + (1-prog)*15;
            g.beginPath(); g.arc(bomb.x, bomb.y, 10 + (1-prog)*6, 0, Math.PI*2); g.fill();
            g.fillStyle = '#fff'; g.font = 'bold 10px sans-serif';
            g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText('💣', bomb.x, bomb.y);
            g.restore();
        });
    }
    // 炸弹爆炸闪光
    if (e._bombFlash) {
        e._bombFlash.life--;
        const prog = e._bombFlash.life / 40;
        g.save();
        g.globalAlpha = prog * 0.7;
        g.fillStyle = '#fbbf24';
        g.shadowColor = '#f97316'; g.shadowBlur = 20;
        g.beginPath(); g.arc(e._bombFlash.x, e._bombFlash.y, 55*(1-prog*0.5), 0, Math.PI*2); g.fill();
        g.restore();
        if (e._bombFlash.life <= 0) e._bombFlash = null;
    }
}

// Boss0: 死亡之王 - 骷髅王，皇冠，旋转骨头
function drawBossDeathKing(g, r, t, e) {
    // 旋转骨头光环
    g.strokeStyle = '#94a3b8'; g.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2 + t*1.2;
        const bx = Math.cos(a)*r*0.88, by = Math.sin(a)*r*0.88;
        g.save(); g.translate(bx, by); g.rotate(a + t*3);
        g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.stroke();
        g.beginPath(); g.arc(-8, 0, 3, 0, Math.PI*2); g.fill();
        g.beginPath(); g.arc(8, 0, 3, 0, Math.PI*2); g.fill();
        g.restore();
    }
    // 外圈
    g.shadowColor = '#7c3aed'; g.shadowBlur = 25 + Math.sin(t*2)*8;
    g.fillStyle = '#1e1b4b';
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 内圈
    g.fillStyle = '#312e81';
    g.beginPath(); g.arc(0, 0, r*0.78, 0, Math.PI*2); g.fill();
    // 骷髅脸
    g.fillStyle = '#e2e8f0';
    g.beginPath(); g.arc(0, r*0.05, r*0.42, 0, Math.PI*2); g.fill();
    // 眼眶
    g.fillStyle = '#0f172a';
    g.beginPath(); g.ellipse(-r*0.16, -r*0.02, r*0.12, r*0.15, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(r*0.16, -r*0.02, r*0.12, r*0.15, 0, 0, Math.PI*2); g.fill();
    // 眼眶火焰
    g.fillStyle = '#7c3aed'; g.shadowColor = '#7c3aed'; g.shadowBlur = 10;
    g.beginPath(); g.arc(-r*0.16, -r*0.02, r*0.07, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(r*0.16, -r*0.02, r*0.07, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 牙齿
    g.fillStyle = '#e2e8f0';
    for (let i = -3; i <= 3; i++) {
        g.beginPath(); g.rect(i*r*0.1-r*0.04, r*0.2, r*0.08, r*0.14); g.fill();
    }
    // 皇冠
    g.fillStyle = '#fbbf24'; g.shadowColor = '#fbbf24'; g.shadowBlur = 12;
    g.beginPath();
    g.moveTo(-r*0.44, -r*0.44);
    g.lineTo(-r*0.44, -r*0.62);
    g.lineTo(-r*0.22, -r*0.5);
    g.lineTo(0, -r*0.68);
    g.lineTo(r*0.22, -r*0.5);
    g.lineTo(r*0.44, -r*0.62);
    g.lineTo(r*0.44, -r*0.44);
    g.closePath(); g.fill();
    g.shadowBlur = 0;
}

// Boss1: 恶龙 - 鳞片，翅膀扇动，喷火
function drawBossDragon(g, r, t, e) {
    const wingFlap = Math.sin(t*4)*0.3;
    // 翅膀
    g.fillStyle = '#7f1d1d';
    g.save(); g.rotate(-wingFlap);
    g.beginPath(); g.moveTo(-r*0.1, -r*0.2);
    g.bezierCurveTo(-r*0.8, -r*0.8, -r*1.1, -r*0.2, -r*0.6, r*0.1);
    g.bezierCurveTo(-r*0.4, r*0.2, -r*0.2, r*0.1, -r*0.1, -r*0.2);
    g.fill(); g.restore();
    g.save(); g.rotate(wingFlap);
    g.beginPath(); g.moveTo(r*0.1, -r*0.2);
    g.bezierCurveTo(r*0.8, -r*0.8, r*1.1, -r*0.2, r*0.6, r*0.1);
    g.bezierCurveTo(r*0.4, r*0.2, r*0.2, r*0.1, r*0.1, -r*0.2);
    g.fill(); g.restore();
    // 身体
    g.shadowColor = '#dc2626'; g.shadowBlur = 20;
    g.fillStyle = '#991b1b';
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#dc2626';
    g.beginPath(); g.arc(0, 0, r*0.78, 0, Math.PI*2); g.fill();
    // 鳞片
    g.fillStyle = '#7f1d1d';
    for (let i = 0; i < 8; i++) {
        const a = (i/8)*Math.PI*2;
        g.beginPath(); g.ellipse(Math.cos(a)*r*0.5, Math.sin(a)*r*0.5, r*0.12, r*0.08, a, 0, Math.PI*2); g.fill();
    }
    // 龙头
    g.fillStyle = '#b91c1c';
    g.beginPath(); g.arc(0, 0, r*0.38, 0, Math.PI*2); g.fill();
    // 眼睛
    g.fillStyle = '#fbbf24'; g.shadowColor = '#fbbf24'; g.shadowBlur = 10;
    g.beginPath(); g.ellipse(-r*0.14, -r*0.08, r*0.1, r*0.13, -0.3, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(r*0.14, -r*0.08, r*0.1, r*0.13, 0.3, 0, Math.PI*2); g.fill();
    g.fillStyle = '#0f172a';
    g.beginPath(); g.ellipse(-r*0.14, -r*0.08, r*0.04, r*0.1, -0.3, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(r*0.14, -r*0.08, r*0.04, r*0.1, 0.3, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 喷火动画
    const firePhase = (t*3) % 1;
    g.fillStyle = `rgba(251,146,60,${0.8-firePhase*0.6})`;
    g.beginPath(); g.ellipse(0, r*0.3+firePhase*r*0.4, r*0.15*(1-firePhase*0.5), r*0.2*(1-firePhase*0.3), 0, 0, Math.PI*2); g.fill();
    // 角
    g.fillStyle = '#fbbf24';
    g.beginPath(); g.moveTo(-r*0.12, -r*0.36); g.lineTo(-r*0.22, -r*0.62); g.lineTo(-r*0.04, -r*0.38); g.fill();
    g.beginPath(); g.moveTo(r*0.12, -r*0.36); g.lineTo(r*0.22, -r*0.62); g.lineTo(r*0.04, -r*0.38); g.fill();
}

// Boss2: 巨型蜘蛛 - 多腿，毒液
function drawBossGiantSpider(g, r, t, e) {
    // 8条大腿
    g.strokeStyle = '#1e1b4b'; g.lineWidth = r*0.12; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
        const side = i < 2 ? -1 : 1;
        const legIdx = i % 2;
        const legY = -r*0.1 + legIdx*r*0.28;
        const lift = Math.sin(t*6 + i*Math.PI/2)*r*0.18;
        g.beginPath(); g.moveTo(side*r*0.4, legY);
        g.lineTo(side*r*0.75, legY - r*0.2 + lift);
        g.lineTo(side*r*1.0, legY + r*0.2); g.stroke();
    }
    // 腹部
    g.shadowColor = '#4c1d95'; g.shadowBlur = 18;
    g.fillStyle = '#2e1065';
    g.beginPath(); g.ellipse(0, r*0.15, r*0.65, r*0.82, 0, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 腹部花纹（沙漏）
    g.fillStyle = '#ef4444';
    g.beginPath(); g.moveTo(0, -r*0.1); g.lineTo(r*0.2, r*0.2); g.lineTo(-r*0.2, r*0.2); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(0, r*0.4); g.lineTo(r*0.2, r*0.2); g.lineTo(-r*0.2, r*0.2); g.closePath(); g.fill();
    // 头胸
    g.fillStyle = '#3b0764';
    g.beginPath(); g.arc(0, -r*0.3, r*0.36, 0, Math.PI*2); g.fill();
    // 8只眼睛
    g.fillStyle = '#4ade80'; g.shadowColor = '#4ade80'; g.shadowBlur = 8;
    const sEyes = [[-r*0.18,-r*0.36],[r*0.18,-r*0.36],[-r*0.28,-r*0.28],[r*0.28,-r*0.28],
                   [-r*0.1,-r*0.24],[r*0.1,-r*0.24],[0,-r*0.4],[-r*0.06,-r*0.2]];
    sEyes.forEach(([ex,ey]) => {
        g.beginPath(); g.arc(ex, ey, r*0.05, 0, Math.PI*2); g.fill();
    });
    g.shadowBlur = 0;
    // 毒液滴落
    const dp = (t*2) % 1;
    g.fillStyle = `rgba(74,222,128,${0.8-dp*0.6})`;
    g.beginPath(); g.arc(0, r*0.9+dp*r*0.3, r*0.06*(1-dp*0.5), 0, Math.PI*2); g.fill();
}

// Boss3: 恶魔领主 - 翅膀+火焰光环
function drawBossDemonLord(g, r, t, e) {
    // 火焰光环
    for (let i = 0; i < 12; i++) {
        const a = (i/12)*Math.PI*2 + t*2;
        const fr = r*0.9 + Math.sin(t*8+i)*r*0.1;
        const fh = r*0.2 + Math.random()*r*0.1;
        g.fillStyle = `rgba(239,68,68,${0.3+Math.sin(t*6+i)*0.2})`;
        g.beginPath(); g.ellipse(Math.cos(a)*fr, Math.sin(a)*fr, r*0.08, fh, a, 0, Math.PI*2); g.fill();
    }
    // 身体
    g.shadowColor = '#dc2626'; g.shadowBlur = 22;
    g.fillStyle = '#450a0a';
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#7f1d1d';
    g.beginPath(); g.arc(0, 0, r*0.78, 0, Math.PI*2); g.fill();
    // 脸
    g.fillStyle = '#991b1b';
    g.beginPath(); g.arc(0, r*0.05, r*0.44, 0, Math.PI*2); g.fill();
    // 眼睛（白色发光）
    g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 12;
    g.beginPath(); g.ellipse(-r*0.16, -r*0.04, r*0.12, r*0.08, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(r*0.16, -r*0.04, r*0.12, r*0.08, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = '#dc2626';
    g.beginPath(); g.arc(-r*0.16, -r*0.04, r*0.06, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(r*0.16, -r*0.04, r*0.06, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 獠牙
    g.fillStyle = '#f1f5f9';
    g.beginPath(); g.moveTo(-r*0.1, r*0.18); g.lineTo(-r*0.16, r*0.34); g.lineTo(-r*0.04, r*0.18); g.fill();
    g.beginPath(); g.moveTo(r*0.1, r*0.18); g.lineTo(r*0.16, r*0.34); g.lineTo(r*0.04, r*0.18); g.fill();
    // 角（弯曲）
    g.strokeStyle = '#fbbf24'; g.lineWidth = r*0.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-r*0.24, -r*0.38); g.quadraticCurveTo(-r*0.5, -r*0.7, -r*0.2, -r*0.78); g.stroke();
    g.beginPath(); g.moveTo(r*0.24, -r*0.38); g.quadraticCurveTo(r*0.5, -r*0.7, r*0.2, -r*0.78); g.stroke();
}

// Boss4: 亡灵法师 - 法杖，骷髅召唤
function drawBossNecromancer(g, r, t, e) {
    // 旋转骷髅光环
    for (let i = 0; i < 4; i++) {
        const a = (i/4)*Math.PI*2 + t*1.5;
        const ox = Math.cos(a)*r*0.85, oy = Math.sin(a)*r*0.85;
        g.save(); g.translate(ox, oy); g.scale(0.5, 0.5);
        g.fillStyle = '#e2e8f0';
        g.beginPath(); g.arc(0, 0, r*0.3, 0, Math.PI*2); g.fill();
        g.fillStyle = '#0f172a';
        g.beginPath(); g.ellipse(-r*0.1, -r*0.04, r*0.08, r*0.1, 0, 0, Math.PI*2); g.fill();
        g.beginPath(); g.ellipse(r*0.1, -r*0.04, r*0.08, r*0.1, 0, 0, Math.PI*2); g.fill();
        g.restore();
    }
    // 长袍
    g.shadowColor = '#065f46'; g.shadowBlur = 18;
    g.fillStyle = '#022c22';
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#064e3b';
    g.beginPath(); g.arc(0, 0, r*0.78, 0, Math.PI*2); g.fill();
    // 骷髅脸
    g.fillStyle = '#d1fae5';
    g.beginPath(); g.arc(0, r*0.05, r*0.38, 0, Math.PI*2); g.fill();
    g.fillStyle = '#0f172a';
    g.beginPath(); g.ellipse(-r*0.14, -r*0.02, r*0.1, r*0.13, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(r*0.14, -r*0.02, r*0.1, r*0.13, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = '#34d399'; g.shadowColor = '#34d399'; g.shadowBlur = 8;
    g.beginPath(); g.arc(-r*0.14, -r*0.02, r*0.06, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(r*0.14, -r*0.02, r*0.06, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 牙齿
    g.fillStyle = '#d1fae5';
    for (let i = -2; i <= 2; i++) {
        g.beginPath(); g.rect(i*r*0.1-r*0.04, r*0.16, r*0.08, r*0.1); g.fill();
    }
    // 法杖（旋转）
    g.save(); g.rotate(Math.sin(t*2)*0.2);
    g.strokeStyle = '#a7f3d0'; g.lineWidth = r*0.07;
    g.beginPath(); g.moveTo(r*0.3, r*0.3); g.lineTo(r*0.7, -r*0.5); g.stroke();
    g.fillStyle = '#34d399'; g.shadowColor = '#34d399'; g.shadowBlur = 14+Math.sin(t*4)*6;
    g.beginPath(); g.arc(r*0.7, -r*0.5, r*0.12, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    g.restore();
}

// ===== 敌人实时动画绘制 =====
// 8种僵尸风格，每种有独特动作
const ENEMY_PALETTES = [
    { body:'#6b7c4a', skin:'#c8b89a', detail:'#3d4a2a' }, // 0 僵尸士兵
    { body:'#7c3d3d', skin:'#d4a0a0', detail:'#4a1a1a' }, // 1 血腥僵尸
    { body:'#4a3d6b', skin:'#b8a8d4', detail:'#2a1a4a' }, // 2 巫毒僵尸
    { body:'#3d6b5a', skin:'#a8d4c8', detail:'#1a4a3a' }, // 3 沼泽怪
    { body:'#6b5a3d', skin:'#d4c8a8', detail:'#4a3a1a' }, // 4 木乃伊
    { body:'#3d3d6b', skin:'#a8a8d4', detail:'#1a1a4a' }, // 5 骷髅法师
    { body:'#6b3d5a', skin:'#d4a8c8', detail:'#4a1a3a' }, // 6 蜘蛛女王
    { body:'#5a6b3d', skin:'#c8d4a8', detail:'#3a4a1a' }, // 7 毒液怪
    { body:'#4a7c3f', skin:'#fde68a', detail:'#1f2937' }, // 8 坦克僵尸（原tank）
    { body:'#c8392b', skin:'#fde68a', detail:'#7f1d1d' }, // 9 士兵僵尸（原soldier）
    { body:'#818cf8', skin:'#a78bfa', detail:'#fbbf24' }, // 10 UFO（原ufo）
];

function drawEnemyAnimated(g, e) {
    const t = Date.now() / 1000;
    const pal = ENEMY_PALETTES[e.imgIdx] || ENEMY_PALETTES[0];
    const cx = e.px, cy = e.py;
    const s = TILE * 0.55;
    const hurt = e.hp / e.maxHp < 0.3;

    g.save();
    g.translate(cx, cy);

    // 漂浮类（2=巫毒, 5=骷髅法师, 10=UFO）不做外层摇摆
    const floatTypes = [2, 5, 10];
    if (!floatTypes.includes(e.imgIdx)) {
        const walk = Math.sin(t * 8 + e.pathIdx * 0.5) * 0.12;
        g.rotate(walk);
    }

    switch (e.imgIdx) {
        case 0:  drawZombieSoldier(g, s, t, pal, hurt); break;
        case 1:  drawBloodyZombie(g, s, t, pal, hurt); break;
        case 2:  drawVoodooZombie(g, s, t, pal, hurt); break;
        case 3:  drawSwampMonster(g, s, t, pal, hurt); break;
        case 4:  drawMummy(g, s, t, pal, hurt); break;
        case 5:  drawSkullMage(g, s, t, pal, hurt); break;
        case 6:  drawSpiderQueen(g, s, t, pal, hurt); break;
        case 7:  drawSlimeBeast(g, s, t, pal, hurt); break;
        case 8:  drawTankZombie(g, s, t, pal, hurt); break;
        case 9:  drawSoldierZombie(g, s, t, pal, hurt); break;
        case 10: drawUFOEnemy(g, s, t, pal, hurt); break;
        default: drawZombieSoldier(g, s, t, pal, hurt);
    }

    g.restore();
}

// 0: 僵尸士兵 - 直立行走，双臂前伸，头部左右摇摆
function drawZombieSoldier(g, s, t, pal, hurt) {
    const legSwing = Math.sin(t * 6);
    const headWag = Math.sin(t * 3) * 0.18; // 头部左右摇摆（独特动作）
    // 腿（交替摆动）
    g.strokeStyle = pal.body; g.lineWidth = s*0.18; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-s*0.12, s*0.1); g.lineTo(-s*0.18 + legSwing*s*0.12, s*0.44); g.stroke();
    g.beginPath(); g.moveTo(s*0.12, s*0.1); g.lineTo(s*0.18 - legSwing*s*0.12, s*0.44); g.stroke();
    // 身体
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath(); g.roundRect(-s*0.22, -s*0.18, s*0.44, s*0.32, s*0.06); g.fill();
    // 双臂水平前伸（经典僵尸姿势）
    g.strokeStyle = pal.skin; g.lineWidth = s*0.14;
    g.beginPath(); g.moveTo(-s*0.22, -s*0.06); g.lineTo(-s*0.52, -s*0.06); g.stroke();
    g.beginPath(); g.moveTo(s*0.22, -s*0.06); g.lineTo(s*0.52, -s*0.06); g.stroke();
    // 手掌
    g.fillStyle = pal.skin;
    g.beginPath(); g.arc(-s*0.52, -s*0.06, s*0.07, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.52, -s*0.06, s*0.07, 0, Math.PI*2); g.fill();
    // 头（左右摇摆）
    g.save(); g.translate(0, -s*0.32); g.rotate(headWag);
    g.fillStyle = pal.skin;
    g.beginPath(); g.arc(0, 0, s*0.2, 0, Math.PI*2); g.fill();
    // 红眼
    g.fillStyle = '#ef4444'; g.shadowColor = '#ef4444'; g.shadowBlur = 6;
    g.beginPath(); g.arc(-s*0.08, -s*0.02, s*0.05, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.08, -s*0.02, s*0.05, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 龇牙
    g.fillStyle = '#fff';
    g.beginPath(); g.rect(-s*0.08, s*0.06, s*0.04, s*0.05); g.fill();
    g.beginPath(); g.rect(s*0.04, s*0.06, s*0.04, s*0.05); g.fill();
    g.restore();
}

// 1: 血腥僵尸 - 四肢爬行，低矮贴地，完全不同于直立行走
function drawBloodyZombie(g, s, t, pal, hurt) {
    const crawl = Math.sin(t * 7);
    // 爬行姿势：身体水平，低矮
    g.save(); g.translate(0, s*0.1);
    // 四肢（爬行交替）
    g.strokeStyle = pal.skin; g.lineWidth = s*0.14; g.lineCap = 'round';
    // 左前臂
    g.beginPath(); g.moveTo(-s*0.18, -s*0.06); g.lineTo(-s*0.42, -s*0.06 + crawl*s*0.1); g.stroke();
    // 右前臂
    g.beginPath(); g.moveTo(s*0.18, -s*0.06); g.lineTo(s*0.42, -s*0.06 - crawl*s*0.1); g.stroke();
    // 左后腿
    g.strokeStyle = pal.body;
    g.beginPath(); g.moveTo(-s*0.16, s*0.08); g.lineTo(-s*0.38, s*0.22 - crawl*s*0.08); g.stroke();
    // 右后腿
    g.beginPath(); g.moveTo(s*0.16, s*0.08); g.lineTo(s*0.38, s*0.22 + crawl*s*0.08); g.stroke();
    // 身体（扁平横向）
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath(); g.ellipse(0, 0, s*0.26, s*0.14, 0, 0, Math.PI*2); g.fill();
    // 血迹
    g.fillStyle = '#dc2626';
    g.beginPath(); g.ellipse(-s*0.08, s*0.04, s*0.06, s*0.04, 0.3, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(s*0.1, -s*0.02, s*0.04, s*0.03, -0.2, 0, Math.PI*2); g.fill();
    // 头（向前伸，贴地）
    g.save(); g.translate(-s*0.32, -s*0.04);
    g.fillStyle = pal.skin;
    g.beginPath(); g.ellipse(0, 0, s*0.18, s*0.14, 0, 0, Math.PI*2); g.fill();
    // 空洞眼睛
    g.fillStyle = '#1a0000';
    g.beginPath(); g.arc(-s*0.06, -s*0.02, s*0.06, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.06, -s*0.02, s*0.06, 0, Math.PI*2); g.fill();
    g.fillStyle = '#ef4444';
    g.beginPath(); g.arc(-s*0.06, -s*0.02, s*0.03, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.06, -s*0.02, s*0.03, 0, Math.PI*2); g.fill();
    // 滴血
    const dropY = ((t * 60) % 30) / 30;
    g.fillStyle = '#dc2626';
    g.beginPath(); g.arc(0, s*0.1 + dropY*s*0.2, s*0.03*(1-dropY*0.5), 0, Math.PI*2); g.fill();
    g.restore();
    g.restore();
}

// 2: 巫毒僵尸 - 漂浮移动，无腿，身体上下浮动，双手持旋转魔法球
function drawVoodooZombie(g, s, t, pal, hurt) {
    const float = Math.sin(t * 2.5) * s * 0.08; // 上下浮动
    const orbAngle = t * 2.5; // 魔法球旋转角度
    g.translate(0, float);
    // 紫色光晕
    g.shadowColor = '#a78bfa'; g.shadowBlur = 14 + Math.sin(t*3)*5;
    // 长袍（无腿，底部渐隐）
    const robeGrad = g.createLinearGradient(0, -s*0.2, 0, s*0.4);
    robeGrad.addColorStop(0, hurt ? '#ef4444' : pal.body);
    robeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = robeGrad;
    g.beginPath();
    g.moveTo(-s*0.24, -s*0.18);
    g.bezierCurveTo(-s*0.32, s*0.1, -s*0.28, s*0.3, 0, s*0.42);
    g.bezierCurveTo(s*0.28, s*0.3, s*0.32, s*0.1, s*0.24, -s*0.18);
    g.closePath(); g.fill();
    g.shadowBlur = 0;
    // 旋转魔法球（绕身体旋转）
    const orb1x = Math.cos(orbAngle) * s*0.44;
    const orb1y = Math.sin(orbAngle) * s*0.18;
    const orb2x = Math.cos(orbAngle + Math.PI) * s*0.44;
    const orb2y = Math.sin(orbAngle + Math.PI) * s*0.18;
    g.fillStyle = '#c084fc'; g.shadowColor = '#c084fc'; g.shadowBlur = 12;
    g.beginPath(); g.arc(orb1x, orb1y, s*0.08, 0, Math.PI*2); g.fill();
    g.fillStyle = '#f0abfc';
    g.beginPath(); g.arc(orb2x, orb2y, s*0.08, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 手臂（向两侧展开）
    g.strokeStyle = pal.skin; g.lineWidth = s*0.12; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-s*0.24, -s*0.06); g.lineTo(orb1x*0.8, orb1y*0.8); g.stroke();
    g.beginPath(); g.moveTo(s*0.24, -s*0.06); g.lineTo(orb2x*0.8, orb2y*0.8); g.stroke();
    // 头
    g.fillStyle = pal.skin;
    g.beginPath(); g.arc(0, -s*0.3, s*0.19, 0, Math.PI*2); g.fill();
    // 插针
    g.strokeStyle = '#fbbf24'; g.lineWidth = 1.5;
    [-s*0.08, 0, s*0.08].forEach(nx => {
        g.beginPath(); g.moveTo(nx, -s*0.46); g.lineTo(nx, -s*0.3); g.stroke();
        g.fillStyle = '#fbbf24';
        g.beginPath(); g.arc(nx, -s*0.46, 2.5, 0, Math.PI*2); g.fill();
    });
    // 眼睛（紫色发光）
    g.fillStyle = '#c084fc'; g.shadowColor = '#c084fc'; g.shadowBlur = 8;
    g.beginPath(); g.arc(-s*0.07, -s*0.32, s*0.05, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.07, -s*0.32, s*0.05, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
}

// 3: 沼泽怪 - 纯液态，无四肢，身体形状不断变形蠕动
function drawSwampMonster(g, s, t, pal, hurt) {
    const b1 = Math.sin(t * 2.8) * s * 0.06;
    const b2 = Math.cos(t * 3.2) * s * 0.05;
    const b3 = Math.sin(t * 2.1 + 1) * s * 0.07;
    // 黏液拖尾
    g.fillStyle = 'rgba(74,222,128,0.2)';
    g.beginPath(); g.ellipse(s*0.12, s*0.36, s*0.18, s*0.07, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(-s*0.06, s*0.42, s*0.1, s*0.05, 0, 0, Math.PI*2); g.fill();
    // 身体（不规则变形blob）
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath();
    g.moveTo(0, -s*0.36 + b1);
    g.bezierCurveTo(s*0.36 + b2, -s*0.28, s*0.32 + b3, s*0.12, s*0.08, s*0.34);
    g.bezierCurveTo(0, s*0.4, -s*0.16, s*0.38, -s*0.12, s*0.3);
    g.bezierCurveTo(-s*0.38 + b1, s*0.1, -s*0.34 - b2, -s*0.24, 0, -s*0.36 + b1);
    g.fill();
    // 内部气泡（上浮动画）
    g.fillStyle = 'rgba(200,255,200,0.35)';
    for (let i = 0; i < 3; i++) {
        const phase = ((t * 0.8 + i * 0.33) % 1);
        const bx = (i - 1) * s * 0.14;
        const by = s*0.2 - phase * s*0.5;
        const br = s*0.04 + i*s*0.02;
        if (phase < 0.9) { g.beginPath(); g.arc(bx, by, br, 0, Math.PI*2); g.fill(); }
    }
    // 3只眼睛（随机位置，眨眼）
    const eyeData = [[-s*0.1,-s*0.1,t],[s*0.12,-s*0.06,t+1],[0,s*0.06,t+2]];
    eyeData.forEach(([ex,ey,et]) => {
        const blink = Math.abs(Math.sin(et * 1.5)) > 0.1;
        g.fillStyle = '#fbbf24'; g.shadowColor = '#fbbf24'; g.shadowBlur = 6;
        g.beginPath(); g.arc(ex, ey, s*0.07, 0, Math.PI*2); g.fill();
        g.shadowBlur = 0;
        if (blink) {
            g.fillStyle = '#1a0a00';
            g.beginPath(); g.arc(ex, ey, s*0.04, 0, Math.PI*2); g.fill();
        } else {
            // 眨眼：画一条线
            g.strokeStyle = pal.body; g.lineWidth = s*0.07;
            g.beginPath(); g.moveTo(ex-s*0.07, ey); g.lineTo(ex+s*0.07, ey); g.stroke();
        }
    });
}

// 4: 木乃伊 - 僵硬直立，整体左右大幅倾斜（像要倒下），绷带飘动
function drawMummy(g, s, t, pal, hurt) {
    const tilt = Math.sin(t * 1.8) * 0.28; // 大幅倾斜（像要倒下）
    g.save(); g.rotate(tilt);
    // 腿（僵硬，几乎不弯）
    g.strokeStyle = pal.skin; g.lineWidth = s*0.18; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-s*0.1, s*0.1); g.lineTo(-s*0.11, s*0.44); g.stroke();
    g.beginPath(); g.moveTo(s*0.1, s*0.1); g.lineTo(s*0.13, s*0.44); g.stroke();
    // 身体（绷带缠绕）
    g.fillStyle = hurt ? '#ef4444' : pal.skin;
    g.beginPath(); g.roundRect(-s*0.22, -s*0.2, s*0.44, s*0.34, s*0.04); g.fill();
    // 绷带横条
    g.strokeStyle = pal.detail; g.lineWidth = s*0.05;
    for (let i = 0; i < 5; i++) {
        const y = -s*0.18 + i*s*0.09;
        const offset = Math.sin(t*2 + i*0.8) * s*0.03;
        g.beginPath(); g.moveTo(-s*0.22, y+offset); g.lineTo(s*0.22, y-offset); g.stroke();
    }
    // 飘动绷带（从身体飘出）
    g.strokeStyle = pal.detail; g.lineWidth = s*0.04; g.lineCap = 'round';
    const bandWave = Math.sin(t*4) * s*0.08;
    g.beginPath();
    g.moveTo(s*0.22, -s*0.1);
    g.quadraticCurveTo(s*0.38, -s*0.2 + bandWave, s*0.5, -s*0.1 + bandWave*1.5);
    g.stroke();
    g.beginPath();
    g.moveTo(-s*0.22, s*0.0);
    g.quadraticCurveTo(-s*0.36, s*0.1 - bandWave, -s*0.48, s*0.0 - bandWave);
    g.stroke();
    // 手臂（僵直前伸）
    g.strokeStyle = pal.skin; g.lineWidth = s*0.14;
    g.beginPath(); g.moveTo(-s*0.22, -s*0.08); g.lineTo(-s*0.46, -s*0.06); g.stroke();
    g.beginPath(); g.moveTo(s*0.22, -s*0.08); g.lineTo(s*0.46, -s*0.06); g.stroke();
    // 头（绷带缠绕）
    g.fillStyle = pal.skin;
    g.beginPath(); g.arc(0, -s*0.32, s*0.2, 0, Math.PI*2); g.fill();
    g.strokeStyle = pal.detail; g.lineWidth = s*0.05;
    g.beginPath(); g.moveTo(-s*0.2, -s*0.28); g.lineTo(s*0.2, -s*0.36); g.stroke();
    g.beginPath(); g.moveTo(-s*0.18, -s*0.38); g.lineTo(s*0.18, -s*0.3); g.stroke();
    g.beginPath(); g.moveTo(-s*0.14, -s*0.44); g.lineTo(s*0.14, -s*0.38); g.stroke();
    // 一只发光眼（另一只被绷带遮住）
    g.fillStyle = '#fbbf24'; g.shadowColor = '#fbbf24'; g.shadowBlur = 10;
    g.beginPath(); g.arc(s*0.07, -s*0.34, s*0.06, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    g.restore();
}

// 5: 骷髅法师 - 漂浮，骨架各部位分离旋转，骷髅头独立旋转
function drawSkullMage(g, s, t, pal, hurt) {
    const float = Math.sin(t * 2.2) * s * 0.07;
    g.translate(0, float);
    // 漂浮粒子
    g.fillStyle = 'rgba(167,139,250,0.3)';
    for (let i = 0; i < 4; i++) {
        const a = (i/4)*Math.PI*2 + t*1.2;
        const r = s*0.38 + Math.sin(t*3+i)*s*0.06;
        g.beginPath(); g.arc(Math.cos(a)*r, Math.sin(a)*r*0.5, s*0.04, 0, Math.PI*2); g.fill();
    }
    // 分离的骨架手臂（各自旋转）
    g.save(); g.translate(-s*0.3, -s*0.06); g.rotate(Math.sin(t*2)*0.4);
    g.strokeStyle = '#e2e8f0'; g.lineWidth = s*0.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0,0); g.lineTo(-s*0.22, s*0.08); g.stroke();
    g.beginPath(); g.moveTo(-s*0.22, s*0.08); g.lineTo(-s*0.36, -s*0.04); g.stroke();
    g.restore();
    g.save(); g.translate(s*0.3, -s*0.06); g.rotate(Math.sin(t*2+1)*0.4);
    g.strokeStyle = '#e2e8f0'; g.lineWidth = s*0.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0,0); g.lineTo(s*0.22, s*0.08); g.stroke();
    g.beginPath(); g.moveTo(s*0.22, s*0.08); g.lineTo(s*0.36, -s*0.04); g.stroke();
    g.restore();
    // 魔法杖（发光）
    g.strokeStyle = '#fbbf24'; g.lineWidth = s*0.06; g.lineCap = 'round';
    g.beginPath(); g.moveTo(s*0.3, -s*0.06); g.lineTo(s*0.52, -s*0.42); g.stroke();
    g.fillStyle = '#c084fc'; g.shadowColor = '#c084fc'; g.shadowBlur = 14+Math.sin(t*4)*5;
    g.beginPath(); g.arc(s*0.52, -s*0.42, s*0.09, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 长袍
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath();
    g.moveTo(-s*0.22, -s*0.16);
    g.bezierCurveTo(-s*0.28, s*0.1, -s*0.2, s*0.16, 0, s*0.16);
    g.bezierCurveTo(s*0.2, s*0.16, s*0.28, s*0.1, s*0.22, -s*0.16);
    g.closePath(); g.fill();
    // 骷髅头（独立旋转）
    g.save(); g.translate(0, -s*0.32); g.rotate(Math.sin(t*1.5)*0.15);
    g.fillStyle = '#f1f5f9';
    g.beginPath(); g.arc(0, 0, s*0.2, 0, Math.PI*2); g.fill();
    // 眼眶（空洞+火焰）
    g.fillStyle = '#0f172a';
    g.beginPath(); g.ellipse(-s*0.08, -s*0.02, s*0.07, s*0.09, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(s*0.08, -s*0.02, s*0.07, s*0.09, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = '#a78bfa'; g.shadowColor = '#a78bfa'; g.shadowBlur = 8;
    g.beginPath(); g.arc(-s*0.08, -s*0.02, s*0.04, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.08, -s*0.02, s*0.04, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 牙齿
    g.fillStyle = '#f1f5f9';
    for (let i = -2; i <= 2; i++) {
        g.beginPath(); g.rect(i*s*0.05-s*0.02, s*0.1, s*0.04, s*0.07); g.fill();
    }
    g.restore();
}

// 6: 蜘蛛女王 - 低矮爬行，8条腿交替，腹部拖地
function drawSpiderQueen(g, s, t, pal, hurt) {
    // 整体压低（腹部拖地）
    g.translate(0, s*0.1);
    // 8条腿（4对，交替抬起）
    g.strokeStyle = pal.detail; g.lineWidth = s*0.09; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
        const side = i < 2 ? -1 : 1;
        const legIdx = i % 2;
        const baseY = -s*0.04 + legIdx * s*0.12;
        const lift = Math.sin(t * 9 + i * Math.PI * 0.5) * s*0.12;
        const spread = s * (0.28 + legIdx * 0.08);
        // 大腿
        g.beginPath(); g.moveTo(side*s*0.2, baseY);
        g.lineTo(side*spread, baseY - s*0.14 + lift); g.stroke();
        // 小腿（向下弯）
        g.beginPath(); g.moveTo(side*spread, baseY - s*0.14 + lift);
        g.lineTo(side*(spread + s*0.14), baseY + s*0.1); g.stroke();
    }
    // 腹部（大，拖地）
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath(); g.ellipse(s*0.06, s*0.14, s*0.24, s*0.3, 0.1, 0, Math.PI*2); g.fill();
    // 腹部花纹（沙漏形）
    g.fillStyle = '#ef4444';
    g.beginPath(); g.ellipse(s*0.06, s*0.14, s*0.08, s*0.14, 0, 0, Math.PI*2); g.fill();
    // 头胸部（小）
    g.fillStyle = pal.body;
    g.beginPath(); g.arc(-s*0.06, -s*0.12, s*0.16, 0, Math.PI*2); g.fill();
    // 8只眼睛（排列在头部）
    g.fillStyle = '#ef4444'; g.shadowColor = '#ef4444'; g.shadowBlur = 4;
    const eyePos = [[-s*0.12,-s*0.18],[s*0.0,-s*0.18],[-s*0.18,-s*0.12],[s*0.06,-s*0.12],
                    [-s*0.14,-s*0.06],[s*0.02,-s*0.06],[-s*0.08,-s*0.22],[s*0.0,-s*0.08]];
    eyePos.forEach(([ex,ey]) => {
        g.beginPath(); g.arc(ex, ey, s*0.03, 0, Math.PI*2); g.fill();
    });
    g.shadowBlur = 0;
    // 毒牙（下垂）
    g.fillStyle = '#4ade80';
    g.beginPath(); g.moveTo(-s*0.1, -s*0.04); g.lineTo(-s*0.14, s*0.06); g.lineTo(-s*0.06, s*0.02); g.fill();
    g.beginPath(); g.moveTo(s*0.0, -s*0.04); g.lineTo(-s*0.04, s*0.06); g.lineTo(s*0.04, s*0.02); g.fill();
}

// 7: 毒液怪 - 液态水滴形，不断分裂又合并
function drawSlimeBeast(g, s, t, pal, hurt) {
    const split = (Math.sin(t * 2.5) + 1) / 2; // 0~1 分裂程度
    const pulse = Math.sin(t * 4) * s * 0.03;
    // 毒液滴落
    const dropPhase = (t * 1.8) % 1;
    g.fillStyle = 'rgba(74,222,128,0.4)';
    g.beginPath(); g.arc(s*0.06, s*0.3 + dropPhase*s*0.25, s*0.05*(1-dropPhase*0.7), 0, Math.PI*2); g.fill();
    // 主体（水滴形）
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath();
    g.moveTo(0, -s*0.38);
    g.bezierCurveTo(s*0.28+pulse, -s*0.28, s*0.3, s*0.08, s*0.12, s*0.3);
    g.bezierCurveTo(0, s*0.4, -s*0.12, s*0.4, -s*0.12, s*0.3);
    g.bezierCurveTo(-s*0.3, s*0.08, -s*0.28-pulse, -s*0.28, 0, -s*0.38);
    g.fill();
    // 分裂的小球（从顶部分离）
    if (split > 0.3) {
        const splitOff = split * s * 0.2;
        g.fillStyle = hurt ? '#ef4444' : pal.detail;
        g.globalAlpha = split;
        g.beginPath(); g.arc(-s*0.1, -s*0.36 - splitOff, s*0.1 * split, 0, Math.PI*2); g.fill();
        g.beginPath(); g.arc(s*0.1, -s*0.36 - splitOff, s*0.1 * split, 0, Math.PI*2); g.fill();
        g.globalAlpha = 1;
    }
    // 内部气泡
    g.fillStyle = 'rgba(255,255,255,0.25)';
    [[-s*0.1,-s*0.1,0],[s*0.08,s*0.04,1],[-s*0.04,s*0.14,2]].forEach(([bx,by,i]) => {
        const bsize = s*0.06 + Math.sin(t*5+i)*s*0.02;
        g.beginPath(); g.arc(bx, by, bsize, 0, Math.PI*2); g.fill();
    });
    // 眼睛（竖瞳，随分裂变化）
    g.fillStyle = '#fbbf24'; g.shadowColor = '#fbbf24'; g.shadowBlur = 8;
    g.beginPath(); g.ellipse(-s*0.1, -s*0.1, s*0.07, s*0.1, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(s*0.1, -s*0.1, s*0.07, s*0.1, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = '#1a0a00';
    g.beginPath(); g.ellipse(-s*0.1, -s*0.1, s*0.03, s*0.08, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(s*0.1, -s*0.1, s*0.03, s*0.08, 0, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 锯齿嘴
    g.fillStyle = '#1a0a00';
    g.beginPath(); g.moveTo(-s*0.12, s*0.06);
    for (let i = 0; i <= 4; i++) {
        const mx = -s*0.12 + i*s*0.06;
        const my = s*0.06 + (i%2===0 ? s*0.07 : 0);
        g.lineTo(mx, my);
    }
    g.lineTo(s*0.12, s*0.06); g.closePath(); g.fill();
}

// 8: 坦克僵尸 - 履带滚动动画，炮管旋转，机械感
function drawTankZombie(g, s, t, pal, hurt) {
    // 履带（滚动动画）
    g.fillStyle = pal.detail;
    g.beginPath(); g.roundRect(-s*0.38, s*0.16, s*0.76, s*0.12, 4); g.fill();
    g.beginPath(); g.roundRect(-s*0.38, -s*0.28, s*0.76, s*0.12, 4); g.fill();
    // 履带齿（滚动）
    g.fillStyle = '#1a1a1a';
    const trackOffset = (t * 40) % (s*0.12);
    for (let i = -4; i <= 5; i++) {
        const tx = i * s*0.12 + trackOffset - s*0.38;
        if (tx > -s*0.38 && tx < s*0.38) {
            g.beginPath(); g.rect(tx, s*0.16, s*0.06, s*0.12); g.fill();
            g.beginPath(); g.rect(tx, -s*0.28, s*0.06, s*0.12); g.fill();
        }
    }
    // 车身（腐蚀锈迹）
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath(); g.roundRect(-s*0.34, -s*0.18, s*0.68, s*0.42, 6); g.fill();
    // 锈迹斑
    g.fillStyle = '#7c3d1a';
    g.beginPath(); g.ellipse(-s*0.12, s*0.04, s*0.09, s*0.13, 0.4, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(s*0.18, -s*0.06, s*0.07, s*0.09, -0.3, 0, Math.PI*2); g.fill();
    // 炮塔（旋转）
    g.save(); g.translate(0, -s*0.04); g.rotate(Math.sin(t*0.8)*0.4);
    g.fillStyle = pal.detail;
    g.beginPath(); g.arc(0, 0, s*0.18, 0, Math.PI*2); g.fill();
    // 炮管
    g.strokeStyle = '#374151'; g.lineWidth = s*0.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(s*0.42, 0); g.stroke();
    // 炮口火焰（偶尔闪烁）
    if (Math.sin(t*7) > 0.7) {
        g.fillStyle = '#fbbf24'; g.shadowColor = '#fbbf24'; g.shadowBlur = 10;
        g.beginPath(); g.arc(s*0.44, 0, s*0.07, 0, Math.PI*2); g.fill();
        g.shadowBlur = 0;
    }
    g.restore();
    // 红眼（车身上）
    g.fillStyle = '#ef4444'; g.shadowColor = '#ef4444'; g.shadowBlur = 8;
    g.beginPath(); g.arc(-s*0.1, s*0.06, s*0.05, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.1, s*0.06, s*0.05, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
}

// 9: 士兵僵尸 - 跛行（一条腿拖地），身体大幅倾斜，军装破烂
function drawSoldierZombie(g, s, t, pal, hurt) {
    const limp = Math.sin(t * 4.5); // 跛行节奏
    const bodyTilt = limp * 0.22; // 身体随跛行大幅倾斜
    g.save(); g.rotate(bodyTilt);
    // 腿（一条正常摆动，一条拖地）
    g.strokeStyle = pal.body; g.lineWidth = s*0.18; g.lineCap = 'round';
    // 正常腿（左）
    g.beginPath(); g.moveTo(-s*0.1, s*0.1);
    g.lineTo(-s*0.14 + limp*s*0.12, s*0.44); g.stroke();
    // 拖地腿（右，几乎不抬起）
    g.beginPath(); g.moveTo(s*0.1, s*0.1);
    g.lineTo(s*0.22, s*0.44); g.stroke(); // 拖着走，偏外
    // 身体（军装破烂）
    g.fillStyle = hurt ? '#ef4444' : pal.body;
    g.beginPath(); g.roundRect(-s*0.2, -s*0.12, s*0.4, s*0.36, 4); g.fill();
    // 破洞和血迹
    g.fillStyle = pal.detail;
    g.beginPath(); g.arc(-s*0.06, s*0.04, s*0.07, 0, Math.PI*2); g.fill();
    g.fillStyle = '#dc2626';
    g.beginPath(); g.ellipse(s*0.08, -s*0.02, s*0.04, s*0.07, 0.2, 0, Math.PI*2); g.fill();
    // 手臂（一只前伸，一只垂下无力）
    g.strokeStyle = pal.skin; g.lineWidth = s*0.14;
    g.beginPath(); g.moveTo(-s*0.2, -s*0.04); g.lineTo(-s*0.46, -s*0.04); g.stroke(); // 前伸
    g.beginPath(); g.moveTo(s*0.2, -s*0.04); g.lineTo(s*0.28, s*0.22); g.stroke(); // 垂下
    // 头（军帽歪了，大幅倾斜）
    g.save(); g.translate(0, -s*0.26); g.rotate(-bodyTilt * 0.5);
    g.fillStyle = pal.skin;
    g.beginPath(); g.arc(0, 0, s*0.19, 0, Math.PI*2); g.fill();
    // 军帽（歪）
    g.fillStyle = pal.body;
    g.save(); g.rotate(0.35);
    g.beginPath(); g.arc(0, -s*0.1, s*0.19, Math.PI, 0); g.fill();
    g.fillRect(-s*0.24, -s*0.12, s*0.48, s*0.06);
    g.restore();
    // 空洞眼睛
    g.fillStyle = '#1a0000';
    g.beginPath(); g.arc(-s*0.07, -s*0.02, s*0.06, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.07, -s*0.02, s*0.06, 0, Math.PI*2); g.fill();
    g.fillStyle = '#ef4444';
    g.beginPath(); g.arc(-s*0.07, -s*0.02, s*0.03, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.07, -s*0.02, s*0.03, 0, Math.PI*2); g.fill();
    g.restore();
    g.restore();
}

// 10: UFO - 旋转飞碟，光束扫射动画，恐怖外星人
function drawUFOEnemy(g, s, t, pal, hurt) {
    const hover = Math.sin(t * 3.2) * s * 0.05;
    const spin = t * 2.5; // 飞碟旋转
    g.translate(0, hover);
    // 扫射光束（旋转）
    const beamAngle = t * 1.5;
    g.save(); g.rotate(beamAngle);
    g.fillStyle = 'rgba(129,140,248,0.12)';
    g.beginPath(); g.moveTo(0, s*0.14); g.lineTo(-s*0.28, s*0.55); g.lineTo(s*0.28, s*0.55); g.closePath(); g.fill();
    g.restore();
    // 静态光束（向下）
    g.fillStyle = 'rgba(129,140,248,0.08)';
    g.beginPath(); g.moveTo(-s*0.1, s*0.14); g.lineTo(s*0.1, s*0.14);
    g.lineTo(s*0.24, s*0.52); g.lineTo(-s*0.24, s*0.52); g.closePath(); g.fill();
    // 飞碟主体（旋转渐变）
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, s*0.42);
    grad.addColorStop(0, hurt ? '#ef4444' : '#c4b5fd');
    grad.addColorStop(1, pal.body);
    g.fillStyle = grad;
    g.beginPath(); g.ellipse(0, 0, s*0.44, s*0.18, 0, 0, Math.PI*2); g.fill();
    // 旋转灯（沿边缘）
    for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2 + spin;
        const lx = Math.cos(a)*s*0.34, ly = Math.sin(a)*s*0.13;
        const lit = Math.sin(spin*2 + i) > 0;
        g.fillStyle = lit ? '#fbbf24' : '#374151';
        g.shadowColor = lit ? '#fbbf24' : 'transparent';
        g.shadowBlur = lit ? 8 : 0;
        g.beginPath(); g.arc(lx, ly, s*0.04, 0, Math.PI*2); g.fill();
    }
    g.shadowBlur = 0;
    // 驾驶舱（半透明穹顶）
    g.fillStyle = 'rgba(196,181,253,0.65)';
    g.beginPath(); g.ellipse(0, -s*0.1, s*0.2, s*0.2, 0, 0, Math.PI*2); g.fill();
    // 外星人脸（大眼睛，恐怖）
    g.fillStyle = '#0f172a';
    g.beginPath(); g.ellipse(-s*0.08, -s*0.14, s*0.08, s*0.11, -0.25, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(s*0.08, -s*0.14, s*0.08, s*0.11, 0.25, 0, Math.PI*2); g.fill();
    g.fillStyle = '#ef4444'; g.shadowColor = '#ef4444'; g.shadowBlur = 7;
    g.beginPath(); g.arc(-s*0.08, -s*0.14, s*0.04, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(s*0.08, -s*0.14, s*0.04, 0, Math.PI*2); g.fill();
    g.shadowBlur = 0;
    // 细嘴（一条线）
    g.strokeStyle = '#1a0a0a'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-s*0.06, -s*0.04); g.lineTo(s*0.06, -s*0.04); g.stroke();
}

// ===== 渲染 =====
function render() {
    const { scale, offX, offY } = getTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offX, offY);
    ctx.scale(scale, scale);

    drawMapBase();

    // 射程圆（战斗中，清晰可见）
    towers.forEach(t => {
        const cx = t.x*TILE+TILE/2, cy = t.y*TILE+TILE/2;
        const type = t.isSpecial ? SPECIAL_TOWERS[t.typeId] : TOWER_TYPES[t.typeId];
        const color = type ? type.color : '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, t.range, 0, Math.PI*2);
        ctx.strokeStyle = color + 'aa';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 特殊炮台：区域效果圆 + 倒计时
        if (t.isSpecial) {
            const stype = SPECIAL_TOWERS[t.typeId];
            const cooldownFrames = (t.cooldownSec || 5) * 60;
            const activeFrames   = (t.activeSec  || 0) * 60;

            if (t.special === 'chain_zone' || t.special === 'cursed_zone') {
                // 持续区域：半透明填充
                ctx.globalAlpha = 0.12;
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(cx, cy, t.range, 0, Math.PI*2); ctx.fill();
                ctx.globalAlpha = 1;
            }

            if (t.special === 'shockwave' || t.special === 'groundbomb') {
                // 冷却进度弧
                const progress = Math.min((t.cooldownTimer || 0) / cooldownFrames, 1);
                ctx.beginPath();
                ctx.arc(cx, cy, TILE*0.38, -Math.PI/2, -Math.PI/2 + progress*Math.PI*2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                ctx.stroke();

                // 冷却秒数文字
                const secsLeft = Math.ceil(((t.cooldownTimer || 0) >= cooldownFrames ? 0 : cooldownFrames - (t.cooldownTimer || 0)) / 60);
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${TILE*0.22}px sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(secsLeft > 0 ? secsLeft + 's' : '!', cx, cy - TILE*0.55);
            }

            if (t.special === 'teleport' && t.activeTimer > 0) { /* 已移除 */ }

            // 地破弹爆炸闪光（更大更明显）
            if (t.special === 'groundbomb' && t._bombFlash) {
                const prog = t._bombFlash.life / 60;
                const radius = 50 + (1 - prog) * 30; // 爆炸圈扩散
                // 外圈橙色光晕
                ctx.globalAlpha = prog * 0.6;
                ctx.fillStyle = '#f97316';
                ctx.beginPath(); ctx.arc(t._bombFlash.x, t._bombFlash.y, radius * 1.4, 0, Math.PI*2); ctx.fill();
                // 内圈亮黄
                ctx.globalAlpha = prog * 0.9;
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath(); ctx.arc(t._bombFlash.x, t._bombFlash.y, radius * 0.8, 0, Math.PI*2); ctx.fill();
                // 中心白核
                ctx.globalAlpha = prog;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(t._bombFlash.x, t._bombFlash.y, radius * 0.3, 0, Math.PI*2); ctx.fill();
                // 爆炸圈描边
                ctx.globalAlpha = prog * 0.8;
                ctx.strokeStyle = '#a3e635';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(t._bombFlash.x, t._bombFlash.y, radius, 0, Math.PI*2); ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // 冲击波：渲染扩散光圈
            if (t.special === 'shockwave' && t._rings && t._rings.length > 0) {
                const scx = t.x*TILE+TILE/2, scy = t.y*TILE+TILE/2;
                t._rings.forEach(ring => {
                    if (!ring.active) return;
                    const alpha = Math.max(0, 1 - ring.radius / 800);
                    // 外发光
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.5;
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 10;
                    ctx.shadowColor = '#fb923c';
                    ctx.shadowBlur = 18;
                    ctx.beginPath(); ctx.arc(scx, scy, ring.radius, 0, Math.PI*2); ctx.stroke();
                    // 内圈橙色
                    ctx.globalAlpha = alpha * 0.8;
                    ctx.strokeStyle = '#fb923c';
                    ctx.lineWidth = 4;
                    ctx.shadowBlur = 8;
                    ctx.beginPath(); ctx.arc(scx, scy, ring.radius, 0, Math.PI*2); ctx.stroke();
                    ctx.restore();
                });
            }
        }
    });

    // 塔
    towers.forEach(t => {
        drawTowerAt(t.x, t.y, t, t.angle);
        // 战斗中显示炮台血条
        if (gameState === 'running') {
            const hp = t.hp !== undefined ? t.hp : 1;
            const px = t.x*TILE, py = t.y*TILE;
            const bw = TILE*0.8, bh = 4;
            const bx = px + TILE*0.1, by = py + TILE - 6;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx-1, by-1, bw+2, bh+2);
            const hpColor = hp > 0.6 ? '#4ade80' : hp > 0.3 ? '#fbbf24' : '#ef4444';
            // 满血时半透明，受伤后完全不透明
            ctx.globalAlpha = hp >= 1 ? 0.35 : 1;
            ctx.fillStyle = hpColor;
            ctx.fillRect(bx, by, bw * Math.max(0, hp), bh);
            ctx.globalAlpha = 1;
        }
    });

    // 铁链塔：从塔到范围内每个敌人画链条
    towers.filter(t => t.isSpecial && t.special === 'chain_zone').forEach(t => {
        const tx = t.x*TILE+TILE/2, ty = t.y*TILE+TILE/2;
        enemies.forEach(e => {
            if (Math.hypot(e.px-tx, e.py-ty) >= t.range) return;
            // 画锯齿链条
            ctx.save();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#94a3b8';
            ctx.shadowBlur = 6;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            // 中间加一点抖动模拟链条
            const mx = (tx+e.px)/2 + (Math.random()-0.5)*10;
            const my = (ty+e.py)/2 + (Math.random()-0.5)*10;
            ctx.quadraticCurveTo(mx, my, e.px, e.py);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
            // 链条末端小圆圈
            ctx.save();
            ctx.fillStyle = '#94a3b8';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(e.px, e.py, 4, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        });
    });

    // 敌人
    enemies.forEach(e => {
        const img = RES.enemies[e.imgIdx] || RES.enemies[0];

        // Boss：多种外观实时绘制
        if (e.isBoss) {
            drawBossAnimated(ctx, e);
            return;
        }

        // Boss子体：橙色小圆+倒计时
        if (e.isBossChild) {
            const r = TILE * 0.4;
            ctx.save();
            ctx.shadowColor = '#f97316'; ctx.shadowBlur = 12;
            ctx.fillStyle = '#c2410c';
            ctx.beginPath(); ctx.arc(e.px, e.py, r, 0, Math.PI*2); ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${TILE*0.28}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('💣', e.px, e.py);
            // 自爆倒计时
            const sec = Math.ceil(e.explodeTimer / 60);
            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold 11px sans-serif`;
            ctx.fillText(sec + 's', e.px, e.py - r - 8);
            return;
        }

        // 实时绘制敌人（带动画）
        drawEnemyAnimated(ctx, e);

        // 侦察兵标识：头顶显示橙色"?"
        if (_debugMode && e.isScout) {
            ctx.save();
            ctx.font = `bold ${TILE*0.32}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fb923c';
            ctx.shadowColor = '#f97316'; ctx.shadowBlur = 8;
            ctx.fillText('?', e.px, e.py - TILE*0.6);
            ctx.restore();
        }
        // 动态HP标记：头顶显示 +数值 / -数值
        if (_debugMode && !e.isScout && e.hpMark && e.hpMark !== '=') {
            ctx.save();
            ctx.font = `bold ${TILE*0.26}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = e.hpMark.startsWith('+') ? '#f87171' : '#4ade80';
            ctx.shadowColor = e.hpMark.startsWith('+') ? '#ef4444' : '#22c55e';
            ctx.shadowBlur = 10;
            ctx.fillText(e.hpMark, e.px, e.py - TILE*0.6);
            ctx.restore();
        }
        // 冰冻/麻痹状态
        if (e.slowTimer > 0) {
            if (e.slowFactor === 0 && e._frozenByIce) {
                // 完全冻结（冰冻塔）：蓝白冰晶效果
                const ft = Date.now() / 1000;
                ctx.save();
                ctx.globalAlpha = 0.6 + Math.sin(ft * 8) * 0.15;
                ctx.fillStyle = '#bae6fd';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.ellipse(e.px, e.py, TILE*0.4, TILE*0.4, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
                // 冰晶符号
                ctx.save();
                ctx.font = `bold ${TILE*0.38}px sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 12;
                ctx.fillText('❄️', e.px, e.py - TILE*0.55);
                ctx.restore();
            } else if (e.slowFactor === 0) {
                // 完全停止（闪电麻痹）：黄色闪电光晕
                const ft = Date.now() / 1000;
                ctx.save();
                ctx.globalAlpha = 0.55 + Math.sin(ft * 15) * 0.2;
                ctx.fillStyle = '#fde047';
                ctx.shadowColor = '#a78bfa';
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.ellipse(e.px, e.py, TILE*0.38, TILE*0.38, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
                // 闪电符号
                ctx.save();
                ctx.font = `bold ${TILE*0.38}px sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fde047';
                ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 12;
                ctx.fillText('⚡', e.px, e.py - TILE*0.55);
                ctx.restore();
            } else {
                // 减速（冰冻减速）：蓝色半透明覆盖
                ctx.globalAlpha = 0.45;
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.ellipse(e.px, e.py, img.width*0.5, img.height*0.5, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        // 燃烧状态：火焰效果
        if (e.fireTimer > 0) {
            const ft = Date.now() / 1000;
            // 橙色光晕（闪烁）
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(ft * 12) * 0.2;
            ctx.fillStyle = '#f97316';
            ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.ellipse(e.px, e.py, TILE*0.32, TILE*0.32, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            // 火焰粒子（向上飘）
            if (Math.random() < 0.4) {
                particles.push({
                    x: e.px + (Math.random()-0.5)*16,
                    y: e.py + (Math.random()-0.5)*8,
                    vx: (Math.random()-0.5)*1.5,
                    vy: -2 - Math.random()*2,
                    life: 0.5 + Math.random()*0.3,
                    color: Math.random() < 0.5 ? '#fb923c' : '#fbbf24',
                    size: 3 + Math.random()*3
                });
            }
            // 🔥符号 + 剩余秒数
            const fireSec = Math.ceil(e.fireTimer / 60);
            ctx.save();
            ctx.font = `bold ${TILE*0.35}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('🔥', e.px, e.py - TILE*0.55);
            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold ${TILE*0.22}px sans-serif`;
            ctx.shadowColor = '#f97316'; ctx.shadowBlur = 6;
            ctx.fillText(fireSec + 's', e.px + TILE*0.28, e.py - TILE*0.52);
            ctx.restore();
        }
        // 中毒状态：绿色光晕
        if (e.poisonTimer > 0) {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.ellipse(e.px, e.py, img.width*0.55, img.height*0.55, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        const bw = TILE*0.65, bh = 5;
        const bx = e.px-bw/2, by = e.py-img.height/2-8;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx-1, by-1, bw+2, bh+2);
        ctx.fillStyle = e.hp/e.maxHp > 0.5 ? '#4ade80' : '#f87171';
        ctx.fillRect(bx, by, bw*(e.hp/e.maxHp), bh);

        // 过载放电命中：显示"×2"黄色文字
        if (e._overloadFlash > 0) {
            e._overloadFlash--;
            const alpha = e._overloadFlash / 30;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${TILE*0.4}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fde047';
            ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 12;
            ctx.fillText('×2', e.px + 18, e.py - TILE*0.5 - (1 - alpha) * 20);
            ctx.restore();
        }

    });

    // 子弹
    bullets.forEach(b => {
        // Boss炮弹：红色大球
        if (b.isBossBullet) {
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath(); ctx.arc(b.x-2, b.y-2, 3, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
            return;
        }
        // 敌人炮弹：各色小球，带光晕
        if (b.isEnemyBullet) {
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(b.x - b.size*0.3, b.y - b.size*0.3, b.size*0.35, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
            return;
        }
        if (b.type === 'arrow') {
            // 箭矢：沿飞行方向画箭杆+箭头
            const dx = b.target.px - b.x, dy = b.target.py - b.y;
            const angle = Math.atan2(dy, dx);
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(angle);
            // 箭杆
            ctx.strokeStyle = '#c8a96e'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(6, 0); ctx.stroke();
            // 箭头
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(10, 0); ctx.lineTo(4, -3); ctx.lineTo(4, 3);
            ctx.closePath(); ctx.fill();
            // 尾羽
            ctx.fillStyle = '#f87171';
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-12, -4); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-12, 4); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill();
            ctx.restore();
        } else if (b.type === 'lightning') {
            ctx.strokeStyle = b.color; ctx.lineWidth = 2;
            ctx.shadowColor = b.color; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.moveTo(b.x, b.y);
            const dx = b.target.px-b.x, dy = b.target.py-b.y;
            for (let i = 1; i <= 4; i++)
                ctx.lineTo(b.x+dx*(i/4)+(Math.random()-0.5)*10, b.y+dy*(i/4)+(Math.random()-0.5)*10);
            ctx.stroke(); ctx.shadowBlur = 0;
        } else if (b.type === 'ice') {
            ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 6;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i/6)*Math.PI*2, r = i%2===0 ? b.size*1.5 : b.size*0.7;
                i===0 ? ctx.moveTo(b.x+Math.cos(a)*r, b.y+Math.sin(a)*r)
                      : ctx.lineTo(b.x+Math.cos(a)*r, b.y+Math.sin(a)*r);
            }
            ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath(); ctx.arc(b.x-b.size*0.3, b.y-b.size*0.3, b.size*0.35, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // 链式闪电弧线（持久线段，带锯齿）
    lightningArcs.forEach(arc => {
        const alpha = arc.life / 12;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        const dx = arc.x2 - arc.x1, dy = arc.y2 - arc.y1;
        for (let i = 1; i <= 6; i++) {
            const t = i / 6;
            ctx.lineTo(
                arc.x1 + dx*t + (Math.random()-0.5)*18,
                arc.y1 + dy*t + (Math.random()-0.5)*18
            );
        }
        ctx.lineTo(arc.x2, arc.y2);
        ctx.stroke();
        ctx.restore();
    });

    // 粒子
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    ctx.restore();

    // ===== 右上角调试信息（淡显，H键切换）=====
    if (_debugMode && gameState === 'running') {
        const data = getTowerData();
        const target = data._battleTarget;
        const baseHp = data._baseEnemyHp || 0;
        const dynHp = data._dynEnemyHp || baseHp;

        const lines = [];
        lines.push(target === 'win' ? '🎯 目标：赢' : '🎯 目标：输');
        lines.push(`基础HP: ${baseHp}`);
        lines.push(`当前HP: ${dynHp}  ${dynHp > baseHp ? '▲+' : dynHp < baseHp ? '▼-' : '─'}`);
        const dead = data._deadCount || 0;
        const sum = data._deadHpSum || 0;
        if (dead > 0) {
            const avg = (sum / dead * 100).toFixed(0);
            lines.push(`战况: ${dead}死 均走${avg}%`);
        } else {
            lines.push('战况: 侦察中...');
        }

        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        const bw = 140, bh = lines.length * 18 + 12;
        ctx.fillRect(canvas.width - bw - 8, 8, bw, bh);
        ctx.globalAlpha = 0.6;
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        lines.forEach((line, i) => {
            ctx.fillStyle = i === 0
                ? (target === 'win' ? '#4ade80' : '#f87171')
                : '#e2e8f0';
            ctx.fillText(line, canvas.width - 12, 14 + i * 18);
        });
        ctx.restore();
    }
}

// ===== 战力计算：根据场上所有武器估算总DPS =====
function calcTowerPower() {
    const data = getTowerData();
    let power = 0;
    (data.weaponInstances || []).forEach(inst => {
        const placedSlot = Object.values(data.towers || {}).includes(inst.id);
        if (!placedSlot) return; // 只算已部署的
        const isSpecial = !!SPECIAL_TOWERS[inst.typeId];
        if (isSpecial) {
            // 特殊炮台：固定战力贡献
            const stype = SPECIAL_TOWERS[inst.typeId];
            const specialPower = { chain_zone: 80, cursed_zone: 100, shockwave: 120, groundbomb: 90, teleport: 60 };
            power += specialPower[stype.special] || 60;
        } else {
            const stats = calcTowerStats(inst.typeId, inst.upgrades || []);
            // DPS = 攻击力 × 射速 × 多发数
            let dps = stats.atk * stats.speed * stats.speedMult * (stats.multiShot || 1);
            // 特效加成
            if (stats.splash)   dps *= 1.3;
            if (stats.burn)     dps *= 1.2;
            if (stats.poison)   dps *= 1.15;
            if (stats.freeze)   dps *= 1.2;
            if (stats.stun)     dps *= 1.25;
            if (stats.empStun)  dps *= 1.1;
            if (stats.chain > 1) dps *= (1 + (stats.chain - 1) * 0.3);
            if (stats.superMode) dps *= 1.8;
            if (stats.overload) dps *= 1.15;
            power += dps;
        }
    });
    return Math.max(power, 10); // 最低10，避免除零
}

// ===== 动态难度核心：根据上一局实际结果决定本局目标 =====
// 上一局赢了 → 本局目标是输；上一局输了（或首局）→ 本局目标是赢
function getDifficultyTarget(data) {
    return data.lastBattleWin !== true;
}

// ===== 动态敌人HP：根据当前战况计算下一个敌人的HP =====
function calcNextEnemyHp() {
    const data = getTowerData();
    const baseHp = data._baseEnemyHp || 50;
    const prevDynHp = data._dynEnemyHp || baseHp; // 上一个动态敌人的实际HP
    const targetWin = data._battleTarget === 'win';
    const deadCount = data._deadCount || 0;
    const deadHpSum = data._deadHpSum || 0;

    if (deadCount === 0) {
        return targetWin ? Math.round(baseHp * 0.85) : Math.round(baseHp * 1.3);
    }

    // avgSurvivedRatio: 已死敌人平均走到路径的比例（0=入口就死，1=出口才死）
    const avgSurvivedRatio = deadHpSum / deadCount;

    let nextHp;
    if (targetWin) {
        // 赢局：直接用baseHp反推目标HP，不用prevDynHp累积，避免过头
        // 目标：让敌人走到约35%路程死
        const targetRatio = 0.35;
        const idealHp = baseHp * (targetRatio / Math.max(avgSurvivedRatio, 0.1));
        // 上限：baseHp的2.5倍
        const cappedIdeal = Math.min(idealHp, baseHp * 2.5);
        // 步长8%
        nextHp = Math.round(prevDynHp + (cappedIdeal - prevDynHp) * 0.08);
    } else {
        // 输局：反推法，目标让敌人走出去（ratio>1）
        const targetRatio = 1.1;
        const idealHp = prevDynHp * (targetRatio / Math.max(avgSurvivedRatio, 0.08));
        const cappedIdeal = Math.min(idealHp, baseHp * 20);
        // 每步走向理想值的40%
        nextHp = Math.round(prevDynHp + (cappedIdeal - prevDynHp) * 0.4);
    }

    return Math.max(nextHp, 10);
}

// 计算并存储下一个敌人HP（供右上角显示用）
function calcAndStoreNextEnemyHp() {
    const hp = calcNextEnemyHp();
    const data = getTowerData();
    data._dynEnemyHp = hp;
    saveTowerData(data);
    return hp;
}

// ===== 结束战斗 =====
function endBattle(win) {
    if (gameState !== 'running') return;
    gameState = win ? 'win' : 'lose';
    cancelAnimationFrame(animFrame);
    document.getElementById('btnStart').disabled = false;
    const data = getTowerData();
    const lvlCfg = LEVELS[Math.min(data.currentLevel - 1, LEVELS.length - 1)];
    document.getElementById('resultIcon').textContent = win ? '🏆' : '💀';
    document.getElementById('resultTitle').textContent = win ? '胜利！' : '失败...';
    if (win) {
        data.currentLevel = Math.min(data.currentLevel + 1, LEVELS.length);
        data.lastBattleWin = true;  // 记录实际结果：赢
        saveTowerData(data);
        document.getElementById('resultDesc').textContent = `太棒了！通过第${lvlCfg.level}关！`;
        document.getElementById('hudLevel').textContent = `第${data.currentLevel}关`;
    } else {
        data.lastBattleWin = false; // 记录实际结果：输
        saveTowerData(data);
        document.getElementById('resultDesc').textContent = `没能守住！去做任务赚积分升级武器，再战！`;
    }
    document.getElementById('resultOverlay').classList.add('show');
}

function closeResult() {
    document.getElementById('resultOverlay').classList.remove('show');
    gameState = 'idle';
    loadGameState();
    drawStatic();
}

// ===== 每日礼包 =====
function checkGiftButton() {
    const data = getTowerData();
    const today = new Date().toDateString();
    const hwDone = data.lastGiftDate_hw === today;
    const essayDone = data.lastGiftDate_essay === today;
    // 两个都用完才禁用主按钮
    document.getElementById('btnGift').disabled = hwDone && essayDone;
}

function openGift() {
    const data = getTowerData();
    const today = new Date().toDateString();
    const hwDone = data.lastGiftDate_hw === today;
    const essayDone = data.lastGiftDate_essay === today;

    // 更新按钮状态
    const btnHw = document.getElementById('giftBtnHw');
    const btnEssay = document.getElementById('giftBtnEssay');
    btnHw.disabled = hwDone;
    document.getElementById('giftStatusHw').textContent = hwDone ? '✓ 已领取' : '';
    btnEssay.disabled = essayDone;
    document.getElementById('giftStatusEssay').textContent = essayDone ? '✓ 已领取' : '';

    // 重置摇奖区域
    document.getElementById('lotteryArea').style.display = 'none';
    document.getElementById('lotteryResult').textContent = '';
    document.getElementById('lotteryDrum').textContent = '888';
    document.getElementById('giftCloseBtn').style.display = 'none';

    document.getElementById('giftOverlay').classList.add('show');
}

function triggerGiftOption(type) {
    if (!_zKeyActive) return;
    const data = getTowerData();
    const today = new Date().toDateString();
    const key = type === 'hw' ? 'lastGiftDate_hw' : 'lastGiftDate_essay';
    if (data[key] === today) return;

    // 禁用两个按钮，防止重复点击
    document.getElementById('giftBtnHw').disabled = true;
    document.getElementById('giftBtnEssay').disabled = true;

    // 显示摇奖区域
    const lotteryArea = document.getElementById('lotteryArea');
    const drum = document.getElementById('lotteryDrum');
    const resultEl = document.getElementById('lotteryResult');
    lotteryArea.style.display = 'flex';
    resultEl.textContent = '摇奖中...';

    // 作业：10~100，作文：10~1000
    const finalPts = type === 'hw'
        ? Math.floor(Math.random() * 91) + 10
        : Math.floor(Math.random() * 991) + 10;

    // 滚动动画：2秒内快速变化数字
    drum.classList.add('rolling');
    const startTime = Date.now();
    const duration = 2000;
    const rollInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            clearInterval(rollInterval);
            drum.classList.remove('rolling');
            drum.textContent = finalPts;
            drum.style.color = '#4ade80';
            resultEl.textContent = `🎉 恭喜获得 ${finalPts} 积分！`;
            document.getElementById('giftCloseBtn').style.display = 'block';

            // 存档
            data[key] = today;
            data.points = (data.points || 0) + finalPts;
            const label = type === 'hw' ? '今日作业已良好完成' : '今天完成一篇作文';
            data.history = data.history || [];
            data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: `礼包：${label}`, pts: finalPts });
            saveTowerData(data);
            document.getElementById('hudPts').textContent = `积分: ${data.points}`;
            checkGiftButton();
        } else {
            // 滚动时显示随机数，越接近结束越接近最终值
            const progress = elapsed / duration;
            const range = Math.max(10, Math.floor((1 - progress) * 500));
            const display = Math.floor(Math.random() * range) + Math.floor(finalPts * progress * 0.8);
            drum.textContent = Math.min(display, 9999);
        }
    }, 80);
}

function closeGift() {
    document.getElementById('giftOverlay').classList.remove('show');
}

// ===== 测试用：给大量积分并解锁所有塔 =====
function quickStart() {
    const data = getTowerData();
    data.points = 2000;
    // 给每种武器各创建2个实例方便测试
    data.weaponInstances = data.weaponInstances || [];
    if (data.weaponInstances.length === 0) {
        Object.keys(TOWER_TYPES).forEach(typeId => {
            data.weaponInstances.push({ id: newInstanceId(), typeId, upgrades: [] });
            data.weaponInstances.push({ id: newInstanceId(), typeId, upgrades: [] });
        });
    }
    saveTowerData(data);
    loadGameState();
    drawStatic();
}
