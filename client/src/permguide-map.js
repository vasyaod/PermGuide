
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.MapControl = function (events) {
	
	var map;
	var element = $(
			'<div class="mapControl">'+
			'	<div class="auto"></div>'+
			'	<div class="plus">+</div>'+
			'	<div class="minus">-</div>'+
			'</div>'
			);
	// Устанавливаем z-index как у метки
	element.css("z-index", YMaps.ZIndex.CONTROL);
	
	this.onAddToMap = function (_map, _controlPosition) {
		map = _map;
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
PermGuide.SimpleOverlay = function (geoPoint) {
	
	var map;
	var element = $(
			'	<div class="simpleOverlay">'+
			'		<div class="overlayContainer">'+
			'			<div class="img"></div>'+
			'		</div>'+
			'	</div>'
			);	
	// Устанавливаем z-index как у метки
	element.css("z-index", YMaps.ZIndex.Overlay);
	
	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (_map, _parentContainer) {
		map = _map;
		element.appendTo(_parentContainer);
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
		var position = map.converter.coordinatesToMapPixels(geoPoint);
		element.css({
			left: position.x,
			top:  position.y
		})
	};
	
	this.setGeoPoint = function (_geoPoint) {
		geoPoint = _geoPoint
		this.onMapUpdate();
	};	
	
	this.getGeoPoint = function () {
		return geoPoint;
	};	
}

/**
 * Оверлей карты для отображения объекто (мест).
 */
PermGuide.BoxOverlay = function (geoPoint, fn) {
	
	var map, parentContainer, element;

	var getElement = function () {
		if (element)
			return element;
		
		element = $(
			'	<div class="boxOverlay">'+
			'			<div class="glow"></div>'+
			'			<div class="box"></div>'+
			'	</div>'
		);
				
		// Устанавливаем z-index как у метки
		element.css("z-index", YMaps.ZIndex.Overlay);
				
		if (fn != null)
			element.find(".box").touchclick(fn, true);
		
		return element;
	};
	

	
	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (_map, _parentContainer) {
		map = _map;
		parentContainer = _parentContainer;
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
		var position = map.converter.coordinatesToMapPixels(geoPoint);
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

PermGuide.CanvasLayer = function (element) {
	
	var map = null;
	var routes = [];
	var position = null;
	var parentContainer = null;
	var smoothZoom = false;
	
	// Устанавливаем z-index как у метки
	element.css("z-index", YMaps.ZIndex.MAP_LAYER+1);
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
		
//		if ($.fn.browserTouchSupport.touches) {
		if (typeof device != "undefined" && 
			(device.platform.indexOf("iPhone") != -1 || device.platform.indexOf("iPad") != -1)) {
			
			$(element).on("mousedown", function(event) {
				event.stopPropagation();
				event.preventDefault();
			});
			$(element).on("mouseup", function(event) {
				event.stopPropagation();
				event.preventDefault();
			});
			$(element).on("mousemove", function(event) {
				event.stopPropagation();
				event.preventDefault();
			});
			
			$(element).on("mouseclick", function(event) {
				event.stopPropagation();
				event.preventDefault();
			});
/*			
 			Не стирать! Возможно пригодится.
 			
			var touchHandler = function (event)
			{
				var touches = event.changedTouches,
					first = touches[0],
					type = "";

				switch(event.type)
				{
					case "touchstart": type = "mousedown"; break;
					case "touchmove":  type="mousemove"; break;
					case "touchend":   type="mouseup"; break;
					default: return;
				}
				var simulatedEvent = document.createEvent("MouseEvent");
				simulatedEvent.initMouseEvent(type, true, true, window, 1,
				                      first.screenX, first.screenY,
				                      first.clientX, first.clientY, false,
				                      false, false, false, 0, null);

				parentContainer.dispatchEvent(simulatedEvent);
				event.preventDefault();
			};
			$(element).touchstart(touchHandler, true);
			$(element).touchmove(touchHandler, true);
			$(element).touchend(touchHandler, true);
*/		
			var position = {};
			$(element).touchstart(function(event) {
				position.x = event.changedTouches[0].clientX;
				position.y = event.changedTouches[0].clientY;
			}, true);
			
			$(element).touchmove(function(event) {
				var _x = event.changedTouches[0].clientX;
				var _y = event.changedTouches[0].clientY;
				
				map.moveBy(new YMaps.Point(position.x-_x, position.y-_y));
				
				position.x = _x;
				position.y = _y;
			}, true);
		}
		this.onMapUpdate();
	};

	// Вызывается при удаление оверлея с карты
	this.onRemoveFromMap = function () {
		if (element.parent()) {
			element.remove();
		}
	};
	
	this.repaint = function () {
		//alert($(element).attr("id"));
		context.clearRect(0, 0, parentContainer.width(), parentContainer.height());
		
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
		smoothZoom = false;
		this.repaint();
	};
	
	this.onSmoothZoomStart = function () {
		smoothZoom = true;
		this.repaint();
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
			}
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
	PermGuide.LoadMapManager.attachListener("mapLoadSuccess", $.proxy(function(object) {
		this.yMapsLoaded();
	}, this));
	
	// Инициализируем маршруты.
	this.overlayStates = [];
	this.routeStates = [];
	
	this.yMapsLoaded = function() {
		// Создает экземпляр карты и привязывает его к созданному контейнеру
		this.yMap = new YMaps.Map(this.yMapElement);
		this.yMap.enableScrollZoom();
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

		// Удалим лого и copyright у карт.
		/*
		this.interval = setInterval( $.proxy(function() {
			if ($(this.yMapElement).find(".YMaps-logo").length > 0 && 
				$(this.yMapElement).find(".YMaps-copyrights").length > 0) {
				
				//$(this.yMapElement).find(".YMaps-logo")[0].onclick(null);
				//$(this.yMapElement).find(".YMaps-copyrights")[0].onclick(null);
				
				$(this.yMapElement).find(".YMaps-logo").on("mouseclick", function(event) {
					event.stopPropagation();
					event.preventDefault();
				});
				
				$(this.yMapElement).find(".YMaps-copyrights").on("mouseclick", function(event) {
					event.stopPropagation();
					event.preventDefault();
				});
				
				clearInterval(this.interval);
			}
		}, this), 1*1000);
		*/

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
			PermGuide.ApplicationData.attachListener("loaded", $.proxy(this.dataLoaded, this));
		////
		// Повешаем обработчики событий на обновление видимости объектов. 
		PermGuide.ApplicationData.attachListener("objectsVisibleChanged", $.proxy(this.visibleChanged, this));
		PermGuide.ApplicationData.attachListener("routesVisibleChanged", $.proxy(this.visibleChanged, this));
	
		////
		// Повешаем обработчики событий на обновление координат девайса. 
		PermGuide.Geolocation.attachListener("refreshed", $.proxy(this.newPosition, this));
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
			this.yMap.panTo(point);
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
	this.newPosition = function(position) {
		if (!this.yMap)
			return;
		
		var lng = position.coords.longitude;
		var lat = position.coords.latitude;
		var point = new YMaps.GeoPoint(lng, lat);
		
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
			this.yMap.panTo(point);
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
		map.setCenter(new YMaps.GeoPoint(data.centerLng, data.centerLat), data.zoom);
		
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
			
			var placemark = new PermGuide.BoxOverlay(
				new YMaps.GeoPoint(object.point.lng, object.point.lat),
				$.proxy(function () {
					this._selectObject(overlayState);
				}, this)
			);
			overlayState.overlay = placemark;
			
			this.overlayStates.push(overlayState);
			// Скроем и сразу же добавим на карту.
			//placemark.hide();
			//this.yMap.addOverlay(placemark);
		}, this));
		
		
		// Генерируем маршруты (линии) на карте.
		if (this.canvasLayer && this.mode == "routes") {
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
					overlayState.overlay.refreshImage(overlayState.object.objectColor);
				if (this.mode == "routes")
					overlayState.overlay.refreshImage(overlayState.object.routeColor);
				
				if (!overlayState.onmap)
				{
					overlayState.onmap = true;
					overlayState.overlay.show();
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

		if (this.canvasLayer && this.mode == "routes") {
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
		if (!this.yMap)		// Если карта не создана безполезно что либо переключать.
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
	}
	
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
		var coordBounds = this.yMap.getBounds();
		var point = new YMaps.GeoPoint(object.point.lng, object.point.lat)
		if (centred || !coordBounds.contains(point))
			this.yMap.setCenter(point)

		this.notify("mapObjectSelected", object);
	}
};
