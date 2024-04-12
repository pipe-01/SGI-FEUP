import { CGFobject, CGFshader, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyRectangle } from './primitives/MyRectangle.js';

export class MyText extends CGFobject {
    constructor(scene, text) {
        super(scene);
        this.text = text;
        this.base = new MyRectangle(scene, 1, 0, 1, 0, 1);

        this.charactedMap = {
            '-': [13, 2],
            '0': [0, 3],
            '1': [1, 3],
            '2': [2, 3],
            '3': [3, 3],
            '4': [4, 3],
            '5': [5, 3],
            '6': [6, 3],
            '7': [7, 3],
            '8': [8, 3],
            '9': [9, 3],
            ':': [10, 3],
            'A': [1, 4],
            'B': [2, 4],
            'C': [3, 4],
            'D': [4, 4],
            'E': [5, 4],
            'F': [6, 4],
            'G': [7, 4],
            'H': [8, 4],
            'I': [9, 4],
            'J': [10, 4],
            'K': [11, 4],
            'L': [12, 4],
            'M': [13, 4],
            'N': [14, 4],
            'O': [15, 4],
            'P': [0, 5],
            'Q': [1, 5],
            'R': [2, 5],
            'S': [3, 5],
            'T': [4, 5],
            'U': [5, 5],
            'V': [6, 5],
            'W': [7, 5],
            'X': [8, 5],
            'Y': [9, 5],
            'Z': [10, 5],
            'a': [1, 6],
            'b': [2, 6],
            'c': [3, 6],
            'd': [4, 6],
            'e': [5, 6],
            'f': [6, 6],
            'g': [7, 6],
            'h': [8, 6],
            'i': [9, 6],
            'j': [10, 6],
            'k': [11, 6],
            'l': [12, 6],
            'm': [13, 6],
            'n': [14, 6],
            'o': [15, 6],
            'p': [0, 7],
            'q': [1, 7],
            'r': [2, 7],
            's': [3, 7],
            't': [4, 7],
            'u': [5, 7],
            'v': [6, 7],
            'w': [7, 7],
            'x': [8, 7],
            'y': [9, 7],
            'z': [10, 7],
        }

        this.appearance = new CGFappearance(this.scene);
        this.appearance.setTexture(this.scene.textTexture);
    }

    updateText(text) {
        this.text = text;
    }

    display() {
        this.appearance.apply();
        this.scene.setActiveShaderSimple(this.scene.textShader);
        
        var midSpace = (5 / 3) / 2 + (this.text.length - 1) / (5 / 3) / 2 - (this.text.split(' ').length - 1) / (7 / 3) / 2;

        var spaces = 0;
        for (let i = 0; i < this.text.length; i++) {
            let character = this.text[i];
            if (character == ' ') {
                spaces++;
                continue;
            }
            let charCoords = this.charactedMap[character];
            this.scene.pushMatrix();
            this.scene.translate(i / (5 / 3) - spaces / (7 / 3) - midSpace, 0, 0);
            this.scene.activeShader.setUniformsValues({ 'charCoords': charCoords });
            this.base.display();
            this.scene.popMatrix();
        }

        this.scene.setActiveShaderSimple(this.scene.defaultShader);
    }
}