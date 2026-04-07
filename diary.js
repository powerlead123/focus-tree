// 星空打卡墙 - 记事打卡系统

const STORAGE_KEY = 'focusTree_diaryData';

// 成就徽章配置
const BADGES = [
    { id: 'first',    label: '第一步',   icon: '🌱', require: 1,  type: 'total',  anim: 'lottie/Champion.json' },
    { id: 'week1',    label: '7天连击',  icon: '🔥', require: 7,  type: 'streak', anim: 'lottie/Champion.json' },
    { id: 'days14',   label: '14天',     icon: '🌙', require: 14, type: 'total',  anim: 'lottie/Top Badge animation.json' },
    { id: 'week4',    label: '30天连击', icon: '🏆', require: 30, type: 'streak', anim: 'lottie/Top Badge animation.json' },
    { id: 'star10',   label: '10颗星',   icon: '⭐', require: 10, type: 'stars',  anim: 'lottie/Top Badge animation.json' },
    { id: 'days60',   label: '60天',     icon: '💎', require: 60, type: 'total',  anim: 'lottie/Top Badge animation.json' },
];

// 鼓励语
const MESSAGES = {
    normal: ['太棒了！今天的记事完成啦！', '坚持就是胜利！', '又点亮了一颗星！', '你真的很努力！'],
    star:   ['哇！星号打卡！你今天超厉害！', '满分表现！星星为你闪耀！', '太优秀了！金色星星属于你！'],
    streak7:  ['连续7天！你是打卡小英雄！'],
    streak30: ['连续30天！你已经是传说级别了！'],
};

let currentYear, currentMonth;

// ========== 数据 ==========

function getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return { records: {}, streak: 0, maxStreak: 0, totalDays: 0, totalStars: 0 };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function dateKey(y, m, d) {
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

// ========== 打卡逻辑 ==========

function doCheckin(isStar) {
    const data = getData();
    const key = todayKey();

    if (data.records[key]) return; // 已打卡

    // 记录
    data.records[key] = { star: isStar, ts: Date.now() };
    data.totalDays++;
    if (isStar) data.totalStars++;

    // 计算连击
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = dateKey(yesterday.getFullYear(), yesterday.getMonth()+1, yesterday.getDate());
    data.streak = data.records[yKey] ? data.streak + 1 : 1;
    data.maxStreak = Math.max(data.maxStreak, data.streak);

    saveData(data);

    // 播放动画
    let msg = pick(isStar ? MESSAGES.star : MESSAGES.normal);
    if (data.streak === 7)  msg = MESSAGES.streak7[0];
    if (data.streak === 30) msg = MESSAGES.streak30[0];

    const animType = isStar ? 'sparkle' : 'star';
    showAnim(animType, msg);

    // 检查新徽章
    checkNewBadge(data);

    // 刷新界面
    renderAll();
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ========== 徽章检查 ==========

function checkNewBadge(data) {
    const earned = getEarnedBadges(data);
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY + '_badges') || '[]');
    const newOnes = earned.filter(id => !prev.includes(id));

    if (newOnes.length > 0) {
        localStorage.setItem(STORAGE_KEY + '_badges', JSON.stringify(earned));
        const badge = BADGES.find(b => b.id === newOnes[0]);
        if (badge) {
            setTimeout(() => showAnim('badge', `🏅 解锁成就：${badge.label}！`), 2500);
        }
    }
}

function getEarnedBadges(data) {
    return BADGES.filter(b => {
        if (b.type === 'total')  return data.totalDays  >= b.require;
        if (b.type === 'streak') return data.maxStreak  >= b.require;
        if (b.type === 'stars')  return data.totalStars >= b.require;
        return false;
    }).map(b => b.id);
}

// ========== 动画弹窗（Lottie） ==========

function showAnim(animType, text) {
    const overlay = document.getElementById('animOverlay');
    const player  = document.getElementById('animPlayer');
    const textEl  = document.getElementById('animText');

    const srcs = {
        star:    'lottie/star.json',
        sparkle: 'lottie/sparkles.json',
        badge:   'lottie/Champion.json',
    };
    player.src = srcs[animType] || 'lottie/star.json';
    textEl.textContent = text;
    overlay.classList.add('show');

    player.play();
    setTimeout(() => closeAnim(), 3000);
}

function closeAnim() {
    document.getElementById('animOverlay').classList.remove('show');
}

// ========== 渲染 ==========

function renderAll() {
    const data = getData();
    renderStats(data);
    renderBadges(data);
    renderStarwall(data);
    renderTodayStatus(data);
}

function renderStats(data) {
    document.getElementById('totalDays').textContent = `共${data.totalDays}天`;
    document.getElementById('streakDays').textContent = `🔥 ${data.streak}连击`;
}

function renderTodayStatus(data) {
    const key = todayKey();
    const rec = data.records[key];
    const statusEl = document.getElementById('todayStatus');
    const btn1 = document.getElementById('btnCheckin');
    const btn2 = document.getElementById('btnStarCheckin');

    if (rec) {
        btn1.disabled = true;
        btn2.disabled = true;
        if (rec.star) {
            statusEl.textContent = '⭐ 今天已完成星号打卡！';
            statusEl.className = 'today-status starred';
        } else {
            statusEl.textContent = '✅ 今天已完成打卡！';
            statusEl.className = 'today-status done';
        }
    } else {
        btn1.disabled = false;
        btn2.disabled = false;
        statusEl.textContent = '今天还没打卡';
        statusEl.className = 'today-status';
    }
}

function renderBadges(data) {
    const earned = getEarnedBadges(data);
    const container = document.getElementById('badgesRow');
    container.innerHTML = '';

    BADGES.forEach(badge => {
        const isEarned = earned.includes(badge.id);
        const item = document.createElement('div');
        item.className = `badge-item ${isEarned ? 'earned' : ''}`;

        const animBox = document.createElement('div');
        animBox.className = `badge-anim ${isEarned ? 'earned' : 'locked'}`;

        if (isEarned) {
            const player = document.createElement('lottie-player');
            player.setAttribute('src', badge.anim);
            player.setAttribute('background', 'transparent');
            player.setAttribute('speed', '0.8');
            player.setAttribute('loop', '');
            player.setAttribute('autoplay', '');
            player.style.width = '50px';
            player.style.height = '50px';
            animBox.appendChild(player);
        } else {
            animBox.textContent = badge.icon;
            animBox.style.fontSize = '22px';
        }

        const label = document.createElement('div');
        label.className = 'badge-label';
        label.textContent = badge.label;

        item.appendChild(animBox);
        item.appendChild(label);
        container.appendChild(item);
    });
}

function renderStarwall(data) {
    const wall = document.getElementById('starwall');
    wall.innerHTML = '';

    const today = new Date();
    const todayStr = todayKey();

    // 星期标题
    ['日','一','二','三','四','五','六'].forEach(d => {
        const label = document.createElement('div');
        label.className = 'weekday-label';
        label.textContent = d;
        wall.appendChild(label);
    });

    // 当月第一天是星期几
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 空白格
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'star-day empty';
        wall.appendChild(empty);
    }

    // 日期格
    for (let d = 1; d <= daysInMonth; d++) {
        const key = dateKey(currentYear, currentMonth, d);
        const rec = data.records[key];
        const isToday = key === todayStr;
        const isFuture = key > todayStr;

        const cell = document.createElement('div');

        let cls = 'star-day';
        let icon = '';

        if (isFuture) {
            cls += ' empty';
        } else if (rec?.star) {
            cls += ' starred';
            icon = '⭐';
        } else if (rec) {
            cls += ' checked';
            icon = '✦';
        } else if (isToday) {
            cls += ' today';
            icon = '·';
        } else {
            cls += ' pending';
        }

        cell.className = cls;
        cell.innerHTML = `
            <span class="day-num">${d}</span>
            <span class="day-icon">${icon}</span>
        `;

        wall.appendChild(cell);
    }

    document.getElementById('monthLabel').textContent =
        `${currentYear}年 ${currentMonth}月`;
}

// ========== 月份切换 ==========

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 12) { currentMonth = 1;  currentYear++; }
    if (currentMonth < 1)  { currentMonth = 12; currentYear--; }
    renderStarwall(getData());
    document.getElementById('nextMonth').disabled =
        (currentYear > new Date().getFullYear()) ||
        (currentYear === new Date().getFullYear() && currentMonth >= new Date().getMonth() + 1);
}

// ========== 初始化 ==========

window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    currentYear  = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    renderAll();
});
