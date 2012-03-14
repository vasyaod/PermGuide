// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Слайдер страниц (или если угодно дивов).
 * 
 * В будущем слайдер нужно будет допилить, до нормального состояния. 
 * Сделать:
 *   - перемотку програмную страниц
 *   - оформить в виде плагина к jQuery
 *   - оформить код (в текущей версии код просто спизжен с кокогото сайта.)
 */
PermGuide.PageSlider = {

	/**
	 * Индекс текущего слайда.
	 */
	index: 0,
	
	/**
	 * Флаг режима перетаскивания окна.
	 */
	draged: false,
	
	moved: false,
	
	/**
	 * Флаг, того, можно ли двигать слады.
	 */
	canDraged: true,
	
	/**
	 * Слушатель событий, переключения страниц.
	 */
	listener: null,
	
	init: function(containerElement) { 
		var self = this;
		
		this.containerElement = containerElement;
		// 
		$(this.containerElement).offset({});
		
		this.containerPosition = $(this.containerElement).position();
		this.slideWidth = $(this.containerElement).children(".slide").width();
		this.slideCount = $(this.containerElement).children(".slide").length;
		this.index = 0;
		
		$(this.containerElement).touchstart( function(event) {
			self.down(event);
		});
		
		$(this.containerElement).touchmove( function(event) {
			self.move(event);
		});

		$(this.containerElement).touchend( function(event) {
			self.up(event);
		});
		
	},
	
	// 
	select: function(index) {
		if (this.index == index)
			return;
		this.index = index;
		
		if (this.index < 0)
			this.index = 0;
		if (this.index == this.slideCount)
			this.index =  this.slideCount-1;

		if (this.listener != null)
			this.listener(this.index);
		this.refresh();
	},
	
	down: function(event) {
		
		if (!this.canDraged)
			return;
		
		this.x = event.changedTouches[0].clientX;
		this.y = event.changedTouches[0].clientY;
		this.containerPosition = $(this.containerElement).offset();
		
		this.draged = true;
		this.moved = false;
	},
	
	move: function(event) {
		
		if (!this.draged)
			return;
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;
		// Если сдвиг не очень большой, то стоим на месте.
		if (!this.moved && Math.abs(tX - this.x) < PermGuide.deadRadius)
			return;
		this.moved = true;
		
		$(this.containerElement).offset({ 
//			top:  this.containerPosition.top, 
			left: this.containerPosition.left + (tX - this.x) 
		});
	},
	
	next: function() {
		if (this.index == this.slideCount-1)
			return;
		
		this.index ++;
		if (this.listener != null)
			this.listener(this.index);
		this.refresh();
	},
	
	prev: function() {
		if (this.index == 0)
			return;
		
		this.index --;
		if (this.listener != null)
			this.listener(this.index);
		this.refresh();
	},
	
	refresh: function() {
		if (this.index < 0)
			this.index = 0;
		if (this.index == this.slideCount)
			this.index =  this.slideCount-1;
		
		var position = $(this.containerElement).children(".slide").slice(this.index).position().left
		
		var self = this;
		this.canDraged = false;
		$(this.containerElement).animate({
			left: -position
		}, 500, function() {
			self.canDraged = true;
		});
	
	},
	
	up: function(event) {

		if (!this.draged)
			return;
		this.draged = false;
		
		if (!this.moved)
			return;
		this.moved = false;
		
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;
	
		if (Math.abs(tX - this.x) > this.slideWidth/4)
		{
			if ((tX - this.x) < 0)
			{
				this.index ++;
				if (this.listener != null && this.index < this.slideCount)
					this.listener(this.index);
			}
			else
			{
				this.index --;
				if (this.listener != null && this.index >= 0)
					this.listener(this.index);
			}
		}
		
		this.refresh();
	}
};

/**
 * Управление и сотояние выподающим окном, которе служит для 
 * включение/выключение меток.
 */
PermGuide.DropDownWindow = {
	// Состоние окна.
	closed: true,
	// Исходная позиция элемента.
	position: {top: 0, left: 0},	// Просто для рыбы.
	
	init: function(element) { 
		this.element = element;
		this.position = $(element).offset();

		// Вешаем обработчик на книпку "свернуть/развернуть"
		$(this.element).children(".toggleButton").touchclick( $.proxy(function () {
			this.toggle();
		},this));
	},
	
	toggle: function()
	{
		var topPosition = 0;
		if (!this.closed)
			topPosition = this.position.top;
		this.closed = !this.closed;
		
		$(this.element).animate({
			top: topPosition
		}, 500);
	}
};

PermGuide.ObjectInfoWindow = {
		// Состоние окна.
		closed: true,
		// Исходная позиция элемента.
		position: {top: 0, left: 0},	// Просто для рыбы.
		
		init: function(element) { 
			this.element = element;
			this.position = $(element).offset();
		},
		
		toggle: function()
		{
			var topPosition = 0;
			if (!this.closed)
				topPosition = this.position.top;
			this.closed = !this.closed;
			
			$(this.element).animate({
				top: topPosition
			}, 500);
		}		
	};

/**
 * Объект отвечает за работу с мультиизычностью.
 */
PermGuide.Language = {

	// Флаг того, что пользователь выбрал язык.
	languageSelected: false,
	
	// Пока язык задан статично.
	currentLanguage: "ru",
	
	/**
	 * Возвращает строку на основании текущего(выбранного) языка.
	 */
	getString: function(object)
	{
		if (object == null)
			return null;
		
		// Если объект уже является строкой, то возвразщаем строку.
		if (typeof obj === "string")
			return obj;
			
		if (this.currentLanguage == "ru" && object[this.currentLanguage] == null)
			return object["rus"];
		
		return object[this.currentLanguage];
	},

	/**
	 * Возвращает строку из языковых ресурсов в соответствии с выбранным 
	 * языком.
	 */
	getInterfaceString: function(key)
	{
		var object = PermGuide.lr[key];
		if (object == null)
			return key;
		
		return this.getString(object);
	}
}

/**
 * Хранятся данные (события, достопримечательности, ...)
 */
PermGuide.ApplicationData = {
	
	/**
	 * Флаг того, что данные были загружены.
	 */
	loaded: false,
	
	/**
	 * Список доступных тегов, в виде ассоциативного массива.
	 */
	tags: {},
	
	/**
	 * Собственно сами данные. 
	 */
	data: null,// просто рыба.
	
	/**
	 * Метод возвращает тэг по его id.
	 */
	getTagById: function(tagId)
	{	
		// Ищем тэги в кэше.
		if (this.tags[tagId] != null)
			return this.tags[tagId]
		
		var res = null
		$.each(this.data.tags, function(index, tag) {	
			if (tag.id == tagId)
				res = tag;
		});
		if (res != null)
			this.tags[tagId] = res;
		
		return res;
	},
	
	/**
	 * Метод занимается обработкой полученных данных:
	 *  - Строит индекс тегов;
	 */
	processing: function()
	{
		var self = this;
		// Очистим массивы тагов.
		this.tags = {};
		this.tagsAsArray = [];
		
		// Обработаем тэги заменим поля в соответствии с выбранным языком.
		$.each(this.data.tags, function(index, tag) {	
			tag.name = PermGuide.Language.getString(tag.name);
			tag.isObjectTag = false;
			tag.isRouteTag = false;
			tag.visible = true;
			tag.setVisible = $.proxy(function(value) {
				if (this.visible != value) {
					this.visible = value;
					// Генерируем событие, что видимость метки изменилась.
					PermGuide.ApplicationData.notify("visibleChanged", PermGuide.ApplicationData);
					}
				}, tag);
		});
		
		// Формируем ассоциативный массив из тэгов, где название
		// элемента это имя тэга, а так же делаем локализацию.		
		$.each(this.data.objects, $.proxy(function(index, object) {	
			
			object.name = PermGuide.Language.getString(object.name);
			object.description = PermGuide.Language.getString(object.description);

			// Если имеется контактная информация, то её надо тоже обработать.
			if (object.contacts != null)
				object.contacts.address = PermGuide.Language.getString(object.contacts.address);
			
			var newTags = [];
			$.each(object.tags, $.proxy(function(index, tagId) {	
				var tag = this.getTagById(tagId);
				if (tag == null) {
					alert("Tag id "+tagId+"not found.");
				} else {
					tag.isObjectTag = true;
					newTags.push(tag);
				}
				// Проверим наличие ссылки на объект у данного тэга, если
				// её нет, то добавляем её.
				//if (!$.inArray(object, tag.objects))
				//	tag.objects.push(object);
			
			}, this));			
			object.tagIds = object.tags;
			object.tags = newTags;
		}, this));

		// Делае тоже самое но с маршрутами.
		$.each(this.data.routes, $.proxy(function(index, route) {	
			
			route.name = PermGuide.Language.getString(route.name);
			route.description = PermGuide.Language.getString(route.description);

			var newTags = [];
			$.each(route.tags, $.proxy(function(index, tagId) {	
				var tag = this.getTagById(tagId);
				if (tag == null) {
					alert("Tag id "+tagId+"not found.");
				} else {
					tag.isRouteTag = true;
					newTags.push(tag);
				}
			}, this));
			route.tagIds = route.tags;
			route.tags = newTags;
		}, this));
		
		// Генирируем событие, о том что данные загружены и готовы к использованию.
		this.notify("loaded", this);
		// Посылаем уведомление, о том что изменилась видимость объектов.
		this.notify("visibleChanged", this);
	},
	
	/**
	 * Метод возвращает true если объект видимый, в противном случаи false.
	 * Объект считается видимым если хотябы один из его тагов видимый. 
	 */
	objectIsVisible: function (object) {
		
		var visible = false;
		$.each(object.tagIds, $.proxy(function(index, tagId) {	
			var tag = this.getTagById(tagId);
			if (tag != null && tag.visible)
				visible = true;
		}, this));
		
		return visible;
	},

	/**
	 * Метод возвращает список видимых объектов. 
	 */
	getVisibleObjects: function () {
		var res = [];
		
		$.each(this.data.objects, $.proxy(function(index, object) {	
			if (this.objectIsVisible(object))
				res.push(object);
		}, this));
		
		return res;
	},
	
	/**
	 * Метод возвращает объект по его id.
	 */
	getObjectById: function (id) {
		var res = null;
		
		$.each(this.data.objects, $.proxy(function(index, object) {	
			if (object.id == id)
				res = object;
		}, this));
		
		return res;
	},
	
	/**
	 * Метод выделяет объект делая его текущим. 
	 */
	selectObject: function (object)
	{
		this.notify("objectSelected", object);
	},
	
	/**
	 * Загрузка данных из различных источников. 
	 */
	load: function () {
		
		var self = this;
		$.getJSON('data.json', function(data) {
			self.data = data;
			self.loaded = true;
			self.processing();
		});
	}
}
// Расширим ApplicationData до Observable.
$.extend(PermGuide.ApplicationData, PermGuide.Observable);

//Класс пользовательского оверлея, реализующего класс YMaps.IOverlay
PermGuide.Overlay = function (geoPoint, fn) {
	
	var map, _this = this, offset = new YMaps.Point(-10, -29);
	
	this.element = $('<div class="overlay"/>');
	// Устанавливаем z-index как у метки
	this.element.css("z-index", YMaps.ZIndex.Overlay);
	if (fn != null)
		this.element.touchclick(fn);

	// Вызывается при добавления оверлея на карту 
	this.onAddToMap = function (pMap, parentContainer) {
		map = pMap;
		this.element.appendTo(parentContainer);
		this.onMapUpdate();
	};

	// Вызывается при удаление оверлея с карты
	this.onRemoveFromMap = function () {
		if (this.element.parent()) {
			this.element.remove();
		}
	};

	// Вызывается при обновлении карты
	this.onMapUpdate = function () {
		// Смена позиции оверлея
		var position = map.converter.coordinatesToMapPixels(geoPoint).moveBy(offset);
		this.element.css({
			left : position.x,
			top :  position.y
		})
	};
}

PermGuide.CanvasLayer = function () {
	
	var map = null;
	var routes = [];
	var element = $('#myCanvas');
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
		context.beginPath();
		$.each(routes, $.proxy(function(index, route) {
			var i = 0;
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
		}, this));
		
		context.stroke();
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

/**
 * Менеджер управления картой и объектами на карте.
 */
PermGuide.MapManager = {
	/**
	 * Список оверлеев и информации об них.
	 */
	overlayStates: [],
	
	init: function(mapElement) {
		this.yMapElement = mapElement;
		
		//$.getScript('http://api-maps.yandex.ru/1.1/index.xml?loadByRequire=1&key=ANpUFEkBAAAAf7jmJwMAHGZHrcKNDsbEqEVjEUtCmufxQMwAAAAAAAAAAAAvVrubVT4btztbduoIgTLAeFILaQ==', function() {
			YMaps.load($.proxy(this.yMapsLoaded, this));
		//});
	},
	
	yMapsLoaded: function() {
		// Создает экземпляр карты и привязывает его к созданному контейнеру
		this.yMap = new YMaps.Map(this.yMapElement);
		this.yMap.enableScrollZoom();
		
		// Инициализируем собственный слой. 
		this.canvasLayer = new PermGuide.CanvasLayer();
		this.yMap.addLayer(this.canvasLayer);
		
		if (PermGuide.ApplicationData.loaded)
			this.dataLoaded(PermGuide.ApplicationData);
		else
			PermGuide.ApplicationData.attachListener("loaded", this.dataLoaded);
		
		PermGuide.ApplicationData.attachListener("visibleChanged", $.proxy(this.visibleChanged, this));
	},
	
	dataLoaded: function(applicationData) {
		if (this.yMap == null)
			return;	           // Если карта еще не загружена, то нам здесь делать нечего. 
		
		var data = applicationData.data;
		var map = this.yMap;

		// Сбрасываем список со всеми оверлеями.
		this.overlayStates = [];
		this.routeStates = [];
		
		// Устанавливает начальные параметры отображения карты: центр карты и коэффициент масштабирования
		map.setCenter(new YMaps.GeoPoint(data.centerLat, data.centerLng), 15);
		
		// Генерируем дотопримечательности (метки) на карте.
		$.each(data.objects, $.proxy(function(index, geoObject) {	
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
				new YMaps.GeoPoint(geoObject.point.lng, geoObject.point.lat),
				function () {
					PermGuide.ApplicationData.selectObject(geoObject);
				}
			);
			
			var overlayState = {
				object: geoObject,
				onmap: false,
				overlay: placemark
			}
			
			this.overlayStates.push(overlayState);
		}, this));
		
		// Генерируем маршруты (линии) на карте.
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
		
		this.visibleChanged();

		PermGuide.Scheduler.finished("InterfaceInit");
	},
	
	visibleChanged: function() {

		if (this.yMap == null)
			return;				// Если карта еще не загружена, то нам здесь делать нечего. 
		
		$.each(this.overlayStates, $.proxy(function(index, overlayState) {	
			if (PermGuide.ApplicationData.objectIsVisible(overlayState.object) && !overlayState.onmap)
			{
				overlayState.onmap = true;
				this.yMap.addOverlay(overlayState.overlay);
			}
			else if (!PermGuide.ApplicationData.objectIsVisible(overlayState.object) && overlayState.onmap)
			{
				overlayState.onmap = false;
				this.yMap.removeOverlay(overlayState.overlay);
			}
		}, this));

		$.each(this.routeStates, $.proxy(function(index, routeState) {	
			if (PermGuide.ApplicationData.objectIsVisible(routeState.object) && !routeState.onmap)
			{
				routeState.onmap = true;
				this.canvasLayer.addRoute(routeState.route);
			}
			else if (!PermGuide.ApplicationData.objectIsVisible(routeState.object) && routeState.onmap)
			{
				routeState.onmap = false;
				this.canvasLayer.removeRoute(routeState.route);
			}
		}, this));
	}
};