attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;

varying vec2 vTextureCoord;
uniform sampler2D uSampler2;

uniform float normScale;

void main() {
	vec3 offset=vec3(0.0,0.0,0.0);
	
	vTextureCoord = aTextureCoord;

	offset=aVertexNormal*normScale*0.1*((1.0 + sin(timeFactor)) / 2.0);

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}
