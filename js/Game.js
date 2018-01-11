let SimplexNoise = require('simplex-noise')
let colorconvert = require('color-convert')
let easystarjs = require('easystarjs')

let work = require('webworkify')
let simplexworker = work(require('./simplexworker.js'))

let Room = require('./Room.js')
let Player = require('./Player.js')

class Game{
	constructor(app, canvas){
		simplexworker.addEventListener('message', function (ev) {
		    // console.log(ev.data)
		})
		simplexworker.postMessage(4)


		this.app = app

		this.mapContainer = new PIXI.Container()

		//create rooms
		this.rooms = []
		let mapSize = 4
		let spacing = 0
		for(let x = 0; x < mapSize; x++){
			let roomsCol = []
			for(let y = 0; y < mapSize; y++){
				let tileSize = 10
				let dimension = 100
				let seed = parseFloat(x + "" + y)

				//create room
				let newRoom = new Room(
					this.mapContainer, 
					this.app.renderer,
					tileSize,
					dimension,
					x * (dimension + spacing), 
					y * (dimension + spacing),
					seed)

				//create enemies
				newRoom.createEnemy(spacing, 0x66a3ff)

				//add room to rooms
				roomsCol.push(newRoom)
			}
			this.rooms.push(roomsCol)
		}
		//create player
		this.player = new Player(
			1, 1, //starting room
			0, 0, //starting position in room
			this.rooms,
			this.mapContainer,
			spacing,
			0xffffff,
			0.5)

		//setup containers
		this.camContainer  = new PIXI.Container()
		this.app.stage.addChild(this.camContainer)
		this.camContainer.addChild(this.mapContainer)

		//camera pan speed
		this.camSpeed = 10

		//setup input
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

		this.mouseX = 0
		this.mouseY = 0
		canvas.addEventListener
		('mousemove', (evt)=>{
			this.mouseX = evt.offsetX
			this.mouseY = evt.offsetY
		})

		//start update loop
		let callUpdate = ()=> {
			this.update()
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()

		for(let i in this.rooms){
			for(let j in this.rooms[i]){
				this.rooms[i][j].paintMap()
			}
		}
	}

	centerCamOnPlayer(){
		this.camContainer.x = -this.player.x + (this.app.renderer.width / 2)
		this.camContainer.y = -this.player.y + (this.app.renderer.height / 2)
	}

	moveCamY(amt){
		this.camContainer.y += amt
	}

	moveCamX(amt){
		this.camContainer.x += amt
	}

	cameraKeyboardControls(){
		if(this.keyState['w'] == true){
			this.moveCamY(this.camSpeed)
		}
		if(this.keyState['s'] == true){
			this.moveCamY(-this.camSpeed)
		}
		if(this.keyState['d'] == true){
			this.moveCamX(-this.camSpeed)
		}
		if(this.keyState['a'] == true){
			this.moveCamX(this.camSpeed)
		}
	}

	zoom(amt){
		this.rooms[0][0].zoom(amt)
		this.player.zoom(amt)
 		
		this.keyState['zoomIn'] = false
	}

	editDivisors(){
		let changed = false

		if(this.keyState['r'] == true){
			this.rooms[0][0].changer *= 1.01
			changed = true
		}
		if(this.keyState['f'] == true){
			this.rooms[0][0].changer /= 1.01
			changed = true
		}
	}

	update(){
		// if(this.keyState['zoomIn']){
		// 	this.zoom(1)
		// 	this.keyState['zoomIn'] = false
		// }else if (this.keyState['zoomOut']){
		// 	this.zoom(-1)
		// 	this.keyState['zoomOut'] = false
		// }

		this.editDivisors()
		this.cameraKeyboardControls()
		// this.keepPlayerWithinScreenBoundaries()
		
		if(this.keyState["click"]){
			this.player.tryMove(this.mouseX, this.mouseY, this.camContainer)

		    this.keyState["click"] = false
		}

		//update player
		this.player.update()
		
		//update room
		for(let i in this.rooms){
			for(let j in this.rooms[i]){
				this.rooms[i][j].update(
					this.mapXOffset, 
					this.mapYOffset)
			}
		}

		// this.centerCamOnPlayer()
	}
}

module.exports = Game