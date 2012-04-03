// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Хранятся данные (события, достопримечательности, ...)
 */
PermGuide.ApplicationData = {
	
	/**
	 * Флаг того, что данные были загружены.
	 */
	loaded: false,
	
	/**
	 * Список доступных тегов, в виде ассоциативного массива где ключ это ID.
	 */
	tags: {},
	
	/**
	 * Список объектов, в виде ассоциативного массива где ключ это ID.
	 */
	objects: {},
	
	
	/**
	 * Список маршрутов, в виде ассоциативного массива где ключ это ID.
	 */
	routes: {},

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
		this.objects = {};
		this.routes = {};
		
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
			if (object.contacts)
			{
				if (object.contacts.address)
					object.contacts.address = PermGuide.Language.getString(object.contacts.address);
			}
			
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
				if (point.id) {
					
					var object = this.getObjectById(point.id);
					if (object.routes == null)
						object.routes = [];
					else
						alert("Отсутствует объект с id:"+point.id)
					object.routes.push(route);
					route.objects.push(object);
				}
				
			}, this));
			
		}, this));
		
		
		// Интернацианализируем информацию о перми.
		$.each(this.data.info, function(index, info) {	
			info.caption = PermGuide.Language.getString(info.caption);
			info.text = PermGuide.Language.getString(info.text);
		});

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
		
		// Ищем тэги в кэше.
		if (this.objects[id])
			return this.objects[id]
		
		var res = null;
		
		$.each(this.data.objects, $.proxy(function(index, object) {	
			if (object.id == id)
				res = object;
		}, this));
		
		if (res)
			this.objects[id] = res; 
				
		return res;
	},
	
	/**
	 * Метод возвращает случайный объект.
	 */
	getRandomObject: function () {
		var i = this.data.objects.length;
		//return a random integer between 0 and 10
		var index = Math.floor(Math.random()*i);
		
		var object = this.data.objects[index];
		if (object.tags.length == 0)
			object = this.getRandomObject();
		return object;
	},
	
	/**
	 * Метод возвращает случайный объект у которго есть основная картинка.
	 */
	getRandomObjectWithPicture: function () {
		var objects = $(this.data.objects).filter(function(item){ return this.mainPicture && this.tags && this.tags.length > 0; } )

		var i = objects.length;
		//return a random integer between 0 and 10
		var index = Math.floor(Math.random()*i);
		
		var object = objects[index];
		return object;
	},
	
	/**
	 * Метод возвращает маршрут по его id.
	 */
	getRouteById: function (id) {
		
		// Ищем тэги в кэше.
		if (this.routes[id])
			return this.routes[id];
		
		var res = null;
		$.each(this.data.routes, function(index, route) {	
			if (route.id == id)
				res = route;
		});
		
		if (res)
			this.routes[id] = res; 
				
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
		$.ajax({
			url: 'data.json',
			cache: false,
			dataType: 'json',
			success: function(data) {
				self.data = data;
				self.processing();
			},
			error:function() {
				alert("Ошибка загрузки данных.");
			}
		});
	}
}
// Расширим до Observable.
$.extend(PermGuide.ApplicationData, new PermGuide.Observable());

PermGuide.Interface = {};
/**
 * Метод инициализирует и создает слайдер объектов на карте.
 */
PermGuide.Interface.makeMapSlider = function(mapManager, mode, sliderElement) {
	
	$(sliderElement).slider();
	
	mapManager.attachListener("mapObjectSelected", function (object){
		$(sliderElement).data("state").selectByAttr("_id", object.id);
	});
	// Перерерандарим слайдер объектов.
	PermGuide.ApplicationData.attachListener(mode+"VisibleChanged", function (applicationData){
		////
		// Перерерандарим слайдер объектов.
		var objects = applicationData.getVisibleObjects(mode);
		$(sliderElement).html(
			$( "#objectSlideTemplate" ).render(objects)
		);
		$(sliderElement).find(".i18n").i18n();	// нужно чтобы перевести надпись "подробнее"
		$(sliderElement).data("state").reset();
		
		// Вешает обработсчики событий на каждый слайд.
		$(sliderElement).children(".slide").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = applicationData.getObjectById(objectId);
			applicationData.selectObject(object);
		});
		mapManager.selectObjectById(objects[0].id);
	});
	
	// Обработает события на переключение слайдера объектов.
	$(sliderElement).data("state").listener = function(index, element) {
		var objectId = element.attr("_id");
		mapManager.selectObjectById(objectId);
	};
};

/**
 * Метод инициализирует и создает интерфейс списка объектов.
 */
PermGuide.Interface.makeCatalog = function(mode, catalogElement) {

	PermGuide.ApplicationData.attachListener(mode+"VisibleChanged", function (applicationData){
		////
		// Сбросим позицию каталога.
		$(catalogElement).find(".vScroller").data("state").resetPosition();
		////
		// Перерендарим каталоги.
		var objects = applicationData.getVisibleObjects(mode);
		var objectItems = [];
		
		$.each(objects, function(index, object) {
			objectItems.push({
				id: object.id,
				name: object.name,
				distance: true,
				color: (mode=="objects") ? object.objectColor : object.routeColor
			});
		});
		
		$(catalogElement).find(".vScroller").html(
			$( "#catalogItemTemplate" ).render(objectItems)
		);
		
		////
		// Повешаем на вубор объекта из каталога, событие.
		$(catalogElement).find(".catalogItem").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = applicationData.getObjectById(objectId);
			PermGuide.ApplicationData.selectObject(object);
		});
	});
}


/**
 * Метод инициализирует и создает список случайных объектов на первой странице.
 */
PermGuide.Interface.makePopularObjectsAndRoutes = function(
		popularObjectItemContainer, popularRouteItemContainer) {

	////
	// Обработчик события загрузки данных 
	PermGuide.ApplicationData.attachListener("loaded", function (applicationData){
		////
		// Формирование первой страницы со случайными объектами.
		var objects = [];
		//var popularObjects = [];
		objects.push(PermGuide.ApplicationData.getRandomObject());
		objects.push(PermGuide.ApplicationData.getRandomObject());
		objects.push(PermGuide.ApplicationData.getRandomObject());
		objects.push(PermGuide.ApplicationData.getRandomObject());

		var objectItems = [];
		
		$.each(objects, function(index, object) {
			var tag = object.tags[0];

			objectItems.push({
				id: object.id,
				name: object.name,
				tagName: tag.name,
				distance: true,
				color: tag.color
			});
		});
		
		$(popularObjectItemContainer).html(
			$( "#catalogItemTemplate" ).render(objectItems)
		);
		
		////
		// Повешаем обработчик на выбор популярного объекта.
		$(popularObjectItemContainer).find(".catalogItem").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = applicationData.getObjectById(objectId);
			var tag = object.tags[0];
			tag.activate();
			objectsMapManager.selectObject(object, true);
			
			var pageSlider = $("#mainScreenSlider").data("state");
			pageSlider.select(1);
		});

		////
		// Формирование первой страницы со случайными маршрутами.
		objectItems = [];
		var routes = PermGuide.ApplicationData.data.routes;
		$.each(routes, function(index, route) { 
			var tag = route.tags[0];
			
			objectItems.push({
				id: tag.id,
				name: route.description,
				tagName: tag.name,
				distance: false,
				color: tag.color
			});
		});
		
		$(popularRouteItemContainer).html(
			$( "#catalogItemTemplate" ).render(objectItems)
		);
		
		////
		// Повешаем обработчик на выбор популярного объекта.
		$(popularRouteItemContainer).find(".catalogItem").touchclick( function (event) {
			var tagId = $(event.target).parent().attr("_id");
			var tag = applicationData.getTagById(tagId);
			tag.activate();
			
			var pageSlider = $("#mainScreenSlider").data("state");
			pageSlider.select(2);
		});
	});

};

/**
 * Создает и инициализирует "экран" в приложении.
 */
PermGuide.Interface.makeScreen = function(screenElement) {

	////
	// Инициализируем слайдер страниц.
	$(screenElement).find(".pageSlider").slider();
	
	var pageSlider = $(screenElement).find(".pageSlider").data("state");
	pageSlider.touchInsensitive = true;
	
	// Устанавливает обработчик переключения страниц.
	pageSlider.listener = function(index) {
		//alert("listener: "+index);
		$(screenElement).find(".pageScroller .pageIndicator").removeClass("active");
		$(screenElement).find(".pageScroller .pageIndicator").slice(index, index+1).addClass("active");
	};
	pageSlider.listener(0); // Подсветим сразуже первую страницу.
	
	$(screenElement).find(".pageScroller .pageIndicator").touchclick( function(event) {
		var pageId = parseInt($(event.target).parent().attr("_id"));
		pageSlider.select(pageId);
	});
	
	// Вешаем на скроллер события тача.
	$(screenElement).find(".pageScroller").touchstart( function(event) {
		pageSlider.down(event);
	});
	
	$(screenElement).find(".pageScroller").touchmove( function(event) {
		pageSlider.move(event);
	});

	$(screenElement).find(".pageScroller").touchend( function(event) {
		pageSlider.up(event);
	});
	////

}
/**
 * Метод инициализирует и создает члучайную картинку на первой странице.
 */
PermGuide.Interface.makeRandomObject = function(container) {

	////
	// Обработчик события загрузки данных 
	PermGuide.ApplicationData.attachListener("loaded", function (applicationData){
		
		var object = PermGuide.ApplicationData.getRandomObjectWithPicture();
		
		$(container).html(
			$( "#randomObjectTemplate" ).render([object])
		);

		////
		// Повешаем обработчик на выбор популярного объекта.
		$(container).find(".randomObject").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = applicationData.getObjectById(objectId);
			var tag = object.tags[0];
			tag.activate();
			objectsMapManager.selectObject(object, true);
			
			var pageSlider = $("#mainScreenSlider").data("state");
			pageSlider.select(1);
		});
	});
};
