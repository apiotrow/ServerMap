
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

		console.log(this.grid)

		//get grid data from server
		let gridSW = initData.gridSW
		let gridSH = initData.gridSH
		let gridSGap = initData.gridSGap
		this.color = initData.color
		this.virginColor = initData.virginColor

		//render grid
		this.updateGrid(gridGraphics)

		//setup inputs
		this.hoverX = -1
		this.hoverY = -1
		this.mouseDown = false
		this.suppressClick = false //prevent click from deleting square
		app.stage.interactive = true
		app.stage.on('mousemove', (event)=>{
			this.hoverX = Math.floor(event.data.global.x / (gridSW + (gridSGap * 2)))
			this.hoverY = Math.floor(event.data.global.y / (gridSH + (gridSGap * 2)))
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

		//start update loop
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
			if(data.header == "resetGame"){
				let resetData = data.value

				//prevent square in new game from getting deleted
				//by click that started in previous game
				this.suppressClick = true

				//set grid information to new info
				gridSW = resetData.gridSW
				gridSH = resetData.gridSH
				gridSGap = resetData.gridSGap
				this.grid = resetData.grid

				//render new grid
				this.updateGrid(gridGraphics)
			}

		    //change squares that other players have changed
			if(data.header == "changeS"){
				//set changed square
				let gridX = data.value.gridX
				let gridY = data.value.gridY
				let color = data.value.color

				this.grid[gridX][gridY][4] = color

				//render updated grid
				this.updateGrid(gridGraphics)
			}
		})
	}

	//erase and redraw grid
	updateGrid(gridGraphics){
		gridGraphics.clear()
		// gridGraphics.beginFill(this.color)

		for(let i = 0; i < this.grid.length; i++){
			for(let j = 0; j < this.grid[i].length; j++){
				//square for this iteration
				let S = this.grid[i][j]

				//if square isn't supposed to be rendered, skip it
				// if(S[4] == false)
				// 	continue

				//render square
				let x = S[0]
				let y = S[1]
				let gridSW = S[2]
				let gridSH = S[3]
				let color = S[4]

				gridGraphics.beginFill(color)
				gridGraphics.drawRect(x, y, gridSW, gridSH)
			}
		}

		if(this.suppressClick){
			//remove if-then clause around this to disallow
			//drag-removing of squares
			this.mouseDown = false
			
			//reset click suppressor
			this.suppressClick = false
		}
	}

	update(gridGraphics, app){
		//if mouse is over a square
		if(this.grid[this.hoverY] !== undefined 
			&& this.grid[this.hoverY][this.hoverX] !== undefined)
		{
			//on mouse click, change square color
			if(this.mouseDown){
				//square being hovered over
				let hoveredS = this.grid[this.hoverX][this.hoverY]

				//let server know we changed a square.
				//only attempt this if square isn't already changed
				if(hoveredS[4] == this.virginColor){
					//square to change
					let changeS = {
						header: "changeS",
						value: {
							gridX: this.hoverX,
							gridY: this.hoverY,
							color: this.color
						}
					}

					//notify server
					this.ws.send(JSON.stringify(changeS))
				}
			}
		}
	}
}

module.exports = Grid