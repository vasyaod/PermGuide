
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};
PermGuide.Interface = {};

/**
 * Метод инициализирует и создает слайдер объектов на карте.
 */
PermGuide.Interface.makeMapSlider = function(mapManager, mode, sliderElement) {
	
	$(sliderElement).slider();
	
	mapManager.attachListener("mapObjectSelected", function (object){
		$(sliderElement).data("state").selectByAttr("_id", object.id);
	});

	// Рендер слайдера объектов на карте.
	var renderSlider = function (applicationData){
		////
		// Перерерандарим слайдер объектов.
		var objects = PermGuide.ApplicationData.getVisibleObjects(mode, true);
		$(sliderElement).html(
			$( "#objectSlideTemplate" ).render(objects)
		);
		$(sliderElement).find(".i18n").i18n();	// нужно чтобы перевести надпись "подробнее"
		$(sliderElement).find(".distance").distanceRefresh();
		$(sliderElement).data("state").reset();
		
		// Вешает обработсчики событий на каждый слайд.
		$(sliderElement).children(".slide").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = PermGuide.ApplicationData.getObjectById(objectId);
			PermGuide.ApplicationData.selectObject(object);
		});
		
		mapManager.selectObjectById(objects[0].id);
	}
	
	// Обработает события на переключение слайдера объектов.
	$(sliderElement).data("state").listener = function(index, element) {
		var objectId = element.attr("_id");
		mapManager.selectObjectById(objectId);
	};

	// Перерерандарим слайдер объектов.
	PermGuide.ApplicationData.attachListener(mode+"VisibleChanged", renderSlider);
	
	var cRendered = false;
	PermGuide.ApplicationData.attachListener("loaded", function () {
		
		// Повещаем обработчики на стрелки в слайдере.
		$(sliderElement).parent().parent().find(".arrowLeft").touchclick( function (event) {
			$(sliderElement).data("state").prev();
		}, true);
		
		$(sliderElement).parent().parent().find(".arrowRight").touchclick( function (event) {
			$(sliderElement).data("state").next();
		}, true);

		// При первом поступлении координат отрендарим его ещё раз.
		PermGuide.Geolocation.attachListener("rateRefreshed", function (){
			if (cRendered)
				return;
			cRendered = true;
			
			renderSlider();
		});
	});
	
};

/**
 * Метод инициализирует и создает интерфейс списка объектов.
 */
PermGuide.Interface.makeCatalog = function(mode, catalogElement) {
	
	var renderCatalog = function () {
		////
		// Сбросим позицию каталога.
		$(catalogElement).find(".vScroller").data("state").resetPosition();
		////
		// Перерендарим каталоги, при этом сортируем оп растоянию.
		var objects = PermGuide.ApplicationData.getVisibleObjects(mode, true);
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
		$(catalogElement).find(".distance").distanceRefresh();
		
		////
		// Повешаем на вубор объекта из каталога, событие.
		$(catalogElement).find(".catalogItem").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = PermGuide.ApplicationData.getObjectById(objectId);
			PermGuide.ApplicationData.selectObject(object);
		});
	};
	
	
	PermGuide.ApplicationData.attachListener(mode+"VisibleChanged", renderCatalog);
		
	var cRendered = false;
	PermGuide.ApplicationData.attachListener("loaded", function () {
		// При первом поступлении координат отрендарим его ещё раз.
		PermGuide.Geolocation.attachListener("rateRefreshed", function (){
			if (cRendered)
				return;
			cRendered = true;
			
			renderCatalog();
		});
	});
}


/**
 * Метод инициализирует и создает список случайных объектов на первой странице.
 */
PermGuide.Interface.makePopularObjectsAndRoutes = function(
		popularObjectItemContainer, popularRouteItemContainer) {
	
	// Возвращает 4 штуки случаных объектов.
	var randomObjects = function (){
		var objects = [];
		var tags = PermGuide.ApplicationData.getRandomTags(4);

		objects.push(PermGuide.ApplicationData.getRandomObject(tags[0]));
		objects.push(PermGuide.ApplicationData.getRandomObject(tags[1]));
		objects.push(PermGuide.ApplicationData.getRandomObject(tags[2]));
		objects.push(PermGuide.ApplicationData.getRandomObject(tags[3]));
		
		return objects;
	}
	
	// Возвращает 4 штуки ближайших объектов.
	var nearObjects = function(){
		var objects = [];
		var tags = PermGuide.ApplicationData.getRandomTags(4);

		objects.push(PermGuide.ApplicationData.getObjectsByFirstTag(tags[0], true)[0]);
		objects.push(PermGuide.ApplicationData.getObjectsByFirstTag(tags[1], true)[0]);
		objects.push(PermGuide.ApplicationData.getObjectsByFirstTag(tags[2], true)[0]);
		objects.push(PermGuide.ApplicationData.getObjectsByFirstTag(tags[3], true)[0]);
		return objects;
	};
	// Рендарит список объектов на первую страницу.
	var renderObjects = function (objects){
		
		////
		// Формирование первой страницы со случайными объектами.
		var objectItems = [];
		
		$.each(objects(), function(index, object) {
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
		$(popularObjectItemContainer).find(".distance").distanceRefresh();
		////
		// Повешаем обработчик на выбор популярного объекта.
		$(popularObjectItemContainer).find(".catalogItem").touchclick( function (event) {
			var objectId = $(event.target).parent().attr("_id");
			var object = PermGuide.ApplicationData.getObjectById(objectId);
			var tag = object.tags[0];
			tag.activate();
			objectsMapManager.selectObject(object, true);
			
			PermGuide.ScreenManager.goToPage(1);
		});
	};

	var renderRandomRoutes = function (){

		////
		// Формирование первой страницы со случайными маршрутами.
		var objectItems = [];
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
			var tag = PermGuide.ApplicationData.getTagById(tagId);
			tag.activate();
			
			PermGuide.ScreenManager.goToPage(2);
		});
	};
	
	// Раз в пару минут буде меререндаривать 
	var timeoutId = setTimeout(function() {
		//if (PermGuide.Geolocation.lastPosition) {
		//	renderObjects(nearObjects);
		//} else {
			renderObjects(randomObjects);
		//}
	}, 180*1000);
	
	var cRendered = false;
	PermGuide.ApplicationData.attachListener("loaded", function() {
		
		//if (PermGuide.Geolocation.lastPosition) {
		//	renderObjects(nearObjects);
		//} else {
			renderObjects(randomObjects);

			// При первом поступлении координат отрендарим его ещё раз.
		//	PermGuide.Geolocation.attachListener("rateRefreshed", function (){
		//		if (cRendered)
		//			return;
		//		cRendered = true;
		//		renderObjects(nearObjects);
		//		
		//	});
		//}
	});
	
	PermGuide.ApplicationData.attachListener("loaded", renderRandomRoutes);
};

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
			
			PermGuide.ScreenManager.goToPage(1);
		});
	});
};

/**
 * Метод инициализирует и создает выподающее меню.
 */
PermGuide.Interface.makeDropDownMenu = function(mode, element) {
	////
	// Обработчик события загрузки данных 
	PermGuide.ApplicationData.attachListener("loaded", function (){
		////
		// Формирование выподающего окна со списком тэгов.
		$(element).find(".vScroller").html(
			$( "#tagTemplate" ).render(PermGuide.ApplicationData.getTags(mode))
		);
		$(element).data("state").resize();   // Обновим размеры.
		
		$(element).find(".tag").touchclick( function (event) {
			var tagId = $(event.target).parent().attr("_id");
			var tag = PermGuide.ApplicationData.getTagById(tagId);
			if (tag == null)
				return;
			tag.activate();
			
			// Закрываем выподающее окне при выборе тэга.
			$(element).data("state").close();
		});

		////
		// Заполнение слайдера тэгов.
		$(element).find(".tagSlider").html(
			$( "#tagSlideTemplate" ).render(PermGuide.ApplicationData.getTags(mode))
		);
		
		$(element).find(".tagSlider").slider();
		
		$(element).find(".tagSlider").data("state").listener = function(index, element) {
			var tagId = element.attr("_id");
			var tag = PermGuide.ApplicationData.getTagById(tagId);
			if (tag == null)
				return;
			tag.activate();
		};
		
		// Повещаем обработчики на стрелки в слайдере.
		$(element).find(".arrowLeft").touchclick( function (event) {
			$(element).find(".tagSlider").data("state").prev();
		}, true);
		
		$(element).find(".arrowRight").touchclick( function (event) {
			$(element).find(".tagSlider").data("state").next();
		}, true);
	});
	
	// При включении/отключении тэгов, формируем 
	PermGuide.ApplicationData.attachListener(mode+"VisibleChanged", function (){
		
		// Переберем все тэги, и раставим классы в зависимости виден данный
		// тэг или нет.
		$(element).find(".tag").each( function() {
			var tagId = $(this).attr("_id");
			var tag = PermGuide.ApplicationData.getTagById(tagId);
			if (tag == null)
				return;
			if (tag.visible)
				$(this).addClass("visibledTag");
			else
				$(this).removeClass("visibledTag");
		});
		
		// Спозиционируем слайдеры.
		var objectTag = PermGuide.ApplicationData.getVisibleTags(mode)[0];
		$(element).find(".tagSlider").data("state").selectByAttr("_id", objectTag.id);
		
	});
}