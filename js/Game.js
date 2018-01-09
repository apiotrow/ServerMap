let SimplexNoise = require('simplex-noise')
let colorconvert = require('color-convert')
let easystarjs = require('easystarjs')

let work = require('webworkify')
let siplexworker = work(require('./simplexworker.js'))

let Room = require('./Room.js')
let Player = require('./Player.js')

class Game{
	constructor(seed, rule, app, canvas){
		this.app = app

		this.mapContainer = new PIXI.Container()

		this.rooms = []
		for(let x = 0; x < 5; x++){
			for(let y = 0; y < 5; y++){
				let tileSize = 10
				let dimension = 40

				this.rooms.push(new Room(
					this.mapContainer, 
					this.app.renderer,
					tileSize,
					dimension,
					x * dimension, 
					y * dimension))
			}
		}
		this.player = new Player(this.rooms[0].tileSize, this.rooms[0])

		for(let i in this.rooms){
			this.mapContainer.addChild(this.rooms[i].graphics)
		}

		this.camContainer  = new PIXI.Container()
		this.app.stage.addChild(this.camContainer)
		this.camContainer.addChild(this.mapContainer)

		//camera pan speed
		this.camSpeed = 20

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

		siplexworker.addEventListener('message', function (ev) {
		    console.log(ev.data)
		})
		siplexworker.postMessage(4)

		//start update loop
		let callUpdate = ()=> {
			this.update()
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()

		this.mapXOffset = 1
		this.mapYOffset = 1
	}

	moveCamY(amt){
		// this.mapContainer.y -= amt
		this.camContainer.y += amt
	}

	moveCamX(amt){
		// this.mapContainer.x -= amt
		this.camContainer.x += amt
	}

	centerCamOnPlayer(){
		this.camContainer.x = -this.player.x + (this.app.renderer.width / 2)
		this.camContainer.y = -this.player.y + (this.app.renderer.height / 2)
	}

	cameraKeyboardControls(){
		//move grid or container
		let moveGrid = false

		let gridMoveAmt = 1
		if(this.keyState['w'] == true){
			if(moveGrid)
				this.mapYOffset -= gridMoveAmt
			else
				this.moveCamY(this.camSpeed)
		}
		if(this.keyState['s'] == true){
			if(moveGrid)
				this.mapYOffset += gridMoveAmt
			else
				this.moveCamY(-this.camSpeed)
		}
		if(this.keyState['d'] == true){
			if(moveGrid)
				this.mapXOffset += gridMoveAmt
			else
				this.moveCamX(-this.camSpeed)
		}
		if(this.keyState['a'] == true){
			if(moveGrid)
				this.mapXOffset -= gridMoveAmt
			else
				this.moveCamX(this.camSpeed)
		}
	}

	checkAround(sections, x, y, squares){
		if(this.pointConnected(x - 1, y - 1, squares)){
			sections.add(x - 1, y - 1)
		}
		if(this.pointConnected(x, y - 1, squares)){
			sections.add(x, y - 1)
		}
		if(this.pointConnected(x + 1, y - 1, squares)){
			sections.add(x + 1, y - 1)
		}
		if(this.pointConnected(x - 1, y, squares)){
			sections.add(x - 1, y)
		}
		if(this.pointConnected(x + 1, y, squares)){
			sections.add(x + 1, y)
		}
		if(this.pointConnected(x - 1, y + 1, squares)){
			sections.add(x - 1, y + 1)
		}
		if(this.pointConnected(x, y + 1, squares)){
			sections.add(x, y + 1)
		}
		if(this.pointConnected(x + 1, y + 1, squares)){
			sections.add(x + 1, y + 1)
		}
	}

	neighborCount(x, y, squares){
		let count = 0

		if(this.pointConnected(x - 1, y - 1, squares)){
			count++
		}
		if(this.pointConnected(x, y - 1, squares)){
			count++
		}
		if(this.pointConnected(x + 1, y - 1, squares)){
			count++
		}
		if(this.pointConnected(x - 1, y, squares)){
			count++
		}
		if(this.pointConnected(x + 1, y, squares)){
			count++
		}
		if(this.pointConnected(x - 1, y + 1, squares)){
			count++
		}
		if(this.pointConnected(x, y + 1, squares)){
			count++
		}
		if(this.pointConnected(x + 1, y + 1, squares)){
			count++
		}

		return count
	}

	pointConnected(x, y, squares){
		if(squares[x] !== undefined){
			if(squares[x][y] !== undefined){
				return true
			}
		}
		return false
	}

	zoom(amt){
		this.rooms[0].zoom(amt)
		this.player.zoom(amt)
 		
		this.keyState['zoomIn'] = false
	}

	editDivisors(){
		let changed = false

		if(this.keyState['r'] == true){
			this.rooms[0].changer *= 1.01
			changed = true
		}
		if(this.keyState['f'] == true){
			this.rooms[0].changer /= 1.01
			changed = true
		}
	}

	update(){
		if(this.keyState['zoomIn']){
			this.zoom(1)
			this.keyState['zoomIn'] = false
		}else if (this.keyState['zoomOut']){
			this.zoom(-1)
			this.keyState['zoomOut'] = false
		}

		this.editDivisors()
		this.cameraKeyboardControls()
		// this.keepPlayerWithinScreenBoundaries()
		
		if(this.keyState["click"]){
			this.player.click(this.mouseX, this.mouseY, this.camContainer)

		    this.keyState["click"] = false
		}

		//update player
		this.player.update()
		
		//update room
		for(let i in this.rooms){
			this.rooms[i].update(this.mapXOffset, this.mapYOffset, this.player.x, this.player.y)
		}

		// this.centerCamOnPlayer()
	}
}

module.exports = Game