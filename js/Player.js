


class Player{
	constructor(rooms, mapContainer){
		this.rooms = rooms

		this.changeRoom(
			1, 1,
			3, 0)

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
	}

	changeRoom(roomX, roomY, inRoomX, inRoomY){
		//current room indexes
		this.roomX = roomX
		this.roomY = roomY

		//position of player in grid
		this.inRoomX = inRoomX
		this.inRoomY = inRoomY

		//current room
		this.room = this.rooms[this.roomX][this.roomY]

		//x position of player in container
		this.x = (inRoomX * this.room.tileSize) 
		+ (this.roomX * ((this.room.dimension + 1) * this.room.tileSize))

		//y position of player in container
		this.y = (inRoomY * this.room.tileSize) 
		+ (this.roomY * ((this.room.dimension + 1) * this.room.tileSize))
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
		return this.inRoomX
	}

	//player's y position in grid
	gridPosY(){
		if(this.path.length != 0){
			return (this.path[this.pathIter].y - this.mapContainer.y) / 
					this.room.tileSize
		}
		return this.inRoomY
	}

	destX(){
		return (this.path[this.pathIter].x) + 
		(this.roomX * ((this.room.dimension + 1) * this.room.tileSize))
	}

	destY(){
		return (this.path[this.pathIter].y) + 
		(this.roomY * ((this.room.dimension + 1) * this.room.tileSize))
	}

	setPath(fromX, fromY, toX, toY){
		// if(this.inScreen()){
    	this.room.es.setGrid(this.room.astarmap)

    	//adjust start and end positions so 0,0
    	//is always upper left corner no matter what room
    	//we're in
    	fromX -= this.roomX * (this.room.dimension + 1)
    	fromY -= this.roomY * (this.room.dimension + 1)
    	toX -= this.roomX  * (this.room.dimension + 1)
    	toY -= this.roomY * (this.room.dimension + 1)

    	//check if start or end point is outside
    	//current room. if it is, move to new room
    	if(fromX < 0 || fromY < 0
    		|| toX < 0 || toY < 0
    		|| fromX >= this.room.astarmap.length || fromY >= this.room.astarmap.length
    		|| toX >= this.room.astarmap.length || toY >= this.room.astarmap.length)
    	{
    		//get new roomX and roomY
    		let roomX = this.roomX + Math.floor(toX / (this.room.dimension + 1))
    		let roomY = this.roomY + Math.floor(toY / (this.room.dimension + 1))

    		//if player clicked outside of map, ignore
    		if(this.rooms[roomX] === undefined
    			|| this.rooms[roomX][roomY] === undefined)
    		{
    			return
    		}

    		//move to room player clicked on
    		this.changeRoom(
				roomX, roomY,
				0, 0)

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

				this.inRoomX = this.gridPosX()
				this.inRoomY = this.gridPosY()
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
						this.inRoomX = this.gridPosX()
						this.inRoomY = this.gridPosY()

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
	// 		this.x -= this.inRoomX
	// 		this.y -= this.inRoomY

	// 		// if(this.path !== null){
	// 		// 	for(let i = 0; i < this.path.length; i++){
	// 		// 		this.path[i].x -= this.inRoomX
	// 		// 		this.path[i].y -= this.inRoomY
	// 		// 	}
	// 		// }
	// 	}else if(amt > 0){
	// 		this.x += this.inRoomX
	// 		this.y += this.inRoomY

	// 		// if(this.path !== null){
	// 		// 	for(let i = 0; i < this.path.length; i++){
	// 		// 		this.path[i].x += this.inRoomX
	// 		// 		this.path[i].y += this.inRoomY
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