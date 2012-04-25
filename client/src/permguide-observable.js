
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Реализация паперна обсервер, спизжена у со страницы студии Лебедева:
 * http://www.artlebedev.ru/tools/technogrette/js/observable/ и немного
 * передалана, ибо не понравилось мне оформление кода.
 */	
PermGuide.Observable = function(){
	this.aObservers = {};
}

PermGuide.Observable.prototype = {
	
	aObservers: {},
		
	attachListener: function(sEventType, mObserver) {

		if(!(mObserver instanceof Function)) {
			return;
		}

		if(!this.aObservers[sEventType]) {
			this.aObservers[sEventType] = [];
		}

		this.aObservers[sEventType].push(mObserver);

	},

	detachListener: function(sEventType, mObserver) {

		if(this.aObservers[sEventType] && this.aObservers[sEventType].contains(mObserver)) {
			this.aObservers[sEventType].remove(mObserver);
		}

	},

	notify: function(sEventType, p1, p2, p3) {
		
		var self = this;
		
		if(!this.aObservers[sEventType]) {
			return;
		}
		/*
		var p1, p2, p3;
		
		if (arguments.length == 1) {
			p1 = arguments[1];
		} else if (arguments.length == 2){
			p1 = arguments[1];
			p2 = arguments[2];
		} else if (arguments.length == 3){
			p1 = arguments[1];
			p2 = arguments[2];
			p3 = arguments[3];
		}
		*/
		for(var i = 0, aObservers = this.aObservers[sEventType], iLength = aObservers.length; i < iLength; i++) {
			var observer = aObservers[i];
			if(observer instanceof Function) {
				/*
				if (arguments.length == 1) {
					aObservers[i].call(this, p1);
				} else if (arguments.length == 2){
					aObservers[i].call(this, p1, p2);
				} else if (arguments.length == 3){
					aObservers[i].call(this, p1, p1, p2);
				}
				*/
				
				//var timeoutId;
				//timeoutId = setTimeout(function() {
				//	clearTimeout(timeoutId);
				//	observer.call(self, p1, p2, p3);
				//}, 0);

				observer.call(self, p1, p2, p3);
			}
		}
	}

};
