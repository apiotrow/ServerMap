
class Grid{
	constructor(app, gridW, gridH){

		//separate graphics object for each square, or a single one for all.
		//false: good framerate when grid static, severe drop when editing.
		//true: poor framerate when grid static, small drop when editing
		const separate = false

		//whether to convert grid object into a sprite.
		//only usable with separate = false
		const renderAsTexture = false

		let gridGraphics
		if(!separate){
			gridGraphics = new PIXI.Graphics()
			gridGraphics.beginFill(0xFF3300)
			if(!renderAsTexture)
				app.stage.addChild(gridGraphics)
		}

		let gridD = 50
		let gridSquHoriz = gridD
		let gridSquVert = gridD
		let gridSquGap = 0.5
		let grdSquW = (gridW / gridSquHoriz) - (gridSquGap * 2)
		let grdSquH = (gridH / gridSquVert) - (gridSquGap * 2)
		this.grid = []
		for(let i = 0; i < gridSquVert; i++){
			let row = []
			for(let j = 0; j < gridSquHoriz; j++){
				row.push(undefined)
			}
			this.grid.push(row)
		}
		let rowCount = 0
		let colCount

		for(let i = gridSquGap; i < gridW; i += grdSquW + (gridSquGap * 2)){
			colCount = 0
			for(let j = gridSquGap; j < gridH; j += grdSquH + (gridSquGap * 2)){

				if(separate){
					let squ = new PIXI.Graphics()
					squ.beginFill(0xFF3300)
					squ.drawRect(i, j, grdSquW, grdSquH)
					app.stage.addChild(squ)
					this.grid[rowCount][colCount] = squ
					colCount++
				}else if(!separate){
					gridGraphics.drawRect(i, j, grdSquW, grdSquH)
					this.grid[rowCount][colCount] = [i, j, grdSquW, grdSquH, true]
					colCount++
				}

			}
			rowCount++
		}

		if(renderAsTexture){
			let te = app.renderer.generateTexture(gridGraphics)
			this.sprite = new PIXI.Sprite(te)
			app.stage.addChild(this.sprite)
		}

		this.hoverX = -1
		this.hoverY = -1
		this.mouseDown = false
		app.stage.interactive = true
		app.stage.on('mousemove', (event)=>{
			this.hoverX = Math.floor(event.data.global.x / (grdSquW + (gridSquGap * 2)))
			this.hoverY = Math.floor(event.data.global.y / (grdSquH + (gridSquGap * 2)))
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

		let callUpdate = ()=> {

			this.update(separate, gridGraphics, app, renderAsTexture)
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()
	}

	update(separate, gridGraphics, app, renderAsTexture){
		let hoveredSqu

		if(this.grid[this.hoverY] !== undefined && this.grid[this.hoverY][this.hoverX] !== undefined){
			if(this.mouseDown){
				if(separate){
					hoveredSqu = this.grid[this.hoverX][this.hoverY]
					hoveredSqu.clear()
				}else if(!separate){
					gridGraphics.clear()
					gridGraphics.beginFill(0xFF3300)
					hoveredSqu = this.grid[this.hoverX][this.hoverY]

					hoveredSqu[4] = false

					let x = hoveredSqu[0]
					let y = hoveredSqu[1]
					let grdSquW = hoveredSqu[2]
					let grdSquH = hoveredSqu[3]

					for(let i = 0; i < this.grid.length; i++){
						for(let j = 0; j < this.grid[i].length; j++){

							let sq = this.grid[i][j]

							if(sq[4] == false)
								continue

							let x = sq[0]
							let y = sq[1]
							let grdSquW = sq[2]
							let grdSquH = sq[3]

							gridGraphics.drawRect(x, y, grdSquW, grdSquH)
						}
					}

					if(renderAsTexture){
						let te = app.renderer.generateTexture(gridGraphics)
						this.sprite.texture = te
					}
				}
			}
		}
	}
}

module.exports = Grid