
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
	element.css("z-index", YMaps.ZIndex.OVERLAY);
	
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
			'			<div class="bg" style="display:none;"></div>'+
			'			<div class="box"></div>'+
			'			<div class="glow"></div>'+
			'	</div>'
		);
				
		// Устанавливаем z-index как у метки
		//element.css("z-index", YMaps.ZIndex.OVERLAY);
		element.find(".bg").css("z-index", YMaps.ZIndex.OVERLAY+1);
		element.find(".box").css("z-index", YMaps.ZIndex.OVERLAY+10);
		element.find(".glow").css("z-index", YMaps.ZIndex.OVERLAY+10);
		
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

PermGuide.RouteLayer = function () {
	
	var map = null;
	var routes = [];
	var position = null;
	var parentContainer = null;
	var smoothZoom = false;
	
	var element = $('<canvas class="routesLayer"></canvas>');
		
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
		if (PermGuide.isIPhone) {
			
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
	
	this.render = function () {
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
		this.render();
	};

	this.onMove = function (_position, _offset) {
		position = _position;
		this.render();
	};
	
	this.onSmoothZoomEnd = function () {
		smoothZoom = false;
		this.render();
	};
	
	this.onSmoothZoomStart = function () {
		smoothZoom = true;
		this.render();
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
			this.notify("mapLoadFail", this);
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

PermGuide.MapLayout = function () {
	
	var canvas = $('<canvas class="routesLayer"></canvas>');
	
	// Обязательные стили. 
	canvas.css("position", "absolute");
	canvas.css("top", "0");
	canvas.css("left", "0");
	canvas.css("width", "100%");
	canvas.css("height", "100%");
	
	var context = canvas[0].getContext('2d');
	
	var tilesHash = {};
	var tilesQueue = [];
	var self = this;
	var map = null;
	
	this.mapProvider = {
		getTileURL: function(x, y, z) {
			var rand = function (n) {
				return Math.floor(Math.random() * n);
			};
			var sub = ["a", "b", "c"];
			var url = "http://" + sub[rand(3)] + ".tile.openstreetmap.org/" + z + "/" + x + "/" + y + ".png";
			return url;
		}
	};
	
	//// 
	// При ресазе страницы изменим размеры канвы. 
	$(window).resize(function() {
		if (map == null)
			return;
		canvas.attr("width", $(map.getContainer()).width());
		canvas.attr("height", $(map.getContainer()).height());
	});
	
	var encodeIndex = function (tileX, tileY, zoom) {
		return tileX + "," + tileY + "," + zoom;
	};
	
	var repaint = function () {

		// Координаты углов канвы в пространстве битмапа. То есть координаты 
		// видимой области в битмапе. 
		var x1 = Math.floor(self.centerBitmapX - Math.floor(canvasWidth/2));
		var y1 = Math.floor(self.centerBitmapY - Math.floor(canvasHeight/2));
		var x2 = Math.floor(self.centerBitmapX + Math.floor(canvasWidth/2));
		var y2 = Math.floor(self.centerBitmapY + Math.floor(canvasHeight/2));
		
		var tileX1 = Math.floor(x1/map.converter.tileSize);
		var tileY1 = Math.floor(y1/map.converter.tileSize);
		var tileX2 = Math.floor(x2/map.converter.tileSize);
		var tileY2 = Math.floor(y2/map.converter.tileSize);
		
		for (tileX = tileX1; tileX <= tileX2; tileX++) {
			for (tileY = tileY1; tileY <= tileY2; tileY++) {
				var tile = tilesHash[encodeIndex(tileX, tileY, self.zoom)];
				var x = tileX*map.converter.tileSize - x1;
				var y = tileY*map.converter.tileSize - y1;
				context.clearRect(x, y, map.converter.tileSize, map.converter.tileSize);
				if (tile && tile.state) {
					context.drawImage(tile.image, x, y);
				} else {
					loadTile(tileX, tileY, self.zoom);
				}
			}
		}
	}
	
	var loadTile = function (tileX, tileY, zoom) {
		
		if (tilesHash[encodeIndex(tileX, tileY, zoom)])
			return;  // Если этот тайл уже нахотся в хеше, то выходим.
		
		var tile = {
			state: 0,      // 0 - значит что тайл грузится, 1 - загружен
			tileX: tileX,
			tileY: tileY,
			zoom: zoom,
			image: new Image()
		}
		tilesQueue.push(tile);
		tilesHash[encodeIndex(tileX, tileY, zoom)] = tile;
		
		tile.image.onerror = function () {
			console.log("Ошибка загрузки тайла!!! URL: "+encodeIndex(tileX, tileY, zoom));
		};
		tile.image.onload = function () {
			tile.state = 1;
			repaint();
		}
		tile.image.src = self.mapProvider.getTileURL(tileX, tileY, zoom);
		console.log("Загрузка тайла с сервера: "+tile.image.src);
		
		// Очищаем старые тайлы.
		if (tilesQueue.length > 100) {
			tile = tilesQueue.shift();
			delete tilesHash[encodeIndex(tile.tileX, tile.tileY, tile.zoom)];
		}
	};
	
	this.onAddToMap = function (pMap) {
		map = pMap;
		var container = map.getContainer();
		canvas.appendTo(container);
		
		canvasWidth = container.width();
		canvasHeight = container.height();
		canvas.attr("width", canvasWidth);
		canvas.attr("height", canvasHeight);
	};
	
	this.onRemoveFromMap = function () {
		if (canvas.parent()) {
			element.remove();
		}
	};
	
	this.onMapUpdate = function () {
		var point = map.getCenter();
		this.zoom = map.getZoom();
		this.centerBitmapX = map.converter.getBitmapX(point.lat, point.lng, this.zoom);
		this.centerBitmapY = map.converter.getBitmapY(point.lat, point.lng, this.zoom);

		repaint();
	};

	this.onMove = function (position, offset) {
		var point = map.getCenter();
		this.centerBitmapX = map.converter.getBitmapX(point.lat, point.lng, this.zoom)+position.x;
		this.centerBitmapY = map.converter.getBitmapY(point.lat, point.lng, this.zoom)+position.y;
		
		repaint();
	};
};

PermGuide.Map = function (mapElement) {
	
	var self = this;
	// Массивчик слоев карты.
	var layouts = [];
	// Координата центра.
	var center = {};
	// Зум карты.
	var zoom;
	
	// Координаты последнего перемещения курсора.
	var lastMovePosition;
	// Смещение битмапа относительно установлего центра,
	var position = null;

	// Флаг того что карта захвачена мышью
	var draged = false;
	
	// Контейнер в котором хранятся слои карты.
	var container = $('<div></div>');
	container.appendTo(mapElement);
	container.css("position", "absolute");
	container.css("top", "0");
	container.css("left", "0");
	container.css("width", "100%");
	container.css("height", "100%");
	container.css("background-color", "#fff");
	
	this.converter = {
			
		tileSize: 256,
			
		getBitmapX: function (lat, lng, zoom) {
			return Math.pow(2, zoom) * this.tileSize * (lng + 180) / 360;
		},

		getBitmapY: function (lat, lng, zoom) {
			return Math.pow(2, zoom) * this.tileSize * (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;
		},

		getLat: function (bitmapX, BitmapY, zoom) { 
			var n = Math.PI - 2 * Math.PI * BitmapY / (Math.pow(2, zoom)*this.tileSize);
			return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
		},

		getLng: function (bitmapX, BitmapY, zoom) { 
			return (bitmapX / (Math.pow(2, zoom)*this.tileSize) * 360 - 180);
		}
	/*		
			tile2lng: function (x, zoom) {
				return (x / Math.pow(2, zoom) * 360 - 180);
			},
				
			tile2lat: function (y, zoom) {
				var n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
				return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
			},
				
			lat2tile: function (lat, zoom) { 
				return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
			},

			lng2tile: function (lon, zoom) { 
				return (Math.floor((lon+180)/360*Math.pow(2,zoom))); 
			},
	*/
	};
	
	this.getCenter = function () {
		return ({
			lat: center.lat,
			lng: center.lng
		});
	};
	
	this.getZoom = function () {
		return zoom;
	};
	
	this.setZoom = function (pZoom) {
		zoom = pZoom;
		if (zoom > 16)
			zoom = 16;
		else if (zoom < 0)
			zoom = 0;
		
		$(layouts).each(function() { 
			this.onMapUpdate();
		});
	};
	
	this.getContainer = function () {
		return container;
	};
	
	this.addLayout = function (layout) {
		layouts.push(layout);
		layout.onAddToMap(this);
	};

	this.removeLayout = function (layout) {
		layouts = $(layouts).filter(function(){ return this != layout; } )
		layout.onRemoveFromMap();
	};

	this.setPosition = function (centerBitmapX, centerBitmapY, zoom) {
		this.centerBitmapX = centerBitmapX;
		this.centerBitmapY = centerBitmapY;
		this.zoom = zoom;
		
		$(layouts).each(function() { 
			this.onMove(position, offset);
		});
	};
	
	this.setCenter = function (point, pZoom) {
		center = {
			lat: point.lat,
			lng: point.lng
		};
		zoom = pZoom;
		position = null;
		
		$(layouts).each(function() { 
			this.onMapUpdate();
		});
	};
	
	var addOffset = function(offset) {
		if (!position) {
			position = {
				x: offset.x,
				y: offset.y
			}
		} else {
			position = {
				x: position.x + offset.x,
				y: position.y + offset.y
			}
		}
		
		$(layouts).each(function() { 
			this.onMove(position, offset);
		});	
	};
	
	var resetOffset = function() {
		if (!position)
			return;
		
		var bitmapX = self.converter.getBitmapX(center.lat, center.lng, zoom)+position.x;
		var bitmapY = self.converter.getBitmapY(center.lat, center.lng, zoom)+position.y;
		
		center = {
			lat: self.converter.getLat(bitmapX, bitmapY, zoom),
			lng: self.converter.getLng(bitmapX, bitmapY, zoom)
		};
		position = null;
		$(layouts).each(function() { 
			this.onMapUpdate();
		});
	};
	
	/**
	 * Обработчик событий нажатий тача или мыши.
	 */
	var down = function(event) {
		
		lastMovePosition = {
			x: event.changedTouches[0].clientX,
			y: event.changedTouches[0].clientY
		};
		
		draged = true;
	};
	
	/**
	 * Обработчик событий нажатий тача или мыши.
	 */
	var move = function(event) {
		if (!draged)
			return;
		
		var offset = {
			x: lastMovePosition.x - event.changedTouches[0].clientX,
			y: lastMovePosition.y - event.changedTouches[0].clientY
		};

		lastMovePosition = {
			x: event.changedTouches[0].clientX,
			y: event.changedTouches[0].clientY
		};
		
		addOffset(offset);
	};
	
	/**
	 * Обработчик события отпускания мыши.
	 */
	var up = function(event) {
		draged = false;
		
		resetOffset();
	};
	
	$(container).touchstart(down);
	$(container).touchmove(move);
	$(container).touchend(up);
	
	// Обработка событий колесика мыши.
	container[0].addEventListener("DOMMouseScroll", function (event) {
		if (event.detail < 0)
			self.setZoom(self.getZoom()+1);
		if (event.detail > 0)
			self.setZoom(self.getZoom()-1);
		event.stopPropagation();
		event.preventDefault();
	});

	// Обработка событий колесика мыши.
	container[0].addEventListener("mousewheel", function (event) {
		if (event.wheelDelta > 0)
			self.prev();
		if (event.wheelDelta < 0)
			self.next();
		event.stopPropagation();
		event.preventDefault();
	});

	this.addLayout(new PermGuide.MapLayout());
};

PermGuide.Map.prototype = {
	
	
};

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
	//	this.yMapsLoaded();
	}, this));
	
	// Инициализируем маршруты.
	this.overlayStates = [];
	this.routeStates = [];

	this._map = new PermGuide.Map(this.yMapElement);
	this._map.setCenter({
		lng: 56.244652,
		lat: 58.012395
	}, 13);
	
	PermGuide.Scheduler.finished("ObjectsMapInit");
	PermGuide.Scheduler.finished("RoutesMapInit");
	
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
	this.positionRefreshed = function(position) {
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
			
			var boxOverlay = new PermGuide.BoxOverlay(
				new YMaps.GeoPoint(object.point.lng, object.point.lat),
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
		var coordBounds = this.yMap.getBounds();
		var point = new YMaps.GeoPoint(object.point.lng, object.point.lat)
		if (centred || !coordBounds.contains(point)) {
			var timeoutId;
			timeoutId = setTimeout($.proxy( function() {
				clearTimeout(timeoutId);
				this.yMap.setCenter(point);
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
