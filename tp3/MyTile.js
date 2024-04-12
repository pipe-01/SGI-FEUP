import {CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyRectangle } from "./primitives/MyRectangle.js";

export class MyTile {
    constructor(scene, id, x, y) {
        this.scene = scene;
        this.pointerPiece = null;
        this.board = null;
        this.x = x;
        this.y = y;
        this.id = id;
        this.tile = new MyRectangle(this.scene, this.id, this.x, this.x + 1, this.y, this.y + 1);
        // this.selectable = true;
        this.materialBlack = new CGFappearance(this.scene);
        this.materialBlack.setAmbient(0, 0, 0, 1);
        this.materialBlack.setDiffuse(0, 0, 0, 1);
        this.materialBlack.setSpecular(0, 0, 0, 1);
        this.materialBlack.setShininess(10.0);
    
    
        this.materialWhite = new CGFappearance(this.scene);
        this.materialWhite.setAmbient(0, 0, 0, 1);
        this.materialWhite.setDiffuse(1, 1, 1, 1);
        this.materialWhite.setSpecular(0, 0, 0, 1);
        this.materialWhite.setShininess(1);
        

        this.materialGreen = new CGFappearance(this.scene);
        this.materialGreen.setAmbient(0, 0, 0, 1);
        this.materialGreen.setDiffuse(0, 0.3, 0, 1);
        this.materialGreen.setSpecular(0, 0, 0, 1);
        this.materialGreen.setShininess(10.0);

        if(this.x % 2 == this.y % 2)
            this.setMaterialApplied("black");
        else
            this.setMaterialApplied("white");
        this.transformation = null;
    }


    setPiece(piece) {
        this.pointerPiece = piece;
    }

    unsetPiece() {
        this.pointerPiece = null;
    }

    getPiece() {
        return this.pointerPiece;
    }

    setBoard(board) {
        this.board = board;
    }

    getBoard() {
        return this.board;
    }

    setMaterialApplied(material) {
        this.materialApplied = material;
    }

    getMaterialApplied() {
        return this.materialApplied;
    }

    display() {
        if(this.scene.pickEnabled){
            this.scene.registerForPick(this.id, this);
        }
        this.scene.pushMatrix();
        if(this.materialApplied == "black"){
            this.materialBlack.apply();
        }
        else if(this.materialApplied == "green"){
            this.materialGreen.apply();
        }
        else {
            this.materialWhite.apply();
        }

        this.tile.display();
        if(this.pointerPiece != null){
            this.pointerPiece.display();
        }
        this.scene.popMatrix();

        if(this.scene.pickEnabled)
            this.scene.clearPickRegistration();
    }   

}