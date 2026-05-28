// 3D simplex noise by Ashima Arts / Stefan Gustavson — MIT licensed, widely
// reused as the standard shader-noise primitive. Kept verbatim and credited.
// https://github.com/ashima/webgl-noise (MIT)
//
// The vertex/fragment shaders below are Susurro's own implementation of a
// standard, well-documented technique: multi-octave noise displacement of a
// sphere + a fresnel rim glow. No third-party application code is reused.
const SIMPLEX_NOISE_3D = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

// Susurro's own fbm displacement + fresnel implementation.
export const VERTEX_SHADER = `
uniform float u_time;
uniform float u_intensity;
uniform float u_speed;
uniform float u_displacement;
uniform float u_pulse;

varying float v_n;
varying vec3 v_normal;
varying vec3 v_view;

${SIMPLEX_NOISE_3D}

void main() {
  float flow = u_time * u_speed;

  // fbm: three octaves, halving amplitude, drifting along different axes.
  float n = snoise(position * 1.5 + vec3(0.0, flow, 0.0));
  n += 0.5 * snoise(position * 3.0 + vec3(flow * 0.6, 0.0, 0.0));
  n += 0.25 * snoise(position * 6.0 + vec3(0.0, 0.0, flow * 0.5));
  n *= 0.5;

  float amount = n * u_intensity * u_displacement + u_pulse * 0.18;
  vec3 displaced = position + normal * amount;

  v_n = n;
  v_normal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  v_view = -mv.xyz;

  gl_Position = projectionMatrix * mv;
}
`;

export const FRAGMENT_SHADER = `
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_glowColor;
uniform float u_glowIntensity;
uniform float u_pulse;

varying float v_n;
varying vec3 v_normal;
varying vec3 v_view;

void main() {
  vec3 view = normalize(v_view);
  float rim = pow(1.0 - max(dot(v_normal, view), 0.0), 2.5);

  vec3 base = mix(u_colorA, u_colorB, smoothstep(-0.6, 0.6, v_n));
  vec3 color = base + u_glowColor * (rim * u_glowIntensity + u_pulse * 0.6);

  gl_FragColor = vec4(color, 1.0 - rim * 0.18);
}
`;
