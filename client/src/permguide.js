// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Класс представляет из себя испочник ресурсов.
 * 
 * Параметры:
 *  minRevision - минимальная версия начиная с которой данные считаются 
 *                актуальными;
 *  url - url списка доступных ресурсов.
 */
PermGuide.ResourcesSource = function(url) {
	
	this.revision = 0;
	this.url = url
	this.resources = [];
	this.resourcesHash = {};
};

PermGuide.ResourcesSource.prototype = {
		
	/**
	 * Возвращает описание ресурса по его имени.
	 */
	getResource: function(resourceName) {
		/*
		var res;
		$(this.resources).each(function(){
			if (this.name == resourceName)
				res = this;
		});
		
		return res;
		*/
		return this.resourcesHash[resourceName];
	},
	
	/**
	 * Обработка загруженных данных.
	 */	
	processing: function(data, minRevision) {
		this.resourcesMap = {};
		this.resources = [];
		
		if (!data.revision) // Ревизия не указанна что неправельно, выходим.
			return;

		if (data.revision <= minRevision) // Данные устарели, опять же выходим.
			return;
		
		// Копируем информацию о ревизии в текущий объект.
		$.extend(this, data);
		
		// Сразу строим индекс, в котором можно будет искать по имени.
		var self = this;
		$(this.resources).each(function(){
			self.resourcesHash[this.name] = this;
			this.source = self;  // Сохраним в ресурсе ссылку на источник.
		});
		
		console.log("Реестр ресурсов "+this.url+"/resources.json, ревизия: "+data.revision+", количество ресурсов в реестре: "+this.resources.length);
	},
	
	/**
	* Метод загружает список ресурсов с сервера.
	* 
	*  callback - обработчик события, о готовности данных.
	*/
	load: function(callback, minRevision) {
		
		if(!minRevision)
			minRevision = 0;
		
		var url = this.url+"/resources.json";
		var self = this;
		
		
		var cache = true;
		if (!PermGuide.isPhonegap)
			cache = false;
		
		if (url.indexOf('http://') != -1)
			cache = false;
		
		console.log("Загрузка реестра ресурсов "+url+", cache: "+cache);	
		$.ajax({
			url: url,
			cache: cache,
			dataType: 'json',
			success: function(data) {
				self.isError = false;
				console.log("Реестр ресурсов "+url+" загружен (revision "+data.revision+").");
				self.processing(data, minRevision);
				callback();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				self.isError = true;
				console.log("При загрузке реестра ресурсов "+url+" произошла ошибка.");
				callback();
			}
		});
	},
};

PermGuide.AndroidCacheManager = {
	/**
	 * Флаг того что объект корректно инициализирован.
	 */
	inited: false,
	
	init: function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			$.proxy(function(fileSystem) {
				this.inited = true;
				this.fileSystem = fileSystem;
				this.load();
			}, this), 
			$.proxy(function(evt) {
				console.log("Ошибка при получении файловой системы: "+evt.target.error.code);
				this.load();
			}, this)
		);
	},
	
	/**
	 * Метод возвращает true, если кэш может быть создан на данном устройстве.
	 */
	canCreateCache: function() {
		return true && this.inited;
	},
		
	/**
	 * Метод возвращает URL кэша.
	 */
	cacheURL: function() {
		return this.fileSystem.root.fullPath+"/permguide";
	},

	/**
	 * Метод производит обновление кэша.
	 */
	updateCache: function() {
		console.log("Запущено обновление кэша.");
		var self = this;
		var downloadCounter = 0;  // Счетчик скаченых файлов.
		var downloadQueue = [];   // Очередь файлов для скачивания.
		var fileTransfer = new FileTransfer();
		
		var cacheSourceRefresh = function(error) {
			console.log("Обновлен источник ресурсов из кэша.");
			$.extend(self.cacheSource, self.serverSource);
			self.cacheSource.url = self.cacheURL();
		}

		var updateError = function(error) {
			console.log("Ошибка при загрузке кэша: "+error.code);
			self.onCacheUpdateError();
		}
		
		// Загрузка ресурса.
		var downloadResource  = function(object) { 
			
			fileTransfer.download(
					object.source,
					object.target,
					$.proxy(downloadResourceComplete, self),
					$.proxy(updateError, self)
				);
		};
		
		// Выполняется если ресурс успешно загружен. Если в очереди остались
		// незагруденые ресурсы, тогда загрузка продолжается. 
		var downloadResourceComplete = function(dirEntry) { 
			console.log("Ресурс загружен: " + dirEntry.fullPath);
			downloadCounter++;
			
			// Если все файлы загружены, тогда рапортуем о завершении загрузки кэша.
			if (downloadQueue.length == 0) {
				cacheSourceRefresh();
				self.onCacheUpdateSuccessful();
			} else {
				downloadResource(downloadQueue.pop());
			}
		};
		
		// Формирует очередь загружаемых ресурсов и начинает загрузку.
		var downloadResources = function(dirEntry) { 
			console.log("Новая директория для кэша создана: "+dirEntry.fullPath);
			console.log("Загрузка ресурсов кэш, количество ресурсов (+индексный файл): "+(this.serverSource.resources.length+1));
			
			////
			// Добавим в очередь на загрузку индекс.
			downloadQueue.push({
				source: this.serverSource.url+"/resources.json",
				target: dirEntry.fullPath+"/resources.json"
			});
			
			////
			// Добавим в очередь на загрузку сами ресурсы.
			$.each(this.serverSource.resources, $.proxy(function(index, resource) {	
				
				downloadQueue.push({
					source: this.serverSource.url+"/"+resource.name,
					target: dirEntry.fullPath+"/"+resource.name
				});
			}, this));
			
			////
			// Начинаем загружать ресурсы.
			downloadResource(downloadQueue.pop());
		};
		
		var createCacheDirectory = function() { 
			console.log("Кэш успешно очищен, создание новой директории.");
			this.fileSystem.root.getDirectory("permguide", {create: true},
				$.proxy(downloadResources, this),
				$.proxy(updateError, this)
			);
		};

		var removeCache = function(dir) { 
			console.log("Получена директория в которой находится кэш, удаляем из неё все файлы.");
			dir.removeRecursively(
				$.proxy(createCacheDirectory, this),
				$.proxy(updateError, this)
			);
		};
		
		this.fileSystem.root.getDirectory("permguide", {create: true},
			$.proxy(createCacheDirectory, this),
			$.proxy(updateError, this)
		);
	},


};

PermGuide.ResourceManager = {
	
	/**
	 * Список источников ресурсов.
	 */
	sources: [],
	
	init:  function() {
		this.load();
	},
	
	/**
	 * Метод возвращает полный URL ресурса по его названию.
	 */
	getResourceURL: function(resourceName) {
		var res;
		var revision = 0;
		console.log("Запрошен ресурс: "+resourceName);
		$(this.sources).each(function() {
			if (this.revision > revision) {
				var resource = this.getResource(resourceName);
				if (resource) {
					//if (!res) {
						res = resource;
						revision = this.revision;
					//} else if() {
				}
			}
		});
		
		if (res) {
			var url = res.source.url+"/"+res.name;
			console.log("Найден ресурс: "+url);
			return url;
		}
			
		return resourceName;
	},
	
	/**
	 * Метод возвращает true, если кэш может быть создан на данном устройстве.
	 */
	canCreateCache: function() {
		return false;
	},
	
	/**
	 * Метод возвращает URL кэша.
	 */
	cacheURL: function() {
		return null;
	},
	
	/**
	 * Метод возвращает true, если кэш уже существует на диске.
	 */
	cacheCreated: function() {
		if (!this.cacheSource)
			return false;
		if (!this.cacheSource.revision)
			return false;
		
		return true;
	},
	
	/**
	 * Метод возвращает true, если кэш можно обновить с сервера.
	 */
	needUpdateCache: function() {
		if (this.cacheSource && this.cacheSource.revision < this.serverSource.revision)
			return true;
		return false;
	},
	
	/**
	 * Метод производит обновление кэша.
	 */
	updateCache: function() {},
	
	/**
	 * Метод загружает реестры ресурсов из указанного скиска источников.
	 */
	loadFromSourceList: function (sourceList, minRevision) {
		
		var source = sourceList.pop();
		var self = this;
		source.load(function() {
			// Если источник содержит свежие данные, то добавим его в список.
			if (source.revision > minRevision) {
				self.sources.push(source);
				minRevision = source.revision;
			}
			
			// Смотрим надо ли загружать другие источники.
			if (sourceList.length > 0) {
				self.loadFromSourceList(sourceList, minRevision);
			} else {
				self.onLoadSources();
			}
		}, minRevision);
	},

	/**
	 * Загрузка данных из различных источников. 
	 */
	load: function () {
		var sourceList = [];
		
		// Есть три типа источников.
		// - сервер;
		// - файловый кэш;
		// - и данные зашитые в программу.
		this.serverSource = new PermGuide.ResourcesSource("http://permguide.ru");
		sourceList.push(this.serverSource);
		if (this.canCreateCache()) {
			this.cacheSource = new PermGuide.ResourcesSource(this.cacheURL());
			sourceList.push(this.cacheSource);
		}
		this.localSource = new PermGuide.ResourcesSource(".");
		sourceList.push(this.localSource);
		
		// Загрузка информации о ресурсах из указанных выше источников. 
		this.loadFromSourceList(sourceList, 0);
	},
	
	/**
	 * Событие, которые выполняется при окончании загрузки источников ресурсов.
	 */
	onLoadSources: function () {},

	/**
	 * Событие, вызывается когда кэш успешно обновился.
	 */
	onCacheUpdateSuccessful: function () {},

	/**
	 * Событие, вызывается при возникновении ошибки в обновлении.
	 */
	onCacheUpdateError: function () {}
};

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
	 * Возвращает список тэгов в зависимости от режима.
	 */
	getTags: function(mode)
	{	
		if (mode == "objects")
			return this.getObjectTags();
		if (mode == "routes")
			return this.getRouteTags();
		
		return this.data.tags;
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
	 * Возвращает список видимых тэгов в зависимости от режима.
	 */
	getVisibleTags: function(mode)
	{	
		if (mode == "objects")
			return this.getVisibleObjectTags();
		if (mode == "routes")
			return this.getVisibleRouteTags();
		
		return [];
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
			
			////
			// Проверяем наличие картинок в ресурсах.
			if (object.mainPicture) {
				object.mainPicture = PermGuide.ResourceManager.getResourceURL(object.mainPicture);
			}
			if (object.pictures) {
				var newPictures = [];
				$(object.pictures).each(function() {	
					newPictures.push(PermGuide.ResourceManager.getResourceURL(this));
				});
				object.pictures = newPictures;
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
			// и о checkPoint, пускай чекпоинт - это точка на маршруте связаная с
			// объектом.
			route.checkPoints = [];
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
					route.checkPoints.push(point);
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
	getVisibleObjects: function (mode, sorted) {
		
		var res = [];
		if (!mode) {
			alert("mode not found.");
			return res;
		}
		
		$.each(this.data.objects, $.proxy(function(index, object) {	
			if (this.objectIsVisible(object, mode))
				res.push(object);
		}, this));
		
		if (sorted && PermGuide.Geolocation.lastPosition) {
			res.sort(function sortFunction(a, b){
				var distanceA = PermGuide.Geolocation.relativeDistance(a.point.lat, a.point.lng);
				var distanceB = PermGuide.Geolocation.relativeDistance(b.point.lat, b.point.lng);
				if(distanceA < distanceB)
					return -1;
				if(distanceA > distanceB)
					return 1;
				return 0;
			});
		}
		return res;
	},
	
	/**
	 * Метод возвращает список объектов принадлежащих данному тэгу. 
	 */
	getObjectsByTags: function (tag, sorted) {
		
		var res = [];
		if (tag.isObjectTag) {
			$.each(this.data.objects, $.proxy(function(index, object) {	
				if ($.inArray(tag, object.tags) >= 0 ) {
					res.push(object);
				}
			}, this));
		}
		
		if (tag.isRouteTag) {
			$.each(this.data.routes, $.proxy(function(index, route) {	
				if ($.inArray(tag, route.tags) >= 0) {
					res = res.concat(route.objects);
				}
			}, this));
		}

		if (sorted && PermGuide.Geolocation.lastPosition) {
			res.sort(function sortFunction(a, b){
				var distanceA = PermGuide.Geolocation.relativeDistance(a.point.lat, a.point.lng);
				var distanceB = PermGuide.Geolocation.relativeDistance(b.point.lat, b.point.lng);
				if(distanceA < distanceB)
					return -1;
				if(distanceA > distanceB)
					return 1;
				return 0;
			});
		}
		
		return res;
	},
	
	/**
	 * Метод возвращает список объектов у которых первый тэг соответствует указанному. 
	 */
	getObjectsByFirstTag: function (tag, sorted) {
		
		var res = [];
		if (tag.isObjectTag) {
			$.each(this.data.objects, $.proxy(function(index, object) {	
				if (object.tags && object.tags[0] == tag) {
					res.push(object);
				}
			}, this));
		}
		
		if (tag.isRouteTag) {
			$.each(this.data.routes, $.proxy(function(index, route) {	
				if (route.tags && route.tags[0] == tag) {
					res = res.concat(route.objects);
				}
			}, this));
		}

		if (sorted && PermGuide.Geolocation.lastPosition) {
			res.sort(function sortFunction(a, b){
				var distanceA = PermGuide.Geolocation.relativeDistance(a.point.lat, a.point.lng);
				var distanceB = PermGuide.Geolocation.relativeDistance(b.point.lat, b.point.lng);
				if(distanceA < distanceB)
					return -1;
				if(distanceA > distanceB)
					return 1;
				return 0;
			});
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
	getRandomObject: function (tag) {
		var objects = [];
		if (tag)
			objects = $(this.data.objects).filter(function(item){ return this.tags && this.tags[0] == tag && this.tags.length > 0; } )
		else
			objects = $(this.data.objects).filter(function(item){ return this.tags && this.tags.length > 0; } )
		
		var i = objects.length;
		var index = Math.floor(Math.random()*i);

		return objects[index];
	},
	
	/**
	 * Метод возвращает случайный объект у которго есть основная картинка.
	 */
	getRandomObjectWithPicture: function () {
		var objects = $(this.data.objects).filter(function(item){ return this.mainPicture && this.tags && this.tags.length > 0; } )
		
		var i = objects.length;
		var index = Math.floor(Math.random()*i);
		
		return objects[index];
	},

	/**
	 * Метод возвращает указанное количество рандомных тэгов.
	 */
	getRandomTags: function (count) {
//		var tags 
//		if (excludeTags)
//			tags = $(this.data.tags).filter(function(item){ return this.; } )
//		else
//			tags = $(this.data.tags).filter(function(item){ return this.; } )
		
		var res = [];
		while (res.length != count)
		{
			var i = this.data.tags.length;
			var index = Math.floor(Math.random()*i);
			var tag = this.data.tags[index];
			
			if (tag.isObjectTag && $.inArray(tag, res) == -1)
				res.push(tag);
		}
		return res;
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
		this.selectedObject = object;
		this.notify("objectSelected", object);
	},
	
	_load: function (urlList) {
		
		var url = urlList.pop();
		var self = this;

		var cache = true;
		if (!PermGuide.isPhonegap)
			cache = false;
		
		console.log("Загрузка данных об объектах из источника: "+url+", cache: "+cache);
		$.ajax({
			url: url,
			cache: cache,
			dataType: 'json',
			success: function(data) {
				self.data = data;
				self.processing();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				console.log("Ошибка загрузки данных из "+url);
				if (urlList.length > 0) {
					self._load(urlList);
				}
				else
					alert("Ошибка загрузки данных.");
			}
		});
	},
	
	/**
	 * Загрузка данных из различных источников. 
	 */
	load: function () {
		
		// Перечислим список мест откуда загружать данные.
		// Сделано это потому, что видете ли Андпройд 4 не захотел загружать
		// данные с простого урла "data.json", что ему не понравилось, я не знаю.
		
		var dataUrl = PermGuide.ResourceManager.getResourceURL("data.json");
		// Внимание, урлы применются с конца массива.
		this._load(["http://permguide.ru/data.json", dataUrl]);
	}
}
// Расширим до Observable.
$.extend(PermGuide.ApplicationData, new PermGuide.Observable());
