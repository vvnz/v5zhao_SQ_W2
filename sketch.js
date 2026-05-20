let platforms = [
  // { x, y, w, h }
  { x: 0, y: 400, w: 800, h: 40 }, // ground (full width floor)
  { x: 310, y: 370, w: 600, h: 30 }, // left low platform
  { x: 430, y: 330, w: 300, h: 40 }, // centre platform
  { x: 500, y: 265, w: 120, h: 60 }, // left high platform
  { x: 620, y: 290, w: 115, h: 40 }, // far right platform
  {
    x: 220,
    y: 200,
    w: 115,
    h: 40,
    vx: 2,
    minX: 50,
    maxX: 550,
    color: [30, 52, 39],
  }, // moving platform
];

let player = {
  x: 100,
  y: 100,

  vx: 0, // horizontal velocity
  vy: 0, // vertical velocity

  r: 30, // visual radius for blob drawing and collision

  // Movement tuning — change these to adjust how the game feels
  speed: 0.55, // horizontal acceleration per frame
  maxSpeed: 4.5, // maximum horizontal speed
  jumpForce: -12, // upward velocity applied when jumping (negative = upward)
  friction: 0.78, // horizontal slowdown when no key is pressed (0–1, lower = more friction)

  onGround: false, // tracks whether the player is standing on something
};

const GRAVITY = 0.6;

const PLATFORM_COLOR = [255, 160, 50, 0]; // transparent

function preload() {
  mountainImg = loadImage("assets/images/mountainbg.jpg");
  playerImg = loadImage("assets/images/goat.png");
}

function setup() {
  createCanvas(800, 450);

  player.y = platforms[0].y - player.r;
}

function draw() {
  background(mountainImg);

  handleInput();
  applyPhysics();
  resolvePlatformCollisions();

  drawPlatforms();
  drawPlayer();
  drawHUD();
  movePlatforms();
}

function movePlatforms() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    // only move platforms that have vx
    if (p.vx) {
      p.x += p.vx;

      // reverse direction at boundaries
      if (p.x <= p.minX || p.x + p.w >= p.maxX) {
        p.vx *= -1;
      }
    }
  }
}

function handleInput() {
  // --- Horizontal movement ---
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    // LEFT or A
    player.vx -= player.speed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    // RIGHT or D
    player.vx += player.speed;
  }

  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) {
    // UP or W
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

function applyPhysics() {
  // 1. Apply gravity — pulls the player down every frame
  player.vy += GRAVITY;

  // 2. Move player by its current velocity
  player.x += player.vx;
  player.y += player.vy;

  // 3. Keep player inside canvas horizontally
  player.x = constrain(player.x, player.r, width - player.r);

  // 4. If player falls below the canvas, reset to start position
  if (player.y > height + 100) {
    player.x = 100;
    player.y = platforms[0].y - player.r;
    player.vx = 0;
    player.vy = 0;
  }

  // Assume in the air until collision check says otherwise
  player.onGround = false;
}

function resolvePlatformCollisions() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    // Player's bounding box edges
    let playerLeft = player.x - player.r;
    let playerRight = player.x + player.r;
    let playerBottom = player.y + player.r;

    // Platform edges
    let platLeft = p.x;
    let platRight = p.x + p.w;
    let platTop = p.y;

    // 1. Check horizontal overlap
    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;

    // 2 & 3. Check if landing on top (falling down onto the platform surface)
    // The small tolerance (+ 20) prevents the player clipping through
    // fast-moving platforms or getting stuck on edges.
    let landingOnTop =
      player.vy >= 0 && playerBottom >= platTop && playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y = platTop - player.r; // snap to platform surface
      player.vy = 0; // stop falling
      player.onGround = true; // allow jumping again
    }
  }
}

function drawPlatforms() {
  noStroke();

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    if (p.color) {
      fill(p.color[0], p.color[1], p.color[2]);
    } else {
      fill(
        PLATFORM_COLOR[0],
        PLATFORM_COLOR[1],
        PLATFORM_COLOR[2],
        PLATFORM_COLOR[3],
      );
    }

    rect(p.x, p.y, p.w, p.h, 6); // rounded corners
  }
}

function drawPlayer() {
  push(); // save current drawing settings

  imageMode(CENTER);

  image(playerImg, player.x, player.y, player.r * 2, player.r * 2);

  pop(); // restore drawing settings
}

function drawHUD() {
  fill(0, 0, 0);
  noStroke();
  textSize(20);
  textAlign(LEFT);
  text("GOAT GAME \n Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 24);
}
