
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
const toggleBtn = document.getElementById("toggleSettings");
const controls = document.getElementById("controls");
const themeOptions = document.querySelectorAll("[data-theme]");
const cursor = document.getElementById("xyCursor");
const xyPad = document.getElementById("xyPad");
const rowRange = document.getElementById("rowRange");
const colRange = document.getElementById("colRange");

let theme = "dark";
let mouse = { x: 0, y: 0, active: false };
let scaleX = 2, scaleY = 0.5;
let rows = parseInt(rowRange.value);
const radiusSlider = document.getElementById("radiusRange");
let effectRadius = parseInt(radiusSlider.value);
let cols = parseInt(colRange.value);
const points = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
document.addEventListener("mouseleave", () => {
  mouse.active = false;
});

toggleBtn.addEventListener("click", () => {
  controls.classList.toggle("hidden");
});
themeOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    themeOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    theme = btn.dataset.theme;
    const fc = document.getElementById("frostedContent");
    fc.classList.remove("light", "dark");
    fc.classList.add(theme);
    document.body.className = theme;
  });
});
xyPad.addEventListener("click", (e) => {
  const rect = xyPad.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
  scaleX = (x / rect.width) * 2;
  scaleY = (y / rect.height) * 2;
});
document.getElementById("radiusRange").addEventListener("input", e => {
  effectRadius = parseInt(e.target.value);
});

rowRange.addEventListener("input", () => {
  rows = parseInt(rowRange.value);
  initializePoints();
});
colRange.addEventListener("input", () => {
  cols = parseInt(colRange.value);
  initializePoints();
});

function ease(current, target, speed = 0.1) {
  return current + (target - current) * speed;
}

function initializePoints() {
  points.length = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col + 0.5;
      const cy = row + 0.5;
      points.push({ cx, cy, length: 0, angle: 0, radius: 0 });
    }
  }
}
initializePoints();

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dotW = canvas.width / cols;
  const dotH = canvas.height / rows;
  const baseSize = Math.min(dotW, dotH) * 0.25;

  let i = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const point = points[i++];
      const cx = point.cx * dotW;
      const cy = point.cy * dotH;

      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = effectRadius;
      const force = mouse.active ? Math.max(0, (maxDist - dist) / maxDist) : 0;

      const targetLen = force * 60;
      const targetRadius = force * 20;

      point.length = ease(point.length, targetLen, 0.08);
      point.radius = ease(point.radius, targetRadius, 0.08);
      point.angle = angle;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(point.angle);
      ctx.fillStyle = "#00f2ff";
      drawRoundedRect(ctx, 0, -baseSize * scaleY, point.length, baseSize * scaleY * 2, point.radius);
      ctx.restore();
    }
  }

  requestAnimationFrame(draw);
}
draw();

document.getElementById("frostedOpacity").addEventListener("input", (e) => {
  const val = parseInt(e.target.value);
  document.getElementById("frostedContent").style.background = `rgba(255,255,255,${val / 100})`;
});

themeOptions.forEach(option => {
  option.addEventListener("click", () => {
    const selectedTheme = option.getAttribute("data-theme");
  
    // 替换 body 的 class
    document.body.className = selectedTheme;
  
    // 替换 active 状态样式
    themeOptions.forEach(opt => opt.classList.remove("active"));
    option.classList.add("active");
  });
});