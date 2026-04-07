# 口算竞速功能设计文档

## 概述

口算竞速是一个独立的游戏化模块，通过赛车竞赛的视觉呈现，激励孩子快速完成口算练习。本设计文档描述了该功能的技术架构、数据模型、组件设计和交互流程。

## 架构

### 整体架构

```
专注小树应用
├── 专注作业模块（现有）
│   ├── index.html
│   ├── child.js
│   └── parent.html
│
└── 口算竞速模块（新增）
    ├── race.html          # 主入口页面
    ├── race.js            # 核心逻辑
    ├── race-setup.html    # 设置页面（可选，或用弹窗）
    └── race-opponents.html # 对手管理页面（可选，或用弹窗）
```

### 技术栈

- **前端**：纯 HTML + CSS + JavaScript
- **存储**：localStorage（对手数据、历史记录）
- **动画**：CSS transitions + JavaScript
- **无需后端**：完全本地运行

## 数据模型

### 对手数据结构

```javascript
{
  id: "opponent_1",           // 唯一标识
  name: "妈妈",               // 对手名称
  timePerQuestion: 5,         // 每题用时（秒）
  isDefault: true,            // 是否为预设对手
  createdAt: 1699000000000    // 创建时间戳
}
```

### 比赛配置

```javascript
{
  totalQuestions: 20,         // 题目总数
  selectedOpponents: [        // 选中的对手ID列表
    "opponent_1",
    "opponent_2"
  ]
}
```

### 比赛状态

```javascript
{
  isRunning: true,            // 比赛是否进行中
  startTime: 1699000000000,   // 开始时间戳
  participants: [             // 所有参赛者
    {
      id: "user",
      name: "我",
      type: "user",           // user | opponent
      completed: 5,           // 已完成题数
      progress: 25,           // 进度百分比
      isFinished: false       // 是否完成
    },
    {
      id: "opponent_1",
      name: "妈妈",
      type: "opponent",
      timePerQuestion: 5,
      completed: 8,
      progress: 40,
      isFinished: false,
      lastUpdateTime: 1699000005000  // 上次更新时间
    }
  ]
}
```

### 比赛记录

```javascript
{
  id: "race_1",
  date: "2024-11-04 15:30:00",
  totalQuestions: 20,
  duration: 95,               // 总用时（秒）
  avgTimePerQuestion: 4.75,   // 平均每题用时
  rank: 2,                    // 排名
  totalParticipants: 3,       // 总参赛人数
  opponents: ["妈妈", "爸爸"] // 对手名称列表
}
```

## 组件和界面

### 1. 入口选择（修改现有 index.html）

在任务输入弹窗中添加模式选择：

```html
<div class="mode-selection">
  <button class="mode-btn" data-mode="focus">
    <span class="icon">🌳</span>
    <span class="label">专注作业</span>
  </button>
  <button class="mode-btn" data-mode="race">
    <span class="icon">🏎️</span>
    <span class="label">口算竞速</span>
  </button>
</div>
```

### 2. 比赛设置页面（race.html 初始状态）

**布局：**
```
┌─────────────────────────────────┐
│  🏎️ 口算竞速                    │
├─────────────────────────────────┤
│  题目数量：[____] 题             │
│                                  │
│  选择对手：                      │
│  ☐ 妈妈 (5秒/题)                │
│  ☐ 爸爸 (8秒/题)                │
│  ☐ AI助手 (3秒/题)              │
│                                  │
│  [管理对手]                      │
│                                  │
│  [开始比赛]  [返回]              │
└─────────────────────────────────┘
```

### 3. 对手管理弹窗

**布局：**
```
┌─────────────────────────────────┐
│  管理比赛对手                    │
├─────────────────────────────────┤
│  妈妈        5秒/题  [编辑][删除]│
│  爸爸        8秒/题  [编辑][删除]│
│  AI助手      3秒/题  [编辑][删除]│
│                                  │
│  [+ 添加新对手]                  │
│                                  │
│  [关闭]                          │
└─────────────────────────────────┘
```

**添加/编辑表单：**
```
┌─────────────────────────────────┐
│  添加对手                        │
├─────────────────────────────────┤
│  姓名：[__________]              │
│  每题用时：[____] 秒             │
│                                  │
│  [保存]  [取消]                  │
└─────────────────────────────────┘
```

### 4. 比赛页面

**布局：**
```
┌─────────────────────────────────────────┐
│  🏎️ 口算竞速    已用时间：01:25        │
├─────────────────────────────────────────┤
│                                          │
│  🏁 起点                    终点 🏆      │
│                                          │
│  🚗 我      ████████░░░░░░░░  8/20      │
│                                          │
│  🚙 妈妈    ██████████░░░░░░  10/20     │
│                                          │
│  🚕 爸爸    ██████░░░░░░░░░░  6/20      │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│         [完成一题] (大按钮)              │
│                                          │
└─────────────────────────────────────────┘
```

### 5. 结果页面

**布局：**
```
┌─────────────────────────────────┐
│  🎉 比赛结束！                   │
├─────────────────────────────────┤
│  🏆 第 2 名                      │
│                                  │
│  ⏱️ 总用时：1分35秒              │
│  📊 平均每题：4.75秒             │
│  🎯 超越了 1 个对手              │
│                                  │
│  最终排名：                      │
│  🥇 妈妈    1分40秒              │
│  🥈 我      1分35秒              │
│  🥉 爸爸    2分40秒              │
│                                  │
│  💪 继续努力，下次更快！         │
│                                  │
│  [再来一局]  [返回]              │
└─────────────────────────────────┘
```

## 核心逻辑

### 比赛流程

```
1. 用户选择"口算竞速"
   ↓
2. 进入设置页面
   - 输入题目数量
   - 选择对手
   - 可管理对手
   ↓
3. 点击"开始比赛"
   ↓
4. 初始化比赛状态
   - 创建所有参赛者
   - 启动计时器
   - 启动对手自动推进
   ↓
5. 比赛进行中
   - 用户点击按钮推进
   - 对手自动推进
   - 实时更新UI
   ↓
6. 用户完成所有题目
   ↓
7. 结束比赛
   - 停止计时
   - 停止对手推进
   - 计算排名
   - 保存记录
   ↓
8. 显示结果页面
```

### 对手自动推进算法

```javascript
function updateOpponent(opponent, currentTime) {
  // 计算距离上次更新的时间差
  const timeDiff = (currentTime - opponent.lastUpdateTime) / 1000;
  
  // 计算应该完成的题数（带随机波动）
  const baseSpeed = opponent.timePerQuestion;
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2倍速度
  const actualSpeed = baseSpeed * randomFactor;
  
  const shouldComplete = Math.floor(timeDiff / actualSpeed);
  
  if (shouldComplete > 0) {
    opponent.completed = Math.min(
      opponent.completed + shouldComplete,
      totalQuestions
    );
    opponent.lastUpdateTime = currentTime;
    opponent.progress = (opponent.completed / totalQuestions) * 100;
    
    if (opponent.completed >= totalQuestions) {
      opponent.isFinished = true;
    }
  }
}
```

### 用户推进逻辑

```javascript
function userCompleteQuestion() {
  if (!raceState.isRunning) return;
  
  const user = raceState.participants.find(p => p.type === 'user');
  
  if (user.completed < totalQuestions) {
    user.completed++;
    user.progress = (user.completed / totalQuestions) * 100;
    
    // 更新UI
    updateRaceUI();
    
    // 检查是否完成
    if (user.completed >= totalQuestions) {
      user.isFinished = true;
      endRace();
    }
  }
}
```

### 排名计算

```javascript
function calculateRanking() {
  const rankings = raceState.participants
    .map(p => ({
      name: p.name,
      completed: p.completed,
      time: p.type === 'user' 
        ? (Date.now() - raceState.startTime) / 1000
        : p.completed * p.timePerQuestion
    }))
    .sort((a, b) => {
      // 先按完成数排序
      if (b.completed !== a.completed) {
        return b.completed - a.completed;
      }
      // 完成数相同按时间排序
      return a.time - b.time;
    });
  
  return rankings;
}
```

## 数据存储

### LocalStorage Keys

```javascript
const STORAGE_KEYS = {
  OPPONENTS: 'mathRace_opponents',      // 对手列表
  HISTORY: 'mathRace_history',          // 比赛历史
  SETTINGS: 'mathRace_settings'         // 最近的设置
};
```

### 初始化默认对手

```javascript
function initDefaultOpponents() {
  const defaults = [
    { id: 'default_1', name: '妈妈', timePerQuestion: 5, isDefault: true },
    { id: 'default_2', name: '爸爸', timePerQuestion: 8, isDefault: true },
    { id: 'default_3', name: 'AI助手', timePerQuestion: 3, isDefault: true }
  ];
  
  const existing = getOpponents();
  if (existing.length === 0) {
    saveOpponents(defaults);
  }
}
```

## 样式设计

### 赛道样式

```css
.race-track {
  background: linear-gradient(to bottom, 
    #87CEEB 0%,      /* 天空蓝 */
    #E0F6FF 40%,     /* 浅蓝 */
    #90EE90 40%,     /* 草地绿 */
    #7CCD7C 100%     /* 深绿 */
  );
  padding: 20px;
  border-radius: 15px;
}

.track-lane {
  background: #666;
  height: 60px;
  border-radius: 30px;
  position: relative;
  margin: 15px 0;
  border: 3px solid #333;
}

.car {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  transition: left 0.5s ease-out;
}
```

### 汽车图标

使用不同颜色的汽车 emoji 或 SVG：
- 用户：🚗（红色）
- 对手1：🚙（蓝色）
- 对手2：🚕（黄色）
- 对手3：🚓（白色）
- 对手4：🚐（绿色）

## 错误处理

### 输入验证

1. 题目数量必须是 1-100 的整数
2. 对手名称不能为空
3. 每题用时必须是正整数（1-60秒）
4. 至少选择一个对手才能开始比赛

### 边界情况

1. 用户快速连续点击按钮 → 防抖处理
2. 对手速度过快导致瞬间完成 → 限制最小用时
3. 浏览器标签页切换 → 暂停对手推进，恢复时补偿时间
4. 本地存储满 → 清理旧记录

## 性能优化

1. **动画优化**：使用 CSS transform 而非 left/top
2. **更新频率**：对手推进每秒检查一次，不需要更频繁
3. **DOM 操作**：批量更新，减少重绘
4. **数据存储**：只保留最近 20 条记录

## 测试策略

### 单元测试场景

1. 对手自动推进逻辑
2. 排名计算算法
3. 进度百分比计算
4. 数据存储和读取

### 集成测试场景

1. 完整比赛流程
2. 对手管理（增删改）
3. 历史记录保存
4. 页面切换流程

### 用户测试场景

1. 不同题目数量的比赛
2. 不同数量的对手
3. 快速点击按钮
4. 中途刷新页面

## 未来扩展

### Phase 2 可能的功能

1. **难度等级**：简单/中等/困难（影响对手速度）
2. **音效**：引擎声、完成提示音、胜利音乐
3. **动画增强**：汽车加速、超越特效、终点烟花
4. **成就系统**：首胜、连胜、速度记录
5. **统计图表**：进步曲线、平均速度趋势
6. **多人模式**：兄弟姐妹同时比赛（需要 Firebase）

## 实现优先级

### MVP 必须实现

1. ✅ 入口选择
2. ✅ 比赛设置（题目数量、选择对手）
3. ✅ 对手管理（增删改）
4. ✅ 比赛界面（赛道、进度）
5. ✅ 用户手动推进
6. ✅ 对手自动推进
7. ✅ 比赛结束和结果
8. ✅ 历史记录保存

### 可选优化

1. 平滑动画效果
2. 响应式设计（手机适配）
3. 音效
4. 更丰富的视觉效果

## 技术债务和注意事项

1. **时间同步**：对手推进基于客户端时间，切换标签页可能导致不准确
2. **随机性**：对手速度的随机波动可能导致体验不一致
3. **存储限制**：localStorage 有 5-10MB 限制，需要定期清理
4. **浏览器兼容性**：确保 CSS 动画在主流浏览器中正常工作
