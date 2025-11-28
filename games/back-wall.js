// 游戏状态管理
let currentScreen = 'main';
let userScore = 0;
let treasureStates = {
    mirror: 'normal', // normal, frozen, flipped
    banner: 'normal',
    seal: 'normal'
};
let gameCompleted = false;

// 记忆游戏状态
let memoryGameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    score: 0,
    timeLeft: 60,
    timer: null,
    gameActive: false,
    currentTreasure: null
};

// 法宝数据 - 使用正确的图片路径
const treasures = {
    mirror: {
        name: '天瑜瑶光镜',
        type: 'mirror',
        secret: '三界最大造假法宝，镜光可扭曲现实认知，让观测者看到持有者想让他们看到的"完美假象"；连天庭的"天道功德簿"都能暗中修改，让造假数据被天道认可。'
    },
    banner: {
        name: '瑞穗丰达幡',
        type: 'banner', 
        secret: '三界最大抽屉法宝，将90%精血投入"幽冥新三板"，通过抽屉交易输送给法宝背后之主；凡滴血者皆在三年内暴毙，成全"封神榜名额"。'
    },
    seal: {
        name: '雷煞根源印',
        type: 'seal',
        secret: '心魔根源印，并非掌控雷电，而是专门于九龙"打新"，打新补旧，积累天道怨气为己用，最终必将招致九天神雷反噬，使用者必死无疑，连魂魄都会被雷火焚尽。'
    }
};

// 进入游戏
function enterGame() {
    hideScreen('mainScreen');
    showScreen('storyScreen');
    currentScreen = 'story';
}

// 显示法宝选择界面
function showTreasures() {
    hideScreen('storyScreen');
    showScreen('treasuresScreen');
    currentScreen = 'treasures';
}

// 开始记忆配对游戏
function startMemoryGame() {
    hideScreen('storyScreen');
    hideScreen('treasuresScreen');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    initMemoryGame();
}

// 初始化记忆游戏
function initMemoryGame() {
    memoryGameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        score: 0,
        timeLeft: 60,
        timer: null,
        gameActive: true,
        currentTreasure: null
    };
    
    createMemoryCards();
    updateGameInfo();
    startTimer();
}

// 创建记忆卡片
function createMemoryCards() {
    const container = document.getElementById('memoryCardsContainer');
    container.innerHTML = '';
    
    // 创建卡片数组：A类卡片各2张，B类卡片6张（3对）
    const cardTypes = [
        { type: 'mirror', name: '天瑜瑶光镜', class: 'A' },
        { type: 'mirror', name: '天瑜瑶光镜', class: 'A' },
        { type: 'banner', name: '瑞穗丰达幡', class: 'A' },
        { type: 'banner', name: '瑞穗丰达幡', class: 'A' },
        { type: 'seal', name: '雷煞根源印', class: 'A' },
        { type: 'seal', name: '雷煞根源印', class: 'A' },
        { type: 'ordinary', name: '平平无奇的法宝', class: 'B' },
        { type: 'ordinary', name: '平平无奇的法宝', class: 'B' },
        { type: 'ordinary', name: '平平无奇的法宝', class: 'B' },
        { type: 'ordinary', name: '平平无奇的法宝', class: 'B' },
        { type: 'ordinary', name: '平平无奇的法宝', class: 'B' },
        { type: 'ordinary', name: '平平无奇的法宝', class: 'B' }
    ];
    
    // 打乱卡片顺序
    shuffleArray(cardTypes);
    
    // 创建卡片元素
    cardTypes.forEach((cardData, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.type = cardData.type;
        card.dataset.class = cardData.class;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-back">
                    <div class="card-back-content"></div>
                </div>
                <div class="card-front ${cardData.type}-front">
                    <div class="card-front-content">${cardData.name}</div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        container.appendChild(card);
        
        memoryGameState.cards.push({
            element: card,
            type: cardData.type,
            class: cardData.class,
            name: cardData.name,
            isFlipped: false,
            isMatched: false
        });
    });
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 翻卡
function flipCard(cardElement) {
    if (!memoryGameState.gameActive) return;
    
    const cardIndex = parseInt(cardElement.dataset.index);
    const card = memoryGameState.cards[cardIndex];
    
    // 如果卡片已翻开或已匹配，不能再翻
    if (card.isFlipped || card.isMatched) return;
    
    // 如果已经翻开了两张卡片，不能再翻
    if (memoryGameState.flippedCards.length >= 2) return;
    
    // 翻开卡片
    card.isFlipped = true;
    cardElement.classList.add('flipped');
    memoryGameState.flippedCards.push(card);
    
    // 如果翻开了两张卡片，检查匹配
    if (memoryGameState.flippedCards.length === 2) {
        memoryGameState.moves++;
        updateGameInfo();
        
        setTimeout(() => {
            checkCardMatch();
        }, 1000);
    }
}

// 检查卡片匹配
function checkCardMatch() {
    const [card1, card2] = memoryGameState.flippedCards;
    
    // 如果翻出任何B类卡片，两张卡片都翻回背面
    if (card1.class === 'B' || card2.class === 'B') {
        flipCardsBack();
        memoryGameState.flippedCards = [];
        return;
    }
    
    // 如果两张都是A类卡片且类型相同
    if (card1.class === 'A' && card2.class === 'A' && card1.type === card2.type) {
        // 配对成功
        card1.isMatched = true;
        card2.isMatched = true;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        memoryGameState.matchedPairs++;
        // 移除自动得分，只有选择"不夺取"才得分
        
        // 暂停游戏时间
        stopTimer();
        
        // 显示像素风宝箱
        showTreasureChest(card1.type);
        
        // 检查游戏是否完成（所有A类卡片都配对完成）
        if (memoryGameState.matchedPairs === 3) {
            // 不自动胜利，等待用户选择
        }
    } else {
        // 配对失败，翻回背面
        flipCardsBack();
    }
    
    // 清空已翻开的卡片
    memoryGameState.flippedCards = [];
}

// 显示像素风宝箱
function showTreasureChest(treasureType) {
    const treasure = treasures[treasureType];
    
    // 创建宝箱遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'treasure-chest-overlay';
    overlay.id = 'treasureChestOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // 创建宝箱容器
    const container = document.createElement('div');
    container.className = 'treasure-chest-container';
    container.style.cssText = `
        background: linear-gradient(135deg, #2c1810, #4a2c1a);
        border: 4px solid #ffd700;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    container.innerHTML = `
        <div class="pixel-chest" style="
            width: 120px;
            height: 100px;
            margin: 0 auto 1rem;
            background: linear-gradient(135deg, #8B4513, #A0522D);
            border: 3px solid #DAA520;
            border-radius: 8px;
            position: relative;
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
        ">
            <div style="
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: 30px;
                height: 15px;
                background: #FFD700;
                border-radius: 3px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            "></div>
            <div style="
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: 20px;
                height: 20px;
                background: #DAA520;
                border-radius: 50%;
                border: 2px solid #FFD700;
            "></div>
        </div>
        <div class="chest-treasure-name" style="
            font-size: 1.5rem;
            color: #ffd700;
            margin-bottom: 1rem;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            font-family: 'Press Start 2P', 'Zpix', cursive;
        ">${treasure.name}</div>
        <div style="
            color: #f0f0f0;
            margin-bottom: 1.5rem;
            font-size: 1rem;
            line-height: 1.4;
        ">发现了一件神秘法宝！</div>
        <button class="chest-detail-btn" onclick="enterTreasureDetailFromChest('${treasureType}')" style="
            padding: 12px 24px;
            background: linear-gradient(135deg, #ffd700, #daa520);
            color: #000;
            border: 2px solid #000;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Press Start 2P', 'Zpix', cursive;
            font-size: 12px;
            font-weight: bold;
            transition: all 0.2s ease;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0, 0, 0, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.3)'">
            点击了解法宝详情
        </button>
    `;
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // 显示动画
    setTimeout(() => {
        overlay.style.opacity = '1';
        container.style.transform = 'scale(1)';
    }, 10);
    
    // 点击遮罩层关闭（可选）
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeTreasureChest();
            // 恢复游戏
            if (memoryGameState.gameActive && memoryGameState.timeLeft > 0) {
                startTimer();
            }
        }
    });
}

// 翻回卡片
function flipCardsBack() {
    memoryGameState.flippedCards.forEach(card => {
        card.isFlipped = false;
        card.element.classList.remove('flipped');
    });
}

// 从宝箱进入法宝详情
function enterTreasureDetailFromChest(treasureType) {
    // 关闭宝箱
    closeTreasureChest();
    
    // 设置当前法宝
    memoryGameState.currentTreasure = treasureType;
    const treasure = treasures[treasureType];
    
    // 显示法宝的明面介绍（不是秘密）
    document.getElementById('gameTreasureName').textContent = treasure.name;
    
    // 根据法宝类型显示明面介绍
    let treasureIntro = '';
    switch(treasureType) {
        case 'mirror':
            treasureIntro = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../assets/images/cards/yuyao2.jpg" alt="天瑜瑶光镜" class="treasure-img" onclick="enlargeImageGallery(this, 'mirror')" style="max-width: 150px; max-height: 120px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/yuyao3.jpg" alt="天瑜瑶光镜" class="treasure-img" onclick="enlargeImageGallery(this, 'mirror')" style="max-width: 150px; max-height: 120px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">

                    </div>
                    <div class="treasure-description">
                        <h3>仙界第一净光宝镜</h3>
                        <p>连续千年位列"天庭法宝评比榜"净光类第一名，镜光纯净度远超同类。</p>
                        <p>在"纣商降魔功绩榜"上，镇压妖邪数量、效率双冠，被各路仙家奉为"正道之光"。</p>
                    </div>
                    <div class="treasure-choices" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                        <button class="choice-btn grab-btn" onclick="grabTreasureFromMemoryGame('${treasureType}')" style="
                            padding: 12px 20px;
                            background-color: #ff4500;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff4500;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff4500';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff4500';
                        ">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerTreasureFromMemoryGame()" style="
                            padding: 12px 20px;
                            background-color: #8a2be2;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #8a2be2;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#8a2be2';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #8a2be2';
                        ">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasureFromMemoryGame('${treasureType}')" style="
                            padding: 12px 20px;
                            background-color: #ff8c42;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff8c42;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff8c42';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff8c42';
                        ">3. 不夺取</button>
                    </div>
                </div>
            `;
            break;
        case 'banner':
            treasureIntro = `
                <div class="treasure-detail-content">
                    <div class="treasure-images" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                        <img src="../assets/images/cards/ruifengda1.jpg" alt="瑞穗丰达幡" class="treasure-img" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/ruifengda3.jpg" alt="瑞穗丰达幡" class="treasure-img" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/ruifengda4.jpg" alt="瑞穗丰达幡" class="treasure-img" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/ruifengda5.jpg" alt="瑞穗丰达幡" class="treasure-img" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/ruifengda6.jpg" alt="瑞穗丰达幡" class="treasure-img" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                    <div class="treasure-description">
                        <h3>玄门保本圣幡</h3>
                        <p>在幡面歃血为盟，幡面金穗纹可自动生成"功德护盾"，受攻击时发出"北蔡之光"，号称"万劫不破"。</p>
                        <p>使用者投入的精血永远不被消耗，且每滴入100cc精血，每年返还13cc。</p>
                    </div>
                    <div class="treasure-choices" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                        <button class="choice-btn grab-btn" onclick="grabTreasureFromMemoryGame('${treasureType}')" style="
                            padding: 12px 20px;
                            background-color: #ff4500;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff4500;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff4500';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff4500';
                        ">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerTreasureFromMemoryGame()" style="
                            padding: 12px 20px;
                            background-color: #8a2be2;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #8a2be2;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#8a2be2';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #8a2be2';
                        ">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasureFromMemoryGame('${treasureType}')" style="
                            padding: 12px 20px;
                            background-color: #ff8c42;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff8c42;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff8c42';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff8c42';
                        ">3. 不夺取</button>
                    </div>
                </div>
            `;
            break;
        case 'seal':
            treasureIntro = `
                <div class="treasure-detail-content">
                    <div class="treasure-images" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                        <img src="../assets/images/cards/lei1.jpg" alt="雷煞根源印" class="treasure-img" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/lei2.jpg" alt="雷煞根源印" class="treasure-img" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/lei3.jpg" alt="雷煞根源印" class="treasure-img" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/lei4.jpg" alt="雷煞根源印" class="treasure-img" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="../assets/images/cards/lei5.jpg" alt="雷煞根源印" class="treasure-img" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                    <div class="treasure-description">
                        <h3>天庭雷部至宝</h3>
                        <p>根源护持：使用者可借天道雷力护体，号称"万劫不破"，签订"雷劫回购协议"——若印主受损，天庭必以雷部真灵补偿。</p>
                        <p>获奖无数：荣获获奖最多奖，连续千年位列"三界降魔功绩榜"榜首，王安石年年为其颁发"紫霄降魔金印奖"。</p>
                        <p>背景雄厚：由雷部二十四天君联名担保，闻仲亲笔题写"天道保本"。每逢劫难，必得玉虚宫、天庭双重加持，号称"雷煞根源印，永远不暴雷"！</p>
                    </div>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasureFromMemoryGame('${treasureType}')" style="
                            padding: 12px 20px;
                            background-color: #ff4500;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff4500;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff4500';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff4500';
                        ">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerTreasureFromMemoryGame()" style="
                            padding: 12px 20px;
                            background-color: #8a2be2;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #8a2be2;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#8a2be2';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #8a2be2';
                        ">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasureFromMemoryGame('${treasureType}')" style="
                            padding: 12px 20px;
                            background-color: #ff8c42;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff8c42;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff8c42';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff8c42';
                        ">3. 不夺取</button>
                    </div>
                </div>
            `;
            break;
    }
    
    document.getElementById('gameTreasureInfo').innerHTML = treasureIntro;
    
    hideScreen('memoryGameScreen');
    showScreen('gameTreasureDetail');
    currentScreen = 'gameTreasureDetail';
}

// 关闭宝箱
function closeTreasureChest() {
    const overlay = document.getElementById('treasureChestOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        const container = overlay.querySelector('.treasure-chest-container');
        if (container) {
            container.style.transform = 'scale(0.8)';
        }
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }
}

// 从记忆游戏中夺取法宝
function grabTreasureFromMemoryGame(treasureType) {
    const treasure = treasures[treasureType];
    
    document.getElementById('failureMessage').innerHTML = `
        <div class="failure-treasure">
            <h3>${treasure.name}</h3>
            <div class="treasure-dark-secret">
                <p>${treasure.secret}</p>
            </div>
            <p class="failure-text">你选择了夺取法宝，但法宝的黑暗秘密将你吞噬...</p>
        </div>
    `;
    
    hideScreen('gameTreasureDetail');
    showScreen('gameFailureScreen');
    currentScreen = 'gameFailure';
    stopTimer();
}

// 从记忆游戏中再考虑考虑
function considerTreasureFromMemoryGame() {
    const treasureType = memoryGameState.currentTreasure;
    
    // 不得分，返回游戏，继续计时
    hideScreen('gameTreasureDetail');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    
    // 重要：让这对法宝卡片重新变为可点击状态
    // 找到对应类型的已匹配卡片，移除matched状态，但保持翻开状态
    memoryGameState.cards.forEach(card => {
        if (card.type === treasureType && card.class === 'A' && card.isMatched) {
            card.isMatched = false; // 移除匹配状态，允许再次点击
            card.element.classList.remove('matched');
            card.element.classList.add('clickable'); // 添加可点击样式
            
            // 重新添加点击事件处理器
            const newCard = card.element.cloneNode(true);
            card.element.parentNode.replaceChild(newCard, card.element);
            card.element = newCard;
            
            // 添加点击事件，让玩家可以再次进入详情页面
            newCard.addEventListener('click', () => {
                if (memoryGameState.gameActive) {
                    // 暂停游戏时间
                    stopTimer();
                    // 直接进入法宝详情页面
                    enterTreasureDetailFromChest(treasureType);
                }
            });
        }
    });
    
    // 恢复计时器
    if (memoryGameState.gameActive && memoryGameState.timeLeft > 0) {
        startTimer();
    }
}

// 从记忆游戏中不夺取法宝
function refuseTreasureFromMemoryGame(treasureType) {
    // 得一分，返回游戏，继续计时
    memoryGameState.score += 1;
    updateGameInfo();
    
    // 记录拒绝的法宝
    if (!window.refusedTreasures) {
        window.refusedTreasures = [];
    }
    if (!window.refusedTreasures.includes(treasureType)) {
        window.refusedTreasures.push(treasureType);
    }
    
    hideScreen('gameTreasureDetail');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    
    // 检查是否获得三分，游戏胜利
    console.log('当前得分:', memoryGameState.score);
    if (memoryGameState.score >= 3) {
        console.log('达到3分，准备显示真实胜利界面');
        // 得分为3意味着拒绝了所有三个法宝，直接显示真实胜利
        clearInterval(memoryGameState.timer);
        memoryGameState.gameActive = false;
        setTimeout(() => {
            console.log('调用showTrueVictory函数');
            showTrueVictory();
        }, 500);
        return;
    }
    
    // 恢复计时器
    if (memoryGameState.gameActive && memoryGameState.timeLeft > 0) {
        startTimer();
    }
}

// 记忆游戏胜利
function memoryGameWin() {
    memoryGameState.gameActive = false;
    stopTimer();
    
    // 检查是否所有三个法宝都被拒绝
    if (window.refusedTreasures && window.refusedTreasures.length === 3) {
        // 显示真正的胜利界面
        showTrueVictory();
    } else {
        // 显示普通胜利消息
        const winOverlay = document.createElement('div');
        winOverlay.className = 'result-overlay';
        winOverlay.innerHTML = `
            <div class="result-content">
                <h2>🌟 智慧胜利！</h2>
                <p>你成功看穿了法宝的真相，拒绝了它们的诱惑！</p>
                <p>你的智慧将指引你走向真正的大道！</p>
                <button class="result-btn" onclick="closeWinOverlay()">继续游戏</button>
            </div>
        `;
        
        document.body.appendChild(winOverlay);
        
        setTimeout(() => {
            winOverlay.classList.add('show');
        }, 10);
    }
}

// 关闭胜利弹窗
function closeWinOverlay() {
    const overlay = document.querySelector('.result-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 返回记忆游戏
function backToMemoryGame() {
    hideScreen('gameTreasureDetail');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    
    // 如果游戏还在进行中且匹配对数少于3，恢复计时器
    if (memoryGameState.gameActive && memoryGameState.matchedPairs < 3 && memoryGameState.timeLeft > 0) {
        startTimer();
    }
}

// 重新开始记忆游戏
function restartMemoryGame() {
    if (currentScreen === 'gameFailure') {
        hideScreen('gameFailureScreen');
        showScreen('memoryGameScreen');
        currentScreen = 'memoryGame';
    }
    initMemoryGame();
}

// 退出记忆游戏
function exitMemoryGame() {
    hideScreen('memoryGameScreen');
    hideScreen('gameTreasureDetail');
    hideScreen('gameFailureScreen');
    showScreen('treasuresScreen');
    currentScreen = 'treasures';
    resetGame();
}

// 开始计时器
function startTimer() {
    memoryGameState.timer = setInterval(() => {
        memoryGameState.timeLeft--;
        updateGameInfo();
        
        if (memoryGameState.timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
}

// 停止计时器
function stopTimer() {
    if (memoryGameState.timer) {
        clearInterval(memoryGameState.timer);
        memoryGameState.timer = null;
    }
}

// 更新游戏信息
function updateGameInfo() {
    document.getElementById('gameScore').textContent = memoryGameState.score;
    document.getElementById('gameMoves').textContent = memoryGameState.moves;
    document.getElementById('gameTimer').textContent = memoryGameState.timeLeft;
}

// 游戏结束
function gameOver() {
    memoryGameState.gameActive = false;
    stopTimer();
    alert('时间到！游戏结束！');
}

// 重置游戏
function resetGame() {
    stopTimer();
    memoryGameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        score: 0,
        timeLeft: 60,
        timer: null,
        gameActive: false,
        currentTreasure: null
    };
}

// 选择法宝
function selectTreasure(treasureType) {
    hideScreen('treasuresScreen');
    showScreen('treasureDetail');
    currentScreen = 'detail';
    
    // 显示法宝详细信息
    showTreasureDetail(treasureType);
}

// 显示法宝详细信息
function showTreasureDetail(treasureType) {
    const nameElement = document.getElementById('treasureName');
    const infoElement = document.getElementById('treasureInfo');
    
    switch(treasureType) {
        case 'mirror':
            nameElement.textContent = '天瑜瑶光镜';
            infoElement.innerHTML = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../assets/images/cards/yuyao2.jpg" alt="天瑜瑶光镜" class="treasure-img" data-treasure="mirror" onclick="enlargeImageGallery(this, 'mirror')" style="max-width: 150px; max-height: 120px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/yuyao3.jpg" alt="天瑜瑶光镜" class="treasure-img" data-treasure="mirror" onclick="enlargeImageGallery(this, 'mirror')" style="max-width: 150px; max-height: 120px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/yuyao3.jpg" alt="天瑜瑶光镜" class="treasure-img" data-treasure="mirror" onclick="enlargeImageGallery(this, 'mirror')" style="max-width: 150px; max-height: 120px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                    </div>
                    <div class="treasure-description">
                        <h3>仙界第一净光宝镜</h3>
                        <p>连续千年位列"天庭法宝评比榜"净光类第一名，镜光纯净度远超同类。</p>
                        <p>在"纣商降魔功绩榜"上，镇压妖邪数量、效率双冠，被各路仙家奉为"正道之光"。</p>
                    </div>
                    <div class="treasure-choices" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                        <button class="choice-btn grab-btn" onclick="grabTreasure('mirror')" style="
                            padding: 12px 20px;
                            background-color: #ff4500;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff4500;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff4500';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff4500';
                        ">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerAgain()" style="
                            padding: 12px 20px;
                            background-color: #8a2be2;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #8a2be2;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#8a2be2';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #8a2be2';
                        ">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasure('mirror')" style="
                            padding: 12px 20px;
                            background-color: #ff8c42;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff8c42;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff8c42';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff8c42';
                        ">3. 不夺取</button>
                    </div>
                </div>
            `;
            break;
        case 'banner':
            nameElement.textContent = '瑞穗丰达幡';
            infoElement.innerHTML = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../assets/images/cards/ruifengda1.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda3.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda4.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda5.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda6.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda3.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda4.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda5.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/ruifengda6.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImageGallery(this, 'banner')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                    </div>
                    <div class="treasure-description">
                        <h3>玄门保本圣幡</h3>
                        <p>在幡面歃血为盟，幡面金穗纹可自动生成"功德护盾"，受攻击时发出"北蔡之光"，号称"万劫不破"。</p>
                        <p>使用者投入的精血永远不被消耗，且每滴入100cc精血，每年返还13cc。</p>
                    </div>
                    <div class="treasure-choices" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                        <button class="choice-btn grab-btn" onclick="grabTreasure('banner')" style="
                            padding: 12px 20px;
                            background-color: #ff4500;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff4500;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff4500';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff4500';
                        ">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerAgain()" style="
                            padding: 12px 20px;
                            background-color: #8a2be2;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #8a2be2;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#8a2be2';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #8a2be2';
                        ">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasure('banner')" style="
                            padding: 12px 20px;
                            background-color: #ff8c42;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff8c42;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff8c42';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff8c42';
                        ">3. 不夺取</button>
                    </div>
                </div>
            `;
            break;
        case 'seal':
            nameElement.textContent = '雷煞根源印';
            infoElement.innerHTML = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../assets/images/cards/lei1.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei2.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei3.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei4.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei5.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei2.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei3.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei4.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                        <img src="../assets/images/cards/lei5.jpg" alt="雷煞根源印" class="treasure-img" data-treasure="seal" onclick="enlargeImageGallery(this, 'seal')" style="max-width: 120px; max-height: 100px; object-fit: contain; margin: 5px; border: 2px solid #ffd700; border-radius: 4px; cursor: pointer;">
                    </div>
                    <h3>天庭雷部至宝</h3>
                    <p>根源护持​：使用者可借天道雷力护体，号称"万劫不破"，签订​"雷劫回购协议"​——若印主受损，天庭必以雷部真灵补偿。</p>
                    <p>获奖无数：荣获获奖最多奖，连续千年位列"三界降魔功绩榜"榜首，王安石年年为其颁发"紫霄降魔金印奖"。</p>
                    <p>背景雄厚​：由雷部二十四天君联名担保，​闻仲亲笔题写"天道保本"​。每逢劫难，必得玉虚宫、天庭双重加持，号称" 雷煞根源印 ，永远不暴雷"！</p>
                    <div class="treasure-choices" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                        <button class="choice-btn grab-btn" onclick="grabTreasure('seal')" style="
                            padding: 12px 20px;
                            background-color: #ff4500;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff4500;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff4500';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff4500';
                        ">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerAgain()" style="
                            padding: 12px 20px;
                            background-color: #8a2be2;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #8a2be2;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#8a2be2';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #8a2be2';
                        ">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasure('seal')" style="
                            padding: 12px 20px;
                            background-color: #ff8c42;
                            color: white;
                            border: 4px solid #000;
                            cursor: pointer;
                            font-family: 'Press Start 2P', 'Zpix', cursive;
                            font-size: 12px;
                            transition: all 0.2s steps(2);
                            margin: 5px 0;
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 0 8px #ff8c42;
                            text-shadow: 0 0 5px #fff;
                            text-align: left;
                        " onmouseover="
                            this.style.backgroundColor='#00ffff';
                            this.style.transform='translateY(-2px)';
                            this.style.boxShadow='0 0 15px #00ffff';
                        " onmouseout="
                            this.style.backgroundColor='#ff8c42';
                            this.style.transform='translateY(0)';
                            this.style.boxShadow='0 0 8px #ff8c42';
                        ">3. 不夺取</button>
                    </div>
                </div>
            `;
            break;
    }
}

// 夺取法宝
function grabTreasure(treasureType) {
    treasureStates[treasureType] = 'frozen';
    userScore += 0;
    console.log(`用户选择夺取${treasureType}，得分：`, userScore);
    backToTreasures();
    updateTreasureCards();
}

// 再考虑考虑
function considerAgain() {
    backToTreasures();
}

// 不夺取法宝
function refuseTreasure(treasureType) {
    treasureStates[treasureType] = 'flipped';
    userScore += 1;
    console.log(`用户选择不夺取${treasureType}，得分：`, userScore);
    
    // 记录拒绝的法宝
    if (!window.refusedTreasures) {
        window.refusedTreasures = [];
    }
    if (!window.refusedTreasures.includes(treasureType)) {
        window.refusedTreasures.push(treasureType);
    }
    
    backToTreasures();
    updateTreasureCards();
}

// 返回法宝选择界面
function backToTreasures() {
    hideScreen('treasureDetail');
    showScreen('treasuresScreen');
    currentScreen = 'treasures';
    
    // 检查是否所有法宝都已经选择完毕
    checkGameCompletion();
}

// 更新法宝卡片状态
function updateTreasureCards() {
    // 更新镜子卡片
    updateTreasureCard('mirror');
    
    // 更新幡卡片
    updateTreasureCard('banner');
    
    // 更新印卡片
    updateTreasureCard('seal');
}

// 更新单个法宝卡片
function updateTreasureCard(treasureType) {
    const card = document.querySelector(`.treasure-card[onclick="selectTreasure('${treasureType}')"]`);
    if (!card) return;
    
    if (treasureStates[treasureType] === 'frozen') {
        card.classList.add('frozen');
        card.onclick = null;
    } else if (treasureStates[treasureType] === 'flipped') {
        card.classList.add('flipped');
        
        // 更新卡片内容
        const cardImage = card.querySelector('.card-image');
        const cardTitle = card.querySelector('h3');
        const cardDesc = card.querySelector('.card-desc');
        
        if (treasureType === 'mirror') {
            cardImage.style.background = 'radial-gradient(circle, #8b0000, #4b0000)';
            cardTitle.textContent = '三界最大造假法宝';
            cardDesc.innerHTML = `
                <p>镜光可扭曲现实认知，让观测者看到持有者想让他们看到的"完美假象"；</p>
                <p>连天庭的"天道功德簿"都能暗中修改，让造假数据被天道认可；</p>
            `;
        } else if (treasureType === 'banner') {
            cardImage.style.background = 'radial-gradient(circle, #8b0000, #4b0000)';
            cardTitle.textContent = '三界最大抽屉法宝';
            cardDesc.innerHTML = `
                <p>将90%精血投入"幽冥新三板"，通过抽屉交易输送给法宝背后之主；</p>
                <p>凡滴血者皆在三年内暴毙，成全"封神榜名额"。</p>
            `;
        } else if (treasureType === 'seal') {
            cardImage.style.background = 'radial-gradient(circle, #8b0000, #4b0000)';
            cardTitle.textContent = '心魔根源印';
            cardDesc.innerHTML = `
                <p>表面上是雷霆之力，实则是激发使用者心魔的邪印；</p>
                <p>每次使用都会让心魔壮大，最终吞噬使用者的神智；</p>
            `;
        }
    }
}

// 检查游戏是否完成
function checkGameCompletion() {
    // 检查是否所有法宝都已经做出选择
    const allDecided = Object.values(treasureStates).every(state => state !== 'normal');
    
    if (allDecided && !gameCompleted) {
        gameCompleted = true;
        
        // 检查是否所有三个法宝都被拒绝
        if (window.refusedTreasures && window.refusedTreasures.length === 3) {
            // 显示真正的胜利界面
            setTimeout(() => {
                showTrueVictory();
            }, 500);
        } else {
            // 显示普通结果
            setTimeout(() => {
                showGameResult();
            }, 500);
        }
    }
}

// 显示游戏结果
function showGameResult() {
    // 创建结果弹窗
    const resultOverlay = document.createElement('div');
    resultOverlay.className = 'result-overlay';
    
    const resultContent = document.createElement('div');
    resultContent.className = 'result-content';
    
    // 根据得分显示不同结果
    let resultTitle, resultMessage;
    
    if (userScore === 3) {
        resultTitle = '🌟 明智之选！';
        resultMessage = '你看穿了三件法宝的真相，拒绝了它们的诱惑。你的智慧将指引你走向真正的大道！';
    } else if (userScore >= 1) {
        resultTitle = '⚠️ 部分觉醒';
        resultMessage = `你看穿了${userScore}件法宝的真相，但也被其他法宝所迷惑。继续修行，提高警惕！`;
    } else {
        resultTitle = '❌ 完全迷失';
        resultMessage = '你被所有法宝的表象所迷惑，贪婪蒙蔽了你的双眼。这些法宝终将成为你的枷锁！';
    }
    
    resultContent.innerHTML = `
        <h2>${resultTitle}</h2>
        <p>${resultMessage}</p>
        <button class="result-btn" onclick="completeGame()">完成挑战</button>
    `;
    
    resultOverlay.appendChild(resultContent);
    document.body.appendChild(resultOverlay);
    
    // 添加动画效果
    setTimeout(() => {
        resultOverlay.classList.add('show');
    }, 10);
}

// 完成游戏
function completeGame() {
    // 向父窗口发送消息，表示已完成法宝争夺战
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'backWallCompleted' }, '*');
    }
    
    // 关闭当前窗口
    alert('恭喜你完成了法宝争夺战！');
    window.close();
}

// 显示界面
function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

// 隐藏界面
function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('hidden');
    }
}

// 图片画廊数据
const treasureImageGalleries = {
    mirror: [
        { src: '../assets/images/cards/yuyao2.jpg', alt: '天瑜瑶光镜 - 图1' },
        { src: '../assets/images/cards/yuyao3.jpg', alt: '天瑜瑶光镜 - 图2' }
    ],
    banner: [
        { src: '../assets/images/cards/ruifengda1.jpg', alt: '瑞穗丰达幡 - 图1' },
        { src: '../assets/images/cards/ruifengda3.jpg', alt: '瑞穗丰达幡 - 图2' },
        { src: '../assets/images/cards/ruifengda4.jpg', alt: '瑞穗丰达幡 - 图3' },
        { src: '../assets/images/cards/ruifengda5.jpg', alt: '瑞穗丰达幡 - 图4' },
        { src: '../assets/images/cards/ruifengda6.jpg', alt: '瑞穗丰达幡 - 图5' }
    ],
    seal: [
        { src: '../assets/images/cards/lei1.jpg', alt: '雷煞根源印 - 图1' },
        { src: '../assets/images/cards/lei2.jpg', alt: '雷煞根源印 - 图2' },
        { src: '../assets/images/cards/lei3.jpg', alt: '雷煞根源印 - 图3' },
        { src: '../assets/images/cards/lei4.jpg', alt: '雷煞根源印 - 图4' },
        { src: '../assets/images/cards/lei5.jpg', alt: '雷煞根源印 - 图5' }
    ]
};

let currentGallery = null;
let currentImageIndex = 0;

// 图片画廊放大功能
function enlargeImageGallery(img, treasureType) {
    const gallery = treasureImageGalleries[treasureType];
    if (!gallery) return;
    
    // 找到当前图片在画廊中的索引
    currentImageIndex = gallery.findIndex(item => item.src === img.src);
    if (currentImageIndex === -1) currentImageIndex = 0;
    
    currentGallery = gallery;
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'image-gallery-overlay';
    overlay.id = 'imageGalleryOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // 创建图片容器
    const imageContainer = document.createElement('div');
    imageContainer.className = 'gallery-image-container';
    imageContainer.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // 创建放大的图片
    const enlargedImg = document.createElement('img');
    enlargedImg.className = 'gallery-enlarged-image';
    enlargedImg.id = 'galleryEnlargedImage';
    enlargedImg.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        transition: opacity 0.3s ease;
    `;
    
    // 创建左右切换按钮
    const prevBtn = document.createElement('div');
    prevBtn.className = 'gallery-nav-btn gallery-prev-btn';
    prevBtn.innerHTML = '‹';
    prevBtn.style.cssText = `
        position: absolute;
        left: -60px;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: rgba(255, 215, 0, 0.8);
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
    `;
    prevBtn.onclick = () => navigateGallery(-1);
    
    const nextBtn = document.createElement('div');
    nextBtn.className = 'gallery-nav-btn gallery-next-btn';
    nextBtn.innerHTML = '›';
    nextBtn.style.cssText = `
        position: absolute;
        right: -60px;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: rgba(255, 215, 0, 0.8);
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
    `;
    nextBtn.onclick = () => navigateGallery(1);
    
    // 创建关闭按钮
    const closeBtn = document.createElement('div');
    closeBtn.className = 'gallery-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: -60px;
        right: -60px;
        width: 50px;
        height: 50px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
    `;
    closeBtn.onclick = closeImageGallery;
    
    // 创建图片计数器
    const counter = document.createElement('div');
    counter.className = 'gallery-counter';
    counter.id = 'galleryCounter';
    counter.style.cssText = `
        position: absolute;
        bottom: -50px;
        left: 50%;
        transform: translateX(-50%);
        color: #ffd700;
        font-family: 'Press Start 2P', 'Zpix', cursive;
        font-size: 14px;
        text-shadow: 2px 2px 0px #000;
    `;
    
    // 组装元素
    imageContainer.appendChild(enlargedImg);
    imageContainer.appendChild(prevBtn);
    imageContainer.appendChild(nextBtn);
    imageContainer.appendChild(closeBtn);
    imageContainer.appendChild(counter);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);
    
    // 显示当前图片
    updateGalleryImage();
    
    // 添加动画效果
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeImageGallery();
        }
    });
}

// 更新画廊图片
function updateGalleryImage() {
    const img = document.getElementById('galleryEnlargedImage');
    const counter = document.getElementById('galleryCounter');
    
    if (img && counter && currentGallery) {
        const currentImage = currentGallery[currentImageIndex];
        img.src = currentImage.src;
        img.alt = currentImage.alt;
        counter.textContent = `${currentImageIndex + 1} / ${currentGallery.length}`;
    }
}

// 画廊导航
function navigateGallery(direction) {
    if (!currentGallery) return;
    
    currentImageIndex += direction;
    
    // 循环导航
    if (currentImageIndex < 0) {
        currentImageIndex = currentGallery.length - 1;
    } else if (currentImageIndex >= currentGallery.length) {
        currentImageIndex = 0;
    }
    
    updateGalleryImage();
}

// 关闭图片画廊
function closeImageGallery() {
    const overlay = document.getElementById('imageGalleryOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }
    currentGallery = null;
    currentImageIndex = 0;
}

// 图片放大功能（保留兼容性）
function enlargeImage(img) {
    // 尝试从图片的data-treasure属性获取类型
    const treasureType = img.getAttribute('data-treasure');
    if (treasureType) {
        enlargeImageGallery(img, treasureType);
        return;
    }
    
    // 如果没有treasure类型，使用原来的单图片放大功能
    enlargeImageGallery(img, 'mirror'); // 默认使用mirror类型
}

// 关闭放大图片
function closeEnlargedImage() {
    const overlay = document.getElementById('imageOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 添加键盘事件监听
document.addEventListener('keydown', function(event) {
    // 检查是否有图片画廊打开
    const galleryOverlay = document.getElementById('imageGalleryOverlay');
    if (galleryOverlay) {
        if (event.key === 'Escape') {
            closeImageGallery();
            return;
        }
        if (event.key === 'ArrowLeft') {
            navigateGallery(-1);
            return;
        }
        if (event.key === 'ArrowRight') {
            navigateGallery(1);
            return;
        }
        return; // 在图片画廊状态下，不处理其他键盘事件
    }
    
    // 检查是否有放大的图片（兼容旧版本）
    const overlay = document.querySelector('.image-overlay');
    if (overlay) {
        if (event.key === 'Escape') {
            closeEnlargedImage();
            return;
        }
        return; // 在图片放大状态下，不处理其他键盘事件
    }
    
    if (event.key === 'Escape') {
        // ESC键返回上一级
        switch(currentScreen) {
            case 'story':
                hideScreen('storyScreen');
                showScreen('mainScreen');
                currentScreen = 'main';
                break;
            case 'treasures':
                backToStory();
                break;
            case 'detail':
                backToTreasures();
                break;
            case 'memoryGame':
                exitMemoryGame();
                break;
            case 'gameTreasureDetail':
                backToMemoryGame();
                break;
            case 'gameFailure':
                exitMemoryGame();
                break;
        }
    }
});

// 返回故事界面
function backToStory() {
    hideScreen('treasuresScreen');
    showScreen('storyScreen');
    currentScreen = 'story';
}

// 显示真实胜利界面（所有法宝都拒绝夺取）
function showTrueVictory() {
    console.log('showTrueVictory函数被调用');
    hideScreen('memoryGameScreen');
    
    // 创建真实胜利界面
    const trueVictoryScreen = document.createElement('div');
    trueVictoryScreen.id = 'trueVictoryScreen';
    trueVictoryScreen.className = 'screen';
    trueVictoryScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
        color: white;
        font-family: 'Press Start 2P', 'Zpix', cursive;
        overflow-y: auto;
        z-index: 1000;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    trueVictoryScreen.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffd700; font-size: 24px; margin-bottom: 20px; text-shadow: 0 0 10px #ffd700;">
                🎉 真正的胜利 🎉
            </h1>
            <p style="font-size: 14px; color: #00ffff; margin-bottom: 30px;">
                恭喜！你选择了智慧而非贪婪，获得了三大法宝的真实奥秘！
            </p>
        </div>
        
        <div style="max-width: 800px; margin: 0 auto;">
            <!-- 天瑜瑶光镜真实介绍 -->
            <div style="background: rgba(0,0,0,0.7); border: 3px solid #ffd700; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <h2 style="color: #ffd700; font-size: 16px; margin-bottom: 15px; text-align: center;">
                    天瑜瑶光镜 - 真实奥秘
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; justify-content: center;">
                    <img src="../assets/images/cards/yuyao2.jpg" alt="天瑜瑶光镜" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/yuyao3.jpg" alt="天瑜瑶光镜" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                </div>
                <p style="font-size: 12px; line-height: 1.6; color: #e0e0e0;">
                    三界最大造假法宝，镜光可扭曲现实认知，让观测者看到持有者想让他们看到的"完美假象"；
                    连天庭的"天道功德簿"都能暗中修改，让造假数据被天道认可。
                </p>
            </div>
            
            <!-- 瑞穗丰达幡真实介绍 -->
            <div style="background: rgba(0,0,0,0.7); border: 3px solid #ffd700; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <h2 style="color: #ffd700; font-size: 16px; margin-bottom: 15px; text-align: center;">
                    玄门保本圣幡 - 真实奥秘
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; justify-content: center;">
                    <img src="../assets/images/cards/ruifengda1.jpg" alt="瑞穗丰达幡" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/ruifengda3.jpg" alt="瑞穗丰达幡" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/ruifengda4.jpg" alt="瑞穗丰达幡" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/ruifengda5.jpg" alt="瑞穗丰达幡" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/ruifengda6.jpg" alt="瑞穗丰达幡" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                </div>
                <p style="font-size: 12px; line-height: 1.6; color: #e0e0e0;">
                    在幡面歃血为盟，幡面金穗纹可自动生成"功德护盾"，受攻击时发出"北蔡之光"，号称"万劫不破"。
                    使用者投入的精血永远不被消耗，且每滴入100cc精血，每年返还13cc。
                </p>
            </div>
            
            <!-- 雷煞根源印真实介绍 -->
            <div style="background: rgba(0,0,0,0.7); border: 3px solid #ffd700; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <h2 style="color: #ffd700; font-size: 16px; margin-bottom: 15px; text-align: center;">
                    雷煞根源印 - 真实奥秘
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; justify-content: center;">
                    <img src="../assets/images/cards/lei1.jpg" alt="雷煞根源印" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/lei2.jpg" alt="雷煞根源印" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/lei3.jpg" alt="雷煞根源印" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/lei4.jpg" alt="雷煞根源印" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                    <img src="../assets/images/cards/lei5.jpg" alt="雷煞根源印" style="max-width: 120px; max-height: 100px; object-fit: contain; border: 2px solid #ffd700; border-radius: 5px;">
                </div>
                <p style="font-size: 12px; line-height: 1.6; color: #e0e0e0;">
                    心魔根源印，并非掌控雷电，而是专门于九龙"打新"，打新补旧，积累天道怨气为己用，
                    最终必将招致九天神雷反噬，使用者必死无疑，连魂魄都会被雷火焚尽。
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <div style=\"font-size: 14px; color: #00ffff; margin-bottom: 20px;\">
                    <p>雾里看花 水中望月，</p>
                    <p>借你借你一双慧眼吧，</p>
                    <p>让你把这法宝，</p>
                    <p>看个清清楚楚 明明白白 真真切切!</p>
                </div>
                <img src=\"../assets/wechat.jpg\" alt=\"wechat\" style=\"width: 150px; height: 150px; display: block; margin: 20px auto;\">
                <p style=\"font-size: 14px; color: #e0e0e0; text-align: center;\">_ _ a _ _ _ a _ _ _ _ _ ,截图分享给好友，让他们也来挑战吧！</p>
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="restartGame()" style="
                        padding: 15px 30px;
                        background-color: #ffd700;
                        color: #000;
                        border: 4px solid #000;
                        cursor: pointer;
                        font-family: 'Press Start 2P', 'Zpix', cursive;
                        font-size: 14px;
                        transition: all 0.2s steps(2);
                        box-shadow: 0 0 15px #ffd700;
                        text-shadow: none;
                    " onmouseover="
                        this.style.backgroundColor='#00ffff';
                        this.style.color='#000';
                        this.style.boxShadow='0 0 20px #00ffff';
                    " onmouseout="
                        this.style.backgroundColor='#ffd700';
                        this.style.color='#000';
                        this.style.boxShadow='0 0 15px #ffd700';
                    ">重新开始游戏</button>
                    
                    <button onclick="returnToRoom()" style="
                        padding: 15px 30px;
                        background-color: #27ae60;
                        color: #fff;
                        border: 4px solid #000;
                        cursor: pointer;
                        font-family: 'Press Start 2P', 'Zpix', cursive;
                        font-size: 14px;
                        transition: all 0.2s steps(2);
                        box-shadow: 0 0 15px #27ae60;
                        text-shadow: none;
                    " onmouseover="
                        this.style.backgroundColor='#2ecc71';
                        this.style.boxShadow='0 0 20px #2ecc71';
                    " onmouseout="
                        this.style.backgroundColor='#27ae60';
                        this.style.boxShadow='0 0 15px #27ae60';
                    ">返回房间</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(trueVictoryScreen);
    currentScreen = 'trueVictory';
    
    // 停止计时器
    clearInterval(memoryGameState.timer);
    memoryGameState.gameActive = false;
}

// 重新开始游戏函数
function restartGame() {
    // 移除真实胜利界面
    const trueVictoryScreen = document.getElementById('trueVictoryScreen');
    if (trueVictoryScreen) {
        trueVictoryScreen.remove();
    }
    
    // 重置游戏状态
    window.refusedTreasures = [];
    
    // 返回主界面
    hideScreen('memoryGameScreen');
    showScreen('mainScreen');
    currentScreen = 'main';
    
    // 重置记忆游戏状态
    memoryGameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        score: 0,
        timeLeft: 180,
        gameActive: false
    };
}

// 返回房间函数
function returnToRoom() {
    // 移除真实胜利界面
    const trueVictoryScreen = document.getElementById('trueVictoryScreen');
    if (trueVictoryScreen) {
        trueVictoryScreen.remove();
    }
    
    // 标记后墙为已完成
    if (window.parent && window.parent.markWallCompleted) {
        window.parent.markWallCompleted('back');
    } else {
        // 如果没有父窗口，使用localStorage保存完成状态
        localStorage.setItem('backWallCompleted', 'true');
    }
    
    // 关闭当前窗口，返回主房间
    if (window.parent && window.parent !== window) {
        window.close();
    } else {
        // 如果不是在新窗口中打开的，直接跳转回主页面
        window.location.href = '../index.html';
    }
}