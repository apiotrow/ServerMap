let SimplexNoise = require('simplex-noise')
let easystarjs = require('easystarjs')
let colorconvert = require('color-convert')
var seedrandom = require('seedrandom')

class Room{
	constructor(mapContainer, renderer, tileSize, dimension, x, y, seed){
		this.mapContainer = mapContainer
		this.renderer = renderer

		this.x = x
		this.y = y

		this.graphics = new PIXI.Graphics()

		this.mapContainer.addChild(this.graphics)

		//random color for map
		this.rand360 = Math.floor(Math.random() * 360)
		this.randColChange = 0.7

		//size of each square
		this.tileSize = tileSize

		//width/height of map
		this.dimension = dimension

		this.astarmap = []
		for(let x = 0; x < this.dimension; x++){
			let aStarMapCol = []
			for(let y = 0; y < this.dimension; y++){
				aStarMapCol.push(0)
			}
			this.astarmap.push(aStarMapCol)
		}
		this.es = new easystarjs.js()
		this.es.setAcceptableTiles(1)
		this.es.enableDiagonals()
		this.es.disableCornerCutting()
		this.es.setGrid(this.astarmap)


		// this.simplex = new SimplexNoise(Math.random)
		this.simplex = new SimplexNoise(()=>{return parseFloat("." + seed)})
		// this.simplex = new SimplexNoise(()=>{return 0.45})

		this.divisor = 36 

		this.threshold = -.15

		this.changer = Math.floor(seedrandom(seed)() * 10) + 1
	}

	worldToTile(world){
		return Math.floor(world / this.tileSize)
	}

	paintSquare(x, y, w, h){
		this.graphics.drawRect(x, y, w, h)
	}

	zoom(amt){
		this.tileSize += amt
		this.dimension = Math.floor(this.renderer.width / this.tileSize)

		//remake astar map since we just changed size of map
		this.astarmap = []
		for(let x = 0; x < this.dimension; x++){
			let aStarMapCol = []
			for(let y = 0; y < this.dimension; y++){
				aStarMapCol.push(0)
			}
			this.astarmap.push(aStarMapCol)
		}
	}

	update(mapXOffset, mapYOffset, playerX, playerY){
		this.graphics.clear()

		if(this.rand360 <= 0){
			if(this.randColChange < 0)
				this.randColChange = -this.randColChange
		}else if(this.rand360 >= 360){
			if(this.randColChange > 0)
				this.randColChange = -this.randColChange
		}
		this.rand360 += this.randColChange
		let col = "0x" + colorconvert.hsl.hex(this.rand360, 100, 50)
		this.graphics.beginFill(col, 1)

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
				// let noise = this.simplex.noise2D(
				// 	(x + this.x + mapXOffset) / (this.divisor / 1), 
				// 	(y + this.y + mapYOffset) / (this.divisor / 1))

				// let noise2 = this.simplex.noise2D(
				// 	(x + this.x + mapXOffset) / (this.divisor / this.changer), 
				// 	(y + this.y + mapYOffset) / (this.divisor / this.changer))

				let noise = this.simplex.noise2D(
					(x + mapXOffset) / (this.divisor / 1), 
					(y + mapYOffset) / (this.divisor / 1))

				let noise2 = this.simplex.noise2D(
					(x + mapXOffset) / (this.divisor / this.changer), 
					(y + mapYOffset) / (this.divisor / this.changer))

				noise = (noise + (noise2)) / 2

				if(noise < this.threshold){
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

		this.graphics.beginFill(col, 1)
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
							// this.room.beginFill(col, 1)
						// }

						this.paintSquare(
							x * this.tileSize, 
							y * this.tileSize, 
							this.tileSize, 
							this.tileSize)
					}
				}
			}
		}

		//render player
		this.graphics.beginFill(0xffffff, 1)
		this.paintSquare(
			playerX, 
			playerY, 
			this.tileSize, 
			this.tileSize)
	}
}
module.exports = Room