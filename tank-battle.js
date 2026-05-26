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
    autoMoveEnabled: true,
    // 坦克状态
    tankState: 'moving', // 'moving' | 'aiming' | 'firing'
    currentTarget: null,
    lastShotHit: false,
    // Boss战
    bossSpawned: false,
    bossDefeated: false,
    bugsToKill: 15, // 需要消灭的糊涂虫数量
    bugsKilled: 0
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

// 更新额外坦克（自动战斗）
function updateExtraTank(deltaTime) {
    if (!extraTank) return;
    
    // 找到主坦克当前目标
    const mainTankTarget = GameState.currentTarget;
    
    // 额外坦克选择目标：优先选择主坦克没有攻击的敌人
    let targetEnemy = null;
    let minDistance = Infinity;
    
    // 收集所有存活的敌人
    const aliveEnemies = enemies.filter(e => e.userData.isAlive);
    
    // 如果没有普通敌人，检查Boss
    if (aliveEnemies.length === 0) {
        if (boss && boss.userData.isAlive) {
            targetEnemy = boss;
            minDistance = extraTank.position.distanceTo(boss.position);
        }
        if (!targetEnemy) return;
    } else {
        // 有普通敌人，选择目标
        // 但如果主坦克在攻击Boss，额外坦克也攻击Boss
        if (mainTankTarget && mainTankTarget.userData.isBoss && boss && boss.userData.isAlive) {
            targetEnemy = boss;
            minDistance = extraTank.position.distanceTo(boss.position);
        } else if (aliveEnemies.length === 1) {
            // 只有一个敌人，两个坦克攻击同一个
            targetEnemy = aliveEnemies[0];
            minDistance = extraTank.position.distanceTo(targetEnemy.position);
        } else {
            // 有多个敌人，优先选择主坦克没有攻击的敌人
            for (const enemy of aliveEnemies) {
                const distance = extraTank.position.distanceTo(enemy.position);
                // 如果这是主坦克的目标，增加距离惩罚，降低优先级
                const effectiveDistance = (enemy === mainTankTarget) ? distance + 100 : distance;
                if (effectiveDistance < minDistance) {
                    minDistance = effectiveDistance;
                    targetEnemy = enemy;
                }
            }
        }
    }
    
    if (targetEnemy) {
        // 计算朝向敌人的方向
        const direction = new THREE.Vector3();
        direction.subVectors(targetEnemy.position, extraTank.position);
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
            
            // 限制移动范围 - 保持在脑区范围内
            const extraBrainCenterX = 0;
            const extraBrainCenterZ = 12;
            const extraMaxRadius = 20;
            extraTank.position.x = Math.max(-extraMaxRadius, Math.min(extraMaxRadius, extraTank.position.x));
            extraTank.position.z = Math.max(extraBrainCenterZ - extraMaxRadius, Math.min(extraBrainCenterZ + extraMaxRadius, extraTank.position.z));
        }
        
        // 自动瞄准 - 使用抛物线计算
        if (extraTankTurret && extraTankBarrel) {
            // 获取炮管前端位置
            const barrelTip = new THREE.Vector3(0, 0, 6.1);
            barrelTip.applyMatrix4(extraTankBarrel.matrixWorld);
            
            // 计算目标位置（敌人身体中心，普通敌人y=0.6，Boss y=1.5）
            const targetPos = targetEnemy.position.clone();
            // 判断是否是Boss，Boss的中心更高
            const isBoss = targetEnemy.userData.isBoss;
            targetPos.y = isBoss ? 1.5 : 0.6; // 瞄准敌人身体中心
            
            // 计算抛物线射击角度
            const initialSpeed = 35; // 与主坦克保持一致
            const aimAngles = calculateParabolicAngle(targetPos, barrelTip, initialSpeed);
            
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

        // Boss出现时停止倒计时
        if (GameState.bossSpawned) {
            document.getElementById('timeDisplay').textContent = 'BOSS';
            clearInterval(timerInterval);
            return;
        }

        GameState.timeRemaining--;
        document.getElementById('timeDisplay').textContent = GameState.timeRemaining;

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
    if (boss) {
        scene.remove(boss);
        boss = null;
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
    // 地面 - 平坦地形，避免遮挡坦克
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);

    // 地形基本平坦，只有微小的起伏
    const positions = groundGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        // 非常小的起伏，最大高度0.2，不会遮挡坦克
        positions[i + 2] = Math.random() * 0.1;
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

    // 添加一些岩石（降低高度，避免遮挡坦克）
    for (let i = 0; i < 15; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 1.5 + 0.3, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.8
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 15;
        rock.position.set(
            Math.cos(angle) * distance,
            0.3,  // 降低高度到0.3，不会遮挡坦克
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

    for (let i = 0; i < 15; i++) {
        const enemy = new THREE.Group();

        // 糊涂虫形象 - 用球体和圆环组合
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
        body.scale.y = 0.8; // 稍微压扁
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

        // 眼珠 - 小黑点（斗鸡眼效果，显得糊涂）
        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.25, 1.0, 0.72);
        enemy.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.25, 1.0, 0.72);
        enemy.add(rightPupil);

        // 触角 - 两个细长的圆柱体
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

        // 随机位置 - 从四面八方来（360度）
        const angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5) * 0.5;
        const distance = Math.random() * 30 + 25;

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

    // 更新相机位置 - 以俯视为主，略带斜角
    if (camera && tank) {
        // 相机位置：高空俯视，略带一点斜角
        camera.position.set(0, 35, 35);
        camera.lookAt(0, 0, 15);
    }

    // 坦克AI（移动和射击状态机）
    // 当有普通敌人或Boss存在时执行AI
    const hasTarget = enemies.some(e => e.userData.isAlive) || (boss && boss.userData.isAlive);
    if (GameState.autoMoveEnabled && tank && hasTarget) {
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

// 坦克自动寻敌移动和射击（状态机实现）
function updateTankAI(deltaTime) {
    const config = WeaponConfig[GameState.weaponLevel];
    
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
    
    // 如果没有普通敌人，检查Boss
    if (!nearestEnemy && boss && boss.userData.isAlive) {
        nearestEnemy = boss;
        minDistance = tank.position.distanceTo(boss.position);
    }
    
    if (!nearestEnemy) return;
    
    // 保存当前目标
    GameState.currentTarget = nearestEnemy;
    
    // 计算朝向敌人的方向
    const direction = new THREE.Vector3();
    direction.subVectors(nearestEnemy.position, tank.position);
    direction.y = 0;
    direction.normalize();
    
    // 坦克朝向敌人
    const targetRotation = Math.atan2(direction.x, direction.z);
    const rotationDiff = targetRotation - tank.rotation.y;
    let normalizedDiff = rotationDiff;
    while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
    while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
    tank.rotation.y += normalizedDiff * 1.5 * deltaTime;
    
    // 状态机处理
    switch (GameState.tankState) {
        case 'moving':
            // 移动状态：向敌人移动，直到进入射程并停稳
            const optimalDistance = 20;
            if (minDistance > optimalDistance) {
                // 继续移动
                const moveSpeed = 3;
                tank.position.x += direction.x * moveSpeed * deltaTime;
                tank.position.z += direction.z * moveSpeed * deltaTime;
                
                // 限制移动范围 - 保持在脑区范围内
                // 脑区中心(0, 12)，半径28，坦克在脑区内活动
                const brainCenterX = 0;
                const brainCenterZ = 12;
                const maxRadius = 20; // 最大活动半径
                tank.position.x = Math.max(-maxRadius, Math.min(maxRadius, tank.position.x));
                tank.position.z = Math.max(brainCenterZ - maxRadius, Math.min(brainCenterZ + maxRadius, tank.position.z));
            } else {
                // 进入射程，切换到瞄准状态
                GameState.tankState = 'aiming';
                showMessage('🎯 停止移动，开始瞄准', 1000);
            }
            break;
            
        case 'aiming':
            // 瞄准状态：停止移动，调整炮塔和炮管，直接发射（像额外坦克一样）
            if (minDistance <= config.range) {
                // 获取炮管前端位置
                const barrelTip = new THREE.Vector3(0, 0, 6.1);
                barrelTip.applyMatrix4(barrel.matrixWorld);
                
                // 计算目标位置（敌人身体中心，普通敌人y=0.6，Boss y=1.5）
                const targetPos = nearestEnemy.position.clone();
                // 判断是否是Boss，Boss的中心更高
                const isBoss = nearestEnemy.userData.isBoss;
                targetPos.y = isBoss ? 1.5 : 0.6;
                
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
                    
                    // 检查是否已经瞄准好（收紧阈值，提高命中率）
                    const aimThreshold = 0.05; // 更严格的瞄准要求
                    const isAimed = Math.abs(turretDiff) < aimThreshold && Math.abs(barrelDiff) < aimThreshold;
                    
                    // 检查射速限制
                    const now = performance.now();
                    const canFire = now - GameState.lastFireTime >= config.fireRate;
                    
                    if (isAimed && canFire && GameState.ammo > 0) {
                        // 精确瞄准后才发射
                        fireProjectile();
                        showMessage('🔥 发射！', 500);
                        GameState.lastShotTarget = nearestEnemy;
                        GameState.lastShotTime = now;
                    } else if (!isAimed) {
                        // 还没瞄准好，继续旋转（降低速度，更平滑）
                        const turretRotationSpeed = 1.0;
                        const barrelRotationSpeed = 1.0;
                        turret.rotation.y += turretDiff * turretRotationSpeed * deltaTime;
                        barrel.rotation.x += barrelDiff * barrelRotationSpeed * deltaTime;
                        barrel.rotation.x = Math.max(-0.5, Math.min(0.5, barrel.rotation.x));
                    }
                    // 如果瞄准好了但射速限制，等待下一次循环
                }
            } else {
                // 敌人跑出射程，继续移动
                GameState.tankState = 'moving';
            }
            break;
            
        case 'firing':
        case 'waiting':
            // 这两个状态不再使用，直接回到移动状态
            GameState.tankState = 'moving';
            break;
    }
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

        // 检查与Boss的碰撞
        if (boss && boss.userData.isAlive) {
            // Boss保护期检查：生成后2秒内无敌（给玩家反应时间）
            const timeSinceSpawn = performance.now() - boss.userData.spawnTime;
            const isInvulnerable = timeSinceSpawn < 2000;

            const distance = projectile.position.distanceTo(boss.position);
            if (distance < 3) {
                hit = true;

                if (isInvulnerable) {
                    // 无敌状态，显示免疫效果
                    createExplosion(projectile.position, 0.3);
                    // 偶尔显示提示
                    if (Math.random() < 0.1) {
                        showMessage('🛡️ Boss保护罩生效中！', 500);
                    }
                } else {
                    // 正常受到伤害
                    boss.userData.health -= projectile.userData.damage;
                    createExplosion(projectile.position, 0.8);
                    playHitSound();

                    // 更新Boss血量显示
                    const bossHealthPercent = Math.floor((boss.userData.health / boss.userData.maxHealth) * 100);
                    showMessage(`Boss血量: ${bossHealthPercent}%`, 800);
                }

                if (boss.userData.health <= 0) {
                    // Boss被消灭
                    boss.userData.isAlive = false;
                    createExplosion(boss.position, 3);
                    scene.remove(boss);
                    boss = null;
                    
                    GameState.bossDefeated = true;
                    GameState.score += 1000;
                    updateHUD();
                    
                    showMessage('🎉 恭喜！你消灭了粗心大王！', 5000);
                    
                    // 游戏胜利结束
                    setTimeout(() => {
                        endGame(true);
                    }, 3000);
                }
            }
        }

        // 检查与敌人的碰撞
        if (!hit) {
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
                        GameState.bugsKilled++;
                        GameState.score += 100;
                        GameState.shotsHit++;
                        GameState.lastShotHit = true;
                        updateHUD();

                        showMessage('+100', 500);

                        // 检查是否需要召唤Boss
                        if (GameState.bugsKilled >= GameState.bugsToKill && !GameState.bossSpawned) {
                            spawnBoss();
                        }
                        // 注意：不再生成新敌人，只打最初的15个糊涂虫
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

// Boss变量
let boss = null;

// 创建Boss - 粗心大王
function spawnBoss() {
    if (!GameState.isPlaying || GameState.bossSpawned) return;
    
    GameState.bossSpawned = true;
    showMessage('⚠️ 粗心大王出现了！消灭它！', 3000);
    
    boss = new THREE.Group();
    
    // Boss材质 - 深紫色，显得邪恶
    const bossMaterial = new THREE.MeshStandardMaterial({
        color: 0x4B0082,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0x2E0050,
        emissiveIntensity: 0.3
    });
    
    // 身体 - 巨大球体
    const bodyGeometry = new THREE.SphereGeometry(2, 24, 24);
    const body = new THREE.Mesh(bodyGeometry, bossMaterial);
    body.position.y = 1.5;
    body.scale.y = 0.9;
    body.castShadow = true;
    boss.add(body);
    
    // 眼睛 - 红色发光
    const eyeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.8
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.8, 2.2, 1.2);
    boss.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.8, 2.2, 1.2);
    boss.add(rightEye);
    
    // 眼珠 - 黑色竖瞳
    const pupilGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.8, 2.2, 1.65);
    leftPupil.scale.y = 2;
    boss.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.8, 2.2, 1.65);
    rightPupil.scale.y = 2;
    boss.add(rightPupil);
    
    // 触角 - 更大更粗
    const antennaGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 12);
    const antennaMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2E0050,
        emissive: 0x4B0082,
        emissiveIntensity: 0.5
    });
    
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.position.set(-1, 3, 0.3);
    leftAntenna.rotation.z = 0.4;
    leftAntenna.rotation.x = -0.3;
    boss.add(leftAntenna);
    
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.position.set(1, 3, 0.3);
    rightAntenna.rotation.z = -0.4;
    rightAntenna.rotation.x = -0.3;
    boss.add(rightAntenna);
    
    // 触角顶端发光球
    const antennaTipGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const antennaTipMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 1
    });
    
    const leftTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    leftTip.position.set(-1.45, 3.6, 0);
    boss.add(leftTip);
    
    const rightTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    rightTip.position.set(1.45, 3.6, 0);
    boss.add(rightTip);
    
    // 光环效果
    const ringGeometry = new THREE.RingGeometry(2.5, 3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    boss.add(ring);
    
    // 位置 - 在屏幕内出现，直接可见
    boss.position.set(0, 0, -20);

    boss.userData = {
        health: 1500,
        maxHealth: 1500,
        isAlive: true,
        isBoss: true,
        moveSpeed: 0.08,
        lastBubbleTime: 0,
        spawnTime: performance.now() // 记录生成时间，用于无敌保护期
    };
    
    scene.add(boss);
    
    // Boss登场台词
    setTimeout(() => {
        if (boss && boss.userData.isAlive) {
            const bubblePos = boss.position.clone();
            bubblePos.y += 4;
            createBubble('我是粗心大王！长期粗心会让你后悔的！', bubblePos);
        }
    }, 1000);
}

// 更新Boss
function updateBoss(deltaTime) {
    if (!boss || !boss.userData.isAlive) return;
    
    const now = performance.now();
    
    // Boss缓慢向玩家移动
    const direction = new THREE.Vector3(0, 0, 0).sub(boss.position).normalize();
    boss.position.x += direction.x * boss.userData.moveSpeed;
    boss.position.z += direction.z * boss.userData.moveSpeed;
    
    // 面向玩家
    boss.lookAt(0, 1.5, 0);
    
    // 光环旋转动画
    const ring = boss.children.find(child => child.geometry && child.geometry.type === 'RingGeometry');
    if (ring) {
        ring.rotation.z += 0.01;
    }
    
    // Boss台词（每8-12秒一次）
    if (now - boss.userData.lastBubbleTime > 8000 + Math.random() * 4000) {
        const bubbleText = BossBubbles[Math.floor(Math.random() * BossBubbles.length)];
        const bubblePos = boss.position.clone();
        bubblePos.y += 4;
        createBubble(bubbleText, bubblePos);
        boss.userData.lastBubbleTime = now;
    }
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
        
        // 随机冒泡对话（每5-10秒一次）
        if (now - enemy.userData.lastBubbleTime > 5000 + Math.random() * 5000) {
            const bubbleText = BugBubbles[Math.floor(Math.random() * BugBubbles.length)];
            const bubblePos = enemy.position.clone();
            bubblePos.y += 1.5; // 在敌人头顶
            createBubble(bubbleText, bubblePos);
            enemy.userData.lastBubbleTime = now;
        }
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
