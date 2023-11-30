let system;
let points = 0;

let rectX;
let rectY;
let rectSpeed;

let rotateAngles = [0, 0];

let blocks = [];
let blockWidth;

let ballX;
let ballY;
let ballSpeedX;
let ballSpeedY = 5;

let fullX = false;
let fullY = false;
let leftX = false;
let rightX = false;
let topY = false;
let bottomY = false;

let colors = ["#007a7a", "#008b8b", "#00a1a1", "#00d6d6", "cyan"];
let activeBlocks = 0;

let started = false;
let gameEnded = false;

let ballSpeedMult = 1;
let blockSizeMult = 1;
let blockSpeedMult = 1;

let pickUps = [];

function setup() {
  system = new ParticleSystem(createVector(width / 2, 50));

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.querySelector("body"));

  rectX = windowWidth / 2;
  rectY = windowHeight - 60;

  ballX = windowWidth / 2;
  ballY = windowHeight / 2 + 50;

  if (Math.random() <= 0.5) {
    ballSpeedX = -4;
  } else {
    ballSpeedX = 4;
  }

  //calculate speed based on window width
  rectSpeed = Math.ceil(windowWidth / 1000) * 4;

  blockWidth = Math.round((windowWidth - (Math.floor(windowWidth / 105) - 1) * 5) / Math.floor(windowWidth / 105));

  //filling block array with rectangles
  for (let i = 0; i < Math.floor(windowWidth / 105); i++) {
    for (let j = 0; j < 5; j++) {
      blocks.push([i * (blockWidth + 5), 35 * j, true, new ParticleSystem(createVector(i * (blockWidth + 5) + blockWidth * 0.5, 35 * j + 15)), 0]);
    }
  }
}
function draw() {
  background(39);
  noStroke();
  fill(170);
  rectMode(CENTER);
  activeBlocks = 0;
  for (let i = 0; i < blocks.length; i++) {
    blocks[i][3].run();
    if (!blocks[i][2] && blocks[i][4] < 1) {
      for (let j = 0; j < 20; j++) {
        blocks[i][3].addParticle();
      }
      blocks[i][4]++;
    }
    if (!blocks[i][2]) continue;
    activeBlocks++;
    //calculating which walls is the ball touching
    fullX = ballX <= blocks[i][0] + blockWidth + 15 && ballX >= blocks[i][0] - 15;
    fullY = ballY <= blocks[i][1] + 30 + 15 && ballY >= blocks[i][1] - 15;

    bottomY = ballY >= blocks[i][1] + 30 && ballY <= blocks[i][1] + 40;
    topY = ballY >= blocks[i][1] - 25 && ballY <= blocks[i][1] - 15;

    leftX = ballX <= blocks[i][0] - 5 && ballX >= blocks[i][0] - 15;
    rightX = ballX <= blocks[i][0] + blockWidth + 15 && ballX >= blocks[i][0] + blockWidth + 5;

    //checking for ball-block collision
    if ((fullX && bottomY) || (fullX && topY)) {
      ballSpeedY *= -1;
      blocks[i][2] = false;
      points++;
      spawnPickUp(blocks[i][0], blocks[i][1]);
      blinkClr();
      continue;
    }
    if ((fullY && leftX) || (fullY && rightX)) {
      ballSpeedX *= -1;
      blocks[i][2] = false;
      points++;
      spawnPickUp(blocks[i][0], blocks[i][1]);
      blinkClr();
      continue;
    }
    fill(colors[i % 5]);
    rect(blocks[i][0] + Math.floor(blockWidth / 2), blocks[i][1] + 15, blockWidth, 30, 1);
  }

  for (let i = 0; i < pickUps.length; i++) {
    const p = pickUps[i];
    if (p.used) continue;

    p.update();
    p.checkCollision();
    p.draw();
  }

  fill(170);

  document.querySelector(".points").innerText = points;

  if (activeBlocks == 0 && !gameEnded) {
    end();
    gameEnded = true;
  }

  //drawing ball
  circle(ballX, ballY, 30);
  if (started) {
    ballX += ballSpeedX * ballSpeedMult;
    ballY += ballSpeedY * ballSpeedMult;
  }

  //checking for ball-paddle collision
  if (ballX < rectX + 70 * blockSizeMult && ballX > rectX - 70 * blockSizeMult && ballY >= rectY - 20 && ballY < rectY) {
    ballSpeedY *= -1;
    ballSpeedX += Math.round(map(Math.random(), 0, 1, -1, 1)) * Math.abs(Math.round(map(ballX - rectX, -70, 70, -1, 1))); //if the ball is close to the edge, it will change speed
  }

  //checking for ball-ceiling collision
  if (ballY <= 15) {
    ballSpeedY *= -1;
  }

  //checking for ball-wall collision
  if (ballX <= 15 || ballX >= width - 15) {
    ballSpeedX *= -1;
  }

  if (ballY >= windowHeight && !gameEnded) {
    gameEnded = true;
    document.querySelector(".win #winState").innerText = "You Lost";
    end();
  }

  //user input
  if (keyIsDown(RIGHT_ARROW)) {
    rectX = constrain(rectX + rectSpeed * blockSpeedMult, 60, windowWidth - 60);
  }
  if (keyIsDown(LEFT_ARROW)) {
    rectX = constrain(rectX - rectSpeed * blockSpeedMult, 60, windowWidth - 60);
  }

  //drawing paddle
  rect(rectX, rectY, 120 * blockSizeMult, 10);
}

const end = () => {
  document.querySelector(".win").classList.add("active");
  let destroyedBlocks = 0;
  blocks.forEach((block) => {
    if (block[2] == false) {
      destroyedBlocks++;
    }
  });
  document.querySelector("#valueS").innerText = destroyedBlocks;
  if (localStorage.getItem("highscore") == null || parseInt(localStorage.getItem("highscore")) < destroyedBlocks) {
    localStorage.setItem("highscore", destroyedBlocks);
  }
  document.querySelector("#valueH").innerText = localStorage.getItem("highscore");
};
document.querySelector(".win button").addEventListener("click", () => {
  document.location.reload(false);
});

const blinkClr = () => {
  if (!document.querySelector(".hexagon").classList.contains("active")) {
    document.querySelector(".hexagon").classList.add("active");
  }
  if (!document.querySelector(".triangle").classList.contains("active")) {
    document.querySelector(".triangle").classList.add("active");
  }
};
document.querySelector(".hexagon").addEventListener("animationend", () => {
  document.querySelector(".hexagon").classList.remove("active");
});
document.querySelector(".triangle").addEventListener("animationend", () => {
  document.querySelector(".triangle").classList.remove("active");
});

window.addEventListener("keydown", (e) => {
  if (e.code != "") {
    document.querySelector(".wait").style.display = "none";
    started = true;
  }
  if (e.code == "Enter" && document.querySelector(".win").classList.contains("active")) {
    document.location.reload(false);
  }
});

const spawnPickUp = (x, y) => {
  if (Math.random() <= 0.7) return;

  switch (Math.round(Math.random() * 2)) {
    case 0:
      pickUps.push(new PickUp(x, y, 0));
      break;
    case 1:
      pickUps.push(new PickUp(x, y, 2));
      break;
    case 2:
      pickUps.push(new PickUp(x, y, 1));
      break;
  }
};

class PickUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.used = false;
  }

  update = () => {
    this.y += 1;
  };

  draw = () => {
    let color;
    switch (this.type) {
      case 0:
        color = "#4287f5";
        break;
      case 1:
        color = "#9e42f5";
        break;
      case 2:
        color = "#42f5dd";
        break;
    }
    fill(color);
    circle(this.x, this.y, 20);
    fill(170);
  };

  checkCollision = () => {
    if (this.x < rectX + 70 * blockSizeMult && this.x > rectX - 70 * blockSizeMult && this.y >= rectY - 20 && this.y < rectY) {
      switch (this.type) {
        case 0:
          ballSpeedMult += 0.1;
          break;
        case 1:
          blockSizeMult += 0.1;
          break;
        case 2:
          blockSpeedMult += 0.1;
          break;
      }
      this.used = true;
    }
  };
}

let interval = setInterval(() => {
  window.scrollTo(0, 0);
}, 10);
setTimeout(() => {
  clearInterval(interval);
}, 1000);

// A simple Particle class
let Particle = function (position) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-2, 2), random(-2, 2));
  this.position = position.copy();
  this.lifespan = 100;
};

Particle.prototype.run = function () {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  stroke(0, 255, 255, this.lifespan);
  strokeWeight(2);
  fill("rgba(1,1,1,0)");
  rect(this.position.x, this.position.y, 12, 12);
  noStroke();
  fill(170);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  return this.lifespan < 0;
};

let ParticleSystem = function (position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function () {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function () {
  for (let i = this.particles.length - 1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};
