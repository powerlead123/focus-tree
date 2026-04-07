// 生日庆祝页面JavaScript

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    createBalloons();
    setTimeout(() => {
        launchConfetti();
    }, 2000);
});

// 创建气球
function createBalloons() {
    const balloonsContainer = document.getElementById('balloons');
    const colors = ['#ff6b9d', '#feca57', '#48dbfb', '#ff9ff3', '#0abde3'];
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.left = Math.random() * 100 + '%';
            balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
            balloon.style.animationDelay = Math.random() * 2 + 's';
            balloon.textContent = '🎈';
            balloon.style.fontSize = (30 + Math.random() * 30) + 'px';
            balloon.style.position = 'absolute';
            balloon.style.bottom = '-100px';
            balloon.style.animation = 'balloonFloat ' + (8 + Math.random() * 4) + 's ease-in-out infinite';
            
            balloonsContainer.appendChild(balloon);
        }, i * 200);
    }
}

// 添加气球动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes balloonFloat {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 发射彩纸
function launchConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const colors = ['#ff6b9d', '#feca57', '#48dbfb', '#ff9ff3', '#0abde3', '#ffd700'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (5 + Math.random() * 10) + 'px';
        confetti.style.height = (5 + Math.random() * 10) + 'px';
        confetti.style.position = 'absolute';
        confetti.style.top = '-20px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// 添加彩纸动画CSS
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// 吹蜡烛
function blowCandles() {
    const flames = document.querySelectorAll('.flame');
    const candles = document.querySelectorAll('.candle');
    
    flames.forEach((flame, index) => {
        setTimeout(() => {
            flame.style.animation = 'flameBlowOut 0.5s ease-out forwards';
            setTimeout(() => {
                flame.style.display = 'none';
                // 冒烟效果
                createSmoke(candles[index]);
            }, 500);
        }, index * 200);
    });
    
    // 所有蜡烛吹灭后的庆祝
    setTimeout(() => {
        launchFireworks();
        showMessage('🎉 愿望成真！');
    }, 1500);
}

// 添加吹灭动画CSS
const blowStyle = document.createElement('style');
blowStyle.textContent = `
    @keyframes flameBlowOut {
        0% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateX(-70%) scale(0.5);
            opacity: 0.5;
        }
        100% {
            transform: translateX(-100%) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(blowStyle);

// 创建烟雾效果
function createSmoke(candle) {
    const smoke = document.createElement('div');
    smoke.textContent = '💨';
    smoke.style.position = 'absolute';
    smoke.style.top = '-20px';
    smoke.style.left = '50%';
    smoke.style.transform = 'translateX(-50%)';
    smoke.style.fontSize = '20px';
    smoke.style.animation = 'smokeRise 2s ease-out forwards';
    candle.appendChild(smoke);
    
    setTimeout(() => smoke.remove(), 2000);
}

// 添加烟雾动画CSS
const smokeStyle = document.createElement('style');
smokeStyle.textContent = `
    @keyframes smokeRise {
        0% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateX(-50%) translateY(-50px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(smokeStyle);

// 放烟花
function launchFireworks() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 500);
    }
}

function createFirework() {
    const x = 20 + Math.random() * 60;
    const y = 20 + Math.random() * 40;
    const colors = ['#ff6b9d', '#feca57', '#48dbfb', '#ff9ff3', '#0abde3', '#ffd700'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.animation = `fireworkParticle 1.5s ease-out forwards`;
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1500);
    }
}

// 添加烟花动画CSS
const fireworkStyle = document.createElement('style');
fireworkStyle.textContent = `
    @keyframes fireworkParticle {
        0% {
            transform: translate(0, 0);
            opacity: 1;
        }
        100% {
            transform: translate(var(--tx), var(--ty));
            opacity: 0;
        }
    }
`;
document.head.appendChild(fireworkStyle);

// 开始跳舞
function startDance() {
    const pets = document.querySelectorAll('.pet');
    const boy = document.getElementById('birthdayBoy');
    
    // 宠物围成圈跳舞
    pets.forEach((pet, index) => {
        pet.style.animation = `petDance 2s ease-in-out infinite ${index * 0.2}s`;
    });
    
    boy.style.animation = 'boyDance 1s ease-in-out infinite';
    
    showMessage('💃 一起跳舞吧！');
    
    // 持续放彩纸
    const danceInterval = setInterval(() => {
        launchConfetti();
    }, 1000);
    
    // 10秒后停止
    setTimeout(() => {
        clearInterval(danceInterval);
        pets.forEach(pet => {
            pet.style.animation = '';
        });
        boy.style.animation = '';
    }, 10000);
}

// 添加跳舞动画CSS
const danceStyle = document.createElement('style');
danceStyle.textContent = `
    @keyframes petDance {
        0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
        }
        25% {
            transform: translateY(-30px) rotate(-15deg) scale(1.1);
        }
        50% {
            transform: translateY(0) rotate(0deg) scale(1);
        }
        75% {
            transform: translateY(-30px) rotate(15deg) scale(1.1);
        }
    }
    
    @keyframes boyDance {
        0%, 100% {
            transform: translateX(-50%) rotate(0deg);
        }
        25% {
            transform: translateX(-50%) rotate(-10deg) scale(1.1);
        }
        75% {
            transform: translateX(-50%) rotate(10deg) scale(1.1);
        }
    }
`;
document.head.appendChild(danceStyle);

// 显示消息
function showMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '48px';
    message.style.fontWeight = 'bold';
    message.style.color = '#ffd700';
    message.style.textShadow = '0 0 20px rgba(255, 215, 0, 1)';
    message.style.zIndex = '10000';
    message.style.animation = 'messagePop 2s ease-out forwards';
    
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 2000);
}

// 添加消息动画CSS
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes messagePop {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(messageStyle);
