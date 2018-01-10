
let Mover = require('./Mover.js')

class Player extends Mover{
	constructor(rooms, mapContainer, spacing, color){
		super(rooms[1][1], mapContainer, spacing, color)

		this.rooms = rooms

		this.changeRoom(
			1, 1,
			0, 0)

		this.rooms = rooms
	}

	changeRoom(roomX, roomY, inRoomX, inRoomY){
		//current room indexes
		this.roomX = roomX
		this.roomY = roomY

		//current room
		this.room = this.rooms[this.roomX][this.roomY]

		super.changeRoom(this.roomX, this.roomY, inRoomX, inRoomY)
	}

	//what player does click on map
	tryMove(mouseX, mouseY, camContainer){
		let destTileX = this.room.worldToTile(mouseX - camContainer.x)
        let destTileY = this.room.worldToTile(mouseY - camContainer.y)

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

		// 		if(this.y < this.destY())
		// 		{
		// 			this.y += stepSize
		// 		}else if(this.y > this.destY())
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
module.exports = Player