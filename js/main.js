let Grid = require('./Grid.js')
let Bot = require('./Bot.js')

//for development. causes changes to server.js to reload browser
let server
var isNode = new Function("try {return this===global;}catch(e){return false;}")
if(isNode())
	server = require('../server.js')

document.addEventListener('DOMContentLoaded', function () {
	let PIXI = require('pixi.js')

	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST //makes text sharper
	let gameView = document.getElementById('game')

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
				// forceCanvas: true,
				backgroundColor : 0xffffff,
				view: gameView
			})
			document.body.appendChild(app.view)

			let game = new Grid(app, initData, this.ws)
		}
	}

	//bots
	for(let i = 0; i < 1; i++){
		let bot = new Bot()
	}
})