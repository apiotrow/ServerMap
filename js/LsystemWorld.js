let Lsystem = require('./Lsystem.js')
let FastSimplexNoise = require('fast-simplex-noise')

class LsystemWorld{
	constructor(seed, rule, app){
		let terrain = new PIXI.Graphics()
		app.stage.addChild(terrain)

		let lsys = new Lsystem(seed, rule)

		terrain.beginFill(this.getColor("white"), 1)
		terrain.x = 0

		this.lastX = 50
		this.lastY = 50


		//start update loop
		let callUpdate = ()=> {
			this.update(terrain, lsys)
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()

		let noiseGen = new FastSimplexNoise({random: 2})
		console.log(noiseGen)
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

	update(terrain, lsys){
		terrain.clear()

		
		let lstring = lsys.getLString()

		
		let lastX = 50
		let lastY = 50
		terrain.beginFill(this.getColor("white"), 1)
		for(let i = 0; i < lstring.length; i++){

			if(lstring[i] == "a"){
				lastY += 1
			}
			else if(lstring[i] == "b"){
				lastY -= 1
			}

			lastX += 1

			this.paintSquare(terrain, lastX, lastY, 1, 1)
		}
		
	}
}

module.exports = LsystemWorld