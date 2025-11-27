// 前墙 - 封神卷宗机关
function initFrontPuzzle() {
    const container = document.getElementById('frontPuzzle');
    
    // 替换容器内容
    container.innerHTML = `
        <button id="openScrollBtn" class="solve-btn scroll-btn">📜 开启卷宗</button>
        <div class="clue">点击开启卷宗，仔细阅读并填入正确答案</div>
    `;
    
    // 创建卷宗弹窗（添加到body）
    const scrollModal = document.createElement('div');
    scrollModal.id = 'scrollModal';
    scrollModal.className = 'scroll-modal';
    scrollModal.innerHTML = `
        <div class="scroll-content">
            <div class="scroll-header">
                <h4>封神战力榜单监督管理暂行办法</h4>
                <button onclick="closeScroll()" class="close-btn">×</button>
            </div>
            <div class="scroll-body">
                <div class="scroll-section">
                    <h5>一、散仙入榜标准</h5>
                    <div class="scroll-item">
                        <strong>1. 功德根基</strong>
                        <p>i. 身家须达
                            <select id="answer1" class="inline-select">
                                <option value="">请选择</option>
                                <option value="一">一</option>
                                <option value="二">二</option>
                                <option value="三">三</option>
                                <option value="五">五</option>
                                <option value="十">十</option>
                            </select>
                            百枚"天道通宝"（注：一枚通宝抵人间黄金万两），或
                        </p>
                        <p>近三载香火年入
                            <select id="answer2" class="inline-select">
                                <option value="">请选择</option>
                                <option value="一">一</option>
                                <option value="二">二</option>
                                <option value="三">三</option>
                                <option value="五">五</option>
                                <option value="十">十</option>
                            </select>
                            十枚"天道通宝"（需玉虚宫司禄殿盖印认证）。
                        </p>
                    </div>
                    <div class="scroll-item">
                        <strong>2. 道心试炼</strong>
                        <p>需通过"九曲黄河风险问心阵"，证道心稳固，无贪嗔痴三毒缠身。</p>
                        <p style="color:#808080; font-size:0.5em;">t _ _ _ _ p _ _ _ _ _ _</p>
                    </div>
                    <div class="scroll-item">
                        <strong>3. 最低献祭</strong>
                        <p>最低投注
                            <select id="answer3" class="inline-select">
                                <option value="">请选择</option>
                                <option value="一">一</option>
                                <option value="二">二</option>
                                <option value="三">三</option>
                                <option value="五">五</option>
                                <option value="十">十</option>
                            </select>
                            百枚"天道通宝"，违者打入轮回，永世不得上榜。
                        </p>
                    </div>
                </div>
                
                <div class="scroll-section">
                    <h5>二、仙门入榜标准</h5>
                    <div class="scroll-item">
                        <strong>1. 宗门底蕴</strong>
                        <p>库藏须达
                            <select id="answer4" class="inline-select">
                                <option value="">请选择</option>
                                <option value="一">一</option>
                                <option value="二">二</option>
                                <option value="三">三</option>
                                <option value="五">五</option>
                                <option value="十">十</option>
                            </select>
                            千枚"天道通宝"（需元始天尊座下审计仙官核验），或
                        </p>
                        <p>香火愿力皆为本门嫡传（禁借西方教高利贷、不得化身傀儡代持）。</p>
                    </div>
                    <div class="scroll-item">
                        <strong>2. 天道契约</strong>
                        <p>立下"封神血誓"，若以旁门左道欺瞒天道，必遭打神鞭惩戒，真灵上榜，永世为天庭打工。</p>
                    </div>
                </div>
            </div>
            
            <div class="answer-section">
                <button onclick="checkScrollAnswers()" class="solve-btn">提交答案</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(scrollModal);
    
    // 绑定开启卷宗事件
    document.getElementById('openScrollBtn').onclick = openScroll;
}

// 开启卷宗
function openScroll() {
    document.getElementById('scrollModal').style.display = 'flex';
}

// 关闭卷宗
function closeScroll() {
    document.getElementById('scrollModal').style.display = 'none';
}

// 检查卷宗答案
function checkScrollAnswers() {
    const answer1 = document.getElementById('answer1').value;
    const answer2 = document.getElementById('answer2').value;
    const answer3 = document.getElementById('answer3').value;
    const answer4 = document.getElementById('answer4').value;
    
    const correctAnswers = ['三', '五', '一', '一'];
    const userAnswers = [answer1, answer2, answer3, answer4];
    
    const isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
    
    if (isCorrect) {
        // 确保game对象存在
        if (window.game && typeof window.game.solvePuzzle === 'function') {
            window.game.solvePuzzle('front');
        } else {
            console.log('Game object not found, puzzle solved locally');
        }
        
        closeScroll();
        
        // 显示成功提示
        const scrollBtn = document.getElementById('openScrollBtn');
        scrollBtn.textContent = '✅ 回答正确，验证通过';
        scrollBtn.disabled = true;
        scrollBtn.style.background = '#27ae60';
        
        // 显示成功消息
        showFrontPuzzleSuccessModal();
        
        console.log('Front puzzle solved successfully');
    } else {
        // 错误提示
        const selects = [
            document.getElementById('answer1'),
            document.getElementById('answer2'),
            document.getElementById('answer3'),
            document.getElementById('answer4')
        ];
        
        selects.forEach((select, index) => {
            if (userAnswers[index] !== correctAnswers[index]) {
                select.style.borderColor = '#e74c3c';
                select.style.backgroundColor = '#ffebee';
            } else {
                select.style.borderColor = '#27ae60';
                select.style.backgroundColor = '#e8f5e8';
            }
        });
        
        // 显示正确答案
        alert('答案有误！正确答案是：第一空：三，第二空：五，第三空：一，第四空：一');
    }
}

// 显示分享弹窗
function showFrontPuzzleSuccessModal() {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1001';

    modal.innerHTML = `
        <div style="background: #fff; padding: 30px; border-radius: 10px; text-align: center; color: #333; max-width: 90%; width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <h3 style="color: #27ae60; margin-top: 0;">恭喜！</h3>
            <p>您已成功通过封神战力榜单监督管理暂行办法的验证！</p>
            <p>真正的游戏现在开始！</p>
            <p>t _ _ _ _ p _ _ _ _ _ _</p>
            <img src="../assets/wechat.jpg" alt="wechat" style="width: 150px; height: 150px; display: block; margin: 20px auto 10px;">
            <p style="font-size: 14px;">截图分享给好友，邀请他们一同进入封神世界！</p>
            <button id="continueGameBtn" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; font-size: 16px;">继续游戏</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('continueGameBtn').onclick = function() {
        document.body.removeChild(modal);
        unlockOtherWalls();
    };
}

// 上墙分享弹窗
function showTopWallShareModal() {
    const modal = document.createElement('div');
    modal.id = 'topWallShareModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1002'; // Higher than other modals

    modal.innerHTML = `
        <div style="background: #fff; padding: 30px; border-radius: 10px; text-align: center; color: #333; max-width: 90%; width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); position: relative;">
            <span id="closeTopWallModalBtn" style="position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer;">&times;</span>
            <h3 style="color: #9b59b6; margin-top: 0;">有缘者可联系作者解锁</h3>
            <img src="../assets/wechat.jpg" alt="wechat" style="width: 150px; height: 150px; display: block; margin: 20px auto 10px;">
            <p style="font-size: 14px;">_ _ _ n _ _ _ r _ _ _ _,截图分享给好友，看看他们的缘分如何？</p>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
        if (document.getElementById('topWallShareModal')) {
            document.body.removeChild(document.getElementById('topWallShareModal'));
        }
        if (window.markWallCompleted) {
            window.markWallCompleted('top');
        } else {
            console.error('markWallCompleted function not found on window');
        }
    };

    document.getElementById('closeTopWallModalBtn').onclick = closeModal;
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

// 解锁其他墙面的函数
function unlockOtherWalls() {
    console.log('Unlocking other walls...');
    
    // 解锁后墙
    const backBtn = document.querySelector('#backPuzzle .solve-btn');
    if (backBtn) {
        backBtn.disabled = false;
        backBtn.textContent = '🎯 进入法宝争夺战';
        backBtn.style.background = '#3498db';
        backBtn.onclick = () => window.open('games/back-wall.html', '_blank');
    }
    
    // 解锁左墙
    const leftBtn = document.querySelector('#leftPuzzle .solve-btn');
    if (leftBtn) {
        leftBtn.disabled = false;
        leftBtn.textContent = '🔺 开始三角挑战';
        leftBtn.style.background = '#9b59b6';
        leftBtn.onclick = () => window.open('games/left-wall.html', '_blank');
    }
    
    // 解锁右墙
    const rightBtn = document.querySelector('#rightPuzzle .solve-btn');
    if (rightBtn) {
        rightBtn.disabled = false;
        rightBtn.textContent = '🧩 巴RUA废墟在地下等你...';
        rightBtn.style.background = '#e67e22';
        rightBtn.onclick = () => window.open('games/right-wall.html', '_blank');
    }
    
    // 解锁上墙
    const topBtn = document.querySelector('#topPuzzle .solve-btn');
    if (topBtn) {
        topBtn.disabled = false;
        topBtn.textContent = '⬆️ 探索上层';
        topBtn.style.background = '#1abc9c';
        topBtn.onclick = () => {
            console.log('Top button clicked - showing share modal');
            showTopWallShareModal();
        };
    }
    
    // 解锁下墙
    const downBtn = document.querySelector('#bottomPuzzle .solve-btn');
    if (downBtn) {
        downBtn.disabled = false;
        downBtn.textContent = '⬇️ 妲己的尾巴';
        downBtn.style.background = '#e74c3c';
        downBtn.onclick = () => window.open('games/down-wall.html', '_blank');
    }
    
    console.log('All walls unlocked successfully');
}

// 确保函数在全局作用域中可用
window.checkScrollAnswers = checkScrollAnswers;
window.closeScroll = closeScroll;
window.openScroll = openScroll;
window.unlockOtherWalls = unlockOtherWalls;
window.showTopWallShareModal = showTopWallShareModal;