let SimplexNoise = require('simplex-noise')
let colorconvert = require('color-convert')
let easystarjs = require('easystarjs')

let work = require('webworkify')
let siplexworker = work(require('./simplexworker.js'))

let Room = require('./Room.js')

class Game{
	constructor(seed, rule, app, canvas){
		this.app = app

		this.mapContainer = new PIXI.Container()
		this.room = new Room(this.mapContainer, this.app.renderer)
		this.mapContainer.addChild(this.room.graphics)
		this.camContainer  = new PIXI.Container()
		this.app.stage.addChild(this.camContainer)
		this.camContainer.addChild(this.mapContainer)

		//camera pan speed
		this.camSpeed = 2

		//random color for map
		this.rand360 = Math.floor(Math.random() * 360)
		this.randColChange = 0.7

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

		//player
		this.player = {}
		this.player.path = null
		this.player.pathIter = 1
		this.player.moveInterval
		this.player.moveSpeed = (1000 / 60) * this.room.tileSize * 0.5
		this.player.moving = false
		this.player.onSpot = true
		this.player.chosenNextDest = []
		//position of player in grid
		this.player.pathX = 0
		this.player.pathY = 0
		//position of player in container
		this.player.x = 0
		this.player.y = 0

		this.changer = 3
		this.mapXOffset = 1
		this.mapYOffset = 1
	}

	paintSquare(x, y, w, h){
		this.room.graphics.drawRect(x, y, w, h)
	}

	setPlayerPath(fromX, fromY, toX, toY){
		if(this.playerInScreen()){
			//make sure player is in screen
	    	this.room.es.setGrid(this.room.astarmap)

	    	//check if start or end point is outside
	    	//of astar map
	    	if(fromX < 0 || fromY < 0
	    		|| toX < 0 || toY < 0
	    		|| fromX >= this.room.astarmap.length || fromY >= this.room.astarmap.length
	    		|| toX >= this.room.astarmap.length || toY >= this.room.astarmap.length)
	    		return

	        this.room.es.findPath(fromX, fromY, toX, toY, (path)=>{
	        	this.player.pathIter = 1
	        	this.player.path = path

	        	if(this.player.path !== null){
		        	for(let i = 0; i < this.player.path.length; i++){
						this.player.path[i].y = 
						(this.player.path[i].y * this.room.tileSize) - this.mapContainer.y

						this.player.path[i].x = 
						(this.player.path[i].x * this.room.tileSize) - this.mapContainer.x
					}

					this.player.pathX = this.playerGridPosX()
					this.player.pathY = this.playerGridPosY()
				}

	        	clearInterval(this.player.moveInterval)
	        	this.player.moveInterval = setInterval(()=>{
					if(this.player.path !== null){
						this.player.onSpot = true

						this.player.moving = true

						if(this.player.path[this.player.pathIter] !== undefined){
							//update player's container position
							this.player.x = this.playerDestX()
							this.player.y = this.playerDestY()

							//update player's grid position
							this.player.pathX = this.playerGridPosX()
							this.player.pathY = this.playerGridPosY()

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

	        this.room.es.calculate()
	    }
	}

	//player's x position in grid
	playerGridPosX(){
		return (this.player.path[this.player.pathIter].x - this.mapContainer.x) / 
					this.room.tileSize
	}

	//player's y position in grid
	playerGridPosY(){
		return (this.player.path[this.player.pathIter].y - this.mapContainer.y) / 
					this.room.tileSize
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
    	&& playerTileX < this.room.dimension
    	&& playerTileY < this.room.dimension)
    	{
	    	return true
	    }
	    return false
	}

	worldToTile(world){
		return Math.floor(world / this.room.tileSize)
	}

	screenToWorldX(screenX){
		return screenX + this.mapContainer.x
	}

	screenToWorldY(screenY){
		return screenY + this.mapContainer.y
	}

	moveCamY(amt){
		// this.mapContainer.y -= amt

		this.camContainer.y += amt
	}

	moveCamX(amt){
		// this.mapContainer.x -= amt

		this.camContainer.x += amt
	}

	keepPlayerWithinScreenBoundaries(){
		if(this.worldToTile(this.screenToWorldX(this.player.x)) < 1){
			this.moveCamX(1)
		}
		if(this.worldToTile(this.screenToWorldX(this.player.x)) > this.room.dimension - 2){
			this.moveCamX(-1)
		}
		if(this.worldToTile(this.screenToWorldY(this.player.y)) > this.room.dimension - 2){
			this.moveCamY(-1)
		}
		if(this.worldToTile(this.screenToWorldY(this.player.y)) < 1){
			this.moveCamY(1)
		}
	}

	centerCamOnPlayer(){
		this.camContainer.x = -this.player.x + (this.app.renderer.width / 2)
		this.camContainer.y = -this.player.y + (this.app.renderer.height / 2)
	}

	cameraKeyboardControls(){
		//move grid or container
		let moveGrid = false

		let gridMoveAmt = 1
		if(this.keyState['w'] == true){
			if(moveGrid)
				this.mapYOffset -= gridMoveAmt
			else
				this.moveCamY(this.camSpeed)
		}
		if(this.keyState['s'] == true){
			if(moveGrid)
				this.mapYOffset += gridMoveAmt
			else
				this.moveCamY(-this.camSpeed)
		}
		if(this.keyState['d'] == true){
			if(moveGrid)
				this.mapXOffset += gridMoveAmt
			else
				this.moveCamX(-this.camSpeed)
		}
		if(this.keyState['a'] == true){
			if(moveGrid)
				this.mapXOffset -= gridMoveAmt
			else
				this.moveCamX(this.camSpeed)
		}
	}

	editDivisors(){
		let changed = false

		if(this.keyState['r'] == true){
			this.changer *= 1.01
			changed = true
		}
		if(this.keyState['f'] == true){
			this.changer /= 1.01
			changed = true
		}

		if(changed){
			// console.log("this.changer: " + this.changer)
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

	zoom(amt){
		this.room.tileSize += amt
		this.room.dimension = Math.floor(this.app.renderer.width / this.room.tileSize)

		//remake astar map since we just changed size of map
		this.room.astarmap = []
		for(let x = 0; x < this.room.dimension; x++){
			let aStarMapCol = []
			for(let y = 0; y < this.room.dimension; y++){
				aStarMapCol.push(0)
			}
			this.room.astarmap.push(aStarMapCol)
		}
 		
 		//adjust player so they maintain their position
 		//within map
		if(amt < 0){
			this.player.x -= this.player.pathX
			this.player.y -= this.player.pathY

			// if(this.player.path !== null){
			// 	for(let i = 0; i < this.player.path.length; i++){
			// 		this.player.path[i].x -= this.player.pathX
			// 		this.player.path[i].y -= this.player.pathY
			// 	}
			// }
		}else if(amt > 0){
			this.player.x += this.player.pathX
			this.player.y += this.player.pathY

			// if(this.player.path !== null){
			// 	for(let i = 0; i < this.player.path.length; i++){
			// 		this.player.path[i].x += this.player.pathX
			// 		this.player.path[i].y += this.player.pathY
			// 	}
			// }
		}

		this.keyState['zoomIn'] = false
	}

	update(){
		this.room.graphics.clear()

		if(this.keyState['zoomIn']){
			this.zoom(1)
			this.keyState['zoomIn'] = false
		}else if (this.keyState['zoomOut']){
			this.zoom(-1)
			this.keyState['zoomOut'] = false
		}

		this.editDivisors()

		this.cameraKeyboardControls()
		// this.keepPlayerWithinScreenBoundaries()
		
		if(this.rand360 <= 0){
			if(this.randColChange < 0)
				this.randColChange = -this.randColChange
		}else if(this.rand360 >= 360){
			if(this.randColChange > 0)
				this.randColChange = -this.randColChange
		}
		this.rand360 += this.randColChange
		
		let col = "0x" + colorconvert.hsl.hex(this.rand360, 100, 50)
		this.room.graphics.beginFill(col, 1)

		//get map info
		let xIter = 0
		let yIter = 0
		let squares = {}

		let regX = (-this.mapContainer.x / this.room.tileSize)
		let regY = (-this.mapContainer.y / this.room.tileSize)
		let mapX = Math.floor(regX)
		let mapY = Math.floor(regY)

		for(
			let x = mapX; 
			x < this.room.dimension + mapX; 
			x++)
		{
			yIter = 0
			for(
				let y = mapY; 
				y < this.room.dimension + mapY; 
				y++)
			{
				let noise = this.room.simplex.noise2D(
					(x + this.mapXOffset) / (this.room.divisor / 1), 
					(y + this.mapYOffset) / (this.room.divisor / 1))

				let noise2 = this.room.simplex.noise2D(
					(x + this.mapXOffset) / (this.room.divisor / this.changer), 
					(y + this.mapYOffset) / (this.room.divisor / this.changer))

				noise = (noise + (noise2)) / 2

				if(noise < this.room.threshold){
					if(squares[x] === undefined){
						squares[x] = {}
					}
					if(squares[x][y] === undefined){
						squares[x][y] = 0
					}

					if(this.room.astarmap[yIter] !== undefined
						&& this.room.astarmap[yIter][xIter] !== undefined)
					{
						this.room.astarmap[yIter][xIter] = 0
					}
				}else{
					if(this.room.astarmap[yIter] !== undefined
						&& this.room.astarmap[yIter][xIter] !== undefined)
					{
						this.room.astarmap[yIter][xIter] = 1
					}
				}
				yIter++
			}
			xIter++
		}

		this.room.graphics.beginFill(col, 1)
		for(
			let x = mapX; 
			x < this.room.dimension + mapX; 
			x++)
		{
			for(
				let y = mapY; 
				y < this.room.dimension + mapY; 
				y++)
			{
				if(squares[x] !== undefined){
					if(squares[x][y] !== undefined){

						// if(this.neighborCount(x, y, squares) < 7){
						// 	this.room.beginFill(0x000000, 1)
						// }else{
							// this.room.beginFill(col, 1)
						// }

						this.paintSquare(
							x * this.room.tileSize, 
							y * this.room.tileSize, 
							this.room.tileSize, 
							this.room.tileSize)
					}
				}
			}
		}

		if(this.keyState["click"]){
	        let destTileX = this.worldToTile(this.mousex - this.camContainer.x)
	        let destTileY = this.worldToTile(this.mousey - this.camContainer.y)

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

		//move player.
		//has to be down here for change destination mid-path
		//code won't work
		if(this.player.path !== null){
			this.room.graphics.beginFill(0xffff66, 1)

			if(this.player.path[this.player.pathIter] !== undefined)
				{

				this.player.onSpot = false

				let stepSize = this.room.tileSize / (this.player.moveSpeed / (1000 / 60))

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
		this.room.graphics.beginFill(0xffffff, 1)
		this.paintSquare(
			this.player.x, 
			this.player.y, 
			this.room.tileSize, 
			this.room.tileSize)

		// this.centerCamOnPlayer()
	}
}

module.exports = Game