let Tone = require('tone')

class Music{
	
	constructor(){
		var synthBass = new Tone.Synth({
			"oscillator" : {
				"type" : "square"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.2,
				"sustain" : 0.2,
				"release" : 0.2,
			}
		}).toMaster()

		new Tone.Loop((time)=>{
	      	synthBass.triggerAttackRelease("c4", "2n", time);
	    }, this.randInterval()).start(1)

		new Tone.Loop((time)=>{
	      	synthBass.triggerAttackRelease(this.randNote(), '8n', time);
	    }, this.randInterval()).start(1)

	    new Tone.Loop((time)=>{
	      	synthBass.triggerAttackRelease(this.randNote(), '1n', time);
	    }, this.randInterval()).start(1)


		Tone.Transport.start()
	}

	randInterval(){
		return (Math.floor(Math.random() * 8) + 1) + "n"
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