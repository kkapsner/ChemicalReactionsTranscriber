var Pool = (function(){
	"use strict";
	
	return kkjs.oo.Base.extend(function(constructor){
		this.constructor = constructor;
		this.clear();
	}).implement({
		create: function(name){
			this.instances[name] = this.constructor.poolCreate.apply(this.constructor, arguments);
			this.instances[name].pool = this;
			return this.instances[name];
		},
		get: function(name){
			if (!this.instances[name]){
				return this.create(name);
			}
			else {
				return this.instances[name];
			}
		},
		getAllNames: function(){
			return Object.keys(this.instances);
		},
		getAll: function(){
			return this.getAllNames.map(function(name){
				return this.instances[name];
			}, this);
		},
		clear: function(){
			this.instances = {};
		}
	});
}());