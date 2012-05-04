
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.MapControl = function (events) {
	var element = $(
			'<div class="mapControl">'+
			'	<div class="auto"></div>'+
			'	<div class="plus">+</div>'+
			'	<div class="minus">-</div>'+
			'</div>'
			);
	// Устанавливаем z-index как у метки
	//element.css("z-index", YMaps.ZIndex.CONTROL);
	element.css("z-index", 1000);
	
	this.onAddToMap = function (map, controlPosition) {

		element.appendTo(map.getContainer());
		
		$(element).find(".plus").touchclick( function () {
			events.plus();
		});
		$(element).find(".minus").touchclick( function () {
			events.minus();
		});
		$(element).find(".auto").touchclick( function () {
			events.auto();
		});
	};

	this.onRemoveFromMap = function () {
		if (element.parent()) {
			element.remove();
		}
	};
	
}
/**
 * Оверлей карты для отображения объекто (мест).
 */
PermGuide.SimpleOverlay = function (point) {
	
	var self = this;
	
	var element = $(
			'	<div class="simpleOverlay">'+
			'		<div class="overlayContainer">'+
			'			<div class="img"></div>'+
			'		</div>'+
			'	</div>'
			);
	
	// Устанавливаем z-index как у метки
	//var zIndex = YMaps.ZIndex.OVERLAY;
	var zIndex = 110;
	element.css("z-index", zIndex);
	
	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (map, parentContainer) {
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
		//var position = map.converter.coordinatesToMapPixels(geoPoint);
		var position = self.converter.getConteinerPoint(point.lat, point.lng);
		element.css({
			left: position.x,
			top:  position.y
		})
	};
	
	this.setGeoPoint = function (_point) {
		point = _point
		this.onMapUpdate();
	};	
	
	this.getGeoPoint = function () {
		return point;
	};	
}

/**
 * Оверлей карты для отображения объекто (мест).
 */
PermGuide.BoxOverlay = function (point, fn) {
	
	var self = this;
	var element;

	var getElement = function () {
		if (element)
			return element;
		
		element = $(
			'	<div class="boxOverlay">'+
			'			<div class="bg" style="display:none;"></div>'+
			'			<div class="box"></div>'+
			'			<div class="glow"></div>'+
			'	</div>'
		);
				
		// Устанавливаем z-index как у метки
		//element.css("z-index", YMaps.ZIndex.OVERLAY);
		//var zIndex = YMaps.ZIndex.OVERLAY;
		var zIndex = 110;
		element.find(".bg").css("z-index", zIndex+1);
		element.find(".box").css("z-index", zIndex+10);
		element.find(".glow").css("z-index", zIndex+10);
		
		//if (PermGuide.isPhonegap)
			element.find(".bg").css("display", "block");
		
		if (fn != null) {
			element.find(".bg").touchclick(fn, true);
			element.find(".box").touchclick(fn, true);
			element.find(".glow").touchclick(fn, true);
		}
		
		return element;
	};
	

	
	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (map, parentContainer) {
		getElement().appendTo(parentContainer);
		this.onMapUpdate();
	};

	// Вызывается при удаление оверлея с карты
	this.onRemoveFromMap = function () {
		if (getElement().parent()) {
			getElement().remove();
		}
	};

	// Вызывается при обновлении карты
	this.onMapUpdate = function () {
		// Смена позиции оверлея
//		var position = map.converter.coordinatesToMapPixels(geoPoint).moveBy(offset);
		var position = self.converter.getConteinerPoint(point.lat, point.lng);
//		alert(position.x);
		getElement().css({
			left: position.x,
			top:  position.y
		})
	};
	

	this.refreshImage = function (color) {
		color = color.substr(1);
		getElement().find(".box").attr("class", "box color"+color);
		//element.find(".box").css("background", "url("+img+")");
		this.hideGlow();
	};
	
	this.hide = function () {
		getElement().css("display", "none");
	};

	this.show = function () {
		getElement().css("display", "block");
	};
	
	this.hideGlow = function () {
		getElement().find(".glow").css("display", "none");
	};

	this.showGlow = function () {
		getElement().find(".glow").css("display", "block");
	};
}

PermGuide.RoutesLayer = function () {
	var self = this;
	var map = null;
	var routes = [];
	var position = null;
	var parentContainer = null;
	var smoothZoom = false;
	
	var element = $('<canvas class="canvasLayer"></canvas>');
		
	// Устанавливаем z-index как у метки
	//var zIndex = YMaps.ZIndex.MAP_LAYER+1;
	var zIndex = 7;
	element.css("z-index", zIndex);
	// Получим контекст канвы.
	var context = element[0].getContext('2d');
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
		
		routes = $(routes).filter(function(item){ return this != route; } )
		if (map != null)
		{
			this.reposition();
			this.repaint();
		}
	};

	this.getCopyright = function (bounds, zoom) {
		return null;
	};

	this.getZoomRange = function (bounds) {
		return {min: 1, max: 15}
	};

	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (pMap, _parentContainer) {
		map = pMap;
		parentContainer = $(_parentContainer);
		
		element.appendTo(parentContainer);
		element.attr("width", parentContainer.width());
		element.attr("height", parentContainer.height());
		this.onMapUpdate();
	};

	// Вызывается при удаление оверлея с карты
	this.onRemoveFromMap = function () {
		if (element.parent()) {
			element.remove();
		}
	};
	
	this.repaint = function () {
		context.clearRect(0, 0, $(element).attr("width"), $(element).attr("height"));
		
		if (smoothZoom)
			return;
		
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
			$.each(route.points, $.proxy(function(index, point) {
				var conteinerPoint = self.converter.getConteinerPoint(point.lat, point.lng);
				point.x = conteinerPoint.x; 
				point.y = conteinerPoint.y; 
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
		smoothZoom = false;
		this.repaint();
	};
	
	this.onSmoothZoomStart = function () {
		smoothZoom = true;
		this.repaint();
	};

	this.onSmoothZoomTick = function (params) {
	};
};

PermGuide.LoadMapManager = {
	/**
	 * Флаг загрузки скрипта карты.
	 */
	loaded: false,
	
	/**
	 * Метод инициирует загрузку карты.
	 */
	load: function() {}
}
//Расширим до Observable.
$.extend(PermGuide.LoadMapManager, new PermGuide.Observable());


/**
 * Менеджер управления картой и объектами на карте.
 */
PermGuide.MapManager = function (yMapElement, mode){
	
	//Расширим до Observable.
	$.extend(this, new PermGuide.Observable());
	
	this.yMapElement = yMapElement;
	this.mode = mode;
	this.autoEnabled = false;
	
	// Вешаем обработчик события на загрузку скрипта сайта.
	PermGuide.LoadMapManager.attachListener("mapLoadSuccess", $.proxy(function(factory) {
		this.yMapsLoaded(factory);
	}, this));
	
	// Инициализируем маршруты.
	this.overlayStates = [];
	this.routeStates = [];

	this.yMapsLoaded = function(factory) {
		
		// Создает экземпляр карты и привязывает его к созданному контейнеру
		this.yMap = factory(this.yMapElement);
		var map = this.yMap;

		this.mapControl = new PermGuide.MapControl({
			plus: $.proxy(function() {
				this.yMap.setZoom(map.getZoom()+1);
			},this),
			minus: $.proxy(function() {
				this.yMap.setZoom(map.getZoom()-1);
			},this),
			auto: $.proxy(function() {
				this.autoToggle();
			},this)
		});
		this.yMap.addControl(this.mapControl);

		// Инициализируем собственный слой. 
		this.routesLayer = new PermGuide.RoutesLayer();
		this.yMap.addLayer(this.routesLayer);
		
		if (PermGuide.ApplicationData.loaded)
			this.dataLoaded(PermGuide.ApplicationData);
		else
			PermGuide.ApplicationData.attachListener("loaded", $.proxy(this.dataLoaded, this));
		////
		// Повешаем обработчики событий на обновление видимости объектов. 
		PermGuide.ApplicationData.attachListener("objectsVisibleChanged", $.proxy(this.visibleChanged, this));
		PermGuide.ApplicationData.attachListener("routesVisibleChanged", $.proxy(this.visibleChanged, this));
	
		////
		// Повешаем обработчики событий на обновление координат девайса. 
		PermGuide.Geolocation.attachListener("refreshed", $.proxy(this.positionRefreshed, this));
		PermGuide.Geolocation.attachListener("rateRefreshed", $.proxy(this.ratePositionRefreshed, this));
		
	};

	/**
	 * Метод включает/выключает режим "слежение".
	 */
	this.autoToggle = function() {
		if (this.autoEnabled)
			this.autoDisable();
		else
			this.autoEnable();
		
	},

	this.autoEnable = function() {
		if (this.autoEnabled)
			return
		this.autoEnabled = true;
		
		$(this.yMapElement).find(".mapControl .auto").addClass("active");
		// Если указатель положения пользователя уже существует, то позиционируем на него.
		if (this.placemark) {
			var point = this.placemark.getGeoPoint();
			this.yMap.setCenter(point);
		}
	},

	this.autoDisable = function() {
		if (!this.autoEnabled)
			return
		this.autoEnabled = false;
			
		$(this.yMapElement).find(".mapControl .auto").removeClass("active");
	},
	
	/**
	 * Обработчик события обновления координат дивайса.
	 */
	this.positionRefreshed = function(position) {
		if (!this.yMap)
			return;
		
		//var point = new YMaps.GeoPoint(lng, lat);
		var point = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};
		
		if (!this.placemark)
		{
			this.placemark = new PermGuide.SimpleOverlay(point);
			this.yMap.addOverlay(this.placemark);
		}
		this.placemark.setGeoPoint(point);
		
		if (!this.autoVisible) {
			this.autoVisible = true;
			$(this.yMapElement).find(".mapControl .auto").css("visibility","visible");
		}
		
		// Если включен режим слежения, то позиционируем центр карты по полученным координатам.
		if (this.autoEnabled) {
			this.yMap.setCenter(point);
		}
	};
	
	/**
	 * Обработчик события обновления координат дивайса.
	 */
	this.ratePositionRefreshed = function(position) {
		if (!this.yMap)
			return;
		
		// 
		if (this.autoEnabled && this.mode == "routes") {

			var visibleCheckPoints = [];
			$.each(PermGuide.ApplicationData.data.routes, function(index, route) {	
				var routeIsVisible = PermGuide.ApplicationData.routeIsVisible(route);
				if (routeIsVisible) {
					visibleCheckPoints = visibleCheckPoints.concat(route.checkPoints);
				}
			});
			
			// Находим самый минимальный близкий к пользователю чекпоинт.
			var minDistance = -1;
			var minCheckPoint;
			$.each(visibleCheckPoints, $.proxy(function(index, checkPoint) {
				var distance = PermGuide.Geolocation.relativeDistance(checkPoint.lat, checkPoint.lng);
				if (minDistance == -1 || distance < minDistance) {
					minCheckPoint = checkPoint;
					minDistance = distance;
				}
			}, this));
			
			//alert(minCheckPoint.id);
			// если самый близкий черпоинт находится ближе 30 метров, то активирем его.
			if (minDistance != -1 && minDistance < 30) {
				//alert(minCheckPoint.id);
				
				//if (PermGuide.isPhonegap)
				//	navigator.notification.beep(1);
				
				this.selectObjectById(minCheckPoint.id);
			}
		}
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
		map.setCenter({lat: data.centerLat, lng: data.centerLng}, data.zoom);
		
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
			var overlayState = {
					object: object,
					onmap: false,
					overlay: null
				}
			
			var boxOverlay = new PermGuide.BoxOverlay(
				//new YMaps.GeoPoint(object.point.lng, object.point.lat),
				{lng: object.point.lng, lat: object.point.lat},
				// Обработчик события клика на ящик на карте.
				// При первом клике, выделяем объект.
				// При втором клике, если он произошел, отобрадаем информацию об объекте.
				$.proxy(function () {
					if (this.selectedOverlayState == overlayState)
						PermGuide.ApplicationData.selectObject(overlayState.object);
					else
						this._selectObject(overlayState);
				}, this)
			);
			overlayState.overlay = boxOverlay;
			this.overlayStates.push(overlayState);
			// Скроем и сразу же добавим на карту.
			//placemark.hide();
			//this.yMap.addOverlay(placemark);
		}, this));
		
		// Генерируем маршруты (линии) на карте.
		if (this.routesLayer && this.mode == "routes") {
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
		
		this.onLoad();
	};
	
	this.visibleChanged = function() {
		if (this.yMap == null)
			return;           // Если карта еще не загружена, то нам здесь делать нечего. 

		var timeoutId;
		timeoutId = setTimeout($.proxy( function() {
			clearTimeout(timeoutId);

			$.each(this.overlayStates, $.proxy(function(index, overlayState) {	
				var objectIsVisible = PermGuide.ApplicationData.objectIsVisible(overlayState.object, this.mode);
	
				if ( objectIsVisible )
				{
					
					if (this.mode == "objects")
						overlayState.overlay.refreshImage(overlayState.object.objectColor);
					if (this.mode == "routes")
						overlayState.overlay.refreshImage(overlayState.object.routeColor);
					
					if (!overlayState.onmap)
					{
						overlayState.onmap = true;
						//overlayState.overlay.show();
						this.yMap.addOverlay(overlayState.overlay);
					}
	
				}
				else if (!objectIsVisible && overlayState.onmap)
				{
					overlayState.onmap = false;
					//overlayState.overlay.hide();
					this.yMap.removeOverlay(overlayState.overlay);
				}
	
				// Если данный объект является выделленным, то подсветим его.
				if (overlayState == this.selectedOverlayState)
					overlayState.overlay.showGlow();
				
			}, this));
	
			if (this.routesLayer && this.mode == "routes") {
				$.each(this.routeStates, $.proxy(function(index, routeState) {	
					var routeIsVisible = PermGuide.ApplicationData.routeIsVisible(routeState.object);
					if (routeIsVisible && !routeState.onmap)
					{
						routeState.onmap = true;
						this.routesLayer.addRoute(routeState.route);
					}
					else if (!routeIsVisible && routeState.onmap)
					{
						routeState.onmap = false;
						this.routesLayer.removeRoute(routeState.route);
					}
				}, this));
			}
		}, this), 600);
	};
	
	/**
	 * Выбирает объект на карте. 
	 */
	this.selectObject = function(object, centred) {
		if (!this.yMap)		// Если карта не создана безполезно что либо переключать.
			return; 

		if (!object)
			return;
		// Для начала найдем оверлей с данным объектом.
		var overlayState;
		$.each(this.overlayStates, function(index, _overlayState) {	
			if (_overlayState.object == object)
				overlayState = _overlayState;
		});
		// Если оверлай найден, то выделим его.
		if (overlayState)
			this._selectObject(overlayState, centred);
	}
	
	/**
	 * Выбирает объект на карте по его id.
	 */
	this.selectObjectById = function(objectId, centred) {
		if (!this.yMap) // Если карта не создана безполезно что либо переключать.
			return; 

		if (!objectId)
			return;
		// Для начала найдем оверлей с данным объектом.
		var overlayState;
		$.each(this.overlayStates, function(index, _overlayState) {	
			if (_overlayState.object.id == objectId)
				overlayState = _overlayState;
		});
		// Если оверлай найден, то выделим его.
		if (overlayState)
			this._selectObject(overlayState, centred);
	};
	
	/**
	 * Внутренний метод, вызывается при выборе объекта на карте.
	 */
	this._selectObject = function(overlayState, centred) {

		if (this.selectedOverlayState) {
			this.selectedOverlayState.overlay.hideGlow(); 
		}
		
		this.selectedOverlayState = overlayState;
		this.selectedOverlayState.overlay.showGlow(); 
		
		var object = overlayState.object;

		// Если объект находится за пределами карты, то центрируем по нему.
		if (centred || !this.yMap.isVisible(object.point)) {
			var timeoutId;
			timeoutId = setTimeout($.proxy( function() {
				clearTimeout(timeoutId);
				this.yMap.setCenter(object.point);
			}, this), 500);
		}

		this.notify("mapObjectSelected", object);
	};
	
	/**
	 * Обработчик события, вызываемый после того как карта успешно загрузилась и
	 * данные отрисовались.
	 */
	this.onLoad = function(){};
};
