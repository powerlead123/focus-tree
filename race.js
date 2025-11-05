// 口算竞速 JavaScript

// 存储键
const STORAGE_KEYS = {
    NAMES: 'mathRace_names',
    HISTORY: 'mathRace_history',
    SETTINGS: 'mathRace_settings'
};

// 全局状态
let namePool = [];
let selectedOpponents = [];
let raceState = null;
let raceTimer = null;
let opponentsTimer = null;
let editingNameId = null;
let raceMode = 'manual'; // 'manual' 或 'auto'
let questions = []; // 题目列表
let currentAnswer = ''; // 当前输入的答案

// 汽车图标
const CAR_ICONS = ['🚗', '🚙', '🚕', '🚓', '🚐'];

// 运算符
const OPERATORS = ['+', '-', '×', '÷'];

// DOM 元素
const setupScreen = document.getElementById('setupScreen');
const raceScreen = document.getElementById('raceScreen');
const resultScreen = document.getElementById('resultScreen');
const questionCountInput = document.getElementById('questionCount');
const opponentCountInput = document.getElementById('opponentCount');
const minSpeedInput = document.getElementById('minSpeed');
const maxSpeedInput = document.getElementById('maxSpeed');
const lotteryBtn = document.getElementById('lotteryBtn');
const selectedOpponentsDiv = document.getElementById('selectedOpponents');
const startRaceBtn = document.getElementById('startRaceBtn');
const backBtn = document.getElementById('backBtn');
const manageNamesBtn = document.getElementById('manageNamesBtn');
const namesModal = document.getElementById('namesModal');
const editNameModal = document.getElementById('editNameModal');
const lotteryModal = document.getElementById('lotteryModal');
const closeNamesModalBtn = document.getElementById('closeNamesModalBtn');
const addNameBtn = document.getElementById('addNameBtn');
const saveNameBtn = document.getElementById('saveNameBtn');
const cancelNameBtn = document.getElementById('cancelNameBtn');
const completeBtn = document.getElementById('completeBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exitRaceBtn = document.getElementById('exitRaceBtn');
const cancelLotteryBtn = document.getElementById('cancelLotteryBtn');

// 初始化
function init() {
    loadNames();
    loadSettings();
    setupEventListeners();
    renderSelectedOpponents();
}

// 事件监听
function setupEventListeners() {
    lotteryBtn.addEventListener('click', startLottery);
    startRaceBtn.addEventListener('click', startRace);
    backBtn.addEventListener('click', () => window.location.href = 'index.html');
    manageNamesBtn.addEventListener('click', () => {
        namesModal.classList.remove('hidden');
        renderNamesManageList();
    });
    closeNamesModalBtn.addEventListener('click', () => namesModal.classList.add('hidden'));
    addNameBtn.addEventListener('click', () => showEditNameModal());
    saveNameBtn.addEventListener('click', saveName);
    cancelNameBtn.addEventListener('click', () => editNameModal.classList.add('hidden'));
    completeBtn.addEventListener('click', userCompleteQuestion);
    playAgainBtn.addEventListener('click', resetToSetup);
    backToHomeBtn.addEventListener('click', () => window.location.href = 'index.html');
    viewHistoryBtn.addEventListener('click', showHistory);
    closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
    clearHistoryBtn.addEventListener('click', clearHistory);
    exitRaceBtn.addEventListener('click', exitRace);
    cancelLotteryBtn.addEventListener('click', cancelLottery);
}

// 加载名字池
function loadNames() {
    const saved = localStorage.getItem(STORAGE_KEYS.NAMES);
    if (saved) {
        namePool = JSON.parse(saved);
    } else {
        // 初始化默认名字
        namePool = [
            { id: 'default_1', name: '妈妈' },
            { id: 'default_2', name: '爸爸' },
            { id: 'default_3', name: '姐姐' },
            { id: 'default_4', name: 'AI助手' }
        ];
        saveNames();
    }
}

// 保存名字池
function saveNames() {
    localStorage.setItem(STORAGE_KEYS.NAMES, JSON.stringify(namePool));
}

// 加载设置
function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
        const settings = JSON.parse(saved);
        questionCountInput.value = settings.questionCount || 20;
        opponentCountInput.value = settings.opponentCount || 2;
        minSpeedInput.value = settings.minSpeed || 3;
        maxSpeedInput.value = settings.maxSpeed || 8;
        selectedOpponents = settings.selectedOpponents || [];
    }
}

// 保存设置
function saveSettings() {
    const settings = {
        questionCount: parseInt(questionCountInput.value),
        opponentCount: parseInt(opponentCountInput.value),
        minSpeed: parseInt(minSpeedInput.value),
        maxSpeed: parseInt(maxSpeedInput.value),
        selectedOpponents: selectedOpponents
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// 开始摇号
async function startLottery() {
    const count = parseInt(opponentCountInput.value);
    const minSpeed = parseInt(minSpeedInput.value);
    const maxSpeed = parseInt(maxSpeedInput.value);
    
    if (namePool.length === 0) {
        alert('名字池为空，请先添加名字');
        return;
    }
    
    if (count > namePool.length) {
        alert(`名字池只有${namePool.length}个名字，无法摇出${count}个对手`);
        return;
    }
    
    if (count < 1 || count > 5) {
        alert('对手数量必须在1-5之间');
        return;
    }
    
    if (minSpeed >= maxSpeed) {
        alert('最小速度必须小于最大速度');
        return;
    }
    
    selectedOpponents = [];
    const usedNames = []; // 记录已使用的名字
    
    // 重置显示
    document.getElementById('lotteryResultList').innerHTML = '';
    document.getElementById('lotteryName').textContent = '?';
    document.getElementById('lotterySpeed').textContent = '?';
    document.getElementById('nameStatus').textContent = '等待中...';
    document.getElementById('speedStatus').textContent = '等待中...';
    
    lotteryModal.classList.remove('hidden');
    
    // 禁用取消按钮
    cancelLotteryBtn.disabled = true;
    cancelLotteryBtn.style.opacity = '0.5';
    
    for (let i = 0; i < count; i++) {
        document.getElementById('lotteryProgress').textContent = `正在摇第 ${i + 1}/${count} 个对手...`;
        
        // 重置状态显示
        document.getElementById('nameStatus').textContent = '等待中...';
        document.getElementById('nameStatus').classList.remove('success');
        document.getElementById('speedStatus').textContent = '等待中...';
        document.getElementById('speedStatus').classList.remove('success');
        
        // 第一轮：摇名字（排除已使用的）
        const name = await lotteryName(usedNames);
        usedNames.push(name);
        
        // 等待一下再摇速度
        await sleep(300);
        
        // 第二轮：摇速度
        const speed = await lotterySpeed();
        
        // 添加到结果
        selectedOpponents.push({
            id: 'lottery_' + Date.now() + '_' + i,
            name: name,
            timePerQuestion: speed
        });
        
        // 显示结果
        addLotteryResult(i + 1, name, speed);
        
        await sleep(800);
    }
    
    document.getElementById('lotteryProgress').textContent = '✨ 摇号完成！';
    
    // 启用取消按钮
    cancelLotteryBtn.disabled = false;
    cancelLotteryBtn.style.opacity = '1';
    
    await sleep(1500);
    
    lotteryModal.classList.add('hidden');
    renderSelectedOpponents();
    saveSettings();
}

// 摇名字
function lotteryName(usedNames) {
    return new Promise((resolve) => {
        const nameBox = document.querySelector('.lottery-box:first-child');
        nameBox.classList.add('active');
        
        const display = document.getElementById('lotteryName');
        const status = document.getElementById('nameStatus');
        
        display.classList.remove('stopped');
        display.classList.add('rolling');
        status.textContent = '摇号中...';
        
        // 可用的名字（排除已使用的）
        const availableNames = namePool.filter(n => !usedNames.includes(n.name));
        
        let count = 0;
        const maxCount = 25 + Math.floor(Math.random() * 15);
        
        const interval = setInterval(() => {
            const randomName = availableNames[Math.floor(Math.random() * availableNames.length)].name;
            display.textContent = randomName;
            count++;
            
            if (count >= maxCount) {
                clearInterval(interval);
                display.classList.remove('rolling');
                display.classList.add('stopped');
                
                setTimeout(() => {
                    status.textContent = '✓ 已选中';
                    status.classList.add('success');
                    nameBox.classList.remove('active');
                    resolve(display.textContent);
                }, 500);
            }
        }, 80);
    });
}

// 摇速度
function lotterySpeed() {
    return new Promise((resolve) => {
        const speedBox = document.querySelector('.lottery-box:last-child');
        speedBox.classList.add('active');
        
        const display = document.getElementById('lotterySpeed');
        const status = document.getElementById('speedStatus');
        
        display.classList.remove('stopped');
        display.classList.add('rolling');
        status.textContent = '摇号中...';
        
        const minSpeed = parseInt(minSpeedInput.value);
        const maxSpeed = parseInt(maxSpeedInput.value);
        
        let count = 0;
        const maxCount = 20 + Math.floor(Math.random() * 10);
        
        const interval = setInterval(() => {
            const randomSpeed = minSpeed + Math.floor(Math.random() * (maxSpeed - minSpeed + 1));
            display.textContent = `${randomSpeed}秒`;
            count++;
            
            if (count >= maxCount) {
                clearInterval(interval);
                display.classList.remove('rolling');
                display.classList.add('stopped');
                
                setTimeout(() => {
                    const speed = parseInt(display.textContent);
                    status.textContent = '✓ 已选中';
                    status.classList.add('success');
                    speedBox.classList.remove('active');
                    resolve(speed);
                }, 500);
            }
        }, 70);
    });
}

// 添加摇号结果到列表
function addLotteryResult(index, name, speed) {
    const list = document.getElementById('lotteryResultList');
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
        <span class="result-name">${index}. ${name}</span>
        <span class="result-speed">${speed}秒/题</span>
    `;
    list.appendChild(item);
}

// 渲染已选对手
function renderSelectedOpponents() {
    selectedOpponentsDiv.innerHTML = '';
    
    if (selectedOpponents.length === 0) {
        selectedOpponentsDiv.innerHTML = '<p style="text-align: center; color: #999;">点击"开始摇号"选择对手</p>';
        return;
    }
    
    selectedOpponents.forEach((opp, index) => {
        const div = document.createElement('div');
        div.className = 'selected-opponent-item';
        div.innerHTML = `
            <div class="opponent-detail">
                <div class="opponent-detail-name">${index + 1}. ${opp.name}</div>
                <div class="opponent-detail-speed">${opp.timePerQuestion}秒/题</div>
            </div>
        `;
        selectedOpponentsDiv.appendChild(div);
    });
}

// 显示记录墙
function showHistory() {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    
    // 计算统计数据
    const totalRaces = history.length;
    const winCount = history.filter(r => r.rank === 1).length;
    
    let bestTime = '--';
    if (history.length > 0) {
        const fastest = Math.min(...history.map(r => r.duration));
        const min = Math.floor(fastest / 60);
        const sec = fastest % 60;
        bestTime = `${min}:${pad(sec)}`;
    }
    
    document.getElementById('totalRaces').textContent = totalRaces;
    document.getElementById('winCount').textContent = winCount;
    document.getElementById('bestTime').textContent = bestTime;
    
    // 显示记录列表
    const listDiv = document.getElementById('historyList');
    
    if (history.length === 0) {
        listDiv.innerHTML = `
            <div class="history-empty">
                <div class="history-empty-icon">🏁</div>
                <div class="history-empty-text">还没有比赛记录<br>快去开始第一场比赛吧！</div>
            </div>
        `;
    } else {
        listDiv.innerHTML = '';
        
        history.forEach((record, index) => {
            const item = document.createElement('div');
            item.className = 'history-item' + (record.rank === 1 ? ' winner' : '');
            
            const medals = ['🥇', '🥈', '🥉'];
            const rankDisplay = record.rank <= 3 ? medals[record.rank - 1] : `第${record.rank}名`;
            const rankClass = record.rank === 1 ? 'first' : record.rank === 2 ? 'second' : record.rank === 3 ? 'third' : '';
            
            const min = Math.floor(record.duration / 60);
            const sec = record.duration % 60;
            const timeStr = `${min}:${pad(sec)}`;
            
            item.innerHTML = `
                <div class="history-header-row">
                    <span class="history-date">${record.date}</span>
                    <span class="history-rank ${rankClass}">${rankDisplay}</span>
                </div>
                <div class="history-details">
                    <div class="history-detail-item">
                        <div class="history-detail-label">题目数</div>
                        <div class="history-detail-value">${record.totalQuestions}题</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="history-detail-label">用时</div>
                        <div class="history-detail-value">${timeStr}</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="history-detail-label">平均</div>
                        <div class="history-detail-value">${record.avgTimePerQuestion}秒</div>
                    </div>
                </div>
                <div class="history-opponents">
                    对手：${record.opponents.join('、')} (共${record.totalParticipants}人)
                </div>
            `;
            
            listDiv.appendChild(item);
        });
    }
    
    historyModal.classList.remove('hidden');
}

// 清空记录
function clearHistory() {
    if (confirm('确定要清空所有比赛记录吗？此操作无法恢复！')) {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        showHistory();
    }
}

// 辅助函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 渲染名字管理列表
function renderNamesManageList() {
    const list = document.getElementById('namesManageList');
    list.innerHTML = '';
    
    namePool.forEach(name => {
        const div = document.createElement('div');
        div.className = 'manage-item';
        div.innerHTML = `
            <div class="manage-info">
                <div class="manage-name">${name.name}</div>
            </div>
            <div class="manage-actions">
                <button class="btn btn-secondary btn-small" onclick="editName('${name.id}')">编辑</button>
                <button class="btn btn-danger btn-small" onclick="deleteName('${name.id}')">删除</button>
            </div>
        `;
        list.appendChild(div);
    });
}

// 显示编辑名字弹窗
function showEditNameModal(nameId = null) {
    editingNameId = nameId;
    const title = document.getElementById('editNameTitle');
    const nameInput = document.getElementById('nameInput');
    
    if (nameId) {
        const name = namePool.find(n => n.id === nameId);
        title.textContent = '编辑名字';
        nameInput.value = name.name;
    } else {
        title.textContent = '添加名字';
        nameInput.value = '';
    }
    
    editNameModal.classList.remove('hidden');
}

// 保存名字
function saveName() {
    const name = document.getElementById('nameInput').value.trim();
    
    if (!name) {
        alert('请输入名字');
        return;
    }
    
    if (editingNameId) {
        // 编辑
        const nameObj = namePool.find(n => n.id === editingNameId);
        nameObj.name = name;
    } else {
        // 新增
        namePool.push({
            id: 'custom_' + Date.now(),
            name: name
        });
    }
    
    saveNames();
    renderNamesManageList();
    editNameModal.classList.add('hidden');
}

// 编辑名字
window.editName = function(id) {
    showEditNameModal(id);
};

// 删除名字
window.deleteName = function(id) {
    if (confirm('确定要删除这个名字吗？')) {
        namePool = namePool.filter(n => n.id !== id);
        saveNames();
        renderNamesManageList();
    }
};

// 开始比赛
function startRace() {
    const questionCount = parseInt(questionCountInput.value);
    
    if (!questionCount || questionCount < 1 || questionCount > 100) {
        alert('请输入1-100之间的题目数量');
        return;
    }
    
    if (selectedOpponents.length === 0) {
        alert('请先摇号选择对手');
        return;
    }
    
    // 获取比赛模式
    raceMode = document.querySelector('input[name="raceMode"]:checked').value;
    
    // 如果是答题模式，生成题目
    if (raceMode === 'auto') {
        generateAllQuestions(questionCount);
        currentAnswer = '';
    }
    
    saveSettings();
    
    raceState = {
        isRunning: true,
        startTime: Date.now(),
        totalQuestions: questionCount,
        participants: [
            {
                id: 'user',
                name: '我',
                type: 'user',
                completed: 0,
                progress: 0,
                isFinished: false
            },
            ...selectedOpponents.map((opp, index) => ({
                id: opp.id,
                name: opp.name,
                type: 'opponent',
                timePerQuestion: opp.timePerQuestion,
                completed: 0,
                progress: 0,
                isFinished: false,
                lastUpdateTime: Date.now()
            }))
        ]
    };
    
    // 切换到比赛页面
    setupScreen.classList.add('hidden');
    raceScreen.classList.remove('hidden');
    
    renderRaceTracks();
    startRaceTimer();
    startOpponentsUpdate();
    
    // 根据模式显示不同的控制界面
    if (raceMode === 'auto') {
        document.getElementById('completeBtn').classList.add('hidden');
        document.getElementById('answerPanel').classList.remove('hidden');
        setupNumberKeyboard();
        showCurrentQuestion();
    } else {
        document.getElementById('completeBtn').classList.remove('hidden');
        document.getElementById('answerPanel').classList.add('hidden');
    }
}

// 渲染赛道
function renderRaceTracks() {
    const container = document.getElementById('raceTracks');
    container.innerHTML = '';
    
    raceState.participants.forEach((p, index) => {
        const lane = document.createElement('div');
        lane.className = 'track-lane';
        lane.id = `track_${p.id}`;
        
        const carIcon = p.type === 'user' ? '🚗' : CAR_ICONS[index % CAR_ICONS.length];
        
        lane.innerHTML = `
            <div class="track-progress" id="progress_${p.id}" style="width: 0%"></div>
            <span class="car" id="car_${p.id}" style="left: 0%">${carIcon}</span>
            <div class="track-info">
                <span class="track-name">${p.name}</span>
            </div>
            <span class="track-count" id="count_${p.id}">0/${raceState.totalQuestions}</span>
        `;
        
        container.appendChild(lane);
    });
}

// 启动计时器
function startRaceTimer() {
    raceTimer = setInterval(() => {
        if (!raceState.isRunning) return;
        
        const elapsed = Math.floor((Date.now() - raceState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('raceTime').textContent = 
            `${pad(minutes)}:${pad(seconds)}`;
    }, 1000);
}

// 启动对手自动更新
function startOpponentsUpdate() {
    opponentsTimer = setInterval(() => {
        if (!raceState || !raceState.isRunning) return;
        
        const currentTime = Date.now();
        
        raceState.participants.forEach(p => {
            if (p.type === 'opponent' && !p.isFinished) {
                updateOpponent(p, currentTime);
            }
        });
    }, 1000);
}

// 更新对手进度
function updateOpponent(opponent, currentTime) {
    const timeDiff = (currentTime - opponent.lastUpdateTime) / 1000;
    
    // 随机波动 ±20%
    const randomFactor = 0.8 + Math.random() * 0.4;
    const actualSpeed = opponent.timePerQuestion * randomFactor;
    
    const shouldComplete = Math.floor(timeDiff / actualSpeed);
    
    if (shouldComplete > 0) {
        opponent.completed = Math.min(
            opponent.completed + shouldComplete,
            raceState.totalQuestions
        );
        opponent.lastUpdateTime = currentTime;
        opponent.progress = (opponent.completed / raceState.totalQuestions) * 100;
        
        if (opponent.completed >= raceState.totalQuestions) {
            opponent.isFinished = true;
        }
        
        updateTrackUI(opponent);
    }
}

// 用户完成一题
function userCompleteQuestion() {
    if (!raceState.isRunning) return;
    
    const user = raceState.participants.find(p => p.type === 'user');
    
    if (user.completed < raceState.totalQuestions) {
        user.completed++;
        user.progress = (user.completed / raceState.totalQuestions) * 100;
        
        updateTrackUI(user);
        
        if (user.completed >= raceState.totalQuestions) {
            user.isFinished = true;
            endRace();
        }
    }
}

// 更新赛道UI
function updateTrackUI(participant) {
    const car = document.getElementById(`car_${participant.id}`);
    const progress = document.getElementById(`progress_${participant.id}`);
    const count = document.getElementById(`count_${participant.id}`);
    
    if (car && progress && count) {
        // 汽车位置跟随进度条，但留出一点空间给汽车图标
        const carPosition = Math.max(0, participant.progress - 5);
        
        // 添加移动动画效果
        car.classList.add('moving');
        setTimeout(() => {
            car.classList.remove('moving');
        }, 300);
        
        car.style.left = `${carPosition}%`;
        progress.style.width = `${participant.progress}%`;
        count.textContent = `${participant.completed}/${raceState.totalQuestions}`;
    }
}

// 结束比赛
function endRace() {
    raceState.isRunning = false;
    clearInterval(raceTimer);
    
    const duration = Math.floor((Date.now() - raceState.startTime) / 1000);
    const avgTime = (duration / raceState.totalQuestions).toFixed(2);
    
    // 计算排名
    const rankings = calculateRanking();
    const userRank = rankings.findIndex(r => r.id === 'user') + 1;
    const beatCount = rankings.length - userRank;
    
    // 保存记录
    saveRaceRecord(duration, userRank);
    
    // 显示结果
    showResults(userRank, duration, avgTime, beatCount, rankings);
}

// 计算排名
function calculateRanking() {
    return raceState.participants
        .map(p => ({
            id: p.id,
            name: p.name,
            completed: p.completed,
            // 用户：实际用时；对手：理论完成时间（总题数 × 每题用时）
            time: p.type === 'user' 
                ? (Date.now() - raceState.startTime) / 1000
                : raceState.totalQuestions * p.timePerQuestion
        }))
        .sort((a, b) => {
            // 先按完成数排序（完成多的排前面）
            if (b.completed !== a.completed) {
                return b.completed - a.completed;
            }
            // 完成数相同，按时间排序（时间少的排前面）
            return a.time - b.time;
        });
}

// 显示结果
function showResults(rank, duration, avgTime, beatCount, rankings) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    document.getElementById('rankDisplay').textContent = `🏆 第 ${rank} 名`;
    document.getElementById('totalTime').textContent = `${minutes}分${seconds}秒`;
    document.getElementById('avgTime').textContent = `${avgTime}秒`;
    document.getElementById('beatCount').textContent = `${beatCount}个`;
    
    // 排名列表
    const rankingList = document.getElementById('finalRanking');
    rankingList.innerHTML = '';
    
    const medals = ['🥇', '🥈', '🥉'];
    rankings.forEach((r, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        const medal = medals[index] || `${index + 1}.`;
        const time = Math.floor(r.time);
        const min = Math.floor(time / 60);
        const sec = time % 60;
        
        div.innerHTML = `
            <span class="ranking-position">${medal}</span>
            <span class="ranking-name">${r.name}</span>
            <span class="ranking-time">${min}分${sec}秒</span>
        `;
        rankingList.appendChild(div);
    });
    
    // 如果是答题模式，显示答案对比
    if (raceMode === 'auto' && questions.length > 0) {
        const reviewResult = showAnswerReview();
        
        // 在排名列表后插入答案对比
        const answerSection = document.createElement('div');
        answerSection.className = 'answer-section';
        answerSection.innerHTML = `
            <h3>📝 答题详情</h3>
            <div class="accuracy-display">
                <span class="accuracy-label">正确率：</span>
                <span class="accuracy-value">${reviewResult.accuracy}%</span>
                <span class="accuracy-detail">(${reviewResult.correctCount}/${questions.length}题)</span>
            </div>
            ${reviewResult.html}
        `;
        
        // 插入到鼓励语之前
        const encouragementDiv = document.getElementById('encouragement');
        encouragementDiv.parentNode.insertBefore(answerSection, encouragementDiv);
    }
    
    // 鼓励语
    let encouragement = '';
    if (rank === 1) {
        encouragement = '🎉 太棒了！你是第一名！';
    } else if (rank === 2) {
        encouragement = '💪 很棒！再努力一点就是第一了！';
    } else if (beatCount > 0) {
        encouragement = `😊 不错！你超越了${beatCount}个对手！`;
    } else {
        encouragement = '🌟 继续加油！下次会更好！';
    }
    
    document.getElementById('encouragement').textContent = encouragement;
    
    // 切换到结果页面
    raceScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
}

// 保存比赛记录
function saveRaceRecord(duration, rank) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    
    const record = {
        id: 'race_' + Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        totalQuestions: raceState.totalQuestions,
        duration: duration,
        avgTimePerQuestion: (duration / raceState.totalQuestions).toFixed(2),
        rank: rank,
        totalParticipants: raceState.participants.length,
        opponents: raceState.participants
            .filter(p => p.type === 'opponent')
            .map(p => p.name)
    };
    
    history.unshift(record);
    
    // 只保留最近20条
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

// 重置到设置页面
function resetToSetup() {
    resultScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    raceState = null;
}

// 退出比赛
function exitRace() {
    if (confirm('确定要退出比赛吗？当前进度将不会保存。')) {
        // 停止所有计时器
        if (raceTimer) {
            clearInterval(raceTimer);
            raceTimer = null;
        }
        if (opponentsTimer) {
            clearInterval(opponentsTimer);
            opponentsTimer = null;
        }
        
        // 返回设置页面
        raceScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        raceState = null;
    }
}

// 取消摇号
function cancelLottery() {
    // 关闭摇号弹窗
    lotteryModal.classList.add('hidden');
    
    // 清空已选对手
    selectedOpponents = [];
    renderSelectedOpponents();
}

// 辅助函数
function pad(num) {
    return num.toString().padStart(2, '0');
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    init();
});


// 生成三个数的混合运算题目（三年级难度）
function generateQuestion() {
    let num1, num2, num3, op1, op2, answer;
    let attempts = 0;
    let isValid = false;
    
    while (!isValid && attempts < 50) {
        attempts++;
        
        // 随机选择第一个运算符
        op1 = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
        
        // 第二个运算符：如果第一个是乘除，第二个必须是加减
        if (op1 === '×' || op1 === '÷') {
            op2 = Math.random() < 0.5 ? '+' : '-';
        } else {
            // 第一个是加减，第二个可以是任意
            op2 = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
        }
        
        // 根据运算符生成第一个数
        if (op1 === '×') {
            // 乘法：两个因子都不超过10
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
        } else if (op1 === '÷') {
            // 除法：被除数不超过100，能整除
            num2 = Math.floor(Math.random() * 9) + 2; // 除数2-10
            const quotient = Math.floor(Math.random() * 10) + 1; // 商1-10
            num1 = num2 * quotient; // 确保能整除且不超过100
            if (num1 > 100) {
                continue; // 重新生成
            }
        } else {
            // 加减法：数字不超过100
            num1 = Math.floor(Math.random() * 99) + 1;
            num2 = Math.floor(Math.random() * 99) + 1;
        }
        
        // 计算第一步结果
        let firstResult;
        if (op1 === '+') firstResult = num1 + num2;
        else if (op1 === '-') firstResult = num1 - num2;
        else if (op1 === '×') firstResult = num1 * num2;
        else if (op1 === '÷') firstResult = num1 / num2;
        
        // 根据第二个运算符生成第三个数
        if (op2 === '×') {
            // 乘法：两个因子都不超过10
            // 如果第一步结果已经超过10，重新生成
            if (firstResult > 10) {
                continue;
            }
            num3 = Math.floor(Math.random() * 10) + 1;
        } else if (op2 === '÷') {
            // 除法：被除数不超过100
            if (firstResult > 100) {
                continue;
            }
            // 确保第一步结果能被num3整除
            const possibleDivisors = [];
            for (let i = 2; i <= 10; i++) {
                if (firstResult % i === 0) {
                    possibleDivisors.push(i);
                }
            }
            if (possibleDivisors.length > 0) {
                num3 = possibleDivisors[Math.floor(Math.random() * possibleDivisors.length)];
            } else {
                continue; // 重新生成
            }
        } else {
            // 加减法：数字不超过100
            num3 = Math.floor(Math.random() * 99) + 1;
        }
        
        // 计算最终答案（遵循运算优先级）
        if (op1 === '×' || op1 === '÷') {
            // 先算op1
            if (op2 === '+') answer = firstResult + num3;
            else if (op2 === '-') answer = firstResult - num3;
            else if (op2 === '×') answer = firstResult * num3;
            else if (op2 === '÷') answer = firstResult / num3;
        } else {
            // op1是加减，需要看op2优先级
            if (op2 === '×' || op2 === '÷') {
                // 先算op2
                let secondResult;
                if (op2 === '×') secondResult = num2 * num3;
                else if (op2 === '÷') secondResult = num2 / num3;
                
                if (op1 === '+') answer = num1 + secondResult;
                else if (op1 === '-') answer = num1 - secondResult;
            } else {
                // 从左到右
                if (op2 === '+') answer = firstResult + num3;
                else if (op2 === '-') answer = firstResult - num3;
            }
        }
        
        // 验证答案是否为正整数
        if (Number.isInteger(answer) && answer > 0 && answer < 1000) {
            isValid = true;
        }
    }
    
    // 如果生成失败，返回一个简单的题目
    if (!isValid) {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        num3 = Math.floor(Math.random() * 50) + 1;
        op1 = '+';
        op2 = '+';
        answer = num1 + num2 + num3;
    }
    
    return {
        question: `${num1} ${op1} ${num2} ${op2} ${num3}`,
        answer: Math.round(answer),
        userAnswer: null
    };
}

// 生成所有题目
function generateAllQuestions(count) {
    questions = [];
    for (let i = 0; i < count; i++) {
        questions.push(generateQuestion());
    }
}

// 显示当前题目
function showCurrentQuestion() {
    const user = raceState.participants.find(p => p.type === 'user');
    const currentIndex = user.completed;
    
    if (currentIndex < questions.length) {
        document.getElementById('questionText').textContent = 
            `第 ${currentIndex + 1} 题：${questions[currentIndex].question} = ?`;
    }
}

// 数字键盘事件
function setupNumberKeyboard() {
    const numBtns = document.querySelectorAll('.num-btn[data-num]');
    numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const num = btn.dataset.num;
            if (currentAnswer.length < 6) {
                currentAnswer += num;
                document.getElementById('answerDisplay').textContent = currentAnswer || '_';
            }
        });
    });
    
    document.getElementById('backspaceBtn').addEventListener('click', () => {
        currentAnswer = currentAnswer.slice(0, -1);
        document.getElementById('answerDisplay').textContent = currentAnswer || '_';
    });
    
    document.getElementById('submitAnswerBtn').addEventListener('click', submitAnswer);
}

// 提交答案
function submitAnswer() {
    if (!currentAnswer) {
        return;
    }
    
    const user = raceState.participants.find(p => p.type === 'user');
    const currentIndex = user.completed;
    
    if (currentIndex < questions.length) {
        // 保存用户答案（不校验）
        questions[currentIndex].userAnswer = parseInt(currentAnswer);
        
        // 清空输入
        currentAnswer = '';
        document.getElementById('answerDisplay').textContent = '_';
        
        // 推进进度
        userCompleteQuestion();
        
        // 显示下一题
        if (user.completed < questions.length) {
            showCurrentQuestion();
        }
    }
}

// 显示答案对比
function showAnswerReview() {
    let correctCount = 0;
    let html = '<div class="answer-review">';
    
    questions.forEach((q, index) => {
        const isCorrect = q.userAnswer === q.answer;
        if (isCorrect) correctCount++;
        
        html += `
            <div class="answer-item ${isCorrect ? 'correct' : 'wrong'}">
                <div class="answer-number">${index + 1}.</div>
                <div class="answer-question">${q.question} = ?</div>
                <div class="answer-result">
                    <div>你的答案：${q.userAnswer !== null ? q.userAnswer : '未答'}</div>
                    <div>正确答案：${q.answer}</div>
                </div>
                <div class="answer-icon">${isCorrect ? '✓' : '✗'}</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    const accuracy = Math.round((correctCount / questions.length) * 100);
    
    return {
        html: html,
        correctCount: correctCount,
        accuracy: accuracy
    };
}
