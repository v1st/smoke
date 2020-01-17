const context = document.getElementById('canvas').getContext('2d', {
  alpha: false
});
const output = document.getElementById('p');

const pool = new Array();
const particles = new Array();

// Classes
class Particle {
  constructor(x, y, radius, rgb_string) {
    this.reset(x, y, radius, rgb_string);
  }

  reset(x, y, radius, rgb_string) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 + 1;
    this.rgb_string = rgb_string;
    this.a = 1;
    this.radius = radius;
  }

  get color() { 
    return `rgb(${this.rgb_string}, ${this.a})`;
  }

  updatePosition() {
    this.a -= 0.005;
    this.x += this.vx;
    this.y -= this.vy;
    this.radius += 0.15;
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  getRGBString() {
    return String(`${this.r}, ${this.g}, ${this.b}`)
  }

  gradualShift() {
    this.r = Math.floor(Math.abs(Math.cos(direction * 0.75) * 256));
    this.g = Math.floor(Math.abs(Math.sin(direction * 0.25) * 256));
    this.b = Math.floor(Math.abs(Math.sin(direction * 0.5) * 256));
  }
}

const color = new Color(0, 0, 0);
let pointer = {
  x: 0,
  y: 0,
  down: false
};
let direction = 0;

// Canvas Loop
function loop() {
  window.requestAnimationFrame(loop);

  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  direction += 0.01;
  color.gradualShift(direction);

  output.style.color = `rgb(${color.getRGBString()})`;
  document.body.style.backgroundColor = output.style.color;

  if (pointer.down) {
    for (let i = 0; i < 2; ++i) {
      let particle = pool.pop();

      if (particle != undefined) {
        particle.reset(pointer.x, pointer.y, Math.floor(Math.random() * 5 + 5), color.getRGBString())
        particles.push(particle);
      } else {
        particles.push(new Particle(pointer.x, pointer.y, Math.floor(Math.random() * 5 + 10), color.getRGBString()));
      }
    }
  }

  for (let i = particles.length - 1; i > -1; --i) {
    let particle = particles[i];

    particle.updatePosition();

    if (particle.a <= 0) {
      pool.push(particles.splice(i, 1)[0])
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = particle.color;
    context.fill();
    context.closePath();
  }

  output.innerHTML = `pool: ${pool.length} <br>live: ${particles.length}`;
}

function resize() {
  context.canvas.width = document.documentElement.clientWidth - 16;
  context.canvas.height = document.documentElement.clientHeight - 16;
}

function mouseDownMoveUp(event) {
  event.preventDefault();

  const rect = context.canvas.getBoundingClientRect();

  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;

  switch (event.type) {
    case "mousedown":
      pointer.down = true;
      break;
    case "mouseup":
      pointer.down = false;
  }
}

function touchEndMoveStart(event) {
  event.preventDefault();

  const rect = context.canvas.getBoundingClientRect();
  let touch = event.targetTouches[0];

  if (touch) {
    pointer.x = touch.clientX - rect.left;
    pointer.y = touch.clientY - rect.top;
  }

  switch (event.type) {
    case "touchstart":
      pointer.down = true;
      break;
    case "touchend":
      pointer.down = false;
  }
}

// Event Listeners
window.addEventListener("resize", resize);
window.addEventListener("mousedown", mouseDownMoveUp);
window.addEventListener("mousemove", mouseDownMoveUp);
window.addEventListener("mouseup", mouseDownMoveUp);

window.addEventListener("touchend", touchEndMoveStart);
window.addEventListener("touchmove", touchEndMoveStart);
window.addEventListener("touchstart", touchEndMoveStart);

resize();
loop();