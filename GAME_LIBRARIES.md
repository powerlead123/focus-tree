# 游戏开发库推荐

## 你问的问题

> "有没有什么现成的游戏库的函数我们直接可以用的？"

是的！有很多现成的游戏库可以让游戏开发更简单、性能更好。

## 推荐的游戏库

### 1. Phaser.js ⭐⭐⭐⭐⭐ （最推荐）

**官网**：https://phaser.io/

**优点**：
- 专业的2D游戏引擎
- 内置精灵图（Sprite）系统
- 自动对象池管理
- 物理引擎（碰撞检测）
- 粒子系统（性能优化过的）
- 动画系统
- 音效管理
- 大量示例和教程

**适合场景**：
- 飞机射击游戏（像你的阅读探险记）
- 平台跳跃游戏
- 塔防游戏
- 任何2D游戏

**代码示例**：
```javascript
// 创建游戏
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // 加载图片
    this.load.image('plane', 'plane.png');
    this.load.image('bullet', 'bullet.png');
}

function create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'plane');
    
    // 创建子弹组（自动对象池）
    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 100
    });
}

function update() {
    // 游戏逻辑
}
```

**为什么不卡**：
- 使用WebGL渲染（GPU加速）
- 自动对象池（不频繁创建/销毁对象）
- 精灵图批量渲染
- 优化的碰撞检测

---

### 2. PixiJS ⭐⭐⭐⭐

**官网**：https://pixijs.com/

**优点**：
- 超快的2D WebGL渲染器
- 不是完整游戏引擎，但渲染性能极佳
- 可以处理数千个精灵
- 支持粒子效果
- 轻量级

**适合场景**：
- 需要大量对象的游戏
- 粒子特效多的游戏
- 需要自定义游戏引擎

**代码示例**：
```javascript
// 创建应用
const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.body.appendChild(app.view);

// 创建精灵
const sprite = PIXI.Sprite.from('plane.png');
sprite.x = 400;
sprite.y = 300;
app.stage.addChild(sprite);

// 游戏循环
app.ticker.add((delta) => {
    sprite.rotation += 0.01 * delta;
});
```

---

### 3. Three.js ⭐⭐⭐

**官网**：https://threejs.org/

**优点**：
- 3D游戏引擎
- 也可以用于2D游戏
- WebGL渲染
- 强大的3D效果

**适合场景**：
- 3D游戏
- 需要3D效果的2D游戏
- 视觉效果要求高的游戏

**代码示例**：
```javascript
// 创建场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建物体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 渲染循环
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    renderer.render(scene, camera);
}
animate();
```

---

### 4. Babylon.js ⭐⭐⭐

**官网**：https://www.babylonjs.com/

**优点**：
- 强大的3D游戏引擎
- 完整的物理引擎
- VR/AR支持
- 性能优秀

**适合场景**：
- 3D游戏
- VR/AR游戏
- 复杂的3D场景

---

### 5. Matter.js ⭐⭐⭐

**官网**：https://brm.io/matter-js/

**优点**：
- 2D物理引擎
- 可以和其他库配合使用
- 真实的物理效果

**适合场景**：
- 需要物理效果的游戏
- 愤怒的小鸟类游戏
- 重力、碰撞、弹跳等

---

## 对比表格

| 库名 | 类型 | 难度 | 性能 | 适合你的项目 |
|------|------|------|------|-------------|
| Phaser.js | 2D游戏引擎 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 非常适合 |
| PixiJS | 2D渲染器 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 适合 |
| Three.js | 3D引擎 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ 太复杂 |
| Babylon.js | 3D引擎 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ 太复杂 |
| Matter.js | 物理引擎 | ⭐⭐ | ⭐⭐⭐ | ⚠️ 需配合其他库 |

---

## 为什么专业游戏不卡？

### 1. 使用精灵图（Sprite Sheet）
```
不是每次都画图形，而是：
1. 预先加载图片
2. 直接贴图（GPU加速）
3. 批量渲染
```

### 2. 对象池（Object Pool）
```javascript
// 不好的做法（你现在的代码）
function fire() {
    bullets.push({ x: 100, y: 100 }); // 每次创建新对象
}

// 好的做法（对象池）
const bulletPool = [];
function fire() {
    let bullet = bulletPool.find(b => !b.active); // 复用对象
    if (!bullet) {
        bullet = { x: 0, y: 0, active: false };
        bulletPool.push(bullet);
    }
    bullet.active = true;
    bullet.x = 100;
    bullet.y = 100;
}
```

### 3. WebGL渲染
```
Canvas 2D：CPU渲染，慢
WebGL：GPU渲染，快100倍
```

### 4. 批量渲染
```
不好：每个子弹单独画
好：所有子弹一次性画
```

---

## 如何使用Phaser.js重写你的游戏

### 步骤1：引入Phaser
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
```

### 步骤2：创建游戏配置
```javascript
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
```

### 步骤3：加载资源
```javascript
function preload() {
    // 加载图片（可以用emoji转图片）
    this.load.image('plane', 'plane.png');
    this.load.image('bullet', 'bullet.png');
    this.load.image('enemy', 'enemy.png');
}
```

### 步骤4：创建游戏对象
```javascript
function create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'plane');
    this.player.setCollideWorldBounds(true);
    
    // 创建子弹组（自动对象池！）
    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 100,
        runChildUpdate: true
    });
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 碰撞检测（自动！）
    this.physics.add.overlap(this.bullets, this.enemies, hitEnemy, null, this);
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 自动射击
    this.time.addEvent({
        delay: 200,
        callback: fire,
        callbackScope: this,
        loop: true
    });
}
```

### 步骤5：游戏逻辑
```javascript
function update() {
    // 玩家移动
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(300);
    } else {
        this.player.setVelocityX(0);
    }
}

function fire() {
    // 从对象池获取子弹（不创建新对象！）
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-400);
    }
}

function hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
}
```

---

## 性能对比

### 你现在的代码（Canvas 2D）
```
- 16发子弹 × 20粒子 = 320对象
- 每帧创建/销毁对象
- CPU渲染
- shadowBlur很慢
- 结果：卡死
```

### 使用Phaser.js
```
- 100发子弹（对象池复用）
- 不创建/销毁对象
- GPU渲染（WebGL）
- 批量渲染
- 结果：60 FPS流畅
```

---

## 推荐学习资源

### Phaser.js教程
1. **官方教程**：https://phaser.io/tutorials/making-your-first-phaser-3-game
2. **中文教程**：搜索"Phaser 3 中文教程"
3. **示例代码**：https://phaser.io/examples

### 视频教程
1. YouTube搜索："Phaser 3 Tutorial"
2. B站搜索："Phaser游戏开发"

---

## 总结

### 当前方案（已优化）
✅ 优点：
- 不需要学习新库
- 代码简单
- 已经能流畅运行

❌ 缺点：
- 特效有限
- 性能有上限
- 需要手动优化

### 使用Phaser.js
✅ 优点：
- 性能极佳（GPU加速）
- 自动对象池
- 丰富的特效
- 专业的游戏引擎
- 大量示例

❌ 缺点：
- 需要学习新库（1-2周）
- 需要重写代码
- 文件稍大（~1MB）

---

## 我的建议

### 短期（现在）
✅ 使用当前优化版本
- 已经能流畅运行
- 不需要重写代码
- 满足基本需求

### 长期（如果要做更多游戏）
✅ 学习Phaser.js
- 一次学习，终身受益
- 可以做各种2D游戏
- 性能和特效都更好
- 社区支持好

---

## 快速开始Phaser.js

如果你想试试Phaser.js，可以这样开始：

### 1. 创建HTML文件
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
</head>
<body>
    <script src="game.js"></script>
</body>
</html>
```

### 2. 创建game.js
```javascript
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        create: create
    }
};

const game = new Phaser.Game(config);

function create() {
    this.add.text(400, 300, 'Hello Phaser!', { 
        fontSize: '32px', 
        fill: '#fff' 
    }).setOrigin(0.5);
}
```

### 3. 打开浏览器
就能看到"Hello Phaser!"了！

---

**总结**：现在的优化版本已经够用了，但如果以后想做更复杂的游戏，强烈推荐学习Phaser.js！
