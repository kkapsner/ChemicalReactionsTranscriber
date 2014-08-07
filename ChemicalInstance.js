var ChemicalInstance = kkjs.oo.Base.extend(function(count, name, chemicalPool, reactionOptions){
	this.count = count;
	this.chemical = chemicalPool.get(name);
	this.chemical.instances.push(this);
	if (reactionOptions){
		this.reaction = reactionOptions.reaction;
		this.isEduct = reactionOptions.isEduct;
	}
}).implement({
	count: 1,
	reaction: null,
	isEduct: false,
	chemical: null,
	toJSON: function(){
		return this.toString();
	},
	toLatex: function(){
		return this.toString();
	},
	toString: function(){
		return (this.count !== 1? this.count + " ": "") + this.chemical.name;
	},
	getFactor: function(outputType){
		if (this.count !== 1){
			switch(outputType){
				case "latex":
					return this.count.toString(10) + " \\cdot ";
				case "matlab":
				default:
					return this.count.toString(10) + " * ";
			}
		}
		else {
			return "";
		}
	},
	getDGLFactor: function(outputType){
		switch (outputType){
			case "latex":
				return this.chemical.toLatex(true) + (this.count !== 1? "^" + this.count: "");
			case "matlab":
				return this.chemical.matlabName + (this.count !== 1? "^" + this.count: "");
			default:
				return this.chemical.toString() + (this.count !== 1? "^" + this.count: "");
		}
	}
}).implementStatic({
	parse: function(str, chemicalPool, reactionOptions){
		var m = str.match(/^\s*(\d*)\s*(\D.*)\s*$/);
		if (!m){
			throw new Error("Unable to parse chemical: " + JSON.stringify(str));
		}
		else {
			var count = m[1].length? parseInt(m[1], 10): 1;
			var name = m[2];
			
			return new this(count, name, chemicalPool, reactionOptions);
		}
	}
});