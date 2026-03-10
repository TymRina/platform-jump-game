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

// 游戏状态
let canvas, ctx;
let player;
let platforms;
let score;
let gameOver;
let keys;
let frameCount;

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
    keys = {};
    frameCount = 0;
    
    // 事件监听
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
    
    // 重新开始按钮
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // 开始游戏循环
    gameLoop();
}

// 游戏循环
function gameLoop() {
    if (!gameOver) {
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
    
    // 更新平台位置
    platforms.forEach(platform => {
        platform.y += PLATFORM_SPEED;
    });
    
    // 移除超出屏幕的平台
    platforms = platforms.filter(platform => platform.y < GAME_HEIGHT);
    
    // 游戏结束检测
    if (player.y > GAME_HEIGHT) {
        gameOver = true;
        showGameOver();
    }
    
    // 更新分数
    score++;
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

// 重新开始游戏
function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    init();
}

// 启动游戏
window.addEventListener('load', init);