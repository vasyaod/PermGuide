// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

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
			var self = this;
			
			var topPosition = 0;
			if (!this.closed)
				topPosition = this.position.top;
			this.closed = !this.closed;
			
			$(this.element).animate({
				top: topPosition
			}, 500, function() {
				if (self.closed)
					$(self.element).css("top", "100%");
			});
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
	 * Возвращает список тэгов принадлежащих объектам.
	 */
	getObjectTags: function()
	{	
		var res = [];
		$(this.data.tags).each(function(){
			if (this.isObjectTag)
				res.push(this);
		});
		return res;
	},
	
	/**
	 * Возвращает список тэгов принадлежащих маршрутам.
	 */
	getRouteTags: function()
	{	
		var res = [];
		$(this.data.tags).each(function(){
			if (this.isRouteTag)
				res.push(this);
		});
		return res;
	},
	
	/**
	 * Возвращает список видимых тэгов принадлежащих объектам.
	 */
	getVisibleObjectTags: function()
	{	
		var res = [];
		$(this.data.tags).each(function(){
			if (this.isObjectTag && this.visible)
				res.push(this);
		});
		return res;
	},
	
	/**
	 * Возвращает список видимых тэгов принадлежащих маршрутам.
	 */
	getVisibleRouteTags: function()
	{	
		var res = [];
		$(this.data.tags).each(function(){
			if (this.isRouteTag && this.visible)
				res.push(this);
		});
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
			tag.visible = false;
			tag.setVisible = $.proxy(function(value) {
				if (this.visible != value) {
					this.visible = value;
					
					// Генерируем событие, что видимость метки изменилась.
					PermGuide.ApplicationData.notify("visibleChanged", PermGuide.ApplicationData);
				}
			}, tag);
			tag.activate = $.proxy(function(value) {
				if (this.visible == true) 
					return;
					
				if (this.isObjectTag)
				{
					PermGuide.ApplicationData._setVisibleTags("objects", false);
					this.visible = true;
					
					//var objs = PermGuide.ApplicationData.getObjectsByTags(this);
					var objs = PermGuide.ApplicationData.getAllObjects("objects");
					$.each(objs, function(index, object) {	
						object.objectColor = tag.color;
						object.objectImg = tag.picture;
					});
					
					// Генерируем событие, что видимость метки изменилась.
					PermGuide.ApplicationData.notify("objectsVisibleChanged", PermGuide.ApplicationData);
				}
				if (this.isRouteTag)
				{
					PermGuide.ApplicationData._setVisibleTags("routes", false);
					this.visible = true;
					
					//var objs = PermGuide.ApplicationData.getObjectsByTags(this);
					var objs = PermGuide.ApplicationData.getAllObjects("routes");
					$.each(objs, function(index, object) {	
						object.routeColor = tag.color;
						object.routeImg = tag.picture;
					});
					
					// Генерируем событие, что видимость метки изменилась.
					PermGuide.ApplicationData.notify("routesVisibleChanged", PermGuide.ApplicationData);
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
			
			// Пускай маршрут знает о своих объектах.
			route.objects = [];
			// Переберем все точки маршрута, дабы востаноить связь объект->маршрут.
			$.each(route.points, $.proxy(function(index, point) {	
				if (point.id != null) {
					
					var object = this.getObjectById(point.id);
					if (object.routes == null)
						object.routes = [];
					object.routes.push(route);
					route.objects.push(object);
				}
				
			}, this));
			
		}, this));
		
		
		this.loaded = true;
		// Генирируем событие, о том что данные загружены и готовы к использованию.
		this.notify("loaded", this);

		// Сделаем активным первый тэг в каждом режиме.
		this.getObjectTags()[0].activate();
		this.getRouteTags()[0].activate();

		// Посылаем уведомление, о том что изменилась видимость объектов.
		//this.notify("visibleChanged", this);
		
	},
	
	/**
	 * Внутренний метод. Метод устанавливает флаг видимости в зависимости
	 * для всех тэгов в зависимости от режима
	 */
	_setVisibleTags: function (mode, flag) {
		
		if (mode == "objects") {
			$.each(this.data.tags, function(index, tag) {	
				if (tag.isObjectTag)
					tag.visible = flag;
			});
			
		} else if (mode == "routes") {
			$.each(this.data.tags, function(index, tag) {	
				if (tag.isRouteTag)
					tag.visible = flag;
			});
		} else {
			alert("mode not found.");
		}
	},
	
	/**
	 * Внутренний метод.
	 */
	_objectIsVisible: function (object) {
		
		var visible = false;
		$.each(object.tagIds, $.proxy(function(index, tagId) {	
			var tag = this.getTagById(tagId);
			if (tag != null && tag.visible)
				visible = true;
		}, this));
		
		return visible;
	},
	
	/**
	 * Метод возвращает true если маршрут видим.
	 */
	routeIsVisible: function (route) {
		return this._objectIsVisible(route);
	},
	
	/**
	 * Метод возвращает true если объект видимый, в противном случаи false.
	 * Объект считается видимым если хотябы один из его тагов видимый. 
	 */
	objectIsVisible: function (object, mode) {
		
		if (mode == "objects") {
			return this._objectIsVisible(object);
		} else if (mode == "routes") {
			if (object.routes == null)
				return false;
			else {
				var visible = false;
				$.each(object.routes, $.proxy(function(index, route) {	
					if (!visible && this._objectIsVisible(route))
						visible = true;
				}, this));
				return visible;
			}
		} else {
			alert("mode not found.");
		}
		return false;
	},

	/**
	 * Метод возвращает список видимых объектов. 
	 */
	getVisibleObjects: function (mode) {
		
		var res = [];
		if (!mode) {
			alert("mode not found.");
			return res;
		}
		
		$.each(this.data.objects, $.proxy(function(index, object) {	
			if (this.objectIsVisible(object, mode))
				res.push(object);
		}, this));
		
		return res;
	},
	
	/**
	 * Метод возвращает список объектов принадлежащих данному тэгу. 
	 */
	getObjectsByTags: function (tag) {
		
		var res = [];
		if (tag.isObjectTag) {
			$.each(this.data.objects, $.proxy(function(index, object) {	
				if ($.inArray(object.tags, tag)) {
					res.push(object);
				}
			}, this));
		}
		
		if (tag.isRouteTag) {
			$.each(this.data.routes, $.proxy(function(index, route) {	
				if ($.inArray(route.tags, tag)) {
					res = res.concat(route.objects);
				}
			}, this));
		}
		
		return res;
	},
	
	/**
	 * Возвращает список всех объектов в зависимости от режима.
	 */
	getAllObjects: function (mode) {
		
		if (mode == "objects") {
			return this.data.objects;
		} else if (mode == "routes") {
			var res = [];
			$.each(this.data.objects, $.proxy(function(index, object) {	
				if (object.routes != null)
					res.push(object);
			}, this));
			return res;
		} else {
			alert("mode not found.");
		}
		
		return [];
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
			self.processing();
		});
	}
}
// Расширим до Observable.
$.extend(PermGuide.ApplicationData, PermGuide.Observable);

