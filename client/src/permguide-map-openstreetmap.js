
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.MapLayer = function () {
	
	var self = this;
	var canvas = $('<canvas class="routesLayer"></canvas>');
	
	// Обязательные стили. 
	canvas.css("position", "absolute");
	canvas.css("top", "0");
	canvas.css("left", "0");
	canvas.css("width", "100%");
	canvas.css("height", "100%");
	
	var context = canvas[0].getContext('2d');
	// Отдельно храним размеры канвы, что бы их не запрашивать каждый раз.
	var canvasWidth, canvasHeight;
	var tilesHash = {};
	var tilesQueue = [];
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
		
		canvasWidth = $(map.getContainer()).width();
		canvasHeight = $(map.getContainer()).height();		
		canvas.attr("width", canvasWidth);
		canvas.attr("height", canvasHeight);
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
	var layers = [];
	// Массив с оверлеями.
	var overlays = [];
	
	// Координата центра.
	var center = {};
	// Центр в координатах битмара.
	var bitmapCenter = {};
	
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
	container.css("overflow", "hidden");
	container.css("top", "0");
	container.css("left", "0");
	container.css("width", "100%");
	container.css("height", "100%");
	container.css("background-color", "#fff");
	
	var overlayContainer = $('<div></div>');
	overlayContainer.appendTo(container);
	overlayContainer.css("z-index", "2");
	overlayContainer.css("position", "absolute");
	overlayContainer.css("top", "0");
	overlayContainer.css("left", "0");
	overlayContainer.css("width", "0");
	overlayContainer.css("height", "0");
	
	this.converter = {
			
		tileSize: 256,
			
		getBitmapX: function (lat, lng, zoom) {
			if (!zoom)
				zoom = self.getZoom();
			return Math.floor(Math.pow(2, zoom) * this.tileSize * (lng + 180) / 360);
		},

		getBitmapY: function (lat, lng, zoom) {
			if (!zoom)
				zoom = self.getZoom();
			return Math.floor(Math.pow(2, zoom) * this.tileSize * (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2);
		},
		
		getBitmapPoint: function (lat, lng, zoom) {
			if (!zoom)
				zoom = self.getZoom();
			return {
				x: this.getBitmapX(lat, lng, zoom),
				y: this.getBitmapY(lat, lng, zoom)
			};
		},
		
		getLat: function (bitmapX, BitmapY, zoom) { 
			if (!zoom)
				zoom = self.getZoom();
			var n = Math.PI - 2 * Math.PI * BitmapY / (Math.pow(2, zoom)*this.tileSize);
			return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
		},

		getLng: function (bitmapX, BitmapY, zoom) { 
			if (!zoom)
				zoom = self.getZoom();
			return (bitmapX / (Math.pow(2, zoom)*this.tileSize) * 360 - 180);
		},

		getLatLng: function (bitmapX, BitmapY, zoom) {
			if (!zoom)
				zoom = self.getZoom();
			return {
				lat: this.getLat(bitmapX, BitmapY, zoom),
				lng: this.getLng(bitmapX, BitmapY, zoom)
			};
		}
	};

	this.getContainer = function () {
		return container;
	};

	this.addLayer = function (layer) {
		layers.push(layer);
		layer.onAddToMap(this);
	};

	this.removeLayer = function (layer) {
		layers = $(layers).filter(function(){ return this != layer; } )
		layer.onRemoveFromMap();
	};
	
	this.addOverlay = function (overlay) {
		overlays.push(overlay);
		overlay.onAddToMap(this, overlayContainer);
	};

	this.removeOverlay = function (overlay) {
		overlays = $(overlays).filter(function(){ return this != overlay; } )
		overlay.onRemoveFromMap();
	};
	
	this.getCenter = function () {
		return ({
			lat: center.lat,
			lng: center.lng
		});
	};
	
	this.setCenter = function (point, pZoom) {
		center = {
			lat: point.lat,
			lng: point.lng
		};
		
		if (pZoom) {
			zoom = pZoom;
		}
		position = null;
		
		var bitmapX = self.converter.getBitmapX(center.lat, center.lng, zoom);
		var bitmapY = self.converter.getBitmapY(center.lat, center.lng, zoom);
		bitmapCenter = {
			x: bitmapX,
			y: bitmapY
		};
		overlayContainer.css("left", -bitmapCenter.x+Math.floor(container.width()/2));
		overlayContainer.css("top", -bitmapCenter.y+Math.floor(container.height()/2));
		
		$(layers).each(function() { 
			if (this.onMapUpdate)
				this.onMapUpdate();
		});
		
		$(overlays).each(function() { 
			if (this.onMapUpdate)
				this.onMapUpdate();
		});
	};

	this.getZoom = function () {
		return zoom;
	};
	
	this.setZoom = function (pZoom) {
		zoom = pZoom;
		if (zoom > 16)
			zoom = 16;
		else if (zoom < 1)
			zoom = 1;
		
		var bitmapX = self.converter.getBitmapX(center.lat, center.lng, zoom);
		var bitmapY = self.converter.getBitmapY(center.lat, center.lng, zoom);
		bitmapCenter = {
			x: bitmapX,
			y: bitmapY
		};
		overlayContainer.css("left", -bitmapCenter.x+Math.floor(container.width()/2));
		overlayContainer.css("top", -bitmapCenter.y+Math.floor(container.height()/2));

		
		$(layers).each(function() { 
			if (this.onMapUpdate)
				this.onMapUpdate();
		});
		
		$(overlays).each(function() { 
			if (this.onMapUpdate)
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
		
		overlayContainer.css("left", -bitmapCenter.x+Math.floor(container.width()/2)-position.x);
		overlayContainer.css("top", -bitmapCenter.y+Math.floor(container.height()/2)-position.y);
		
		$(layers).each(function() { 
			if (this.onMove)
				this.onMove(position, offset);
		});	
	};
	
	var resetOffset = function() {
		if (!position)
			return;
		
		var bitmapX = bitmapCenter.x+position.x;
		var bitmapY = bitmapCenter.y+position.y;
		
		var point = {
			lat: self.converter.getLat(bitmapX, bitmapY, zoom),
			lng: self.converter.getLng(bitmapX, bitmapY, zoom)
		};
		
		self.setCenter(point);
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

	this.addLayer(new PermGuide.MapLayer());
};

PermGuide.OpenStreetMapBridge = function (map){
	
	this.addControl = function(control) {
		map.addLayer(control);
	};
	
	this.addLayer = function(layer) {
		map.addLayer(layer);
	};
	
	this.addOverlay = function(overlay) {
		overlay.converter = map.converter;
		map.addOverlay(overlay);
	};
	
	this.setCenter = function (point, zoom) {
		map.setCenter(point, zoom);
	};
};

/**
 * Реализация загрузчика карт openstreetmap.
 */
PermGuide.OpenStreetMapLoader = {
		
	load: function() {
		var factory = function(element) {
			var map = new PermGuide.Map(element);
			return new PermGuide.OpenStreetMapBridge(map);
		}
		
		this.notify("mapLoadSuccess", factory);
	},
}