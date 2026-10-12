import * as THREE from 'three';

const GEOMS = {
  box: () => new THREE.BoxGeometry(1, 1, 1),
  sphere: () => new THREE.SphereGeometry(0.5, 32, 20),
  cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
  cone: () => new THREE.ConeGeometry(0.5, 1, 32),
  torus: () => new THREE.TorusGeometry(0.35, 0.15, 16, 40),
  octahedron: () => new THREE.OctahedronGeometry(0.5),
  icosahedron: () => new THREE.IcosahedronGeometry(0.5),
  dodecahedron: () => new THREE.DodecahedronGeometry(0.5),
  capsule: () => new THREE.CapsuleGeometry(0.25, 0.5, 8, 16),
};

const DEFAULT = { objects: [{ shape: 'box', color: '#ff9ec7', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], emissive: 0.1, metalness: 0.2, roughness: 0.4 }], animation: { spin: 0.4, float: 0.3 }, message: '' };

export function createGiftView(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0.4, 5);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8888aa, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(3, 4, 5);
  scene.add(sun);

  const group = new THREE.Group();
  scene.add(group);
  let anim = DEFAULT.animation;

  function setGift(spec) {
    group.clear();
    for (const o of spec.objects) {
      const mat = new THREE.MeshStandardMaterial({
        color: o.color, metalness: o.metalness, roughness: o.roughness,
        emissive: o.color, emissiveIntensity: o.emissive,
      });
      const mesh = new THREE.Mesh(GEOMS[o.shape](), mat);
      mesh.position.set(...o.position);
      mesh.rotation.set(...o.rotation);
      mesh.scale.set(...o.scale);
      group.add(mesh);
    }
    anim = spec.animation;
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();
  setGift(DEFAULT);

  renderer.setAnimationLoop((t) => {
    const s = t / 1000;
    group.rotation.y = s * anim.spin;
    group.position.y = Math.sin(s * 1.5) * 0.15 * anim.float * 2;
    renderer.render(scene, camera);
  });

  return { setGift };
}
