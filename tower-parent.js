// 家长端逻辑 v4 - 面板式 + 亮色

// ===== 隐藏授权键（按住Z才能操作奖惩积分）=====
let _zKeyActive = false;
document.addEventListener('keydown', e => { if (e.key === 'z' || e.key === 'Z') _zKeyActive = true; });
document.addEventListener('keyup',   e => { if (e.key === 'z' || e.key === 'Z') _zKeyActive = false; });

// === 增强型来源识别系统 (具备记忆功能) ===
function getNavigationSource() {
    const urlParams = new URLSearchParams(window.location.search);
    let source = urlParams.get('source');
    
    // 如果 URL 里带了来源，就存进“短期记忆”里；如果没有，就从记忆里读
    if (source) {
        sessionStorage.setItem('last_navigation_source', source);
    } else {
        source = sessionStorage.getItem('last_navigation_source');
    }
    return source;
}

// 全局路由跳转函数，彻底替代原本 HTML 里的硬编码
function handleReturnToBattle() {
    const source = getNavigationSource();
    if (source === 'top3d') {
        location.href = 'top-arena-3d.html';
    } else if (source === 'top') {
        location.href = 'top-game.html';
    } else {
        // 默认回塔防，但也要带上标记让它重连
        sessionStorage.setItem('fromParent', '1');
        location.href = 'tower-game.html';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    showTodayPwd();
    
    // 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    
    // 处理面板自动打开
    const targetPanel = urlParams.get('panel');
    if (targetPanel && PANELS[targetPanel]) {
        openPanel(targetPanel);
    }
    
    // 根据来源更新 UI 按钮的文字 (真正的跳转逻辑已交由 handleReturnToBattle 接管)
    const source = getNavigationSource();
    if (source === 'top' || source === 'top3d') {
        const is3D = source === 'top3d';
        const targetName = is3D ? '3D 陀螺竞技场' : '陀螺竞技场';
        
        const backBtn = document.querySelector('.btn-back');
        if (backBtn) backBtn.textContent = `← ${targetName}`;
        
        const gotoBattleBtn = document.querySelector('.btn-battle');
        if (gotoBattleBtn) gotoBattleBtn.textContent = `⚙️ 前往${targetName}`;
    }
});

// ===== 今日密码（当天星期几英文全拼）=====
let pwdVisible = false;

function lockGetPwd() {
    const now = new Date();
    const day = now.getDay();
    const englishMap = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
    };
    return englishMap[day];
}

function showTodayPwd() {
    // 初始化时不显示，等用户点击
}

function togglePwd(btn) {
    const el = document.getElementById('todayPwd');
    pwdVisible = !pwdVisible;
    el.textContent = pwdVisible ? lockGetPwd() : '••••';
    // 5秒后自动隐藏
    if (pwdVisible) {
        clearTimeout(btn._hideTimer);
        btn._hideTimer = setTimeout(() => {
            el.textContent = '••••';
            pwdVisible = false;
        }, 5000);
    }
}

function renderHeader() {
    const data = getTowerData();
    document.getElementById('headerPts').textContent = `积分: ${data.points}`;
}

// ===== 面板系统 =====
const PANELS = {
    reward:  { title: '✅ 今日奖励',  render: renderRewards },
    penalty: { title: '❌ 今日惩罚',  render: renderPenalties },
    shop:    { title: '🔧 武器商店',  render: renderWeaponShop },
    slots:   { title: '🗺️ 塔位解锁', render: renderSlots },
    history: { title: '📋 积分记录',  render: renderHistory },
};

let currentPanel = null;

function openPanel(key) {
    currentPanel = key;
    const p = PANELS[key];
    document.getElementById('panelTitle').textContent = p.title;
    const data = getTowerData();
    p.render(data);
    document.getElementById('panelMask').classList.add('show');
    document.getElementById('panelDrawer').classList.add('show');
}

function closePanel() {
    document.getElementById('panelMask').classList.remove('show');
    document.getElementById('panelDrawer').classList.remove('show');
    currentPanel = null;
}

function refreshPanel() {
    if (!currentPanel) return;
    const data = getTowerData();
    PANELS[currentPanel].render(data);
    renderHeader();
}

// ===== 积分操作 =====
function earnPoints(pts, label, btnEl) {
    if (!_zKeyActive) return; // 未按授权键，静默拦截
    const data = getTowerData();
    data.points = Math.max(0, data.points + pts);
    data.history = data.history || [];
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label, pts });
    if (data.history.length > 50) data.history = data.history.slice(0, 50);
    saveTowerData(data);
    renderHeader();
    // 按钮闪烁反馈
    if (btnEl) {
        btnEl.classList.add('flash');
        setTimeout(() => btnEl.classList.remove('flash'), 400);
    }
    // 浮动提示
    showPtsToast(pts);
    // 刷新当前面板内容（不关闭）
    if (currentPanel === 'reward' || currentPanel === 'penalty') {
        const d = getTowerData();
        PANELS[currentPanel].render(d);
    }
}

function showPtsToast(pts) {
    let toast = document.getElementById('ptsToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ptsToast';
        toast.className = 'pts-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = pts > 0 ? `+${pts} 分 🎉` : `${pts} 分`;
    toast.style.color = pts > 0 ? '#4ade80' : '#f87171';
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 1200);
}

function nukePoints() {
    if (!_zKeyActive) return;
    const data = getTowerData();
    const lost = data.points;
    data.points = 0;
    data.history = data.history || [];
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: '💀 偷玩并修改密码', pts: -lost });
    if (data.history.length > 50) data.history = data.history.slice(0, 50);
    saveTowerData(data);
    renderHeader();
    showPtsToast(-lost);
    const d = getTowerData();
    renderPenalties(d);
}

// ===== 今日奖励 =====
function renderRewards(data) {
    document.getElementById('panelBody').innerHTML = `
        <div class="reward-list">
            ${DAILY_REWARDS.map(r => `
                <div class="reward-item">
                    <span class="reward-icon">${r.icon}</span>
                    <span class="reward-label">${r.label}</span>
                    <button class="btn-earn" onclick="earnPoints(${r.pts}, '${r.label}', this)">+${r.pts}分</button>
                </div>
            `).join('')}
        </div>`;
}

// ===== 今日惩罚 =====
function renderPenalties(data) {
    document.getElementById('panelBody').innerHTML = `
        <div class="reward-list">
            ${DAILY_PENALTIES.map(p => `
                <div class="reward-item penalty">
                    <span class="reward-icon">${p.icon}</span>
                    <span class="reward-label">${p.label}</span>
                    <button class="btn-deduct" onclick="earnPoints(${p.pts}, '${p.label}', this)">${p.pts}分</button>
                </div>
            `).join('')}
            <div class="reward-item penalty penalty-nuke">
                <span class="reward-icon">💀</span>
                <span class="reward-label">偷玩并修改密码</span>
                <button class="btn-deduct btn-nuke" onclick="nukePoints()">清零</button>
            </div>
        </div>`;
}

// ===== 武器商店 =====
function renderWeaponShop(data) {
    const instances = data.weaponInstances || [];
    const today = new Date().toLocaleDateString('zh-CN');
    const sellsLeft = 2 - ((data.sellLog || {})[today] || 0);

    // 普通武器购买区
    const buySection = Object.values(TOWER_TYPES).map(type => {
        const canAfford = data.points >= type.unlockCost;
        return `
        <div class="weapon-buy-row">
            <span class="weapon-emoji">${type.emoji}</span>
            <div class="weapon-info">
                <div class="weapon-name">${type.name}</div>
                <div class="weapon-base">攻${type.baseAtk} 程${type.baseRange} 速${type.baseSpeed}</div>
            </div>
            <button class="btn-buy ${canAfford ? '' : 'disabled'}" onclick="buyWeapon('${type.id}')">
                购买 ${type.unlockCost}分
            </button>
        </div>`;
    }).join('');

    // 特殊炮台购买区
    const specialSection = Object.values(SPECIAL_TOWERS).filter(type => !type.hidden).map(type => {
        const canAfford = data.points >= type.unlockCost;
        return `
        <div class="weapon-buy-row" style="border-left:3px solid ${type.color}">
            <span class="weapon-emoji">${type.emoji}</span>
            <div class="weapon-info">
                <div class="weapon-name" style="color:${type.color}">${type.name}</div>
                <div class="weapon-base">${type.desc}</div>
            </div>
            <button class="btn-buy ${canAfford ? '' : 'disabled'}" onclick="buyWeapon('${type.id}')">
                购买 ${type.unlockCost}分
            </button>
        </div>`;
    }).join('');

    // 已拥有武器实例列表
    const instanceSection = instances.length === 0
        ? '<div class="empty-history">还没有武器，购买后在这里管理升级</div>'
        : instances.map((inst, idx) => {
            const type = TOWER_TYPES[inst.typeId] || SPECIAL_TOWERS[inst.typeId];
            if (!type) return '';
            const isSpecial = !!SPECIAL_TOWERS[inst.typeId];
            const stats = isSpecial ? null : calcTowerStats(inst.typeId, inst.upgrades || []);
            const upgCount = (inst.upgrades || []).length;
            const placedSlot = Object.entries(data.towers || {}).find(([, iid]) => iid === inst.id);
            const placedLabel = placedSlot ? `塔位${parseInt(placedSlot[0])+1}` : '未部署';
            return `
            <div class="inst-card" style="border-color:${type.color}55">
                <div class="inst-header">
                    <span class="inst-emoji">${type.emoji}</span>
                    <div class="inst-info">
                        <div class="inst-name">${type.name} #${idx+1}${isSpecial ? ' <span style="font-size:10px;color:#94a3b8">特殊</span>' : ''}</div>
                        <div class="inst-stats">${isSpecial ? type.desc : `攻${stats.atk} 程${stats.range} 速${(stats.speed*stats.speedMult).toFixed(1)} 升级×${upgCount}`}</div>
                    </div>
                    <div class="inst-actions">
                        <span class="inst-place ${placedSlot ? 'placed' : ''}">${placedLabel}</span>
                        <div style="display:flex;gap:4px">
                            ${!isSpecial ? `<button class="btn-upg-open" onclick="openUpgradeModal('${inst.id}')">升级</button>` : ''}
                            <button class="btn-sell ${sellsLeft <= 0 ? 'disabled' : ''}" onclick="sellWeapon('${inst.id}')" title="退还全部积分，今日剩余${sellsLeft}次">卖出</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

    document.getElementById('panelBody').innerHTML = `
        <div class="buy-section">${buySection}</div>
        <div class="section-subtitle">⚡ 特殊炮台（只买不升级）</div>
        <div class="buy-section">${specialSection}</div>
        <div class="section-subtitle">已拥有武器 <span style="font-size:11px;color:#94a3b8">今日可卖出 ${sellsLeft}/2 次</span></div>
        <div class="inst-list">${instanceSection}</div>`;
}

function buyWeapon(typeId) {
    const data = getTowerData();
    // 检查是普通塔还是特殊塔
    const type = TOWER_TYPES[typeId] || SPECIAL_TOWERS[typeId];
    if (!type) return;
    if (data.points < type.unlockCost) return;
    data.points -= type.unlockCost;
    data.weaponInstances = data.weaponInstances || [];
    data.weaponInstances.push({ id: newInstanceId(), typeId, upgrades: [], isSpecial: !!SPECIAL_TOWERS[typeId] });
    data.history = data.history || [];
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: `购买武器: ${type.name}`, pts: -type.unlockCost });
    saveTowerData(data);
    renderHeader();
    showPtsToast(-type.unlockCost);
    renderWeaponShop(getTowerData());
}

// ===== 卖出武器（每日限2次，退还全部积分）=====
function sellWeapon(instId) {
    const data = getTowerData();
    const today = new Date().toLocaleDateString('zh-CN');
    data.sellLog = data.sellLog || {};
    const todaySells = (data.sellLog[today] || 0);
    // Z键后门：跳过每日2次限制
    if (!_zKeyActive && todaySells >= 2) {
        const toast = document.getElementById('ptsToast');
        if (toast) { toast.textContent = '今日已卖出2次'; toast.style.color = '#f87171'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); }
        return;
    }
    const inst = (data.weaponInstances || []).find(i => i.id === instId);
    if (!inst) return;
    const type = TOWER_TYPES[inst.typeId] || SPECIAL_TOWERS[inst.typeId];
    if (!type) return;

    // 计算退还积分：购买费 + 所有升级费
    let refund = type.unlockCost;
    if (!inst.isSpecial && type.upgrades) {
        (inst.upgrades || []).forEach(uid => {
            const upg = type.upgrades.find(u => u.id === uid);
            if (upg) refund += upg.cost;
        });
    }

    // 从塔位移除
    Object.keys(data.towers || {}).forEach(slotId => {
        if (data.towers[slotId] === instId) delete data.towers[slotId];
    });

    data.weaponInstances = data.weaponInstances.filter(i => i.id !== instId);
    data.points += refund;
    data.sellLog[today] = todaySells + 1;
    data.history = data.history || [];
    data.history.unshift({ date: today, label: `卖出武器: ${type.name}（今日第${todaySells+1}次）`, pts: refund });
    saveTowerData(data);
    renderHeader();
    showPtsToast(refund);
    renderWeaponShop(getTowerData());
}

// ===== 升级弹窗 =====
let modalInstId = null;

function openUpgradeModal(instId) {
    modalInstId = instId;
    renderUpgradeModal();
    document.getElementById('upgradeModal').classList.add('show');
}

function closeUpgradeModal() {
    document.getElementById('upgradeModal').classList.remove('show');
    modalInstId = null;
}

function renderUpgradeModal() {
    const data = getTowerData();
    const inst = (data.weaponInstances || []).find(i => i.id === modalInstId);
    if (!inst) return;
    const type = TOWER_TYPES[inst.typeId];
    const upgrades = inst.upgrades || [];
    const stats = calcTowerStats(inst.typeId, upgrades);
    const idx = (data.weaponInstances || []).indexOf(inst);

    document.getElementById('modalTitle').textContent = `${type.emoji} ${type.name} #${idx+1}`;
    document.getElementById('modalPts').textContent = `当前积分: ${data.points}`;
    document.getElementById('modalStats').textContent =
        `攻击 ${stats.atk}  射程 ${stats.range}  速度 ${(stats.speed * stats.speedMult).toFixed(2)}  多发 ×${stats.multiShot}`;

    document.getElementById('modalUpgList').innerHTML = type.upgrades.map(upg => {
        const done = upgrades.includes(upg.id);
        const reqMet = !upg.requires || upgrades.includes(upg.requires);
        const canBuy = !done && reqMet && data.points >= upg.cost;
        return `
        <div class="modal-upg-row ${done ? 'done' : ''} ${!reqMet ? 'locked-upg' : ''}">
            <div class="upg-info">
                <span class="upg-name">${upg.label}</span>
                <span class="upg-desc">${upg.desc}</span>
                ${upg.requires && !done ? `<span class="upg-req">需先: ${getUpgLabel(type, upg.requires)}</span>` : ''}
            </div>
            <div class="upg-right">
                ${done
                    ? `<span class="upg-done">✓</span>`
                    : `<button class="btn-upg ${canBuy ? '' : 'disabled'}" onclick="buyUpgrade('${inst.id}','${upg.id}')">${upg.cost}分</button>`
                }
            </div>
        </div>`;
    }).join('');
}

function getUpgLabel(type, reqId) {
    const u = type.upgrades.find(u => u.id === reqId);
    return u ? u.label : reqId;
}

function buyUpgrade(instId, upgId) {
    const data = getTowerData();
    const inst = (data.weaponInstances || []).find(i => i.id === instId);
    if (!inst) return;
    const type = TOWER_TYPES[inst.typeId];
    const upg = type.upgrades.find(u => u.id === upgId);
    if (!upg || data.points < upg.cost) return;
    data.points -= upg.cost;
    inst.upgrades = inst.upgrades || [];
    if (!inst.upgrades.includes(upgId)) inst.upgrades.push(upgId);
    data.history = data.history || [];
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: `升级 ${type.name}: ${upg.label}`, pts: -upg.cost });
    saveTowerData(data);
    showPtsToast(-upg.cost);
    renderUpgradeModal();
    document.getElementById('headerPts').textContent = `积分: ${data.points}`;
    renderWeaponShop(getTowerData());
}

// ===== 塔位解锁 =====
function renderSlots(data) {
    document.getElementById('panelBody').innerHTML = `
        <div class="slot-grid">
            ${TOWER_SLOTS.map(slot => {
                const unlocked = (data.unlockedSlots || []).includes(slot.id);
                const canBuy = !unlocked && data.points >= slot.unlockCost;
                return `
                <div class="slot-card ${unlocked ? 'unlocked' : ''}">
                    <div class="slot-id">塔位 ${slot.id + 1}</div>
                    <div class="slot-pos">(${slot.x},${slot.y})</div>
                    ${unlocked
                        ? `<div class="slot-status">✓</div>`
                        : slot.unlockCost === 0
                            ? `<div class="slot-status free">免费</div>`
                            : `<button class="btn-slot ${canBuy ? '' : 'disabled'}" onclick="unlockSlot(${slot.id})">${slot.unlockCost}分</button>`
                    }
                </div>`;
            }).join('')}
        </div>`;
}

function unlockSlot(slotId) {
    const data = getTowerData();
    const slot = TOWER_SLOTS[slotId];
    if (!slot || data.points < slot.unlockCost) return;
    data.points -= slot.unlockCost;
    data.unlockedSlots = data.unlockedSlots || [];
    if (!data.unlockedSlots.includes(slotId)) data.unlockedSlots.push(slotId);
    data.history = data.history || [];
    data.history.unshift({ date: new Date().toLocaleDateString('zh-CN'), label: `解锁塔位 ${slotId+1}`, pts: -slot.unlockCost });
    saveTowerData(data);
    renderHeader();
    showPtsToast(-slot.unlockCost);
    renderSlots(getTowerData());
}

// ===== 积分历史 =====
function renderHistory(data) {
    const history = data.history || [];
    document.getElementById('panelBody').innerHTML = history.length === 0
        ? '<div class="empty-history">暂无记录</div>'
        : history.slice(0, 30).map(h => `
            <div class="history-row">
                <span class="history-date">${h.date}</span>
                <span class="history-label">${h.label}</span>
                <span class="history-pts ${h.pts >= 0 ? 'pos' : 'neg'}">${h.pts > 0 ? '+' : ''}${h.pts}</span>
            </div>`).join('');
}

function handleModalClick(e) {
    if (e.target === document.getElementById('upgradeModal')) closeUpgradeModal();
}
