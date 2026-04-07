// 商城逻辑

let currentUnlockData = null; // 当前要解锁的拼图块信息

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    updateCoinDisplay();
    renderBackgrounds();
});

// 更新金币显示
function updateCoinDisplay() {
    const userData = getUserData();
    document.getElementById('coinCount').textContent = userData.coins;
    
    const modalCoinCount = document.getElementById('modalCoinCount');
    if (modalCoinCount) {
        modalCoinCount.textContent = userData.coins;
    }
}

// 渲染所有背景图
function renderBackgrounds() {
    const backgrounds = getAllBackgrounds();
    const container = document.getElementById('backgroundsList');
    container.innerHTML = '';
    
    backgrounds.forEach(bg => {
        const card = createBackgroundCard(bg);
        container.appendChild(card);
    });
}

// 创建背景图卡片
function createBackgroundCard(background) {
    const card = document.createElement('div');
    card.className = 'background-card';
    
    const progress = background.unlockedPieces.length;
    const progressPercent = (progress / 16) * 100;
    
    card.innerHTML = `
        <div class="background-header">
            <div class="background-name">${background.name}</div>
            <div class="background-progress">
                ${background.isFullyUnlocked ? 
                    '<span class="unlocked-badge">✓ 已解锁</span>' :
                    `<span class="progress-text">${progress}/16</span>
                     <div class="progress-bar">
                         <div class="progress-fill" style="width: ${progressPercent}%"></div>
                     </div>`
                }
            </div>
        </div>
        <div class="puzzle-grid" id="puzzle-${background.id}"></div>
    `;
    
    // 渲染拼图网格
    const puzzleGrid = card.querySelector(`#puzzle-${background.id}`);
    for (let i = 0; i < 16; i++) {
        const piece = createPuzzlePiece(background, i);
        puzzleGrid.appendChild(piece);
    }
    
    return card;
}

// 创建拼图块
function createPuzzlePiece(background, index) {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    
    const isUnlocked = background.unlockedPieces.includes(index);
    
    if (isUnlocked) {
        // 已解锁：显示图片
        const style = getPieceStyle(background.imageUrl, index);
        piece.style.backgroundImage = style.backgroundImage;
        piece.style.backgroundSize = style.backgroundSize;
        piece.style.backgroundPosition = style.backgroundPosition;
    } else {
        // 未解锁：显示锁定状态
        piece.classList.add('locked');
        piece.onclick = () => showUnlockModal(background, index);
    }
    
    return piece;
}

// 显示解锁弹窗
function showUnlockModal(background, pieceIndex) {
    const userData = getUserData();
    
    // 保存当前解锁信息
    currentUnlockData = {
        backgroundId: background.id,
        pieceIndex: pieceIndex
    };
    
    // 设置预览图
    const preview = document.getElementById('unlockPreview');
    const style = getPieceStyle(background.imageUrl, pieceIndex);
    preview.style.backgroundImage = style.backgroundImage;
    preview.style.backgroundSize = style.backgroundSize;
    preview.style.backgroundPosition = style.backgroundPosition;
    
    // 更新金币显示
    document.getElementById('modalCoinCount').textContent = userData.coins;
    
    // 更新按钮状态
    const confirmBtn = document.getElementById('confirmUnlockBtn');
    confirmBtn.disabled = userData.coins < 10;
    
    // 显示弹窗
    document.getElementById('unlockModal').classList.remove('hidden');
}

// 关闭解锁弹窗
function closeUnlockModal() {
    document.getElementById('unlockModal').classList.add('hidden');
    currentUnlockData = null;
}

// 确认解锁
function confirmUnlock() {
    if (!currentUnlockData) return;
    
    const { backgroundId, pieceIndex } = currentUnlockData;
    const result = unlockPuzzlePiece(backgroundId, pieceIndex);
    
    if (result.success) {
        closeUnlockModal();
        showToast('拼图块解锁成功！🎉', 'success');
        
        // 播放解锁动画
        playUnlockAnimation(backgroundId, pieceIndex);
        
        // 更新显示
        updateCoinDisplay();
        
        // 延迟重新渲染，让动画播放完
        setTimeout(() => {
            renderBackgrounds();
            
            // 如果完成了整张背景图，显示庆祝
            if (result.isComplete) {
                showCompletionModal(result.background);
            }
        }, 600);
    } else {
        showToast(result.message, 'error');
    }
}

// 播放解锁动画
function playUnlockAnimation(backgroundId, pieceIndex) {
    const puzzleGrid = document.getElementById(`puzzle-${backgroundId}`);
    if (!puzzleGrid) return;
    
    const pieces = puzzleGrid.children;
    const row = Math.floor(pieceIndex / 4);
    const col = pieceIndex % 4;
    const flatIndex = row * 4 + col;
    
    if (pieces[flatIndex]) {
        pieces[flatIndex].classList.add('unlocking');
    }
}

// 显示完成庆祝弹窗
function showCompletionModal(background) {
    document.getElementById('completionName').textContent = background.name;
    
    const completedImage = document.getElementById('completedImage');
    completedImage.style.backgroundImage = `url(${background.imageUrl})`;
    
    document.getElementById('completionModal').classList.remove('hidden');
}

// 关闭完成庆祝弹窗
function closeCompletionModal() {
    document.getElementById('completionModal').classList.add('hidden');
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

// 返回首页
function goBack() {
    window.location.href = 'home.html';
}
