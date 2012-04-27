
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.YandexMapBridge = function (map){
	
	this.addControl = function(control) {
		map.addControl(control);
	}
	
	this.addLayer = function(layer) {
		map.addLayer(layer);
	};
	
	this.setCenter = function (point, zoom) {
		var geoPoint = new YMaps.GeoPoint(point.lng, point.lat);
		map.setCenter(geoPoint, zoom);
	};	
};

/**
 * Реализация загрузчика яндексовских карт.
 */
PermGuide.YandexMapLoader = {
		
	scriptLoaded: false,

	load: function() {
		this.loaded = false;
		this.scriptLoaded = false;
		var self = this;
		
		this.notify("mapLoading", this);
		
		$.ajax({
			url: 'http://api-maps.yandex.ru/1.1/index.xml?loadByRequire=1&key=AAC5U08BAAAAhG98TwIAUF_dcR_gLZsbQ6zwFcalQlEjkMsAAAAAAAAAAADLl1k_yHuuKf8xCzG-8rc6q0B5jA==',
			dataType: "script",
			async: false,
			timeoutNumber: 10000,
			success: function() {
				self.scriptLoaded = true;
				YMaps.load($.proxy(self.yMapsLoaded, self));
			}
		});
		var timeoutId;
		timeoutId = setTimeout($.proxy( function() {
			clearTimeout(timeoutId);
			this.timeoutId1 = setTimeout($.proxy( this.yMapsFail, this), 1000);
		}, this), 1000);
		
//*/
	},

	yMapsFail: function() {
		clearTimeout(this.timeoutId1);
		if (!this.scriptLoaded)
			this.notify("mapLoadFail");
	},
	
	yMapsLoaded: function() {
		if (this.loaded)
			return;
		this.loaded = true;
		
		var factory = function(element) {
			var map = new YMaps.Map(element) 
			map.enableScrollZoom();
			return new PermGuide.YandexMapBridge(map);
		}
		this.notify("mapLoadSuccess", factory);
	}
}