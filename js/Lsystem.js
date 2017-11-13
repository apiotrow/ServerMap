let LsystemRules = require('./LsystemRules.js')

class Lsystem{
	constructor(seed, rule){
		this.rule = LsystemRules.getRule(rule)
		this.lstring = this.getStepAtDepth(seed, 10)
	}

	getLString(){
		return this.lstring
	}

	genNextStep(string){
		let nextStep = ""

		for(let i = 0; i < string.length; i++){
			nextStep += this.rule[string[i]]
		}

		return nextStep
	}

	getStepAtDepth(string, depth){
		for(let i = 0; i < depth; i++){
			string = this.genNextStep(string)
		}

		return string
	}
}

module.exports = Lsystem