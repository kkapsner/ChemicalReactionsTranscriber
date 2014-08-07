var Reaction = (function(){
	"use strict";
	
	return kkjs.oo.Base.extend(function(){
		this.educts = [];
		this.products = [];
		this.chainChildren = [];
	}).implement({
		forwardRate: 0,
		backwardRate: 0,
		chainParent: null,
		chainChildren: [],
		
		toJSON: function(){
			return this.toObject();
		},
		toObject: function(){
			return {
				forwardRate: this.forwardRate,
				backwardRate: this.backwardRate,
				educts: this.chainParent? null: this.educts.map(function(educt){
					return educt.toString();
				}),
				products: this.products.map(function(product){
					return product.toString();
				}),
				chainedReactions: this.chainChildren.map(function(child){
					return child.toObject();
				})
			};
		},
		toString: function(){
			var str = "";
			for (var i = 0; i < (this.chainParent? 4: 5); i += 1){
				str += this.getColumn(i);
			}
			str += this.chainChildren.join("");
			return str;
		},
		getColumnCount: function(){
			var count = this.chainParent? 4: 5;
			if (this.chainChildren.length){
				count += this.chainChildren[0].getColumnCount();
			}
			return count;
		},
		getColumn: function(columnIndex, width){
			if (Array.isArray(columnIndex)){
				return columnIndex.map(function(columnIndex){
					return this.getColumn(columnIndex, width);
				}, this).join("");
			}
			else {
				if (!width){
					width = 0; 
				}
				if (this.chainParent){
					columnIndex += 1;
				}
				switch (columnIndex){
					case 0:
						return kkjs.sprintf(
							"%-" + width + "s",
							this.educts.map(function(educt){
								return educt.toString();
							}).join(" + ")
						);
					case 1:
						if (this.backwardRate) {
							return kkjs.sprintf(
								" %" + (width? width-1: 0) + "s",
								"<[" + this.backwardRate + "]"
							);
						}
						else {
							return " ".repeat(width);
						}
					case 2:
						return (this.forwardRate && this.backwardRate)? "=": "-";
					case 3:
						if (this.forwardRate){
							return kkjs.sprintf(
								"%-" + (width? width-1: 0) + "s ",
								"[" + this.forwardRate + "]>"
							);
						}
						else {
							return " ".repeat(width);
						}
					case 4:
						return kkjs.sprintf(
							"%-" + width + "s",
							this.products.map(function(product){
								return product.toString();
							}).join(" + ")
						);
					default:
						if (this.chainChildren.length){
							return this.chainChildren[0].getColumn(columnIndex - 5, width);
						}
						else {
							return " ".repeat(width);
						}
				}
			}
		},
		
		toLatex: function(withEnvironment){
			var latex = "";
			if (withEnvironment){
				latex += "\\ch{\n";
			}
			
			var latex = "";
			for (var i = 0; i < (this.chainParent? 7: 8); i += 1){
				latex += this.getLatexColumn(i);
			}
			
			latex += this.chainChildren.map(function(child){
				return child.toLatex();
			}).join("");
			
			if (withEnvironment){
				latex += "}";
			}
			
			latex += "";
			
			return latex;
		},
		getLatexColumnCount: function(){
			var count = this.chainParent? 7: 8;
			if (this.chainChildren.length){
				count += this.chainChildren[0].getLatexColumnCount();
			}
			return count;
		},
		getLatexColumn: function(columnIndex, width){
			if (Array.isArray(columnIndex)){
				return columnIndex.map(function(columnIndex){
					return this.getLatexColumn(columnIndex, width);
				}, this).join("");
			}
			else {
				if (!width){
					width = 0; 
				}
				if (this.chainParent){
					columnIndex += 1;
				}
				switch (columnIndex){
					case 0:
						return kkjs.sprintf(
							"%-" + width + "s",
							this.educts.map(function(educt){
								return educt.toLatex();
							}).join(" + ")
						);
					case 1:
						return this.forwardRate? (this.backwardRate? " <=>": "  ->"): " <- ";
					case 2:
						return "[ ";
					case 3:
						return kkjs.sprintf(
							"%-" + width + "s",
							(this.forwardRate? this.forwardRate: this.backwardRate).toLatex()
						);
					case 4:
						return (this.forwardRate && this.backwardRate)?
							" ][ " + " ".repeat(width-4):
							" ] " + " ".repeat(width-3);
					case 5:
						if (this.forwardRate && this.backwardRate){
							return kkjs.sprintf(
								"%-" + width + "s",
								this.backwardRate.toLatex()
							);
						}
						else {
							return " ".repeat(width);
						}
					case 6:
						return (this.forwardRate && this.backwardRate)?
							" ] " + " ".repeat(width-3):
							" ".repeat(width);
					case 7:
						return kkjs.sprintf(
							"%-" + width + "s",
							this.products.map(function(product){
								return product.toString();
							}).join(" + ")
						);
					default:
						if (this.chainChildren.length){
							return this.chainChildren[0].getLatexColumn(columnIndex - 8, width);
						}
						else {
							return " ".repeat(width);
						}
				}
			}
		},
		
		chain: function(reaction){
			reaction.chainParent = this;
			reaction.educts = this.products;
			this.chainChildren.push(reaction);
		}
	}).implementStatic({
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
			var reaction = new Reaction();
			reaction.forwardRate = new Rate(obj.forwardRate);
			reaction.backwardRate = new Rate(obj.backwardRate);
			reaction.educts = obj.educts.map(function(educt){
				return ChemicalInstance.parse(educt, {reaction: reaction, isEduct: true});
			});
			reaction.products = obj.products.map(function(product){
				return ChemicalInstance.parse(product, {reaction: reaction, isEduct: false});
			});
			obj.chainedReactions.forEach(function(child){
				reaction.chain(Reaction.fromObject(child));
			});
			return reaction;
		},
		create: function(educts, reactionType, products){
			var reaction = new this();
			reaction.educts = this.parseChemicalList(educts, {reaction: reaction, isEduct: true});
			
			var reactionMatch = reactionType.match(/^\s*(<?)\s*(?:\[([^\]]*)\])?\s*([=\-])\s*(?:\[([^\]]*)\])?\s*(>?)\s*$/);
			if (reactionMatch){
				switch (reactionMatch[1] + reactionMatch[3] + reactionMatch[5]){
					case "->":
						reaction.forwardRate = new Rate(reactionMatch[4] || 1);
						break;
					case "<-":
						reaction.backwardRate = new Rate(reactionMatch[2] || 1);
						break;
					case "<=>":
					case "<->":
						reaction.forwardRate = new Rate(reactionMatch[4] || 1);
						reaction.backwardRate = new Rate(reactionMatch[2] || 1);
						break;
					default:
						throw new SyntaxError("Unknown reaction type.");
				}
			}
			else {
				throw new SyntaxError("Invalid reaction type.");
			}
			reaction.products =this.parseChemicalList(products, {reaction: reaction, isEduct: false});
			
			if (arguments.length > 3){
				var newArgs = Array.prototype.slice.call(arguments, 3);
				newArgs.splice(0, 0, []);
				reaction.chain(this.create.apply(this, newArgs));
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
					return ChemicalInstance.parse(c, reactionOptions);
				}
			});
		},
		parse: function(str){
			var splitRegExp = /^(.*?)\s*(<\s*(?:\[[^\]]*\])?\s*[=-]\s*(?:\[[^\]]*\])?\s*>|<\s*(?:\[[^\]]*\])?\s*-|-\s*(?:\[[^\]]*\])?\s*>)\s*(.*)$/;
			var match = str.match(splitRegExp);
			if (match){
				var args = [match[1], match[2], match[3]];
				while ((match = match[3].match(splitRegExp)) !== null){
					args.splice(2, 1, match[1], match[2], match[3]);
				}
				return this.create.apply(this, args);
			}
			else {
				throw new SyntaxError("Invalid reaction syntax.");
			}
		},
		
		alignedOutput: function(reactions){
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
		
		alignedLatexOutput: function(reactions, columnCallback){
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
		},
	});
}());