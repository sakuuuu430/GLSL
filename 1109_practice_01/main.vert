
attribute vec3 position;
attribute vec4 color;
attribute float size;

uniform float pointScale;
uniform vec2 mouse; // マウスカーソルの座標（-1.0 ~ 1.0） @@@
uniform float radius; // 影響範囲
uniform float time; // 経過時間

varying vec4 vColor;

void main() {

  // 頂点座標からマウスの位置を指すベクトル @@@
  vec2 toMouse = mouse - position.xy;
  // ベクトルの長さを測る @@@
  float distanceToMouse = length(toMouse);
  // 範囲を制限する
  float ratio = (radius - clamp(distanceToMouse, 0., radius));
  // 範囲内で移動・回転
  vec2 dotPosition = vec2(position.x + (position.x * sin(time + position.x) * ratio), position.y + (position.y * cos(time + position.y) * ratio));
  gl_Position = vec4(dotPosition, position.z, 1.0);
  // ベクトルの長さを考慮して頂点のサイズを変化させる @@@
  gl_PointSize = size * pointScale + distanceToMouse;
  // 時間で色を変更する
  vColor = color + sin(time + (position.x + position.y));
}
