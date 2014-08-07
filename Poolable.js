var Poolable = (function(){
	"use strict";
	
	return kkjs.oo.Base.extend(function(name){
		this.name = name;
	}).implementStatic({
		poolCreate: function(name){
			return new this(name);
		}
	});
}());