/**
 * Плагин для jQuery, реализующий тригерную кнопку.
 */
(function ($) {
	
	$.fn.toggleButton = function(_props) {
			
		var props = {
			on: function (){},
			off: function (){},
			state: false,
			stopPropagation: true
		};
		if (props) { 
			$.extend( props, _props );
		}
		
		var self = this;
		var redraw = function()
		{
			if(props.state)
			{
				self.children(".off").css("display", "none");
				self.children(".on").css("display", "block");
			} else {
				
				self.children(".on").css("display", "none");
				self.children(".off").css("display", "block");
			}
		};
		redraw();
		
		this.touchclick(function(){
			props.state = !props.state;
			redraw();
			if (props.state)
				props.on();
			else
				props.off();
		}, props.stopPropagation);
	};
	
})(jQuery);