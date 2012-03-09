
(function ($) {
	
	$.support.touch = typeof Touch === 'object';
	if (!$.fn.browserTouchSupport.touches) {
		// Если тач не поддерживается, то используем события мыши.
		$.fn.touchstart = function(fn) {
			var newFn = function (event)
			{
				event.preventDefault();
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
				event.preventDefault();
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
				event.preventDefault();
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
		
		$.fn.touchclick = function(fn) {
			
			var touchclickState = null;
			
			var downHandler = function (event)
			{
				event.preventDefault();
				touchclickState = {
					x: event.clientX,
					y: event.clientY
				}
			};
			
			var upHandler = function (event)
			{
				event.preventDefault();
				if (touchclickState == null)
					return;
				
				var touchclickStateTmp = touchclickState;
				touchclickState = null;
				if (Math.abs(event.clientX - touchclickStateTmp.x) < 10 &&
					Math.abs(event.clientY - touchclickStateTmp.y) < 10)
				{
					fn({
						type: "touchclick",
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
			};
			
			$(this).on("mousedown", downHandler);
			$(this).on("mouseup", upHandler);
		};
	} else {
		// Если тач поддерживается, то используем нужные события.
		$.fn.touchstart = function(fn) {
			var newFn = function (event)
			{
				event.preventDefault();
				fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchstart", newFn);
			});		
		};
		
		$.fn.touchmove = function(fn) {
			var newFn = function (event)
			{
				event.preventDefault();
				fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchmove", newFn);
			});		
		};
		
		$.fn.touchend = function(fn) {
			var newFn = function (event)
			{
				event.preventDefault();
				fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchend", newFn);
			});		
		};	

		$.fn.touchclick = function(fn) {
			
			var touchclickState = null;
			
			var downHandler = function (event)
			{
				event.preventDefault();
				touchclickState = {
					x: event.changedTouches[0].clientX,
					y: event.changedTouches[0].clientY
				}
			}
			
			var upHandler = function (event)
			{
				event.preventDefault();
				if (touchclickState == null)
					return;
				var touchclickStateTmp = touchclickState;
				touchclickState = null;
				if (Math.abs(event.changedTouches[0].clientX - touchclickStateTmp.x) < 10 &&
					Math.abs(event.changedTouches[0].clientY - touchclickStateTmp.y) < 10)
					fn(event);
			}
			
			$(this).each( function () {
				this.addEventListener("touchstart", downHandler);
				this.addEventListener("touchend", upHandler);
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
	
	/**
	 * Слушатель событий, переключения страниц.
	 */
	listener: null,
	
	init: function() { 
		var self = this;
		
		this.containerElement = $("#slideContainer");
		// 
		$(this.containerElement).offset({});
		
		this.containerPosition = $(this.containerElement).position();
		this.slideWidth = $(this.containerElement).children(".slide").width();
		this.slideCount = $(this.containerElement).children(".slide").length;
		this.index = 0;
		
		$(this.containerElement).touchstart( function(event) {
			self.down(event);
		});
		
		$(this.containerElement).touchmove( function(event) {
			self.move(event);
		});

		$(this.containerElement).touchend( function(event) {
			self.up(event);
		});
		
	},
	
	// 
	select: function(index) {
		if (this.index == index)
			return;
		this.index = index;
		
		if (this.index < 0)
			this.index = 0;
		if (this.index == this.slideCount)
			this.index =  this.slideCount-1;

		if (this.listener != null)
			this.listener(this.index);
		this.refresh();
	},
	
	down: function(event) {
		
		if (!this.canDraged)
			return;
		
		this.x = event.changedTouches[0].clientX;
		this.y = event.changedTouches[0].clientY;
		this.containerPosition = $(this.containerElement).offset();
		
		this.draged = true;
	},
	
	move: function(event) {
		
		if (!this.draged)
			return;
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;
		// Если сдвиг не очень большой, то стоим на месте.
		if (Math.abs(tX - this.x) < 10)
			return;
			
		$(this.containerElement).offset({ 
//			top:  this.containerPosition.top, 
			left: this.containerPosition.left + (tX - this.x) 
		});
	},
	
	next: function() {
		if (this.index == this.slideCount-1)
			return;
		
		this.index ++;
		if (this.listener != null)
			this.listener(this.index);
		this.refresh();
	},
	
	prev: function() {
		if (this.index == 0)
			return;
		
		this.index --;
		if (this.listener != null)
			this.listener(this.index);
		this.refresh();
	},
	
	refresh: function() {
		if (this.index < 0)
			this.index = 0;
		if (this.index == this.slideCount)
			this.index =  this.slideCount-1;
		
		var delta = $(this.containerElement).children(".slide").slice(this.index).offset().left
		if (delta == 0)
			return;
		
		var self = this;
		this.canDraged = false;
		$(this.containerElement).animate({
			left: ((delta < 0) ? '+=' + Math.abs(delta) : '-=' + Math.abs(delta))
		}, 500, function() {
			self.canDraged = true;
		});
	
	},
	
	up: function(event) {

		if (!this.draged)
			return;
		this.draged = false;
		
		var tX = event.changedTouches[0].clientX;
		var tY = event.changedTouches[0].clientY;

		if (Math.abs(tX - this.x) < 10)
			return;
		
		if (Math.abs(tX - this.x) > this.slideWidth/4)
		{
			if ((tX - this.x) < 0)
			{
				this.index ++;
				if (this.listener != null && this.index < this.slideCount)
					this.listener(this.index);
			}
			else
			{
				this.index --;
				if (this.listener != null && this.index >= 0)
					this.listener(this.index);
			}
		}
		
		this.refresh();
	}
};

(function ($) {
	$.fn.scrolled = function() {
		
		this.each(function(){
			
			var state = {
				containerElement: this,
				draged: false,
				canDraged: true
			};
			
			$(this).touchstart( $.proxy(function(event) {
				if (!this.canDraged)
					return;
				
				this.x = event.changedTouches[0].clientX;
				this.y = event.changedTouches[0].clientY;
				this.containerPosition = $(this.containerElement).offset();
				
				this.draged = true;
			}, state));
			
			$(this).touchmove( $.proxy(function(event) {
				
				if (!this.draged)
					return;
				var tX = event.changedTouches[0].clientX;
				var tY = event.changedTouches[0].clientY;
				$(this.containerElement).offset({ 
					top:  this.containerPosition.top + (tY - this.y), 
//					left: this.containerPosition.left, 
				});
				
			}, state));
			
			$(this).touchend( $.proxy(function(event) {
				
				if (!this.draged)
					return;
				this.draged = false;
				
				var delta = 0;
				var parentHeight = $(this.containerElement).parent().height();
				var height = $(this.containerElement).height();
				var position = $(this.containerElement).offset().top;
				
				if(height > parentHeight)
				{
					if (position > 0)
						delta = - position;
					else if (position < -(height - parentHeight))
						delta = -position - (height - parentHeight);
				}
				else
				{
					delta = -position;
				}
				
				if (delta == 0)
					return;
				
				this.canDraged = false;
				var self = this;
				$(this.containerElement).animate({
					top: ((delta > 0) ? '+=' + Math.abs(delta) : '-=' + Math.abs(delta))
				}, 500, function() {
					self.canDraged = true;
				});
			
			}, state));
			
		});
	};
})(jQuery);

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