import { MyGameOrchestrator } from "./MyGameOrchestrator.js";
import { MyGameSequence } from "./MyGameSequence.js";

export class MyAnimator {
    constructor(scene, orchestrator, sequence) {
        this.scene = scene;
        this.orchestrator = orchestrator;
        this.sequence = sequence;
        this.animations = [];
    }
    
    reset() {
        this.animations = [];
    }

    start() {
        this.sequence.forEach(move => {
            move.animate();
        });
    }

    addAnimation(animation) {
        this.animations.push(animation);
    }

    update(t) {
        for (let animation of this.animations){
            animation.update(t);
        }
    }

    display() {
        this.sequence[this.index].display();
    }
}