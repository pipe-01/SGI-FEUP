export class MyComponent {
    constructor(scene, id, materialID, texture, l_s, l_t, animationID=null,primitives=[], children=[]){
        this.scene = scene;
        this.id = id;
        this.transformation = mat4.create();
        this.materialID = materialID;
        this.texture = texture;
        this.l_s = l_s;
        this.l_t = l_t;
        this.primitives = primitives;
        this.children = children;
        this.isHighlighted = false;
        this.animation = animationID;
        this.highlight = [];
        this.materialList = [];
    }

    addPrimitive(primitive){
        this.primitives.push(primitive);
    }
    
    addChildren(child){
        this.children.push(child);
    }

    getMaterial(){
        return this.material;
    }

    getPrimitives(){
        return this.primitives;
    }

    getChildren(){
        return this.children;
    }

    changeMaterial(){
        let curIndex = this.materialList.indexOf(this.materialID);
        if(curIndex == this.materialList.length - 1){
            this.materialID = this.materialList[0];
        }
        else{
            this.materialID = this.materialList[curIndex + 1];
        }
    }

    addHiglight(r,g,b,length){
        this.highlight['red'] = r;
        this.highlight['green'] = g;
        this.highlight['blue'] = b;
        this.highlight['length_h'] = length;
    }

    getHighlight(){
        return this.highlight;
    }

    setAnimation(animation){
        this.animation = animation;
    }

    getAnimation(){
        return this.animation;
    }
}