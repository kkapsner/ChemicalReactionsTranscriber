var Pool = (function(){
	"use strict";
	
	return kkjs.oo.Base.extend(function(pooledConstructor){
		this.pooledConstructor = pooledConstructor;
		this.clear();
	}).implement({
		preprocessName: function(name){
			return name.toString().trim();
		},
		create: function(name){
			name = this.preprocessName(name);
			this.instances[name] = this.pooledConstructor.poolCreate.apply(this.pooledConstructor, arguments);
			this.instances[name].pool = this;
			return this.instances[name];
		},
		get: function(name){
			name = this.preprocessName(name);
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
			return this.getAllNames().map(function(name){
				return this.instances[name];
			}, this);
		},
		clear: function(){
			this.instances = {};
		}
	});
}());