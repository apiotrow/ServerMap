let SimplexNoise = require('simplex-noise')

class Game3D{
	constructor(engine, canvas, scene, appW, appH){
		this.engine = engine
		this.canvas = canvas
		this.scene = scene

		this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,0,-10), scene)
		this.camera.attachControl(canvas, true)
		this.camera.keysUp.push(87);    //W
        this.camera.keysDown.push(83)   //D
        this.camera.keysLeft.push(65);  //A
        this.camera.keysRight.push(68); //S
		
		var light = new BABYLON.HemisphericLight("light", 
	    	new BABYLON.Vector3(0.5, 1, 0), scene)
	    light.intensity = 1.5

	    // var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, -1), scene)
	    // light.intensity = 1
	    // light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, 1, 1), scene)
	    // light.intensity = 0.5

		let simplex = new SimplexNoise(()=>{return 0.46})

		this.engine.runRenderLoop(()=> {
			this.update()
		})

		var box = new BABYLON.Mesh.CreateBox("box", 2, scene)
	}

	update(){
		this.scene.render()
	}
}

module.exports = Game3D