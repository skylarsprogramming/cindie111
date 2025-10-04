(() => {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function initParallaxScene() {
    const scene = document.getElementById('parallax-scene');
    if (!scene) return;
    const layers = Array.from(scene.querySelectorAll('.layer'));

    let rect = scene.getBoundingClientRect();
    const center = { x: rect.width / 2, y: rect.height / 2 };

    function update(e) {
      const bounds = scene.getBoundingClientRect();
      const x = (e.clientX - bounds.left) - center.x;
      const y = (e.clientY - bounds.top) - center.y;
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth || '0.05');
        const tx = clamp(-x * depth, -50, 50);
        const ty = clamp(-y * depth, -30, 30);
        const rx = clamp(y * depth * 0.08, -8, 8);
        const ry = clamp(-x * depth * 0.08, -8, 8);
        layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    }

    function reset() {
      layers.forEach(layer => {
        layer.style.transform = 'translate3d(0, 0, 0)';
      });
    }

    scene.addEventListener('pointermove', update);
    scene.addEventListener('pointerleave', reset);

    window.addEventListener('resize', () => {
      rect = scene.getBoundingClientRect();
    });
  }

  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;
    let stars = [];
    const STAR_COUNT = 150;

    function createStars() {
      stars = new Array(STAR_COUNT).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.7 + 0.3,
        r: Math.random() * 1.3 + 0.2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const alpha = s.z * 0.9;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.x += 0.08 * s.z;
        if (s.x > width + 2) s.x = -2;
      }
      requestAnimationFrame(draw);
    }

    function onResize() {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      createStars();
    }

    window.addEventListener('resize', onResize);
    onResize();
    draw();
  }

  function init() {
    initParallaxScene();
    initStarfield();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

