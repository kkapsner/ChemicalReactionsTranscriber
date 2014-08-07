var Rate = (function(){
	"use strict";
	
	return Poolable.extend(function(name){
		if (name !== 1){
			name = name.trim();
			this.name = name;
			this.subscript = name.replace(/^[^_]+_?/, "");
		}
	}).implement({
		name: "",
		matlabName: "",
		subscript: "",
		
		toString: function(){
			return this.name;
		},
		toJSON: function(){
			return this.toString();
		},
		toLatex: function(){
			if (this.subscript){
				return "\\rate{" + this.subscript + "}";
			}
			else {
				return this.name;
			}
		},
		toMatlab: function(){
			return this.matlabName;
		},
		getFactor: function(outputType){
			if (this.name){
				switch (outputType){
					case "latex":
						return this.toLatex();
					case "matlab":
						return this.toMatlab() + " * ";
					default:
						return this.toString() + " * ";
				}
			}
			else {
				return "";
			}
		}
	});
}());