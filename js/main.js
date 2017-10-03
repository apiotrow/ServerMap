document.addEventListener('DOMContentLoaded', function () {
	let PIXI = require('pixi.js')

	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST //makes text sharper
	let gameView = document.getElementById('game')
	// var app = new PIXI.Application(800, 600, {view: myView, antialias: false});

	let gridW = 600
	let gridH = 600
	let app = new PIXI.Application(gridW, gridH, 
	{
		antialias: false, 
		// forceCanvas: true,
		backgroundColor : 0xffffff,
		view: gameView
	})
	document.body.appendChild(app.view)

	// let gridGraphics = new PIXI.Graphics()
	// gridGraphics.beginFill(0xFF3300)

	let gridSquHoriz = 50
	let gridSquVert = 50
	let gridSquGap = 1
	let grdSquW = (gridW / gridSquHoriz) - (gridSquGap * 2)
	let grdSquH = (gridH / gridSquVert) - (gridSquGap * 2)
	let grid = []
	for(let i = 0; i < gridSquVert; i++){
		let row = []
		for(let j = 0; j < gridSquHoriz; j++){
			row.push(undefined)
		}
		grid.push(row)
	}
	let rowCount = 0
	let colCount
	for(let i = gridSquGap; i < gridW; i += grdSquW + (gridSquGap * 2)){
		colCount = 0

		for(let j = gridSquGap; j < gridH; j += grdSquH + (gridSquGap * 2)){
		
			let squ = new PIXI.Graphics()
			squ.beginFill(0xFF3300)
			squ.drawRect(i, j, grdSquW, grdSquH)
			app.stage.addChild(squ)
			// grid[rowCount][colCount] = j + "," + i + "," + (j + grdSquW)
			grid[rowCount][colCount] = squ

			colCount++
		}

		rowCount++
	}
	console.log(grid)

	// app.stage.addChild(gridGraphics)

	this.hoverX = -1
	this.hoverY = -1
	app.stage.interactive = true
	app.stage.on('mousemove', (event)=>{
		this.hoverX = Math.floor(event.data.global.x / (grdSquW + (gridSquGap * 2)))
		this.hoverY = Math.floor(event.data.global.y / (grdSquH + (gridSquGap * 2)))
	})
	window.addEventListener('mousedown', (event)=>{
		console.log("s")
	})

	let callUpdate = ()=> { 
		update()
	}
	let ticker = PIXI.ticker.shared
	ticker.add(callUpdate)
	ticker.start()

	update = ()=>{
		let hoveredSqu
		if(grid[this.hoverY] !== undefined && grid[this.hoverY][this.hoverX] !== undefined){

			hoveredSqu = grid[this.hoverX][this.hoverY]
			hoveredSqu.clear()
		}
	}
})