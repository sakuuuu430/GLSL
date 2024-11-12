
attribute vec3 position;
attribute vec4 color;
attribute float size;

uniform float pointScale;
uniform vec2 mouse; // マウスカーソルの座標（-1.0 ~ 1.0） @@@
uniform float time;

varying vec4 vColor;

void main() {
  vColor = color + sin(length(position.xy) * time);

  // 頂点座標からマウスの位置を指すベクトル @@@
  vec2 toMouse = mouse - position.xy;
  // ベクトルの長さを測る @@@
  float distanceToMouse = length(toMouse);

  float x = position.x * cos(time) + position.y * sin(time);
  float y = -position.x * sin(time) + position.y * cos(time);
  gl_Position = vec4(x * sin(time) * distanceToMouse, y * cos(time) * distanceToMouse, position.z, 1.0);

  // ベクトルの長さを考慮して頂点のサイズを変化させる @@@
  gl_PointSize = size * pointScale * distanceToMouse;
}
