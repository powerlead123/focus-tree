// 家长端 JavaScript
let currentRoomId = null;
let useFirebase = false;
let connected = false;

// DOM 元素
const roomInputPanel = document.getElementById('roomInputPanel');
const roomIdInput = document.getElementById('roomIdInput');
const connectBtn = document.getElementById('connectBtn');
const distractBtn = document.getElementById('distractBtn');
const sessionStatus = document.getElementById('sessionStatus');
const parentTimer = document.getElementById('parentTimer');
const distractionCount = document.getElementById('distractionCount');
const cloudDuration = document.getElementById('cloudDuration');

// 初始化 Firebase
useFirebase = initFirebase();

// 从 URL 获取房间号
const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl = urlParams.get('room');
if (roomFromUrl) {
    roomIdInput.value = roomFromUrl;
}

// 连接按钮
connectBtn.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim();
    if (!roomId || roomId.length !== 6) {
        alert('请输入正确的6位房间号');
        return;
    }
    
    connectToRoom(roomId);
});

// 回车键连接
roomIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        connectBtn.click();
    }
});

// 连接到房间
function connectToRoom(roomId) {
    if (useFirebase) {
        // Firebase 模式
        joinRoom(roomId).then((snapshot) => {
            if (snapshot.exists()) {
                currentRoomId = roomId;
                connected = true;
                showMonitorPanel();
                startMonitoring();
            } else {
                alert('房间不存在，请检查房间号是否正确');
            }
        }).catch((error) => {
            console.error('连接失败:', error);
            alert('连接失败，请重试');
        });
    } else {
        // 本地模式
        currentRoomId = roomId;
        connected = true;
        showMonitorPanel();
        startLocalMonitoring();
    }
}

// 显示监控面板
function showMonitorPanel() {
    roomInputPanel.style.display = 'none';
    document.getElementById('monitorPanel').classList.remove('hidden');
    
    // 显示连接的房间号
    document.getElementById('connectedRoomId').textContent = currentRoomId;
    
    sessionStatus.textContent = '进行中';
    sessionStatus.classList.add('active');
    distractBtn.disabled = false;
}

// 断开连接
document.getElementById('disconnectBtn').addEventListener('click', () => {
    if (confirm('确定要断开连接吗？')) {
        if (useFirebase) {
            stopListening();
        }
        currentRoomId = null;
        connected = false;
        
        document.getElementById('monitorPanel').classList.add('hidden');
        roomInputPanel.style.display = 'block';
        roomIdInput.value = '';
        
        sessionStatus.textContent = '未开始';
        sessionStatus.classList.remove('active');
        parentTimer.textContent = '00:00';
        distractionCount.textContent = '0次';
    }
});

// 开始监控（Firebase 模式）
function startMonitoring() {
    listenToRoom((data) => {
        if (data) {
            updateMonitorDisplay(data);
        }
    });
}

// 开始监控（本地模式）
function startLocalMonitoring() {
    setInterval(() => {
        const saved = localStorage.getItem('focusTreeSession');
        if (saved) {
            const session = JSON.parse(saved);
            if (session.active) {
                updateMonitorDisplay({
                    focusSeconds: session.focusSeconds,
                    distractions: session.distractionCount || 0
                });
            }
        }
    }, 1000);
}

// 更新监控显示
function updateMonitorDisplay(data) {
    if (data.focusSeconds !== undefined) {
        const minutes = Math.floor(data.focusSeconds / 60);
        const seconds = data.focusSeconds % 60;
        parentTimer.textContent = `${pad(minutes)}:${pad(seconds)}`;
    }
    
    if (data.distractions !== undefined) {
        distractionCount.textContent = `${data.distractions}次`;
    }
}

// 发送走神信号
distractBtn.addEventListener('click', () => {
    const duration = parseInt(cloudDuration.value) || 5;
    
    if (useFirebase && currentRoomId) {
        // Firebase 模式
        sendSignal('distraction', duration).then(() => {
            showButtonFeedback();
        });
    } else {
        // 本地模式
        const signal = {
            action: 'distraction',
            duration: duration,
            timestamp: Date.now()
        };
        localStorage.setItem('parentSignal', JSON.stringify(signal));
        showButtonFeedback();
    }
});

// 按钮反馈
function showButtonFeedback() {
    const duration = parseInt(cloudDuration.value) || 5;
    distractBtn.textContent = '✅ 已发送提醒';
    distractBtn.disabled = true;
    
    setTimeout(() => {
        distractBtn.textContent = '☁️ 孩子走神了';
        distractBtn.disabled = false;
    }, duration * 1000);
}

function pad(num) {
    return num.toString().padStart(2, '0');
}
