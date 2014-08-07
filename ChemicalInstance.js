var ChemicalInstance = kkjs.oo.Base.extend(function(count, name, reactionOptions){
	this.count = count;
	this.chemical = new Chemical(name);
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
	getDGLFactor: function(){
		return this.chemical.toString() + (this.count !== 1? "^" + this.count: "")
	},
	getLatexDGLFactor: function(){
		return this.chemical.toLatex(true) + (this.count !== 1? "^" + this.count: "")
	},
	getMatlabDGLFactor: function(){
		return this.chemical.matlabName + (this.count !== 1? "^" + this.count: "")
	}
}).implementStatic({
	parse: function(str, reactionOptions){
		var m = str.match(/^\s*(\d*)\s*(\D.*)\s*$/);
		if (!m){
			throw new Error("Unable to parse chemical: " + JSON.stringify(str));
		}
		else {
			var count = m[1].length? parseInt(m[1], 10): 1;
			var name = m[2];
			
			return new this(count, name, reactionOptions);
		}
	}
});