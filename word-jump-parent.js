// 单词惊险跳 - 管理页面逻辑
// 与单词消消乐共用单词本

const WORD_BOOKS_KEY = 'focusTree_wordBooks_v1';

// 状态
let wordBooks = [];
let currentBookId = null;
let selectedWords = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadWordBooks();
    renderBookList();
});

// 加载单词本
function loadWordBooks() {
    const saved = localStorage.getItem(WORD_BOOKS_KEY);
    if (saved) {
        wordBooks = JSON.parse(saved);
    } else {
        // 默认单词本
        wordBooks = [
            {
                id: Date.now().toString(),
                name: '三年级上册单词',
                words: [
                    { english: 'apple', chinese: '苹果' },
                    { english: 'book', chinese: '书' },
                    { english: 'cat', chinese: '猫' },
                    { english: 'dog', chinese: '狗' },
                    { english: 'elephant', chinese: '大象' },
                    { english: 'fish', chinese: '鱼' },
                    { english: 'grape', chinese: '葡萄' },
                    { english: 'house', chinese: '房子' }
                ]
            }
        ];
        saveWordBooks();
    }
}

// 保存单词本
function saveWordBooks() {
    localStorage.setItem(WORD_BOOKS_KEY, JSON.stringify(wordBooks));
}

// 渲染单词本列表
function renderBookList() {
    const bookList = document.getElementById('bookList');
    
    if (wordBooks.length === 0) {
        bookList.innerHTML = `
            <div class="empty-state">
                <p>暂无单词本</p>
                <p style="font-size: 0.85rem; margin-top: 10px;">点击"管理单词本"创建</p>
            </div>
        `;
        return;
    }
    
    bookList.innerHTML = wordBooks.map(book => `
        <div class="book-item ${book.id === currentBookId ? 'active' : ''}" 
             onclick="selectBook('${book.id}')">
            <span class="book-name">${escapeHtml(book.name)}</span>
            <span class="word-count">${book.words.length} 词</span>
        </div>
    `).join('');
}

// 选择单词本
function selectBook(bookId) {
    currentBookId = bookId;
    selectedWords = []; // 重置选择
    
    const book = wordBooks.find(b => b.id === bookId);
    if (book) {
        renderWordList(book.words);
    }
    
    renderBookList();
    updateCounter();
}

// 渲染单词列表
function renderWordList(words) {
    const container = document.getElementById('wordListSelect');
    
    if (words.length < 5) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>该单词本单词不足5个</p>
                <p style="font-size: 0.85rem; margin-top: 10px;">请添加更多单词或选择其他单词本</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = words.map((word, index) => `
        <div class="word-select-item" onclick="toggleWordSelection(${index}, '${escapeHtml(word.english)}', '${escapeHtml(word.chinese)}')">
            <input type="checkbox" class="word-checkbox" 
                   ${selectedWords.find(w => w.english === word.english) ? 'checked' : ''}
                   onclick="event.stopPropagation()">
            <div class="word-info">
                <span class="word-en">${escapeHtml(word.english)}</span>
                <span class="word-cn">${escapeHtml(word.chinese)}</span>
            </div>
            ${getWordOrder(word.english)}
        </div>
    `).join('');
    
    // 更新选中状态样式
    updateSelectionStyles();
}

// 获取单词顺序标记
function getWordOrder(english) {
    const order = selectedWords.findIndex(w => w.english === english);
    if (order !== -1) {
        return `<span class="word-order">${order + 1}</span>`;
    }
    return '';
}

// 切换单词选择
function toggleWordSelection(index, english, chinese) {
    const existingIndex = selectedWords.findIndex(w => w.english === english);
    
    if (existingIndex !== -1) {
        // 取消选择
        selectedWords.splice(existingIndex, 1);
    } else {
        // 添加选择（最多5个）
        if (selectedWords.length >= 5) {
            showToast('最多只能选择5个单词');
            return;
        }
        selectedWords.push({ english, chinese });
    }
    
    // 重新渲染以更新顺序
    const book = wordBooks.find(b => b.id === currentBookId);
    if (book) {
        renderWordList(book.words);
    }
    
    updateCounter();
}

// 更新选择计数器
function updateCounter() {
    const counter = document.getElementById('selectCounter');
    const startBtn = document.getElementById('startBtn');
    const hint = document.getElementById('startHint');
    
    counter.textContent = `已选择: ${selectedWords.length}/5`;
    
    if (selectedWords.length === 5) {
        counter.classList.add('complete');
        startBtn.disabled = false;
        hint.textContent = '✅ 已选择5个单词，可以开始游戏了！';
        hint.classList.add('ready');
    } else {
        counter.classList.remove('complete');
        startBtn.disabled = true;
        hint.textContent = `还需选择 ${5 - selectedWords.length} 个单词`;
        hint.classList.remove('ready');
    }
}

// 更新选中样式
function updateSelectionStyles() {
    const items = document.querySelectorAll('.word-select-item');
    const book = wordBooks.find(b => b.id === currentBookId);
    if (!book) return;
    
    items.forEach((item, index) => {
        const word = book.words[index];
        const isSelected = selectedWords.find(w => w.english === word.english);
        if (isSelected) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// 开始游戏
function startGame() {
    if (selectedWords.length !== 5) {
        alert('请选择5个单词');
        return;
    }
    
    // 构建 URL 参数
    const params = new URLSearchParams();
    params.set('words', JSON.stringify(selectedWords));
    
    // 跳转到游戏页面
    location.href = 'word-jump.html?' + params.toString();
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        background: linear-gradient(135deg, var(--warning) 0%, #f97316 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
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
