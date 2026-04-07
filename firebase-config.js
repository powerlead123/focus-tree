// Firebase 配置文件
// 请在 Firebase 控制台创建项目后，将配置信息填写在这里

const firebaseConfig = {
    apiKey: "AIzaSyATgXnIjQb2kQsGTHzFytbEIkUx6V_-8AY",
    authDomain: "focus-tree-95f20.firebaseapp.com",
    databaseURL: "https://focus-tree-95f20-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "focus-tree-95f20",
    storageBucket: "focus-tree-95f20.firebasestorage.app",
    messagingSenderId: "123798629507",
    appId: "1:123798629507:web:25ea37e9ffa50726887fb6"
};

// 初始化 Firebase
let database = null;
let currentRoomRef = null;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK 未加载，将使用本地模式');
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        console.log('Firebase 初始化成功');
        return true;
    } catch (error) {
        console.error('Firebase 初始化失败:', error);
        return false;
    }
}

// 生成6位房间号
function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 创建房间
function createRoom(roomId, taskName, expectedMinutes) {
    if (!database) return Promise.resolve();
    
    currentRoomRef = database.ref('rooms/' + roomId);
    return currentRoomRef.set({
        taskName: taskName,
        expectedMinutes: expectedMinutes,
        status: 'active',
        trees: 0,
        distractions: 0,
        startTime: Date.now(),
        signal: null
    });
}

// 加入房间
function joinRoom(roomId) {
    if (!database) return Promise.resolve({ exists: () => true });
    
    currentRoomRef = database.ref('rooms/' + roomId);
    return currentRoomRef.once('value');
}

// 更新房间数据
function updateRoom(data) {
    if (!currentRoomRef) return Promise.resolve();
    return currentRoomRef.update(data);
}

// 发送信号（家长端用）
function sendSignal(action, duration) {
    if (!currentRoomRef) return Promise.resolve();
    return currentRoomRef.child('signal').set({
        action: action,
        duration: duration,
        timestamp: Date.now()
    });
}

// 监听信号（孩子端用）
let lastSignalTimestamp = 0;
function listenToSignals(callback) {
    if (!currentRoomRef) return;
    currentRoomRef.child('signal').on('value', (snapshot) => {
        const signal = snapshot.val();
        if (signal && signal.timestamp && signal.timestamp > lastSignalTimestamp) {
            lastSignalTimestamp = signal.timestamp;
            callback(signal);
            console.log('收到信号:', signal);
        }
    });
}

// 监听房间数据（家长端用）
function listenToRoom(callback) {
    if (!currentRoomRef) return;
    currentRoomRef.on('value', (snapshot) => {
        callback(snapshot.val());
    });
}

// 清理房间监听
function stopListening() {
    if (currentRoomRef) {
        currentRoomRef.off();
    }
}

// 删除房间
function deleteRoom() {
    if (!currentRoomRef) return Promise.resolve();
    return currentRoomRef.remove();
}
