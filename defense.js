// ============================================================
// 御灵守卫战 - 游戏逻辑（精简版：积分买武器 → 摆战场塔防）
// ============================================================

// ---------- 资源加载 ----------
const ASSETS = { lizardWalk: [], dragonIdle: [], dragonAttack: [], tinted: {} };
let assetsReady = false;

function loadImg(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

async function loadAssets() {
    const lizardWalk = [], dragonIdle = [], dragonAttack = [];
    for (let i = 1; i <= 6; i++) lizardWalk.push(loadImg(`assets/enemies/lizard/Walk${i}.png`));
    for (let i = 1; i <= 4; i++) dragonIdle.push(loadImg(`assets/items/spirit_小龙_${i}.png`));
    for (let i = 1; i <= 9; i++) dragonAttack.push(loadImg(`assets/items/spirit_小龙_attack_${i}.png`));
    ASSETS.lizardWalk = (await Promise.all(lizardWalk)).filter(Boolean);
    ASSETS.dragonIdle = (await Promise.all(dragonIdle)).filter(Boolean);
    ASSETS.dragonAttack = (await Promise.all(dragonAttack)).filter(Boolean);
    buildTintedFrames();
    assetsReady = true;
}

function tintFrame(img, color, alpha) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.globalAlpha = alpha; x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
}
function buildTintedFrames() {
    Object.values(DEF_ENEMIES).forEach(e => {
        if (e.tint && ASSETS.lizardWalk.length) {
            ASSETS.tinted[e.id] = ASSETS.lizardWalk.map(img => tintFrame(img, e.tint, 0.45));
        }
    });
}

// ============================================================
//  手绘炮台（矢量，无 emoji）
// ============================================================
function drawTurret(c, type, x, y, size, opts = {}) {
    const s = size, atk = opts.attacking > 0;
    c.save();
    c.translate(x, y);
    switch (type) {
        case 'dragon': drawDragon(c, s, opts); break;
        case 'crossbow': drawCrossbow(c, s, atk); break;
        case 'ice': drawIce(c, s, opts.frame || 0); break;
        case 'cannon': drawCannon(c, s, atk); break;
        case 'wall': drawWall(c, s); break;
    }
    c.restore();
}

function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
}

function drawBase(c, s, col1, col2) {
    // 通用石质底座
    const g = c.createLinearGradient(0, s * 0.1, 0, s * 0.42);
    g.addColorStop(0, col1); g.addColorStop(1, col2);
    c.fillStyle = g;
    roundRectPath(c, -s * 0.34, s * 0.08, s * 0.68, s * 0.34, s * 0.1); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.18)';
    roundRectPath(c, -s * 0.34, s * 0.32, s * 0.68, s * 0.1, s * 0.05); c.fill();
}

function drawWall(c, s) {
    const brick = (bx, by, bw, bh) => {
        const g = c.createLinearGradient(0, by, 0, by + bh);
        g.addColorStop(0, '#cbd5e1'); g.addColorStop(1, '#64748b');
        c.fillStyle = g;
        roundRectPath(c, bx, by, bw, bh, 3); c.fill();
        c.strokeStyle = 'rgba(15,23,42,0.5)'; c.lineWidth = 2; c.stroke();
    };
    const w = s * 0.74, h = s * 0.22, x0 = -w / 2, y0 = -s * 0.32;
    for (let row = 0; row < 3; row++) {
        const off = row % 2 ? w * 0.18 : 0;
        brick(x0 - off, y0 + row * (h + 3), w * 0.46, h);
        brick(x0 + w * 0.5 - off, y0 + row * (h + 3), w * 0.46, h);
    }
}

function drawCannon(c, s, atk) {
    drawBase(c, s, '#475569', '#1e293b');
    // 轮子
    c.fillStyle = '#0f172a';
    c.beginPath(); c.arc(-s * 0.22, s * 0.28, s * 0.1, 0, 7); c.fill();
    c.beginPath(); c.arc(s * 0.22, s * 0.28, s * 0.1, 0, 7); c.fill();
    // 炮管（攻击时后坐）
    const recoil = atk ? s * 0.06 : 0;
    const g = c.createLinearGradient(-s * 0.12, 0, s * 0.12, 0);
    g.addColorStop(0, '#334155'); g.addColorStop(0.5, '#94a3b8'); g.addColorStop(1, '#334155');
    c.fillStyle = g;
    roundRectPath(c, -s * 0.13, -s * 0.4 + recoil, s * 0.26, s * 0.5, s * 0.06); c.fill();
    // 炮口
    c.fillStyle = atk ? '#fdba74' : '#0f172a';
    c.beginPath(); c.ellipse(0, -s * 0.4 + recoil, s * 0.13, s * 0.05, 0, 0, 7); c.fill();
    if (atk) { c.fillStyle = '#fb923c'; c.beginPath(); c.arc(0, -s * 0.46 + recoil, s * 0.1, 0, 7); c.fill(); }
}

function drawCrossbow(c, s, atk) {
    drawBase(c, s, '#92400e', '#451a03');
    // 立柱
    c.fillStyle = '#7c2d12';
    roundRectPath(c, -s * 0.05, -s * 0.32, s * 0.1, s * 0.42, s * 0.03); c.fill();
    // 弓臂
    c.strokeStyle = '#a16207'; c.lineWidth = s * 0.07; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-s * 0.3, -s * 0.22); c.quadraticCurveTo(0, -s * 0.4, s * 0.3, -s * 0.22);
    c.stroke();
    // 弓弦
    c.strokeStyle = '#e5e7eb'; c.lineWidth = 1.5;
    const pull = atk ? -s * 0.05 : -s * 0.18;
    c.beginPath(); c.moveTo(-s * 0.3, -s * 0.22); c.lineTo(0, pull); c.lineTo(s * 0.3, -s * 0.22); c.stroke();
    // 弩箭
    c.strokeStyle = '#cbd5e1'; c.lineWidth = s * 0.04;
    c.beginPath(); c.moveTo(0, pull); c.lineTo(0, -s * 0.42); c.stroke();
    c.fillStyle = '#f8fafc';
    c.beginPath(); c.moveTo(0, -s * 0.48); c.lineTo(-s * 0.05, -s * 0.4); c.lineTo(s * 0.05, -s * 0.4); c.fill();
}

function drawIce(c, s, frame) {
    drawBase(c, s, '#0e7490', '#083344');
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.15);
    // 光晕
    c.save();
    c.globalAlpha = 0.4 + pulse * 0.3;
    const gl = c.createRadialGradient(0, -s * 0.15, 2, 0, -s * 0.15, s * 0.35);
    gl.addColorStop(0, '#bae6fd'); gl.addColorStop(1, 'rgba(56,189,248,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(0, -s * 0.15, s * 0.35, 0, 7); c.fill();
    c.restore();
    // 主水晶（菱形）
    const cg = c.createLinearGradient(0, -s * 0.42, 0, s * 0.05);
    cg.addColorStop(0, '#f0f9ff'); cg.addColorStop(0.5, '#7dd3fc'); cg.addColorStop(1, '#0284c7');
    c.fillStyle = cg;
    c.beginPath();
    c.moveTo(0, -s * 0.44); c.lineTo(s * 0.15, -s * 0.12); c.lineTo(0, s * 0.06); c.lineTo(-s * 0.15, -s * 0.12);
    c.closePath(); c.fill();
    c.strokeStyle = '#e0f2fe'; c.lineWidth = 1.5; c.stroke();
    // 侧边小晶
    c.fillStyle = '#38bdf8';
    c.beginPath(); c.moveTo(-s * 0.22, -s * 0.05); c.lineTo(-s * 0.14, -s * 0.2); c.lineTo(-s * 0.1, 0); c.fill();
    c.beginPath(); c.moveTo(s * 0.22, -s * 0.05); c.lineTo(s * 0.14, -s * 0.2); c.lineTo(s * 0.1, 0); c.fill();
}

function drawDragon(c, s, opts) {
    const frames = opts.attacking > 0 && ASSETS.dragonAttack.length ? ASSETS.dragonAttack : ASSETS.dragonIdle;
    if (frames && frames.length) {
        const img = frames[Math.floor(opts.frame || 0) % frames.length];
        const ratio = img.width / img.height;
        const h = s, w = h * ratio;
        c.imageSmoothingEnabled = false;
        c.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
        // 资源未就绪的简单替身
        c.fillStyle = '#34d399';
        c.beginPath(); c.arc(0, 0, s * 0.3, 0, 7); c.fill();
    }
}

// 生成武器小图标（用于商店/托盘，无 emoji）
function makeIcon(id, px = 54) {
    const cv = document.createElement('canvas');
    cv.width = px; cv.height = px;
    const c = cv.getContext('2d');
    drawTurret(c, DEF_WEAPONS[id].render, px / 2, px / 2 + px * 0.08, px * 0.92, { frame: 0, attacking: 0 });
    return cv;
}

// ============================================================
//  手绘敌人造型（矢量）
// ============================================================
function drawEnemyArt(c, render, x, y, size, frame, hitFlash) {
    c.save();
    c.translate(x, y);
    if (hitFlash > 0) { c.shadowColor = '#fff'; c.shadowBlur = 14; }
    switch (render) {
        case 'slime':  drawSlime(c, size, frame); break;
        case 'bat':    drawBat(c, size, frame); break;
        case 'golem':  drawGolem(c, size, frame); break;
        case 'wraith': drawWraith(c, size, frame); break;
        case 'demon':  drawDemon(c, size, frame); break;
    }
    c.restore();
}

function eyes(c, s, ex, ey, er, look) {
    // 一对发光眼睛
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(-ex, ey, er, 0, 7); c.arc(ex, ey, er, 0, 7); c.fill();
    c.fillStyle = look || '#0f172a';
    c.beginPath(); c.arc(-ex, ey + er * 0.2, er * 0.55, 0, 7); c.arc(ex, ey + er * 0.2, er * 0.55, 0, 7); c.fill();
}

function drawSlime(c, s, frame) {
    const sq = 1 + Math.sin(frame * 0.25) * 0.08;
    c.save(); c.scale(sq, 2 - sq);
    const g = c.createRadialGradient(0, -s * 0.1, 2, 0, s * 0.1, s * 0.5);
    g.addColorStop(0, '#bef264'); g.addColorStop(1, '#4d7c0f');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-s * 0.42, s * 0.32);
    c.quadraticCurveTo(-s * 0.5, -s * 0.4, 0, -s * 0.42);
    c.quadraticCurveTo(s * 0.5, -s * 0.4, s * 0.42, s * 0.32);
    c.quadraticCurveTo(0, s * 0.46, -s * 0.42, s * 0.32);
    c.closePath(); c.fill();
    // 高光
    c.fillStyle = 'rgba(255,255,255,0.4)';
    c.beginPath(); c.ellipse(-s * 0.15, -s * 0.18, s * 0.08, s * 0.12, -0.3, 0, 7); c.fill();
    c.restore();
    eyes(c, s, s * 0.16, -s * 0.02, s * 0.09);
}

function drawBat(c, s, frame) {
    const flap = Math.sin(frame * 0.5);
    c.fillStyle = '#4c1d95';
    // 翅膀
    [-1, 1].forEach(dir => {
        c.save(); c.scale(dir, 1);
        c.beginPath();
        c.moveTo(s * 0.08, -s * 0.05);
        c.quadraticCurveTo(s * 0.4, -s * 0.3 - flap * s * 0.15, s * 0.52, -s * 0.02 + flap * s * 0.1);
        c.quadraticCurveTo(s * 0.42, s * 0.02, s * 0.36, s * 0.12);
        c.quadraticCurveTo(s * 0.3, s * 0.02, s * 0.22, s * 0.1);
        c.quadraticCurveTo(s * 0.16, s * 0.02, s * 0.08, s * 0.12);
        c.closePath(); c.fill();
        c.restore();
    });
    // 身体
    const g = c.createRadialGradient(0, 0, 2, 0, 0, s * 0.22);
    g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#3b0764');
    c.fillStyle = g;
    c.beginPath(); c.ellipse(0, 0, s * 0.16, s * 0.2, 0, 0, 7); c.fill();
    // 耳朵
    c.fillStyle = '#3b0764';
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.16); c.lineTo(-s * 0.04, -s * 0.32); c.lineTo(0, -s * 0.16); c.fill();
    c.beginPath(); c.moveTo(s * 0.1, -s * 0.16); c.lineTo(s * 0.04, -s * 0.32); c.lineTo(0, -s * 0.16); c.fill();
    eyes(c, s, s * 0.07, -s * 0.02, s * 0.05, '#ef4444');
}

function drawGolem(c, s, frame) {
    const g = c.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
    g.addColorStop(0, '#d6d3d1'); g.addColorStop(1, '#57534e');
    c.fillStyle = g; c.strokeStyle = '#292524'; c.lineWidth = 2;
    // 多边形岩体
    c.beginPath();
    c.moveTo(-s * 0.34, -s * 0.18); c.lineTo(-s * 0.1, -s * 0.42); c.lineTo(s * 0.2, -s * 0.38);
    c.lineTo(s * 0.4, -s * 0.06); c.lineTo(s * 0.32, s * 0.34); c.lineTo(-s * 0.04, s * 0.44);
    c.lineTo(-s * 0.38, s * 0.24); c.closePath(); c.fill(); c.stroke();
    // 裂纹
    c.strokeStyle = 'rgba(41,37,36,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.3); c.lineTo(0, 0); c.lineTo(-s * 0.15, s * 0.2); c.stroke();
    c.beginPath(); c.moveTo(s * 0.2, -s * 0.1); c.lineTo(s * 0.05, s * 0.05); c.stroke();
    // 愤怒的眼睛
    c.fillStyle = '#f97316';
    c.beginPath(); c.arc(-s * 0.14, -s * 0.05, s * 0.07, 0, 7); c.arc(s * 0.12, -s * 0.05, s * 0.07, 0, 7); c.fill();
    c.fillStyle = '#fde68a';
    c.beginPath(); c.arc(-s * 0.14, -s * 0.05, s * 0.03, 0, 7); c.arc(s * 0.12, -s * 0.05, s * 0.03, 0, 7); c.fill();
}

function drawWraith(c, s, frame) {
    c.globalAlpha = 0.85;
    const wave = Math.sin(frame * 0.3) * s * 0.04;
    const g = c.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
    g.addColorStop(0, '#e9d5ff'); g.addColorStop(1, '#7e22ce');
    c.fillStyle = g;
    // 兜帽身体 + 飘动下摆
    c.beginPath();
    c.moveTo(-s * 0.3, -s * 0.05);
    c.quadraticCurveTo(-s * 0.32, -s * 0.44, 0, -s * 0.46);
    c.quadraticCurveTo(s * 0.32, -s * 0.44, s * 0.3, -s * 0.05);
    c.lineTo(s * 0.3, s * 0.3);
    c.quadraticCurveTo(s * 0.15, s * 0.3 + wave, 0, s * 0.42);
    c.quadraticCurveTo(-s * 0.15, s * 0.3 - wave, -s * 0.3, s * 0.3);
    c.closePath(); c.fill();
    // 兜帽暗部
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(30,10,50,0.85)';
    c.beginPath(); c.ellipse(0, -s * 0.12, s * 0.2, s * 0.24, 0, 0, 7); c.fill();
    // 幽光眼
    c.fillStyle = '#67e8f9'; c.shadowColor = '#22d3ee'; c.shadowBlur = 8;
    c.beginPath(); c.ellipse(-s * 0.08, -s * 0.12, s * 0.04, s * 0.06, 0, 0, 7);
    c.ellipse(s * 0.08, -s * 0.12, s * 0.04, s * 0.06, 0, 0, 7); c.fill();
    c.shadowBlur = 0;
}

function drawDemon(c, s, frame) {
    // Boss：巨型恶魔
    const g = c.createRadialGradient(0, 0, 4, 0, 0, s * 0.5);
    g.addColorStop(0, '#f87171'); g.addColorStop(1, '#7f1d1d');
    c.fillStyle = g; c.strokeStyle = '#450a0a'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, s * 0.05, s * 0.4, s * 0.42, 0, 0, 7); c.fill(); c.stroke();
    // 犄角
    c.fillStyle = '#1c1917';
    [-1, 1].forEach(d => {
        c.beginPath();
        c.moveTo(d * s * 0.18, -s * 0.32);
        c.quadraticCurveTo(d * s * 0.42, -s * 0.5, d * s * 0.34, -s * 0.16);
        c.quadraticCurveTo(d * s * 0.26, -s * 0.28, d * s * 0.18, -s * 0.32);
        c.fill();
    });
    // 怒眼
    c.fillStyle = '#fde047'; c.shadowColor = '#facc15'; c.shadowBlur = 10;
    c.beginPath(); c.ellipse(-s * 0.15, -s * 0.05, s * 0.08, s * 0.05, 0.3, 0, 7);
    c.ellipse(s * 0.15, -s * 0.05, s * 0.08, s * 0.05, -0.3, 0, 7); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = '#7f1d1d';
    c.beginPath(); c.arc(-s * 0.15, -s * 0.04, s * 0.03, 0, 7); c.arc(s * 0.15, -s * 0.04, s * 0.03, 0, 7); c.fill();
    // 獠牙
    c.fillStyle = '#fff';
    c.beginPath(); c.moveTo(-s * 0.12, s * 0.22); c.lineTo(-s * 0.06, s * 0.22); c.lineTo(-s * 0.09, s * 0.34); c.fill();
    c.beginPath(); c.moveTo(s * 0.12, s * 0.22); c.lineTo(s * 0.06, s * 0.22); c.lineTo(s * 0.09, s * 0.34); c.fill();
}

// ---------- 工具 ----------
function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1600);
}
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ============================================================
//  菜单 / 备战
// ============================================================
let selectedLevel = 1;

function initMenu() {
    const data = getDefData();
    selectedLevel = Math.min(selectedLevel, data.highestLevel);
    document.getElementById('menuPoints').textContent = data.points;
    renderLevels();
    renderShop();
    showScreen('menuScreen');
}

function renderLevels() {
    const data = getDefData();
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    const maxShow = Math.max(9, data.highestLevel + 2);
    for (let lv = 1; lv <= maxShow; lv++) {
        const cfg = getLevelConfig(lv);
        const locked = lv > data.highestLevel;
        const cell = document.createElement('div');
        cell.className = 'level-cell' + (cfg.boss ? ' boss' : '') + (locked ? ' locked' : '') + (lv === selectedLevel ? ' selected' : '');
        cell.innerHTML = locked
            ? `<span class="lv-lock">🔒</span>`
            : `<span class="lv-num">${lv}</span><span class="lv-tag">${cfg.boss ? 'BOSS关' : '第' + lv + '关'}</span>`;
        if (!locked) cell.onclick = () => { selectedLevel = lv; renderLevels(); };
        grid.appendChild(cell);
    }
}

function renderShop() {
    const data = getDefData();
    const grid = document.getElementById('armoryGrid');
    grid.innerHTML = '';
    const roleNames = { dps: '速射', sniper: '狙击', control: '控制', aoe: '范围', wall: '肉盾' };

    Object.values(DEF_WEAPONS).forEach(w => {
        const owned = data.arsenal[w.id] || 0;
        const can = data.points >= w.price;
        const card = document.createElement('div');
        card.className = 'weapon-card';

        let statsHtml = '';
        if (w.atk) statsHtml += `<span>攻<b>${w.atk}</b></span>`;
        if (w.hp) statsHtml += `<span>血<b>${w.hp}</b></span>`;

        const iconWrap = document.createElement('div');
        iconWrap.className = 'wc-icon';
        iconWrap.appendChild(makeIcon(w.id, 54));

        card.innerHTML = `
            <span class="wc-owned">拥有 ${owned}</span>
            <div class="wc-name">${w.name}</div>
            <div class="wc-role">${roleNames[w.role] || ''}</div>
            <div class="wc-desc">${w.desc}</div>
            <div class="wc-stats">${statsHtml}</div>
            <button class="wc-btn ${can ? 'buy' : 'cant'}" ${can ? `onclick="purchase('${w.id}')"` : 'disabled'}>购买 ${w.price}积分</button>`;
        card.querySelector('.wc-name').before(iconWrap);
        grid.appendChild(card);
    });
}

function purchase(id) {
    if (buyWeapon(id)) {
        toast(`购买 ${DEF_WEAPONS[id].name}！`);
        initMenu();
    } else {
        toast('积分不足');
    }
}

function backToMenu() { initMenu(); }

// ============================================================
//  家长录入（密码 = 当天星期英文；按住 Z 才能操作，隐藏）
// ============================================================
let _zActive = false;
document.addEventListener('keydown', e => { if (e.key === 'z' || e.key === 'Z') _zActive = true; });
document.addEventListener('keyup', e => { if (e.key === 'z' || e.key === 'Z') _zActive = false; });

function todayPwd() {
    const map = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return map[new Date().getDay()];
}
function openParentGate() {
    document.getElementById('lockInput').value = '';
    document.getElementById('lockError').textContent = '';
    document.getElementById('lockOverlay').classList.add('active');
    setTimeout(() => document.getElementById('lockInput').focus(), 100);
}
function closeLock() { document.getElementById('lockOverlay').classList.remove('active'); }
function lockVerify() {
    const val = document.getElementById('lockInput').value.trim().toLowerCase();
    if (val === todayPwd()) { closeLock(); openParent(); }
    else document.getElementById('lockError').textContent = '密码错误，请向家长确认';
}

function openParent() { renderParent(); showScreen('parentScreen'); }

function renderParent() {
    const data = getDefData();
    document.getElementById('parentPoints').textContent = data.points;
    const rl = document.getElementById('rewardList');
    rl.innerHTML = '';
    DEF_REWARDS.forEach(r => {
        const item = document.createElement('div');
        item.className = 'reward-item';
        item.innerHTML = `<span class="ri-icon">${r.icon}</span><span class="ri-label">${r.label}</span>
            <span class="ri-pts plus">+${r.pts}</span>
            <button class="ri-btn" data-pts="${r.pts}" data-label="${r.label}">发放</button>`;
        rl.appendChild(item);
    });
    const pl = document.getElementById('penaltyList');
    pl.innerHTML = '';
    DEF_PENALTIES.forEach(p => {
        const item = document.createElement('div');
        item.className = 'reward-item';
        item.innerHTML = `<span class="ri-icon">${p.icon}</span><span class="ri-label">${p.label}</span>
            <span class="ri-pts minus">${p.pts}</span>
            <button class="ri-btn minus" data-pts="${p.pts}" data-label="${p.label}">扣除</button>`;
        pl.appendChild(item);
    });
    bindParentButtons();
    renderHistory();
    updateArmFeedback();
}

function updateArmFeedback() {
    document.querySelectorAll('#parentScreen .ri-btn').forEach(b => b.classList.toggle('armed', _zActive));
}
setInterval(() => { if (document.getElementById('parentScreen').classList.contains('active')) updateArmFeedback(); }, 120);

function bindParentButtons() {
    document.querySelectorAll('#parentScreen .ri-btn').forEach(b => {
        b.onclick = () => {
            if (!_zActive) return;  // 隐藏机关：未按 Z 静默无反应
            const pts = parseInt(b.dataset.pts), label = b.dataset.label;
            addDefPoints(pts, label);
            toast(`${label} ${pts > 0 ? '+' : ''}${pts}积分`);
            renderParent();
        };
    });
}

function renderHistory() {
    const data = getDefData();
    const hl = document.getElementById('historyList');
    hl.innerHTML = '';
    data.history.slice(0, 30).forEach(h => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `<span>${h.date} ${h.label}</span>
            <span class="hi-pts ${h.pts >= 0 ? 'plus' : 'minus'}">${h.pts >= 0 ? '+' : ''}${h.pts}</span>`;
        hl.appendChild(item);
    });
}

// ============================================================
//  战斗引擎
// ============================================================
let canvas, ctx, W, H, dpr = 1, rafId = null;
let G = null;
const TRAY_H = 96;
let laneW, cellSize, gridBottom, rowsY = [], baseLineY;

function computeLayout() {
    laneW = W / DEF_COLS;
    const maxGridH = H * 0.52;   // 放置区最多占下半屏
    cellSize = Math.min(laneW * 0.92, maxGridH / DEF_PLACE_ROWS);
    gridBottom = H - TRAY_H - 8;
    rowsY = [];
    for (let r = 0; r < DEF_PLACE_ROWS; r++) {
        // r=0 最上排，r=末 最下排
        rowsY[r] = gridBottom - cellSize * (DEF_PLACE_ROWS - r - 0.5);
    }
    baseLineY = H - TRAY_H - 2;
}
function setupCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    computeLayout();
}

async function enterBattle() {
    showScreen('battleScreen');
    if (!assetsReady) { toast('正在加载…'); await loadAssets(); }
    setupCanvas();
    startLevel(selectedLevel);
}

function startLevel(level) {
    const cfg = getLevelConfig(level);
    const data = getDefData();
    const queue = buildSpawnQueue(cfg);
    G = {
        level, cfg, data,
        enemies: [], units: {}, projectiles: [], particles: [], floats: [],
        stock: { ...data.arsenal },     // 本局可放置的武器数量（每局重置）
        lives: 5, maxLives: 5,
        killed: 0, total: queue.length, spawned: 0,
        queue, spawnTimer: 60, frame: 0,
        selected: null, running: true, ended: false,
        shake: 0, flash: 0,
    };
    buildTray();
    updateHud();
    cancelAnimationFrame(rafId);
    loop();
}

function buildSpawnQueue(cfg) {
    const queue = [], types = [];
    Object.keys(cfg.mix).forEach(k => { for (let i = 0; i < cfg.mix[k]; i++) types.push(k); });
    for (let i = 0; i < cfg.count; i++) queue.push(types[Math.floor(Math.random() * types.length)]);
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    if (cfg.boss) queue.push('boss');
    return queue;
}

// ---------- 武器托盘 ----------
function buildTray() {
    const tray = document.getElementById('weaponTray');
    tray.innerHTML = '';
    Object.keys(DEF_WEAPONS).forEach(id => {
        if (!(G.stock[id] > 0)) return;   // 没买的不显示
        const w = DEF_WEAPONS[id];
        const item = document.createElement('div');
        item.className = 'tray-item';
        item.dataset.id = id;
        const ic = makeIcon(id, 46);
        item.appendChild(ic);
        const name = document.createElement('div'); name.className = 'ti-name'; name.textContent = w.name;
        const cnt = document.createElement('div'); cnt.className = 'ti-count'; cnt.textContent = '×' + G.stock[id];
        item.appendChild(name); item.appendChild(cnt);
        item.onclick = () => selectWeapon(id);
        tray.appendChild(item);
    });
    if (!tray.children.length) {
        tray.innerHTML = '<div class="tray-empty">没有武器了，去商店购买吧</div>';
    }
}
function updateTrayCounts() {
    document.querySelectorAll('.tray-item').forEach(el => {
        const id = el.dataset.id;
        const n = G.stock[id] || 0;
        const cnt = el.querySelector('.ti-count');
        if (cnt) cnt.textContent = '×' + n;
        el.classList.toggle('cant', n <= 0);
        if (n <= 0 && G.selected === id) { G.selected = null; }
        el.classList.toggle('selected', id === G.selected);
    });
}
function selectWeapon(id) {
    if (!(G.stock[id] > 0)) return;
    G.selected = (G.selected === id) ? null : id;
    updateTrayCounts();
}

// ---------- 点击放置 ----------
function onCanvasPointer(e) {
    if (!G || !G.running || !G.selected) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const py = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    if (G.stock[G.selected] <= 0) return;
    const col = Math.max(0, Math.min(DEF_COLS - 1, Math.floor(px / laneW)));
    // 找最近的一排
    let row = -1, bestD = Infinity;
    for (let r = 0; r < DEF_PLACE_ROWS; r++) { const d = Math.abs(py - rowsY[r]); if (d < bestD) { bestD = d; row = r; } }
    if (bestD > cellSize * 0.6 || py > gridBottom) { toast('请放在底部的格子里'); return; }
    const key = `${col}_${row}`;
    if (G.units[key]) { toast('这里已经有武器了'); return; }
    placeUnit(col, row, G.selected);
    G.stock[G.selected]--;
    if (G.stock[G.selected] <= 0) G.selected = null;
    updateTrayCounts();
}

function placeUnit(col, row, id) {
    const w = DEF_WEAPONS[id];
    const key = `${col}_${row}`;
    G.units[key] = {
        id, col, row, key, render: w.render,
        x: (col + 0.5) * laneW, y: rowsY[row],
        hp: w.hp, maxHp: w.hp, atk: w.atk, cd: 0, cooldown: w.cooldown,
        frame: Math.random() * 100, attacking: 0, hitFlash: 0,
    };
    spawnParticles((col + 0.5) * laneW, rowsY[row], w.color, 12);
}

// ============================================================
//  更新
// ============================================================
function spawnEnemy(typeId) {
    const def = DEF_ENEMIES[typeId], cfg = G.cfg;
    const col = Math.floor(Math.random() * DEF_COLS);
    const hp = Math.round(cfg.baseHp * def.hpMult);
    const size = cellSize * 1.05 * def.scale;
    G.enemies.push({
        type: typeId, def, col,
        x: (col + 0.5) * laneW, y: -size,
        hp, maxHp: hp, speed: cfg.speed * def.speedMult,
        size, frame: Math.random() * 6, atkCd: 0, slowTimer: 0, slowFactor: 1, hitFlash: 0,
    });
}

function update() {
    G.frame++;
    if (G.shake > 0) G.shake *= 0.85;
    if (G.flash > 0) G.flash -= 0.04;
    if (G.spawned < G.queue.length) {
        if (--G.spawnTimer <= 0) { spawnEnemy(G.queue[G.spawned]); G.spawned++; G.spawnTimer = G.cfg.spawnGap; }
    }
    updateUnits(); updateEnemies(); updateProjectiles(); updateParticles();
    if (!G.ended) {
        if (G.lives <= 0) endBattle(false);
        else if (G.spawned >= G.queue.length && G.enemies.length === 0) endBattle(true);
    }
}

function updateUnits() {
    for (const key in G.units) {
        const u = G.units[key];
        u.frame += 0.2;
        if (u.attacking > 0) u.attacking--;
        if (u.hitFlash > 0) u.hitFlash--;
        if (!u.atk) continue;
        if (u.cd > 0) u.cd--;
        const target = findTargetInLane(u.col, u.y);
        if (target && u.cd <= 0) { fireProjectile(u, target); u.cd = u.cooldown; u.attacking = 12; }
    }
}
function findTargetInLane(col, belowY) {
    let best = null, bestY = -Infinity;
    for (const e of G.enemies) if (e.col === col && e.y < belowY && e.y > bestY) { best = e; bestY = e.y; }
    return best;
}
function fireProjectile(u, target) {
    const w = DEF_WEAPONS[u.id];
    G.projectiles.push({
        id: u.id, x: u.x, y: u.y - cellSize * 0.4, vy: -(w.projSpeed || 8), col: u.col,
        dmg: u.atk, color: w.color, splash: w.splashRadius || 0,
        slow: w.slow || 0, slowDuration: w.slowDuration || 0,
    });
}

function updateEnemies() {
    for (let i = G.enemies.length - 1; i >= 0; i--) {
        const e = G.enemies[i];
        e.frame += 0.15;
        if (e.hitFlash > 0) e.hitFlash--;
        if (e.slowTimer > 0) e.slowTimer--; else e.slowFactor = 1;
        const blocker = findBlocker(e);
        if (blocker) {
            if (--e.atkCd <= 0) {
                blocker.hp -= e.def.atk; e.atkCd = 45; blocker.hitFlash = 8;
                spawnParticles(blocker.x, blocker.y - cellSize * 0.2, '#ef4444', 4);
                if (blocker.hp <= 0) { spawnParticles(blocker.x, blocker.y, DEF_WEAPONS[blocker.id].color, 16); delete G.units[blocker.key]; }
            }
        } else {
            e.y += e.speed * e.slowFactor;
        }
        if (e.y > baseLineY) {
            G.enemies.splice(i, 1);
            G.lives -= e.def.isBoss ? 5 : 1;
            G.flash = 0.6; G.shake = 10; updateHud();
        }
    }
}
function findBlocker(e) {
    let best = null, bestY = Infinity;
    for (const key in G.units) {
        const u = G.units[key];
        if (u.col !== e.col) continue;
        const contact = e.y + e.size * 0.4 >= u.y - cellSize * 0.4 && u.y > e.y - cellSize * 0.5;
        if (contact && u.y < bestY) { best = u; bestY = u.y; }
    }
    return best;
}

function updateProjectiles() {
    for (let i = G.projectiles.length - 1; i >= 0; i--) {
        const p = G.projectiles[i];
        p.y += p.vy;
        if (p.y < -20) { G.projectiles.splice(i, 1); continue; }
        let hit = null;
        for (const e of G.enemies) {
            if (e.col === p.col && Math.abs(e.y - p.y) < e.size * 0.45 && Math.abs(e.x - p.x) < e.size * 0.6) { hit = e; break; }
        }
        if (hit) { applyHit(p, hit); G.projectiles.splice(i, 1); }
    }
}
function applyHit(p, enemy) {
    if (p.splash > 0) {
        spawnExplosion(p.x, p.y, p.splash, p.color);
        for (const e of G.enemies) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < p.splash) damageEnemy(e, p.dmg * (e === enemy ? 1 : 0.7)); }
        G.shake = Math.max(G.shake, 5);
    } else { damageEnemy(enemy, p.dmg); spawnParticles(p.x, p.y, p.color, 5); }
    if (p.slow > 0) { enemy.slowFactor = 1 - p.slow; enemy.slowTimer = p.slowDuration; }
}
function damageEnemy(e, dmg) {
    e.hp -= dmg; e.hitFlash = 5;
    if (e.hp <= 0 && !e._dead) {
        e._dead = true;
        const idx = G.enemies.indexOf(e); if (idx >= 0) G.enemies.splice(idx, 1);
        G.killed++;
        spawnParticles(e.x, e.y, '#fbbf24', e.def.isBoss ? 30 : 10);
        updateHud();
    }
}

// ---------- 粒子 ----------
function spawnParticles(x, y, color, n) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
        G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 20 + Math.random() * 15, color, size: 2 + Math.random() * 3 });
    }
}
function spawnExplosion(x, y, r, color) { G.particles.push({ x, y, vx: 0, vy: 0, life: 18, color, size: r, ring: true }); spawnParticles(x, y, color, 20); }
function updateParticles() {
    for (let i = G.particles.length - 1; i >= 0; i--) {
        const p = G.particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        if (p.life <= 0) G.particles.splice(i, 1);
    }
    for (let i = G.floats.length - 1; i >= 0; i--) { const f = G.floats[i]; f.y += f.vy; f.life--; if (f.life <= 0) G.floats.splice(i, 1); }
}

function updateHud() {
    document.getElementById('hudLevel').textContent = G.level;
    document.getElementById('hudKill').textContent = G.killed;
    document.getElementById('hudTotal').textContent = G.total;
    document.getElementById('livesFill').style.width = Math.max(0, G.lives / G.maxLives * 100) + '%';
}

// ============================================================
//  渲染
// ============================================================
function render() {
    ctx.save();
    if (G.shake > 0.5) ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
    drawBackground(); drawGrid(); drawUnits(); drawEnemies(); drawProjectiles(); drawParticles(); drawFloats();
    ctx.restore();
    if (G.flash > 0) { ctx.fillStyle = `rgba(239,68,68,${G.flash * 0.4})`; ctx.fillRect(0, 0, W, H); }
}

function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1040'); g.addColorStop(0.45, '#13213f'); g.addColorStop(0.75, '#163a36'); g.addColorStop(1, '#1f3d22');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 97.3) % W, (i * 53.7) % (H * 0.5), 2, 2);
    ctx.strokeStyle = 'rgba(148,163,184,0.08)'; ctx.lineWidth = 1;
    for (let c = 1; c < DEF_COLS; c++) { ctx.beginPath(); ctx.moveTo(c * laneW, 0); ctx.lineTo(c * laneW, gridBottom); ctx.stroke(); }
    const bg = ctx.createLinearGradient(0, baseLineY - 14, 0, baseLineY);
    bg.addColorStop(0, 'rgba(34,197,94,0)'); bg.addColorStop(1, 'rgba(34,197,94,0.35)');
    ctx.fillStyle = bg; ctx.fillRect(0, baseLineY - 14, W, 14);
    ctx.strokeStyle = 'rgba(132,204,22,0.6)'; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(0, baseLineY); ctx.lineTo(W, baseLineY); ctx.stroke(); ctx.setLineDash([]);
}

function drawGrid() {
    const showValid = !!G.selected;
    for (let c = 0; c < DEF_COLS; c++) for (let r = 0; r < DEF_PLACE_ROWS; r++) {
        const cx = (c + 0.5) * laneW, cy = rowsY[r], s = cellSize * 0.92, empty = !G.units[`${c}_${r}`];
        ctx.lineWidth = 1.5;
        if (showValid && empty) {
            ctx.strokeStyle = 'rgba(132,204,22,0.7)'; ctx.fillStyle = 'rgba(132,204,22,0.1)';
            roundRectPath(ctx, cx - s / 2, cy - s / 2, s, s, 10); ctx.fill(); ctx.stroke();
        } else { ctx.strokeStyle = 'rgba(148,163,184,0.14)'; roundRectPath(ctx, cx - s / 2, cy - s / 2, s, s, 10); ctx.stroke(); }
    }
}

function drawUnits() {
    for (const key in G.units) {
        const u = G.units[key], w = DEF_WEAPONS[u.id];
        ctx.save();
        const grad = ctx.createRadialGradient(u.x, u.y, 2, u.x, u.y, cellSize * 0.5);
        grad.addColorStop(0, w.color + '55'); grad.addColorStop(1, w.color + '00');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(u.x, u.y, cellSize * 0.48, 0, 7); ctx.fill();
        ctx.restore();

        // 受击轻微抖动
        const jit = u.hitFlash > 0 ? (Math.random() - 0.5) * 3 : 0;
        drawTurret(ctx, u.render, u.x + jit, u.y, cellSize * 0.92, { frame: u.frame, attacking: u.attacking });

        // 受击红光闪烁
        if (u.hitFlash > 0) {
            ctx.save();
            ctx.globalAlpha = u.hitFlash / 8 * 0.5;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(u.x, u.y, cellSize * 0.46, 0, 7); ctx.fill();
            ctx.restore();
        }

        // 血环：受伤后套在武器中心
        if (u.hp < u.maxHp) drawHpRing(u.x, u.y, cellSize * 0.5, u.hp / u.maxHp);
    }
}

// 环形血条（套在单位中心，绿→黄→红，从顶端顺时针）
function drawHpRing(cx, cy, radius, ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    const lw = Math.max(3, radius * 0.16);
    // 底环
    ctx.lineWidth = lw;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    // 血量弧
    let color = '#22c55e';
    if (ratio < 0.3) color = '#ef4444'; else if (ratio < 0.6) color = '#f59e0b';
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    const start = -Math.PI / 2;
    ctx.beginPath(); ctx.arc(cx, cy, radius, start, start + Math.PI * 2 * ratio); ctx.stroke();
    ctx.lineCap = 'butt';
}

function drawEnemies() {
    for (const e of G.enemies) {
        if (e.def.render === 'lizard') {
            const frames = e.def.tint ? (ASSETS.tinted[e.type] || ASSETS.lizardWalk) : ASSETS.lizardWalk;
            if (frames && frames.length) {
                const img = frames[Math.floor(e.frame) % frames.length];
                ctx.save();
                if (e.hitFlash > 0) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; }
                drawSprite(img, e.x, e.y, e.size);
                ctx.restore();
            }
        } else {
            drawEnemyArt(ctx, e.def.render, e.x, e.y, e.size, e.frame, e.hitFlash);
        }
        drawBar(e.x, e.y - e.size * 0.58, e.size * 0.7, e.hp / e.maxHp, e.def.isBoss ? '#f59e0b' : '#ef4444');
        if (e.def.isBoss) drawCrown(e.x, e.y - e.size * 0.72, e.size * 0.26);
    }
}
function drawCrown(x, y, s) {
    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - s, y + s * 0.5); ctx.lineTo(x - s, y - s * 0.4); ctx.lineTo(x - s * 0.4, y + s * 0.1);
    ctx.lineTo(x, y - s * 0.5); ctx.lineTo(x + s * 0.4, y + s * 0.1); ctx.lineTo(x + s, y - s * 0.4);
    ctx.lineTo(x + s, y + s * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
}

function drawSprite(img, cx, cy, targetH) {
    if (!img) return;
    const ratio = img.width / img.height, h = targetH, w = h * ratio;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}
function drawBar(cx, y, w, ratio, color) {
    ratio = Math.max(0, Math.min(1, ratio));
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRectPath(ctx, cx - w / 2, y, w, 5, 2.5); ctx.fill();
    ctx.fillStyle = color; roundRectPath(ctx, cx - w / 2, y, w * ratio, 5, 2.5); ctx.fill();
}
function drawProjectiles() {
    for (const p of G.projectiles) {
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.splash > 0 ? 8 : 5, 0, 7); ctx.fill(); ctx.restore();
    }
}
function drawParticles() {
    for (const p of G.particles) {
        if (p.ring) {
            const prog = 1 - p.life / 18;
            ctx.strokeStyle = p.color; ctx.globalAlpha = p.life / 18; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * prog, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = Math.max(0, p.life / 30); ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); ctx.globalAlpha = 1;
        }
    }
}
function drawFloats() {
    ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    for (const f of G.floats) { ctx.globalAlpha = Math.max(0, f.life / 45); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y); }
    ctx.globalAlpha = 1;
}

// ============================================================
//  循环 / 结算
// ============================================================
function loop() { if (!G || !G.running) return; update(); render(); rafId = requestAnimationFrame(loop); }

function endBattle(win) {
    if (G.ended) return;
    G.ended = true; G.running = false;
    cancelAnimationFrame(rafId);
    setTimeout(() => showResult(win), 500);
}
function showResult(win) {
    const data = getDefData();
    let reward = 0;
    if (win) {
        reward = G.cfg.reward;
        if (G.level >= data.highestLevel) { data.highestLevel = G.level + 1; reward += Math.round(G.cfg.reward * 0.5); }
        data.points += reward;
        data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: `通关第${G.level}关`, pts: reward });
        if (data.history.length > 60) data.history.length = 60;
        saveDefData(data);
    }
    document.getElementById('resultIcon').textContent = win ? '🏆' : '💔';
    document.getElementById('resultTitle').textContent = win ? '守卫成功！' : '家园失守…';
    document.getElementById('resultStats').innerHTML = `
        <div class="rs-item"><div class="rs-val">${G.killed}</div><div class="rs-label">击败敌人</div></div>
        <div class="rs-item"><div class="rs-val">${G.lives}</div><div class="rs-label">剩余生命</div></div>`;
    document.getElementById('resultReward').textContent = win ? `获得 ${reward} 积分` : '再接再厉，换个布阵试试！';
    const nextBtn = document.getElementById('resultNextBtn');
    if (win) { nextBtn.style.display = ''; nextBtn.textContent = '下一关 →'; nextBtn.onclick = () => { selectedLevel = G.level + 1; enterBattle(); }; }
    else { nextBtn.style.display = ''; nextBtn.textContent = '再试一次'; nextBtn.onclick = () => enterBattle(); }
    showScreen('resultScreen');
}
function nextLevel() { selectedLevel = G.level + 1; enterBattle(); }
function quitBattle() { if (G) { G.running = false; cancelAnimationFrame(rafId); } backToMenu(); }

// ============================================================
//  启动
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    initMenu();
    loadAssets().then(() => { if (document.getElementById('menuScreen').classList.contains('active')) renderShop(); });
    document.getElementById('gameCanvas').addEventListener('pointerdown', onCanvasPointer);
});
window.addEventListener('resize', () => {
    if (document.getElementById('battleScreen').classList.contains('active') && G) {
        setupCanvas();
        for (const key in G.units) { const u = G.units[key]; u.x = (u.col + 0.5) * laneW; u.y = rowsY[u.row]; }
    }
});
