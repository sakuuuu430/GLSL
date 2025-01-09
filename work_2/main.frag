precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

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

float line(vec2 p) {
  return 0.01 / abs(p.y);
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  float dist = smoothstep(0., 1., length(p - mouse)) * 2.;
  vec3 sum = vec3(0.);
  float a = atan(p.y, p.x);
  float l = length(p) * 4.;
  for (int i = 0; i < 12; ++i) {
    float n = mod(float(i), 2.0) == 0. ? rnd(p + time * float(i)) : irnd(p + time * float(i));
    float n2 = (sin(time + float(i) / PI) + n) * dist;
    float r1 = l - float(i) * .5 + n2;
    float r2 = l - float(i) * .51 + n2;
    float r3 = l - float(i) * .51 + n2;
    vec2 q1 = vec2(a / PI * float(i), r1);
    vec2 q2 = vec2(a / PI * float(i), r2);
    vec2 q3 = vec2(a / PI * float(i), r3);
    sum += vec3(line(q1), line(q2), line(q3));
  }
  gl_FragColor = vec4(sum, 1.0);
}
