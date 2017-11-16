let SimplexNoise = require('simplex-noise')
let colorconvert = require('color-convert')
let easystarjs = require('easystarjs')

let work = require('webworkify')
let siplexworker = work(require('./simplexworker.js'))

class Game{
	constructor(seed, rule, app, canvas){
		let terrain = new PIXI.Graphics()

		this.app = app

		this.mapContainer = new PIXI.Container()
		this.app.stage.addChild(this.mapContainer)
		this.mapContainer.addChild(terrain)

		//center map so we zoom into center instead of
		//upper left corner
		// this.mapContainer.x += this.app.renderer.width / 2
		// this.mapContainer.y += this.app.renderer.height / 2

		//x position of map from last frame
		this.lastX = 0

		//y position of map from last frame
		this.lastY = 0

		//size of each square
		this.tileSize = 20

		//width/height map needs to be to completely fill canvas
		this.gameTileD = Math.floor(this.app.renderer.width / this.tileSize)

		//random color for map
		this.rand360 = Math.floor(Math.random() * 360)

		this.astarmap = []
		for(let x = 0; x < this.gameTileD; x++){
			let aStarMapCol = []
			for(let y = 0; y < this.gameTileD; y++){
				aStarMapCol.push(0)
			}
			this.astarmap.push(aStarMapCol)
		}
		this.es = new easystarjs.js()
		this.es.setAcceptableTiles(1)
		this.es.enableDiagonals()
		this.es.disableCornerCutting()
		this.es.setGrid(this.astarmap)

		//player
		this.player = {}
		this.player.x = 0
		this.player.y = 0

		this.player.path = null

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
		window.addEventListener('wheel', (e)=>{
			if(e.deltaY < 0){
				this.keyState['zoomIn'] = true
			}
			else if(e.deltaY > 0){
				this.keyState['zoomOut'] = true
			}
		}, {passive: true})
		canvas.addEventListener
		('click', (evt)=>{
			this.keyState["click"] = true
		})
		canvas.addEventListener
		('mouseup', (event)=>{
			this.keyState["click"] = false
		})

		this.mousex = 0
		this.mousey = 0
		canvas.addEventListener
		('mousemove', (evt)=>{
			this.mousex = evt.offsetX
			this.mousey = evt.offsetY
		})

		let simplex = new SimplexNoise(Math.random)
		// let simplex = new SimplexNoise(()=>{return 0.453322346})

		siplexworker.addEventListener('message', function (ev) {
		    console.log(ev.data)
		})
		siplexworker.postMessage(4)

		//start update loop
		let callUpdate = ()=> {
			this.update(terrain, simplex)
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()


		this.max = 1
		this.min = 1
	}

	paintSquare(terrain, x, y, w, h){
		terrain.drawRect(x, y, w, h)
	}

	update(terrain, simplex){
		terrain.clear()

		if(this.keyState["click"]){

	        let destTileX = Math.floor(this.mousex / this.tileSize)
	        let destTileY = Math.floor(this.mousey / this.tileSize)

	        let playerTileX = Math.floor(this.player.x / this.tileSize)
	        let playerTileY = Math.floor(this.player.y / this.tileSize)

	        this.es.setGrid(this.astarmap)
	        this.es.findPath(playerTileX, playerTileY, destTileX, destTileY, (path)=>{
	        	console.log(path)
	        	this.player.path = path
	        })
	        this.es.calculate()

		    this.keyState["click"] = false
		}

		if(this.keyState['zoomIn']){
			// this.tileSize += 1
			// this.gameTileD = Math.floor(this.app.renderer.width / this.tileSize)
			this.keyState['zoomIn'] = false
		}else if (this.keyState['zoomOut']){
			// this.tileSize -= 1
			// this.gameTileD = Math.floor(this.app.renderer.width / this.tileSize)
			this.keyState['zoomOut'] = false
		}

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

		let col = "0x" + colorconvert.hsl.hex(this.rand360, 100, 50)
		terrain.beginFill(col, 1)

		// this.max -= .001
		// this.min += .001

		let divisor2 = 15 / this.max
		let divisor3 = 65 / this.min
		let divisor4 = 300 / this.max

		//render map
		let xIter = 0
		let yIter = 0
		for(let x = this.lastX; x < this.gameTileD + this.lastX; x++){
			yIter = 0
			for(let y = this.lastY; y < this.gameTileD + this.lastY; y++){
				let noise1 = simplex.noise2D(
					x, 
					y)
				
				let noise2 = simplex.noise2D(
					(x / divisor2), 
					(y / divisor2))

				let noise3 = simplex.noise2D(
					(x / divisor3), 
					(y / divisor3))

				let noise4 = simplex.noise2D(
					(x / divisor4), 
					(y / divisor4))

				noise1 += 1
				noise2 += 1
				noise3 += 1
				noise4 += 1

				let noise = noise1 + noise2 + noise3 + noise4

				let s = noise / 8

				if(s < .4){
					this.paintSquare(terrain, 
						x * this.tileSize, 
						y * this.tileSize, 
						this.tileSize, 
						this.tileSize)
					this.astarmap[yIter][xIter] = 0
				}else{
					this.astarmap[yIter][xIter] = 1
				}
				yIter++
			}
			xIter++
		}

		//render player
		terrain.beginFill(0xffffff, 1)
		this.paintSquare(terrain, 
			this.player.x, 
			this.player.y, 
			this.tileSize, 
			this.tileSize)

		if(this.player.path !== null){
			terrain.beginFill(0xffff66, 1)

			for(let i = 0; i < this.player.path.length; i++){
				this.paintSquare(terrain, 
					this.player.path[i].x * this.tileSize, 
					this.player.path[i].y * this.tileSize, 
					this.tileSize, 
					this.tileSize)
			}
			
		}
	}
}

module.exports = Game