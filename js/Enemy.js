
let Mover = require('./Mover.js')

class Enemy extends Mover{
	constructor(room, mapContainer, spacing, color){
		super(room, mapContainer, spacing, color)

		this.changeRoom(
			room,
			0, 0)

		setInterval(()=>{
			this.tryMove()
		}, (Math.random() * 2000) + 1000)
	}

	changeRoom(room, inRoomX, inRoomY){
		//current room
		this.room = room

		//current room indexes
		this.roomX = this.room.x / (this.room.dimension + this.spacing)
		this.roomY = this.room.y / (this.room.dimension + this.spacing)

		super.changeRoom(this.roomX, this.roomY, inRoomX, inRoomY)
	}

	//override
	moveToNewRoom(fromX, fromY, toX, toY){
		return
	}

	//what player does click on map
	tryMove(){
  		let destTileX = Math.floor(Math.random() 
  			* (this.room.dimension - this.spacing)) + this.room.x

        let destTileY = Math.floor(Math.random() 
        	* (this.room.dimension - this.spacing)) + this.room.y

        super.tryMove(destTileX, destTileY)

     //    let playerTileX = this.room.worldToTile(super.screenToWorldX(this.x))
     //    let playerTileY = this.room.worldToTile(super.screenToWorldY(this.y))

    	// if(!this.moving){
    	// 	this.setPath(playerTileX, playerTileY, destTileX, destTileY)
    	// }else{
	    // 	this.chosenNextDest.push(destTileX)
	    // 	this.chosenNextDest.push(destTileY)
	    // }
	}

	update(){
		super.update()

		// this.graphics.clear()

		// //change player destination
		// if(this.onSpot == true && this.chosenNextDest.length > 0){
		// 	this.path = null

		// 	let destTileX = this.chosenNextDest[0]
	 //        let destTileY = this.chosenNextDest[1]

	 //        this.chosenNextDest = []

	 //        let playerTileX = this.room.worldToTile(super.screenToWorldX(this.x))
	 //        let playerTileY = this.room.worldToTile(super.screenToWorldY(this.y))

	 //        this.setPath(playerTileX, playerTileY, destTileX, destTileY)
		// }

		// //move player.
		// //has to be down here for change destination mid-path
		// //code won't work
		// if(this.path !== null){
		// 	if(this.path[this.pathIter] !== undefined)
		// 		{

		// 		this.onSpot = false

		// 		let stepSize = this.room.tileSize / (this.moveSpeed / (1000 / 60))

		// 		if(this.x < super.destX())
		// 		{
		// 			this.x += stepSize
		// 		}else if(this.x > super.destX())
		// 		{
		// 			this.x -= stepSize
		// 		}

		// 		if(this.y < super.destY())
		// 		{
		// 			this.y += stepSize
		// 		}else if(this.y > super.destY())
		// 		{
		// 			this.y -= stepSize
		// 		}
		// 	}
		// }

		// //render player
		// super.paint(
		// 	this.room.tileSize, 
		// 	this.room.tileSize)
	}
}
module.exports = Enemy