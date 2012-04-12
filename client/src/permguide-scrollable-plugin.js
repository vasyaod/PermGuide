// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Плагин прокрутки дива тачем.
 */
(function ($) {
	$.fn.scrollable = function() {
		
		this.each(function(){
			
			var state = {
				element: this,
				draged: false,
				canDraged: true,
				
				/**
				 * Метод сбрасывает позицию скроллера.
				 */
				resetPosition: function()
				{	/*
					var parentPosition = $(this.element).parent().position().top;
					$(this.element).animate({
						top: parentPosition
					}, 200, function() {
						self.canDraged = true;
					});
					*/
					//$(this.element).offset({ 
					//	top:  0 
					//});
					$(this.element).css("top", "0px")
				},
				
				calculatePosition: function(position) {

					var parentHeight = $(this.element).parent().height();
					var height = $(this.element).height();
					var parentPosition = 0;//$(this.element).parent().offset().top;
					
					if(height > parentHeight) {
						if (position > parentPosition)
							position = parentPosition;
						else if (position < parentPosition - (height - parentHeight) - 20)
							position = parentPosition - (height - parentHeight) - 20;
					} else {
						position = parentPosition;
					}
					
					return position;
				},
				
				offset: function(delta) {
					var position = $(this.element).position().top;
					var parentHeight = $(this.element).parent().height();
					var offset = Math.round(parentHeight*0.1);
					
					if (delta < 0)
						offset = -offset;
					
					var newPosition = this.calculatePosition(position-offset);
					
					//newPosition = position+offset;
					//alert(position+offset);
					if (newPosition == position)
						return;
					
					$(this.element).css("top", newPosition);
				},
				
				touchDown: function(event) {
					if (!this.canDraged)
						return;
					
					this.x = event.changedTouches[0].clientX;
					this.y = event.changedTouches[0].clientY;
					this.containerPosition = $(this.element).offset();
					
					this.draged = true;
					this.showScroller();
				},
				
				touchMove: function(event) {
					
					if (!this.draged)
						return;
					var tX = event.changedTouches[0].clientX;
					var tY = event.changedTouches[0].clientY;
					$(this.element).offset({ 
						top:  this.containerPosition.top + (tY - this.y)
//						left: this.containerPosition.left, 
					});
					this.refreshScroller();
				},
				
				touchUp: function(event) {
					
					if (!this.draged)
						return;
					this.draged = false;
					this.hideScroller();
					
					var delta = 0;
					
					var position = $(this.element).position().top;
					var newPosition = this.calculatePosition(position);
					
					if (newPosition == position)
						return;
					
					this.canDraged = false;
					var self = this;
					
					$(this.element).animate({
						top: newPosition
					}, 500, function() {
						self.canDraged = true;
					});
				
				},
				
				showScroller: function() {
					if (!state.scrollerElement)
						return;
					
					this.scrollerElement.css("visibility", "visible");
					this.refreshScroller();
				},
				
				hideScroller: function() {
					if (!state.scrollerElement)
						return;
					this.scrollerElement.css("visibility", "hidden");
				},

				refreshScroller: function() {
					if (!state.scrollerElement)
						return;
					
					var parentHeight = $(this.element).parent().height();
					var height = $(this.element).height();
					var position = $(this.element).position().top;

					this.scrollerElement.find(".scrollerIndicator").css("top", Math.round(parentHeight * -position/height));
					//alert(parentHeight * parentHeight/height);
					this.scrollerElement.find(".scrollerIndicator").css("height", Math.round(parentHeight * parentHeight/height));
				}
			};
			
			$(this).css("position", "relative");
			////
			// Програмно создаем скроллеры.
			/*
			var element = $(
					'<div class="scroller" style="position:absolute; visibility: hidden;">'+
					'	<div class="scrollerIndicator" style="position:absolute;"></div>'+
					'</div>'
					);
			element.appendTo($(this).parent());
			element.touchstart(function() {return true;});
			element.touchmove(function() {return true;});
			element.touchend(function() {return true;});
			state.scrollerElement = element;
			// */
			var stopPropagation = $(this).attr("stopPropagation");
			if (stopPropagation)
				stopPropagation = true;
			else
				stopPropagation = false;
			
			$(window).resize($.proxy(state.resetPosition, state));
			
			$(this).touchstart( $.proxy(state.touchDown, state), stopPropagation);
			
			$(this).touchmove( $.proxy(state.touchMove, state), stopPropagation);
			
			$(this).touchend( $.proxy(state.touchUp, state), stopPropagation);
			
			this.addEventListener("DOMMouseScroll", $.proxy(function (event) {
				this.offset(event.detail);
				event.stopPropagation();
				event.preventDefault();
			}, state));
			
			this.addEventListener("mousewheel", $.proxy(function (event) {
				this.offset(-event.wheelDelta);
				event.stopPropagation();
				event.preventDefault();
			}, state));
			
			//this.onmousewheel =  $.proxy(function (event) {
			//	this.offset(event.wheelDelta);
			//}, state);
			
			// Сохраним состояние внутри элемента.
			$(this).data("state", state);
		});
	};
})(jQuery);
