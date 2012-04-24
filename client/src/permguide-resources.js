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
	
	indexFileName: "/index.json",
	
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
		
		console.log("Реестр ресурсов "+this.url+this.indexFileName+", ревизия: "+data.revision+", количество ресурсов в реестре: "+this.resources.length);
	},
	
	/**
	* Метод загружает список ресурсов с сервера.
	* 
	*  callback - обработчик события, о готовности данных.
	*/
	load: function(callback, minRevision) {
		
		if(!minRevision)
			minRevision = 0;
		
		var url = this.url+this.indexFileName;
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
				source: this.serverSource.url+PermGuide.ResourcesSource.prototype.indexFileName,
				target: dirEntry.fullPath+PermGuide.ResourcesSource.prototype.indexFileName
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
		var hash = "";
		//console.log("Запрошен ресурс: "+resourceName);
		$(this.sources).each(function() {
			if (this.revision > revision) {
				var resource = this.getResource(resourceName);
				if (resource && hash != this.hash) {
					//if (!res) {
						res = resource;
						revision = this.revision;
						hash = this.hash;
					//} else if() {
				}
			}
		});
		
		if (res) {
			var url = res.source.url+"/"+res.name;
			//console.log("Найден ресурс: "+url);
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
		this.serverSource = new PermGuide.ResourcesSource("http://permguide.ru/resources");
		sourceList.push(this.serverSource);
		if (this.canCreateCache()) {
			this.cacheSource = new PermGuide.ResourcesSource(this.cacheURL());
			sourceList.push(this.cacheSource);
		}
		this.localSource = new PermGuide.ResourcesSource("resources");
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

// Расширим до Observable.
$.extend(PermGuide.ResourceManager, new PermGuide.Observable());
