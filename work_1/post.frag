precision mediump float;
uniform sampler2D textureUnit;
uniform float time;
uniform float blockSize;
varying vec2 vTexCoord;

void main() {
  vec4 samplerColor = texture2D(textureUnit, vTexCoord);
  float block = blockSize;
  vec2 signedCoord = floor(vTexCoord * block) / block;
  gl_FragColor = texture2D(textureUnit, signedCoord);
}
