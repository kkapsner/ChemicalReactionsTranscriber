var Rate = (function(){
	"use strict";
	
	return Poolable.extend(function(name){
		if (name !== 1){
			name = name.trim();
			this.name = name;
			this.subscript = name.replace(/^[^_]+_?/, "");
		}
		else {
			this.name = "";
			this.matlabName = "";
			this.subscript = "";
		}
	}).implement({
		name: "",
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
		getLatexFactor: function(){
			if (this.name !== 1){
				return this.toLatex();
			}
			else {
				return "";
			}
		},
		getMatlabFactor: function(){
			if (this.name !== 1 && this.matlabName){
				return this.matlabName + " * ";
			}
			else {
				return "";
			}
		}
	});
}());