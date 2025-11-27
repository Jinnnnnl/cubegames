class CardManager {
    constructor() {
        // 初始化卡牌数据
        this.cardsByManager = {}; // 按管理人分组的卡牌
        this.managerList = []; // 管理人列表
        this.usedManagers = []; // 已使用的管理人
        this.currentManager = null; // 当前管理人
        this.currentManagerCards = []; // 当前管理人已显示的卡牌
        this.currentManagerAttempts = 0; // 当前管理人的答题次数
        
        // 加载卡牌
        this.loadCards();
        
        console.log('卡牌管理器初始化完成');
        console.log('管理人列表:', this.managerList);
        console.log('按管理人分组的卡牌:', this.cardsByManager);
    }
    
    // 加载卡牌数据
    loadCards() {
        // 这里是卡牌数据映射表
        const cardData = {
            // 根据用户提供的映射关系创建
            // 1-5的答案是kd
            '1.png': { answer: 'kd', description: 'Because of GPU, our alpha bumps that week..' },
            '2.png': { answer: 'kd', description: 'Diamond Drill' },
            '3.png': { answer: 'kd', description: 'zhuhai' },
            '4.png': { answer: 'kd', description: 'Mind Control' },
            '5.png': { answer: 'kd', description: 'I wish I had a whale..' },
            
            // 6-10的答案是pfh
            '6.png': { answer: 'pfh', description: 'mie~' },
            '7.png': { answer: 'pfh', description: '' },
            '8.png': { answer: 'pfh', description: '' },
            '9.png': { answer: 'pfh', description: 'Quant Huang Shiren' },
            '10.png': { answer: 'pfh', description: '???!!!' },
            
            // 11-17、45的答案是ps
            '11.png': { answer: 'ps', description: 'A large proportion of interns' },
            '12.png': { answer: 'ps', description: 'Let\'s meet in the court' },
            '13.png': { answer: 'ps', description: 'Upload....Download....' },
            '14.png': { answer: 'ps', description: 'Carry for free.' },
            '15.png': { answer: 'ps', description: '' },
            '16.png': { answer: 'ps', description: 'Fair...Fair...Fair..?' },
            '17.png': { answer: 'ps', description: 'Robin Hood' },
            '45.png': { answer: 'ps', description: 'maximum 1.054%%' },
            
            // 18-24的答案是mh
            '18.png': { answer: 'mh', description: 'crying blue chips' },
            '19.png': { answer: 'mh', description: 'Leverage' },
            '20.png': { answer: 'mh', description: 'letter to investor 2021.3.9' },
            '21.png': { answer: 'mh', description: '' },
            '22.png': { answer: 'mh', description: '' },
            '23.png': { answer: 'mh', description: 'Old driver' },
            '24.png': { answer: 'mh', description: 'MollycHing' },
            
            // 25-31的答案是ms
            '25.png': { answer: 'ms', description: 'Straw on Camel' },
            '26.png': { answer: 'ms', description: 'Beta x 3' },
            '27.png': { answer: 'ms', description: 'Who is your driver' },
            '28.png': { answer: 'ms', description: 'Signing in the drawer' },
            '29.png': { answer: 'ms', description: 'Weight is more than weight' },
            '30.png': { answer: 'ms', description: 'break up' },
            '31.png': { answer: 'ms', description: 'Bye Bye' },
            
            // 32-35、46的答案是lq
            '32.png': { answer: 'lq', description: '' },
            '33.png': { answer: 'lq', description: 'one small step forward, one giant leap for alpha' },
            '34.png': { answer: 'lq', description: 'Quant New Oriental' },
            '35.png': { answer: 'lq', description: '^^ ^^ wetland' },
            '46.png': { answer: 'lq', description: 'Little Universe Broadcast' },
            
            // 36-44的答案是hf
            '36.png': { answer: 'hf', description: 'a cuffwork orange' },
            '37.png': { answer: 'hf', description: 'no maimai, no shanghai' },
            '38.png': { answer: 'hf', description: 'letter to investor 2021.12.28' },
            '39.png': { answer: 'hf', description: 'an ordinary pig' },
            '40.png': { answer: 'hf', description: 'mollyHomeF' },
            '41.png': { answer: 'hf', description: 'King of 2020' },
            '42.png': { answer: 'hf', description: 'whale comes from a cube' },
            '43.png': { answer: 'hf', description: '300,500,1000, different entrances, same exit' },
            '44.png': { answer: 'hf', description: 'coach, I want to play basketball' }
        };
        
        // 按管理人分组卡牌
        let id = 1;
        for (const [filename, data] of Object.entries(cardData)) {
            const manager = data.answer;
            
            if (!this.cardsByManager[manager]) {
                this.cardsByManager[manager] = [];
            }
            
            this.cardsByManager[manager].push({
                id: id++,
                filename: filename,
                description: data.description,
                answer: manager
            });
        }
        
        // 获取管理人列表并随机排序
        this.managerList = Object.keys(this.cardsByManager);
        this.shuffleArray(this.managerList);
        
        // 为每个管理人的卡牌随机排序
        for (const manager of this.managerList) {
            this.shuffleArray(this.cardsByManager[manager]);
        }
    }
    
    // 随机排序数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 开始新的管理人轮次
    startNewManager() {
        // 获取下一个未使用的管理人
        const availableManagers = this.managerList.filter(manager => !this.usedManagers.includes(manager));
        
        if (availableManagers.length === 0) {
            console.log('所有管理人已使用完毕');
            return null;
        }

        this.currentManager = availableManagers[0];
        this.currentManagerCards = [];
        this.currentManagerAttempts = 0;
        
        console.log('开始新管理人轮次:', this.currentManager);
        return this.getNextCardForCurrentManager();
    }
    
    // 获取当前管理人的下一张卡牌
    getNextCardForCurrentManager() {
        if (!this.currentManager) {
            return this.startNewManager();
        }
        
        const managerCards = this.cardsByManager[this.currentManager];
        const unusedCards = managerCards.filter(card => 
            !this.currentManagerCards.some(usedCard => usedCard.id === card.id)
        );
        
        if (unusedCards.length === 0) {
            // 当前管理人的所有卡牌都已显示，开始下一个管理人
            this.usedManagers.push(this.currentManager);
            return this.startNewManager();
        }
        
        const nextCard = unusedCards[0];
        this.currentManagerCards.push(nextCard);
        
        console.log('获取当前管理人卡牌:', nextCard);
        console.log('当前管理人已显示卡牌:', this.currentManagerCards);
        
        return nextCard;
    }

    // 检查答案是否正确
    checkAnswer(userAnswer) {
        if (!this.currentManager) {
            console.log('没有当前管理人');
            return false;
        }

        const correctAnswer = this.currentManager.toLowerCase();
        const inputAnswer = userAnswer.toLowerCase().trim();
        
        console.log('验证答案 - 用户输入:', inputAnswer, '正确答案:', correctAnswer);
        
        const isCorrect = inputAnswer === correctAnswer;
        console.log('验证结果:', isCorrect);
        
        if (!isCorrect) {
            this.currentManagerAttempts++;
        }
        
        return isCorrect;
    }
    
    // 处理答错情况
    handleWrongAnswer() {
        console.log('答错处理，当前尝试次数:', this.currentManagerAttempts);
        
        if (this.currentManagerAttempts === 1) {
            // 第一次答错，显示同一管理人的下一张卡牌
            return this.getNextCardForCurrentManager();
        } else if (this.currentManagerAttempts >= 2) {
            // 第二次及以后答错，需要显示分享页面，但继续显示更多卡牌
            return this.getNextCardForCurrentManager();
        }
        
        return null;
    }
    
    // 处理答对情况
    handleCorrectAnswer() {
        // 答对后，标记当前管理人为已完成
        if (this.currentManager && !this.usedManagers.includes(this.currentManager)) {
            this.usedManagers.push(this.currentManager);
        }
        
        // 重置当前管理人状态，准备下一个管理人
        this.currentManager = null;
        this.currentManagerCards = [];
        this.currentManagerAttempts = 0;
        
        console.log('答对处理完成，已完成管理人:', this.usedManagers);
    }

    // 获取当前管理人的所有已显示卡牌
    getCurrentManagerCards() {
        return this.currentManagerCards;
    }
    
    // 获取当前管理人
    getCurrentManager() {
        return this.currentManager;
    }
    
    // 获取当前管理人的尝试次数
    getCurrentManagerAttempts() {
        return this.currentManagerAttempts;
    }

    // 获取剩余管理人数量
    getRemainingManagerCount() {
        return this.managerList.length - this.usedManagers.length;
    }

    // 获取总管理人数量
    getTotalManagerCount() {
        return this.managerList.length;
    }

    // 获取已完成管理人数量
    getCompletedManagerCount() {
        return this.usedManagers.length;
    }

    // 重置卡牌管理器
    reset() {
        this.usedManagers = [];
        this.currentManager = null;
        this.currentManagerCards = [];
        this.currentManagerAttempts = 0;
        
        // 重新随机排序管理人列表
        this.shuffleArray(this.managerList);
        
        // 为每个管理人的卡牌重新随机排序
        for (const manager of this.managerList) {
            this.shuffleArray(this.cardsByManager[manager]);
        }
        
        console.log('卡牌管理器已重置');
    }
}