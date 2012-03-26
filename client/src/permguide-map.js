
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

//Класс пользовательского оверлея, реализующего класс YMaps.IOverlay
PermGuide.Overlay = function (geoPoint, fn) {
	
	var map;
	var offset = new YMaps.Point(-11, -13);
	var element = $('<div class="overlay"/>');
	
	// Устанавливаем z-index как у метки
	element.css("z-index", YMaps.ZIndex.Overlay);
	
	if (fn != null)
		element.touchclick(fn);

	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (pMap, parentContainer) {
		map = pMap;
		element.appendTo(parentContainer);
		this.onMapUpdate();
	};

	// Вызывается при удаление оверлея с карты
	this.onRemoveFromMap = function () {
		if (element.parent()) {
			element.remove();
		}
	};

	// Вызывается при обновлении карты
	this.onMapUpdate = function () {
		// Смена позиции оверлея
		var position = map.converter.coordinatesToMapPixels(geoPoint).moveBy(offset);
		element.css({
			left: position.x,
			top:  position.y
		})
	};
	
	this.refreshImage = function (img) {
		element.css("background", "url("+img+")");
	}
	
	this.hide = function () {
		element.css("display", "none");
	}

	this.show = function () {
		element.css("display", "block");
	}
}

PermGuide.CanvasLayer = function (element) {
	
	var map = null;
	var routes = [];
	var position = null;
	var parentContainer = null;
	
	// Устанавливаем z-index как у метки
	element.css("z-index", YMaps.ZIndex.MAP_LAYER+1);
	// Получим контекст канвы.
	context = element[0].getContext('2d');
	
	//// 
	// При ресазе страницы изменим размеры канвы. 
	$(window).resize(function() {
		if (map == null)
			return;
		element.attr("width", $(parentContainer).width());
		element.attr("height", $(parentContainer).height());
	});
	
	
	/**
	 * Метод добавляет маршрут на карту.
	 */
	this.addRoute = function (route) {
		routes.push(route);

		if (map != null)
		{
			this.reposition();
			this.repaint();
		}
	};
	
	/**
	 * Удаляет маршрут с карты.
	 */
	this.removeRoute = function (route) {
		routes = $(this.routes).filter(function(item){ return item != route; } )
		
		if (map != null)
		{
			this.reposition();
			this.repaint();
		}
	};

	this.getCopyright = function (bounds, zoom) {
		return "Мобильный актив!"
	};

	this.getZoomRange = function (bounds) {
		return {min: 1, max: 15}
	};

	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (pMap, pPrentContainer) {
		map = pMap;
		prentContainer = $(pPrentContainer);
		
		element.appendTo(prentContainer);
		element.attr("width", prentContainer.width());
		element.attr("height", prentContainer.height());
		
		this.onMapUpdate();
	};

	// Вызывается при удаление оверлея с карты
	this.onRemoveFromMap = function () {
		if (element.parent()) {
			element.remove();
		}
	};
	
	this.repaint = function () {
		context.clearRect(0, 0, prentContainer.width(), prentContainer.height());
		
		var i = 0;
		
		$.each(routes, $.proxy(function(index, route) {
			var i = 0;
			context.beginPath();
			context.lineWidth = 2;
			context.strokeStyle = route.color;
			$.each(route.points, $.proxy(function(index, geoPoint) {
				var x = geoPoint.x;
				var y = geoPoint.y;
				if (position != null)
				{
					x += position.x; 
					y += position.y;
				}
				if (i == 0)
					context.moveTo(x, y);
				else
					context.lineTo(x, y);
				i++
			}, this));
			context.stroke();
		}, this));
		
	};
	
	this.reposition = function () {
		$.each(routes, $.proxy(function(index, route) {
			var i = 0;
			$.each(route.points, $.proxy(function(index, geoPoint) {					
				var point = map.converter.coordinatesToMapPixels(new YMaps.GeoPoint(geoPoint.lng, geoPoint.lat));
				geoPoint.x = point.x; 
				geoPoint.y = point.y; 
			}, this));
		}, this));
	};
	
	// Вызывается при обновлении карты
	this.onMapUpdate = function () 
	{
		position = null;
		this.reposition();
		this.repaint();
	};

	this.onMove = function (_position, _offset) {
		position = _position;
		this.repaint();
	};
	
	this.onSmoothZoomEnd = function () {
	};
	
	this.onSmoothZoomStart = function () {
	};

	this.onSmoothZoomTick = function (params) {
	};
}

PermGuide.LoadMapManager = {
	/**
	 * Флаг загрузки скрипта карты.
	 */
	loaded: false,
	
	scriptLoaded: false,

	load: function() {
		this.loaded = false;
		this.scriptLoaded = false;
		var self = this;
		
		this.notify("mapLoading", this);
//		$.getScript('http://api-maps.yandex.ru/1.1/index.xml?loadByRequire=1&key=AAC5U08BAAAAhG98TwIAUF_dcR_gLZsbQ6zwFcalQlEjkMsAAAAAAAAAAADLl1k_yHuuKf8xCzG-8rc6q0B5jA==', function(data, textStatus, jqxhr) {
//			alert(textStatus);
//			YMaps.load($.proxy(self.yMapsLoaded, self));
//		});
	
		$.ajax({
			url: 'http://api-maps.yandex.ru/1.1/index.xml?loadByRequire=1&key=AAC5U08BAAAAhG98TwIAUF_dcR_gLZsbQ6zwFcalQlEjkMsAAAAAAAAAAADLl1k_yHuuKf8xCzG-8rc6q0B5jA==',
			dataType: "script",
			async: false,
			timeoutNumber: 10000,
			success: function() {
				self.scriptLoaded = true;
				YMaps.load($.proxy(self.yMapsLoaded, self));
			},
		});
		
		this.timeoutId = setTimeout($.proxy( function() {
			clearTimeout(this.timeoutId);
			this.timeoutId1 = setTimeout($.proxy( this.yMapsFail, this), 1000);
		}, this), 1000);
		
//*/
	},

	yMapsFail: function() {
		clearTimeout(this.timeoutId1);
		if (!this.scriptLoaded)
		{
			PermGuide.Scheduler.finished("MapInit");
			PermGuide.Scheduler.finished("ObjectsMapInit");
			PermGuide.Scheduler.finished("RoutesMapInit");
			this.notify("mapLoadFail", this);
		}
	},
	
	yMapsLoaded: function() {
		if (this.loaded)
			return;
		this.loaded = true;
		PermGuide.Scheduler.finished("MapInit");
		this.notify("mapLoadSuccess", this);
	}
}
//Расширим до Observable.
$.extend(PermGuide.LoadMapManager, PermGuide.Observable);

/**
 * Менеджер управления картой и объектами на карте.
 */
PermGuide.MapManager = function (yMapElement, mode){
	
	this.yMapElement = yMapElement;
	this.mode = mode;
	
	// Вешаем обработчик события на загрузку скрипта сайта.
	PermGuide.ApplicationData.attachListener("mapLoadSuccess", $.proxy(function(object) {
		this.yMapsLoaded();
	}, this));
	
	// Инициализируем маршруты.
	this.overlayStates = [];
	this.routeStates = [];
	
	this.yMapsLoaded = function() {
		// Создает экземпляр карты и привязывает его к созданному контейнеру
		this.yMap = new YMaps.Map(this.yMapElement);
		this.yMap.enableScrollZoom();
		
		// Инициализируем собственный слой. 
		if ($(this.yMapElement).parent().children("canvas").length) {
			this.canvasLayer = new PermGuide.CanvasLayer(
				$(this.yMapElement).parent().children("canvas")
			);
			this.yMap.addLayer(this.canvasLayer);
		}
		
		if (PermGuide.ApplicationData.loaded)
			this.dataLoaded(PermGuide.ApplicationData);
		else
			PermGuide.ApplicationData.attachListener("loaded", this.dataLoaded);
		////
		// Повешаем обработчики событий на обновление видимости объектов. 
		PermGuide.ApplicationData.attachListener("objectsVisibleChanged", $.proxy(this.visibleChanged, this));
		PermGuide.ApplicationData.attachListener("routesVisibleChanged", $.proxy(this.visibleChanged, this));
	
		////
		// Повешаем обработчики событий на обновление координат девайса. 
		PermGuide.Geolocation.attachListener("newPosition", $.proxy(this.newPosition, this));
	};
	
	/**
	 * Обработчик события обновления координат дивайса.
	 */
	this.newPosition = function(position) {
		var geoObjectOptions = {
				hasBalloon: false,
				hasHint: false,
			}
		var lng = position.coords.longitude;
		var lat = position.coords.latitude;
		if (!this.placemark)
		{
			this.placemark = new YMaps.Placemark(new YMaps.GeoPoint(lng, lat), geoObjectOptions);
			this.placemark.name = "Вы!";
			this.yMap.addOverlay(this.placemark);
		}
		this.placemark.setGeoPoint(new YMaps.GeoPoint(lng, lat));
	};
	
	this.dataLoaded = function(applicationData) {
		if (this.yMap == null)
			return;	           // Если карта еще не загружена, то нам здесь делать нечего. 
		
		var data = applicationData.data;
		var map = this.yMap;
		
		// Сбрасываем список со всеми оверлеями.
		this.overlayStates = [];
		this.routeStates = [];
		
		// Устанавливает начальные параметры отображения карты: центр карты и коэффициент масштабирования
		map.setCenter(new YMaps.GeoPoint(data.centerLat, data.centerLng), data.zoom);
		
		// Генерируем дотопримечательности (метки) на карте.
		$.each(applicationData.getAllObjects(this.mode), $.proxy(function(index, object) {	
			/*
			  Эта версия работает с балунами, но у нас создан собственный оверлай
			  и поэтому пока код закоментирован.
			  
			var geoObjectOptions = {
				hasBalloon: false,
				hasHint: false,
			}

			var placemark = new YMaps.Placemark(new YMaps.GeoPoint(geoObject.point.lng, geoObject.point.lat), geoObjectOptions);
			placemark.permGuideObject = geoObject;
			placemark.name = geoObject.name;
			placemark.description = geoObject.description;

			YMaps.Events.observe(placemark, placemark.Events.Click, function () {
				PermGuide.ApplicationData.selectObject(placemark.permGuideObject);
			});	
			*/
			
			var placemark = new PermGuide.Overlay(
				new YMaps.GeoPoint(object.point.lng, object.point.lat),
				function () {
					PermGuide.ApplicationData.selectObject(object);
				}
			);
			
			var overlayState = {
				object: object,
				onmap: false,
				overlay: placemark
			}
			
			this.overlayStates.push(overlayState);
			// Скроем и сразу же добавим на карту.
			placemark.hide();
			this.yMap.addOverlay(placemark);
		}, this));
		
		
		// Генерируем маршруты (линии) на карте.
		if (this.canvasLayer) {
			$.each(data.routes, $.proxy(function(index, route) {	
	
				/*
				var pl = new YMaps.Polyline(); 
				
				$.each(route.points, function(index, point) {
					pl.addPoint(new YMaps.GeoPoint(point.lng, point.lat));
				});
				
				var overlayState = {
					object: route,
					onmap: false,
					overlay: pl
				}
				
				this.overlayStates.push(overlayState);
				 */
				var routeState = {
						object: route,
						onmap: false,
						route: route
					}
					
				this.routeStates.push(routeState);
			}, this));
		}
		this.visibleChanged();
		
		if (this.mode == "objects")
			PermGuide.Scheduler.finished("ObjectsMapInit");
		if (this.mode == "routes")
			PermGuide.Scheduler.finished("RoutesMapInit");
	};
	
	this.visibleChanged = function() {
		if (this.yMap == null)
			return;           // Если карта еще не загружена, то нам здесь делать нечего. 
		
		$.each(this.overlayStates, $.proxy(function(index, overlayState) {	
			var objectIsVisible = PermGuide.ApplicationData.objectIsVisible(overlayState.object, this.mode);

			if ( objectIsVisible )
			{
				if (this.mode == "objects")
					overlayState.overlay.refreshImage(overlayState.object.objectImg);
				if (this.mode == "routes")
					overlayState.overlay.refreshImage(overlayState.object.routeImg);
				
				if (!overlayState.onmap)
				{
					overlayState.onmap = true;
					overlayState.overlay.show();
				}
				//this.yMap.addOverlay(overlayState.overlay);
			}
			else if (!objectIsVisible && overlayState.onmap)
			{
				overlayState.onmap = false;
				overlayState.overlay.hide();
				//this.yMap.removeOverlay(overlayState.overlay);
			}
		}, this));

		if (this.canvasLayer) {
			$.each(this.routeStates, $.proxy(function(index, routeState) {	
				var routeIsVisible = PermGuide.ApplicationData.routeIsVisible(routeState.object);
				if (routeIsVisible && !routeState.onmap)
				{
					routeState.onmap = true;
					this.canvasLayer.addRoute(routeState.route);
				}
				else if (!routeIsVisible && routeState.onmap)
				{
					routeState.onmap = false;
					this.canvasLayer.removeRoute(routeState.route);
				}
			}, this));
		}
	};
};
