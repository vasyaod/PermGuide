
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

	/**
	 * Возвращает экран по кго имени.
	 */
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
		
		if (this.activeScreen == screen)
			return;
		
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
	
	/**
	 * Переходит к пердидущему экрану сохраненному в стеке.
	 */
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
	 * Переходит на указанную страницу у текущего экрана.
	 */
	goToPage: function(index) {
		var pageSlider = $(this.activeScreen.screenElement).find(".pageSlider").data("state");
		pageSlider.select(index);
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
		
		pageSlider.beforeAnimationListener = function(index) {
			$(screenElement).find(".pageSlide").css("visibility", "visible");
			$(screenElement).find(".map").css("display", "block");
		};

		pageSlider.afterAnimationListener = function(index) {
			$(screenElement).find(".pageSlide").css("visibility", "hidden");
			$(screenElement).find(".pageSlide").slice(index, index+1).css("visibility", "visible");
			$(screenElement).find(".map").css("display", "none");

			$(screenElement).find(".map").css("display", "none");
			if (index == 1) {
				$(screenElement).find("#objectsMap").css("display", "block");
			} else if(index == 2) {
				$(screenElement).find("#routesMap").css("display", "block");
			}
		}
		
		
		pageSlider.listener(0); // Подсветим сразуже первую страницу.
		
		$(screenElement).find(".pageScroller .pageIndicator").touchclick( function(event) {
			var pageId = parseInt($(event.target).parent().attr("_id"));
			PermGuide.ScreenManager.goToPage(pageId);
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

