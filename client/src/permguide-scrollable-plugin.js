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
				containerElement: this,
				draged: false,
				canDraged: true,
				
				/**
				 * Метод сбрасывает позицию скроллера.
				 */
				resetPosition: function()
				{	/*
					var parentPosition = $(this.containerElement).parent().position().top;
					$(this.containerElement).animate({
						top: parentPosition
					}, 200, function() {
						self.canDraged = true;
					});
					*/
					//$(this.containerElement).offset({ 
					//	top:  0 
					//});
					$(this.containerElement).css("top", "0px")
				},
				
				calculatePosition: function(position) {

					var parentHeight = $(this.containerElement).parent().height();
					var height = $(this.containerElement).height();
					var parentPosition = 0;//$(this.containerElement).parent().offset().top;
					
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
					var position = $(this.containerElement).position().top;
					var parentHeight = $(this.containerElement).parent().height();
					var offset = Math.round(parentHeight*0.1);
					
					if (delta < 0)
						offset = -offset;
					
					var newPosition = this.calculatePosition(position-offset);
					
					//newPosition = position+offset;
					//alert(position+offset);
					if (newPosition == position)
						return;
					
					$(this.containerElement).css("top", newPosition);
				},
				
				touchDown: function(event) {
					if (!this.canDraged)
						return;
					
					this.x = event.changedTouches[0].clientX;
					this.y = event.changedTouches[0].clientY;
					this.containerPosition = $(this.containerElement).offset();
					
					this.draged = true;
				},
				
				touchMove: function(event) {
					
					if (!this.draged)
						return;
					var tX = event.changedTouches[0].clientX;
					var tY = event.changedTouches[0].clientY;
					$(this.containerElement).offset({ 
						top:  this.containerPosition.top + (tY - this.y)
//						left: this.containerPosition.left, 
					});
				},
				
				touchUp: function(event) {
					
					if (!this.draged)
						return;
					this.draged = false;
					
					var delta = 0;
					
					var position = $(this.containerElement).position().top;
					var newPosition = this.calculatePosition(position);
					
					if (newPosition == position)
						return;
					
					this.canDraged = false;
					var self = this;
					
					$(this.containerElement).animate({
						top: newPosition
					}, 500, function() {
						self.canDraged = true;
					});
				
				}
			};
			$(this).css("position", "relative");
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
