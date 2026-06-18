// Hex grid background simulation
const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');

// Screen-relative hex sizing
const screenMin = Math.min(window.innerWidth, window.innerHeight);
const hexSizeMin = Math.max(window.innerWidth <= 600 ? 5 : 14, Math.round(screenMin / 80));
const hexSizeMax = Math.round(screenMin / 8);
const hexSizeDefault = Math.round(screenMin / 40);

let size = hexSizeDefault;
let influence = 60;
let strength = 30;
let constraint = 0.3;
let constraintPasses = 2;
const baseSize = hexSizeDefault;

let hexWidth = size * Math.sqrt(3);
let hexHeight = size * 2;

let vertices = [];
let hexes = [];
let vertexMap = {};

function vtxKey(x, y) {
  return (Math.round(x * 10)) + ',' + (Math.round(y * 10));
}

function getOrCreateVertex(x, y) {
  const key = vtxKey(x, y);
  if (vertexMap[key] !== undefined) return vertexMap[key];
  const idx = vertices.length;
  vertices.push({ rx: x, ry: y, dx: 0, dy: 0, prevDx: 0, prevDy: 0, neighbors: [] });
  vertexMap[key] = idx;
  return idx;
}

function addEdge(a, b) {
  if (a === b) return;
  if (!vertices[a].neighbors.includes(b)) {
    vertices[a].neighbors.push(b);
    vertices[b].neighbors.push(a);
  }
}

function buildGrid() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  vertices = [];
  hexes = [];
  vertexMap = {};

  const cols = Math.ceil(window.innerWidth / hexWidth) + 2;
  const totalHeight = document.documentElement.scrollHeight;
  const rows = Math.ceil((window.innerHeight + totalHeight) / (hexHeight * 0.75)) + 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * hexWidth + (r % 2) * (hexWidth / 2);
      const cy = r * hexHeight * 0.75;

      const cornerIndices = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);
        cornerIndices.push(getOrCreateVertex(vx, vy));
      }

      for (let i = 0; i < 6; i++) {
        addEdge(cornerIndices[i], cornerIndices[(i + 1) % 6]);
      }

      hexes.push(cornerIndices);
    }
  }
}

buildGrid();
window.addEventListener('resize', buildGrid);
window.addEventListener('orientationchange', () => setTimeout(buildGrid, 100));

let mouse = { x: -9999, y: -9999 };
const parallaxFactor = 0.4;

// Touch support for grid displacement
window.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
});

window.addEventListener('touchend', () => {
  mouse = { x: -9999, y: -9999 };
});

window.addEventListener('mouseleave', () => {
  mouse = { x: -9999, y: -9999 };
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;

  const scrollOffset = window.scrollY * parallaxFactor;

  for (const v of vertices) {
    const ry = v.ry - scrollOffset;
    const dx = v.rx - mouse.x;
    const dy = ry - mouse.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0 && dist < influence) {
      const factor = Math.pow(1 - dist / influence, 2) * strength * (size / baseSize);
      v.dx = (dx / dist) * factor;
      v.dy = (dy / dist) * factor;
    } else {
      v.dx = 0;
      v.dy = 0;
    }
  }

  for (let iter = 0; iter < constraintPasses; iter++) {
    for (const v of vertices) {
      v.prevDx = v.dx;
      v.prevDy = v.dy;
    }
    for (const v of vertices) {
      const n = v.neighbors.length;
      if (n === 0) continue;
      let avgDx = 0, avgDy = 0;
      for (const ni of v.neighbors) {
        avgDx += vertices[ni].prevDx;
        avgDy += vertices[ni].prevDy;
      }
      avgDx /= n;
      avgDy /= n;
      v.dx = v.prevDx + (avgDx - v.prevDx) * constraint;
      v.dy = v.prevDy + (avgDy - v.prevDy) * constraint;
    }
  }

  for (const hex of hexes) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const v = vertices[hex[i]];
      const x = v.rx + v.dx;
      const y = (v.ry - scrollOffset) + v.dy;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}

draw();
