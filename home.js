// 首页逻辑

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    updateStats();
    updateExchangeButton();
});

// 更新统计数据
function updateStats() {
    const userData = getUserData();
    const backgrounds = getAllBackgrounds();
    const unlockedCount = backgrounds.filter(bg => bg.isFullyUnlocked).length;
    
    document.getElementById('totalTrees').textContent = userData.trees;
    document.getElementById('totalCoins').textContent = userData.coins;
    document.getElementById('unlockedBgs').textContent = `${unlockedCount}/10`;
    document.getElementById('studyStreak').textContent = userData.studyStreak;
    
    // 更新可兑换提示
    const availableTrees = userData.availableTrees;
    const canExchange = Math.floor(availableTrees / 10);
    
    if (canExchange > 0) {
        document.getElementById('availableTreesText').textContent = 
            `你有 ${availableTrees} 棵小树，可以兑换 ${canExchange} 个金币！`;
        document.getElementById('exchangeHint').style.background = 'rgba(72, 187, 120, 0.2)';
    } else {
        document.getElementById('availableTreesText').textContent = 
            `你有 ${availableTrees} 棵小树，还需要 ${10 - availableTrees} 棵才能兑换金币`;
        document.getElementById('exchangeHint').style.background = 'rgba(255, 255, 255, 0.95)';
    }
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

function goToBubble() {
    const bubbleUrl = 'https://bubble-word-game.pages.dev/';
    window.open(bubbleUrl, '_blank');
}

function goToShop() {
    window.location.href = 'shop.html';
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
