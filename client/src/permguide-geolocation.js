
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};
/**
 * Небольной плагин для обновления растояний в вёрстке.
 */
$.fn.distanceRefresh = function () {
	var meters = PermGuide.Language.getInterfaceString("meters");
	var kilometers = PermGuide.Language.getInterfaceString("kilometers");

	this.each(function (){
		
		if (!PermGuide.Geolocation.lastPosition)
			return;
		
		var objectId = $(this).attr("_id");
		if (!objectId)
			return;
		var object = PermGuide.ApplicationData.getObjectById(objectId);
		if (!object)
			return;
	
		var distance = PermGuide.Geolocation.relativeDistance(object.point.lat, object.point.lng);
		if (distance > 1000){
			distance = Math.round(distance/100)/10+kilometers;
		}
		else
			distance = distance + meters;
		$(this).text(distance);
	});
};

/**
 * Дефолтный генератор координат для тестирования.
 */
PermGuide.RandomCoordinatesGenerator = {
	
	getCoordinate: function() {
		
		var lat = 58.009654;
		var lng = 56.238867;
		
		lat += Math.random()*0.001;
		lng += Math.random()*0.001;
		
		var position = {};
		position.coords = {
			latitude: lat,
			longitude: lng
		};
		return position;
	}
}

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
	 * Гкнератор фэйковых координат, нужен для проверки и тестирования маршрутов.
	 */
	coordinatesGenerator: PermGuide.RandomCoordinatesGenerator,
	
	/**
	 * Инициализация.
	 */
	initPhonegap: function(){
		
		var options = { 
			frequency: 3000,
			maximumAge: 30000,
			enableHighAccuracy: true
		};
		this.watchID = navigator.geolocation.watchPosition(
			$.proxy(this.onSuccess, this), 
			$.proxy(this.onError, this), 
			options
		);
		
	},

	init: function() {
		if (PermGuide.params.geolocation == "test") {
			this.timeoutId = setInterval($.proxy( this.random, this), 3000);
		}
	},
	
	random: function() {
		// Если не задан генератор координат, то генерируем рандомные координаты. 
		if (this.coordinatesGenerator) {
			position = this.coordinatesGenerator.getCoordinate();
			this.onSuccess(position);
		}
	},
	
	onSuccess: function(position){
		
		this.lastPosition = position;
		this.notify("refreshed", position);
		
		if (!this.time) {
			this.time = new Date();
			this.lastRatePosition = position;
			this.notify("rateRefreshed", position);
		}
		
		var newTime = new Date();
		var distance = this._distance(
			this.lastRatePosition.coords.latitude,
			this.lastRatePosition.coords.longitude,
			position.coords.latitude,
			position.coords.longitude
		);

		if (newTime.getTime() - this.time.getTime() > this.rateFrequency || distance >= 30)
		{
			this.lastRatePosition = position;
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
		
		return this._distance(lat, lng, lat2, lng2);
	},

	_distance: function(lat1, lng1, lat2, lng2){
		
		lat1=this.deg2rad(lat1);
		lng1=this.deg2rad(lng1);
		
		lat2=this.deg2rad(lat2);
		lng2=this.deg2rad(lng2);

		return Math.round( 6378137 * Math.acos( Math.cos( lat1 ) * Math.cos( lat2 ) * Math.cos( lng1 - lng2 ) + Math.sin( lat1 ) * Math.sin( lat2 ) ) );
	}

}
//Расширим до Observable.
$.extend(PermGuide.Geolocation, new PermGuide.Observable());
