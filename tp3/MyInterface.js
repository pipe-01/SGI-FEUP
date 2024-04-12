import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)
        this.gui.add(this.scene, 'displayAxis').name("Display Axis");
        this.gui.add(this.scene, 'scaleFactor', 0.1, 10.0).name('Scale');
        this.initKeys();

        this.hasElements = false;

        return true;
    }

    addLights(){

        let lightsFolder = this.gui.addFolder("Lights");
        // lightsFolder.open();

        for(var i in this.scene.graph.lights){
            this.scene.interfaceLights[i] = this.scene.graph.lights[i][0];
            lightsFolder.add(this.scene.interfaceLights, i);
        }

    }

    addCameras(){

        let camerasFolder = this.gui.addFolder("Cameras");
        camerasFolder.open();

        for(var i in this.scene.graph.cameras){
            this.scene.interfaceCameras[i] = i;
        }

        camerasFolder.add(this.scene, 'selectedCamera', this.scene.interfaceCameras).name('Selected Camera').onChange(this.scene.updateCameras.bind(this.scene));


    }

    addShaders(){
        let shadersFolder = this.gui.addFolder("shaders");
        // shadersFolder.open();

        for(var i in this.scene.graph.shaders){
            this.scene.interfaceShaders[i] = false;
            shadersFolder.add(this.scene.interfaceShaders, i).name(i).onChange(this.scene.updateShaders.bind(this.scene));
            //shadersFolder.add(this.scene.interfaceShaders,i);
        }

    }

    addGameInterface(){
        let gameFolder = this.gui.addFolder("Game");
        gameFolder.open();
        gameFolder.add(this.scene.gameOrchestrator, 'startGame').name('Start Game');
        gameFolder.add(this.scene.gameOrchestrator, 'undo').name('Undo Play');
        gameFolder.add(this.scene.gameOrchestrator, 'movie').name('Game Movie');
        // gameFolder.add(this.scene.gameOrchestrator, 'cameraAnimation').name('Rotate Camera');
        // gameFolder.add(this.scene.gameOrchestrator, 'quitGame').name('Quit Game');
    }

    addInterfaceElements(){
        if(this.hasElements)
            return;
        this.addCameras();
        this.addLights();
        this.addShaders();
        this.addGameInterface();
        this.gui.add(this.scene, 'selectedTheme', {'Ukraine' : 0, 'Room' : 1}).name('Theme').onChange(this.scene.changeTheme.bind(this.scene));
        this.hasElements = true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}