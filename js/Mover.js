
class Mover{
	constructor(room, mapContainer, spacing, color, speed){
		this.spacing = spacing
		this.color = color

		this.mapContainer = mapContainer
		this.graphics = new PIXI.Graphics()
		this.mapContainer.addChild(this.graphics)
		this.path = null
		this.pathIter = 1
		this.moveInterval
		this.moveSpeed = (1000 / 60) * room.tileSize * speed
		this.moving = false
		this.onSpot = true
		this.chosenNextDest = []
	}

	//update room data
	changeRoom(roomX, roomY, inRoomX, inRoomY){
		//position of player in grid
		this.inRoomX = inRoomX
		this.inRoomY = inRoomY

		//x position of player in container
		this.x = (inRoomX * this.room.tileSize) 
		+ (this.roomX * ((this.room.dimension + this.spacing) * this.room.tileSize))

		//y position of player in container
		this.y = (inRoomY * this.room.tileSize) 
		+ (this.roomY * ((this.room.dimension + this.spacing) * this.room.tileSize))
	}

	paint(w, h){
		this.graphics.beginFill(this.color, 1)
		this.graphics.drawRect(this.x, this.y, w, h)
	}

	//player's x position in grid, local to room
	gridPosX(){
		if(this.path !== null && this.path[this.pathIter] !== undefined){
			return (this.path[this.pathIter].x - this.mapContainer.x) / 
					this.room.tileSize
		}
		return this.inRoomX
	}

	//player's y position in grid, local to room
	gridPosY(){
		if(this.path !== null && this.path[this.pathIter] !== undefined){
			return (this.path[this.pathIter].y - this.mapContainer.y) / 
					this.room.tileSize
		}
		return this.inRoomY
	}

	//global grid destination
	globalX(){
		if(this.path !== null && this.path[this.pathIter] !== undefined){
			return (this.path[this.pathIter].x) + 
				(this.roomX * ((this.room.dimension + this.spacing) * this.room.tileSize))
		}
		return this.x
	}

	//global grid destination
	globalY(){
		if(this.path !== null && this.path[this.pathIter] !== undefined){
			return (this.path[this.pathIter].y) + 
				(this.roomY * ((this.room.dimension + this.spacing) * this.room.tileSize))
		}
		return this.y
	}

	screenToWorldX(screenX){
		return screenX + this.mapContainer.x
	}

	screenToWorldY(screenY){
		return screenY + this.mapContainer.y
	}

	setPath(toX, toY){
		// let origToX = toX
		// let origToY = toY

		//current position
        let fromX = this.room.worldToTile(this.screenToWorldX(this.x))
        let fromY = this.room.worldToTile(this.screenToWorldY(this.y))

		//have to do this or movement gets wonky
    	this.room.es.setGrid(this.room.astarmap)

    	//adjust start and end positions so 0,0 is always 
    	//upper left corner no matter what room we're in
    	fromX -= (this.roomX * (this.room.dimension + this.spacing))
    	fromY -= (this.roomY * (this.room.dimension + this.spacing))
    	toX -= (this.roomX * (this.room.dimension + this.spacing))
    	toY -= (this.roomY * (this.room.dimension + this.spacing))

    	//check if start or end point is outside
    	//current room. if it is, move to new room.
    	if(fromX < 0 || fromY < 0
    		|| toX < 0 || toY < 0
    		|| fromX >= this.room.astarmap.length || fromY >= this.room.astarmap.length
    		|| toX >= this.room.astarmap.length || toY >= this.room.astarmap.length)
    	{
    		//position player will start in in new room
			let inRoomX = toX % (this.room.dimension + this.spacing)
			let inRoomY = toY % (this.room.dimension + this.spacing)
			if(inRoomX < 0){
				inRoomX = (this.room.dimension + this.spacing) + inRoomX
			}
			if(inRoomY < 0){
				inRoomY = (this.room.dimension + this.spacing) + inRoomY
			}

			//get new roomX and roomY
			let roomX = this.roomX + Math.floor(toX / (this.room.dimension + this.spacing))
			let roomY = this.roomY + Math.floor(toY / (this.room.dimension + this.spacing))

			//if chosen room doesn't exist, ignore request
			if(this.rooms[roomX] === undefined
				|| this.rooms[roomX][roomY] === undefined)
			{
				return
			}

			//move to room player clicked on
			this.changeRoom(
				roomX, roomY,
				inRoomX, inRoomY)
    		return
    	}

    	//if destination isn't walkable, return
    	if(this.room.astarmap[toY][toX] == 0){
    		return
    	}

		// for(let i in this.enemies){
		// 	if(this.enemies[i] !== this){
		// 		this.es.avoidAdditionalPoint(
		// 			this.enemies[i].inRoomX, 
		// 			this.enemies[i].inRoomY
		// 			)
		// 	}
		// }

        this.room.es.findPath(fromX, fromY, toX, toY, (path)=>{
        	// this.room.es.stopAvoidingAllAdditionalPoints()

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

			//change player's destination when they reach
			//each spot in the path.
			//
			//interval fires every time we reach a spot
        	//in the path
        	clearInterval(this.moveInterval)
        	this.moveInterval = setInterval(()=>{
				if(this.path !== null){
					this.onSpot = true
					this.moving = true

					//if path not done, inc
					if(this.path[this.pathIter] !== undefined){
						//update player's container position
						//to be the spot they're moving to next
						this.x = this.globalX()
						this.y = this.globalY()

						//update player's grid position
						this.inRoomX = this.gridPosX()
						this.inRoomY = this.gridPosY()

						this.pathIter++
					}else{
						//path done
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

	tryMove(toX, toY){
        //if stationary, try to move to chosen
        //else wait to move until arrived at next spot
    	if(!this.moving){
    		this.setPath(toX, toY)
    	}
    	else{
    		this.chosenNextDest = []
	    	this.chosenNextDest.push(toX)
	    	this.chosenNextDest.push(toY)
	    }
	}

	update(){
		this.graphics.clear()

		//if player is on a tile and wants
		//to change destination, do it
		if(this.onSpot == true && this.chosenNextDest.length > 0){
			this.path = null

			let toX = this.chosenNextDest[0]
	        let toY = this.chosenNextDest[1]

	        this.chosenNextDest = []

	        this.setPath(toX, toY)
		}

		//if there's spots left in path, move player
		if(this.path !== null){
			if(this.path[this.pathIter] !== undefined){
				this.onSpot = false

				let stepSize = this.room.tileSize / (this.moveSpeed / (1000 / 60))

				if(this.x < this.globalX())
				{
					this.x += stepSize
				}else if(this.x > this.globalX())
				{
					this.x -= stepSize
				}

				if(this.y < this.globalY())
				{
					this.y += stepSize
				}else if(this.y > this.globalY())
				{
					this.y -= stepSize
				}
			}
		}

		//render player
		this.paint(
			this.room.tileSize, 
			this.room.tileSize)
	}
}
module.exports = Mover