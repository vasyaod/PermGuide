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
				canDraged: true
			};
			
			state.resetPosition = $.proxy(function()
			{	
				var parentPosition = $(this.containerElement).parent().position().top;
				$(this.containerElement).animate({
					top: parentPosition
				}, 200, function() {
					self.canDraged = true;
				});
				
				//$(this.containerElement).offset({ 
				//	top:  0 
				//});
			}, state);
			
			$(window).resize(function() {
				state.resetPosition();
			});
			
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
				var position = $(this.containerElement).position().top;
				var parentPosition = $(this.containerElement).parent().position().top;
				
				if(height > parentHeight)
				{
					if (position > parentPosition)
					{
						position = parentPosition;
						delta = 1;
					}
					else if (position < parentPosition - (height - parentHeight) - 20)
					{
						position = parentPosition - (height - parentHeight) - 20;
						delta = 1;
					}
				}
				else
				{
					position = parentPosition;
					delta = 1;
				}
				
				if (delta == 0)
					return;
				
				this.canDraged = false;
				var self = this;
				
				$(this.containerElement).animate({
					top: position
				}, 500, function() {
					self.canDraged = true;
				});
			
			}, state));

			// Сохраним состояние внутри элемента.
			$(this).data(state);
		});
	};
})(jQuery);
