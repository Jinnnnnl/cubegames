// 游戏状态管理
let currentScreen = 'main';

// 页面加载完成后初始化游戏
window.onload = function() {
    // 初始化游戏界面
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.classList.remove('hidden');
    }
    
    // 隐藏其他屏幕
    const storyScreen = document.getElementById('storyScreen');
    if (storyScreen) {
        storyScreen.classList.add('hidden');
    }
    
    const mazeScreen = document.getElementById('mazeScreen');
    if (mazeScreen) {
        mazeScreen.classList.add('hidden');
    }
    
    const resultScreen = document.getElementById('resultScreen');
    if (resultScreen) {
        resultScreen.classList.add('hidden');
    }
    
    // 初始化游戏状态
    hasKey = false;
    hasRealKey = false;
    hasFakeKey = false;
    gameCompleted = false;
    isInLowerMaze = false;
    collectedTreasures = 0;
    treasures = [];
    
    console.log("游戏初始化完成");
    setLowerMazeDescriptionVisibility(false);
};

// 隐藏屏幕
function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('hidden');
    }
}

// 显示屏幕
function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

// 重新开始迷宫游戏
function restartMaze() {
    // 重置游戏状态
    hasKey = false;
    hasRealKey = false;
    hasFakeKey = false;
    gameCompleted = false;
    isInLowerMaze = false;
    collectedTreasures = 0;
    treasures = [];
    
    // 隐藏结果屏幕（如果正在显示）
    hideScreen('resultScreen');
    
    // 显示迷宫屏幕
    showScreen('mazeScreen');
    currentScreen = 'maze';
    setLowerMazeDescriptionVisibility(false);
    
    // 隐藏下层迷宫容器（如果存在）
    const lowerMazeContainer = document.querySelector('.lower-maze-container');
    if (lowerMazeContainer) {
        lowerMazeContainer.style.display = 'none';
    }
    
    // 显示上层迷宫容器
    const mazeContainer = document.querySelector('.maze-container');
    if (mazeContainer) {
        mazeContainer.style.display = 'grid';
    }
    
    // 生成新的迷宫
    generateMaze();
    
    // 开始计时
    startTimer();
    
    // 重新添加键盘事件监听
    document.removeEventListener('keydown', handleKeyPress); // 先移除以防重复添加
    document.addEventListener('keydown', handleKeyPress);
}

// 返回主菜单
function returnToMain() {
    // 停止计时器
    clearInterval(timerInterval);
    
    // 隐藏当前屏幕
    hideScreen('resultScreen');
    hideScreen('mazeScreen');
    
    // 显示主屏幕
    showScreen('mainScreen');
    currentScreen = 'main';
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 开始计时
function startTimer() {
    // 清除之前的计时器
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 记录开始时间
    gameStartTime = Date.now();
    
    // 更新计时器显示
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = '00:00';
    }
    
    // 创建新的计时器
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - gameStartTime) / 1000);
        
        if (timerElement) {
            timerElement.textContent = formatTime(elapsedSeconds);
        }
    }, 1000);
}

// 随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 寻找最短路径（使用广度优先搜索）
function findShortestPath(start, end) {
    const queue = [{ x: start.x, y: start.y, path: [] }];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);
    
    while (queue.length > 0) {
        const { x, y, path } = queue.shift();
        
        // 如果到达终点，返回路径
        if (x === end.x && y === end.y) {
            return [...path, { x, y }];
        }
        
        // 尝试四个方向
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            // 检查是否在迷宫范围内且不是墙壁
            if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && 
                !maze[newY][newX].isWall && !visited.has(`${newX},${newY}`)) {
                
                // 标记为已访问
                visited.add(`${newX},${newY}`);
                
                // 添加到队列
                queue.push({
                    x: newX,
                    y: newY,
                    path: [...path, { x, y }]
                });
            }
        }
    }
    
    // 如果没有找到路径，返回空数组
    return [];
}

// 初始化虚拟摇杆
function initJoystick() {
    const joystickContainer = document.getElementById('joystickContainer');
    const joystickStick = document.getElementById('joystickStick');
    
    if (!joystickContainer || !joystickStick) return;
    
    // 检测是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 只在移动设备上显示虚拟摇杆
    if (isMobile) {
        joystickContainer.style.display = 'block';
    }
    
    let isDragging = false;
    let centerX, centerY;
    const maxDistance = 35; // 摇杆最大移动距离
    
    // 计算摇杆中心位置
    function updateJoystickCenter() {
        const rect = joystickContainer.querySelector('.joystick-base').getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
    }
    
    // 处理摇杆移动
    function moveJoystick(clientX, clientY) {
        if (!isDragging) return;
        
        // 计算与中心的距离
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        // 计算距离和角度
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
        
        // 限制摇杆移动距离
        if (distance > maxDistance) {
            deltaX = Math.cos(angle) * maxDistance;
            deltaY = Math.sin(angle) * maxDistance;
        }
        
        // 更新摇杆位置
        joystickStick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // 计算角度（0-360度）
        let degrees = angle * (180 / Math.PI);
        if (degrees < 0) degrees += 360;
        
        // 保存当前角度
        joystickAngle = degrees;
        
        // 根据角度确定移动方向
        if (distance > 10) { // 添加一个阈值，避免轻微触碰导致移动
            if (degrees >= 45 && degrees < 135) {
                // 下
                movePlayer(0, 1);
            } else if (degrees >= 135 && degrees < 225) {
                // 左
                movePlayer(-1, 0);
            } else if (degrees >= 225 && degrees < 315) {
                // 上
                movePlayer(0, -1);
            } else {
                // 右
                movePlayer(1, 0);
            }
        }
    }
    
    // 开始拖动
    function startDrag(clientX, clientY) {
        isDragging = true;
        updateJoystickCenter();
        moveJoystick(clientX, clientY);
        
        // 启动摇杆间隔
        if (joystickInterval) clearInterval(joystickInterval);
        joystickInterval = setInterval(() => {
            if (isDragging && joystickAngle !== null) {
                const degrees = joystickAngle;
                
                if (degrees >= 45 && degrees < 135) {
                    // 下
                    movePlayer(0, 1);
                } else if (degrees >= 135 && degrees < 225) {
                    // 左
                    movePlayer(-1, 0);
                } else if (degrees >= 225 && degrees < 315) {
                    // 上
                    movePlayer(0, -1);
                } else {
                    // 右
                    movePlayer(1, 0);
                }
            }
        }, 300); // 每300毫秒移动一次
    }
    
    // 结束拖动
    function endDrag() {
        isDragging = false;
        joystickStick.style.transform = 'translate(0px, 0px)';
        joystickAngle = null;
        
        // 清除摇杆间隔
        if (joystickInterval) {
            clearInterval(joystickInterval);
            joystickInterval = null;
        }
    }
    
    // 添加触摸事件监听
    joystickContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            moveJoystick(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
    
    document.addEventListener('touchend', () => {
        endDrag();
    });
    
    // 添加鼠标事件监听（用于测试）
    joystickContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            moveJoystick(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('mouseup', () => {
        endDrag();
    });
}
let maze = [];
let lowerMaze = []; // 下层迷宫
let playerPosition = { x: 0, y: 0 };
let exitPosition = { x: 0, y: 0 };
let realKeyPosition = { x: 0, y: 0 };
let fakeKeyPosition = { x: 0, y: 0 };
let ladderPosition = { x: 0, y: 0 }; // 梯子位置
let hasKey = false;
let hasRealKey = false;
let hasFakeKey = false;
let gameStartTime = 0;
let timerInterval = null;
let mazeSize = 21; // 迷宫大小 21x21
let lowerMazeSize = 21; // 下层迷宫大小，与上层迷宫保持一致
let gameCompleted = false;
let joystickActive = false;
let joystickAngle = 0;
let joystickInterval = null;
let gravityControlEnabled = false;
let gravityInterval = null;
let lastMoveTime = 0;
let moveDelay = 300; // 重力感应移动的延迟时间（毫秒）
let isInLowerMaze = false; // 是否在下层迷宫
let treasures = []; // 宝箱位置数组
let collectedTreasures = 0; // 已收集的宝箱数量
let treasureNames = ['规模', '动量', '波动率', '价值', '盈利', '杠杆', '流动性', '成长', '股息率', '非线性规模']; // 宝箱名称
let treasureColors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3', '#FF8C33', '#8C33FF', '#33FF8C', '#FF338C']; // 宝箱颜色
let treasureClasses = ['treasure-beta', 'treasure-value', 'treasure-profit', 'treasure-growth', 'treasure-leverage', 'treasure-liquidity', 'treasure-momentum', 'treasure-residual', 'treasure-marketcap', 'treasure-nonlinear']; // 宝箱CSS类名
const treasureDescriptionsByName = {
    '规模': '衡量公司市值的大小。通常认为小盘股相比大盘股具有不同的风险收益特征。',
    '动量': '衡量股票价格的趋势强度。过去表现好的股票在未来继续表现好的倾向。',
    '波动率': '衡量股票价格的历史波动程度。波动率高的股票通常被认为风险更高。',
    '价值': '衡量股票价格相对于其基本面价值是否"便宜"。',
    '盈利': '衡量公司的盈利能力。盈利能力强的好公司可能更受青睐。',
    '杠杆': '衡量公司的负债程度和财务风险。',
    '流动性': '衡量股票交易的难易程度和成本。流动性差的股票更难快速买卖而不对价格产生冲击。',
    '成长': '衡量公司未来业绩的增长潜力。',
    '股息率': '衡量公司现金分红的比例。',
    '非线性规模': '用于捕捉规模因子中的非线性效应。即，在市值分布的极端部分，市值对收益的影响可能不是线性的。'
};
let boats = []; // 小船位置数组
let hasBoat = false; // 是否持有小船
let inForest = false; // 是否在森林中
let inDesert = false; // 是否在沙漠中
let normalMoveDelay = 300; // 正常移动延迟
let desertMoveDelay = 600; // 沙漠移动延迟
let usedLowerMaze = false; // 是否曾进入过下层

// 控制下层迷宫描述显示
function setLowerMazeDescriptionVisibility(show) {
    const description = document.querySelector('.lower-maze-description');
    if (!description) return;
    if (show) {
        description.classList.add('visible');
    } else {
        description.classList.remove('visible');
    }
}

// 进入游戏
function enterGame() {
    console.log("进入游戏");
    hideScreen('mainScreen');
    showScreen('storyScreen');
    currentScreen = 'story';
}

// 开始迷宫游戏
function startMaze() {
    hideScreen('storyScreen');
    showScreen('mazeScreen');
    currentScreen = 'maze';
    setLowerMazeDescriptionVisibility(false);
    
    // 重置游戏状态
    hasKey = false;
    hasRealKey = false;
    hasFakeKey = false;
    gameCompleted = false;
    isInLowerMaze = false;
    collectedTreasures = 0;
    treasures = [];
    
    // 生成迷宫
    generateMaze();
    
    // 开始计时
    startTimer();
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);
}

// 生成迷宫
function generateMaze() {
    // 初始化迷宫数组
    maze = [];
    for (let y = 0; y < mazeSize; y++) {
        const row = [];
        for (let x = 0; x < mazeSize; x++) {
            row.push({ isWall: true, visited: false });
        }
        maze.push(row);
    }
    
    // 使用深度优先搜索算法生成迷宫
    const startX = 1;
    const startY = 1;
    generatePath(startX, startY);
    
    // 添加额外的迷惑性道路，使迷宫更复杂
    addConfusingPaths();
    
    // 设置玩家起始位置
    playerPosition = { x: startX, y: startY };
    
    // 重置所有单元格的访问状态
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            maze[y][x].visited = false;
        }
    }
    
    // 只标记起始位置为已访问
    maze[startY][startX].visited = true;
    
    // 设置出口位置（在迷宫边缘）
    setExitPosition();
    
    // 放置真钥匙、假钥匙
    placeKeys();
    
    // 渲染迷宫
    renderMaze();
    
    // 初始化虚拟摇杆
    initJoystick();
    
    // 检测并初始化重力感应控制
    checkDeviceOrientation();
}

// 检测设备是否支持重力感应
function checkDeviceOrientation() {
    // 检测是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && window.DeviceOrientationEvent) {
        // 创建重力感应控制按钮
        const gravityBtn = document.createElement('button');
        gravityBtn.textContent = '启用重力感应';
        gravityBtn.className = 'gravity-btn';
        gravityBtn.onclick = requestOrientationPermission;
        
        // 添加到游戏头部
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.appendChild(gravityBtn);
        }
    }
}

// 请求重力感应权限
function requestOrientationPermission() {
    try {
        // iOS 13+ 需要请求权限
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        enableGravityControl();
                    } else {
                        alert('需要授予设备方向权限才能使用重力感应控制');
                    }
                })
                .catch(error => {
                    console.error('请求设备方向权限失败:', error);
                    alert('请求设备方向权限失败，请确保在Safari浏览器中打开并允许权限');
                });
        } else {
            // 其他设备直接启用
            enableGravityControl();
            
            // 添加测试代码，检查是否真的能接收到方向事件
            window.addEventListener('deviceorientation', function testOrientation(event) {
                if (event.beta !== null && event.gamma !== null) {
                    console.log('设备方向事件工作正常:', event.beta, event.gamma);
                    alert('重力感应已启用，请倾斜设备控制角色移动');
                } else {
                    console.log('设备方向事件数据为空');
                    alert('您的设备可能不支持重力感应或已被禁用');
                }
                window.removeEventListener('deviceorientation', testOrientation);
            }, { once: true });
        }
    } catch (error) {
        console.error('启用重力感应时出错:', error);
        alert('启用重力感应失败，您的设备可能不支持此功能');
    }
}

// 启用重力感应控制
function enableGravityControl() {
    // 如果已经启用，则禁用
    if (gravityControlEnabled) {
        disableGravityControl();
        return;
    }
    
    gravityControlEnabled = true;
    
    // 添加设备方向事件监听
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    // 更新按钮文本
    const gravityBtn = document.querySelector('.gravity-btn');
    if (gravityBtn) {
        gravityBtn.textContent = '禁用重力感应';
    }
    
    // 隐藏虚拟摇杆
    const joystickContainer = document.getElementById('joystickContainer');
    if (joystickContainer) {
        joystickContainer.style.display = 'none';
    }
    
    // 显示重力感应模式提示
    const modeIndicator = document.createElement('div');
    modeIndicator.textContent = '重力感应模式已启用';
    modeIndicator.className = 'mode-indicator';
    modeIndicator.id = 'gravityModeIndicator';
    
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader && !document.getElementById('gravityModeIndicator')) {
        gameHeader.appendChild(modeIndicator);
    }
    
    // 添加触摸控制作为备用
    addTouchControls();
    
    // 启动重力控制间隔
    startGravityControl();
    
    // 显示提示
    setTimeout(() => {
        alert('重力感应已启用！请倾斜设备控制角色移动。如果没有反应，请尝试在浏览器设置中允许动作和方向访问权限。');
    }, 500);
}

// 添加触摸控制作为备用
function addTouchControls() {
    const mazeContainer = document.getElementById('mazeContainer');
    if (!mazeContainer) return;
    
    // 移除之前的事件监听器
    mazeContainer.removeEventListener('touchstart', handleTouchStart);
    mazeContainer.removeEventListener('touchmove', handleTouchMove);
    
    // 添加触摸事件监听器
    mazeContainer.addEventListener('touchstart', handleTouchStart);
    mazeContainer.addEventListener('touchmove', handleTouchMove);
    
    // 添加提示
    const touchIndicator = document.createElement('div');
    touchIndicator.textContent = '(也可以通过滑动屏幕移动)';
    touchIndicator.className = 'touch-indicator';
    touchIndicator.id = 'touchIndicator';
    
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader && !document.getElementById('touchIndicator')) {
        gameHeader.appendChild(touchIndicator);
    }
}

// 处理触摸开始
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

// 处理触摸移动
function handleTouchMove(event) {
    if (!gravityControlEnabled || currentScreen !== 'maze' || gameCompleted) return;
    
    const now = Date.now();
    if (now - lastMoveTime < moveDelay) return;
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 确定移动方向
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平移动
        if (diffX > 20) {
            movePlayer(1, 0); // 右
        } else if (diffX < -20) {
            movePlayer(-1, 0); // 左
        }
    } else {
        // 垂直移动
        if (diffY > 20) {
            movePlayer(0, 1); // 下
        } else if (diffY < -20) {
            movePlayer(0, -1); // 上
        }
    }
    
    // 更新起始点
    touchStartX = touchEndX;
    touchStartY = touchEndY;
    
    lastMoveTime = now;
}

// 禁用重力感应控制
function disableGravityControl() {
    gravityControlEnabled = false;
    
    // 移除设备方向事件监听
    window.removeEventListener('deviceorientation', handleOrientation);
    
    // 更新按钮文本
    const gravityBtn = document.querySelector('.gravity-btn');
    if (gravityBtn) {
        gravityBtn.textContent = '启用重力感应';
    }
    
    // 显示虚拟摇杆
    const joystickContainer = document.getElementById('joystickContainer');
    if (joystickContainer) {
        joystickContainer.style.display = 'block';
    }
    
    // 移除重力感应模式提示
    const modeIndicator = document.getElementById('gravityModeIndicator');
    if (modeIndicator) {
        modeIndicator.remove();
    }
    
    // 停止重力控制间隔
    stopGravityControl();
}

// 处理设备方向变化
function handleOrientation(event) {
    if (currentScreen !== 'maze' || gameCompleted || !gravityControlEnabled) return;
    
    // 获取设备倾斜角度
    const beta = event.beta;  // 前后倾斜角度 (-180 到 180)
    const gamma = event.gamma; // 左右倾斜角度 (-90 到 90)
    
    // 调试信息
    console.log('设备方向:', { beta, gamma });
    
    // 保存当前的倾斜角度，用于重力控制间隔
    window.currentBeta = beta;
    window.currentGamma = gamma;
    
    // 直接处理移动，不等待间隔
    const now = Date.now();
    if (now - lastMoveTime < moveDelay) return;
    
    // 设置移动阈值
    const threshold = 10;
    
    // 根据倾斜角度确定移动方向
    if (Math.abs(beta) > Math.abs(gamma)) {
        // 前后倾斜更明显
        if (beta < -threshold) {
            // 向上倾斜，角色向上移动
            movePlayer(0, -1);
            lastMoveTime = now;
        } else if (beta > threshold) {
            // 向下倾斜，角色向下移动
            movePlayer(0, 1);
            lastMoveTime = now;
        }
    } else {
        // 左右倾斜更明显
        if (gamma < -threshold) {
            // 向左倾斜，角色向左移动
            movePlayer(-1, 0);
            lastMoveTime = now;
        } else if (gamma > threshold) {
            // 向右倾斜，角色向右移动
            movePlayer(1, 0);
            lastMoveTime = now;
        }
    }
}

// 开始重力控制间隔
function startGravityControl() {
    if (gravityInterval) {
        clearInterval(gravityInterval);
    }
    
    // 添加调试信息
    console.log('重力控制已启动');
    
    // 创建一个备用的移动检测系统，以防设备方向事件不可靠
    gravityInterval = setInterval(() => {
        if (!gravityControlEnabled || currentScreen !== 'maze' || gameCompleted) return;
        
        const now = Date.now();
        if (now - lastMoveTime < moveDelay) return;
        
        const beta = window.currentBeta;
        const gamma = window.currentGamma;
        
        if (beta === undefined || gamma === undefined) return;
        
        // 设置移动阈值
        const threshold = 10;
        
        // 根据倾斜角度确定移动方向
        if (Math.abs(beta) > Math.abs(gamma)) {
            // 前后倾斜更明显
            if (beta < -threshold) {
                // 向上倾斜，角色向上移动
                movePlayer(0, -1);
                lastMoveTime = now;
            } else if (beta > threshold) {
                // 向下倾斜，角色向下移动
                movePlayer(0, 1);
                lastMoveTime = now;
            }
        } else {
            // 左右倾斜更明显
            if (gamma < -threshold) {
                // 向左倾斜，角色向左移动
                movePlayer(-1, 0);
                lastMoveTime = now;
            } else if (gamma > threshold) {
                // 向右倾斜，角色向右移动
                movePlayer(1, 0);
                lastMoveTime = now;
            }
        }
    }, 200); // 每200毫秒检查一次，降低频率以减少性能问题
}

// 停止重力控制间隔
function stopGravityControl() {
    if (gravityInterval) {
        clearInterval(gravityInterval);
        gravityInterval = null;
    }
}

// 使用改进的深度优先搜索算法生成迷宫路径，添加更多迷惑性道路
function generatePath(x, y) {
    // 将当前单元格标记为路径
    maze[y][x].isWall = false;
    
    // 定义四个方向：上、右、下、左
    const directions = [
        { dx: 0, dy: -2 }, // 上
        { dx: 2, dy: 0 },  // 右
        { dx: 0, dy: 2 },  // 下
        { dx: -2, dy: 0 }  // 左
    ];
    
    // 随机排序方向
    shuffleArray(directions);
    
    // 尝试每个方向
    for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;
        
        // 检查新位置是否在迷宫范围内且未访问过
        if (newX > 0 && newX < mazeSize - 1 && newY > 0 && newY < mazeSize - 1 && maze[newY][newX].isWall) {
            // 打通墙壁
            maze[y + dir.dy / 2][x + dir.dx / 2].isWall = false;
            
            // 递归生成路径
            generatePath(newX, newY);
        }
    }
}

// 添加额外的迷惑性道路，使迷宫更复杂
function addConfusingPaths() {
    // 添加随机的额外通道，打通一些墙壁
    const wallsToRemove = Math.floor(mazeSize * mazeSize * 0.1); // 移除约10%的墙壁
    
    for (let i = 0; i < wallsToRemove; i++) {
        // 随机选择一个墙壁单元格
        const x = Math.floor(Math.random() * (mazeSize - 2)) + 1;
        const y = Math.floor(Math.random() * (mazeSize - 2)) + 1;
        
        if (maze[y][x].isWall) {
            // 检查周围的路径单元格数量，确保不会创建太多的环路
            let pathNeighbors = 0;
            
            if (x > 0 && !maze[y][x-1].isWall) pathNeighbors++;
            if (x < mazeSize - 1 && !maze[y][x+1].isWall) pathNeighbors++;
            if (y > 0 && !maze[y-1][x].isWall) pathNeighbors++;
            if (y < mazeSize - 1 && !maze[y+1][x].isWall) pathNeighbors++;
            
            // 如果周围有2个或更多的路径单元格，打通这个墙壁
            if (pathNeighbors >= 2) {
                maze[y][x].isWall = false;
            }
        }
    }
    
    // 添加一些死胡同和迷惑性路径
    const deadEnds = Math.floor(mazeSize * 0.5); // 添加一些死胡同
    
    for (let i = 0; i < deadEnds; i++) {
        // 随机选择一个位置
        const x = Math.floor(Math.random() * (mazeSize - 4)) + 2;
        const y = Math.floor(Math.random() * (mazeSize - 4)) + 2;
        
        // 如果是墙壁，尝试创建一个死胡同
        if (maze[y][x].isWall) {
            // 随机选择一个方向
            const directions = [
                { dx: 0, dy: -1 }, // 上
                { dx: 1, dy: 0 },  // 右
                { dx: 0, dy: 1 },  // 下
                { dx: -1, dy: 0 }  // 左
            ];
            
            shuffleArray(directions);
            
            for (const dir of directions) {
                const newX = x + dir.dx;
                const newY = y + dir.dy;
                
                // 检查是否是路径
                if (newX > 0 && newX < mazeSize - 1 && newY > 0 && newY < mazeSize - 1 && !maze[newY][newX].isWall) {
                    // 在反方向创建一个死胡同
                    const deadEndX = x - dir.dx;
                    const deadEndY = y - dir.dy;
                    
                    if (deadEndX > 0 && deadEndX < mazeSize - 1 && deadEndY > 0 && deadEndY < mazeSize - 1 && maze[deadEndY][deadEndX].isWall) {
                        maze[y][x].isWall = false;
                        break;
                    }
                }
            }
        }
    }
}

// 设置出口位置
function setExitPosition() {
    // 计算起点到各边缘的距离，选择最远的边
    const distToTop = playerPosition.y;
    const distToRight = mazeSize - 1 - playerPosition.x;
    const distToBottom = mazeSize - 1 - playerPosition.y;
    const distToLeft = playerPosition.x;
    
    // 找出最远的边
    const distances = [
        { side: 0, dist: distToTop },    // 上边
        { side: 1, dist: distToRight },  // 右边
        { side: 2, dist: distToBottom }, // 下边
        { side: 3, dist: distToLeft }    // 左边
    ];
    
    // 按距离降序排序
    distances.sort((a, b) => b.dist - a.dist);
    
    // 选择最远的边或第二远的边（增加随机性）
    const sideIndex = Math.random() < 0.7 ? 0 : 1; // 70%选择最远的边，30%选择第二远的边
    const side = distances[sideIndex].side;
    
    let x, y;
    
    switch (side) {
        case 0: // 上边
            x = 1 + 2 * Math.floor(Math.random() * ((mazeSize - 1) / 2));
            y = 0;
            break;
        case 1: // 右边
            x = mazeSize - 1;
            y = 1 + 2 * Math.floor(Math.random() * ((mazeSize - 1) / 2));
            break;
        case 2: // 下边
            x = 1 + 2 * Math.floor(Math.random() * ((mazeSize - 1) / 2));
            y = mazeSize - 1;
            break;
        case 3: // 左边
            x = 0;
            y = 1 + 2 * Math.floor(Math.random() * ((mazeSize - 1) / 2));
            break;
    }
    
    // 确保出口与路径相连
    if (side === 0) {
        maze[y + 1][x].isWall = false;
    } else if (side === 1) {
        maze[y][x - 1].isWall = false;
    } else if (side === 2) {
        maze[y - 1][x].isWall = false;
    } else {
        maze[y][x + 1].isWall = false;
    }
    
    // 设置出口
    exitPosition = { x, y };
    maze[y][x].isWall = false;
}

// 放置道具（真钥匙、假钥匙）
function placeKeys() {
    // 找到从起点到终点的最短路径
    const shortestPath = findShortestPath(playerPosition, exitPosition);
    
    // 找到所有可用的路径单元格（不在最短路径上）
    const pathCells = [];
    const shortestPathCells = new Set();
    
    // 将最短路径的单元格添加到集合中
    shortestPath.forEach(cell => {
        shortestPathCells.add(`${cell.x},${cell.y}`);
    });
    
    // 收集不在最短路径上的单元格
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (!maze[y][x].isWall && 
                !(x === playerPosition.x && y === playerPosition.y) && 
                !(x === exitPosition.x && y === exitPosition.y) &&
                !shortestPathCells.has(`${x},${y}`)) {
                pathCells.push({ x, y });
            }
        }
    }
    
    // 随机打乱路径单元格
    shuffleArray(pathCells);
    
    // 确保有足够的单元格
    if (pathCells.length < 2) {
        // 如果没有足够的非最短路径单元格，则使用所有路径单元格
        pathCells.length = 0;
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                if (!maze[y][x].isWall && 
                    !(x === playerPosition.x && y === playerPosition.y) && 
                    !(x === exitPosition.x && y === exitPosition.y)) {
                    pathCells.push({ x, y });
                }
            }
        }
        shuffleArray(pathCells);
    }
    
    // 计算到玩家的距离
    pathCells.sort((a, b) => {
        const distA = Math.abs(a.x - playerPosition.x) + Math.abs(a.y - playerPosition.y);
        const distB = Math.abs(b.x - playerPosition.x) + Math.abs(b.y - playerPosition.y);
        return distA - distB;
    });
    
    // 假钥匙放在较近的位置
    const fakeKeyIndex = Math.floor(pathCells.length * 0.2); // 前20%的位置
    fakeKeyPosition = { x: pathCells[fakeKeyIndex].x, y: pathCells[fakeKeyIndex].y };
    
    // 真钥匙放在较远的位置
    const realKeyIndex = Math.floor(pathCells.length * 0.7); // 后30%的位置
    realKeyPosition = { x: pathCells[realKeyIndex].x, y: pathCells[realKeyIndex].y };
}

// 放置宝箱
function placeTreasures() {
    console.log("放置宝箱");
    
    // 清空宝箱数组
    treasures = [];
    collectedTreasures = 0;
    
    // 找到所有可用的路径单元格
    const pathCells = [];
    
    for (let y = 0; y < lowerMazeSize; y++) {
        for (let x = 0; x < lowerMazeSize; x++) {
            if (!lowerMaze[y][x].isWall && 
                !(x === playerPosition.x && y === playerPosition.y)) {
                pathCells.push({ x, y });
            }
        }
    }
    
    console.log(`找到${pathCells.length}个可用单元格`);
    
    // 计算到玩家起始位置的距离
    const centerX = Math.floor(lowerMazeSize / 2);
    const centerY = Math.floor(lowerMazeSize / 2);
    
    pathCells.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2));
        const distB = Math.sqrt(Math.pow(b.x - centerX, 2) + Math.pow(b.y - centerY, 2));
        return distB - distA; // 按距离降序排序，使宝箱放置在远离中心的位置
    });
    
    // 选择10个位置放置宝箱，确保它们分布在迷宫的不同区域
    const treasureCount = 10;
    const selectedCells = [];
    
    // 简化宝箱放置逻辑，确保总是能放置10个宝箱
    if (pathCells.length >= treasureCount) {
        // 随机打乱路径单元格
        shuffleArray(pathCells);
        
        // 选择前10个单元格放置宝箱
        for (let i = 0; i < treasureCount; i++) {
            const cell = pathCells[i];
            selectedCells.push(cell);
            treasures.push({
                x: cell.x,
                y: cell.y,
                name: treasureNames[i],
                color: treasureColors[i],
                collected: false
            });
        }
    } else {
        console.error("可用单元格不足，无法放置10个宝箱");
        // 如果单元格不足，则放置尽可能多的宝箱
        for (let i = 0; i < pathCells.length; i++) {
            const cell = pathCells[i];
            selectedCells.push(cell);
            treasures.push({
                x: cell.x,
                y: cell.y,
                name: treasureNames[i],
                color: treasureColors[i],
                collected: false
            });
        }
    }
    
    console.log(`成功放置了${treasures.length}个宝箱`);
}

// 显示宝箱知识选择题弹窗（按名称取描述）
function showTreasureQuizModal(treasureIndex, onSuccess = () => {}) {
    const treasureName = (Array.isArray(treasureNames) ? treasureNames[treasureIndex] : null) || '神秘宝箱';
    const correctDescription = treasureDescriptionsByName[treasureName] || '这个宝箱还未登记描述，请稍候更新。';
    const existingModal = document.getElementById('treasureInfoModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'treasureInfoModal';
    modal.className = 'treasure-modal';
    modal.innerHTML = `
        <div class="treasure-modal-content">
            <div class="treasure-modal-title">${treasureName}</div>
            <div class="treasure-modal-prompt">请选择最贴近该宝箱的描述：</div>
            <div class="treasure-modal-options"></div>
            <div class="treasure-modal-feedback">&nbsp;</div>
        </div>
    `;
    document.body.appendChild(modal);

    const optionsContainer = modal.querySelector('.treasure-modal-options');
    const feedback = modal.querySelector('.treasure-modal-feedback');

    const otherDescriptions = treasureNames
        .filter((_, idx) => idx !== treasureIndex)
        .map(name => treasureDescriptionsByName[name])
        .filter(Boolean);

    const wrongSamples = shuffleArray(otherDescriptions).slice(0, Math.min(2, otherDescriptions.length));
    const quizOptions = shuffleArray([
        { text: correctDescription, correct: true },
        ...wrongSamples.map(text => ({ text, correct: false }))
    ]);

    const closeQuizModal = () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 250);
    };

    quizOptions.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'treasure-modal-option';
        button.textContent = option.text;
        button.onclick = () => {
            if (option.correct) {
                onSuccess();
                closeQuizModal();
            } else if (feedback) {
                feedback.textContent = '再想一想呢？';
                feedback.classList.add('shake');
                setTimeout(() => feedback.classList.remove('shake'), 300);
            }
        };
        optionsContainer.appendChild(button);
    });

    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
}

function exitLowerMaze() {
    isInLowerMaze = false;
    playerPosition = { x: 1, y: 1 };
    
    const lowerMazeContainer = document.querySelector('.lower-maze-container');
    if (lowerMazeContainer) {
        lowerMazeContainer.style.display = 'none';
    }
    
    const mazeContainer = document.querySelector('.maze-container');
    if (mazeContainer) {
        mazeContainer.style.display = 'grid';
    }
    
    renderMaze();
    setLowerMazeDescriptionVisibility(false);
}

function showLadderModal(onClose = () => {}) {
    const existing = document.getElementById('ladderModal');
    if (existing) {
        existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'ladderModal';
    modal.className = 'treasure-modal';
    modal.innerHTML = `
        <div class="treasure-modal-content ladder-modal-content">
            <div class="treasure-modal-title">雷震子的警示</div>
            <div class="ladder-modal-body">
                <p>前人白骨，皆为贪快求多、心存侥幸之后果。</p>
                <p>此宝可辨雷象轨迹，凡遇标准差大于0.3者，此宝必亮。青光起时知进退，雷纹现处守本心。</p>
                <p>雷震子，愿君持此鉴：</p>
                <p>一为明己路，量力而行；</p>
                <p>二为照世人，避雷止损。</p>
            </div>
            <button class="treasure-modal-close">返回上层</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.treasure-modal-close');
    const closeModal = () => {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
            onClose();
        }, 250);
    };

    if (closeButton) {
        closeButton.onclick = closeModal;
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
}

// 显示消息提示
function showMessage(text, duration = 2000) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = text;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.backgroundColor = 'rgba(74, 0, 224, 0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.fontSize = '1.2rem';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.8)';
    messageDiv.style.animation = 'fadeIn 0.3s forwards';
    
    document.body.appendChild(messageDiv);
    
    // 添加淡入淡出动画
    const fadeIn = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
    `;
    
    const fadeOut = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to { opacity: 0; transform: translate(-50%, -40%); }
        }
    `;
    
    const style = document.createElement('style');
    style.innerHTML = fadeIn + fadeOut;
    document.head.appendChild(style);
    
    // 设置淡出动画和移除
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
            messageDiv.remove();
            style.remove();
        }, 300);
    }, duration);
}

// 创建掉落动画效果
function createFallingHoleAnimation(callback) {
    const mazeContainer = document.querySelector('.maze-container');
    if (!mazeContainer) {
        if (callback) callback();
        return;
    }
    
    // 获取玩家位置的单元格
    const playerCell = mazeContainer.children[playerPosition.y * mazeSize + playerPosition.x];
    if (!playerCell) {
        if (callback) callback();
        return;
    }
    
    // 创建黑洞元素
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.style.position = 'absolute';
    hole.style.width = '0';
    hole.style.height = '0';
    hole.style.backgroundColor = 'black';
    hole.style.borderRadius = '50%';
    hole.style.zIndex = '100';
    hole.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.8) inset';
    hole.style.transition = 'all 1s ease-in-out';
    
    // 获取单元格位置
    const cellRect = playerCell.getBoundingClientRect();
    hole.style.left = `${cellRect.left + cellRect.width / 2}px`;
    hole.style.top = `${cellRect.top + cellRect.height / 2}px`;
    hole.style.transform = 'translate(-50%, -50%)';
    
    // 添加到文档
    document.body.appendChild(hole);
    
    // 创建玩家掉落的克隆元素
    const playerClone = document.createElement('div');
    playerClone.className = 'player';
    playerClone.style.position = 'absolute';
    playerClone.style.width = '20px';
    playerClone.style.height = '20px';
    playerClone.style.backgroundColor = '#4a00e0';
    playerClone.style.borderRadius = '50%';
    playerClone.style.zIndex = '101';
    playerClone.style.boxShadow = '0 0 10px #8a2be2';
    playerClone.style.transition = 'all 1.5s ease-in-out';
    playerClone.style.left = `${cellRect.left + cellRect.width / 2}px`;
    playerClone.style.top = `${cellRect.top + cellRect.height / 2}px`;
    playerClone.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(playerClone);
    
    // 动画序列
    setTimeout(() => {
        // 1. 黑洞扩大
        hole.style.width = '100px';
        hole.style.height = '100px';
    }, 100);
    
    setTimeout(() => {
        // 2. 玩家掉入黑洞
        playerClone.style.transform = 'translate(-50%, -50%) scale(0.1)';
        playerClone.style.opacity = '0';
    }, 600);
    
    setTimeout(() => {
        // 3. 黑洞缩小
        hole.style.width = '0';
        hole.style.height = '0';
        hole.style.opacity = '0';
    }, 1500);
    
    // 动画完成后清理并执行回调
    setTimeout(() => {
        hole.remove();
        playerClone.remove();
        if (callback) callback();
    }, 2000);
}

// 处理玩家移动
function movePlayer(dx, dy) {
    // 计算新位置
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // 检查是否在迷宫范围内且不是墙壁
    if (isInLowerMaze) {
        // 下层迷宫逻辑
        if (newX >= 0 && newX < lowerMazeSize && newY >= 0 && newY < lowerMazeSize && !lowerMaze[newY][newX].isWall) {
            // 更新玩家位置
            playerPosition = { x: newX, y: newY };
            
            // 标记为已访问
            lowerMaze[newY][newX].visited = true;
            
            // 检查是否碰到宝箱
            const treasureIndex = treasures.findIndex(t => t.x === newX && t.y === newY && !t.collected);
            if (treasureIndex !== -1) {
                // 收集宝箱
                treasures[treasureIndex].collected = true;
                collectedTreasures++;
                
                const finalizeTreasure = () => {
                    if (collectedTreasures === treasures.length) {
                        ladderPosition = {
                            x: Math.floor(lowerMazeSize / 2),
                            y: Math.floor(lowerMazeSize / 2)
                        };
                        lowerMaze[ladderPosition.y][ladderPosition.x].isWall = false;
                        showMessage("所有宝箱已收集！一个梯子出现了！", 3000);
                        const container = document.querySelector('.lower-maze-container');
                        if (container) {
                            renderSimpleLowerMaze(container);
                        }
                    }
                };
                
                showTreasureQuizModal(treasureIndex, finalizeTreasure);
            }
            
            // 检查是否碰到梯子
            if (collectedTreasures === treasures.length && 
                newX === ladderPosition.x && newY === ladderPosition.y) {
                showLadderModal(() => {
                    exitLowerMaze();
                });
                return;
            }
            
            // 重新渲染下层迷宫
            const container = document.querySelector('.lower-maze-container');
            if (container) {
                renderSimpleLowerMaze(container);
            }
        }
    } else {
        // 上层迷宫逻辑
        if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && !maze[newY][newX].isWall) {
            // 更新玩家位置
            playerPosition = { x: newX, y: newY };
            
            // 标记为已访问
            maze[newY][newX].visited = true;
            
            // 检查是否碰到真钥匙
            if (newX === realKeyPosition.x && newY === realKeyPosition.y && !hasRealKey) {
                hasRealKey = true;
                hasKey = true;
                
                // 更新钥匙状态显示
                updateKeyStatus();
                
                // 显示提示
                alert("你找到了钥匙！现在可以前往出口了。");
            }
            
// 检查是否碰到假钥匙
if (newX === fakeKeyPosition.x && newY === fakeKeyPosition.y && !hasFakeKey) {
    hasFakeKey = true;
    
    // 创建掉落动画效果
    createFallingHoleAnimation(() => {
        // 动画完成后显示提示
        alert("你落入巴RUA废墟");
        
        // 切换到下层迷宫
        enterLowerMaze();
    });
    
    return;
}
            
            // 检查是否到达出口
            if (newX === exitPosition.x && newY === exitPosition.y) {
                if (hasRealKey) {
                    // 游戏完成
                    completeGame();
                    return;
                } else {
                    // 提示需要钥匙
                    alert("你需要找到钥匙才能通过出口！");
                }
            }
            
            // 重新渲染迷宫
            renderMaze();
        }
    }
}

// 更新钥匙状态显示
function updateKeyStatus() {
    const keyStatus = document.querySelector('.key-status');
    if (keyStatus) {
        keyStatus.textContent = hasKey ? "已获得钥匙" : "未获得钥匙";
    }
}

// 完成游戏
function completeGame() {
    gameCompleted = true;
    
    // 停止计时器
    clearInterval(timerInterval);
    
    // 计算游戏时间
    const endTime = Date.now();
    const gameTime = Math.floor((endTime - gameStartTime) / 1000);
    
    // 显示结果屏幕
    hideScreen('mazeScreen');
    showScreen('resultScreen');
    currentScreen = 'result';
    
    const completionMessage = usedLowerMaze
        ? `雷宝终有预警之限，而人心贪念无穷。<br>愿君谨记：<br>青光起时需退步，<br>莫待雷落骨枯，方知避雷胜于雷中取物。<br>_ _ _ _ _ _ _ _ e _ _ y`
        : `_ _ _ _ _ _ _ _ e _ _ y，你成功找到了钥匙并逃出了迷宫，但你好像错过了什么...`;
    
    // 更新结果内容
    const resultContent = document.querySelector('.result-content');
    if (resultContent) {
        resultContent.innerHTML = `
            <h2 class=\"success-title\">恭喜你成功通关！</h2>
            <p>${completionMessage}</p>
            <img src=\"../assets/wechat.jpg\" alt=\"wechat\" style=\"width: 150px; height: 150px; display: block; margin: 20px auto 10px;\">
            <p style=\"font-size: 14px; text-align: center;\">_ _ _ _ _ _ _ _ e _ _ y,截图分享给好友，看看他们能否走出迷宫？</p>
            <div class=\"result-stats\">
                <div class=\"stat\">用时: ${formatTime(gameTime)}</div>
            </div>
            <div class=\"result-buttons\">
                <button class=\"result-btn\" onclick=\"restartMaze()\">再玩一次</button>
                <button class=\"result-btn\" onclick=\"returnToMain()\">返回主菜单</button>
            </div>
        `;
    }
    
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleKeyPress);
    
    console.log("游戏完成");
}

// 渲染迷宫
function renderMaze() {
    const mazeContainer = document.querySelector('.maze-container');
    if (!mazeContainer) return;
    
    // 清空迷宫容器
    mazeContainer.innerHTML = '';
    
    // 设置网格大小
    mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, 25px)`;
    mazeContainer.style.gridTemplateRows = `repeat(${mazeSize}, 25px)`;
    
    // 渲染迷宫单元格
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (maze[y][x].isWall) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
                
                if (maze[y][x].visited) {
                    cell.classList.add('visited');
                }
                
                // 玩家位置
                if (x === playerPosition.x && y === playerPosition.y) {
                    const player = document.createElement('div');
                    player.className = 'player';
                    cell.appendChild(player);
                }
                
                // 真钥匙位置
                if (x === realKeyPosition.x && y === realKeyPosition.y && !hasRealKey) {
                    const key = document.createElement('div');
                    key.className = 'real-key';
                    key.textContent = '🔑';
                    cell.appendChild(key);
                }
                
                // 假钥匙位置
                if (x === fakeKeyPosition.x && y === fakeKeyPosition.y && !hasFakeKey) {
                    const key = document.createElement('div');
                    key.className = 'fake-key';
                    key.textContent = '🔑';
                    cell.appendChild(key);
                }
                
                // 出口位置
                if (x === exitPosition.x && y === exitPosition.y) {
                    cell.classList.add('exit');
                }
            }
            
            mazeContainer.appendChild(cell);
        }
    }
    
    // 更新钥匙状态显示
    updateKeyStatus();
}

// 渲染简化版的下层迷宫
function renderSimpleLowerMaze(container) {
    console.log("渲染简化版的下层迷宫");
    
    // 清空迷宫容器
    container.innerHTML = '';
    
    // 渲染迷宫单元格
    for (let y = 0; y < lowerMazeSize; y++) {
        for (let x = 0; x < lowerMazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (lowerMaze[y][x].isWall) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
                
                if (lowerMaze[y][x].visited) {
                    cell.classList.add('visited');
                }
                
                // 玩家位置
                if (x === playerPosition.x && y === playerPosition.y) {
                    const player = document.createElement('div');
                    player.className = 'player';
                    cell.appendChild(player);
                }
                
                // 宝箱位置
                const treasure = treasures.find(t => t.x === x && t.y === y && !t.collected);
                if (treasure) {
                    const treasureElement = document.createElement('div');
                    const treasureIndex = treasures.indexOf(treasure);
                    treasureElement.className = `treasure ${treasureClasses[treasureIndex]}`;
                    treasureElement.title = treasureNames[treasureIndex];
                    cell.appendChild(treasureElement);
                }
                
                // 梯子位置
                if (collectedTreasures === treasures.length && x === ladderPosition.x && y === ladderPosition.y) {
                    const ladder = document.createElement('div');
                    ladder.className = 'ladder';
                    ladder.textContent = '🪜';
                    cell.appendChild(ladder);
                }
            }
            
            container.appendChild(cell);
        }
    }
    
    // 更新宝箱收集状态显示
    const keyStatus = document.querySelector('.key-status');
    if (keyStatus) {
        keyStatus.textContent = `已收集宝箱: ${collectedTreasures}/${treasures.length}`;
    }
}

// 原渲染下层迷宫函数（保留但不使用）
function renderLowerMaze() {
    console.log("原渲染下层迷宫函数 - 已被简化版替代");
    // 这个函数不再使用，但保留以避免代码错误
    
    // 渲染迷宫单元格
    for (let y = 0; y < lowerMazeSize; y++) {
        for (let x = 0; x < lowerMazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (lowerMaze[y][x].isWall) {
                cell.classList.add('wall');
            } else {
                // 添加地形类
                if (lowerMaze[y][x].terrain === 'water') {
                    cell.classList.add('water');
                } else if (lowerMaze[y][x].terrain === 'forest') {
                    cell.classList.add('forest');
                } else if (lowerMaze[y][x].terrain === 'desert') {
                    cell.classList.add('desert');
                } else {
                    cell.classList.add('path');
                }
                
                if (lowerMaze[y][x].visited) {
                    cell.classList.add('visited');
                }
                
                // 玩家位置
                if (x === playerPosition.x && y === playerPosition.y) {
                    // 如果在森林中，不显示玩家
                    if (lowerMaze[y][x].terrain !== 'forest' || !inForest) {
                        const player = document.createElement('div');
                        player.className = 'player';
                        cell.appendChild(player);
                    }
                }
                
                // 宝箱位置
                const treasure = treasures.find(t => t.x === x && t.y === y && !t.collected);
                if (treasure) {
                    const treasureElement = document.createElement('div');
                    const treasureIndex = treasures.indexOf(treasure);
                    treasureElement.className = `treasure ${treasureClasses[treasureIndex]}`;
                    treasureElement.title = treasureNames[treasureIndex];
                    treasureElement.style.zIndex = "10"; // 确保宝箱在上层显示
                    treasureElement.style.position = "relative";
                    cell.appendChild(treasureElement);
                    console.log(`渲染宝箱: ${treasureNames[treasureIndex]} 在位置 (${x}, ${y})`);
                }
                
                // 小船位置
                const boat = boats.find(b => b.x === x && b.y === y && !b.collected);
                if (boat) {
                    const boatElement = document.createElement('div');
                    boatElement.className = 'boat';
                    boatElement.textContent = '🚣';
                    cell.appendChild(boatElement);
                }
                
                // 梯子位置
                if (collectedTreasures === treasures.length && x === ladderPosition.x && y === ladderPosition.y) {
                    const ladder = document.createElement('div');
                    ladder.className = 'ladder';
                    ladder.textContent = '🪜';
                    cell.appendChild(ladder);
                }
            }
            
            mazeContainer.appendChild(cell);
        }
    }
    
    // 更新宝箱收集状态显示
    const keyStatus = document.querySelector('.key-status');
    if (keyStatus) {
        keyStatus.textContent = `已收集宝箱: ${collectedTreasures}/${treasures.length}`;
    }
}

// 进入下层迷宫
function enterLowerMaze() {
    console.log("进入下层迷宫");
    
    // 切换到下层迷宫
    isInLowerMaze = true;
    usedLowerMaze = true;
    setLowerMazeDescriptionVisibility(true);
    
    // 隐藏上层迷宫容器
    const upperMazeContainer = document.querySelector('.maze-container');
    if (upperMazeContainer) {
        upperMazeContainer.style.display = 'none';
    }
    
    // 创建简化版的下层迷宫
    createSimpleLowerMaze();
}

// 创建简化版的下层迷宫
function createSimpleLowerMaze() {
    console.log("创建简化版的下层迷宫");
    
    // 使用与上层迷宫相同的尺寸
    lowerMazeSize = 21;
    
    // 初始化下层迷宫数组（全部为墙壁）
    lowerMaze = [];
    for (let y = 0; y < lowerMazeSize; y++) {
        const row = [];
        for (let x = 0; x < lowerMazeSize; x++) {
            row.push({ 
                isWall: true, 
                visited: false,
                terrain: 'path' // 默认地形为路径
            });
        }
        lowerMaze.push(row);
    }
    
    // 使用深度优先搜索算法生成迷宫路径
    const startX = 1;
    const startY = 1;
    generateLowerMazePath(startX, startY);
    
    // 添加额外的迷惑性道路，使迷宫更复杂
    addLowerMazeConfusingPaths();
    
    // 设置玩家起始位置
    playerPosition = { x: startX, y: startY };
    
    // 重置所有单元格的访问状态
    for (let y = 0; y < lowerMazeSize; y++) {
        for (let x = 0; x < lowerMazeSize; x++) {
            lowerMaze[y][x].visited = false;
        }
    }
    
    // 只标记起始位置为已访问
    lowerMaze[startY][startX].visited = true;
    
    // 放置简化版的宝箱
    placeSimpleTreasures();
    
    // 创建并显示下层迷宫容器
    createLowerMazeContainer();
    
}

// 使用深度优先搜索算法生成下层迷宫路径
function generateLowerMazePath(x, y) {
    // 将当前单元格标记为路径
    lowerMaze[y][x].isWall = false;
    
    // 定义四个方向：上、右、下、左
    const directions = [
        { dx: 0, dy: -2 }, // 上
        { dx: 2, dy: 0 },  // 右
        { dx: 0, dy: 2 },  // 下
        { dx: -2, dy: 0 }  // 左
    ];
    
    // 随机排序方向
    shuffleArray(directions);
    
    // 尝试每个方向
    for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;
        
        // 检查新位置是否在迷宫范围内且未访问过
        if (newX > 0 && newX < lowerMazeSize - 1 && newY > 0 && newY < lowerMazeSize - 1 && 
            lowerMaze[newY][newX].isWall) {
            // 打通墙壁
            lowerMaze[y + dir.dy / 2][x + dir.dx / 2].isWall = false;
            
            // 递归生成路径
            generateLowerMazePath(newX, newY);
        }
    }
}

// 添加额外的迷惑性道路到下层迷宫
function addLowerMazeConfusingPaths() {
    // 添加随机的额外通道，打通一些墙壁
    const wallsToRemove = Math.floor(lowerMazeSize * lowerMazeSize * 0.1); // 移除约10%的墙壁
    
    for (let i = 0; i < wallsToRemove; i++) {
        // 随机选择一个墙壁单元格
        const x = Math.floor(Math.random() * (lowerMazeSize - 2)) + 1;
        const y = Math.floor(Math.random() * (lowerMazeSize - 2)) + 1;
        
        if (lowerMaze[y][x].isWall) {
            // 检查周围的路径单元格数量，确保不会创建太多的环路
            let pathNeighbors = 0;
            
            if (x > 0 && !lowerMaze[y][x-1].isWall) pathNeighbors++;
            if (x < lowerMazeSize - 1 && !lowerMaze[y][x+1].isWall) pathNeighbors++;
            if (y > 0 && !lowerMaze[y-1][x].isWall) pathNeighbors++;
            if (y < lowerMazeSize - 1 && !lowerMaze[y+1][x].isWall) pathNeighbors++;
            
            // 如果周围有2个或更多的路径单元格，打通这个墙壁
            if (pathNeighbors >= 2) {
                lowerMaze[y][x].isWall = false;
            }
        }
    }
}

// 放置简化版的宝箱
function placeSimpleTreasures() {
    console.log("放置简化版的宝箱");
    
    // 清空宝箱数组
    treasures = [];
    collectedTreasures = 0;
    
    // 找到所有可用的路径单元格
    const pathCells = [];
    
    for (let y = 0; y < lowerMazeSize; y++) {
        for (let x = 0; x < lowerMazeSize; x++) {
            if (!lowerMaze[y][x].isWall && 
                !(x === playerPosition.x && y === playerPosition.y)) {
                pathCells.push({ x, y });
            }
        }
    }
    
    // 随机打乱路径单元格
    shuffleArray(pathCells);
    
    // 选择10个位置放置宝箱，确保它们分布在迷宫的不同区域
    const treasureCount = Math.min(10, pathCells.length);
    
    // 将迷宫划分为几个区域，确保宝箱分散分布
    const areas = [
        {minX: 1, maxX: 7, minY: 1, maxY: 7},           // 左上
        {minX: 8, maxX: 13, minY: 1, maxY: 7},          // 中上
        {minX: 14, maxX: 20, minY: 1, maxY: 7},         // 右上
        {minX: 1, maxX: 7, minY: 8, maxY: 13},          // 左中
        {minX: 8, maxX: 13, minY: 8, maxY: 13},         // 中心
        {minX: 14, maxX: 20, minY: 8, maxY: 13},        // 右中
        {minX: 1, maxX: 7, minY: 14, maxY: 20},         // 左下
        {minX: 8, maxX: 13, minY: 14, maxY: 20},        // 中下
        {minX: 14, maxX: 20, minY: 14, maxY: 20},       // 右下
        {minX: 1, maxX: 20, minY: 1, maxY: 20}          // 整个迷宫（备用）
    ];
    
    // 在每个区域中尝试放置一个宝箱
    const placedTreasures = [];
    
    for (let i = 0; i < Math.min(treasureCount, areas.length); i++) {
        const area = areas[i];
        const areaCells = pathCells.filter(cell => 
            cell.x >= area.minX && cell.x <= area.maxX && 
            cell.y >= area.minY && cell.y <= area.maxY
        );
        
        if (areaCells.length > 0) {
            // 从该区域随机选择一个单元格
            const randomIndex = Math.floor(Math.random() * areaCells.length);
            const cell = areaCells[randomIndex];
            
            placedTreasures.push({
                x: cell.x,
                y: cell.y,
                name: treasureNames[i],
                color: treasureColors[i],
                collected: false
            });
            
            // 从pathCells中移除已使用的单元格
            const cellIndex = pathCells.findIndex(c => c.x === cell.x && c.y === cell.y);
            if (cellIndex !== -1) {
                pathCells.splice(cellIndex, 1);
            }
        }
    }
    
    // 如果还没有放满10个宝箱，从剩余的单元格中随机选择
    while (placedTreasures.length < treasureCount && pathCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * pathCells.length);
        const cell = pathCells[randomIndex];
        
        placedTreasures.push({
            x: cell.x,
            y: cell.y,
            name: treasureNames[placedTreasures.length],
            color: treasureColors[placedTreasures.length],
            collected: false
        });
        
        pathCells.splice(randomIndex, 1);
    }
    
    treasures = placedTreasures;
    console.log(`成功放置了${treasures.length}个宝箱`);
}

// 创建下层迷宫容器
function createLowerMazeContainer() {
    // 获取迷宫屏幕
    const mazeScreen = document.querySelector('.maze-screen');
    if (!mazeScreen) {
        console.error("找不到maze-screen元素");
        return;
    }
    
    // 移除旧的下层迷宫容器（如果存在）
    const oldContainer = document.querySelector('.lower-maze-container');
    if (oldContainer) {
        oldContainer.remove();
    }
    
    // 创建新的下层迷宫容器
    const lowerMazeContainer = document.createElement('div');
    lowerMazeContainer.className = 'lower-maze-container';
    
    // 设置样式 - 改为正方形
    lowerMazeContainer.style.gridTemplateColumns = `repeat(${lowerMazeSize}, 25px)`;
    lowerMazeContainer.style.gridTemplateRows = `repeat(${lowerMazeSize}, 25px)`;
    lowerMazeContainer.style.borderRadius = '0'; // 移除圆角
    lowerMazeContainer.style.overflow = 'hidden';
    lowerMazeContainer.style.width = `${lowerMazeSize * 25}px`;
    lowerMazeContainer.style.height = `${lowerMazeSize * 25}px`;
    lowerMazeContainer.style.display = 'grid';
    lowerMazeContainer.style.border = '2px solid #4a00e0';
    
    // 添加到迷宫屏幕
    mazeScreen.appendChild(lowerMazeContainer);
    
    // 渲染下层迷宫
    renderSimpleLowerMaze(lowerMazeContainer);
}

// 生成下层迷宫（保留原函数但不使用，以避免修改太多代码）
function generateLowerMaze() {
    console.log("生成下层迷宫 - 已被简化版替代");
    // 这个函数不再使用，但保留以避免代码错误
    
    // 使用深度优先搜索算法生成迷宫路径
    const startX = Math.floor(lowerMazeSize / 2);
    const startY = Math.floor(lowerMazeSize / 2);
    generateLowerPath(startX, startY);
    
    // 添加额外的迷惑性道路
    addLowerConfusingPaths();
    
    // 添加不同地形
    addTerrains();
    
    // 放置小船
    placeBoats();
    
    // 设置玩家起始位置（中心）
    playerPosition = { x: startX, y: startY };
    
    // 重置所有单元格的访问状态
    for (let y = 0; y < lowerMazeSize; y++) {
        for (let x = 0; x < lowerMazeSize; x++) {
            if (!lowerMaze[y][x].isWall) {
                lowerMaze[y][x].visited = false;
            }
        }
    }
    
    // 只标记起始位置为已访问
    lowerMaze[startY][startX].visited = true;
    
    // 放置宝箱
    placeTreasures();
    
    
    // 渲染下层迷宫
    renderLowerMaze();
    
    console.log("下层迷宫生成完成，宝箱数量:", treasures.length);
}

// 添加不同地形
function addTerrains() {
    // 重置小船数组
    boats = [];
    
    // 添加水域
    addWaterBodies();
    
    // 添加森林
    addForests();
    
    // 添加沙漠
    addDeserts();
}

// 添加水域
function addWaterBodies() {
    const waterBodiesCount = 3; // 添加3个水域
    
    for (let i = 0; i < waterBodiesCount; i++) {
        // 随机选择一个中心点（避开中心区域）
        let centerX, centerY;
        let validPosition = false;
        
        // 尝试找到一个有效的位置
        while (!validPosition) {
            centerX = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
            centerY = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
            
            // 计算到迷宫中心的距离
            const mazeCenterX = Math.floor(lowerMazeSize / 2);
            const mazeCenterY = Math.floor(lowerMazeSize / 2);
            const distanceToCenter = Math.sqrt(Math.pow(centerX - mazeCenterX, 2) + Math.pow(centerY - mazeCenterY, 2));
            
            // 确保水域不会太靠近中心
            if (distanceToCenter > 8) {
                validPosition = true;
            }
        }
        
        // 随机确定水域大小
        const waterSize = Math.floor(Math.random() * 3) + 3; // 3-5的大小
        
        // 创建水域
        for (let y = centerY - waterSize; y <= centerY + waterSize; y++) {
            for (let x = centerX - waterSize; x <= centerX + waterSize; x++) {
                // 确保在迷宫范围内且不是墙壁
                if (x > 0 && x < lowerMazeSize - 1 && y > 0 && y < lowerMazeSize - 1 && !lowerMaze[y][x].isWall) {
                    // 计算到中心的距离
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    // 创建不规则形状的水域
                    if (distance <= waterSize && Math.random() < 0.8) {
                        lowerMaze[y][x].terrain = 'water';
                    }
                }
            }
        }
        
        // 在水域边缘放置小船
        placeBoatNearWater(centerX, centerY, waterSize);
    }
}

// 在水域边缘放置小船
function placeBoatNearWater(waterCenterX, waterCenterY, waterSize) {
    // 扩大搜索范围，找到水域边缘的陆地
    const searchSize = waterSize + 2;
    const potentialBoatPositions = [];
    
    for (let y = waterCenterY - searchSize; y <= waterCenterY + searchSize; y++) {
        for (let x = waterCenterX - searchSize; x <= waterCenterX + searchSize; x++) {
            // 确保在迷宫范围内
            if (x > 0 && x < lowerMazeSize - 1 && y > 0 && y < lowerMazeSize - 1) {
                // 检查是否是陆地且相邻有水域
                if (!lowerMaze[y][x].isWall && lowerMaze[y][x].terrain === 'path') {
                    // 检查周围是否有水域
                    let hasAdjacentWater = false;
                    
                    const directions = [
                        { dx: -1, dy: 0 },
                        { dx: 1, dy: 0 },
                        { dx: 0, dy: -1 },
                        { dx: 0, dy: 1 }
                    ];
                    
                    for (const dir of directions) {
                        const nx = x + dir.dx;
                        const ny = y + dir.dy;
                        
                        if (nx >= 0 && nx < lowerMazeSize && ny >= 0 && ny < lowerMazeSize && 
                            !lowerMaze[ny][nx].isWall && lowerMaze[ny][nx].terrain === 'water') {
                            hasAdjacentWater = true;
                            break;
                        }
                    }
                    
                    if (hasAdjacentWater) {
                        potentialBoatPositions.push({ x, y });
                    }
                }
            }
        }
    }
    
    // 如果找到了合适的位置，随机选择一个放置小船
    if (potentialBoatPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * potentialBoatPositions.length);
        const boatPosition = potentialBoatPositions[randomIndex];
        
        boats.push({
            x: boatPosition.x,
            y: boatPosition.y,
            collected: false
        });
    }
}

// 添加森林
function addForests() {
    const forestsCount = 4; // 添加4个森林区域
    
    for (let i = 0; i < forestsCount; i++) {
        // 随机选择一个中心点
        let centerX, centerY;
        let validPosition = false;
        
        // 尝试找到一个有效的位置
        while (!validPosition) {
            centerX = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
            centerY = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
            
            // 检查该位置是否已经有特殊地形
            let hasSpecialTerrain = false;
            
            for (let y = centerY - 4; y <= centerY + 4; y++) {
                for (let x = centerX - 4; x <= centerX + 4; x++) {
                    if (x >= 0 && x < lowerMazeSize && y >= 0 && y < lowerMazeSize && 
                        !lowerMaze[y][x].isWall && lowerMaze[y][x].terrain !== 'path') {
                        hasSpecialTerrain = true;
                        break;
                    }
                }
                if (hasSpecialTerrain) break;
            }
            
            if (!hasSpecialTerrain) {
                validPosition = true;
            }
        }
        
        // 随机确定森林大小
        const forestSize = Math.floor(Math.random() * 3) + 4; // 4-6的大小
        
        // 创建森林
        for (let y = centerY - forestSize; y <= centerY + forestSize; y++) {
            for (let x = centerX - forestSize; x <= centerX + forestSize; x++) {
                // 确保在迷宫范围内且不是墙壁
                if (x > 0 && x < lowerMazeSize - 1 && y > 0 && y < lowerMazeSize - 1 && !lowerMaze[y][x].isWall) {
                    // 计算到中心的距离
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    // 创建不规则形状的森林
                    if (distance <= forestSize && Math.random() < 0.7) {
                        lowerMaze[y][x].terrain = 'forest';
                    }
                }
            }
        }
    }
}

// 添加沙漠
function addDeserts() {
    const desertsCount = 3; // 添加3个沙漠区域
    
    for (let i = 0; i < desertsCount; i++) {
        // 随机选择一个中心点
        let centerX, centerY;
        let validPosition = false;
        
        // 尝试找到一个有效的位置
        while (!validPosition) {
            centerX = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
            centerY = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
            
            // 检查该位置是否已经有特殊地形
            let hasSpecialTerrain = false;
            
            for (let y = centerY - 4; y <= centerY + 4; y++) {
                for (let x = centerX - 4; x <= centerX + 4; x++) {
                    if (x >= 0 && x < lowerMazeSize && y >= 0 && y < lowerMazeSize && 
                        !lowerMaze[y][x].isWall && lowerMaze[y][x].terrain !== 'path') {
                        hasSpecialTerrain = true;
                        break;
                    }
                }
                if (hasSpecialTerrain) break;
            }
            
            if (!hasSpecialTerrain) {
                validPosition = true;
            }
        }
        
        // 随机确定沙漠大小
        const desertSize = Math.floor(Math.random() * 3) + 5; // 5-7的大小
        
        // 创建沙漠
        for (let y = centerY - desertSize; y <= centerY + desertSize; y++) {
            for (let x = centerX - desertSize; x <= centerX + desertSize; x++) {
                // 确保在迷宫范围内且不是墙壁
                if (x > 0 && x < lowerMazeSize - 1 && y > 0 && y < lowerMazeSize - 1 && !lowerMaze[y][x].isWall) {
                    // 计算到中心的距离
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    // 创建不规则形状的沙漠
                    if (distance <= desertSize && Math.random() < 0.75) {
                        lowerMaze[y][x].terrain = 'desert';
                    }
                }
            }
        }
    }
}

// 放置小船
function placeBoats() {
    // 小船已经在添加水域时放置
}

// 使用深度优先搜索算法生成下层迷宫路径
function generateLowerPath(x, y) {
    // 将当前单元格标记为路径
    lowerMaze[y][x].isWall = false;
    
    // 定义四个方向：上、右、下、左
    const directions = [
        { dx: 0, dy: -2 }, // 上
        { dx: 2, dy: 0 },  // 右
        { dx: 0, dy: 2 },  // 下
        { dx: -2, dy: 0 }  // 左
    ];
    
    // 随机排序方向
    shuffleArray(directions);
    
    // 尝试每个方向
    for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;

        // 检查新位置是否在迷宫范围内且未访问过
        if (newX > 0 && newX < lowerMazeSize - 1 && newY > 0 && newY < lowerMazeSize - 1 && 
            lowerMaze[newY][newX].isWall) {
            // 打通墙壁
            lowerMaze[y + dir.dy / 2][x + dir.dx / 2].isWall = false;
            
            // 递归生成路径
            generateLowerPath(newX, newY);
        }
    }
}

// 处理键盘按键
function handleKeyPress(event) {
    if (currentScreen !== 'maze' || gameCompleted) return;
    
    const now = Date.now();
    if (now - lastMoveTime < moveDelay) return;
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer(1, 0);
            break;
    }
    
    lastMoveTime = now;
}

// 添加额外的迷惑性道路到下层迷宫
function addLowerConfusingPaths() {
    // 添加随机的额外通道，打通一些墙壁
    const wallsToRemove = Math.floor(lowerMazeSize * lowerMazeSize * 0.15); // 增加到15%的墙壁被移除
    
    for (let i = 0; i < wallsToRemove; i++) {
        // 随机选择一个墙壁单元格
        const x = Math.floor(Math.random() * (lowerMazeSize - 2)) + 1;
        const y = Math.floor(Math.random() * (lowerMazeSize - 2)) + 1;
        
        if (lowerMaze[y][x].isWall) {
            // 检查周围的路径单元格数量，确保不会创建太多的环路
            let pathNeighbors = 0;
            
            if (x > 0 && !lowerMaze[y][x-1].isWall) pathNeighbors++;
            if (x < lowerMazeSize - 1 && !lowerMaze[y][x+1].isWall) pathNeighbors++;
            if (y > 0 && !lowerMaze[y-1][x].isWall) pathNeighbors++;
            if (y < lowerMazeSize - 1 && !lowerMaze[y+1][x].isWall) pathNeighbors++;
            
            // 如果周围有2个或更多的路径单元格，打通这个墙壁
            if (pathNeighbors >= 2) {
                lowerMaze[y][x].isWall = false;
            }
        }
    }
    
    // 添加一些死胡同和迷惑性路径
    const deadEnds = Math.floor(lowerMazeSize * 0.8); // 添加更多的死胡同
    
    for (let i = 0; i < deadEnds; i++) {
        // 随机选择一个位置
        const x = Math.floor(Math.random() * (lowerMazeSize - 4)) + 2;
        const y = Math.floor(Math.random() * (lowerMazeSize - 4)) + 2;
        
        // 如果是墙壁，尝试创建一个死胡同
        if (lowerMaze[y][x].isWall) {
            // 随机选择一个方向
            const directions = [
                { dx: 0, dy: -1 }, // 上
                { dx: 1, dy: 0 },  // 右
                { dx: 0, dy: 1 },  // 下
                { dx: -1, dy: 0 }  // 左
            ];
            
            shuffleArray(directions);
            
            for (const dir of directions) {
                const newX = x + dir.dx;
                const newY = y + dir.dy;
                
                // 检查是否是路径
                if (newX > 0 && newX < lowerMazeSize - 1 && newY > 0 && newY < lowerMazeSize - 1 && !lowerMaze[newY][newX].isWall) {
                    // 在反方向创建一个死胡同
                    const deadEndX = x - dir.dx;
                    const deadEndY = y - dir.dy;
                    
                    if (deadEndX > 0 && deadEndX < lowerMazeSize - 1 && deadEndY > 0 && deadEndY < lowerMazeSize - 1 && lowerMaze[deadEndY][deadEndX].isWall) {
                        lowerMaze[y][x].isWall = false;
                        break;
                    }
                }
            }
        }
    }
    
    // 添加一些障碍物区域，形成更复杂的迷宫结构
    const obstacleCount = 5; // 添加5个障碍物区域
    
    for (let i = 0; i < obstacleCount; i++) {
        // 随机选择一个中心点
        const centerX = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
        const centerY = Math.floor(Math.random() * (lowerMazeSize - 10)) + 5;
        
        // 随机确定障碍物大小
        const obstacleSize = Math.floor(Math.random() * 3) + 2; // 2-4的大小
        
        // 创建障碍物
        for (let y = centerY - obstacleSize; y <= centerY + obstacleSize; y++) {
            for (let x = centerX - obstacleSize; x <= centerX + obstacleSize; x++) {
                // 确保在迷宫范围内
                if (x > 0 && x < lowerMazeSize - 1 && y > 0 && y < lowerMazeSize - 1) {
                    // 计算到中心的距离
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    // 创建圆形或不规则形状的障碍物
                    if (distance <= obstacleSize && Math.random() < 0.7) {
                        lowerMaze[y][x].isWall = true;
                    }
                }
            }
        }
    }
    
    // 确保从中心到边缘有可达路径
    const centerX = Math.floor(lowerMazeSize / 2);
    const centerY = Math.floor(lowerMazeSize / 2);
    
    // 创建几条从中心向外的主要路径
    const pathCount = 4; // 创建4条主要路径
    const angleStep = 2 * Math.PI / pathCount;
    
    for (let i = 0; i < pathCount; i++) {
        const angle = i * angleStep;
        let x = centerX;
        let y = centerY;
        
        // 从中心向外延伸
        const pathLength = Math.floor(lowerMazeSize / 2) - 2;
        
        for (let j = 0; j < pathLength; j++) {
            x += Math.round(Math.cos(angle));
            y += Math.round(Math.sin(angle));
            
            // 确保在迷宫范围内
            if (x > 0 && x < lowerMazeSize - 1 && y > 0 && y < lowerMazeSize - 1) {
                lowerMaze[y][x].isWall = false;
                
                // 添加一些分支
                if (j > 3 && Math.random() < 0.3) {
                    const branchAngle = angle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
                    let branchX = x;
                    let branchY = y;
                    
                    const branchLength = Math.floor(Math.random() * 5) + 2;
                    
                    for (let k = 0; k < branchLength; k++) {
                        branchX += Math.round(Math.cos(branchAngle));
                        branchY += Math.round(Math.sin(branchAngle));
                        
                        // 确保在迷宫范围内
                        if (branchX > 0 && branchX < lowerMazeSize - 1 && branchY > 0 && branchY < lowerMazeSize - 1) {
                            lowerMaze[branchY][branchX].isWall = false;
                        }
                    }
                }
            }
        }
    }
}
