
attribute vec3 position;
attribute vec4 color;
attribute float size;

uniform float pointScale;
uniform vec2 mouse; // マウスカーソルの座標（-1.0 ~ 1.0） @@@
uniform float radius;
uniform float time;

varying vec4 vColor;

const float PI = 3.141592;

void main() {
  // 頂点座標からマウスの位置を指すベクトル @@@
  vec2 toMouse = mouse - position.xy;
  // ベクトルの長さを測る @@@
  float distanceToMouse = length(toMouse);

  vec2 normalizedToMouse = normalize(toMouse);

  float x = normalizedToMouse.x * cos(time) + normalizedToMouse.y * sin(time);
  float y = -normalizedToMouse.x * sin(time) + normalizedToMouse.y * cos(time);
  float range = (radius - clamp(distanceToMouse, 0., radius));
  gl_Position = vec4(position.x + sin(x * PI + time) * distanceToMouse, position.y + cos(y * PI + time) * distanceToMouse, position.z, 1.0);

  // ベクトルの長さを考慮して頂点のサイズを変化させる @@@
  gl_PointSize = size * pointScale;

  vColor = vec4(color.r, color.g, color.b, color.a);
}
