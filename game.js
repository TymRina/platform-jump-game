// 游戏常量
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLATFORM_SPEED = 2;
const SPAWN_RATE = 30; // 每30帧生成一个平台
const STAR_SPAWN_RATE = 60; // 每60帧生成一个星星
const STAR_SIZE = 20;
const STAR_SPEED = 1; // 星星下落速度
const STAR_SCORE = 100; // 吃到星星的分数
const BOMB_SPAWN_RATE = 240; // 每240帧生成一个炸弹，数量减少一半
const BOMB_SIZE = 25;
const BOMB_SPEED = 1; // 炸弹下落速度
const BOMB_PENALTY = 500; // 碰到炸弹的扣分
const TIME_SCORE_RATE = 10; // 每秒加分

// 游戏状态
let canvas, ctx;
let player;
let platforms;
let stars;
let bombs;
let score;
let gameOver;
let isPlaying;
let keys;
let frameCount;
let lastTimeScore;

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 初始化玩家
    player = {
        x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - 200,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        velocityY: 0,
        velocityX: 0
    };
    
    // 初始化平台
    platforms = [];
    // 首先在玩家脚下固定生成一个平台
    platforms.push({
        x: GAME_WIDTH / 2 - PLATFORM_WIDTH / 2,
        y: player.y + player.height + 10,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT
    });
    // 然后生成其他随机平台
    for (let i = 1; i < 5; i++) {
        const platformX = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
        const platformY = GAME_HEIGHT - 50 - i * 120;
        platforms.push({
            x: platformX,
            y: platformY,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT
        });
    }
    
    // 初始化游戏状态
    score = 0;
    gameOver = false;
    isPlaying = false;
    keys = {};
    frameCount = 0;
    stars = [];
    bombs = [];
    lastTimeScore = Date.now();
    
    // 事件监听
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
    
    // 开始游戏按钮
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // 重新开始按钮
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // 显示开始屏幕
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('game-over').style.display = 'none';
    
    // 绘制初始画面
    draw();
}

// 游戏循环
function gameLoop() {
    if (!gameOver && isPlaying) {
        update();
        draw();
        frameCount++;
        requestAnimationFrame(gameLoop);
    }
}

// 更新游戏状态
function update() {
    // 生成平台
    if (frameCount % SPAWN_RATE === 0) {
        const platformX = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
        platforms.push({
            x: platformX,
            y: -PLATFORM_HEIGHT,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT
        });
    }
    
    // 生成星星
    if (frameCount % STAR_SPAWN_RATE === 0) {
        const starX = Math.random() * (GAME_WIDTH - STAR_SIZE);
        stars.push({
            x: starX,
            y: -STAR_SIZE,
            size: STAR_SIZE,
            rotation: 0
        });
    }
    
    // 生成炸弹
    if (frameCount % BOMB_SPAWN_RATE === 0) {
        const bombX = Math.random() * (GAME_WIDTH - BOMB_SIZE);
        bombs.push({
            x: bombX,
            y: -BOMB_SIZE,
            size: BOMB_SIZE,
            rotation: 0
        });
    }
    
    // 玩家移动
    player.velocityX = 0;
    if (keys['ArrowLeft']) {
        player.velocityX = -5;
    }
    if (keys['ArrowRight']) {
        player.velocityX = 5;
    }
    
    // 应用重力
    player.velocityY += GRAVITY;
    
    // 更新玩家位置
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // 边界检测
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > GAME_WIDTH) {
        player.x = GAME_WIDTH - player.width;
    }
    
    // 平台碰撞检测
    let onPlatform = false;
    platforms.forEach(platform => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            onPlatform = true;
        }
    });
    
    // 玩家跳跃
    if (keys['Space'] && onPlatform) {
        player.velocityY = JUMP_FORCE;
    }
    
    // 星星碰撞检测
    stars = stars.filter(star => {
        if (
            player.x < star.x + star.size &&
            player.x + player.width > star.x &&
            player.y < star.y + star.size &&
            player.y + player.height > star.y
        ) {
            // 吃到星星，加分
            score += STAR_SCORE;
            return false; // 从数组中移除星星
        }
        return true;
    });
    
    // 炸弹碰撞检测
    bombs = bombs.filter(bomb => {
        if (
            player.x < bomb.x + bomb.size &&
            player.x + player.width > bomb.x &&
            player.y < bomb.y + bomb.size &&
            player.y + player.height > bomb.y
        ) {
            // 碰到炸弹，扣分
            score = Math.max(0, score - BOMB_PENALTY); // 确保分数不会小于0
            return false; // 从数组中移除炸弹
        }
        return true;
    });
    
    // 更新平台位置
    platforms.forEach(platform => {
        platform.y += PLATFORM_SPEED;
    });
    
    // 更新星星位置和旋转
    stars.forEach(star => {
        star.y += STAR_SPEED;
        star.rotation += 0.05; // 顺时针旋转
    });
    
    // 更新炸弹位置和旋转
    bombs.forEach(bomb => {
        bomb.y += BOMB_SPEED;
        bomb.rotation += 0.08; // 顺时针旋转，速度比星星快
    });
    
    // 移除超出屏幕的平台、星星和炸弹
    platforms = platforms.filter(platform => platform.y < GAME_HEIGHT);
    stars = stars.filter(star => star.y < GAME_HEIGHT);
    bombs = bombs.filter(bomb => bomb.y < GAME_HEIGHT);
    
    // 时间加分（每秒10分）
    const currentTime = Date.now();
    if (currentTime - lastTimeScore >= 1000) {
        score += TIME_SCORE_RATE;
        lastTimeScore = currentTime;
    }
    
    // 游戏结束检测
    if (player.y > GAME_HEIGHT) {
        gameOver = true;
        showGameOver();
    }
    
    // 更新分数显示
    document.getElementById('score-display').textContent = `分数: ${score}`;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 绘制地刺
    ctx.fillStyle = '#ff4444';
    for (let i = 0; i < GAME_WIDTH; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, GAME_HEIGHT);
        ctx.lineTo(i + 10, GAME_HEIGHT - 20);
        ctx.lineTo(i + 20, GAME_HEIGHT);
        ctx.fill();
    }
    
    // 绘制星星
    ctx.fillStyle = '#ffeb3b';
    stars.forEach(star => {
        ctx.save();
        ctx.translate(star.x + star.size / 2, star.y + star.size / 2);
        ctx.rotate(star.rotation);
        ctx.beginPath();
        const outerRadius = star.size / 2;
        const innerRadius = outerRadius * 0.382; // 黄金比例，使五角星更美观
        
        for (let i = 0; i < 5; i++) {
            // 计算外点（尖角）
            const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const outerX = outerRadius * Math.cos(outerAngle);
            const outerY = outerRadius * Math.sin(outerAngle);
            
            // 计算内点（凹角）
            const innerAngle = ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2;
            const innerX = innerRadius * Math.cos(innerAngle);
            const innerY = innerRadius * Math.sin(innerAngle);
            
            if (i === 0) {
                ctx.moveTo(outerX, outerY);
            } else {
                ctx.lineTo(outerX, outerY);
            }
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });
    
    // 绘制炸弹
    ctx.fillStyle = '#ff4444';
    bombs.forEach(bomb => {
        ctx.save();
        ctx.translate(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2);
        ctx.rotate(bomb.rotation);
        
        // 绘制炸弹主体
        ctx.beginPath();
        ctx.arc(0, 0, bomb.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制炸弹引线
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -bomb.size / 2);
        ctx.lineTo(0, -bomb.size);
        ctx.stroke();
        
        // 绘制炸弹导火索
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.arc(0, -bomb.size, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
    
    // 绘制平台
    ctx.fillStyle = '#4CAF50';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // 绘制玩家
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// 显示游戏结束
function showGameOver() {
    document.getElementById('final-score').textContent = `分数: ${score}`;
    document.getElementById('game-over').style.display = 'block';
}

// 开始游戏
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    isPlaying = true;
    gameLoop();
}

// 重新开始游戏
function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    init();
}

// 启动游戏
window.addEventListener('load', init);