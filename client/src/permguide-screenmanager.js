
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
	activateScreen: function(screen){
		if (this.activeScreen && this.activeScreen.hide) {
			this.activeScreen.hide(this.activeScreen.screenElement);
		}
		this.activeScreen = screen;
		if (screen.show) {
			screen.show(screen.screenElement);
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

