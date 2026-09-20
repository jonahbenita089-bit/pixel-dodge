const scene = document.querySelector('.scene');

const palmLeaves = [
  { x: 10, y: 62, scale: 1.1 },
  { x: 84, y: 58, scale: 0.9 },
  { x: 92, y: 72, scale: 1.2 },
  { x: 16, y: 76, scale: 1.0 },
  { x: 76, y: 78, scale: 0.8 }
];

function buildPalm() {
  palmLeaves.forEach((leaf) => {
    const el = document.createElement('div');
    el.className = 'palm';
    el.style.left = `${leaf.x}%`;
    el.style.top = `${leaf.y}%`;
    el.style.transform = `scale(${leaf.scale})`;
    scene.appendChild(el);
  });
}

function addDecor() {
  for (let i = 0; i < 12; i++) {
    const bush = document.createElement('div');
    bush.className = 'bush';
    bush.style.left = `${(i * 9) % 100}%`;
    bush.style.bottom = `${8 + (i % 3) * 5}%`;
    bush.style.transform = `scale(${0.7 + (i % 5) * 0.14})`;
    scene.appendChild(bush);
  }

  for (let i = 0; i < 8; i++) {
    const barrel = document.createElement('div');
    barrel.className = 'barrel';
    barrel.style.left = `${12 + i * 11}%`;
    barrel.style.bottom = `${1 + (i % 2) * 3}%`;
    scene.appendChild(barrel);
  }
}

function createPalmLeaf(x, y, rotation, scale) {
  const leaf = document.createElement('div');
  leaf.className = 'palm-leaf';
  leaf.style.left = `${x}%`;
  leaf.style.top = `${y}%`;
  leaf.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  scene.appendChild(leaf);
}

function buildStrands() {
  for (let i = 0; i < 8; i++) {
    createPalmLeaf(72 + i * 2, 84 - i * 2, -20 + i * 12, 0.8 + i * 0.06);
    createPalmLeaf(20 + i * 2, 86 - i * 2, 15 + i * 10, 0.7 + i * 0.04);
  }
}

function initScene() {
  const extra = document.createElement('style');
  extra.textContent = `
    .palm {
      position: absolute;
      width: 12px;
      height: 110px;
      background: linear-gradient(180deg, #7b4a24, #543017);
      border-radius: 10px;
      box-shadow: inset 0 0 0 4px rgba(62, 38, 18, 0.2);
      transform-origin: bottom center;
      z-index: 2;
    }

    .palm::before {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 82%;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #7b5328;
      transform: translateX(-50%);
    }

    .palm-leaf {
      position: absolute;
      width: 90px;
      height: 16px;
      background: linear-gradient(90deg, rgba(64, 177, 72, 0.9), rgba(26, 151, 47, 0.95));
      border-radius: 0 16px 16px 0;
      transform-origin: left center;
      box-shadow: inset -8px 0 0 rgba(27, 116, 36, 0.38);
      z-index: 3;
    }

    .bush {
      position: absolute;
      width: 150px;
      height: 44px;
      background: radial-gradient(circle at 30% 50%, rgba(105, 220, 103, 0.95), rgba(42, 154, 60, 0.9) 70%, rgba(27, 105, 42, 0.95));
      border-radius: 50% 60% 55% 45%;
      box-shadow: inset 0 0 0 6px rgba(32, 124, 56, 0.38);
      opacity: 0.9;
      z-index: 4;
    }

    .barrel {
      position: absolute;
      width: 64px;
      height: 56px;
      border-radius: 12px 12px 18px 18px;
      background: linear-gradient(180deg, #938062, #6b4d25 90%);
      box-shadow: inset 0 0 0 6px rgba(74, 52, 25, 0.3), 0 8px 0 rgba(86,64,43,0.2);
      z-index: 4;
    }

    .barrel::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 0;
      width: 80%;
      height: 16px;
      transform: translateX(-50%);
      background: rgba(84, 58, 31, 0.3);
      border-radius: 50%;
    }
  `;
  document.head.appendChild(extra);

  buildPalm();
  buildStrands();
  addDecor();
}

initScene();
