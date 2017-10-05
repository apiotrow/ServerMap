let Grid = require('./Grid.js')

class Bot{
	constructor(){
		this.game

		let grid
		let rand1
		let rand2
		let gridD

		this.ws = new WebSocket("ws://127.0.0.1:5000/")
		this.ws.onmessage = (event)=> {
			let data = JSON.parse(event.data)
			if(data.header == "initData"){
				let initData = data.value
				let gridW = initData.gridW
				let gridH = initData.gridH
				let app = new PIXI.Application(gridW, gridH, 
				{
					antialias: false, 
					forceCanvas: true, //can't render a ton of WebGL contexts
					backgroundColor : 0xffffff,
				})
				document.body.appendChild(app.view)
				this.game = new Grid(app, initData, this.ws)

				grid = this.game.grid
				gridD = grid.length
				rand1 = Math.floor(Math.random() * gridD)
				rand2 = Math.floor(Math.random() * gridD)
				this.game.paintSquare(rand1, rand2)
			}
		}

		

		setInterval(() => {
			if(this.ws.readyState === this.ws.OPEN){
				// let plusOrMinus1 = Math.random() < 0.5 ? -1 : 1
				// let plusOrMinus2 = Math.random() < 0.5 ? -1 : 1

				let options = []

				options.push([rand1 + 1, rand2 + 1])
				options.push([rand1 + 1, rand2 - 1])
				options.push([rand1 - 1, rand2 - 1])
				options.push([rand1 - 1, rand2 + 1])
				options.push([rand1, rand2 + 1])
				options.push([rand1 + 1, rand2])
				options.push([rand1 + 1, rand2 - 1])
				options.push([rand1 - 1, rand2])

				while(options.length > 0){
					let randIndex = Math.floor(Math.random() * options.length)

					let rand = options[randIndex]

					options.splice(randIndex, 1)

					if(rand[0] < 0 || rand[1] < 0
						|| rand[0] > gridD - 1
						|| rand[1] > gridD - 1){
						
					}else{
						rand1 = rand[0]
						rand2 = rand[1]


						this.game.paintSquare(rand1, rand2)
						break
					}
				}
			}
		}, 100)
	}
}

module.exports = Bot