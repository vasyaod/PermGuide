
PermGuide = {}; // Будет spacename-мом.

/**
 * Поддержка эмуляции событий мыши на тач-устройствах (в часности на андройдах).
 * 
 * Было замечено, что на андройдах не работает событие "mousemove", но работает 
 * "touchmove". В связи с этим пришлось генерировать искуственные события мыши, 
 * что бы некоторые комьютерные плагины работали и на телефонах.
 */
PermGuide.TouchSupport = {
	
	/**
	 * Обработчик событий.тача.
	 */	
	touchHandler: function (event) {
		
		var touches = event.changedTouches,
			first = touches[0],
			type = "";
		
		switch(event.type)
		{
			case "touchstart": type = "permguide-mousedown"; break;
			case "touchmove":  type = "permguide-mousemove"; break;        
			case "touchend":   type = "permguide-mouseup"; break;
			default: return;
		}
		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
									first.screenX, first.screenY,
									first.clientX, first.clientY, false,
									false, false, false, 0, null);

		first.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	},
	
	/**
	 * Обработчик событий.мыши.
	 */	
	mouseHandler: function (event) {
		
		var	type = "";
		
		switch(event.type)
		{
			case "mousedown": type = "permguide-mousedown"; break;
			case "mousemove": type = "permguide-mousemove"; break;        
			case "mouseup":   type = "permguide-mouseup"; break;
			default: return;
		}

		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
									event.screenX, event.screenY,
									event.clientX, event.clientY, false,
									false, false, false, 0, null);
		//simulatedEvent.type = type;
		event.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	},
	
	/**
	 * Функция инициализации.
	 *
	 * Вешает обработчик событий тача или мыши.
	 */
	init: function() {
		$.support.touch = typeof Touch === 'object';

		if (!$.support.touch) {
			document.addEventListener("mousedown",  this.mouseHandler, false);
			document.addEventListener("mousemove",  this.mouseHandler, false);
			document.addEventListener("mouseup",    this.mouseHandler, false);
		}
		else
		{
			document.addEventListener("touchstart",  this.touchHandler, false);
			document.addEventListener("touchmove",   this.touchHandler, false);
			document.addEventListener("touchend",    this.touchHandler, false);
			document.addEventListener("touchcancel", this.touchHandler, false);
		}
	}
}

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
	 * Флаг режима перетаскивания окна.
	 */
	draged: false,
	
	init: function() { 
		var self = this;

		this.containerPosition = $("#slideContainer").position();
		this.slideWidth = $(".slide").width();
		this.slideCount = $("#slideContainer > div.slide").length;
		this.index = 1;
		
		$("#slideContainer").bind("permguide-mousedown", function(event) {
			alert(event.type);
			self.down(event);
		});
		
		$("#slideContainer").bind("permguide-mousemove", function(event) {
			self.move(event);
		});

		$("#slideContainer").bind("permguide-mouseup", function(event) {
			self.up(event);
		});
		
/*
		var cont_pos = $("#slideContainer").position();
		var item_width = $(".slide").width();
		var items = $("#slideContainer > div.slide").length;
		var item_index = 1;
		var cont_post_temp;
		
		$("#slideContainer").draggable({ axis: "x", revert: true });

		function bindMouseUp() {
			$("#slideContainer").unbind('mouseup');
			cont_post_temp = $("#slideContainer").position().left;
			if (cont_pos.left > cont_post_temp && item_index != items) {
				// Перелистывание вправо
				$("#slideContainer").draggable("option", "revert", false);
				var moveLeft = cont_pos.left - cont_post_temp;
				moveLeft = Math.abs(item_width - moveLeft);
				$("#slideContainer").animate({
					left: '-=' + moveLeft
				}, 500, function() {
					$("#slideContainer").draggable("option", "revert", true);
					cont_pos = $("#slideContainer").position();
					$("#slideContainer").bind('mouseup', function() {
						bindMouseUp();
					});
				});
				item_index ++;
			} else if (cont_pos.left < cont_post_temp && item_index != 1) {
				// Перелистывание влево
				$("#slideContainer").draggable("option", "revert", false);
				var moveLeft = cont_post_temp - cont_pos.left;
				moveLeft = Math.abs(item_width - moveLeft);
				$("#slideContainer").animate({
					left: '+=' + moveLeft
				}, 500, function() {
					$("#slideContainer").draggable("option", "revert", true);
					cont_pos = $("#slideContainer").position();
					$("#slideContainer").bind('mouseup', function() {
						bindMouseUp();
					});
				});
				item_index --;
			} else {
				// В начале или в конце перелистывания страницы
				$("#slideContainer").draggable( "option", "revert", true );
				$("#slideContainer").bind('mouseup', function() {
					bindMouseUp();
				});
			}
		}

		$("#slideContainer").mouseup(function() {
			bindMouseUp();
		});
*/
	},

	down: function(event) {
		this.x = event.clientX;
		this.y = event.clientY;
		this.containerPosition = $("#slideContainer").offset();
		
		this.draged = true;
	},
	
	move: function(event) {
		
		if (!this.draged)
			return;

		var tX = event.clientX;
		var tY = event.clientY;
		$("#slideContainer").offset({ 
			top:  this.containerPosition.top, 
			left: this.containerPosition.left + (tX - this.x) 
		});
	},

	up: function(event) {
		this.draged = false;
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
	 * Собственно сами данные. 
	 */
	data: null,	// просто рыба.
	
	/**
	 * Обработчик событий готовности данных. 
	 */
	listener: null,

	/**
	 * Регистрирует обработчик событий, который вызывается при готовности данных.
	 */
	addListener: function (fn) {

		this.listener = fn;
		
		if (this.loaded == true)
			fn(this.data);
	},
	
	/**
	 * Загрузка данных из различных источников. 
	 */
	load: function () {
		
		var self = this;
		$.getJSON('data.json', function(data) {
			self.data = data;
			self.loaded = true;
			if (!self.listener === null)
				self.listener(self.data);
		});
	}
}