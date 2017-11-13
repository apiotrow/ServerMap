class LsystemRules{
	static getRule(ruleName){
	  return this[ruleName]()
	}

	static one(){
		return {
			a: "b",
			b: "bab"
		}
	}
}
module.exports = LsystemRules