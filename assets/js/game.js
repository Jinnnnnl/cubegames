class Game {
    constructor() {
        // 初始化游戏状态
        this.cardManager = new CardManager();
        this.score = 0;
        this.totalAnswered = 0;
        this.correctAnswered = 0;
        this.isGameOver = false;
        
        // 管理人名称映射
        this.managerNames = {
            'lq': '篮球',
            'hf': '盒饭',
            'mh': '盲盒',
            'ps': '披萨',
            'ms': '美食',
            'pfh': '皮肤好',
            'kd': 'Kevin Durant'
        };
        
        // 初始化UI元素
        this.initUI();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始游戏
        this.startGame();
        
        console.log('游戏初始化完成');
    }
    
    // 初始化UI元素
    initUI() {
        // 卡牌容器
        this.cardContainer = document.getElementById('card-container');
        
        // 答案输入框
        this.answerInput = document.getElementById('answer-input');
        
        // 提交按钮
        this.submitButton = document.getElementById('submit-button');
        
        // 提示按钮
        this.hintButton = document.getElementById('hint-button');
        
        // 提示状态显示
        this.hintStatus = document.getElementById('hint-status');
        
        // 下一张按钮
        this.nextButton = document.getElementById('next-button');
        
        // 重置按钮
        this.resetButton = document.getElementById('reset-button');
        
        // 分数显示
        this.scoreDisplay = document.getElementById('score-display');
        
        // 反馈信息
        this.feedbackDisplay = document.getElementById('feedback-display');
        
        // 卡牌计数
        this.cardCountDisplay = document.getElementById('card-count-display');
        
        // 分享界面
        this.shareContainer = document.getElementById('share-container');
        this.shareCardImage = document.getElementById('share-card-image');
        this.shareCardAnswer = document.getElementById('share-card-answer');
        this.shareCloseButton = document.getElementById('share-close-button');
        
        console.log('UI元素初始化完成');
    }
    
    // 绑定事件
    bindEvents() {
        // 提交按钮点击事件
        this.submitButton.addEventListener('click', () => this.checkAnswer());
        
        // 回车键提交
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        // 提示按钮点击事件
        this.hintButton.addEventListener('click', () => this.showHint());
        
        // 下一张按钮点击事件
        this.nextButton.addEventListener('click', () => this.showNextCard());
        
        // 重置按钮点击事件
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // 分享界面关闭按钮
        if (this.shareCloseButton) {
            this.shareCloseButton.addEventListener('click', () => this.hideShareUI());
        }
        
        console.log('事件绑定完成');
    }
    
    // 开始游戏
    startGame() {
        console.log('游戏开始初始化');
        this.updateScore();
        this.showNextCard();
        console.log('游戏开始完成');
    }
    
    // 显示下一张卡牌
    showNextCard() {
        console.log('开始显示下一张卡牌');
        
        // 清除反馈信息
        this.showFeedback('', '');
        
        // 清空输入框
        this.answerInput.value = '';
        this.answerInput.focus();
        
        // 获取下一个管理人的卡牌
        const card = this.cardManager.startNewManager();
        console.log('获取到的卡牌:', card);
        
        if (!card) {
            this.endGame();
            return;
        }
        
        // 显示卡牌
        this.displayCards();
        
        // 更新卡牌计数
        this.updateCardCount();
        
        // 启用提交按钮
        this.submitButton.disabled = false;
        
        // 重置提示按钮状态
        console.log('准备重置提示按钮');
        this.resetHintButton();
        console.log('提示按钮重置完成');
        
        // 隐藏下一张按钮
        this.nextButton.style.display = 'none';
        
        console.log('显示新管理人卡牌完成:', card);
    }
    
    // 显示当前管理人的所有卡牌
    displayCards() {
        const cards = this.cardManager.getCurrentManagerCards();
        
        // 清空卡牌容器
        this.cardContainer.innerHTML = '';
        
        // 创建卡牌网格容器
        const cardsGrid = document.createElement('div');
        cardsGrid.classList.add('cards-grid');
        
        // 显示所有卡牌
        cards.forEach((card, index) => {
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('card-wrapper');
            
            const cardImage = document.createElement('img');
            cardImage.src = `../assets/CodeBubbyAssets/2_2/${card.filename}`;
            cardImage.alt = `Card ${card.id}`;
            cardImage.classList.add('card-image');
            cardWrapper.appendChild(cardImage);
            
            // 如果有描述且不为空，显示描述
            if (card.description && card.description.trim() !== '') {
                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = card.description;
                descriptionElement.classList.add('card-description');
                cardWrapper.appendChild(descriptionElement);
            }
            
            cardsGrid.appendChild(cardWrapper);
        });
        
        this.cardContainer.appendChild(cardsGrid);
        
        console.log('显示卡牌组:', cards);
    }
    
    // 检查答案
    checkAnswer() {
        const userAnswer = this.answerInput.value.trim();
        
        if (!userAnswer) {
            this.showFeedback('请输入答案', 'warning');
            return;
        }
        
        const isCorrect = this.cardManager.checkAnswer(userAnswer);
        this.totalAnswered++;
        
        if (isCorrect) {
            // 答案正确
            this.correctAnswered++;
            this.score += 10;
            this.updateScore();
            this.showFeedback('答对了！', 'success');
            
            // 显示答对分享界面
            this.showCorrectShareUI();
            
            // 处理答对情况，标记当前管理人完成
            this.cardManager.handleCorrectAnswer();
            
            // 禁用提交按钮
            this.submitButton.disabled = true;
        } else {
            // 答案错误
            this.handleWrongAnswer();
        }
    }
    
    // 处理答错情况
    handleWrongAnswer() {
        const attempts = this.cardManager.getCurrentManagerAttempts();
        
        if (attempts === 1) {
            // 第一次答错，显示同一管理人的下一张卡牌
            this.showFeedback('答错了，再给你一张提示卡牌', 'error');
            
            const nextCard = this.cardManager.handleWrongAnswer();
            if (nextCard) {
                this.displayCards();
            }
            
            // 清空输入框，让用户重新输入
            this.answerInput.value = '';
            this.answerInput.focus();
            
        } else if (attempts >= 2) {
            // 第二次及以后答错，显示求助分享界面
            this.showFeedback('再次答错了，要不要请朋友帮忙？', 'error');
            
            // 显示求助分享界面
            this.showHelpShareUI();
            
            // 禁用提交按钮
            this.submitButton.disabled = true;
        }
    }
    
    // 继续当前管理人的下一张卡牌
    continueCurrentManager() {
        const nextCard = this.cardManager.handleWrongAnswer();
        if (nextCard) {
            this.displayCards();
            this.showFeedback('继续猜猜这是哪家', 'info');
            
            // 启用提交按钮
            this.submitButton.disabled = false;
            
            // 清空输入框
            this.answerInput.value = '';
            this.answerInput.focus();
        } else {
            // 当前管理人的所有卡牌都显示完了，进入下一个管理人
            this.showNextCard();
        }
    }
    
    // 显示反馈信息
    showFeedback(message, type) {
        this.feedbackDisplay.textContent = message;
        this.feedbackDisplay.className = 'feedback';
        
        if (type) {
            this.feedbackDisplay.classList.add(`feedback-${type}`);
        }
    }
    
    // 更新分数显示
    updateScore() {
        this.scoreDisplay.textContent = `得分: ${this.score} | 正确率: ${this.correctAnswered}/${this.totalAnswered}`;
    }
    
    // 更新卡牌计数
    updateCardCount() {
        const remaining = this.cardManager.getRemainingManagerCount();
        const total = this.cardManager.getTotalManagerCount();
        const completed = this.cardManager.getCompletedManagerCount();
        
        this.cardCountDisplay.textContent = `管理人: ${completed}/${total} (剩余: ${remaining})`;
    }
    
    // 显示答对分享界面
    showCorrectShareUI() {
        if (!this.shareContainer) return;
        
        const cards = this.cardManager.getCurrentManagerCards();
        const manager = this.cardManager.getCurrentManager();
        
        if (cards && cards.length > 0) {
            // 更新分享界面标题
            const shareTitle = this.shareContainer.querySelector('.share-title');
            const managerName = this.managerNames[manager] || manager;
            shareTitle.innerHTML = `恭喜你答对了！<br>对！就是${managerName}！`;
            
            // 更新分享消息
            const shareMessage = this.shareContainer.querySelector('.share-message');
            shareMessage.textContent = '你能猜对几个？来这里试试吧！';
            
            // 显示所有卡牌
            this.updateShareCards(cards, manager);
            
            // 显示分享界面
            this.shareContainer.style.display = 'flex';
        }
    }
    
    // 显示求助分享界面
    showHelpShareUI() {
        if (!this.shareContainer) return;
        
        const cards = this.cardManager.getCurrentManagerCards();
        const manager = this.cardManager.getCurrentManager();
        
        if (cards && cards.length > 0) {
            // 更新分享界面标题
            const shareTitle = this.shareContainer.querySelector('.share-title');
            shareTitle.textContent = '你来帮我看看这是哪家';
            
            // 更新分享消息
            const shareMessage = this.shareContainer.querySelector('.share-message');
            shareMessage.textContent = '我猜不出来，你能帮我看看吗？';
            
            // 显示所有卡牌，但不显示答案
            this.updateShareCards(cards, null);
            
            // 显示分享界面
            this.shareContainer.style.display = 'flex';
        }
    }
    
    // 更新分享界面的卡牌显示
    updateShareCards(cards, manager) {
        const shareCard = this.shareContainer.querySelector('.share-card');
        shareCard.innerHTML = '';
        
        // 创建卡牌网格
        const cardsGrid = document.createElement('div');
        cardsGrid.classList.add('share-cards-grid');
        
        cards.forEach(card => {
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('share-card-wrapper');
            
            const cardImage = document.createElement('img');
            cardImage.src = `../assets/CodeBubbyAssets/2_2/${card.filename}`;
            cardImage.alt = `Card ${card.id}`;
            cardImage.classList.add('share-card-image');
            cardWrapper.appendChild(cardImage);
            
            // 如果有描述，显示描述
            if (card.description) {
                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = card.description;
                descriptionElement.classList.add('share-card-description');
                cardWrapper.appendChild(descriptionElement);
            }
            
            cardsGrid.appendChild(cardWrapper);
        });
        
        shareCard.appendChild(cardsGrid);
        
        // 如果提供了管理人信息（答对的情况），显示答案
        if (manager) {
            const answerElement = document.createElement('p');
            answerElement.textContent = `正确答案: ${manager}`;
            answerElement.classList.add('share-card-answer');
            shareCard.appendChild(answerElement);
        }
    }
    
    // 隐藏分享界面
    hideShareUI() {
        if (this.shareContainer) {
            this.shareContainer.style.display = 'none';
            
            const attempts = this.cardManager.getCurrentManagerAttempts();
            
            if (attempts >= 2) {
                // 如果是求助分享界面关闭，继续显示当前管理人的下一张卡牌
                this.continueCurrentManager();
            } else {
                // 如果是答对分享界面关闭，显示下一个管理人的卡牌
                this.showNextCard();
            }
        }
    }
    
    // 结束游戏
    endGame() {
        this.isGameOver = true;
        
        // 清空卡牌容器
        this.cardContainer.innerHTML = '<h2>游戏结束！</h2>';
        
        // 显示最终得分
        this.showFeedback(`游戏结束！你的最终得分是 ${this.score}，正确率: ${this.correctAnswered}/${this.totalAnswered}`, 'info');
        
        // 禁用提交按钮和下一张按钮
        this.submitButton.disabled = true;
        this.nextButton.style.display = 'none';
        
        console.log('游戏结束');
    }
    
    // 重置游戏
    resetGame() {
        // 重置卡牌管理器
        this.cardManager.reset();
        
        // 重置游戏状态
        this.score = 0;
        this.totalAnswered = 0;
        this.correctAnswered = 0;
        this.isGameOver = false;
        
        // 更新UI
        this.updateScore();
        this.showFeedback('游戏已重置', 'info');
        
        // 重置提示按钮
        this.resetHintButton();
        
        // 开始新游戏
        this.startGame();
        
        console.log('游戏已重置');
    }
    
    // 显示提示（获取下一张图片）
    showHint() {
        if (!this.cardManager.currentManager) {
            this.updateHintStatus('请先开始游戏');
            return;
        }
        
        // 检查当前管理人是否还有未显示的卡牌
        const managerCards = this.cardManager.cardsByManager[this.cardManager.currentManager];
        const currentCards = this.cardManager.getCurrentManagerCards();
        
        if (currentCards.length >= managerCards.length) {
            // 所有卡牌都已显示
            this.updateHintStatus('就这么多张了，可以先尝试回答');
            this.hintButton.disabled = true;
            return;
        }
        
        // 获取下一张卡牌
        const nextCard = this.cardManager.getNextCardForCurrentManager();
        
        if (nextCard) {
            // 重新显示所有卡牌（包括新的提示卡牌）
            this.displayCards();
            
            // 更新提示状态
            const currentCardsAfterHint = this.cardManager.getCurrentManagerCards();
            const remainingCards = managerCards.length - currentCardsAfterHint.length;
            
            if (remainingCards > 0) {
                this.updateHintStatus(`还有 ${remainingCards} 张提示可用`);
            } else {
                // 这是最后一张提示图了
                this.updateHintStatus('这是最后一张提示图了哦');
                this.hintButton.disabled = true;
            }
            
            console.log('显示提示卡牌:', nextCard);
        } else {
            this.updateHintStatus('没有更多提示了');
            this.hintButton.disabled = true;
        }
    }
    
    // 更新提示状态显示
    updateHintStatus(message) {
        if (this.hintStatus) {
            this.hintStatus.textContent = message;
        }
    }
    
    // 重置提示按钮状态（在开始新管理人时调用）
    resetHintButton() {
        if (this.hintButton) {
            this.hintButton.disabled = false;
            
            // 计算当前管理人的总卡牌数
            if (this.cardManager.currentManager) {
                const managerCards = this.cardManager.cardsByManager[this.cardManager.currentManager];
                const currentCards = this.cardManager.getCurrentManagerCards();
                // 正确计算：剩余提示数 = 总卡牌数 - 当前已显示卡牌数
                const remainingHints = managerCards.length - currentCards.length;
                
                console.log('重置提示按钮 - 管理人:', this.cardManager.currentManager);
                console.log('总卡牌数:', managerCards.length);
                console.log('已显示卡牌数:', currentCards.length);
                console.log('剩余提示数:', remainingHints);
                
                if (remainingHints > 0) {
                    this.updateHintStatus(`还有 ${remainingHints} 张提示可用`);
                    this.hintButton.disabled = false;
                } else {
                    this.updateHintStatus('就这么多张了，可以先尝试回答');
                    this.hintButton.disabled = true;
                }
            } else {
                this.updateHintStatus('');
            }
        }
    }
}