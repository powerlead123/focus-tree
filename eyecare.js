// 护眼训练 - 找不同数字游戏

const EYECARE_STORAGE_KEY = 'focusTree_eyecareData';
const OWNER_NAME = '柏皓';

const GAME_DURATION = 120; // 2分钟（秒）
const QUESTION_DURATION = 4; // 每题4秒
const TOTAL_QUESTIONS = 30; // 总共30题

let gameTimer = null;
let questionTimer = null;
let currentQuestion = 0;
let remainingTime = GAME_DURATION;

// 获取护眼数据
function getEyecareData() {
    const data = localStorage.getItem(EYECARE_STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return {
        todayCount: 0,
        totalCount: 0,
        lastDate: null
    };
}

// 保存护眼数据
function saveEyecareData(data) {
    localStorage.setItem(EYECARE_STORAGE_KEY, JSON.stringify(data));
}

// 开始游戏
function startGame() {
    currentQuestion = 0;
    remainingTime = GAME_DURATION;
    
    // 切换到游戏页面
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // 开始倒计时
    startTimer();
    
    // 显示第一题
    showNextQuestion();
}

// 开始计时
function startTimer() {
    updateTimerDisplay();
    
    gameTimer = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        
        if (remainingTime <= 0) {
            endGame();
        }
    }, 1000);
}

// 更新计时器显示
function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('timer').textContent = 
        `剩余时间：${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 显示下一题
function showNextQuestion() {
    if (currentQuestion >= TOTAL_QUESTIONS) {
        endGame();
        return;
    }
    
    currentQuestion++;
    document.getElementById('progress').textContent = `题目：${currentQuestion}/${TOTAL_QUESTIONS}`;
    
    // 生成题目
    generateQuestion();
    
    // 3秒后标注答案，1秒后切换下一题
    questionTimer = setTimeout(() => {
        highlightAnswer();
        
        setTimeout(() => {
            showNextQuestion();
        }, 1000);
    }, 3000);
}

// 当前不同数字的值（用于标注答案）
let currentDifferentNumber = null;

// 生成题目
function generateQuestion() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = '';
    
    // 随机选择两个不同的数字
    const baseNumber = Math.floor(Math.random() * 10);
    let differentNumber;
    do {
        differentNumber = Math.floor(Math.random() * 10);
    } while (differentNumber === baseNumber);
    
    currentDifferentNumber = differentNumber;
    
    // 生成30个数字（29个相同，1个不同）
    const numbers = [];
    for (let i = 0; i < 29; i++) {
        numbers.push(baseNumber);
    }
    numbers.push(differentNumber);
    
    // 随机打乱
    shuffleArray(numbers);
    
    // 显示数字
    numbers.forEach((num, index) => {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'number-item';
        numberDiv.textContent = num;
        numberDiv.dataset.number = num;
        
        container.appendChild(numberDiv);
    });
}

// 标注答案
function highlightAnswer() {
    const numbers = document.querySelectorAll('.number-item');
    numbers.forEach(item => {
        if (parseInt(item.dataset.number) === currentDifferentNumber) {
            item.classList.add('different');
        }
    });
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 结束游戏
function endGame() {
    // 清除计时器
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    if (questionTimer) {
        clearTimeout(questionTimer);
    }
    
    // 更新数据
    const data = getEyecareData();
    const today = new Date().toISOString().split('T')[0];
    
    if (data.lastDate !== today) {
        data.todayCount = 1;
        data.lastDate = today;
    } else {
        data.todayCount++;
    }
    data.totalCount++;
    
    saveEyecareData(data);
    
    // 添加金币
    const userData = getUserData();
    userData.coins += 5;
    saveUserData(userData);
    
    // 显示完成页面
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('completeScreen').classList.remove('hidden');
    
    document.getElementById('completedCount').textContent = currentQuestion;
    document.getElementById('todayCount').textContent = data.todayCount;
}

// 退出游戏
function exitGame() {
    if (confirm('确定要退出吗？退出后不会获得奖励。')) {
        resetGame();
    }
}

// 重置游戏
function resetGame() {
    // 清除计时器
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    if (questionTimer) {
        clearTimeout(questionTimer);
    }
    
    currentQuestion = 0;
    remainingTime = GAME_DURATION;
    
    // 返回开始页面
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('completeScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}
