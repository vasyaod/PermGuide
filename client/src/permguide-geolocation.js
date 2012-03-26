
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Сервис геолокации.
 */
PermGuide.Geolocation = {
	
	/**
	 * Инициализация.
	 */
	init: function(){
		
		var options = { frequency: 3000 };
		this.watchID = navigator.geolocation.watchPosition(
			$.proxy(this.onSuccess, this), 
			$.proxy(this.onError, this), 
			options
		);
		
	},

	initTest: function(){
		this.timeoutId = setInterval($.proxy( this.random, this), 3000);
	},
	
	random: function(){
		var lat = 58.009654;
		var lng = 56.238867;
		
		lat += Math.random()*0.001;
		lng += Math.random()*0.001;
		
		var position = {};
		position.coords = {
			latitude: lat,
			longitude: lng
		};
		this.onSuccess(position);
	},
	
	onSuccess: function(position){
		this.notify("newPosition", position);
	},
	
	onError: function(){
		this.notify("error");
	}

}
//Расширим до Observable.
$.extend(PermGuide.Geolocation, PermGuide.Observable);
