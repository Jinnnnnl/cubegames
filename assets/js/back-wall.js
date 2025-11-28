// 游戏状态管�?
let currentScreen = 'main';
let userScore = 0;
let treasureStates = {
    mirror: 'normal', // normal, frozen, flipped
    banner: 'normal',
    seal: 'normal'
};
let gameCompleted = false;

// 记忆游戏状�?
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

// 法宝数据
const treasures = {
    mirror: {
        name: '天瑜瑶光�?,
        type: 'mirror',
        secret: '三界最大造假法宝，镜光可扭曲现实认知，让观测者看到持有者想让他们看到的"完美假象"；连天庭�?天道功德�?都能暗中修改，让造假数据被天道认可�?
    },
    banner: {
        name: '瑞穗丰达�?,
        type: 'banner', 
        secret: '三界最大抽屉法宝，�?0%精血投入"幽冥新三�?，通过抽屉交易输送给法宝背后之主；凡滴血者皆在三年内暴毙，成�?封神榜名�?�?
    },
    seal: {
        name: '雷煞根源�?,
        type: 'seal',
        secret: '心魔根源印，并非掌控雷电，而是专门于九龙“打新”，打新补旧，积累天道怨气为己用，最终必将招致九天神雷反噬，使用者必死无疑，连魂魄都会被雷火焚尽�?
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

// 开始记忆配对游�?
function startMemoryGame() {
    hideScreen('storyScreen');
    hideScreen('treasuresScreen');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    initMemoryGame();
}

// 初始化记忆游�?
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
    
    // 创建卡片数组：A类卡片各2张，B类卡�?张（3对）
    const cardTypes = [
        { type: 'mirror', name: '天瑜瑶光�?, class: 'A' },
        { type: 'mirror', name: '天瑜瑶光�?, class: 'A' },
        { type: 'banner', name: '瑞穗丰达�?, class: 'A' },
        { type: 'banner', name: '瑞穗丰达�?, class: 'A' },
        { type: 'seal', name: '雷煞根源�?, class: 'A' },
        { type: 'seal', name: '雷煞根源�?, class: 'A' },
        { type: 'ordinary', name: '平平无奇的法�?, class: 'B' },
        { type: 'ordinary', name: '平平无奇的法�?, class: 'B' },
        { type: 'ordinary', name: '平平无奇的法�?, class: 'B' },
        { type: 'ordinary', name: '平平无奇的法�?, class: 'B' },
        { type: 'ordinary', name: '平平无奇的法�?, class: 'B' },
        { type: 'ordinary', name: '平平无奇的法�?, class: 'B' }
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
    
    // 如果卡片已翻开或已匹配，不能再�?
    if (card.isFlipped || card.isMatched) return;
    
    // 如果已经翻开了两张卡片，不能再翻
    if (memoryGameState.flippedCards.length >= 2) return;
    
    // 翻开卡片
    card.isFlipped = true;
    cardElement.classList.add('flipped');
    memoryGameState.flippedCards.push(card);
    
    // 如果翻开了两张卡片，检查匹�?
    if (memoryGameState.flippedCards.length === 2) {
        memoryGameState.moves++;
        updateGameInfo();
        
        setTimeout(() => {
            checkCardMatch();
        }, 1000);
    }
}

// 检查卡片匹�?
function checkCardMatch() {
    const [card1, card2] = memoryGameState.flippedCards;
    
    // 如果翻出任何B类卡片，两张卡片都翻回背�?
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
        // 移除自动得分，只有选择"不夺�?才得�?
        
        // 暂停游戏时间
        stopTimer();
        
        // 显示像素风宝�?
        showTreasureChest(card1.type);
        
        // 检查游戏是否完成（所有A类卡片都配对完成�?
        if (memoryGameState.matchedPairs === 3) {
            // 不自动胜利，等待用户选择
        }
    } else {
        // 配对失败，翻回背�?
        flipCardsBack();
    }
    
    // 清空已翻开的卡�?
    memoryGameState.flippedCards = [];
}

// 显示像素风宝�?
function showTreasureChest(treasureType) {
    const treasure = treasures[treasureType];
    
    // 创建宝箱遮罩�?
    const overlay = document.createElement('div');
    overlay.className = 'treasure-chest-overlay';
    overlay.id = 'treasureChestOverlay';
    
    // 创建宝箱容器
    const container = document.createElement('div');
    container.className = 'treasure-chest-container';
    
    container.innerHTML = `
        <div class="pixel-chest"></div>
        <div class="chest-treasure-name">${treasure.name}</div>
        <button class="chest-detail-btn" onclick="enterTreasureDetailFromChest('${treasureType}')">
            点击了解法宝详情
        </button>
    `;
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // 显示动画
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// 显示点击提示（保留原函数，可能其他地方会用到�?
function showClickHint(card1, card2) {
    // 创建提示元素
    const hint1 = document.createElement('div');
    hint1.className = 'click-hint';
    hint1.textContent = '点击了解法宝详情';
    
    const hint2 = document.createElement('div');
    hint2.className = 'click-hint';
    hint2.textContent = '点击了解法宝详情';
    
    // 添加到卡�?
    card1.appendChild(hint1);
    card2.appendChild(hint2);
    
    // 添加闪烁效果
    setTimeout(() => {
        card1.classList.add('hint-glow');
        card2.classList.add('hint-glow');
    }, 100);
}

// 翻回卡片
function flipCardsBack() {
    memoryGameState.flippedCards.forEach(card => {
        card.isFlipped = false;
        card.element.classList.remove('flipped');
    });
}

// 从宝箱进入法宝详�?
function enterTreasureDetailFromChest(treasureType) {
    // 关闭宝箱
    closeTreasureChest();
    
    // 设置当前法宝
    memoryGameState.currentTreasure = treasureType;
    const treasure = treasures[treasureType];
    
    // 显示法宝的明面介绍（不是秘密�?
    document.getElementById('gameTreasureName').textContent = treasure.name;
    
    // 根据法宝类型显示明面介绍
    let treasureIntro = '';
    switch(treasureType) {
        case 'mirror':
            treasureIntro = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../images/cards/yuyao2.jpg" alt="天瑜瑶光�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/yuyao3.jpg" alt="天瑜瑶光�? class="treasure-img" onclick="enlargeImage(this)">
                    </div>
                    <div class="treasure-description">
                        <h3>仙界第一净光宝�?/h3>
                        <p>连续千年位列"天庭法宝评比�?净光类第一名，镜光纯净度远超同类�?/p>
                        <p>�?纣商降魔功绩�?上，镇压妖邪数量、效率双冠，被各路仙家奉�?正道之光"�?/p>
                    </div>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasureFromMemoryGame('${treasureType}')">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerTreasureFromMemoryGame()">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasureFromMemoryGame('${treasureType}')">3. 不夺�?/button>
                    </div>
                </div>
            `;
            break;
        case 'banner':
            treasureIntro = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../images/cards/ruifengda1.jpg" alt="瑞穗丰达�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda3.jpg" alt="瑞穗丰达�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda4.jpg" alt="瑞穗丰达�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda5.jpg" alt="瑞穗丰达�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda6.jpg" alt="瑞穗丰达�? class="treasure-img" onclick="enlargeImage(this)">
                    </div>
                    <div class="treasure-description">
                        <h3>玄门保本圣幡</h3>
                        <p>在幡面歃血为盟，幡面金穗纹可自动生�?功德护盾"，受攻击时发�?北蔡之光"，号�?万劫不破"�?/p>
                        <p>使用者投入的精血永远不被消耗，且每滴入100cc精血，每年返�?3cc�?/p>
                    </div>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasureFromMemoryGame('${treasureType}')">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerTreasureFromMemoryGame()">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasureFromMemoryGame('${treasureType}')">3. 不夺�?/button>
                    </div>
                </div>
            `;
            break;
        case 'seal':
            treasureIntro = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../images/cards/lei1.jpg" alt="雷煞根源�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei2.jpg" alt="雷煞根源�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei3.jpg" alt="雷煞根源�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei4.jpg" alt="雷煞根源�? class="treasure-img" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei5.jpg" alt="雷煞根源�? class="treasure-img" onclick="enlargeImage(this)">
                    </div>
                    <div class="treasure-description">
                        <h3>天庭雷部至宝</h3>
                        <p>根源护持：使用者可借天道雷力护体，号称"万劫不破"，签�?雷劫回购协议"——若印主受损，天庭必以雷部真灵补偿�?/p>
                        <p>获奖无数：荣获获奖最多奖，连续千年位�?三界降魔功绩�?榜首，王安石年年为其颁发"紫霄降魔金印�?�?/p>
                        <p>背景雄厚：由雷部二十四天君联名担保，闻仲亲笔题写"天道保本"。每逢劫难，必得玉虚宫、天庭双重加持，号称"雷煞根源印，永远不暴�?�?/p>
                    </div>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasureFromMemoryGame('${treasureType}')">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerTreasureFromMemoryGame()">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasureFromMemoryGame('${treasureType}')">3. 不夺�?/button>
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
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 从游戏进入法宝详情（保留原函数用于其他地方）
function enterTreasureDetailFromGame(treasureType) {
    memoryGameState.currentTreasure = treasureType;
    const treasure = treasures[treasureType];
    
    document.getElementById('gameTreasureName').textContent = treasure.name;
    document.getElementById('gameTreasureInfo').innerHTML = `
        <div class="treasure-secret">
            <h3>法宝真相�?/h3>
            <p>${treasure.secret}</p>
        </div>
    `;
    
    hideScreen('memoryGameScreen');
    showScreen('gameTreasureDetail');
    currentScreen = 'gameTreasureDetail';
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
    
    // 不得分，返回游戏，继续计�?
    hideScreen('gameTreasureDetail');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    
    // 重要：让这对法宝卡片重新变为可点击状�?
    // 找到对应类型的已匹配卡片，移除matched状态，但保持翻开状�?
    memoryGameState.cards.forEach(card => {
        if (card.type === treasureType && card.class === 'A' && card.isMatched) {
            card.isMatched = false; // 移除匹配状态，允许再次点击
            card.element.classList.remove('matched');
            card.element.classList.add('clickable'); // 添加可点击样�?
            
            // 重新添加点击事件处理�?
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
    
    // 恢复计时�?
    if (memoryGameState.gameActive && memoryGameState.timeLeft > 0) {
        startTimer();
    }
}

// 从记忆游戏中不夺取法�?
function refuseTreasureFromMemoryGame(treasureType) {
    // 得一分，返回游戏，继续计�?
    memoryGameState.score += 1;
    updateGameInfo();
    
    hideScreen('gameTreasureDetail');
    showScreen('memoryGameScreen');
    currentScreen = 'memoryGame';
    
    // 检查是否获得三分，游戏胜利
    if (memoryGameState.score >= 3) {
        setTimeout(() => {
            memoryGameWin();
        }, 500);
        return;
    }
    
    // 恢复计时�?
    if (memoryGameState.gameActive && memoryGameState.timeLeft > 0) {
        startTimer();
    }
}

// 记忆游戏胜利
function memoryGameWin() {
    memoryGameState.gameActive = false;
    stopTimer();
    
    // 显示胜利消息
    const winOverlay = document.createElement('div');
    winOverlay.className = 'result-overlay';
    winOverlay.innerHTML = `
        <div class="result-content">
            <h2>🌟 智慧胜利�?/h2>
            <p>你成功看穿了法宝的真相，拒绝了它们的诱惑�?/p>
            <p>你的智慧将指引你走向真正的大道！</p>
            <button class="result-btn" onclick="closeWinOverlay()">继续游戏</button>
        </div>
    `;
    
    document.body.appendChild(winOverlay);
    
    setTimeout(() => {
        winOverlay.classList.add('show');
    }, 10);
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

// 重新开始记忆游�?
function restartMemoryGame() {
    if (currentScreen === 'gameFailure') {
        hideScreen('gameFailureScreen');
        showScreen('memoryGameScreen');
        currentScreen = 'memoryGame';
    }
    initMemoryGame();
}

// 退出记忆游�?
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

// 停止计时�?
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

// 记忆游戏专用得分系统 - 只有选择"不夺�?才得�?
let memoryGameScore = 0;

// 重置记忆游戏得分
function resetMemoryGameScore() {
    memoryGameScore = 0;
}

// 游戏胜利
function gameWin() {
    memoryGameState.gameActive = false;
    stopTimer();
    setTimeout(() => {
        alert('恭喜！你成功找出了所有法宝配对！');
    }, 500);
}

// 游戏结束
function gameOver() {
    memoryGameState.gameActive = false;
    stopTimer();
    alert('时间到！游戏结束�?);
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

// 返回故事界面
function backToStory() {
    hideScreen('treasuresScreen');
    showScreen('storyScreen');
    currentScreen = 'story';
}

// 返回法宝选择界面
function backToTreasures() {
    hideScreen('treasureDetail');
    showScreen('treasuresScreen');
    currentScreen = 'treasures';
    
    // 检查是否所有法宝都已经选择完毕
    checkGameCompletion();
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
            nameElement.textContent = '天瑜瑶光�?;
            infoElement.innerHTML = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../images/cards/yuyao2.jpg" alt="天瑜瑶光�? class="treasure-img" data-treasure="mirror" onclick="enlargeImage(this)">
                        <img src="../images/cards/yuyao3.jpg" alt="天瑜瑶光�? class="treasure-img" data-treasure="mirror" onclick="enlargeImage(this)">
                    </div>
                    <div class="treasure-description">
                        <h3>仙界第一净光宝�?/h3>
                        <p>连续千年位列"天庭法宝评比�?净光类第一名，镜光纯净度远超同类�?/p>
                        <p>�?纣商降魔功绩�?上，镇压妖邪数量、效率双冠，被各路仙家奉�?正道之光"�?/p>
                    </div>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasure('mirror')">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerAgain()">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasure('mirror')">3. 不夺�?/button>
                    </div>
                </div>
            `;
            break;
        case 'banner':
            nameElement.textContent = '瑞穗丰达�?;
            infoElement.innerHTML = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../images/cards/ruifengda1.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda3.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda4.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda5.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImage(this)">
                        <img src="../images/cards/ruifengda6.jpg" alt="玄门保本圣幡" class="treasure-img" data-treasure="banner" onclick="enlargeImage(this)">
                    </div>
                    <div class="treasure-description">
                        <h3>玄门保本圣幡</h3>
                        <p>在幡面歃血为盟，幡面金穗纹可自动生�?功德护盾"，受攻击时发�?北蔡之光"，号�?万劫不破"�?/p>
                        <p>使用者投入的精血永远不被消耗，且每滴入100cc精血，每年返�?3cc�?/p>
                    </div>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasure('banner')">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerAgain()">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasure('banner')">3. 不夺�?/button>
                    </div>
                </div>
            `;
            break;
        case 'seal':
            nameElement.textContent = '雷煞根源�?;
            infoElement.innerHTML = `
                <div class="treasure-detail-content">
                    <div class="treasure-images">
                        <img src="../images/cards/lei1.jpg" alt="雷煞根源�? class="treasure-img" data-treasure="seal" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei2.jpg" alt="雷煞根源�? class="treasure-img" data-treasure="seal" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei3.jpg" alt="雷煞根源�? class="treasure-img" data-treasure="seal" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei4.jpg" alt="雷煞根源�? class="treasure-img" data-treasure="seal" onclick="enlargeImage(this)">
                        <img src="../images/cards/lei5.jpg" alt="雷煞根源�? class="treasure-img" data-treasure="seal" onclick="enlargeImage(this)">
                    </div>
                    <h3>天庭雷部至宝</h3>
                    <p>根源护持​：使用者可借天道雷力护体，号称"万劫不破"，签订�?雷劫回购协议"​——若印主受损，天庭必以雷部真灵补偿�?/p>
                    <p>获奖无数：荣获获奖最多奖，连续千年位�?三界降魔功绩�?榜首，王安石年年为其颁发"紫霄降魔金印�?�?/p>
                    <p>背景雄厚​：由雷部二十四天君联名担保，​闻仲亲笔题�?天道保本"​。每逢劫难，必得玉虚宫、天庭双重加持，号称" 雷煞根源�?，永远不暴雷"�?/p>
                    <div class="treasure-choices">
                        <button class="choice-btn grab-btn" onclick="grabTreasure('seal')">1. 夺取法宝</button>
                        <button class="choice-btn consider-btn" onclick="considerAgain()">2. 再考虑考虑</button>
                        <button class="choice-btn refuse-btn" onclick="refuseTreasure('seal')">3. 不夺�?/button>
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

// 不夺取法�?
function refuseTreasure(treasureType) {
    treasureStates[treasureType] = 'flipped';
    userScore += 1;
    console.log(`用户选择不夺�?{treasureType}，得分：`, userScore);
    backToTreasures();
    updateTreasureCards();
}

// 更新法宝卡片状�?
function updateTreasureCards() {
    // 更新镜子卡片
    updateTreasureCard('mirror');
    
    // 更新幡卡�?
    updateTreasureCard('banner');
    
    // 更新印卡�?
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
                <p>镜光可扭曲现实认知，让观测者看到持有者想让他们看到的"完美假象"�?/p>
                <p>连天庭的"天道功德�?都能暗中修改，让造假数据被天道认可；</p>
            `;
        } else if (treasureType === 'banner') {
            cardImage.style.background = 'radial-gradient(circle, #8b0000, #4b0000)';
            cardTitle.textContent = '三界最大抽屉法�?;
            cardDesc.innerHTML = `
                <p>�?0%精血投入"幽冥新三�?，通过抽屉交易输送给法宝背后之主�?/p>
                <p>凡滴血者皆在三年内暴毙，成�?封神榜名�?�?/p>
            `;
        } else if (treasureType === 'seal') {
            cardImage.style.background = 'radial-gradient(circle, #8b0000, #4b0000)';
            cardTitle.textContent = '心魔根源�?;
            cardDesc.innerHTML = `
                <p>表面上是雷霆之力，实则是激发使用者心魔的邪印�?/p>
                <p>每次使用都会让心魔壮大，最终吞噬使用者的神智�?/p>
            `;
        }
    }
}

// 检查游戏是否完�?
function checkGameCompletion() {
    // 检查是否所有法宝都已经做出选择
    const allDecided = Object.values(treasureStates).every(state => state !== 'normal');
    
    if (allDecided && !gameCompleted) {
        gameCompleted = true;
        
        // 显示结果
        setTimeout(() => {
            showGameResult();
        }, 500);
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
        resultMessage = '你看穿了三件法宝的真相，拒绝了它们的诱惑。你的智慧将指引你走向真正的大道�?;
    } else if (userScore >= 1) {
        resultTitle = '⚠️ 部分觉醒';
        resultMessage = `你看穿了${userScore}件法宝的真相，但也被其他法宝所迷惑。继续修行，提高警惕！`;
    } else {
        resultTitle = '�?完全迷失';
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

// 全局变量用于图片切换
let currentImageArray = [];
let currentImageIndex = 0;

// 图片放大功能
function enlargeImage(img) {
    // 获取当前法宝类型的所有图�?
    const treasureType = img.getAttribute('data-treasure');
    const allImages = document.querySelectorAll(`.treasure-img[data-treasure="${treasureType}"]`);
    currentImageArray = Array.from(allImages);
    currentImageIndex = currentImageArray.indexOf(img);
    
    // 创建遮罩�?
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    overlay.id = 'imageOverlay';
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            closeEnlargedImage();
        }
    };
    
    // 创建放大的图片容�?
    const imageContainer = document.createElement('div');
    imageContainer.className = 'enlarged-image-container';
    
    // 创建放大的图�?
    const enlargedImg = document.createElement('img');
    enlargedImg.src = img.src;
    enlargedImg.alt = img.alt;
    enlargedImg.className = 'enlarged-image';
    enlargedImg.id = 'enlargedImage';
    
    // 创建关闭按钮
    const closeBtn = document.createElement('div');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = closeEnlargedImage;
    
    // 创建左右切换按钮（只有多张图片时才显示）
    let prevBtn, nextBtn;
    if (currentImageArray.length > 1) {
        // 左切换按�?
        prevBtn = document.createElement('div');
        prevBtn.className = 'nav-btn prev-btn';
        prevBtn.innerHTML = '�?;
        prevBtn.onclick = function(e) {
            e.stopPropagation();
            switchToPrevImage();
        };
        
        // 右切换按�?
        nextBtn = document.createElement('div');
        nextBtn.className = 'nav-btn next-btn';
        nextBtn.innerHTML = '�?;
        nextBtn.onclick = function(e) {
            e.stopPropagation();
            switchToNextImage();
        };
        
        // 将按钮添加到 overlay，确保它们在最顶层
        overlay.appendChild(prevBtn);
        overlay.appendChild(nextBtn);
    }
    
    // 组装元素
    imageContainer.appendChild(enlargedImg);
    overlay.appendChild(imageContainer);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // 添加触摸滑动支持
    let startX = 0;
    let startY = 0;
    let isSwipe = false;
    
    imageContainer.addEventListener('touchstart', function(e) {
        if (currentImageArray.length <= 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwipe = false;
    }, { passive: true });
    
    imageContainer.addEventListener('touchmove', function(e) {
        if (currentImageArray.length <= 1) return;
        e.preventDefault();
        isSwipe = true;
    }, { passive: false });
    
    imageContainer.addEventListener('touchend', function(e) {
        if (currentImageArray.length <= 1 || !isSwipe) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // 确保是水平滑动且滑动距离足够
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // 向右滑动，显示上一张图�?
                switchToPrevImage();
            } else {
                // 向左滑动，显示下一张图�?
                switchToNextImage();
            }
        }
    }, { passive: true });
    
    // 添加动画效果
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// 切换到上一张图�?
function switchToPrevImage() {
    if (currentImageArray.length <= 1) return;
    
    currentImageIndex = (currentImageIndex - 1 + currentImageArray.length) % currentImageArray.length;
    updateEnlargedImage();
}

// 切换到下一张图�?
function switchToNextImage() {
    if (currentImageArray.length <= 1) return;
    
    currentImageIndex = (currentImageIndex + 1) % currentImageArray.length;
    updateEnlargedImage();
}

// 更新放大图片
function updateEnlargedImage() {
    const enlargedImg = document.getElementById('enlargedImage');
    if (enlargedImg && currentImageArray[currentImageIndex]) {
        const newImg = currentImageArray[currentImageIndex];
        enlargedImg.src = newImg.src;
        enlargedImg.alt = newImg.alt;
    }
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
    // 检查是否有放大的图�?
    const overlay = document.querySelector('.image-overlay');
    if (overlay) {
        if (event.key === 'Escape') {
            closeEnlargedImage();
            return;
        }
        // 在图片放大状态下，支持左右箭头键切换图片
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            switchToPrevImage();
            return;
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            switchToNextImage();
            return;
        }
        return; // 在图片放大状态下，不处理其他键盘事件
    }
    
    if (event.key === 'Escape') {
        // ESC键返回上一�?
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

// 确保函数在全局作用域中可用
window.enterGame = enterGame;
window.showTreasures = showTreasures;
window.backToStory = backToStory;
window.startMemoryGame = startMemoryGame;
window.exitMemoryGame = exitMemoryGame;
window.backToTreasures = backToTreasures;
window.flipCard = flipCard;
window.enlargeImage = enlargeImage;
window.closeEnlargedImage = closeEnlargedImage;
window.grabTreasure = grabTreasure;
window.considerAgain = considerAgain;
window.refuseTreasure = refuseTreasure;
window.backToMemoryGame = backToMemoryGame;
window.goBack = goBack;

console.log('Back wall functions bound to window');
