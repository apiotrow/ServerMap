
let Mover = require('./Mover.js')

class Enemy extends Mover{
	constructor(room, mapContainer, spacing, color, speed){
		super(room, mapContainer, spacing, color, speed)

		this.changeRoom(
			room,
			0, 0)

		this.setInitLocation()

		// setInterval(()=>{
		// 	this.tryMove()
		// }, (Math.random() * 2000) + 500)
	}

	setInitLocation(){
		let start = this.findWalkableSpot()

		this.changeRoom(
			this.room,
			start[0], start[1])
	}

	findWalkableSpot(){
    	let randIndexX = Math.floor(Math.random() * this.room.astarmap.length)
	    let randIndexY = Math.floor(Math.random() * this.room.astarmap[randIndexX].length)

    	//try until we find a walkable one
        while(this.room.astarmap[randIndexY][randIndexX] == 0){
        	randIndexX = Math.floor(Math.random() * this.room.astarmap.length)
	    	randIndexY = Math.floor(Math.random() * this.room.astarmap[randIndexX].length)
        }

        return [randIndexX, randIndexY]
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
		if(this.path == null){
			this.tryMove()
		}
		super.update()
	}
}
module.exports = Enemy