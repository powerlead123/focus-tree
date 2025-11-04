# Firebase 配置指南

## 第一步：创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（如：focus-tree）
4. 关闭 Google Analytics（可选）
5. 点击"创建项目"

## 第二步：创建 Web 应用

1. 在项目概览页面，点击 Web 图标（</>）
2. 输入应用昵称（如：focus-tree-web）
3. 不勾选 Firebase Hosting
4. 点击"注册应用"
5. 复制配置代码中的配置对象

## 第三步：启用 Realtime Database

1. 在左侧菜单选择"构建" → "Realtime Database"
2. 点击"创建数据库"
3. 选择数据库位置（建议选择 asia-southeast1）
4. 选择"以测试模式启动"（开发阶段）
5. 点击"启用"

## 第四步：配置安全规则

在 Realtime Database 的"规则"标签中，使用以下规则：

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["status"]
      }
    }
  }
}
```

**注意**：这是开发环境的规则，生产环境需要更严格的规则。

## 第五步：更新配置文件

将第二步复制的配置信息填入 `firebase-config.js` 文件：

```javascript
const firebaseConfig = {
    apiKey: "你的API密钥",
    authDomain: "你的项目ID.firebaseapp.com",
    databaseURL: "https://你的项目ID-default-rtdb.firebaseio.com",
    projectId: "你的项目ID",
    storageBucket: "你的项目ID.appspot.com",
    messagingSenderId: "你的消息发送者ID",
    appId: "你的应用ID"
};
```

## 第六步：测试

1. 在本地打开 `index.html`
2. 输入任务名称和时间
3. 会显示一个6位房间号
4. 在手机上打开 `parent.html`
5. 输入房间号连接
6. 测试"走神"按钮是否能让孩子端显示乌云

## 部署到 Cloudflare Pages

1. 将代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 选择"Workers & Pages" → "创建应用程序" → "Pages"
4. 连接 GitHub 仓库
5. 配置构建设置：
   - 构建命令：留空
   - 构建输出目录：/
6. 点击"保存并部署"

部署完成后，你会得到一个网址，如：`https://focus-tree.pages.dev`

## 使用方式

### 孩子端
访问：`https://你的域名.pages.dev/index.html`

### 家长端
访问：`https://你的域名.pages.dev/parent.html`

或者扫描孩子端显示的二维码（未来功能）

## 费用说明

Firebase 免费计划（Spark）包含：
- 同时连接数：100
- 存储空间：1 GB
- 下载流量：10 GB/月

对于个人使用完全免费！

## 故障排除

### 问题1：无法连接到 Firebase
- 检查 `firebase-config.js` 配置是否正确
- 检查浏览器控制台是否有错误信息
- 确认 Realtime Database 已启用

### 问题2：房间号无法连接
- 确认两端都能访问互联网
- 检查房间号是否输入正确
- 查看 Firebase 控制台的数据库是否有数据写入

### 问题3：本地模式
如果 Firebase 未配置或加载失败，系统会自动降级到本地模式（localStorage），此时只能在同一浏览器的不同标签页使用。

## 安全建议（生产环境）

1. 使用更严格的数据库规则
2. 添加房间过期机制（24小时后自动删除）
3. 限制房间创建频率
4. 考虑添加简单的身份验证

## 需要帮助？

如果遇到问题，可以：
1. 查看浏览器控制台的错误信息
2. 检查 Firebase 控制台的数据库内容
3. 参考 Firebase 官方文档
