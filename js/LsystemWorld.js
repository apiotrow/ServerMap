let Lsystem = require('./Lsystem.js')
let SimplexNoise = require('simplex-noise')
let PerlinGenerator = require("proc-noise")

class LsystemWorld{
	constructor(seed, rule, app){
		let terrain = new PIXI.Graphics()
		// app.stage.addChild(terrain)

		this.mapContainer = new PIXI.Container()
		app.stage.addChild(this.mapContainer)
		this.mapContainer.addChild(terrain)

		let lsys = new Lsystem(seed, rule)

		terrain.beginFill(this.getColor("white"), 1)
		terrain.x = 0

		this.lastX = 0
		this.lastY = 0
		this.tileSize = 10
		this.gameTileD = Math.floor(app.renderer.width / this.tileSize)

		this.keyState = {}
		window.addEventListener('keydown', (e)=>{
			if(e.which >= 65 && e.which <= 90)
				this.keyState[e.key.toLowerCase()] = true
			else
				this.keyState[e.key] = true
		},true)

		window.addEventListener('keyup', (e)=>{
			if(e.which >= 65 && e.which <= 90)
				this.keyState[e.key.toLowerCase()] = false
			else
				this.keyState[e.key] = false
		},true)


		let simplex = new SimplexNoise(Math.random)
		let perlin = new PerlinGenerator()

		//start update loop
		let callUpdate = ()=> {
			// this.update(terrain, lsys)
			this.update(terrain, simplex)
			// this.update(terrain, perlin)
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()

		
	}

	getColor(col){
		switch (col){
			case "black":
				return 0x000000
				break
			case "white":
				return 0xffffff
				break
			default:
				return 0xffffff
				break
		}
	}

	paintSquare(terrain, x, y, w, h){
		terrain.drawRect(x, y, w, h)
	}

	update(terrain, simplex){
		terrain.clear()

		if(this.keyState['w'] == true){
			this.lastY -= 1
			this.mapContainer.y += this.tileSize
		}
		if(this.keyState['d'] == true){
			this.lastX += 1
			this.mapContainer.x -= this.tileSize
		}
		if(this.keyState['a'] == true){
			this.lastX -= 1
			this.mapContainer.x += this.tileSize
		}
		if(this.keyState['s'] == true){
			this.lastY += 1
			this.mapContainer.y -= this.tileSize
		}


		terrain.beginFill(this.getColor("white"), 1)


		for(let x = this.lastX; x < this.gameTileD + this.lastX; x++){
			for(let y = this.lastY; y < this.gameTileD + this.lastY; y++){
				let noise = simplex.noise2D(x, y)
				if(noise < 0){
					this.paintSquare(terrain, 
						x * this.tileSize, 
						y * this.tileSize, 
						this.tileSize, 
						this.tileSize)
				}else{

				}
				
			}
		}



		// for(let x = 0; x < this.gameTileD; x++){
		// 	for(let y = 0; y < this.gameTileD; y++){
		// 		let noise = perlin.noise(x, y)
		// 		if(noise < 0.5){
		// 			this.paintSquare(terrain, 
		// 				x * this.tileSize, 
		// 				y * this.tileSize, 
		// 				this.tileSize, 
		// 				this.tileSize)
		// 		}else{

		// 		}
				
		// 	}
		// }
	}




	// update(terrain, lsys){
	// 	terrain.clear()

		
	// 	let lstring = lsys.getLString()

		
		// let lastX = 50
		// let lastY = 50
		// terrain.beginFill(this.getColor("white"), 1)
		// for(let i = 0; i < lstring.length; i++){

		// 	if(lstring[i] == "a"){
		// 		lastY += 1
		// 	}
		// 	else if(lstring[i] == "b"){
		// 		lastY -= 1
		// 	}

		// 	lastX += 1

		// 	this.paintSquare(terrain, lastX, lastY, 1, 1)
		// }
		
	// }
}

module.exports = LsystemWorld