let Grid = require('./Grid.js')

//for development. causes changes to server.js to reload browser
let server
var isNode = new Function("try {return this===global;}catch(e){return false;}")
if(isNode())
	server = require('../server.js')

document.addEventListener('DOMContentLoaded', function () {
	let PIXI = require('pixi.js')

	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST //makes text sharper
	let gameView = document.getElementById('game')
	// var app = new PIXI.Application(800, 600, {view: myView, antialias: false}

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

			let grids = new Grid(app, initData, this.ws)
		}

		// if(data.header == "changeSq"){
		// 	console.log("chs")
		// }
	}
})