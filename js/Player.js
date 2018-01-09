


class Player{
	constructor(tileSize, room){
		this.room = room

		this.path = null
		this.pathIter = 1
		this.moveInterval
		this.moveSpeed = (1000 / 60) * tileSize * 0.5
		this.moving = false
		this.onSpot = true
		this.chosenNextDest = []
		//position of player in grid
		this.pathX = 0
		this.pathY = 0
		//position of player in container
		this.x = 0
		this.y = 0
	}

	inScreen(){
		let playerTileX = this.room.worldToTile(this.x + this.room.mapContainer.x) 
	    let playerTileY = this.room.worldToTile(this.y + this.room.mapContainer.y)

	    if(playerTileX > -1 && playerTileY > -1 
    	&& playerTileX < this.room.dimension
    	&& playerTileY < this.room.dimension)
    	{
	    	return true
	    }
	    return false
	}

	//player's x position in grid
	gridPosX(){
		return (this.path[this.pathIter].x - this.room.mapContainer.x) / 
					this.room.tileSize
	}

	//player's y position in grid
	gridPosY(){
		return (this.path[this.pathIter].y - this.room.mapContainer.y) / 
					this.room.tileSize
	}

	destX(){
		return (this.path[this.pathIter].x) 
	}

	destY(){
		return (this.path[this.pathIter].y) 
	}

	setPath(fromX, fromY, toX, toY){
		if(this.inScreen()){
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
	        	this.pathIter = 1
	        	this.path = path

	        	if(this.path !== null){
		        	for(let i = 0; i < this.path.length; i++){
						this.path[i].y = 
						(this.path[i].y * this.room.tileSize) - this.room.mapContainer.y

						this.path[i].x = 
						(this.path[i].x * this.room.tileSize) - this.room.mapContainer.x
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
	    }
	}

	screenToWorldX(screenX){
		return screenX + this.room.mapContainer.x
	}

	screenToWorldY(screenY){
		return screenY + this.room.mapContainer.y
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
    		if(this.inScreen())
        	{
		    	this.chosenNextDest.push(destTileX)
		    	this.chosenNextDest.push(destTileY)
		    }
	    }
	}

	zoom(amt){
		//adjust player so they maintain their position
 		//within map
		if(amt < 0){
			this.x -= this.pathX
			this.y -= this.pathY

			// if(this.path !== null){
			// 	for(let i = 0; i < this.path.length; i++){
			// 		this.path[i].x -= this.pathX
			// 		this.path[i].y -= this.pathY
			// 	}
			// }
		}else if(amt > 0){
			this.x += this.pathX
			this.y += this.pathY

			// if(this.path !== null){
			// 	for(let i = 0; i < this.path.length; i++){
			// 		this.path[i].x += this.pathX
			// 		this.path[i].y += this.pathY
			// 	}
			// }
		}
	}

	update(){
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
	}
}
module.exports = Player