// 优化后的子弹绘制函数 - 性能提升版
// 将此函数替换reading.js中的drawBullets函数（785-1174行）

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        
        const size = bullet.size || 5;
        const x = bullet.x;
        const y = bullet.y;
        
        // 根据类型绘制（简化版，无粒子系统）
        switch(bullet.type) {
            case 'fire':
                // 火焰：简单渐变
                const fireGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                fireGrad.addColorStop(0, '#ffff00');
                fireGrad.addColorStop(0.6, '#ff6600');
                fireGrad.addColorStop(1, '#ff0000');
                ctx.fillStyle = fireGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ice':
                // 冰晶：渐变+边缘
                const iceGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                iceGrad.addColorStop(0, '#ffffff');
                iceGrad.addColorStop(0.5, '#00ffff');
                iceGrad.addColorStop(1, '#0088ff');
                ctx.fillStyle = iceGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                break;
                
            case 'lightning':
                // 闪电：锯齿线
                const zigzag = Math.sin(bullet.age * 0.3) * 3;
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = size * 0.8;
                ctx.beginPath();
                ctx.moveTo(x + zigzag, y - 8);
                ctx.lineTo(x - zigzag, y + 8);
                ctx.stroke();
                break;
                
            case 'poison':
                // 毒液：脉动
                const pulse = Math.sin(bullet.age * 0.2) * 2;
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, size + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'crystal':
                // 水晶：六边形
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.fillStyle = '#ff00ff';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 / 6) * i;
                    const px = Math.cos(a) * size;
                    const py = Math.sin(a) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'wind':
                // 风：波浪
                const wave = Math.sin(bullet.age * 0.2) * 4;
                ctx.strokeStyle = '#87ceeb';
                ctx.lineWidth = size * 0.8;
                ctx.beginPath();
                ctx.moveTo(x + wave, y - 6);
                ctx.quadraticCurveTo(x, y, x - wave, y + 6);
                ctx.stroke();
                break;
                
            case 'rainbow':
                // 彩虹：色相变化
                ctx.fillStyle = `hsl(${bullet.hue}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'star':
                // 星星：五角星
                ctx.fillStyle = '#ffd700';
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const px = Math.cos(a) * size;
                    const py = Math.sin(a) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                    const ia = a + Math.PI / 5;
                    const ipx = Math.cos(ia) * size * 0.4;
                    const ipy = Math.sin(ia) * size * 0.4;
                    ctx.lineTo(ipx, ipy);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'holy':
                // 圣光：十字+圆
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - size * 1.2, y);
                ctx.lineTo(x + size * 1.2, y);
                ctx.moveTo(x, y - size * 1.2);
                ctx.lineTo(x, y + size * 1.2);
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'water':
                // 水：波纹
                const ripple = (bullet.age * 2) % 12;
                ctx.strokeStyle = `rgba(30, 144, 255, ${1 - ripple / 12})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, ripple, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = '#1e90ff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'gold':
                // 金色：菱形
                ctx.fillStyle = '#ffd700';
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size, 0);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'firework':
                // 烟花：渐变
                const fwGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
                fwGrad.addColorStop(0, '#ffffff');
                fwGrad.addColorStop(0.5, '#ff1493');
                fwGrad.addColorStop(1, '#ff69b4');
                ctx.fillStyle = fwGrad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'nebula':
                // 星云：大光晕
                const nebGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.3);
                nebGrad.addColorStop(0, '#ffffff');
                nebGrad.addColorStop(0.4, '#9370db');
                nebGrad.addColorStop(1, 'rgba(147, 112, 219, 0)');
                ctx.fillStyle = nebGrad;
                ctx.beginPath();
                ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'laser':
                // 激光：线条
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = size * 0.8;
                ctx.beginPath();
                ctx.moveTo(x, y + 15);
                ctx.lineTo(x, y - 15);
                ctx.stroke();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = size * 0.3;
                ctx.stroke();
                break;
                
            case 'nuclear':
                // 核能：辐射
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 / 6) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a) * size * 1.3, Math.sin(a) * size * 1.3);
                    ctx.stroke();
                }
                break;
                
            case 'meteor':
                // 流星：拖尾
                ctx.fillStyle = 'rgba(255, 140, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(x, y + 8, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ultimate':
                // 终极：彩虹旋转
                const hue = (bullet.age * 10) % 360;
                ctx.translate(x, y);
                ctx.rotate(bullet.angle);
                for (let i = 0; i < 8; i++) {
                    const a = (Math.PI * 2 / 8) * i;
                    ctx.fillStyle = `hsl(${(hue + i * 45) % 360}, 100%, 50%)`;
                    ctx.beginPath();
                    ctx.arc(0, 0, size, a, a + Math.PI / 4);
                    ctx.lineTo(0, 0);
                    ctx.fill();
                }
                break;
                
            default:
                // 默认
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
        }
        
        ctx.restore();
        
        // 巨弹光晕
        if (bullet.size > 5) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, bullet.size + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 穿透标记
        if (bullet.pierce) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', x, y + 3);
        }
    });
}
