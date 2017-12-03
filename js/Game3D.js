let SimplexNoise = require('simplex-noise')

class Game3D{
	constructor(engine, canvas, scene, appW, appH){
		this.engine = engine
		this.canvas = canvas
		this.scene = scene

		this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 3,-20), scene)
		this.camera.attachControl(canvas, true)
		this.camera.keysUp.push(87);    //W
        this.camera.keysDown.push(83)   //D
        this.camera.keysLeft.push(65);  //A
        this.camera.keysRight.push(68); //S
		
		var light = new BABYLON.HemisphericLight("light", 
	    	new BABYLON.Vector3(0.5, 1, 0), scene)
	    light.intensity = 1

	    // var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, -1), scene)
	    // light.intensity = 1
	    // light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(1, 1, 1), scene)
	    // light.intensity = 0.5

		this.simplex = new SimplexNoise(()=>{return 0.4225526})
		this.divisor2 = 100 
		this.divisor3 = 100 
		this.divisor4 = 900

		var box = new BABYLON.Mesh.CreateBox("box", 1, scene)
		this.span = 10
		this.boxes = []
		for(let i = 0; i < this.span * this.span * this.span * 6; i++){
			this.boxes.push(box.createInstance())
		}
		this.boxIter = 0

		this.engine.runRenderLoop(()=> {
			this.update()
		})
	}

	update(){
		this.scene.render()

		let x = Math.floor(this.camera.position.x) + 20
		let y = Math.floor(this.camera.position.y) - 30
		let z = Math.floor(this.camera.position.z) + 40

		let span = 10
		
		this.boxIter = 0
		for(let ix = x - this.span; ix < x + this.span; ix++){
			for(let iy = y - this.span; iy < y + this.span; iy++){
				for(let iz = z -this.span; iz < z + this.span; iz++){
					// let noise1 = this.simplex.noise3D(
					// ix, 
					// iy,
					// iz)
				
					// let noise2 = this.simplex.noise3D(
					// 	(ix / this.divisor2), 
					// 	(iy / this.divisor2),
					// 	(iz / this.divisor2))

					// let noise3 = this.simplex.noise3D(
					// 	(ix / this.divisor3), 
					// 	(iy / this.divisor3),
					// 	(iz / this.divisor3))

					// let noise4 = this.simplex.noise3D(
					// 	(ix / this.divisor4), 
					// 	(iy / this.divisor4),
					// 	(iz / this.divisor4))

					// noise1 += 1
					// noise2 += 1
					// noise3 += 1
					// noise4 += 1

					// let noise = noise1 + noise2 + noise3 + noise4

					// let s = noise / 8

					// if(s < 0.5){
					// 	if(this.boxes[this.boxIter] !== undefined){
					// 		this.boxes[this.boxIter].position.x = ix
					// 		this.boxes[this.boxIter].position.y = iy
					// 		this.boxes[this.boxIter].position.z = iz
					// 		this.boxIter++
					// 	}
					// }


					let noise1 = this.simplex.noise2D(ix, iz)
					let noise2 = this.simplex.noise2D(
						(ix / this.divisor2), 
						(iy / this.divisor2))
					let noise = noise1 + noise2
					if(this.boxes[this.boxIter] !== undefined){
						this.boxes[this.boxIter].position.x = ix
						this.boxes[this.boxIter].position.y = Math.floor(noise)
						this.boxes[this.boxIter].position.z = iz
						this.boxIter++
					}
				}
			}
		}
	}
}

module.exports = Game3D