import {CGFobject} from '../../lib/CGF.js';


export class MyTorus extends CGFobject {

    constructor(scene, innerRadius, outerRadius, slices, loops) {
        super(scene);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();

    }

    initBuffers() {

        this.vertices = [];
        this.normals = [];
		this.indices = [];
		this.texCoords = [];

        var phi = 0;
        var phiInc = (2*Math.PI)/ this.loops;
        var theta = 0;
        var thetaInc = (2*Math.PI)/ this.slices;
        var loopVertices = this.slices + 1;



        for(let i = 0; i <= this.loops; i++){

            // All vertices have to be declared for a given face
            // even if they are shared with others, as the normals 
            // in each face will be different
            theta = 0;
            for (let j = 0; j <= this.slices; j++) {
                var x = (this.outerRadius + this.innerRadius * Math.cos(theta)) * Math.cos(phi);
                var y = (this.outerRadius + this.innerRadius * Math.cos(theta)) * Math.sin(phi);
                var z = this.innerRadius * Math.sin(theta);
                this.vertices.push(x, y, z);


                if(i < this.loops && j < this.slices){
                    var curr = i * loopVertices + j;
                    var next = curr + loopVertices;



                    this.indices.push(curr + 1, curr, next);
                    this.indices.push(curr + 1, next, next + 1);
                }



                var outerX = this.outerRadius * Math.cos(phi);
                var outerY = this.outerRadius * Math.sin(phi);
                var outerZ = 0;
                this.normals.push((x - outerX) / this.innerRadius, (y - outerY) / this.innerRadius, (z - outerZ) / this.innerRadius);


                this.texCoords.push(j / this.slices, i / this.loops);

                theta = theta + thetaInc;
            }

            phi = phi + phiInc;

        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateTexCoords(coords){
        //doesn't need to do anything
    }

}
