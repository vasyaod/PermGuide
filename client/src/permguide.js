
(function ($) {
	
	$.support.touch = typeof Touch === 'object';
	if (!$.fn.browserTouchSupport.touches) {
		// Если тач не поддерживается, то используем события мыши.
		$.fn.touchstart = function(fn) {
			var newFn = function (event)
			{
				fn({
					type: "touchstart",
					target: event.target,
					changedTouches: 
					[
						{
							clientX: event.clientX,
							clientY: event.clientY,
							screenX: event.screenX,
							screenY: event.screenY,
							pageX: event.pageX,
							pageY: event.pageY
						}
					]
				});
			}
			$(this).on("mousedown", newFn);
		};
		
		$.fn.touchmove = function(fn) {
			var newFn = function (event)
			{
				fn({
					type: "touchmove",
					target: event.target,
					changedTouches: 
					[
						{
							clientX: event.clientX,
							clientY: event.clientY,
							screenX: event.screenX,
							screenY: event.screenY,
							pageX: event.pageX,
							pageY: event.pageY
						}
					]
				});
			}
			$(this).on("mousemove", newFn);
		};
		
		$.fn.touchend = function(fn) {
			var newFn = function (event)
			{
				fn({
					type: "touchend",
					target: event.target,
					changedTouches: 
					[
						{
							clientX: event.clientX,
							clientY: event.clientY,
							screenX: event.screenX,
							screenY: event.screenY,
							pageX: event.pageX,
							pageY: event.pageY
						}
					]
				});
			}
			$(this).on("mouseup", newFn);
		};
	} else {
		// Если тач поддерживается, то используем нужные события.
		$.fn.touchstart = function(fn) {
			$(this).each( function () {
				this.addEventListener("touchstart", fn);
			});		
		};
		
		$.fn.touchmove = function(fn) {
			$(this).each( function () {
				this.addEventListener("touchmove", fn);
			});		
		};
		
		$.fn.touchend = function(fn) {
			$(this).each( function () {
				this.addEventListener("touchend", fn);
			});		
		};	

	}
	

})(jQuery);


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
	 * Индекс текущего слайда.
	 */
	index: 0,
	/**
	 * Флаг режима перетаскивания окна.
	 */
	draged: false,
	
	/**
	 * Флаг, того, можно ли двигать слады.
	 */
	canDraged: true,
	
	init: function() { 
		var self = this;

		this.containerPosition = $("#slideContainer").position();
		this.slideWidth = $(".slide").width();
		this.slideCount = $("#slideContainer > div.slide").length;
		this.index = 0;
		
		$("#slideContainer").touchstart( function(event) {
			self.down(event);
		});
		
		$("#slideContainer").touchmove( function(event) {
			self.move(event);
		});

		$("#slideContainer").touchend( function(event) {
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
		
		if (!this.canDraged)
			return;
		
		this.x = event.changedTouches[0].clientX;
		this.y = event.changedTouches[0].clientY;
		this.containerPosition = $("#slideContainer").offset();
		
		this.draged = true;
	},
	
	move: function(event) {
		
		if (!this.draged)
			return;

		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;
		$("#slideContainer").offset({ 
			top:  this.containerPosition.top, 
			left: this.containerPosition.left + (tX - this.x) 
		});
	},

	up: function(event) {
		if (!this.draged)
			return;
		this.draged = false;
		
		if ((tX - this.x) == 0)
			return;
		
		Math.abs(tX - this.x)
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;
		var self = this;
		
		if (Math.abs(tX - this.x) > this.slideWidth/4)
		{
			if ((tX - this.x) < 0)
				this.index ++;
			else
				this.index --;
		}
		
		if (this.index < 0)
			this.index = 0;
		if (this.index == this.slideCount)
			this.index =  this.slideCount-1;
		
		var delta = $("#slideContainer > div.slide").slice(this.index).offset().left
		this.canDraged = false;
		$("#slideContainer").animate({
			left: ((delta < 0) ? '+=' + Math.abs(delta) : '-=' + Math.abs(delta))
		}, 500, function() {
			self.canDraged = true;
		});

/*		
		if ((tX - this.x) > 0)
		{
			this.canDraged = false;
			//var moveLeft = Math.abs(tX - this.x);
			var moveLeft = this.slideWidth;
			$("#slideContainer").animate({
				left: '+=' + moveLeft
			}, 500, function() {
				self.canDraged = true;
			});
			this.index ++;
		}
		else if ((tX - this.x) < 0)
		{
			this.canDraged = false;
			//var moveLeft = Math.abs(tX - this.x);
			var moveLeft = this.slideWidth;
			$("#slideContainer").animate({
				left: '-=' + moveLeft
			}, 500, function() {
				self.canDraged = true;
				
			});
			this.index --;
		}
*/
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