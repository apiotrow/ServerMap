
class Grid{
	constructor(app, initData, ws){
		//websocket
		this.ws = ws

		//setup grid graphics
		let gridGraphics
		gridGraphics = new PIXI.Graphics()
		gridGraphics.beginFill(0xFF3300)
		app.stage.addChild(gridGraphics)

		//grid positions and on/off bools
		this.grid = initData.grid

		//get grid data from server
		let grdSW = initData.grdSW
		let grdSH = initData.grdSH
		let gridSGap = initData.gridSGap

		//render grid
		this.updateGrid(gridGraphics)

		//setup inputs
		this.hoverX = -1
		this.hoverY = -1
		this.mouseDown = false
		this.suppressClick = false //prevent click from deleting square
		app.stage.interactive = true
		app.stage.on('mousemove', (event)=>{
			this.hoverX = Math.floor(event.data.global.x / (grdSW + (gridSGap * 2)))
			this.hoverY = Math.floor(event.data.global.y / (grdSH + (gridSGap * 2)))
		})
		window.addEventListener('mousedown', (event)=>{
			this.mouseDown = true
		})
		window.addEventListener('mouseup', (event)=>{
			this.mouseDown = false
		})
		window.addEventListener('mouseupoutside', (event)=>{
			this.mouseDown = false
		})

		//init update loop
		let callUpdate = ()=> {
			this.update(gridGraphics, app)
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()

		//websocket listeners
		this.ws.addEventListener("message", (event)=> {
		    let data = JSON.parse(event.data)

		    //change Sares that other players have changed
			if(data.header == "changeS"){
				let gridX = data.value.gridX
				let gridY = data.value.gridY

				this.grid[gridX][gridY][4] = false
				this.updateGrid(gridGraphics)
			}

			//change Sares that other players have changed
			if(data.header == "resetGame"){
				//prevent square in new game from getting deleted
				//by click that started in previous game
				this.suppressClick = true

				this.grid = data.value
				this.updateGrid(gridGraphics)
			}
		})
	}

	//erase and redraw grid
	updateGrid(gridGraphics){
		gridGraphics.clear()
		gridGraphics.beginFill(0xFF3300)

		for(let i = 0; i < this.grid.length; i++){
			for(let j = 0; j < this.grid[i].length; j++){

				let S = this.grid[i][j]

				if(S[4] == false)
					continue

				let x = S[0]
				let y = S[1]
				let grdSW = S[2]
				let grdSH = S[3]

				gridGraphics.drawRect(x, y, grdSW, grdSH)
			}
		}

		// if(this.suppressClick){
			//remove if-then clause around this to disallow
			//drag-removing of squares
			// this.mouseDown = false
			
			// this.suppressClick = false
		// }
	}

	update(gridGraphics, app){
		console.log(this.suppressClick)
		//if mouse is over a square
		if(this.grid[this.hoverY] !== undefined 
			&& this.grid[this.hoverY][this.hoverX] !== undefined)
		{
			if(this.mouseDown){
				let hoveredS = this.grid[this.hoverX][this.hoverY]

				//let server know we changed a square
				if(hoveredS[4] == true){
					let changeS = {
						header: "changeS",
						value: {
							gridX: this.hoverX,
							gridY: this.hoverY
						}
					}
					this.ws.send(JSON.stringify(changeS))
				}
			}
		}
	}
}

module.exports = Grid