let SimplexNoise = require('simplex-noise')
let colorconvert = require('color-convert')
let easystarjs = require('easystarjs')

let work = require('webworkify')
let siplexworker = work(require('./simplexworker.js'))

class Game{
	constructor(seed, rule, app, canvas){
		this.terrain = new PIXI.Graphics()

		this.app = app

		this.mapContainer = new PIXI.Container()
		this.app.stage.addChild(this.mapContainer)
		this.mapContainer.addChild(this.terrain)

		//center map so we zoom into center instead of
		//upper left corner
		// this.mapContainer.x += this.app.renderer.width / 2
		// this.mapContainer.y += this.app.renderer.height / 2

		//size of each square
		this.tileSize = 30

		//camera pan speed
		this.camSpeed = 2

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

		// this.simplex = new SimplexNoise(Math.random)
		this.simplex = new SimplexNoise(()=>{return 0.46})

		// this.divisor2 = Math.random() * 10 
		// this.divisor3 = Math.random() * 100 
		// this.divisor4 = Math.random() * 900

		this.divisor = 36 

		this.threshold = -.15

		siplexworker.addEventListener('message', function (ev) {
		    console.log(ev.data)
		})
		siplexworker.postMessage(4)

		//start update loop
		let callUpdate = ()=> {
			this.update()
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()

		this.max = 0.1
		this.min = 1

		//player
		this.player = {}
		this.player.x = 0
		this.player.y = 0
		this.player.path = null
		this.player.pathIter = 1
		this.player.moveInterval
		this.player.moveSpeed = 90
		this.player.moving = false
		this.player.onSpot = true
		this.player.chosenNextDest = []
	}

	paintSquare(x, y, w, h){
		this.terrain.drawRect(x, y, w, h)
	}

	setPlayerPath(fromX, fromY, toX, toY){
		if(this.playerInScreen()){
			//make sure player is in screen
	    	this.es.setGrid(this.astarmap)
	        this.es.findPath(fromX, fromY, toX, toY, (path)=>{
	        	this.player.pathIter = 1
	        	this.player.path = path

	        	if(this.player.path !== null){
		        	for(let i = 0; i < this.player.path.length; i++){
						this.player.path[i].y = 
						(this.player.path[i].y * this.tileSize) - this.mapContainer.y

						this.player.path[i].x = 
						(this.player.path[i].x * this.tileSize) - this.mapContainer.x

						this.player.path[i].x += (this.mapContainer.x % this.tileSize)
						this.player.path[i].y += (this.mapContainer.y % this.tileSize)
					}
				}

	        	clearInterval(this.player.moveInterval)
	        	this.player.moveInterval = setInterval(()=>{
					if(this.player.path !== null){
						this.player.onSpot = true

						this.player.moving = true

						if(this.player.path[this.player.pathIter] !== undefined){
							this.player.x = this.playerDestX()
					
							this.player.y = this.playerDestY()

							this.player.pathIter++
						}else{
							this.player.onSpot = true
							this.player.moving = false
							this.player.pathIter = 1
							this.player.path = null
							clearInterval(this.player.moveInterval)
						}
					}
				}, this.player.moveSpeed)
	        })

	        this.es.calculate()
	    }
	}

	playerDestX(){
		return (this.player.path[this.player.pathIter].x) 
	}

	playerDestY(){
		return (this.player.path[this.player.pathIter].y) 
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
		this.mapContainer.y += amt

		if(this.player.path !== null){
			for(let i = 0; i < this.player.path.length; i++){
					this.player.path[i].y += (this.mapContainer.y % this.tileSize)
				}

			// for(let i = 0; i < this.player.path.length; i++){
			// 	this.player.path[i].y += (amt / this.tileSize)
			// }
		}
	}

	moveCamX(amt){
		this.mapContainer.x += amt

		console.log(this.mapContainer.x % this.tileSize)

		if(this.player.path !== null){
			for(let i = 0; i < this.player.path.length; i++){
					this.player.path[i].x += (this.mapContainer.x % this.tileSize)
				}

			// for(let i = 0; i < this.player.path.length; i++){
			// 	this.player.path[i].x += amt / this.tileSize
			// }
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
			this.moveCamY(this.camSpeed)
		}
		if(this.keyState['s'] == true){
			this.moveCamY(-this.camSpeed)
		}
		if(this.keyState['d'] == true){
			this.moveCamX(-this.camSpeed)
		}
		if(this.keyState['a'] == true){
			this.moveCamX(this.camSpeed)
		}
	}

	editDivisors(){
		let changed = false

		if(this.keyState['r'] == true){
			this.divisor *= 1.01
			changed = true
		}
		if(this.keyState['f'] == true){
			this.divisor /= 1.01
			changed = true
		}

		if(changed){
			console.log("divisor: " + this.divisor)
		}
	}

	findSections(squares){
		let sections = new Set()

		for(let x in squares){
			for(let y in squares){
				this.checkAround(new Set(), x, y, squares)
			}
		}
	}

	checkAround(sections, x, y, squares){
		if(this.pointConnected(x - 1, y - 1, squares)){
			sections.add(x - 1, y - 1)
		}
		if(this.pointConnected(x, y - 1, squares)){
			sections.add(x, y - 1)
		}
		if(this.pointConnected(x + 1, y - 1, squares)){
			sections.add(x + 1, y - 1)
		}
		if(this.pointConnected(x - 1, y, squares)){
			sections.add(x - 1, y)
		}
		if(this.pointConnected(x + 1, y, squares)){
			sections.add(x + 1, y)
		}
		if(this.pointConnected(x - 1, y + 1, squares)){
			sections.add(x - 1, y + 1)
		}
		if(this.pointConnected(x, y + 1, squares)){
			sections.add(x, y + 1)
		}
		if(this.pointConnected(x + 1, y + 1, squares)){
			sections.add(x + 1, y + 1)
		}
	}

	neighborCount(x, y, squares){
		let count = 0

		if(this.pointConnected(x - 1, y - 1, squares)){
			count++
		}
		if(this.pointConnected(x, y - 1, squares)){
			count++
		}
		if(this.pointConnected(x + 1, y - 1, squares)){
			count++
		}
		if(this.pointConnected(x - 1, y, squares)){
			count++
		}
		if(this.pointConnected(x + 1, y, squares)){
			count++
		}
		if(this.pointConnected(x - 1, y + 1, squares)){
			count++
		}
		if(this.pointConnected(x, y + 1, squares)){
			count++
		}
		if(this.pointConnected(x + 1, y + 1, squares)){
			count++
		}

		return count
	}

	pointConnected(x, y, squares){
		if(squares[x] !== undefined){
			if(squares[x][y] !== undefined){
				return true
			}
		}
		return false
	}

	update(){
		this.terrain.clear()

		this.editDivisors()
		
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
		this.terrain.beginFill(col, 1)

		// this.max += .01
		// this.min += .01

		//get map info
		let xIter = 0
		let yIter = 0
		let squares = {}

		let regX = -this.mapContainer.x / this.tileSize
		let regY = -this.mapContainer.y / this.tileSize
		let mapX = Math.floor(regX)
		let mapY = Math.floor(regY)
		
		for(
			let x = mapX; 
			x < this.gameTileD + mapX; 
			x++)
		{
			yIter = 0
			for(
				let y = mapY; 
				y < this.gameTileD + mapY; 
				y++)
			{
				let noise = this.simplex.noise2D(
					x / (this.divisor / 1), 
					y / (this.divisor / 1))

				let noise2 = this.simplex.noise2D(
					x / (this.divisor / 3), 
					y / (this.divisor / 3))

				noise = (noise + (noise2)) / 2

				// let mult = 3
				// let multIter = mult
				// let res = 0
				// while(multIter > 0){
				// 	res += noise / multIter
				// 	multIter--
				// }
				// noise = res / mult


				// let u = ((this.gameTileD + this.lastX) - this.lastX) / x
				// let col = "0x" + colorconvert.hsl.hex(u * 6, u * 100, u * 50)
				// let col = "0x" + colorconvert.hsl.hex(s * this.rand360, 100, 50)
				// this.terrain.beginFill(col, 1)

				if(noise < this.threshold){
					if(squares[x] === undefined){
						squares[x] = {}
					}
					if(squares[x][y] === undefined){
						squares[x][y] = 0
					}
					
					this.astarmap[yIter][xIter] = 0
				}else{
					this.astarmap[yIter][xIter] = 1
				}
				yIter++
			}
			xIter++
		}

		this.terrain.beginFill(col, 1)
		for(
			let x = mapX; 
			x < this.gameTileD + mapX; 
			x++)
		{
			for(
				let y = mapY; 
				y < this.gameTileD + mapY; 
				y++)
			{
				if(squares[x] !== undefined){
					if(squares[x][y] !== undefined){

						// if(this.neighborCount(x, y, squares) < 7){
						// 	this.terrain.beginFill(0x000000, 1)
						// }else{
							// this.terrain.beginFill(col, 1)
						// }

						this.paintSquare(
							x * this.tileSize, 
							y * this.tileSize, 
							this.tileSize, 
							this.tileSize)
					}
				}
			}
		}

		if(this.keyState["click"]){
	        let destTileX = this.worldToTile(this.mousex - (this.mapContainer.x % this.tileSize))
	        let destTileY = this.worldToTile(this.mousey - (this.mapContainer.y % this.tileSize))

	        let playerTileX = this.worldToTile(this.screenToWorldX(this.player.x))
	        let playerTileY = this.worldToTile(this.screenToWorldY(this.player.y))

	        console.log(destTileX)

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

		this.findSections(squares)

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

		//move player
		if(this.player.path !== null){
			this.terrain.beginFill(0xffff66, 1)

			if(this.player.path[this.player.pathIter] !== undefined){

				this.player.onSpot = false

				let stepSize = this.tileSize / (this.player.moveSpeed / (1000 / 60))
			
				if(this.player.x < this.playerDestX())
				{
					this.player.x += stepSize
				}else if(this.player.x > this.playerDestX())
				{
					this.player.x -= stepSize
				}

				if(this.player.y < this.playerDestY())
				{
					this.player.y += stepSize
				}else if(this.player.y > this.playerDestY())
				{
					this.player.y -= stepSize
				}
			}
		}

		//render player
		this.terrain.beginFill(0xffffff, 1)
		this.paintSquare(
			this.player.x, 
			this.player.y, 
			this.tileSize, 
			this.tileSize)
	}
}

module.exports = Game