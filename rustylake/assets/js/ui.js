// UI交互处理
document.addEventListener('DOMContentLoaded', () => {
    // 检测设备类型
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // 根据设备类型添加相应的类
    if (isMobile) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.add('desktop-device');
    }
    
    // 初始化游戏
    const game = new Game();
    
    // 处理窗口大小变化
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // 处理窗口大小变化
    function handleResize() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // 处理分享按钮点击
    const shareButtons = document.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 如果是移动设备，尝试使用Web Share API
            if (navigator.share && isMobile) {
                navigator.share({
                    title: '内墙卡牌猜谜游戏',
                    text: `我在内墙卡牌猜谜游戏中获得了 ${game.score} 分！你也来试试吧！`,
                    url: window.location.href
                }).catch(err => {
                    console.log('分享失败:', err);
                });
            } else {
                // 如果不支持Web Share API，显示自定义分享界面
                const shareContainer = document.getElementById('share-container');
                if (shareContainer) {
                    shareContainer.style.display = 'flex';
                }
            }
        });
    });
    
    // 处理复制链接按钮
    const copyLinkButton = document.getElementById('copy-link-button');
    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', () => {
            const tempInput = document.createElement('input');
            tempInput.value = window.location.href;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // 显示复制成功提示
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = '链接已复制';
            document.body.appendChild(tooltip);
            
            // 2秒后移除提示
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 2000);
        });
    }
});