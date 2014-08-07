var Chemical = kkjs.oo.Base.extend(function(name){
	name = name.trim();
	if (Chemical.all.hasOwnProperty(name)){
		return Chemical.all[name];
	}
	else {
		this.name = name;
		this.matlabName = "m" + name.replace(/[^a-z0-9]/ig, "_");
		this.instances = [];
		Chemical.all[name] = this;
	}
}).implement({
	toLatex: function(outsideReaction){
		if (!outsideReaction){
			return this.toString();
		}
		else {
			return "\\conc{" + this.toString() + "}";
		}
	},
	getDGL: function(){
		var str = "d" + this + " = ";
		str += this.instances.map(function(instance){
			var str = "";
			if (instance.reaction.forwardRate){
				str += instance.isEduct? " - ": " + ";
				if (instance.count > 1){
					str += instance.count + " * ";
				}
				if (instance.reaction.forwardRate !== 1){
					str += instance.reaction.forwardRate + " * ";
				}
				str += instance.reaction.educts.map(function(educt){
					return educt.getDGLFactor();
				}).join(" * ")
			}
			if (instance.reaction.backwardRate){
				str += instance.isEduct? " + ": " - ";
				if (instance.count > 1){
					str += instance.count + " * ";
				}
				if (instance.reaction.backwardRate !== 1){
					str += instance.reaction.backwardRate + " * ";
				}
				str += instance.reaction.products.map(function(product){
					return product.getDGLFactor();
				}).join(" * ")
			}
			return str;
		}).join("");
		
		return str;
	},
	getMatlabDGL: function(){
		var str = "d" + this.matlabName + " = ...\n\t";
		str += this.instances.map(function(instance){
			var str = "";
			if (instance.reaction.forwardRate){
				str += instance.isEduct? " - ": " + ";
				if (instance.count > 1){
					str += instance.count + " * ";
				}
				if (instance.reaction.forwardRate !== 1){
					str += instance.reaction.forwardRate.matlabName + " * ";
				}
				str += instance.reaction.educts.map(function(educt){
					return educt.getMatlabDGLFactor();
				}).join(" * ")
			}
			if (instance.reaction.backwardRate){
				str += instance.isEduct? " + ": " - ";
				if (instance.count > 1){
					str += instance.count + " * ";
				}
				if (instance.reaction.backwardRate !== 1){
					str += instance.reaction.backwardRate.matlabName + " * ";
				}
				str += instance.reaction.products.map(function(product){
					return product.getMatlabDGLFactor();
				}).join(" * ")
			}
			return str;
		}).join(" ...\n\t");
		
		return str + ";";
	},
	getLatexDGL: function(){
		var str = "\\frac{d" + this.toLatex(true) + "}{dt} = \n";
		str += this.instances.map(function(instance){
			var str = "";
			if (instance.reaction.forwardRate){
				str += "\t" + (instance.isEduct? "- ": "+ ");
				if (instance.count > 1){
					str += instance.count + " \\cdot ";
				}
				if (instance.reaction.forwardRate !== 1){
					str += instance.reaction.forwardRate.toLatex();
				}
				str += instance.reaction.educts.map(function(educt){
					return educt.getLatexDGLFactor();
				}).join("") + "\n";
			}
			if (instance.reaction.backwardRate){
				str += "\t" + (instance.isEduct? "+ ": "- ");
				if (instance.count > 1){
					str += instance.count + " \\cdot ";
				}
				if (instance.reaction.backwardRate !== 1){
					str += instance.reaction.backwardRate.toLatex();
				}
				str += instance.reaction.products.map(function(product){
					return product.getLatexDGLFactor();
				}).join("") + "\n";
			}
			return str;
		}).join("");
		
		return str;
	},
	toString: function(){
		return this.name;
	},
	toJSON: function(){
		return this.toString();
	}
}).implementStatic({
	all: {},
	clear: function(){
		this.all= {};
	}
});