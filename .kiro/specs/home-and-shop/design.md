# 首页和商城系统设计文档

## 概述

本文档描述首页导航和商城激励系统的技术设计，包括数据模型、页面结构、交互流程和实现细节。

## 架构

### 整体架构

```
专注小树应用
├── home.html              # 新首页
├── index.html             # 专注力训练（原有）
├── race.html              # 口算竞速（原有）
├── shop.html              # 商城页面（新增）
├── shop.js                # 商城逻辑（新增）
├── shop.css               # 商城样式（新增）
└── common.js              # 公共数据管理（新增）
```

### 技术栈

- **前端**：纯 HTML + CSS + JavaScript
- **存储**：localStorage
- **动画**：CSS animations + JavaScript
- **无需后端**：完全本地运行

## 数据模型

### 用户数据结构

```javascript
{
  trees: 150,                    // 累计获得的小树总数
  availableTrees: 35,            // 可用于兑换的小树数
  coins: 12,                     // 当前拥有的金币数
  lastStudyDate: "2024-11-06",   // 最近学习日期
  studyStreak: 5                 // 连续学习天数
}
```

### 背景图数据结构

```javascript
{
  id: "bg_1",
  name: "星空夜景",
  imageUrl: "images/backgrounds/starry-night.jpg",
  thumbnail: "images/backgrounds/starry-night-thumb.jpg",
  unlockedPieces: [0, 3, 7, 15], // 已解锁的拼图块索引（0-15）
  isFullyUnlocked: false,        // 是否完全解锁
  unlockedAt: null               // 完全解锁的时间戳
}
```

### 背景图配置

```javascript
const BACKGROUNDS = [
  {
    id: "bg_1",
    name: "星空夜景",
    imageUrl: "images/backgrounds/starry-night.jpg",
    thumbnail: "images/backgrounds/starry-night-thumb.jpg"
  },
  {
    id: "bg_2",
    name: "森林小径",
    imageUrl: "images/backgrounds/forest-path.jpg",
    thumbnail: "images/backgrounds/forest-path-thumb.jpg"
  },
  // ... 更多背景图
];
```

### 应用设置

```javascript
{
  focusBackground: "bg_1",       // 专注力训练使用的背景
  raceBackground: "bg_2"         // 口算竞速使用的背景
}
```

## 页面设计

### 1. 首页 (home.html)

**布局：**
```
┌─────────────────────────────────────┐
│  🌳 专注小树                         │
├─────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │  📊 我的成就                  │  │
│  │  🌳 小树：150棵 (35棵可兑换)  │  │
│  │  🍃 金币：12个                │  │
│  │  🖼️ 背景：3/10张              │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌─────────┐  ┌─────────┐          │
│  │  🧘      │  │  🏎️     │          │
│  │ 专注力   │  │ 口算    │          │
│  │ 训练     │  │ 竞速    │          │
│  └─────────┘  └─────────┘          │
│                                      │
│  ┌─────────┐  ┌─────────┐          │
│  │  🎈      │  │  🛒     │          │
│  │ 泡泡     │  │ 背景    │          │
│  │ 单词     │  │ 商城    │          │
│  └─────────┘  └─────────┘          │
│                                      │
│  [兑换金币] (35棵 → 3个金币)        │
│                                      │
└─────────────────────────────────────┘
```

**功能区域：**
1. **顶部标题**：应用名称和logo
2. **成就卡片**：显示小树、金币、背景图统计
3. **功能按钮**：四个大按钮，图标+文字
4. **兑换区域**：显示可兑换金币数，快速兑换按钮

### 2. 商城页面 (shop.html)

**布局：**
```
┌─────────────────────────────────────┐
│  🛒 背景商城          🍃 金币：12    │
│  [返回首页]                          │
├─────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │  星空夜景          进度：8/16 │  │
│  │  ┌───┬───┬───┬───┐          │  │
│  │  │ ✓ │ ? │ ? │ ✓ │          │  │
│  │  ├───┼───┼───┼───┤          │  │
│  │  │ ? │ ✓ │ ? │ ✓ │          │  │
│  │  ├───┼───┼───┼───┤          │  │
│  │  │ ✓ │ ? │ ✓ │ ? │          │  │
│  │  ├───┼───┼───┼───┤          │  │
│  │  │ ? │ ✓ │ ? │ ✓ │          │  │
│  │  └───┴───┴───┴───┘          │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  森林小径          进度：0/16 │  │
│  │  ┌───┬───┬───┬───┐          │  │
│  │  │ ? │ ? │ ? │ ? │          │  │
│  │  │ ... (全部未解锁)          │  │
│  │  └───┴───┴───┴───┘          │  │
│  └──────────────────────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

**拼图块状态：**
- **未解锁**：灰色/模糊，显示"?"或锁图标
- **已解锁**：显示该块的实际图像
- **可点击**：未解锁的块可点击解锁

### 3. 解锁弹窗

**布局：**
```
┌─────────────────────────────┐
│  解锁拼图块                  │
├─────────────────────────────┤
│                              │
│  [预览图片]                  │
│                              │
│  需要：10个金币 🍃           │
│  当前：12个金币              │
│                              │
│  [确认解锁]  [取消]          │
│                              │
└─────────────────────────────┘
```

### 4. 兑换金币弹窗

**布局：**
```
┌─────────────────────────────┐
│  兑换金币                    │
├─────────────────────────────┤
│                              │
│  🌳 → 🍃                     │
│                              │
│  10棵小树 = 1个金币          │
│                              │
│  当前小树：35棵              │
│  可兑换：3次                 │
│                              │
│  兑换数量：[1] [最大]        │
│                              │
│  [确认兑换]  [取消]          │
│                              │
└─────────────────────────────┘
```

## 核心逻辑

### 小树获取逻辑

```javascript
// 在专注力训练完成时调用
function addTrees(count) {
  const userData = getUserData();
  userData.trees += count;
  userData.availableTrees += count;
  saveUserData(userData);
  
  // 显示获得小树动画
  showTreeAnimation(count);
}
```

### 金币兑换逻辑

```javascript
function exchangeCoins(times = 1) {
  const userData = getUserData();
  const treesNeeded = times * 10;
  
  if (userData.availableTrees < treesNeeded) {
    alert('小树不足，无法兑换');
    return false;
  }
  
  userData.availableTrees -= treesNeeded;
  userData.coins += times;
  saveUserData(userData);
  
  // 显示兑换成功动画
  showExchangeAnimation(times);
  
  return true;
}
```

### 拼图解锁逻辑

```javascript
function unlockPuzzlePiece(backgroundId, pieceIndex) {
  const userData = getUserData();
  
  if (userData.coins < 10) {
    alert('金币不足，需要10个金币');
    return false;
  }
  
  const background = getBackgroundData(backgroundId);
  
  if (background.unlockedPieces.includes(pieceIndex)) {
    alert('该拼图块已解锁');
    return false;
  }
  
  // 扣除金币
  userData.coins -= 10;
  saveUserData(userData);
  
  // 解锁拼图块
  background.unlockedPieces.push(pieceIndex);
  
  // 检查是否完全解锁
  if (background.unlockedPieces.length === 16) {
    background.isFullyUnlocked = true;
    background.unlockedAt = Date.now();
    showCompletionAnimation(backgroundId);
  }
  
  saveBackgroundData(background);
  
  // 显示解锁动画
  showUnlockAnimation(backgroundId, pieceIndex);
  
  return true;
}
```

### 随机解锁拼图块

```javascript
function getRandomUnlockedPiece(backgroundId) {
  const background = getBackgroundData(backgroundId);
  const allPieces = Array.from({length: 16}, (_, i) => i);
  const lockedPieces = allPieces.filter(
    i => !background.unlockedPieces.includes(i)
  );
  
  if (lockedPieces.length === 0) {
    return null; // 全部已解锁
  }
  
  const randomIndex = Math.floor(Math.random() * lockedPieces.length);
  return lockedPieces[randomIndex];
}
```

### 拼图块图像分割

```javascript
function getPieceStyle(backgroundUrl, row, col) {
  // 每块占25%（4x4网格）
  const size = 25;
  const x = col * size;
  const y = row * size;
  
  return {
    backgroundImage: `url(${backgroundUrl})`,
    backgroundSize: '400% 400%',
    backgroundPosition: `${x}% ${y}%`
  };
}
```

## 数据存储

### LocalStorage Keys

```javascript
const STORAGE_KEYS = {
  USER_DATA: 'focusTree_userData',
  BACKGROUNDS: 'focusTree_backgrounds',
  SETTINGS: 'focusTree_settings'
};
```

### 数据初始化

```javascript
function initializeData() {
  // 初始化用户数据
  if (!localStorage.getItem(STORAGE_KEYS.USER_DATA)) {
    const defaultUserData = {
      trees: 0,
      availableTrees: 0,
      coins: 0,
      lastStudyDate: null,
      studyStreak: 0
    };
    localStorage.setItem(
      STORAGE_KEYS.USER_DATA, 
      JSON.stringify(defaultUserData)
    );
  }
  
  // 初始化背景图数据
  if (!localStorage.getItem(STORAGE_KEYS.USER_DATA)) {
    const backgroundsData = BACKGROUNDS.map(bg => ({
      ...bg,
      unlockedPieces: [],
      isFullyUnlocked: false,
      unlockedAt: null
    }));
    localStorage.setItem(
      STORAGE_KEYS.BACKGROUNDS,
      JSON.stringify(backgroundsData)
    );
  }
  
  // 初始化设置
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings = {
      focusBackground: null,
      raceBackground: null
    };
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(defaultSettings)
    );
  }
}
```

## 样式设计

### 首页样式

```css
.home-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.function-btn {
  aspect-ratio: 1;
  background: white;
  border: none;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.function-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
```

### 商城拼图样式

```css
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  aspect-ratio: 1;
  background: #ddd;
  border-radius: 10px;
  overflow: hidden;
}

.puzzle-piece {
  aspect-ratio: 1;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.puzzle-piece.locked {
  filter: grayscale(100%) blur(5px);
  opacity: 0.5;
}

.puzzle-piece.locked::after {
  content: '🔒';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
}

.puzzle-piece:hover {
  transform: scale(1.05);
  z-index: 1;
}
```

## 动画效果

### 获得小树动画

```css
@keyframes treeGrow {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

### 金币兑换动画

```css
@keyframes coinFlip {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
}
```

### 拼图解锁动画

```css
@keyframes pieceUnlock {
  0% {
    filter: grayscale(100%) blur(5px);
    opacity: 0.5;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    filter: grayscale(0%) blur(0px);
    opacity: 1;
    transform: scale(1);
  }
}
```

### 完成背景图动画

```css
@keyframes completion {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.05) rotate(2deg);
  }
  50% {
    transform: scale(1.1) rotate(-2deg);
  }
  75% {
    transform: scale(1.05) rotate(1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
```

## 集成到现有模块

### 修改专注力训练 (index.html)

```javascript
// 在完成专注力训练时
function onFocusComplete(treeCount) {
  // 原有逻辑...
  
  // 新增：保存小树
  addTrees(treeCount);
  
  // 显示获得小树提示
  showTreeReward(treeCount);
}
```

### 添加背景选择

```javascript
// 在设置页面添加背景选择
function renderBackgroundSelector() {
  const unlockedBackgrounds = getUnlockedBackgrounds();
  const container = document.getElementById('backgroundSelector');
  
  unlockedBackgrounds.forEach(bg => {
    const option = document.createElement('div');
    option.className = 'background-option';
    option.style.backgroundImage = `url(${bg.thumbnail})`;
    option.onclick = () => selectBackground(bg.id);
    container.appendChild(option);
  });
}
```

## 性能优化

1. **图片懒加载**：拼图块图片按需加载
2. **缓存策略**：已加载的背景图缓存到内存
3. **动画优化**：使用 CSS transform 而非 position
4. **数据压缩**：LocalStorage 数据定期清理

## 错误处理

1. **数据丢失**：定期备份到云端（可选）
2. **图片加载失败**：显示占位图
3. **存储空间不足**：提示用户清理数据
4. **数据损坏**：重置为默认值

## 未来扩展

### Phase 2 可能的功能

1. **每日任务**：完成任务获得额外奖励
2. **成就系统**：解锁特定成就获得特殊背景
3. **分享功能**：分享解锁的背景图
4. **主题包**：节日主题、季节主题等
5. **动态背景**：支持动画背景
6. **背景编辑器**：用户自定义背景
