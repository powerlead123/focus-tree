// 远眺剧场系统

const THEATER_STORAGE_KEY = 'focusTree_theaterData';
const OWNER_NAME = '柏皓';

let theaterDuration = 3; // 分钟
let theaterTimer = null;
let currentSegment = 0;
let segments = [];

// 获取剧场数据
function getTheaterData() {
    const data = localStorage.getItem(THEATER_STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return {
        todayCount: 0,
        totalCount: 0,
        lastDate: null
    };
}

// 保存剧场数据
function saveTheaterData(data) {
    localStorage.setItem(THEATER_STORAGE_KEY, JSON.stringify(data));
}

// 开始剧场
function startTheater(duration) {
    theaterDuration = duration;
    
    // 切换到剧场页面
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('theaterScreen').classList.remove('hidden');
    
    // 生成今天的节目单
    generateSegments();
    
    // 开始播放
    playSegments();
}

// 生成节目单
function generateSegments() {
    segments = [];
    
    // 开场（10秒）
    segments.push({
        type: 'opening',
        duration: 10
    });
    
    // 根据时长生成内容
    const totalTime = theaterDuration * 60; // 转换为秒
    let remainingTime = totalTime - 10 - 20; // 减去开场和结束
    
    // 循环添加内容
    while (remainingTime > 0) {
        // 宠物表演（60秒）
        if (remainingTime >= 60) {
            segments.push({
                type: 'performance',
                duration: 60
            });
            remainingTime -= 60;
        }
        
        // 粒子效果（40秒）
        if (remainingTime >= 40) {
            segments.push({
                type: 'particles',
                duration: 40
            });
            remainingTime -= 40;
        }
        
        // 问答（50秒）
        if (remainingTime >= 50) {
            segments.push({
                type: 'quiz',
                duration: 50
            });
            remainingTime -= 50;
        }
        
        // 如果剩余时间不够一个完整环节，添加粒子效果填充
        if (remainingTime > 0 && remainingTime < 40) {
            segments.push({
                type: 'particles',
                duration: remainingTime
            });
            remainingTime = 0;
        }
    }
    
    // 结束（20秒）
    segments.push({
        type: 'ending',
        duration: 20
    });
}

// 播放节目
function playSegments() {
    if (currentSegment >= segments.length) {
        completeTheater();
        return;
    }
    
    const segment = segments[currentSegment];
    updateProgress();
    
    switch (segment.type) {
        case 'opening':
            playOpening();
            break;
        case 'performance':
            playPerformance();
            break;
        case 'particles':
            playParticles();
            break;
        case 'quiz':
            playQuiz();
            break;
        case 'ending':
            playEnding();
            break;
    }
    
    // 定时播放下一个
    setTimeout(() => {
        currentSegment++;
        playSegments();
    }, segment.duration * 1000);
}

// 更新进度
function updateProgress() {
    const totalSegments = segments.length;
    const progress = Math.round((currentSegment / totalSegments) * 100);
    document.getElementById('progressIndicator').textContent = `进度：${progress}%`;
}

// 开场动画
function playOpening() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-text">${OWNER_NAME}，该让眼睛休息啦！</div>
            <div class="theater-subtitle">请站到5米外观看</div>
        </div>
    `;
    
    // 3秒后显示倒计时
    setTimeout(() => {
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            container.innerHTML = `
                <div class="theater-content">
                    <div class="theater-emoji">${countdown}</div>
                </div>
            `;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                container.innerHTML = `
                    <div class="theater-content">
                        <div class="theater-text">开始！</div>
                    </div>
                `;
            }
        }, 1000);
    }, 3000);
}

// 宠物表演
function playPerformance() {
    const dayOfWeek = new Date().getDay();
    const performances = [
        performanceDance,      // 周日
        performanceDance,      // 周一
        performanceJuggle,     // 周二
        performanceMagic,      // 周三
        performanceSport,      // 周四
        performanceFly,        // 周五
        performanceMusic,      // 周六
    ];
    
    const performance = performances[dayOfWeek];
    performance();
}

// 舞蹈表演 - 从蛋到舞者的变身秀
function performanceDance() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #fbb6ce 0%, #f687b3 100%)';
    
    // 第一幕：蛋出现（0-10秒）
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji" id="performer" style="font-size: 100px;">🥚</div>
            <div class="theater-subtitle">有一颗神秘的蛋...</div>
        </div>
    `;
    
    const performer = document.getElementById('performer');
    const subtitle = document.querySelector('.theater-subtitle');
    
    // 蛋开始剧烈晃动
    setTimeout(() => {
        performer.style.animation = 'shakeHard 0.5s infinite';
        subtitle.textContent = '蛋在晃动！要发生什么了？';
    }, 3000);
    
    // 第二幕：破壳（10-20秒）
    setTimeout(() => {
        performer.textContent = '🐣';
        performer.style.fontSize = '120px';
        performer.style.animation = 'popOut 1s ease-out';
        subtitle.textContent = '哇！破壳了！';
        
        // 爆炸特效
        createExplosion(container);
    }, 10000);
    
    // 第三幕：长大（20-30秒）
    setTimeout(() => {
        performer.textContent = '🐥';
        performer.style.fontSize = '150px';
        performer.style.animation = 'grow 2s ease-out';
        subtitle.textContent = '小鸡长大了！';
    }, 20000);
    
    // 第四幕：开始跳舞（30-60秒）
    setTimeout(() => {
        performer.textContent = '🐓';
        performer.style.fontSize = '180px';
        subtitle.textContent = `${OWNER_NAME}，看我跳舞！`;
        
        // 疯狂舞蹈
        let danceStep = 0;
        const danceInterval = setInterval(() => {
            danceStep++;
            const moves = [
                'translateX(-200px) rotate(-30deg) scale(1.2)',
                'translateX(200px) rotate(30deg) scale(1.2)',
                'translateY(-150px) rotate(360deg) scale(1.5)',
                'scale(0.8) rotate(-180deg)',
                'translateX(-100px) translateY(-100px) rotate(45deg) scale(1.3)',
                'translateX(100px) translateY(-100px) rotate(-45deg) scale(1.3)'
            ];
            performer.style.transform = moves[danceStep % moves.length];
            performer.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            // 随机添加舞伴
            if (danceStep % 3 === 0) {
                addDancePartner(container);
            }
        }, 1000);
        
        setTimeout(() => clearInterval(danceInterval), 30000);
    }, 30000);
}

// 创建爆炸特效
function createExplosion(container) {
    const particles = ['✨', '⭐', '💫', '🌟', '💥'];
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.fontSize = '60px';
            particle.style.left = '50%';
            particle.style.top = '50%';
            
            const angle = (Math.PI * 2 * i) / 20;
            const distance = 300;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.animation = `explode 1.5s ease-out forwards`;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }, i * 30);
    }
}

// 添加舞伴
function addDancePartner(container) {
    const partners = ['🐤', '🐥', '🐣'];
    const partner = document.createElement('div');
    partner.className = 'dance-partner';
    partner.textContent = partners[Math.floor(Math.random() * partners.length)];
    partner.style.fontSize = '100px';
    partner.style.position = 'absolute';
    partner.style.left = Math.random() * 80 + 10 + '%';
    partner.style.top = Math.random() * 60 + 20 + '%';
    partner.style.animation = 'spinDance 2s ease-in-out';
    
    container.appendChild(partner);
    setTimeout(() => partner.remove(), 2000);
}

// 杂技表演 - 惊险的杂技秀
function performanceJuggle() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji" id="performer">🐥</div>
            <div class="theater-subtitle">杂技表演开始！</div>
        </div>
    `;
    
    const performer = document.getElementById('performer');
    const subtitle = document.querySelector('.theater-subtitle');
    
    // 第一幕：抛球（0-15秒）
    const balls = ['🔴', '🟡', '🔵', '🟢', '🟣'];
    balls.forEach((ball, index) => {
        const ballElement = document.createElement('div');
        ballElement.className = 'juggle-ball';
        ballElement.textContent = ball;
        ballElement.style.fontSize = '80px';
        ballElement.style.position = 'absolute';
        ballElement.style.left = '50%';
        ballElement.style.animation = `juggleBall 1.5s ease-in-out infinite ${index * 0.3}s`;
        container.appendChild(ballElement);
    });
    
    // 第二幕：走钢丝（15-30秒）
    setTimeout(() => {
        // 清除球
        document.querySelectorAll('.juggle-ball').forEach(b => b.remove());
        
        // 添加钢丝
        const rope = document.createElement('div');
        rope.style.position = 'absolute';
        rope.style.width = '80%';
        rope.style.height = '5px';
        rope.style.background = '#333';
        rope.style.top = '50%';
        rope.style.left = '10%';
        container.appendChild(rope);
        
        performer.style.fontSize = '120px';
        performer.style.position = 'absolute';
        performer.style.top = '45%';
        subtitle.textContent = '走钢丝！别掉下去！';
        
        // 左右摇晃前进
        let position = 0;
        const walkInterval = setInterval(() => {
            position += 5;
            performer.style.left = position + '%';
            performer.style.transform = `rotate(${Math.sin(position / 5) * 20}deg)`;
            
            if (position >= 80) {
                clearInterval(walkInterval);
                subtitle.textContent = '成功了！👏';
            }
        }, 200);
    }, 15000);
    
    // 第三幕：翻跟头（30-45秒）
    setTimeout(() => {
        document.querySelectorAll('div[style*="钢丝"]').forEach(e => e.remove());
        performer.style.position = 'relative';
        performer.style.left = '0';
        performer.style.fontSize = '150px';
        subtitle.textContent = '连续翻跟头！';
        
        let flips = 0;
        const flipInterval = setInterval(() => {
            performer.style.animation = 'flip 1s ease-in-out';
            flips++;
            
            if (flips >= 10) {
                clearInterval(flipInterval);
            }
        }, 1200);
    }, 30000);
    
    // 第四幕：大结局（45-60秒）
    setTimeout(() => {
        performer.style.fontSize = '200px';
        subtitle.textContent = '谢谢大家！';
        performer.style.animation = 'bow 2s ease-in-out infinite';
        
        // 烟花庆祝
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                createFirework(container);
            }, i * 500);
        }
    }, 45000);
}

// 魔术表演
function performanceMagic() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji" id="performer">🐤</div>
            <div class="theater-subtitle">见证奇迹的时刻！</div>
        </div>
    `;
    
    // 定期变出东西
    const magicItems = ['⭐', '🌙', '🌈', '✨', '💫'];
    let magicIndex = 0;
    
    const magicInterval = setInterval(() => {
        const item = document.createElement('div');
        item.className = 'particle';
        item.textContent = magicItems[magicIndex % magicItems.length];
        item.style.fontSize = '80px';
        item.style.left = '50%';
        item.style.top = '50%';
        item.style.animation = 'magicAppear 3s ease-out forwards';
        container.appendChild(item);
        
        setTimeout(() => item.remove(), 3000);
        magicIndex++;
    }, 3000);
    
    setTimeout(() => clearInterval(magicInterval), 60000);
}

// 运动表演
function performanceSport() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji" id="performer">🐓</div>
            <div class="theater-subtitle">运动让我更强壮！</div>
        </div>
    `;
    
    const performer = document.getElementById('performer');
    let position = 0;
    
    const runInterval = setInterval(() => {
        position = (position + 10) % 100;
        performer.style.transform = `translateX(${position - 50}vw)`;
    }, 100);
    
    setTimeout(() => clearInterval(runInterval), 60000);
}

// 飞行表演
function performanceFly() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji" id="performer">🦚</div>
            <div class="theater-subtitle">我会飞啦！</div>
        </div>
    `;
    
    const performer = document.getElementById('performer');
    performer.style.animation = 'fly 8s ease-in-out infinite';
}

// 音乐表演
function performanceMusic() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji" id="performer">🐣</div>
            <div class="theater-subtitle">听，多美妙的音乐！</div>
        </div>
    `;
    
    // 音符飘出
    const notes = ['🎵', '🎶', '🎼', '🎹'];
    const noteInterval = setInterval(() => {
        const note = document.createElement('div');
        note.className = 'particle';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.fontSize = '50px';
        note.style.left = Math.random() * 80 + 10 + '%';
        note.style.bottom = '0';
        note.style.animation = 'floatUp 4s ease-out forwards';
        container.appendChild(note);
        
        setTimeout(() => note.remove(), 4000);
    }, 800);
    
    setTimeout(() => clearInterval(noteInterval), 60000);
}

// 粒子效果
function playParticles() {
    const dayOfWeek = new Date().getDay();
    const effects = [
        particlesStars,      // 周日
        particlesStars,      // 周一
        particlesBubbles,    // 周二
        particlesFlowers,    // 周三
        particlesFireflies,  // 周四
        particlesSnow,       // 周五
        particlesRainbow,    // 周六
    ];
    
    const effect = effects[dayOfWeek];
    effect();
}

// 星空效果 - 流星雨和星座
function particlesStars() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-subtitle" style="color: white;">流星雨来了！</div>
        </div>
        <div class="particles-container" id="particlesContainer"></div>
    `;
    
    const particlesContainer = document.getElementById('particlesContainer');
    
    // 创建大量星星（100个）
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'particle';
        star.textContent = ['⭐', '✨', '🌟'][Math.floor(Math.random() * 3)];
        star.style.fontSize = 20 + Math.random() * 40 + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animation = `twinkle ${1 + Math.random() * 2}s ease-in-out infinite ${Math.random()}s`;
        particlesContainer.appendChild(star);
    }
    
    // 流星雨（每秒2-3颗）
    const meteorInterval = setInterval(() => {
        const meteor = document.createElement('div');
        meteor.textContent = '☄️';
        meteor.style.position = 'absolute';
        meteor.style.fontSize = '60px';
        meteor.style.left = Math.random() * 100 + '%';
        meteor.style.top = '-50px';
        meteor.style.animation = 'meteorFall 2s linear';
        particlesContainer.appendChild(meteor);
        
        setTimeout(() => meteor.remove(), 2000);
    }, 400);
    
    // 10秒后形成星座
    setTimeout(() => {
        clearInterval(meteorInterval);
        document.querySelector('.theater-subtitle').textContent = '星星组成了图案！';
        
        // 清除随机星星，创建图案
        particlesContainer.innerHTML = '';
        
        // 画一个笑脸星座
        const smileyPattern = [
            // 左眼
            {x: 35, y: 35}, {x: 37, y: 35}, {x: 36, y: 36},
            // 右眼
            {x: 63, y: 35}, {x: 65, y: 35}, {x: 64, y: 36},
            // 嘴巴（微笑）
            {x: 40, y: 55}, {x: 45, y: 58}, {x: 50, y: 60},
            {x: 55, y: 58}, {x: 60, y: 55}
        ];
        
        smileyPattern.forEach((pos, index) => {
            setTimeout(() => {
                const star = document.createElement('div');
                star.textContent = '🌟';
                star.style.position = 'absolute';
                star.style.fontSize = '50px';
                star.style.left = pos.x + '%';
                star.style.top = pos.y + '%';
                star.style.animation = 'starAppear 1s ease-out';
                particlesContainer.appendChild(star);
            }, index * 200);
        });
    }, 20000);
    
    setTimeout(() => clearInterval(meteorInterval), 40000);
}

// 泡泡效果 - 泡泡爆炸秀
function particlesBubbles() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-subtitle">泡泡派对！</div>
        </div>
        <div class="particles-container" id="particlesContainer"></div>
    `;
    
    const particlesContainer = document.getElementById('particlesContainer');
    
    // 大量泡泡上升（每秒10个）
    const bubbleInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'particle';
            bubble.textContent = '🫧';
            bubble.style.fontSize = 30 + Math.random() * 50 + 'px';
            bubble.style.left = Math.random() * 90 + 5 + '%';
            bubble.style.bottom = '-50px';
            bubble.style.animation = `riseUp ${3 + Math.random() * 2}s ease-out forwards`;
            bubble.style.cursor = 'pointer';
            
            // 点击泡泡会爆炸（虽然5米外点不到，但视觉上会自己爆）
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    // 泡泡爆炸
                    bubble.textContent = '💥';
                    bubble.style.animation = 'bubblePop 0.5s ease-out';
                    
                    // 爆炸出小星星
                    for (let j = 0; j < 5; j++) {
                        const star = document.createElement('div');
                        star.textContent = '✨';
                        star.style.position = 'absolute';
                        star.style.fontSize = '30px';
                        star.style.left = bubble.style.left;
                        star.style.bottom = bubble.style.bottom;
                        
                        const angle = (Math.PI * 2 * j) / 5;
                        const distance = 100;
                        star.style.animation = `burstOut 1s ease-out forwards`;
                        star.style.setProperty('--bx', Math.cos(angle) * distance + 'px');
                        star.style.setProperty('--by', Math.sin(angle) * distance + 'px');
                        
                        particlesContainer.appendChild(star);
                        setTimeout(() => star.remove(), 1000);
                    }
                }
            }, (3 + Math.random() * 2) * 1000);
            
            particlesContainer.appendChild(bubble);
            setTimeout(() => bubble.remove(), 6000);
        }
    }, 300);
    
    // 20秒后泡泡狂欢
    setTimeout(() => {
        document.querySelector('.theater-subtitle').textContent = '泡泡狂欢！';
        
        // 超多泡泡同时出现
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.textContent = '🫧';
                bubble.style.position = 'absolute';
                bubble.style.fontSize = 40 + Math.random() * 60 + 'px';
                bubble.style.left = Math.random() * 100 + '%';
                bubble.style.bottom = '-50px';
                bubble.style.animation = `riseUp ${2 + Math.random()}s ease-out forwards`;
                particlesContainer.appendChild(bubble);
                
                setTimeout(() => bubble.remove(), 3000);
            }, i * 50);
        }
    }, 20000);
    
    setTimeout(() => clearInterval(bubbleInterval), 40000);
}

// 樱花效果
function particlesFlowers() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-subtitle">春天的气息</div>
        </div>
        <div class="particles-container" id="particlesContainer"></div>
    `;
    
    const particlesContainer = document.getElementById('particlesContainer');
    
    const flowerInterval = setInterval(() => {
        const flower = document.createElement('div');
        flower.className = 'particle';
        flower.textContent = '🌸';
        flower.style.left = Math.random() * 90 + 5 + '%';
        flower.style.top = '-50px';
        flower.style.animation = `fallDown ${5 + Math.random() * 3}s ease-in forwards`;
        particlesContainer.appendChild(flower);
        
        setTimeout(() => flower.remove(), 8000);
    }, 600);
    
    setTimeout(() => clearInterval(flowerInterval), 40000);
}

// 萤火虫效果
function particlesFireflies() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-subtitle">萤火虫在跳舞</div>
        </div>
        <div class="particles-container" id="particlesContainer"></div>
    `;
    
    const particlesContainer = document.getElementById('particlesContainer');
    
    for (let i = 0; i < 20; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'particle';
        firefly.textContent = '✨';
        firefly.style.left = Math.random() * 100 + '%';
        firefly.style.top = Math.random() * 100 + '%';
        firefly.style.animation = `firefly ${3 + Math.random() * 2}s ease-in-out infinite`;
        particlesContainer.appendChild(firefly);
    }
}

// 雪花效果
function particlesSnow() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-subtitle">冬天的礼物</div>
        </div>
        <div class="particles-container" id="particlesContainer"></div>
    `;
    
    const particlesContainer = document.getElementById('particlesContainer');
    
    const snowInterval = setInterval(() => {
        const snow = document.createElement('div');
        snow.className = 'particle';
        snow.textContent = '❄️';
        snow.style.left = Math.random() * 100 + '%';
        snow.style.top = '-50px';
        snow.style.fontSize = 20 + Math.random() * 30 + 'px';
        snow.style.animation = `fallDown ${4 + Math.random() * 3}s linear forwards`;
        particlesContainer.appendChild(snow);
        
        setTimeout(() => snow.remove(), 7000);
    }, 400);
    
    setTimeout(() => clearInterval(snowInterval), 40000);
}

// 彩虹效果
function particlesRainbow() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-emoji">🌈</div>
            <div class="theater-subtitle">彩虹的祝福</div>
        </div>
    `;
}

// 问答环节 - 快节奏问答
function playQuiz() {
    const quizzes = getQuizzes();
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    // 第一阶段：问题（10秒）
    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-question">${quiz.question}</div>
            <div class="quiz-options">
                <div class="quiz-option">A. ${quiz.options[0]}</div>
                <div class="quiz-option">B. ${quiz.options[1]}</div>
                <div class="quiz-option">C. ${quiz.options[2]}</div>
            </div>
        </div>
    `;
    
    // 第二阶段：倒计时（3秒）- 制造紧张感
    setTimeout(() => {
        const countdownDiv = document.createElement('div');
        countdownDiv.style.position = 'absolute';
        countdownDiv.style.top = '20%';
        countdownDiv.style.left = '50%';
        countdownDiv.style.transform = 'translateX(-50%)';
        countdownDiv.style.fontSize = '150px';
        countdownDiv.style.color = '#fbbf24';
        countdownDiv.style.fontWeight = 'bold';
        countdownDiv.style.textShadow = '0 0 30px rgba(251, 191, 36, 0.8)';
        
        let countdown = 3;
        countdownDiv.textContent = countdown;
        container.appendChild(countdownDiv);
        
        const countInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownDiv.textContent = countdown;
                countdownDiv.style.animation = 'countPulse 1s ease-out';
            } else {
                clearInterval(countInterval);
                countdownDiv.remove();
            }
        }, 1000);
    }, 10000);
    
    // 第三阶段：答案揭晓（5秒）- 戏剧性
    setTimeout(() => {
        container.innerHTML = `
            <div class="theater-content">
                <div class="quiz-answer" style="animation: answerReveal 1s ease-out;">答案是 ${quiz.answer}！</div>
            </div>
        `;
        
        // 答案正确的庆祝特效
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createConfetti(container);
            }, i * 100);
        }
    }, 13000);
    
    // 第四阶段：解释（5秒）
    setTimeout(() => {
        const explanation = document.createElement('div');
        explanation.className = 'quiz-explanation';
        explanation.textContent = quiz.explanation;
        explanation.style.animation = 'slideUp 0.5s ease-out';
        container.querySelector('.theater-content').appendChild(explanation);
    }, 18000);
    
    // 第五阶段：鼓励（剩余时间）
    setTimeout(() => {
        const encouragement = document.createElement('div');
        encouragement.style.fontSize = '60px';
        encouragement.style.color = '#48bb78';
        encouragement.style.marginTop = '30px';
        encouragement.textContent = `${OWNER_NAME}真聪明！`;
        encouragement.style.animation = 'bounce 1s ease-out';
        container.querySelector('.theater-content').appendChild(encouragement);
    }, 23000);
}

// 创建彩纸效果
function createConfetti(container) {
    const colors = ['🎊', '🎉', '✨', '⭐', '🌟'];
    const confetti = document.createElement('div');
    confetti.textContent = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.position = 'absolute';
    confetti.style.fontSize = '50px';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-50px';
    confetti.style.animation = `confettiFall ${2 + Math.random()}s ease-in forwards`;
    container.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
}

// 创建烟花效果
function createFirework(container) {
    const colors = ['🎆', '🎇', '✨', '💥'];
    const firework = document.createElement('div');
    firework.textContent = colors[Math.floor(Math.random() * colors.length)];
    firework.style.position = 'absolute';
    firework.style.fontSize = '80px';
    firework.style.left = Math.random() * 80 + 10 + '%';
    firework.style.top = Math.random() * 60 + 20 + '%';
    firework.style.animation = 'fireworkBurst 1s ease-out';
    container.appendChild(firework);
    
    setTimeout(() => firework.remove(), 1000);
}

// 问答题库
function getQuizzes() {
    return [
        {
            question: '🦒 长颈鹿的舌头是什么颜色？',
            options: ['粉色', '蓝色', '绿色'],
            answer: 'B',
            explanation: '长颈鹿的舌头长达50厘米哦！'
        },
        {
            question: '🌍 地球上最大的动物是？',
            options: ['大象', '蓝鲸', '恐龙'],
            answer: 'B',
            explanation: '蓝鲸的心脏有小汽车那么大！'
        },
        {
            question: '🤔 什么东西越洗越脏？',
            options: ['衣服', '水', '手'],
            answer: 'B',
            explanation: '因为水洗东西时会变脏~'
        },
        {
            question: '🔢 一个星期有几天？',
            options: ['5天', '6天', '7天'],
            answer: 'C',
            explanation: '周一到周日，每天都很重要！'
        },
        {
            question: '🐣 宠物最喜欢什么？',
            options: ['睡觉', '吃饭', '和你玩'],
            answer: 'C',
            explanation: `我最喜欢和${OWNER_NAME}一起玩啦！`
        },
        {
            question: '🍎 一天要吃几种颜色的蔬果？',
            options: ['1种', '3种', '5种'],
            answer: 'C',
            explanation: '彩虹饮食更健康哦！'
        },
        {
            question: '🐘 大象用什么喝水？',
            options: ['嘴巴', '鼻子', '耳朵'],
            answer: 'B',
            explanation: '大象的鼻子超级灵活！'
        },
        {
            question: '🌙 月亮会发光吗？',
            options: ['会', '不会', '有时会'],
            answer: 'B',
            explanation: '月亮反射太阳的光！'
        },
        {
            question: '🦘 袋鼠宝宝住在哪里？',
            options: ['树上', '妈妈的袋子里', '地洞里'],
            answer: 'B',
            explanation: '袋鼠妈妈的育儿袋很温暖！'
        },
        {
            question: '🌈 彩虹有几种颜色？',
            options: ['5种', '7种', '9种'],
            answer: 'B',
            explanation: '红橙黄绿青蓝紫！'
        }
    ];
}

// 结束动画
function playEnding() {
    const container = document.getElementById('theaterContainer');
    container.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    
    container.innerHTML = `
        <div class="theater-content">
            <div class="theater-text">做得很棒！</div>
        </div>
    `;
    
    // 10秒后倒计时
    setTimeout(() => {
        let countdown = 10;
        const countdownInterval = setInterval(() => {
            container.innerHTML = `
                <div class="theater-content">
                    <div class="theater-text">还有 ${countdown} 秒</div>
                </div>
            `;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }, 10000);
}

// 完成剧场
function completeTheater() {
    // 更新数据
    const data = getTheaterData();
    const today = new Date().toISOString().split('T')[0];
    
    if (data.lastDate !== today) {
        data.todayCount = 1;
        data.lastDate = today;
    } else {
        data.todayCount++;
    }
    data.totalCount++;
    
    saveTheaterData(data);
    
    // 添加金币
    const coins = theaterDuration === 3 ? 3 : 5;
    const userData = getUserData();
    userData.coins += coins;
    saveUserData(userData);
    
    // 显示完成页面
    document.getElementById('theaterScreen').classList.add('hidden');
    document.getElementById('completeScreen').classList.remove('hidden');
    
    document.getElementById('rewardCoins').textContent = coins;
    document.getElementById('todayCount').textContent = data.todayCount;
    document.getElementById('totalCount').textContent = data.totalCount;
}

// 退出剧场
function exitTheater() {
    if (confirm('确定要退出吗？退出后不会获得奖励。')) {
        resetTheater();
    }
}

// 重置剧场
function resetTheater() {
    currentSegment = 0;
    segments = [];
    if (theaterTimer) {
        clearTimeout(theaterTimer);
    }
    
    document.getElementById('theaterScreen').classList.add('hidden');
    document.getElementById('completeScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes juggleBall {
        0%, 100% { transform: translate(-50%, 0); }
        50% { transform: translate(-50%, -200px); }
    }
    
    @keyframes magicAppear {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
    
    @keyframes fly {
        0% { transform: translate(0, 0); }
        25% { transform: translate(30vw, -20vh); }
        50% { transform: translate(0, -40vh); }
        75% { transform: translate(-30vw, -20vh); }
        100% { transform: translate(0, 0); }
    }
    
    @keyframes floatUp {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100vh); opacity: 0; }
    }
    
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    
    @keyframes riseUp {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-110vh); opacity: 0; }
    }
    
    @keyframes fallDown {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(360deg); opacity: 0.5; }
    }
    
    @keyframes firefly {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
    
    @keyframes shakeHard {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-20deg); }
        75% { transform: rotate(20deg); }
    }
    
    @keyframes popOut {
        0% { transform: scale(0); }
        50% { transform: scale(1.5); }
        100% { transform: scale(1); }
    }
    
    @keyframes grow {
        0% { transform: scale(1); }
        100% { transform: scale(1.3); }
    }
    
    @keyframes explode {
        0% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 1; 
        }
        100% { 
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); 
            opacity: 0; 
        }
    }
    
    @keyframes spinDance {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(360deg); opacity: 1; }
        100% { transform: scale(0) rotate(720deg); opacity: 0; }
    }
    
    @keyframes flip {
        0% { transform: rotateX(0deg); }
        100% { transform: rotateX(360deg); }
    }
    
    @keyframes bow {
        0%, 100% { transform: rotateX(0deg); }
        50% { transform: rotateX(30deg); }
    }
    
    @keyframes meteorFall {
        0% { 
            transform: translate(0, 0) rotate(45deg); 
            opacity: 1; 
        }
        100% { 
            transform: translate(-200px, 120vh) rotate(45deg); 
            opacity: 0; 
        }
    }
    
    @keyframes starAppear {
        0% { 
            transform: scale(0); 
            opacity: 0; 
        }
        50% { 
            transform: scale(1.5); 
            opacity: 1; 
        }
        100% { 
            transform: scale(1); 
            opacity: 1; 
        }
    }
    
    @keyframes countPulse {
        0% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.3); }
        100% { transform: translateX(-50%) scale(1); }
    }
    
    @keyframes answerReveal {
        0% { 
            transform: scale(0) rotate(-180deg); 
            opacity: 0; 
        }
        100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
        }
    }
    
    @keyframes slideUp {
        0% { 
            transform: translateY(50px); 
            opacity: 0; 
        }
        100% { 
            transform: translateY(0); 
            opacity: 1; 
        }
    }
    
    @keyframes confettiFall {
        0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1; 
        }
        100% { 
            transform: translateY(120vh) rotate(720deg); 
            opacity: 0; 
        }
    }
    
    @keyframes fireworkBurst {
        0% { 
            transform: scale(0); 
            opacity: 1; 
        }
        50% { 
            transform: scale(2); 
            opacity: 1; 
        }
        100% { 
            transform: scale(3); 
            opacity: 0; 
        }
    }
    
    @keyframes bubblePop {
        0% { transform: scale(1); }
        50% { transform: scale(1.5); }
        100% { transform: scale(0); opacity: 0; }
    }
    
    @keyframes burstOut {
        0% { 
            transform: translate(0, 0); 
            opacity: 1; 
        }
        100% { 
            transform: translate(var(--bx), var(--by)); 
            opacity: 0; 
        }
    }
`;
document.head.appendChild(style);
