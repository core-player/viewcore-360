const fragmentShader = `
precision highp float;
varying vec3 vDirection;
uniform  float eye;
uniform float projection;
uniform float hfov;
uniform float vfov;
uniform sampler2D uSampler;
*/
uniform float PI;
vec4 directionToColor(vec3 direction, float eye, float projection) {
/*
* Input: a direction.  +x = right, +y = up, +z = backward.
*        an eye. left = 0, right = 1.
*        a projection. see ProjectionEnum in JS file for enum
* Output: a color from the video
*
* Bug alert: the control flow here may screw up texture filtering.
*/
float theta = atan(direction.x, -1.0 * direction.z);
float phi = atan(direction.y, length(direction.xz));
vec2 loc;
float h = (hfov / 360.0) * 2.0 * PI;
float v = (vfov / 180.0) * PI;
float hsep = (2.0 * PI - h) / 2.0;
float vsep = v / 2.0;
if (hsep != 0.0 && (theta > 0.0 && theta < hsep || theta > -hsep && theta <= 0.0)) {
    return vec4(0,0,0,1);
}
if (vsep != 0.0 && (phi > vsep || phi < -vsep)) {
    return vec4(0,0,0,1);
}
/*
* The Nexus 7 and the Moto X (and possibly many others) have
* a buggy atan2 implementation that screws up when the numerator
* (the first argument) is too close to zero.  (The 1e-4 is carefully
* chosen: 1e-5 doesn't fix the problem.
*/
if (abs(direction.x) < 1e-4 * abs(direction.z)) {
    theta = 0.5*PI * (1.0 - sign(-1.0 * direction.z));
}
if (abs(direction.y) < 1e-4 * length(direction.xz)) {
    phi = 0.0;
}
// Uncomment to debug the transformations.
// return vec4(theta / (2. * PI) + 0.5, phi / (2. * PI) + 0.5, 0., 0.);
phi += vsep;
// 有内容区域坐标映射到texture坐标
if (projection == 0.) {
    if (theta < 0.0) {
    theta += hsep;
    } else {
    theta -= hsep;
    }
    // Projection == 0: equirectangular projection
    loc = vec2(mod(theta / h, 1.0), phi / v);
} else if (projection == 1.) {
    // Projection == 1: equirectangular top/bottom 3D projection
    eye = 1. - eye;
    loc = vec2(mod(theta / h, 1.0), (phi / v + eye)/ 2.);
} else {
    if (theta < 0.0) {
    theta -= (h - hsep);
    } else {
    theta -= hsep;
    }
    /* theta -= hsep;*/
    eye = 1. - eye;
    // Projection == 2: equirectangular left/right 3D projection
    loc = vec2(mod((theta / h + eye) / 2., 1.0), phi / v);
}
return texture2D(uSampler, loc);
}
void main(void) {
    gl_FragColor = directionToColor(vDirection, eye, projection);
}
`

export default fragmentShader
