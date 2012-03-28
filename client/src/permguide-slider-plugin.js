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
				 * Данный флаг говорит о том что сладер надо зациклить.
				 */
				loop: false,
				
				init: function(containerElement) { 
					var self = this;
					
					if ($(containerElement).attr("loop"))
						this.loop = true;
					
					this.containerElement = containerElement;
					$(this.containerElement).offset({});
					
					this.reset();
					
					$(this.containerElement).touchstart( function(event) {
						self.down(event);
					});
					
					$(this.containerElement).touchmove( function(event) {
						self.move(event);
					});
					$(this.containerElement).touchend( function(event) {
						self.up(event);
					});

					$(window).resize(function() {
						self.resize();
						self.refresh(true);
					});
				},
				
				_callListener: function() {
					if (this.listener != null)
						this.listener(this.index, $(this.containerElement).children(".slide").slice(this.index));
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
					this.slideWidth = $(this.containerElement).parent().width();
					$(this.containerElement).css("width", (this.slideWidth*this.slideCount));
					$(this.containerElement).children(".slide").css("width", this.slideWidth);
					
					this.containerPosition = $(this.containerElement).position();
				},
				
				/**
				 * Устанавливает текущий слайд по его индексу.
				 */
				select: function(index) {
					if (this.index == index)
						return;
					this.index = index;
					
					if (this.index < 0)
						this.index = 0;
					if (this.index == this.slideCount)
						this.index =  this.slideCount-1;
					
					this._callListener();
					
					this.refresh();
				},
				
				/**
				 * Устанавливает текущий слайд по его атрибуту и значению.
				 */
				selectByAttr: function(attr, value) {
					var index = -1;
					$(this.containerElement).children(".slide").each(function(i){
						if ($(this).attr(attr) == value)
							index = i;
					})
					
					if (index != -1)
						this.select(index);
				},
				
				down: function(event) {
					
					if (!this.canDraged)
						return;
					
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
					if (this.index == this.slideCount-1)
						return;
					
					this.index ++;
					if (this.listener != null)
						this.listener(this.index, $(this.containerElement).children(".slide").slice(this.index));
					this.refresh();
				},
					
				prev: function() {
					if (this.index == 0)
						return;
					
					this.index --;
					if (this.listener != null)
						this.listener(this.index, $(this.containerElement).children(".slide").slice(this.index));
					this.refresh();
				},
					
				refresh: function(fast) {
					if (this.slideCount == 0)
						return;
					if (this.index < 0)
						this.index = 0;
					if (this.index == this.slideCount)
						this.index =  this.slideCount-1;
					
					var position = $(this.containerElement).children(".slide").slice(this.index).position().left
					
					var self = this;
					this.canDraged = false;
					if (fast) {
						$(this.containerElement).css("left", -position);
					} else {
						$(this.containerElement).animate({
							left: -position
						}, 500, function() {
							self.canDraged = true;
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
