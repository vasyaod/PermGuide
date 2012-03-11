
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
	},
	
	move: function(event) {
		
		if (!this.draged)
			return;
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;
		// Если сдвиг не очень большой, то стоим на месте.
		if (Math.abs(tX - this.x) < 10)
			return;
			
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
		
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;

		if (Math.abs(tX - this.x) < 10)
			return;
		
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

(function ($) {
	$.fn.scrolled = function() {
		
		this.each(function(){
			
			var state = {
				containerElement: this,
				draged: false,
				canDraged: true
			};
			// Сохраним состояние внутри элемента.
			$(this).data(state);
			
			$(this).touchstart( $.proxy(function(event) {
				if (!this.canDraged)
					return;
				
				this.x = event.changedTouches[0].clientX;
				this.y = event.changedTouches[0].clientY;
				this.containerPosition = $(this.containerElement).offset();
				
				this.draged = true;
			}, state));
			
			$(this).touchmove( $.proxy(function(event) {
				
				if (!this.draged)
					return;
				var tX = event.changedTouches[0].clientX;
				var tY = event.changedTouches[0].clientY;
				$(this.containerElement).offset({ 
					top:  this.containerPosition.top + (tY - this.y), 
//					left: this.containerPosition.left, 
				});
				
			}, state));
			
			$(this).touchend( $.proxy(function(event) {
				
				if (!this.draged)
					return;
				this.draged = false;
				
				var delta = 0;
				
				var parentHeight = $(this.containerElement).parent().height();
				var height = $(this.containerElement).height();
				var position = $(this.containerElement).position().top;
				var parentPosition = $(this.containerElement).parent().position().top;
				
				if(height > parentHeight)
				{
					if (position > parentPosition)
					{
						position = parentPosition;
						delta = 1;
					}
					else if (position < parentPosition - (height - parentHeight) - 20)
					{
						position = parentPosition - (height - parentHeight) - 20;
						delta = 1;
					}
				}
				else
				{
					position = parentPosition;
					delta = 1;
				}
				
				if (delta == 0)
					return;
				
				this.canDraged = false;
				var self = this;
				
				$(this.containerElement).animate({
					top: position
				}, 500, function() {
					self.canDraged = true;
				});
			
			}, state));
		});
	};
})(jQuery);


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
	 * Тотже список тагов, но в виде массива.
	 */
	tagsAsArray: [],
	
	/**
	 * Собственно сами данные. 
	 */
	data: null,// просто рыба.
	
	/**
	 * Внутренний метод, создает пустой тэг.
	 */
	createTag: function(tagName)
	{
		if (this.tags[tagName] == null)
		{
			this.tags[tagName] = {
				name: tagName,
				visible: true,
				objects: [],
				setVisible: function(value)
				{
					if (this.visible != value)
					{
						this.visible = value;
						// Генерируем событие, что видимость метки изменилась.
						PermGuide.ApplicationData.notify("visibleChanged", PermGuide.ApplicationData);
					}
				}
			};
		}
		return this.tags[tagName];
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
		
		// Формируем ассоциативный массив из тэгов, где название
		// элемента это имя тэга.
		$.each(this.data.objects, $.proxy(function(index, object) {	
			$.each(object.tags, $.proxy(function(index, tagName) {	
				var tag = this.createTag(tagName);
				// Проверим наличие ссылки на объект у данного тэга, если
				// её нет, то добавляем её.
				if (!$.inArray(object, tag.objects))
					tag.objects.push(object);
			
			}, this));
		}, this));

		// Делае тоже самое но с маршрутами.
		$.each(this.data.routes, $.proxy(function(index, route) {	
			$.each(route.tags, $.proxy(function(index, tagName) {	
				var tag = this.createTag(tagName);
				// Проверим наличие ссылки на объект у данного тэга, если
				// её нет, то добавляем её.
				if (!$.inArray(route, tag.objects))
					tag.objects.push(route);
			
			}, this));
		}, this));
		
		// Формируем простой массив из тэгов.
		$.each(this.tags, $.proxy(function(index, tag) {	
			this.tagsAsArray.push(tag);
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
		// Если тагов нет, то объект по умолчанию видимый всегда.
		if (object.tags == null)
			return true;
		
		var visible = false;
		$.each(object.tags, $.proxy(function(index, tagName) {	
			var tag = this.tags[tagName];
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
		YMaps.load($.proxy(this.yMapsLoaded, this));
	},
	
	yMapsLoaded: function() {
		// Создает экземпляр карты и привязывает его к созданному контейнеру
		this.yMap = new YMaps.Map(this.yMapElement);

		if (PermGuide.ApplicationData.loaded)
			this.dataLoaded(PermGuide.ApplicationData);
		else
			PermGuide.ApplicationData.attachListener("loaded", this.dataLoaded);
		
		PermGuide.ApplicationData.attachListener("visibleChanged", $.proxy(this.visibleChanged, this));
		
		$("#splash").css("visibility", "hidden");
		$("#pageSlider").css("visibility", "visible");
	},
	
	dataLoaded: function(applicationData) {
		if (this.yMap == null)
			return;	           // Если карта еще не загружена, то нам здесь делать нечего. 

		var data = applicationData.data;
		var map = this.yMap;
		// Сбрасываем список со всеми оверлеями.
		this.overlayStates = [];
		
		// Устанавливает начальные параметры отображения карты: центр карты и коэффициент масштабирования
		map.setCenter(new YMaps.GeoPoint(data.centerLat, data.centerLng), 15);

		// Генерируем дотопримечательности (метки) на карте.
		$.each(data.objects, $.proxy(function(index, geoObject) {	

			var geoObjectOptions = {
				hasBalloon: false,
				hasHint: false,
			}

			var placemark = new YMaps.Placemark(new YMaps.GeoPoint(geoObject.point.lat, geoObject.point.lng), geoObjectOptions);
			placemark.permGuideObject = geoObject;
			placemark.name = geoObject.name;
			placemark.description = geoObject.description;

			YMaps.Events.observe(placemark, placemark.Events.Click, function () {
				PermGuide.ApplicationData.selectObject(placemark.permGuideObject);
				//PermGuide.ObjectInfoWindow.toggle();
			});	
			
			var overlayState = {
				object: geoObject,
				onmap: false,
				overlay: placemark
			}
			
			this.overlayStates.push(overlayState);
		}, this));
		
		// Генерируем маршруты (линии) на карте.
		$.each(data.routes, $.proxy(function(index, route) {	

			var pl = new YMaps.Polyline(); 
			
			$.each(route.points, function(index, point) {
				pl.addPoint(new YMaps.GeoPoint(point.lat,point.lng));
			});
			
			var overlayState = {
				object: route,
				onmap: false,
				overlay: pl
			}
			
			this.overlayStates.push(overlayState);
		}, this));

		this.visibleChanged();
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
	}
};