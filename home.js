// 首页逻辑

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    checkStudyStreak();
    updateRoomDisplay();
    updateExchangeButton();
    startOwnerWalking(); // 启动柏皓走路
});

// 检查连续天数（如果超过1天没学习，重置为0）
function checkStudyStreak() {
    const userData = getUserData();
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userData.lastStudyDate;
    
    if (lastDate) {
        const lastTime = new Date(lastDate).getTime();
        const todayTime = new Date(today).getTime();
        const daysDiff = Math.floor((todayTime - lastTime) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
            // 超过1天没学习，重置连续天数
            userData.studyStreak = 0;
            saveUserData(userData);
        }
    }
}

// 更新房间显示
function updateRoomDisplay() {
    const userData = getUserData();
    
    // 更新资产显示
    document.getElementById('roomTrees').textContent = userData.trees;
    document.getElementById('roomCoins').textContent = userData.coins;
    document.getElementById('roomStreak').textContent = userData.studyStreak;
    
    // 更新宠物显示
    updateRoomPet();
}

// 更新房间里的宠物
function updateRoomPet() {
    // 获取宠物数据
    const petData = localStorage.getItem('focusTree_petData');
    if (!petData) {
        return;
    }
    
    const pet = JSON.parse(petData);
    const petEmoji = document.querySelector('.pet-emoji');
    
    // 根据宠物成长阶段显示不同emoji
    const stages = [
        { level: 1, emoji: '🥚', daysNeeded: 0 },
        { level: 2, emoji: '🐣', daysNeeded: 3 },
        { level: 3, emoji: '🐥', daysNeeded: 8 },
        { level: 4, emoji: '🐤', daysNeeded: 15 },
        { level: 5, emoji: '🐓', daysNeeded: 23 },
        { level: 6, emoji: '🦚', daysNeeded: 30 }
    ];
    
    let currentStage = stages[0];
    for (let i = stages.length - 1; i >= 0; i--) {
        if (pet.totalDays >= stages[i].daysNeeded) {
            currentStage = stages[i];
            break;
        }
    }
    
    petEmoji.textContent = currentStage.emoji;
}

// 更新兑换按钮状态
function updateExchangeButton() {
    const userData = getUserData();
    const exchangeBtn = document.getElementById('exchangeBtn');
    const canExchange = userData.availableTrees >= 10;
    
    exchangeBtn.disabled = !canExchange;
}

// 导航函数
function goToFocus() {
    window.location.href = 'index.html';
}

function goToRace() {
    window.location.href = 'race.html';
}

function goToPet() {
    window.location.href = 'pet.html';
}

function goToEyecare() {
    window.location.href = 'eyecare.html';
}

function goToReading() {
    window.location.href = 'reading.html';
}

function goToBubble() {
    const bubbleUrl = 'https://bubble-word-game.pages.dev/';
    window.open(bubbleUrl, '_blank');
}

function goToShop() {
    window.location.href = 'shop.html';
}

function goToBirthday() {
    window.location.href = 'birthday.html';
}

// 显示兑换弹窗
function showExchangeModal() {
    const userData = getUserData();
    const maxTimes = Math.floor(userData.availableTrees / 10);
    
    if (maxTimes === 0) {
        showToast('小树不足，无法兑换', 'error');
        return;
    }
    
    document.getElementById('modalAvailableTrees').textContent = userData.availableTrees;
    document.getElementById('maxExchangeTimes').textContent = maxTimes;
    
    const exchangeTimesInput = document.getElementById('exchangeTimes');
    exchangeTimesInput.value = 1;
    exchangeTimesInput.max = maxTimes;
    
    document.getElementById('exchangeModal').classList.remove('hidden');
}

// 关闭兑换弹窗
function closeExchangeModal() {
    document.getElementById('exchangeModal').classList.add('hidden');
}

// 设置最大兑换次数
function setMaxExchange() {
    const maxTimes = parseInt(document.getElementById('maxExchangeTimes').textContent);
    document.getElementById('exchangeTimes').value = maxTimes;
}

// 确认兑换
function confirmExchange() {
    const times = parseInt(document.getElementById('exchangeTimes').value);
    
    if (times < 1) {
        showToast('请输入有效的兑换次数', 'error');
        return;
    }
    
    const result = exchangeCoins(times);
    
    if (result.success) {
        closeExchangeModal();
        showToast(`成功兑换 ${times} 个金币！🎉`, 'success');
        updateStats();
        updateExchangeButton();
        
        // 播放兑换动画
        playExchangeAnimation(times);
    } else {
        showToast(result.message, 'error');
    }
}

// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// 播放兑换动画
function playExchangeAnimation(times) {
    // 简单的动画效果
    const exchangeBtn = document.getElementById('exchangeBtn');
    exchangeBtn.style.animation = 'none';
    setTimeout(() => {
        exchangeBtn.style.animation = 'coinFlip 0.6s ease';
    }, 10);
}

// CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes coinFlip {
        0%, 100% {
            transform: rotateY(0deg) scale(1);
        }
        50% {
            transform: rotateY(180deg) scale(1.1);
        }
    }
`;
document.head.appendChild(style);


// 与宠物互动
function interactWithPet() {
    const bubble = document.getElementById('petBubble');
    const messages = [
        '你好呀！',
        '我好开心！',
        '陪我玩吧~',
        '我爱你！',
        '今天也要加油哦！'
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    bubble.textContent = randomMsg;
    bubble.classList.remove('hidden');
    
    setTimeout(() => {
        bubble.classList.add('hidden');
    }, 2000);
}

// 与柏皓互动
function interactWithOwner() {
    showToast('这就是我，柏皓！', 'success');
}


// ========== 柏皓走路功能 ==========
let ownerWalkingInterval = null;

function startOwnerWalking() {
    const owner = document.getElementById('roomOwner');
    const stickman = owner.querySelector('.stickman');
    
    // 每5-8秒随机走动一次
    function scheduleNextWalk() {
        const delay = 5000 + Math.random() * 3000; // 5-8秒
        ownerWalkingInterval = setTimeout(() => {
            walkOwner();
            scheduleNextWalk();
        }, delay);
    }
    
    function walkOwner() {
        // 随机选择目标位置（左右移动）
        const positions = ['20%', '30%', '40%', '50%', '60%', '70%'];
        const currentRight = owner.style.right || '30%';
        
        // 选择一个不同的位置
        let newPosition;
        do {
            newPosition = positions[Math.floor(Math.random() * positions.length)];
        } while (newPosition === currentRight);
        
        // 开始走路动画
        stickman.classList.add('walking');
        
        // 移动到新位置
        owner.style.right = newPosition;
        
        // 走路持续2秒后停止动画
        setTimeout(() => {
            stickman.classList.remove('walking');
        }, 2000);
    }
    
    scheduleNextWalk();
}

function stopOwnerWalking() {
    if (ownerWalkingInterval) {
        clearTimeout(ownerWalkingInterval);
        ownerWalkingInterval = null;
    }
}
