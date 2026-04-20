// 单词消消乐 3D 游戏核心逻辑

// ===== 游戏配置 =====
const GAME_CONFIG = {
    easy: {
        fallSpeed: 0.05,      // 超慢速
        spawnInterval: 6000,  // 6秒生成一个
        speedIncrement: 0.005 // 几乎不加速
    },
    medium: {
        fallSpeed: 0.1,       // 慢速
        spawnInterval: 5000,  // 5秒生成一个
        speedIncrement: 0.008
    },
    hard: {
        fallSpeed: 0.18,      // 中等速度
        spawnInterval: 4000,  // 4秒生成一个
        speedIncrement: 0.01
    }
};

const DANGER_LINE_Y = -8; // 危险线位置
const BOTTOM_LINE_Y = -10; // 底线位置（游戏结束）
const SPAWN_Y = 12; // 生成位置

// ===== Three.js 全局变量 =====
let scene, camera, renderer;
let wordBlocks = []; // 存储所有单词方块
let particles = []; // 粒子效果
let animationId = null;

// ===== 游戏状态 =====
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    words: [], // 当前游戏使用的单词
    remainingWords: [], // 还未生成的单词
    clearedCount: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    combo: 0,
    lastClearTime: 0,
    currentSpeed: 0,
    spawnTimer: 0,
    difficulty: 'medium',
    bookName: ''
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    loadGameSettings();
    setupInputHandlers();
});

// 初始化 Three.js
function initThreeJS() {
    const canvas = document.getElementById('gameCanvas');
    
    // 场景
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);
    
    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);
    
    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0x6366f1, 0.5, 50);
    pointLight1.position.set(-10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 50);
    pointLight2.position.set(10, 10, 10);
    scene.add(pointLight2);
    
    // 添加背景装饰
    createBackgroundElements();
    
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
    
    // 开始渲染循环
    animate();
}

// 创建背景装饰
function createBackgroundElements() {
    // 星空背景
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 500;
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 50 - 20;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // 网格地面
    const gridHelper = new THREE.GridHelper(40, 40, 0x6366f1, 0x1e293b);
    gridHelper.position.y = BOTTOM_LINE_Y;
    scene.add(gridHelper);
    
    // 危险线可视化
    const dangerLineGeometry = new THREE.PlaneGeometry(30, 0.1);
    const dangerLineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: 0.5 
    });
    const dangerLine = new THREE.Mesh(dangerLineGeometry, dangerLineMaterial);
    dangerLine.position.y = DANGER_LINE_Y;
    dangerLine.position.z = 0;
    scene.add(dangerLine);
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 加载游戏设置
function loadGameSettings() {
    let settings = {};
    
    // 优先从 URL 参数读取
    const urlParams = new URLSearchParams(window.location.search);
    const wordsParam = urlParams.get('words');
    
    console.log('URL参数检查:', {
        fullUrl: window.location.href,
        search: window.location.search,
        wordsParam: wordsParam ? '存在 (长度:' + wordsParam.length + ')' : '不存在'
    });
    
    if (wordsParam) {
        // 从 URL 参数解析
        try {
            const decodedWords = decodeURIComponent(wordsParam);
            console.log('解码后的单词数据:', decodedWords.substring(0, 200) + '...');
            
            settings = {
                words: JSON.parse(decodedWords),
                difficulty: urlParams.get('difficulty') || 'medium',
                bookName: urlParams.get('bookName') || '单词练习'
            };
            console.log('✅ 从URL参数加载设置成功:', {
                wordCount: settings.words.length,
                difficulty: settings.difficulty,
                bookName: settings.bookName
            });
        } catch (e) {
            console.error('❌ URL参数解析失败:', e);
            alert('数据加载失败，请返回重新选择单词');
        }
    }
    
    // 如果 URL 没有数据，尝试从 localStorage 读取
    if (!settings.words) {
        console.log('URL无数据，尝试localStorage...');
        try {
            const saved = localStorage.getItem('focusTree_wordGameSettings');
            if (saved) {
                settings = JSON.parse(saved);
                console.log('✅ 从localStorage加载成功');
            }
        } catch (e) {
            console.warn('❌ 无法访问localStorage:', e);
        }
    }
    
    // 如果都没有数据，使用默认测试数据
    if (!settings.words || settings.words.length === 0) {
        console.warn('⚠️ 没有检测到单词数据，使用默认测试数据');
        settings = {
            words: [
                { english: 'apple', chinese: '苹果' },
                { english: 'book', chinese: '书' },
                { english: 'cat', chinese: '猫' },
                { english: 'dog', chinese: '狗' },
                { english: 'fish', chinese: '鱼' }
            ],
            difficulty: 'medium',
            bookName: '测试单词本'
        };
    }
    
    gameState.words = [...settings.words];
    gameState.remainingWords = [...settings.words];
    gameState.difficulty = settings.difficulty || 'medium';
    gameState.bookName = settings.bookName || '单词练习';
    
    // 更新UI
    document.getElementById('bookNameDisplay').textContent = gameState.bookName;
    document.getElementById('difficultyBadge').textContent = 
        gameState.difficulty === 'easy' ? '简单' : 
        gameState.difficulty === 'hard' ? '困难' : '中等';
    document.getElementById('remainingDisplay').textContent = gameState.words.length;
    
    // 显示单词预览
    const preview = document.getElementById('wordPreview');
    preview.innerHTML = settings.words.map(w => `
        <div class="preview-word">
            <span class="en">${escapeHtml(w.english)}</span>
            <span class="cn">${escapeHtml(w.chinese)}</span>
        </div>
    `).join('');
    
    // 初始化游戏速度
    gameState.currentSpeed = GAME_CONFIG[gameState.difficulty].fallSpeed;
}

// 设置输入处理
function setupInputHandlers() {
    const input = document.getElementById('wordInput');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitWord();
        }
    });
    
    // 自动聚焦
    input.focus();
    
    // 防止游戏过程中失去焦点
    document.addEventListener('click', (e) => {
        if (gameState.isPlaying && !gameState.isPaused) {
            input.focus();
        }
    });
    
    // ESC键暂停
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameState.isPlaying) {
            togglePause();
        }
    });
}

// 开始游戏
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameUI').classList.add('active');
    
    // 播放开始音效
    playStartSound();
    
    // 重置游戏状态
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.clearedCount = 0;
    gameState.totalAttempts = 0;
    gameState.correctAttempts = 0;
    gameState.combo = 0;
    gameState.spawnTimer = 0;
    
    // 关键：重新初始化剩余单词列表（打乱顺序，确保每个单词只出现一次）
    gameState.remainingWords = shuffleArray([...gameState.words]);
    
    console.log('游戏开始！共', gameState.remainingWords.length, '个单词:', 
        gameState.remainingWords.map(w => w.english).join(', '));
    
    // 重置游戏速度
    gameState.currentSpeed = GAME_CONFIG[gameState.difficulty].fallSpeed;
    
    // 清空现有方块
    wordBlocks.forEach(block => scene.remove(block.mesh));
    wordBlocks = [];
    
    // 立即生成第一个方块
    if (gameState.remainingWords.length > 0) {
        spawnBlock(); // spawnBlock 内部已经处理了 pop
    }
    
    updateScore();
    document.getElementById('wordInput').focus();
}

// 打乱数组顺序（Fisher-Yates算法）
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 生成新方块
function spawnBlock() {
    if (gameState.remainingWords.length === 0) return;
    
    // 按顺序取出一个单词（确保每个单词只出现一次）
    const wordData = gameState.remainingWords.pop(); // 从数组末尾取出
    
    // 创建3D方块
    const block = createWordBlock(wordData);
    
    // 随机X位置（-8 到 8）
    block.mesh.position.x = (Math.random() - 0.5) * 16;
    block.mesh.position.y = SPAWN_Y;
    block.mesh.position.z = 0;
    
    scene.add(block.mesh);
    wordBlocks.push(block);
    
    // 入场动画
    block.mesh.scale.set(0, 0, 0);
    animateScale(block.mesh, 1, 300);
}

// 彩色配色方案
const BLOCK_COLORS = [
    { main: 0x6366f1, accent: 0x8b5cf6, name: 'purple' },   // 紫色
    { main: 0x3b82f6, accent: 0x06b6d4, name: 'blue' },     // 蓝色
    { main: 0x22c55e, accent: 0x10b981, name: 'green' },    // 绿色
    { main: 0xf59e0b, accent: 0xf97316, name: 'orange' },   // 橙色
    { main: 0xef4444, accent: 0xf43f5e, name: 'red' },      // 红色
    { main: 0xec4899, accent: 0xd946ef, name: 'pink' },     // 粉色
    { main: 0x8b5cf6, accent: 0xa855f7, name: 'violet' },   // 紫罗兰
    { main: 0x06b6d4, accent: 0x22d3ee, name: 'cyan' },     // 青色
    { main: 0x84cc16, accent: 0xa3e635, name: 'lime' },     // 柠檬绿
    { main: 0xf97316, accent: 0xfb923c, name: 'amber' }     // 琥珀色
];

// 创建单词方块
function createWordBlock(wordData) {
    // 创建带有文字纹理的几何体
    const geometry = new THREE.BoxGeometry(3, 1.5, 0.5);
    
    // 随机选择一个颜色方案
    const colorScheme = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
    
    // 创建前后两面的文字纹理（都显示中文）
    const frontTexture = createTextTexture(wordData.chinese, colorScheme);
    const backTexture = createTextTexture(wordData.chinese, colorScheme);
    
    // 材质 - 六个面使用不同的材质
    const materials = [
        new THREE.MeshPhongMaterial({ color: colorScheme.main }), // 右
        new THREE.MeshPhongMaterial({ color: colorScheme.main }), // 左
        new THREE.MeshPhongMaterial({ color: colorScheme.main }), // 上
        new THREE.MeshPhongMaterial({ color: colorScheme.main }), // 下
        new THREE.MeshPhongMaterial({ map: frontTexture }),       // 前（文字面）
        new THREE.MeshPhongMaterial({ map: backTexture })         // 后（文字面）
    ];
    
    const mesh = new THREE.Mesh(geometry, materials);
    
    // 添加发光效果（使用配色方案的强调色）
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: colorScheme.accent,
        transparent: true,
        opacity: 0.6
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(wireframe);
    
    return {
        mesh: mesh,
        wordData: wordData,
        colorScheme: colorScheme,
        id: Date.now() + Math.random()
    };
}

// 将十六进制颜色转换为CSS颜色字符串
function hexToCssColor(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return `rgb(${r}, ${g}, ${b})`;
}

// 创建文字纹理
function createTextTexture(text, colorScheme) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // 转换颜色
    const mainColor = hexToCssColor(colorScheme.main);
    const accentColor = hexToCssColor(colorScheme.accent);
    
    // 背景渐变（使用配色方案）
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, mainColor);
    gradient.addColorStop(1, accentColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    
    // 装饰性边框
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 240);
    
    // 内部装饰线
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 472, 216);
    
    // 文字发光效果
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // 文字
    ctx.fillStyle = 'white';
    ctx.font = 'bold 85px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// 缩放动画
function animateScale(mesh, targetScale, duration) {
    const startScale = mesh.scale.x;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentScale = startScale + (targetScale - startScale) * easeProgress;
        mesh.scale.set(currentScale, currentScale, currentScale);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// 提交单词
function submitWord() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const input = document.getElementById('wordInput');
    const inputValue = input.value.trim().toLowerCase();
    
    if (!inputValue) return;
    
    gameState.totalAttempts++;
    
    // 查找匹配的方块
    const matchedIndex = wordBlocks.findIndex(
        block => block.wordData.english.toLowerCase() === inputValue
    );
    
    if (matchedIndex !== -1) {
        // 正确！
        gameState.correctAttempts++;
        clearBlock(matchedIndex);
        input.classList.add('correct');
        
        // 连击计算
        const now = Date.now();
        if (now - gameState.lastClearTime < 3000) {
            gameState.combo++;
            showCombo(gameState.combo);
        } else {
            gameState.combo = 1;
        }
        gameState.lastClearTime = now;
        
        // 增加分数（连击有加成）
        const points = 100 * gameState.combo;
        gameState.score += points;
        gameState.clearedCount++;
        
        updateScore();
        
        setTimeout(() => input.classList.remove('correct'), 300);
    } else {
        // 错误！
        playErrorSound();
        input.classList.add('wrong');
        gameState.combo = 0;
        setTimeout(() => input.classList.remove('wrong'), 400);
    }
    
    input.value = '';
    input.focus();
}

// 音效系统（使用 Web Audio API）
let audioContext = null;
let audioInitialized = false;

// 初始化音频上下文（需要用户交互后才能调用）
function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
            console.log('✅ 音频上下文初始化成功');
        } catch (e) {
            console.warn('❌ 音频初始化失败:', e);
            return false;
        }
    }
    
    // 如果音频上下文被暂停，尝试恢复
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('✅ 音频上下文已恢复');
        }).catch(e => {
            console.warn('❌ 音频恢复失败:', e);
        });
    }
    
    return audioContext !== null;
}

// 用户首次交互时解锁音频
document.addEventListener('click', function unlockAudio() {
    if (!audioInitialized) {
        initAudio();
    }
    // 只执行一次
    document.removeEventListener('click', unlockAudio);
}, { once: true });

// 播放消除音效
function playClearSound() {
    if (!initAudio()) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 创建振荡器
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 设置音效参数（清脆的"叮"声）
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5音
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
    // 添加第二段音效（更丰富的音色）
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.setValueAtTime(1320, audioContext.currentTime); // E6音
    oscillator2.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.1);
    
    gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator2.type = 'triangle';
    oscillator2.start(audioContext.currentTime);
    oscillator2.stop(audioContext.currentTime + 0.1);
}

// 播放错误音效
function playErrorSound() {
    if (!initAudio()) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 低音"咚"声
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.type = 'sawtooth';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// 播放游戏开始音效
function playStartSound() {
    if (!initAudio()) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 播放上升的音效
    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = audioContext.currentTime + index * 0.1;
        oscillator.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.type = 'sine';
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    });
}

// 播放胜利音效
function playWinSound() {
    if (!initAudio()) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 播放胜利和弦
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = audioContext.currentTime + index * 0.08;
        oscillator.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        
        oscillator.type = 'triangle';
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
    });
}

// 消除方块
function clearBlock(index) {
    const block = wordBlocks[index];
    
    // 播放消除音效
    playClearSound();
    
    // 创建爆炸粒子效果
    createExplosion(block.mesh.position);
    
    // 移除方块
    scene.remove(block.mesh);
    wordBlocks.splice(index, 1);
    
    // 检查是否通关
    if (wordBlocks.length === 0 && gameState.remainingWords.length === 0) {
        setTimeout(() => gameWin(), 500);
    }
}

// 创建爆炸粒子效果
function createExplosion(position) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        
        velocities.push({
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 0.3,
        transparent: true,
        opacity: 1
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    particles.push({
        mesh: particleSystem,
        velocities: velocities,
        life: 1.0
    });
}

// 显示连击
function showCombo(combo) {
    if (combo < 2) return;
    
    const comboDisplay = document.getElementById('comboDisplay');
    document.getElementById('comboCount').textContent = combo;
    comboDisplay.classList.remove('hidden');
    
    setTimeout(() => {
        comboDisplay.classList.add('hidden');
    }, 1500);
}

// 更新分数显示
function updateScore() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('remainingDisplay').textContent = 
        gameState.remainingWords.length + wordBlocks.length;
}

// 游戏主循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (gameState.isPlaying && !gameState.isPaused) {
        updateGame();
    }
    
    // 更新粒子
    updateParticles();
    
    // 旋转所有方块
    wordBlocks.forEach(block => {
        block.mesh.rotation.y += 0.01;
        block.mesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    });
    
    renderer.render(scene, camera);
}

// 更新游戏逻辑
function updateGame() {
    const deltaTime = 16; // 约60fps
    const config = GAME_CONFIG[gameState.difficulty];
    
    // 生成新方块
    gameState.spawnTimer += deltaTime;
    if (gameState.spawnTimer >= config.spawnInterval && gameState.remainingWords.length > 0) {
        spawnBlock(); // spawnBlock 内部已经处理了 pop
        gameState.spawnTimer = 0;
        
        // 逐渐加快速度
        gameState.currentSpeed += config.speedIncrement;
    }
    
    // 更新所有方块位置
    let hasReachedDanger = false;
    
    for (let i = wordBlocks.length - 1; i >= 0; i--) {
        const block = wordBlocks[i];
        block.mesh.position.y -= gameState.currentSpeed * 0.1;
        
        // 检查是否到达危险线
        if (block.mesh.position.y <= DANGER_LINE_Y) {
            hasReachedDanger = true;
        }
        
        // 检查是否到达底部（游戏结束）
        if (block.mesh.position.y <= BOTTOM_LINE_Y) {
            gameOver();
            return;
        }
    }
    
    // 危险线警告效果 - 只保留光晕闪烁
    const dangerOverlay = document.getElementById('dangerOverlay');
    
    if (hasReachedDanger) {
        dangerOverlay.classList.add('active');
    } else {
        dangerOverlay.classList.remove('active');
    }
    
    // 检查是否通关（所有单词都被消除）
    if (wordBlocks.length === 0 && gameState.remainingWords.length === 0 && gameState.clearedCount > 0) {
        gameWin();
    }
}

// 更新粒子
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02;
        
        const positions = p.mesh.geometry.attributes.position.array;
        for (let j = 0; j < p.velocities.length; j++) {
            positions[j * 3] += p.velocities[j].x;
            positions[j * 3 + 1] += p.velocities[j].y;
            positions[j * 3 + 2] += p.velocities[j].z;
        }
        p.mesh.geometry.attributes.position.needsUpdate = true;
        p.mesh.material.opacity = p.life;
        
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }
}

// 游戏结束
function gameOver() {
    gameState.isPlaying = false;
    
    // 清除危险警告
    clearDangerWarning();
    
    const accuracy = gameState.totalAttempts > 0 
        ? Math.round((gameState.correctAttempts / gameState.totalAttempts) * 100) 
        : 0;
    
    document.getElementById('resultIcon').textContent = '😢';
    document.getElementById('resultTitle').textContent = '游戏结束';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('clearedWords').textContent = `${gameState.clearedCount}/${gameState.words.length}`;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    document.getElementById('gameOverModal').classList.remove('hidden');
}

// 清除危险警告
function clearDangerWarning() {
    const dangerOverlay = document.getElementById('dangerOverlay');
    if (dangerOverlay) dangerOverlay.classList.remove('active');
}

// 游戏胜利
function gameWin() {
    gameState.isPlaying = false;
    
    // 清除危险警告
    clearDangerWarning();
    
    // 播放胜利音效
    playWinSound();
    
    console.log('🎉 游戏胜利！消除了', gameState.clearedCount, '/', gameState.words.length, '个单词');
    
    const accuracy = gameState.totalAttempts > 0 
        ? Math.round((gameState.correctAttempts / gameState.totalAttempts) * 100) 
        : 100;
    
    document.getElementById('resultIcon').textContent = '🏆';
    document.getElementById('resultTitle').textContent = '闯关成功！';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('clearedWords').textContent = `${gameState.clearedCount}/${gameState.words.length}`;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    document.getElementById('gameOverModal').classList.remove('hidden');
}

// 重新开始
function restartGame() {
    document.getElementById('gameOverModal').classList.add('hidden');
    
    // 重置状态（打乱顺序）
    gameState.remainingWords = shuffleArray([...gameState.words]);
    gameState.currentSpeed = GAME_CONFIG[gameState.difficulty].fallSpeed;
    
    // 清空方块
    wordBlocks.forEach(block => scene.remove(block.mesh));
    wordBlocks = [];
    
    // 重新开始
    startGame();
}

// 暂停/继续
function togglePause() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        document.getElementById('pauseModal').classList.remove('hidden');
    } else {
        document.getElementById('pauseModal').classList.add('hidden');
        document.getElementById('wordInput').focus();
    }
}

// 继续游戏
function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseModal').classList.add('hidden');
    document.getElementById('wordInput').focus();
}

// 退出游戏
function exitGame() {
    if (confirm('确定要退出游戏吗？')) {
        location.href = 'word-parent.html';
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
