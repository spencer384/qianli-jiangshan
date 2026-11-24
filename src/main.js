import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTerrainAndWater, getTerrainHeight, SCROLL_WIDTH } from './terrain.js';
import { createArchitectureAndFlora } from './architecture.js';
import { createAnimations } from './animations.js';

// 10 Scroll Sections ordered strictly Right-to-Left matching 方琮《仿王希孟江山千里卷》
const SCENIC_SPOTS = [
  {
    id: 'siyin',
    name: '卷首四印',
    tag: '卷首 · 孤峰與水村',
    x: 274,
    pos: new THREE.Vector3(265, 16, 44),
    target: new THREE.Vector3(276, 4.0, 0),
    desc: '畫卷最右端裱邊鈐有四方朱紅鑑賞印璽，入畫處遠景聳立孤峰，近景丘陵水村與竹叢相映，拉開千里江山序幕。',
  },
  {
    id: 'youwan',
    name: '右岸煙波灣',
    tag: '開展 · 銀波扁舟',
    x: 238,
    pos: new THREE.Vector3(238, 14, 38),
    target: new THREE.Vector3(238, 1.5, 4),
    desc: '開卷後隨即展出一片開闊的銀青色水灣，白鷺低飛、小舟輕泛，為後方綿延山群留出呼吸空間。',
  },
  {
    id: 'youer',
    name: '右二主山群',
    tag: '連綿 · 青綠層巒',
    x: 196,
    pos: new THREE.Vector3(196, 22, 48),
    target: new THREE.Vector3(196, 8.5, -4),
    desc: '石青石綠渲染的連綿群峰拔地而起，山腳赭石緩坡掩映茅舍村落，木橋橫跨於兩山之間的水口。',
  },
  {
    id: 'youyi',
    name: '右一大主山',
    tag: '峻拔 · 泊船灣',
    x: 132,
    pos: new THREE.Vector3(132, 24, 46),
    target: new THREE.Vector3(132, 9.5, -4),
    desc: '右側最雄渾的高峰聳立於此，山腰雲氣流動，左下方避風水灣內停泊著高桅竹骨白帆大江船。',
  },
  {
    id: 'zhongyouwan',
    name: '中右開闊水灣',
    tag: '留白 · 氣韻貫通',
    x: 82,
    pos: new THREE.Vector3(82, 16, 42),
    target: new THREE.Vector3(82, 2.0, 4),
    desc: '正中主峰與右側山群之間的一段澄淨水面，高桅江船靜泊水際，凸顯中國山水長卷「疏可走馬」的留白節奏。',
  },
  {
    id: 'zhufeng',
    name: '正中特大主峰',
    tag: '全卷核心 · 飛瀑亭橋',
    x: 0,
    pos: new THREE.Vector3(4, 34, 62),
    target: new THREE.Vector3(0, 14.0, -6),
    desc: '全卷正中軸最巍峨的雙頂石青主峰，氣勢磅礴；右側山壁飛瀑直瀉入潭，正前方雙層亭拱橋上旅人往來不絕。',
  },
  {
    id: 'zhongzuo',
    name: '中左層巒山寺',
    tag: '幽境 · 古剎浮屠',
    x: -64,
    pos: new THREE.Vector3(-62, 22, 42),
    target: new THREE.Vector3(-64, 8.5, -4),
    desc: '主峰左側山勢呈階梯狀層層遞降，山腰平臺建有朱柱古剎與五層八角佛塔，僧侶緩步庭院。',
  },
  {
    id: 'zuozhong',
    name: '左中銳峰群',
    tag: '奇峭 · 臨江石壁',
    x: -116,
    pos: new THREE.Vector3(-116, 18, 38),
    target: new THREE.Vector3(-116, 7.0, -4),
    desc: '一組險峻挺拔的青綠銳峰探入江心，與左側無邊湖面形成鮮明對比。',
  },
  {
    id: 'dahu',
    name: '左端平遠大湖',
    tag: '平遠 · 遠山蘆洲',
    x: -200,
    pos: new THREE.Vector3(-200, 16, 48),
    target: new THREE.Vector3(-200, 2.0, 0),
    desc: '全卷最寬廣的平遠湖面，天際線隱現淡青遠山，前景沙嘴蘆葦搖曳，漁舟與白鷺點綴其間。',
  },
  {
    id: 'juanwei',
    name: '卷尾雙峰與雙印',
    tag: '收卷 · 峭拔雙尖',
    x: -278,
    pos: new THREE.Vector3(-268, 20, 44),
    target: new THREE.Vector3(-278, 8.0, -4),
    desc: '畫卷最左端陡然拔起兩座尖峭青峰，俯瞰山腳漁村，最左裱邊鈐有方琮款印，為全卷畫下餘韻無窮的句點。',
  },
];

// --- Scene & Renderer ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#dad5c2');
scene.fog = new THREE.FogExp2('#dad5c2', 0.0034);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 800);
// Start framing the Grand Central Peak & balanced panoramic composition
const OVERVIEW_POS = new THREE.Vector3(0, 38, 108);
const OVERVIEW_TARGET = new THREE.Vector3(0, 9, -4);
camera.position.copy(OVERVIEW_POS);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 8;
controls.maxDistance = 260;
controls.target.copy(OVERVIEW_TARGET);

// --- Lighting ---
scene.add(new THREE.HemisphereLight('#f6f1de', '#3b574d', 1.2));

const sunLight = new THREE.DirectionalLight('#fff4da', 1.85);
sunLight.position.set(90, 115, 65);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 400;
sunLight.shadow.camera.left = -280;
sunLight.shadow.camera.right = 280;
sunLight.shadow.camera.top = 95;
sunLight.shadow.camera.bottom = -95;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// --- Build World ---
const { waterUniforms } = createTerrainAndWater(scene);
createArchitectureAndFlora(scene);
const updateAnimations = createAnimations(scene);

// --- Camera Tweening, Drag-Pan & Zoom ---
let viewMode = '3d';
let tweenState = null;
let tourActive = false;
let tourIndex = 0;
let tourTimer = 0;
const TOUR_DWELL = 5.0;

function flyTo(pos, target, duration = 1.2) {
  tweenState = {
    startPos: camera.position.clone(),
    startTarget: controls.target.clone(),
    endPos: pos.clone(),
    endTarget: target.clone(),
    elapsed: 0,
    duration,
  };
}

function zoomCamera(factor) {
  stopTour();
  tweenState = null;
  const offset = camera.position.clone().sub(controls.target);
  const dist = offset.length();
  const nextDist = THREE.MathUtils.clamp(dist * factor, controls.minDistance, controls.maxDistance);
  offset.setLength(nextDist);
  camera.position.copy(controls.target).add(offset);
}

function selectSpot(spot, fromTour = false) {
  if (!fromTour) stopTour();
  document.querySelectorAll('.spot-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === spot.id);
  });

  const card = document.getElementById('spot-card');
  document.getElementById('spot-card-title').textContent = spot.name;
  document.getElementById('spot-card-tag').textContent = spot.tag;
  document.getElementById('spot-card-desc').textContent = spot.desc;
  card.classList.remove('hidden');

  if (viewMode === 'scroll') {
    flyTo(new THREE.Vector3(spot.x, 28, 92), new THREE.Vector3(spot.x, 9, -4), 1.15);
  } else {
    flyTo(spot.pos, spot.target, 1.25);
  }

  // On narrow mobile screens, auto-collapse the spots drawer after choosing a spot
  if (!fromTour && window.innerWidth <= 768) {
    setSpotsOpen(false);
  }
}

function setViewMode(mode) {
  viewMode = mode;
  document.getElementById('btn-3d').classList.toggle('active', mode === '3d');
  document.getElementById('btn-scroll').classList.toggle('active', mode === 'scroll');

  if (mode === 'scroll') {
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    const cx = THREE.MathUtils.clamp(controls.target.x, -265, 265);
    flyTo(new THREE.Vector3(cx, 28, 94), new THREE.Vector3(cx, 9, -4), 1.0);
  } else {
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    flyTo(OVERVIEW_POS, OVERVIEW_TARGET, 1.0);
  }
}

function stopTour() {
  tourActive = false;
  const btn = document.getElementById('btn-tour');
  btn.classList.remove('tour-active');
  btn.textContent = '導覽';
}

const spotsPanelEl = document.getElementById('spots-panel');
const btnSpotsToggle = document.getElementById('btn-spots-toggle');

function setSpotsOpen(open) {
  spotsPanelEl.classList.toggle('collapsed', !open);
  btnSpotsToggle.classList.toggle('active', open);
}

// Collapse spots drawer by default on mobile so the 3D scroll is unobstructed
setSpotsOpen(window.innerWidth > 768);

btnSpotsToggle.addEventListener('click', () => {
  setSpotsOpen(spotsPanelEl.classList.contains('collapsed'));
});
document.getElementById('spots-close').addEventListener('click', () => setSpotsOpen(false));

function toggleTour() {
  if (tourActive) {
    stopTour();
    return;
  }
  tourActive = true;
  tourIndex = 0;
  tourTimer = 0;
  const btn = document.getElementById('btn-tour');
  btn.classList.add('tour-active');
  btn.textContent = '暫停導覽';
  selectSpot(SCENIC_SPOTS[0], true);
}

const spotsListEl = document.getElementById('spots-list');
SCENIC_SPOTS.forEach((spot, idx) => {
  const btn = document.createElement('button');
  btn.className = 'spot-btn';
  btn.dataset.id = spot.id;
  btn.innerHTML = `<span>${spot.name}</span><span class="spot-idx">${String(idx + 1).padStart(2, '0')}</span>`;
  btn.addEventListener('click', () => selectSpot(spot));
  spotsListEl.appendChild(btn);
});

document.getElementById('btn-3d').addEventListener('click', () => {
  stopTour();
  setViewMode('3d');
});
document.getElementById('btn-scroll').addEventListener('click', () => {
  stopTour();
  setViewMode('scroll');
});
document.getElementById('btn-zoom-in').addEventListener('click', () => zoomCamera(0.75));
document.getElementById('btn-zoom-out').addEventListener('click', () => zoomCamera(1.33));
document.getElementById('btn-reset').addEventListener('click', () => {
  stopTour();
  document.querySelectorAll('.spot-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById('spot-card').classList.add('hidden');
  setViewMode(viewMode);
});
document.getElementById('btn-tour').addEventListener('click', toggleTour);
document.getElementById('spot-card-close').addEventListener('click', () => {
  document.getElementById('spot-card').classList.add('hidden');
});

controls.addEventListener('start', () => {
  tweenState = null;
  if (tourActive) stopTour();
});

// --- Minimap matching the exact 方琮 silhouette ---
function drawMinimap() {
  const canvas = document.getElementById('minimap-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#dad3be';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#6e9b93';
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  const layers = [
    { z: -18, color: '#1a4c74' },
    { z: -8, color: '#266156' },
    { z: 6, color: '#4c7e54' },
  ];

  for (const layer of layers) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let px = 0; px <= w; px += 2) {
      const worldX = (px / w - 0.5) * SCROLL_WIDTH;
      const elev = Math.max(0, getTerrainHeight(worldX, layer.z));
      const py = h * 0.85 - Math.min(h * 0.80, elev * 0.92);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.globalAlpha = 0.76;
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = '#b2382b';
  for (const spot of SCENIC_SPOTS) {
    const px = ((spot.x / SCROLL_WIDTH) + 0.5) * w;
    ctx.beginPath();
    ctx.arc(px, h * 0.78, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
drawMinimap();

const minimapTrack = document.getElementById('minimap-track');
const minimapViewport = document.getElementById('minimap-viewport');
let draggingMinimap = false;

function jumpToMinimapClientX(clientX) {
  const rect = minimapTrack.getBoundingClientRect();
  const ratio = THREE.MathUtils.clamp((clientX - rect.left) / rect.width, 0.04, 0.96);
  const worldX = (ratio - 0.5) * SCROLL_WIDTH;
  stopTour();
  tweenState = null;

  const dx = worldX - controls.target.x;
  controls.target.x = worldX;
  camera.position.x += dx;
}

minimapTrack.addEventListener('pointerdown', (e) => {
  draggingMinimap = true;
  jumpToMinimapClientX(e.clientX);
});
window.addEventListener('pointermove', (e) => {
  if (draggingMinimap) jumpToMinimapClientX(e.clientX);
});
window.addEventListener('pointerup', () => {
  draggingMinimap = false;
});

function updateMinimapIndicator() {
  const ratio = THREE.MathUtils.clamp((controls.target.x / SCROLL_WIDTH) + 0.5, 0.06, 0.94);
  const widthPct = 12;
  minimapViewport.style.width = `${widthPct}%`;
  minimapViewport.style.left = `${THREE.MathUtils.clamp(ratio * 100 - widthPct / 2, 0, 100 - widthPct)}%`;
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  waterUniforms.uTime.value = elapsed;
  updateAnimations(dt, elapsed);

  if (tweenState) {
    tweenState.elapsed += dt;
    const rawT = Math.min(1, tweenState.elapsed / tweenState.duration);
    const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
    camera.position.lerpVectors(tweenState.startPos, tweenState.endPos, t);
    controls.target.lerpVectors(tweenState.startTarget, tweenState.endTarget, t);
    if (rawT >= 1) tweenState = null;
  }

  if (tourActive) {
    tourTimer += dt;
    if (tourTimer >= TOUR_DWELL) {
      tourTimer = 0;
      tourIndex = (tourIndex + 1) % SCENIC_SPOTS.length;
      selectSpot(SCENIC_SPOTS[tourIndex], true);
    }
  }

  controls.update();
  updateMinimapIndicator();
  renderer.render(scene, camera);
}

animate();
