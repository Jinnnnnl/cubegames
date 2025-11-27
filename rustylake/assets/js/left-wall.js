// Triangle Impossible 游戏逻辑
class TriangleImpossibleGame {
    constructor() {
        // 三个钉子的初始位置（距离中心36像素，约20分）
        this.pins = {
            pin1: { x: 200, y: 164, angle: -Math.PI/2 }, // 高收益 (0度方向)
            pin2: { x: 236, y: 236, angle: Math.PI/6 },   // 大容量 (120度方向)
            pin3: { x: 164, y: 236, angle: 5*Math.PI/6 }  // 低波动 (240度方向)
        };
        
        this.centerX = 200;
        this.centerY = 200;
        this.maxRadius = 180;
        this.minRadius = 0;
        
        // 计算最大周长：两个钉子在90分(162像素)，一个在0分
        this.maxPerimeter = this.calculateMaxPerimeter();
        
        this.currentScore = 0;
        this.targetScore = 75;
        this.gameStarted = false;
        
        this.isDragging = false;
        this.dragTarget = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    calculateMaxPerimeter() {
        // 两个钉子在90分位置(162像素)，一个在0分位置
        const radius90 = 162; // 90分对应的像素距离
        const radius0 = 0;    // 0分对应的像素距离
        
        // 计算三个点的坐标
        const p1 = { x: this.centerX, y: this.centerY - radius90 }; // 0度，90分
        const p2 = { x: this.centerX + radius90 * Math.cos(Math.PI/3), y: this.centerY + radius90 * Math.sin(Math.PI/3) }; // 120度，90分
        const p3 = { x: this.centerX, y: this.centerY }; // 中心，0分
        
        // 计算周长
        const side1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const side2 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
        const side3 = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
        
        return side1 + side2 + side3;
    }
    
    setupEventListeners() {
        // 鼠标事件
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // 触摸事件（移动端支持）
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    handleMouseDown(e) {
        const target = e.target;
        if (target.classList.contains('draggable-pin')) {
            this.startDrag(target, e.clientX, e.clientY);
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            this.updateDrag(e.clientX, e.clientY);
        }
    }
    
    handleMouseUp(e) {
        this.endDrag();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const target = e.target;
        if (target.classList.contains('draggable-pin')) {
            const touch = e.touches[0];
            this.startDrag(target, touch.clientX, touch.clientY);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.isDragging) {
            const touch = e.touches[0];
            this.updateDrag(touch.clientX, touch.clientY);
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.endDrag();
    }
    
    startDrag(target, clientX, clientY) {
        if (!this.gameStarted) return;
        
        this.isDragging = true;
        this.dragTarget = target;
        
        const svg = document.querySelector('.board-svg');
        const rect = svg.getBoundingClientRect();
        const svgX = (clientX - rect.left) * (400 / rect.width);
        const svgY = (clientY - rect.top) * (400 / rect.height);
        
        const pinId = target.id;
        this.dragOffset.x = svgX - this.pins[pinId].x;
        this.dragOffset.y = svgY - this.pins[pinId].y;
        
        target.style.cursor = 'grabbing';
    }
    
    updateDrag(clientX, clientY) {
        if (!this.isDragging || !this.dragTarget) return;
        
        const svg = document.querySelector('.board-svg');
        const rect = svg.getBoundingClientRect();
        const svgX = (clientX - rect.left) * (400 / rect.width);
        const svgY = (clientY - rect.top) * (400 / rect.height);
        
        const newX = svgX - this.dragOffset.x;
        const newY = svgY - this.dragOffset.y;
        const pinId = this.dragTarget.id;
        
        // 将位置限制到对应的直线轨道上
        const constrainedPos = this.constrainToLine(newX, newY, pinId);
        
        if (constrainedPos) {
            // 检查周长限制
            const tempPins = { ...this.pins };
            tempPins[pinId] = constrainedPos;
            
            const newPerimeter = this.calculatePerimeterWithPins(tempPins);
            
            if (newPerimeter <= this.maxPerimeter) {
                this.pins[pinId] = constrainedPos;
                
                // 更新显示
                this.updatePinPositions();
                this.updateTriangle();
                this.updateDisplay();
            }
        }
    }
    
    // 将钉子位置限制到对应的直线轨道上
    constrainToLine(x, y, pinId) {
        const centerX = this.centerX;
        const centerY = this.centerY;
        const pin = this.pins[pinId];
        
        // 计算鼠标位置到直线的投影
        const lineAngle = pin.angle;
        const dx = x - centerX;
        const dy = y - centerY;
        
        // 计算在直线上的投影距离
        const projectionDistance = dx * Math.cos(lineAngle) + dy * Math.sin(lineAngle);
        
        // 限制距离在允许范围内
        const constrainedDistance = Math.max(this.minRadius, Math.min(this.maxRadius, projectionDistance));
        
        // 计算最终位置
        const finalX = centerX + constrainedDistance * Math.cos(lineAngle);
        const finalY = centerY + constrainedDistance * Math.sin(lineAngle);
        
        return { x: finalX, y: finalY, angle: lineAngle };
    }
    
    endDrag() {
        if (this.dragTarget) {
            this.dragTarget.style.cursor = 'grab';
        }
        this.isDragging = false;
        this.dragTarget = null;
    }
    
    calculatePerimeterWithPins(pins) {
        const p1 = pins.pin1;
        const p2 = pins.pin2;
        const p3 = pins.pin3;
        
        const side1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const side2 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
        const side3 = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
        
        return side1 + side2 + side3;
    }
    
    calculatePerimeter() {
        return this.calculatePerimeterWithPins(this.pins);
    }
    
    calculateTriangleArea() {
        const p1 = this.pins.pin1;
        const p2 = this.pins.pin2;
        const p3 = this.pins.pin3;
        
        // 使用叉积公式计算面积
        const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
        return area;
    }
    
    updatePinPositions() {
        Object.keys(this.pins).forEach(pinId => {
            const pin = this.pins[pinId];
            const element = document.getElementById(pinId);
            element.setAttribute('cx', pin.x);
            element.setAttribute('cy', pin.y);
        });
    }
    
    updateTriangle() {
        const p1 = this.pins.pin1;
        const p2 = this.pins.pin2;
        const p3 = this.pins.pin3;
        
        const triangle = document.getElementById('triangle');
        triangle.setAttribute('points', `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`);
    }
    
    updateDisplay() {
        // 计算参数值（基于距离中心的距离，0-100分）
        const returnValue = Math.round((Math.sqrt(Math.pow(this.pins.pin1.x - this.centerX, 2) + Math.pow(this.pins.pin1.y - this.centerY, 2)) / this.maxRadius) * 100);
        const liquidityValue = Math.round((Math.sqrt(Math.pow(this.pins.pin2.x - this.centerX, 2) + Math.pow(this.pins.pin2.y - this.centerY, 2)) / this.maxRadius) * 100);
        const riskValue = Math.round((Math.sqrt(Math.pow(this.pins.pin3.x - this.centerX, 2) + Math.pow(this.pins.pin3.y - this.centerY, 2)) / this.maxRadius) * 100);
        
        // 计算三角形面积和得分
        const area = this.calculateTriangleArea();
        const perimeter = this.calculatePerimeter();
        
        // 得分基于面积，标准化到合理范围
        this.currentScore = Math.round((area / 15000) * 100);
        
        // 更新显示
        document.getElementById('returnValue').textContent = `${returnValue}`;
        document.getElementById('liquidityValue').textContent = `${liquidityValue}`;
        document.getElementById('riskValue').textContent = `${riskValue}`;
        document.getElementById('currentScore').textContent = this.currentScore;
        
        // 检查是否达到目标
        const submitBtn = document.getElementById('submitBtn');
        if (this.currentScore >= this.targetScore) {
            submitBtn.disabled = false;
            document.getElementById('triangle').classList.add('success');
        } else {
            submitBtn.disabled = true;
            document.getElementById('triangle').classList.remove('success');
        }
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timeLeft').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    endGame(success) {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        if (success) {
            // 根据参数值显示不同的成功消息
            const returnValue = Math.round((Math.sqrt(Math.pow(this.pins.pin1.x - this.centerX, 2) + Math.pow(this.pins.pin1.y - this.centerY, 2)) / this.maxRadius) * 100);
            const liquidityValue = Math.round((Math.sqrt(Math.pow(this.pins.pin2.x - this.centerX, 2) + Math.pow(this.pins.pin2.y - this.centerY, 2)) / this.maxRadius) * 100);
            const riskValue = Math.round((Math.sqrt(Math.pow(this.pins.pin3.x - this.centerX, 2) + Math.pow(this.pins.pin3.y - this.centerY, 2)) / this.maxRadius) * 100);
            
            let successMessage = "你成功掌握了量化策略的平衡艺术！";
            
            // 按参数组合的独特性排序，让更具体、更难达成的条件优先
            if (returnValue === 100 && riskValue <= 50) {
                // 极端高收益+控制风险 - 最难达成
                successMessage = "我用青春赌明天，明天不行就后天！";
            } else if (returnValue === 0) {
                // 极端低收益 - 很少见
                successMessage = "爱的奉献？";
            } else if (returnValue >= 85 && riskValue >= 85) {
                // 双高指标组合 - 很难达成
                successMessage = "策略很棒，但你是王母娘娘吗？能拿到这种额度的人脉介绍下？";
            } else if (returnValue >= 80 && riskValue >= 80 && liquidityValue <= 40) {
                // 特殊的高收益+高风险+低容量组合 - 特定场景
                successMessage = "你确定你能买到这类产品么？";
            } else if (liquidityValue >= 90) {
                // 单一突出的大容量 - 相对容易但有特色
                successMessage = "大容量策略也要警惕同频共振。";
            } else if (returnValue >= 90 && liquidityValue >= 50 && riskValue < 85) {
                // 高收益+中等容量，但避免与"王母娘娘"重叠
                successMessage = "高收益高风险，时间是策略的玫瑰。";
            } else if (returnValue >= 65 && riskValue >= 65 && liquidityValue >= 65 && 
                      (returnValue < 85 || riskValue < 85)) {
                // 高水平平衡，但排除已被"王母娘娘"覆盖的情况
                successMessage = "平衡的艺术！";
            } else if (returnValue >= 52 && riskValue >= 52 && liquidityValue >= 52 && 
                      (returnValue < 65 || riskValue < 65 || liquidityValue < 65)) {
                // 中等平衡，明确排除"平衡艺术"的范围
                successMessage = "均衡配置，稳健投资的智慧选择！";
            } else if (returnValue <= 30 && riskValue <= 30 && liquidityValue <= 30) {
                // 全面保守 - 相对少见
                successMessage = "过于保守可能错失机会，适度承担风险才能获得回报。";
            } else {
                // 其他所有情况
                successMessage = "看起来还不错~";
            }
            
            // 显示结果在页面中
            document.getElementById('resultReturn').textContent = returnValue;
            document.getElementById('resultLiquidity').textContent = liquidityValue;
            document.getElementById('resultRisk').textContent = riskValue;
            document.getElementById('resultScore').textContent = this.currentScore;
            document.getElementById('resultMessage').textContent = successMessage;
            document.getElementById('resultDisplay').style.display = 'block';
            
            // 隐藏游戏控制按钮
            document.querySelector('.game-controls').style.display = 'none';
        } else {
            this.gameStarted = false;
            alert('时间到！挑战失败，请重新开始。');
            this.resetGame();
        }
    }
    
    resetGame() {
        // 重置钉子位置到初始位置（约20分）
        this.pins.pin1 = { x: 200, y: 164, angle: -Math.PI/2 };
        this.pins.pin2 = { x: 236, y: 236, angle: Math.PI/6 };
        this.pins.pin3 = { x: 164, y: 236, angle: 5*Math.PI/6 };
        
        // 重置游戏状态
        this.currentScore = 0;
        this.gameStarted = true; // 修复：重置后立即可以拖动钉子
        
        // 更新显示
        this.updatePinPositions();
        this.updateTriangle();
        this.updateDisplay();
        
        document.getElementById('triangle').classList.remove('success');
        
        // 显示游戏控制按钮，隐藏结果显示
        document.querySelector('.game-controls').style.display = 'flex';
        document.getElementById('resultDisplay').style.display = 'none';
    }
}

// 全局游戏实例
let triangleGame;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    triangleGame = new TriangleImpossibleGame();
});

// 游戏控制函数
function startGame() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'flex';
    
    triangleGame.gameStarted = true;
}

function resetGame() {
    triangleGame.resetGame();
}

function showInstructions() {
    document.getElementById('instructions').style.display = 'block';
    document.getElementById('gameBoard').style.display = 'none';
    
    triangleGame.gameStarted = false;
}

function submitResult() {
    if (triangleGame.currentScore >= triangleGame.targetScore) {
        triangleGame.endGame(true);
    }
}

function completeChallenge() {
    // 向父窗口发送完成消息
    if (window.opener) {
        window.opener.postMessage({
            type: 'leftWallCompleted',
            score: triangleGame.currentScore,
            params: {
                return: Math.round((Math.sqrt(Math.pow(triangleGame.pins.pin1.x - triangleGame.centerX, 2) + Math.pow(triangleGame.pins.pin1.y - triangleGame.centerY, 2)) / triangleGame.maxRadius) * 100),
                liquidity: Math.round((Math.sqrt(Math.pow(triangleGame.pins.pin2.x - triangleGame.centerX, 2) + Math.pow(triangleGame.pins.pin2.y - triangleGame.centerY, 2)) / triangleGame.maxRadius) * 100),
                risk: Math.round((Math.sqrt(Math.pow(triangleGame.pins.pin3.x - triangleGame.centerX, 2) + Math.pow(triangleGame.pins.pin3.y - triangleGame.centerY, 2)) / triangleGame.maxRadius) * 100)
            }
        }, '*');
    }
    
    alert('恭喜你完成了Triangle Impossible挑战！');
    // 关闭当前窗口
    window.close();
}

function goBack() {
    if (window.opener) {
        window.close();
    } else {
        window.location.href = 'index.html';
    }
}

// 防止页面滚动影响拖拽
document.addEventListener('touchmove', function(e) {
    if (triangleGame && triangleGame.isDragging) {
        e.preventDefault();
    }
}, { passive: false });