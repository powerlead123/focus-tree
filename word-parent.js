// 单词消消乐 - 家长管理页面逻辑

const WORD_BOOKS_KEY = 'focusTree_wordBooks_v1';
const WORD_GAME_SETTINGS_KEY = 'focusTree_wordGameSettings';

// 状态管理
let wordBooks = [];
let currentBookId = null;
let editingWordIndex = -1;

// 初始化
function init() {
    loadWordBooks();
    renderBookList();
    
    // 如果有单词本，默认选中第一个
    if (wordBooks.length > 0) {
        selectBook(wordBooks[0].id);
    }
}

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
                    { english: 'house', chinese: '房子' },
                    { english: 'ice', chinese: '冰' },
                    { english: 'juice', chinese: '果汁' }
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
    const book = wordBooks.find(b => b.id === bookId);
    
    if (book) {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('bookEditor').classList.add('active');
        document.getElementById('bookNameInput').value = book.name;
        renderWordList();
        updateSelectedWordsPreview();
    }
    
    renderBookList();
}

// 创建新单词本
function createNewBook() {
    const newBook = {
        id: Date.now().toString(),
        name: '新单词本',
        words: []
    };
    wordBooks.push(newBook);
    saveWordBooks();
    renderBookList();
    selectBook(newBook.id);
}

// 保存当前单词本
function saveCurrentBook() {
    if (!currentBookId) return;
    
    const book = wordBooks.find(b => b.id === currentBookId);
    if (book) {
        book.name = document.getElementById('bookNameInput').value.trim() || '未命名单词本';
        saveWordBooks();
        renderBookList();
        
        // 显示提示
        showToast('保存成功！');
    }
}

// 删除当前单词本
function deleteCurrentBook() {
    if (!currentBookId) return;
    document.getElementById('deleteModal').classList.remove('hidden');
}

// 确认删除
function confirmDelete() {
    if (!currentBookId) return;
    
    wordBooks = wordBooks.filter(b => b.id !== currentBookId);
    saveWordBooks();
    
    currentBookId = null;
    document.getElementById('bookEditor').classList.remove('active');
    document.getElementById('emptyState').style.display = 'flex';
    
    renderBookList();
    closeDeleteModal();
    updateSelectedWordsPreview();
}

// 关闭删除弹窗
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// 渲染单词列表
function renderWordList() {
    const book = wordBooks.find(b => b.id === currentBookId);
    if (!book) return;
    
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = book.words.map((word, index) => `
        <div class="word-item">
            <input type="text" value="${escapeHtml(word.english)}" 
                   onchange="updateWord(${index}, 'english', this.value)"
                   placeholder="英文单词">
            <input type="text" value="${escapeHtml(word.chinese)}" 
                   onchange="updateWord(${index}, 'chinese', this.value)"
                   placeholder="中文意思">
            <input type="checkbox" class="word-checkbox" 
                   onchange="toggleWordSelection(${index})"
                   id="wordCheck_${index}">
            <button class="btn-remove-word" onclick="removeWord(${index})">×</button>
        </div>
    `).join('');
}

// 更新单词
function updateWord(index, field, value) {
    const book = wordBooks.find(b => b.id === currentBookId);
    if (book && book.words[index]) {
        book.words[index][field] = value.trim();
        saveWordBooks();
    }
}

// 添加新单词
function addNewWord() {
    const book = wordBooks.find(b => b.id === currentBookId);
    if (!book) return;
    
    editingWordIndex = -1;
    document.getElementById('wordModalTitle').textContent = '添加单词';
    document.getElementById('englishInput').value = '';
    document.getElementById('chineseInput').value = '';
    document.getElementById('wordModal').classList.remove('hidden');
}

// 保存单词
function saveWord() {
    const english = document.getElementById('englishInput').value.trim();
    const chinese = document.getElementById('chineseInput').value.trim();
    
    if (!english || !chinese) {
        alert('请填写完整的单词信息');
        return;
    }
    
    const book = wordBooks.find(b => b.id === currentBookId);
    if (!book) return;
    
    if (editingWordIndex >= 0) {
        // 编辑模式
        book.words[editingWordIndex] = { english, chinese };
    } else {
        // 添加模式
        book.words.push({ english, chinese });
    }
    
    saveWordBooks();
    renderWordList();
    renderBookList();
    closeWordModal();
}

// 关闭单词弹窗
function closeWordModal() {
    document.getElementById('wordModal').classList.add('hidden');
}

// 删除单词
function removeWord(index) {
    const book = wordBooks.find(b => b.id === currentBookId);
    if (book) {
        book.words.splice(index, 1);
        saveWordBooks();
        renderWordList();
        renderBookList();
        updateSelectedWordsPreview();
    }
}

// 切换单词选择
function toggleWordSelection(index) {
    updateSelectedWordsPreview();
}

// 更新已选择单词预览
function updateSelectedWordsPreview() {
    const book = wordBooks.find(b => b.id === currentBookId);
    const checkboxes = document.querySelectorAll('.word-checkbox');
    const selectedWords = [];
    
    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked && book && book.words[index]) {
            selectedWords.push(book.words[index]);
        }
    });
    
    document.getElementById('selectedCount').textContent = selectedWords.length;
    
    const tagsContainer = document.getElementById('selectedTags');
    if (selectedWords.length > 0) {
        tagsContainer.innerHTML = selectedWords.map(w => 
            `<span class="selected-tag">${escapeHtml(w.english)}</span>`
        ).join('');
        document.getElementById('startGameBtn').disabled = false;
    } else {
        tagsContainer.innerHTML = '<span style="color: var(--text-secondary);">请勾选要练习的单词</span>';
        document.getElementById('startGameBtn').disabled = true;
    }
    
    return selectedWords;
}

// 开始游戏
function startGame() {
    const selectedWords = updateSelectedWordsPreview();
    if (selectedWords.length === 0) {
        alert('请至少选择一个单词');
        return;
    }
    
    const difficulty = document.getElementById('difficultySelect').value;
    const bookName = wordBooks.find(b => b.id === currentBookId)?.name || '单词练习';
    
    // 构建 URL 参数
    const params = new URLSearchParams();
    params.set('words', JSON.stringify(selectedWords));
    params.set('difficulty', difficulty);
    params.set('bookName', bookName);
    
    // 尝试保存到 localStorage（某些浏览器可能禁用）
    try {
        const gameSettings = { words: selectedWords, difficulty, bookName };
        localStorage.setItem(WORD_GAME_SETTINGS_KEY, JSON.stringify(gameSettings));
    } catch (e) {
        console.warn('localStorage 不可用，使用 URL 参数传递数据');
    }
    
    // 跳转到游戏页面（带参数）
    location.href = 'word-match.html?' + params.toString();
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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
