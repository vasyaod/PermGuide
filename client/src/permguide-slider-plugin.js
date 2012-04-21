// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Плагин для прокрутки дивоф
 */
(function ($) {
	$.fn.slider = function() {
		
		this.each(function() {
			
			var state = {
				/**
				 * Индекс текущего слайда.
				 */
				index: 0,
				
				/**
				 * Флаг режима перетаскивания окна.
				 */
				draged: false,
				
				moved: false,
				
				/**
				 * Флаг, того, можно ли двигать слады.
				 */
				canDraged: true,
				
				/**
				 * Слушатель событий, переключения страниц.
				 */
				listener: null,
				
				/**
				 * Переключатель полсле анимации.
				 */
				beforeAnimationListener: null,
				afterAnimationListener: null,
				
				/**
				 * Данный флаг говорит о том что сладер надо зациклить.
				 */
				loop: false,
				
				/**
				 * Флаг, говорит о том что слайдер нужно сделать не чуствительным 
				 * к перемещинию тачем.
				 */
				touchInsensitive: false,

				init: function(containerElement) { 
					var self = this;
					
					if ($(containerElement).attr("loop"))
						this.loop = true;
					
					this.containerElement = containerElement;
					$(this.containerElement).offset({});
					
					this.reset();
					
					$(this.containerElement).touchstart( function(event) {
						if (!self.touchInsensitive)
							self.down(event);
					});
					
					$(this.containerElement).touchmove( function(event) {
						if (!self.touchInsensitive)
							self.move(event);
					});
					$(this.containerElement).touchend( function(event) {
						if (!self.touchInsensitive)
							self.up(event);
					});
					
					this.containerElement.addEventListener("DOMMouseScroll", function (event) {
						if (!self.touchInsensitive) {
							if (event.detail < 0)
								self.prev();
							if (event.detail > 0)
								self.next();
						}
						event.stopPropagation();
						event.preventDefault();
					});

					this.containerElement.addEventListener("mousewheel", function (event) {
						if (!self.touchInsensitive) {
							if (event.wheelDelta > 0)
								self.prev();
							if (event.wheelDelta < 0)
								self.next();
						}
						event.stopPropagation();
						event.preventDefault();
					});
					
					$(window).resize(function() {
						self.resize();
						self.refresh(true);
					});
				},
				
				_callListener: function() {
					if (this.listener)
						this.listener(this.index, $(this.containerElement).children(".slide").slice(this.index));
				},
				
				_callBeforeAnimationListener: function() {
					if (this.beforeAnimationListener)
						this.beforeAnimationListener(this.index);
				},
				
				/**
				 * Сбрасывает состояние слайдера.
				 */
				reset: function() {
					this.index = 0;
					this.slideCount = $(this.containerElement).children(".slide").length;
					this.resize();
					$(this.containerElement).css("left", 0);
				},
				
				/**
				 * Изменяет размеры контейнера и сладов.
				 */
				resize: function() {
					var slideWidth = $(this.containerElement).parent().width();
					this.slideWidth = slideWidth;
					$(this.containerElement).css("width", (this.slideWidth*this.slideCount));
					/*
					$(this.containerElement).children(".slide").css("position", "absolute");
					$(this.containerElement).children(".slide").each(function(index){
						//alert(index);
						$(this).css("left", slideWidth*index);
						$(this).css("right", slideWidth*index+1);
						//$(this).css("width", slideWidth);
						
						$(this).css("top", 0);
						$(this).css("bottom", 0);
					})
					*/
					$(this.containerElement).children(".slide").css("width", this.slideWidth);
					
					this.containerPosition = $(this.containerElement).position();
				},
				
				/**
				 * Устанавливает текущий слайд по его индексу.
				 */
				select: function(index, fast) {
					this._callBeforeAnimationListener();

					if (this.index == index)
						return;
					this.index = index;
					
					if (this.index < 0)
						this.index = 0;
					if (this.index == this.slideCount)
						this.index =  this.slideCount-1;
					
					this._callListener();
					
					this.refresh(fast);
				},
				
				/**
				 * Устанавливает текущий слайд по его атрибуту и значению.
				 */
				selectByAttr: function(attr, value, fast) {
					var index = -1;
					$(this.containerElement).children(".slide").each(function(i){
						if ($(this).attr(attr) == value)
							index = i;
					})
					
					if (index != -1)
					{
						this.select(index, fast);
					}
				},
				
				down: function(event) {
					
					if (!this.canDraged)
						return;
					
					this._callBeforeAnimationListener();

					this.x = event.changedTouches[0].clientX;
					this.y = event.changedTouches[0].clientY;
					this.containerPosition = $(this.containerElement).offset();
					
					this.draged = true;
					this.moved = false;
				},
					
				move: function(event) {
					
					if (!this.draged)
						return;
					var tX = event.changedTouches[0].clientX;
					var tY = event.changedTouches[0].clientY;
					// Если сдвиг не очень большой, то стоим на месте.
					if (!this.moved && Math.abs(tX - this.x) < PermGuide.deadRadius)
						return;
					this.moved = true;
					
					$(this.containerElement).offset({ 
						left: this.containerPosition.left + (tX - this.x) 
					});
				},
					
				up: function(event) {
					
					if (!this.draged)
						return;
					this.draged = false;
					
					if (!this.moved)
						return;
					this.moved = false;
					
					var tX = event.changedTouches[0].clientX;
					var tY = event.changedTouches[0].clientY;

					if (Math.abs(tX - this.x) > this.slideWidth/4)
					{
						if ((tX - this.x) < 0)
						{
							if (this.index < this.slideCount-1)
							{
								this.index ++;
								this._callListener();
							}
							else if(this.loop)
							{
								this.index = 0;
								this._callListener();
							}
						}
						else
						{
							if (this.index > 0)
							{
								this.index --;
								this._callListener();
							}
							else if(this.loop)
							{
								this.index = this.slideCount-1;
								this._callListener();
							}
						}
					}
					//alert(this.index);
					this.refresh();
				},
				
				next: function() {
					if (this.index < this.slideCount-1)
					{
						this.index ++;
						this._callBeforeAnimationListener();
						this._callListener();
					}
					else if(this.loop)
					{
						this.index = 0;
						this._callBeforeAnimationListener();
						this._callListener();
					}
					this.refresh();
				},
					
				prev: function() {

					if (this.index > 0)
					{
						this.index --;
						this._callBeforeAnimationListener();
						this._callListener();
					}
					else if(this.loop)
					{
						this.index = this.slideCount-1;
						this._callBeforeAnimationListener();
						this._callListener();
					}
					this.refresh();
				},
					
				refresh: function(fast) {
					if (this.slideCount == 0)
						return;
					if (this.index < 0)
						this.index = 0;
					if (this.index == this.slideCount)
						this.index =  this.slideCount-1;
					
					var position = $(this.containerElement).children(".slide").slice(this.index, this.index+1).position().left
					
					var self = this;
					this.canDraged = false;
					
					if (fast) {
						$(this.containerElement).css("left", -position);
						self.canDraged = true;
					} else {
						$(this.containerElement).animate({
							left: -position
						}, 500, function() {
							self.canDraged = true;
							if (self.afterAnimationListener)
								self.afterAnimationListener(self.index);
						});
					}
				}
				
			};
			
			// Сохраним состояние внутри элемента.
			$(this).data("state", state);
			state.init(this);
		});
	};
})(jQuery);
