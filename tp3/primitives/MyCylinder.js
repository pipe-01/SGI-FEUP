import {CGFobject} from '../../lib/CGF.js';


export class MyCylinder extends CGFobject {

    constructor(scene, bottomRadius, topRadius, height, slices, stacks) {
        super(scene);
        this.height = height;
        this.bottomRadius = bottomRadius;
        this.topRadius = topRadius;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();

    }

    initBuffers() {

        this.vertices = [];
        this.normals = [];
		this.indices = [];
		this.texCoords = [];

        var phi = 0;
        var alphaAng = 2*Math.PI/this.slices;
        var radiusInc = (this.topRadius-this.bottomRadius)/this.stacks;
        var heightInc = this.height/this.stacks;
        var radius = this.bottomRadius;
        var currentHeight = 0;

        for(let i = 0; i <= this.stacks; i++){

            // All vertices have to be declared for a given face
            // even if they are shared with others, as the normals 
            // in each face will be different
            phi = 0;
            for (let j = 0; j <= this.slices; j++) {
                var x =- Math.sin(phi) * radius;
                var y = Math.cos(phi) * radius;

                this.vertices.push(x, y, currentHeight);
                this.normals.push(x, y, 0);
                this.texCoords.push(j/this.slices, 1-i/this.stacks);
                phi += alphaAng;
            }

            radius = radius + radiusInc;
            currentHeight = currentHeight + heightInc;

        }

        for(let i = 0; i <= this.stacks; i++){
            for(let j = 0; j <= this.slices; j++){
                let index = (i * (this.slices + 1)) + j;
                this.indices.push(index, index + 1, index + this.slices + 2);
                this.indices.push(index, index + this.slices + 2, index + this.slices + 1);
            }
        }
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**

    //  * Called when user interacts with GUI to change object's complexity.

    //  * @param {integer} complexity - changes number of slices

    //  */

    updateBuffers(complexity){

        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12


        // reinitialize buffers

        this.initBuffers();

        this.initNormalVizBuffers();

    }
    
    updateTexCoords(coords){
        //doesn't need to do anything
    }
}
