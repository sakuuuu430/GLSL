precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float fireSize;

const int OCT = 8; // オクターブ
const float PST = 0.5; // パーセンテージ
const float PI = 3.1415926; // 円周率

float interpolate(float a, float b, float x) {
  float f = (1.0 - cos(x * PI)) * 0.5;
  return a * (1.0 - f) + b * f;
}

float rnd(vec2 n) {
  float a = 0.129898;
  float b = 0.78233;
  float c = 437.585453;
  float dt= dot(n ,vec2(a, b));
  float sn= mod(dt, 3.14);
  return fract(sin(sn) * c);
}

float irnd(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec4 v = vec4(rnd(vec2(i.x,       i.y      )),
                rnd(vec2(i.x + 1.0, i.y      )),
                rnd(vec2(i.x,       i.y + 1.0)),
                rnd(vec2(i.x + 1.0, i.y + 1.0)));
  return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
}

float noise(vec2 p) {
  float t = 0.0;
  for (int i = 0; i < OCT; i++) {
    float freq = pow(2.0, float(i));
    float amp  = pow(PST, float(OCT - i));
    t += irnd(vec2(p.x / freq, p.y / freq)) * amp;
  }
  return t;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec3 a = vec3(0.);
  for (int i = 0; i < 24; ++i) {
    float s = sin(time + float(i) / PI);
    float c = cos(time + float(i) / PI);
    vec2 q = p + vec2(sin(time + float(i)), cos(time + float(i) / PI * 2.)) * mat2(c, -s, s, c);
    float l = clamp(1.0 - length(q), 0., 1.);
    l = pow(l, fireSize);
    float n = noise(vec2(gl_FragCoord.xy) - vec2(0., time * 500.));
    a += smoothstep(.85, 1., (n + l * l) * vec3(0.9804, 0.8745, 0.7412));
  }
  gl_FragColor = vec4(a, 1.0);
}
