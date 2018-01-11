let Tone = require('tone')


class Music{
	
	constructor(){

		// var tune = new Tune()
		// console.log(tune)
		// tune.loadScale('mean19')
		// tune.tonicize(220)
		// tune.mode.output = 'ratio'
		// var note = tune.note(2)


	    var random = function(limit,limit2) {
	      if (limit2) {
	        return Math.floor(Math.random() * (limit2-limit)) + limit
	      } else {
	        return Math.floor(Math.random() * limit)
	      }
	    }


		// // // Create a new Tune object
	    var tune = new Tune();
	    tune.mode.output = 'MIDI'
	 //    // Load a 12 tone just intonation scale
	    tune.loadScale('young-lm_piano');
	    
	 //    /* WEB AUDIO SETUP */
	 //    var actx = new (AudioContext || wedkitAudioContext)();

	 //    var osc = actx.createOscillator()
	 //    var vol = actx.createGain()
	 //    var echo = actx.createDelay()
	 //    echo.delayTime.value = 0.3
	 //    vol.gain.value = 0.5
	 //    osc.type = "triangle"
	 //    osc.connect(actx.destination)
	 //    echo.connect(vol)
	 //    // osc.start()

	 //    /* PLAYING NOTES */
	 //    let changeNote = function() {
	      var step = random(tune.scale.length)
	      var octave = random(-3,2)
	      var newFreq = tune.note( step, octave )
	 //      osc.frequency.setValueAtTime( newFreq, actx.currentTime)
	 //    }
	 //    setInterval(changeNote, 50)

    



	    this.piano = new Tone.Sampler({
	      "C4":"./js/mandolin.mp3"
	    }, ()=>{
	    	this.createHit()
			this.createHit()
			this.createHit()

	    	console.log(this.piano.pitch)
	    	this.piano.triggerAttack("C4")
	    	this.piano.pitch -= 4
	    	// this.piano.triggerAttack("C4")
	    })
	    this.piano.toMaster()
	    console.log(this.piano)

	 //    let buffer = new Tone.Buffer("./js/c4.mp3", function(){
		// 	//the buffer is now available.
		// 	var buff = buffer.get();
		// 	// console.log(buff)
		// })
		

// Tone.Sampler.on('load', ()=>{
// 	console.log(this.piano)
// 	    // new Tone.Loop((time)=>{
// 	      	this.piano.triggerAttack("C4")
// 	    // }, "3n").start(1)

// 	    // new Tone.Loop((time)=>{
// 	    //   	synthBass.triggerAttackRelease(this.randNote(), "2n", time);
// 	    // }, randInterval).start(1)
// })


		


		Tone.Transport.start()
	}

	update(){
		// try{
		// 	// this.piano.triggerAttack("C4")
		// }catch(e){

		// }
	}

	randInterval(){
		return (Math.floor(Math.random() * 4) + 1) + "n"
	}

	createHit(){
		var synthBass = new Tone.Synth({
			"oscillator" : {
				"type" : "sine" //sine, square, sawtooth, triangle
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
	      	this.piano.triggerAttackRelease(randNote, "2n", time);
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