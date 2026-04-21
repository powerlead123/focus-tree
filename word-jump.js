// 单词惊险跳 3D 游戏核心逻辑

// ===== 游戏配置 =====
const PLATFORM_COUNT = 5;
const PLATFORM_SIZE = 3;
const PLATFORM_GAP = 4;
const JUMP_HEIGHT = 3;
const JUMP_DURATION = 800;
const FALL_DURATION = 1500;

// ===== Three.js 全局变量 =====
let scene, camera, renderer;
let character;
let platforms = [];
let particles = [];
let animationId = null;

// ===== 游戏状态 =====
let gameState = {
    isPlaying: false,
    currentIndex: 0,
    words: [],
    isJumping: false,
    isFalling: false
};

// ===== 音效系统 =====
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('音频初始化失败:', e);
            return false;
        }
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return true;
}

function playJumpSound() {
    if (!initAudio()) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playFallSound() {
    if (!initAudio()) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.type = 'sawtooth';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playWinSound() {
    if (!initAudio()) return;
    
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = audioContext.currentTime + index * 0.1;
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        oscillator.type = 'triangle';
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
    });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    loadGameSettings();
    setupInputHandlers();
});

function initThreeJS() {
    const canvas = document.getElementById('gameCanvas');
    
    // 场景 - 深渊效果
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.02);
    
    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    
    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);
    
    // 主光源
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    
    // 彩色点光源
    const pointLight1 = new THREE.PointLight(0x6366f1, 0.6, 20);
    pointLight1.position.set(-5, 3, 0);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xf5576c, 0.6, 20);
    pointLight2.position.set(PLATFORM_COUNT * PLATFORM_GAP, 3, 0);
    scene.add(pointLight2);
    
    // 创建深渊背景
    createAbyss();
    
    // 创建粒子效果
    createParticles();
    
    // 窗口调整
    window.addEventListener('resize', onWindowResize);
    
    // 开始渲染
    animate();
}

function createAbyss() {
    // 深渊网格（在底部很远的地方）
    const gridGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a3a,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -20;
    scene.add(grid);
    
    // 深渊发光层
    const glowGeometry = new THREE.PlaneGeometry(80, 80);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x0f0f2f,
        transparent: true,
        opacity: 0.8
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -19;
    scene.add(glow);
}

function createParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = Math.random() * 20 - 10;
        positions[i + 2] = (Math.random() - 0.5) * 30;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x8888ff,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

function createPlatforms() {
    // 清除旧平台
    platforms.forEach(p => scene.remove(p.mesh));
    platforms = [];
    
    for (let i = 0; i < PLATFORM_COUNT; i++) {
        const platform = createGlassPlatform(i);
        platform.mesh.position.set(i * PLATFORM_GAP, 0, 0);
        scene.add(platform.mesh);
        platforms.push(platform);
    }
}

function createGlassPlatform(index) {
    const group = new THREE.Group();
    
    // 玻璃平台主体
    const geometry = new THREE.BoxGeometry(PLATFORM_SIZE, 0.5, PLATFORM_SIZE);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.6,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2244aa,
        emissiveIntensity: 0.2
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);
    
    // 发光边框
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 2
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    group.add(wireframe);
    
    // 平台编号
    const numberGeometry = new THREE.PlaneGeometry(1, 1);
    const numberTexture = createNumberTexture(index + 1);
    const numberMaterial = new THREE.MeshBasicMaterial({
        map: numberTexture,
        transparent: true
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.rotation.x = -Math.PI / 2;
    numberMesh.position.y = 0.26;
    group.add(numberMesh);
    
    // 中文显示
    if (gameState.words[index]) {
        const textGeometry = new THREE.PlaneGeometry(2.5, 0.8);
        const textTexture = createTextTexture(gameState.words[index].chinese);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 2, 0);
        group.add(textMesh);
    }
    
    return { mesh: group, index: index };
}

function createNumberTexture(number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(10, 10, 492, 108, 20);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
    ctx.roundRect(10, 10, 492, 108, 20);
    ctx.stroke();
    
    // 文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createCharacter() {
    if (character) scene.remove(character);
    
    const group = new THREE.Group();
    
    // 使用 PBR 材质让小人更有质感
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6,
        roughness: 0.4,
        metalness: 0.1
    });
    
    const skinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffdbac,
        roughness: 0.6,
        metalness: 0
    });
    
    const pantsMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1e3a5f,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const shoesMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.8,
        metalness: 0
    });
    
    // 身体 - 躯干（圆润的箱形）
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.35);
    // 让边缘圆润
    const torsoModifier = new THREE.Mesh(torsoGeo, bodyMaterial);
    torsoModifier.position.y = 0.95;
    torsoModifier.castShadow = true;
    group.add(torsoModifier);
    
    // 身体装饰 - 发光条纹
    const stripeGeo = new THREE.BoxGeometry(0.52, 0.1, 0.36);
    const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.5
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMaterial);
    stripe.position.y = 1.0;
    group.add(stripe);
    
    // 头 - 稍微椭圆的球体
    const headGeo = new THREE.SphereGeometry(0.32, 32, 32);
    // 稍微压扁一点更可爱
    headGeo.scale(1, 1.1, 0.95);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.55;
    head.castShadow = true;
    group.add(head);
    
    // 头发/头盔
    const helmetGeo = new THREE.SphereGeometry(0.34, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const helmetMaterial = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.3,
        metalness: 0.3
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMaterial);
    helmet.position.y = 1.55;
    helmet.scale.set(1, 0.8, 1);
    group.add(helmet);
    
    // 眼睛 - 更大更有神
    const eyeWhiteGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.12, 1.6, 0.28);
    leftEyeWhite.scale.z = 0.5;
    group.add(leftEyeWhite);
    
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.12, 1.6, 0.28);
    rightEyeWhite.scale.z = 0.5;
    group.add(rightEyeWhite);
    
    // 眼珠
    const pupilGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.12, 1.6, 0.35);
    group.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.12, 1.6, 0.35);
    group.add(rightPupil);
    
    // 眼睛高光
    const highlightGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    leftHighlight.position.set(-0.1, 1.62, 0.37);
    group.add(leftHighlight);
    
    const rightHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    rightHighlight.position.set(0.14, 1.62, 0.37);
    group.add(rightHighlight);
    
    // 嘴巴 - 微笑
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xcc6666 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 1.45, 0.3);
    mouth.rotation.x = Math.PI;
    group.add(mouth);
    
    // 腮红
    const cheekGeo = new THREE.CircleGeometry(0.06, 16);
    const cheekMat = new THREE.MeshBasicMaterial({ 
        color: 0xffaaaa, 
        transparent: true, 
        opacity: 0.5 
    });
    
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.2, 1.5, 0.3);
    leftCheek.rotation.y = -0.3;
    group.add(leftCheek);
    
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.2, 1.5, 0.3);
    rightCheek.rotation.y = 0.3;
    group.add(rightCheek);
    
    // 手臂 - 更自然的圆柱形
    function createArm(x, isLeft) {
        const armGroup = new THREE.Group();
        
        // 上臂
        const upperArmGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.35, 12);
        const upperArm = new THREE.Mesh(upperArmGeo, bodyMaterial);
        upperArm.position.y = 0.175;
        upperArm.castShadow = true;
        armGroup.add(upperArm);
        
        // 肘部关节
        const elbowGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const elbow = new THREE.Mesh(elbowGeo, bodyMaterial);
        elbow.position.y = 0;
        armGroup.add(elbow);
        
        // 前臂
        const lowerArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.3, 12);
        const lowerArm = new THREE.Mesh(lowerArmGeo, skinMaterial);
        lowerArm.position.y = -0.22;
        lowerArm.castShadow = true;
        armGroup.add(lowerArm);
        
        // 手
        const handGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const hand = new THREE.Mesh(handGeo, skinMaterial);
        hand.position.y = -0.4;
        hand.scale.y = 0.8;
        armGroup.add(hand);
        
        // 位置
        armGroup.position.set(x, 1.1, 0);
        armGroup.rotation.z = isLeft ? Math.PI / 8 : -Math.PI / 8;
        
        return armGroup;
    }
    
    group.add(createArm(-0.35, true));
    group.add(createArm(0.35, false));
    
    // 腿 - 更完整的腿部结构
    function createLeg(x) {
        const legGroup = new THREE.Group();
        
        // 大腿
        const thighGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.4, 12);
        const thigh = new THREE.Mesh(thighGeo, pantsMaterial);
        thigh.position.y = 0.2;
        thigh.castShadow = true;
        legGroup.add(thigh);
        
        // 膝盖
        const kneeGeo = new THREE.SphereGeometry(0.11, 12, 12);
        const knee = new THREE.Mesh(kneeGeo, pantsMaterial);
        knee.position.y = 0;
        legGroup.add(knee);
        
        // 小腿
        const calfGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.35, 12);
        const calf = new THREE.Mesh(calfGeo, pantsMaterial);
        calf.position.y = -0.22;
        calf.castShadow = true;
        legGroup.add(calf);
        
        // 鞋子
        const shoeGeo = new THREE.BoxGeometry(0.15, 0.12, 0.25);
        const shoe = new THREE.Mesh(shoeGeo, shoesMaterial);
        shoe.position.set(0, -0.42, 0.05);
        shoe.castShadow = true;
        legGroup.add(shoe);
        
        // 鞋带细节
        const laceGeo = new THREE.BoxGeometry(0.1, 0.02, 0.15);
        const laceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lace = new THREE.Mesh(laceGeo, laceMat);
        lace.position.set(0, -0.36, 0.08);
        legGroup.add(lace);
        
        legGroup.position.set(x, 0.45, 0);
        return legGroup;
    }
    
    group.add(createLeg(-0.15));
    group.add(createLeg(0.15));
    
    // 身体周围的发光光环
    const glowGeo = new THREE.RingGeometry(0.6, 0.7, 32);
    const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = Math.PI / 2;
    glow.position.y = 0.1;
    group.add(glow);
    
    character = group;
    scene.add(character);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 旋转粒子
    particles.forEach(p => {
        p.rotation.y += 0.001;
    });
    
    // 平台发光动画
    platforms.forEach((p, i) => {
        const time = Date.now() * 0.001;
        const intensity = 0.2 + Math.sin(time + i) * 0.1;
        p.mesh.children[0].material.emissiveIntensity = intensity;
    });
    
    // 相机跟随角色
    if (character && gameState.isPlaying && !gameState.isFalling) {
        const targetX = character.position.x;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.lookAt(character.position.x, 0, 0);
    }
    
    renderer.render(scene, camera);
}

// ===== 游戏逻辑 =====

function loadGameSettings() {
    const urlParams = new URLSearchParams(window.location.search);
    const wordsParam = urlParams.get('words');
    
    if (wordsParam) {
        try {
            gameState.words = JSON.parse(decodeURIComponent(wordsParam));
        } catch (e) {
            console.error('解析失败:', e);
        }
    }
    
    // 使用默认数据
    if (gameState.words.length !== 5) {
        gameState.words = [
            { english: 'apple', chinese: '苹果' },
            { english: 'book', chinese: '书' },
            { english: 'cat', chinese: '猫' },
            { english: 'dog', chinese: '狗' },
            { english: 'fish', chinese: '鱼' }
        ];
    }
    
    // 显示单词预览
    const preview = document.getElementById('wordListPreview');
    preview.innerHTML = gameState.words.map(w => `
        <div class="preview-word">
            <span class="en">${w.english}</span>
            <span class="cn">${w.chinese}</span>
        </div>
    `).join('');
}

function setupInputHandlers() {
    const input = document.getElementById('wordInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptJump();
    });
}

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameUI').classList.add('active');
    
    gameState.isPlaying = true;
    gameState.currentIndex = 0;
    gameState.isJumping = false;
    gameState.isFalling = false;
    
    // 创建场景
    createPlatforms();
    createCharacter();
    
    // 设置初始位置
    character.position.set(0, 0, 0);
    camera.position.set(0, 5, 15);
    
    // 更新UI
    updateWordDisplay();
    updateProgress();
    
    document.getElementById('wordInput').focus();
}

function updateWordDisplay() {
    if (gameState.currentIndex < gameState.words.length) {
        document.getElementById('wordChinese').textContent = 
            gameState.words[gameState.currentIndex].chinese;
    }
}

function updateProgress() {
    const progress = (gameState.currentIndex / PLATFORM_COUNT) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
        `${gameState.currentIndex}/${PLATFORM_COUNT}`;
}

function attemptJump() {
    if (!gameState.isPlaying || gameState.isJumping || gameState.isFalling) return;
    
    const input = document.getElementById('wordInput');
    const inputValue = input.value.trim().toLowerCase();
    const correctWord = gameState.words[gameState.currentIndex].english.toLowerCase();
    
    if (inputValue === correctWord) {
        // 正确！执行跳跃
        input.classList.add('correct');
        playJumpSound();
        performJump();
    } else {
        // 错误！掉落深渊
        input.classList.add('wrong');
        playFallSound();
        performFall();
    }
    
    setTimeout(() => input.classList.remove('correct', 'wrong'), 500);
}

function performJump() {
    gameState.isJumping = true;
    
    const startPos = character.position.clone();
    const endPos = new THREE.Vector3(
        (gameState.currentIndex + 1) * PLATFORM_GAP,
        0,
        0
    );
    
    const startTime = Date.now();
    
    function jumpAnimate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / JUMP_DURATION, 1);
        
        // 抛物线运动
        const x = startPos.x + (endPos.x - startPos.x) * progress;
        const height = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
        const y = startPos.y + height;
        
        character.position.set(x, y, 0);
        
        // 角色旋转
        character.rotation.x = -Math.sin(progress * Math.PI * 2) * 0.5;
        
        if (progress < 1) {
            requestAnimationFrame(jumpAnimate);
        } else {
            // 跳跃完成
            character.position.copy(endPos);
            character.rotation.x = 0;
            gameState.isJumping = false;
            gameState.currentIndex++;
            
            // 清空输入
            document.getElementById('wordInput').value = '';
            
            // 更新进度
            updateProgress();
            
            // 检查是否通关
            if (gameState.currentIndex >= PLATFORM_COUNT) {
                setTimeout(gameWin, 300);
            } else {
                updateWordDisplay();
                document.getElementById('wordInput').focus();
            }
        }
    }
    
    jumpAnimate();
}

function performFall() {
    gameState.isFalling = true;
    document.getElementById('abyssWarning').classList.remove('hidden');
    
    const startTime = Date.now();
    const startY = character.position.y;
    
    function fallAnimate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / FALL_DURATION, 1);
        
        // 加速下落
        const y = startY - (progress * progress) * 30;
        character.position.y = y;
        
        // 旋转下落
        character.rotation.x += 0.1;
        character.rotation.z += 0.05;
        
        if (progress < 1) {
            requestAnimationFrame(fallAnimate);
        } else {
            gameOver();
        }
    }
    
    fallAnimate();
}

function gameWin() {
    gameState.isPlaying = false;
    playWinSound();
    
    document.getElementById('resultIcon').textContent = '🏆';
    document.getElementById('resultTitle').textContent = '挑战成功！';
    document.getElementById('resultDesc').textContent = '你成功跳过了所有玻璃格子！';
    
    document.getElementById('resultModal').classList.remove('hidden');
}

function gameOver() {
    gameState.isPlaying = false;
    
    document.getElementById('resultIcon').textContent = '💀';
    document.getElementById('resultTitle').textContent = '挑战失败';
    document.getElementById('resultDesc').textContent = '你掉入了万丈深渊...';
    
    document.getElementById('resultModal').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('resultModal').classList.add('hidden');
    document.getElementById('abyssWarning').classList.add('hidden');
    
    // 重置状态
    gameState.currentIndex = 0;
    gameState.isJumping = false;
    gameState.isFalling = false;
    
    // 重新创建场景
    createCharacter();
    character.position.set(0, 0, 0);
    camera.position.set(0, 5, 15);
    
    document.getElementById('wordInput').value = '';
    updateWordDisplay();
    updateProgress();
    
    gameState.isPlaying = true;
    document.getElementById('wordInput').focus();
}

function exitGame() {
    if (confirm('确定要退出游戏吗？')) {
        location.href = 'word-jump-parent.html';
    }
}
