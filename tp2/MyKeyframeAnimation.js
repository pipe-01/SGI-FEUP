import {MyAnimation} from './MyAnimation.js';

/**
 * MyAnimation
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 */
export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes) {
        super(scene);    

        this.keyframes = keyframes
        this.initialTime = 0;
        this.previousTime = 0;
        this.elapsedTime = 0;
        this.currentFrame = -1;
        this.isActive = false;
        this.matrix = mat4.create();

        this.keyframes.sort((a,b) => a.instant - b.instant);

    }

    update(t){
        if(this.initialTime == 0){
            this.initialTime = t;
            this.previousTime = t;
        }

        this.elapsedTime = t - this.initialTime;

        if(this.keyframes[0].instant > this.elapsedTime){
            this.matrix = mat4.create();
            mat4.scale(this.matrix, this.matrix, [0,0,0]);
            return;
        }
        else if(this.keyframes[this.keyframes.length-1].instant > this.elapsedTime){
            this.isActive = true;
        }
        else if(this.keyframes[this.keyframes.length-1].instant < this.elapsedTime && this.isActive==false){
            return;
        }
        else{
            this.matrix = mat4.create();
            mat4.translate(this.matrix, this.matrix, this.keyframes[this.keyframes.length-1].translate);
            mat4.rotateX( this.matrix, this.matrix, this.keyframes[this.keyframes.length-1].rotx*Math.PI/180);
            mat4.rotateY( this.matrix, this.matrix,this.keyframes[this.keyframes.length-1].roty*Math.PI/180);
            mat4.rotateZ( this.matrix, this.matrix,this.keyframes[this.keyframes.length-1].rotz*Math.PI/180);
            mat4.scale(this.matrix, this.matrix, this.keyframes[this.keyframes.length-1].scale);   
            this.isActive = false;
            return;
        }

        for(let i = 0; i < this.keyframes.length; i++){
            if(this.keyframes[i].instant > this.elapsedTime){
                this.currentFrame = i;
                break;
            }
        }
        
        this.interpolate(this.keyframes[this.currentFrame - 1], this.keyframes[this.currentFrame], t);

    }

    apply() {
        this.scene.multMatrix(this.matrix);
    }



    interpolate(currFrame, nextFrame, t){
        this.matrix = mat4.create();
        
        let transX = currFrame.translate[0] + (nextFrame.translate[0] - currFrame.translate[0])*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        let transY = currFrame.translate[1] + (nextFrame.translate[1] - currFrame.translate[1])*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        let transZ = currFrame.translate[2] + (nextFrame.translate[2] - currFrame.translate[2])*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        // console.log(transX, transY, transZ, "TESTE");

        let rotationX = currFrame.rotx*Math.PI/180 + (nextFrame.rotx - currFrame.rotx)*Math.PI/180*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        let rotationY = currFrame.roty*Math.PI/180 + (nextFrame.roty - currFrame.roty)*Math.PI/180*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        let rotationZ = currFrame.rotz*Math.PI/180 + (nextFrame.rotz - currFrame.rotz)*Math.PI/180*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        // console.log(rotationX, rotationY, rotationZ, "TESTE");
        // console.log(currFrame.rotx);


        let scaleX = currFrame.scale[0] + (nextFrame.scale[0] - currFrame.scale[0])*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        let scaleY = currFrame.scale[1] + (nextFrame.scale[1] - currFrame.scale[1])*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);
        let scaleZ = currFrame.scale[2] + (nextFrame.scale[2] - currFrame.scale[2])*(this.elapsedTime - currFrame.instant) / (nextFrame.instant - currFrame.instant);

        mat4.translate(this.matrix, this.matrix, [transX, transY, transZ]);
        mat4.rotateX(this.matrix, this.matrix, rotationX);
        mat4.rotateY(this.matrix, this.matrix, rotationY);
        mat4.rotateZ(this.matrix, this.matrix, rotationZ);
        mat4.scale(this.matrix, this.matrix, [scaleX, scaleY, scaleZ]);
        // console.log(this.matrix);

        this.previousTime = t;

    }
}