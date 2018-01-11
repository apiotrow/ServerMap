let Tone = require('tone')


class Music{
	constructor(){
    	this.bass = new Tone.Sampler({
	      "C4":"./js/bass.mp3"
	    }, ()=>{
	    	this.createHit(this.bass)
	    }).toMaster()

	 	// this.banjo = new Tone.Sampler({
	  //     "C4":"./js/banjo.mp3"
	  //   }, ()=>{
	  //   	this.createHit(this.banjo)
	  //   }).toMaster()

	    this.piano = new Tone.Sampler({
	      "C4":"./js/piano.mp3"
	    }, ()=>{
	    	this.createHit(this.piano)
			this.createHit(this.piano)
			this.createHit(this.piano)
	    }).toMaster()


		

		// Tone.Transport.start()
	}

	update(){
		// try{
		// 	// this.piano.triggerAttack("C4")
		// }catch(e){

		// }
	}

	randInterval(){
		return (Math.floor(Math.random() * 5) + 3) + "n"
	}

	createHit(instrument){
		var synthBass = new Tone.Synth({
			"oscillator" : {
				"type" : "triangle" //sine, square, sawtooth, triangle
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.2,
				"sustain" : 0.2,
				"release" : 0.2,
			}
		}).toMaster()

		let randNote = this.randNote()
		let randInterval = this.randInterval()

		new Tone.Loop((time)=>{
			// instrument.triggerAttack()
	      	instrument.triggerAttackRelease(this.randNote(), "2n", time);
	    }, randInterval).start(1)
	}

	randNote(){
		let notes = ["A", "B", "C", "D", "E", "F", "G"]

		let sharp
		if(Math.random() < 0.5)
			sharp = "#"
		else
			sharp = ""

		return notes[Math.floor(Math.random() * notes.length)] + sharp + 
		+ (Math.floor(Math.random() * 8) + 1)
	}
}
module.exports = Music