let Grid = require('./Grid.js')

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

	let grids = new Grid(app, gridW, gridH)
})