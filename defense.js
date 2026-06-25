// ============================================================
// 御灵守卫战 - 游戏逻辑
// 3 通道 × 每道 2×6 网格；积分买武器；多种武器与敌人
// ============================================================

// ---------- 资源 ----------
const ASSETS = { lizardWalk: [], dragonIdle: [], dragonAttack: [], warriorWalk: null, warriorAttack: null };
let assetsReady = false;

function loadImg(src) {
    return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
async function loadAssets() {
    const lw = [], di = [], da = [];
    for (let i = 1; i <= 6; i++) lw.push(loadImg(`assets/enemies/lizard/Walk${i}.png`));
    for (let i = 1; i <= 4; i++) di.push(loadImg(`assets/items/spirit_小龙_${i}.png`));
    for (let i = 1; i <= 9; i++) da.push(loadImg(`assets/items/spirit_小龙_attack_${i}.png`));
    const wpath = 'warrior-sprites/craftpix-net-589520-free-warrior-pixel-art-sprite-sheets/Warrior_1/';
    const [lizard, dragonI, dragonA, wWalk, wAtk] = await Promise.all([
        Promise.all(lw), Promise.all(di), Promise.all(da),
        loadImg(wpath + 'Walk.png'), loadImg(wpath + 'Attack_1.png'),
    ]);
    ASSETS.lizardWalk = lizard.filter(Boolean);
    ASSETS.dragonIdle = dragonI.filter(Boolean);
    ASSETS.dragonAttack = dragonA.filter(Boolean);
    if (wWalk) ASSETS.warriorWalk = { img: wWalk, frames: 8 };
    if (wAtk) ASSETS.warriorAttack = { img: wAtk, frames: 6 };
    assetsReady = true;
}

function roundRectPath(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

// ============================================================
//  炮台手绘
// ============================================================
function drawTurret(c, type, x, y, size, opts = {}) {
    const s = size, atk = opts.attacking > 0;
    c.save(); c.translate(x, y);
    switch (type) {
        case 'dragon': drawDragon(c, s, opts); break;
        case 'crossbow': drawCrossbow(c, s, atk); break;
        case 'ice': drawIce(c, s, opts.frame || 0, '#7dd3fc', '#0284c7'); break;
        case 'hail': drawHail(c, s, opts.frame || 0); break;
        case 'cannon': drawCannon(c, s, atk); break;
        case 'wall': drawWall(c, s, false); break;
        case 'steelwall': drawWall(c, s, true); break;
        case 'laser': drawLaserTurret(c, s, atk); break;
        case 'lightning': drawLightning(c, s, opts.frame || 0, atk); break;
        case 'bouncer': drawBouncer(c, s, atk); break;
        case 'splitter': drawSplitter(c, s, atk); break;
        case 'barracks': drawBarracks(c, s); break;
        case 'tripeater': drawTripeater(c, s, atk); break;
        case 'starfruit': drawStarfruit(c, s, atk); break;
        case 'spike': drawSpike(c, s); break;
        case 'mine': drawMine(c, s, opts.frame || 0); break;
        case 'cherry': drawCherry(c, s); break;
        case 'chomper': drawChomper(c, s, atk); break;
        case 'jalapeno': drawJalapeno(c, s); break;
        case 'gatling': drawGatling(c, s, atk); break;
        case 'poison': drawPoison(c, s, atk); break;
        case 'boomerang': drawBoomerangTurret(c, s, atk); break;
        case 'wind': drawWind(c, s, opts.frame || 0); break;
        case 'taichi': drawTaichi(c, s, opts.frame || 0); break;
        case 'fissure': drawFissure(c, s, opts); break;
        case 'doublegun': drawDoubleGun(c, s, atk); break;
        case 'flamer': drawFlamer(c, s, atk); break;
    }
    c.restore();
}

function drawBase(c, s, c1, c2) {
    const g = c.createLinearGradient(0, s * 0.1, 0, s * 0.42);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    c.fillStyle = g; roundRectPath(c, -s * 0.34, s * 0.08, s * 0.68, s * 0.34, s * 0.1); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.18)'; roundRectPath(c, -s * 0.34, s * 0.32, s * 0.68, s * 0.1, s * 0.05); c.fill();
}

function drawWall(c, s, steel) {
    const brick = (bx, by, bw, bh) => {
        const g = c.createLinearGradient(0, by, 0, by + bh);
        if (steel) { g.addColorStop(0, '#cbd5e1'); g.addColorStop(0.5, '#94a3b8'); g.addColorStop(1, '#475569'); }
        else { g.addColorStop(0, '#cbd5e1'); g.addColorStop(1, '#64748b'); }
        c.fillStyle = g; roundRectPath(c, bx, by, bw, bh, 3); c.fill();
        c.strokeStyle = 'rgba(15,23,42,0.55)'; c.lineWidth = 2; c.stroke();
        if (steel) { // 铆钉
            c.fillStyle = '#1e293b';
            c.beginPath(); c.arc(bx + 5, by + 5, 1.8, 0, 7); c.arc(bx + bw - 5, by + 5, 1.8, 0, 7);
            c.arc(bx + 5, by + bh - 5, 1.8, 0, 7); c.arc(bx + bw - 5, by + bh - 5, 1.8, 0, 7); c.fill();
        }
    };
    const w = s * 0.76, h = s * 0.22, x0 = -w / 2, y0 = -s * 0.34;
    for (let row = 0; row < 3; row++) {
        const off = row % 2 ? w * 0.18 : 0;
        brick(x0 - off, y0 + row * (h + 3), w * 0.46, h);
        brick(x0 + w * 0.5 - off, y0 + row * (h + 3), w * 0.46, h);
    }
}

function drawCannon(c, s, atk) {
    drawBase(c, s, '#475569', '#1e293b');
    c.fillStyle = '#0f172a';
    c.beginPath(); c.arc(-s * 0.22, s * 0.28, s * 0.1, 0, 7); c.arc(s * 0.22, s * 0.28, s * 0.1, 0, 7); c.fill();
    const recoil = atk ? s * 0.06 : 0;
    const g = c.createLinearGradient(-s * 0.12, 0, s * 0.12, 0);
    g.addColorStop(0, '#334155'); g.addColorStop(0.5, '#94a3b8'); g.addColorStop(1, '#334155');
    c.fillStyle = g; roundRectPath(c, -s * 0.13, -s * 0.4 + recoil, s * 0.26, s * 0.5, s * 0.06); c.fill();
    c.fillStyle = atk ? '#fdba74' : '#0f172a';
    c.beginPath(); c.ellipse(0, -s * 0.4 + recoil, s * 0.13, s * 0.05, 0, 0, 7); c.fill();
    if (atk) { c.fillStyle = '#fb923c'; c.beginPath(); c.arc(0, -s * 0.46 + recoil, s * 0.1, 0, 7); c.fill(); }
}

function drawCrossbow(c, s, atk) {
    drawBase(c, s, '#92400e', '#451a03');
    c.fillStyle = '#7c2d12'; roundRectPath(c, -s * 0.05, -s * 0.32, s * 0.1, s * 0.42, s * 0.03); c.fill();
    c.strokeStyle = '#a16207'; c.lineWidth = s * 0.07; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-s * 0.3, -s * 0.22); c.quadraticCurveTo(0, -s * 0.4, s * 0.3, -s * 0.22); c.stroke();
    c.strokeStyle = '#e5e7eb'; c.lineWidth = 1.5;
    const pull = atk ? -s * 0.05 : -s * 0.18;
    c.beginPath(); c.moveTo(-s * 0.3, -s * 0.22); c.lineTo(0, pull); c.lineTo(s * 0.3, -s * 0.22); c.stroke();
    c.strokeStyle = '#cbd5e1'; c.lineWidth = s * 0.04;
    c.beginPath(); c.moveTo(0, pull); c.lineTo(0, -s * 0.42); c.stroke();
    c.fillStyle = '#f8fafc'; c.beginPath(); c.moveTo(0, -s * 0.48); c.lineTo(-s * 0.05, -s * 0.4); c.lineTo(s * 0.05, -s * 0.4); c.fill();
    c.lineCap = 'butt';
}

function drawIce(c, s, frame, c1, c2) {
    drawBase(c, s, '#0e7490', '#083344');
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.15);
    c.save(); c.globalAlpha = 0.4 + pulse * 0.3;
    const gl = c.createRadialGradient(0, -s * 0.15, 2, 0, -s * 0.15, s * 0.35);
    gl.addColorStop(0, '#bae6fd'); gl.addColorStop(1, 'rgba(56,189,248,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(0, -s * 0.15, s * 0.35, 0, 7); c.fill(); c.restore();
    const cg = c.createLinearGradient(0, -s * 0.42, 0, s * 0.05);
    cg.addColorStop(0, '#f0f9ff'); cg.addColorStop(0.5, c1); cg.addColorStop(1, c2);
    c.fillStyle = cg;
    c.beginPath(); c.moveTo(0, -s * 0.44); c.lineTo(s * 0.15, -s * 0.12); c.lineTo(0, s * 0.06); c.lineTo(-s * 0.15, -s * 0.12); c.closePath(); c.fill();
    c.strokeStyle = '#e0f2fe'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = c1;
    c.beginPath(); c.moveTo(-s * 0.22, -s * 0.05); c.lineTo(-s * 0.14, -s * 0.2); c.lineTo(-s * 0.1, 0); c.fill();
    c.beginPath(); c.moveTo(s * 0.22, -s * 0.05); c.lineTo(s * 0.14, -s * 0.2); c.lineTo(s * 0.1, 0); c.fill();
}

function drawHail(c, s, frame) {
    drawBase(c, s, '#0369a1', '#082f49');
    // 寒气云
    c.fillStyle = 'rgba(224,242,254,0.85)';
    c.beginPath();
    c.arc(-s * 0.12, -s * 0.18, s * 0.13, 0, 7); c.arc(s * 0.12, -s * 0.18, s * 0.13, 0, 7);
    c.arc(0, -s * 0.26, s * 0.15, 0, 7); c.fill();
    // 冰雹颗粒
    c.fillStyle = '#bae6fd';
    const t = frame * 0.1;
    for (let i = 0; i < 4; i++) {
        const px = (-s * 0.18 + i * s * 0.12), py = -s * 0.05 + ((t * s * 0.3 + i * 7) % (s * 0.2));
        c.beginPath(); c.arc(px, py, s * 0.035, 0, 7); c.fill();
    }
}

function drawLaserTurret(c, s, atk) {
    drawBase(c, s, '#450a0a', '#1c1917');
    // 三脚架
    c.strokeStyle = '#64748b'; c.lineWidth = s * 0.04; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-s * 0.16, s * 0.2); c.lineTo(0, -s * 0.08); c.lineTo(s * 0.16, s * 0.2); c.stroke();
    // 聚焦晶体
    const glow = atk ? 1 : 0.5;
    const g = c.createRadialGradient(0, -s * 0.28, 1, 0, -s * 0.28, s * 0.15 * (atk ? 1.2 : 1));
    g.addColorStop(0, '#fff'); g.addColorStop(0.3, '#fca5a5'); g.addColorStop(1, '#dc2626');
    c.fillStyle = g; c.shadowColor = `rgba(239,68,68,${glow})`; c.shadowBlur = 12;
    c.beginPath(); c.arc(0, -s * 0.28, s * 0.13, 0, 7); c.fill(); c.shadowBlur = 0;
    // 晶体高光
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(-s * 0.04, -s * 0.33, s * 0.04, 0, 7); c.fill();
    // 光环
    c.strokeStyle = `rgba(248,113,113, ${0.2 + (atk ? 0.3 : 0)})`; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -s * 0.28, s * 0.18, 0, 7); c.stroke();
    c.lineCap = 'butt';
}

function drawLightning(c, s, frame, atk) {
    drawBase(c, s, '#4c1d95', '#2e1065');
    // 线圈柱
    c.fillStyle = '#6d28d9'; roundRectPath(c, -s * 0.06, -s * 0.2, s * 0.12, s * 0.3, s * 0.03); c.fill();
    c.strokeStyle = '#a78bfa'; c.lineWidth = 2;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, -s * 0.08 - i * s * 0.05, s * 0.1, s * 0.03, 0, 0, 7); c.stroke(); }
    // 顶端电球
    const r = s * 0.13 * (atk ? 1.15 : 1);
    const g = c.createRadialGradient(0, -s * 0.3, 1, 0, -s * 0.3, r);
    g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#c4b5fd'); g.addColorStop(1, '#7c3aed');
    c.fillStyle = g; c.beginPath(); c.arc(0, -s * 0.3, r, 0, 7); c.fill();
    // 电弧
    c.strokeStyle = '#e9d5ff'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
        const a = frame * 0.3 + i * 2.1;
        c.beginPath(); c.moveTo(0, -s * 0.3);
        c.lineTo(Math.cos(a) * s * 0.2, -s * 0.3 + Math.sin(a) * s * 0.18);
        c.stroke();
    }
}

function drawBouncer(c, s, atk) {
    drawBase(c, s, '#0e7490', '#155e75');
    // 弹簧
    c.strokeStyle = '#94a3b8'; c.lineWidth = s * 0.04;
    c.beginPath();
    for (let i = 0; i <= 3; i++) { const yy = s * 0.05 - i * s * 0.06; c.lineTo(i % 2 ? s * 0.1 : -s * 0.1, yy); }
    c.stroke();
    // 弹球
    const g = c.createRadialGradient(-s * 0.04, -s * 0.32, 1, 0, -s * 0.28, s * 0.16);
    g.addColorStop(0, '#cffafe'); g.addColorStop(1, '#0891b2');
    c.fillStyle = g; c.beginPath(); c.arc(0, -s * 0.28, s * 0.15, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(-s * 0.05, -s * 0.33, s * 0.04, 0, 7); c.fill();
}

function drawSplitter(c, s, atk) {
    drawBase(c, s, '#9d174d', '#500724');
    // 棱镜
    const g = c.createLinearGradient(0, -s * 0.42, 0, s * 0.05);
    g.addColorStop(0, '#fbcfe8'); g.addColorStop(1, '#db2777');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(0, -s * 0.42); c.lineTo(s * 0.18, -s * 0.05); c.lineTo(-s * 0.18, -s * 0.05); c.closePath(); c.fill();
    c.strokeStyle = '#fce7f3'; c.lineWidth = 1.5; c.stroke();
    // 分裂指示三叉
    c.strokeStyle = '#f9a8d4'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, -s * 0.2); c.lineTo(0, -s * 0.34);
    c.moveTo(0, -s * 0.28); c.lineTo(-s * 0.1, -s * 0.4); c.moveTo(0, -s * 0.28); c.lineTo(s * 0.1, -s * 0.4); c.stroke();
}

function drawBarracks(c, s) {
    // 帐篷
    const g = c.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
    g.addColorStop(0, '#a16207'); g.addColorStop(1, '#713f12');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(0, -s * 0.4); c.lineTo(s * 0.38, s * 0.28); c.lineTo(-s * 0.38, s * 0.28); c.closePath(); c.fill();
    c.strokeStyle = '#422006'; c.lineWidth = 2; c.stroke();
    // 门
    c.fillStyle = '#1c1917';
    c.beginPath(); c.moveTo(0, -s * 0.05); c.lineTo(s * 0.12, s * 0.28); c.lineTo(-s * 0.12, s * 0.28); c.closePath(); c.fill();
    // 旗杆 + 旗
    c.strokeStyle = '#78716c'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, -s * 0.4); c.lineTo(0, -s * 0.52); c.stroke();
    c.fillStyle = '#dc2626';
    c.beginPath(); c.moveTo(0, -s * 0.52); c.lineTo(s * 0.16, -s * 0.47); c.lineTo(0, -s * 0.42); c.fill();
}

function drawDragon(c, s, opts) {
    const frames = opts.attacking > 0 && ASSETS.dragonAttack.length ? ASSETS.dragonAttack : ASSETS.dragonIdle;
    const img = (frames && frames.length) ? frames[Math.floor(opts.frame || 0) % frames.length] : null;
    if (img && img.width) {
        const ratio = img.width / img.height, h = s, w = h * ratio;
        c.imageSmoothingEnabled = false; c.drawImage(img, -w / 2, -h / 2, w, h);
    } else { c.fillStyle = '#34d399'; c.beginPath(); c.arc(0, 0, s * 0.3, 0, 7); c.fill(); }
}

function drawTripeater(c, s, atk) {
    drawBase(c, s, '#15803d', '#052e16');
    const recoil = atk ? s * 0.04 : 0;
    // 三根炮管：左斜、上、右斜
    [-0.5, 0, 0.5].forEach(dir => {
        c.save(); c.rotate(dir * 0.5);
        const g = c.createLinearGradient(-s * 0.06, 0, s * 0.06, 0);
        g.addColorStop(0, '#166534'); g.addColorStop(0.5, '#4ade80'); g.addColorStop(1, '#166534');
        c.fillStyle = g; roundRectPath(c, -s * 0.07, -s * 0.4 + recoil, s * 0.14, s * 0.42, s * 0.05); c.fill();
        c.fillStyle = atk ? '#bbf7d0' : '#052e16'; c.beginPath(); c.arc(0, -s * 0.4 + recoil, s * 0.07, 0, 7); c.fill();
        c.restore();
    });
}

function drawStarfruit(c, s, atk) {
    drawBase(c, s, '#a16207', '#422006');
    const r = s * 0.3 * (atk ? 1.1 : 1);
    const g = c.createRadialGradient(0, -s * 0.12, 2, 0, -s * 0.12, r);
    g.addColorStop(0, '#fef9c3'); g.addColorStop(1, '#eab308');
    c.fillStyle = g; c.strokeStyle = '#a16207'; c.lineWidth = 1.5;
    c.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        const a2 = a + Math.PI / 5;
        c.lineTo(Math.cos(a) * r, -s * 0.12 + Math.sin(a) * r);
        c.lineTo(Math.cos(a2) * r * 0.45, -s * 0.12 + Math.sin(a2) * r * 0.45);
    }
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(-s * 0.05, -s * 0.12, s * 0.03, 0, 7); c.arc(s * 0.05, -s * 0.12, s * 0.03, 0, 7); c.fill();
}

function drawSpike(c, s) {
    // 平铺地面的尖刺
    c.fillStyle = '#78350f'; roundRectPath(c, -s * 0.4, s * 0.18, s * 0.8, s * 0.18, s * 0.05); c.fill();
    c.fillStyle = '#cbd5e1'; c.strokeStyle = '#475569'; c.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
        const x = i * s * 0.16;
        c.beginPath(); c.moveTo(x - s * 0.06, s * 0.18); c.lineTo(x, -s * 0.18); c.lineTo(x + s * 0.06, s * 0.18); c.closePath(); c.fill(); c.stroke();
    }
}

function drawMine(c, s, frame) {
    // 金属半球地雷
    const g = c.createLinearGradient(0, -s * 0.1, 0, s * 0.3);
    g.addColorStop(0, '#94a3b8'); g.addColorStop(1, '#334155');
    c.fillStyle = g; c.beginPath(); c.arc(0, s * 0.12, s * 0.3, Math.PI, 0); c.fill();
    c.fillStyle = '#1e293b'; roundRectPath(c, -s * 0.34, s * 0.1, s * 0.68, s * 0.08, 3); c.fill();
    // 顶灯（闪烁）
    const blink = 0.5 + 0.5 * Math.sin(frame * 0.3);
    c.fillStyle = `rgba(248,113,113,${0.4 + blink * 0.6})`;
    c.beginPath(); c.arc(0, -s * 0.05, s * 0.07, 0, 7); c.fill();
    c.strokeStyle = '#64748b'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -s * 0.1); c.lineTo(0, -s * 0.24); c.stroke();
}

function drawCherry(c, s) {
    c.strokeStyle = '#4d7c0f'; c.lineWidth = s * 0.04; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-s * 0.14, s * 0.06); c.quadraticCurveTo(0, -s * 0.34, s * 0.06, -s * 0.36); c.stroke();
    c.beginPath(); c.moveTo(s * 0.14, s * 0.06); c.quadraticCurveTo(s * 0.05, -s * 0.3, s * 0.06, -s * 0.36); c.stroke();
    // 叶子
    c.fillStyle = '#65a30d'; c.beginPath(); c.ellipse(s * 0.14, -s * 0.34, s * 0.1, s * 0.05, -0.5, 0, 7); c.fill();
    // 两颗樱桃
    [-0.16, 0.16].forEach(dx => {
        const g = c.createRadialGradient(dx - s * 0.04, s * 0.1, 1, dx, s * 0.16, s * 0.2);
        g.addColorStop(0, '#fca5a5'); g.addColorStop(1, '#b91c1c'); c.fillStyle = g;
        c.beginPath(); c.arc(dx, s * 0.16, s * 0.18, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(dx - s * 0.06, s * 0.1, s * 0.04, 0, 7); c.fill();
    });
    c.lineCap = 'butt';
}

function drawChomper(c, s, atk) {
    drawBase(c, s, '#6b21a8', '#3b0764');
    // 茎
    c.strokeStyle = '#7e22ce'; c.lineWidth = s * 0.08; c.beginPath(); c.moveTo(0, s * 0.1); c.lineTo(0, -s * 0.1); c.stroke();
    // 头（张嘴/闭嘴）
    const open = atk ? s * 0.16 : s * 0.06;
    const g = c.createRadialGradient(0, -s * 0.18, 2, 0, -s * 0.18, s * 0.3);
    g.addColorStop(0, '#c084fc'); g.addColorStop(1, '#7c3aed'); c.fillStyle = g;
    // 上颚
    c.beginPath(); c.ellipse(0, -s * 0.22 - open, s * 0.26, s * 0.18, 0, Math.PI, 0); c.fill();
    // 下颚
    c.beginPath(); c.ellipse(0, -s * 0.14 + open, s * 0.26, s * 0.16, 0, 0, Math.PI); c.fill();
    // 嘴内
    c.fillStyle = '#4c1d95'; c.beginPath(); c.ellipse(0, -s * 0.18, s * 0.18, open, 0, 0, 7); c.fill();
    // 牙
    c.fillStyle = '#fff';
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * s * 0.12 - s * 0.03, -s * 0.22 - open + s * 0.14); c.lineTo(i * s * 0.12, -s * 0.18); c.lineTo(i * s * 0.12 + s * 0.03, -s * 0.22 - open + s * 0.14); c.fill(); }
}

function drawJalapeno(c, s) {
    drawBase(c, s, '#7f1d1d', '#450a0a');
    // 辣椒身
    const g = c.createLinearGradient(-s * 0.1, -s * 0.3, s * 0.1, s * 0.1);
    g.addColorStop(0, '#f87171'); g.addColorStop(1, '#b91c1c'); c.fillStyle = g;
    c.beginPath(); c.moveTo(0, -s * 0.34);
    c.quadraticCurveTo(s * 0.22, -s * 0.2, s * 0.14, s * 0.1);
    c.quadraticCurveTo(0, s * 0.2, -s * 0.14, s * 0.1);
    c.quadraticCurveTo(-s * 0.22, -s * 0.2, 0, -s * 0.34); c.fill();
    // 高光
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(-s * 0.04, -s * 0.05, s * 0.03, s * 0.12, 0.2, 0, 7); c.fill();
    // 蒂
    c.strokeStyle = '#15803d'; c.lineWidth = s * 0.05; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -s * 0.34); c.lineTo(s * 0.04, -s * 0.46); c.stroke(); c.lineCap = 'butt';
}

function drawGatling(c, s, atk) {
    drawBase(c, s, '#475569', '#1e293b');
    // 多管机枪：3根炮管呈扇形
    const recoil = atk ? s * 0.04 : 0;
    [-0.25, 0, 0.25].forEach(dir => {
        c.save(); c.rotate(dir * 0.35);
        const g = c.createLinearGradient(-s * 0.04, 0, s * 0.04, 0);
        g.addColorStop(0, '#64748b'); g.addColorStop(0.5, '#cbd5e1'); g.addColorStop(1, '#64748b');
        c.fillStyle = g;
        roundRectPath(c, -s * 0.05, -s * 0.42 + recoil, s * 0.1, s * 0.44, s * 0.03); c.fill();
        c.restore();
    });
    // 枪口火焰（攻击时）
    if (atk) { c.fillStyle = '#fdba74'; c.beginPath(); c.arc(0, -s * 0.46 + recoil, s * 0.08, 0, 7); c.fill(); }
}

function drawPoison(c, s, atk) {
    drawBase(c, s, '#365314', '#1a2e05');
    // 毒气罐身
    const g = c.createLinearGradient(-s * 0.16, -s * 0.15, s * 0.16, s * 0.2);
    g.addColorStop(0, '#65a30d'); g.addColorStop(0.5, '#4d7c0f'); g.addColorStop(1, '#3f6212');
    c.fillStyle = g; roundRectPath(c, -s * 0.18, -s * 0.12, s * 0.36, s * 0.38, s * 0.06); c.fill();
    // 罐顶阀门
    c.fillStyle = '#94a3b8'; roundRectPath(c, -s * 0.06, -s * 0.28, s * 0.12, s * 0.14, s * 0.02); c.fill();
    // 骷髅标志
    c.fillStyle = '#fde68a';
    c.beginPath(); c.arc(s * 0.06, s * 0.04, s * 0.05, 0, 7); c.fill();
    c.fillStyle = '#1a2e05'; c.beginPath(); c.arc(s * 0.07, s * 0.03, s * 0.02, 0, 7); c.arc(s * 0.05, s * 0.03, s * 0.02, 0, 7); c.fill();
    // 毒气泡
    if (atk || Math.random() > 0.5) {
        c.globalAlpha = 0.4 + Math.sin((Date.now() || 0) * 0.005) * 0.3; c.fillStyle = '#84cc16';
        c.beginPath(); c.arc(-s * 0.08 + Math.sin(Date.now() * 0.002) * s * 0.02, -s * 0.32, s * 0.04, 0, 7); c.fill(); c.globalAlpha = 1;
    }
}

function drawBoomerangTurret(c, s, atk) {
    drawBase(c, s, '#92400e', '#451a03');
    // 发射架
    c.fillStyle = '#78350f'; roundRectPath(c, -s * 0.04, -s * 0.28, s * 0.08, s * 0.36, s * 0.02); c.fill();
    // 回旋镖（静态显示）
    const spinAngle = (Date.now() || 0) * 0.003;
    c.save(); c.translate(0, -s * 0.38); c.rotate(atk ? spinAngle : 0);
    const bg = c.createRadialGradient(0, 0, 1, 0, 0, s * 0.18);
    bg.addColorStop(0, '#fbbf24'); bg.addColorStop(1, '#d97706');
    c.fillStyle = bg; c.strokeStyle = '#92400e'; c.lineWidth = 1.5;
    c.beginPath();
    for (let i = 0; i < 3; i++) {
        const a = spinAngle + i * Math.PI * 2 / 3;
        const r = s * 0.18;
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath(); c.fill(); c.stroke();
    c.restore();
}

function drawWind(c, s, frame) {
    drawBase(c, s, '#164e63', '#083344');
    // 扇叶座
    c.fillStyle = '#155e75'; roundRectPath(c, -s * 0.06, -s * 0.22, s * 0.12, s * 0.24, s * 0.02); c.fill();
    // 旋转扇叶
    c.save(); c.translate(0, -s * 0.34);
    const rot = frame * 0.2;
    for (let i = 0; i < 4; i++) {
        c.save(); c.rotate(rot + i * Math.PI / 2);
        const g = c.createLinearGradient(0, 0, 0, -s * 0.18);
        g.addColorStop(0, '#cffafe'); g.addColorStop(1, '#67e8f9');
        c.fillStyle = g;
        c.beginPath(); c.ellipse(0, -s * 0.09, s * 0.04, s * 0.11, 0, 0, 7); c.fill();
        c.restore();
    }
    c.restore();
    // 风波纹
    c.save(); c.globalAlpha = 0.25 + 0.15 * Math.sin(frame * 0.2);
    c.strokeStyle = '#cffafe'; c.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
        const yy = -s * 0.08 - i * s * 0.1;
        c.beginPath(); c.moveTo(-s * 0.26, yy);
        c.quadraticCurveTo(0, yy + s * 0.04, s * 0.26, yy); c.stroke();
    }
    c.restore();
}

function drawTaichi(c, s, frame) {
    drawBase(c, s, '#1e293b', '#0f172a');
    // 太极图
    c.save(); c.translate(0, -s * 0.06);
    const r = s * 0.38, spin = frame * 0.02;
    // 外圈
    c.strokeStyle = '#e2e8f0'; c.lineWidth = 3;
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
    // 白半（带旋转）
    c.save(); c.rotate(spin);
    c.fillStyle = '#f1f5f9'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI, true); c.fill();
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI, false); c.fill();
    // 阴阳点
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(0, -r / 2, r * 0.18, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f1f5f9'; c.beginPath(); c.arc(0, r / 2, r * 0.18, 0, Math.PI * 2); c.fill();
    c.restore(); c.restore();
    // 吸力波纹
    c.save(); c.globalAlpha = 0.15 + 0.1 * Math.sin(frame * 0.15);
    c.strokeStyle = '#94a3b8'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
        const rr = s * 0.28 + i * s * 0.1, prog = ((frame * 0.05 + i * 0.33) % 1);
        c.globalAlpha = (0.25 + 0.1 * Math.sin(frame * 0.15)) * (1 - prog);
        c.beginPath(); c.arc(0, -s * 0.06, rr * (0.4 + prog * 0.6), 0, Math.PI * 2); c.stroke();
    }
    c.restore();
}

function drawFissure(c, s, opts) {
    // 地面
    c.fillStyle = '#292524'; roundRectPath(c, -s * 0.44, s * 0.14, s * 0.88, s * 0.26, s * 0.06); c.fill();
    c.fillStyle = '#44403c'; roundRectPath(c, -s * 0.44, s * 0.14, s * 0.88, s * 0.08, s * 0.04); c.fill();
    // 裂缝开合：使用真实的 open 状态
    const open = !!(opts && opts.fissureOpen);
    const fissureTimer = opts && opts.fissureTimer;
    const fissureTotal = opts && opts.fissureTotal;
    // 平滑过渡：根据计时器进度计算开合程度
    let openness;
    if (open) {
        openness = fissureTimer && fissureTotal ? (1 - (fissureTimer / fissureTotal)) * 0.85 + 0.15 : 0.9;
    } else {
        openness = fissureTimer && fissureTotal ? (fissureTimer / fissureTotal) * 0.85 + 0.15 : 0.2;
    }
    const gapW = s * 0.38 * openness;
    // 裂缝两半
    c.fillStyle = '#1c1917'; c.strokeStyle = '#0c0a09'; c.lineWidth = 1.5;
    // 左半
    c.beginPath(); c.moveTo(-s * 0.42, s * 0.16);
    c.lineTo(-s * 0.42, s * 0.32); c.lineTo(-gapW / 2, s * 0.38); c.lineTo(-s * 0.42, s * 0.38); c.closePath(); c.fill(); c.stroke();
    // 右半
    c.beginPath(); c.moveTo(s * 0.42, s * 0.16);
    c.lineTo(s * 0.42, s * 0.32); c.lineTo(gapW / 2, s * 0.38); c.lineTo(s * 0.42, s * 0.38); c.closePath(); c.fill(); c.stroke();
    // 裂缝深渊
    const alpha = open ? 0.3 + (openness - 0.15) * 0.5 : 0.05;
    c.fillStyle = `rgba(239,68,68,${alpha})`; c.beginPath(); c.ellipse(0, s * 0.3, gapW * 0.8, s * 0.04, 0, 0, 7); c.fill();
    c.fillStyle = '#0c0a09'; c.beginPath(); c.ellipse(0, s * 0.3, gapW * 0.6, s * 0.03, 0, 0, 7); c.fill();
    // 边缘碎土
    c.fillStyle = '#57534e';
    for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.arc(i * s * 0.14, s * 0.16 + Math.abs(i) * 1.5, s * 0.015, 0, 7); c.fill();
    }
    // 状态指示灯
    c.fillStyle = open ? '#ef4444' : '#22c55e';
    c.shadowColor = open ? '#fca5a5' : '#86efac'; c.shadowBlur = open ? 8 : 4;
    c.beginPath(); c.arc(0, -s * 0.38, s * 0.05, 0, 7); c.fill(); c.shadowBlur = 0;
    // 开启时裂缝发光
    if (open && openness > 0.4) {
        c.save(); c.globalAlpha = (openness - 0.4) * 1.2;
        c.strokeStyle = '#f87171'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(-gapW / 2 - 4, s * 0.28); c.lineTo(gapW / 2 + 4, s * 0.28); c.stroke();
        c.restore();
    }
}

function drawDoubleGun(c, s, atk) {
    drawBase(c, s, '#312e81', '#1e1b4b');
    const recoil = atk ? s * 0.04 : 0;
    // 上炮管
    c.fillStyle = '#4338ca'; c.strokeStyle = '#6366f1'; c.lineWidth = 1.5;
    roundRectPath(c, -s * 0.08, -s * 0.44 + recoil, s * 0.16, s * 0.42, s * 0.05); c.fill(); c.stroke();
    c.fillStyle = atk ? '#fddf68' : '#1e1b4b'; c.beginPath(); c.arc(0, -s * 0.44 + recoil, s * 0.09, 0, 7); c.fill();
    // 下炮管
    c.fillStyle = '#4338ca';
    roundRectPath(c, -s * 0.08, s * 0.04 - recoil, s * 0.16, s * 0.42, s * 0.05); c.fill(); c.stroke();
    c.fillStyle = atk ? '#fddf68' : '#1e1b4b'; c.beginPath(); c.arc(0, s * 0.46 - recoil, s * 0.09, 0, 7); c.fill();
    // 中央连接器
    c.fillStyle = '#4f46e5'; c.beginPath(); c.arc(0, 0, s * 0.14, 0, 7); c.fill();
    c.strokeStyle = '#818cf8'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s * 0.16, 0, 7); c.stroke();
}

function drawFlamer(c, s, atk) {
    drawBase(c, s, '#7c2d12', '#431407');
    // 燃料罐
    const g = c.createLinearGradient(-s * 0.2, -s * 0.1, s * 0.2, s * 0.2);
    g.addColorStop(0, '#b45309'); g.addColorStop(1, '#78350f');
    c.fillStyle = g; roundRectPath(c, -s * 0.16, -s * 0.05, s * 0.32, s * 0.36, s * 0.06); c.fill();
    // 喷嘴
    c.fillStyle = '#64748b'; roundRectPath(c, -s * 0.04, -s * 0.4, s * 0.08, s * 0.34, s * 0.02); c.fill();
    // 导火管
    c.strokeStyle = '#475569'; c.lineWidth = s * 0.025; c.beginPath();
    c.moveTo(-s * 0.08, s * 0.12); c.quadraticCurveTo(0, s * 0.22, s * 0.06, s * 0.04); c.stroke();
    // 火焰（常燃 + 攻击增强）
    const baseFlame = 0.3 + Math.sin((Date.now() || 0) * 0.01) * 0.1;
    c.save();
    for (let i = 0; i < 3; i++) {
        c.globalAlpha = baseFlame + (atk ? 0.4 : 0) - i * 0.15;
        const fl = c.createLinearGradient(0, -s * 0.4, 0, -s * 0.52 - i * s * 0.06);
        fl.addColorStop(0, '#fbbf24'); fl.addColorStop(0.5, '#f97316'); fl.addColorStop(1, 'rgba(239,68,68,0)');
        c.fillStyle = fl;
        c.beginPath();
        c.moveTo(-s * 0.06, -s * 0.38);
        c.quadraticCurveTo(-(0.08 + i * 0.02) * s, -s * 0.44 - i * s * 0.04, 0, -s * 0.52 - i * s * 0.06);
        c.quadraticCurveTo((0.08 + i * 0.02) * s, -s * 0.44 - i * s * 0.04, s * 0.06, -s * 0.38);
        c.fill();
    }
    c.restore();
    // 火花粒子
    c.fillStyle = '#fde047';
    for (let i = 0; i < 4; i++) {
        const ang = (Date.now() * 0.003 + i * 1.6) % (Math.PI * 2);
        c.globalAlpha = 0.4 + 0.3 * Math.sin(Date.now() * 0.01 + i);
        c.beginPath(); c.arc(Math.cos(ang) * s * 0.06, -s * 0.42 + Math.sin(ang) * s * 0.04, s * 0.02, 0, 7); c.fill();
        c.globalAlpha = 1;
    }
}

function makeIcon(id, px = 54) {
    const cv = document.createElement('canvas'); cv.width = px; cv.height = px;
    drawTurret(cv.getContext('2d'), DEF_WEAPONS[id].render, px / 2, px / 2 + px * 0.06, px * 0.9, { frame: 0, attacking: 0 });
    return cv;
}

// ============================================================
//  敌人手绘
// ============================================================
function drawEnemyArt(c, render, x, y, size, frame, hitFlash) {
    c.save(); c.translate(x, y);
    if (hitFlash > 0) { c.shadowColor = '#fff'; c.shadowBlur = 14; }
    switch (render) {
        case 'slime': drawSlime(c, size, frame); break;
        case 'bat': drawBat(c, size, frame); break;
        case 'golem': drawGolem(c, size, frame); break;
        case 'wraith': drawWraith(c, size, frame); break;
        case 'demon': drawDemon(c, size, frame); break;
        case 'skeleton': drawSkeleton(c, size, frame); break;
        case 'goblin': drawGoblin(c, size, frame); break;
        case 'mushroom': drawMushroom(c, size, frame); break;
        case 'eye': drawEye(c, size, frame); break;
        case 'zombie': drawZombie(c, size, frame); break;
        case 'orc': drawOrc(c, size, frame); break;
        case 'spider': drawSpider(c, size, frame); break;
        case 'ghost': drawGhost(c, size, frame); break;
        case 'snail': drawSnail(c, size, frame); break;
        case 'imp': drawImp(c, size, frame); break;
        case 'wolf': drawWolf(c, size, frame); break;
        case 'knight': drawKnight(c, size, frame); break;
        case 'crab': drawCrab(c, size, frame); break;
        case 'slimeking': drawSlimeKing(c, size, frame); break;
        case 'bee': drawBee(c, size, frame); break;
        case 'lich': drawLich(c, size, frame); break;
    }
    c.restore();
}
function eyesPair(c, ex, ey, er, look) {
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-ex, ey, er, 0, 7); c.arc(ex, ey, er, 0, 7); c.fill();
    c.fillStyle = look || '#0f172a'; c.beginPath(); c.arc(-ex, ey + er * 0.2, er * 0.55, 0, 7); c.arc(ex, ey + er * 0.2, er * 0.55, 0, 7); c.fill();
}

function drawSlime(c, s, frame) {
    const sq = 1 + Math.sin(frame * 0.25) * 0.08;
    c.save(); c.scale(sq, 2 - sq);
    const g = c.createRadialGradient(0, -s * 0.1, 2, 0, s * 0.1, s * 0.5);
    g.addColorStop(0, '#bef264'); g.addColorStop(1, '#4d7c0f'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-s * 0.42, s * 0.32); c.quadraticCurveTo(-s * 0.5, -s * 0.4, 0, -s * 0.42);
    c.quadraticCurveTo(s * 0.5, -s * 0.4, s * 0.42, s * 0.32); c.quadraticCurveTo(0, s * 0.46, -s * 0.42, s * 0.32); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(-s * 0.15, -s * 0.18, s * 0.08, s * 0.12, -0.3, 0, 7); c.fill();
    c.restore(); eyesPair(c, s * 0.16, -s * 0.02, s * 0.09);
}
function drawBat(c, s, frame) {
    const flap = Math.sin(frame * 0.5);
    c.fillStyle = '#4c1d95';
    [-1, 1].forEach(dir => {
        c.save(); c.scale(dir, 1);
        c.beginPath(); c.moveTo(s * 0.08, -s * 0.05);
        c.quadraticCurveTo(s * 0.4, -s * 0.3 - flap * s * 0.15, s * 0.52, -s * 0.02 + flap * s * 0.1);
        c.quadraticCurveTo(s * 0.42, s * 0.02, s * 0.36, s * 0.12); c.quadraticCurveTo(s * 0.3, s * 0.02, s * 0.22, s * 0.1);
        c.quadraticCurveTo(s * 0.16, s * 0.02, s * 0.08, s * 0.12); c.closePath(); c.fill(); c.restore();
    });
    const g = c.createRadialGradient(0, 0, 2, 0, 0, s * 0.22);
    g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#3b0764'); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, 0, s * 0.16, s * 0.2, 0, 0, 7); c.fill();
    c.fillStyle = '#3b0764';
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.16); c.lineTo(-s * 0.04, -s * 0.32); c.lineTo(0, -s * 0.16); c.fill();
    c.beginPath(); c.moveTo(s * 0.1, -s * 0.16); c.lineTo(s * 0.04, -s * 0.32); c.lineTo(0, -s * 0.16); c.fill();
    eyesPair(c, s * 0.07, -s * 0.02, s * 0.05, '#ef4444');
}
function drawGolem(c, s) {
    const g = c.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
    g.addColorStop(0, '#d6d3d1'); g.addColorStop(1, '#57534e'); c.fillStyle = g; c.strokeStyle = '#292524'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-s * 0.34, -s * 0.18); c.lineTo(-s * 0.1, -s * 0.42); c.lineTo(s * 0.2, -s * 0.38);
    c.lineTo(s * 0.4, -s * 0.06); c.lineTo(s * 0.32, s * 0.34); c.lineTo(-s * 0.04, s * 0.44); c.lineTo(-s * 0.38, s * 0.24); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(41,37,36,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.3); c.lineTo(0, 0); c.lineTo(-s * 0.15, s * 0.2); c.stroke();
    c.fillStyle = '#f97316'; c.beginPath(); c.arc(-s * 0.14, -s * 0.05, s * 0.07, 0, 7); c.arc(s * 0.12, -s * 0.05, s * 0.07, 0, 7); c.fill();
    c.fillStyle = '#fde68a'; c.beginPath(); c.arc(-s * 0.14, -s * 0.05, s * 0.03, 0, 7); c.arc(s * 0.12, -s * 0.05, s * 0.03, 0, 7); c.fill();
}
function drawWraith(c, s, frame) {
    c.globalAlpha = 0.85; const wave = Math.sin(frame * 0.3) * s * 0.04;
    const g = c.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
    g.addColorStop(0, '#e9d5ff'); g.addColorStop(1, '#7e22ce'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-s * 0.3, -s * 0.05); c.quadraticCurveTo(-s * 0.32, -s * 0.44, 0, -s * 0.46);
    c.quadraticCurveTo(s * 0.32, -s * 0.44, s * 0.3, -s * 0.05); c.lineTo(s * 0.3, s * 0.3);
    c.quadraticCurveTo(s * 0.15, s * 0.3 + wave, 0, s * 0.42); c.quadraticCurveTo(-s * 0.15, s * 0.3 - wave, -s * 0.3, s * 0.3); c.closePath(); c.fill();
    c.globalAlpha = 1; c.fillStyle = 'rgba(30,10,50,0.85)'; c.beginPath(); c.ellipse(0, -s * 0.12, s * 0.2, s * 0.24, 0, 0, 7); c.fill();
    c.fillStyle = '#67e8f9'; c.shadowColor = '#22d3ee'; c.shadowBlur = 8;
    c.beginPath(); c.ellipse(-s * 0.08, -s * 0.12, s * 0.04, s * 0.06, 0, 0, 7); c.ellipse(s * 0.08, -s * 0.12, s * 0.04, s * 0.06, 0, 0, 7); c.fill(); c.shadowBlur = 0;
}
function drawDemon(c, s, frame) {
    const g = c.createRadialGradient(0, 0, 4, 0, 0, s * 0.5);
    g.addColorStop(0, '#f87171'); g.addColorStop(1, '#7f1d1d'); c.fillStyle = g; c.strokeStyle = '#450a0a'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, s * 0.05, s * 0.4, s * 0.42, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#1c1917';
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * s * 0.18, -s * 0.32); c.quadraticCurveTo(d * s * 0.42, -s * 0.5, d * s * 0.34, -s * 0.16); c.quadraticCurveTo(d * s * 0.26, -s * 0.28, d * s * 0.18, -s * 0.32); c.fill(); });
    c.fillStyle = '#fde047'; c.shadowColor = '#facc15'; c.shadowBlur = 10;
    c.beginPath(); c.ellipse(-s * 0.15, -s * 0.05, s * 0.08, s * 0.05, 0.3, 0, 7); c.ellipse(s * 0.15, -s * 0.05, s * 0.08, s * 0.05, -0.3, 0, 7); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#7f1d1d'; c.beginPath(); c.arc(-s * 0.15, -s * 0.04, s * 0.03, 0, 7); c.arc(s * 0.15, -s * 0.04, s * 0.03, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-s * 0.12, s * 0.22); c.lineTo(-s * 0.06, s * 0.22); c.lineTo(-s * 0.09, s * 0.34); c.fill();
    c.beginPath(); c.moveTo(s * 0.12, s * 0.22); c.lineTo(s * 0.06, s * 0.22); c.lineTo(s * 0.09, s * 0.34); c.fill();
}
function drawSkeleton(c, s, frame) {
    // 头骨
    c.fillStyle = '#f1f5f9';
    c.beginPath(); c.arc(0, -s * 0.18, s * 0.2, 0, 7); c.fill();
    c.fillRect(-s * 0.12, -s * 0.05, s * 0.24, s * 0.1);
    // 眼窝
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(-s * 0.08, -s * 0.2, s * 0.05, 0, 7); c.arc(s * 0.08, -s * 0.2, s * 0.05, 0, 7); c.fill();
    // 牙
    c.fillStyle = '#0f172a'; for (let i = -2; i <= 2; i++) c.fillRect(i * s * 0.04 - s * 0.01, -s * 0.06, s * 0.02, s * 0.08);
    // 肋骨
    c.strokeStyle = '#e2e8f0'; c.lineWidth = s * 0.05; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, s * 0.02); c.lineTo(0, s * 0.34); c.stroke();
    c.lineWidth = s * 0.03;
    for (let i = 0; i < 3; i++) { const yy = s * 0.08 + i * s * 0.09; c.beginPath(); c.moveTo(-s * 0.13, yy); c.lineTo(s * 0.13, yy); c.stroke(); }
    c.lineCap = 'butt';
}
function drawGoblin(c, s, frame) {
    const g = c.createRadialGradient(0, 0, 2, 0, 0, s * 0.35);
    g.addColorStop(0, '#4ade80'); g.addColorStop(1, '#15803d'); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, s * 0.02, s * 0.3, s * 0.34, 0, 0, 7); c.fill();
    // 大耳朵
    c.fillStyle = '#16a34a';
    c.beginPath(); c.moveTo(-s * 0.26, -s * 0.05); c.lineTo(-s * 0.46, -s * 0.18); c.lineTo(-s * 0.24, s * 0.08); c.fill();
    c.beginPath(); c.moveTo(s * 0.26, -s * 0.05); c.lineTo(s * 0.46, -s * 0.18); c.lineTo(s * 0.24, s * 0.08); c.fill();
    // 眼 + 坏笑
    eyesPair(c, s * 0.12, -s * 0.08, s * 0.07, '#facc15');
    c.strokeStyle = '#052e16'; c.lineWidth = 2; c.beginPath(); c.arc(0, s * 0.1, s * 0.12, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-s * 0.06, s * 0.16); c.lineTo(-s * 0.02, s * 0.24); c.lineTo(-s * 0.1, s * 0.18); c.fill();
}
function drawMushroom(c, s, frame) {
    // 茎
    c.fillStyle = '#fef3c7'; roundRectPath(c, -s * 0.12, -s * 0.02, s * 0.24, s * 0.4, s * 0.06); c.fill();
    eyesPair(c, s * 0.07, s * 0.14, s * 0.05);
    // 菌伞
    const g = c.createLinearGradient(0, -s * 0.42, 0, s * 0.02);
    g.addColorStop(0, '#ef4444'); g.addColorStop(1, '#991b1b'); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, -s * 0.06, s * 0.36, s * 0.26, 0, Math.PI, 0); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath(); c.arc(-s * 0.16, -s * 0.12, s * 0.05, 0, 7); c.arc(s * 0.12, -s * 0.16, s * 0.045, 0, 7); c.arc(0, -s * 0.06, s * 0.05, 0, 7); c.fill();
}
function drawEye(c, s, frame) {
    // 飞行眼球
    const bob = Math.sin(frame * 0.4) * s * 0.03;
    c.save(); c.translate(0, bob);
    // 翅膀
    c.fillStyle = 'rgba(244,114,182,0.7)';
    const flap = Math.sin(frame * 0.6) * s * 0.1;
    c.beginPath(); c.ellipse(-s * 0.32, -s * 0.1 - flap, s * 0.14, s * 0.07, 0.4, 0, 7); c.fill();
    c.beginPath(); c.ellipse(s * 0.32, -s * 0.1 - flap, s * 0.14, s * 0.07, -0.4, 0, 7); c.fill();
    // 眼球
    const g = c.createRadialGradient(0, 0, 2, 0, 0, s * 0.3);
    g.addColorStop(0, '#fff'); g.addColorStop(1, '#fecdd3'); c.fillStyle = g;
    c.beginPath(); c.arc(0, 0, s * 0.28, 0, 7); c.fill();
    c.fillStyle = '#f43f5e'; c.beginPath(); c.arc(0, s * 0.02, s * 0.14, 0, 7); c.fill();
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(0, s * 0.02, s * 0.07, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-s * 0.04, -s * 0.02, s * 0.025, 0, 7); c.fill();
    c.restore();
}

function drawZombie(c, s, frame) {
    const g = c.createRadialGradient(0, -s * 0.05, 2, 0, s * 0.05, s * 0.35);
    g.addColorStop(0, '#a3e635'); g.addColorStop(1, '#3f6212'); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, s * 0.04, s * 0.3, s * 0.35, 0, 0, 7); c.fill();
    // 破衣
    c.fillStyle = '#78716c'; c.strokeStyle = '#44403c'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-s * 0.22, -s * 0.05); c.lineTo(-s * 0.24, s * 0.18); c.lineTo(s * 0.24, s * 0.18); c.lineTo(s * 0.22, -s * 0.05); c.closePath(); c.fill(); c.stroke();
    // 眼
    eyesPair(c, s * 0.12, -s * 0.14, s * 0.08, '#1a2e05');
    // 手
    c.strokeStyle = '#65a30d'; c.lineWidth = s * 0.04; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-s * 0.26, s * 0.02); c.lineTo(-s * 0.36, s * 0.18); c.moveTo(s * 0.26, s * 0.02); c.lineTo(s * 0.36, s * 0.18); c.stroke(); c.lineCap = 'butt';
}
function drawOrc(c, s, frame) {
    const g = c.createRadialGradient(0, 0, 3, 0, s * 0.05, s * 0.45);
    g.addColorStop(0, '#4ade80'); g.addColorStop(1, '#14532d'); c.fillStyle = g; c.strokeStyle = '#052e16'; c.lineWidth = 2.5;
    c.beginPath(); c.ellipse(0, s * 0.04, s * 0.38, s * 0.44, 0, 0, 7); c.fill(); c.stroke();
    // 獠牙
    c.fillStyle = '#fef3c7'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-s * 0.08, s * 0.02); c.lineTo(-s * 0.05, s * 0.16); c.lineTo(-s * 0.12, s * 0.04); c.fill();
    c.beginPath(); c.moveTo(s * 0.08, s * 0.02); c.lineTo(s * 0.05, s * 0.16); c.lineTo(s * 0.12, s * 0.04); c.fill();
    // 眼
    c.fillStyle = '#fde047'; c.shadowColor = '#facc15'; c.shadowBlur = 8;
    c.beginPath(); c.arc(-s * 0.14, -s * 0.06, s * 0.06, 0, 7); c.arc(s * 0.14, -s * 0.06, s * 0.06, 0, 7); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(-s * 0.14, -s * 0.06, s * 0.03, 0, 7); c.arc(s * 0.14, -s * 0.06, s * 0.03, 0, 7); c.fill();
    // 头盔
    c.fillStyle = '#64748b'; c.beginPath(); c.ellipse(0, -s * 0.16, s * 0.3, s * 0.08, 0, Math.PI, 0); c.fill();
    c.strokeStyle = '#475569'; c.beginPath(); c.moveTo(-s * 0.3, -s * 0.16); c.lineTo(-s * 0.22, -s * 0.26); c.lineTo(s * 0.22, -s * 0.26); c.lineTo(s * 0.3, -s * 0.16); c.stroke();
}
function drawSpider(c, s, frame) {
    const legWave = Math.sin(frame * 0.4) * s * 0.06;
    // 八条腿
    c.strokeStyle = '#1f2937'; c.lineWidth = s * 0.03; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
        const side = i % 2 ? 1 : -1, yBase = -s * 0.1 + i * s * 0.1;
        c.beginPath(); c.moveTo(side * s * 0.12, yBase);
        c.quadraticCurveTo(side * s * 0.3, yBase + legWave * side, side * s * 0.42, yBase + s * 0.1); c.stroke();
    }
    // 身体
    const g = c.createRadialGradient(0, 0, 2, 0, 0, s * 0.24);
    g.addColorStop(0, '#374151'); g.addColorStop(1, '#111827'); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, 0, s * 0.2, s * 0.26, 0, 0, 7); c.fill();
    // 头
    c.fillStyle = '#1f2937'; c.beginPath(); c.arc(0, -s * 0.16, s * 0.14, 0, 7); c.fill();
    // 红眼
    c.fillStyle = '#ef4444'; c.shadowColor = '#f87171'; c.shadowBlur = 6;
    c.beginPath(); c.arc(-s * 0.06, -s * 0.18, s * 0.04, 0, 7); c.arc(s * 0.06, -s * 0.18, s * 0.04, 0, 7); c.fill(); c.shadowBlur = 0;
    c.lineCap = 'butt';
}
function drawGhost(c, s, frame) {
    const wave = Math.sin(frame * 0.35) * s * 0.05;
    const g = c.createRadialGradient(0, -s * 0.1, 2, 0, s * 0.1, s * 0.4);
    g.addColorStop(0, 'rgba(207,250,254,0.95)'); g.addColorStop(1, 'rgba(6,182,212,0.7)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-s * 0.28, -s * 0.3);
    c.quadraticCurveTo(-s * 0.34, -s * 0.46, 0, -s * 0.44);
    c.quadraticCurveTo(s * 0.34, -s * 0.46, s * 0.28, -s * 0.3);
    c.lineTo(s * 0.28, s * 0.25);
    c.quadraticCurveTo(s * 0.1, s * 0.28 + wave, 0, s * 0.38);
    c.quadraticCurveTo(-s * 0.1, s * 0.28 - wave, -s * 0.28, s * 0.25);
    c.closePath(); c.fill();
    // 双眼 + 嘴巴
    c.fillStyle = '#0f172a'; c.shadowColor = '#22d3ee'; c.shadowBlur = 5;
    c.beginPath(); c.arc(-s * 0.08, -s * 0.14, s * 0.05, 0, 7); c.arc(s * 0.08, -s * 0.14, s * 0.05, 0, 7); c.fill();
    c.beginPath(); c.ellipse(0, -s * 0.02, s * 0.06, s * 0.09, 0, 0, Math.PI); c.fill();
    c.shadowBlur = 0;
}
function drawSnail(c, s, frame) {
    // 壳
    const g1 = c.createRadialGradient(0, -s * 0.02, 2, 0, -s * 0.02, s * 0.28);
    g1.addColorStop(0, '#fcd34d'); g1.addColorStop(1, '#92400e');
    c.fillStyle = g1; c.strokeStyle = '#78350f'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -s * 0.02, s * 0.28, 0, Math.PI * 2); c.fill(); c.stroke();
    c.strokeStyle = '#a16207'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(0, -s * 0.02, s * 0.18, Math.PI * 1.5, Math.PI * 0.25, true); c.stroke();
    // 身体
    const g2 = c.createLinearGradient(0, s * 0.1, 0, s * 0.35);
    g2.addColorStop(0, '#65a30d'); g2.addColorStop(1, '#365314');
    c.fillStyle = g2; roundRectPath(c, -s * 0.3, s * 0.1, s * 0.6, s * 0.22, s * 0.06); c.fill();
    c.fillStyle = '#22c55e'; roundRectPath(c, s * 0.28, s * 0.08, s * 0.12, s * 0.08, s * 0.03); c.fill();
    // 眼柄
    c.strokeStyle = '#4ade80'; c.lineWidth = s * 0.03; c.beginPath(); c.moveTo(s * 0.1, s * 0.08); c.lineTo(s * 0.16, -s * 0.06); c.moveTo(s * 0.18, s * 0.08); c.lineTo(s * 0.24, -s * 0.06); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(s * 0.16, -s * 0.06, s * 0.03, 0, 7); c.arc(s * 0.24, -s * 0.06, s * 0.03, 0, 7); c.fill();
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(s * 0.16, -s * 0.06, s * 0.015, 0, 7); c.arc(s * 0.24, -s * 0.06, s * 0.015, 0, 7); c.fill();
}
function drawImp(c, s, frame) {
    const g = c.createRadialGradient(0, 0, 2, 0, 0, s * 0.3);
    g.addColorStop(0, '#f87171'); g.addColorStop(1, '#991b1b'); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, s * 0.02, s * 0.24, s * 0.3, 0, 0, 7); c.fill();
    // 小翅膀
    const flap = Math.sin(frame * 0.6) * s * 0.08;
    c.fillStyle = 'rgba(251,113,133,0.75)';
    c.beginPath(); c.ellipse(-s * 0.22, -s * 0.08 + flap, s * 0.15, s * 0.06, 0.3, 0, 7); c.fill();
    c.beginPath(); c.ellipse(s * 0.22, -s * 0.08 + flap, s * 0.15, s * 0.06, -0.3, 0, 7); c.fill();
    // 小角
    c.fillStyle = '#450a0a'; c.strokeStyle = '#1c1917'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-s * 0.1, -s * 0.18); c.lineTo(-s * 0.14, -s * 0.32); c.lineTo(-s * 0.05, -s * 0.18); c.fill();
    c.beginPath(); c.moveTo(s * 0.1, -s * 0.18); c.lineTo(s * 0.14, -s * 0.32); c.lineTo(s * 0.05, -s * 0.18); c.fill();
    eyesPair(c, s * 0.08, -s * 0.06, s * 0.06, '#fde047');
    c.strokeStyle = '#450a0a'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, s * 0.1, s * 0.08, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
}
function drawWolf(c, s, frame) {
    const g = c.createLinearGradient(0, -s * 0.35, 0, s * 0.3);
    g.addColorStop(0, '#d1d5db'); g.addColorStop(0.5, '#9ca3af'); g.addColorStop(1, '#6b7280');
    c.fillStyle = g; c.strokeStyle = '#374151'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, s * 0.04, s * 0.3, s * 0.34, 0, 0, 7); c.fill(); c.stroke();
    // 尖耳朵
    c.fillStyle = '#9ca3af';
    c.beginPath(); c.moveTo(-s * 0.22, -s * 0.14); c.lineTo(-s * 0.18, -s * 0.36); c.lineTo(-s * 0.06, -s * 0.12); c.fill();
    c.beginPath(); c.moveTo(s * 0.22, -s * 0.14); c.lineTo(s * 0.18, -s * 0.36); c.lineTo(s * 0.06, -s * 0.12); c.fill();
    // 红眼
    c.fillStyle = '#ef4444'; c.shadowColor = '#f87171'; c.shadowBlur = 5;
    c.beginPath(); c.arc(-s * 0.1, -s * 0.06, s * 0.05, 0, 7); c.arc(s * 0.1, -s * 0.06, s * 0.05, 0, 7); c.fill(); c.shadowBlur = 0;
    // 嘴
    c.fillStyle = '#0f172a'; c.beginPath(); c.moveTo(-s * 0.08, s * 0.06); c.lineTo(0, s * 0.2); c.lineTo(s * 0.08, s * 0.06); c.fill();
    // 尾巴
    c.strokeStyle = '#9ca3af'; c.lineWidth = s * 0.04; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, s * 0.34); c.quadraticCurveTo(s * 0.16, s * 0.4, s * 0.22, s * 0.28); c.stroke(); c.lineCap = 'butt';
}
function drawKnight(c, s, frame) {
    c.fillStyle = '#cbd5e1';
    c.beginPath(); c.arc(0, -s * 0.18, s * 0.2, 0, 7); c.fill();
    c.fillStyle = '#f1f5f9'; c.beginPath(); c.moveTo(-s * 0.22, -s * 0.06); c.lineTo(-s * 0.26, s * 0.24); c.lineTo(s * 0.26, s * 0.24); c.lineTo(s * 0.22, -s * 0.06); c.closePath(); c.fill();
    c.strokeStyle = '#475569'; c.lineWidth = 2; c.stroke();
    // 肩甲
    c.fillStyle = '#94a3b8'; c.beginPath(); c.ellipse(-s * 0.24, s * 0.03, s * 0.1, s * 0.06, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(s * 0.24, s * 0.03, s * 0.1, s * 0.06, 0, 0, 7); c.fill();
    // 红眼洞
    c.fillStyle = '#1e293b'; c.beginPath(); c.rect(-s * 0.13, -s * 0.24, s * 0.08, s * 0.04); c.rect(s * 0.05, -s * 0.24, s * 0.08, s * 0.04); c.fill();
    // 剑
    c.strokeStyle = '#e2e8f0'; c.lineWidth = s * 0.04; c.beginPath(); c.moveTo(s * 0.22, -s * 0.08); c.lineTo(s * 0.36, -s * 0.34); c.stroke();
    c.fillStyle = '#cbd5e1'; roundRectPath(c, s * 0.33, -s * 0.3, s * 0.06, s * 0.06, 1); c.fill();
    // 盾牌
    c.fillStyle = '#3b82f6'; c.strokeStyle = '#1d4ed8'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(-s * 0.28, s * 0.08, s * 0.1, s * 0.14, 0, 0, 7); c.fill(); c.stroke();
}
function drawCrab(c, s, frame) {
    // 钳子
    c.fillStyle = '#fb7185';
    [-1, 1].forEach(d => {
        const swing = Math.sin(frame * 0.4 + d) * s * 0.04;
        c.beginPath(); c.moveTo(d * s * 0.24, -s * 0.04);
        c.quadraticCurveTo(d * s * 0.42, -s * 0.12 + swing, d * s * 0.38, -s * 0.22); c.stroke();
        c.beginPath(); c.arc(d * s * 0.38, -s * 0.22, s * 0.07, 0, Math.PI); c.fill();
        c.beginPath(); c.arc(d * s * 0.32, -s * 0.24, s * 0.07, Math.PI, 0); c.fill();
    });
    // 蟹壳
    const g = c.createRadialGradient(0, -s * 0.05, 2, 0, s * 0.05, s * 0.28);
    g.addColorStop(0, '#f43f5e'); g.addColorStop(1, '#9f1239'); c.fillStyle = g; c.strokeStyle = '#881337'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, 0, s * 0.28, s * 0.22, 0, 0, 7); c.fill(); c.stroke();
    // 壳纹
    c.strokeStyle = '#881337'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-s * 0.16, -s * 0.12); c.lineTo(-s * 0.08, s * 0.12); c.moveTo(0, -s * 0.16); c.lineTo(0, s * 0.14); c.moveTo(s * 0.16, -s * 0.12); c.lineTo(s * 0.08, s * 0.12); c.stroke();
    // 眼
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-s * 0.08, -s * 0.1, s * 0.04, 0, 7); c.arc(s * 0.08, -s * 0.1, s * 0.04, 0, 7); c.fill();
    c.fillStyle = '#0f172a'; c.beginPath(); c.arc(-s * 0.08, -s * 0.1, s * 0.02, 0, 7); c.arc(s * 0.08, -s * 0.1, s * 0.02, 0, 7); c.fill();
}
function drawSlimeKing(c, s, frame) {
    const sq = 1 + Math.sin(frame * 0.2) * 0.06;
    c.save(); c.scale(sq, 2 - sq);
    const g = c.createRadialGradient(0, -s * 0.05, 2, 0, s * 0.1, s * 0.55);
    g.addColorStop(0, '#d9f99d'); g.addColorStop(1, '#3f6212'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-s * 0.44, s * 0.3); c.quadraticCurveTo(-s * 0.52, -s * 0.42, 0, -s * 0.46);
    c.quadraticCurveTo(s * 0.52, -s * 0.42, s * 0.44, s * 0.3); c.quadraticCurveTo(0, s * 0.48, -s * 0.44, s * 0.3); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-s * 0.16, -s * 0.2, s * 0.09, s * 0.14, -0.3, 0, 7); c.fill();
    c.restore();
    eyesPair(c, s * 0.18, -s * 0.04, s * 0.1, '#052e16');
    // 王冠
    drawCrown(c, 0, -s * 0.48, s * 0.22);
}
function drawBee(c, s, frame) {
    const bob = Math.sin(frame * 0.5) * s * 0.02;
    c.save(); c.translate(0, bob);
    // 翅膀
    const flap = Math.sin(frame * 0.8) * s * 0.08;
    for (let i = 0; i < 2; i++) {
        const side = i ? 1 : -1;
        c.fillStyle = 'rgba(255,255,255,0.55)'; c.strokeStyle = '#93c5fd'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(side * s * 0.1, -s * 0.22 + flap, s * 0.16, s * 0.08, 0.3 * side, 0, 7); c.fill(); c.stroke();
    }
    // 身体条纹
    const g = c.createLinearGradient(0, -s * 0.1, 0, s * 0.15);
    g.addColorStop(0, '#fde047'); g.addColorStop(0.3, '#1e293b'); g.addColorStop(0.5, '#fde047'); g.addColorStop(0.7, '#1e293b'); g.addColorStop(1, '#fde047');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, s * 0.14, s * 0.2, 0, 0, 7); c.fill();
    // 毒针
    c.fillStyle = '#1e293b'; c.beginPath(); c.moveTo(-s * 0.03, s * 0.18); c.lineTo(s * 0.03, s * 0.18); c.lineTo(0, s * 0.32); c.fill();
    // 眼
    c.fillStyle = '#ef4444'; c.beginPath(); c.arc(-s * 0.06, -s * 0.06, s * 0.03, 0, 7); c.arc(s * 0.06, -s * 0.06, s * 0.03, 0, 7); c.fill();
    // 触角
    c.strokeStyle = '#0f172a'; c.lineWidth = 1.2; c.beginPath();
    c.moveTo(-s * 0.04, -s * 0.18); c.quadraticCurveTo(-s * 0.1, -s * 0.3, -s * 0.08, -s * 0.26);
    c.moveTo(s * 0.04, -s * 0.18); c.quadraticCurveTo(s * 0.1, -s * 0.3, s * 0.08, -s * 0.26); c.stroke();
    c.restore();
}
function drawLich(c, s, frame) {
    const wave = Math.sin(frame * 0.2) * s * 0.03;
    // 袍子
    const g = c.createLinearGradient(0, -s * 0.4, 0, s * 0.45);
    g.addColorStop(0, '#c084fc'); g.addColorStop(0.5, '#7c3aed'); g.addColorStop(1, '#2e1065');
    c.fillStyle = g; c.strokeStyle = '#4c1d95'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-s * 0.36, -s * 0.08); c.quadraticCurveTo(-s * 0.4, -s * 0.4, 0, -s * 0.44);
    c.quadraticCurveTo(s * 0.4, -s * 0.4, s * 0.36, -s * 0.08);
    c.lineTo(s * 0.34, s * 0.34); c.quadraticCurveTo(s * 0.12, s * 0.32 + wave, 0, s * 0.42);
    c.quadraticCurveTo(-s * 0.12, s * 0.32 - wave, -s * 0.34, s * 0.34); c.closePath(); c.fill(); c.stroke();
    // 兜帽脸
    c.fillStyle = '#1c1917'; c.beginPath(); c.ellipse(0, -s * 0.14, s * 0.22, s * 0.24, 0, Math.PI, 0); c.fill();
    // 发光双眼
    c.fillStyle = '#67e8f9'; c.shadowColor = '#22d3ee'; c.shadowBlur = 14;
    c.beginPath(); c.arc(-s * 0.1, -s * 0.14, s * 0.06, 0, 7); c.arc(s * 0.1, -s * 0.14, s * 0.06, 0, 7); c.fill(); c.shadowBlur = 0;
    // 权杖
    c.strokeStyle = '#64748b'; c.lineWidth = s * 0.03; c.beginPath(); c.moveTo(s * 0.28, -s * 0.06); c.lineTo(s * 0.28, -s * 0.42); c.stroke();
    const glow = 0.5 + 0.5 * Math.sin(frame * 0.3);
    c.fillStyle = `rgba(196,181,253,${0.6 + glow * 0.4})`; c.shadowColor = '#a78bfa'; c.shadowBlur = 16;
    c.beginPath(); c.arc(s * 0.28, -s * 0.44, s * 0.08, 0, 7); c.fill(); c.shadowBlur = 0;
    // 环身符文
    c.strokeStyle = 'rgba(167,139,250,0.5)'; c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const a = frame * 0.15 + i * 2.1;
        const rx = Math.cos(a) * s * 0.38, ry = -s * 0.05 + Math.sin(a) * s * 0.08;
        c.fillStyle = 'rgba(167,139,250,0.45)'; c.beginPath(); c.arc(rx, ry, s * 0.02, 0, 7); c.fill();
    }
    // 王冠
    drawCrown(c, 0, -s * 0.52, s * 0.24);
}

// 敌人小图标（用于本关预览）
function makeEnemyIcon(typeId, px = 40) {
    const cv = document.createElement('canvas'); cv.width = px; cv.height = px;
    const c = cv.getContext('2d');
    const def = DEF_ENEMIES[typeId];
    if (def.render === 'lizard' && ASSETS.lizardWalk[0] && ASSETS.lizardWalk[0].width) {
        const img = ASSETS.lizardWalk[0], ratio = img.width / img.height, h = px * 0.86, w = h * ratio;
        c.imageSmoothingEnabled = false; c.drawImage(img, px / 2 - w / 2, px / 2 - h / 2, w, h);
    } else if (def.render === 'lizard') {
        c.fillStyle = '#a3e635'; c.beginPath(); c.arc(px / 2, px / 2, px * 0.3, 0, 7); c.fill();
    } else {
        drawEnemyArt(c, def.render, px / 2, px / 2, px * 0.78, 0, 0);
    }
    return cv;
}
function buildEnemyPreview() {
    const bar = document.getElementById('enemyPreview'); bar.innerHTML = '';
    const label = document.createElement('span'); label.className = 'ep-label'; label.textContent = '本关敌人'; bar.appendChild(label);
    const types = Object.keys(G.cfg.mix);
    if (G.cfg.boss) types.push('demon');
    types.forEach(t => {
        const def = DEF_ENEMIES[t];
        const item = document.createElement('div'); item.className = 'ep-item' + (def.isBoss ? ' boss' : '');
        item.appendChild(makeEnemyIcon(t, 38));
        const nm = document.createElement('span'); nm.className = 'ep-name'; nm.textContent = def.name;
        item.appendChild(nm); bar.appendChild(item);
    });
}

// 敌人小图标结束
function drawWarriorFrame(c, anim, frameIndex, x, y, targetH, flip) {
    if (!anim || !anim.img || !anim.img.width) { c.fillStyle = '#fbbf24'; c.fillRect(x - targetH * 0.2, y - targetH * 0.4, targetH * 0.4, targetH * 0.8); return; }
    const fw = anim.img.width / anim.frames, fh = anim.img.height;
    const sx = (Math.floor(frameIndex) % anim.frames) * fw;
    const ratio = fw / fh, h = targetH, w = h * ratio;
    c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
    c.imageSmoothingEnabled = false;
    c.drawImage(anim.img, sx, 0, fw, fh, -w / 2, -h / 2, w, h);
    c.restore();
}

// ---------- 工具 ----------
function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), 1600);
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
    renderLevels(); renderShop(); showScreen('menuScreen');
}
function renderLevels() {
    const data = getDefData();
    const grid = document.getElementById('levelGrid'); grid.innerHTML = '';
    const maxShow = Math.max(9, data.highestLevel + 2);
    for (let lv = 1; lv <= maxShow; lv++) {
        const cfg = getLevelConfig(lv);
        const locked = lv > data.highestLevel;
        const cell = document.createElement('div');
        cell.className = 'level-cell' + (cfg.boss ? ' boss' : '') + (locked ? ' locked' : '') + (lv === selectedLevel ? ' selected' : '');
        cell.innerHTML = locked ? `<span class="lv-lock">🔒</span>` : `<span class="lv-num">${lv}</span><span class="lv-tag">${cfg.boss ? 'BOSS关' : '第' + lv + '关'}</span>`;
        if (!locked) cell.onclick = () => { selectedLevel = lv; renderLevels(); };
        grid.appendChild(cell);
    }
}
function renderShop() {
    const data = getDefData();
    const grid = document.getElementById('armoryGrid'); grid.innerHTML = '';
    const roleNames = { wall: '肉盾', dps: '速射', sniper: '狙击', aoe: '范围', control: '控制', chain: '连锁', army: '军队' };
    Object.values(DEF_WEAPONS).forEach(w => {
        const owned = data.arsenal[w.id] || 0;
        const can = data.points >= w.price;
        const card = document.createElement('div');
        card.className = 'weapon-card';
        let statsHtml = '';
        if (w.atk) statsHtml += `<span>攻<b>${w.atk}</b></span>`;
        if (w.hp) statsHtml += `<span>血<b>${w.hp}</b></span>`;
        card.innerHTML = `
            <span class="wc-owned">拥有 ${owned}</span>
            <div class="wc-name">${w.name}</div>
            <div class="wc-role">${roleNames[w.role] || ''}</div>
            <div class="wc-desc">${w.desc}</div>
            <div class="wc-stats">${statsHtml}</div>
            <button class="wc-btn ${can ? 'buy' : 'cant'}" ${can ? `onclick="purchase('${w.id}')"` : 'disabled'}>购买 ${w.price}积分</button>`;
        const iconWrap = document.createElement('div'); iconWrap.className = 'wc-icon'; iconWrap.appendChild(makeIcon(w.id, 54));
        card.querySelector('.wc-name').before(iconWrap);
        grid.appendChild(card);
    });
}
function purchase(id) {
    if (buyWeapon(id)) { toast(`购买 ${DEF_WEAPONS[id].name}！`); initMenu(); }
    else toast('积分不足');
}
function backToMenu() { initMenu(); }

// ============================================================
//  家长录入（密码=当天星期英文；按住 Z 才生效，隐藏）
// ============================================================
let _zActive = false;
document.addEventListener('keydown', e => { if (e.key === 'z' || e.key === 'Z') _zActive = true; });
document.addEventListener('keyup', e => { if (e.key === 'z' || e.key === 'Z') _zActive = false; });
function todayPwd() { return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()]; }
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
    const rl = document.getElementById('rewardList'); rl.innerHTML = '';
    DEF_REWARDS.forEach(r => {
        const item = document.createElement('div'); item.className = 'reward-item';
        item.innerHTML = `<span class="ri-icon">${r.icon}</span><span class="ri-label">${r.label}</span>
            <span class="ri-pts plus">+${r.pts}</span><button class="ri-btn" data-pts="${r.pts}" data-label="${r.label}">发放</button>`;
        rl.appendChild(item);
    });
    const pl = document.getElementById('penaltyList'); pl.innerHTML = '';
    DEF_PENALTIES.forEach(p => {
        const item = document.createElement('div'); item.className = 'reward-item';
        item.innerHTML = `<span class="ri-icon">${p.icon}</span><span class="ri-label">${p.label}</span>
            <span class="ri-pts minus">${p.pts}</span><button class="ri-btn minus" data-pts="${p.pts}" data-label="${p.label}">扣除</button>`;
        pl.appendChild(item);
    });
    bindParentButtons(); renderHistory(); updateArmFeedback();
}
function updateArmFeedback() { document.querySelectorAll('#parentScreen .ri-btn').forEach(b => b.classList.toggle('armed', _zActive)); }
setInterval(() => { if (document.getElementById('parentScreen').classList.contains('active')) updateArmFeedback(); }, 120);
function bindParentButtons() {
    document.querySelectorAll('#parentScreen .ri-btn').forEach(b => {
        b.onclick = () => {
            if (!_zActive) return;
            addDefPoints(parseInt(b.dataset.pts), b.dataset.label);
            toast(`${b.dataset.label} ${parseInt(b.dataset.pts) > 0 ? '+' : ''}${b.dataset.pts}积分`);
            renderParent();
        };
    });
}
function renderHistory() {
    const data = getDefData();
    const hl = document.getElementById('historyList'); hl.innerHTML = '';
    data.history.slice(0, 30).forEach(h => {
        const item = document.createElement('div'); item.className = 'history-item';
        item.innerHTML = `<span>${h.date} ${h.label}</span><span class="hi-pts ${h.pts >= 0 ? 'plus' : 'minus'}">${h.pts >= 0 ? '+' : ''}${h.pts}</span>`;
        hl.appendChild(item);
    });
}

// ============================================================
//  战斗引擎
// ============================================================
let canvas, ctx, W, H, dpr = 1, rafId = null;
let G = null;
const TRAY_H = 92;
let enemyLaneW, colW, cellSize, gridBottom, rowsY = [], baseLineY, enemyBaseSize;

function computeLayout() {
    enemyLaneW = W / DEF_LANES;
    colW = W / DEF_COLS;
    const maxGridH = H * 0.62;
    cellSize = Math.min(colW * 0.92, maxGridH / DEF_PLACE_ROWS);
    gridBottom = H - TRAY_H - 8;
    rowsY = [];
    for (let r = 0; r < DEF_PLACE_ROWS; r++) rowsY[r] = gridBottom - cellSize * (DEF_PLACE_ROWS - r - 0.5);
    baseLineY = H - TRAY_H - 2;
    enemyBaseSize = Math.min(colW * 0.8, H * 0.13);
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
function colX(col) { return (col + 0.5) * colW; }
function laneX(lane) { return (lane + 0.5) * enemyLaneW; }

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
        enemies: [], units: {}, projectiles: [], particles: [], warriors: [], arcs: [], clouds: [],
        stock: { ...data.arsenal },
        lives: 5, maxLives: 5,
        killed: 0, total: queue.length, spawned: 0,
        queue, spawnTimer: 999, frame: 0, prep: 360,
        selected: null, running: true, ended: false, paused: false, shake: 0, flash: 0,
    };
    buildTray(); buildEnemyPreview(); updateHud(); updatePauseBtn();
    cancelAnimationFrame(rafId); loop();
}
function buildSpawnQueue(cfg) {
    const queue = [], types = [];
    Object.keys(cfg.mix).forEach(k => { for (let i = 0; i < cfg.mix[k]; i++) types.push(k); });
    for (let i = 0; i < cfg.count; i++) queue.push(types[Math.floor(Math.random() * types.length)]);
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    if (cfg.boss) queue.push(cfg.bossType || 'demon');
    return queue;
}

// 暂停 / 准备
function togglePause() {
    if (!G || !G.running) return;
    G.paused = !G.paused;
    updatePauseBtn();
}
function updatePauseBtn() {
    const btn = document.getElementById('pauseBtn');
    if (!btn) return;
    btn.textContent = G && G.paused ? '▶ 继续战斗' : '⏸ 暂停布阵';
    btn.classList.toggle('paused', !!(G && G.paused));
}
function updatePrepBanner() {
    const b = document.getElementById('prepBanner');
    if (!b) return;
    if (G.paused) {
        b.className = 'prep-banner show';
        b.innerHTML = `<div class="pb-big">已暂停</div><div class="pb-sub">从容布置你的武器，点「继续战斗」开打</div>`;
    } else if (G.prep > 0) {
        b.className = 'prep-banner show';
        const sec = Math.ceil(G.prep / 60);
        b.innerHTML = `<div class="pb-big">准备 ${sec}</div><div class="pb-sub">趁现在布置好你的防线！</div>`;
    } else {
        b.className = 'prep-banner';
    }
}

// ---------- 武器托盘 ----------
function buildTray() {
    const tray = document.getElementById('weaponTray'); tray.innerHTML = '';
    Object.keys(DEF_WEAPONS).forEach(id => {
        if (!(G.stock[id] > 0)) return;
        const w = DEF_WEAPONS[id];
        const item = document.createElement('div'); item.className = 'tray-item'; item.dataset.id = id;
        item.appendChild(makeIcon(id, 44));
        const name = document.createElement('div'); name.className = 'ti-name'; name.textContent = w.name;
        const cnt = document.createElement('div'); cnt.className = 'ti-count'; cnt.textContent = '×' + G.stock[id];
        item.appendChild(name); item.appendChild(cnt);
        item.onclick = () => selectWeapon(id);
        tray.appendChild(item);
    });
    if (!tray.children.length) tray.innerHTML = '<div class="tray-empty">没有武器了，去商店购买吧</div>';
}
function updateTrayCounts() {
    document.querySelectorAll('.tray-item').forEach(el => {
        const id = el.dataset.id, n = G.stock[id] || 0;
        const cnt = el.querySelector('.ti-count'); if (cnt) cnt.textContent = '×' + n;
        el.classList.toggle('cant', n <= 0);
        if (n <= 0 && G.selected === id) G.selected = null;
        el.classList.toggle('selected', id === G.selected);
    });
}
function selectWeapon(id) {
    if (!(G.stock[id] > 0)) return;
    G.selected = (G.selected === id) ? null : id;
    updateTrayCounts();
}
function onCanvasPointer(e) {
    if (!G || !G.running || !G.selected) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const py = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    if (G.stock[G.selected] <= 0) return;
    const col = Math.max(0, Math.min(DEF_COLS - 1, Math.floor(px / colW)));
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
    const w = DEF_WEAPONS[id], key = `${col}_${row}`;
    G.units[key] = {
        id, col, row, key, render: w.render, lane: laneOfCol(col),
        x: colX(col), y: rowsY[row],
        hp: w.hp, maxHp: w.hp, atk: w.atk, cd: 0, cooldown: w.cooldown,
        frame: Math.random() * 100, attacking: 0, hitFlash: 0,
        spawnTimer: w.spawnInterval || 0,
        arm: w.armTime || 0, fuse: w.fuse || 0, chew: 0,
        drained: w.special === 'vortex' ? new Set() : null,
        fissurePhase: w.special === 'fissure' ? 'closed' : null,
        fissureTimer: w.special === 'fissure' ? w.closeTime : 0,
    };
    spawnParticles(colX(col), rowsY[row], w.color, 12);
}

// ============================================================
//  更新
// ============================================================
function spawnEnemy(typeId) {
    const def = DEF_ENEMIES[typeId], cfg = G.cfg;
    const lane = Math.floor(Math.random() * DEF_LANES);
    const hp = Math.round(cfg.baseHp * def.hpMult);
    const size = enemyBaseSize * def.scale;
    G.enemies.push({
        type: typeId, def, lane, x: laneX(lane), y: -size,
        hp, maxHp: hp, speed: cfg.speed * def.speedMult, size,
        frame: Math.random() * 6, atkCd: 0, slowTimer: 0, slowFactor: 1, hitFlash: 0,
    });
}
function update() {
    G.frame++;
    if (G.shake > 0) G.shake *= 0.85;
    if (G.flash > 0) G.flash -= 0.04;
    if (G.prep > 0) {
        G.prep--;
        if (G.prep === 0) G.spawnTimer = 30;   // 准备结束后稍候出怪
    } else if (G.spawned < G.queue.length) {
        if (--G.spawnTimer <= 0) { spawnEnemy(G.queue[G.spawned]); G.spawned++; G.spawnTimer = G.cfg.spawnGap; }
    }
    updateUnits(); updateWarriors(); updateEnemies(); updateProjectiles(); updateParticles(); updateArcs(); updateClouds();
    if (!G.ended && G.prep <= 0) {
        if (G.lives <= 0) endBattle(false);
        else if (G.spawned >= G.queue.length && G.enemies.length === 0) endBattle(true);
    }
}
function updateClouds() {
    for (let i = G.clouds.length - 1; i >= 0; i--) {
        const cl = G.clouds[i];
        cl.life--;
        if (cl.tick-- <= 0) {
            cl.tick = 18;
            for (const e of G.enemies) if (Math.hypot(e.x - cl.x, e.y - cl.y) < cl.r) damageEnemy(e, cl.dmg);
        }
        if (cl.life <= 0) G.clouds.splice(i, 1);
    }
}

function nearestEnemyInLane(lane, refY, aboveOnly) {
    let best = null, bestD = Infinity;
    for (const e of G.enemies) {
        if (e.lane !== lane) continue;
        if (aboveOnly && e.y > refY) continue;
        const d = Math.abs(e.y - refY);
        if (d < bestD) { bestD = d; best = e; }
    }
    return best;
}

function updateUnits() {
    for (const key in G.units) {
        const u = G.units[key];
        u.frame += 0.2;
        if (u.attacking > 0) u.attacking--;
        if (u.hitFlash > 0) u.hitFlash--;
        const w = DEF_WEAPONS[u.id];
        const sp = w.special;
        if (w.render === 'barracks') {
            u.spawnTimer--;
            const alive = G.warriors.filter(wr => wr.owner === u.key && wr.hp > 0).length;
            if (u.spawnTimer <= 0 && alive < w.maxUnits) { spawnWarrior(u, w); u.spawnTimer = w.spawnInterval; }
            continue;
        }
        if (sp === 'spike') { spikeTick(u, w); continue; }
        if (sp === 'laser') { laserTick(u, w); continue; }
        if (sp === 'wind') { windTick(u, w); continue; }
        if (sp === 'mine') { mineTick(u, w, key); continue; }
        if (sp === 'cherry') { bombFuseTick(u, w, key, false); continue; }
        if (sp === 'jalapeno') { bombFuseTick(u, w, key, true); continue; }
        if (sp === 'chomper') { chomperTick(u, w); continue; }
        if (sp === 'vortex') { vortexTick(u, w); continue; }
        if (sp === 'fissure') { fissureTick(u, w); continue; }
        if (!u.atk) continue;   // 石墙等纯肉盾
        if (w.doubleDir) {       // 双头炮：前后两个方向
            if (u.cd <= 0 && (findTargetInLane(u.lane, u.y) || findTargetBelowInLane(u.lane, u.y))) {
                fireDoubleDir(u, w); u.cd = u.cooldown; u.attacking = 12;
            }
            continue;
        }
        if (u.cd > 0) u.cd--;
        if (w.multiLane) {       // 三线炮：本通道 + 左右
            const lanes = [u.lane - 1, u.lane, u.lane + 1].filter(l => l >= 0 && l < DEF_LANES);
            if (u.cd <= 0 && lanes.some(l => findTargetInLane(l, u.y))) {
                lanes.forEach(l => fireProjectile(u, null, l)); u.cd = u.cooldown; u.attacking = 12;
            }
            continue;
        }
        if (w.multiDir) {        // 杨桃：多方向
            if (u.cd <= 0 && findTargetInLane(u.lane, u.y)) { fireStar(u, w); u.cd = u.cooldown; u.attacking = 12; }
            continue;
        }
        const target = findTargetInLane(u.lane, u.y);
        if (target && u.cd <= 0) { fireProjectile(u, target); u.cd = u.cooldown; u.attacking = 12; }
    }
}

// 范围伤害
function aoeDamage(x, y, radius, dmg, color) {
    bigExplosion(x, y, radius, color || '#fb923c');
    for (const e of [...G.enemies]) { if (Math.hypot(e.x - x, e.y - y) < radius) damageEnemy(e, dmg); }
}
// 地刺：持续扎伤本通道路过的敌人（不阻挡）
function spikeTick(u, w) {
    if (u.cd > 0) { u.cd--; return; }
    let hit = false;
    for (const e of G.enemies) {
        if (e.lane === u.lane && Math.abs(e.y - u.y) < cellSize * 0.85) { damageEnemy(e, w.atk); hit = true; }
    }
    if (hit) { spawnParticles(u.x, u.y, '#e2e8f0', 3); u.cd = w.cooldown; }
}
// 地雷：敌人靠近即引爆
function mineTick(u, w, key) {
    if (u.arm > 0) { u.arm--; return; }
    for (const e of G.enemies) {
        if (e.lane === u.lane && Math.abs(e.y - u.y) < e.size * 0.5 + cellSize * 0.4) {
            aoeDamage(u.x, u.y, w.explodeRadius, w.explodeDmg, '#fb923c');
            delete G.units[key]; return;
        }
    }
}
// 樱桃炸弹 / 火爆辣椒：引线倒计时后爆炸
function bombFuseTick(u, w, key, laneClear) {
    u.fuse--;
    if (u.fuse <= 0) {
        if (laneClear) {
            for (const e of [...G.enemies]) if (e.lane === u.lane) damageEnemy(e, w.laneDmg);
            // 整条通道熊熊烈焰
            const x = laneX(u.lane);
            for (let yy = 0; yy < baseLineY; yy += cellSize * 0.4) {
                G.particles.push({ x: x + (Math.random() - 0.5) * colW * 0.7, y: yy, vx: (Math.random() - 0.5) * 2, vy: -3 - Math.random() * 3, life: 26 + Math.random() * 20, color: Math.random() < 0.5 ? '#f97316' : '#fbbf24', size: 5 + Math.random() * 6 });
            }
            G.particles.push({ x, y: baseLineY * 0.5, vx: 0, vy: 0, life: 24, color: '#fdba74', size: colW * 0.6, fireball: true });
            G.flash = Math.max(G.flash, 0.4); G.shake = Math.max(G.shake, 14);
        } else {
            aoeDamage(u.x, u.y, w.explodeRadius, w.explodeDmg, '#ef4444');
        }
        delete G.units[key];
    }
}
// 激光：持续贯穿整条通道
function laserTick(u, w) {
    const targets = G.enemies.filter(e => e.lane === u.lane && e.y < u.y);
    u.beamOn = targets.length > 0;
    if (!u.beamOn) return;
    u.attacking = 4;
    if (u.cd > 0) { u.cd--; return; }
    u.cd = w.cooldown;
    for (const e of targets) damageEnemy(e, w.atk);
}
// 狂风：定时把本通道敌人吹回上方
function windTick(u, w) {
    if (u.cd > 0) { u.cd--; return; }
    const targets = G.enemies.filter(e => e.lane === u.lane && e.y < u.y);
    if (!targets.length) return;
    u.cd = w.cooldown; u.attacking = 16;
    for (const e of targets) {
        e.y = Math.max(-e.size, e.y - w.pushDist);
        if (w.atk) damageEnemy(e, w.atk);
    }
    const x = laneX(u.lane);
    for (let k = 0; k < 14; k++) G.particles.push({ x: x + (Math.random() - 0.5) * colW * 0.8, y: u.y - Math.random() * cellSize * 4, vx: (Math.random() - 0.5) * 2, vy: -4 - Math.random() * 3, life: 22, color: '#cffafe', size: 2 + Math.random() * 3 });
}
// 大嘴花：一口吃掉一个敌人
function chomperTick(u, w) {
    if (u.chew > 0) { u.chew--; return; }
    const target = findTargetInLane(u.lane, u.y);
    if (target && Math.abs(target.y - u.y) < cellSize * 1.3) {
        const heavy = target.def.isBoss || target.def.hpMult >= 3;   // 重型敌人不能秒杀
        damageEnemy(target, heavy ? w.biteDmg : target.hp + 1);
        u.chew = w.chewTime; u.attacking = 16;
        spawnParticles(target.x, target.y, '#7c3aed', 10);
    }
}
// 太极阵：吸走路过的敌人一半当前血量（每个敌人限一次）
function vortexTick(u, w) {
    if (!u.drained) u.drained = new Set();
    for (const e of G.enemies) {
        if (e.lane === u.lane && !u.drained.has(e) && Math.abs(e.y - u.y) < cellSize * 0.9) {
            const drain = Math.floor(e.hp * w.drainPct);
            if (drain > 0) {
                damageEnemy(e, drain);
                u.drained.add(e);
                spawnParticles(e.x, e.y, '#e2e8f0', 14);
                // 吸入特效：从敌人流向太极阵
                for (let k = 0; k < 6; k++) {
                    G.particles.push({
                        x: e.x, y: e.y,
                        vx: (u.x - e.x) * 0.08, vy: (u.y - e.y) * 0.08,
                        life: 18 + k * 2, color: '#cbd5e1', size: 2 + k * 0.8,
                    });
                }
            }
        }
    }
}
// 地裂陷阱：间歇开合，开启时秒杀上方敌人
function fissureTick(u, w) {
    if (!u.fissurePhase) { u.fissurePhase = 'closed'; u.fissureTimer = w.closeTime; }
    u.fissureTimer--;
    if (u.fissureTimer <= 0) {
        if (u.fissurePhase === 'closed') { u.fissurePhase = 'open'; u.fissureTimer = w.openTime; }
        else { u.fissurePhase = 'closed'; u.fissureTimer = w.closeTime; }
    }
    if (u.fissurePhase !== 'open') return;
    for (let i = G.enemies.length - 1; i >= 0; i--) {
        const e = G.enemies[i];
        if (e.lane === u.lane && Math.abs(e.y - u.y) < e.size * 0.45 + cellSize * 0.35) {
            const isBoss = e.def.isBoss;
            if (isBoss) { damageEnemy(e, e.hp * 0.3); } // BOSS只扣30%
            else { damageEnemy(e, e.hp + 9999); }       // 秒杀
            spawnParticles(e.x, e.y, '#fbbf24', 16);
            G.shake = Math.max(G.shake, 6);
        }
    }
}
// 查找本通道中位于炮台下方的最近敌人（用于双头炮反向）
function findTargetBelowInLane(lane, aboveY) {
    let best = null, bestY = Infinity;
    for (const e of G.enemies) if (e.lane === lane && e.y > aboveY && e.y < bestY) { best = e; bestY = e.y; }
    return best;
}
// 双头炮：前后两个方向发射
function fireDoubleDir(u, w) {
    const sp = w.projSpeed || 10;
    const y0 = u.y - cellSize * 0.4;
    // 前向（上）
    const upTarget = findTargetInLane(u.lane, u.y);
    G.projectiles.push({
        kind: 'normal', x: u.x, y: y0, vx: 0, vy: -sp,
        dmg: u.atk, color: w.color, lane: u.lane, free: false,
        splash: 0, slow: 0, slowDuration: 0, chain: 0, chainRadius: 0, splits: 0,
        bounces: 0, cloudRadius: 0, cloudDmg: 0, cloudLife: 0, r: 6,
    });
    // 后向（下）
    const downTarget = findTargetBelowInLane(u.lane, u.y);
    const y1 = u.y + cellSize * 0.4;
    G.projectiles.push({
        kind: 'normal', x: u.x, y: y1, vx: 0, vy: sp,
        dmg: u.atk, color: w.color, lane: u.lane, free: false,
        splash: 0, slow: 0, slowDuration: 0, chain: 0, chainRadius: 0, splits: 0,
        bounces: 0, cloudRadius: 0, cloudDmg: 0, cloudLife: 0, r: 6,
    });
}
// 杨桃：多方向星弹
function fireStar(u, w) {
    const sp = w.projSpeed || 9;
    const dirs = [[0, -1], [-0.7, -0.7], [0.7, -0.7], [-1, -0.25], [1, -0.25]];
    dirs.forEach(([dx, dy]) => {
        G.projectiles.push({
            kind: 'normal', x: u.x, y: u.y - cellSize * 0.4, vx: dx * sp, vy: dy * sp,
            dmg: u.atk, color: w.color, free: true, hitSet: new Set(), r: 5,
        });
    });
}
function findTargetInLane(lane, belowY) {
    let best = null, bestY = -Infinity;
    for (const e of G.enemies) if (e.lane === lane && e.y < belowY && e.y > bestY) { best = e; bestY = e.y; }
    return best;
}

// ---------- 勇士（军队） ----------
function spawnWarrior(u, w) {
    G.warriors.push({
        owner: u.key, lane: u.lane, x: u.x + (Math.random() - 0.5) * colW * 0.4, y: u.y - cellSize * 0.4,
        hp: w.warriorHp, maxHp: w.warriorHp, atk: w.warriorAtk, speed: w.warriorSpeed,
        frame: Math.random() * 8, atkCd: 0, state: 'walk',
    });
}
function updateWarriors() {
    const wSize = cellSize * 1.25;
    for (let i = G.warriors.length - 1; i >= 0; i--) {
        const wr = G.warriors[i];
        if (wr.hp <= 0) { spawnParticles(wr.x, wr.y, '#eab308', 12); G.warriors.splice(i, 1); continue; }
        wr.frame += 0.25;
        const range = wSize * 0.5 + 8;
        const target = nearestEnemyInLane(wr.lane, wr.y, false);
        if (target && Math.abs(target.y - wr.y) < range + target.size * 0.4) {
            wr.state = 'attack';
            if (--wr.atkCd <= 0) { damageEnemy(target, wr.atk); wr.atkCd = 38; target.hitFlash = 4; }
        } else {
            wr.state = 'walk';
            wr.y -= wr.speed;
            if (wr.y < enemyBaseSize * 0.6) wr.y = enemyBaseSize * 0.6;
        }
    }
}

function updateEnemies() {
    const wSize = cellSize * 1.25;
    for (let i = G.enemies.length - 1; i >= 0; i--) {
        const e = G.enemies[i];
        e.frame += 0.15;
        if (e.hitFlash > 0) e.hitFlash--;
        if (e.slowTimer > 0) e.slowTimer--; else e.slowFactor = 1;

        const blocker = findBlocker(e, wSize);
        if (blocker) {
            if (--e.atkCd <= 0) {
                e.atkCd = 45;
                blocker.obj.hp -= e.def.atk; blocker.obj.hitFlash = 8;
                spawnParticles(blocker.obj.x, blocker.obj.y - cellSize * 0.2, '#ef4444', 4);
                if (blocker.obj.hp <= 0 && blocker.kind === 'unit') {
                    spawnParticles(blocker.obj.x, blocker.obj.y, DEF_WEAPONS[blocker.obj.id].color, 16);
                    delete G.units[blocker.obj.key];
                }
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
function findBlocker(e, wSize) {
    let best = null, bestY = Infinity;
    // 勇士阻挡
    for (const wr of G.warriors) {
        if (wr.lane !== e.lane || wr.hp <= 0) continue;
        if (Math.abs(wr.y - e.y) < (e.size * 0.4 + wSize * 0.4) && wr.y < bestY) { best = { kind: 'warrior', obj: wr }; bestY = wr.y; }
    }
    // 炮台阻挡（地刺/地雷/炸弹类不阻挡）
    const nonBlock = { spike: 1, mine: 1, cherry: 1, jalapeno: 1, fissure: 1, taichi: 1 };
    for (const key in G.units) {
        const u = G.units[key];
        if (u.lane !== e.lane || nonBlock[u.render]) continue;
        const contact = e.y + e.size * 0.4 >= u.y - cellSize * 0.4 && u.y > e.y - cellSize * 0.5;
        if (contact && u.y < bestY) { best = { kind: 'unit', obj: u }; bestY = u.y; }
    }
    return best;
}

// ---------- 子弹 ----------
function fireProjectile(u, target, laneOverride) {
    const w = DEF_WEAPONS[u.id];
    const sp = w.projSpeed || 8;
    const lane = (laneOverride != null) ? laneOverride : u.lane;
    const y0 = u.y - cellSize * 0.4;
    const p = {
        kind: w.proj, x: laneOverride != null ? laneX(lane) : u.x, y: y0, vx: 0, vy: -sp,
        dmg: u.atk, color: w.color, lane, free: false,
        splash: w.splashRadius || 0, slow: w.slow || 0, slowDuration: w.slowDuration || 0,
        chain: w.chain || 0, chainRadius: w.chainRadius || 0, splits: w.splits || 0,
        bounces: w.bounces || 0, hitSet: null, r: w.proj === 'bounce' ? 9 : (w.splash ? 8 : 6),
        cloudRadius: w.cloudRadius || 0, cloudDmg: w.cloudDmg || 0, cloudLife: w.cloudLife || 0,
        burnDmg: w.burnDmg || 0, burnDuration: w.burnDuration || 0,
    };
    if (w.proj === 'bounce') { p.free = true; p.vx = (Math.random() * 2 - 1) * sp * 0.7; p.hitSet = new Set(); }
    if (w.proj === 'boomerang') { p.hitSet = new Set(); p.startY = y0; p.maxUp = H * 0.55; p.returning = false; }
    G.projectiles.push(p);
}
function updateProjectiles() {
    for (let i = G.projectiles.length - 1; i >= 0; i--) {
        const p = G.projectiles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.kind === 'bounce') {
            if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx); p.bounces--; p.hitSet.clear(); }
            else if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx); p.bounces--; p.hitSet.clear(); }
            if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy); p.bounces--; p.hitSet.clear(); }
            if (p.bounces < 0 || p.y > baseLineY) { G.projectiles.splice(i, 1); continue; }
        } else if (p.kind === 'boomerang') {
            if (!p.returning && p.y <= p.startY - p.maxUp) { p.returning = true; p.vy = Math.abs(p.vy); p.hitSet.clear(); }
            if (p.returning && p.y > p.startY + 20) { G.projectiles.splice(i, 1); continue; }
        } else {
            if (p.y < -30 || p.y > H + 30 || p.x < -30 || p.x > W + 30) { G.projectiles.splice(i, 1); continue; }
        }
        // 碰撞
        let hit = null;
        if (p.free || p.kind === 'boomerang') {
            for (const e of G.enemies) {
                if (p.hitSet && p.hitSet.has(e)) continue;
                if (Math.hypot(e.x - p.x, e.y - p.y) < e.size * 0.5 + p.r) { hit = e; break; }
            }
        } else {
            for (const e of G.enemies) {
                if (e.lane === p.lane && Math.abs(e.y - p.y) < e.size * 0.45) { hit = e; break; }
            }
        }
        if (hit) { if (handleHit(p, hit)) G.projectiles.splice(i, 1); }
    }
}
function handleHit(p, e) {
    // 返回 true 表示移除该子弹
    switch (p.kind) {
        case 'splash':
            bigExplosion(p.x, p.y, p.splash, p.color);
            for (const o of G.enemies) { const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < p.splash) damageEnemy(o, p.dmg * (o === e ? 1 : 0.75)); }
            return true;
        case 'slow':
            damageEnemy(e, p.dmg);
            freezeBurst(p.x, p.y, p.splash || 60);
            if (p.splash) { for (const o of G.enemies) { if (Math.hypot(o.x - p.x, o.y - p.y) < p.splash) { damageEnemy(o, p.dmg * 0.5); applySlow(o, p); } } }
            applySlow(e, p); return true;
        case 'poison':
            damageEnemy(e, p.dmg);
            G.clouds.push({ x: p.x, y: p.y, r: p.cloudRadius, dmg: p.cloudDmg, life: p.cloudLife, tick: 0 });
            for (let k = 0; k < 16; k++) spawnParticles(p.x, p.y, '#65a30d', 1);
            return true;
        case 'chain':
            damageEnemy(e, p.dmg); chainHit(e, p); return true;
        case 'split':
            damageEnemy(e, p.dmg); spawnParticles(p.x, p.y, p.color, 6);
            if (p.splits > 0) {
                [-1, 1].forEach(dir => {
                    G.projectiles.push({
                        kind: 'split', x: p.x, y: p.y, vx: dir * 4, vy: -5, free: true,
                        dmg: p.dmg / 2, color: p.color, splits: p.splits - 1, r: 6,
                        hitSet: new Set([e]),
                    });
                });
            }
            return true;
        case 'bounce':
            damageEnemy(e, p.dmg); p.hitSet.add(e); spawnParticles(p.x, p.y, p.color, 5); return false;
        case 'boomerang':
            damageEnemy(e, p.dmg); p.hitSet.add(e); spawnParticles(p.x, p.y, p.color, 5); return false;
        case 'fire':
            damageEnemy(e, p.dmg);
            // 火焰灼烧区域
            G.clouds.push({ x: p.x, y: p.y, r: p.splash || 120, dmg: p.burnDmg || 8, life: p.burnDuration || 90, tick: 0, fire: true });
            // 爆炸火花
            for (let k = 0; k < 20; k++) {
                const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 5;
                G.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 26 + Math.random() * 20, color: k % 3 === 0 ? '#fde047' : (k % 3 === 1 ? '#f97316' : '#ef4444'), size: 3 + Math.random() * 5 });
            }
            G.flash = Math.max(G.flash, 0.25); G.shake = Math.max(G.shake, 4);
            return true;
        default:
            damageEnemy(e, p.dmg); spawnParticles(p.x, p.y, p.color, 6); return true;
    }
}
function applySlow(e, p) { e.slowFactor = 1 - p.slow; e.slowTimer = p.slowDuration; }
function chainHit(origin, p) {
    let last = origin, dmg = p.dmg * 0.7, remaining = p.chain;
    const hitSet = new Set([origin]);
    while (remaining-- > 0) {
        let best = null, bestD = p.chainRadius;
        for (const e of G.enemies) {
            if (hitSet.has(e)) continue;
            const d = Math.hypot(e.x - last.x, e.y - last.y);
            if (d < bestD) { bestD = d; best = e; }
        }
        if (!best) break;
        G.arcs.push({ x1: last.x, y1: last.y, x2: best.x, y2: best.y, life: 10 });
        damageEnemy(best, dmg); hitSet.add(best);
        last = best; dmg *= 0.85;
    }
}
function damageEnemy(e, dmg) {
    if (e._dead) return;
    e.hp -= dmg; e.hitFlash = 5;
    if (e.hp <= 0) {
        e._dead = true;
        const idx = G.enemies.indexOf(e); if (idx >= 0) G.enemies.splice(idx, 1);
        G.killed++;
        spawnParticles(e.x, e.y, '#fbbf24', e.def.isBoss ? 30 : 10);
        updateHud();
    }
}

// ---------- 粒子 / 电弧 ----------
function spawnParticles(x, y, color, n) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
        G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 20 + Math.random() * 15, color, size: 2 + Math.random() * 3 });
    }
}
function spawnExplosion(x, y, r, color) { G.particles.push({ x, y, vx: 0, vy: 0, life: 18, max: 18, color, size: r, ring: true }); spawnParticles(x, y, color, 20); }

// 大爆炸（樱桃/地雷/火炮）：火球 + 双环 + 大量火花 + 震屏
function bigExplosion(x, y, r, color) {
    G.particles.push({ x, y, vx: 0, vy: 0, life: 22, max: 22, color: '#fff7ed', size: r * 0.9, fireball: true });
    G.particles.push({ x, y, vx: 0, vy: 0, life: 26, max: 26, color: color || '#f97316', size: r, ring: true });
    G.particles.push({ x, y, vx: 0, vy: 0, life: 34, max: 34, color: '#fb923c', size: r * 1.3, ring: true });
    for (let i = 0; i < 36; i++) {
        const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
        G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 24 + Math.random() * 20, color: i % 2 ? '#f97316' : '#fbbf24', size: 3 + Math.random() * 4 });
    }
    G.shake = Math.max(G.shake, 16);
}
// 冰冻爆发：扩散蓝环 + 雪花 + 浅蓝闪
function freezeBurst(x, y, r) {
    G.particles.push({ x, y, vx: 0, vy: 0, life: 28, max: 28, color: '#7dd3fc', size: r, ring: true });
    G.particles.push({ x, y, vx: 0, vy: 0, life: 20, max: 20, color: 'rgba(186,230,253,0.6)', size: r * 0.8, fireball: true });
    for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
        G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 30 + Math.random() * 20, max: 50, color: '#e0f2fe', size: 3 + Math.random() * 4, snow: true });
    }
}
function updateParticles() {
    for (let i = G.particles.length - 1; i >= 0; i--) {
        const p = G.particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        if (p.life <= 0) G.particles.splice(i, 1);
    }
}
function updateArcs() { for (let i = G.arcs.length - 1; i >= 0; i--) if (--G.arcs[i].life <= 0) G.arcs.splice(i, 1); }

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
    drawBackground(); drawGrid(); drawClouds(); drawLasers(); drawUnits(); drawWarriors(); drawEnemies(); drawProjectiles(); drawArcs(); drawParticles();
    ctx.restore();
    if (G.flash > 0) { ctx.fillStyle = `rgba(239,68,68,${G.flash * 0.4})`; ctx.fillRect(0, 0, W, H); }
}
function drawClouds() {
    for (const cl of G.clouds) {
        const a = Math.min(0.45, cl.life / 260 + 0.1);
        const g = ctx.createRadialGradient(cl.x, cl.y, 2, cl.x, cl.y, cl.r);
        if (cl.fire) {
            // 火焰云
            g.addColorStop(0, `rgba(249,115,22,${a * 1.2})`); g.addColorStop(0.6, `rgba(239,68,68,${a * 0.7})`); g.addColorStop(1, 'rgba(185,28,28,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, 7); ctx.fill();
            // 火焰泡泡
            for (let k = 0; k < 6; k++) {
                const ang = (G.frame * 0.06 + k * 1.05), rr = cl.r * (0.2 + 0.6 * ((k * 7 + G.frame * 0.8) % 10) / 10);
                ctx.fillStyle = `rgba(${k % 2 ? '253,224,71' : '251,146,60'},${a * 0.9})`;
                ctx.beginPath(); ctx.arc(cl.x + Math.cos(ang) * rr, cl.y + Math.sin(ang) * rr - 2, cl.r * 0.08, 0, 7); ctx.fill();
            }
        } else {
            g.addColorStop(0, `rgba(132,204,22,${a})`); g.addColorStop(1, 'rgba(101,163,13,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.r, 0, 7); ctx.fill();
            // 漂浮的毒泡
            for (let k = 0; k < 5; k++) {
                const ang = (G.frame * 0.04 + k * 1.3), rr = cl.r * (0.3 + 0.5 * ((k * 7 + G.frame * 0.5) % 10) / 10);
                ctx.fillStyle = `rgba(163,230,53,${a * 0.8})`;
                ctx.beginPath(); ctx.arc(cl.x + Math.cos(ang) * rr, cl.y + Math.sin(ang) * rr, cl.r * 0.12, 0, 7); ctx.fill();
            }
        }
    }
}
function drawLasers() {
    for (const key in G.units) {
        const u = G.units[key];
        if (DEF_WEAPONS[u.id].special !== 'laser' || !u.beamOn) continue;
        const x = u.x;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = 'rgba(248,113,113,0.35)'; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(x, u.y - cellSize * 0.3); ctx.lineTo(x, 0); ctx.stroke();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 4; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(x, u.y - cellSize * 0.3); ctx.lineTo(x, 0); ctx.stroke();
        ctx.restore();
    }
}
function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1040'); g.addColorStop(0.45, '#13213f'); g.addColorStop(0.75, '#163a36'); g.addColorStop(1, '#1f3d22');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 97.3) % W, (i * 53.7) % (H * 0.5), 2, 2);
    // 通道分隔
    ctx.strokeStyle = 'rgba(148,163,184,0.1)'; ctx.lineWidth = 2;
    for (let l = 1; l < DEF_LANES; l++) { ctx.beginPath(); ctx.moveTo(l * enemyLaneW, 0); ctx.lineTo(l * enemyLaneW, gridBottom); ctx.stroke(); }
    const bg = ctx.createLinearGradient(0, baseLineY - 14, 0, baseLineY);
    bg.addColorStop(0, 'rgba(34,197,94,0)'); bg.addColorStop(1, 'rgba(34,197,94,0.35)');
    ctx.fillStyle = bg; ctx.fillRect(0, baseLineY - 14, W, 14);
    ctx.strokeStyle = 'rgba(132,204,22,0.6)'; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(0, baseLineY); ctx.lineTo(W, baseLineY); ctx.stroke(); ctx.setLineDash([]);
}
function drawGrid() {
    const showValid = !!G.selected;
    for (let c = 0; c < DEF_COLS; c++) for (let r = 0; r < DEF_PLACE_ROWS; r++) {
        const cx = colX(c), cy = rowsY[r], s = cellSize * 0.92, empty = !G.units[`${c}_${r}`];
        ctx.lineWidth = 1.5;
        if (showValid && empty) {
            ctx.strokeStyle = 'rgba(132,204,22,0.7)'; ctx.fillStyle = 'rgba(132,204,22,0.1)';
            roundRectPath(ctx, cx - s / 2, cy - s / 2, s, s, 8); ctx.fill(); ctx.stroke();
        } else { ctx.strokeStyle = 'rgba(148,163,184,0.12)'; roundRectPath(ctx, cx - s / 2, cy - s / 2, s, s, 8); ctx.stroke(); }
    }
}
function drawUnits() {
    for (const key in G.units) {
        const u = G.units[key], w = DEF_WEAPONS[u.id];
        ctx.save();
        const grad = ctx.createRadialGradient(u.x, u.y, 2, u.x, u.y, cellSize * 0.5);
        grad.addColorStop(0, w.color + '55'); grad.addColorStop(1, w.color + '00');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(u.x, u.y, cellSize * 0.48, 0, 7); ctx.fill(); ctx.restore();
        const jit = u.hitFlash > 0 ? (Math.random() - 0.5) * 3 : 0;
        const turretOpts = { frame: u.frame, attacking: u.attacking };
        if (u.render === 'fissure') {
            turretOpts.fissureOpen = u.fissurePhase === 'open';
            turretOpts.fissureTimer = u.fissureTimer;
            turretOpts.fissureTotal = u.fissurePhase === 'open' ? w.openTime : w.closeTime;
        }
        drawTurret(ctx, u.render, u.x + jit, u.y, cellSize * 0.92, turretOpts);
        if (u.hitFlash > 0) { ctx.save(); ctx.globalAlpha = u.hitFlash / 8 * 0.5; ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(u.x, u.y, cellSize * 0.46, 0, 7); ctx.fill(); ctx.restore(); }
        if (u.hp < u.maxHp) drawHpRing(u.x, u.y, cellSize * 0.5, u.hp / u.maxHp);
    }
}
function drawHpRing(cx, cy, radius, ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    const lw = Math.max(3, radius * 0.16);
    ctx.lineWidth = lw; ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    let color = '#22c55e'; if (ratio < 0.3) color = '#ef4444'; else if (ratio < 0.6) color = '#f59e0b';
    ctx.strokeStyle = color; ctx.lineCap = 'round';
    const start = -Math.PI / 2;
    ctx.beginPath(); ctx.arc(cx, cy, radius, start, start + Math.PI * 2 * ratio); ctx.stroke();
    ctx.lineCap = 'butt';
}
function drawWarriors() {
    const wSize = cellSize * 1.5;
    for (const wr of G.warriors) {
        const anim = wr.state === 'attack' ? ASSETS.warriorAttack : ASSETS.warriorWalk;
        drawWarriorFrame(ctx, anim, wr.frame, wr.x, wr.y, wSize, false);
        if (wr.hp < wr.maxHp) drawHpRing(wr.x, wr.y, wSize * 0.32, wr.hp / wr.maxHp);
    }
}
function drawEnemies() {
    for (const e of G.enemies) {
        if (e.def.render === 'lizard') {
            const frames = ASSETS.lizardWalk;
            if (frames && frames.length) {
                const img = frames[Math.floor(e.frame) % frames.length];
                ctx.save(); if (e.hitFlash > 0) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; }
                drawSprite(img, e.x, e.y, e.size); ctx.restore();
            }
        } else { drawEnemyArt(ctx, e.def.render, e.x, e.y, e.size, e.frame, e.hitFlash); }
        // 被冰冻/减速时的蓝色霜冻覆盖
        if (e.slowTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.35; ctx.fillStyle = '#7dd3fc';
            ctx.beginPath(); ctx.arc(e.x, e.y, e.size * 0.45, 0, 7); ctx.fill();
            ctx.globalAlpha = 0.7; ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.size * 0.45, 0, 7); ctx.stroke();
            ctx.restore();
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
    ctx.imageSmoothingEnabled = false; ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}
function drawBar(cx, y, w, ratio, color) {
    ratio = Math.max(0, Math.min(1, ratio));
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRectPath(ctx, cx - w / 2, y, w, 5, 2.5); ctx.fill();
    ctx.fillStyle = color; roundRectPath(ctx, cx - w / 2, y, w * ratio, 5, 2.5); ctx.fill();
}
function drawProjectiles() {
    for (const p of G.projectiles) {
        ctx.save();
        if (p.kind === 'fire') {
            // 火球：外焰 + 内核 + 拖尾
            ctx.shadowBlur = 16; ctx.shadowColor = '#f97316';
            ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.5, 0, 7); ctx.fill();
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.8, 0, 7); ctx.fill();
            ctx.globalAlpha = 0.6; ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
            // 尾焰
            ctx.globalAlpha = 0.5; ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(p.x, p.y + p.r, p.r * 0.7, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
        } else {
            ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
            if (p.kind === 'bounce') { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.35, 0, 7); ctx.fill(); }
        }
        ctx.restore();
    }
}
function drawArcs() {
    for (const a of G.arcs) {
        ctx.save(); ctx.strokeStyle = '#e9d5ff'; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5; ctx.globalAlpha = a.life / 10;
        ctx.beginPath(); ctx.moveTo(a.x1, a.y1);
        const mx = (a.x1 + a.x2) / 2 + (Math.random() - 0.5) * 20, my = (a.y1 + a.y2) / 2 + (Math.random() - 0.5) * 20;
        ctx.lineTo(mx, my); ctx.lineTo(a.x2, a.y2); ctx.stroke(); ctx.restore();
    }
}
function drawParticles() {
    for (const p of G.particles) {
        const max = p.max || 18;
        if (p.ring) {
            const prog = 1 - p.life / max;
            ctx.strokeStyle = p.color; ctx.globalAlpha = Math.max(0, p.life / max); ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * Math.max(0.05, prog), 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        } else if (p.fireball) {
            const prog = 1 - p.life / max;
            ctx.globalAlpha = Math.max(0, p.life / max * 0.8); ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + prog * 0.7), 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        } else if (p.snow) {
            ctx.globalAlpha = Math.max(0, p.life / max); ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 0.2);
            ctx.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3); ctx.fillRect(-p.size / 6, -p.size / 2, p.size / 3, p.size);
            ctx.restore(); ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = Math.max(0, p.life / 35); ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); ctx.globalAlpha = 1;
        }
    }
}

// ============================================================
//  循环 / 结算
// ============================================================
function loop() {
    if (!G || !G.running) return;
    if (!G.paused) update();
    render();
    updatePrepBanner();
    rafId = requestAnimationFrame(loop);
}
function endBattle(win) {
    if (G.ended) return;
    G.ended = true; G.running = false; cancelAnimationFrame(rafId);
    setTimeout(() => showResult(win), 500);
}
function showResult(win) {
    const data = getDefData();
    if (win && G.level >= data.highestLevel) { data.highestLevel = G.level + 1; saveDefData(data); }
    document.getElementById('resultIcon').textContent = win ? '🏆' : '💔';
    document.getElementById('resultTitle').textContent = win ? '守卫成功！' : '家园失守…';
    document.getElementById('resultStats').innerHTML = `
        <div class="rs-item"><div class="rs-val">${G.killed}</div><div class="rs-label">击败敌人</div></div>
        <div class="rs-item"><div class="rs-val">${G.lives}</div><div class="rs-label">剩余生命</div></div>`;
    document.getElementById('resultReward').textContent = win ? '已解锁下一关！（积分只能靠表现获得）' : '再接再厉，换个布阵试试！';
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
        for (const key in G.units) { const u = G.units[key]; u.x = colX(u.col); u.y = rowsY[u.row]; }
    }
});
