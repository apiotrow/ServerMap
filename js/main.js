let Grid = require('./Grid.js')
let Bot = require('./Bot.js')

let Lsystem = require('./Lsystem.js')
let LsystemRules = require('./LsystemRules.js')
let Game = require('./Game.js')
let Game3D = require('./Game3D.js')

//for development. causes changes to server.js to reload browser
let server
var isNode = new Function("try {return this===global;}catch(e){return false;}")
if(isNode())
	server = require('../server.js')

document.addEventListener('DOMContentLoaded', function () {
	let PIXI = require('pixi.js')
	let BABYLON = require('babylonjs')

	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST //makes text sharper
	let gameView = document.getElementById('game')






	// this.ws = new WebSocket("ws://127.0.0.1:5000/")
	// this.ws.onmessage = (event)=> {
	// 	let data = JSON.parse(event.data)

	// 	if(data.header == "initData"){
	// 		let initData = data.value

	// 		let gridW = initData.gridW
	// 		let gridH = initData.gridH
	// 		let app = new PIXI.Application(gridW, gridH, 
	// 		{
	// 			antialias: false, 
	// 			// forceCanvas: true,
	// 			backgroundColor : 0xffffff,
	// 			view: gameView
	// 		})
	// 		document.body.appendChild(app.view)

	// 		let game = new Grid(initData, this.ws, app)
	// 	}
	// }

	// // bots
	// for(let i = 0; i < 1; i++){
	// 	let bot = new Bot()
	// }







	let app = new PIXI.Application(1000, 1000, 
		{
			antialias: false, 
			// forceCanvas: true,
			backgroundColor : 0x000000,
			view: gameView
		})
		document.body.appendChild(app.view)

	let game = new Game(app, gameView)








// 	let appH = 600
// 	let appW = 600
// 	let canvas = document.getElementById("game")
// 	canvas.style.width = appW + "px"
// 	canvas.style.height = appH + "px"
// 	let engine = new BABYLON.Engine(canvas, true)
// 	engine.enableOfflineSupport = false //prevent babylon.manifest error
// 	let scene = new BABYLON.Scene(engine)
// 	let gameInstance = new Game3D(
//  		engine, canvas, scene,
//  		appW, appH)
})