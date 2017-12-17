let SimplexNoise = require('simplex-noise')

module.exports = function (self) {
	this.simplex = new SimplexNoise(()=>{return 0.4225526})
	this.divisor2 = 21 
	this.divisor3 = 96 
	this.divisor4 = 107



	self.addEventListener('message',function (ev){
        var data = JSON.parse(ev.data)

        let x = data.x
		let y = data.y
		let z = data.z

		this.span = data.span

		let customMeshPositions = []

    	for(let ix = x - this.span; ix < x + this.span; ix++){
			for(let iy = y - this.span; iy < y + this.span; iy++){
				for(let iz = z -this.span; iz < z + this.span; iz++){
					let noise1 = this.simplex.noise3D(
					ix, 
					iy,
					iz)
				
					let noise2 = this.simplex.noise3D(
						(ix / this.divisor2), 
						(iy / this.divisor2),
						(iz / this.divisor2))

					let noise3 = this.simplex.noise3D(
						(ix / this.divisor3), 
						(iy / this.divisor3),
						(iz / this.divisor3))

					let noise4 = this.simplex.noise3D(
						(ix / this.divisor4), 
						(iy / this.divisor4),
						(iz / this.divisor4))

					noise1 += 1
					noise2 += 1
					noise3 += 1
					noise4 += 1

					let noise = noise1 + noise2 + noise3 + noise4

					let s = noise / 8

					if(s < 0.3){
						customMeshPositions.push(ix)
						customMeshPositions.push(iy)
						customMeshPositions.push(iz)
					}
				}
			}
		}

		self.postMessage(JSON.stringify(customMeshPositions))
        
        // setInterval(function () {
        //     self.postMessage(Math.random())
        // }, 500)
    })
}