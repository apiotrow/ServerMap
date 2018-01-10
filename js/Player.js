


class Player{
	constructor(rooms, mapContainer){
		this.roomX = 1
		this.roomY = 1

		this.rooms = rooms
		this.room = this.rooms[this.roomX][this.roomY]
		this.mapContainer = mapContainer

		this.graphics = new PIXI.Graphics()
		this.mapContainer.addChild(this.graphics)
		this.path = null
		this.pathIter = 1
		this.moveInterval
		this.moveSpeed = (1000 / 60) * this.room.tileSize * 0.5
		this.moving = false
		this.onSpot = true
		this.chosenNextDest = []
		//position of player in grid
		this.pathX = 0
		this.pathY = 0
		
		//position of player in container
		this.x = 0 + (this.roomX * ((this.room.dimension + 1) * this.room.tileSize))
		this.y = 0 + (this.roomY * ((this.room.dimension + 1) * this.room.tileSize))
		// this.x = 0
		// this.y = 0
	}

	paint(x, y, w, h){
		this.graphics.drawRect(x, y, w, h)
	}

	// inScreen(){
	// 	let playerTileX = this.room.worldToTile(this.x + this.mapContainer.x) 
	//     let playerTileY = this.room.worldToTile(this.y + this.mapContainer.y)

	//     if(playerTileX > -1 && playerTileY > -1 
 //    	&& playerTileX < this.room.dimension
 //    	&& playerTileY < this.room.dimension)
 //    	{
	//     	return true
	//     }
	//     return false
	// }

	//player's x position in grid
	gridPosX(){
		if(this.path.length != 0){
			return (this.path[this.pathIter].x - this.mapContainer.x) / 
					this.room.tileSize
		}
		return this.pathX
	}

	//player's y position in grid
	gridPosY(){
		if(this.path.length != 0){
			return (this.path[this.pathIter].y - this.mapContainer.y) / 
					this.room.tileSize
		}
		return this.pathY
	}

	destX(){
		return (this.path[this.pathIter].x) + (this.roomX * ((this.room.dimension + 1) * this.room.tileSize))
	}

	destY(){
		return (this.path[this.pathIter].y) + (this.roomY * ((this.room.dimension + 1) * this.room.tileSize))
	}

	setPath(fromX, fromY, toX, toY){
		// if(this.inScreen()){
    	this.room.es.setGrid(this.room.astarmap)

    	fromX -= this.roomX * (this.room.dimension + 1)
    	fromY -= this.roomX * (this.room.dimension + 1)
    	toX -= this.roomX * (this.room.dimension + 1)
    	toY -= this.roomX * (this.room.dimension + 1)

    	console.log(toX)

    	//check if start or end point is outside
    	//of astar map
    	if(fromX < 0 || fromY < 0
    		|| toX < 0 || toY < 0
    		|| fromX >= this.room.astarmap.length || fromY >= this.room.astarmap.length
    		|| toX >= this.room.astarmap.length || toY >= this.room.astarmap.length)
    	{
    		let roomX = Math.floor(toX / (this.room.dimension + 1))
    		let roomY = Math.floor(toY / (this.room.dimension + 1))

    		if(roomX < 0 || roomY < 0
    			//TODO: add check for being off right or bottom of map
    			)
    		{
    			return
    		}

    		let xInRoom = toX % (this.room.dimension + 1)
    		let yInRoom = toY % (this.room.dimension + 1)
    		
    		let newRoom = this.rooms[roomX][roomY]

    		this.room = newRoom

   //  		this.pathX = 0
			// this.pathY = 0

			// this.roomX = roomX
			// this.roomY = roomY

   //  		this.x = 0 + (this.roomX * ((this.room.dimension + 1) * this.room.tileSize))
			// this.y = 0 + (this.roomY * ((this.room.dimension + 1) * this.room.tileSize))

    		return
    	}

        this.room.es.findPath(fromX, fromY, toX, toY, (path)=>{
        	this.pathIter = 1
        	this.path = path

        	//convert path entries from grid values to container values
        	if(this.path !== null){
	        	for(let i = 0; i < this.path.length; i++){
					this.path[i].y = 
					(this.path[i].y * this.room.tileSize) - this.mapContainer.y

					this.path[i].x = 
					(this.path[i].x * this.room.tileSize) - this.mapContainer.x
				}

				this.pathX = this.gridPosX()
				this.pathY = this.gridPosY()
			}

        	clearInterval(this.moveInterval)
        	this.moveInterval = setInterval(()=>{
				if(this.path !== null){
					this.onSpot = true

					this.moving = true

					if(this.path[this.pathIter] !== undefined){
						//update player's container position
						this.x = this.destX()
						this.y = this.destY()

						//update player's grid position
						this.pathX = this.gridPosX()
						this.pathY = this.gridPosY()

						this.pathIter++
					}else{
						this.onSpot = true
						this.moving = false
						this.pathIter = 1
						this.path = null
						clearInterval(this.moveInterval)
					}
				}
			}, this.moveSpeed)
        })

        this.room.es.calculate()
	    // }
	}

	screenToWorldX(screenX){
		return screenX + this.mapContainer.x
	}

	screenToWorldY(screenY){
		return screenY + this.mapContainer.y
	}

	//what player does click on map
	click(mouseX, mouseY, camContainer){
		let destTileX = this.room.worldToTile(mouseX - camContainer.x)
        let destTileY = this.room.worldToTile(mouseY - camContainer.y)

        let playerTileX = this.room.worldToTile(this.screenToWorldX(this.x))
        let playerTileY = this.room.worldToTile(this.screenToWorldY(this.y))

    	if(!this.moving){
    		this.setPath(playerTileX, playerTileY, destTileX, destTileY)
    	}else{
    		// if(this.inScreen()){
		    	this.chosenNextDest.push(destTileX)
		    	this.chosenNextDest.push(destTileY)
		    // }
	    }
	}

	// zoom(amt){
	// 	//adjust player so they maintain their position
 // 		//within map
	// 	if(amt < 0){
	// 		this.x -= this.pathX
	// 		this.y -= this.pathY

	// 		// if(this.path !== null){
	// 		// 	for(let i = 0; i < this.path.length; i++){
	// 		// 		this.path[i].x -= this.pathX
	// 		// 		this.path[i].y -= this.pathY
	// 		// 	}
	// 		// }
	// 	}else if(amt > 0){
	// 		this.x += this.pathX
	// 		this.y += this.pathY

	// 		// if(this.path !== null){
	// 		// 	for(let i = 0; i < this.path.length; i++){
	// 		// 		this.path[i].x += this.pathX
	// 		// 		this.path[i].y += this.pathY
	// 		// 	}
	// 		// }
	// 	}
	// }

	update(){
		this.graphics.clear()

		//change player destination
		if(this.onSpot == true && this.chosenNextDest.length > 0){
			this.path = null

			let destTileX = this.chosenNextDest[0]
	        let destTileY = this.chosenNextDest[1]

	        this.chosenNextDest = []

	        let playerTileX = this.room.worldToTile(this.screenToWorldX(this.x))
	        let playerTileY = this.room.worldToTile(this.screenToWorldY(this.y))

	        this.setPath(playerTileX, playerTileY, destTileX, destTileY)
		}

		//move player.
		//has to be down here for change destination mid-path
		//code won't work
		if(this.path !== null){
			this.room.graphics.beginFill(0xffff66, 1)

			if(this.path[this.pathIter] !== undefined)
				{

				this.onSpot = false

				let stepSize = this.room.tileSize / (this.moveSpeed / (1000 / 60))

				if(this.x < this.destX())
				{
					this.x += stepSize
				}else if(this.x > this.destX())
				{
					this.x -= stepSize
				}

				if(this.y < this.destY())
				{
					this.y += stepSize
				}else if(this.y > this.destY())
				{
					this.y -= stepSize
				}
			}
		}

		//render player
		this.graphics.beginFill(0xffffff, 1)
		this.paint(
			this.x, 
			this.y, 
			this.room.tileSize, 
			this.room.tileSize)
	}
}
module.exports = Player