// =============================================================
//  CENA 3D - "Travessia pelo vidro"
//  Paineis de vidro refrativo flutuando em profundidade. A camera
//  atravessa os paineis conforme o usuario rola a pagina. Brilho
//  ciano com bloom remete ao anel/identidade da Pro Limpee.
// =============================================================

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const CYAN = 0x1ca0e8;
const GLASS_TINT = 0xbfe6ff;

export function initScene(canvas) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05080d, 0.045);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 14);

  // Ambiente PMREM (reflexos realistas no vidro)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  // Luzes de acento
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(CYAN, 60, 40);
  cyanLight.position.set(-6, 2, 4);
  scene.add(cyanLight);

  const rimLight = new THREE.PointLight(0x4fbfff, 40, 50);
  rimLight.position.set(7, -4, -6);
  scene.add(rimLight);

  // ---- Paineis de vidro em profundidade ----
  const root = new THREE.Group();
  scene.add(root);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: GLASS_TINT,
    metalness: 0,
    roughness: 0.06,
    transmission: 1,
    thickness: 1.4,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    attenuationColor: new THREE.Color(CYAN),
    attenuationDistance: 3.5,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 1,
  });

  const edgeMat = new THREE.LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.9,
  });

  const PANE_COUNT = 7;
  const SPACING = 6;
  const panes = [];

  function roundedPlane(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  for (let i = 0; i < PANE_COUNT; i++) {
    const w = 4.4 + (i % 2) * 1.2;
    const h = 6.2 - (i % 3) * 0.8;
    const shape = roundedPlane(w, h, 0.35);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 16,
    });
    geo.center();

    const pane = new THREE.Mesh(geo, glassMat);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 30),
      edgeMat
    );
    pane.add(edges);

    const group = new THREE.Group();
    group.add(pane);
    group.position.set(
      Math.sin(i * 1.6) * 2.6,
      Math.cos(i * 1.1) * 1.4,
      -i * SPACING
    );
    group.rotation.z = Math.sin(i * 0.9) * 0.22;
    group.userData.baseRot = group.rotation.z;
    group.userData.spin = (i % 2 === 0 ? 1 : -1) * 0.08;
    root.add(group);
    panes.push(group);
  }

  // ---- Goticulas flutuantes (atmosfera) ----
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xeaf7ff,
    roughness: 0.05,
    transmission: 1,
    thickness: 0.5,
    ior: 1.4,
    envMapIntensity: 1.2,
    transparent: true,
  });
  const dropGeo = new THREE.IcosahedronGeometry(0.12, 2);
  const DROPS = 60;
  const drops = new THREE.InstancedMesh(dropGeo, dropMat, DROPS);
  const dummy = new THREE.Object3D();
  const dropData = [];
  for (let i = 0; i < DROPS; i++) {
    const d = {
      x: (Math.random() - 0.5) * 22,
      y: (Math.random() - 0.5) * 16,
      z: -Math.random() * PANE_COUNT * SPACING,
      s: 0.4 + Math.random() * 1.4,
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    };
    dropData.push(d);
    dummy.position.set(d.x, d.y, d.z);
    dummy.scale.setScalar(d.s);
    dummy.updateMatrix();
    drops.setMatrixAt(i, dummy.matrix);
  }
  scene.add(drops);

  // ---- Post-processing: bloom ciano ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.65, // strength
    0.7, // radius
    0.85 // threshold
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- Estado de interacao ----
  let scrollTarget = 0; // 0..1 progresso de scroll
  let scrollCurrent = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function onPointerMove(e) {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  if (!reduceMotion) window.addEventListener("pointermove", onPointerMove);

  function setScroll(p) {
    scrollTarget = Math.max(0, Math.min(1, p));
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener("resize", onResize);

  // ---- Loop ----
  const clock = new THREE.Clock();
  let running = true;
  const totalDepth = (PANE_COUNT - 1) * SPACING;

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();

    // suaviza scroll e ponteiro
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.06;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    // camera atravessa os paineis
    camera.position.z = 14 - scrollCurrent * (totalDepth + 8);
    camera.position.x = pointer.x * 1.1;
    camera.position.y = -pointer.y * 0.8;
    camera.lookAt(0, 0, camera.position.z - 8);

    if (!reduceMotion) {
      panes.forEach((g, i) => {
        g.rotation.z =
          g.userData.baseRot + Math.sin(t * 0.4 + i) * 0.05;
        g.rotation.y = Math.sin(t * 0.2 + i * 0.5) * 0.12;
        g.children[0].rotation.z += g.userData.spin * 0.01;
      });

      for (let i = 0; i < DROPS; i++) {
        const d = dropData[i];
        const yy = d.y + Math.sin(t * d.speed + d.phase) * 1.2;
        const xx = d.x + Math.cos(t * d.speed * 0.6 + d.phase) * 0.6;
        dummy.position.set(xx, yy, d.z);
        dummy.scale.setScalar(d.s * 0.12 + 0.02);
        dummy.rotation.set(t * 0.3 + i, t * 0.2, 0);
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
      }
      drops.instanceMatrix.needsUpdate = true;

      cyanLight.position.x = Math.sin(t * 0.5) * 7;
      cyanLight.position.y = Math.cos(t * 0.4) * 4;
    }

    composer.render();
    requestAnimationFrame(tick);
  }

  // Pausa quando a aba/canvas nao esta visivel (economia de bateria)
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !running) {
        running = true;
        clock.start();
        tick();
      } else if (!visible) {
        running = false;
      }
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      clock.start();
      tick();
    }
  });

  tick();

  return { setScroll, dispose };

  function dispose() {
    running = false;
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    io.disconnect();
    glassMat.dispose();
    dropMat.dispose();
    dropGeo.dispose();
    renderer.dispose();
  }
}
