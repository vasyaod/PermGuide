/**
 * Плагин для jQuery, реализующий тригерную кнопку.
 */
(function ($) {
	
	$.fn.toggleButton = function(_state) {
			
		this.each( function() {
			var self = this;
	
			var state = {
				onHandler: function (){},
				offHandler: function (){},
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
				
				on: function() {
					
					if (this.state)
						return;
					this.state = true;
					this.redraw();
					this.onHandler();
				},

				off: function() {
					
					if (!this.state)
						return;
					this.state = false;
					this.redraw();
					this.offHandler();
				},
				
				toggle: function() {
					this.state = !this.state;
					this.redraw();
					if (this.state)
						this.onHandler();
					else
						this.offHandler();
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