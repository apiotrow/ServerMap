let SimplexNoise = require('simplex-noise')
let easystarjs = require('easystarjs')
let colorconvert = require('color-convert')
var seedrandom = require('seedrandom')

let Enemy = require('./Enemy.js')

class Room{
	constructor(mapContainer, tileSize, dimension, x, y, seed){
		this.mapContainer = mapContainer
		// this.renderer = renderer
		this.seed = seedrandom(seed)()

		this.x = x
		this.y = y

		this.graphics = new PIXI.Graphics()

		this.mapContainer.addChild(this.graphics)

		//random color for map
		this.col = "0x" + colorconvert.hsl.hex(
			Math.floor(this.seed * 360), 
			100, 
			50)

		//size of each square
		this.tileSize = tileSize

		//width/height of map
		this.dimension = dimension

		//will make simplex non-continuous between rooms
		// this.simplex = new SimplexNoise(()=>{return this.seed})
		
		//makes simplex continuous between rooms
		this.simplex = new SimplexNoise(()=>{return 0.45})

		this.divisor = 30

		this.threshold = -.25

		this.changer = Math.floor(this.seed * 5) + 1
		// this.changer = 1

		this.enemies = {}

		this.astarmap = []
		for(let x = 0; x < this.dimension; x++){
			let aStarMapCol = []
			for(let y = 0; y < this.dimension; y++){
				aStarMapCol.push(0)
			}
			this.astarmap.push(aStarMapCol)
		}

		//initial painting of map. renders it for when we don't
		//re-paint in update loop, and also sets up astar pathfinding
		//grid so enemies can get their initial location
		this.paintMap()

		this.es = new easystarjs.js()
		this.es.setAcceptableTiles(1)
		this.es.enableDiagonals()
		this.es.disableCornerCutting()
		this.es.setGrid(this.astarmap)
		// this.es.setIterationsPerCalculation(1000)
	}

	createEnemy(spacing, color){
		for(let i = 0; i < 10; i++){
			this.enemies[Math.random()] = new Enemy(
				this,
				this.mapContainer,
				spacing,
				color,
				1)
		}
	}

	worldToTile(world){
		return Math.floor(world / this.tileSize)
	}

	paintSquare(x, y, w, h){
		this.graphics.drawRect(x, y, w, h)
	}

	// zoom(amt){
	// 	this.tileSize += amt
	// 	this.dimension = Math.floor(this.renderer.width / this.tileSize)

	// 	//remake astar map since we just changed size of map
	// 	this.astarmap = []
	// 	for(let x = 0; x < this.dimension; x++){
	// 		let aStarMapCol = []
	// 		for(let y = 0; y < this.dimension; y++){
	// 			aStarMapCol.push(0)
	// 		}
	// 		this.astarmap.push(aStarMapCol)
	// 	}
	// }

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

	paintMap(){
		this.graphics.clear()

		this.graphics.beginFill(this.col, 1)

		let xIter = 0
		let yIter = 0
		let squares = {}

		let regX = (-this.mapContainer.x / this.tileSize)
		let regY = (-this.mapContainer.y / this.tileSize)
		let mapX = Math.floor(regX) + this.x
		let mapY = Math.floor(regY) + this.y

		for(
			let x = mapX; 
			x < this.dimension + mapX; 
			x++)
		{
			yIter = 0
			for(
				let y = mapY; 
				y < this.dimension + mapY; 
				y++)
			{
				let noise = this.simplex.noise2D(
					x / (this.divisor / 1), 
					y / (this.divisor / 1))

				let noise2 = this.simplex.noise2D(
					x / (this.divisor / this.changer), 
					y / (this.divisor / this.changer))

				noise = (noise + (noise2)) / 2

				if(noise < this.threshold){
					//unwalkables

					if(squares[x] === undefined){
						squares[x] = {}
					}
					if(squares[x][y] === undefined){
						squares[x][y] = 0
					}

					if(this.astarmap[yIter] !== undefined
						&& this.astarmap[yIter][xIter] !== undefined)
					{
						this.astarmap[yIter][xIter] = 0
					}
				}else{
					//walkables

					if(this.astarmap[yIter] !== undefined
						&& this.astarmap[yIter][xIter] !== undefined)
					{
						this.astarmap[yIter][xIter] = 1
					}
				}
				yIter++
			}
			xIter++
		}

		this.graphics.beginFill(this.col, 1)
		for(
			let x = mapX; 
			x < this.dimension + mapX; 
			x++)
		{
			for(
				let y = mapY; 
				y < this.dimension + mapY; 
				y++)
			{
				if(squares[x] !== undefined){
					if(squares[x][y] !== undefined){

						// if(this.neighborCount(x, y, squares) < 7){
						// 	this.room.beginFill(0x000000, 1)
						// }else{
							// this.room.beginFill(this.col, 1)
						// }

						this.paintSquare(
							(x) * this.tileSize, 
							(y) * this.tileSize, 
							this.tileSize, 
							this.tileSize)
					}
				}
			}
		}
	}

	update(){
		//update enemies
		for(let i in this.enemies){
			this.enemies[i].update()
		}
	}
}
module.exports = Room