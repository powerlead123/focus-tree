// 孩子端 JavaScript
const SESSION_KEY = 'focusTreeSession';
const HISTORY_KEY = 'focusTreeHistory';

let sessionActive = false;
let startTime = null;
let focusSeconds = 0;
let timerInterval = null;
let distractionCount = 0;
let treeCount = 0;
let isPaused = false;
let currentTask = '';
let expectedMinutes = 30;
let pausedSeconds = 0;
let currentRoomId = null;
let useFirebase = false;

// 每5秒长一棵树
const TREE_GROW_INTERVAL = 5;

// 统一使用一种树
const TREE_EMOJI = '🌲';

// DOM 元素
const taskNameModal = document.getElementById('taskNameModal');
const taskNameInput = document.getElementById('taskNameInput');
const confirmTaskBtn = document.getElementById('confirmTaskBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const customMinutes = document.getElementById('customMinutes');
const mainScreen = document.getElementById('mainScreen');
const currentTaskName = document.getElementById('currentTaskName');
const endBtn = document.getElementById('endBtn');
const timeDisplay = document.getElementById('timeDisplay');
const countdownTime = document.getElementById('countdownTime');
const countdownDisplay = document.getElementById('countdownDisplay');
const treeCountDisplay = document.getElementById('treeCount');
const forest = document.getElementById('forest');
const clouds = document.getElementById('clouds');
const resultModal = document.getElementById('resultModal');
const resultStats = document.getElementById('resultStats');
const closeModal = document.getElementById('closeModal');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const roomIdDisplay = document.getElementById('roomIdDisplay');
const firebaseStatusEl = document.getElementById('firebaseStatus');

// 模式选择已移除，直接显示专注作业输入

// 时间选项按钮
const timeOptions = document.querySelectorAll('.time-option');
timeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        timeOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        customMinutes.value = '';
        expectedMinutes = parseInt(btn.dataset.minutes);
    });
});

// 自定义时间输入
customMinutes.addEventListener('input', () => {
    if (customMinutes.value) {
        timeOptions.forEach(b => b.classList.remove('active'));
        expectedMinutes = parseInt(customMinutes.value) || 30;
    }
});

// 确认任务名称并开始
confirmTaskBtn.addEventListener('click', () => {
    const taskName = taskNameInput.value.trim();
    if (!taskName) {
        alert('请输入作业名称');
        return;
    }
    
    // 获取预期时间
    if (customMinutes.value) {
        expectedMinutes = parseInt(customMinutes.value) || 30;
    }
    
    if (expectedMinutes < 1 || expectedMinutes > 180) {
        alert('请输入1-180分钟之间的时间');
        return;
    }
    
    currentTask = taskName;
    currentTaskName.textContent = taskName;
    
    // 如果 Firebase 可用，显示房间号
    if (useFirebase) {
        showRoomModal();
    } else {
        startSession();
    }
});

// 显示房间号弹窗
function showRoomModal() {
    currentRoomId = generateRoomId();
    document.getElementById('roomIdDisplay').textContent = currentRoomId;
    
    // 显示家长端URL
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    document.getElementById('parentUrl').textContent = `${baseUrl}parent.html?room=${currentRoomId}`;
    
    // 创建 Firebase 房间
    createRoom(currentRoomId, currentTask, expectedMinutes).then(() => {
        console.log('房间创建成功:', currentRoomId);
    });
    
    taskNameModal.classList.add('hidden');
    document.getElementById('roomModal').classList.remove('hidden');
}

// 开始会话按钮
document.getElementById('startWithoutParent').addEventListener('click', () => {
    document.getElementById('roomModal').classList.add('hidden');
    startSession();
});

// 开始会话
function startSession() {
    mainScreen.classList.remove('hidden');
    
    // 应用选择的背景
    if (typeof applyBackground === 'function') {
        applyBackground('focus');
    }
    
    // 更新主页面的房间号显示
    const roomIdElements = document.querySelectorAll('#roomIdDisplay');
    if (roomIdElements.length > 1 && currentRoomId) {
        roomIdElements[1].textContent = currentRoomId;
    }
    
    sessionActive = true;
    startTime = Date.now();
    focusSeconds = 0;
    distractionCount = 0;
    treeCount = 0;
    pausedSeconds = 0;
    lastPenaltyTime = 0; // 重置超时惩罚计数
    lastDiceValues = { min1: -1, min2: -1, sec1: -1, sec2: -1 }; // 重置骰子值
    
    // 骰子初始摇动效果
    shakeDiceOnStart();
    
    saveSession();
    startTimer();
    
    // 如果使用 Firebase，开始监听信号和同步数据
    if (useFirebase && currentRoomId) {
        listenToSignals((signal) => {
            if (signal.action === 'distraction') {
                showClouds(signal.duration || 5);
            }
        });
        
        // 定期同步数据到 Firebase
        setInterval(() => {
            if (sessionActive && currentRoomId) {
                updateRoom({
                    trees: treeCount,
                    distractions: distractionCount,
                    focusSeconds: focusSeconds,
                    pausedSeconds: pausedSeconds
                });
            }
        }, 2000);
    } else {
        // 本地模式，使用 localStorage
        checkParentSignal();
    }
    
    playSound('start');
}

// 查看历史记录
viewHistoryBtn.addEventListener('click', () => {
    showHistory('all');
});

// 关闭历史记录
closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.add('hidden');
});

// 历史记录筛选标签
document.addEventListener('DOMContentLoaded', () => {
    const historyTabs = document.querySelectorAll('.history-tab');
    historyTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            historyTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            showHistory(filter);
        });
    });
    
    // 森林展示切换标签
    const forestTabs = document.querySelectorAll('.forest-tab');
    forestTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            forestTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const period = tab.dataset.period;
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            showAchievementForest(period, history);
        });
    });
});

// 回车键确认
taskNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmTaskBtn.click();
    }
});

// 结束作业
endBtn.addEventListener('click', () => {
    endSession();
});

// 关闭结果弹窗
closeModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    resetSession();
});

// 定时器
function startTimer() {
    timerInterval = setInterval(() => {
        if (!sessionActive) return;
        
        focusSeconds++;
        updateDisplay();
        
        // 检查是否超时
        const expectedSeconds = expectedMinutes * 60;
        const isOvertime = focusSeconds > expectedSeconds;
        
        // 只有不在暂停状态且未超时时才长树
        if (!isPaused && !isOvertime && focusSeconds % TREE_GROW_INTERVAL === 0) {
            growNewTree();
        }
        
        saveSession();
    }, 1000);
}

function updateDisplay() {
    const minutes = Math.floor(focusSeconds / 60);
    const seconds = focusSeconds % 60;
    timeDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`;
    treeCountDisplay.textContent = `${treeCount}`;
    
    // 更新倒计时
    const expectedSeconds = expectedMinutes * 60;
    const remainingSeconds = expectedSeconds - focusSeconds;
    
    if (remainingSeconds > 0) {
        const remMin = Math.floor(remainingSeconds / 60);
        const remSec = remainingSeconds % 60;
        
        // 更新骰子显示
        updateDiceDisplay(remMin, remSec);
        
        // 更新进度条
        const percentage = ((expectedSeconds - remainingSeconds) / expectedSeconds) * 100;
        updateProgressBar(percentage, false);
        
        // 根据剩余时间改变颜色
        const remainingPercentage = (remainingSeconds / expectedSeconds) * 100;
        countdownDisplay.classList.remove('time-warning', 'time-danger', 'time-overtime');
        
        if (remainingPercentage > 50) {
            countdownDisplay.classList.add('time-good');
        } else if (remainingPercentage > 20) {
            countdownDisplay.classList.remove('time-good');
            countdownDisplay.classList.add('time-warning');
        } else {
            countdownDisplay.classList.remove('time-good', 'time-warning');
            countdownDisplay.classList.add('time-danger');
        }
    } else {
        // 超时
        const overtimeSeconds = Math.abs(remainingSeconds);
        const overMin = Math.floor(overtimeSeconds / 60);
        const overSec = overtimeSeconds % 60;
        
        // 更新骰子显示（超时）
        updateDiceDisplay(overMin, overSec, true);
        
        // 更新进度条（超时状态）
        const overtimePercentage = Math.min((overtimeSeconds / expectedSeconds) * 100, 100);
        updateProgressBar(100 + overtimePercentage, true);
        
        countdownDisplay.classList.remove('time-good', 'time-warning', 'time-danger');
        countdownDisplay.classList.add('time-overtime');
        
        // 超时惩罚：每30秒炸掉一棵树
        handleOvertimePenalty(overtimeSeconds);
    }
}

// 更新骰子显示
let lastDiceValues = { min1: -1, min2: -1, sec1: -1, sec2: -1 };

function updateDiceDisplay(minutes, seconds, isOvertime = false) {
    const min1 = Math.floor(minutes / 10);
    const min2 = minutes % 10;
    const sec1 = Math.floor(seconds / 10);
    const sec2 = seconds % 10;
    
    const newValues = {
        min1: isOvertime ? '+' : min1,
        min2: min2,
        sec1: sec1,
        sec2: sec2
    };
    
    // 检查每个骰子是否需要更新并添加翻转动画
    updateDiceWithFlip('diceMin1', newValues.min1, lastDiceValues.min1);
    updateDiceWithFlip('diceMin2', newValues.min2, lastDiceValues.min2);
    updateDiceWithFlip('diceSec1', newValues.sec1, lastDiceValues.sec1);
    updateDiceWithFlip('diceSec2', newValues.sec2, lastDiceValues.sec2);
    
    lastDiceValues = newValues;
}

// 带翻转动画的骰子更新
function updateDiceWithFlip(elementId, newValue, oldValue) {
    const element = document.getElementById(elementId);
    
    if (newValue !== oldValue) {
        // 添加翻转动画
        element.classList.add('dice-flip');
        
        // 在动画中途更新数字
        setTimeout(() => {
            element.textContent = newValue;
        }, 150);
        
        // 动画结束后移除类
        setTimeout(() => {
            element.classList.remove('dice-flip');
        }, 300);
    }
}

// 开始时骰子摇动效果
function shakeDiceOnStart() {
    const diceElements = ['diceMin1', 'diceMin2', 'diceSec1', 'diceSec2'];
    
    diceElements.forEach((id, index) => {
        setTimeout(() => {
            const element = document.getElementById(id);
            element.classList.add('dice-shake-start');
            
            setTimeout(() => {
                element.classList.remove('dice-shake-start');
            }, 600);
        }, index * 100);
    });
}

// 更新进度条
function updateProgressBar(percentage, isOvertime) {
    const progressFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressBarText');
    
    if (isOvertime) {
        progressFill.style.width = '100%';
        progressFill.classList.remove('warning', 'danger');
        progressFill.classList.add('overtime');
        progressText.textContent = '超时！';
    } else {
        const displayPercentage = Math.min(percentage, 100);
        progressFill.style.width = displayPercentage + '%';
        progressText.textContent = Math.round(displayPercentage) + '%';
        
        progressFill.classList.remove('overtime');
        if (percentage > 80) {
            progressFill.classList.remove('warning');
            progressFill.classList.add('danger');
        } else if (percentage > 50) {
            progressFill.classList.remove('danger');
            progressFill.classList.add('warning');
        } else {
            progressFill.classList.remove('warning', 'danger');
        }
    }
}

// 超时惩罚
let lastPenaltyTime = 0;
function handleOvertimePenalty(overtimeSeconds) {
    // 每10秒炸掉一棵树（改为更频繁）
    const penaltyInterval = 10;
    const currentPenalty = Math.floor(overtimeSeconds / penaltyInterval);
    
    console.log('超时惩罚检查:', {
        overtimeSeconds,
        currentPenalty,
        lastPenaltyTime,
        treeCount,
        shouldExplode: currentPenalty > lastPenaltyTime && treeCount > 0
    });
    
    if (currentPenalty > lastPenaltyTime && treeCount > 0) {
        lastPenaltyTime = currentPenalty;
        console.log('💥 炸掉一棵树！当前剩余:', treeCount - 1);
        explodeTree();
    }
}

// 炸掉一棵树
function explodeTree() {
    const trees = forest.querySelectorAll('.tree');
    if (trees.length === 0) return;
    
    // 随机选择一棵树
    const randomIndex = Math.floor(Math.random() * trees.length);
    const treeToExplode = trees[randomIndex];
    
    // 添加爆炸动画
    treeToExplode.classList.add('tree-exploding');
    
    // 创建爆炸粒子
    createExplosionParticles(treeToExplode);
    
    // 动画结束后移除
    setTimeout(() => {
        treeToExplode.remove();
        treeCount = Math.max(0, treeCount - 1);
        treeCountDisplay.textContent = `${treeCount}`;
    }, 800);
}

// 创建爆炸粒子效果
function createExplosionParticles(tree) {
    const rect = tree.getBoundingClientRect();
    const particles = ['💥', '🔥', '✨', '💨'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.fontSize = '30px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10000';
        particle.style.animation = `particle-burst-${i} 1s ease-out forwards`;
        
        // 动态创建动画
        const angle = (i * 45) * Math.PI / 180;
        const distance = 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

function growNewTree() {
    const tree = document.createElement('div');
    tree.className = 'tree';
    tree.textContent = TREE_EMOJI;
    
    forest.appendChild(tree);
    treeCount++;
    
    playSound('grow');
    updateDisplay();
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

// 显示乌云
function showClouds(duration = 5) {
    if (!sessionActive) return;
    
    isPaused = true;
    clouds.classList.remove('hidden');
    distractionCount++;
    pausedSeconds += duration;
    
    // 添加走神记录
    addDistractionMark();
    
    playSound('distraction');
    
    setTimeout(() => {
        clouds.classList.add('hidden');
        isPaused = false;
    }, duration * 1000);
}

// 添加走神标记
function addDistractionMark() {
    const distractionClouds = document.getElementById('distractionClouds');
    const cloudMark = document.createElement('span');
    cloudMark.className = 'cloud-mark';
    cloudMark.textContent = '☁️';
    distractionClouds.appendChild(cloudMark);
}

// 结束会话
function endSession() {
    sessionActive = false;
    clearInterval(timerInterval);
    
    // 停止 Firebase 监听
    if (useFirebase) {
        stopListening();
        if (currentRoomId) {
            deleteRoom();
        }
    }
    
    const minutes = Math.floor(focusSeconds / 60);
    const seconds = focusSeconds % 60;
    const expectedSeconds = expectedMinutes * 60;
    const timeDiff = focusSeconds - expectedSeconds;
    
    // 计算效率
    const pausedMin = Math.floor(pausedSeconds / 60);
    const pausedSec = pausedSeconds % 60;
    
    let timeAnalysis = '';
    let encouragement = '';
    
    if (timeDiff <= 0) {
        // 提前或按时完成
        const savedSeconds = Math.abs(timeDiff);
        const savedMin = Math.floor(savedSeconds / 60);
        const savedSec = savedSeconds % 60;
        
        if (savedSeconds > 60) {
            timeAnalysis = `<p class="time-success">✅ 提前 ${savedMin}分${savedSec}秒 完成！</p>`;
            encouragement = '太棒了！你的专注让你节省了时间！🎉';
        } else if (savedSeconds > 0) {
            timeAnalysis = `<p class="time-success">✅ 提前 ${savedSec}秒 完成！</p>`;
            encouragement = '完美！时间掌控得很好！💯';
        } else {
            timeAnalysis = `<p class="time-success">✅ 准时完成！</p>`;
            encouragement = '完美！时间掌控得很好！💯';
        }
    } else {
        // 超时
        const overMin = Math.floor(timeDiff / 60);
        const overSec = timeDiff % 60;
        timeAnalysis = `<p class="time-overtime">⏰ 超时 ${overMin}分${overSec}秒</p>`;
        
        if (distractionCount <= 2) {
            encouragement = '虽然超时了，但你很专注！可能是任务比较难，继续加油！💪';
        } else {
            encouragement = '下次试试减少走神，会更快完成哦！🌟';
        }
    }
    
    // 计算如果没走神能节省的时间
    let efficiencyTip = '';
    if (pausedSeconds > 0) {
        if (pausedMin > 0) {
            efficiencyTip = `<p class="efficiency-tip">💡 如果没有走神，可以节省 ${pausedMin}分${pausedSec}秒</p>`;
        } else {
            efficiencyTip = `<p class="efficiency-tip">💡 如果没有走神，可以节省 ${pausedSec}秒</p>`;
        }
    }
    
    // 保存到历史记录
    saveToHistory({
        taskName: currentTask,
        date: new Date().toLocaleString('zh-CN'),
        duration: focusSeconds,
        expectedMinutes: expectedMinutes,
        treeCount: treeCount,
        distractionCount: distractionCount,
        pausedSeconds: pausedSeconds
    });
    
    // 保存小树到公共数据（用于商城系统）
    if (typeof addTrees === 'function' && treeCount > 0) {
        addTrees(treeCount);
    }
    
    resultStats.innerHTML = `
        <p style="font-size: 24px; margin-bottom: 20px;">📚 ${currentTask}</p>
        <div class="result-section">
            <p>🎯 预期时间：<strong>${expectedMinutes}分钟</strong></p>
            <p>⏱️ 实际用时：<strong>${minutes}分${seconds}秒</strong></p>
            ${timeAnalysis}
        </div>
        <div class="result-section">
            <p>🌳 种了小树：<strong>${treeCount}棵</strong></p>
            <p>☁️ 走神次数：<strong>${distractionCount}次</strong>（暂停${pausedMin}分${pausedSec}秒）</p>
            ${efficiencyTip}
        </div>
        <p style="margin-top: 20px; color: #667eea; font-size: 20px;">${encouragement}</p>
    `;
    
    resultModal.classList.remove('hidden');
    clearSession();
}

function resetSession() {
    sessionActive = false;
    focusSeconds = 0;
    distractionCount = 0;
    treeCount = 0;
    pausedSeconds = 0;
    startTime = null;
    isPaused = false;
    currentTask = '';
    expectedMinutes = 30;
    
    timeDisplay.textContent = '00:00';
    treeCountDisplay.textContent = '0';
    taskNameInput.value = '';
    customMinutes.value = '';
    
    // 重置时间选项为30分钟
    timeOptions.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-minutes="30"]').classList.add('active');
    
    forest.innerHTML = '';
    document.getElementById('distractionClouds').innerHTML = '';
    
    countdownDisplay.classList.remove('time-warning', 'time-danger', 'time-overtime');
    countdownDisplay.classList.add('time-good');
    
    mainScreen.classList.add('hidden');
    taskNameModal.classList.remove('hidden');
}

// 本地存储
function saveSession() {
    const session = {
        active: sessionActive,
        startTime: startTime,
        focusSeconds: focusSeconds,
        distractionCount: distractionCount,
        treeCount: treeCount,
        taskName: currentTask,
        expectedMinutes: expectedMinutes,
        pausedSeconds: pausedSeconds,
        roomId: currentRoomId
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// 保存历史记录
function saveToHistory(record) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift(record); // 最新的放在前面
    
    // 只保留最近50条记录
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// 显示历史记录
function showHistory(filter = 'all') {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    // 计算统计数据
    const stats = calculateStats(history);
    
    // 更新汇总卡片
    document.getElementById('todayTrees').textContent = `${stats.today.trees}棵树`;
    document.getElementById('todayTasks').textContent = `${stats.today.tasks}个任务`;
    document.getElementById('weekTrees').textContent = `${stats.week.trees}棵树`;
    document.getElementById('weekTasks').textContent = `${stats.week.tasks}个任务`;
    document.getElementById('totalTrees').textContent = `${stats.total.trees}棵树`;
    document.getElementById('totalTasks').textContent = `${stats.total.tasks}个任务`;
    
    // 更新专注率
    document.getElementById('todayFocusRate').textContent = stats.today.focusRate;
    document.getElementById('weekFocusRate').textContent = stats.week.focusRate;
    
    // 显示成果森林（默认显示今日）
    showAchievementForest('today', history);
    
    // 筛选记录
    let filteredHistory = history;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    
    if (filter === 'today') {
        filteredHistory = history.filter(record => {
            const recordDate = new Date(record.date).getTime();
            return recordDate >= todayStart;
        });
    } else if (filter === 'week') {
        filteredHistory = history.filter(record => {
            const recordDate = new Date(record.date).getTime();
            return recordDate >= weekStart;
        });
    }
    
    // 显示记录列表
    if (filteredHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无记录</p>';
    } else {
        let html = '<div class="history-items">';
        filteredHistory.forEach((record) => {
            const minutes = Math.floor(record.duration / 60);
            const seconds = record.duration % 60;
            const expectedMin = record.expectedMinutes || 0;
            const timeDiff = record.duration - (expectedMin * 60);
            
            let timeStatus = '';
            if (expectedMin > 0) {
                if (timeDiff <= 0) {
                    timeStatus = '<span class="status-success">✅ 提前完成</span>';
                } else {
                    const overMin = Math.floor(timeDiff / 60);
                    timeStatus = `<span class="status-overtime">⏰ 超时${overMin}分</span>`;
                }
            }
            
            html += `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-task">📚 ${record.taskName}</span>
                        <span class="history-date">${record.date}</span>
                    </div>
                    <div class="history-stats">
                        <span>🎯 预期${expectedMin}分</span>
                        <span>⏱️ 用时${minutes}分${seconds}秒</span>
                        <span>🌳 ${record.treeCount}棵</span>
                        <span>☁️ ${record.distractionCount}次</span>
                        ${timeStatus}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        historyList.innerHTML = html;
    }
    
    historyModal.classList.remove('hidden');
}

// 计算统计数据
function calculateStats(history) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    
    const stats = {
        today: { trees: 0, tasks: 0, totalTime: 0, pausedTime: 0 },
        week: { trees: 0, tasks: 0, totalTime: 0, pausedTime: 0 },
        total: { trees: 0, tasks: 0, totalTime: 0, pausedTime: 0 }
    };
    
    history.forEach(record => {
        const recordDate = new Date(record.date).getTime();
        const trees = record.treeCount || 0;
        const duration = record.duration || 0;
        const paused = record.pausedSeconds || 0;
        
        // 总计
        stats.total.trees += trees;
        stats.total.tasks += 1;
        stats.total.totalTime += duration;
        stats.total.pausedTime += paused;
        
        // 本周
        if (recordDate >= weekStart) {
            stats.week.trees += trees;
            stats.week.tasks += 1;
            stats.week.totalTime += duration;
            stats.week.pausedTime += paused;
        }
        
        // 今日
        if (recordDate >= todayStart) {
            stats.today.trees += trees;
            stats.today.tasks += 1;
            stats.today.totalTime += duration;
            stats.today.pausedTime += paused;
        }
    });
    
    // 计算专注率
    stats.today.focusRate = calculateFocusRate(stats.today.totalTime, stats.today.pausedTime);
    stats.week.focusRate = calculateFocusRate(stats.week.totalTime, stats.week.pausedTime);
    
    return stats;
}

// 计算专注率
function calculateFocusRate(totalTime, pausedTime) {
    if (totalTime === 0) return '--';
    const focusTime = totalTime - pausedTime;
    const rate = Math.round((focusTime / totalTime) * 100);
    
    let emoji = '';
    if (rate >= 95) emoji = '🌟';
    else if (rate >= 85) emoji = '😊';
    else if (rate >= 70) emoji = '🙂';
    else emoji = '💪';
    
    return `${rate}% ${emoji}`;
}

// 显示成果森林
function showAchievementForest(period, history) {
    const forestDisplay = document.getElementById('achievementForest');
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    
    // 筛选记录
    let filteredHistory = history;
    if (period === 'today') {
        filteredHistory = history.filter(record => {
            const recordDate = new Date(record.date).getTime();
            return recordDate >= todayStart;
        });
    } else if (period === 'week') {
        filteredHistory = history.filter(record => {
            const recordDate = new Date(record.date).getTime();
            return recordDate >= weekStart;
        });
    }
    
    // 计算总树数
    let totalTrees = 0;
    filteredHistory.forEach(record => {
        totalTrees += record.treeCount || 0;
    });
    
    if (totalTrees === 0) {
        let emptyText = '开始学习，种下第一棵树吧！🌱';
        if (period === 'today') {
            emptyText = '今天还没有种树，开始学习吧！🌱';
        } else if (period === 'week') {
            emptyText = '本周还没有种树，加油！🌱';
        }
        forestDisplay.innerHTML = `<div class="forest-empty">${emptyText}</div>`;
        return;
    }
    
    // 生成森林
    let html = '<div class="achievement-trees">';
    
    // 限制显示数量，避免太多
    const maxDisplay = 200;
    const displayCount = Math.min(totalTrees, maxDisplay);
    
    for (let i = 0; i < displayCount; i++) {
        html += `<span class="achievement-tree">${TREE_EMOJI}</span>`;
    }
    
    if (totalTrees > maxDisplay) {
        html += `<span class="tree-more">+${totalTrees - maxDisplay}棵</span>`;
    }
    
    html += '</div>';
    
    // 添加统计信息
    let periodText = '';
    if (period === 'today') periodText = '今天';
    else if (period === 'week') periodText = '本周';
    else periodText = '总共';
    
    html += `<div class="forest-summary">${periodText}种了 <strong>${totalTrees}</strong> 棵树，完成了 <strong>${filteredHistory.length}</strong> 个任务！</div>`;
    
    forestDisplay.innerHTML = html;
}

function loadSession() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
        const session = JSON.parse(saved);
        if (session.active) {
            sessionActive = true;
            startTime = session.startTime;
            focusSeconds = session.focusSeconds;
            distractionCount = session.distractionCount;
            treeCount = session.treeCount || 0;
            currentTask = session.taskName || '作业任务';
            expectedMinutes = session.expectedMinutes || 30;
            pausedSeconds = session.pausedSeconds || 0;
            currentRoomId = session.roomId || null;
            
            currentTaskName.textContent = currentTask;
            
            // 重建森林
            forest.innerHTML = '';
            for (let i = 0; i < treeCount; i++) {
                const tree = document.createElement('div');
                tree.className = 'tree';
                tree.textContent = TREE_EMOJI;
                forest.appendChild(tree);
            }
            
            // 重建走神记录
            const distractionClouds = document.getElementById('distractionClouds');
            distractionClouds.innerHTML = '';
            for (let i = 0; i < distractionCount; i++) {
                const cloudMark = document.createElement('span');
                cloudMark.className = 'cloud-mark';
                cloudMark.textContent = '☁️';
                distractionClouds.appendChild(cloudMark);
            }
            
            taskNameModal.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            
            updateDisplay();
            startTimer();
            
            // 如果使用 Firebase 且有房间号，重新连接
            if (useFirebase && currentRoomId) {
                listenToSignals((signal) => {
                    if (signal.action === 'distraction') {
                        showClouds(signal.duration || 5);
                    }
                });
            } else if (!useFirebase) {
                checkParentSignal();
            }
        }
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// 监听来自家长端的消息
function checkParentSignal() {
    setInterval(() => {
        const signal = localStorage.getItem('parentSignal');
        if (signal) {
            const data = JSON.parse(signal);
            if (data.action === 'distraction' && data.timestamp > Date.now() - 2000) {
                showClouds(data.duration || 5);
                localStorage.removeItem('parentSignal');
            }
        }
    }, 500);
}

// 音效（简单的提示）
function playSound(type) {
    // 可以添加音效，这里暂时省略
    console.log(`Sound: ${type}`);
}

// 初始化 Firebase
useFirebase = initFirebase();

// 初始化
loadSession();
if (!useFirebase) {
    checkParentSignal();
}

// 渲染背景选择器
renderBackgroundSelector();

// 应用已选择的背景
if (typeof applyBackground === 'function') {
    applyBackground('focus');
}


// 渲染背景选择器
function renderBackgroundSelector() {
    const container = document.getElementById('focusBackgroundSelector');
    if (!container) return;
    
    // 检查是否有common.js的函数
    if (typeof getUnlockedBackgrounds !== 'function') {
        container.innerHTML = '<p style="color: #999; font-size: 14px;">背景功能需要先解锁背景图</p>';
        return;
    }
    
    const unlockedBackgrounds = getUnlockedBackgrounds();
    const settings = getSettings();
    const currentBg = settings.focusBackground;
    
    if (unlockedBackgrounds.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 14px;">还没有解锁的背景图，去商城解锁吧！</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // 添加默认选项
    const defaultOption = document.createElement('div');
    defaultOption.className = 'background-option' + (!currentBg ? ' active' : '');
    defaultOption.innerHTML = `
        <div class="bg-preview" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
        <div class="bg-name">默认背景</div>
    `;
    defaultOption.onclick = () => selectBackground(null, 'focus');
    container.appendChild(defaultOption);
    
    // 添加已解锁的背景
    unlockedBackgrounds.forEach(bg => {
        const option = document.createElement('div');
        option.className = 'background-option' + (currentBg === bg.id ? ' active' : '');
        option.innerHTML = `
            <div class="bg-preview" style="background-image: url(${bg.thumbnail}); background-size: cover; background-position: center;"></div>
            <div class="bg-name">${bg.name}</div>
        `;
        option.onclick = () => selectBackground(bg.id, 'focus');
        container.appendChild(option);
    });
}

// 选择背景
function selectBackground(backgroundId, module) {
    if (typeof setModuleBackground !== 'function') return;
    
    setModuleBackground(module, backgroundId);
    
    // 更新选中状态
    const options = document.querySelectorAll('.background-option');
    options.forEach(opt => opt.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 立即应用背景
    if (typeof applyBackground === 'function') {
        applyBackground(module);
    }
}
