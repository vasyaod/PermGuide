
/**
 * Генератор координат, которй использует данные выбранного маршрута.
 * 
 * Вообще данный объект нужен для тектирования и генерации фэйковых координат.
 */
PermGuide.RouteCoordinatesGenerator = {
	
	// Маршрут по которому будет ходить устройство.
	route: null,
	
	// Индекс последней пройденой точки в маршруте.
	pointIndex: -1,
	
	// Текущая точка, может быть и промежуточной между маршрутными.
	curentPoint: null,
		
	init: function(routeId) {
		
		if (!routeId)
			routeId = 0;
		this.routeId = routeId;
		
		if (PermGuide.ApplicationData.loaded)
			this.dataLoaded(PermGuide.ApplicationData);
		else
			PermGuide.ApplicationData.attachListener("loaded", $.proxy(this.dataLoaded, this));
	},
	
	/**
	 * При загрузке данных, надо выбрать маршрут  который мы будем эмулировать.
	 */
	dataLoaded: function(applicationData) {
		this.pointIndex = -1;
		if(applicationData.data.routes && applicationData.data.routes.length > 0)
			this.route = applicationData.data.routes[this.routeId];
		
		if (!this.route)
			this.route = applicationData.data.routes[0];
	},
	
	getCoordinate: function() {
		
		var lat = 58.009654;
		var lng = 56.238867;
		
		if (this.route) {
			// Инициализируем хотьбу по маршруту.
			if (this.pointIndex == -1) {
				this.pointIndex = 0;
				this.curentPoint = this.route.points[0];
			} else {
				
				if (this.pointIndex+1 == this.route.points.length) { // Если маршрут закончился.
					this.pointIndex = -1;
				} else {
					//this.pointIndex++;
					//this.curentPoint = this.route.points[this.pointIndex];
					
					var nextPoint = {};
					nextPoint.lat = this.route.points[this.pointIndex+1].lat;
					nextPoint.lng = this.route.points[this.pointIndex+1].lng;
					if (PermGuide.Geolocation.relativeDistance(nextPoint.lat, nextPoint.lng) < 10) {
						// Дошли до очередной точки.
						this.pointIndex ++;
					} else {
						while (PermGuide.Geolocation.relativeDistance(nextPoint.lat, nextPoint.lng) > 10) {
							nextPoint.lat = this.curentPoint.lat + (nextPoint.lat - this.curentPoint.lat)/2
							nextPoint.lng = this.curentPoint.lng + (nextPoint.lng - this.curentPoint.lng)/2
						}
					}
					this.curentPoint = nextPoint;
				}
			}
			lat = this.curentPoint.lat;
			lng = this.curentPoint.lng;
		}
		
		var position = {};
		position.coords = {
			latitude: lat,
			longitude: lng
		};
		return position;
	}
}
