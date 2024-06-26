import { CGFappearance, CGFcamera, CGFXMLreader, CGFcameraOrtho, CGFtexture } from '../lib/CGF.js';
import { MyRectangle } from './primitives/MyRectangle.js';
import { MyTriangle } from './primitives/MyTriangle.js';
import { MySphere } from './primitives/MySphere.js'
import { MyCylinder } from './primitives/MyCylinder.js';
import { MyComponent } from './MyComponent.js';
import { MyTorus } from './primitives/MyTorus.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");
            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }



    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        this.cameras = [];
        this.scene.cameraIDs = [];
        let children = viewsNode.children;

        this.default = this.reader.getString(viewsNode, 'default');
        if (this.default == null) {
            this.onXMLError('Error Parsing Default View');
        }
        
        for(let i = 0; i < children.length; i++){
            let curView = children[i];
            let camera = null;
            let id = curView.id;
            let type = curView.nodeName;
            switch(type){
                case 'perspective':
                    let near = this.reader.getFloat(curView, 'near');
                    let far = this.reader.getFloat(curView, 'far');
                    let fov = (this.reader.getFloat(curView,'angle')) * DEGREE_TO_RAD;
                    
                    let curViewChildren = []
                    for(let i = 0 ; i < curView.children.length; i++){
                        curViewChildren.push(curView.children[i].nodeName);
                    }

                    let fromIndex = curViewChildren.indexOf('from');
                    let toIndex = curViewChildren.indexOf('to');
                    /*
                    if (fromIndex == -1 || toIndex == -1){
                        return "Missing from or to in perspective view";
                    }*/
                    let from = this.parseCoordinates3D(curView.children[fromIndex], 'from');
                    let to = this.parseCoordinates3D(curView.children[toIndex], 'to');

                    camera = new CGFcamera(fov, near, far, from, to);
                    break;
                case 'ortho':
                    let nearOrtho = this.reader.getFloat(curView, 'near');
                    let farOrtho = this.reader.getFloat(curView, 'far');
                    let left = this.reader.getFloat(curView, 'left');
                    let right = this.reader.getFloat(curView, 'right');
                    let top = this.reader.getFloat(curView, 'top');
                    let bottom = this.reader.getFloat(curView, 'bottom');

                    let curViewChildrenOrtho = [];

                    for(let i = 0 ; i < curView.children.length; i++){
                        curViewChildrenOrtho.push(curView.children[i].nodeName);
                    }

                    let fromIndexOrtho = curViewChildrenOrtho.indexOf('from');
                    let toIndexOrtho = curViewChildrenOrtho.indexOf('to');
                    let upIndexOrtho = curViewChildrenOrtho.indexOf('up');

                    if(fromIndexOrtho == -1 || toIndexOrtho == -1){
                        return "Missing from or to in ortho view";
                    }


                    let fromOrtho = this.parseCoordinates3D(curView.children[fromIndexOrtho], 'from');
                    let toOrtho = this.parseCoordinates3D(curView.children[toIndexOrtho], 'to');
                    let upOrtho;
                    if(upIndexOrtho != -1){
                        upOrtho = this.parseCoordinates3D(curView.children[upIndexOrtho], 'up');
                    }else{
                        upOrtho = [0,1,0];
                    }

                    camera = new CGFcameraOrtho(left, right, bottom, top, nearOrtho, farOrtho, fromOrtho, toOrtho, upOrtho);
                    break;
            }
            
            this.cameras[id] = camera;
        }

        if (Object.keys(this.cameras).length == 0)
            return "at least one view must be defined";
        
        this.log("Parsed views");

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))){
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                enableLight = aux || 1;
            }

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;


                global.push(...[angle, exponent, targetLight]);
            }
            
            var attenuationIndex = nodeNames.indexOf("attenuation");
            if(attenuationIndex != -1){
                var constant = this.reader.getFloat(grandChildren[attenuationIndex], 'constant');
                var linear = this.reader.getFloat(grandChildren[attenuationIndex], 'linear');
                var quadratic = this.reader.getFloat(grandChildren[attenuationIndex], 'quadratic');
                var validConstant = constant == 0 || constant == 1;
                var validLinear = linear == 0 || linear == 1;
                var validQuadratic = quadratic == 0 || quadratic == 1;
                var validParameters = validConstant && validLinear && validQuadratic;
                if(constant + linear + quadratic != 1 || !validParameters){
                    return "Invalid attenuation factors for light with ID = " + lightId;
            }
            global.push(...[constant, linear, quadratic]);
        }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = [];
        
        var children = texturesNode.children;

        for(let i = 0; i < children.length; i++){
            if(children[i].nodeName != "texture"){
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            var textureID = this.reader.getString(children[i], 'id');
            var file = this.reader.getString(children[i],'file');

            if (textureID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";
            /*var texture = new CGFappearance(this.scene);
            texture.loadTexture(file);
            texture.setTextureWrap('REPEAT', 'REPEAT');*/
            var texture = new CGFtexture(this.scene,file);
            this.textures[textureID] = texture;

        }

        //For each texture in textures block, check ID and file URL
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
     parseMaterials(materialsNode) {
        var children = materialsNode.children;


        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];


        // Any number of materials.
        for (var i = 0; i < children.length; i++) {
            var mat = new CGFappearance(this.scene);
            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";
                
            grandChildren = children[i].children;

            for(var j = 0; j < grandChildren.length; j++){
                nodeNames.push(grandChildren[j].nodeName);
            }

            let emIndex = nodeNames.indexOf("emission");
            let ambIndex = nodeNames.indexOf("ambient");
            let diffIndex = nodeNames.indexOf("diffuse");
            let specIndex = nodeNames.indexOf("specular");

            var ambComponent, specComponent, diffComponent, emComponent;

            if(emIndex == -1){
                this.onXMLError("No value for emission in material " + materialID);
                emComponent = [0, 0, 0, 1];
            }
            else {
                emComponent = this.parseColor(grandChildren[emIndex], "emission component of the material " + materialID);
            }

            if(ambIndex == -1){
                this.onXMLError("No value for ambient in material " + materialID);
                ambComponent = [0.2, 0.2, 0.2, 1.0];
            }
            else {
                ambComponent = this.parseColor(grandChildren[ambIndex], "ambient component of the material " + materialID);
            }
                
            if(diffIndex == -1){
                this.onXMLError("No value for diffuse in material " + materialID);
                diffComponent = [0.5, 0.5, 0.5, 1.0];
            }
            else {
                diffComponent = this.parseColor(grandChildren[diffIndex], "diffuse component of the material " + materialID);
            }

            if(specIndex == -1){
                this.onXMLError("No value for specular in material " + materialID);
                specComponent = [0.5, 0.5, 0.5, 1.0];
            }
            else {
                specComponent = this.parseColor(grandChildren[specIndex], "emission component of the material " + materialID);
            }

            if(shininess < 0 || shininess === undefined){
                this.onXMLError("No value for shininess in material " + materialID + " using default value (10)");
            }
            mat.setShininess(shininess);
            mat.setAmbient(...ambComponent);
            mat.setEmission(...emComponent);
            mat.setDiffuse(...diffComponent);
            mat.setSpecular(...specComponent);
            
            this.materials[materialID] = mat;
            nodeNames = [];
        }

        return null;
    }


    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        var axis = this.reader.getString(grandChildren[j], "axis");
                        var angle = this.reader.getFloat(grandChildren[j], "angle");

                        var x = (axis == "x") ? 1 : 0;
                        var y = (axis == "y") ? 1 : 0;
                        var z = (axis == "z") ? 1 : 0;
                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, DEGREE_TO_RAD * angle, [x, y, z])
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'triangle') {

                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(y1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // z2
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;

                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // z2
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var trig = new MyTriangle(this.scene, primitiveId, x1, x2, y1, y2, x3, y3, z1, z2, z3);

                this.primitives[primitiveId] = trig;
            }
            else if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;
                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'cylinder') {

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top radius of the primitive coordinates for ID = " + primitiveId;

                // bot
                var bot = this.reader.getFloat(grandChildren[0], 'base');
                if (!(bot != null && !isNaN(bot)))
                    return "unable to parse bottom radius of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder(this.scene, bot, top, height, slices, stacks);

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'torus'){

                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner radius of the primitive coordinates for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse top outer radius of the primitive coordinates for ID = " + primitiveId;
                
                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var torus = new MyTorus(this.scene, inner, outer, slices, loops);

                this.primitives[primitiveId] = torus;
            }
        }
        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;
        this.components = [];
        
        var grandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');

            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");


            var component = new MyComponent(this.scene);
            component.id = componentID;


            // Transformations
            var transformationNodes = grandChildren[transformationIndex].children;
            var transfMatrix = mat4.create();


            var transCount = 0;
            var hasTrans = false;
            var hasTransRef = false;
            //process the transformation
            for (var j = 0; j < transformationNodes.length; j++) {
                switch (transformationNodes[j].nodeName) {
                    case 'transformationref':
                        if(transCount >= 1){
                            this.onXMLError("It is only possible to have a single transformationref. (componentID = " + componentID + ")");
                        }
                        else if(hasTrans){
                            this.onXMLError("Component has already multiple transformations. (componentID = " + componentID + ")");
                        }
                        else{
                            var id = this.reader.getString(transformationNodes[j], 'id');
                            transfMatrix = mat4.multiply(transfMatrix, transfMatrix, this.transformations[id]);
                            hasTransRef = true;
                            transCount++;
                        }
                        break;
                    case 'translate':
                        if(!hasTransRef){
                            var coordinates = this.parseCoordinates3D(transformationNodes[j], "translate transformation");
                            if (!Array.isArray(coordinates))
                                return coordinates;
                            transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                            hasTrans = true;
                        }
                        else{
                            this.onXMLError("Component has already one transformationref. (componentID = " + componentID + ")");
                        }
                        break;
                    case 'scale':
                        if(!hasTransRef){
                            var coordinates = this.parseCoordinates3D(transformationNodes[j], "scale transformation");
                            if (!Array.isArray(coordinates))
                                return coordinates;
                            transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                            hasTrans = true;
                        }
                        else{
                            this.onXMLError("Component has already one transformationref. (componentID = " + componentID + ")");
                        }
                        break;
                    case 'rotate':
                        if(!hasTransRef){
                            var axis = this.reader.getString(transformationNodes[j], "axis");
                            var angle = this.reader.getFloat(transformationNodes[j], "angle");

                            var x = (axis == "x") ? 1 : 0;
                            var y = (axis == "y") ? 1 : 0;
                            var z = (axis == "z") ? 1 : 0;
                            transfMatrix = mat4.rotate(transfMatrix, transfMatrix, DEGREE_TO_RAD * angle, [x, y, z]);
                            hasTrans = true;
                        }
                        else{
                            this.onXMLError("Component has already one transformationref. (componentID = " + componentID + ")");
                        }
                        break;
                }
            }


            // Materials
            var materialsNodes = grandChildren[materialsIndex].children;
            for(let i = 0; i < materialsNodes.length; i++){

                var materialID = this.reader.getString(materialsNodes[i], "id");
                
                if (materialID == null)
                    return "no ID defined for material";

                //Checks if the material is created
                if (materialID != "inherit" && this.materials[materialID] == null) {
                    return "No material with ID " + materialID;
                }
                //First root cannot inherit materials
                if (componentID == this.idRoot && materialID == "inherit") {
                    return "Initial Root cannot inherit materials";
                }
                /*<!-- se varios materiais declarados, o default e' o -->

                <!-- primeiro material; de cada vez que se pressione a tecla m/M, -->*/

                if(i == 0){
                    component.materialID = materialID;
                }
                component.materialList.push(materialID);
            }
            

            // Texture
            var textureNodes = grandChildren[textureIndex];
            component.texture = textureNodes.id;
            if(this.reader.hasAttribute(textureNodes, "length_s") && this.reader.hasAttribute(textureNodes, "length_t")){
                component.l_s = this.reader.getFloat(textureNodes, "length_s");
                component.l_t = this.reader.getFloat(textureNodes, "length_t");       
            }
            else{
                component.l_s = 1;
                component.l_t = 1;
            }

            // Children
            var childrenNodes = grandChildren[childrenIndex].children;
            for (var j = 0; j < childrenNodes.length; j++) {
                var currID = this.reader.getString(childrenNodes[j], 'id')
                var tag = childrenNodes[j].nodeName;

                if(tag == "primitiveref"){
                    component.addPrimitive(currID);
                }
                else{
                    component.addChildren(currID);
                }

            }
            component.transformation = transfMatrix;
            component.id = componentID;

            this.components[componentID] = component;
        }
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }
    
    changeMaterial(){
        for(let i in this.components){
            this.components[i].changeMaterial();
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {    
        this.displaySceneRecursive(this.idRoot, null, null, null, null);
    }

    displaySceneRecursive(componentID, prevMat, prevTex, l_s, l_t){
    
        if(this.components[componentID] == null){
            this.onXMLMinorError("No component for ID : " + componentID);
        }

        //Get current component
        var component = new MyComponent(this);
        component = this.components[componentID];

        this.scene.pushMatrix();

        //Apply component transformations
        this.scene.multMatrix(component.transformation);

        //Update previous material
        if(component.materialID != "inherit"){
            prevMat = this.materials[component.materialID];
        }

        if (component.texture != "inherit" && component.texture != "none"){;
            prevTex = this.textures[component.texture];
            l_s = component.l_s;
            l_t = component.l_t;
        }

        if(component.texture == "none"){
            prevTex = null;
            prevMat.setTexture(null);
        }

        if(component.texture != "none" && prevTex != null){
            prevMat.setTexture(prevTex);
            prevMat.setTextureWrap('REPEAT', 'REPEAT');
        }

        prevMat.apply();

        //Display primitives
        for(let i in component.getPrimitives()){
            this.primitives[component.primitives[i]].updateTexCoords(l_s, l_t);
            this.primitives[component.primitives[i]].display();
        }

        //Recursive call to go threw 
        for(let i in component.getChildren()){
            this.displaySceneRecursive(component.children[i], prevMat, prevTex, l_s, l_t);
        }

        this.scene.popMatrix();
    }
}