var Chemical = Poolable.extend(function(name){
	this.name = name;
	this.instances = [];
}).implement({
	toLatex: function(outsideReaction){
		if (!outsideReaction){
			return this.toString();
		}
		else {
			return "\\conc{" + this.toString() + "}";
		}
	},
	toMatlab: function(){
		return this.matlabName;
	},
	getDGL: function(outputType){
		var diff, eq, multiplication, indent, newLine, end;
		switch (outputType){
			case "latex":
				diff = "\\frac{d" + this.toLatex(true) + "}{dt}";
				eq = " = &";
				multiplication = "";
				indent = "\t";
				newLine = "\n";
				end = "";
				break;
			case "matlab":
				diff = "d" + this.matlabName;
				eq = " = ";
				multiplication = " * ";
				indent = "\t";
				newLine = " ...\n";
				end = ";";
				break;
			default:
				diff = "d" + this.toString();
				eq = " = ";
				multiplication = " * ";
				indent = "";
				newLine = "";
				end = "";
		}
		
		function process(sign, instance, rate, chemicalInstances){
			var str = indent + sign + instance.getFactor(outputType);
			if (rate.name){
				str += rate.getFactor(outputType);
			}
			str += chemicalInstances.map(function(instance){
				return instance.getDGLFactor(outputType);
			}).join(multiplication);
			
			return str;
		}
		function processReaction(reaction, isEduct, instance){
			var str = "";
			if (reaction.forwardRate){
				str += process(isEduct? " - ": " + ", instance, reaction.forwardRate, reaction.educts);
			}
			if (reaction.backwardRate){
				if (reaction.forwardRate){
					str += newLine;
				}
				str += process(isEduct? " + ": " - ", instance, reaction.backwardRate, reaction.products);
			}
			if (!isEduct && reaction.chainedReaction){
				str += newLine + processReaction(reaction.chainedReaction, !isEduct, instance);
			};
			
			return str;
		}
		var str = diff + eq + newLine;
		str += this.instances.map(function(instance){
			return processReaction(instance.reaction, instance.isEduct, instance);
		}).join(newLine);
		
		return str + end;
	},
	toString: function(){
		return this.name;
	},
	toJSON: function(){
		return this.toString();
	}
});