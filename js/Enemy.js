
let Mover = require('./Mover.js')

class Enemy extends Mover{
	constructor(inRoomX, inRoomY, room, mapContainer, spacing, color){
		super(room, mapContainer, spacing, color)

		this.changeRoom(
			room,
			inRoomX, inRoomY)

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

	//find a random walkable spot in map
	tryMove(){
  		let destTileX = Math.floor(Math.random() 
  			* (this.room.dimension - this.spacing)) + this.room.x

        let destTileY = Math.floor(Math.random() 
        	* (this.room.dimension - this.spacing)) + this.room.y

        let toX = destTileX - (this.roomX * (this.room.dimension + this.spacing))
    	let toY = destTileY - (this.roomY * (this.room.dimension + this.spacing))

    	//try until we find a walkable one
        while(this.room.astarmap[toY][toX] == 0){
        	destTileX = Math.floor(Math.random() 
  				* (this.room.dimension - this.spacing)) + this.room.x

        	destTileY = Math.floor(Math.random() 
        		* (this.room.dimension - this.spacing)) + this.room.y

        	toX = destTileX - (this.roomX * (this.room.dimension + this.spacing))
    		toY = destTileY - (this.roomY * (this.room.dimension + this.spacing))
        }

        super.tryMove(destTileX, destTileY)
	}

	update(){
		super.update()
	}
}
module.exports = Enemy