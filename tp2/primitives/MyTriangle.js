import { CGFobject } from '../../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2,x3,y3,z1,z2,z3) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
        this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
        this.y3 = y3;
		this.z1 = z1;
		this.z2 = z2;
		this.z3 = z3;
        this.id = id;
        

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
            this.x1,this.y1,this.z1, // 0 
            this.x2,this.y2,this.z2, // 1 
            this.x3,this.y3,this.z3  // 2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2
		];

		//A = p2 - p1
		//B = p3 - p1
		//C = p3 - p2

		this.v1 = vec3.fromValues(this.x1,this.y1,this.z1);
		this.v2 = vec3.fromValues(this.x2,this.y2,this.z2);
		this.v3 = vec3.fromValues(this.x3,this.y3,this.z3);

		this.vA = vec3.sub(vec3.create(), this.v2, this.v1);
		this.vB = vec3.sub(vec3.create(), this.v3, this.v1);
		this.vC = vec3.sub(vec3.create(), this.v3, this.v2);

		let a = vec3.len(this.vA);
		let b = vec3.len(this.vB);
		let c = vec3.len(this.vC);
		
		let cosAngle = (a*a + c*c - b*b) / (2*a*c);
		let sinAngle = Math.sqrt(1 - cosAngle*cosAngle);

		let normal = vec3.normalize(vec3.create(),vec3.cross(vec3.create(), this.vA, this.vB));


		//Facing Z positive
		this.normals = [
			...normal,
			...normal,
			...normal
		];

		console.log(this.normals);
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		this.a = a;
		this.b = b;
		this.c = c;

		let length_u = 1;//?
		let length_v = 1;

		this.texCoords = [
			0, 1,
			a / length_u, 0,
			c * cosAngle / length_u, c * sinAngle / length_v
		]

		this.a = a;
		this.c = c;
		this.cosAngle = cosAngle;
		this.sinAngle =sinAngle;
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(l_s, l_t) {
		this.texCoords = [
			0,1,
			this.a / l_s, 0,
			this.c * this.cosAngle / l_s, this.c * this.sinAngle / l_t
		];
		this.updateTexCoordsGLBuffers();
	}
}

