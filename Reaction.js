var Reaction = (function(){
	"use strict";
	
	return Poolable.extend(function(){
		this.educts = [];
		this.products = [];
	}).implement({
		forwardRate: 0,
		backwardRate: 0,
		chainParent: null,
		chainedReaction: null,
		
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
				chainedReaction: this.chainedReaction? this.chainedReaction.toObject(): null
			};
		},
		toString: function(){
			var str = "";
			for (var i = 0; i < (this.chainParent? 4: 5); i += 1){
				str += this.getColumn(i);
			}
			if (this.chainedReaction){
				str += this.chainedReaction.toString();
			}
			return str;
		},
		getColumnCount: function(){
			var count = this.chainParent? 4: 5;
			if (this.chainedReaction){
				count += this.chainedReaction.getColumnCount();
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
						if (this.chainedReaction){
							return this.chainedReaction.getColumn(columnIndex - 5, width);
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
			
			latex += this.chainedReaction.toLatex();
			
			if (withEnvironment){
				latex += "}";
			}
			
			latex += "";
			
			return latex;
		},
		getLatexColumnCount: function(){
			var count = this.chainParent? 7: 8;
			if (this.chainedReaction){
				count += this.chainedReaction.getLatexColumnCount();
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
						if (this.chainedReaction){
							return this.chainedReaction.getLatexColumn(columnIndex - 8, width);
						}
						else {
							return " ".repeat(width);
						}
				}
			}
		},
		
		chain: function(reaction){
			if (this.chainedReaction){
				throw new Error("The reaction is already chained");
			}
			reaction.chainParent = this;
			reaction.educts = this.products;
			this.chainedReaction = reaction;
		}
	});
}());