var ReactionPool = (function(){
	"use strict";
	
	return Pool.extend(function(){
		this.chemicals = new MatlabNamePool(Chemical);
		this.chemicals.prefix = "c";
		this.rates = new MatlabNamePool(Rate);
		this.rates.prefix = "k";
		
		Pool.call(this, Reaction);
	}).implement({
		clear: function(){
			Pool.prototype.clear.call(this);
			this.chemicals.clear();
			this.rates.clear();
		},
		
		create: function(){
			return Pool.prototype.create.call(this, this.getAllNames().length);
		},
		
		fromJSON: function(json){
			var obj = JSON.parse(json);
			if (Array.isArray(obj)){
				return obj.map(this.fromObject, this);
			}
			else {
				return this.fromObject(obj);
			}
		},
		fromObject: function(obj){
			var reaction = this.create();
			reaction.forwardRate = this.rates.get(obj.forwardRate);
			reaction.backwardRate = this.rates.get(obj.backwardRate);
			reaction.educts = obj.educts.map(function(educt){
				return ChemicalInstance.parse(educt, this.chemicals, {reaction: reaction, isEduct: true});
			});
			reaction.products = obj.products.map(function(product){
				return ChemicalInstance.parse(product, this.chemicals, {reaction: reaction, isEduct: false});
			});
			if (obj.chainedReaction){
				reaction.chain(this.fromObject(obj.chainedReaction));
			}
			return reaction;
		},
		buildSingle: function(educts, reactionType, products){
			var reaction = this.create();
			reaction.educts = this.parseChemicalList(educts, {reaction: reaction, isEduct: true});
			
			var reactionMatch = reactionType.match(/^\s*(<?)\s*(?:\[([^\]]*)\])?\s*([=\-])\s*(?:\[([^\]]*)\])?\s*(>?)\s*$/);
			if (reactionMatch){
				switch (reactionMatch[1] + reactionMatch[3] + reactionMatch[5]){
					case "->":
						reaction.forwardRate = this.rates.get(reactionMatch[4] || 1);
						break;
					case "<-":
						reaction.backwardRate = this.rates.get(reactionMatch[2] || 1);
						break;
					case "<=>":
					case "<->":
						reaction.forwardRate = this.rates.get(reactionMatch[4] || 1);
						reaction.backwardRate = this.rates.get(reactionMatch[2] || 1);
						break;
					default:
						throw new SyntaxError("Unknown reaction type.");
				}
			}
			else {
				throw new SyntaxError("Invalid reaction type.");
			}
			reaction.products = this.parseChemicalList(products, {reaction: reaction, isEduct: false});
			
			if (arguments.length > 3){
				var newArgs = Array.prototype.slice.call(arguments, 3);
				newArgs.splice(0, 0, []);
				reaction.chain(this.buildSingle.apply(this, newArgs));
			}
			
			return reaction;
		},
		parseChemicalList: function(str, reactionOptions){
			if (!Array.isArray(str)){
				str = str.split("+");
			}
			return str.map(function(c){
				if (c.match(/<|>/)){
					throw new SyntaxError("Invalid chemical list syntax.");
				}
				else {
					return ChemicalInstance.parse(c, this.chemicals, reactionOptions);
				}
			}, this);
		},
		parse: function(str){
			var splitRegExp = /^(.*?)\s*(<\s*(?:\[[^\]]*\])?\s*[=-]\s*(?:\[[^\]]*\])?\s*>|<\s*(?:\[[^\]]*\])?\s*-|-\s*(?:\[[^\]]*\])?\s*>)\s*(.*)$/;
			var match = str.match(splitRegExp);
			if (match){
				var args = [match[1], match[2], match[3]];
				while ((match = match[3].match(splitRegExp)) !== null){
					args.splice(2, 1, match[1], match[2], match[3]);
				}
				return this.buildSingle.apply(this, args);
			}
			else {
				throw new SyntaxError("Invalid reaction syntax.");
			}
		},
		
		alignedOutput: function(){
			var reactions = this.getAll().filter(function(reaction){
				return !reaction.chainParent;
			});
			var columnCount = reactions.reduce(function(max, reaction){
				return Math.max(max, reaction.getColumnCount());
			}, 0);
			var columnWidths = [];
			for (var i = 0; i < columnCount; i += 1){
				columnWidths[i] = reactions.reduce(function(max, reaction){
					return Math.max(max, reaction.getColumn(i).length);
				}, 1);
			}
			return reactions.map(function(reaction){
				return columnWidths.map(function(width, columnIndex){
					return reaction.getColumn(columnIndex, width);
				}).join("").trim();
			}).join("\n");
		},
		
		alignedLatexOutput: function(columnCallback){
			var reactions = this.getAll().filter(function(reaction){
				return !reaction.chainParent;
			});
			var columnCount = reactions.reduce(function(max, reaction){
				return Math.max(max, reaction.getLatexColumnCount());
			}, 0);
			var columnWidths = [];
			for (var i = 0; i < columnCount; i += 1){
				columnWidths[i] = reactions.reduce(function(max, reaction){
					return Math.max(max, reaction.getLatexColumn(i).length);
				}, 1);
			}
			return reactions.map(function(reaction){
				return columnWidths.map(function(width, columnIndex){
					var col = reaction.getLatexColumn(columnIndex, width);
					if (columnCallback){
						col = columnCallback(col, columnIndex);
					}
					return col;
				}).join("").trim();
			}).join("\n");
		}
	});
}());