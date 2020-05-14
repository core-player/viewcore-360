// Vertex shader program
const vertexShader = `
attribute vec2 aVertexPosition;
uniform mat4 proj_inv;
varying vec3 vDirection;
uniform int rotateFlag;
void main(void) {
  gl_Position = vec4(aVertexPosition, 1.0, 1.0);
  highp vec4 projective_direction = proj_inv * gl_Position;
  if (rotateFlag == 1) {
    vDirection = projective_direction.yxz / projective_direction.w;
  } else {
    vDirection = projective_direction.xyz / projective_direction.w;
  }
}
`

export default vertexShader
