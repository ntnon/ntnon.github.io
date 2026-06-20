// Card hover checkmarks & settings drawer
(function () {
  const cards = document.querySelectorAll('.card');
  const drawer = document.getElementById('grid-drawer');
  const tab = document.getElementById('grid-drawer-tab');
  const fakeCursor = document.getElementById('fake-cursor');
  const totalCards = cards.length;
  let checkedCount = 0;
  let tabRevealed = false;
  let drawerOpen = false;
  let fakeCursorAnim = null;

  function setDrawerOpen(open) {
    drawerOpen = open;
    document.body.classList.toggle('drawer-open', open);
    if (open) {
      realMouseOverGrid = false;
      fakeCursor.classList.add('active');
      startFakeCursor();
    } else {
      realMouseOverGrid = false;
      fakeCursor.classList.remove('active');
      stopFakeCursor();
      mouse = { x: -9999, y: -9999 };
    }
  }

  let fakeCursorTime = 0;
  let realMouseOverGrid = false;

  function isMobile() {
    return window.innerWidth <= 600;
  }

  function getDrawerWidth() {
    return isMobile() ? 0 : 380;
  }

  function getDrawerHeight() {
    return isMobile() ? window.innerHeight * 0.4 : 0;
  }

  function animateFakeCursor() {
    fakeCursorTime += 0.003;
    let x, y;
    if (isMobile()) {
      const areaHeight = window.innerHeight - getDrawerHeight();
      const cx = window.innerWidth * 0.5;
      const cy = areaHeight * 0.5;
      const rx = Math.min(window.innerWidth * 0.3, 150);
      const ry = Math.min(areaHeight * 0.35, 120);
      x = cx + Math.sin(fakeCursorTime * 1.3) * rx;
      y = cy + Math.sin(fakeCursorTime * 2.1) * ry;
    } else {
      const areaWidth = window.innerWidth - getDrawerWidth();
      const cx = areaWidth * 0.5;
      const cy = window.innerHeight * 0.5;
      const rx = Math.min(areaWidth * 0.35, 250);
      const ry = Math.min(window.innerHeight * 0.3, 200);
      x = cx + Math.sin(fakeCursorTime * 1.3) * rx;
      y = cy + Math.sin(fakeCursorTime * 2.1) * ry;
    }

    fakeCursor.style.left = x + 'px';
    fakeCursor.style.top = y + 'px';

    if (!realMouseOverGrid) {
      mouse.x = x;
      mouse.y = y;
      fakeCursor.classList.add('active');
    } else {
      fakeCursor.classList.remove('active');
    }

    fakeCursorAnim = requestAnimationFrame(animateFakeCursor);
  }

  function startFakeCursor() {
    if (fakeCursorAnim) return;
    animateFakeCursor();
  }

  function stopFakeCursor() {
    if (fakeCursorAnim) {
      cancelAnimationFrame(fakeCursorAnim);
      fakeCursorAnim = null;
    }
  }

  const tabDots = document.querySelectorAll('.tab-dot');

  // Show tab immediately with empty dots
  tab.classList.add('visible');

  function markCard(check, index) {
    if (check.classList.contains('checked')) return;
    check.classList.add('checked');
    if (tabDots[index]) tabDots[index].classList.add('lit');
    checkedCount++;
    if (checkedCount >= totalCards && !tabRevealed) {
      tabRevealed = true;
      setTimeout(() => {
        tab.classList.add('ready');
        tab.classList.add('pulse');
      }, 400);
    }
  }

  cards.forEach((card, index) => {
    const check = card.querySelector('.card-check');
    if (!check) return;

    if (isMobile() && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          markCard(check, index);
          observer.disconnect();
        }
      }, { threshold: 0.6 });
      observer.observe(card);
    } else {
      card.addEventListener('mouseenter', () => markCard(check, index));
    }
  });

  function closeDrawer() {
    drawer.classList.remove('open');
    tab.classList.remove('pushed');
    setDrawerOpen(false);
  }

  // Toggle drawer (only when all dots are lit)
  tab.addEventListener('click', () => {
    if (!tabRevealed) return;
    tab.classList.remove('pulse');
    const isOpen = drawer.classList.toggle('open');
    tab.classList.toggle('pushed', isOpen);
    setDrawerOpen(isOpen);
  });

  // Close button
  document.getElementById('grid-drawer-close').addEventListener('click', closeDrawer);

  // ESC to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerOpen) closeDrawer();
  });

  // Mouse handling
  window.addEventListener('mousemove', (e) => {
    if (drawerOpen) {
      const overGrid = isMobile()
        ? e.clientY < window.innerHeight - getDrawerHeight()
        : e.clientX < window.innerWidth - getDrawerWidth();
      if (overGrid) {
        realMouseOverGrid = true;
        fakeCursor.classList.remove('active');
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      } else {
        realMouseOverGrid = false;
        fakeCursor.classList.add('active');
      }
      return;
    }
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    if (drawerOpen) {
      realMouseOverGrid = false;
    }
  });

  // Slider wiring
  function wireSlider(sliderId, outputId, setter) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(outputId);
    if (!slider || !output) return;
    slider.addEventListener('input', () => {
      const val = setter(slider.value);
      output.textContent = val;
    });
  }

  const sizeSlider = document.getElementById('slider-size');
  const sizeOutput = document.getElementById('val-size');
  sizeSlider.min = hexSizeMin;
  sizeSlider.max = hexSizeMax;
  sizeSlider.value = hexSizeDefault;
  sizeOutput.textContent = hexSizeDefault;

  wireSlider('slider-size', 'val-size', (v) => {
    size = Number(v);
    hexWidth = size * Math.sqrt(3);
    hexHeight = size * 2;
    buildGrid();
    return size;
  });

  wireSlider('slider-influence', 'val-influence', (v) => {
    influence = Number(v);
    return influence;
  });

  wireSlider('slider-strength', 'val-strength', (v) => {
    strength = Number(v);
    return strength;
  });

  wireSlider('slider-constraint', 'val-constraint', (v) => {
    constraint = Number(v) / 100;
    return constraint.toFixed(2);
  });

  wireSlider('slider-passes', 'val-passes', (v) => {
    constraintPasses = Number(v);
    return constraintPasses;
  });

  // Randomize
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function syncSlider(id, value) {
    const slider = document.getElementById(id);
    if (slider) { slider.value = value; slider.dispatchEvent(new Event('input')); }
  }

  document.getElementById('grid-randomize').addEventListener('click', () => {
    syncSlider('slider-size', randInt(hexSizeMin, hexSizeMax));
    syncSlider('slider-influence', randInt(20, 400));
    syncSlider('slider-strength', randInt(50, 1500));
    syncSlider('slider-constraint', randInt(0, 100));
    syncSlider('slider-passes', randInt(1, 10));
  });
})();
