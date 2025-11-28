let currentWall = 'front';
let solvedPuzzles = new Set();
let gameStartTime = Date.now();

// 立即初始化函数绑定
(function() {
    console.log('Initializing game functions...');
})();

// 创建全局game对象，兼容原始的封神卷宗谜题
const game = {
    solvePuzzle: function(wall) {
        solvedPuzzles.add(wall);
        updateProgress();
        
        // 标记墙面为已解决
        const wallElement = document.querySelector(`[data-wall="${wall}"]`);
        if (wallElement) {
            wallElement.classList.add('solved');
        }
    }
};

// 初始化游戏
function initGame() {
    updateProgress();
    gameStartTime = Date.now();
}

// 旋转到指定墙面
function rotateTo(wall) {
    console.log('rotateTo called with wall:', wall); // 调试日志
    currentWall = wall;
    const room = document.getElementById('room');
    
    const rotations = {
        front: 'rotateX(0deg) rotateY(0deg)',
        back: 'rotateX(0deg) rotateY(180deg)',
        left: 'rotateX(0deg) rotateY(90deg)',
        right: 'rotateX(0deg) rotateY(-90deg)',
        top: 'rotateX(90deg) rotateY(0deg)',
        bottom: 'rotateX(-90deg) rotateY(0deg)'
    };
    
    room.style.transform = rotations[wall];
}

// 确保函数在全局作用域中可用
window.rotateTo = rotateTo;
window.loadPuzzle = loadPuzzle;
window.loadBackWall = loadBackWall;
window.loadLeftWall = loadLeftWall;
window.loadRightWall = loadRightWall;
window.loadTopWall = loadTopWall;
window.loadDownWall = loadDownWall;

// 调试：确认函数已绑定
console.log('Functions bound to window:', {
    rotateTo: typeof window.rotateTo,
    loadPuzzle: typeof window.loadPuzzle
});

// 更新进度
function updateProgress() {
    const progress = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');
    const completed = solvedPuzzles.size;
    
    progress.textContent = `${completed}/6`;
    progressFill.style.width = `${(completed / 6) * 100}%`;
    
    // 检查是否完成所有谜题
    if (completed === 6) {
        showVictory();
    }
    
    // 解锁其他墙面
    if (completed > 0) {
        document.querySelectorAll('.solve-btn[disabled]').forEach(btn => {
            btn.disabled = false;
            btn.textContent = btn.textContent.replace('🔒 需先完成前墙', '🎯 开始挑战');
        });
    }
}

// 加载谜题
function loadPuzzle(wall) {
    console.log('loadPuzzle called with wall:', wall); // 调试日志
    
    switch(wall) {
        case 'front':
            console.log('Loading front wall...'); // 调试日志
            loadFrontWall();
            break;
        case 'right':
            window.open('games/right-wall.html', '_blank');
            break;
        case 'top':
            loadTopWall();
            break;
        default:
            alert('谜题开发中...');
    }
}

// 确保函数在全局作用域中可用
window.loadPuzzle = loadPuzzle;

// 前墙谜题 - 加载原始的封神卷宗
function loadFrontWall() {
    console.log('Loading front wall puzzle...'); // 调试日志
    
    // 动态加载封神卷宗谜题
    const script = document.createElement('script');
    script.src = '../../puzzles/front-puzzle.js';
    script.onload = () => {
        console.log('Front puzzle script loaded'); // 调试日志
        // 调用原始的封神卷宗初始化函数
        if (window.initFrontPuzzle) {
            window.initFrontPuzzle();
        } else {
            console.error('initFrontPuzzle function not found');
        }
    };
    script.onerror = () => {
        console.error('Failed to load front puzzle script');
        alert('加载封神卷宗失败，请检查文件路径');
    };
    document.head.appendChild(script);
    
    // 加载对应的CSS文件
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../../puzzles/front-puzzle.css';
    link.onerror = () => {
        console.error('Failed to load front puzzle CSS');
    };
    document.head.appendChild(link);
}

// 后墙谜题 - 法宝争夺战
function loadBackWall() {
    // 跳转到后墙游戏页面
    const backWallWindow = window.open('back-wall.html', '_blank');
    
    // 监听游戏完成消息
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'backWallCompleted') {
            solvedPuzzles.add('back');
            document.getElementById('backPuzzle').innerHTML = `
                <div class="success">✅ 恭喜！你已成功完成法宝争夺战！</div>
            `;
            updateProgress();
        }
    });
}

// 左墙谜题 - Trinity Impossible
function loadLeftWall() {
    // 跳转到左墙游戏页面
    const leftWallWindow = window.open('left-wall.html', '_blank');
    
    // 监听游戏完成消息
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'leftWallCompleted') {
            solvedPuzzles.add('left');
            document.getElementById('leftPuzzle').innerHTML = `
                <div class="success">✅ 恭喜！你已成功完成Triangle Impossible挑战！</div>
            `;
            updateProgress();
        }
    });
}

// 右墙谜题 - 滑块谜题
function loadRightWall() {
    const container = document.getElementById('rightPuzzle');
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0代表空格
    shuffleArray(numbers);
    
    container.innerHTML = `
        <div class="sliding-puzzle">
            <h4>数字滑块</h4>
            <div class="puzzle-grid" id="puzzleGrid"></div>
            <button onclick="resetSliding()" class="solve-btn">重新开始</button>
        </div>
    `;
    
    renderSlidingPuzzle(numbers);
}

// 渲染滑块谜题
function renderSlidingPuzzle(numbers) {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(3, 60px)';
    grid.style.gap = '5px';
    grid.style.justifyContent = 'center';
    
    numbers.forEach((num, index) => {
        const cell = document.createElement('div');
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.border = '2px solid #fff';
        cell.style.borderRadius = '5px';
        cell.style.cursor = 'pointer';
        cell.style.fontSize = '20px';
        cell.style.fontWeight = 'bold';
        
        if (num === 0) {
            cell.style.background = 'transparent';
            cell.style.border = '2px dashed #666';
        } else {
            cell.style.background = 'rgba(255, 255, 255, 0.2)';
            cell.textContent = num;
            cell.onclick = () => moveSlide(index, numbers);
        }
        
        grid.appendChild(cell);
    });
}

// 移动滑块
function moveSlide(clickedIndex, numbers) {
    const emptyIndex = numbers.indexOf(0);
    const validMoves = [
        emptyIndex - 1, emptyIndex + 1, // 左右
        emptyIndex - 3, emptyIndex + 3  // 上下
    ];
    
    if (validMoves.includes(clickedIndex)) {
        // 检查边界条件
        if ((emptyIndex % 3 === 0 && clickedIndex === emptyIndex - 1) ||
            (emptyIndex % 3 === 2 && clickedIndex === emptyIndex + 1)) {
            return; // 不能跨行移动
        }
        
        [numbers[emptyIndex], numbers[clickedIndex]] = [numbers[clickedIndex], numbers[emptyIndex]];
        renderSlidingPuzzle(numbers);
        
        // 检查是否完成
        if (numbers.slice(0, 8).every((num, i) => num === i + 1)) {
            solvedPuzzles.add('right');
            document.getElementById('rightPuzzle').innerHTML = `
                <div class="success">✅ 恭喜完成滑块谜题！</div>
            `;
            updateProgress();
        }
    }
}

// 重置滑块
function resetSliding() {
    loadRightWall();
}

// 上墙谜题 - 猜猜是哪家
function loadTopWall() {
    console.log('loadTopWall called - navigating to guess company game');
    window.location.href = 'games/guess-company.html';
}

// 初始化星星谜题
function initStarPuzzle() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    
    // 北斗七星的相对位置
    const stars = [
        {x: 50, y: 50, id: 1},
        {x: 80, y: 60, id: 2},
        {x: 110, y: 70, id: 3},
        {x: 140, y: 80, id: 4},
        {x: 120, y: 110, id: 5},
        {x: 90, y: 120, id: 6},
        {x: 60, y: 130, id: 7}
    ];
    
    let clickedStars = [];
    
    // 绘制星星
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = clickedStars.includes(star.id) ? '#FFD700' : '#FFF';
            ctx.fill();
            ctx.strokeStyle = '#FFF';
            ctx.stroke();
        });
        
        // 绘制连线
        if (clickedStars.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            for (let i = 0; i < clickedStars.length - 1; i++) {
                const star1 = stars.find(s => s.id === clickedStars[i]);
                const star2 = stars.find(s => s.id === clickedStars[i + 1]);
                if (i === 0) ctx.moveTo(star1.x, star1.y);
                ctx.lineTo(star2.x, star2.y);
            }
            ctx.stroke();
        }
    }
    
    // 点击事件
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        stars.forEach(star => {
            const distance = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2);
            if (distance < 15 && !clickedStars.includes(star.id)) {
                clickedStars.push(star.id);
                drawStars();
                
                if (clickedStars.length === 7) {
                    // 检查顺序是否正确（简化版，只要连接了7颗星就算成功）
                    setTimeout(() => {
                        solvedPuzzles.add('top');
                        document.getElementById('topPuzzle').innerHTML = `
                            <div class="success">✅ 成功连接北斗七星！</div>
                        `;
                        updateProgress();
                    }, 500);
                }
            }
        });
    };
    
    // 重置星星
    window.resetStars = () => {
        clickedStars = [];
        drawStars();
    };
    
    drawStars();
}

// 下墙谜题 - 妲己的尾巴
function loadDownWall() {
    const container = document.getElementById('bottomPuzzle');
    container.innerHTML = `
        <div class="daji-puzzle">
            <h4>妲己的九尾迷宫</h4>
            <div class="maze-container">
                <div class="maze-grid" id="mazeGrid"></div>
            </div>
            <p>帮助妲己找到出口！使用方向键移动</p>
            <button onclick="resetMaze()" class="solve-btn">重新开始</button>
        </div>
    `;
    
    initMaze();
}

// 初始化迷宫
function initMaze() {
    const maze = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,1,0,1],
        [1,0,1,0,1,0,1],
        [1,0,1,0,0,0,1],
        [1,0,0,0,1,0,1],
        [1,1,1,1,1,1,1]
    ];
    
    let playerPos = {x: 1, y: 1};
    let exitPos = {x: 5, y: 4};
    
    function renderMaze() {
        const grid = document.getElementById('mazeGrid');
        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 30px)';
        grid.style.gap = '1px';
        grid.style.justifyContent = 'center';
        
        maze.forEach((row, y) => {
            row.forEach((cell, x) => {
                const cellDiv = document.createElement('div');
                cellDiv.style.width = '30px';
                cellDiv.style.height = '30px';
                cellDiv.style.display = 'flex';
                cellDiv.style.alignItems = 'center';
                cellDiv.style.justifyContent = 'center';
                cellDiv.style.fontSize = '16px';
                
                if (cell === 1) {
                    cellDiv.style.background = '#333';
                } else {
                    cellDiv.style.background = '#fff';
                }
                
                if (x === playerPos.x && y === playerPos.y) {
                    cellDiv.textContent = '🦊';
                    cellDiv.style.background = '#FFD700';
                } else if (x === exitPos.x && y === exitPos.y) {
                    cellDiv.textContent = '🚪';
                    cellDiv.style.background = '#90EE90';
                }
                
                grid.appendChild(cellDiv);
            });
        });
    }
    
    function movePlayer(dx, dy) {
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;
        
        if (newX >= 0 && newX < 7 && newY >= 0 && newY < 6 && maze[newY][newX] === 0) {
            playerPos.x = newX;
            playerPos.y = newY;
            renderMaze();
            
            if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
                solvedPuzzles.add('bottom');
                document.getElementById('bottomPuzzle').innerHTML = `
                    <div class="success">✅ 妲己成功逃出迷宫！</div>
                `;
                updateProgress();
            }
        }
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('mazeGrid')) {
            switch(e.key) {
                case 'ArrowUp': movePlayer(0, -1); break;
                case 'ArrowDown': movePlayer(0, 1); break;
                case 'ArrowLeft': movePlayer(-1, 0); break;
                case 'ArrowRight': movePlayer(1, 0); break;
            }
        }
    });
    
    window.resetMaze = () => {
        playerPos = {x: 1, y: 1};
        renderMaze();
    };
    
    renderMaze();
}

// 显示胜利界面
function showVictory() {
    const modal = document.getElementById('victoryModal');
    const gameTime = document.getElementById('gameTime');
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    gameTime.textContent = `${minutes}分${seconds}秒`;
    modal.style.display = 'flex';
}

// 重新开始游戏
function restartGame() {
    solvedPuzzles.clear();
    currentWall = 'front';
    gameStartTime = Date.now();
    
    // 重置所有墙面
    document.getElementById('frontPuzzle').innerHTML = `
        <button class="solve-btn" onclick="loadPuzzle('front')">📜 开启卷宗</button>
        <div class="clue">点击开启卷宗，仔细阅读并填入正确答案</div>
    `;
    
    document.getElementById('backPuzzle').innerHTML = `
        <button class="solve-btn" onclick="loadBackWall()" disabled>🔒 需先完成前墙</button>
        <div class="clue">参与封神大战，有你看中的法宝吗？</div>
    `;
    
    document.getElementById('leftPuzzle').innerHTML = `
        <button class="solve-btn" onclick="loadLeftWall()" disabled>🔒 需先完成前墙</button>
        <div class="clue">量化策略的不可能三角挑战</div>
    `;
    
    document.getElementById('rightPuzzle').innerHTML = `
        <button class="solve-btn" onclick="loadPuzzle('right')" disabled>🔒 需先完成前墙</button>
        <div class="clue">将数字按1-8的顺序排列</div>
    `;
    
    document.getElementById('topPuzzle').innerHTML = `
        <button class="solve-btn" onclick="loadPuzzle('top')" disabled>🔒 需先完成前墙</button>
        <div class="clue">连接星星形成北斗七星</div>
    `;
    
    document.getElementById('bottomPuzzle').innerHTML = `
        <button class="solve-btn" onclick="loadDownWall()" disabled>🔒 需先完成前墙</button>
        <div class="clue">妲己的九尾世界等待着你的挑战</div>
    `;
    
    document.getElementById('victoryModal').style.display = 'none';
    rotateTo('front');
    updateProgress();
}

// 工具函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 移动端触摸拖拽功能
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
let dragThreshold = 80; // 增加拖拽阈值，减少误触

// 添加触摸事件监听器
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...'); // 调试日志
    initGame();
    
    // 测试按钮点击功能
    const frontBtn = document.querySelector('.front-wall .solve-btn');
    if (frontBtn) {
        console.log('Front button found, adding click listener...'); // 调试日志
        frontBtn.addEventListener('click', function(e) {
            console.log('Front button clicked via event listener'); // 调试日志
            e.preventDefault();
            loadPuzzle('front');
        });
    } else {
        console.error('Front button not found!'); // 调试日志
    }
    
    const roomContainer = document.querySelector('.room-container');
    
    // 触摸开始
    roomContainer.addEventListener('touchstart', function(e) {
        // 只处理单点触控
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isDragging = true;
    }, { passive: true });
    
    // 触摸移动 - 移除实时预览，减少性能消耗
    roomContainer.addEventListener('touchmove', function(e) {
        if (!isDragging || e.touches.length !== 1) return;
        // 不阻止默认行为，让页面可以正常滚动
    }, { passive: true });
    
    // 触摸结束
    roomContainer.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // 判断拖拽方向和距离
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // 只有超过阈值才触发旋转
        if (absX > dragThreshold || absY > dragThreshold) {
            if (absX > absY) {
                // 水平拖拽
                if (deltaX > 0) {
                    // 向右拖拽 - 显示左墙
                    rotateTo('left');
                } else {
                    // 向左拖拽 - 显示右墙
                    rotateTo('right');
                }
            } else {
                // 垂直拖拽
                if (deltaY > 0) {
                    // 向下拖拽 - 显示上墙
                    rotateTo('top');
                } else {
                    // 向上拖拽 - 显示下墙
                    rotateTo('bottom');
                }
            }
        }
        
        isDragging = false;
    }, { passive: true });
            } else {
                // 垂直拖拽
                if (deltaY > 0) {
                    // 向下拖拽 - 显示上墙
                    rotateTo('top');
                } else {
                    // 向上拖拽 - 显示下墙
                    rotateTo('bottom');
                }
            }
        } else {
            // 拖拽距离不够，恢复到当前墙面
            rotateTo(currentWall);
        }
        
        isDragging = false;
    }, { passive: false });
    
    // 键盘控制（保留原有功能）
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                rotateTo('top');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                rotateTo('bottom');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                rotateTo('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                rotateTo('right');
                break;
            case 'q':
            case 'Q':
                rotateTo('front');
                break;
            case 'e':
            case 'E':
                rotateTo('back');
                break;
        }
    });
});