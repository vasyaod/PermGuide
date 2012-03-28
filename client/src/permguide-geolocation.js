
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Сервис геолокации.
 */
PermGuide.Geolocation = {
		
	/**
	 * Последние координаты полученные устройством.
	 */
	lastPosition: null,
	/**
	 * Время последнего "редкого" обновления.
	 */
	time: null,
	
	/**
	 * Частота редкого обновления.
	 */
	rateFrequency: 20000,
	
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
		
		this.lastPosition = position;
		this.notify("refreshed", position);
		
		if (!this.time)
		{
			this.time = new Date();
			this.notify("rateRefreshed", position);
		}
		
		var newTime = new Date();
		if (newTime.getTime() - this.time.getTime() > this.rateFrequency)
		{
			this.time = newTime;
			this.notify("rateRefreshed", position);
		}
	},
	
	onError: function(){
		this.notify("error");
	},
	
	deg2rad: function(value){
		return value/180*3.1412
	},
	
	/**
	 * Метод вычисляет дистанцию относительно последних координат.
	 */
	relativeDistance: function(lat2, lng2){
		
		if (!this.lastPosition)
			return 0;	// Если последние координаты не найдены, то возвращаем 0.
		
		var lng = this.lastPosition.coords.longitude;
		var lat = this.lastPosition.coords.latitude;
		
		lat1=this.deg2rad(lat);
		lng1=this.deg2rad(lng);
		
		lat2=this.deg2rad(lat2);
		lng2=this.deg2rad(lng2);

		return Math.round( 6378137 * Math.acos( Math.cos( lat1 ) * Math.cos( lat2 ) * Math.cos( lng1 - lng2 ) + Math.sin( lat1 ) * Math.sin( lat2 ) ) );
	}

}
//Расширим до Observable.
$.extend(PermGuide.Geolocation, PermGuide.Observable);
