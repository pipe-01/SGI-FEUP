export class MyComponent {
    constructor(scene, id, materialID, texture, l_s, l_t, primitives=[], children=[]){
        this.scene = scene;
        this.id = id;
        this.transformation = mat4.create();
        this.materialID = materialID;
        this.texture = texture;
        this.l_s = l_s;
        this.l_t = l_t;
        this.primitives = primitives;
        this.children = children;

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
}