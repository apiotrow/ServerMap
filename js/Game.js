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
		this.tileSize = 5

		//width/height map needs to be to completely fill canvas
		this.gameTileD = this.worldToTile(this.app.renderer.width)

		//random color for map
		this.rand360 = Math.floor(Math.random() * 360)
		this.randColChange = 0.7

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
			// this.mousex = evt.offsetX - this.mapContainer.x
			// this.mousey = evt.offsetY - this.mapContainer.y

			this.mousex = evt.offsetX
			this.mousey = evt.offsetY
		})

		// let simplex = new SimplexNoise(Math.random)
		let simplex = new SimplexNoise(()=>{return 0.46})

		// this.divisor2 = Math.random() * 10 
		// this.divisor3 = Math.random() * 100 
		// this.divisor4 = Math.random() * 900

		this.divisor2 = 1 
		this.divisor3 = 1 
		this.divisor4 = 1

		this.threshold = 0.2

		this.blah = {
			yes(){
				console.log("okay")
			},

		}

		this.blah.yes()

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

		//player
		this.player = {}
		this.player.x = 0
		this.player.y = 0
		this.player.path = null
		this.player.pathIter = 1
		this.player.pMoveInterval
		this.player.moveSpeed = 110
		this.player.moving = false
		this.player.onSpot = true
		this.player.chosenNextDest = []
	}

	paintSquare(terrain, x, y, w, h){
		terrain.drawRect(x, y, w, h)
	}

	setPlayerPath(fromX, fromY, toX, toY){
		if(this.playerInScreen()){
			//make sure player is in screen
	    	this.es.setGrid(this.astarmap)
	        this.es.findPath(fromX, fromY, toX, toY, (path)=>{
	        	this.player.pathIter = 1
	        	this.player.path = path

	        	clearInterval(this.player.pMoveInterval)
	        	this.player.pMoveInterval = setInterval(()=>{
					if(this.player.path !== null){
						this.player.onSpot = true

						this.player.moving = true

						if(this.player.path[this.player.pathIter] !== undefined){
							this.player.x = 
							(this.player.path[this.player.pathIter].x * this.tileSize) 
							- this.mapContainer.x

							this.player.y = 
							(this.player.path[this.player.pathIter].y * this.tileSize) 
							- this.mapContainer.y

							this.player.pathIter++
						}else{
							this.player.onSpot = true
							this.player.moving = false
							this.player.pathIter = 1
							this.player.path = null
							clearInterval(this.player.pMoveInterval)
						}
					}
				}, this.player.moveSpeed)
	        })

	        this.es.calculate()
	    }
	}

	playerInScreen(){
		let playerTileX = this.worldToTile(this.player.x + this.mapContainer.x) 
	    let playerTileY = this.worldToTile(this.player.y + this.mapContainer.y)

	    if(playerTileX > -1 && playerTileY > -1 
    	&& playerTileX < this.gameTileD
    	&& playerTileY < this.gameTileD)
    	{
	    	return true
	    }
	    return false
	}

	worldToTile(world){
		return Math.floor(world / this.tileSize)
	}

	screenToWorldX(screenX){
		return screenX + this.mapContainer.x
	}

	screenToWorldY(screenY){
		return screenY + this.mapContainer.y
	}

	moveCamY(amt){
		this.lastY -= amt
		this.mapContainer.y += this.tileSize * amt

		if(this.player.path !== null){
			for(let i = 0; i < this.player.path.length; i++){
				this.player.path[i].y += amt
			}
		}
	}

	moveCamX(amt){
		this.lastX -= amt
		this.mapContainer.x += this.tileSize * amt

		if(this.player.path !== null){
			for(let i = 0; i < this.player.path.length; i++){
				this.player.path[i].x += amt
			}
		}
	}

	keepPlayerWithinScreenBoundaries(){
		if(this.worldToTile(this.screenToWorldX(this.player.x)) < 1){
			this.moveCamX(1)
		}
		if(this.worldToTile(this.screenToWorldX(this.player.x)) > this.gameTileD - 2){
			this.moveCamX(-1)
		}
		if(this.worldToTile(this.screenToWorldY(this.player.y)) > this.gameTileD - 2){
			this.moveCamY(-1)
		}
		if(this.worldToTile(this.screenToWorldY(this.player.y)) < 1){
			this.moveCamY(1)
		}
	}

	centerCamOnPlayer(){
		if(this.worldToTile(this.screenToWorldX(this.player.x)) < (this.gameTileD / 2)){
			this.moveCamX(1)
		}
		if(this.worldToTile(this.screenToWorldX(this.player.x)) > (this.gameTileD / 2)){
			this.moveCamX(-1)
		}
		if(this.worldToTile(this.screenToWorldY(this.player.y)) >(this.gameTileD / 2)){
			this.moveCamY(-1)
		}
		if(this.worldToTile(this.screenToWorldY(this.player.y)) < (this.gameTileD / 2)){
			this.moveCamY(1)
		}
	}

	cameraKeyboardControls(){
		if(this.keyState['w'] == true){
			this.moveCamY(1)
		}
		if(this.keyState['s'] == true){
			this.moveCamY(-1)
		}
		if(this.keyState['d'] == true){
			this.moveCamX(-1)
		}
		if(this.keyState['a'] == true){
			this.moveCamX(1)
		}
	}

	editDivisors(){
		let changed = false

		if(this.keyState['r'] == true){
			this.divisor2 *= 1.01
			changed = true
		}
		if(this.keyState['f'] == true){
			this.divisor2 /= 1.01
			changed = true
		}

		if(this.keyState['t'] == true){
			this.divisor3 *= 1.01
			changed = true
		}
		if(this.keyState['g'] == true){
			this.divisor3 /= 1.01
			changed = true
		}

		if(this.keyState['y'] == true){
			this.divisor4 *= 1.01
			changed = true
		}
		if(this.keyState['h'] == true){
			this.divisor4 /= 1.01
			changed = true
		}

		if(this.keyState['z'] == true){
			this.threshold *= 1.01
			changed = true
		}
		if(this.keyState['x'] == true){
			this.threshold /= 1.01
			changed = true
		}

		if(changed){
			console.log("divisor2: " + this.divisor2 + ", divisor3: " + this.divisor3
				+ ", divisor4: " + this.divisor4)
		}
	}

	update(terrain, simplex){
		terrain.clear()

		this.editDivisors()

		if(this.keyState["click"]){
	        let destTileX = this.worldToTile(this.mousex)
	        let destTileY = this.worldToTile(this.mousey)

	        let playerTileX = this.worldToTile(this.screenToWorldX(this.player.x))
	        let playerTileY = this.worldToTile(this.screenToWorldY(this.player.y))

        	if(!this.player.moving){
        		this.setPlayerPath(playerTileX, playerTileY, destTileX, destTileY)
        	}else{
        		if(this.playerInScreen())
	        	{
			    	this.player.chosenNextDest.push(destTileX)
			    	this.player.chosenNextDest.push(destTileY)
			    }
		    }
	        
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

		
		this.cameraKeyboardControls()
		// this.keepPlayerWithinScreenBoundaries()
		// this.centerCamOnPlayer()

		if(this.rand360 <= 0){
			if(this.randColChange < 0)
				this.randColChange = -this.randColChange
		}else if(this.rand360 >= 360){
			if(this.randColChange > 0)
				this.randColChange = -this.randColChange
		}
		this.rand360 += this.randColChange
		
		let col = "0x" + colorconvert.hsl.hex(this.rand360, 100, 50)
		terrain.beginFill(col, 1)

		// this.max -= .001
		// this.min += .001

		let divisor2 = this.divisor2 / this.max
		let divisor3 = this.divisor3 / this.min
		let divisor4 = this.divisor4 / this.max

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

				// let u = ((this.gameTileD + this.lastX) - this.lastX) / x
				// let col = "0x" + colorconvert.hsl.hex(u * 6, u * 100, u * 50)
				// let col = "0x" + colorconvert.hsl.hex(s * this.rand360, 100, 50)
				// terrain.beginFill(col, 1)

				if(s < this.threshold){
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

		//change player destination
		if(this.player.onSpot == true && this.player.chosenNextDest.length > 0){
			this.player.path = null

			let destTileX = this.player.chosenNextDest[0]
	        let destTileY = this.player.chosenNextDest[1]

	        this.player.chosenNextDest = []

	        let playerTileX = this.worldToTile(this.screenToWorldX(this.player.x))
	        let playerTileY = this.worldToTile(this.screenToWorldY(this.player.y))

	        this.setPlayerPath(playerTileX, playerTileY, destTileX, destTileY)
		}

		// // move player
		if(this.player.path !== null){
			terrain.beginFill(0xffff66, 1)

			if(this.player.path[this.player.pathIter] !== undefined){

				this.player.onSpot = false

				let stepSize = this.tileSize / (this.player.moveSpeed / (1000 / 60))

				if(this.player.x < 
					(this.player.path[this.player.pathIter].x * this.tileSize) 
					- this.mapContainer.x)
				{
					this.player.x += stepSize
				}else if(this.player.x > 
					(this.player.path[this.player.pathIter].x * this.tileSize) 
					- this.mapContainer.x)
				{
					this.player.x -= stepSize
				}

				if(this.player.y < 
					(this.player.path[this.player.pathIter].y * this.tileSize) 
					- this.mapContainer.y)
				{
					this.player.y += stepSize
				}else if(this.player.y > 
					(this.player.path[this.player.pathIter].y * this.tileSize) 
					- this.mapContainer.y)
				{
					this.player.y -= stepSize
				}
			}
		}

		//render player
		terrain.beginFill(0xffffff, 1)
		this.paintSquare(terrain, 
			this.player.x, 
			this.player.y, 
			this.tileSize, 
			this.tileSize)

		
	}
}

module.exports = Game