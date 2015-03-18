define(['jquery'],function(){

	var tVM=avalon.define({
		$id:'test1'
	});
	var aVM=avalon.define({
		$id:'test2'
	});

	return {
		init:function(){
			console.log('init is executing');
		}
	};

});