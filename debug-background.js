// 背景调试工具
// 在浏览器控制台运行这些命令来调试背景问题

// 1. 检查当前设置
function checkSettings() {
    const settings = getSettings();
    console.log('当前设置:', settings);
    console.log('专注力背景ID:', settings.focusBackground);
    console.log('口算竞速背景ID:', settings.raceBackground);
}

// 2. 检查背景数据
function checkBackground(backgroundId) {
    const bg = getBackgroundData(backgroundId);
    console.log('背景数据:', bg);
    console.log('是否完全解锁:', bg?.isFullyUnlocked);
    console.log('图片URL:', bg?.imageUrl);
}

// 3. 手动应用背景
function manualApplyBackground(module) {
    console.log('尝试应用背景到:', module);
    applyBackground(module);
    
    // 检查应用结果
    setTimeout(() => {
        let element;
        if (module === 'focus') {
            element = document.getElementById('mainScreen');
        } else if (module === 'race') {
            element = document.getElementById('raceScreen');
        }
        
        if (element) {
            console.log('目标元素:', element);
            console.log('背景图片:', element.style.backgroundImage);
            console.log('背景大小:', element.style.backgroundSize);
        } else {
            console.log('未找到目标元素');
        }
    }, 100);
}

// 4. 强制设置背景
function forceSetBackground(module, backgroundId) {
    setModuleBackground(module, backgroundId);
    console.log('已设置背景ID:', backgroundId);
    manualApplyBackground(module);
}

// 5. 列出所有已解锁的背景
function listUnlockedBackgrounds() {
    const backgrounds = getUnlockedBackgrounds();
    console.log('已解锁的背景图:', backgrounds);
    backgrounds.forEach(bg => {
        console.log(`- ${bg.name} (ID: ${bg.id})`);
    });
}

console.log('背景调试工具已加载！');
console.log('可用命令:');
console.log('- checkSettings() - 检查当前设置');
console.log('- checkBackground(backgroundId) - 检查背景数据');
console.log('- manualApplyBackground("focus"|"race") - 手动应用背景');
console.log('- forceSetBackground("focus"|"race", backgroundId) - 强制设置背景');
console.log('- listUnlockedBackgrounds() - 列出已解锁背景');
