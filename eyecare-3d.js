// 远眺护眼攒积分 - 3D版
// 使用 Three.js 实现华丽3D效果

// ========== 全局变量 ==========
let scene, camera, renderer, controls;
let piggyBank;
let coins = [];
let coinQueue = []; // 待掉落的金币队列
let particles = [];
let animationId;

// 游戏状态
let gameState = {
    isRunning: false,
    targetCoins: 10,
    currentCoins: 0,
    cycleTime: 5, // 每个周期5秒
    remainingTime: 5,
    startTime: null,
    totalTime: 0
};

// 倒计时相关
let countdownInterval = null;

// 音频上下文 - 用于音效
let audioContext = null;

// 初始化音频上下文
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 播放金币掉落音效
function playCoinDropSound() {
    if (!audioContext) initAudio();
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 高频下降音效 - 模拟金币掉落
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
    
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// 播放金币入罐音效
function playCoinInPiggySound() {
    if (!audioContext) initAudio();
    if (!audioContext) return;
    
    // 创建金属碰撞声
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 金属音调
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    // 添加第二个音调 - 回音效果
    setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.frequency.setValueAtTime(800, audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
        osc2.type = 'sine';
        
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.08);
    }, 50);
}

// 播放完成音效
function playCompleteSound() {
    if (!audioContext) initAudio();
    if (!audioContext) return;
    
    // 胜利音效 - 上升音阶
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }, index * 100);
    });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initTargetButtons();
    initCustomTarget();
});

// 初始化目标选择按钮
function initTargetButtons() {
    const buttons = document.querySelectorAll('.target-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.targetCoins = parseInt(btn.dataset.target);
            document.getElementById('customTarget').value = '';
            updatePreview();
        });
    });
}

// 初始化自定义目标输入
function initCustomTarget() {
    const input = document.getElementById('customTarget');
    input.addEventListener('input', () => {
        const value = parseInt(input.value);
        if (value && value > 0 && value <= 100) {
            document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
            gameState.targetCoins = value;
            updatePreview();
        }
    });
}

// 更新预览信息
function updatePreview() {
    document.getElementById('previewTarget').textContent = `目标：${gameState.targetCoins}枚`;
    const estimatedTime = gameState.targetCoins * gameState.cycleTime;
    document.getElementById('previewTime').textContent = estimatedTime >= 60 
        ? `约需${Math.ceil(estimatedTime/60)}分钟` 
        : `约需${estimatedTime}秒`;
}

// ========== 游戏控制 ==========
function startGame() {
    // 初始化音频上下文（需要用户交互才能创建）
    initAudio();
    
    // 隐藏开始页面，显示游戏页面
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // 重置游戏状态
    gameState.currentCoins = 0;
    gameState.totalTime = 0;
    gameState.isRunning = true;
    
    // 更新UI
    updateUI();
    
    // 初始化3D场景
    initThreeJS();
    
    // 开始第一个周期
    startCycle();
}

function exitGame() {
    // 停止倒计时
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // 停止动画
    gameState.isRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // 清理Three.js资源
    cleanupThreeJS();
    
    // 返回首页
    window.location.href = 'home.html';
}

function resetGame() {
    // 隐藏完成页面，显示开始页面
    document.getElementById('completeScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
    
    // 清理Three.js资源
    cleanupThreeJS();
}

// ========== 倒计时逻辑 ==========
function startCycle() {
    gameState.remainingTime = gameState.cycleTime;
    gameState.startTime = Date.now();
    
    // 隐藏提示信息
    document.getElementById('centerMessage').style.opacity = '0';
    
    // 显示倒计时圆环并重置状态
    const ring = document.getElementById('countdownRing');
    ring.classList.remove('transforming');
    ring.style.opacity = '1';
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // 重置圆环数字为5
    const ringNumber = document.getElementById('ringNumber');
    if (ringNumber) {
        ringNumber.textContent = '5';
    }
    
    // 重置圆环进度
    const ringProgress = document.getElementById('ringProgress');
    if (ringProgress) {
        ringProgress.style.strokeDashoffset = '502.65';
    }
    
    // 开始倒计时
    countdownInterval = setInterval(() => {
        if (!gameState.isRunning) {
            clearInterval(countdownInterval);
            return;
        }
        
        const elapsed = (Date.now() - gameState.startTime) / 1000;
        gameState.remainingTime = Math.max(0, gameState.cycleTime - elapsed);
        
        // 更新UI
        updateTimerDisplay();
        updateProgressRing();
        
        // 检查是否完成
        if (gameState.remainingTime <= 0) {
            completeCycle();
        }
    }, 50);
}

function updateTimerDisplay() {
    // 更新圆环中心的数字（向上取整）
    const ringNumber = document.getElementById('ringNumber');
    if (ringNumber) {
        ringNumber.textContent = Math.ceil(gameState.remainingTime);
    }
}

function updateProgressRing() {
    const progress = 1 - (gameState.remainingTime / gameState.cycleTime);
    const circumference = 2 * Math.PI * 80; // r=80
    const offset = circumference * (1 - progress);
    
    const ringProgress = document.getElementById('ringProgress');
    ringProgress.style.strokeDashoffset = offset;
}

function completeCycle() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    
    // 添加金币
    gameState.currentCoins++;
    gameState.totalTime += gameState.cycleTime;
    
    // 更新UI
    updateUI();
    
    // 圆环变成金币掉落的动画
    const ring = document.getElementById('countdownRing');
    ring.classList.add('transforming');
    
    // 圆环动画开始的同时创建金币掉落（圆圈自身变成金币往下掉）
    createCoinToPiggyAnimation();
    
    // 播放金币掉落音效
    playCoinDropSound();
    
    // 隐藏倒计时圆环并复位
    setTimeout(() => {
        ring.classList.remove('transforming');
        ring.style.opacity = '0';
        ring.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 600);
    
    // 检查是否完成目标
    if (gameState.currentCoins >= gameState.targetCoins) {
        setTimeout(() => completeGame(), 1400);
    } else {
        // 短暂暂停后开始下一个周期
        setTimeout(() => startCycle(), 1000);
    }
}

function completeGame() {
    gameState.isRunning = false;
    
    // 播放完成音效
    playCompleteSound();
    
    // 发放奖励
    const reward = gameState.currentCoins;
    if (typeof addCoins === 'function') {
        addCoins(reward);
    }
    
    // 更新完成页面数据
    document.getElementById('finalCoins').textContent = reward;
    document.getElementById('completedCycles').textContent = gameState.currentCoins;
    const minutes = Math.floor(gameState.totalTime / 60);
    const seconds = gameState.totalTime % 60;
    document.getElementById('totalTime').textContent = minutes > 0 
        ? `${minutes}分${seconds}秒` 
        : `${seconds}秒`;
    
    // 根据完成数量设置鼓励语
    const encouragement = document.getElementById('encouragementText');
    if (gameState.currentCoins >= 20) {
        encouragement.textContent = '🏆 太厉害了！你是护眼小冠军！';
    } else if (gameState.currentCoins >= 10) {
        encouragement.textContent = '👏 太棒了！坚持护眼，保护视力！';
    } else {
        encouragement.textContent = '👍 很好！继续努力保护眼睛哦！';
    }
    
    // 显示完成页面
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('completeScreen').classList.add('active');
    
    // 清理Three.js场景但保留最终画面
    setTimeout(() => cleanupThreeJS(), 500);
}

function updateUI() {
    document.getElementById('coinCount').textContent = gameState.currentCoins;
    document.getElementById('progressText').textContent = `${gameState.currentCoins} / ${gameState.targetCoins}`;
}

// ========== Three.js 3D场景 ==========
function initThreeJS() {
    const canvas = document.getElementById('threeCanvas');
    const container = document.getElementById('gameScreen');
    
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0c29);
    scene.fog = new THREE.FogExp2(0x0f0c29, 0.02);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    // 相机位置 - 能看到上方的倒计时圆圈和下方的存钱罐
    camera.position.set(0, 2, 12);
    camera.lookAt(1, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 开启透明物体正确渲染
    renderer.sortObjects = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // 添加灯光
    setupLights();
    
    // 创建存钱罐
    createPiggyBank();
    
    // 创建地面
    createFloor();
    
    // 创建粒子效果
    createParticles();
    
    // 开始渲染循环
    animate();
    
    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffd700, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);
    
    // 补光
    const fillLight = new THREE.PointLight(0xff6347, 0.6);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);
    
    // 轮廓光
    const rimLight = new THREE.SpotLight(0x00ff88, 0.8);
    rimLight.position.set(0, 8, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);
}

function createPiggyBank() {
    piggyBank = new THREE.Group();
    
    // 罐身（使用球体变形）- 半透明玻璃效果
    const bodyGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    // 稍微压扁成猪的形状
    bodyGeometry.scale(1.2, 1, 1);
    
    // 半透明材质 - 轻微透明可以看到内部
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff69b4,
        metalness: 0.2,
        roughness: 0.15,
        transmission: 0.25,     // 降低透光率 - 轻微透明
        thickness: 1.0,         // 玻璃厚度
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.92,          // 提高不透明度
        side: THREE.DoubleSide  // 双面渲染
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    piggyBank.add(body);
    
    // 内部发光核心 - 让金币更容易被看到
    const innerGlowGeometry = new THREE.SphereGeometry(1.3, 32, 32);
    innerGlowGeometry.scale(1.2, 1, 1);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff1493,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    innerGlow.position.y = 1.5;
    piggyBank.add(innerGlow);
    
    // 猪鼻子
    const snoutGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 32);
    snoutGeometry.rotateX(Math.PI / 2);
    const snoutMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff1493,
        metalness: 0.4,
        roughness: 0.2,
        emissive: 0xff1493,
        emissiveIntensity: 0.2
    });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(1.7, 1.6, 0);
    snout.castShadow = true;
    piggyBank.add(snout);
    
    // 鼻孔
    const nostrilGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const nostrilMaterial = new THREE.MeshBasicMaterial({ color: 0x880044 });
    
    const nostril1 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    nostril1.position.set(1.9, 1.65, 0.15);
    piggyBank.add(nostril1);
    
    const nostril2 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    nostril2.position.set(1.9, 1.65, -0.15);
    piggyBank.add(nostril2);
    
    // 耳朵
    const earGeometry = new THREE.ConeGeometry(0.3, 0.6, 32);
    const earMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff69b4,
        metalness: 0.3,
        roughness: 0.3
    });
    
    const ear1 = new THREE.Mesh(earGeometry, earMaterial);
    ear1.position.set(0.8, 2.8, 0.8);
    ear1.rotation.z = -0.3;
    ear1.rotation.x = 0.2;
    ear1.castShadow = true;
    piggyBank.add(ear1);
    
    const ear2 = new THREE.Mesh(earGeometry, earMaterial);
    ear2.position.set(0.8, 2.8, -0.8);
    ear2.rotation.z = -0.3;
    ear2.rotation.x = -0.2;
    ear2.castShadow = true;
    piggyBank.add(ear2);
    
    // 眼睛
    const eyeGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.set(1.3, 2, 0.5);
    piggyBank.add(eye1);
    
    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.set(1.3, 2, -0.5);
    piggyBank.add(eye2);
    
    // 眼睛高光
    const shineGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const shineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const shine1 = new THREE.Mesh(shineGeometry, shineMaterial);
    shine1.position.set(1.38, 2.05, 0.52);
    piggyBank.add(shine1);
    
    const shine2 = new THREE.Mesh(shineGeometry, shineMaterial);
    shine2.position.set(1.38, 2.05, -0.48);
    piggyBank.add(shine2);
    
    // 腿
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 32);
    const legMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff1493,
        metalness: 0.3,
        roughness: 0.4
    });
    
    const legPositions = [
        { x: 0.8, z: 0.8 },
        { x: 0.8, z: -0.8 },
        { x: -0.8, z: 0.8 },
        { x: -0.8, z: -0.8 }
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, 0.4, pos.z);
        leg.castShadow = true;
        piggyBank.add(leg);
    });
    
    // 投币口
    const slotGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.2);
    const slotMaterial = new THREE.MeshBasicMaterial({ color: 0x440022 });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.set(0, 2.5, 0);
    piggyBank.add(slot);
    
    // 发光效果
    const glowGeometry = new THREE.SphereGeometry(2.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.5;
    glow.scale.set(1.2, 1, 1);
    piggyBank.add(glow);
    
    // 将存钱罐放置在右下方
    piggyBank.position.y = -2;
    piggyBank.position.x = 3;
    
    scene.add(piggyBank);
}

function createFloor() {
    // 创建圆形平台
    const floorGeometry = new THREE.CircleGeometry(8, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.5,
        roughness: 0.5
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.8;  // 地面位置跟随存钱罐下移
    floor.receiveShadow = true;
    scene.add(floor);
    
    // 添加发光环
    const ringGeometry = new THREE.RingGeometry(6, 6.5, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -2.79;  // 发光环位置跟随地面
    scene.add(ring);
}

function createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = Math.random() * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        // 金色粒子
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

// 金币掉落到存钱罐肚子里的动画 - 从屏幕上方垂直掉落
function createCoinToPiggyAnimation() {
    // 创建金币 - 从屏幕上方（圆环位置）开始
    const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    coinGeometry.rotateX(Math.PI / 2);
    
    const coinMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        metalness: 1,
        roughness: 0.1,
        clearcoat: 1,
        emissive: 0xffd700,
        emissiveIntensity: 0.5
    });
    
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    
    // 起始位置 - 屏幕上方（对应圆环位置）
    // 圆环在屏幕上方15%处，对应3D坐标约为 x=0, y=6
    coin.position.set(0, 6, 0);
    
    // 添加金币纹理效果
    const edgeGeometry = new THREE.TorusGeometry(0.3, 0.02, 16, 32);
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.z = 0.026;
    coin.add(edge);
    
    const edge2 = edge.clone();
    edge2.position.z = -0.026;
    edge2.rotation.y = Math.PI;
    coin.add(edge2);
    
    coin.castShadow = true;
    
    // 为金币添加点光源 - 让它在存钱罐内部发光
    const coinLight = new THREE.PointLight(0xffd700, 0.5, 3);
    coinLight.position.set(0, 0, 0);
    coin.add(coinLight);
    
    scene.add(coin);
    
    // 存钱罐投币口位置 (piggyBank.position.x = 3, y = -2, 投币口在 y = 2.5 相对存钱罐)
    // 世界坐标：x = 3, y = -2 + 2.5 = 0.5
    const slotPosition = new THREE.Vector3(3, 0.5, 0);
    
    // 内部随机位置 - 金币掉入后在存钱罐肚子里散落
    const randomOffset = {
        x: (Math.random() - 0.5) * 1.0,
        y: Math.random() * 0.5 - 0.5,
        z: (Math.random() - 0.5) * 0.8
    };
    
    // 最终目标位置 - 存钱罐内部
    const finalPosition = new THREE.Vector3(
        3 + randomOffset.x,
        -1.2 + randomOffset.y,  // 存钱罐底部中心附近
        randomOffset.z
    );
    
    // 起始位置 - 屏幕正上方
    const startPosition = new THREE.Vector3(0, 6, 0);
    
    // 保存金币动画数据 - 垂直掉落
    const coinData = {
        mesh: coin,
        light: coinLight,
        startPos: startPosition,
        slotPos: slotPosition,
        finalPos: finalPosition,
        progress: 0,
        isLanded: false,
        isInside: false,
        rotationSpeed: 0.2,
        dropSpeed: 0.025,  // 加快掉落速度
        settleProgress: 0
    };
    
    coins.push(coinData);
    
    // 创建发光轨迹
    createCoinTrail(coin.position);
    
    // 根据已积攒的金币数量，动态调整新金币的位置，堆叠效果
    updateCoinStackPositions();
}

// 更新金币堆叠位置，避免重叠
function updateCoinStackPositions() {
    // 获取所有已落地的金币
    const landedCoins = coins.filter(c => c.isLanded);
    
    // 简单的堆叠逻辑 - 让金币散落在存钱罐底部
    landedCoins.forEach((coinData, index) => {
        if (!coinData.settleProgress || coinData.settleProgress < 1) {
            // 计算堆叠偏移
            const layer = Math.floor(index / 5);  // 每5个金币一层
            const posInLayer = index % 5;
            
            const angle = (posInLayer / 5) * Math.PI * 2 + (layer * 0.5);
            const radius = 0.3 + (layer * 0.15);  // 越上层半径越大（堆叠）
            const height = 0.3 + (layer * 0.08);   // 层高度
            
            const targetX = 3 + Math.cos(angle) * radius;  // 存钱罐在x=3
            const targetZ = Math.sin(angle) * radius;
            const targetY = -1.5 + height;  // 存钱罐底部在y=-1.5左右
            
            // 平滑过渡到最终位置
            coinData.finalPos.set(targetX, targetY, targetZ);
        }
    });
}

// 兼容旧代码的函数名
function createCoinDropAnimation() {
    createCoinToPiggyAnimation();
}

function createCoinTrail(position) {
    // 创建发光粒子效果
    const trailGeometry = new THREE.BufferGeometry();
    const trailCount = 20;
    const positions = new Float32Array(trailCount * 3);
    
    for (let i = 0; i < trailCount; i++) {
        positions[i * 3] = position.x + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = position.y - i * 0.2;
        positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
    }
    
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const trailMaterial = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);
    
    // 3秒后移除轨迹
    setTimeout(() => {
        scene.remove(trail);
        trailGeometry.dispose();
        trailMaterial.dispose();
    }, 3000);
}

function animate() {
    if (!gameState.isRunning) return;
    
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // 旋转存钱罐（轻微摆动）
    if (piggyBank) {
        piggyBank.rotation.y = Math.sin(time * 0.5) * 0.1;
        // 基础位置是-2，加上轻微摆动
        if (piggyBank.position.y > -1.5) {  // 只有在没有跳动时才应用摆动
            piggyBank.position.y = -2 + Math.sin(time * 2) * 0.03;
        }
    }
    
    // 更新金币动画 - 从屏幕中心掉落到存钱罐肚子里
    coins.forEach((coinData, index) => {
        if (!coinData.isLanded) {
            // 更新进度
            coinData.progress += coinData.dropSpeed;
            
            if (coinData.progress >= 1) {
                // 到达投币口
                coinData.progress = 1;
                coinData.isLanded = true;
                coinData.isInside = false;
                coinData.settleProgress = 0;
                
                // 创建掉入存钱罐的效果
                createCoinInPiggyEffect(coinData.slotPos);
                
                // 播放金币入罐音效
                playCoinInPiggySound();
                
                // 让存钱罐跳动一下
                if (piggyBank) {
                    piggyBank.position.y = -2 + 0.3;
                    setTimeout(() => {
                        if (piggyBank) piggyBank.position.y = -2;
                    }, 150);
                }
            } else {
                // 从屏幕上方垂直掉落到存钱罐投币口
                const t = coinData.progress;
                const start = coinData.startPos;
                const end = coinData.slotPos;
                
                // 线性插值 - 垂直掉落路径
                coinData.mesh.position.lerpVectors(start, end, t);
                
                // 掉落过程中有轻微的水平偏移，模拟自然掉落
                if (t < 0.3) {
                    // 前30%主要是垂直下落
                    coinData.mesh.position.x = start.x + (end.x - start.x) * (t / 0.3) * 0.3;
                } else {
                    // 后70%逐渐转向存钱罐
                    const t2 = (t - 0.3) / 0.7;
                    coinData.mesh.position.x = start.x * 0.7 + end.x * 0.3 + (end.x - start.x) * t2 * 0.7;
                }
                
                // 旋转 - 自由落体旋转
                coinData.mesh.rotation.y += coinData.rotationSpeed;
                coinData.mesh.rotation.x += coinData.rotationSpeed * 0.3;
                
                // 接近投币口时稍微缩小
                if (t > 0.85) {
                    const scale = 1 - (t - 0.85) * 2;
                    coinData.mesh.scale.set(Math.max(0.7, scale), Math.max(0.7, scale), Math.max(0.7, scale));
                }
            }
        } else if (!coinData.isInside) {
            // 金币进入存钱罐内部的过程
            coinData.settleProgress += 0.05;
            
            if (coinData.settleProgress >= 1) {
                coinData.isInside = true;
                coinData.settleProgress = 1;
                coinData.mesh.position.copy(coinData.finalPos);
                coinData.mesh.scale.set(1, 1, 1);
            } else {
                // 从投币口掉入内部的动画
                const t = coinData.settleProgress;
                const start = coinData.slotPos;
                const end = coinData.finalPos;
                
                // 线性插值
                coinData.mesh.position.lerpVectors(start, end, t);
                
                // 掉落过程中旋转
                coinData.mesh.rotation.x += 0.1;
                coinData.mesh.rotation.z += 0.05;
                
                // 逐渐恢复大小
                const scale = 0.7 + t * 0.3;
                coinData.mesh.scale.set(scale, scale, scale);
            }
        } else {
            // 已在存钱罐内部的金币 - 轻微闪烁和浮动
            coinData.mesh.rotation.y += 0.02;
            
            // 偶尔轻微跳动
            if (Math.sin(time * 3 + index) > 0.95) {
                coinData.mesh.position.y = coinData.finalPos.y + 0.05;
            } else {
                coinData.mesh.position.y = coinData.finalPos.y;
            }
        }
    });
    
    // 更新粒子
    particles.forEach(particle => {
        const positions = particle.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] += 0.02;
            if (positions[i * 3 + 1] > 10) {
                positions[i * 3 + 1] = 0;
            }
        }
        particle.geometry.attributes.position.needsUpdate = true;
        particle.rotation.y += 0.001;
    });
    
    renderer.render(scene, camera);
}

function createLandingEffect(position) {
    // 创建落地光环效果
    const ringGeometry = new THREE.RingGeometry(0.5, 0.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.position.y = position.y - 0.3;
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    
    // 光环扩散动画
    let scale = 1;
    let opacity = 0.8;
    
    const expandRing = () => {
        scale += 0.1;
        opacity -= 0.05;
        
        ring.scale.set(scale, scale, scale);
        ring.material.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(expandRing);
        } else {
            scene.remove(ring);
            ringGeometry.dispose();
            ringMaterial.dispose();
        }
    };
    
    expandRing();
}

// 金币掉入存钱罐的效果
function createCoinInPiggyEffect(position) {
    // 创建金色闪光粒子从投币口喷出
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        
        // 随机向上速度
        velocities.push({
            x: (Math.random() - 0.5) * 0.1,
            y: Math.random() * 0.2 + 0.1,
            z: (Math.random() - 0.5) * 0.1
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 0.15,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // 粒子动画
    let frame = 0;
    const animateParticles = () => {
        frame++;
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;
            
            // 重力
            velocities[i].y -= 0.005;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        particles.material.opacity -= 0.02;
        
        if (particles.material.opacity > 0 && frame < 60) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particles);
            geometry.dispose();
            material.dispose();
        }
    };
    
    animateParticles();
    
    // 创建金色光环从投币口扩散
    const flashRingGeometry = new THREE.RingGeometry(0.2, 0.4, 32);
    const flashRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    
    const flashRing = new THREE.Mesh(flashRingGeometry, flashRingMaterial);
    flashRing.position.copy(position);
    flashRing.rotation.x = -Math.PI / 2;
    scene.add(flashRing);
    
    // 光环动画
    let ringScale = 1;
    let ringOpacity = 0.9;
    
    const animateRing = () => {
        ringScale += 0.15;
        ringOpacity -= 0.05;
        
        flashRing.scale.set(ringScale, ringScale, ringScale);
        flashRing.material.opacity = ringOpacity;
        
        if (ringOpacity > 0) {
            requestAnimationFrame(animateRing);
        } else {
            scene.remove(flashRing);
            flashRingGeometry.dispose();
            flashRingMaterial.dispose();
        }
    };
    
    animateRing();
}

function onWindowResize() {
    const container = document.getElementById('gameScreen');
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function cleanupThreeJS() {
    window.removeEventListener('resize', onWindowResize);
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // 清理金币
    coins.forEach(coinData => {
        scene.remove(coinData.mesh);
        if (coinData.light) {
            coinData.mesh.remove(coinData.light);
        }
        coinData.mesh.geometry.dispose();
        coinData.mesh.material.dispose();
    });
    coins = [];
    
    // 清理粒子
    particles.forEach(particle => {
        scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
    });
    particles = [];
    
    // 清理场景
    if (scene) {
        while(scene.children.length > 0) {
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
    piggyBank = null;
}
