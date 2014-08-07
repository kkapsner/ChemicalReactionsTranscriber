var MatlabNamePool = (function(){
	"use strict";
	
	var matlabReplaces = {
		"+": "plus",
		"-": "minus",
		" ": "",
		".": ""
	};
	
	return Pool.extend().implement({
		prefix: "m",
		create: function(name){
			var matlabName = this.nameToMatlab(name);
			var instance = Pool.prototype.create.call(this, name);
			instance.matlabName = matlabName;
			return instance;
		},
		getAllMatlabNames: function(){
			return this.getAllNames.map(function(name){
				return this.get(name).matlabName;
			}, this);
		},
		
		nameToMatlab: function(name){
			var matlabName = name.toString().replace(/[^a-z0-9]/ig, function(m){
				return matlabReplaces[m] || "_";
			});
			
			if (!matlabName.match(/^[a-z0-9]/i)){
				matlabName = this.prefix + matlabName;
			}
			
			var compeatingNames = this.getAllMatlabNames().filter(function(name){
				return name.indexOf(matlabName) === 0;
			});
			
			while (compeatingNames.some(function(name){
				return name === matlabName;
			})){
				matlabName += "_";
			}
			
			return matlabName;
		}
	});
}());