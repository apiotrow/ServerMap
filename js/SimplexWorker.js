let SimplexNoise = require('simplex-noise')

module.exports = function (self) {
	self.addEventListener('message',function (ev){
        var startNum = parseInt(ev.data)

        console.log(startNum)
        
        setInterval(function () {
            // self.postMessage(Math.random())
        }, 500)
    })
}