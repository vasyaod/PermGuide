
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.ScreenManager = {
	
	/**
	 * Активный экран.
	 */
	activeScreen: null,
	
	/**
	 * Список всех экранов.
	 */
	screens: [],
	
	/**
	 * Флаг того что фонегап инициализирован.
	 */
	phonegapInited: false,
	
	/**
	 * Стэк экранов, для работы кнопки назад.
	 */
	screenStack: [],
	
	init: function(){
		$(window).keypress($.proxy(function(event) {
			if (!this.activeScreen)
				return;
			alert(event.keyCode);

			if(event.keyCode == 39 ) {
				var pageSlider = $(this.activeScreen.screenElement).find(".pageSlider").data("state");
				pageSlider.next();
				event.preventDefault();
			}
			if(event.keyCode == 37 ) {
				var pageSlider = $(this.activeScreen.screenElement).find(".pageSlider").data("state");
				pageSlider.prev();
				event.preventDefault();
			}
		}, this));
	},
	
	initPhonegap: function(){
		this.phonegapInited = true;
		this.backHandler = $.proxy( this.back, this);
		/*
		var backHandler = $.proxy(function(event) {
			alert("!!!!");
		}, this);
		document.addEventListener("backbutton", backHandler, false);
		*/
	},

	
	getScreenByName: function(name){
		var res;
		$.each(this.screens, function(index, screen) {	
			if (screen.name == name)
				res = screen;
		});
		
		return res;
	},
	
	/**
	 * Метод активирует экран по его имени.
	 */
	activateScreenByName: function(name){
		var screen = this.getScreenByName(name);
		if (!screen) {
			alert("Экран не найден:"+name);
			return;
		}
		this.activateScreen(screen);
	},
		
	/**
	 * Метод активирует экран.
	 */
	activateScreen: function(screen, skipStack){
		if (this.activeScreen && this.activeScreen.hide) {
			this.activeScreen.hide(this.activeScreen.screenElement);
			
			if (!skipStack)
			{
				this.screenStack.push(this.activeScreen);
				if (this.screenStack.length == 1 && this.backHandler){
					document.addEventListener("backbutton", this.backHandler, false);
				}
			}
		}
		
		this.activeScreen = screen;
		if (screen.show) {
			screen.show(screen.screenElement);
		}
	},
	
	back: function(){
		if (this.screenStack.length > 0) {
			var screen = this.screenStack[this.screenStack.length-1];
			this.screenStack.length --;
			this.activateScreen(screen, true);

			if (this.screenStack.length == 0 && this.backHandler) {
				document.removeEventListener("backbutton", this.backHandler, false);
			}
		}
	},
	
	/**
	 * Метод добавлет экран в менеджер, при этом происходит инициализация экрана.
	 */
	addScreen: function(screen) {
		
		this.screens.push(screen);
		var screenElement = screen.screenElement;
		
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
};

