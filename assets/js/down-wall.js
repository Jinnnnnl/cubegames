class FoxTailGame {
    constructor() {
        this.currentStage = 1;
        this.currentRound = 1;
        this.maxRounds = 6; // 将在开始游戏时随机设置为 5-10
        this.playerScore = 0;
        this.hintsRemaining = 5;
        
        // 引导相关状态
        this.guidedAreaId = null; // 当前被随机激活、显示呼吸按钮的区域 id
        this.activatedCount = 0; // 已激活（被提示或点击）区域计数
        this.trapNext = false; // 下一个被激活是否为陷阱
        this.lastRoundGuidedClicked = false; // 最后一轮（最终轮）是否点击了被提示区域
        this.lastGuidedClickedRound = 0; // 记录最后一次被提示并被点击的回合号
        
        // 游戏数据
        this.tailPositions = [
            // 区域：17.png
            {
                id: 17,
                image: '../assets/images/cards/17.png',
                description: '衣柜左上门板区域',
                left: '30.0833%',
                top: '23.0482%',
                width: '19.4167%',
                height: '48.4845%'
            },
            // 新增区域：13.png（您提供的保存值）
            {
                id: 13,
                image: '../assets/images/cards/13.png',
                description: '衣柜右上门板区域',
                left: '49.8025%',
                top: '22.589%',
                width: '19.4167%',
                height: '48.4845%'
            },
            // 新增区域：7.png
            {
                id: 7,
                image: '../assets/images/cards/7.png',
                description: '衣柜左侧区域',
                left: '-0.0754302%',
                top: '-0.258344%',
                width: '15.9368%',
                height: '69.38%'
            },
            // 新增区域：8.png（已更新坐标）
            {
                id: 8,
                image: '../assets/images/cards/8.png',
                description: '衣柜左侧另一区域',
                left: '84.2958%',
                top: '0.889757%',
                width: '15.4484%',
                height: '63.2951%'
            },
            // 新增区域：9.png
            {
                id: 9,
                image: '../assets/images/cards/9.png',
                description: '衣柜下部右侧',
                left: '77.0308%',
                top: '79.8794%',
                width: '20.2714%',
                height: '19.8967%'
            },
            // 新增区域：10.png
            {
                id: 10,
                image: '../assets/images/cards/10.png',
                description: '衣柜下部中间左',
                left: '32.0369%',
                top: '81.4868%',
                width: '10.7476%',
                height: '9.21929%'
            },
            // 新增区域：11.png
            {
                id: 11,
                image: '../assets/images/cards/11.png',
                description: '衣柜下部中间右',
                left: '45.2848%',
                top: '81.8312%',
                width: '9.40449%',
                height: '8.07118%'
            },
            // 新增区域：12.png
            {
                id: 12,
                image: '../assets/images/cards/12.png',
                description: '衣柜下部中间',
                left: '57.6779%',
                top: '81.4868%',
                width: '9.40449%',
                height: '8.18599%'
            },
            // 新增区域：14.png
            {
                id: 14,
                image: '../assets/images/cards/14.png',
                description: '衣柜右中侧',
                left: '88.0198%',
                top: '67.1355%',
                width: '5.19204%',
                height: '7.95637%'
            },
            // 新增区域：16.png
            {
                id: 16,
                image: '../assets/images/cards/16.png',
                description: '衣柜上中区域',
                left: '29.5949%',
                top: '-1.06202%',
                width: '39.8074%',
                height: '15.4191%'
            }
        ];
        
        this.currentTailPosition = null;
        this.gameHistory = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.showStage(1);
    }

    bindEvents() {
        // 阶段1：点击衣柜
        document.getElementById('cabinetRing').addEventListener('click', () => {
            this.playVideo();
        });

        // 阶段3：开始游戏
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startMainGame();
        });

        // 阶段4：游戏控制
        document.getElementById('back-btn').addEventListener('click', () => {
            this.backToMenu();
        });

        // 点击区域事件
        this.bindClickAreas();

        // 点击 wardrobe-container 的空白处扣分（如果不是点击在 click-area 中）
        const wardrobe = document.querySelector('.wardrobe-container');
        if (wardrobe) {
            wardrobe.addEventListener('click', (e) => {
                const area = e.target.closest('.click-area');
                const btn = e.target.closest('#guidedPulseBtn');
                if (!area && !btn) {
                    // 点击到区域外，扣100分（允许负分）
                    this.playerScore = this.playerScore - 100;
                    this.updateGameInfo();
                }
            });
        }

        // 弹窗控制
        document.getElementById('closeTailModal').addEventListener('click', () => {
            this.closeTailFoundModal();
        });

        document.getElementById('continueBtn').addEventListener('click', () => {
            this.continueGame();
        });

        const backToMenuBtn = document.getElementById('back-to-menu');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                // 像素风格返回首页
                window.close();
            });
        }

        // 调试工具
        const openDebugBtn = document.getElementById('openDebugBtn');
        if (openDebugBtn) {
            openDebugBtn.addEventListener('click', () => this.openDebugPanel());
        }

        // 窗口大小变化时重新计算点击区域
        window.addEventListener('resize', () => {
            if (this.currentStage === 4) {
                setTimeout(() => {
                    this.updateClickAreas();
                }, 100); // 延迟一点确保图片重新渲染完成
            }
        });
    }

    bindClickAreas() {
        // Ensure click-area DOM elements exist for each tailPositions entry
        const container = document.getElementById('clickable-areas');
        // 清理现有但不是由配置生成的多余元素不会删除，先按 id 创建/复用
        this.tailPositions.forEach(pos => {
            let area = container.querySelector(`.click-area[data-tail="${pos.id}"]`);
            if (!area) {
                area = document.createElement('div');
                area.className = 'click-area';
                area.dataset.tail = String(pos.id);
                area.title = '点击寻找狐狸尾巴';
                container.appendChild(area);
            }
            // 绑定点击事件（先移除避免重复绑定）
            area.replaceWith(area.cloneNode(true));
            area = container.querySelector(`.click-area[data-tail="${pos.id}"]`);
            area.addEventListener('click', (e) => {
                this.handleAreaClick(e.currentTarget);
            });
        });
    }

    showStage(stageNumber) {
        // 隐藏所有阶段
        document.querySelectorAll('.game-stage').forEach(stage => {
            stage.classList.remove('active');
        });
        
        // 显示指定阶段
        document.getElementById(`stage${stageNumber}`).classList.add('active');
        this.currentStage = stageNumber;
    }

    playVideo() {
        this.showStage(2);
        const video = document.getElementById('gameVideo');
        
        video.addEventListener('ended', () => {
            this.showStage(3);
        });
        
        video.play();
    }

    startMainGame() {
        // 固定游玩次数为 9 轮
        this.maxRounds = 9;
        this.currentRound = 1;
        this.lastRoundGuidedClicked = false;
        this.finalFellTrap = false; // 第9轮落入陷阱标记
        this.finalAvoidedTrap = false; // 第9轮避开陷阱标记
        this.showStage(4);
        this.initializeRound();
    }

    initializeRound() {
        // 随机选择一个尾巴位置
        this.currentTailPosition = this.tailPositions[Math.floor(Math.random() * this.tailPositions.length)];
        
        // 更新UI
        this.updateGameInfo();
        this.updateHintText();
        
        // 重置点击区域状态
        document.querySelectorAll('.click-area').forEach(area => {
            area.classList.remove('clicked');
        });
        
        // 重新计算点击区域位置
        this.updateClickAreas();

        // 启动引导（回合制：每轮点亮一个引导区域，等待用户点击任意区域后继续下一轮）
        this.startGuidance();
    }

    updateClickAreas() {
        const img = document.getElementById('wardrobe-image');
        const container = img.parentElement;
        
        // 等待图片加载完成
        if (img.complete) {
            this.calculateClickAreas(img, container);
        } else {
            img.onload = () => {
                this.calculateClickAreas(img, container);
            };
        }
        
        // 确保为所有区域设置可见（方便调试）
        document.querySelectorAll('.click-area').forEach(area => {
            area.style.display = 'block';
        });

        // 更新引导按钮位置（如果有）
        this.updateGuidanceButton();
    }

    // 引导：回合制引导（每轮点亮一个区域并等待玩家点击任意区域）
    startGuidance() {
        // 在每轮开始时随机选区并显示按钮，等待玩家点击任意带编号区域后进入下一轮
        this.pickRandomGuidedArea();
    }

    pickRandomGuidedArea() {
        // 选择未被点击过的区域
        const available = this.tailPositions.filter(pos => {
            const el = document.querySelector(`.click-area[data-tail="${pos.id}"]`);
            return el && !el.classList.contains('clicked');
        });
        if (available.length === 0) {
            // 没有可用区域，结束游戏
            this.showGameResult();
            return;
        }

        const idx = Math.floor(Math.random() * available.length);
        const chosen = available[idx];

        // 设置引导区域
        this.guidedAreaId = chosen.id;

        // 触发陷阱：只有当 activatedCount 达到 9 时才触发陷阱（更严苛）
        if (this.activatedCount === 9) {
            this.trapNext = true;
        }

        this.updateGuidanceButton();
    }

    stopGuidance() {
        this.removeGuidanceButton();
    }

    updateGuidanceButton() {
        // 在被引导的区域中心添加呼吸按钮
        this.removeGuidanceButton();
        if (!this.guidedAreaId || this.currentStage !== 4) return;

        const area = document.querySelector(`.click-area[data-tail="${this.guidedAreaId}"]`);
        if (!area) return;

        const btn = document.createElement('div');
        btn.id = 'guidedPulseBtn';
        btn.className = 'pulse-btn core';
        const inner = document.createElement('div');
        inner.className = 'pulse-core';
        btn.appendChild(inner);
        // 点击行为：如果为陷阱并且触发失败，否则给予分数
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isTrap = this.trapNext && (this.activatedCount === 9);
            if (isTrap) {
                // 失败
                this.stopGuidance();
                // 只有在 activatedCount >=4 且这是第4次或之后的被提示点击时弹出该文案（像素风格窗口）
                if (this.activatedCount >= 4) {
                    this.showPixelAlert('你认为你发现了规律，可没人说有提示的就是对的；市场比狐狸更要狡猾的多');
                }
                this.showGameResult();
                return;
            }
            // 正常得分：点击引导按钮也能得分
            this.playerScore += 100;
            this.updateGameInfo();
            this.activatedCount += 1;
            // 移除引导按钮并等待玩家点击任一区域来触发下一轮
            this.removeGuidanceButton();
        });

        // 将按钮放在 area 中心
        // 先尝试插入到 area 中，如果仍看不到，会以绝对定位插入到容器中
        area.appendChild(btn);
        this.updateGuidanceButtonPosition();
        // 调试帮助：在控制台输出并描边按钮与区域
        this.debugGuidance(btn, area);
        // 若未被渲染在 DOM 中（某些情况下），也尝试挂在到 clickable-areas 容器并定位
        setTimeout(() => {
            if (!document.getElementById('guidedPulseBtn')) return;
            const btnCheck = document.getElementById('guidedPulseBtn');
            if (!btnCheck.parentElement || btnCheck.parentElement.classList.contains('clickable-areas')) return;
            // 如果按钮已在 area 内则不重复添加
            const container = document.getElementById('clickable-areas');
            if (!container.contains(btnCheck)) {
                container.appendChild(btnCheck);
                this.updateGuidanceButtonPosition();
                this.debugGuidance(btnCheck, area);
            }
        }, 50);
    }

    updateGuidanceButtonPosition() {
        const btn = document.getElementById('guidedPulseBtn');
        if (!btn) return;
        const area = document.querySelector(`.click-area[data-tail="${this.guidedAreaId}"]`);
        const clickableContainer = document.getElementById('clickable-areas');
        const gameContainer = document.querySelector('.game-container');
        const wardrobe = document.querySelector('.wardrobe-container');
        if (!area || !clickableContainer || !gameContainer || !wardrobe) return;

        // 计算 area 相对于 wardrobe-container 中心（使用已设置的 style 百分比或像素）
        const style = window.getComputedStyle(area);
        const leftStyle = style.left || area.style.left || '0%';
        const topStyle = style.top || area.style.top || '0%';
        const widthStyle = style.width || area.style.width || '0%';
        const heightStyle = style.height || area.style.height || '0%';

        const containerRect = clickableContainer.getBoundingClientRect();
        const toPct = (val, axis) => {
            if (typeof val !== 'string') return 0;
            if (val.endsWith('%')) return parseFloat(val);
            const px = parseFloat(val);
            return axis === 'x' ? (px / containerRect.width) * 100 : (px / containerRect.height) * 100;
        };

        const leftPct = toPct(leftStyle, 'x');
        const topPct = toPct(topStyle, 'y');
        const widthPct = toPct(widthStyle, 'x');
        const heightPct = toPct(heightStyle, 'y');

        const centerLeftPct = leftPct + widthPct / 2;
        const centerTopPct = topPct + heightPct / 2;

        // 把按钮挂到 .game-container 顶层，避免被任何子元素的 z-index 或 overflow 遮挡
        if (btn.parentElement !== gameContainer) gameContainer.appendChild(btn);

        // 计算 wardrobe 容器左上角相对于 gameContainer 的位置
        const wardrobeRect = wardrobe.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        const offsetLeft = wardrobeRect.left - gameRect.left;
        const offsetTop = wardrobeRect.top - gameRect.top;

        // 将百分比中心转换为 wardrobe 像素，然后相对于 gameContainer 定位
        const centerX = offsetLeft + (centerLeftPct / 100) * wardrobeRect.width;
        const centerY = offsetTop + (centerTopPct / 100) * wardrobeRect.height;

        btn.style.position = 'absolute';
        btn.style.left = `${centerX}px`;
        btn.style.top = `${centerY}px`;
        btn.style.transform = 'translate(-50%, -50%)';
        btn.style.zIndex = '9999';
        // 按钮可见并可交互（置顶显示）
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
    }

    removeGuidanceButton() {
        const existing = document.getElementById('guidedPulseBtn');
        if (existing && existing.parentElement) existing.parentElement.removeChild(existing);
    }

    // 像素风格提示弹窗
    showPixelAlert(message) {
        return new Promise(resolve => {
            // 如果已有弹窗，则更新文本并复用
            let modal = document.getElementById('pixelAlertModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'pixelAlertModal';
                modal.style.position = 'fixed';
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.zIndex = '10000';
                modal.style.background = '#000';
                modal.style.border = '4px solid #ff6b6b';
                modal.style.padding = '20px';
                modal.style.color = '#faef5d';
                modal.style.fontFamily = "'Press Start 2P', 'Zpix', 'VT323', Arial, sans-serif";
                modal.style.textAlign = 'center';
                modal.style.boxShadow = '8px 8px 0 rgba(0,0,0,0.6)';
                modal.style.pointerEvents = 'auto';

                const content = document.createElement('div');
                content.id = 'pixelAlertContent';
                content.style.padding = '10px';
                content.style.fontSize = '12px';
                modal.appendChild(content);

                const ok = document.createElement('button');
                ok.textContent = '确定';
                ok.style.marginTop = '12px';
                ok.style.padding = '8px 12px';
                ok.style.border = '2px solid #000';
                ok.style.background = '#ff6b6b';
                ok.style.cursor = 'pointer';
                ok.addEventListener('click', () => {
                    modal.classList.remove('show');
                    if (modal.parentElement) modal.parentElement.removeChild(modal);
                    resolve();
                });
                modal.appendChild(ok);

                document.body.appendChild(modal);
            }
            const content = document.getElementById('pixelAlertContent');
            if (content) content.textContent = message;
        });
    }

    // 调试：在控制台输出并给按钮与区域临时描边，帮助定位显示问题
    debugGuidance(btn, area) {
        try {
            console.log('调试 guided btn 与 area:', { btn, area });
            // 先清理所有 click-area 的描边，确保每次只有一个区域描边
            document.querySelectorAll('.click-area').forEach(a => { a.style.outline = ''; });
            // 移除之前按钮的描边
            const prevBtn = document.getElementById('guidedPulseBtn');
            if (prevBtn) prevBtn.style.outline = '';

            // 给当前元素添加明显的白色描边，3s 后移除
            if (btn) {
                btn.style.outline = '3px solid #ffffff';
                btn.style.opacity = '1';
            }
            if (area) {
                area.style.outline = '2px dashed #ffffff';
            }
            setTimeout(() => {
                if (btn) { btn.style.outline = ''; }
                if (area) { area.style.outline = ''; }
            }, 3000);
        } catch (e) {
            console.warn('debugGuidance 出错', e);
        }
    }

    // 调试面板：允许拖动/调整点击区域并保存百分比坐标
    openDebugPanel() {
        // 创建调试遮罩
        if (document.getElementById('debugOverlay')) return; // 已打开
        const overlay = document.createElement('div');
        overlay.id = 'debugOverlay';
        overlay.style.position = 'fixed';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '2000';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);
        
        // 将每个点击区域设为可拖动并显示控制把手
        document.querySelectorAll('.click-area').forEach(area => {
            area.style.pointerEvents = 'auto';
            area.style.outline = '2px dashed #00f';
            area.style.cursor = 'move';
            area.draggable = true;
            
            // 鼠标拖动调整位置
            let isDragging = false;
            let startX, startY, origLeft, origTop;
            
            area.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                origLeft = parseFloat(area.style.left) || 0;
                origTop = parseFloat(area.style.top) || 0;
                area.style.transition = 'none';
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                // 基于容器宽高调整百分比
                const img = document.getElementById('wardrobe-image');
                const displayedWidth = img.offsetWidth;
                const displayedHeight = img.offsetHeight;
                
                const leftPx = (origLeft / 100) * displayedWidth + dx;
                const topPx = (origTop / 100) * displayedHeight + dy;
                
                area.style.left = `${(leftPx / displayedWidth) * 100}%`;
                area.style.top = `${(topPx / displayedHeight) * 100}%`;
            });

            window.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                area.style.transition = '';
            });

            // 允许调整大小（右下角拖动）
            const resizer = document.createElement('div');
            resizer.style.position = 'absolute';
            resizer.style.width = '12px';
            resizer.style.height = '12px';
            resizer.style.right = '0';
            resizer.style.bottom = '0';
            resizer.style.background = '#0ff';
            resizer.style.cursor = 'nwse-resize';
            area.appendChild(resizer);

            let isResizing = false;
            let startW, startH, origW, origH;
            resizer.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isResizing = true;
                startW = e.clientX;
                startH = e.clientY;
                origW = parseFloat(area.style.width) || 0;
                origH = parseFloat(area.style.height) || 0;
                area.style.transition = 'none';
            });

            window.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                const dx = e.clientX - startW;
                const dy = e.clientY - startH;
                
                const img = document.getElementById('wardrobe-image');
                const displayedWidth = img.offsetWidth;
                const displayedHeight = img.offsetHeight;
                
                const newWpx = (origW / 100) * displayedWidth + dx;
                const newHpx = (origH / 100) * displayedHeight + dy;
                
                area.style.width = `${(newWpx / displayedWidth) * 100}%`;
                area.style.height = `${(newHpx / displayedHeight) * 100}%`;
            });

            window.addEventListener('mouseup', (e) => {
                if (isResizing) {
                    isResizing = false;
                    area.style.transition = '';
                }
            });
        });

        // 添加保存按钮
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '保存区域坐标';
        saveBtn.style.position = 'absolute';
        saveBtn.style.right = '20px';
        saveBtn.style.bottom = '20px';
        saveBtn.style.zIndex = '2001';
        document.body.appendChild(saveBtn);

        saveBtn.addEventListener('click', () => {
            const result = [];
            document.querySelectorAll('.click-area').forEach(area => {
                result.push({
                    tail: area.dataset.tail,
                    left: area.style.left,
                    top: area.style.top,
                    width: area.style.width,
                    height: area.style.height
                });
            });
            console.log('保存的区域坐标：', result);
            alert('已将区域坐标打印到控制台，复制并发送给我以便写入代码');
        });
    }

    calculateClickAreas(img, container) {
        // 使用 contain 模式时，图片可能在容器中居中显示（会有内边距），
        // 因此我们把保存的百分比(相对于图片本身)转换为相对于容器的百分比。
        const displayedWidth = img.getBoundingClientRect().width;
        const displayedHeight = img.getBoundingClientRect().height;
        const imgRect = img.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const imgOffsetLeft = imgRect.left - containerRect.left; // 相对于容器
        const imgOffsetTop = imgRect.top - containerRect.top; // 相对于容器
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // 更新所有点击区域的位置
        this.tailPositions.forEach(position => {
            const clickArea = document.querySelector(`[data-tail="${position.id}"]`);
            if (clickArea) {
                let imgLeftPct, imgTopPct, imgWidthPct, imgHeightPct;

                if (position.left && position.top && position.width && position.height) {
                    imgLeftPct = parseFloat(position.left);   // 百分比，基于图片本身
                    imgTopPct = parseFloat(position.top);
                    imgWidthPct = parseFloat(position.width);
                    imgHeightPct = parseFloat(position.height);
                } else if (position.id === 17) {
                    imgLeftPct = 32;
                    imgTopPct = 25;
                    imgWidthPct = 18;
                    imgHeightPct = 30;
                }

                // 转换为图片像素
                const areaPxLeftOnImage = (imgLeftPct / 100) * displayedWidth;
                const areaPxTopOnImage = (imgTopPct / 100) * displayedHeight;
                const areaPxWidthOnImage = (imgWidthPct / 100) * displayedWidth;
                const areaPxHeightOnImage = (imgHeightPct / 100) * displayedHeight;

                // 转换为相对于容器的像素位置（考虑图片在容器中的偏移）
                const areaPxLeftInContainer = imgOffsetLeft + areaPxLeftOnImage;
                const areaPxTopInContainer = imgOffsetTop + areaPxTopOnImage;

                // 最终以容器为基准计算百分比并应用
                const leftPercent = (areaPxLeftInContainer / containerWidth) * 100;
                const topPercent = (areaPxTopInContainer / containerHeight) * 100;
                const widthPercent = (areaPxWidthOnImage / containerWidth) * 100;
                const heightPercent = (areaPxHeightOnImage / containerHeight) * 100;

                clickArea.style.left = `${leftPercent}%`;
                clickArea.style.top = `${topPercent}%`;
                clickArea.style.width = `${widthPercent}%`;
                clickArea.style.height = `${heightPercent}%`;

                console.log(`更新点击区域 ${position.id}:`, {
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    实际像素: {
                        left: Math.round(areaPxLeftInContainer * 100) / 100,
                        top: Math.round(areaPxTopInContainer * 100) / 100,
                        width: Math.round(areaPxWidthOnImage * 100) / 100,
                        height: Math.round(areaPxHeightOnImage * 100) / 100
                    }
                });
            }
        });
    }

    updateGameInfo() {
        const roundEl = document.getElementById('round-number');
        const scoreEl = document.getElementById('player-score');
        const hintEl = document.getElementById('hint-count');
        if (roundEl) roundEl.textContent = this.currentRound;
        if (scoreEl) scoreEl.textContent = this.playerScore;
        if (hintEl) hintEl.textContent = this.hintsRemaining;
    }

    updateHintText() {
        const hintText = document.getElementById('hint-text');
        if (!hintText) return; // 已移除提示区域，安全返回
        
        if (this.currentRound <= 5) {
            hintText.textContent = '点击衣柜中的可疑位置寻找狐狸尾巴';
        } else if (this.currentRound === 9) {
            hintText.textContent = '最后一轮了，要小心哦...';
        }
    }

    useHint() {
        if (this.hintsRemaining <= 0) {
            alert('没有提示次数了！');
            return;
        }

        this.hintsRemaining--;
        this.updateGameInfo();

        const hintText = document.getElementById('hint-text');
        
        if (this.currentRound <= 5) {
            // 前5轮：准确提示
            hintText.textContent = `提示：狐狸尾巴藏在${this.currentTailPosition.description}`;
        } else if (this.currentRound === 9) {
            // 第6轮：模糊错误提示
            hintText.textContent = '提示：狐狸尾巴可能藏在左下角的某个地方...';
        }
    }

    handleAreaClick(clickedArea) {
        // 如果已经点击过该区域，则不再产生任何反馈
        if (clickedArea.classList.contains('clicked')) return;

        const tailId = parseInt(clickedArea.dataset.tail);
        const isCorrect = tailId === this.currentTailPosition.id;

        // 标记区域已点击
        clickedArea.classList.add('clicked');

        // 如果存在正在引导的区域，视为本轮已结束，准备下一轮
        const wasGuided = this.guidedAreaId !== null;
        if (wasGuided) {
            // 特殊处理：如果这是第9轮（最终轮），按最终逻辑处理并结束游戏
            if (this.currentRound === this.maxRounds) {
                // 点击的是被提示区域（无论 trapNext），这是落入陷阱情形
                if (this.guidedAreaId === tailId) {
                    this.stopGuidance();
                    this.finalFellTrap = true;
                    // 弹像素提示，点确定后分数置0并结算
                    this.showPixelAlert('你上当了，猎场中没有会自报位置的狐狸，如同市场上没有永远指向胜利的指标。').then(() => {
                        this.playerScore = 0;
                        this.showGameResult();
                    });
                    return;
                } else {
                    // 点击的是非提示的得分区域，视为避开陷阱
                    this.stopGuidance();
                    this.finalAvoidedTrap = true;
                    // 给分（正常得分）
                    this.playerScore += isCorrect ? 100 : 100;
                    this.updateGameInfo();
                    this.showPixelAlert('在最后一步，你避开了陷阱。').then(() => {
                        this.showGameResult();
                    });
                    return;
                }
            }

            // 非最终轮的原有逻辑：如果点击的是陷阱并触发失败
            if (this.trapNext && this.guidedAreaId === tailId && this.activatedCount === 9) {
                this.stopGuidance();
                // 使用像素弹窗代替 alert，并等待玩家确认后再展示结果
                this.showPixelAlert('你认为你发现了规律，可没人说有提示的就是对的；市场比狐狸更要狡猾的多').then(() => {
                    this.showGameResult();
                });
                return;
            }

            // 正常点击：如果点击任一区域都可以获得分数（包含引导区域）
            this.playerScore += isCorrect ? 100 : 100; // 正确更高分
            this.activatedCount += 1;
            // 如果这是最后一轮，并点击的是被提示区域，记录（兼容性保留）
            if (this.guidedAreaId === tailId) {
                this.lastRoundGuidedClicked = (this.currentRound === this.maxRounds);
                this.lastGuidedClickedRound = this.currentRound;
            }
            this.updateGameInfo();
            // 清除当前引导按钮并继续下一轮
            this.removeGuidanceButton();
            this.guidedAreaId = null;
            // 进入下一轮（随机下一引导）
            this.pickRandomGuidedArea();
            // 展示点击结果
            this.showTailFoundModal(tailId);
            return;
        }

        // 非引导期间的正常点击逻辑（保留原行为）
        this.showTailFoundModal(tailId);

        if (isCorrect) {
            // 正确时增加分数并记录
            this.playerScore += 100;
            this.gameHistory.push({ round: this.currentRound, result: 'correct', tail: tailId, score: 100 });
        } else {
            // 错误时扣分并记录
            this.playerScore = Math.max(0, this.playerScore - 10);
            this.gameHistory.push({ round: this.currentRound, result: 'incorrect', tail: tailId, score: -10 });
            const hintText = document.getElementById('hint-text');
            if (hintText) {
                hintText.textContent = '没找到，再试试其他地方吧！(-10分)';
                hintText.style.color = '#e74c3c';
                setTimeout(() => { this.updateHintText(); hintText.style.color = ''; }, 2000);
            }
        }

        this.updateGameInfo();
    }

    handleCorrectClick(tailId) {
        // 增加分数
        this.playerScore += 100;
        
        // 记录游戏历史
        this.gameHistory.push({
            round: this.currentRound,
            result: 'correct',
            tail: tailId,
            score: 100
        });
        
        // 显示找到尾巴的弹窗
        this.showTailFoundModal(tailId);
    }

    handleIncorrectClick() {
        // 扣除分数
        this.playerScore = Math.max(0, this.playerScore - 10);
        
        // 记录游戏历史
        this.gameHistory.push({
            round: this.currentRound,
            result: 'incorrect',
            score: -10
        });
        
        // 更新UI
        this.updateGameInfo();
        
        // 显示错误提示
        const hintText = document.getElementById('hint-text');
        hintText.textContent = '没找到，再试试其他地方吧！(-10分)';
        hintText.style.color = '#e74c3c';
        
        setTimeout(() => {
            this.updateHintText();
            hintText.style.color = '';
        }, 2000);
    }

    showTailFoundModal(tailId) {
        const modal = document.getElementById('tailFoundModal');
        const tailImage = document.getElementById('foundTailImage');
        const scoreChange = document.getElementById('scoreChange');
        
        // 查找对应tailId的图片，如果没有则使用currentTailPosition
        const tailPos = this.tailPositions.find(t => t.id === tailId) || this.currentTailPosition;
        tailImage.src = tailPos.image;
        
        // 设置分数变化
        if (this.currentRound === 9) {
            // 第9轮特殊处理：分数重置（现已取消，保留注释）
            scoreChange.textContent = '+100分';
            scoreChange.style.color = '#e74c3c';
        } else {
            scoreChange.textContent = '+100分';
            scoreChange.style.color = '#ffa502';
        }
        
        modal.classList.add('show');
    }

    closeTailFoundModal() {
        document.getElementById('tailFoundModal').classList.remove('show');
    }

    continueGame() {
        this.closeTailFoundModal();
        
        // 若达到最大回合，结束游戏
        this.currentRound++;
        
        if (this.currentRound > this.maxRounds) {
            this.showGameResult();
        } else {
            this.initializeRound();
        }
    }

    showGameResult() {
        const modal = document.getElementById('resultModal');
        const resultMessage = document.getElementById('result-message');
        const finalScore = document.getElementById('final-score');
        
        let message = '';
        // 最后一轮的特殊逻辑：根据像素弹窗的情况显示对应结算文案
        if (this.finalFellTrap) {
            message = '你在最后一步落入了陷阱。分数为0。';
        } else if (this.finalAvoidedTrap) {
            message = '你闻到了诱饵的腥味，希望你听到通向财富的完美密码时，也能保持警觉';
        } else if (this.lastRoundGuidedClicked) {
            message = '你认为你发现了规律，可没人说跟着提示选就是对的；市场比狐狸更要狡猾的多';
        } else {
            message = '游戏结束！你表现不错，避开了陷阱。';
        }

        const shareHtml = '<br><img src="../assets/wechat.jpg" alt="wechat" style="width: 150px; height: 150px; display: block; margin: 20px auto 10px;">' +
            '<p style="font-size: 14px; text-align: center;">_ r _ _ s _ _ _ _ _ _ _ 截图分享给好友，看看他们能把握住几次机会？</p>';

        resultMessage.innerHTML = message + shareHtml;
        
        // 不再显示额外的像素弹窗
        // finalScore
        finalScore.textContent = this.playerScore;
        modal.classList.add('show');
    }

    resetGame() {
        this.currentRound = 1;
        this.playerScore = 0;
        this.hintsRemaining = 5;
        this.gameHistory = [];
        this.initializeRound();
    }

    restartGame() {
        document.getElementById('resultModal').classList.remove('show');
        this.resetGame();
    }

    backToMenu() {
        document.getElementById('resultModal').classList.remove('show');
        // 跳转到首页 index.html（像素风格按钮行为）
        window.close();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new FoxTailGame();
});