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
    timeRemaining: 60,
    lastFireTime: 0,
    shotsFired: 0,
    shotsHit: 0,
    // 家长评定奖励
    extraTank: false,
    specialAmmo: false,
    // 自动战斗
    autoFireEnabled: true,
    autoMoveEnabled: true
};

// 武器配置
const WeaponConfig = {
    5: { name: '精英坦克', stars: '⭐⭐⭐⭐⭐', fireRate: 200, damage: 100, accuracy: 0.95, ammo: 30, range: 100, color: '#FFD700' },
    4: { name: '优秀坦克', stars: '⭐⭐⭐⭐', fireRate: 300, damage: 80, accuracy: 0.85, ammo: 25, range: 80, color: '#7eb03c' },
    3: { name: '标准坦克', stars: '⭐⭐⭐', fireRate: 400, damage: 60, accuracy: 0.75, ammo: 20, range: 60, color: '#FFA500' },
    2: { name: '受损坦克', stars: '⭐⭐', fireRate: 500, damage: 40, accuracy: 0.65, ammo: 15, range: 50, color: '#FF6B35' },
    1: { name: '故障坦克', stars: '⭐', fireRate: 600, damage: 20, accuracy: 0.55, ammo: 10, range: 40, color: '#FF3333' }
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
    GameState.timeRemaining = 60;
    GameState.shotsFired = 0;
    GameState.shotsHit = 0;
    GameState.isPlaying = true;

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
    // 在主角坦克旁边创建额外坦克
    extraTank = tank.clone();
    extraTank.position.set(8, 0, 0); // 在主角右侧8单位
    scene.add(extraTank);
    
    // 获取额外坦克的炮塔和炮管
    extraTankTurret = extraTank.children.find(child => child.type === 'Group');
    if (extraTankTurret) {
        extraTankBarrel = extraTankTurret.children.find(child => child.type === 'Group');
    }
    
    showMessage('🎖️ 额外坦克加入战斗！', 2000);
}

// 更新额外坦克（自动战斗）
function updateExtraTank(deltaTime) {
    if (!extraTank || enemies.length === 0) return;
    
    // 找到最近的敌人
    let nearestEnemy = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
        if (!enemy.userData.isAlive) continue;
        const distance = extraTank.position.distanceTo(enemy.position);
        if (distance < minDistance) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    }
    
    if (nearestEnemy) {
        // 计算朝向敌人的方向
        const direction = new THREE.Vector3();
        direction.subVectors(nearestEnemy.position, extraTank.position);
        direction.y = 0;
        direction.normalize();
        
        // 坦克朝向敌人 - 降低旋转速度
        const targetRotation = Math.atan2(direction.x, direction.z);
        const rotationSpeed = 1.2; // 额外坦克旋转更慢
        const rotationDiff = targetRotation - extraTank.rotation.y;
        
        // 处理角度差，选择最短路径
        let normalizedDiff = rotationDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
        
        extraTank.rotation.y += normalizedDiff * rotationSpeed * deltaTime;
        
        // 移动坦克 - 额外坦克移动更慢
        const optimalDistance = 22;
        if (minDistance > optimalDistance) {
            const moveSpeed = 2.5; // 额外坦克移动更慢
            extraTank.position.x += direction.x * moveSpeed * deltaTime;
            extraTank.position.z += direction.z * moveSpeed * deltaTime;
            
            // 限制移动范围
            extraTank.position.x = Math.max(-30, Math.min(30, extraTank.position.x));
            extraTank.position.z = Math.max(-10, Math.min(40, extraTank.position.z));
        }
        
        // 自动瞄准 - 使用抛物线计算
        if (extraTankTurret && extraTankBarrel) {
            // 获取炮管前端位置
            const barrelTip = new THREE.Vector3(0, 0, 6.1);
            barrelTip.applyMatrix4(extraTankBarrel.matrixWorld);
            
            // 计算抛物线射击角度
            const initialSpeed = 25; // 额外坦克炮弹速度稍慢
            const aimAngles = calculateParabolicAngle(nearestEnemy.position, barrelTip, initialSpeed);
            
            if (aimAngles) {
                // 计算目标炮塔角度
                const targetTurretY = aimAngles.horizontal - extraTank.rotation.y;
                
                // 计算当前角度差（在旋转之前）
                let turretDiff = targetTurretY - extraTankTurret.rotation.y;
                while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
                while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
                
                // 计算目标炮管仰角
                const targetBarrelX = -aimAngles.vertical;
                let barrelDiff = targetBarrelX - extraTankBarrel.rotation.x;
                
                // 检查是否已经瞄准好
                const aimThreshold = 0.1; // 额外坦克精度稍低
                const isAimed = Math.abs(turretDiff) < aimThreshold && Math.abs(barrelDiff) < aimThreshold;
                
                // 如果已经瞄准好，并且满足射击间隔，才发射
                const now = performance.now();
                const canFire = now - (extraTank.userData.lastFireTime || 0) > 1000;
                
                if (isAimed && canFire) {
                    extraTank.userData.lastFireTime = now;
                    fireProjectileFromTank(extraTank, extraTankTurret, extraTankBarrel);
                } else {
                    // 否则继续瞄准（平滑旋转）
                    const turretRotationSpeed = 1.2; // 额外坦克旋转更慢
                    extraTankTurret.rotation.y += turretDiff * turretRotationSpeed * 0.016;
                    
                    const barrelRotationSpeed = 1.2;
                    extraTankBarrel.rotation.x += barrelDiff * barrelRotationSpeed * 0.016;
                    
                    // 限制仰角
                    extraTankBarrel.rotation.x = Math.max(-0.5, Math.min(0.5, extraTankBarrel.rotation.x));
                }
            }
        }
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

        GameState.timeRemaining--;
        document.getElementById('timeDisplay').textContent = GameState.timeRemaining;

        if (GameState.timeRemaining <= 0 || GameState.ammo <= 0) {
            endGame();
        }
    }, 1000);
}

// 结束游戏
function endGame() {
    GameState.isPlaying = false;
    clearInterval(timerInterval);

    // 计算奖励
    const baseCoins = Math.floor(GameState.score / 100);
    const perfectBonus = GameState.mistakes === 0 ? 10 : 0;
    const totalCoins = baseCoins + perfectBonus + Math.min(5, Math.floor(GameState.kills / 5));

    // 计算评级
    let rank = 'C';
    let medal = '🥉';
    if (GameState.score >= 1000) {
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
    const encouragement = Encouragements[Math.min(GameState.mistakes, 9)] || Encouragements[9];
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

    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);
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
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);

    // 添加地形起伏
    const positions = groundGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 2 +
                          Math.sin(x * 0.1) * Math.sin(y * 0.1) * 0.5;
    }
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d4c28,
        roughness: 0.9,
        metalness: 0.1
    });

    terrain = new THREE.Mesh(groundGeometry, groundMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // 添加一些岩石
    for (let i = 0; i < 20; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 0.5, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.8
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 10;
        rock.position.set(
            Math.cos(angle) * distance,
            1,
            Math.sin(angle) * distance - 20
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

// 创建坦克
function createTank() {
    tank = new THREE.Group();

    // 坦克车身 - 注意：车身长轴在Z方向，前面是Z正方向
    const bodyGeometry = new THREE.BoxGeometry(3, 1.2, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A5D23,
        roughness: 0.6,
        metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    tank.add(body);

    // 坦克履带
    const trackGeometry = new THREE.BoxGeometry(0.8, 0.6, 4.2);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
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
        color: 0x4A5D23,
        roughness: 0.6,
        metalness: 0.3
    });
    const turretMesh = new THREE.Mesh(turretGeometry, turretMaterial);
    turretMesh.position.y = 1.8;
    turretMesh.castShadow = true;
    turret.add(turretMesh);

    // 炮管 - 指向Z轴正方向（前方），做长一点
    barrel = new THREE.Group();

    // 炮管长度从4增加到6
    const barrelGeometry = new THREE.CylinderGeometry(0.15, 0.2, 6, 8);
    const barrelMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.5
    });
    const barrelMesh = new THREE.Mesh(barrelGeometry, barrelMaterial);
    // 炮管初始指向Z轴正方向（前方）
    barrelMesh.rotation.x = -Math.PI / 2;
    // 位置调整到炮管中心
    barrelMesh.position.z = 3;
    barrelMesh.castShadow = true;
    barrel.add(barrelMesh);

    // 炮口 - 相应调整位置
    const muzzleGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.3, 8);
    const muzzleMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
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

    for (let i = 0; i < 8; i++) {
        const enemy = new THREE.Group();

        // 敌人坦克（简化版）
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 2.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
            roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        enemy.add(body);

        // 炮塔
        const turretGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.5, 6);
        const turret = new THREE.Mesh(turretGeometry, bodyMaterial);
        turret.position.y = 1.4;
        enemy.add(turret);

        // 随机位置 - 在坦克前方（Z轴正方向）
        const angle = (Math.PI / 6) * (i - 4) + (Math.random() - 0.5) * 0.3;
        const distance = Math.random() * 30 + 25;

        enemy.position.set(
            Math.sin(angle) * distance,
            0,
            Math.cos(angle) * distance  // Z轴正方向是前方
        );

        enemy.userData = {
            health: 100,
            maxHealth: 100,
            isAlive: true,
            moveSpeed: Math.random() * 0.02 + 0.01,
            moveDirection: Math.random() * Math.PI * 2
        };

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
    createProjectile(sourceTank, sourceTurret, config, false);
}

// 创建炮弹
function createProjectile(sourceTank, sourceTurret, config, isMainTank) {
    // 判断是否使用多功能炮弹（家里作业无错误奖励，仅主坦克）
    const isSpecialAmmo = isMainTank && GameState.specialAmmo && Math.random() < 0.3;
    
    // 创建炮弹 - 加大尺寸和效果
    const projectileSize = isSpecialAmmo ? 0.5 : 0.3;
    const projectileGeometry = new THREE.SphereGeometry(projectileSize, 16, 16);
    const projectileMaterial = new THREE.MeshStandardMaterial({
        color: isSpecialAmmo ? 0x00FF00 : 0xFF6B35,
        emissive: isSpecialAmmo ? 0x00AA00 : 0xFF4500,
        emissiveIntensity: 1.0,
        roughness: 0.3,
        metalness: 0.8
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // 添加炮弹光晕效果
    const glowGeometry = new THREE.SphereGeometry(projectileSize * 1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: isSpecialAmmo ? 0x00FF00 : 0xFFAA00,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    projectile.add(glow);
    
    // 添加炮弹尾焰光
    const projectileLight = new THREE.PointLight(isSpecialAmmo ? 0x00FF00 : 0xFF6B35, 1, 10);
    projectileLight.position.set(0, 0, 0);
    projectile.add(projectileLight);

    // 获取炮管前端世界位置（炮管长度现在是6，前端在Z=6.1）
    const sourceBarrel = sourceTurret.children.find(child => child.type === 'Group');
    const barrelTip = new THREE.Vector3(0, 0, 6.1);
    barrelTip.applyMatrix4(sourceBarrel.matrixWorld);
    projectile.position.copy(barrelTip);

    // 计算发射方向（考虑精准度）
    const accuracy = config.accuracy;
    const spread = isSpecialAmmo ? 0 : (1 - accuracy) * 0.1;

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(sourceTurret.quaternion);
    direction.applyQuaternion(sourceTank.quaternion);
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    const speed = 30 + config.damage * 0.3;
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

    // 检查弹药
    if (GameState.ammo <= 0) {
        showMessage('弹药耗尽！', 1000);
        return;
    }

    GameState.lastFireTime = now;
    GameState.ammo--;
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
    createProjectile(tank, turret, config, true);
}

// 创建炮口闪光
function createMuzzleFlash(position) {
    const flashGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFAA00,
        transparent: true,
        opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    scene.add(flash);

    // 动画
    let scale = 1;
    const animateFlash = () => {
        scale += 0.5;
        flash.scale.set(scale, scale, scale);
        flash.material.opacity -= 0.1;

        if (flash.material.opacity > 0) {
            requestAnimationFrame(animateFlash);
        } else {
            scene.remove(flash);
            flash.geometry.dispose();
            flash.material.dispose();
        }
    };
    animateFlash();
}

// 创建爆炸效果 - 更夸张的效果
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

    // 更新相机位置 - 第三视角俯视战场
    if (camera && tank) {
        // 固定相机位置：高空俯视整个战场
        camera.position.set(0, 40, 30);
        camera.lookAt(0, 0, 20);
    }

    // 坦克自动寻敌和移动
    if (GameState.autoMoveEnabled && tank && enemies.length > 0) {
        updateTankAutoMove(deltaTime);
    }

    // 坦克自动射击
    if (GameState.autoFireEnabled && tank && turret && barrel) {
        updateTankAutoFire();
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

    // 更新粒子
    updateParticles();

    renderer.render(scene, camera);
}

// 计算抛物线射击角度 - 使用更可靠的迭代方法
function calculateParabolicAngle(targetPos, startPos, initialSpeed) {
    const dx = targetPos.x - startPos.x;
    const dy = targetPos.y - startPos.y;
    const dz = targetPos.z - startPos.z;
    
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
    const gravity = 9.8;
    
    // 如果水平距离为0，直接返回
    if (horizontalDistance < 0.1) {
        return {
            vertical: 0,
            horizontal: Math.atan2(dx, dz),
            distance: 0
        };
    }
    
    // 使用迭代法找到最佳发射角度
    // 尝试不同的仰角，找到能击中目标的
    let bestAngle = 0.3; // 默认30度
    let minError = Infinity;
    
    // 在0到60度范围内搜索最佳角度
    for (let angleDeg = 5; angleDeg <= 60; angleDeg += 1) {
        const angleRad = angleDeg * Math.PI / 180;
        
        // 计算在这个角度下的落点
        const vx = initialSpeed * Math.cos(angleRad);
        const vy = initialSpeed * Math.sin(angleRad);
        
        // 计算飞行时间（水平方向）
        const time = horizontalDistance / vx;
        
        // 计算垂直方向的位移
        const verticalDisplacement = vy * time - 0.5 * gravity * time * time;
        
        // 计算误差
        const error = Math.abs(verticalDisplacement - dy);
        
        if (error < minError) {
            minError = error;
            bestAngle = angleRad;
        }
    }
    
    // 如果误差太大，说明无法到达
    if (minError > 5) {
        return null;
    }
    
    // 计算水平方向角度
    const horizontalAngle = Math.atan2(dx, dz);
    
    return {
        vertical: bestAngle,
        horizontal: horizontalAngle,
        distance: horizontalDistance
    };
}

// 坦克自动寻敌移动
function updateTankAutoMove(deltaTime) {
    // 找到最近的敌人
    let nearestEnemy = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
        if (!enemy.userData.isAlive) continue;
        const distance = tank.position.distanceTo(enemy.position);
        if (distance < minDistance) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    }
    
    if (nearestEnemy) {
        // 计算朝向敌人的方向
        const direction = new THREE.Vector3();
        direction.subVectors(nearestEnemy.position, tank.position);
        direction.y = 0;
        direction.normalize();
        
        // 坦克朝向敌人 - 降低旋转速度，更真实
        const targetRotation = Math.atan2(direction.x, direction.z);
        const rotationSpeed = 1.5; // 降低旋转速度
        const rotationDiff = targetRotation - tank.rotation.y;
        
        // 处理角度差，选择最短路径
        let normalizedDiff = rotationDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
        
        tank.rotation.y += normalizedDiff * rotationSpeed * deltaTime;
        
        // 移动坦克（保持一定距离）- 降低移动速度
        const optimalDistance = 20; // 增加最佳距离
        if (minDistance > optimalDistance) {
            const moveSpeed = 3; // 降低移动速度，更真实
            tank.position.x += direction.x * moveSpeed * deltaTime;
            tank.position.z += direction.z * moveSpeed * deltaTime;
            
            // 限制坦克移动范围
            tank.position.x = Math.max(-30, Math.min(30, tank.position.x));
            tank.position.z = Math.max(-10, Math.min(40, tank.position.z));
        }
    }
}

// 坦克自动射击
function updateTankAutoFire() {
    const now = performance.now();
    const config = WeaponConfig[GameState.weaponLevel];
    
    // 检查射击间隔
    if (now - GameState.lastFireTime < config.fireRate) return;
    
    // 找到最近的敌人
    let nearestEnemy = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
        if (!enemy.userData.isAlive) continue;
        const distance = tank.position.distanceTo(enemy.position);
        if (distance < minDistance) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    }
    
    // 如果有敌人在射程内
    if (nearestEnemy && minDistance <= config.range) {
        // 获取炮管前端位置
        const barrelTip = new THREE.Vector3(0, 0, 6.1);
        barrelTip.applyMatrix4(barrel.matrixWorld);
        
        // 计算抛物线射击角度
        const initialSpeed = 30 + config.damage * 0.3;
        const aimAngles = calculateParabolicAngle(nearestEnemy.position, barrelTip, initialSpeed);
        
        if (aimAngles) {
            // 计算目标炮塔角度（相对于坦克）
            const targetTurretY = aimAngles.horizontal - tank.rotation.y;
            
            // 计算当前角度差（在旋转之前）
            let turretDiff = targetTurretY - turret.rotation.y;
            while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
            while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
            
            // 计算目标炮管仰角
            const targetBarrelX = -aimAngles.vertical;
            let barrelDiff = targetBarrelX - barrel.rotation.x;
            
            // 检查是否已经瞄准好
            const aimThreshold = 0.08; // 更严格的瞄准精度
            const isAimed = Math.abs(turretDiff) < aimThreshold && Math.abs(barrelDiff) < aimThreshold;
            
            // 如果已经瞄准好，并且满足射击间隔，才发射
            const now = performance.now();
            const canFire = now - GameState.lastFireTime >= config.fireRate;
            
            if (isAimed && canFire) {
                fireProjectile();
            } else {
                // 否则继续瞄准（平滑旋转）
                const turretRotationSpeed = 1.5; // 降低旋转速度，更稳定
                turret.rotation.y += turretDiff * turretRotationSpeed * 0.016;
                
                const barrelRotationSpeed = 1.5;
                barrel.rotation.x += barrelDiff * barrelRotationSpeed * 0.016;
                
                // 限制仰角
                barrel.rotation.x = Math.max(-0.5, Math.min(0.5, barrel.rotation.x));
            }
        }
    }
}

// 更新炮弹
function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const velocity = projectile.userData.velocity;

        // 应用重力
        velocity.y -= 9.8 * deltaTime;

        // 更新位置
        projectile.position.x += velocity.x * deltaTime;
        projectile.position.y += velocity.y * deltaTime;
        projectile.position.z += velocity.z * deltaTime;

        // 更新旋转以匹配速度方向
        const direction = velocity.clone().normalize();
        projectile.lookAt(
            projectile.position.x + direction.x,
            projectile.position.y + direction.y,
            projectile.position.z + direction.z
        );

        // 检查碰撞
        let hit = false;

        // 检查与敌人的碰撞
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.userData.isAlive) continue;

            const distance = projectile.position.distanceTo(enemy.position);
            if (distance < 2) {
                // 击中敌人
                hit = true;
                enemy.userData.health -= projectile.userData.damage;

                if (enemy.userData.health <= 0) {
                    // 消灭敌人
                    enemy.userData.isAlive = false;
                    createExplosion(enemy.position, 1.5);
                    scene.remove(enemy);
                    enemies.splice(j, 1);

                    GameState.kills++;
                    GameState.score += 100;
                    GameState.shotsHit++;
                    updateHUD();

                    showMessage('+100', 500);

                    // 生成新敌人
                    setTimeout(() => spawnSingleEnemy(), 2000);
                } else {
                    createExplosion(projectile.position, 0.5);
                    playHitSound();
                }
                break;
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

// 更新抛物线轨迹预览
function updateTrajectoryLine() {
    if (!GameState.isPlaying || !turret || !barrel) return;

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

    const bodyGeometry = new THREE.BoxGeometry(2, 1, 2.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
        roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    enemy.add(body);

    const turretGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.5, 6);
    const turret = new THREE.Mesh(turretGeometry, bodyMaterial);
    turret.position.y = 1.4;
    enemy.add(turret);

    const angle = (Math.random() - 0.5) * Math.PI / 2;
    const distance = Math.random() * 20 + 30;

    enemy.position.set(
        Math.sin(angle) * distance,
        0,
        Math.cos(angle) * distance  // Z轴正方向是前方
    );

    enemy.userData = {
        health: 100,
        maxHealth: 100,
        isAlive: true,
        moveSpeed: Math.random() * 0.02 + 0.01,
        moveDirection: Math.random() * Math.PI * 2
    };

    scene.add(enemy);
    enemies.push(enemy);
}

// 更新敌人
function updateEnemies(deltaTime) {
    enemies.forEach(enemy => {
        if (!enemy.userData.isAlive) return;

        // 简单的移动AI
        enemy.userData.moveDirection += (Math.random() - 0.5) * 0.1;

        enemy.position.x += Math.cos(enemy.userData.moveDirection) * enemy.userData.moveSpeed;
        enemy.position.z += Math.sin(enemy.userData.moveDirection) * enemy.userData.moveSpeed;

        // 限制范围
        const distance = Math.sqrt(enemy.position.x ** 2 + enemy.position.z ** 2);
        if (distance > 50) {
            enemy.userData.moveDirection += Math.PI;
        }

        // 面向玩家（玩家在Z=0处）
        enemy.lookAt(0, 0, 0);
    });
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
