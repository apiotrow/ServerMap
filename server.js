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

//when a player logs in
wss.on('connection', function connection(ws, req){

	//send initial data
	let gridW = 600
	let gridH = 600
	let gridD = 2
	let gridSHoriz = gridD
	let gridSVert = gridD
	let gridSGap = 0.5

	let grdSW = (gridW / gridSHoriz) - (gridSGap * 2)
	let grdSH = (gridH / gridSVert) - (gridSGap * 2)
	let grid = []
	for(let i = 0; i < gridSVert; i++){
		let row = []
		for(let j = 0; j < gridSHoriz; j++){
			row.push(undefined)
		}
		grid.push(row)
	}
	
	let rowCount = 0
	let colCount
	for(let i = gridSGap; i < gridW; i += grdSW + (gridSGap * 2)){
		colCount = 0
		for(let j = gridSGap; j < gridH; j += grdSH + (gridSGap * 2)){
			grid[rowCount][colCount] = [i, j, grdSW, grdSH, true]
			colCount++
		}
		rowCount++
	}

	let initData = {
		header: "initData",
		value: {
			gridW: gridW,
			gridH: gridH,
			grdSW: grdSW,
			grdSH: grdSH,
			gridSGap: gridSGap,
			grid: grid
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

			//if player is allowed, change square and notify all clients
			if(grid[gridX][gridY][4] == true){
				grid[gridX][gridY][4] = false

				let changeS = {
					header: "changeS",
					value: data.value
				}

				wss.clients.forEach((client) => {
					sendMessage(client, JSON.stringify(changeS))
				})

				//add to squares gone count
				squaresGone++

				//if all squares are gone, reset game
				if(squaresGone == gridD * gridD){
					console.log("done")

					squaresGone = 0
					for(let i = 0; i < grid.length; i++){
						for(let j = 0; j < grid[i].length; j++){
							grid[i][j][4] = true
						}
					}

					let resetGame = {
						header: "resetGame",
						value: grid
					}
					wss.clients.forEach((client) => {
						sendMessage(client, JSON.stringify(resetGame))
					})
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




