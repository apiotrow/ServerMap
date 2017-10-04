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

//when a player logs in
wss.on('connection', function connection(ws, req){

	// let gridW = 600
	// let gridH = 600
	// let gridD = 50
	// let gridSquGap = 0.5
	// let initData = {
	// 	header: "initData",
	// 	value: {
	// 		gridW: gridW,
	// 		gridH: gridH,
	// 		gridD: gridD,
	// 		gridSquGap: gridSquGap
	// 	}
	// }

	let gridW = 600
	let gridH = 600
	let gridD = 50
	let gridSquHoriz = gridD
	let gridSquVert = gridD
	let gridSquGap = 0.5

	let grdSquW = (gridW / gridSquHoriz) - (gridSquGap * 2)
	let grdSquH = (gridH / gridSquVert) - (gridSquGap * 2)
	let grid = []
	for(let i = 0; i < gridSquVert; i++){
		let row = []
		for(let j = 0; j < gridSquHoriz; j++){
			row.push(undefined)
		}
		grid.push(row)
	}
	
	let rowCount = 0
	let colCount
	for(let i = gridSquGap; i < gridW; i += grdSquW + (gridSquGap * 2)){
		colCount = 0
		for(let j = gridSquGap; j < gridH; j += grdSquH + (gridSquGap * 2)){
			// gridGraphics.drawRect(i, j, grdSquW, grdSquH)
			grid[rowCount][colCount] = [i, j, grdSquW, grdSquH, true]
			colCount++
		}
		rowCount++
	}

	let initData = {
		header: "initData",
		value: {
			gridW: gridW,
			gridH: gridH,
			grdSquW: grdSquW,
			grdSquH: grdSquH,
			gridSquGap: gridSquGap,
			grid: grid
		}
	}

	sendMessage(ws, JSON.stringify(initData))

	ws.on('message', function incoming(message){
		let data = JSON.parse(message)

		let header = data.header

		if(header == "changeSq"){
			let changeSq = {
				header: "changeSq",
				value: data.value
			}

			wss.clients.forEach((client) => {
				sendMessage(client, JSON.stringify(changeSq))
			})
		}


    	//message to send to player
  //   	let requestAccountData = {
		// 	header: "requestAccountData",
		// 	value: newAcctData
		// }

  //   	//send player their new account data
		// sendMessage(ws, JSON.stringify(requestAccountData))
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




