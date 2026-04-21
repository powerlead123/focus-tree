// 单词惊险跳 - 管理页面逻辑

const WORD_JUMP_KEY = 'focusTree_wordJump_v1';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSavedWords();
    setupInputListeners();
    checkAllFilled();
});

// 设置输入监听
function setupInputListeners() {
    const inputs = document.querySelectorAll('.word-input-en, .word-input-cn');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            checkAllFilled();
            updateRowStatus(input.closest('.word-input-row'));
        });
    });
}

// 更新行状态
function updateRowStatus(row) {
    const enInput = row.querySelector('.word-input-en');
    const cnInput = row.querySelector('.word-input-cn');
    
    if (enInput.value.trim() && cnInput.value.trim()) {
        row.classList.add('filled');
    } else {
        row.classList.remove('filled');
    }
}

// 检查是否全部填满
function checkAllFilled() {
    const rows = document.querySelectorAll('.word-input-row');
    let filledCount = 0;
    const words = [];
    
    rows.forEach(row => {
        const en = row.querySelector('.word-input-en').value.trim();
        const cn = row.querySelector('.word-input-cn').value.trim();
        
        if (en && cn) {
            filledCount++;
            words.push({ english: en, chinese: cn });
        }
    });
    
    // 更新计数器
    const counter = document.getElementById('wordCounter');
    counter.textContent = `${filledCount}/5`;
    
    if (filledCount === 5) {
        counter.classList.add('complete');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startHint').textContent = '✅ 准备就绪，点击开始游戏！';
        document.getElementById('startHint').classList.add('ready');
    } else {
        counter.classList.remove('complete');
        document.getElementById('startBtn').disabled = true;
        document.getElementById('startHint').textContent = `还需录入 ${5 - filledCount} 个单词`;
        document.getElementById('startHint').classList.remove('ready');
    }
    
    return words;
}

// 载入上次单词
function loadLastWords() {
    try {
        const saved = localStorage.getItem(WORD_JUMP_KEY);
        if (saved) {
            const words = JSON.parse(saved);
            const rows = document.querySelectorAll('.word-input-row');
            
            rows.forEach((row, index) => {
                if (words[index]) {
                    row.querySelector('.word-input-en').value = words[index].english;
                    row.querySelector('.word-input-cn').value = words[index].chinese;
                    updateRowStatus(row);
                }
            });
            
            checkAllFilled();
            showToast('已载入上次单词');
        } else {
            showToast('没有保存的单词');
        }
    } catch (e) {
        console.error('载入失败:', e);
        showToast('载入失败');
    }
}

// 清空所有
function clearAllWords() {
    if (!confirm('确定要清空所有单词吗？')) return;
    
    const inputs = document.querySelectorAll('.word-input-en, .word-input-cn');
    inputs.forEach(input => input.value = '');
    
    document.querySelectorAll('.word-input-row').forEach(row => {
        row.classList.remove('filled');
    });
    
    checkAllFilled();
    showToast('已清空');
}

// 开始游戏
function startGame() {
    const words = checkAllFilled();
    
    if (words.length !== 5) {
        alert('请填满5个单词');
        return;
    }
    
    // 保存到 localStorage
    try {
        localStorage.setItem(WORD_JUMP_KEY, JSON.stringify(words));
    } catch (e) {
        console.warn('保存失败:', e);
    }
    
    // 构建 URL 参数
    const params = new URLSearchParams();
    params.set('words', JSON.stringify(words));
    
    // 跳转到游戏页面
    location.href = 'word-jump.html?' + params.toString();
}

// 加载保存的单词
function loadSavedWords() {
    try {
        const saved = localStorage.getItem(WORD_JUMP_KEY);
        if (saved) {
            const words = JSON.parse(saved);
            const rows = document.querySelectorAll('.word-input-row');
            
            rows.forEach((row, index) => {
                if (words[index]) {
                    row.querySelector('.word-input-en').value = words[index].english || '';
                    row.querySelector('.word-input-cn').value = words[index].chinese || '';
                    updateRowStatus(row);
                }
            });
            
            checkAllFilled();
        }
    } catch (e) {
        console.error('加载失败:', e);
    }
}

// 显示提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);
