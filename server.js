"use strict"

const express = require('express')
const SocketServer = require('ws').Server
const path = require('path')

//setup server
var http = require("http")
var app = express()
const PORT = process.env.PORT || 5000
app.use(express.static(__dirname))

// some code for possibly securing websocket further, so that someone 
// can't spoof websocket origin and DDOS attack the server.
// for this, index, assets.json, assets folder, and bundle must be in new 
// /public/game directory and index.html must have 
// <script src="/game/bundle.js"></script>.
// and all PIXI.loaders in main.js must have "/game/" prepended
// e.g. PIXI.loader.add(i, "/game/" + assets['jsons'][i]),
// app.use("/game", express.static(__dirname + '/public/game'))
// let webPageUsers = []
// app.get("/", function (req, res) {
// 	console.log("http ip: " + req.connection.remoteAddress)
// 	webPageUsers.push()
//     res.sendFile(__dirname + '/public/game/index.html')
// })

var httpserver = http.createServer(app).listen(PORT)
const wss = new SocketServer({ server: httpserver })

//count for squares
let squaresGone = 0

//game screen size
let gridW = 600
let gridH = 600

//initial grid data
let gridD = 2
let gridSGap = 0
let gridSW = (gridW / gridD) - (gridSGap * 2)
let gridSH = (gridH / gridD) - (gridSGap * 2)
//color of non-selected squares
let virginColor = 0xffffff

//grid information
let grid = []

//initialize grid
initializeGrid(gridD)

wss.on('connection', function connection(ws, req){
	//when a player logs in, send them initial game data
	let initData = {
		header: "initData",
		value: {
			gridW: gridW,
			gridH: gridH,
			gridSW: gridSW,
			gridSH: gridSH,
			gridSGap: gridSGap,
			grid: grid,
			virginColor: virginColor,

			//player's personal color
			color: '0x' + Math.floor(Math.random() * 16777215).toString(16)
		}
	}

	//send it all to client who just connected
	sendMessage(ws, JSON.stringify(initData))

	//listeners
	ws.on('message', function incoming(message){
		let data = JSON.parse(message)
		let header = data.header

		//player requesting to change a square
		if(header == "changeS"){
			let gridX = data.value.gridX
			let gridY = data.value.gridY
			let color = data.value.color

			//if player is allowed, change square and notify all clients
			if(grid[gridX][gridY][4] == virginColor){
				grid[gridX][gridY][4] = color

				//if all squares are gone, reset game
				if(squaresGone == (gridD * gridD) - 1){
					//reset squares gone counter
					squaresGone = 0

					//make grid 1 row/col larger than last
					gridD++
					gridSW = (gridW / gridD) - (gridSGap * 2)
					gridSH = (gridH / gridD) - (gridSGap * 2)

					//initialize new grid
					initializeGrid(gridD)

					//new grid data for players
					let resetGame = {
						header: "resetGame",
						value: {
							gridSW: gridSW,
							gridSH: gridSH,
							gridSGap: gridSGap,
							grid: grid
						}
					}

					//send all players new grid data
					wss.clients.forEach((client) => {
						sendMessage(client, JSON.stringify(resetGame))
					})
				//if game isn't over, just change square
				}else{
					//square to change
					let changeS = {
						header: "changeS",
						value: data.value
					}

					//notify all players of changed square
					wss.clients.forEach((client) => {
						sendMessage(client, JSON.stringify(changeS))
					})

					//add to squares gone count
					squaresGone++
				}
			}
		}
	})
})

function sendMessage(reciever, whatToSend){
	if(reciever.readyState === reciever.OPEN){
		reciever.send(whatToSend)
	}
}

function objectIsEmpty(obj){
	return (Object.keys(obj).length === 0 && obj.constructor === Object)
}

function hasProp(obj, prop){
	if(typeof obj[prop] === 'undefined'){ 
		return false
	}else if(typeof obj[prop] !== 'undefined'){
		return true
	}
}

//initialize grid data
function initializeGrid(D){
	//make sure grid is empty
	grid = []

	//create rows and columns
	for(let i = 0; i < D; i++){
		let row = []
		for(let j = 0; j < D; j++){
			row.push(undefined)
		}
		grid.push(row)
	}

	//set initial data for each square
	//(upper-left X and Y coord, length, width, and if it's selected)
	let wCount = gridSGap
	let hCount = gridSGap
	for(let i = 0; i < grid.length; i++){
		hCount = gridSGap
		for(let j = 0; j < grid[i].length; j++){
			grid[i][j] = [wCount, hCount, gridSW, gridSH, virginColor]
			hCount += gridSH + (gridSGap * 2)
		}
		wCount += gridSW + (gridSGap * 2)
	}
}




