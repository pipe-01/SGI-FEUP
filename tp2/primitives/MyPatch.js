import { CGFscene } from '../../lib/CGF.js';
import { CGFnurbsSurface, CGFnurbsObject  } from '../../lib/CGF.js';


/**
 * 
 */
export class MyPatch extends CGFscene
{
	constructor(scene, degreeU, partsU, degreeV, partsV, controlPoints) {
        super(scene);
        this.degreeU = degreeU;
        this.degreeV = degreeV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = controlPoints;


        this.nurbsSurface = new CGFnurbsSurface(this.degreeU, this.degreeV, this.controlPoints);

        this.obj = new CGFnurbsObject(scene, this.partsU, this.partsV, this.nurbsSurface);
	}


    display(){
        this.obj.display();
    }

    updateTexCoords(coords){
        //doesn't need to do anything
    }
}