import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Hero 3D scene: a glass crystal with a copper core sits inside a cloud of
 * particles. As the visitor scrolls, the crystal dissolves and the particles
 * morph: cloud → the Alfa "A" → a website layout.
 *
 * progress: 0 = cloud + crystal, 1 = "A", 2 = website layout.
 */

export type HeroScene = {
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  resize(width: number, height: number): void;
  setActive(active: boolean): void;
  dispose(): void;
};

const COPPER = new THREE.Color("#D9A577");
const WARM_WHITE = new THREE.Color("#FFF4E8");

// --- Particle target shapes -------------------------------------------------

function sampleCloud(count: number, out: Float32Array) {
  // Fibonacci sphere shell with depth jitter: an even, glowing nebula.
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const r = 1.75 + (Math.random() - 0.5) * 0.9 + Math.pow(Math.random(), 6) * 1.6;
    out[i * 3] = Math.cos(theta) * radius * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = Math.sin(theta) * radius * r;
  }
}

function sampleLetter(count: number, out: Float32Array) {
  // Rasterise a bold "A" on a canvas and pick points inside the glyph.
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${size * 0.95}px "Arial Black", Arial, sans-serif`;
  ctx.fillText("A", size / 2, size / 2 + size * 0.04);
  const data = ctx.getImageData(0, 0, size, size).data;
  const inside: number[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (data[(y * size + x) * 4 + 3] > 128) inside.push(x, y);
    }
  }
  const scale = 3.6 / size;
  for (let i = 0; i < count; i += 1) {
    const pick = Math.floor(Math.random() * (inside.length / 2)) * 2;
    const px = inside[pick] + Math.random();
    const py = inside[pick + 1] + Math.random();
    out[i * 3] = (px - size / 2) * scale;
    out[i * 3 + 1] = -(py - size / 2) * scale;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
  }
}

type Shape = { x: number; y: number; w: number; h: number; fill: boolean; weight: number };

function sampleWebsite(count: number, out: Float32Array) {
  // A browser window: frame, toolbar, hero block, text lines and three cards.
  const W = 4.4;
  const H = 3;
  const left = -W / 2;
  const top = H / 2;
  const shapes: Shape[] = [
    { x: left, y: top, w: W, h: H, fill: false, weight: 5 }, // frame
    { x: left, y: top - 0.32, w: W, h: 0.001, fill: true, weight: 1.6 }, // toolbar divider
    { x: left + 0.18, y: top - 0.12, w: 0.08, h: 0.08, fill: true, weight: 0.25 },
    { x: left + 0.32, y: top - 0.12, w: 0.08, h: 0.08, fill: true, weight: 0.25 },
    { x: left + 0.46, y: top - 0.12, w: 0.08, h: 0.08, fill: true, weight: 0.25 },
    { x: left + 0.8, y: top - 0.1, w: 2.2, h: 0.12, fill: false, weight: 1.1 }, // address bar
    { x: left + 0.3, y: top - 0.6, w: 1.9, h: 0.22, fill: true, weight: 2.4 }, // headline
    { x: left + 0.3, y: top - 0.95, w: 1.5, h: 0.08, fill: true, weight: 0.9 },
    { x: left + 0.3, y: top - 1.1, w: 1.2, h: 0.08, fill: true, weight: 0.8 },
    { x: left + 0.3, y: top - 1.35, w: 0.6, h: 0.18, fill: true, weight: 1.1 }, // button
    { x: left + 2.45, y: top - 0.55, w: 1.65, h: 1.05, fill: true, weight: 4.2 }, // hero image
    { x: left + 0.3, y: top - 1.85, w: 1.15, h: 0.85, fill: false, weight: 1.6 }, // cards
    { x: left + 1.62, y: top - 1.85, w: 1.15, h: 0.85, fill: false, weight: 1.6 },
    { x: left + 2.94, y: top - 1.85, w: 1.15, h: 0.85, fill: false, weight: 1.6 },
  ];
  const total = shapes.reduce((sum, s) => sum + s.weight, 0);
  for (let i = 0; i < count; i += 1) {
    let r = Math.random() * total;
    let shape = shapes[0];
    for (const s of shapes) {
      r -= s.weight;
      if (r <= 0) {
        shape = s;
        break;
      }
    }
    let x: number;
    let y: number;
    if (shape.fill) {
      x = shape.x + Math.random() * shape.w;
      y = shape.y - Math.random() * shape.h;
    } else {
      // Point on the rectangle outline.
      const perimeter = 2 * (shape.w + shape.h);
      let d = Math.random() * perimeter;
      if (d < shape.w) {
        x = shape.x + d;
        y = shape.y;
      } else if ((d -= shape.w) < shape.h) {
        x = shape.x + shape.w;
        y = shape.y - d;
      } else if ((d -= shape.h) < shape.w) {
        x = shape.x + shape.w - d;
        y = shape.y - shape.h;
      } else {
        d -= shape.w;
        x = shape.x;
        y = shape.y - shape.h + d;
      }
      x += (Math.random() - 0.5) * 0.02;
      y += (Math.random() - 0.5) * 0.02;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
  }
}

// --- Shaders --------------------------------------------------------------------

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aCloud;
  attribute vec3 aLetter;
  attribute vec3 aSite;
  attribute float aRandom;
  varying float vRandom;
  varying float vFlash;

  void main() {
    // Each particle starts its journey at a slightly different moment.
    float delay = aRandom * 0.35;
    float s1 = smoothstep(delay, delay + 0.65, clamp(uProgress, 0.0, 1.0));
    float s2 = smoothstep(delay, delay + 0.65, clamp(uProgress - 1.0, 0.0, 1.0));

    vec3 pos = mix(aCloud, aLetter, s1);
    pos = mix(pos, aSite, s2);

    // Turbulence peaks mid-transition, so shapes "explode" and re-form.
    float t = max(s1 * (1.0 - s1), s2 * (1.0 - s2)) * 4.0;
    vec3 swirl = vec3(
      sin(uTime * 0.7 + aRandom * 40.0),
      cos(uTime * 0.6 + aRandom * 31.0),
      sin(uTime * 0.5 + aRandom * 17.0)
    );
    pos += swirl * (0.025 + t * 0.75);
    pos.z += t * (aRandom - 0.5) * 2.5;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRandom * 0.9) / -mv.z;

    vRandom = aRandom;
    vFlash = t;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uCopper;
  uniform vec3 uWhite;
  uniform float uTime;
  varying float vRandom;
  varying float vFlash;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + vRandom * 50.0);
    vec3 color = mix(uCopper, uWhite, smoothstep(0.55, 1.0, vRandom) + vFlash * 0.35);
    gl_FragColor = vec4(color, glow * twinkle * (0.55 + vFlash * 0.3));
  }
`;

// --- Scene ---------------------------------------------------------------------------

export function createHeroScene(canvas: HTMLCanvasElement, options: { mobile: boolean }): HeroScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !options.mobile, alpha: true, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, options.mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const stage = new THREE.Group();
  scene.add(stage);

  // Particles
  const count = options.mobile ? 7000 : 16000;
  const cloud = new Float32Array(count * 3);
  const letter = new Float32Array(count * 3);
  const site = new Float32Array(count * 3);
  const random = new Float32Array(count);
  sampleCloud(count, cloud);
  sampleLetter(count, letter);
  sampleWebsite(count, site);
  for (let i = 0; i < count; i += 1) random[i] = Math.random();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(cloud.slice(), 3));
  geometry.setAttribute("aCloud", new THREE.BufferAttribute(cloud, 3));
  geometry.setAttribute("aLetter", new THREE.BufferAttribute(letter, 3));
  geometry.setAttribute("aSite", new THREE.BufferAttribute(site, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: options.mobile ? 34 : 42 },
      uPixelRatio: { value: pixelRatio },
      uCopper: { value: COPPER },
      uWhite: { value: WARM_WHITE },
    },
  });
  const points = new THREE.Points(geometry, material);
  stage.add(points);

  // Glass crystal with a copper core
  const crystalGroup = new THREE.Group();
  const glass = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 0),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 1.4,
      ior: 1.6,
      iridescence: 0.8,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.4,
      flatShading: true,
      transparent: true,
    })
  );
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    new THREE.MeshStandardMaterial({ color: "#B4763F", metalness: 1, roughness: 0.22, envMapIntensity: 1.6, flatShading: true })
  );
  crystalGroup.add(glass, core);
  stage.add(crystalGroup);

  // Distant dust for depth
  const dustCount = options.mobile ? 500 : 1400;
  const dust = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dust[i * 3] = (Math.random() - 0.5) * 30;
    dust[i * 3 + 1] = (Math.random() - 0.5) * 18;
    dust[i * 3 + 2] = -6 - Math.random() * 14;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  const dustMaterial = new THREE.PointsMaterial({ color: "#8B93A7", size: 0.035, transparent: true, opacity: 0.55, depthWrite: false });
  const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dustPoints);

  // State
  let targetProgress = 0;
  let progress = 0;
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  let spin = 0;
  let width = 1;
  let height = 1;
  let active = true;
  let frame = 0;
  const clock = new THREE.Clock();

  function layout() {
    // Wide screens: visual on the right, text on the left. Narrow: visual above the text.
    const wide = width / height > 1.1;
    stage.position.x = wide ? 2.5 : 0;
    stage.position.y = wide ? 0 : 2.3;
    stage.scale.setScalar(wide ? 0.95 : 0.62);
  }

  function render() {
    frame = requestAnimationFrame(render);
    if (!active) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    progress += (targetProgress - progress) * Math.min(1, dt * 4.5);
    pointerSmooth.lerp(pointer, Math.min(1, dt * 3));

    material.uniforms.uProgress.value = progress;
    material.uniforms.uTime.value = time;

    // The cloud spins; it settles to face the camera as the "A" forms.
    const settle = THREE.MathUtils.smoothstep(progress, 0.2, 0.9);
    spin += dt * 0.18 * (1 - settle);
    const facing = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
    points.rotation.y = THREE.MathUtils.lerp(spin, facing, settle);

    stage.rotation.y = pointerSmooth.x * 0.35;
    stage.rotation.x = -pointerSmooth.y * 0.2;

    // Crystal: spins, then bursts and dissolves as the particles leave it.
    const burst = THREE.MathUtils.smoothstep(progress, 0.05, 0.55);
    crystalGroup.visible = burst < 0.999;
    crystalGroup.scale.setScalar(1 + burst * 0.6 - burst * burst * 1.6 + Math.sin(time * 1.4) * 0.03);
    crystalGroup.rotation.x = time * 0.35;
    crystalGroup.rotation.y = time * 0.5;
    core.rotation.y = -time * 1.2;

    // Camera drifts in through the journey.
    camera.position.z = 9 - Math.min(progress, 2) * 0.35;
    camera.position.y = Math.sin(time * 0.3) * 0.08;
    camera.lookAt(stage.position.x * 0.35, stage.position.y * 0.5, 0);

    dustPoints.rotation.y = time * 0.01 + pointerSmooth.x * 0.05;

    renderer.render(scene, camera);
  }

  frame = requestAnimationFrame(render);

  return {
    setProgress(value) {
      targetProgress = value;
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    resize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width / height < 0.8 ? 55 : 40;
      camera.updateProjectionMatrix();
      layout();
    },
    setActive(value) {
      active = value;
      if (value) clock.getDelta();
    },
    dispose() {
      cancelAnimationFrame(frame);
      geometry.dispose();
      material.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      glass.geometry.dispose();
      (glass.material as THREE.Material).dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
