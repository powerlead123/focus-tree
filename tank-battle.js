// 数学错题坦克大战 - 3D游戏逻辑
// 使用 Three.js 实现

// ========== 全局变量 ==========
let scene, camera, renderer;
let tank, barrel, turret;
let projectiles = [];
let enemies = [];
let particles = [];
let terrain, skybox;
let animationId;
let lastTime = 0;
let trajectoryLine = null; // 抛物线轨迹预览

// 鼠标控制
let mouseX = 0, mouseY = 0;
let targetRotationY = 0, targetRotationX = 0;

// 音频上下文
let audioContext = null;

// 游戏状态
const GameState = {
    mistakes: 0,
    weaponLevel: 5,
    ammo: 30,
    maxAmmo: 30,
    score: 0,
    kills: 0,
    isPlaying: false,
    timeRemaining: 180, // 3分钟，确保有足够时间攻城
    lastFireTime: 0,
    shotsFired: 0,
    shotsHit: 0,
    // 家长评定奖励
    extraTank: false,
    specialAmmo: false,
    // 自动战斗
    autoFireEnabled: true,
    autoMoveEnabled: true,
    // 坦克状态
    tankState: 'moving', // 'moving' | 'aiming' | 'firing'
    currentTarget: null,
    lastShotHit: false,
    // 进攻模式
    enemyBase: null, // 敌人老巢
    baseDestroyed: false,
    totalDistance: 200, // 总进攻距离
    currentDistance: 0, // 当前推进距离
    enemiesToSpawn: 30, // 需要消灭的敌人数量
    enemiesSpawned: 0,
    // 城堡关卡
    gamePhase: 'march', // 'march'行军 | 'siege'攻城 | 'boss'打Boss
    gateGuards: [], // 守城怪兽
    gateOpen: false, // 大门是否打开
    boss: null, // Boss对象
    bossDefeated: false
};

// 武器配置
const WeaponConfig = {
    5: { name: '精英坦克', stars: '⭐⭐⭐⭐⭐', fireRate: 1000, damage: 100, accuracy: 0.95, ammo: 30, range: 100, color: '#FFD700' },
    4: { name: '优秀坦克', stars: '⭐⭐⭐⭐', fireRate: 1200, damage: 80, accuracy: 0.85, ammo: 25, range: 80, color: '#7eb03c' },
    3: { name: '标准坦克', stars: '⭐⭐⭐', fireRate: 1400, damage: 60, accuracy: 0.75, ammo: 20, range: 60, color: '#FFA500' },
    2: { name: '受损坦克', stars: '⭐⭐', fireRate: 1600, damage: 40, accuracy: 0.65, ammo: 15, range: 50, color: '#FF6B35' },
    1: { name: '故障坦克', stars: '⭐', fireRate: 2000, damage: 20, accuracy: 0.55, ammo: 10, range: 40, color: '#FF3333' }
};

// 鼓励语
const Encouragements = {
    0: '🏆 完美！你是数学小天才！坦克状态最佳！',
    1: '👏 很棒！继续保持，坦克性能优秀！',
    2: '👏 很棒！继续保持，坦克性能优秀！',
    3: '👍 不错！再仔细一点就更好了！',
    4: '👍 不错！再仔细一点就更好了！',
    5: '👍 不错！再仔细一点就更好了！',
    6: '💪 加油！认真检查可以减少错题哦！',
    7: '💪 加油！认真检查可以减少错题哦！',
    8: '💪 加油！认真检查可以减少错题哦！',
    9: '🌟 别灰心！明天认真一点，坦克会更强的！'
};

// 表情反馈
const Emotions = {
    0: '😄 完美！继续保持！',
    1: '😊 非常好！',
    2: '🙂 还不错！',
    3: '😐 还可以更好',
    4: '😕 需要更认真',
    5: '😟 要认真检查啊',
    6: '😰 错题有点多',
    7: '😢 下次要更仔细',
    8: '😭 要认真对待作业',
    9: '😱 明天一定要认真！'
};

// ========== 密码锁 ==========
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

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    // 页面加载时自动聚焦到密码框
    const lockInput = document.getElementById('realLockInput');
    if (lockInput) {
        setTimeout(() => lockInput.focus(), 100);
    }
    
    initRadarChart();
    updateWeaponPreview();
    updateEvaluation();
});

// 更新家长评定
function updateEvaluation() {
    const schoolNoMistake = document.getElementById('schoolNoMistake').checked;
    const homeNoMistake = document.getElementById('homeNoMistake').checked;
    
    // 更新开关文字
    document.querySelectorAll('.toggle-text').forEach(el => {
        const checkbox = el.closest('.eval-toggle').querySelector('input');
        el.textContent = checkbox.checked ? '是' : '否';
    });
    
    // 更新奖励状态
    GameState.extraTank = schoolNoMistake;
    GameState.specialAmmo = homeNoMistake;
    
    // 更新汇总显示
    const summaryEl = document.getElementById('evaluationSummary');
    let rewards = [];
    if (schoolNoMistake) rewards.push('🎖️ 额外坦克×1');
    if (homeNoMistake) rewards.push('🚀 多功能炮弹');
    
    if (rewards.length > 0) {
        summaryEl.innerHTML = `<span class="summary-icon">🎁</span><span class="summary-text">${rewards.join(' + ')}</span>`;
        summaryEl.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(126, 176, 60, 0.3))';
    } else {
        summaryEl.innerHTML = '<span class="summary-icon">🎁</span><span class="summary-text">完成评定可获得额外奖励！</span>';
        summaryEl.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(126, 176, 60, 0.2))';
    }
}

// 初始化雷达图
function initRadarChart() {
    const canvas = document.getElementById('radarCanvas');
    const ctx = canvas.getContext('2d');
    drawRadarChart(ctx, GameState.weaponLevel);
}

// 绘制雷达图
function drawRadarChart(ctx, level) {
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const labels = ['射速', '威力', '精准', '弹药', '射程'];
    const config = WeaponConfig[level];
    const values = [
        config.fireRate / 600,
        config.damage / 100,
        config.accuracy,
        config.ammo / 30,
        config.range / 100
    ];

    ctx.clearRect(0, 0, 200, 200);

    // 绘制背景网格
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let j = 0; j < 5; j++) {
            const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius * i / 5);
            const y = centerY + Math.sin(angle) * (radius * i / 5);
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 绘制轴线
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // 绘制标签
        const labelX = centerX + Math.cos(angle) * (radius + 20);
        const labelY = centerY + Math.sin(angle) * (radius + 20);
        ctx.fillStyle = '#aaa';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], labelX, labelY);
    }

    // 绘制数据区域
    ctx.beginPath();
    ctx.fillStyle = hexToRgba(config.color, 0.3);
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * values[i]);
        const y = centerY + Math.sin(angle) * (radius * values[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制数据点
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * values[i]);
        const y = centerY + Math.sin(angle) * (radius * values[i]);
        ctx.beginPath();
        ctx.fillStyle = config.color;
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 颜色转换
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 调整错题数
function adjustMistakes(delta) {
    GameState.mistakes = Math.max(0, Math.min(20, GameState.mistakes + delta));
    document.getElementById('mistakeCount').textContent = GameState.mistakes;
    updateWeaponPreview();
    updateEmotion();
}

// 更新表情反馈
function updateEmotion() {
    const emotionEl = document.getElementById('emotionFeedback');
    const emotion = Emotions[Math.min(GameState.mistakes, 9)] || Emotions[9];
    emotionEl.textContent = emotion;

    // 根据错题数改变背景色
    if (GameState.mistakes <= 2) {
        emotionEl.style.background = 'rgba(126, 176, 60, 0.2)';
        emotionEl.style.color = '#7eb03c';
    } else if (GameState.mistakes <= 5) {
        emotionEl.style.background = 'rgba(255, 165, 0, 0.2)';
        emotionEl.style.color = '#FFA500';
    } else {
        emotionEl.style.background = 'rgba(255, 51, 51, 0.2)';
        emotionEl.style.color = '#FF3333';
    }
}

// 更新武器预览
function updateWeaponPreview() {
    // 计算武器等级
    if (GameState.mistakes <= 1) GameState.weaponLevel = 5;
    else if (GameState.mistakes <= 3) GameState.weaponLevel = 4;
    else if (GameState.mistakes <= 5) GameState.weaponLevel = 3;
    else if (GameState.mistakes <= 8) GameState.weaponLevel = 2;
    else GameState.weaponLevel = 1;

    const config = WeaponConfig[GameState.weaponLevel];

    // 更新UI
    document.getElementById('statusName').textContent = config.name;
    document.getElementById('statusStars').textContent = config.stars;

    // 更新属性条
    document.getElementById('statFireRate').style.width = (100 - config.fireRate / 6) + '%';
    document.getElementById('statPower').style.width = config.damage + '%';
    document.getElementById('statAccuracy').style.width = (config.accuracy * 100) + '%';
    document.getElementById('statAmmo').style.width = (config.ammo / 30 * 100) + '%';
    document.getElementById('statRange').style.width = config.range + '%';

    // 更新雷达图
    const canvas = document.getElementById('radarCanvas');
    const ctx = canvas.getContext('2d');
    drawRadarChart(ctx, GameState.weaponLevel);
}

// ========== 音频系统 ==========
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 播放射击音效
function playShootSound() {
    if (!audioContext) initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 炮声音效
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 播放爆炸音效
function playExplosionSound() {
    if (!audioContext) initAudio();
    if (!audioContext) return;

    // 创建噪声缓冲区
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.1));
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // 低通滤波器
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(audioContext.currentTime);
}

// 播放击中音效
function playHitSound() {
    if (!audioContext) initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ========== 游戏控制 ==========
function startGame() {
    // 初始化音频
    initAudio();

    // 设置游戏参数
    const config = WeaponConfig[GameState.weaponLevel];
    GameState.ammo = config.ammo;
    GameState.maxAmmo = config.ammo;
    GameState.score = 0;
    GameState.kills = 0;
    GameState.bugsKilled = 0;
    GameState.bossSpawned = false;
    GameState.bossDefeated = false;
    GameState.timeRemaining = 180; // 3分钟，确保有足够时间攻城
    GameState.shotsFired = 0;
    GameState.shotsHit = 0;
    GameState.isPlaying = true;

    // 重置城堡关卡状态
    GameState.gamePhase = 'march';
    GameState.gateGuards = [];
    GameState.gateOpen = false;
    GameState.boss = null;

    // 更新HUD
    updateHUD();

    // 切换页面
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    // 初始化3D场景
    initThreeJS();

    // 如果学校作业无错误，添加额外坦克
    if (GameState.extraTank) {
        setTimeout(() => createExtraTank(), 1000);
    }

    // 开始游戏循环
    lastTime = performance.now();
    animate();

    // 开始计时器
    startTimer();

    // 绑定鼠标事件（可选，现在主要是自动战斗）
    bindMouseEvents();

    // 显示开始消息
    let startMsg = '战斗开始！';
    if (GameState.extraTank) startMsg += ' 额外坦克已部署！';
    if (GameState.specialAmmo) startMsg += ' 多功能炮弹已装载！';
    showMessage(startMsg, 3000);
}

// 创建额外坦克（学校作业无错误奖励）
let extraTank = null;
let extraTankTurret = null;
let extraTankBarrel = null;

function createExtraTank() {
    // 创建额外坦克 - 使用红色系与主坦克区分
    extraTank = new THREE.Group();
    
    const tankColor = 0xF44336; // 红色
    const tankDarkColor = 0xD32F2F; // 深红色
    
    // 车身 - 比主坦克略小
    const bodyGeometry = new THREE.BoxGeometry(2.6, 1.0, 3.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: tankColor,
        roughness: 0.4,
        metalness: 0.5,
        emissive: 0xB71C1C,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    body.castShadow = true;
    extraTank.add(body);
    
    // 红色车身装饰条纹
    const stripeGeometry = new THREE.BoxGeometry(2.2, 0.1, 2.5);
    const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, // 白色条纹
        roughness: 0.3,
        metalness: 0.6
    });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.y = 1.26;
    extraTank.add(stripe);
    
    // 履带
    const trackGeometry = new THREE.BoxGeometry(0.7, 0.5, 3.8);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x424242,
        roughness: 0.9
    });
    
    const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    leftTrack.position.set(-1.4, 0.35, 0);
    leftTrack.castShadow = true;
    extraTank.add(leftTrack);
    
    const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    rightTrack.position.set(1.4, 0.35, 0);
    rightTrack.castShadow = true;
    extraTank.add(rightTrack);
    
    // 炮塔
    extraTankTurret = new THREE.Group();
    
    const turretGeometry = new THREE.CylinderGeometry(0.85, 1.0, 0.7, 8);
    const turretMaterial = new THREE.MeshStandardMaterial({
        color: tankDarkColor,
        roughness: 0.4,
        metalness: 0.5,
        emissive: 0xB71C1C,
        emissiveIntensity: 0.15
    });
    const turretMesh = new THREE.Mesh(turretGeometry, turretMaterial);
    turretMesh.position.y = 1.6;
    turretMesh.castShadow = true;
    extraTankTurret.add(turretMesh);
    
    // 炮管 - 略短
    extraTankBarrel = new THREE.Group();
    const barrelGeometry = new THREE.CylinderGeometry(0.13, 0.18, 5, 8);
    const barrelMaterial = new THREE.MeshStandardMaterial({
        color: 0x424242,
        roughness: 0.5,
        metalness: 0.5
    });
    const barrelMesh = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrelMesh.rotation.x = -Math.PI / 2;
    barrelMesh.position.z = 2.5;
    barrelMesh.castShadow = true;
    extraTankBarrel.add(barrelMesh);
    
    // 炮口
    const muzzleGeometry = new THREE.CylinderGeometry(0.16, 0.13, 0.25, 8);
    const muzzleMaterial = new THREE.MeshStandardMaterial({
        color: 0x212121,
        roughness: 0.4,
        metalness: 0.7
    });
    const muzzle = new THREE.Mesh(muzzleGeometry, muzzleMaterial);
    muzzle.rotation.x = -Math.PI / 2;
    muzzle.position.z = 5.1;
    extraTankBarrel.add(muzzle);
    
    extraTankTurret.add(extraTankBarrel);
    extraTank.add(extraTankTurret);
    
    // 位置在主角右侧
    extraTank.position.set(8, 0, 0);
    scene.add(extraTank);
    
    showMessage('🎖️ 红色支援坦克加入战斗！', 2000);
}

// 更新额外坦克（进攻模式）
function updateExtraTank(deltaTime) {
    if (!extraTank) return;
    
    // 额外坦克跟随主坦克前进，保持一定偏移
    const targetZ = tank.position.z + 5; // 在主坦克后方5个单位
    const targetX = tank.position.x + 8; // 在主坦克右侧8个单位
    
    // 平滑移动
    const moveSpeed = 4;
    const dx = targetX - extraTank.position.x;
    const dz = targetZ - extraTank.position.z;
    
    extraTank.position.x += dx * moveSpeed * deltaTime * 0.5;
    extraTank.position.z += dz * moveSpeed * deltaTime * 0.5;
    
    // 额外坦克也自动向前推进（稍微慢一点）
    extraTank.position.z -= 3.5 * deltaTime;
    
    // 找到前方的敌人
    let targetEnemy = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
        if (!enemy.userData.isAlive) continue;
        // 只攻击前方的敌人
        if (enemy.position.z > extraTank.position.z + 5) continue;
        
        const distance = extraTank.position.distanceTo(enemy.position);
        if (distance < minDistance && distance < 80) {
            minDistance = distance;
            targetEnemy = enemy;
        }
    }
    
    // 坦克朝向
    let targetRotation = Math.PI; // 默认向前
    
    if (targetEnemy) {
        const direction = new THREE.Vector3();
        direction.subVectors(targetEnemy.position, extraTank.position);
        direction.y = 0;
        direction.normalize();
        targetRotation = Math.atan2(direction.x, direction.z);
    }
    
    // 平滑转向
    const rotationDiff = targetRotation - extraTank.rotation.y;
    let normalizedDiff = rotationDiff;
    while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
    while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
    extraTank.rotation.y += normalizedDiff * 2.0 * deltaTime;
    
    // 自动瞄准和射击
    if (targetEnemy && extraTankTurret && extraTankBarrel) {
        const barrelTip = new THREE.Vector3(0, 0, 6.1);
        barrelTip.applyMatrix4(extraTankBarrel.matrixWorld);
        
        const targetPos = targetEnemy.position.clone();
        targetPos.y = 0.6;
        
        const aimAngles = calculateParabolicAngle(targetPos, barrelTip, 35);
        
        if (aimAngles) {
            const targetTurretY = aimAngles.horizontal - extraTank.rotation.y;
            let turretDiff = targetTurretY - extraTankTurret.rotation.y;
            while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
            while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
            
            const targetBarrelX = -aimAngles.vertical;
            let barrelDiff = targetBarrelX - extraTankBarrel.rotation.x;
            
            // 平滑旋转
            extraTankTurret.rotation.y += turretDiff * 3.0 * deltaTime;
            extraTankBarrel.rotation.x += barrelDiff * 3.0 * deltaTime;
            extraTankBarrel.rotation.x = Math.max(-0.5, Math.min(0.5, extraTankBarrel.rotation.x));
            
            // 检查瞄准
            const aimThreshold = 0.15;
            const isAimed = Math.abs(turretDiff) < aimThreshold && Math.abs(barrelDiff) < aimThreshold;
            
            const now = performance.now();
            const canFire = now - (extraTank.userData.lastFireTime || 0) > 1000;
            
            if (isAimed && canFire) {
                extraTank.userData.lastFireTime = now;
                fireProjectileFromTank(extraTank, extraTankTurret, extraTankBarrel);
            }
        }
    } else {
        // 没有敌人，炮塔指向前方
        const targetTurretY = Math.PI - extraTank.rotation.y;
        let turretDiff = targetTurretY - extraTankTurret.rotation.y;
        while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
        while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
        extraTankTurret.rotation.y += turretDiff * 2.0 * deltaTime;
        extraTankBarrel.rotation.x = 0;
    }
}

function exitGame() {
    GameState.isPlaying = false;
    cleanupThreeJS();
    window.location.href = 'home.html';
}

function playAgain() {
    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
    cleanupThreeJS();
}

// 计时器
let timerInterval;
function startTimer() {
    timerInterval = setInterval(() => {
        if (!GameState.isPlaying) {
            clearInterval(timerInterval);
            return;
        }

        // Boss出现时停止倒计时
        if (GameState.bossSpawned) {
            clearInterval(timerInterval);
            return;
        }

        GameState.timeRemaining--;

        if (GameState.timeRemaining <= 0) {
            endGame(false);
        }
    }, 1000);
}

// 结束游戏
function endGame(victory = false) {
    GameState.isPlaying = false;
    clearInterval(timerInterval);

    // 计算奖励
    const baseCoins = Math.floor(GameState.score / 100);
    const perfectBonus = GameState.mistakes === 0 ? 10 : 0;
    const bossBonus = GameState.bossDefeated ? 20 : 0;
    const totalCoins = baseCoins + perfectBonus + bossBonus + Math.min(5, Math.floor(GameState.kills / 5));

    // 计算评级
    let rank = 'C';
    let medal = '🥉';
    if (victory || GameState.bossDefeated) {
        rank = 'S';
        medal = '🏆';
    } else if (GameState.score >= 700) {
        rank = 'A';
        medal = '🥇';
    } else if (GameState.score >= 400) {
        rank = 'B';
        medal = '🥈';
    }

    // 发放金币
    if (typeof addCoins === 'function') {
        addCoins(totalCoins);
    }

    // 更新结果页面
    document.getElementById('resultKills').textContent = GameState.kills;
    document.getElementById('resultScore').textContent = GameState.score;
    document.getElementById('resultRank').textContent = rank;
    document.getElementById('medal').textContent = medal;
    document.getElementById('rewardCoins').textContent = totalCoins;

    // 鼓励语
    let encouragement;
    if (victory || GameState.bossDefeated) {
        encouragement = '🎉 太棒了！你战胜了粗心大王，以后做作业一定要细心哦！';
    } else {
        encouragement = Encouragements[Math.min(GameState.mistakes, 9)] || Encouragements[9];
    }
    document.getElementById('encouragement').textContent = encouragement;

    // 切换页面
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('active');

    // 清理
    cleanupThreeJS();
}

// 更新HUD
function updateHUD() {
    const config = WeaponConfig[GameState.weaponLevel];

    document.getElementById('scoreDisplay').textContent = GameState.score;
    document.getElementById('killDisplay').textContent = GameState.kills;
    document.getElementById('ammoDisplay').textContent = GameState.ammo;
    document.getElementById('ammoTotal').textContent = GameState.maxAmmo;

    document.getElementById('hudFireRate').style.width = (100 - config.fireRate / 6) + '%';
    document.getElementById('hudPower').style.width = config.damage + '%';
    document.getElementById('hudAccuracy').style.width = (config.accuracy * 100) + '%';

    // 更新距离老巢的距离
    if (tank) {
        const distanceToBase = Math.max(0, Math.floor(250 + tank.position.z));
        const distanceEl = document.getElementById('distanceDisplay');
        if (distanceEl) {
            distanceEl.textContent = distanceToBase + 'm';
        }
    }
}

// 显示消息
function showMessage(text, duration = 2000) {
    const msgEl = document.getElementById('gameMessage');
    msgEl.textContent = text;
    msgEl.classList.add('show');

    setTimeout(() => {
        msgEl.classList.remove('show');
    }, duration);
}

// ========== Three.js 3D场景 ==========
function initThreeJS() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('gameScreen');

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3, 8);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 清理旧的Boss
    if (GameState.boss) {
        scene.remove(GameState.boss);
        GameState.boss = null;
    }

    // 设置灯光
    setupLights();

    // 创建地形
    createTerrain();

    // 创建坦克
    createTank();

    // 生成敌人
    spawnEnemies();

    // 创建粒子系统
    createAmbientParticles();

    // 创建脑区范围显示
    createBrainZone();

    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);
}

// 创建脑区范围可视化
let brainZone;
function createBrainZone() {
    // 创建一个半透明的圆形区域，代表大脑脑区
    const zoneGeometry = new THREE.CircleGeometry(28, 64);
    const zoneMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a90d9,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    brainZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
    brainZone.rotation.x = -Math.PI / 2;
    brainZone.position.set(0, 0.05, 12); // 稍微抬高一点，避免与地面重叠
    scene.add(brainZone);

    // 添加外圈边框
    const ringGeometry = new THREE.RingGeometry(27, 28, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x6bb6ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.06, 12);
    scene.add(ring);

    // 添加网格线效果
    const gridGeometry = new THREE.RingGeometry(14, 14.2, 64);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x8ec5fc,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const innerRing = new THREE.Mesh(gridGeometry, gridMaterial);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.set(0, 0.06, 12);
    scene.add(innerRing);

    // 添加文字标签
    createBrainZoneLabel();
}

// 创建脑区标签
function createBrainZoneLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 绘制背景
    ctx.fillStyle = 'rgba(74, 144, 217, 0.8)';
    ctx.roundRect(0, 0, 256, 64, 10);
    ctx.fill();

    // 绘制文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧠 大脑防御区', 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(12, 3);
    const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });

    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0.5, -5);
    label.rotation.x = -Math.PI / 4;
    scene.add(label);
}

// 设置灯光
function setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
    scene.add(ambientLight);

    // 主光源（黄昏太阳）
    const sunLight = new THREE.DirectionalLight(0xffaa44, 1.2);
    sunLight.position.set(50, 30, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    fillLight.position.set(-30, 20, 30);
    scene.add(fillLight);
}

// 创建地形
function createTerrain() {
    // 主地面 - 长条形，沿Z轴延伸
    const groundGeometry = new THREE.PlaneGeometry(100, 400, 20, 80);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a5d3a,
        roughness: 0.9,
        metalness: 0.1
    });

    terrain = new THREE.Mesh(groundGeometry, groundMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.z = -100; // 地面向前延伸
    terrain.receiveShadow = true;
    scene.add(terrain);

    // 创建道路
    createRoad();

    // 添加路边装饰
    createRoadsideDecorations();

    // 创建敌人老巢
    createEnemyBase();
}

// 创建道路
function createRoad() {
    const roadGeometry = new THREE.PlaneGeometry(12, 400, 1, 80);
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b6b6b,
        roughness: 0.8,
        metalness: 0.2
    });

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.position.z = -100;
    road.receiveShadow = true;
    scene.add(road);

    // 道路中心线
    const lineGeometry = new THREE.PlaneGeometry(0.3, 400, 1, 80);
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.6
    });

    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.03;
    centerLine.position.z = -100;
    scene.add(centerLine);

    // 路边标记（每20米一个）
    for (let z = 0; z > -300; z -= 20) {
        // 左侧标记
        const leftMarker = createRoadMarker();
        leftMarker.position.set(-7, 0.5, z);
        scene.add(leftMarker);

        // 右侧标记
        const rightMarker = createRoadMarker();
        rightMarker.position.set(7, 0.5, z);
        scene.add(rightMarker);
    }
}

// 创建路边标记
function createRoadMarker() {
    const markerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
    const markerMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF6B35,
        emissive: 0xFF4500,
        emissiveIntensity: 0.3
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.castShadow = true;
    return marker;
}

// 创建路边装饰
function createRoadsideDecorations() {
    // 左侧树木
    for (let z = 0; z > -300; z -= 15) {
        const offset = (Math.random() - 0.5) * 10;
        createTree(-20 + offset, z);
    }

    // 右侧树木
    for (let z = -10; z > -300; z -= 18) {
        const offset = (Math.random() - 0.5) * 10;
        createTree(20 + offset, z);
    }

    // 随机岩石
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 20);
        const z = -Math.random() * 280;
        createRock(x, z);
    }
}

// 创建树木
function createTree(x, z) {
    const tree = new THREE.Group();

    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    // 树冠
    const crownGeometry = new THREE.ConeGeometry(2.5, 5, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 4.5;
    crown.castShadow = true;
    tree.add(crown);

    tree.position.set(x, 0, z);
    scene.add(tree);
}

// 创建岩石
function createRock(x, z) {
    const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 1.5 + 0.5, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, 0.5, z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
}

// 创建敌人老巢
function createEnemyBase() {
    const baseGroup = new THREE.Group();

    // 主建筑 - 巨大的黑色城堡
    const mainBuildingGeometry = new THREE.BoxGeometry(30, 20, 20);
    const mainBuildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2a,
        roughness: 0.7,
        metalness: 0.3
    });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
    mainBuilding.position.y = 10;
    mainBuilding.castShadow = true;
    baseGroup.add(mainBuilding);

    // 两个侧塔
    const towerGeometry = new THREE.CylinderGeometry(4, 4, 25, 16);
    const towerMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        roughness: 0.6,
        metalness: 0.4
    });

    const leftTower = new THREE.Mesh(towerGeometry, towerMaterial);
    leftTower.position.set(-12, 12.5, 5);
    leftTower.castShadow = true;
    baseGroup.add(leftTower);

    const rightTower = new THREE.Mesh(towerGeometry, towerMaterial);
    rightTower.position.set(12, 12.5, 5);
    rightTower.castShadow = true;
    baseGroup.add(rightTower);

    // 塔顶发光
    const topLightGeometry = new THREE.SphereGeometry(2, 16, 16);
    const topLightMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1
    });

    const leftTopLight = new THREE.Mesh(topLightGeometry, topLightMaterial);
    leftTopLight.position.set(-12, 26, 5);
    baseGroup.add(leftTopLight);

    const rightTopLight = new THREE.Mesh(topLightGeometry, topLightMaterial);
    rightTopLight.position.set(12, 26, 5);
    baseGroup.add(rightTopLight);

    // 大门
    const gateGeometry = new THREE.BoxGeometry(10, 12, 2);
    const gateMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a0000,
        emissive: 0x2a0000,
        emissiveIntensity: 0.5
    });
    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
    gate.position.set(0, 6, 11);
    baseGroup.add(gate);

    // 大门发光边框
    const gateFrameGeometry = new THREE.BoxGeometry(11, 13, 1);
    const gateFrameMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.3
    });
    const gateFrame = new THREE.Mesh(gateFrameGeometry, gateFrameMaterial);
    gateFrame.position.set(0, 6, 10.5);
    baseGroup.add(gateFrame);

    // 老巢位置 - 在道路尽头
    baseGroup.position.set(0, 0, -250);
    scene.add(baseGroup);

    // 保存老巢引用
    GameState.enemyBase = baseGroup;

    // 添加老巢标签
    createBaseLabel();
}

// 创建老巢标签
function createBaseLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.8)');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 4;
    ctx.roundRect(2, 2, 508, 124, 18);
    ctx.stroke();

    // 绘制文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏰 粗心大王的老巢', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(40, 10);
    const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });

    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 35, -240);
    label.rotation.x = 0;
    scene.add(label);
}

// 创建坦克
function createTank() {
    tank = new THREE.Group();

    // 主坦克使用亮蓝色，与战场环境明显区分
    const tankColor = 0x2196F3; // 亮蓝色
    const tankDarkColor = 0x1976D2; // 深蓝色

    // 坦克车身 - 注意：车身长轴在Z方向，前面是Z正方向
    const bodyGeometry = new THREE.BoxGeometry(3, 1.2, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: tankColor,
        roughness: 0.4,
        metalness: 0.5,
        emissive: 0x0D47A1,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    tank.add(body);

    // 车身顶部条纹装饰
    const stripeGeometry = new THREE.BoxGeometry(2.5, 0.1, 3);
    const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFEB3B, // 黄色条纹
        roughness: 0.3,
        metalness: 0.6
    });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.y = 1.46;
    tank.add(stripe);

    // 坦克履带
    const trackGeometry = new THREE.BoxGeometry(0.8, 0.6, 4.2);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x424242,
        roughness: 0.9
    });

    const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    leftTrack.position.set(-1.6, 0.4, 0);
    leftTrack.castShadow = true;
    tank.add(leftTrack);

    const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    rightTrack.position.set(1.6, 0.4, 0);
    rightTrack.castShadow = true;
    tank.add(rightTrack);

    // 炮塔
    turret = new THREE.Group();

    const turretGeometry = new THREE.CylinderGeometry(1, 1.2, 0.8, 8);
    const turretMaterial = new THREE.MeshStandardMaterial({
        color: tankDarkColor,
        roughness: 0.4,
        metalness: 0.5,
        emissive: 0x0D47A1,
        emissiveIntensity: 0.15
    });
    const turretMesh = new THREE.Mesh(turretGeometry, turretMaterial);
    turretMesh.position.y = 1.8;
    turretMesh.castShadow = true;
    turret.add(turretMesh);

    // 炮管 - 指向Z轴正方向（前方）
    barrel = new THREE.Group();

    // 炮管 - 使用亮黄色，更容易看清
    const barrelGeometry = new THREE.CylinderGeometry(0.15, 0.2, 6, 8);
    const barrelMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // 亮黄色
        roughness: 0.4,
        metalness: 0.6
    });
    const barrelMesh = new THREE.Mesh(barrelGeometry, barrelMaterial);
    // 炮管初始指向Z轴正方向（前方）
    barrelMesh.rotation.x = -Math.PI / 2;
    // 位置调整到炮管中心
    barrelMesh.position.z = 3;
    barrelMesh.castShadow = true;
    barrel.add(barrelMesh);

    // 炮口
    const muzzleGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.3, 8);
    const muzzleMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.4,
        metalness: 0.7
    });
    const muzzle = new THREE.Mesh(muzzleGeometry, muzzleMaterial);
    muzzle.rotation.x = -Math.PI / 2;
    // 炮口在炮管前端
    muzzle.position.z = 6.1;
    barrel.add(muzzle);

    turret.add(barrel);
    tank.add(turret);

    // 坦克放在原点，朝向Z轴正方向（前方）
    // 相机放在坦克后方（Z轴负方向），看向前方
    tank.position.set(0, 0, 0);
    
    scene.add(tank);
}

// 生成敌人
function spawnEnemies() {
    const enemyColors = [0x8B0000, 0x4B0082, 0x2F4F4F];

    for (let i = 0; i < 30; i++) {
        const enemy = new THREE.Group();

        // 糊涂虫形象 - 用球体和圆环组合
        const bugColor = enemyColors[Math.floor(Math.random() * enemyColors.length)];
        const bugMaterial = new THREE.MeshStandardMaterial({
            color: bugColor,
            roughness: 0.4,
            metalness: 0.2
        });

        // 身体主体 - 大球体（放大1.5倍）
        const bodyGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const body = new THREE.Mesh(bodyGeometry, bugMaterial);
        body.position.y = 1.2;
        body.scale.y = 0.8; // 稍微压扁
        body.castShadow = true;
        enemy.add(body);

        // 眼睛 - 两个小白球（放大）
        const eyeGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.2,
            metalness: 0.1
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.6, 2.0, 0.8);
        enemy.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.6, 2.0, 0.8);
        enemy.add(rightEye);

        // 眼珠 - 小黑点（斗鸡眼效果，显得糊涂）
        const pupilGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.5, 2.0, 1.15);
        enemy.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.5, 2.0, 1.15);
        enemy.add(rightPupil);

        // 触角 - 两个细长的圆柱体（放大）
        const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8);
        const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

        const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        leftAntenna.position.set(-0.8, 2.6, 0.3);
        leftAntenna.rotation.z = 0.3;
        leftAntenna.rotation.x = -0.2;
        enemy.add(leftAntenna);

        const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        rightAntenna.position.set(0.8, 2.6, 0.3);
        rightAntenna.rotation.z = -0.3;
        rightAntenna.rotation.x = -0.2;
        enemy.add(rightAntenna);

        // 触角顶端小球（放大）
        const antennaTipGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const antennaTipMaterial = new THREE.MeshStandardMaterial({ color: bugColor });

        const leftTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
        leftTip.position.set(-1.0, 3.1, 0.15);
        enemy.add(leftTip);

        const rightTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
        rightTip.position.set(1.0, 3.1, 0.15);
        enemy.add(rightTip);

        // 敌人在坦克前方生成（Z轴负方向）
        const angle = (Math.random() - 0.5) * Math.PI * 0.5; // 扇形分布在前方
        const distance = 30 + i * 10 + Math.random() * 20; // 从30到180的距离

        enemy.position.set(
            Math.sin(angle) * distance * 0.3, // X方向分散
            1.2, // 更新y坐标适应新的身体大小
            -distance // Z轴负方向（前方）
        );

        // 随机分配敌人类型
        const enemyTypes = ['basic', 'shooter', 'charger', 'dodger'];
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        enemy.userData = {
            health: 100,
            maxHealth: 100,
            isAlive: true,
            enemyType: enemyType,
            moveSpeed: Math.random() * 0.05 + 0.03,
            moveDirection: Math.random() * Math.PI * 2,
            lastBubbleTime: 0,
            lastAttackTime: 0,
            attackInterval: 2000 + Math.random() * 2000
        };

        // 根据类型设置不同属性
        switch (enemyType) {
            case 'basic':
                enemy.userData.moveSpeed = 0.03;
                enemy.userData.health = 80;
                break;
            case 'shooter':
                enemy.userData.moveSpeed = 0.02;
                enemy.userData.health = 60;
                enemy.userData.attackInterval = 1500;
                // 给射手敌人添加枪管
                const gunBarrel = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, 0.8),
                    new THREE.MeshStandardMaterial({ color: 0x333333 })
                );
                gunBarrel.rotation.x = Math.PI / 2;
                gunBarrel.position.set(0, 1.2, 1.2);
                enemy.add(gunBarrel);
                break;
            case 'charger':
                enemy.userData.moveSpeed = 0.08;
                enemy.userData.health = 120;
                // 冲锋敌人更大更红
                body.scale.set(1.2, 1.2, 1.2);
                body.material = body.material.clone();
                body.material.color.setHex(0xCC0000);
                break;
            case 'dodger':
                enemy.userData.moveSpeed = 0.05;
                enemy.userData.health = 70;
                // 闪避敌人更灵活
                enemy.userData.dodgeCooldown = 0;
                break;
        }

        scene.add(enemy);
        enemies.push(enemy);
    }
}

// 创建环境粒子（烟雾/尘土）
function createAmbientParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;

        // 黄昏色调
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

// 绑定鼠标事件
function bindMouseEvents() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('gameScreen');
    const crosshair = document.getElementById('crosshair');

    // 鼠标移动 - 控制瞄准和准星
    document.addEventListener('mousemove', (e) => {
        if (!GameState.isPlaying) return;

        const rect = container.getBoundingClientRect();
        
        // 计算鼠标在屏幕上的相对位置 (-1 到 1)
        const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // 更新全局鼠标变量（用于炮管控制）
        mouseX = rawX;
        mouseY = rawY;

        // 更新准星位置（跟随鼠标）
        if (crosshair) {
            const percentX = ((e.clientX - rect.left) / rect.width) * 100;
            const percentY = ((e.clientY - rect.top) / rect.height) * 100;
            crosshair.style.left = percentX + '%';
            crosshair.style.top = percentY + '%';
            crosshair.style.transform = 'translate(-50%, -50%)';
        }
    });

    // 鼠标点击 - 发射炮弹
    document.addEventListener('mousedown', (e) => {
        if (!GameState.isPlaying) return;
        if (e.button === 0) {
            e.preventDefault();
            fireProjectile();
        }
    });
}

// 从指定坦克发射炮弹（用于额外坦克）
function fireProjectileFromTank(sourceTank, sourceTurret, sourceBarrel) {
    const config = WeaponConfig[GameState.weaponLevel];
    
    // 播放音效
    playShootSound();
    
    // 后坐力动画
    sourceBarrel.position.z = -0.3;
    setTimeout(() => {
        sourceBarrel.position.z = 0;
    }, 100);
    
    // 创建炮弹（额外坦克使用普通炮弹）
    createProjectile(sourceTank, sourceTurret, sourceBarrel, config, false);
}

// 创建炮弹
function createProjectile(sourceTank, sourceTurret, sourceBarrel, config, isMainTank) {
    // 判断是否使用多功能炮弹（家里作业无错误奖励，仅主坦克）
    const isSpecialAmmo = isMainTank && GameState.specialAmmo && Math.random() < 0.7;
    
    // 创建炮弹 - 加大尺寸和效果
    const projectileSize = isSpecialAmmo ? 0.8 : 0.6; // 更大的炮弹尺寸
    const projectileGeometry = new THREE.SphereGeometry(projectileSize, 16, 16);
    const projectileMaterial = new THREE.MeshStandardMaterial({
        color: isSpecialAmmo ? 0x00FF00 : 0xFF6B35,
        emissive: isSpecialAmmo ? 0x00AA00 : 0xFF4500,
        emissiveIntensity: 3.0, // 更强的发光
        roughness: 0.3,
        metalness: 0.8
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // 添加炮弹光晕效果
    const glowGeometry = new THREE.SphereGeometry(projectileSize * 2.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: isSpecialAmmo ? 0x00FF00 : 0xFFAA00,
        transparent: true,
        opacity: 0.8, // 更高的不透明度
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    projectile.add(glow);
    
    // 添加炮弹尾焰光
    const projectileLight = new THREE.PointLight(isSpecialAmmo ? 0x00FF00 : 0xFF6B35, 3, 20); // 更强的光源
    projectileLight.position.set(0, 0, 0);
    projectile.add(projectileLight);

    // 获取炮管前端世界位置
    const barrelLength = isMainTank ? 6.1 : 5.1;
    const barrelTip = new THREE.Vector3(0, 0, barrelLength);
    barrelTip.applyMatrix4(sourceBarrel.matrixWorld);
    projectile.position.copy(barrelTip);

    // 计算发射方向（考虑精准度）
    const accuracy = config.accuracy;
    const spread = isSpecialAmmo ? 0 : (1 - accuracy) * 0.02; // 很小的散布

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(sourceTurret.quaternion);
    direction.applyQuaternion(sourceTank.quaternion);
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    const speed = 35; // 与瞄准计算保持一致
    const now = performance.now();

    projectile.userData = {
        velocity: direction.multiplyScalar(speed),
        damage: isSpecialAmmo ? config.damage * 2 : config.damage,
        created: now,
        isSpecial: isSpecialAmmo
    };

    scene.add(projectile);
    projectiles.push(projectile);

    // 炮口闪光
    createMuzzleFlash(barrelTip);
}

// 主坦克发射炮弹
function fireProjectile() {
    const now = performance.now();
    const config = WeaponConfig[GameState.weaponLevel];

    // 检查射速限制
    if (now - GameState.lastFireTime < config.fireRate) return;

    // 无限弹药，不再检查弹药数量
    // if (GameState.ammo <= 0) {
    //     showMessage('弹药耗尽！', 1000);
    //     return;
    // }

    GameState.lastFireTime = now;
    // 无限弹药，不减弹药
    // GameState.ammo--;
    GameState.shotsFired++;
    updateHUD();

    // 播放音效
    playShootSound();

    // 后坐力动画
    barrel.position.z = -0.3;
    setTimeout(() => {
        barrel.position.z = 0;
    }, 100);

    // 创建炮弹（主坦克）
    createProjectile(tank, turret, barrel, config, true);
}

// 创建炮口闪光 - 增强效果
function createMuzzleFlash(position) {
    // 主闪光 - 更大更亮
    const flashGeometry = new THREE.SphereGeometry(1.2, 12, 12);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 1
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    scene.add(flash);

    // 内层橙色火焰
    const innerFlashGeometry = new THREE.SphereGeometry(0.8, 10, 10);
    const innerFlashMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6600,
        transparent: true,
        opacity: 0.9
    });
    const innerFlash = new THREE.Mesh(innerFlashGeometry, innerFlashMaterial);
    innerFlash.position.copy(position);
    scene.add(innerFlash);

    // 外层红色光晕
    const outerFlashGeometry = new THREE.SphereGeometry(1.8, 12, 12);
    const outerFlashMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF3300,
        transparent: true,
        opacity: 0.5
    });
    const outerFlash = new THREE.Mesh(outerFlashGeometry, outerFlashMaterial);
    outerFlash.position.copy(position);
    scene.add(outerFlash);

    // 点光源照亮周围
    const light = new THREE.PointLight(0xFFAA00, 3, 15);
    light.position.copy(position);
    scene.add(light);

    // 动画
    let frame = 0;
    const animateFlash = () => {
        frame++;
        const progress = frame / 15; // 15帧动画

        if (progress < 1) {
            // 主闪光快速扩大然后消失
            const scale = 1 + progress * 2;
            flash.scale.set(scale, scale, scale);
            flash.material.opacity = 1 - progress;

            // 内层火焰
            const innerScale = 1 + progress * 1.5;
            innerFlash.scale.set(innerScale, innerScale, innerScale);
            innerFlash.material.opacity = 0.9 - progress * 0.9;

            // 外层光晕
            const outerScale = 1 + progress;
            outerFlash.scale.set(outerScale, outerScale, outerScale);
            outerFlash.material.opacity = 0.5 - progress * 0.5;

            // 光源强度衰减
            light.intensity = 3 * (1 - progress);

            requestAnimationFrame(animateFlash);
        } else {
            // 清理
            scene.remove(flash);
            scene.remove(innerFlash);
            scene.remove(outerFlash);
            scene.remove(light);
            flash.geometry.dispose();
            flash.material.dispose();
            innerFlash.geometry.dispose();
            innerFlash.material.dispose();
            outerFlash.geometry.dispose();
            outerFlash.material.dispose();
        }
    };
    animateFlash();
}

// 创建爆炸效果 - 更夸张的效果
// 创建弱化的击中效果（敌方攻击我方时使用）
function createHitEffect(position, scale = 1) {
    // 简单的火花效果，没有声音
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 5,
            (Math.random() - 0.5) * 5
        );
        velocities.push(velocity);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xFF6600,
        size: 0.3 * scale,
        transparent: true,
        opacity: 0.8
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 简单动画
    let frame = 0;
    const animateParticles = () => {
        frame++;
        const positions = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i].x * 0.016;
            positions[i * 3 + 1] += velocities[i].y * 0.016;
            positions[i * 3 + 2] += velocities[i].z * 0.016;

            velocities[i].y -= 9.8 * 0.016;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.material.opacity -= 0.05;

        if (particleSystem.material.opacity > 0 && frame < 30) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particleSystem);
            particleSystem.geometry.dispose();
            particleSystem.material.dispose();
        }
    };
    animateParticles();
}

function createExplosion(position, scale = 1) {
    playExplosionSound();

    // 爆炸光 - 更亮更大
    const light = new THREE.PointLight(0xFF6B35, 5, 50);
    light.position.copy(position);
    scene.add(light);

    // 爆炸光晕
    const glowGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFAA00,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(position);
    scene.add(glow);

    // 动画光晕
    let glowScale = 1;
    const animateGlow = () => {
        if (!glow || !glow.parent) return;
        glowScale += 0.3;
        glow.scale.set(glowScale, glowScale, glowScale);
        glow.material.opacity -= 0.05;
        if (glow.material.opacity > 0) {
            requestAnimationFrame(animateGlow);
        } else {
            scene.remove(glow);
            glow.geometry.dispose();
            glow.material.dispose();
        }
    };
    animateGlow();

    setTimeout(() => {
        scene.remove(light);
    }, 300);

    // 爆炸粒子 - 更多更大
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;

        // 更快的爆炸速度
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            Math.random() * 20 + 5,
            (Math.random() - 0.5) * 20
        );
        velocities.push(velocity);

        // 随机颜色（橙色到黄色）
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.5;
        colors[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.0 * scale,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 动画
    let frame = 0;
    const animateExplosion = () => {
        frame++;
        const positions = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i].x * 0.016;
            positions[i * 3 + 1] += velocities[i].y * 0.016;
            positions[i * 3 + 2] += velocities[i].z * 0.016;

            velocities[i].y -= 15 * 0.016; // 更强的重力
            velocities[i].multiplyScalar(0.98); // 空气阻力
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.material.opacity -= 0.015;

        if (particleSystem.material.opacity > 0 && frame < 80) {
            requestAnimationFrame(animateExplosion);
        } else {
            scene.remove(particleSystem);
            geometry.dispose();
            material.dispose();
        }
    };
    animateExplosion();

    // 添加冲击波效果
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(position);
    shockwave.rotation.x = -Math.PI / 2;
    scene.add(shockwave);

    let shockwaveScale = 1;
    const animateShockwave = () => {
        shockwaveScale += 0.5;
        shockwave.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        shockwave.material.opacity -= 0.03;
        if (shockwave.material.opacity > 0) {
            requestAnimationFrame(animateShockwave);
        } else {
            scene.remove(shockwave);
            shockwave.geometry.dispose();
            shockwave.material.dispose();
        }
    };
    animateShockwave();
}

// 动画循环
function animate() {
    if (!GameState.isPlaying) return;

    animationId = requestAnimationFrame(animate);

    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    // 更新相机位置 - 跟随坦克前进
    if (camera && tank) {
        // 相机跟随坦克，保持固定偏移
        const targetCamX = tank.position.x * 0.3; // 轻微跟随坦克左右移动
        const targetCamY = 25; // 相机高度
        const targetCamZ = tank.position.z + 30; // 相机在坦克后方
        
        // 平滑相机移动
        camera.position.x += (targetCamX - camera.position.x) * 0.1;
        camera.position.y += (targetCamY - camera.position.y) * 0.1;
        camera.position.z += (targetCamZ - camera.position.z) * 0.1;
        
        // 相机看向坦克前方
        camera.lookAt(tank.position.x, 0, tank.position.z - 20);
    }

    // 坦克AI（进攻模式）
    // 只要游戏进行中就执行AI
    if (GameState.autoMoveEnabled && tank && GameState.isPlaying) {
        updateTankAI(deltaTime);
    }

    // 更新抛物线轨迹预览
    updateTrajectoryLine();

    // 更新额外坦克（如果存在）
    if (extraTank) {
        updateExtraTank(deltaTime);
    }

    // 更新炮弹
    updateProjectiles(deltaTime);

    // 更新敌人
    updateEnemies(deltaTime);

    // 更新Boss
    updateBoss(deltaTime);

    // 更新Boss炮弹
    updateBossProjectiles(deltaTime);

    // 更新敌人炮弹
    updateEnemyProjectiles(deltaTime);

    // 更新守城怪兽攻击
    updateGateGuardsAttack(deltaTime);

    // 更新粒子
    updateParticles();

    // 更新HUD（距离显示）
    updateHUD();

    // 确保场景、相机和渲染器都存在才渲染
    if (scene && camera && renderer) {
        // 更新矩阵世界，避免matrixWorldInverse错误
        if (camera.matrixWorldNeedsUpdate) {
            camera.updateMatrixWorld();
        }
        renderer.render(scene, camera);
    }
}

// 计算抛物线射击角度 - 使用更可靠的迭代方法
function calculateParabolicAngle(targetPos, startPos, initialSpeed) {
    const dx = targetPos.x - startPos.x;
    const dy = targetPos.y - startPos.y;
    const dz = targetPos.z - startPos.z;
    
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
    
    // 如果水平距离为0，直接返回
    if (horizontalDistance < 0.1) {
        return {
            vertical: 0,
            horizontal: Math.atan2(dx, dz),
            distance: 0
        };
    }
    
    // 使用直线瞄准：直接指向目标
    // 计算垂直角度（仰角）
    const verticalAngle = Math.atan2(dy, horizontalDistance);
    
    // 计算水平方向角度
    const horizontalAngle = Math.atan2(dx, dz);
    
    return {
        vertical: verticalAngle,
        horizontal: horizontalAngle,
        distance: horizontalDistance
    };
}

// 坦克自动寻敌移动和射击（进攻模式）
function updateTankAI(deltaTime) {
    const config = WeaponConfig[GameState.weaponLevel];
    
    // 检查游戏阶段
    checkGamePhase();
    
    // 根据游戏阶段执行不同逻辑
    switch (GameState.gamePhase) {
        case 'march':
            // 行军阶段：向前推进
            updateMarchPhase(deltaTime, config);
            break;
        case 'siege':
            // 攻城阶段：攻击守城怪兽
            updateSiegePhase(deltaTime, config);
            break;
        case 'boss':
            // Boss战阶段
            updateBossPhase(deltaTime, config);
            break;
    }
}

// 检查游戏阶段
function checkGamePhase() {
    // 如果已经在攻城或Boss阶段，不再切换
    if (GameState.gamePhase !== 'march') return;
    
    // 到达城堡前30米，进入攻城阶段
    if (tank.position.z <= -220) {
        GameState.gamePhase = 'siege';
        spawnGateGuards();
        showMessage('⚠️ 到达城堡！消灭守城怪兽！', 3000);
    }
}

// 行军阶段
function updateMarchPhase(deltaTime, config) {
    // 坦克始终向前推进（Z轴负方向）
    const forwardSpeed = 4;
    tank.position.z -= forwardSpeed * deltaTime;
    
    // 更新当前推进距离
    GameState.currentDistance = Math.abs(tank.position.z);
    
    // 找到最近的敌人
    let nearestEnemy = findNearestEnemy();
    GameState.currentTarget = nearestEnemy;
    
    // 坦克朝向和射击
    updateTankOrientation(deltaTime, nearestEnemy, config);
}

// 攻城阶段
function updateSiegePhase(deltaTime, config) {
    // 检查守城怪兽是否全部消灭
    const aliveGuards = GameState.gateGuards.filter(g => g.userData.isAlive);
    
    // 调试信息
    console.log('攻城阶段 - 存活守城怪兽:', aliveGuards.length, '大门打开:', GameState.gateOpen);

    // 找到最近的守城怪兽
    let nearestGuard = null;
    let minGuardDistance = Infinity;
    for (const guard of aliveGuards) {
        const dist = tank.position.distanceTo(guard.position);
        if (dist < minGuardDistance) {
            minGuardDistance = dist;
            nearestGuard = guard;
        }
    }

    // 如果还有存活的守城怪兽
    if (aliveGuards.length > 0) {
        // 检查是否遇到守城怪兽（距离小于40）
        if (minGuardDistance < 40) {
            // 停止移动，攻击守城怪兽
            // 坦克只朝向和射击，不移动
            GameState.currentTarget = nearestGuard;
            updateTankOrientation(deltaTime, nearestGuard, config);
        } else {
            // 还没遇到守城怪兽，继续向前移动
            const forwardSpeed = 2;
            tank.position.z -= forwardSpeed * deltaTime;

            // 找到最近的普通敌人
            let nearestEnemy = findNearestEnemy();
            GameState.currentTarget = nearestEnemy;
            updateTankOrientation(deltaTime, nearestEnemy, config);
        }
    } else if (!GameState.gateOpen) {
        // 消灭所有守城怪兽，打开大门
        openGate();
        GameState.gateOpen = true;
        GameState.bossSpawned = true; // 标记Boss已生成，停止倒计时
        showMessage('🚪 大门打开！Boss出现了！', 3000);

        // 立即进入Boss战并生成Boss
        GameState.gamePhase = 'boss';
        spawnBoss();
    } else {
        // 大门已打开，坦克进入城堡
        const forwardSpeed = 3;
        tank.position.z -= forwardSpeed * deltaTime;

        // 找到最近的敌人
        let nearestEnemy = findNearestEnemy();
        GameState.currentTarget = nearestEnemy;
        updateTankOrientation(deltaTime, nearestEnemy, config);
    }
}

// Boss战阶段
function updateBossPhase(deltaTime, config) {
    // 找到最近的敌人（包括小糊涂虫）
    let nearestEnemy = findNearestEnemy();

    // 如果Boss存在且存活，优先攻击Boss
    if (GameState.boss && GameState.boss.userData.isAlive) {
        const distToBoss = tank.position.distanceTo(GameState.boss.position);
        
        // 如果Boss在攻击范围内（50米内），坦克停下来攻击
        if (distToBoss < 50) {
            nearestEnemy = GameState.boss;
            
            // 坦克停止移动，专注攻击Boss
            // 保持与Boss的安全距离（30米左右）
            const idealDistance = 30;
            if (distToBoss > idealDistance + 5) {
                // Boss太远，稍微前进一点
                const forwardSpeed = 1;
                tank.position.z -= forwardSpeed * deltaTime;
            } else if (distToBoss < idealDistance - 5) {
                // Boss太近，稍微后退
                const backSpeed = 1;
                tank.position.z += backSpeed * deltaTime;
            }
            // 否则保持原地不动
        } else {
            // Boss还太远，继续向前移动
            const forwardSpeed = 2;
            tank.position.z -= forwardSpeed * deltaTime;
        }
    } else {
        // Boss已被消灭，继续向前清场
        const forwardSpeed = 2;
        tank.position.z -= forwardSpeed * deltaTime;
    }

    GameState.currentTarget = nearestEnemy;

    // 坦克朝向和射击
    if (nearestEnemy) {
        const direction = new THREE.Vector3();
        direction.subVectors(nearestEnemy.position, tank.position);
        direction.y = 0;
        direction.normalize();

        const targetRotation = Math.atan2(direction.x, direction.z);
        const rotationDiff = targetRotation - tank.rotation.y;
        let normalizedDiff = rotationDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
        tank.rotation.y += normalizedDiff * 2.0 * deltaTime;

        // 根据目标类型设置瞄准高度
        const aimHeight = (nearestEnemy === GameState.boss) ? 5.0 : 1.2;
        aimAndFire(deltaTime, nearestEnemy, config, aimHeight);
    }
}

// 找到最近的敌人
function findNearestEnemy() {
    let nearestEnemy = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
        if (!enemy.userData.isAlive) continue;
        if (enemy.position.z > tank.position.z + 5) continue;
        
        const distance = tank.position.distanceTo(enemy.position);
        if (distance < minDistance && distance < 100) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    }
    
    return nearestEnemy;
}

// 更新坦克朝向和射击
function updateTankOrientation(deltaTime, nearestEnemy, config) {
    // 检查必要对象是否存在
    if (!tank || !turret || !barrel) return;
    
    // 坦克朝向
    let targetRotation = Math.PI;
    
    if (nearestEnemy) {
        const direction = new THREE.Vector3();
        direction.subVectors(nearestEnemy.position, tank.position);
        direction.y = 0;
        direction.normalize();
        targetRotation = Math.atan2(direction.x, direction.z);
    }
    
    // 平滑转向
    const rotationDiff = targetRotation - tank.rotation.y;
    let normalizedDiff = rotationDiff;
    while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
    while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
    tank.rotation.y += normalizedDiff * 2.0 * deltaTime;
    
    // 瞄准和射击
    if (nearestEnemy) {
        aimAndFire(deltaTime, nearestEnemy, config, 1.2);
    } else {
        // 没有敌人，炮塔指向前方
        const targetTurretY = Math.PI - tank.rotation.y;
        let turretDiff = targetTurretY - turret.rotation.y;
        while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
        while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
        turret.rotation.y += turretDiff * 2.0 * deltaTime;
        barrel.rotation.x = 0;
    }
}

// 瞄准和射击
function aimAndFire(deltaTime, target, config, targetHeight) {
    // 检查barrel是否存在且matrixWorld已更新
    if (!barrel || !barrel.matrixWorld) return;
    
    // 获取炮管前端位置
    const barrelTip = new THREE.Vector3(0, 0, 6.1);
    barrelTip.applyMatrix4(barrel.matrixWorld);
    
    // 计算目标位置
    const targetPos = target.position.clone();
    targetPos.y = targetHeight;
    
    // 计算射击角度
    const aimAngles = calculateParabolicAngle(targetPos, barrelTip, 35);
    
    if (aimAngles) {
        // 计算目标角度
        const targetTurretY = aimAngles.horizontal - tank.rotation.y;
        let turretDiff = targetTurretY - turret.rotation.y;
        while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
        while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
        
        const targetBarrelX = -aimAngles.vertical;
        let barrelDiff = targetBarrelX - barrel.rotation.x;
        
        // 平滑旋转炮塔
        const turretRotationSpeed = 3.0;
        const barrelRotationSpeed = 3.0;
        turret.rotation.y += turretDiff * turretRotationSpeed * deltaTime;
        barrel.rotation.x += barrelDiff * barrelRotationSpeed * deltaTime;
        barrel.rotation.x = Math.max(-0.5, Math.min(0.5, barrel.rotation.x));
        
        // 检查是否已经瞄准好
        const aimThreshold = 0.15;
        const isAimed = Math.abs(turretDiff) < aimThreshold && Math.abs(barrelDiff) < aimThreshold;
        
        // 检查射速限制
        const now = performance.now();
        const canFire = now - GameState.lastFireTime >= config.fireRate;
        
        if (isAimed && canFire) {
            fireProjectile();
        }
    }
}

// 生成守城怪兽
function spawnGateGuards() {
    const guardColors = [0x8B0000, 0x4B0082];
    
    for (let i = 0; i < 3; i++) {
        const guard = createBigMonster(guardColors[i % 2]);
        
        // 分布在城堡大门前
        guard.position.set(
            (i - 1) * 8, // -8, 0, 8
            2.0,
            -235
        );
        
        guard.userData = {
            health: 300,
            maxHealth: 300,
            isAlive: true,
            isGuard: true,
            lastAttackTime: 0
        };
        
        scene.add(guard);
        GameState.gateGuards.push(guard);
    }
}

// 创建大型怪兽
function createBigMonster(color) {
    const monster = new THREE.Group();
    
    // 身体 - 大球体
    const bodyGeometry = new THREE.SphereGeometry(2.5, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2.5;
    body.castShadow = true;
    monster.add(body);
    
    // 眼睛
    const eyeGeometry = new THREE.SphereGeometry(0.6, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.5
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-1.0, 3.5, 1.8);
    monster.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(1.0, 3.5, 1.8);
    monster.add(rightEye);
    
    // 角
    const hornGeometry = new THREE.ConeGeometry(0.3, 2, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-1.2, 5, 0);
    leftHorn.rotation.z = 0.3;
    monster.add(leftHorn);
    
    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(1.2, 5, 0);
    rightHorn.rotation.z = -0.3;
    monster.add(rightHorn);
    
    return monster;
}

// 打开大门
function openGate() {
    if (!GameState.enemyBase) return;
    
    // 找到大门并打开（旋转或移除）
    GameState.enemyBase.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'BoxGeometry') {
            // 大门打开动画
            const openGateAnimation = () => {
                child.rotation.y += 0.05;
                child.position.x += 0.5;
                if (child.rotation.y < Math.PI / 2) {
                    requestAnimationFrame(openGateAnimation);
                }
            };
            openGateAnimation();
        }
    });
}

// 生成Boss - 粗心大王（全新设计）
function spawnBoss() {
    showMessage('👹 粗心大王出现了！', 3000);
    
    const boss = new THREE.Group();
    
    // Boss身体 - 机械装甲风格
    const bodyGeometry = new THREE.BoxGeometry(6, 7, 5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2C1810,
        roughness: 0.4,
        metalness: 0.7,
        emissive: 0x4B0082,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 5;
    body.castShadow = true;
    boss.add(body);
    
    // 装甲板装饰
    const plateGeometry = new THREE.BoxGeometry(6.5, 2, 5.2);
    const plateMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.8
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = 6;
    boss.add(plate);
    
    // Boss核心 - 发光的能量核心
    const coreGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 5, 2.8);
    boss.add(core);
    
    // 核心光环
    const coreRingGeometry = new THREE.TorusGeometry(2, 0.2, 8, 32);
    const coreRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6600,
        transparent: true,
        opacity: 0.8
    });
    const coreRing = new THREE.Mesh(coreRingGeometry, coreRingMaterial);
    coreRing.position.set(0, 5, 2.8);
    boss.add(coreRing);
    boss.userData.coreRing = coreRing;
    
    // Boss眼睛 - 红色发光
    const eyeGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-1.8, 7, 2.8);
    boss.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(1.8, 7, 2.8);
    boss.add(rightEye);
    
    // 机械臂 - 左臂
    const armGeometry = new THREE.CylinderGeometry(0.8, 0.6, 5, 12);
    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.4,
        metalness: 0.6
    });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-4, 5, 0);
    leftArm.rotation.z = 0.3;
    boss.add(leftArm);
    boss.userData.leftArm = leftArm;
    
    // 机械臂 - 右臂
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(4, 5, 0);
    rightArm.rotation.z = -0.3;
    boss.add(rightArm);
    boss.userData.rightArm = rightArm;
    
    // 武器 - 能量炮
    const cannonGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 12);
    const cannonMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF6600,
        emissive: 0xFF3300,
        emissiveIntensity: 0.5
    });
    const leftCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    leftCannon.position.set(-4, 2, 2);
    leftCannon.rotation.x = -0.5;
    boss.add(leftCannon);
    boss.userData.leftCannon = leftCannon;
    
    const rightCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    rightCannon.position.set(4, 2, 2);
    rightCannon.rotation.x = -0.5;
    boss.add(rightCannon);
    boss.userData.rightCannon = rightCannon;
    
    // 肩部装甲
    const shoulderGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const shoulderMaterial = new THREE.MeshStandardMaterial({
        color: 0x4B0082,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x2E0050,
        emissiveIntensity: 0.4
    });
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-3.5, 8, 0);
    boss.add(leftShoulder);
    
    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    rightShoulder.position.set(3.5, 8, 0);
    boss.add(rightShoulder);
    
    // 底座/履带
    const trackGeometry = new THREE.BoxGeometry(8, 2, 6);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.3
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.position.y = 1;
    boss.add(track);
    
    // 能量护盾光环
    const shieldGeometry = new THREE.RingGeometry(8, 8.5, 32);
    const shieldMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.rotation.x = -Math.PI / 2;
    shield.position.y = 0.5;
    boss.add(shield);
    boss.userData.shield = shield;
    
    // 位置 - 大门后面
    boss.position.set(0, 0, -245);
    
    // 保存已有的userData引用，只添加新属性
    boss.userData.health = 3000;
    boss.userData.maxHealth = 3000;
    boss.userData.isAlive = true;
    boss.userData.isBoss = true;
    boss.userData.lastSkillTime = 0;
    boss.userData.skillInterval = 4000;
    boss.userData.phase = 1;
    boss.userData.attackPattern = 0;
    boss.userData.floatOffset = 0;
    boss.userData.originalY = 0;
    
    scene.add(boss);
    GameState.boss = boss;
    
    // Boss登场动画
    showMessage('⚠️ 粗心大王："我是粗心大王！长期粗心会让你后悔的！"', 4000);
}



// 更新炮弹
function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const velocity = projectile.userData.velocity;

        // 直线飞行，不应用重力
        // velocity.y -= 9.8 * deltaTime;

        // 更新位置
        projectile.position.x += velocity.x * deltaTime;
        projectile.position.y += velocity.y * deltaTime;
        projectile.position.z += velocity.z * deltaTime;

        // 检查碰撞
        let hit = false;

        // 检查与Boss的碰撞（新的Boss系统）
        if (!hit && GameState.boss && GameState.boss.userData.isAlive) {
            const distance = projectile.position.distanceTo(GameState.boss.position);
            if (distance < 4) {
                hit = true;
                GameState.boss.userData.health -= projectile.userData.damage;
                createExplosion(projectile.position, 1.0);
                playHitSound();

                // 更新Boss血量显示
                const bossHealthPercent = Math.floor((GameState.boss.userData.health / GameState.boss.userData.maxHealth) * 100);
                showMessage(`👹 Boss血量: ${bossHealthPercent}%`, 800);

                if (GameState.boss.userData.health <= 0) {
                    // Boss被消灭
                    GameState.boss.userData.isAlive = false;
                    createExplosion(GameState.boss.position, 5);
                    scene.remove(GameState.boss);
                    GameState.boss = null;
                    
                    GameState.bossDefeated = true;
                    GameState.score += 2000;
                    updateHUD();
                    
                    showMessage('🎉 恭喜！你消灭了粗心大王！', 5000);
                    
                    // 游戏胜利结束
                    setTimeout(() => {
                        endGame(true);
                    }, 3000);
                }
            }
        }

        // 检查与守城怪兽的碰撞
        if (!hit) {
            for (const guard of GameState.gateGuards) {
                if (!guard.userData.isAlive) continue;
                
                const distance = projectile.position.distanceTo(guard.position);
                if (distance < 2.5) {
                    hit = true;
                    guard.userData.health -= projectile.userData.damage;
                    createExplosion(projectile.position, 0.8);
                    playHitSound();
                    
                    if (guard.userData.health <= 0) {
                        // 消灭守城怪兽
                        guard.userData.isAlive = false;
                        createExplosion(guard.position, 2);
                        scene.remove(guard);
                        
                        GameState.kills++;
                        GameState.score += 300;
                        updateHUD();
                        
                        showMessage('+300 守城怪兽', 1000);
                    }
                    break;
                }
            }
        }

        // 检查与敌人的碰撞（糊涂虫）
        if (!hit) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.userData.isAlive) continue;

                const distance = projectile.position.distanceTo(enemy.position);
                if (distance < 3) { // 糊涂虫变大了，碰撞距离也增大
                    // 击中敌人
                    hit = true;
                    enemy.userData.health -= projectile.userData.damage;

                    if (enemy.userData.health <= 0) {
                        // 消灭敌人
                        enemy.userData.isAlive = false;
                        createExplosion(enemy.position, 2);
                        scene.remove(enemy);
                        enemies.splice(j, 1);

                        GameState.kills++;
                        GameState.bugsKilled++;
                        GameState.score += 100;
                        GameState.shotsHit++;
                        GameState.lastShotHit = true;
                        updateHUD();

                        showMessage('+100', 500);
                    } else {
                        createExplosion(projectile.position, 0.5);
                        playHitSound();
                    }
                    break;
                }
            }
        }

        // 检查地面碰撞
        if (!hit && projectile.position.y <= 0) {
            createExplosion(projectile.position, 0.3);
            hit = true;
        }

        // 检查射程
        const age = (performance.now() - projectile.userData.created) / 1000;
        if (age > 3) hit = true;

        // 移除炮弹
        if (hit) {
            scene.remove(projectile);
            projectile.geometry.dispose();
            projectile.material.dispose();
            projectiles.splice(i, 1);
        }
    }
}

// 更新Boss炮弹
function updateBossProjectiles(deltaTime) {
    if (!window.bossProjectiles) window.bossProjectiles = [];
    
    for (let i = window.bossProjectiles.length - 1; i >= 0; i--) {
        const projectile = window.bossProjectiles[i];
        const velocity = projectile.userData.velocity;
        
        // 更新位置
        projectile.position.x += velocity.x * deltaTime;
        projectile.position.y += velocity.y * deltaTime;
        projectile.position.z += velocity.z * deltaTime;
        
        // 检查是否击中坦克
        let hit = false;
        
        if (tank) {
            const distance = projectile.position.distanceTo(tank.position);
            if (distance < 3) {
                hit = true;
                createHitEffect(projectile.position, 0.8);
                showMessage('💥 坦克被击中！', 1000);
                // 可以在这里添加坦克受伤逻辑
            }
        }

        // 检查是否击中额外坦克
        if (!hit && extraTank) {
            const distance = projectile.position.distanceTo(extraTank.position);
            if (distance < 3) {
                hit = true;
                createHitEffect(projectile.position, 0.8);
            }
        }
        
        // 检查地面碰撞
        if (!hit && projectile.position.y <= 0) {
            createExplosion(projectile.position, 0.5);
            hit = true;
        }
        
        // 检查射程
        const age = (performance.now() - projectile.userData.created) / 1000;
        if (age > 3) hit = true;
        
        // 移除炮弹
        if (hit) {
            scene.remove(projectile);
            projectile.geometry.dispose();
            projectile.material.dispose();
            window.bossProjectiles.splice(i, 1);
        }
    }
}

// 更新敌人炮弹
function updateEnemyProjectiles(deltaTime) {
    if (!window.enemyProjectiles) window.enemyProjectiles = [];

    for (let i = window.enemyProjectiles.length - 1; i >= 0; i--) {
        const projectile = window.enemyProjectiles[i];
        const velocity = projectile.userData.velocity;

        // 更新位置
        projectile.position.x += velocity.x * deltaTime;
        projectile.position.y += velocity.y * deltaTime;
        projectile.position.z += velocity.z * deltaTime;

        // 检查是否击中坦克
        let hit = false;

        if (tank) {
            const distance = projectile.position.distanceTo(tank.position);
            if (distance < 3) {
                hit = true;
                createHitEffect(projectile.position, 0.6);
                showMessage('💥 被糊涂虫击中！', 800);
            }
        }

        // 检查是否击中额外坦克
        if (!hit && extraTank) {
            const distance = projectile.position.distanceTo(extraTank.position);
            if (distance < 3) {
                hit = true;
                createHitEffect(projectile.position, 0.6);
            }
        }

        // 检查地面碰撞
        if (!hit && projectile.position.y <= 0) {
            createExplosion(projectile.position, 0.3);
            hit = true;
        }

        // 检查射程
        const age = (performance.now() - projectile.userData.created) / 1000;
        if (age > 3) hit = true;

        // 移除炮弹
        if (hit) {
            scene.remove(projectile);
            projectile.geometry.dispose();
            projectile.material.dispose();
            window.enemyProjectiles.splice(i, 1);
        }
    }
}

// 更新守城怪兽攻击
function updateGateGuardsAttack(deltaTime) {
    const now = performance.now();

    GameState.gateGuards.forEach(guard => {
        if (!guard.userData.isAlive) return;

        // 面向坦克
        if (tank) {
            guard.lookAt(tank.position);

            // 发射炮弹
            if (now - guard.userData.lastAttackTime > 2000) {
                guard.userData.lastAttackTime = now;

                const geometry = new THREE.SphereGeometry(0.5, 12, 12);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xFF0000,
                    emissive: 0xFF0000,
                    emissiveIntensity: 0.8
                });
                const projectile = new THREE.Mesh(geometry, material);

                projectile.position.copy(guard.position);
                projectile.position.y += 3;

                // 朝向坦克
                const direction = new THREE.Vector3();
                direction.subVectors(tank.position, projectile.position);
                direction.normalize();
                direction.multiplyScalar(15);

                projectile.userData = {
                    velocity: direction,
                    isGuardProjectile: true,
                    damage: 15
                };

                scene.add(projectile);

                if (!window.guardProjectiles) window.guardProjectiles = [];
                window.guardProjectiles.push(projectile);
            }
        }
    });

    // 更新守城怪兽炮弹
    if (!window.guardProjectiles) window.guardProjectiles = [];
    for (let i = window.guardProjectiles.length - 1; i >= 0; i--) {
        const projectile = window.guardProjectiles[i];
        const velocity = projectile.userData.velocity;

        projectile.position.x += velocity.x * deltaTime;
        projectile.position.y += velocity.y * deltaTime;
        projectile.position.z += velocity.z * deltaTime;

        let hit = false;

        if (tank) {
            const distance = projectile.position.distanceTo(tank.position);
            if (distance < 3) {
                hit = true;
                createHitEffect(projectile.position, 0.8);
                showMessage('💥 被守城怪兽击中！', 1000);
            }
        }

        if (!hit && extraTank) {
            const distance = projectile.position.distanceTo(extraTank.position);
            if (distance < 3) {
                hit = true;
                createHitEffect(projectile.position, 0.8);
            }
        }

        if (!hit && projectile.position.y <= 0) {
            createExplosion(projectile.position, 0.5);
            hit = true;
        }

        const age = (performance.now() - projectile.userData.created) / 1000;
        if (age > 3) hit = true;

        if (hit) {
            scene.remove(projectile);
            projectile.geometry.dispose();
            projectile.material.dispose();
            window.guardProjectiles.splice(i, 1);
        }
    }
}

// 更新抛物线轨迹预览
function updateTrajectoryLine() {
    if (!GameState.isPlaying || !turret || !barrel || !tank) return;
    
    // 检查barrel的matrixWorld是否可用
    if (!barrel.matrixWorld) return;

    // 移除旧的轨迹线
    if (trajectoryLine) {
        scene.remove(trajectoryLine);
        trajectoryLine.geometry.dispose();
        trajectoryLine.material.dispose();
        trajectoryLine = null;
    }

    // 计算发射参数
    const config = WeaponConfig[GameState.weaponLevel];
    const accuracy = config.accuracy;
    const spread = (1 - accuracy) * 0.05;

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(turret.quaternion);
    direction.applyQuaternion(tank.quaternion);
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    const speed = 30 + config.damage * 0.3;
    const velocity = direction.multiplyScalar(speed);

    // 预测轨迹点
    const points = [];
    const startPos = new THREE.Vector3(0, 0, 6.1);
    startPos.applyMatrix4(barrel.matrixWorld);

    let pos = startPos.clone();
    let vel = velocity.clone();
    const timeStep = 0.05;
    const maxTime = 2;

    for (let t = 0; t < maxTime; t += timeStep) {
        points.push(pos.clone());
        vel.y -= 9.8 * timeStep;
        pos.x += vel.x * timeStep;
        pos.y += vel.y * timeStep;
        pos.z += vel.z * timeStep;

        // 如果落到地面以下，停止
        if (pos.y < 0) break;
    }

    // 创建轨迹线
    if (points.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        trajectoryLine = new THREE.Line(geometry, material);
        scene.add(trajectoryLine);
    }
}

// 生成单个敌人
function spawnSingleEnemy() {
    if (!GameState.isPlaying) return;

    const enemyColors = [0x8B0000, 0x4B0082, 0x2F4F4F];
    const enemy = new THREE.Group();

    // 糊涂虫形象
    const bugColor = enemyColors[Math.floor(Math.random() * enemyColors.length)];
    const bugMaterial = new THREE.MeshStandardMaterial({
        color: bugColor,
        roughness: 0.4,
        metalness: 0.2
    });

    // 身体主体 - 大球体
    const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const body = new THREE.Mesh(bodyGeometry, bugMaterial);
    body.position.y = 0.6;
    body.scale.y = 0.8;
    body.castShadow = true;
    enemy.add(body);

    // 眼睛 - 两个小白球
    const eyeGeometry = new THREE.SphereGeometry(0.25, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.2,
        metalness: 0.1
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 1.0, 0.5);
    enemy.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 1.0, 0.5);
    enemy.add(rightEye);

    // 眼珠 - 小黑点（斗鸡眼效果）
    const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.25, 1.0, 0.72);
    enemy.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.25, 1.0, 0.72);
    enemy.add(rightPupil);

    // 触角
    const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.position.set(-0.4, 1.3, 0.2);
    leftAntenna.rotation.z = 0.3;
    leftAntenna.rotation.x = -0.2;
    enemy.add(leftAntenna);
    
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.position.set(0.4, 1.3, 0.2);
    rightAntenna.rotation.z = -0.3;
    rightAntenna.rotation.x = -0.2;
    enemy.add(rightAntenna);

    // 触角顶端小球
    const antennaTipGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const antennaTipMaterial = new THREE.MeshStandardMaterial({ color: bugColor });
    
    const leftTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    leftTip.position.set(-0.52, 1.55, 0.08);
    enemy.add(leftTip);
    
    const rightTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    rightTip.position.set(0.52, 1.55, 0.08);
    enemy.add(rightTip);

    const angle = Math.random() * Math.PI * 2; // 360度随机方向
    const distance = Math.random() * 20 + 30;

    enemy.position.set(
        Math.sin(angle) * distance,
        0.6, // 敌人中心在车身高度（y=0.6），与瞄准高度一致
        Math.cos(angle) * distance
    );

    enemy.userData = {
        health: 100,
        maxHealth: 100,
        isAlive: true,
        moveSpeed: Math.random() * 0.05 + 0.03, // 增加移动速度
        moveDirection: Math.random() * Math.PI * 2,
        lastBubbleTime: 0 // 上次冒泡时间
    };

    scene.add(enemy);
    enemies.push(enemy);
}

// 更新Boss
function updateBoss(deltaTime) {
    if (!GameState.boss || !GameState.boss.userData.isAlive) return;
    
    const boss = GameState.boss;
    const now = performance.now();
    const userData = boss.userData;
    
    // 悬浮动画
    userData.floatOffset += deltaTime * 2;
    boss.position.y = Math.sin(userData.floatOffset) * 0.5;
    
    // 护盾旋转
    if (userData.shield) {
        userData.shield.rotation.z += 0.03;
    }
    
    // 核心光环旋转和脉动
    if (userData.coreRing) {
        userData.coreRing.rotation.z -= 0.05;
        const pulse = 1 + Math.sin(now * 0.005) * 0.2;
        userData.coreRing.scale.set(pulse, pulse, pulse);
    }
    
    // 机械臂摆动
    if (userData.leftArm && userData.rightArm) {
        userData.leftArm.rotation.z = 0.3 + Math.sin(now * 0.003) * 0.2;
        userData.rightArm.rotation.z = -0.3 - Math.sin(now * 0.003) * 0.2;
    }
    
    // 能量炮充能效果
    if (userData.leftCannon && userData.rightCannon) {
        const charge = 0.5 + Math.sin(now * 0.008) * 0.3;
        userData.leftCannon.material.emissiveIntensity = charge;
        userData.rightCannon.material.emissiveIntensity = charge;
    }
    
    // Boss智能移动 - 在坦克前方左右移动，保持一定距离
    if (tank) {
        const targetZ = tank.position.z - 25; // 保持在坦克前方25米处
        const time = now * 0.001;
        
        // 左右摆动
        const targetX = Math.sin(time) * 15;
        
        // 平滑移动
        boss.position.x += (targetX - boss.position.x) * 0.02;
        boss.position.z += (targetZ - boss.position.z) * 0.01;
        
        // 始终面向坦克
        boss.lookAt(tank.position.x, boss.position.y + 5, tank.position.z);
    }
    
    // Boss技能系统
    if (now - userData.lastSkillTime > userData.skillInterval) {
        userData.lastSkillTime = now;
        useBossSkill();
    }
    
    // Boss台词（每6-10秒一次）
    if (now - userData.lastBubbleTime > 6000 + Math.random() * 4000) {
        const bubbleText = BossBubbles[Math.floor(Math.random() * BossBubbles.length)];
        const bubblePos = boss.position.clone();
        bubblePos.y += 9;
        createBubble(bubbleText, bubblePos);
        userData.lastBubbleTime = now;
    }
    
    // 血量阶段切换
    const healthPercent = userData.health / userData.maxHealth;
    if (healthPercent < 0.5 && userData.phase === 1) {
        userData.phase = 2;
        userData.skillInterval = 2500; // 狂暴模式，技能释放更快
        showMessage('🔥 Boss进入狂暴模式！', 3000);
    }
}

// Boss技能
function useBossSkill() {
    if (!GameState.boss || !tank) return;
    
    const skill = Math.floor(Math.random() * 3);
    
    switch (skill) {
        case 0:
            // 技能1：发射能量球
            showMessage('⚡ Boss发射粗心能量球！', 2000);
            fireBossProjectile();
            break;
        case 1:
            // 技能2：召唤小怪兽
            showMessage('👾 Boss召唤糊涂虫！', 2000);
            spawnMiniBugs();
            break;
        case 2:
            // 技能3：狂暴模式
            showMessage('🔥 Boss进入狂暴模式！', 2000);
            bossEnrage();
            break;
    }
}

// Boss发射能量球
function fireBossProjectile() {
    if (!GameState.boss || !tank) return;
    
    const boss = GameState.boss;
    
    // 创建能量球
    const geometry = new THREE.SphereGeometry(0.8, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1
    });
    const projectile = new THREE.Mesh(geometry, material);
    
    // 从Boss位置发射
    projectile.position.copy(boss.position);
    projectile.position.y += 4;
    
    // 计算朝向坦克的速度
    const direction = new THREE.Vector3();
    direction.subVectors(tank.position, projectile.position);
    direction.normalize();
    direction.multiplyScalar(15); // 速度
    
    projectile.userData = {
        velocity: direction,
        isBossProjectile: true,
        damage: 20
    };
    
    scene.add(projectile);
    
    // 添加到炮弹数组（用特殊标记）
    if (!window.bossProjectiles) window.bossProjectiles = [];
    window.bossProjectiles.push(projectile);
}

// 召唤小怪兽
function spawnMiniBugs() {
    if (!GameState.boss) return;
    
    const boss = GameState.boss;
    
    for (let i = 0; i < 3; i++) {
        const bug = createMiniBug();
        bug.position.set(
            boss.position.x + (Math.random() - 0.5) * 10,
            0.8,
            boss.position.z + (Math.random() - 0.5) * 10
        );
        
        bug.userData = {
            health: 50,
            maxHealth: 50,
            isAlive: true,
            isMiniBug: true,
            moveSpeed: 0.1
        };
        
        scene.add(bug);
        
        // 添加到敌人数组
        if (!window.miniBugs) window.miniBugs = [];
        window.miniBugs.push(bug);
    }
}

// 创建小怪兽
function createMiniBug() {
    const bug = new THREE.Group();
    
    const bodyGeometry = new THREE.SphereGeometry(0.5, 12, 12);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B0000,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    bug.add(body);
    
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.7, 0.3);
    bug.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.7, 0.3);
    bug.add(rightEye);
    
    return bug;
}

// Boss狂暴模式
function bossEnrage() {
    if (!GameState.boss) return;
    
    const boss = GameState.boss;
    
    // 变红
    const body = boss.children[0];
    if (body && body.material) {
        body.material.emissive.setHex(0xFF0000);
        body.material.emissiveIntensity = 0.8;
    }
    
    // 加速
    boss.userData.skillInterval = 3000; // 技能间隔缩短
    
    // 5秒后恢复正常
    setTimeout(() => {
        if (boss && body && body.material) {
            body.material.emissive.setHex(0x2E0050);
            body.material.emissiveIntensity = 0.3;
            boss.userData.skillInterval = 5000;
        }
    }, 5000);
}

// 更新敌人糊涂虫台词
const BugBubbles = [
    '我是糊涂虫，专门让你数学不认真！',
    '粗心大意是我的好朋友！',
    '不检查作业？太好了！',
    '看错题目？我干的！',
    '计算错误？嘿嘿嘿！',
    '忘记进位？我的功劳！',
    '漏写单位？我故意的！',
    '抄错数字？就是我！',
    '不验算？太棒了！',
    '马马虎虎，我最爱！'
];

// Boss台词 - 教育性内容
const BossBubbles = [
    '我是粗心大王！你知道长期粗心会有什么后果吗？',
    '总是看错题目，考试时就会丢很多分！',
    '计算老出错，以后学更难的数学就更跟不上了！',
    '不检查作业，坏习惯会越积越多！',
    '粗心不改，以后考试总是考不好，会失去信心！',
    '数学基础不扎实，以后学物理、化学都会受影响！',
    '总是马马虎虎，长大后工作也会出错！',
    '粗心看似小事，但会让你错过很多机会！',
    '现在不改正，坏习惯会越来越难改！',
    '认真检查一遍，比做十道题都有用！',
    '细心是一种能力，需要从小培养！',
    '消灭我，就代表你决心改掉粗心毛病！'
];

// 当前显示的冒泡
let currentBubble = null;

// 创建冒泡对话
function createBubble(text, position) {
    // 如果已有冒泡，先移除
    if (currentBubble) {
        currentBubble.remove();
        currentBubble = null;
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'bug-bubble';
    bubble.textContent = text;
    bubble.style.cssText = `
        position: fixed;
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        pointer-events: none;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid #ff6b6b;
        max-width: 200px;
        text-align: center;
        will-change: transform;
    `;
    
    // 添加小三角
    const triangle = document.createElement('div');
    triangle.style.cssText = `
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #ff6b6b;
    `;
    bubble.appendChild(triangle);
    
    document.body.appendChild(bubble);
    currentBubble = bubble;
    
    // 更新位置
    const updatePosition = () => {
        if (!bubble.parentNode) return;
        
        const vector = position.clone();
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        
        bubble.style.left = x + 'px';
        bubble.style.top = (y - 60) + 'px';
    };
    
    updatePosition();
    
    // 动画更新位置
    const interval = setInterval(updatePosition, 16);
    
    // 3秒后消失
    setTimeout(() => {
        clearInterval(interval);
        if (bubble.parentNode) {
            bubble.remove();
        }
        if (currentBubble === bubble) {
            currentBubble = null;
        }
    }, 3000);
}

// 更新敌人
function updateEnemies(deltaTime) {
    const now = performance.now();

    enemies.forEach(enemy => {
        if (!enemy.userData.isAlive) return;

        const enemyType = enemy.userData.enemyType;

        // 根据敌人类型执行不同AI
        switch (enemyType) {
            case 'basic':
                updateBasicEnemy(enemy, deltaTime, now);
                break;
            case 'shooter':
                updateShooterEnemy(enemy, deltaTime, now);
                break;
            case 'charger':
                updateChargerEnemy(enemy, deltaTime, now);
                break;
            case 'dodger':
                updateDodgerEnemy(enemy, deltaTime, now);
                break;
        }

        // 随机冒泡对话（每5-10秒一次）
        if (now - enemy.userData.lastBubbleTime > 5000 + Math.random() * 5000) {
            const bubbleText = BugBubbles[Math.floor(Math.random() * BugBubbles.length)];
            const bubblePos = enemy.position.clone();
            bubblePos.y += 3;
            createBubble(bubbleText, bubblePos);
            enemy.userData.lastBubbleTime = now;
        }
    });
}

// 基础敌人 - 简单移动
function updateBasicEnemy(enemy, deltaTime, now) {
    enemy.userData.moveDirection += (Math.random() - 0.5) * 0.1;
    enemy.position.x += Math.cos(enemy.userData.moveDirection) * enemy.userData.moveSpeed;
    enemy.position.z += Math.sin(enemy.userData.moveDirection) * enemy.userData.moveSpeed;

    // 限制范围
    const distance = Math.sqrt(enemy.position.x ** 2 + enemy.position.z ** 2);
    if (distance > 50) {
        enemy.userData.moveDirection += Math.PI;
    }

    if (tank) enemy.lookAt(tank.position);
}

// 射手敌人 - 会发射子弹
function updateShooterEnemy(enemy, deltaTime, now) {
    // 保持距离
    if (tank) {
        const distToTank = enemy.position.distanceTo(tank.position);
        const direction = new THREE.Vector3();
        direction.subVectors(enemy.position, tank.position);
        direction.y = 0;
        direction.normalize();

        if (distToTank < 30) {
            // 太近就后退
            enemy.position.x += direction.x * enemy.userData.moveSpeed;
            enemy.position.z += direction.z * enemy.userData.moveSpeed;
        } else if (distToTank > 50) {
            // 太远就靠近
            enemy.position.x -= direction.x * enemy.userData.moveSpeed;
            enemy.position.z -= direction.z * enemy.userData.moveSpeed;
        }

        enemy.lookAt(tank.position);

        // 发射子弹
        if (now - enemy.userData.lastAttackTime > enemy.userData.attackInterval) {
            enemy.userData.lastAttackTime = now;
            fireEnemyProjectile(enemy);
        }
    }
}

// 冲锋敌人 - 快速冲向坦克
function updateChargerEnemy(enemy, deltaTime, now) {
    if (tank) {
        // 直接冲向坦克
        const direction = new THREE.Vector3();
        direction.subVectors(tank.position, enemy.position);
        direction.y = 0;
        direction.normalize();

        enemy.position.x += direction.x * enemy.userData.moveSpeed;
        enemy.position.z += direction.z * enemy.userData.moveSpeed;

        enemy.lookAt(tank.position);
    }
}

// 闪避敌人 - 会左右闪避
function updateDodgerEnemy(enemy, deltaTime, now) {
    if (tank) {
        const direction = new THREE.Vector3();
        direction.subVectors(tank.position, enemy.position);
        direction.y = 0;
        direction.normalize();

        // 侧向移动
        const sideDir = new THREE.Vector3(-direction.z, 0, direction.x);
        const dodgeDirection = Math.sin(now / 500) > 0 ? 1 : -1;

        enemy.position.x += (direction.x * 0.3 + sideDir.x * dodgeDirection) * enemy.userData.moveSpeed;
        enemy.position.z += (direction.z * 0.3 + sideDir.z * dodgeDirection) * enemy.userData.moveSpeed;

        enemy.lookAt(tank.position);
    }
}

// 敌人发射子弹
function fireEnemyProjectile(enemy) {
    if (!tank) return;

    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xFF6600 });
    const projectile = new THREE.Mesh(geometry, material);

    projectile.position.copy(enemy.position);
    projectile.position.y += 1.5;

    // 朝向坦克
    const direction = new THREE.Vector3();
    direction.subVectors(tank.position, projectile.position);
    direction.normalize();
    direction.multiplyScalar(12);

    projectile.userData = {
        velocity: direction,
        isEnemyProjectile: true,
        damage: 10
    };

    scene.add(projectile);

    if (!window.enemyProjectiles) window.enemyProjectiles = [];
    window.enemyProjectiles.push(projectile);
}

// 更新粒子
function updateParticles() {
    particles.forEach(particle => {
        const positions = particle.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] += 0.02;
            if (positions[i * 3 + 1] > 10) {
                positions[i * 3 + 1] = 0;
            }
        }
        particle.geometry.attributes.position.needsUpdate = true;
        particle.rotation.y += 0.0005;
    });
}

// 窗口大小调整
function onWindowResize() {
    const container = document.getElementById('gameScreen');

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 清理资源
function cleanupThreeJS() {
    window.removeEventListener('resize', onWindowResize);

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // 清理炮弹
    projectiles.forEach(p => {
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
    });
    projectiles = [];

    // 清理敌人
    enemies.forEach(e => {
        scene.remove(e);
    });
    enemies = [];

    // 清理粒子
    particles.forEach(p => {
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
    });
    particles = [];

    // 清理场景
    if (scene) {
        while (scene.children.length > 0) {
            const object = scene.children[0];
            scene.remove(object);
        }
    }

    if (renderer) {
        renderer.dispose();
        renderer = null;
    }

    scene = null;
    camera = null;
    tank = null;
    barrel = null;
    turret = null;
}
