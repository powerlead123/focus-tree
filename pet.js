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
        petCharacter.classList.remove('shake', 'shake-fast', 'blink');
        if (eggState.effect !== 'none') {
            petCharacter.classList.add(eggState.effect);
        }
    } else {
        petCharacter.textContent = currentStage.emoji;
        petCharacter.classList.remove('shake', 'shake-fast');
        
        // 破壳后的宠物会眨眼（有眼睛的阶段）
        if (currentStage.level >= 2) {
            petCharacter.classList.add('blink');
        }
        
        // 幼年阶段会走路
        if (currentStage.level >= 3) {
            startPetWalking();
        } else {
            stopPetWalking();
        }
    }
    
    // 根据连续天数添加特效
    if (petData.checkinStreak >= 7) {
        petCharacter.classList.add('glow');
    } else {
        petCharacter.classList.remove('glow');
    }
    
    // 更新宠物名字
    document.getElementById('petName').textContent = `${OWNER_NAME}的${currentStage.name}`;
    
    // 应用装扮（Lv.4+）
    if (currentStage.level >= 4) {
        const costumeData = getCostumeData();
        const costume = COSTUMES.find(c => c.id === costumeData.currentCostume);
        if (costume && costume.id !== 'default') {
            petCharacter.textContent = costume.emoji;
        }
    }
    
    // 更新功能按钮显示
    updateFeatureButtons();
    
    // 检查成就（Lv.4+）
    if (currentStage.level >= 4) {
        checkAchievements();
    }
    
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
    
    // 先隐藏打卡按钮，显示喂养按钮
    document.getElementById('checkinBtn').style.display = 'none';
    document.getElementById('skipBtn').style.display = 'none';
    document.getElementById('checkinHint').style.display = 'none';
    document.getElementById('feedingSection').classList.remove('hidden');
    
    // 保存星评状态，等待喂养
    window.pendingCheckin = {
        hasStar: hasStar,
        date: new Date().toISOString().split('T')[0]
    };
}

// 喂养宠物
function feedPet() {
    if (!window.pendingCheckin) return;
    
    const { hasStar } = window.pendingCheckin;
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
    
    // 清除待处理的打卡
    window.pendingCheckin = null;
    
    // 隐藏喂养按钮
    document.getElementById('feedingSection').classList.add('hidden');
    
    // 播放喂养动画（更华丽的版本）
    playFeedingAnimation();
    
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

// 播放喂养动画（华丽版）
function playFeedingAnimation() {
    const petCharacter = document.getElementById('petCharacter');
    const petContainer = document.getElementById('petContainer');
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    
    // 1. 食物飞向宠物（多个食物）
    const foods = ['🍎', '🍌', '🍇', '🥕', '🍞'];
    foods.forEach((food, index) => {
        setTimeout(() => {
            const foodElement = document.createElement('div');
            foodElement.textContent = food;
            foodElement.style.position = 'fixed';
            foodElement.style.fontSize = '60px';
            foodElement.style.left = '50%';
            foodElement.style.bottom = '10%';
            foodElement.style.zIndex = '1000';
            foodElement.style.animation = 'foodFlyToPet 1.5s ease-out forwards';
            document.body.appendChild(foodElement);
            
            setTimeout(() => foodElement.remove(), 1500);
        }, index * 300);
    });
    
    // 2. 宠物吃东西动画（放大缩小）
    setTimeout(() => {
        let eatCount = 0;
        const eatInterval = setInterval(() => {
            if (eatCount % 2 === 0) {
                petCharacter.style.transform = 'scale(1.2)';
            } else {
                petCharacter.style.transform = 'scale(1)';
            }
            eatCount++;
            
            if (eatCount >= 6) {
                clearInterval(eatInterval);
                petCharacter.style.transform = 'scale(1)';
                
                // ⚡ 少年阶段：能量爆发 - 跳得更高
                if (currentStage.level >= 4) {
                    setTimeout(() => {
                        playEnergyBurst(petCharacter);
                    }, 200);
                }
            }
        }, 300);
    }, 1500);
    
    // 3. 宠物满足的表情和爱心
    setTimeout(() => {
        // 爱心特效
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.position = 'absolute';
                heart.style.fontSize = '40px';
                heart.style.left = '50%';
                heart.style.top = '50%';
                heart.style.animation = 'heartFloat 2s ease-out forwards';
                heart.style.setProperty('--angle', Math.random() * 360 + 'deg');
                petContainer.appendChild(heart);
                
                setTimeout(() => heart.remove(), 2000);
            }, i * 100);
        }
        
        // 宠物跳跃庆祝
        petCharacter.classList.add('bounce');
        setTimeout(() => petCharacter.classList.remove('bounce'), 1000);
    }, 3000);
    
    // 4. 显示鼓励文字
    setTimeout(() => {
        createSparkles();
        petSay('好好吃！谢谢柏皓！我感觉更强壮了！', 3000);
    }, 4000);
    
    // 5. 完成后更新显示
    setTimeout(() => {
        updatePetDisplay();
        checkTodayCheckin();
        showStreakReward(getPetData().checkinStreak);
        renderGrowthPreview();
    }, 5000);
}

// ⚡ 能量爆发效果（少年阶段Lv.4+）
function playEnergyBurst(petCharacter) {
    // 能量光环
    const energyRing = document.createElement('div');
    energyRing.className = 'energy-ring';
    energyRing.style.position = 'absolute';
    energyRing.style.left = '50%';
    energyRing.style.top = '50%';
    energyRing.style.transform = 'translate(-50%, -50%)';
    energyRing.style.width = '100px';
    energyRing.style.height = '100px';
    energyRing.style.border = '4px solid #ffd700';
    energyRing.style.borderRadius = '50%';
    energyRing.style.animation = 'energyRingExpand 1s ease-out forwards';
    energyRing.style.pointerEvents = 'none';
    document.getElementById('petContainer').appendChild(energyRing);
    
    // 能量粒子
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.textContent = '⚡';
            particle.style.position = 'absolute';
            particle.style.fontSize = '30px';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.animation = 'energyParticle 1s ease-out forwards';
            particle.style.setProperty('--angle', (i * 30) + 'deg');
            particle.style.pointerEvents = 'none';
            document.getElementById('petContainer').appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }, i * 50);
    }
    
    // 超级跳跃
    petCharacter.classList.add('super-jump');
    setTimeout(() => {
        petCharacter.classList.remove('super-jump');
    }, 1200);
    
    // 清理光环
    setTimeout(() => energyRing.remove(), 1000);
    
    // 显示能量爆发提示
    setTimeout(() => {
        petSay('⚡ 能量爆发！我感觉充满力量！', 3000);
    }, 1200);
}

// 播放打卡动画（保留旧版本作为备用）
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
    
    // 特殊处理破壳动画
    if (newStage.level === 2) {
        playHatchingAnimation(overlay, evolutionPet, newStage);
    } else {
        // 普通进化动画
        evolutionPet.textContent = newStage.emoji;
        overlay.classList.remove('hidden');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            updatePetDisplay();
            checkTodayCheckin();
            showToast(`🎉 恭喜！进化成${newStage.name}了！`, 'success');
        }, 3000);
    }
}

// 破壳动画（特殊）
function playHatchingAnimation(overlay, evolutionPet, newStage) {
    overlay.classList.remove('hidden');
    
    // 第一阶段：蛋剧烈晃动（1秒）
    evolutionPet.textContent = '🥚';
    evolutionPet.style.animation = 'eggShakeHard 0.3s infinite';
    
    // 第二阶段：蛋裂开（1秒）
    setTimeout(() => {
        evolutionPet.style.animation = 'eggCrack 1s ease-out';
        
        // 裂纹特效
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const crack = document.createElement('div');
                crack.textContent = '💥';
                crack.style.position = 'absolute';
                crack.style.fontSize = '40px';
                crack.style.left = '50%';
                crack.style.top = '50%';
                crack.style.animation = 'crackBurst 1s ease-out forwards';
                crack.style.setProperty('--angle', (i * 36) + 'deg');
                overlay.querySelector('.evolution-content').appendChild(crack);
                
                setTimeout(() => crack.remove(), 1000);
            }, i * 50);
        }
    }, 1000);
    
    // 第三阶段：破壳而出（1秒）
    setTimeout(() => {
        evolutionPet.textContent = '🐣';
        evolutionPet.style.animation = 'hatchOut 1s ease-out';
        
        // 光芒四射
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const light = document.createElement('div');
                light.textContent = '✨';
                light.style.position = 'absolute';
                light.style.fontSize = '30px';
                light.style.left = '50%';
                light.style.top = '50%';
                light.style.animation = 'lightBurst 1.5s ease-out forwards';
                light.style.setProperty('--angle', (i * 18) + 'deg');
                overlay.querySelector('.evolution-content').appendChild(light);
                
                setTimeout(() => light.remove(), 1500);
            }, i * 30);
        }
    }, 2000);
    
    // 结束
    setTimeout(() => {
        overlay.classList.add('hidden');
        evolutionPet.style.animation = '';
        updatePetDisplay();
        checkTodayCheckin();
        showToast('🎉 恭喜！宠物破壳了！', 'success');
        
        // 宠物说第一句话
        setTimeout(() => {
            petSay('哇！外面的世界好亮！这是哪里？', 3000);
        }, 500);
    }, 3500);
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
    
    // 宠物说话 - 使用根据阶段的对话
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    const messages = getPetMessages(petData, currentStage);
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
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

// 获取宠物对话内容（根据成长阶段）
function getPetMessages(petData, currentStage) {
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedToday = petData.lastCheckinDate === today;
    const streak = petData.checkinStreak;
    const nextStage = getNextStage(currentStage.level);
    
    const messages = [];
    
    // 根据成长阶段说不同的话
    switch (currentStage.level) {
        case 1: // 蛋阶段 - 简单的话
            if (hasCheckedToday) {
                messages.push('咕噜咕噜~');
                messages.push('我在蛋里很温暖~');
            } else {
                messages.push('咕咕...我饿了');
                messages.push('敲敲敲...喂我~');
            }
            messages.push('我是一颗神秘的蛋~');
            messages.push('你能听到我在蛋里动吗？');
            break;
            
        case 2: // 破壳 - 开始说更多话
            if (hasCheckedToday) {
                messages.push('今天吃饱啦！谢谢你~');
                messages.push('外面的世界真大呀！');
                messages.push('我刚破壳，好开心~');
            } else {
                messages.push('我好饿呀，快来喂我吧~');
                messages.push('今天的记事本写完了吗？');
            }
            messages.push('我刚破壳，好奇怪的世界~');
            messages.push('这是什么？那是什么？');
            messages.push('柏皓，教我说话吧！');
            messages.push('我想快快长大！');
            break;
            
        case 3: // 幼年 - 更多对话（20+句）
            if (hasCheckedToday) {
                messages.push('今天吃饱啦！谢谢你~');
                messages.push('明天见！我会继续成长的！');
                messages.push('你真棒！记得明天也要来哦~');
                messages.push('我吃得好饱，好开心！');
                messages.push('今天又长大了一点点！');
            } else {
                messages.push('今天的记事本写完了吗？');
                messages.push('我好饿呀，快来喂我吧~');
                messages.push('点击打卡按钮给我喂食吧！');
                messages.push('柏皓，我在等你写记事哦~');
                messages.push('写完记事就能喂我啦！');
            }
            messages.push('我是可爱的小宝宝！');
            messages.push('我想和你一起玩！');
            messages.push('柏皓最好了！');
            messages.push('我每天都在长大哦~');
            messages.push('你今天开心吗？');
            messages.push('我学会走路啦！看我走~');
            messages.push('这个世界好大呀！');
            messages.push('我想去探险！');
            messages.push('陪我玩小游戏吧！');
            messages.push('我好喜欢你呀！');
            messages.push('你是最好的主人！');
            messages.push('我们是最好的朋友！');
            messages.push('每天见到你都好开心！');
            messages.push('我会一直陪着你的！');
            messages.push('你累了吗？要休息一下吗？');
            break;
            
        case 4: // 少年 - 活泼的话
            if (hasCheckedToday) {
                messages.push('耶！今天也吃饱了！');
                messages.push('我感觉自己更强壮了！');
                messages.push('明天继续加油哦！');
            } else {
                messages.push('柏皓，该写记事本啦！');
                messages.push('我等你好久了~');
                messages.push('快来喂我，我要长得更快！');
            }
            messages.push('我是活泼的少年！');
            messages.push('我们一起努力吧！');
            messages.push('我想变得更厉害！');
            messages.push('你看我跳得高不高？');
            messages.push('我有好多话想说！');
            messages.push('柏皓，我们是最好的朋友！');
            break;
            
        case 5: // 成年 - 成熟的话
            if (hasCheckedToday) {
                messages.push('今天辛苦了，好好休息吧！');
                messages.push('你做得很棒，我为你骄傲！');
                messages.push('明天也要继续努力哦！');
            } else {
                messages.push('柏皓，记得写记事本哦~');
                messages.push('坚持记录是个好习惯！');
                messages.push('我会一直陪着你的！');
            }
            messages.push('我已经长大了！');
            messages.push('谢谢你一直陪伴我！');
            messages.push('我们一起变得更优秀吧！');
            messages.push('每一天都很重要！');
            messages.push('你的努力我都看在眼里！');
            messages.push('坚持就是胜利！');
            break;
            
        case 6: // 完全体 - 最多的话
            if (hasCheckedToday) {
                messages.push('今天也完美完成！你太棒了！');
                messages.push('我们已经坚持30天了！');
                messages.push('你是最优秀的柏皓！');
            } else {
                messages.push('柏皓，今天也要写记事本哦~');
                messages.push('坚持到现在不容易，继续加油！');
                messages.push('我相信你能做到！');
            }
            messages.push('我已经完全进化啦！');
            messages.push('谢谢你一直陪伴我成长！');
            messages.push('我们创造了奇迹！');
            messages.push('30天的坚持，太了不起了！');
            messages.push('你是我见过最棒的主人！');
            messages.push('让我们继续创造更多记录吧！');
            messages.push('我会永远陪着你！');
            messages.push('你的坚持让我变得如此强大！');
            break;
    }
    
    // 根据连续天数
    if (streak >= 7) {
        messages.push(`哇！已经连续${streak}天了！`);
        messages.push('你太厉害了！我好开心~');
    } else if (streak >= 3) {
        messages.push(`连续${streak}天！继续加油！`);
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


// ========== 宠物走路功能（Lv.3+）==========
let walkingInterval = null;

function startPetWalking() {
    if (walkingInterval) return;
    
    const petCharacter = document.getElementById('petCharacter');
    
    // 每3秒做一个随机动作
    walkingInterval = setInterval(() => {
        const actions = ['jump', 'spin', 'bounce', 'walk'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        // 移除之前的动作类
        petCharacter.classList.remove('pet-jumping', 'pet-spinning', 'pet-bouncing', 'pet-walking');
        
        // 添加新动作
        petCharacter.classList.add('pet-' + action);
        
        // 动作完成后移除类
        setTimeout(() => {
            petCharacter.classList.remove('pet-' + action);
        }, 1000);
        
    }, 3000);
}

function stopPetWalking() {
    if (walkingInterval) {
        clearInterval(walkingInterval);
        walkingInterval = null;
    }
}

// ========== 小游戏功能（Lv.3+）- 接食物游戏 ==========
let gameScore = 0;
let gameActive = false;
let gameInterval = null;
let gameTimer = null;
let gameTimeLeft = 30;

// 显示小游戏（仅Lv.3+可用）
function showMiniGame() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    
    if (currentStage.level < 3) {
        showToast('宠物还太小，等长大一点再玩游戏吧！', 'error');
        return;
    }
    
    document.getElementById('gameModal').classList.remove('hidden');
    document.getElementById('gameStartScreen').classList.remove('hidden');
    document.getElementById('gamePlayScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
}

// 开始游戏
function startGame() {
    gameScore = 0;
    gameTimeLeft = 30;
    gameActive = true;
    
    document.getElementById('gameStartScreen').classList.add('hidden');
    document.getElementById('gamePlayScreen').classList.remove('hidden');
    document.getElementById('gameScore').textContent = gameScore;
    document.getElementById('gameTime').textContent = gameTimeLeft;
    
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    document.getElementById('gamePet').textContent = currentStage.emoji;
    
    // 重置宠物位置
    const gamePet = document.getElementById('gamePet');
    gamePet.style.left = '50%';
    
    // 开始掉落食物
    gameInterval = setInterval(dropFood, 1000);
    
    // 倒计时
    gameTimer = setInterval(() => {
        gameTimeLeft--;
        document.getElementById('gameTime').textContent = gameTimeLeft;
        
        if (gameTimeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // 键盘控制
    document.addEventListener('keydown', movePetWithKey);
}

// 移动宠物（键盘）
function movePetWithKey(e) {
    if (!gameActive) return;
    
    const gamePet = document.getElementById('gamePet');
    const currentLeft = parseInt(gamePet.style.left) || 50;
    
    if (e.key === 'ArrowLeft' && currentLeft > 10) {
        gamePet.style.left = (currentLeft - 5) + '%';
    } else if (e.key === 'ArrowRight' && currentLeft < 90) {
        gamePet.style.left = (currentLeft + 5) + '%';
    }
}

// 移动宠物（点击）
function movePetTo(direction) {
    if (!gameActive) return;
    
    const gamePet = document.getElementById('gamePet');
    const currentLeft = parseInt(gamePet.style.left) || 50;
    
    if (direction === 'left' && currentLeft > 10) {
        gamePet.style.left = (currentLeft - 10) + '%';
    } else if (direction === 'right' && currentLeft < 90) {
        gamePet.style.left = (currentLeft + 10) + '%';
    }
}

// 食物配置（不同食物不同效果）
const FOOD_TYPES = [
    { emoji: '🍎', name: '苹果', score: 1, effect: 'normal', rarity: 'common' },
    { emoji: '🍌', name: '香蕉', score: 1, effect: 'normal', rarity: 'common' },
    { emoji: '🍇', name: '葡萄', score: 2, effect: 'happy', rarity: 'uncommon' },
    { emoji: '🥕', name: '胡萝卜', score: 1, effect: 'normal', rarity: 'common' },
    { emoji: '🍞', name: '面包', score: 1, effect: 'normal', rarity: 'common' },
    { emoji: '🍪', name: '饼干', score: 2, effect: 'happy', rarity: 'uncommon' },
    { emoji: '🍰', name: '蛋糕', score: 3, effect: 'super', rarity: 'rare' },
    { emoji: '🍩', name: '甜甜圈', score: 3, effect: 'super', rarity: 'rare' },
    { emoji: '🍭', name: '棒棒糖', score: 2, effect: 'happy', rarity: 'uncommon' },
    { emoji: '💩', name: '炸弹', score: -3, effect: 'bomb', rarity: 'common' }
];

// 掉落食物
function dropFood() {
    if (!gameActive) return;
    
    const gameArea = document.getElementById('gameArea');
    if (!gameArea) {
        console.error('游戏区域未找到');
        return;
    }
    
    // 根据稀有度随机选择食物
    const rand = Math.random();
    let selectedFood;
    
    if (rand < 0.5) {
        // 50% 普通食物
        const commonFoods = FOOD_TYPES.filter(f => f.rarity === 'common');
        selectedFood = commonFoods[Math.floor(Math.random() * commonFoods.length)];
    } else if (rand < 0.85) {
        // 35% 不常见食物
        const uncommonFoods = FOOD_TYPES.filter(f => f.rarity === 'uncommon');
        selectedFood = uncommonFoods[Math.floor(Math.random() * uncommonFoods.length)];
    } else {
        // 15% 稀有食物
        const rareFoods = FOOD_TYPES.filter(f => f.rarity === 'rare');
        selectedFood = rareFoods[Math.floor(Math.random() * rareFoods.length)];
    }
    
    const food = document.createElement('div');
    food.className = 'falling-food';
    food.textContent = selectedFood.emoji;
    food.style.left = (15 + Math.random() * 70) + '%';
    food.dataset.foodData = JSON.stringify(selectedFood);
    
    // 稀有食物发光
    if (selectedFood.rarity === 'rare') {
        food.classList.add('rare-food');
    } else if (selectedFood.rarity === 'uncommon') {
        food.classList.add('uncommon-food');
    }
    
    gameArea.appendChild(food);
    
    // 检测碰撞
    const checkCollision = setInterval(() => {
        if (!gameActive || !food.parentNode) {
            clearInterval(checkCollision);
            if (food.parentNode) food.remove();
            return;
        }
        
        const foodRect = food.getBoundingClientRect();
        const petRect = document.getElementById('gamePet').getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        // 碰撞检测
        const collision = (
            foodRect.bottom >= petRect.top - 15 &&
            foodRect.top <= petRect.bottom &&
            foodRect.left + 15 < petRect.right &&
            foodRect.right - 15 > petRect.left
        );
        
        if (collision) {
            const foodData = JSON.parse(food.dataset.foodData);
            handleFoodCatch(foodData);
            food.remove();
            clearInterval(checkCollision);
        }
        
        // 掉出游戏区域底部
        if (foodRect.top > gameAreaRect.bottom + 50) {
            food.remove();
            clearInterval(checkCollision);
        }
    }, 30);
    
    // 4秒后自动移除
    setTimeout(() => {
        if (food.parentNode) {
            food.remove();
            clearInterval(checkCollision);
        }
    }, 4000);
}

// 处理接到食物
function handleFoodCatch(foodData) {
    const gamePet = document.getElementById('gamePet');
    
    gameScore += foodData.score;
    gameScore = Math.max(0, gameScore); // 不能低于0
    document.getElementById('gameScore').textContent = gameScore;
    
    // 根据效果显示不同反馈
    switch (foodData.effect) {
        case 'normal':
            showGameToast(`+${foodData.score}分`, 'success');
            gamePet.classList.add('pet-eat');
            setTimeout(() => gamePet.classList.remove('pet-eat'), 300);
            break;
            
        case 'happy':
            showGameToast(`😋 ${foodData.name} +${foodData.score}分！`, 'success');
            gamePet.classList.add('pet-happy');
            createFoodParticles(foodData.emoji);
            setTimeout(() => gamePet.classList.remove('pet-happy'), 600);
            break;
            
        case 'super':
            showGameToast(`🌟 ${foodData.name} +${foodData.score}分！太棒了！`, 'success');
            gamePet.classList.add('pet-super-happy');
            createFoodParticles(foodData.emoji);
            createStarBurst();
            setTimeout(() => gamePet.classList.remove('pet-super-happy'), 800);
            break;
            
        case 'bomb':
            showGameToast(`💥 ${foodData.name} ${foodData.score}分！`, 'error');
            gamePet.classList.add('pet-hurt');
            createBombEffect();
            setTimeout(() => gamePet.classList.remove('pet-hurt'), 500);
            break;
    }
}

// 创建食物粒子效果
function createFoodParticles(emoji) {
    const gameArea = document.getElementById('gameArea');
    const gamePet = document.getElementById('gamePet');
    const petRect = gamePet.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.textContent = emoji;
        particle.className = 'food-particle';
        particle.style.left = (petRect.left - areaRect.left + petRect.width / 2) + 'px';
        particle.style.top = (petRect.top - areaRect.top + petRect.height / 2) + 'px';
        particle.style.setProperty('--angle', (i * 60) + 'deg');
        gameArea.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    }
}

// 创建星星爆发效果
function createStarBurst() {
    const gameArea = document.getElementById('gameArea');
    const gamePet = document.getElementById('gamePet');
    const petRect = gamePet.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const star = document.createElement('div');
        star.textContent = '⭐';
        star.className = 'star-particle';
        star.style.left = (petRect.left - areaRect.left + petRect.width / 2) + 'px';
        star.style.top = (petRect.top - areaRect.top + petRect.height / 2) + 'px';
        star.style.setProperty('--angle', (i * 45) + 'deg');
        gameArea.appendChild(star);
        
        setTimeout(() => star.remove(), 1000);
    }
}

// 创建炸弹效果
function createBombEffect() {
    const gameArea = document.getElementById('gameArea');
    const gamePet = document.getElementById('gamePet');
    const petRect = gamePet.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    
    const explosion = document.createElement('div');
    explosion.textContent = '💥';
    explosion.className = 'explosion-effect';
    explosion.style.left = (petRect.left - areaRect.left + petRect.width / 2) + 'px';
    explosion.style.top = (petRect.top - areaRect.top + petRect.height / 2) + 'px';
    gameArea.appendChild(explosion);
    
    setTimeout(() => explosion.remove(), 600);
}

// 游戏内提示
function showGameToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `game-toast ${type}`;
    toast.textContent = msg;
    document.getElementById('gameArea').appendChild(toast);
    
    setTimeout(() => toast.remove(), 1000);
}

// 结束游戏
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(gameTimer);
    document.removeEventListener('keydown', movePetWithKey);
    
    // 清除所有掉落的食物
    document.querySelectorAll('.falling-food').forEach(f => f.remove());
    
    document.getElementById('gamePlayScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = gameScore;
    
    // 评价
    let comment = '';
    if (gameScore >= 25) {
        comment = '🏆 太厉害了！你是接食物大师！';
    } else if (gameScore >= 15) {
        comment = '🎉 很棒！反应很快！';
    } else if (gameScore >= 10) {
        comment = '👍 不错哦！继续加油！';
    } else {
        comment = '💪 多练习就会更好的！';
    }
    document.getElementById('gameComment').textContent = comment;
    
    // 奖励
    if (gameScore >= 10) {
        const coins = Math.floor(gameScore / 5);
        const userData = getUserData();
        userData.coins += coins;
        saveUserData(userData);
        document.getElementById('gameReward').textContent = `获得 ${coins} 金币！`;
    } else {
        document.getElementById('gameReward').textContent = '再接再厉！';
    }
}

// 关闭小游戏
function closeGame() {
    if (gameActive) {
        endGame();
    }
    document.getElementById('gameModal').classList.add('hidden');
}




// ========== 换装系统（少年Lv.4+）==========
const COSTUMES = [
    { id: 'default', name: '默认造型', emoji: '🐤', price: 0, unlocked: true },
    { id: 'cool', name: '酷炫墨镜', emoji: '😎', price: 10, unlocked: false },
    { id: 'party', name: '派对帽子', emoji: '🥳', price: 15, unlocked: false },
    { id: 'crown', name: '皇冠', emoji: '👑', price: 20, unlocked: false },
    { id: 'ninja', name: '忍者装', emoji: '🥷', price: 25, unlocked: false },
    { id: 'wizard', name: '魔法师', emoji: '🧙', price: 30, unlocked: false }
];

// 获取换装数据
function getCostumeData() {
    const data = localStorage.getItem('focusTree_costumeData');
    if (data) {
        return JSON.parse(data);
    }
    return {
        currentCostume: 'default',
        unlockedCostumes: ['default']
    };
}

// 保存换装数据
function saveCostumeData(data) {
    localStorage.setItem('focusTree_costumeData', JSON.stringify(data));
}

// 显示换装商店
function showCostumeShop() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    
    if (currentStage.level < 4) {
        showToast('少年阶段（15天）才能解锁换装功能！', 'error');
        return;
    }
    
    const costumeData = getCostumeData();
    const previewPet = document.getElementById('previewPet');
    const currentCostume = COSTUMES.find(c => c.id === costumeData.currentCostume);
    
    // 显示当前装扮
    previewPet.textContent = currentCostume.emoji;
    document.getElementById('currentCostumeName').textContent = currentCostume.name;
    
    // 渲染装扮列表
    const grid = document.getElementById('costumeGrid');
    grid.innerHTML = '';
    
    COSTUMES.forEach(costume => {
        const isUnlocked = costumeData.unlockedCostumes.includes(costume.id);
        const isSelected = costumeData.currentCostume === costume.id;
        
        const item = document.createElement('div');
        item.className = 'costume-item';
        if (isSelected) item.classList.add('selected');
        if (!isUnlocked) item.classList.add('locked');
        
        item.innerHTML = `
            <div class="costume-emoji">${costume.emoji}</div>
            <div class="costume-name">${costume.name}</div>
            ${isUnlocked ? 
                '<div class="costume-unlocked">✓ 已拥有</div>' :
                `<div class="costume-price">🍃 ${costume.price}金币</div>`
            }
        `;
        
        item.onclick = () => selectCostume(costume.id, isUnlocked);
        grid.appendChild(item);
    });
    
    document.getElementById('costumeModal').classList.remove('hidden');
}

// 选择装扮
function selectCostume(costumeId, isUnlocked) {
    const costumeData = getCostumeData();
    const costume = COSTUMES.find(c => c.id === costumeId);
    
    if (!isUnlocked) {
        // 购买装扮
        const userData = getUserData();
        if (userData.coins >= costume.price) {
            if (confirm(`确定花费${costume.price}金币购买"${costume.name}"吗？`)) {
                userData.coins -= costume.price;
                saveUserData(userData);
                
                costumeData.unlockedCostumes.push(costumeId);
                costumeData.currentCostume = costumeId;
                saveCostumeData(costumeData);
                
                showToast(`成功购买"${costume.name}"！`, 'success');
                showCostumeShop(); // 刷新界面
                updatePetDisplay(); // 更新宠物显示
            }
        } else {
            showToast(`金币不足！还需要${costume.price - userData.coins}金币`, 'error');
        }
    } else {
        // 切换装扮
        costumeData.currentCostume = costumeId;
        saveCostumeData(costumeData);
        showToast(`已切换到"${costume.name}"`, 'success');
        showCostumeShop(); // 刷新界面
        updatePetDisplay(); // 更新宠物显示
    }
}

// 关闭换装商店
function closeCostumeShop() {
    document.getElementById('costumeModal').classList.add('hidden');
}

// 更新按钮显示（包括换装按钮）
function updateFeatureButtons() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    
    // 小游戏按钮（Lv.3+）
    const gameBtn = document.getElementById('gameBtn');
    if (gameBtn) {
        gameBtn.style.display = currentStage.level >= 3 ? 'block' : 'none';
    }
    
    // 换装按钮（Lv.4+）
    const costumeBtn = document.getElementById('costumeBtn');
    if (costumeBtn) {
        costumeBtn.style.display = currentStage.level >= 4 ? 'block' : 'none';
    }
    
    // 成就按钮（Lv.4+）
    const achievementBtn = document.getElementById('achievementBtn');
    if (achievementBtn) {
        achievementBtn.style.display = currentStage.level >= 4 ? 'block' : 'none';
    }
}

// ========== 成就系统（少年Lv.4+）==========
const ACHIEVEMENTS = [
    { id: 'first_checkin', name: '初次打卡', desc: '完成第一次打卡', icon: '🎯', reward: 5, condition: (data) => data.totalDays >= 1 },
    { id: 'week_streak', name: '坚持一周', desc: '连续打卡7天', icon: '🔥', reward: 10, condition: (data) => data.checkinStreak >= 7 },
    { id: 'hatch', name: '破壳而出', desc: '宠物破壳', icon: '🐣', reward: 10, condition: (data) => data.totalDays >= 3 },
    { id: 'teenager', name: '茁壮成长', desc: '宠物进入幼年', icon: '🐥', reward: 15, condition: (data) => data.totalDays >= 8 },
    { id: 'youth', name: '活力少年', desc: '宠物进入少年', icon: '🐤', reward: 20, condition: (data) => data.totalDays >= 15 },
    { id: 'adult', name: '成年礼', desc: '宠物成年', icon: '🐓', reward: 30, condition: (data) => data.totalDays >= 23 },
    { id: 'perfect', name: '完美形态', desc: '宠物完全体', icon: '🦚', reward: 50, condition: (data) => data.totalDays >= 30 },
    { id: 'rich', name: '小富翁', desc: '拥有100金币', icon: '💰', reward: 10, condition: () => getUserData().coins >= 100 },
    { id: 'game_master', name: '游戏高手', desc: '小游戏得分≥20', icon: '🎮', reward: 15, condition: () => false }, // 需要在游戏中检查
    { id: 'fashionista', name: '时尚达人', desc: '解锁3个装扮', icon: '👗', reward: 20, condition: () => getCostumeData().unlockedCostumes.length >= 3 }
];

// 获取成就数据
function getAchievementData() {
    const data = localStorage.getItem('focusTree_achievementData');
    if (data) {
        return JSON.parse(data);
    }
    return {
        unlockedAchievements: []
    };
}

// 保存成就数据
function saveAchievementData(data) {
    localStorage.setItem('focusTree_achievementData', JSON.stringify(data));
}

// 检查并解锁成就
function checkAchievements() {
    const petData = getPetData();
    const achievementData = getAchievementData();
    let newUnlocks = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievementData.unlockedAchievements.includes(achievement.id)) {
            if (achievement.condition(petData)) {
                achievementData.unlockedAchievements.push(achievement.id);
                newUnlocks.push(achievement);
                
                // 奖励金币
                const userData = getUserData();
                userData.coins += achievement.reward;
                saveUserData(userData);
            }
        }
    });
    
    if (newUnlocks.length > 0) {
        saveAchievementData(achievementData);
        
        // 显示成就解锁提示
        newUnlocks.forEach((achievement, index) => {
            setTimeout(() => {
                showToast(`🏆 解锁成就：${achievement.name}！+${achievement.reward}金币`, 'success');
            }, index * 1500);
        });
    }
}

// 显示成就列表
function showAchievements() {
    const petData = getPetData();
    const currentStage = getCurrentStage(petData.totalDays);
    
    if (currentStage.level < 4) {
        showToast('少年阶段（15天）才能解锁成就系统！', 'error');
        return;
    }
    
    const achievementData = getAchievementData();
    const unlockedCount = achievementData.unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const progress = Math.round((unlockedCount / totalCount) * 100);
    
    document.getElementById('unlockedCount').textContent = unlockedCount;
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('achievementProgress').textContent = progress + '%';
    
    // 渲染成就列表
    const list = document.getElementById('achievementList');
    list.innerHTML = '';
    
    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievementData.unlockedAchievements.includes(achievement.id);
        
        const item = document.createElement('div');
        item.className = 'achievement-item';
        if (isUnlocked) item.classList.add('unlocked');
        
        item.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                <div class="achievement-reward">奖励：${achievement.reward}金币</div>
            </div>
            <div class="achievement-status ${isUnlocked ? 'unlocked' : 'locked'}">
                ${isUnlocked ? '✓ 已解锁' : '🔒 未解锁'}
            </div>
        `;
        
        list.appendChild(item);
    });
    
    document.getElementById('achievementModal').classList.remove('hidden');
}

// 关闭成就列表
function closeAchievements() {
    document.getElementById('achievementModal').classList.add('hidden');
}


// ========== 传送门效果 ==========
function showPortal() {
    const overlay = document.getElementById('portalOverlay');
    const menu = document.getElementById('portalMenu');
    const vortex = document.getElementById('portalVortex');
    
    // 显示传送门并激活动画
    overlay.classList.remove('hidden');
    
    // 稍微延迟添加active类，确保动画触发
    setTimeout(() => {
        overlay.classList.add('active');
    }, 50);
    
    // 3秒后：漩涡消失，大门关闭
    setTimeout(() => {
        vortex.style.animation = 'vortexDisappear 0.5s ease-out forwards';
        overlay.classList.add('closing');
    }, 3000);
    
    // 4秒后：显示菜单
    setTimeout(() => {
        menu.classList.remove('hidden');
    }, 4000);
}

function closePortal() {
    const overlay = document.getElementById('portalOverlay');
    const menu = document.getElementById('portalMenu');
    
    // 添加关闭动画
    menu.style.animation = 'menuSlideOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('active');
        menu.classList.add('hidden');
        menu.style.animation = '';
    }, 500);
}

function navigateTo(url) {
    // 添加传送效果
    const overlay = document.getElementById('portalOverlay');
    overlay.style.animation = 'portalSuck 1s ease-in forwards';
    
    setTimeout(() => {
        window.location.href = url;
    }, 1000);
}

// 添加关闭和传送动画CSS
const portalStyle = document.createElement('style');
portalStyle.textContent = `
    @keyframes menuSlideOut {
        0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
        }
    }
    
    @keyframes portalSuck {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(portalStyle);
