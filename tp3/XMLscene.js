import { CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera, CGFlight } from '../lib/CGF.js';
import { MyGameOrchestrator } from './MyGameOrchestrator.js';
import { MySceneGraph } from './MySceneGraph.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.interfaceCameras = new Object();
        this.selectedCamera = 0;
        this.interfaceLights = {};
        this.interfaceShaders = {};
        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        //transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
        this.displayAxis = false;
        this.scaleFactor = 1;

        this.cameraAnimation = false;
        this.angle = 0;
        this.started = false;

        this.themes = {
            0 : "demo.xml",
            1 : "room.xml"
        }

        this.selectedTheme = 0;

        this.setPickEnabled(false);
        this.gameOrchestrator = new MyGameOrchestrator(this);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(0, 12, -15), vec3.fromValues(0, 10, 0));
        this.interface.setActiveCamera(this.camera);
    }

    initsceneCameras(){
        this.selectedCamera = this.graph.default;
        this.camera = this.graph.cameras[this.graph.default];
        this.interface.setActiveCamera(this.camera);
    }

    updateCameras(){
        this.camera = this.graph.cameras[this.selectedCamera];
        this.interface.setActiveCamera(this.camera);
    }


    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.
        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                    this.lights[i].setConstantAttenuation(light[9]);
                    this.lights[i].setLinearAttenuation(light[10]);
                    this.lights[i].setQuadraticAttenuation(light[11]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    updateShaders(){
        for(let key in this.interfaceShaders){
            this.graph.updateShader(key, this.interfaceShaders[key]);
        }
    }

    updateLights(){
        let i = 0;
        for (let key in this.interfaceLights) {
            if (this.interfaceLights.hasOwnProperty(key)) {
                if (this.interfaceLights[key]) {
                    this.lights[i].enable();
                }
                else {
                    this.lights[i].disable();
                }
                this.lights[i++].update();
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    changeTheme(){
        this.sceneInited = false;
        // this.graph.reinit(this.themes[this.selectedTheme]);
        this.graph = new MySceneGraph(this.themes[this.selectedTheme], this);

    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.interface.addInterfaceElements();

        this.initLights();
        this.initsceneCameras();


        this.setUpdatePeriod(100);


        this.sceneInited = true;
    }

    handleKeyPress(){
        if(this.interface.isKeyPressed("KeyM")){
            this.graph.changeMaterial();
        }
    }

    update(t) {
        this.handleKeyPress();

        if (this.graph.highlightShader != null)
            this.graph.highlightShader.setUniformsValues({ timeFactor: t / 500 % 500 });

        this.updateAnimations(t / 1000);

        this.gameOrchestrator.managePick(this.pickEnabled, this.pickResults);
        this.gameOrchestrator.update(t);

        if(this.cameraAnimation){
            // this.changeCamera();
            this.camera.orbit([0,1,0], -Math.PI / 20);
            this.angle += Math.PI / 20;
            if (this.angle >= Math.PI) {
                this.angle -= Math.PI;
                this.cameraAnimation = false;
            }
        }
        else{
            this.angle = 0;
        }
    
        this.clearPickRegistration();
    }

    rotateCamera(){
        if (this.graph.cameras["blackPlayer"] == this.camera ||
        this.graph.cameras["whitePlayer"] == this.camera)
        this.cameraAnimation = true;
    }


    changeCamera(){
    // Find change coordinates

    if(this.cameraPosZInc > 0){
        if(this.camera.position[2] <= this.nextCamera.position[2]){
          this.camera.position[2] += this.cameraPosZInc;
        }
        else{
          this.cameraPosZInc = 0;
        }
      }
      else{
        if(this.camera.position[2] >= this.nextCamera.position[2]){
          this.camera.position[2] += this.cameraPosZInc;
        }
        else{
          this.cameraPosZInc = 0;
        }
      }
      if(this.cameraTarZInc > 0){
        if(this.camera.target[2] <= this.nextCamera.target[2]){
          this.camera.target[2] += this.cameraTarZInc;
        }
        else{
          this.cameraTarZInc = 0;
        }
      }
      else{
        if(this.camera.target[2] >= this.nextCamera.target[2]){
          this.camera.target[2] += this.cameraTarZInc;
        }
        else{
          this.cameraTarZInc = 0;
        }
      }
  
      if(this.cameraPosZInc == 0 && this.cameraTarZInc == 0){

        // Reset values since they are changed in the animation
        this.graph.cameras["whiteCamera"].position[2] = this.cameraWhite.position;
        this.graph.cameras["whiteCamera"].target[2] = this.cameraWhite.target;
        this.graph.cameras["defaultCamera"].position[2] = this.cameraBlack.position;
        this.graph.cameras["defaultCamera"].target[2] = this.cameraBlack.target;

        this.camera = this.nextCamera;
        this.nextCamera = null;
        this.cameraAnimation = false;
        this.interface.setActiveCamera(this.camera);

      }
  
    }

    updateAnimations(t){
        for(let key in this.graph.animations){
            this.graph.animations[key].update(t);
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(false);
            this.lights[i].enable();
        }

        if (this.sceneInited) {
            // Draw axis
            if(this.displayAxis){
                this.axis.display();
            }


            this.setDefaultAppearance();
            if(!this.started)
                this.updateCameras();   
            this.updateLights();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
            this.gameOrchestrator.display();
            // this.gameOrchestrator.update(1/60);

        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}