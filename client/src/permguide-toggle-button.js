/**
 * Плагин для jQuery, реализующий тригерную кнопку.
 */
(function ($) {
	
	$.fn.toggleButton = function(_state) {
			
		this.each( function() {
			var self = this;
	
			var state = {
				on: function (){},
				off: function (){},
				state: false,
				stopPropagation: true,
				
				redraw: function() {
					if(this.state)
					{
						$(self).children(".off").css("display", "none");
						$(self).children(".on").css("display", "block");
					} else {
						
						$(self).children(".on").css("display", "none");
						$(self).children(".off").css("display", "block");
					}
				},
				toggle: function() {
					this.state = !this.state;
					this.redraw();
					if (this.state)
						this.on();
					else
						this.off();
				}
				
			};
			
			if (_state) { 
				$.extend( state, _state );
			}
			
			state.redraw();
			$(this).touchclick(function(){
				state.toggle();
			}, state.stopPropagation);
			$(this).data("state", state);
		});
	};
	
})(jQuery);