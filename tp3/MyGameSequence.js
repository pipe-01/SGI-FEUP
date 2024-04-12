import { MyGameMove } from "./MyGameMove.js";

export class MyGameSequence {
    constructor(scene) {
        this.scene = scene;
        this.sequence = [];
    }


    addMove(move) {
        this.sequence.push(move);
    }

    undo() {
        if (this.sequence.length > 0) {
            return this.sequence.pop();
        }
    }

    replay() {
        this.sequence.forEach(move => {
            move.animate();
        });
    }
}