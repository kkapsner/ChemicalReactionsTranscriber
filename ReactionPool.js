var ReactionPool = (function(){
	"use strict";
	
	return Pool.extend(function(){
		Pool.call(this, Reaction);
		
		this.chemicals = new MatlabNamePool(Chemical);
		this.chemicals.prefix = "c";
		this.rates = new MatlabNamePool(Rate);
		this.rates.prefix = "k";
	}).implement({
		clear: function(){
			Pool.prototype.clear.call(this);
			this.chemicals.clear();
			this.rates.clear();
		}
	});
}());