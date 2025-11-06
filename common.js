// 公共数据管理模块

// 存储键（避免与race.js冲突，使用不同的变量名）
const COMMON_KEYS = {
    USER_DATA: 'focusTree_userData',
    BACKGROUNDS: 'focusTree_backgrounds',
    SETTINGS: 'focusTree_settings'
};

// 背景图配置
const BACKGROUNDS_CONFIG = [
    {
        id: 'bg_1',
        name: '星空夜景',
        imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200'
    },
    {
        id: 'bg_2',
        name: '森林小径',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200'
    },
    {
        id: 'bg_3',
        name: '海边日落',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'
    },
    {
        id: 'bg_4',
        name: '山峰云海',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'
    },
    {
        id: 'bg_5',
        name: '樱花盛开',
        imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=200'
    },
    {
        id: 'bg_6',
        name: '极光之夜',
        imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200'
    },
    {
        id: 'bg_7',
        name: '秋日枫叶',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
    },
    {
        id: 'bg_8',
        name: '雪山湖泊',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'
    },
    {
        id: 'bg_9',
        name: '城市夜景',
        imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200'
    },
    {
        id: 'bg_10',
        name: '彩虹天空',
        imageUrl: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=200'
    }
];

// 初始化数据
function initializeData() {
    if (!localStorage.getItem(COMMON_KEYS.USER_DATA)) {
        const defaultUserData = {
            trees: 0,
            availableTrees: 0,
            coins: 0,
            lastStudyDate: null,
            studyStreak: 0
        };
        localStorage.setItem(COMMON_KEYS.USER_DATA, JSON.stringify(defaultUserData));
    }
    
    if (!localStorage.getItem(COMMON_KEYS.BACKGROUNDS)) {
        const backgroundsData = BACKGROUNDS_CONFIG.map(bg => ({
            ...bg,
            unlockedPieces: [],
            isFullyUnlocked: false,
            unlockedAt: null
        }));
        localStorage.setItem(COMMON_KEYS.BACKGROUNDS, JSON.stringify(backgroundsData));
    }
    
    if (!localStorage.getItem(COMMON_KEYS.SETTINGS)) {
        const defaultSettings = {
            focusBackground: null,
            raceBackground: null
        };
        localStorage.setItem(COMMON_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
}

// 获取用户数据
function getUserData() {
    const data = localStorage.getItem(COMMON_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
}

// 保存用户数据
function saveUserData(userData) {
    localStorage.setItem(COMMON_KEYS.USER_DATA, JSON.stringify(userData));
}

// 获取所有背景图数据
function getAllBackgrounds() {
    const data = localStorage.getItem(COMMON_KEYS.BACKGROUNDS);
    return data ? JSON.parse(data) : [];
}

// 获取单个背景图数据
function getBackgroundData(backgroundId) {
    const backgrounds = getAllBackgrounds();
    return backgrounds.find(bg => bg.id === backgroundId);
}

// 保存背景图数据
function saveBackgroundData(backgroundData) {
    const backgrounds = getAllBackgrounds();
    const index = backgrounds.findIndex(bg => bg.id === backgroundData.id);
    if (index !== -1) {
        backgrounds[index] = backgroundData;
        localStorage.setItem(COMMON_KEYS.BACKGROUNDS, JSON.stringify(backgrounds));
    }
}

// 获取设置
function getSettings() {
    console.log('getSettings 被调用，键名:', COMMON_KEYS.SETTINGS);
    const data = localStorage.getItem(COMMON_KEYS.SETTINGS);
    console.log('从localStorage读取的原始数据:', data);
    
    if (data) {
        const parsed = JSON.parse(data);
        console.log('解析后的数据:', parsed);
        return parsed;
    } else {
        console.log('没有找到设置数据，返回默认值');
        // 如果没有设置，返回默认值
        const defaultSettings = {
            focusBackground: null,
            raceBackground: null
        };
        localStorage.setItem(COMMON_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        return defaultSettings;
    }
}

// 保存设置
function saveSettings(settings) {
    console.log('saveSettings 被调用，键名:', COMMON_KEYS.SETTINGS);
    console.log('要保存的设置:', settings);
    const jsonString = JSON.stringify(settings);
    console.log('JSON字符串:', jsonString);
    localStorage.setItem(COMMON_KEYS.SETTINGS, jsonString);
    
    // 立即验证是否保存成功
    const verification = localStorage.getItem(COMMON_KEYS.SETTINGS);
    console.log('保存后立即读取验证:', verification);
    console.log('验证结果:', verification === jsonString ? '✓ 保存成功' : '✗ 保存失败');
}

// 添加小树
function addTrees(count) {
    const userData = getUserData();
    userData.trees += count;
    userData.availableTrees += count;
    userData.lastStudyDate = new Date().toISOString().split('T')[0];
    saveUserData(userData);
    return userData;
}

// 兑换金币
function exchangeCoins(times = 1) {
    const userData = getUserData();
    const treesNeeded = times * 10;
    
    if (userData.availableTrees < treesNeeded) {
        return { success: false, message: '小树不足，无法兑换' };
    }
    
    userData.availableTrees -= treesNeeded;
    userData.coins += times;
    saveUserData(userData);
    
    return { success: true, coins: times, userData };
}

// 解锁拼图块
function unlockPuzzlePiece(backgroundId, pieceIndex) {
    const userData = getUserData();
    
    if (userData.coins < 10) {
        return { success: false, message: '金币不足，需要10个金币' };
    }
    
    const background = getBackgroundData(backgroundId);
    
    if (!background) {
        return { success: false, message: '背景图不存在' };
    }
    
    if (background.unlockedPieces.includes(pieceIndex)) {
        return { success: false, message: '该拼图块已解锁' };
    }
    
    userData.coins -= 10;
    saveUserData(userData);
    
    background.unlockedPieces.push(pieceIndex);
    
    const isComplete = background.unlockedPieces.length === 16;
    if (isComplete) {
        background.isFullyUnlocked = true;
        background.unlockedAt = Date.now();
    }
    
    saveBackgroundData(background);
    
    return { 
        success: true, 
        isComplete,
        background,
        userData
    };
}

// 获取随机未解锁的拼图块
function getRandomLockedPiece(backgroundId) {
    const background = getBackgroundData(backgroundId);
    if (!background) return null;
    
    const allPieces = Array.from({length: 16}, (_, i) => i);
    const lockedPieces = allPieces.filter(i => !background.unlockedPieces.includes(i));
    
    if (lockedPieces.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * lockedPieces.length);
    return lockedPieces[randomIndex];
}

// 获取已完全解锁的背景图
function getUnlockedBackgrounds() {
    const backgrounds = getAllBackgrounds();
    return backgrounds.filter(bg => bg.isFullyUnlocked);
}

// 获取拼图块样式
function getPieceStyle(backgroundUrl, pieceIndex) {
    const row = Math.floor(pieceIndex / 4);
    const col = pieceIndex % 4;
    const size = 25;
    const x = col * size;
    const y = row * size;
    
    return {
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: '400% 400%',
        backgroundPosition: `${x}% ${y}%`
    };
}

// 应用背景到页面
function applyBackground(module) {
    console.log('applyBackground 被调用，模块:', module);
    
    const settings = getSettings();
    console.log('当前设置:', settings);
    
    let backgroundId = null;
    
    if (module === 'focus') {
        backgroundId = settings.focusBackground;
    } else if (module === 'race') {
        backgroundId = settings.raceBackground;
    }
    
    console.log('背景ID:', backgroundId);
    
    let targetElement = null;
    if (module === 'focus') {
        targetElement = document.getElementById('mainScreen') || document.querySelector('.fullscreen-container');
    } else if (module === 'race') {
        // 应用到赛道区域，而不是整个页面
        targetElement = document.querySelector('.race-track-container');
    }
    
    console.log('目标元素:', targetElement);
    
    if (!targetElement) {
        targetElement = document.body;
        console.log('未找到目标元素，使用body');
    }
    
    if (backgroundId) {
        const background = getBackgroundData(backgroundId);
        console.log('背景数据:', background);
        
        if (background && background.isFullyUnlocked) {
            console.log('应用背景图片:', background.imageUrl);
            
            // 对于race模式，应用到赛道区域
            if (module === 'race') {
                const trackContainer = document.querySelector('.race-track-container');
                if (trackContainer) {
                    trackContainer.style.backgroundImage = `url(${background.imageUrl})`;
                    trackContainer.style.backgroundSize = 'cover';
                    trackContainer.style.backgroundPosition = 'center';
                    trackContainer.style.backgroundRepeat = 'no-repeat';
                    console.log('背景已应用到赛道区域');
                }
            } else {
                targetElement.style.backgroundImage = `url(${background.imageUrl})`;
                targetElement.style.backgroundSize = 'cover';
                targetElement.style.backgroundPosition = 'center';
                targetElement.style.backgroundRepeat = 'no-repeat';
            }
        } else {
            console.log('背景未完全解锁或不存在');
        }
    } else {
        console.log('没有选择背景，使用默认背景');
        targetElement.style.backgroundImage = '';
        if (module === 'focus' && targetElement.id === 'mainScreen') {
            targetElement.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 70%, #8B7355 70%, #654321 100%)';
        } else if (module === 'race' && targetElement.classList.contains('race-track-container')) {
            targetElement.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 30%, #90EE90 30%, #7CCD7C 100%)';
        }
    }
}

// 设置模块背景
function setModuleBackground(module, backgroundId) {
    console.log('setModuleBackground 被调用:', module, backgroundId);
    
    const settings = getSettings();
    console.log('获取到的设置:', settings);
    
    if (module === 'focus') {
        settings.focusBackground = backgroundId;
    } else if (module === 'race') {
        settings.raceBackground = backgroundId;
    }
    
    console.log('更新后的设置:', settings);
    saveSettings(settings);
    console.log('设置已保存');
}

// 页面加载时初始化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initializeData();
    });
}
