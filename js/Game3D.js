let SimplexNoise = require('simplex-noise')

let work = require('webworkify')
let simplexworker = work(require('./simplexworker.js'))

class Game3D{
	constructor(engine, canvas, scene, appW, appH){
		scene.clearColor = new BABYLON.Color3(1, 1, 1)

		this.engine = engine
		this.canvas = canvas
		this.scene = scene

		this.simplexResults = []
		this.simplexworker = simplexworker
		this.simplexworker.addEventListener('message',  (ev)=> {
		    this.simplexResults = JSON.parse(ev.data)

		    this.boxIter = 0

		    let customMeshIndices = []
		    for(let i = 0; i < this.simplexResults.length / 3; i++){
				customMeshIndices.push(i)
			}
			let vertexData = new BABYLON.VertexData()
			vertexData.positions = this.simplexResults
			vertexData.indices = customMeshIndices
			vertexData.applyToMesh(this.customMesh)

			// for(let i = 0; i < this.simplexResults.length; i += 3){
			// 	let x = this.simplexResults[i]
			// 	let y = this.simplexResults[i + 1]
			// 	let z = this.simplexResults[i + 2]
			// 	if(this.boxes[this.boxIter] !== undefined){
			// 		this.boxes[this.boxIter].position.x = x
			// 		this.boxes[this.boxIter].position.y = y
			// 		this.boxes[this.boxIter].position.z = z
			// 		this.boxIter++
			// 	}
			// }
		
		    let x = Math.floor(this.camera.position.x) + 50
			let y = Math.floor(this.camera.position.y) + 50
			let z = Math.floor(this.camera.position.z) + 50

			this.simplexworker.postMessage(JSON.stringify({
				x: x,
				y: y,
				z: z,
				span: this.span
			}))

		})
		this.simplexworker.postMessage(JSON.stringify({
			x: 0,
			y: 0,
			z: 0,
			span: 20
		}))

		this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(10, 10, -10), scene)
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

		this.simplex = new SimplexNoise(()=>{Math.random})
		this.divisor2 = 21 
		this.divisor3 = 96 
		this.divisor4 = 107

		this.linesVectors = []

		var box = new BABYLON.Mesh.CreateBox("box", 1, scene)
		box.material = new BABYLON.StandardMaterial("mat", this.scene)
		box.material.pointSize = 5
		this.span = 10
		this.boxes = []
		for(let i = 0; i < this.span * this.span * this.span * 6; i++){
			// let boxInst = box.createInstance()
			// // box.material.pointsCloud = true
			// this.boxes.push(boxInst)
			


			// let pt = new BABYLON.Mesh("point", scene)
			// pt.position = new BABYLON.Vector3(1, 5, 1)
			// pt.material = new BABYLON.StandardMaterial("mat", this.scene)
			// pt.material.pointSize = 5
			// this.boxes.push(pt)



			// this.linesVectors.push(new BABYLON.Vector3(0, 0, 0))
			
		}
		this.boxIter = 0

		this.customMesh = new BABYLON.Mesh("custom", scene)
		this.customMesh.material = new BABYLON.StandardMaterial("mat", this.scene)
		this.customMesh.material.pointsCloud = true
		this.customMesh.material.pointSize = 15


		// this.lines = BABYLON.MeshBuilder.CreateLines(
		// 	"lines", {points: this.linesVectors, updatable: true}, scene)

		this.updateCount = 0

		this.engine.runRenderLoop(()=> {
			this.update()
		})
	}

	update(){
		this.scene.render()

		// this.camera.position.x += 1
		// this.camera.position.y += 1
		// this.camera.position.z += 1

		let x = Math.floor(this.camera.position.x) + 100
		let y = Math.floor(this.camera.position.y) + 100
		let z = Math.floor(this.camera.position.z) + 100

		let customMeshPositions = []
		let customMeshIndices = []

		

		// this.linesVectors = []
	
		this.updateCount++
		if(this.updateCount < 60)
			return
		this.updateCount = 0

		// this.simplexworker.postMessage(JSON.stringify({
		// 	x: x,
		// 	y: y,
		// 	z: z,
		// 	span: this.span
		// }))

		this.boxIter = 0
		// for(let ix = x - this.span; ix < x + this.span; ix++){
		// 	for(let iy = y - this.span; iy < y + this.span; iy++){
		// 		for(let iz = z -this.span; iz < z + this.span; iz++){
		// 			let noise1 = this.simplex.noise3D(
		// 			ix, 
		// 			iy,
		// 			iz)
				
		// 			let noise2 = this.simplex.noise3D(
		// 				(ix / this.divisor2), 
		// 				(iy / this.divisor2),
		// 				(iz / this.divisor2))

		// 			let noise3 = this.simplex.noise3D(
		// 				(ix / this.divisor3), 
		// 				(iy / this.divisor3),
		// 				(iz / this.divisor3))

		// 			let noise4 = this.simplex.noise3D(
		// 				(ix / this.divisor4), 
		// 				(iy / this.divisor4),
		// 				(iz / this.divisor4))

		// 			noise1 += 1
		// 			noise2 += 1
		// 			noise3 += 1
		// 			noise4 += 1

		// 			let noise = noise1 + noise2 + noise3 + noise4

		// 			let s = noise / 8

		// 			// if(s < 0.3){
		// 			// 	if(this.boxes[this.boxIter] !== undefined){
							// this.boxes[this.boxIter].position.x = ix
							// this.boxes[this.boxIter].position.y = iy
							// this.boxes[this.boxIter].position.z = iz
							// this.boxIter++
		// 			// 	}
		// 			// }

		// 			if(s < 0.3){
		// 				customMeshPositions.push(ix)
		// 				customMeshPositions.push(iy)
		// 				customMeshPositions.push(iz)
		// 			}

					
		// 			// if(s < 0.3){
		// 			// 	this.linesVectors.push(new BABYLON.Vector3(ix, iy, iz))
		// 			// }

		// 			// if(this.linesVectors[this.boxIter] === undefined)
		// 			// 	continue


		// 			// if(s < 0.3){
		// 			// 	this.linesVectors[this.boxIter].x = ix
		// 			// 	this.linesVectors[this.boxIter].y = iy
		// 			// 	this.linesVectors[this.boxIter].z = iz
		// 			// 	this.boxIter++
		// 			// }



		// 			// let noise1 = this.simplex.noise2D(ix, iz)
		// 			// let noise2 = this.simplex.noise2D(
		// 			// 	(ix / this.divisor2), 
		// 			// 	(iy / this.divisor2))
		// 			// let noise = noise1 + noise2
		// 			// if(this.boxes[this.boxIter] !== undefined){
		// 			// 	this.boxes[this.boxIter].position.x = ix
		// 			// 	this.boxes[this.boxIter].position.y = Math.floor(noise)
		// 			// 	this.boxes[this.boxIter].position.z = iz
		// 			// 	this.boxIter++
		// 			// }
				

		// 		}
		// 	}
		// }

		// let holder = this.boxIter
		// for(let i = this.boxIter; i < this.linesVectors.length; i++){
		// 	this.linesVectors[this.boxIter].x = this.linesVectors[holder].x
		// 	this.linesVectors[this.boxIter].y = this.linesVectors[holder].y
		// 	this.linesVectors[this.boxIter].z = this.linesVectors[holder].z
		// }

		// console.log(this.linesVectors[holder])

		// this.lines = BABYLON.MeshBuilder.CreateLines(
		// 	"lines", {points: this.linesVectors, instance: this.lines}, this.scene)




		
		// for(let i = 0; i < this.simplexResults.length / 3; i++){
		// 	customMeshIndices.push(i)
		// }
		// // console.log(this.simplexResults.length)

		// let vertexData = new BABYLON.VertexData()
		// vertexData.positions = this.simplexResults
		// vertexData.indices = customMeshIndices
		// vertexData.applyToMesh(this.customMesh)
	}
}

module.exports = Game3D