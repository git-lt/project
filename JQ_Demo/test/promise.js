var Promise = function(){
	this.thens=[];
};

Promise.prototype={
	resolve:function(){
		var fnName = this.thens.shift(),n;
		fnName && (n = fnName.apply(null,arguments),n instanceof Promise && (n.thens = this.thens));
		
		//相当于
		// if(fnName){
		// 	n = fnName.apply(null,arguments);
		// 	if(n instanceof Promise){
		// 		n.thens=this.thens;
		// 	}
		// }

	},
	then:function(fnName){
		return this.thens.push(fnName), this;
	}
}