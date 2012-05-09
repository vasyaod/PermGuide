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
 *  isCacheSource - true если источник ресурсов является кэшем.
 */
PermGuide.ResourcesSource = function(url, isCacheSource) {
	
	this.revision = 0;
	this.url = url
	this.resources = [];
	this.resourcesHash = {};

	if (isCacheSource)
		this.isCacheSource = true;
	else 
		this.isCacheSource = false;
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
		var resource = this.resourcesHash[resourceName];
		// Если источник является кэшем, а ресурс хранится на сервере, то игнорируем его.
		if (this.isCacheSource && resource && resource.serverLocation)
			return null;
		return resource;
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
		
		// Небольшая заплптка в безопастности, не даем выходить за пределы кэша.
		var allow = true;
		$(data.resources).each(function(){
			if (name.indexOf("..") != -1) {
				console.warn("Ресурс ("+name+") пытается получить доступ за предклы кэша.");
				allow = false;
			}
		});
		
		if (!allow) {
			console.warn("Индекс содержит недопустимые данные и был забракован.");
			return;
		}
		// Копируем информацию из индексной информации.
		this.revision = data.revision;
		this.totalSize = data.totalSize;
		this.cacheSize = data.cacheSize;
		this.resources = data.resources;
		
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
		// LocalFileSystem.PERSISTENT and LocalFileSystem.TEMPORARY
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
		var downloadCounter = 0;       // Счетчик скаченых файлов.
		var downloadSizeCounter = 0;   // Счетчик скаченых байтов.
		var downloadTotal = 0;         // Количество файлов которое надо скачать.
		var downloadSizeTotal = 0;     // Общий размер файлов который надо скачать.
		var downloadQueue = [];        // Очередь файлов для скачивания.
		var fileTransfer = new FileTransfer();
		
		var cacheSourceRefresh = function(error) {
			console.log("Обновление индекса кэша.");

			self.cacheSource = new PermGuide.ResourcesSource(self.cacheURL(), true);
			self.cacheSource.load(function() {
				console.log("Индекс кэша успешно обновлен.");
				self.notify("onCacheUpdateSuccessful");
				self.notify("onCacheUpdateCompleted");
			}, 0);
		}

		var updateError = function(error) {
			console.log("Ошибка при загрузке кэша: "+error.code);

			// При ошибке надо сбросить источник.
			self.cacheSource.revision = 0;
			self.cacheSource.resources = [];
			self.cacheSource.resourcesHash = {};

			self.notify("onCacheUpdateError");
			self.notify("onCacheUpdateCompleted");
		}
		
		// Загрузка ресурса.
		var downloadResource  = function(object) { 
			
			fileTransfer.download(
					object.source,
					object.target,
					function(dirEntry) {
						downloadResourceComplete(dirEntry, object)
					},
					updateError
				);
		};
		
		// Выполняется если ресурс успешно загружен. Если в очереди остались
		// незагруденые ресурсы, тогда загрузка продолжается. 
		var downloadResourceComplete = function(dirEntry, object) { 
			console.log("Ресурс загружен: " + dirEntry.fullPath);
			downloadSizeCounter += object.size;
			downloadCounter++;
			
			// Уведомляем о количестве загруженных ресурсов.
			self.notify("onDownloadResource", { 
				fileCounter: downloadCounter, 
				fileTotal: downloadTotal, 
				sizeCounter: downloadSizeCounter,
				sizeTotal: downloadSizeTotal
			});
			
			// Если все файлы загружены, тогда рапортуем о завершении загрузки кэша.
			if (downloadQueue.length == 0) {
				cacheSourceRefresh();
			} else {
				downloadResource(downloadQueue.pop());
			}
		};
		
		// Формирует очередь загружаемых ресурсов и начинает загрузку.
		var downloadResources = function(dirEntry) { 
			console.log("Новая директория для кэша создана: "+dirEntry.fullPath);
			
			////
			// Добавим в очередь на загрузку индекс.
			downloadQueue.push({
				size: 0,
				source: this.serverSource.url+PermGuide.ResourcesSource.prototype.indexFileName,
				target: dirEntry.fullPath+PermGuide.ResourcesSource.prototype.indexFileName
			});
			
			////
			// Добавим в очередь на загрузку сами ресурсы.
			$.each(this.serverSource.resources, $.proxy(function(index, resource) {	
				// Если resource.serverLocation равно true, то файлы должны находится на
				// сервере и не должны поподать в кэш.
				if (!resource.serverLocation) {
					downloadQueue.push({
						size: resource.size,
						source: this.serverSource.url+"/"+resource.name,
						target: dirEntry.fullPath+"/"+resource.name
					});
				}
			}, this));

			downloadTotal = downloadQueue.length;
			downloadSizeTotal = this.serverSource.cacheSize;
			console.log("Загрузка ресурсов кэш, количество ресурсов для загрузки(+индексный файл): "+downloadTotal);
			
			// Уведомляем о количестве загруженных ресурсов.
			self.notify("onDownloadResource", 0, downloadTotal);
			
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

		var removeCache = function(dirEntry) { 
			console.log("Получена директория в которой находится кэш, удаляем из неё все файлы: "+dirEntry.fullPath);
			dirEntry.removeRecursively(
				$.proxy(createCacheDirectory, this),
				$.proxy(updateError, this)
			);
		};
		
		this.fileSystem.root.getDirectory("permguide", {create: true},
			$.proxy(removeCache, this),
			$.proxy(updateError, this)
		);
	},


};

PermGuide.ResourceManager = {
	
	init:  function() {
		this.load();
	},

	/**
	 * Возвращает true если данный ресурс находится либо в кэше, либо вшит в саму 
	 * программу.
	 */
	isLocalRecource: function(resourceName) {

		if (this.localSource.getResource(resourceName))
			return true;
		if (this.cacheSource && this.cacheSource.getResource(resourceName))
			return true;
		
		return false;
	},
	
	/**
	 * Метод возвращает полный URL ресурса по его названию.
	 */
	getResourceURL: function(resourceName) {
		var res;
		var revision = 0;
		var hash = "";
		var sources = [];
		
		sources.push(this.localSource);
		if (this.cacheSource)
			sources.push(this.cacheSource);
		sources.push(this.serverSource);
		
		//console.log("Запрошен ресурс: "+resourceName);
		$(sources).each(function() {
			if (this.revision > revision) {
				var resource = this.getResource(resourceName);
				if (resource && hash != this.hash) {
					res = resource;
					revision = this.revision;
					hash = this.hash;
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
			if (minRevision < source.revision)
				minRevision = source.revision;
			
			// Смотрим надо ли загружать другие источники.
			if (sourceList.length > 0) {
				self.loadFromSourceList(sourceList, minRevision);
			} else {
				self.notify("onLoadSources");
			}
		}, minRevision);
	},
	
	/**
	 * Загрузка данных из различных источников. 
	 */
	load: function () {
		var sources = [];
		
		// Есть три типа источников.
		// - сервер;
		// - файловый кэш;
		// - и данные зашитые в программу.
		this.serverSource = new PermGuide.ResourcesSource("http://permguide.ru/resources");
		sources.push(this.serverSource);
		if (this.canCreateCache()) {
			this.cacheSource = new PermGuide.ResourcesSource(this.cacheURL(), true);
			sources.push(this.cacheSource);
		}
		this.localSource = new PermGuide.ResourcesSource("resources");
		sources.push(this.localSource);
		
		// Загрузка информации о ресурсах из указанных выше источников. 
		this.loadFromSourceList(sources, 0);
	},
};

// Расширим до Observable.
$.extend(PermGuide.ResourceManager, new PermGuide.Observable());
