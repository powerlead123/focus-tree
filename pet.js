// 宠物养成系统

// 宠物成长阶段配置（详细版）
const PET_STAGES = [
    { 
        level: 1, 
        name: '蛋', 
        emoji: '🥚', 
        daysNeeded: 0, 
        description: '一颗充满生命力的神秘蛋，里面孕育着无限可能',
        features: [
            { icon: '💓', title: '生命迹象', desc: '能感受到蛋里的心跳' },
            { icon: '🎵', title: '轻微晃动', desc: '打卡后蛋会开始晃动' },
            { icon: '✨', title: '点击互动', desc: '点击蛋会有回应' }
        ],
        rewards: ['每日+2金币', '开启成长之旅']
    },
    { 
        level: 2, 
        name: '破壳', 
        emoji: '🐣', 
        daysNeeded: 3, 
        description: '经过3天的孵化，小生命终于破壳而出！',
        features: [
            { icon: '👀', title: '睁开眼睛', desc: '第一次看到这个世界' },
            { icon: '🗣️', title: '学会说话', desc: '会说更多的话了' },
            { icon: '🎉', title: '破壳庆祝', desc: '解锁破壳动画' }
        ],
        rewards: ['破壳奖励+10金币', '解锁新对话', '获得破壳徽章']
    },
    { 
        level: 3, 
        name: '幼年', 
        emoji: '🐥', 
        daysNeeded: 8, 
        description: '可爱的小宝宝，充满好奇心，喜欢探索世界',
        features: [
            { icon: '🏃', title: '学会走路', desc: '可以在屏幕上走动了' },
            { icon: '🎮', title: '小游戏', desc: '解锁互动小游戏' },
            { icon: '💬', title: '更多对话', desc: '会说20+句不同的话' }
        ],
        rewards: ['幼年奖励+15金币', '解锁小游戏', '获得成长徽章']
    },
    { 
        level: 4, 
        name: '少年', 
        emoji: '🐤', 
        daysNeeded: 15, 
        description: '活泼好动的少年，开始展现独特的个性',
        features: [
            { icon: '⚡', title: '能量爆发', desc: '打卡后会跳得更高' },
            { icon: '🎨', title: '换装系统', desc: '可以给宠物换装扮' },
            { icon: '🏆', title: '成就系统', desc: '解锁成就收集' }
        ],
        rewards: ['少年奖励+20金币', '解锁换装', '获得活力徽章']
    },
    { 
        level: 5, 
        name: '成年', 
        emoji: '🐓', 
        daysNeeded: 23, 
        description: '强壮的成年宠物，已经成为你最好的伙伴',
        features: [
            { icon: '💪', title: '强大力量', desc: '可以帮你完成任务' },
            { icon: '🎁', title: '每日礼物', desc: '每天会送你小礼物' },
            { icon: '👥', title: '社交功能', desc: '可以和其他宠物互动' }
        ],
        rewards: ['成年奖励+30金币', '每日礼物', '获得力量徽章']
    },
    { 
        level: 6, 
        name: '完全体', 
        emoji: '🦚', 
        daysNeeded: 30, 
        description: '华丽的最终形态！这是坚持30天的荣耀！',
        features: [
            { icon: '✨', title: '永久发光', desc: '全身散发金色光芒' },
            { icon: '🎪', title: '特殊技能', desc: '解锁所有特殊技能' },
            { icon: '🌟', title: '解锁新宠物', desc: '可以开始养第二只宠物' }
        ],
        rewards: ['完全体奖励+50金币', '解锁小龙宠物', '获得传说徽章', '专属称号']
    }
];

// 蛋的不同状态（根据天数显示不同效果）
function getEggState(days) {
    if (days === 0) return { emoji: '🥚', effect: 'none' };
    if (days === 1) return { emoji: '🥚', effect: 'shake' };
    if (days === 2) return { emoji: '🥚', effect: 'shake-fast' };
    return { emoji: '🥚', effect: 'shake-fast' };
}

// 本地存储键
const PET_STORAGE_KEY = 'focusTree_petData';

// 主人名字
const OWNER_NAME = '柏皓';

// 判断是否是周末
function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0是周日，6是周六
}

// 计算工作日差异（排除周末）
function getWorkdaysDiff(date1, date2) {
    const start = new Date(date1);
    const end = new Date(date2);
    let count = 0;
    let current = new Date(start);
    current.setDate(current.getDate() + 1);
    
    while (current <= end) {
        if (!isWeekend(current.toISOString().split('T')[0])) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    return count;
}

// 获取宠物数据
function getPetData() {
    const data = localStorage.getItem(PET_STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    
    // 默认数据
    return {
        totalDays: 0,
        lastCheckinDate: null,
        checkinStreak: 0,
        currentStage: 1,
        checkinHistory: [],
        skipHistory: []
    };
}

// 保存宠物数据
function savePetData(data) {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(data));
}

// 获取当前阶段信息
function getCurrentStage(totalDays) {
    for (let i = PET_STAGES.length - 1; i >= 0; i--) {
        if (totalDays >= PET_STAGES[i].daysNeeded) {
            return PET_STAGES[i];
        }
    }
    return PET_STAGES[0];
}

// 获取下一阶段信息
function getNextStage(currentLevel) {
    return PET_STAGES.find(stage => stage.level === currentLevel + 1) || null;
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    updatePetDisplay();
    checkTodayCheckin();
    renderGrowthPreview();
    
    // 给宠物添加点击事件
    document.getElementById('petCharacter').addEventListener('click', petClick);
    
    // 宠物定期说话
    startPetTalking();
});

// 更新宠物显示
function updatePetDisplay() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    const nextStage = getNextStage(currentStage.level);
    
    // 更新宠物形象
    const petCharacter = document.getElementById('petCharacter');
    
    // 如果是蛋阶段，根据天数显示不同状态
    if (currentStage.level === 1) {
        const eggState = getEggState(petData.totalDays);
        petCharacter.textContent = eggState.emoji;
        
        // 添加晃动效果
        petCharacter.classList.remove('shake', 'shake-fast');
        if (eggState.effect !== 'none') {
            petCharacter.classList.add(eggState.effect);
        }
    } else {
        petCharacter.textContent = currentStage.emoji;
        petCharacter.classList.remove('shake', 'shake-fast');
    }
    
    // 根据连续天数添加特效
    if (petData.checkinStreak >= 7) {
        petCharacter.classList.add('glow');
    } else {
        petCharacter.classList.remove('glow');
    }
    
    // 更新宠物名字
    document.getElementById('petName').textContent = `${OWNER_NAME}的${currentStage.name}`;
    
    // 更新心情
    updateMood(petData.checkinStreak);
    
    // 更新进度条
    const progress = (petData.totalDays / 30) * 100;
    document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('progressText').textContent = `${petData.totalDays}/30`;
    
    // 更新信息
    document.getElementById('streakDays').textContent = `${petData.checkinStreak} 天`;
    document.getElementById('petAge').textContent = `${petData.totalDays} 天`;
    document.getElementById('petLevel').textContent = `Lv.${currentStage.level} ${currentStage.name}`;
    
    // 更新成长提示
    if (nextStage) {
        const daysToNext = nextStage.daysNeeded - petData.totalDays;
        document.getElementById('daysToNext').textContent = daysToNext;
        document.getElementById('growthHint').style.display = 'block';
    } else {
        document.getElementById('growthHint').textContent = '🎉 已达到最高等级！';
    }
}

// 更新心情
function updateMood(streak) {
    const moodElement = document.getElementById('petMood');
    
    if (streak >= 7) {
        moodElement.textContent = '🤩 超级开心！';
    } else if (streak >= 3) {
        moodElement.textContent = '😊 心情很好';
    } else if (streak >= 1) {
        moodElement.textContent = '🙂 还不错';
    } else {
        moodElement.textContent = '😢 有点想你了';
    }
}

// 检查今天是否已打卡
function checkTodayCheckin() {
    const petData = getPetData();
    const today = new Date().toISOString().split('T')[0];
    const checkinBtn = document.getElementById('checkinBtn');
    const skipBtn = document.getElementById('skipBtn');
    const checkinHint = document.getElementById('checkinHint');
    
    // 检查是否是周末
    if (isWeekend(today)) {
        checkinBtn.disabled = true;
        skipBtn.disabled = true;
        checkinBtn.innerHTML = '<span class="btn-icon">🎉</span><span class="btn-text">周末休息</span>';
        checkinHint.textContent = '周末不用写记事哦，好好休息吧！';
        return;
    }
    
    // 检查是否已操作
    const hasChecked = petData.checkinHistory.includes(today);
    const hasSkipped = petData.skipHistory && petData.skipHistory.some(s => s.date === today);
    
    if (hasChecked) {
        checkinBtn.disabled = true;
        skipBtn.disabled = true;
        checkinBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">今日已写记事</span>';
        checkinHint.textContent = '明天再来吧！宠物正在休息~';
    } else if (hasSkipped) {
        checkinBtn.disabled = true;
        skipBtn.disabled = true;
        skipBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">已记录原因</span>';
        checkinHint.textContent = '明天一定要写记事哦！宠物在等你~';
    } else {
        checkinBtn.disabled = false;
        skipBtn.disabled = false;
        checkinBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">今日已写记事</span>';
        checkinHint.textContent = `${OWNER_NAME}，完成今天的记事本，给宠物喂食吧！`;
    }
}

// 每日打卡 - 先询问是否获得星评
function dailyCheckin() {
    const petData = getPetData();
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否已打卡
    if (petData.lastCheckinDate === today) {
        showToast('今天已经打卡过了哦~', 'error');
        return;
    }
    
    // 显示星评询问弹窗
    document.getElementById('starModal').classList.remove('hidden');
}

// 确认打卡（带星评）
function confirmCheckinWithStar(hasStar) {
    closeStarModal();
    
    const petData = getPetData();
    const today = new Date().toISOString().split('T')[0];
    
    // 记录旧阶段
    const oldStage = getCurrentStage(petData.totalDays);
    
    // 更新连续天数（排除周末）
    const lastDate = petData.lastCheckinDate;
    if (lastDate) {
        const workdaysDiff = getWorkdaysDiff(lastDate, today);
        
        if (workdaysDiff === 1) {
            // 连续的下一个工作日
            petData.checkinStreak += 1;
        } else if (workdaysDiff > 1) {
            // 中断了（跳过了工作日），重新开始
            petData.checkinStreak = 1;
        }
    } else {
        // 第一次打卡
        petData.checkinStreak = 1;
    }
    
    // 更新数据
    petData.totalDays += 1;
    petData.lastCheckinDate = today;
    petData.checkinHistory.push(today);
    
    savePetData(petData);
    
    // 更新排行榜进度
    updatePlayerProgress(hasStar);
    
    // 播放打卡动画
    playCheckinAnimation();
    
    // 宠物说话 - 根据天数说不同的话
    if (petData.totalDays === 1) {
        petSay(`${OWNER_NAME}，这是我的第一顿饭！好开心！`, 3000);
    } else if (petData.totalDays === 2) {
        petSay('我感觉蛋壳要裂开了！继续加油！', 3000);
    } else if (petData.totalDays === 3) {
        petSay('明天我就要破壳啦！好期待！', 3000);
    } else if (petData.checkinStreak === 3) {
        petSay(`${OWNER_NAME}连续3天了！你真棒！`, 3000);
    } else if (petData.checkinStreak === 5) {
        petSay('连续5天！我们是最棒的搭档！', 3000);
    } else if (petData.checkinStreak === 7) {
        petSay('哇！连续7天！我开始发光了！', 3000);
    } else {
        const encourageMessages = [
            `${OWNER_NAME}，好好吃！谢谢你~`,
            '我吃饱啦！感觉更强壮了！',
            '你今天也很棒！',
            '我能感觉到自己在成长！',
            '明天也要来哦，我会想你的~'
        ];
        setTimeout(() => {
            const msg = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
            petSay(msg, 2000);
        }, 1000);
    }
    
    // 显示打卡后的变化提示
    setTimeout(() => {
        showCheckinChanges(petData.totalDays, petData.checkinStreak);
    }, 2000);
    
    // 检查是否进化
    const newStage = getCurrentStage(petData.totalDays);
    if (newStage.level > oldStage.level) {
        setTimeout(() => {
            playEvolutionAnimation(newStage);
        }, 1500);
    } else {
        setTimeout(() => {
            updatePetDisplay();
            checkTodayCheckin();
            showStreakReward(petData.checkinStreak);
            renderGrowthPreview();
        }, 1500);
    }
}

// 播放打卡动画
function playCheckinAnimation() {
    const animation = document.getElementById('checkinAnimation');
    animation.classList.remove('hidden');
    
    // 宠物跳跃
    const petCharacter = document.getElementById('petCharacter');
    petCharacter.classList.add('bounce');
    
    // 添加星星特效
    createSparkles();
    
    setTimeout(() => {
        animation.classList.add('hidden');
        petCharacter.classList.remove('bounce');
    }, 1500);
}

// 播放进化动画
function playEvolutionAnimation(newStage) {
    const overlay = document.getElementById('evolutionOverlay');
    const evolutionPet = document.getElementById('evolutionPet');
    
    evolutionPet.textContent = newStage.emoji;
    overlay.classList.remove('hidden');
    
    // 播放音效（可选）
    // playSound('evolution');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        updatePetDisplay();
        checkTodayCheckin();
        showToast(`🎉 恭喜！进化成${newStage.name}了！`, 'success');
    }, 3000);
}

// 显示连续打卡奖励
function showStreakReward(streak) {
    if (streak === 3) {
        showToast('🎉 连续3天！获得银色徽章！', 'success');
        addCoins(5);
    } else if (streak === 5) {
        showToast('🎉 连续5天！获得金色徽章！', 'success');
        addCoins(10);
    } else if (streak === 7) {
        showToast('🎉 连续7天！获得钻石徽章！', 'success');
        addCoins(20);
    } else if (streak % 7 === 0) {
        showToast(`🎉 连续${streak}天！太棒了！`, 'success');
        addCoins(15);
    } else {
        showToast('✅ 打卡成功！宠物吃饱了~', 'success');
        addCoins(2);
    }
}

// 添加金币
function addCoins(amount) {
    const userData = getUserData();
    userData.coins += amount;
    saveUserData(userData);
}

// 宠物点击事件
function petClick() {
    const petCharacter = document.getElementById('petCharacter');
    petCharacter.classList.add('bounce');
    
    createSparkles();
    
    // 宠物说话
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    const clickMessages = [
        '嘿嘿，好痒~',
        '你在摸我吗？',
        '我喜欢你！',
        '再摸摸我~',
        '好开心呀！',
        '咯咯咯~'
    ];
    
    if (currentStage.level === 1) {
        clickMessages.push('我在蛋里呢~');
        clickMessages.push('能听到我的心跳吗？');
    }
    
    const randomMsg = clickMessages[Math.floor(Math.random() * clickMessages.length)];
    petSay(randomMsg, 2000);
    
    setTimeout(() => {
        petCharacter.classList.remove('bounce');
    }, 600);
}

// 创建星星特效
function createSparkles() {
    const container = document.getElementById('petEffects');
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            
            const angle = (Math.PI * 2 * i) / 6;
            const distance = 80;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            sparkle.style.setProperty('--tx', `${tx}px`);
            sparkle.style.setProperty('--ty', `${ty}px`);
            sparkle.style.left = '50%';
            sparkle.style.top = '50%';
            
            container.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 50);
    }
}

// 显示成长相册
function showAlbum() {
    const petData = getPetData();
    const albumGrid = document.getElementById('albumGrid');
    albumGrid.innerHTML = '';
    
    PET_STAGES.forEach(stage => {
        const item = document.createElement('div');
        item.className = 'album-item';
        
        if (petData.totalDays >= stage.daysNeeded) {
            item.classList.add('unlocked');
            item.innerHTML = `
                <div class="album-emoji">${stage.emoji}</div>
                <div class="album-name">${stage.name}</div>
                <div class="album-days">已解锁</div>
            `;
        } else {
            item.classList.add('locked');
            item.innerHTML = `
                <div class="album-emoji">❓</div>
                <div class="album-name">???</div>
                <div class="album-days">需要${stage.daysNeeded}天</div>
            `;
        }
        
        albumGrid.appendChild(item);
    });
    
    document.getElementById('albumModal').classList.remove('hidden');
}

// 关闭相册
function closeAlbum() {
    document.getElementById('albumModal').classList.add('hidden');
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

// 渲染成长预览
function renderGrowthPreview() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    const previewContainer = document.getElementById('previewStages');
    previewContainer.innerHTML = '';
    
    PET_STAGES.forEach((stage, index) => {
        // 添加emoji
        const stageDiv = document.createElement('div');
        stageDiv.className = 'preview-stage';
        
        if (petData.totalDays >= stage.daysNeeded) {
            stageDiv.classList.add('unlocked');
        } else {
            stageDiv.classList.add('locked');
        }
        
        if (stage.level === currentStage.level) {
            stageDiv.classList.add('current');
        }
        
        stageDiv.innerHTML = `
            <div class="preview-emoji">${stage.emoji}</div>
            <div class="preview-label">${stage.name}</div>
        `;
        
        previewContainer.appendChild(stageDiv);
        
        // 添加箭头（除了最后一个）
        if (index < PET_STAGES.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'preview-arrow';
            arrow.textContent = '→';
            previewContainer.appendChild(arrow);
        }
    });
}

// 宠物说话
function petSay(message, duration = 3000) {
    const bubble = document.getElementById('petSpeech');
    bubble.textContent = message;
    bubble.classList.add('show');
    
    setTimeout(() => {
        bubble.classList.remove('show');
    }, duration);
}

// 宠物定期说话
function startPetTalking() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    
    // 根据不同阶段和状态说不同的话
    const messages = getPetMessages(petData, currentStage);
    
    // 进入页面时说一句
    setTimeout(() => {
        // 如果是第一次或前几天，提示查看成长指南
        if (petData.totalDays <= 2) {
            petSay('点击"成长指南"看看我未来会变成什么样！', 5000);
        } else {
            petSay(messages[0]);
        }
    }, 1000);
    
    // 每30秒随机说一句
    setInterval(() => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        petSay(randomMessage);
    }, 30000);
}

// 获取宠物对话内容
function getPetMessages(petData, currentStage) {
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedToday = petData.lastCheckinDate === today;
    const streak = petData.checkinStreak;
    const nextStage = getNextStage(currentStage.level);
    
    const messages = [];
    
    // 根据是否打卡
    if (hasCheckedToday) {
        messages.push('今天吃饱啦！谢谢你~');
        messages.push('明天见！我会继续成长的！');
        messages.push('你真棒！记得明天也要来哦~');
    } else {
        messages.push('今天的记事本写完了吗？');
        messages.push('我好饿呀，快来喂我吧~');
        messages.push('点击打卡按钮给我喂食吧！');
    }
    
    // 根据连续天数
    if (streak >= 7) {
        messages.push(`哇！已经连续${streak}天了！`);
        messages.push('你太厉害了！我好开心~');
    } else if (streak >= 3) {
        messages.push(`连续${streak}天！继续加油！`);
    }
    
    // 根据成长阶段
    if (currentStage.level === 1) {
        messages.push('我是一颗神秘的蛋~');
        messages.push('再过几天我就要破壳啦！');
        messages.push('你能听到我在蛋里动吗？');
    } else if (currentStage.level === 2) {
        messages.push('我刚破壳，好奇怪的世界~');
        messages.push('外面的世界真大呀！');
    } else if (currentStage.level === 6) {
        messages.push('我已经完全进化啦！');
        messages.push('谢谢你一直陪伴我成长！');
    }
    
    // 提示下一阶段
    if (nextStage) {
        const daysToNext = nextStage.daysNeeded - petData.totalDays;
        if (daysToNext <= 3) {
            messages.push(`再过${daysToNext}天就能进化成${nextStage.name}了！`);
        }
    }
    
    return messages;
}


// 显示未写记事弹窗
function showSkipModal() {
    document.getElementById('skipModal').classList.remove('hidden');
    document.getElementById('petResponse').textContent = '';
    
    // 监听选择变化
    const reasons = document.querySelectorAll('input[name="skipReason"]');
    reasons.forEach(radio => {
        radio.addEventListener('change', () => {
            showPetSkipResponse(radio.value);
        });
    });
}

// 关闭未写记事弹窗
function closeSkipModal() {
    document.getElementById('skipModal').classList.add('hidden');
}

// 显示宠物对未写记事的反馈
function showPetSkipResponse(reason) {
    const responses = {
        forgot: `${OWNER_NAME}，没关系的！明天记得写哦，我会等你的~ 💕`,
        busy: `${OWNER_NAME}太忙了呀，要注意休息！明天一定要写记事哦，我想听你的故事~ 📖`,
        tired: `${OWNER_NAME}辛苦了！好好休息，明天精神满满地写记事吧！我相信你！💪`,
        other: `${OWNER_NAME}，不管什么原因，明天都要加油哦！我会一直陪着你的~ 🌟`
    };
    
    document.getElementById('petResponse').textContent = responses[reason] || responses.other;
}

// 确认未写记事
function confirmSkip() {
    const selectedReason = document.querySelector('input[name="skipReason"]:checked');
    
    if (!selectedReason) {
        showToast('请选择一个原因', 'error');
        return;
    }
    
    const petData = getPetData();
    const today = new Date().toISOString().split('T')[0];
    
    // 记录未写记事
    if (!petData.skipHistory) {
        petData.skipHistory = [];
    }
    
    petData.skipHistory.push({
        date: today,
        reason: selectedReason.value
    });
    
    // 检查是否中断连续天数
    const lastDate = petData.lastCheckinDate;
    if (lastDate) {
        const workdaysDiff = getWorkdaysDiff(lastDate, today);
        if (workdaysDiff > 1) {
            // 中断了连续天数
            petData.checkinStreak = 0;
            showToast('😢 连续打卡中断了，明天重新开始吧！', 'error');
        } else {
            showToast('已记录，明天一定要写记事哦！', 'success');
        }
    }
    
    savePetData(petData);
    closeSkipModal();
    checkTodayCheckin();
    
    // 宠物说话
    setTimeout(() => {
        petSay('明天一定要来哦，我会想你的！', 3000);
    }, 500);
}


// 显示打卡后的变化
function showCheckinChanges(totalDays, streak) {
    const changes = [];
    
    // 根据天数显示变化
    if (totalDays === 1) {
        changes.push('🥚 蛋开始晃动了！');
    } else if (totalDays === 2) {
        changes.push('🥚 蛋晃得更厉害了！');
    } else if (totalDays === 3) {
        changes.push('🐣 即将破壳！');
    }
    
    // 根据连续天数显示奖励
    if (streak === 3) {
        changes.push('🎁 获得银色徽章！');
    } else if (streak === 5) {
        changes.push('🎁 获得金色徽章！');
    } else if (streak === 7) {
        changes.push('✨ 宠物开始发光了！');
    }
    
    // 显示变化
    if (changes.length > 0) {
        changes.forEach((change, index) => {
            setTimeout(() => {
                showToast(change, 'success');
            }, index * 1500);
        });
    }
}


// 显示成长指南
function showGrowthGuide() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    const guideStages = document.getElementById('guideStages');
    guideStages.innerHTML = '';
    
    PET_STAGES.forEach(stage => {
        const card = document.createElement('div');
        card.className = 'guide-stage-card';
        
        // 判断状态
        let badgeText = '';
        let badgeClass = '';
        if (petData.totalDays >= stage.daysNeeded) {
            if (stage.level === currentStage.level) {
                card.classList.add('current');
                badgeText = '当前阶段';
                badgeClass = 'current';
            } else {
                card.classList.add('unlocked');
                badgeText = '已解锁';
                badgeClass = 'unlocked';
            }
        } else {
            card.classList.add('locked');
            badgeText = `还需${stage.daysNeeded - petData.totalDays}天`;
            badgeClass = 'locked';
        }
        
        // 生成特性列表
        const featuresHTML = stage.features.map(feature => `
            <div class="feature-item">
                <div class="feature-icon">${feature.icon}</div>
                <div class="feature-content">
                    <div class="feature-title">${feature.title}</div>
                    <div class="feature-desc">${feature.desc}</div>
                </div>
            </div>
        `).join('');
        
        // 生成奖励列表
        const rewardsHTML = stage.rewards.map(reward => 
            `<span class="reward-tag">${reward}</span>`
        ).join('');
        
        // 进度提示
        let progressHint = '';
        if (stage.level === currentStage.level + 1) {
            const daysLeft = stage.daysNeeded - petData.totalDays;
            progressHint = `<div class="progress-hint">💪 再坚持${daysLeft}天就能解锁啦！</div>`;
        }
        
        card.innerHTML = `
            <div class="stage-badge ${badgeClass}">${badgeText}</div>
            <div class="stage-header">
                <div class="stage-emoji-large">${stage.emoji}</div>
                <div class="stage-info">
                    <div class="stage-title">Lv.${stage.level} ${stage.name}</div>
                    <div class="stage-days">第${stage.daysNeeded}天解锁</div>
                </div>
            </div>
            <div class="stage-description">${stage.description}</div>
            <div class="stage-features">${featuresHTML}</div>
            <div class="stage-rewards">
                <div class="rewards-title">🎁 解锁奖励</div>
                <div class="rewards-list">${rewardsHTML}</div>
            </div>
            ${progressHint}
        `;
        
        guideStages.appendChild(card);
    });
    
    document.getElementById('guideModal').classList.remove('hidden');
}

// 关闭成长指南
function closeGuide() {
    document.getElementById('guideModal').classList.add('hidden');
}


// ========== 排行榜系统 ==========

// 对手配置
const OPPONENTS = [
    { id: 'liusicheng', name: '刘思成', avatar: '👦' },
    { id: 'liuweixi', name: '刘维熙', avatar: '👦' },
    { id: 'huangxiaoyi', name: '黄小易', avatar: '👦' },
    { id: 'biyuchen', name: '毕宇辰', avatar: '👦' }
];

const RANKING_STORAGE_KEY = 'focusTree_rankingData';
const TOTAL_DISTANCE = 100; // 总距离100米

// 获取排行榜数据
function getRankingData() {
    const data = localStorage.getItem(RANKING_STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    
    // 初始化数据
    const initialData = {
        player: { distance: 0, lastUpdate: null },
        opponents: {}
    };
    
    OPPONENTS.forEach(opp => {
        initialData.opponents[opp.id] = { distance: 0, lastUpdate: null };
    });
    
    return initialData;
}

// 保存排行榜数据
function saveRankingData(data) {
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(data));
}

// 更新玩家进度
function updatePlayerProgress(hasStar) {
    const rankingData = getRankingData();
    const petData = getPetData();
    
    // 基础前进3米
    let distance = 3;
    
    // 获得星评额外1米
    if (hasStar) {
        distance += 1;
    }
    
    // 连续3天额外2米
    if (petData.checkinStreak >= 3 && petData.checkinStreak % 3 === 0) {
        distance += 2;
    }
    
    rankingData.player.distance = Math.min(rankingData.player.distance + distance, TOTAL_DISTANCE);
    rankingData.player.lastUpdate = new Date().toISOString().split('T')[0];
    
    saveRankingData(rankingData);
    
    // 显示前进提示
    showProgressAnimation(distance, hasStar);
    
    return distance;
}

// 更新对手进度（每天自动，带随机波动）
function updateOpponentsProgress() {
    const rankingData = getRankingData();
    const today = new Date().toISOString().split('T')[0];
    
    OPPONENTS.forEach(opp => {
        const oppData = rankingData.opponents[opp.id];
        
        // 如果今天还没更新，自动前进3米（±10%波动）
        if (oppData.lastUpdate !== today) {
            // 基础3米，随机波动±10%（即2.7-3.3米）
            const baseDistance = 3;
            const variation = (Math.random() * 0.2 - 0.1); // -0.1 到 0.1
            const distance = Math.round((baseDistance * (1 + variation)) * 10) / 10; // 保留1位小数
            
            oppData.distance = Math.min(oppData.distance + distance, TOTAL_DISTANCE);
            oppData.lastUpdate = today;
        }
    });
    
    saveRankingData(rankingData);
}

// 显示前进动画
function showProgressAnimation(distance, hasStar) {
    const messages = [];
    
    if (hasStar) {
        messages.push('⭐ 获得星评！');
    }
    
    messages.push(`🏃 前进了${distance}米！`);
    
    messages.forEach((msg, index) => {
        setTimeout(() => {
            showToast(msg, 'success');
        }, index * 1500);
    });
}

// 显示排行榜
function showRanking() {
    // 更新对手进度
    updateOpponentsProgress();
    
    const rankingData = getRankingData();
    const petData = getPetData();
    
    // 构建排名数组
    const rankings = [
        {
            id: 'player',
            name: OWNER_NAME,
            avatar: '👦',
            distance: rankingData.player.distance,
            isPlayer: true
        }
    ];
    
    OPPONENTS.forEach(opp => {
        rankings.push({
            id: opp.id,
            name: opp.name,
            avatar: opp.avatar,
            distance: rankingData.opponents[opp.id].distance,
            isPlayer: false
        });
    });
    
    // 按距离排序
    rankings.sort((a, b) => b.distance - a.distance);
    
    // 渲染排行榜
    const trackContainer = document.getElementById('rankingTrack');
    trackContainer.innerHTML = '';
    
    rankings.forEach((player, index) => {
        const rank = index + 1;
        const progress = (player.distance / TOTAL_DISTANCE) * 100;
        const remaining = TOTAL_DISTANCE - player.distance;
        
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        if (player.isPlayer) {
            trackItem.classList.add('player');
        }
        
        trackItem.innerHTML = `
            <div class="track-header">
                <div class="track-player">
                    <span class="player-avatar">${player.avatar}</span>
                    <span class="player-name">${player.name}</span>
                </div>
                <span class="track-rank">第${rank}名</span>
            </div>
            <div class="track-progress-bar">
                <span class="track-start">🏁</span>
                <span class="track-end">🏆</span>
                <div class="track-progress-fill" style="width: ${progress}%">
                    <span class="track-runner">🏃‍♂️</span>
                </div>
            </div>
            <div class="track-stats">
                <span class="track-distance">${player.distance}米 / ${TOTAL_DISTANCE}米</span>
                <span>还需 ${remaining}米</span>
            </div>
        `;
        
        trackContainer.appendChild(trackItem);
    });
    
    document.getElementById('rankingModal').classList.remove('hidden');
}

// 关闭排行榜
function closeRanking() {
    document.getElementById('rankingModal').classList.add('hidden');
}

// 关闭星评弹窗
function closeStarModal() {
    document.getElementById('starModal').classList.add('hidden');
}
