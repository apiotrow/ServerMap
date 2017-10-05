let Grid = require('./Grid.js')

class Bot{
	constructor(){
		this.game

		let grid
		let rand1
		let rand2

		let renderBotCanvas = false

		this.ws = new WebSocket("ws://127.0.0.1:5000/")
		this.ws.onmessage = (event)=> {
			let data = JSON.parse(event.data)
			if(data.header == "initData"){
				let initData = data.value
				let gridW = initData.gridW
				let gridH = initData.gridH

				let app = undefined
				if(renderBotCanvas){
					app = new PIXI.Application(gridW, gridH, 
					{
						antialias: false, 
						forceCanvas: true, //can't render a ton of WebGL contexts
						backgroundColor : 0xffffff,
					})
					document.body.appendChild(app.view)
				}

				this.game = new Grid(initData, this.ws, app)
				rand1 = Math.floor(Math.random() * this.game.grid.length)
				rand2 = Math.floor(Math.random() * this.game.grid.length)
				this.game.paintSquare(rand1, rand2)
			}
		}

		setInterval(() => {
			if(this.ws.readyState === this.ws.OPEN){
				//all possible spaces near square
				let options = []
				options.push([rand1 + 1, rand2 + 1])
				options.push([rand1 + 1, rand2 - 1])
				options.push([rand1 - 1, rand2 - 1])
				options.push([rand1 - 1, rand2 + 1])
				options.push([rand1, rand2 + 1])
				options.push([rand1 + 1, rand2])
				options.push([rand1 + 1, rand2 - 1])
				options.push([rand1 - 1, rand2])

				//flag for if bot paints itself into a corner
				let stuck = true

				//choose a random square nearby to paint
				while(options.length > 0){
					//choose a random square from options
					let randIndex = Math.floor(Math.random() * options.length)
					let rand = options[randIndex]

					//remove the entry from options
					options.splice(randIndex, 1)

					//only paint if square is in bounds and not a virgin
					if(
						!(rand[0] < 0 )
						&& !(rand[1] < 0)
						&& !(rand[0] > this.game.grid.length - 1)
						&& !(rand[1] > this.game.grid.length - 1)
						&& this.game.grid[rand[0]][rand[1]][4] == this.game.virginColor
						)
					{
						rand1 = rand[0]
						rand2 = rand[1]

						//paint square
						this.game.paintSquare(rand1, rand2)

						//reset false flag
						stuck = false

						//stop this loop since space was found
						break
					}
				}

				//if no virgin spaces nearby, relocate to a random one
				if(stuck){
					//holder for all virgin spaces
					let virgins = []
					for(let i = 0; i < this.game.grid.length; i++){
						for(let j = 0; j < this.game.grid[i].length; j++){
							if(this.game.grid[i][j][4] == this.game.virginColor){
								virgins.push([i, j])
							}
						}
					}
					//get a random virgin space
					let randVirgin = virgins[Math.floor(Math.random() * virgins.length)]

					rand1 = randVirgin[0]
					rand2 = randVirgin[1]

					//paint square
					this.game.paintSquare(randVirgin[0], randVirgin[1])
				}
			}
		}, (Math.random() * 200) + 10)
	}
}

module.exports = Bot