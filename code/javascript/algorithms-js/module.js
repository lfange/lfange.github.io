var mymodule = (function() {
	var module = {}
	function define(bar, funlist, fn) {
		for (var i=0;i < funlist.length; i++) {
			module[i] = module[funlist[i]]
		}
	}
	
	return {
		module: module
	}
})()