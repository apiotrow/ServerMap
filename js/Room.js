let SimplexNoise = require('simplex-noise')
let easystarjs = require('easystarjs')
let colorconvert = require('color-convert')

class Room{
	constructor(mapContainer, renderer){
		this.mapContainer = mapContainer

		this.graphics = new PIXI.Graphics()

		this.mapContainer.addChild(this.graphics)

		//size of each square
		this.tileSize = 10

		//width/height map needs to be to completely fill canvas
		this.dimension = this.worldToTile(renderer.width)

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
		this.simplex = new SimplexNoise(()=>{return 0.38})

		this.divisor = 36 

		this.threshold = -.15
	}

	worldToTile(world){
		return Math.floor(world / this.tileSize)
	}
}
module.exports = Room