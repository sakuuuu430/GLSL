precision mediump float;
uniform sampler2D textureUnit;
uniform float time;
uniform float strength;
uniform float blockLength;
varying vec2 vTexCoord;

float rnd(vec2 n) {
  float a = 0.129898;
  float b = 0.78233;
  float c = 437.585453;
  float dt= dot(n ,vec2(a, b));
  float sn= mod(dt, 3.14);
  return fract(sin(sn) * c);
}

void main() {
  vec4 samplerColor = texture2D(textureUnit, vTexCoord);
  float x = rnd(vec2(floor(time * 2.), floor(vTexCoord.y * blockLength)));
  vec2 signedCoord = vec2(x, 0);
  float n = rnd(vec2(signedCoord));
  gl_FragColor = texture2D(textureUnit, vTexCoord + signedCoord * strength * mix(-1., 1., step(0.5, n)));
}
