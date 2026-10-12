// Shared scene-spec validation. The widget only ever renders data that passes
// through sanitize(), so a gift can never carry executable code.
const SHAPES = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'octahedron', 'icosahedron', 'dodecahedron', 'capsule'];
const MAX_OBJECTS = 40;

const num = (v, min, max, d) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d);
const vec = (v, min, max, d) => (Array.isArray(v) && v.length === 3 ? v.map((x, i) => num(x, min, max, d[i])) : d);
const color = (v) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : '#ff9ec7');

function sanitize(spec) {
  const objects = (Array.isArray(spec?.objects) ? spec.objects : []).slice(0, MAX_OBJECTS).flatMap((o) =>
    SHAPES.includes(o?.shape)
      ? [{
          shape: o.shape,
          color: color(o.color),
          position: vec(o.position, -3, 3, [0, 0, 0]),
          rotation: vec(o.rotation, -6.3, 6.3, [0, 0, 0]),
          scale: vec(o.scale, 0.02, 3, [1, 1, 1]),
          emissive: num(o.emissive, 0, 1, 0),
          metalness: num(o.metalness, 0, 1, 0.2),
          roughness: num(o.roughness, 0, 1, 0.5),
        }]
      : []
  );
  return {
    objects,
    animation: { spin: num(spec?.animation?.spin, -3, 3, 0.4), float: num(spec?.animation?.float, 0, 1, 0.3) },
    message: typeof spec?.message === 'string' ? spec.message.slice(0, 140) : '',
  };
}

module.exports = { sanitize, SHAPES };
