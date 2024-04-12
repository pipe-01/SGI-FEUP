#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float timeFactor;

uniform vec4 targetColor;

void main() {

    float t = (sin(timeFactor) + 1.0) / 2.0;

    vec4 texColor = texture2D(uSampler, vTextureCoord + vec2(t * .01,0.0));

    vec4 color = texColor + (targetColor - texColor) * t;

    gl_FragColor = color * texColor;
}