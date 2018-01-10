
let Mover = require('./Mover.js')

class Player extends Mover{
	constructor(roomX, roomY, inRoomX, inRoomY, rooms, mapContainer, spacing, color){
		super(rooms[roomX][roomY], mapContainer, spacing, color)

		this.rooms = rooms

		this.changeRoom(
			roomX, roomY,
			inRoomX, inRoomY)
	}

	changeRoom(roomX, roomY, inRoomX, inRoomY){
		//current room indexes
		this.roomX = roomX
		this.roomY = roomY

		//current room
		this.room = this.rooms[this.roomX][this.roomY]

		super.changeRoom(this.roomX, this.roomY, inRoomX, inRoomY)
	}

	//what player does when user click on map
	tryMove(mouseX, mouseY, camContainer){
		let toX = this.room.worldToTile(mouseX - camContainer.x)
        let toY = this.room.worldToTile(mouseY - camContainer.y)

        super.tryMove(toX, toY)
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
	}
}
module.exports = Player