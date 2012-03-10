
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Реализация паперна обсервер, спизжена у со страницы студии Лебедева:
 * http://www.artlebedev.ru/tools/technogrette/js/observable/ и немного
 * передалана, ибо не понравилось мне оформление кода.
 */	
PermGuide.Observable = {
	
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

	notify: function(sEventType, parameters) {

		if(!this.aObservers[sEventType]) {
			return;
		}

		for(var i = 0, aObservers = this.aObservers[sEventType], iLength = aObservers.length; i < iLength; i++) {
			if(aObservers[i] instanceof Function) {
				aObservers[i](parameters);
			}
		}
	}

};
