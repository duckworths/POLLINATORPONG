window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Load images (updated to provided links)
  const leftPaddleImg = new Image();
  leftPaddleImg.src = 'https://mitchellsnursery.com/wp-content/uploads/2024/12/LeftPaddle.png';

  const rightPaddleImg = new Image();
  rightPaddleImg.src = 'https://mitchellsnursery.com/wp-content/uploads/2024/12/RightPaddle-1.png';

  const ballImg = new Image();
  ballImg.src = 'https://mitchellsnursery.com/wp-content/uploads/2024/12/Untitled-design-41.png';

  // Scores
  let leftScore = 0;
  let rightScore = 0;

  // Game states
  let isPaused = false;
  let gameOver = false;
  let winner = null;

  // Game constants (updated sizes)
  const paddleWidth = 40;
  const paddleHeight = 100; 
  const ballRadius = 20; // For a 40px ball, radius is 20
  const gardenBorder = '#5b8a72';
  const paddleSpeed = 5;
  const winningScore = 10;

  // Game objects
  const leftPaddle = { x: 0, y: 0, dy: 0 };
  const rightPaddle = { x: 0, y: 0, dy: 0 };
  const ball = { x: 0, y: 0, dx: 3, dy: 2 };

  // Confetti setup
  const confettiCount = 150;
  const confetti = [];
  const confettiColors = ['#F94144','#F3722C','#F8961E','#F9844A','#F9C74F','#90BE6D','#43AA8B','#4D908E','#577590'];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      w: 5 + Math.random() * 10,
      h: 5 + Math.random() * 10,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speed: 2 + Math.random() * 5
    });
  }

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    resetPositions();
  }

  function resetPositions() {
    leftPaddle.x = 10;
    leftPaddle.y = canvas.height / 2 - paddleHeight / 2;

    rightPaddle.x = canvas.width - paddleWidth - 10;
    rightPaddle.y = canvas.height / 2 - paddleHeight / 2;

    resetBall();
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = 2 * (Math.random() > 0.5 ? 1 : -1);
  }

  // Draw functions
  function drawTitle() {
    ctx.font = '24px Arial';
    ctx.fillStyle = gardenBorder;
    ctx.textAlign = 'center';
    ctx.fillText('POLLINATOR PONG', canvas.width / 2, 30);
  }

  function drawScore() {
    ctx.font = '30px Arial';
    ctx.fillStyle = gardenBorder;
    ctx.textAlign = 'center';
    ctx.fillText(`${leftScore} - ${rightScore}`, canvas.width / 2, 70);
  }

  function drawPaddle(paddle, img) {
    ctx.drawImage(img, paddle.x, paddle.y, paddleWidth, paddleHeight);
  }

  function drawBall() {
    ctx.drawImage(ballImg, ball.x - ballRadius, ball.y - ballRadius, ballRadius * 2, ballRadius * 2);
  }

  function drawNet() {
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = gardenBorder;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
  }

  function drawConfetti() {
    for (const c of confetti) {
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x % canvas.width, c.y, c.w, c.h);
    }
  }

  function updateConfetti() {
    for (const c of confetti) {
      c.y += c.speed;
      if (c.y > canvas.height) {
        c.y = -10;
        c.x = Math.random() * canvas.width;
      }
    }
  }

  function drawWinnerMessage() {
    if (winner) {
      ctx.font = '40px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2);
    }
  }

  // Movement and collision
  function movePaddle(paddle) {
    paddle.y += paddle.dy;
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddleHeight > canvas.height) paddle.y = canvas.height - paddleHeight;
  }

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.y < ballRadius || ball.y > canvas.height - ballRadius) {
    ball.dy *= -1;
  }

  // Paddle collision logic
  let paddleHit = false;
  let paddleCenterY = 0;

  // Check left paddle
  if (
    ball.x - ballRadius <= leftPaddle.x + paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    paddleHit = true;
    paddleCenterY = leftPaddle.y + paddleHeight / 2;
    ball.x = leftPaddle.x + paddleWidth + ballRadius; // Ensure the ball isn't stuck
  }

  // Check right paddle
  if (
    ball.x + ballRadius >= rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    paddleHit = true;
    paddleCenterY = rightPaddle.y + paddleHeight / 2;
    ball.x = rightPaddle.x - ballRadius; // Ensure the ball isn't stuck
  }

  if (paddleHit) {
    // Reverse horizontal direction
    ball.dx *= -1;

    // Determine impact position relative to the paddle center
    const impactPosition = ball.y - paddleCenterY;

    // Spin factor settings
    const spinFactor = 0.1; // Adjust sensitivity to off-center hits
    const randomCurve = (Math.random() - 0.5) * 0.5; // Random vertical tweak

    // Update ball's dy to add vertical "curve"
    ball.dy += impactPosition * spinFactor + randomCurve;

    // Slightly increase ball speed over time
    ball.dx *= 1.03;
    ball.dy *= 1.03;
  }

  // Score update and reset on miss
  if (ball.x < 0) {
    rightScore++;
    checkWinner();
    resetBall();
  }

  if (ball.x > canvas.width) {
    leftScore++;
    checkWinner();
    resetBall();
  }
}


  // Simple CPU logic: move right paddle towards the ball
  function cpuMove() {
    const centerOfPaddle = rightPaddle.y + paddleHeight / 2;
    if (centerOfPaddle < ball.y - 10) {
      rightPaddle.y += 3; // adjust CPU speed here
    } else if (centerOfPaddle > ball.y + 10) {
      rightPaddle.y -= 3;
    }
  }

  function checkWinner() {
    if (leftScore >= winningScore) {
      gameOver = true;
      winner = "Left Player";
    } else if (rightScore >= winningScore) {
      gameOver = true;
      winner = "Right Player";
    }
  }

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'w') leftPaddle.dy = -paddleSpeed;
    if (e.key === 's') leftPaddle.dy = paddleSpeed;
    if (e.key === 'p' || e.key === 'P') isPaused = !isPaused; // Toggle pause with 'P'
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 's') leftPaddle.dy = 0;
  });

  // Touch controls for mobile
  const touchUp = document.getElementById('touchUp');
  const touchDown = document.getElementById('touchDown');

  function handleTouchStartUp() {
    leftPaddle.dy = -paddleSpeed;
  }
  function handleTouchEndUp() {
    if (!touchDownActive) leftPaddle.dy = 0;
  }

  function handleTouchStartDown() {
    leftPaddle.dy = paddleSpeed;
  }
  function handleTouchEndDown() {
    if (!touchUpActive) leftPaddle.dy = 0;
  }

  let touchUpActive = false;
  let touchDownActive = false;

  touchUp.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchUpActive = true;
    handleTouchStartUp();
  }, { passive: false });

  touchUp.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchUpActive = false;
    handleTouchEndUp();
  }, { passive: false });

  touchDown.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchDownActive = true;
    handleTouchStartDown();
  }, { passive: false });

  touchDown.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchDownActive = false;
    handleTouchEndDown();
  }, { passive: false });

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Give focus to the container so key events are captured
  document.getElementById('gameContainer').focus();

  // Game loop
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTitle();
    drawScore();

    if (gameOver) {
      drawConfetti();
      drawWinnerMessage();
      updateConfetti();
    } else {
      drawNet();
      drawPaddle(leftPaddle, leftPaddleImg);
      drawPaddle(rightPaddle, rightPaddleImg);
      drawBall();

      if (!isPaused) {
        movePaddle(leftPaddle);
        cpuMove(); // CPU logic
        moveBall();
      }
    }

    requestAnimationFrame(gameLoop);
  }

  // Initialize and start the game
  resizeCanvas();
  gameLoop();
});
