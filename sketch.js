// 建立一個物件來管理所有動畫的資訊
const animations = {
  waiting: {
    sheet: null,
    totalFrames: 9,
    width: 1246,
    height: 196,
    speed: 5, // 等待動畫速度
  },
  walk: {
    sheet: null,
    totalFrames: 9,
    width: 1246,
    height: 198,
    speed: 5, // 走路動畫速度
  },
  jump: {
    sheet: null,
    totalFrames: 19,
    width: 6360,
    height: 248,
    speed: 5, // 跳躍動畫速度
  },
  crouch: {
    sheet: null,
    totalFrames: 8,
    width: 2155,
    height: 189,
    speed: 5, // 蹲下動畫速度
  },
  run: {
    sheet: null,
    totalFrames: 13,
    width: 2517,
    height: 168,
    speed: 5, // 向左跑動畫速度
  },
  combo: {
    sheet: null,
    totalFrames: 7,
    width: 1822,
    height: 165, // 修正：combo_all.png 的高度是 165
    speed: 5, // 攻擊動畫速度
    isOneShot: true, // 標記為一次性動畫
  },
  fall: {
    sheet: null,
    totalFrames: 9,
    width: 1426,
    height: 193,
    speed: 5, // 倒下動畫速度
    isOneShot: true, // 標記為一次性動畫
  }
};

// 獨立管理光波的動畫資訊
const sonicBoomAnim = {
  sheet: null,
  totalFrames: 5,
  width: 740,
  height: 19, // 修正：sonicboom_all.png 的高度是 19
  speed: 6,
  frameWidth: 0,
  frameHeight: 0,
  projectileSpeed: 15, // 光波自己的移動速度
  projectiles: [] // 用一個陣列來存放所有在畫面上的光波
};

// 建立一個物件來管理第二個角色所有動畫的資訊
const animationsChar2 = {
  stop: {
    sheet: null,
    totalFrames: 6,
    width: 703,
    height: 183,
    speed: 8, // 動畫速度
  },
  spinbirdkick: {
    sheet: null,
    totalFrames: 21,
    width: 5770,
    height: 171,
    speed: 5, // 動畫速度
  },
  fall: {
    sheet: null,
    totalFrames: 12,
    width: 2959,
    height: 171,
    speed: 5, // 倒下動畫速度
    isOneShot: true, // 標記為一次性動畫
  }
};

// 新增第二個角色的屬性
let character2 = {
  x: 0,
  y: 0,
  vx: 0, // 水平速度
  isHit: false, // 是否被擊中
  state: 'stop', // 角色目前的狀態
  animationFrame: 0,
  health: 100, // 生命值
  facing: 1, // 1 表示朝右, -1 表示朝左
  speed: 8, // 移動速度
};

// 角色屬性
let character = {
  x: 0,
  y: 0,
  vx: 0, // 水平速度
  vy: 0, // 垂直速度
  state: 'waiting', // 角色目前的狀態
  animationFrame: 0, // 用於追蹤動畫播放進度
  health: 100, // 生命值
  facing: 1, // 1 表示朝右, -1 表示朝左
  onGround: true,
  speed: 8, // 移動速度
  jumpPower: 25 // 跳躍力量
};

// 環境變數
const groundY = 200; // 地面高度 (從底部算起)
const gravity = 1.2; // 重力
let gameOver = false; // 遊戲是否結束
let winner = null; // 勝利者
let loser = null; // 失敗者
let resetTimer = 0; // 遊戲重置計時器

// --- 待機對話相關變數 ---
let idleTimer = 0; // 用於計算待機時間的計時器
const IDLE_TIMEOUT = 3000; // 3秒待機觸發對話
let isChatting = false; // 是否正在對話
let currentDialogueIndex = 0; // 目前對話的索引
let dialogueDisplayTimer = 0; // 每句對話顯示時間的計時器
const DIALOGUE_DURATION = 2500; // 每句對話顯示 2.5 秒

// 對話內容，可以隨時擴充
let currentDialogueSet = []; // 當前正在播放的對話組

// 建立一個包含多組對話的資料庫
const dialogueSets = [
  [
    { speaker: character, text: "Go home and be a family man!" },
    { speaker: character2, text: "I will, after this." }
  ],
  [
    { speaker: character2, text: "You are not strong enough!" },
    { speaker: character, text: "We'll see about that." }
  ]
];

/**
 * p5.js 的 preload 函數，在 setup() 之前執行。
 * 用於預先載入外部檔案，例如圖片、聲音等。
 */
function preload() {
  // **重要提示**：為了讓 loadImage() 正常運作，您需要透過一個本地伺服器來瀏覽您的網頁，
  // 而不是直接打開 HTML 檔案。推薦使用 VS Code 的 "Live Server" 擴充功能。

  // 預先載入所有動畫的圖片精靈
  for (let state in animations) {
    // 'fall' 狀態的檔名特殊，我們在迴圈外單獨處理
    if (state === 'fall') continue;
    animations[state].sheet = loadImage(`1/${state}/${state}_all.png`);
  }
  // 現在安全地載入 fall 圖片
  animations.fall.sheet = loadImage('1/fall/fallall.png');
  sonicBoomAnim.sheet = loadImage('1/sonicboom/sonicboom_all.png');

  // 預先載入第二個角色的所有動畫圖片
  animationsChar2.stop.sheet = loadImage('2/stop/stopall.png');
  animationsChar2.spinbirdkick.sheet = loadImage('2/spinbirdkick/spinbirdkickall.png');
  animationsChar2.fall.sheet = loadImage('2/fall/fallall.png');
}

/**
 * p5.js 的 setup 函數，只在程式開始時執行一次。
 * 用於初始化設定，例如畫布大小、顏色模式等。
 */
function setup() {
  createCanvas(windowWidth, windowHeight);

  // 動態計算每個動畫的單一畫格寬高
  for (let state in animations) {
    const anim = animations[state];
    anim.frameWidth = anim.width / anim.totalFrames;
    anim.frameHeight = anim.height;
  }

  // 計算光波的畫格尺寸
  sonicBoomAnim.frameWidth = sonicBoomAnim.width / sonicBoomAnim.totalFrames;
  sonicBoomAnim.frameHeight = sonicBoomAnim.height;

  // 動態計算第二個角色每個動畫的單一畫格寬高
  for (let state in animationsChar2) {
    const anim = animationsChar2[state];
    anim.frameWidth = anim.width / anim.totalFrames;
    anim.frameHeight = anim.height;
  }

  // 初始化角色位置在畫面中央底部
  character.x = width / 2;
  character.y = height - groundY;

  // 初始化第二個角色的位置在第一個角色的左邊
  character2.x = width / 2 - 200;
  character2.y = height - groundY;
}
/**
 * 重置遊戲狀態
 */
function resetGame() {
  character.health = 100;
  character2.health = 100;
  character.x = width / 2;
  character2.x = width / 2 - 200;
  gameOver = false;
}

/**
 * p5.js 的 draw 函數，會不斷重複執行。
 * 用於繪製每一幀的畫面。
 */
function draw() {
  background('#1B1B3A');

  if (gameOver) {
    // 如果遊戲結束，顯示訊息並處理重置
    displayGameOver();
    if (millis() > resetTimer) {
      resetGame();
    }
  } else {
    // 遊戲進行中
    handleInputCharacter2(); // 處理角色2的輸入
    updateCharacter2(); // 更新角色2的狀態

    // 根據按鍵狀態更新 currentState
    handleInput(); // 處理輸入
    updateCharacter(); // 更新角色物理狀態

    // 取得目前狀態對應的動畫資料
    drawCharacter();

    // 繪製第二個角色
    drawCharacter2();

    // 更新並繪製所有光波
    drawProjectiles();

    // 檢查遊戲結束條件
    checkGameOver();

    // 處理待機對話邏輯
    handleIdleChat();

    // 檢查碰撞
    checkCollisions();
  }

  // 無論遊戲是否結束，都繪製生命條和操作說明
  drawHealthBars();

  // 繪製操作說明
  drawInstructions();
}

/**
 * 處理待機對話的邏輯
 */
function handleIdleChat() {
  // 檢查兩個角色是否都處於待機狀態
  const isIdle = character.state === 'waiting' && character2.state === 'stop';

  if (isIdle && !isChatting) {
    // 如果處於待機且尚未開始計時，則開始計時
    if (idleTimer === 0) {
      idleTimer = millis();
    }
    // 如果待機時間超過設定的閾值，則開始對話
    else if (millis() - idleTimer > IDLE_TIMEOUT) {
      isChatting = true;
      // 從資料庫中隨機挑選一組對話
      currentDialogueSet = random(dialogueSets);
      currentDialogueIndex = 0;
      dialogueDisplayTimer = millis(); // 開始第一句對話的計時
    }
  } else if (!isIdle) {
    // 如果任一方移動，則重置所有待機和對話狀態
    idleTimer = 0;
    isChatting = false;
  }

  // 如果正在對話，則繪製對話框
  if (isChatting) {
    // 檢查是否該顯示下一句對話
    if (millis() - dialogueDisplayTimer > DIALOGUE_DURATION) {
      currentDialogueIndex++;
      dialogueDisplayTimer = millis(); // 重置下一句的計時器
    }

    // 如果對話結束，則停止對話狀態
    if (currentDialogueIndex >= currentDialogueSet.length) {
      isChatting = false;
      idleTimer = 0; // 重置待機計時器，避免立即再次觸發
      return;
    }

    // 繪製當前的對話
    const dialogue = currentDialogueSet[currentDialogueIndex];
    drawChatBubble(dialogue.speaker, dialogue.text);
  }
}

/**
 * 在指定角色頭上繪製對話框
 * @param {object} speaker - 說話的角色物件 (character 或 character2)
 * @param {string} text - 要顯示的文字
 */
function drawChatBubble(speaker, text) {
  // --- 全新的對話框繪製邏輯 ---
  push();
  
  // --- 1. 設定對話框樣式 ---
  const bubbleX = speaker.x;
  const bubbleY = speaker.y - 260; // 將對話框整體上移一點
  const bubblePadding = 20;
  const bubbleHeight = 50;
  const tailSize = 15;

  textSize(18);
  textFont('Arial'); // 改用更通用的字體，避免載入失敗
  const bubbleWidth = textWidth(text) + bubblePadding * 2;

  // --- 2. 繪製對話框主體與邊框 ---
  fill(30, 50, 150, 220); // 深藍色背景，半透明
  stroke(255); // 白色邊框
  strokeWeight(3);
  rectMode(CENTER);
  rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10); // 圓角矩形

  // --- 3. 繪製指向角色的小尾巴 ---
  noStroke(); // 尾巴不需要邊框
  fill(30, 50, 150, 220); // 與背景同色
  triangle(
    bubbleX - tailSize, bubbleY + bubbleHeight / 2,
    bubbleX + tailSize, bubbleY + bubbleHeight / 2,
    speaker.x, speaker.y - 200 // 尾巴尖端指向角色頭頂
  );

  // --- 4. 繪製文字 ---
  // 將文字繪製放在最後，並使用獨立的設定，避免互相影響
  noStroke();
  fill(255); // 白色文字
  textAlign(CENTER, CENTER);
  text(text, bubbleX, bubbleY);
  pop();
}

/**
 * 顯示遊戲結束畫面
 */
function displayGameOver() {
  push();
  fill(255, 223, 0);
  textSize(80);
  textAlign(CENTER, CENTER);
  textFont('Impact');
  text(`${loser} LOSES`, width / 2, height / 2);
  pop();
}

/**
 * 根據按鍵輸入更新角色2的狀態
 */
function handleInputCharacter2() {
  // 如果正在播放一次性動畫(如被擊中)，則不接受其他移動輸入
  const currentIsOneShot = animationsChar2[character2.state] && animationsChar2[character2.state].isOneShot;
  if (currentIsOneShot) {
    character2.vx = 0; // 被擊中時停止移動
    return;
  }

  // 如果正在聊天，任何移動都會中斷聊天
  if (isChatting) {
    // 如果正在聊天，檢查是否有按鍵輸入來中斷它
    if (keyIsDown(68) || keyIsDown(65)) {
    isChatting = false;
    idleTimer = 0;
    }
    return; // 正在聊天時，直接返回，不處理移動
  }


  let newState = 'stop'; // 預設為停止
  character2.vx = 0; // 預設水平速度為 0

  if (keyIsDown(68)) { // 'D' 鍵
    newState = 'spinbirdkick';
    character2.vx = character2.speed;
    character2.facing = 1;
  } else if (keyIsDown(65)) { // 'A' 鍵
    newState = 'spinbirdkick';
    character2.vx = -character2.speed;
    character2.facing = -1;
  }

  // 如果狀態改變了，就重置動畫計時器
  if (character2.state !== newState) {
    character2.state = newState;
    character2.animationFrame = 0;
  }

  // 為了讓角色在移動時也能翻轉，即使狀態沒變也要更新方向
  if (newState === 'spinbirdkick') character2.facing = (character2.vx > 0) ? 1 : -1;
}

/**
 * 根據按鍵輸入更新角色狀態
 */
function handleInput() {
  // 如果正在播放一次性動畫(如攻擊)，則不接受其他移動輸入
  const currentIsOneShot = animations[character.state]?.isOneShot;
  if (currentIsOneShot) {
    character.vx = 0; // 攻擊時停止移動
    return;
  }

  // 如果正在聊天，任何移動都會中斷聊天
  if (isChatting) {
    // 如果正在聊天，檢查是否有按鍵輸入來中斷它
    if (keyIsDown(UP_ARROW) || keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW) || keyIsDown(DOWN_ARROW)) {
    isChatting = false;
    idleTimer = 0;
    }
    return; // 正在聊天時，直接返回，不處理移動
  }

  let newState = 'waiting'; // 預設為等待
  character.vx = 0; // 預設水平速度為 0

  if (keyIsDown(UP_ARROW) && character.onGround) {
    character.vy = -character.jumpPower;
    character.onGround = false;
    newState = 'jump';
  } else if (keyIsDown(RIGHT_ARROW)) {
    newState = 'walk';
    character.vx = character.speed;
    character.facing = 1;
  } else if (keyIsDown(LEFT_ARROW)) {
    newState = 'run';
    character.vx = -character.speed;
    character.facing = -1;
  } else if (keyIsDown(DOWN_ARROW)) {
    newState = 'crouch';
  }

  // 如果狀態改變了，就重置動畫計時器
  if (character.state !== newState && !currentIsOneShot) {
    character.state = newState;
    character.animationFrame = 0;
  }
}

/**
 * 處理一次性的按鍵事件 (例如攻擊)
 */
function keyPressed() {
  // 如果正在聊天，攻擊也會中斷聊天
  if (isChatting) {
    // 任何按鍵（包括攻擊）都會中斷聊天
    isChatting = false;
    idleTimer = 0;
    if (key !== ' ') return; // 如果不是攻擊鍵，就直接返回
  }

  // 如果按下空白鍵，且角色不處於一次性動畫中
  if (key === ' ' && !animations[character.state].isOneShot) {
    character.state = 'combo';
    character.animationFrame = 0; // 重置動畫

    // 建立一個新的光波物件
    const newBoom = {
      x: character.x,
      y: character.y - 80, // 調整光波的初始 Y 軸位置
      facing: character.facing, // 光波方向與角色一致
    };
    sonicBoomAnim.projectiles.push(newBoom);
  }
}

/**
 * 更新角色位置與物理狀態
 */
function updateCharacter() {
  // 套用速度
  character.x += character.vx;
  character.y += character.vy;

  // 套用重力 (如果不在地面上)
  if (!character.onGround) {
    character.vy += gravity;
  }

  // 地面碰撞檢測
  if (character.y >= height - groundY) {
    character.y = height - groundY;
    character.vy = 0;
    character.onGround = true;
    if (character.state === 'jump') { // 如果是從跳躍狀態落地
      character.state = 'waiting';
    }
  }

  // 畫布邊界檢測
  const currentWidth = animations[character.state] ? animations[character.state].frameWidth : 50;
  character.x = constrain(character.x, currentWidth / 2, width - currentWidth / 2);
}

/**
 * 繪製角色
 */
function drawCharacter() {
  const currentAnimation = animations[character.state];
  character.animationFrame++; // 更新動畫計時器

  // 計算當前畫格
  let currentFrame = floor(character.animationFrame / currentAnimation.speed);

  // 如果是一次性動畫且已播放完畢
  if (currentAnimation && currentAnimation.isOneShot && currentFrame >= currentAnimation.totalFrames) {
    character.state = 'waiting'; // 回到等待狀態
    character.animationFrame = 0;
    // 重新取得動畫資料
    const waitingAnimation = animations['waiting'];
    currentFrame = floor(character.animationFrame / waitingAnimation.speed) % waitingAnimation.totalFrames;
  } else {
    currentFrame %= currentAnimation.totalFrames;
  }

  // 繪製角色
  push(); // 開始一個新的繪圖狀態
  translate(character.x, character.y); // 將原點移動到角色位置
  scale(character.facing, 1); // 根據角色朝向翻轉 X 軸
  image( // 繪製位置微調，讓角色底部對齊 y 座標
    currentAnimation.sheet,
    -currentAnimation.frameWidth / 2, -currentAnimation.frameHeight, // 繪製位置微調
    currentAnimation.frameWidth, currentAnimation.frameHeight,
    currentFrame * currentAnimation.frameWidth, 0,
    currentAnimation.frameWidth, currentAnimation.frameHeight
  );
  pop(); // 恢復繪圖狀態
}

/**
 * 更新角色2位置與物理狀態
 */
function updateCharacter2() {
  // 套用速度
  character2.x += character2.vx;

  // 畫布邊界檢測
  const currentWidth = animationsChar2[character2.state] ? animationsChar2[character2.state].frameWidth : 50;
  character2.x = constrain(character2.x, currentWidth / 2, width - currentWidth / 2);
}

/**
 * 繪製第二個角色
 */
function drawCharacter2() {
  let currentAnimation = animationsChar2[character2.state];
  character2.animationFrame++; // 更新動畫計時器

  // 計算當前畫格
  let currentFrame = floor(character2.animationFrame / currentAnimation.speed);

  // 如果是一次性動畫且已播放完畢
  if (currentAnimation && currentAnimation.isOneShot && currentFrame >= currentAnimation.totalFrames) {
    character2.state = 'stop'; // 回到站立狀態
    character2.animationFrame = 0;
    // 重新取得動畫資料
    currentAnimation = animationsChar2['stop'];
    currentFrame = floor(character2.animationFrame / currentAnimation.speed) % currentAnimation.totalFrames;
  } else {
    // 讓動畫循環播放
    currentFrame %= currentAnimation.totalFrames;
  }

  // 繪製角色
  push();
  translate(character2.x, character2.y);
  scale(character2.facing, 1); // 根據角色朝向翻轉 X 軸
  image(
    currentAnimation.sheet,
    -currentAnimation.frameWidth / 2, -currentAnimation.frameHeight, // 繪製位置微調，讓角色底部對齊 y 座標
    currentAnimation.frameWidth, currentAnimation.frameHeight,
    currentFrame * currentAnimation.frameWidth, 0,
    currentAnimation.frameWidth, currentAnimation.frameHeight
  );
  pop();
}

/**
 * 繪製與更新所有光波
 */
function drawProjectiles() {
  for (let i = sonicBoomAnim.projectiles.length - 1; i >= 0; i--) {
    const boom = sonicBoomAnim.projectiles[i];

    // 更新光波位置
    boom.x += sonicBoomAnim.projectileSpeed * boom.facing;

    // --- 碰撞偵測 ---
    const char2Anim = animationsChar2[character2.state];
    const char2Width = char2Anim.frameWidth;
    const char2Left = character2.x - char2Width / 2;
    const char2Right = character2.x + char2Width / 2;

    // 檢查光波是否在角色2的水平範圍內
    if (boom.x > char2Left && boom.x < char2Right) {
      // 檢查角色2是否處於可被攻擊的狀態
      if (character2.state !== 'fall') {
        character2.state = 'fall'; // 改變角色2狀態為倒下
        character2.health -= 20; // 扣除生命值
        character2.animationFrame = 0; // 重置動畫
        character2.facing = -boom.facing; // 被打到後轉向
        sonicBoomAnim.projectiles.splice(i, 1); // 移除光波
        continue; // 繼續下一個循環，避免繪製已移除的光波
      }
    }

    // 繪製光波動畫
    const boomFrame = floor(frameCount / sonicBoomAnim.speed) % sonicBoomAnim.totalFrames;
    push();
    translate(boom.x, boom.y);
    scale(boom.facing, 1);
    image(
      sonicBoomAnim.sheet,
      -sonicBoomAnim.frameWidth / 2, -sonicBoomAnim.frameHeight / 2,
      sonicBoomAnim.frameWidth, sonicBoomAnim.frameHeight,
      boomFrame * sonicBoomAnim.frameWidth, 0,
      sonicBoomAnim.frameWidth, sonicBoomAnim.frameHeight
    );
    pop();

    // 如果光波移出畫面，就從陣列中移除它
    if (boom.x > width + 100 || boom.x < -100) {
      sonicBoomAnim.projectiles.splice(i, 1);
    }
  }
}

/**
 * 檢查角色之間的碰撞
 */
function checkCollisions() {
  // 檢查角色2是否正在攻擊 (spinbirdkick) 且角色1是否可被攻擊
  if (character2.state === 'spinbirdkick' && character.state !== 'fall') {
    const char1Anim = animations[character.state];
    const char2Anim = animationsChar2[character2.state];

    // 計算角色1的邊界
    const char1Width = char1Anim.frameWidth;
    const char1Left = character.x - char1Width / 2;
    const char1Right = character.x + char1Width / 2;

    // 計算角色2的攻擊範圍 (這裡用一個簡化的矩形)
    const char2AttackWidth = char2Anim.frameWidth;
    const char2AttackLeft = character2.x - char2AttackWidth / 2;
    const char2AttackRight = character2.x + char2AttackWidth / 2;

    // 檢查兩個矩形是否重疊
    if (char1Left < char2AttackRight && char1Right > char2AttackLeft) {
      character.health -= 20; // 扣除生命值
      character.state = 'fall'; // 改變角色1狀態為倒下
      character.animationFrame = 0; // 重置動畫
    }
  }
}

/**
 * 檢查遊戲是否結束
 */
function checkGameOver() {
  if (character.health <= 0) {
    gameOver = true;
    loser = 'Guile';
    resetTimer = millis() + 3000; // 3秒後重置
  } else if (character2.health <= 0) {
    gameOver = true;
    loser = 'Chun-Li';
    resetTimer = millis() + 3000; // 3秒後重置
  }
}

/**
 * 繪製生命條
 */
function drawHealthBars() {
  const barWidth = width / 2.5;
  const barHeight = 40;
  const margin = 30;

  // --- 角色1 生命條 (左) ---
  push();
  noStroke();
  fill(100, 0, 0, 200);
  rect(margin, margin, barWidth, barHeight, 5);
  const p1HealthWidth = max(0, (barWidth * character.health) / 100);
  fill(255, 223, 0); // 黃色
  rect(margin, margin, p1HealthWidth, barHeight, 5);
  pop();

  // --- 角色2 生命條 (右) ---
  push();
  noStroke();
  const p2X = width - barWidth - margin;
  fill(100, 0, 0, 200);
  rect(p2X, margin, barWidth, barHeight, 5);
  const p2HealthWidth = max(0, (barWidth * character2.health) / 100);
  fill(255, 223, 0); // 黃色
  rect(p2X + (barWidth - p2HealthWidth), margin, p2HealthWidth, barHeight, 5);
  pop();
}

/**
 * 繪製操作說明
 */
function drawInstructions() {
  push();
  fill(255, 255, 255, 200); // 半透明白色
  stroke(0, 150); // 半透明黑色邊框
  rect(10, 10, 220, 115, 10); // 圓角矩形
  rect(10, 135, 220, 55, 10); // 角色2的說明框

  fill(0);
  noStroke();
  textSize(14);
  textFont('Arial');
  textAlign(LEFT, TOP);
  
  text('角色1 (Guile)', 20, 20);
  const instructions = [
    '←: 向左跑 (Run)',
    '→: 向右走 (Walk)',
    '↑: 跳躍 (Jump)',
    '↓: 蹲下 (Crouch)',
    '空白鍵: 攻擊 (Combo)'
  ];
  text(instructions.join('\n'), 20, 40);

  text('角色2 (Chun-Li)', 20, 145);
  const instructions2 = [
    'A: 向左移動',
    'D: 向右移動',
  ];
  text(instructions2.join('\n'), 20, 165);
  pop();
}

/**
 * 當瀏覽器視窗大小改變時，p5.js 會自動呼叫此函數。
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
